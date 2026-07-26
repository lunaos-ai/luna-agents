export type FlowOperator = '>>' | '?>>' | '!>>';

export interface CommandNode {
    type: 'command';
    id: string;
    command: string;
    args: string[];
}

export interface FlowNode {
    type: 'flow';
    first: PipeNode;
    links: Array<{ operator: FlowOperator; node: PipeNode }>;
}

export interface ParallelNode {
    type: 'parallel';
    nodes: PipeNode[];
}

export type PipeNode = CommandNode | FlowNode | ParallelNode;

export interface PipeStep extends CommandNode {
    verb: string;
    operation: string;
    target: string;
    environment: string;
    parameters: Record<string, unknown>;
    riskScore: number;
}

export interface RunContext {
    runId: string;
    workflow: string;
    repository: string;
    actor: { id: string; type: string; provider: string };
    signal?: AbortSignal;
}

export interface StepResult {
    ok: boolean;
    result?: unknown;
    error?: Error;
}

export interface StepHistory {
    id: string;
    command: string;
    status: 'completed' | 'failed';
    error?: string;
}
