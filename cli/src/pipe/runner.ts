import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { toPipeStep } from './commands.js';
import { parsePipeline } from './parser.js';
import type { GovernedStepExecutor } from './step-executor.js';
import type { PipeNode, RunContext, StepHistory, StepResult } from './types.js';

export interface PipelineSummary {
    runId: string;
    workflow: string;
    ok: boolean;
    error?: string;
    reportFile: string;
    eventsFile: string;
    steps: StepHistory[];
}

export class PipeRunner {
    private readonly history: StepHistory[] = [];

    constructor(private readonly options: {
        executor: GovernedStepExecutor;
        repository: string;
        reportDirectory: string;
        eventsFile: string;
        actor: string;
    }) {}

    async run(expression: string, workflow = 'luna.pipe'): Promise<PipelineSummary> {
        this.history.length = 0;
        const graph = parsePipeline(expression);
        const runId = `luna-${randomUUID()}`;
        const context: RunContext = {
            runId,
            workflow,
            repository: this.options.repository,
            actor: { id: this.options.actor, type: 'operator', provider: 'luna' },
        };
        const outcome = await this.executeNode(graph, context);
        const reportFile = path.join(this.options.reportDirectory, `${runId}.md`);
        const summary: PipelineSummary = {
            runId,
            workflow,
            ok: outcome.ok,
            ...(outcome.error ? { error: outcome.error.message } : {}),
            reportFile,
            eventsFile: this.options.eventsFile,
            steps: [...this.history],
        };
        await writeReport(summary);
        return summary;
    }

    private async executeNode(node: PipeNode, context: RunContext): Promise<StepResult> {
        if (node.type === 'command') {
            const step = toPipeStep(node, context.repository);
            try {
                const result = await this.options.executor.run(step, context);
                this.history.push({ id: step.id, command: step.command, status: 'completed' });
                return { ok: true, result };
            } catch (error) {
                const failure = error instanceof Error ? error : new Error(String(error));
                this.history.push({
                    id: step.id, command: step.command, status: 'failed', error: failure.message,
                });
                return { ok: false, error: failure };
            }
        }
        if (node.type === 'parallel') {
            const results = await Promise.all(node.nodes.map(child => this.executeNode(child, context)));
            const failures = results.filter(result => !result.ok).map(result => result.error!);
            return failures.length
                ? { ok: false, error: new AggregateError(failures, 'Parallel pipe steps failed') }
                : { ok: true, result: results.map(result => result.result) };
        }
        let outcome = await this.executeNode(node.first, context);
        for (const link of node.links) {
            if (link.operator === '>>' && !outcome.ok) break;
            if (link.operator === '?>>' && !outcome.ok) continue;
            if (link.operator === '!>>' && outcome.ok) continue;
            outcome = await this.executeNode(link.node, context);
        }
        return outcome;
    }
}

async function writeReport(summary: PipelineSummary): Promise<void> {
    await mkdir(path.dirname(summary.reportFile), { recursive: true, mode: 0o700 });
    const steps = summary.steps.map(step =>
        `| ${step.id} | ${step.command} | ${step.status} | ${step.error || ''} |`).join('\n');
    const content = [
        '# Luna Pipeline Report',
        '',
        `- Run: \`${summary.runId}\``,
        `- Workflow: \`${summary.workflow}\``,
        `- Status: **${summary.ok ? 'completed' : 'failed'}**`,
        `- Events: \`${summary.eventsFile}\``,
        '',
        '## Executed graph',
        '',
        `${summary.steps.map(step => `\`${step.command}\``).join(' → ')}`,
        '',
        '_Arguments are omitted from persistent reports to avoid leaking prompts or secrets._',
        '',
        '## Steps',
        '',
        '| Step | Command | Status | Error |',
        '|---|---|---|---|',
        steps,
        '',
    ].join('\n');
    await writeFile(summary.reportFile, content, { mode: 0o600 });
}
