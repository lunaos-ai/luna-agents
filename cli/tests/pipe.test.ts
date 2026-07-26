import { describe, expect, it, vi } from 'vitest';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { parsePipeline, tokenize } from '../src/pipe/parser.js';
import { toPipeStep } from '../src/pipe/commands.js';
import { ExecutionEventJournal, verifyEventChain, type ExecutionEvent } from '../src/pipe/events.js';
import {
    FileReceiptStore, PolicyGate, toActionRequest, type DecisionReceipt,
} from '../src/pipe/policy.js';
import { GovernedStepExecutor } from '../src/pipe/step-executor.js';
import { PipeRunner } from '../src/pipe/runner.js';

class MemorySink {
    events: ExecutionEvent[] = [];
    async append(event: ExecutionEvent): Promise<void> { this.events.push(event); }
}

const context = {
    runId: 'run-1',
    workflow: 'luna.pipe',
    repository: '/repo',
    actor: { id: 'tester', type: 'operator', provider: 'luna' },
};

function receipt(decision: DecisionReceipt['decision']): DecisionReceipt {
    return {
        schemaVersion: 'pipewarden.dev/decision-receipt/v1alpha1',
        receiptId: `receipt-${decision}`,
        decision,
        reason: `${decision} by test`,
        inputHash: 'a'.repeat(64),
    };
}

describe('pipe parser', () => {
    it('parses quoted arguments, groups, parallel, and conditional flow', () => {
        expect(tokenize(`req "billing api" >> (rev ~~ test) ?>> ship`)).toContain('billing api');
        const graph = parsePipeline(`req "billing api" >> (rev ~~ test) ?>> ship`);
        expect(graph.type).toBe('flow');
        if (graph.type === 'flow') {
            expect(graph.links[0].node.type).toBe('parallel');
            expect(graph.links[1].operator).toBe('?>>');
        }
    });

    it('rejects advertised constructs that are not executable yet', () => {
        expect(() => parsePipeline('watch src >> test')).toThrow(/not supported/);
    });
});

describe('governed step execution', () => {
    it('never puts secret values in policy requests', () => {
        const step = toPipeStep({
            type: 'command', id: 'secret-1', command: 'secret',
            args: ['API_TOKEN', 'do-not-audit'],
        }, '/repo');
        const request = JSON.stringify(toActionRequest(step, context));
        expect(request).toContain('API_TOKEN');
        expect(request).not.toContain('do-not-audit');
    });

    it('blocks an unapproved protected step in enforce mode', async () => {
        const sink = new MemorySink();
        const journal = new ExecutionEventJournal(sink);
        const execute = vi.fn(async () => ({ ok: true }));
        const gate = new PolicyGate({
            mode: 'enforce',
            client: { evaluate: async () => receipt('require_approval') },
        });
        const governed = new GovernedStepExecutor(gate, journal, execute);
        const step = toPipeStep({
            type: 'command', id: 'ship-1', command: 'ship', args: [],
        }, '/repo');
        await expect(governed.run(step, context)).rejects.toThrow(/approval required/i);
        expect(execute).not.toHaveBeenCalled();
        expect(sink.events.map(event => event.eventType)).toEqual([
            'policy.requested', 'policy.decided', 'approval.requested',
        ]);
        expect(verifyEventChain(sink.events)).toBe(true);
    });

    it('executes in observe mode when PipeWarden is unavailable', async () => {
        const sink = new MemorySink();
        const journal = new ExecutionEventJournal(sink);
        const execute = vi.fn(async () => ({ deployed: true, token: 'hidden' }));
        const gate = new PolicyGate({
            mode: 'observe',
            client: { evaluate: async () => { throw new Error('not installed'); } },
        });
        const governed = new GovernedStepExecutor(gate, journal, execute);
        const step = toPipeStep({
            type: 'command', id: 'ship-1', command: 'ship', args: [],
        }, '/repo');
        await governed.run(step, context);
        expect(execute).toHaveBeenCalledOnce();
        expect(sink.events.at(-1)?.payload).not.toHaveProperty('result.token');
        expect(verifyEventChain(sink.events)).toBe(true);
    });

    it('rejects receipt IDs that could escape the receipt directory', async () => {
        const directory = await mkdtemp(path.join(os.tmpdir(), 'luna-receipts-'));
        const store = new FileReceiptStore(directory);
        await expect(store.save({ ...receipt('allow'), receiptId: '../../escape' }))
            .rejects.toThrow(/unsafe/);
    });
});

describe('pipe runner', () => {
    it('executes failure recovery and parallel branches', async () => {
        const sink = new MemorySink();
        const journal = new ExecutionEventJournal(sink);
        const calls: string[] = [];
        const gate = new PolicyGate({
            mode: 'off',
            client: { evaluate: async () => receipt('allow') },
        });
        const governed = new GovernedStepExecutor(gate, journal, async step => {
            calls.push(step.command);
            if (step.command === 'fail') throw new Error('expected failure');
            return { ok: true };
        });
        const directory = await mkdtemp(path.join(os.tmpdir(), 'luna-pipe-'));
        const runner = new PipeRunner({
            executor: governed,
            repository: directory,
            reportDirectory: directory,
            eventsFile: path.join(directory, 'events.jsonl'),
            actor: 'tester',
        });
        const summary = await runner.run('fail !>> recover >> (rev ~~ test)');
        expect(summary.ok).toBe(true);
        expect(calls).toEqual(expect.arrayContaining(['fail', 'recover', 'rev', 'test']));
    });
});
