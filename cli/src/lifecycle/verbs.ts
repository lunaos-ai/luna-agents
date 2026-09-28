import path from 'node:path';
import { evidenceKinds, lifecycleStates, type EvidenceKind } from './types.js';
import { GitHubCliWorkItemProvider, resolveGitHubRepository } from './github-cli-provider.js';
import { LifecycleStore } from './store.js';
import { addRequirementEvidence, reconcileProject, verifyRequirement } from './service.js';
import { syncLifecycleWorkItems } from './sync.js';

export const lifecycleVerbs = [
    'reconcile',
    'status',
    'gaps',
    'cycle',
    'sync-github',
    'evidence',
    'verify-requirement',
] as const;

export type LifecycleVerb = typeof lifecycleVerbs[number];

export function isLifecycleVerb(value: string): value is LifecycleVerb {
    return (lifecycleVerbs as readonly string[]).includes(value);
}

export async function executeLifecycleVerb(
    verb: LifecycleVerb,
    args: string[],
    options: { cwd: string; forceDryRun?: boolean },
): Promise<unknown> {
    const parsed = parseArgs(args);
    const root = path.resolve(parsed.value('root') || options.cwd);
    const forcedDryRun = Boolean(options.forceDryRun);

    if (verb === 'reconcile') {
        return reconcileProject({ root, dryRun: forcedDryRun || parsed.boolean('dry-run') });
    }
    if (verb === 'status') {
        const result = await reconcileProject({ root, dryRun: true });
        const counts = Object.fromEntries(lifecycleStates.map(state => [state,
            result.manifest.requirements.filter(requirement => requirement.state === state).length]));
        return {
            project: result.manifest.project,
            requirementCount: result.manifest.requirements.length,
            cycleCount: result.manifest.cycles.length,
            sourceFiles: result.manifest.sourceFiles,
            counts,
            claimMismatchCount: result.gaps.filter(gap => gap.claimMismatch).length,
            staleEvidenceCount: result.evidence.filter(item => !item.valid).length,
        };
    }
    if (verb === 'gaps') {
        const result = await reconcileProject({ root, dryRun: true });
        const scope = parsed.positionals[0] || parsed.value('scope');
        return {
            project: result.manifest.project,
            gaps: result.gaps.filter(gap => !scope || gap.requirementId.includes(scope.toUpperCase())),
        };
    }
    if (verb === 'cycle') {
        const result = await reconcileProject({ root, dryRun: true });
        const scope = parsed.positionals[0] || parsed.value('scope');
        return {
            project: result.manifest.project,
            cycles: result.manifest.cycles.filter(cycle =>
                !scope || cycle.id.toUpperCase().includes(scope.toUpperCase())
                || cycle.title.toUpperCase().includes(scope.toUpperCase())),
        };
    }
    if (verb === 'verify-requirement') {
        const requirementId = parsed.positionals[0] || parsed.value('id');
        if (!requirementId) throw new Error('verify-requirement requires a stable requirement ID');
        return verifyRequirement({ root, requirementId });
    }
    if (verb === 'evidence') {
        const requirementId = parsed.positionals[0] || parsed.value('id');
        const kind = parsed.value('kind') as EvidenceKind | undefined;
        const source = parsed.value('source');
        if (!requirementId) throw new Error('evidence requires a stable requirement ID');
        if (!kind || !evidenceKinds.includes(kind)) {
            throw new Error(`evidence --kind must be one of: ${evidenceKinds.join(', ')}`);
        }
        if (!source) throw new Error('evidence requires --source');
        return addRequirementEvidence({
            root,
            requirementId,
            kind,
            source,
            note: parsed.value('note'),
            digest: parsed.value('digest'),
            observedAt: parsed.value('observed-at'),
            expiresAt: parsed.value('expires-at'),
            attested: parsed.boolean('attested'),
            dryRun: forcedDryRun || parsed.boolean('dry-run'),
        });
    }

    const manifest = await reconcileProject({ root, dryRun: true });
    const repository = await resolveGitHubRepository(root, parsed.value('repo'));
    const dryRun = forcedDryRun || !parsed.boolean('apply') || parsed.boolean('dry-run');
    const provider = new GitHubCliWorkItemProvider(repository, root);
    const result = await syncLifecycleWorkItems({
        provider,
        manifest: manifest.manifest,
        repository,
        dryRun,
        scope: parsed.positionals[0] || parsed.value('scope'),
    });
    if (!dryRun) {
        await new LifecycleStore(root).writeSyncReceipt({
            schemaVersion: 'lunaos.ai/github-sync/v1',
            synchronizedAt: new Date().toISOString(),
            repository,
            actions: result.actions,
            manifestGeneratedAt: manifest.manifest.generatedAt,
        });
    }
    return result;
}

function parseArgs(args: string[]): {
    positionals: string[];
    value(name: string): string | undefined;
    boolean(name: string): boolean;
} {
    const values = new Map<string, string>();
    const flags = new Set<string>();
    const positionals: string[] = [];
    for (let index = 0; index < args.length; index++) {
        const token = args[index];
        if (!token.startsWith('--')) {
            positionals.push(token);
            continue;
        }
        const equals = token.indexOf('=');
        if (equals !== -1) {
            values.set(token.slice(2, equals), token.slice(equals + 1));
            continue;
        }
        const name = token.slice(2);
        const next = args[index + 1];
        if (next && !next.startsWith('--')) {
            values.set(name, next);
            index++;
        } else {
            flags.add(name);
        }
    }
    return {
        positionals,
        value: name => values.get(name),
        boolean: name => flags.has(name) || values.get(name) === 'true',
    };
}
