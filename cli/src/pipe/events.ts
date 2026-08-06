import { createHash, randomUUID } from 'node:crypto';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export type EventType =
    | 'policy.requested' | 'policy.decided'
    | 'approval.requested' | 'approval.granted' | 'approval.rejected'
    | 'step.started' | 'step.completed' | 'step.failed' | 'evidence.attached';

export interface ExecutionEvent {
    schemaVersion: 'lunaos.ai/execution-event/v1';
    eventId: string;
    eventType: EventType;
    occurredAt: string;
    runId: string;
    workflowId?: string;
    stepId?: string;
    sequence: number;
    previousEventHash?: string;
    payloadHash: string;
    payload: Record<string, unknown>;
    source: { product: string; component: string };
    eventHash: string;
}

export class JsonlEventSink {
    constructor(readonly file: string) {}

    async append(event: ExecutionEvent): Promise<void> {
        await mkdir(path.dirname(this.file), { recursive: true, mode: 0o700 });
        await appendFile(this.file, `${JSON.stringify(event)}\n`, { encoding: 'utf8', mode: 0o600 });
    }

    async readAll(): Promise<ExecutionEvent[]> {
        try {
            return (await readFile(this.file, 'utf8')).split('\n')
                .filter(Boolean).map(line => JSON.parse(line) as ExecutionEvent);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
            throw error;
        }
    }
}

export class ExecutionEventJournal {
    private readonly state = new Map<string, { sequence: number; hash?: string }>();
    private readonly queues = new Map<string, Promise<unknown>>();

    constructor(
        private readonly sink: { append(event: ExecutionEvent): Promise<void> },
        private readonly clock = () => new Date(),
        private readonly idFactory = randomUUID,
    ) {}

    record(input: {
        eventType: EventType;
        runId: string;
        workflowId?: string;
        stepId?: string;
        payload?: Record<string, unknown>;
    }): Promise<ExecutionEvent> {
        const prior = this.queues.get(input.runId) || Promise.resolve();
        const next = prior.then(() => this.recordNow(input));
        this.queues.set(input.runId, next.catch(() => undefined));
        return next;
    }

    private async recordNow(input: {
        eventType: EventType;
        runId: string;
        workflowId?: string;
        stepId?: string;
        payload?: Record<string, unknown>;
    }): Promise<ExecutionEvent> {
        const previous = this.state.get(input.runId) || { sequence: 0 };
        const payload = input.payload || {};
        const base = {
            schemaVersion: 'lunaos.ai/execution-event/v1' as const,
            eventId: this.idFactory(),
            eventType: input.eventType,
            occurredAt: this.clock().toISOString(),
            runId: input.runId,
            ...(input.workflowId ? { workflowId: input.workflowId } : {}),
            ...(input.stepId ? { stepId: input.stepId } : {}),
            sequence: previous.sequence + 1,
            ...(previous.hash ? { previousEventHash: previous.hash } : {}),
            payloadHash: sha256(canonicalJson(payload)),
            payload,
            source: { product: 'luna', component: 'pipes-runtime' },
        };
        const event = { ...base, eventHash: sha256(canonicalJson(base)) };
        await this.sink.append(event);
        this.state.set(input.runId, { sequence: event.sequence, hash: event.eventHash });
        return event;
    }
}

export function verifyEventChain(events: ExecutionEvent[]): true {
    const previousByRun = new Map<string, ExecutionEvent>();
    for (const event of events) {
        const previous = previousByRun.get(event.runId);
        if (previous && event.sequence !== previous.sequence + 1) throw new Error('non-contiguous sequence');
        if (!previous && event.sequence !== 1) throw new Error('event chain must start at sequence 1');
        if (event.previousEventHash !== previous?.eventHash) throw new Error('previous event hash mismatch');
        if (event.payloadHash !== sha256(canonicalJson(event.payload))) throw new Error('payload hash mismatch');
        const { eventHash, ...base } = event;
        if (eventHash !== sha256(canonicalJson(base))) throw new Error('event hash mismatch');
        previousByRun.set(event.runId, event);
    }
    return true;
}

export function canonicalJson(value: unknown): string {
    return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(sortValue);
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.keys(value).sort().map(key => [
            key, sortValue((value as Record<string, unknown>)[key]),
        ]));
    }
    return value;
}

function sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
}
