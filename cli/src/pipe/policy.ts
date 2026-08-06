import { spawn } from 'node:child_process';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { canonicalJson } from './events.js';
import type { PipeStep, RunContext } from './types.js';

export type PolicyMode = 'off' | 'observe' | 'enforce';
type Decision = 'allow' | 'require_approval' | 'deny';

export interface DecisionReceipt {
    schemaVersion: string;
    receiptId: string;
    decision: Decision;
    reason: string;
    inputHash: string;
    matchedRules?: unknown[];
    policyBundle?: { hash?: string };
    signature?: { algorithm: string; keyId?: string; value: string };
}

export interface Approval {
    receiptId: string;
    inputHash: string;
    approver: string;
    approvedAt: string;
    expiresAt: string;
}

export interface Authorization {
    allowed: boolean;
    receipt?: DecisionReceipt;
    approval?: Approval;
    approvalRequired?: boolean;
    policyError?: Error;
}

export class PipeWardenClient {
    constructor(
        private readonly binary = 'pipewarden',
        private readonly requireSigned = false,
        private readonly verificationKey = '',
    ) {}

    async evaluate(request: Record<string, unknown>, signal?: AbortSignal): Promise<DecisionReceipt> {
        const payload = Buffer.from(JSON.stringify(request));
        const result = await run(this.binary, payload, signal);
        if (result.code === 2) throw new Error(`PipeWarden rejected request: ${result.stderr.trim()}`);
        if (![0, 3, 4].includes(result.code)) {
            throw new Error(`PipeWarden failed with exit code ${result.code}: ${result.stderr.trim()}`);
        }
        const receipt = JSON.parse(result.stdout) as DecisionReceipt;
        validateReceipt(receipt, payload, result.code);
        if (this.requireSigned) verifyReceiptSignature(receipt, this.verificationKey);
        return receipt;
    }
}

export class FileReceiptStore {
    constructor(private readonly directory: string) {}

    async save(receipt: DecisionReceipt): Promise<void> {
        if (!/^[a-zA-Z0-9._-]+$/.test(receipt.receiptId) || receipt.receiptId.includes('..')) {
            throw new Error('PipeWarden receiptId is unsafe for local storage');
        }
        await mkdir(this.directory, { recursive: true, mode: 0o700 });
        await writeFile(path.join(this.directory, `${receipt.receiptId}.json`),
            `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
    }
}

export class EnvironmentApprovalProvider {
    constructor(
        private readonly approved: boolean,
        private readonly approver: string,
        private readonly clock = () => new Date(),
    ) {}

    async getApproval(receipt: DecisionReceipt): Promise<Approval | null> {
        if (!this.approved) return null;
        const approvedAt = this.clock();
        return {
            receiptId: receipt.receiptId,
            inputHash: receipt.inputHash,
            approver: this.approver,
            approvedAt: approvedAt.toISOString(),
            expiresAt: new Date(approvedAt.getTime() + 15 * 60_000).toISOString(),
        };
    }
}

export class PolicyGate {
    constructor(private readonly options: {
        mode: PolicyMode;
        client: { evaluate(request: Record<string, unknown>, signal?: AbortSignal): Promise<DecisionReceipt> };
        receiptStore?: FileReceiptStore;
        approvalProvider?: EnvironmentApprovalProvider;
        protectedVerbs?: Set<string>;
    }) {}

    isProtected(step: PipeStep): boolean {
        return (this.options.protectedVerbs || defaultProtectedVerbs).has(step.verb);
    }

    requiresDecision(step: PipeStep): boolean {
        return this.options.mode !== 'off' && this.isProtected(step);
    }

    async authorize(step: PipeStep, context: RunContext): Promise<Authorization> {
        if (this.options.mode === 'off' || !this.isProtected(step)) return { allowed: true };
        let receipt: DecisionReceipt;
        try {
            receipt = await this.options.client.evaluate(toActionRequest(step, context), context.signal);
            await this.options.receiptStore?.save(receipt);
        } catch (error) {
            const policyError = error instanceof Error ? error : new Error(String(error));
            return { allowed: this.options.mode === 'observe', policyError };
        }
        if (receipt.decision === 'allow') return { allowed: true, receipt };
        if (receipt.decision === 'deny') {
            const policyError = new Error(`Policy denied action: ${receipt.reason}`);
            return { allowed: this.options.mode === 'observe', receipt, policyError };
        }
        const approval = await this.options.approvalProvider?.getApproval(receipt) || undefined;
        if (approval) validateApproval(approval, receipt);
        return {
            allowed: this.options.mode === 'observe' || Boolean(approval),
            receipt,
            approval,
            approvalRequired: true,
            ...(!approval ? { policyError: new Error(`Policy approval required: ${receipt.receiptId}`) } : {}),
        };
    }
}

export const defaultProtectedVerbs = new Set([
    'shell', 'mcp', 'deploy', 'release', 'publish', 'migrate', 'secret',
    'git.push', 'pushci.deploy', 'pushci.release',
]);

export function toActionRequest(step: PipeStep, context: RunContext): Record<string, unknown> {
    return {
        apiVersion: 'pipewarden.dev/v1alpha1',
        kind: 'ActionRequest',
        requestId: `${context.runId}:${step.id}`,
        actor: context.actor,
        action: {
            type: step.verb,
            operation: step.operation,
            target: step.target,
            environment: step.environment,
            parameters: step.parameters,
        },
        context: {
            repository: context.repository,
            workflow: context.workflow,
            runId: context.runId,
        },
        riskScore: step.riskScore,
    };
}

function validateReceipt(receipt: DecisionReceipt, payload: Buffer, code: number): void {
    if (receipt.schemaVersion !== 'pipewarden.dev/decision-receipt/v1alpha1') {
        throw new Error('Unsupported PipeWarden receipt schema');
    }
    if (!receipt.receiptId) throw new Error('PipeWarden receipt is missing receiptId');
    if (receipt.inputHash !== createHash('sha256').update(payload).digest('hex')) {
        throw new Error('PipeWarden receipt input hash mismatch');
    }
    const expected = { allow: 0, require_approval: 3, deny: 4 }[receipt.decision];
    if (expected !== code) throw new Error('PipeWarden decision and exit code disagree');
}

function verifyReceiptSignature(receipt: DecisionReceipt, key: string): void {
    if (!receipt.signature) throw new Error('Signed PipeWarden receipt required');
    if (!key) throw new Error('PIPEWARDEN_RECEIPT_KEY is required in enforce mode');
    if (receipt.signature.algorithm !== 'hmac-sha256') throw new Error('Unsupported receipt signature');
    const { signature, ...unsigned } = receipt;
    const expected = createHmac('sha256', key).update(canonicalJson(unsigned)).digest();
    const supplied = Buffer.from(signature.value, 'hex');
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
        throw new Error('PipeWarden receipt signature mismatch');
    }
}

function validateApproval(approval: Approval, receipt: DecisionReceipt): void {
    if (approval.receiptId !== receipt.receiptId || approval.inputHash !== receipt.inputHash) {
        throw new Error('Approval is not bound to this policy receipt');
    }
    if (new Date(approval.expiresAt).getTime() <= Date.now()) throw new Error('Approval has expired');
}

function run(binary: string, stdin: Buffer, signal?: AbortSignal): Promise<{
    stdout: string; stderr: string; code: number;
}> {
    return new Promise((resolve, reject) => {
        const child = spawn(binary, ['evaluate', '--input', '-', '--format', 'json'], {
            env: process.env, signal, stdio: ['pipe', 'pipe', 'pipe'], shell: false,
        });
        const stdout: Buffer[] = [];
        const stderr: Buffer[] = [];
        child.stdout.on('data', chunk => stdout.push(chunk));
        child.stderr.on('data', chunk => stderr.push(chunk));
        child.on('error', reject);
        child.on('close', code => resolve({
            stdout: Buffer.concat(stdout).toString('utf8'),
            stderr: Buffer.concat(stderr).toString('utf8'),
            code: code ?? -1,
        }));
        child.stdin.end(stdin);
    });
}
