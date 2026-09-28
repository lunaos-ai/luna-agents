import type {
    LifecycleManifest,
    RequirementState,
    SyncAction,
    SyncResult,
    WorkItem,
    WorkItemDraft,
    WorkItemProvider,
} from './types.js';

const managedStart = '<!-- luna:lifecycle:start -->';
const managedEnd = '<!-- luna:lifecycle:end -->';

export async function syncLifecycleWorkItems(options: {
    provider: WorkItemProvider;
    manifest: LifecycleManifest;
    repository: string;
    dryRun: boolean;
    scope?: string;
}): Promise<SyncResult> {
    const existing = await options.provider.list();
    const drafts = buildDrafts(options.manifest, options.scope);
    const states = desiredStates(options.manifest);
    const claims = mismatchedClaims(options.manifest);
    const actions: SyncAction[] = [];
    const staleClosures: SyncResult['staleClosures'] = [];
    const claimMismatches: SyncResult['claimMismatches'] = [];

    for (const draft of drafts) {
        let item = findExisting(existing, draft.key);
        const claim = claims.get(draft.key);
        if (claim) {
            claimMismatches.push({
                key: draft.key,
                ...(item ? { issueNumber: item.number } : {}),
                providerState: item?.state || 'missing',
                evidenceState: claim.state,
                reason: `${claim.claim} is complete while evidence-derived state is ${claim.state}`,
            });
        }
        if (!item) {
            actions.push({
                kind: 'create', key: draft.key, title: draft.title,
                reason: 'no provider work item carries this stable lifecycle key',
            });
            if (!options.dryRun) {
                item = await options.provider.create(draft);
                existing.push(item);
            }
            if (draft.desiredState === 'closed') {
                actions.push({
                    kind: 'close', key: draft.key, issueNumber: item?.number,
                    title: draft.title, reason: 'new work item already has evidence-derived DONE state',
                });
                if (!options.dryRun && item) await options.provider.setState(item, 'closed');
            }
            continue;
        }

        const mergedBody = mergeManagedBody(item.body, draft.body);
        if (item.title !== draft.title || mergedBody !== normalizeBody(item.body)) {
            actions.push({
                kind: 'update', key: draft.key, issueNumber: item.number,
                title: draft.title, reason: 'title or managed lifecycle block drifted',
            });
            if (!options.dryRun) item = await options.provider.update(item, { ...draft, body: mergedBody });
        }

        if (item.state !== draft.desiredState) {
            const kind = draft.desiredState === 'open' ? 'reopen' : 'close';
            actions.push({
                kind, key: draft.key, issueNumber: item.number, title: draft.title,
                reason: draft.desiredState === 'open'
                    ? 'provider closure is ahead of evidence-derived lifecycle state'
                    : 'all evidence gates reached DONE',
            });
            if (kind === 'reopen') {
                staleClosures.push({
                    key: draft.key,
                    issueNumber: item.number,
                    state: states.get(draft.key) || 'PLANNED',
                });
            }
            if (!options.dryRun) await options.provider.setState(item, draft.desiredState);
        }
    }

    return {
        dryRun: options.dryRun,
        repository: options.repository,
        actions,
        staleClosures,
        claimMismatches,
        itemCount: drafts.length,
    };
}

export function buildDrafts(manifest: LifecycleManifest, scope?: string): WorkItemDraft[] {
    const normalizedScope = scope?.toUpperCase();
    const cycles = manifest.cycles
        .filter(cycle => matchesScope(`cycle:${cycle.id}`, cycle.title, normalizedScope))
        .map((cycle): WorkItemDraft => ({
            key: `cycle:${cycle.id}`,
            title: `[${cycle.id}] ${cycle.title}`,
            desiredState: cycle.state === 'DONE' ? 'closed' : 'open',
            body: managedBody(`cycle:${cycle.id}`, [
                `Type: cycle`,
                `Evidence-derived state: **${cycle.state}**`,
                `Requirements: ${cycle.requirementIds.length ? cycle.requirementIds.join(', ') : 'none mapped'}`,
                `Plan claims: ${cycle.checkedTaskCount}/${cycle.taskCount} tasks checked`,
                `Roadmap claim: ${cycle.roadmapChecked ? 'checked' : 'open'}`,
                cycle.claimMismatch
                    ? 'Mismatch: checked plan work is ahead of evidence-derived completion.'
                    : 'Mismatch: none detected.',
            ]),
        }));
    const requirements = manifest.requirements
        .filter(requirement => matchesScope(`requirement:${requirement.id}`, requirement.title, normalizedScope))
        .map((requirement): WorkItemDraft => ({
            key: `requirement:${requirement.id}`,
            title: `[${requirement.id}] ${requirement.title}`,
            desiredState: requirement.state === 'DONE' ? 'closed' : 'open',
            body: managedBody(`requirement:${requirement.id}`, [
                `Type: requirement`,
                `Evidence-derived state: **${requirement.state}**`,
                `Source: \`${requirement.source.path}:${requirement.source.line}\``,
                `Cycles: ${requirement.cycleIds.length ? requirement.cycleIds.join(', ') : 'unmapped'}`,
                `Evidence records: ${requirement.evidenceIds.length}`,
                requirement.claims.requirementChecked && requirement.state !== 'DONE'
                    ? 'Mismatch: the Markdown checkbox is checked, but the evidence chain has not reached DONE.'
                    : 'Mismatch: none detected.',
            ]),
        }));
    return [...cycles, ...requirements];
}

function findExisting(items: WorkItem[], key: string): WorkItem | undefined {
    const marker = markerFor(key);
    const byMarker = items.find(item => item.body.includes(marker));
    if (byMarker) return byMarker;
    const id = key.split(':').slice(1).join(':');
    const pattern = new RegExp(`(^|[^A-Z0-9.-])${escapeRegex(id)}([^A-Z0-9.-]|$)`, 'i');
    const direct = items.find(item => pattern.test(item.title));
    if (direct) return direct;
    const phase = key.match(/^cycle:PHASE-(\d+(?:-\d+)?)$/i)?.[1]?.replace('-', '.');
    if (phase) return items.find(item => new RegExp(`\\bPhase\\s+${escapeRegex(phase)}\\b`, 'i').test(item.title));
    return undefined;
}

function mergeManagedBody(existing: string, desired: string): string {
    const desiredBlock = extractManagedBlock(desired);
    const marker = desired.match(/<!-- luna:item:[^>]+ -->/)?.[0] || '';
    if (!existing.trim()) return normalizeBody(desired);
    const start = existing.indexOf(managedStart);
    const end = existing.indexOf(managedEnd);
    let merged = existing;
    if (start !== -1 && end > start) {
        merged = `${existing.slice(0, start)}${desiredBlock}${existing.slice(end + managedEnd.length)}`;
    } else {
        merged = `${existing.trimEnd()}\n\n${desiredBlock}`;
    }
    if (marker && !merged.includes(marker)) merged = `${marker}\n${merged}`;
    return normalizeBody(merged);
}

function managedBody(key: string, lines: string[]): string {
    return normalizeBody([
        markerFor(key),
        managedStart,
        'Managed by Luna Requirements Lifecycle. Edit the source `.luna` artifacts or evidence, then sync again.',
        '',
        ...lines.map(line => `- ${line}`),
        managedEnd,
    ].join('\n'));
}

function markerFor(key: string): string {
    return `<!-- luna:item:${key} -->`;
}

function extractManagedBlock(body: string): string {
    const start = body.indexOf(managedStart);
    const end = body.indexOf(managedEnd);
    if (start === -1 || end < start) return body;
    return body.slice(start, end + managedEnd.length);
}

function normalizeBody(body: string): string {
    return `${body.trim()}\n`;
}

function matchesScope(key: string, title: string, scope?: string): boolean {
    if (!scope) return true;
    const normalizedKey = key.toUpperCase();
    const stableId = normalizedKey.split(':').slice(1).join(':');
    if (normalizedKey === scope || stableId === scope) return true;
    const looksLikeStableId = /^(?:[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+|P\d+(?:\.\d+)*)$/.test(scope);
    return !looksLikeStableId && title.toUpperCase().includes(scope);
}

function desiredStates(manifest: LifecycleManifest): Map<string, RequirementState> {
    return new Map([
        ...manifest.cycles.map(cycle => [`cycle:${cycle.id}`, cycle.state] as const),
        ...manifest.requirements.map(requirement => [`requirement:${requirement.id}`, requirement.state] as const),
    ]);
}

function mismatchedClaims(manifest: LifecycleManifest): Map<string, {
    state: RequirementState;
    claim: string;
}> {
    const claims = new Map<string, { state: RequirementState; claim: string }>();
    for (const cycle of manifest.cycles.filter(item => item.claimMismatch)) {
        claims.set(`cycle:${cycle.id}`, {
            state: cycle.state,
            claim: cycle.roadmapChecked ? 'roadmap phase/epic' : 'implementation-plan task set',
        });
    }
    for (const requirement of manifest.requirements.filter(item =>
        item.state !== 'DONE'
        && (item.claims.requirementChecked || item.claims.completedTaskIds.length > 0))) {
        claims.set(`requirement:${requirement.id}`, {
            state: requirement.state,
            claim: 'requirement or task checkbox',
        });
    }
    return claims;
}

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
