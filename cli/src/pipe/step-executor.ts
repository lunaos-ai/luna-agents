import type { ExecutionEventJournal } from './events.js';
import type { PolicyGate } from './policy.js';
import type { PipeStep, RunContext } from './types.js';

export class GovernedStepExecutor {
    constructor(
        private readonly gate: PolicyGate,
        private readonly journal: ExecutionEventJournal,
        private readonly execute: (step: PipeStep, context: RunContext) => Promise<unknown>,
    ) {}

    async run(step: PipeStep, context: RunContext): Promise<unknown> {
        const meta = { runId: context.runId, workflowId: context.workflow, stepId: step.id };
        const isProtected = this.gate.requiresDecision(step);
        if (isProtected) {
            await this.journal.record({
                ...meta,
                eventType: 'policy.requested',
                payload: { verb: step.verb, target: step.target },
            });
        }
        const authorization = await this.gate.authorize(step, context);
        if (isProtected) {
            await this.journal.record({
                ...meta,
                eventType: 'policy.decided',
                payload: policyPayload(authorization),
            });
        }
        if (authorization.approvalRequired) {
            await this.journal.record({
                ...meta,
                eventType: 'approval.requested',
                payload: {
                    receiptId: authorization.receipt?.receiptId || '',
                    reason: authorization.receipt?.reason || '',
                },
            });
        }
        if (authorization.approval) {
            await this.journal.record({
                ...meta,
                eventType: 'approval.granted',
                payload: { ...authorization.approval },
            });
        }
        if (!authorization.allowed) throw authorization.policyError || new Error('Policy blocked action');
        await this.journal.record({
            ...meta,
            eventType: 'step.started',
            payload: { verb: step.verb, command: step.command },
        });
        try {
            const result = await this.execute(step, context);
            await this.journal.record({
                ...meta,
                eventType: 'step.completed',
                payload: { result: sanitize(result) },
            });
            return result;
        } catch (error) {
            const failure = error instanceof Error ? error : new Error(String(error));
            await this.journal.record({
                ...meta,
                eventType: 'step.failed',
                payload: { name: failure.name, message: failure.message },
            });
            throw failure;
        }
    }
}

function policyPayload(authorization: Awaited<ReturnType<PolicyGate['authorize']>>): Record<string, unknown> {
    const receipt = authorization.receipt;
    return {
        ...(receipt ? {
            receiptId: receipt.receiptId,
            decision: receipt.decision,
            reason: receipt.reason,
            matchedRules: receipt.matchedRules || [],
            inputHash: receipt.inputHash,
            policyBundleHash: receipt.policyBundle?.hash || '',
        } : {}),
        ...(authorization.policyError ? { error: authorization.policyError.message } : {}),
    };
}

function sanitize(value: unknown): unknown {
    if (value == null || ['string', 'number', 'boolean'].includes(typeof value)) return value;
    if (Array.isArray(value)) return value.slice(0, 50).map(sanitize);
    if (typeof value === 'object') {
        return Object.fromEntries(Object.entries(value as Record<string, unknown>)
            .filter(([key]) => !/secret|token|password/i.test(key))
            .map(([key, child]) => [key, sanitize(child)]));
    }
    return String(value);
}
