import { Command } from 'commander';
import chalk from 'chalk';
import { executeLifecycleVerb, type LifecycleVerb } from '../lifecycle/verbs.js';
import type { ReconcileResult, SyncResult } from '../lifecycle/types.js';
import type { JevShadowObservation } from '../lifecycle/jev-shadow.js';

export const reconcileCommand = new Command('reconcile')
    .description('Derive requirement and cycle state from current evidence')
    .option('--dry-run', 'Preview lifecycle state without writing sidecars')
    .option('--root <path>', 'Project root', process.cwd())
    .option('--json', 'Print JSON')
    .action(async options => {
        const values = commandOptions(options);
        await run('reconcile', flags(values), Boolean(values.json));
    });

export const gapsCommand = new Command('gaps')
    .description('Show missing or stale requirement evidence')
    .argument('[scope]', 'Requirement ID or scope filter')
    .option('--root <path>', 'Project root', process.cwd())
    .option('--json', 'Print JSON')
    .action(async (scope, options) => {
        const values = commandOptions(options);
        await run('gaps', positional(scope, flags(values)), Boolean(values.json));
    });

export const cycleCommand = new Command('cycle')
    .description('Show evidence-derived phase and epic state')
    .argument('[cycle]', 'Cycle, phase, or epic ID')
    .option('--root <path>', 'Project root', process.cwd())
    .option('--json', 'Print JSON')
    .action(async (cycle, options) => {
        const values = commandOptions(options);
        await run('cycle', positional(cycle, flags(values)), Boolean(values.json));
    });

export const syncGitHubCommand = new Command('sync-github')
    .description('Plan or apply idempotent lifecycle synchronization to GitHub issues')
    .argument('[scope]', 'Requirement or cycle ID to synchronize')
    .option('--repo <owner/name>', 'GitHub repository; defaults to origin')
    .option('--apply', 'Apply the reviewed plan; default is dry-run')
    .option('--dry-run', 'Explicitly prevent GitHub mutations')
    .option('--root <path>', 'Project root', process.cwd())
    .option('--json', 'Print JSON')
    .action(async (scope, options) => {
        const values = commandOptions(options);
        await run('sync-github', positional(scope, flags(values)), Boolean(values.json));
    });

export const evidenceCommand = new Command('evidence')
    .description('Attach immutable evidence to a stable requirement ID')
    .argument('<requirement-id>', 'Stable requirement ID')
    .requiredOption('--kind <kind>', 'implementation_started, implementation, verification, deployment, e2e, or completion')
    .requiredOption('--source <source>', 'file:path, commit:sha, url:https://..., or attestation:text')
    .option('--digest <sha256>', 'Expected file digest; computed automatically for files')
    .option('--note <text>', 'Evidence note')
    .option('--observed-at <iso-date>', 'Observation timestamp')
    .option('--expires-at <iso-date>', 'Evidence expiry timestamp')
    .option('--attested', 'Explicitly attest URL or manual evidence')
    .option('--dry-run', 'Validate without writing evidence')
    .option('--root <path>', 'Project root', process.cwd())
    .option('--json', 'Print JSON')
    .action(async (requirementId, options) => {
        const values = commandOptions(options);
        await run('evidence', positional(requirementId, flags(values)), Boolean(values.json));
    });

export const verifyRequirementCommand = new Command('verify-requirement')
    .description('Verify one requirement and explain its evidence-derived state')
    .argument('<requirement-id>', 'Stable requirement ID')
    .option('--root <path>', 'Project root', process.cwd())
    .option('--json', 'Print JSON')
    .action(async (requirementId, options) => {
        const values = commandOptions(options);
        await run('verify-requirement', positional(requirementId, flags(values)), Boolean(values.json));
    });

export const jevShadowCommand = new Command('jev-shadow')
    .description('Observe lifecycle claim risk with Jev without changing state or taking action')
    .argument('[scope]', 'Stable requirement or cycle ID')
    .option('--api-key-env <name>', 'Environment variable containing the TypeSafe key', 'TYPESAFE_API_KEY')
    .option('--model <model>', 'Pinned Jev model', 'jev-1.13.0')
    .option('--timeout-ms <milliseconds>', 'Request timeout between 100 and 60000', '15000')
    .option('--dry-run', 'Print the sanitized request without calling Jev')
    .option('--root <path>', 'Project root', process.cwd())
    .option('--json', 'Print JSON')
    .action(async (scope, options) => {
        const values = commandOptions(options);
        await run('jev-shadow', positional(scope, flags(values)), Boolean(values.json));
    });

export const lifecycleCommands = [
    reconcileCommand,
    gapsCommand,
    cycleCommand,
    syncGitHubCommand,
    evidenceCommand,
    verifyRequirementCommand,
    jevShadowCommand,
];

async function run(verb: LifecycleVerb, args: string[], json: boolean): Promise<void> {
    const result = await executeLifecycleVerb(verb, args, { cwd: process.cwd() });
    if (json) console.log(JSON.stringify(result, null, 2));
    else printLifecycleResult(verb, result);
}

export function printLifecycleResult(verb: LifecycleVerb, result: unknown): void {
    console.log('');
    console.log(chalk.hex('#E8A317')(`🌙 Requirements ${verb}`));
    if (verb === 'reconcile') {
        const value = result as ReconcileResult;
        console.log(`  ${chalk.dim('Requirements:')} ${value.manifest.requirements.length}`);
        console.log(`  ${chalk.dim('Cycles:')}       ${value.manifest.cycles.length}`);
        console.log(`  ${chalk.dim('Gaps:')}         ${value.gaps.length}`);
        console.log(`  ${chalk.dim('Transitions:')}  ${value.transitions.length}`);
        console.log(`  ${chalk.dim('Mode:')}         ${value.dryRun ? 'dry-run' : 'saved'}`);
    } else if (verb === 'sync-github') {
        const value = result as SyncResult;
        console.log(`  ${chalk.dim('Repository:')} ${value.repository}`);
        console.log(`  ${chalk.dim('Mode:')}       ${value.dryRun ? 'dry-run' : 'applied'}`);
        console.log(`  ${chalk.dim('Actions:')}    ${value.actions.length}`);
        console.log(`  ${chalk.dim('Stale closes:')} ${value.staleClosures.length}`);
        console.log(`  ${chalk.dim('Claim gaps:')} ${value.claimMismatches.length}`);
        for (const action of value.actions.slice(0, 20)) {
            console.log(`    ${chalk.cyan(action.kind.padEnd(6))} ${action.key} — ${action.reason}`);
        }
    } else if (verb === 'jev-shadow') {
        const value = result as JevShadowObservation;
        console.log(`  ${chalk.dim('Status:')}        ${value.status}`);
        console.log(`  ${chalk.dim('Mode:')}          shadow / advisory only`);
        console.log(`  ${chalk.dim('Authoritative:')} no`);
        console.log(`  ${chalk.dim('Applied:')}       no`);
        console.log(`  ${chalk.dim('Model:')}         ${value.observedModel || value.requestedModel}`);
        if (value.answers) {
            console.log(`  ${chalk.dim('Review lane:')}   ${value.answers.review_lane.choice}`);
            console.log(`  ${chalk.dim('Claim risk:')}    ${value.answers.claim_risk.score}`);
            console.log(`  ${chalk.dim('Human review:')}  ${value.answers.needs_human_review.noul}`);
        }
        if (value.unavailableReason) {
            console.log(`  ${chalk.dim('Unavailable:')}   ${value.unavailableReason}`);
        }
    } else {
        console.log(JSON.stringify(result, null, 2));
    }
    console.log('');
}

function positional(value: string | undefined, args: string[]): string[] {
    return value ? [value, ...args] : args;
}

function flags(options: Record<string, unknown>): string[] {
    const args: string[] = [];
    for (const [rawName, value] of Object.entries(options)) {
        if (rawName === 'json' || value === undefined || value === false) continue;
        const name = rawName.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
        args.push(`--${name}`);
        if (value !== true) args.push(String(value));
    }
    return args;
}

function commandOptions(command: Command | Record<string, unknown>): Record<string, unknown> {
    return typeof (command as Command).opts === 'function'
        ? (command as Command).opts() as Record<string, unknown>
        : command as Record<string, unknown>;
}
