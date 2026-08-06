import { Command } from 'commander';
import path from 'node:path';
import os from 'node:os';
import { createCommandExecutor } from '../pipe/commands.js';
import { ExecutionEventJournal, JsonlEventSink } from '../pipe/events.js';
import {
    EnvironmentApprovalProvider,
    FileReceiptStore,
    PipeWardenClient,
    PolicyGate,
    type PolicyMode,
} from '../pipe/policy.js';
import { PipeRunner } from '../pipe/runner.js';
import { GovernedStepExecutor } from '../pipe/step-executor.js';

export const pipeCommand = new Command('pipe')
    .description('Execute a governed Luna agent pipeline')
    .argument('<pipeline...>', 'Quoted pipeline expression')
    .option('--dry-run', 'Plan steps without invoking Luna agents')
    .option('--policy-mode <mode>', 'off, observe, or enforce', process.env.LUNA_POLICY_MODE || 'observe')
    .option('--pipewarden <path>', 'PipeWarden binary', process.env.PIPEWARDEN_BINARY || 'pipewarden')
    .option('--approve', 'Approve receipt-bound policy gates for this run')
    .option('--actor <name>', 'Actor recorded in receipts and events', process.env.LUNA_POLICY_ACTOR || os.userInfo().username)
    .option('--json', 'Print the run summary as JSON')
    .addHelpText('after', `
Examples:
  luna pipe 'req >> des >> plan >> go >> test'
  luna pipe '(rev ~~ test ~~ sec) ?>> ship'
  luna pipe --policy-mode enforce --approve 'test >> ship'
`)
    .action(async (pipeline: string[], options) => {
        const expression = pipeline.join(' ');
        const cwd = process.cwd();
        const project = path.basename(cwd).replace(/[^a-z0-9._-]/gi, '-');
        const stateDirectory = path.join(cwd, '.luna', project);
        const eventsFile = path.join(stateDirectory, 'execution-events.jsonl');
        const receiptDirectory = path.join(stateDirectory, 'policy', 'receipts');
        const mode = parseMode(options.dryRun ? 'off' : options.policyMode);
        const sink = new JsonlEventSink(eventsFile);
        const journal = new ExecutionEventJournal(sink);
        const client = new PipeWardenClient(
            options.pipewarden,
            mode === 'enforce',
            process.env.PIPEWARDEN_RECEIPT_KEY || '',
        );
        const gate = new PolicyGate({
            mode,
            client,
            receiptStore: new FileReceiptStore(receiptDirectory),
            approvalProvider: new EnvironmentApprovalProvider(
                Boolean(options.approve) || process.env.LUNA_APPROVE === '1',
                options.actor,
            ),
        });
        const commandExecutor = createCommandExecutor({ cwd, dryRun: options.dryRun });
        const executor = new GovernedStepExecutor(gate, journal, commandExecutor);
        const runner = new PipeRunner({
            executor,
            repository: cwd,
            reportDirectory: path.join(stateDirectory, 'pipeline-reports'),
            eventsFile,
            actor: options.actor,
        });
        const summary = await runner.run(expression);
        if (options.json) console.log(JSON.stringify(summary, null, 2));
        else printSummary(summary);
        if (!summary.ok) process.exitCode = 1;
    });

function parseMode(value: string): PolicyMode {
    if (value === 'off' || value === 'observe' || value === 'enforce') return value;
    throw new Error('policy mode must be off, observe, or enforce');
}

function printSummary(summary: Awaited<ReturnType<PipeRunner['run']>>): void {
    console.log('');
    console.log(summary.ok ? '✓ Luna pipeline completed' : `✗ Luna pipeline failed: ${summary.error}`);
    console.log(`  Run:    ${summary.runId}`);
    console.log(`  Report: ${summary.reportFile}`);
    console.log(`  Events: ${summary.eventsFile}`);
}
