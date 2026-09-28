import type {
    CycleRecord,
    EvidenceKind,
    LifecycleGap,
    PlanTask,
    RequirementRecord,
    RequirementState,
    StateTransition,
    ValidatedEvidence,
} from './types.js';
import { lifecycleStates } from './types.js';

export function deriveRequirementState(evidence: ValidatedEvidence[]): RequirementState {
    const kinds = new Set(evidence.filter(item => item.valid).map(item => item.kind));
    if (hasCompleteChain(kinds)) return 'DONE';
    if (hasThrough(kinds, 'e2e')) return 'E2E_VERIFIED';
    if (hasThrough(kinds, 'deployment')) return 'DEPLOYED';
    if (hasThrough(kinds, 'verification')) return 'VERIFIED';
    if (kinds.has('implementation')) return 'IMPLEMENTED';
    if (kinds.has('implementation_started')) return 'IMPLEMENTING';
    return 'PLANNED';
}

export function reconcileRequirementStates(options: {
    requirements: RequirementRecord[];
    evidence: ValidatedEvidence[];
    previous?: RequirementRecord[];
    occurredAt: string;
}): { requirements: RequirementRecord[]; transitions: StateTransition[]; gaps: LifecycleGap[] } {
    const evidenceByRequirement = groupEvidence(options.evidence);
    const previous = new Map((options.previous || []).map(requirement => [requirement.id, requirement]));
    const transitions: StateTransition[] = [];

    const requirements = options.requirements.map(requirement => {
        const relevant = evidenceByRequirement.get(requirement.id) || [];
        const state = deriveRequirementState(relevant);
        const next = {
            ...requirement,
            state,
            evidenceIds: relevant.map(item => item.id).sort(),
        };
        const before = previous.get(requirement.id)?.state ?? null;
        if (before !== state) {
            transitions.push({
                schemaVersion: 'lunaos.ai/requirement-transition/v1',
                requirementId: requirement.id,
                from: before,
                to: state,
                occurredAt: options.occurredAt,
                reason: transitionReason(before, state, relevant),
                evidenceIds: next.evidenceIds,
            });
        }
        return next;
    });

    return {
        requirements,
        transitions,
        gaps: requirements.filter(requirement => requirement.state !== 'DONE').map(requirement => ({
            requirementId: requirement.id,
            state: requirement.state,
            missingEvidence: nextEvidenceKind(requirement.state),
            reason: gapReason(requirement, evidenceByRequirement.get(requirement.id) || []),
            claimMismatch: claimMismatch(requirement),
        })),
    };
}

export function buildCycles(options: {
    cycleDefinitions: Array<{
        id: string;
        title: string;
        checked?: boolean;
        requirementIds?: string[];
        source?: { path: string; line: number };
    }>;
    tasks: PlanTask[];
    requirements: RequirementRecord[];
}): CycleRecord[] {
    const requirements = new Map(options.requirements.map(requirement => [requirement.id, requirement]));
    const tasksByCycle = new Map<string, PlanTask[]>();
    for (const task of options.tasks) {
        const list = tasksByCycle.get(task.cycleId) || [];
        list.push(task);
        tasksByCycle.set(task.cycleId, list);
    }
    const definitions = new Map(options.cycleDefinitions.map(cycle => [cycle.id, cycle]));
    for (const cycleId of tasksByCycle.keys()) {
        if (!definitions.has(cycleId)) definitions.set(cycleId, { id: cycleId, title: cycleId });
    }

    return [...definitions.values()].map(definition => {
        const tasks = tasksByCycle.get(definition.id) || [];
        const requirementIds = unique([
            ...(definition.requirementIds || []),
            ...tasks.flatMap(task => task.requirementIds),
        ])
            .filter(id => requirements.has(id));
        const states = requirementIds.map(id => requirements.get(id)!.state);
        const state = aggregateState(states);
        const checkedTaskCount = tasks.filter(task => task.checked).length;
        return {
            id: definition.id,
            title: definition.title,
            requirementIds,
            taskIds: tasks.map(task => task.id),
            checkedTaskCount,
            taskCount: tasks.length,
            roadmapChecked: Boolean(definition.checked),
            sourcePaths: unique([
                ...(definition.source ? [definition.source.path] : []),
                ...tasks.map(task => task.source.path),
            ]),
            state,
            claimMismatch: state !== 'DONE' && (checkedTaskCount > 0 || Boolean(definition.checked)),
        };
    }).sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true }));
}

export function aggregateState(states: RequirementState[]): RequirementState {
    if (!states.length) return 'PLANNED';
    return states.reduce((lowest, state) =>
        lifecycleStates.indexOf(state) < lifecycleStates.indexOf(lowest) ? state : lowest);
}

export function nextEvidenceKind(state: RequirementState): EvidenceKind | null {
    const next: Record<RequirementState, EvidenceKind | null> = {
        PLANNED: 'implementation_started',
        IMPLEMENTING: 'implementation',
        IMPLEMENTED: 'verification',
        VERIFIED: 'deployment',
        DEPLOYED: 'e2e',
        E2E_VERIFIED: 'completion',
        DONE: null,
    };
    return next[state];
}

function hasThrough(kinds: Set<EvidenceKind>, terminal: EvidenceKind): boolean {
    const sequence: EvidenceKind[] = ['implementation', 'verification', 'deployment', 'e2e'];
    const terminalIndex = sequence.indexOf(terminal);
    return sequence.slice(0, terminalIndex + 1).every(kind => kinds.has(kind));
}

function hasCompleteChain(kinds: Set<EvidenceKind>): boolean {
    return hasThrough(kinds, 'e2e') && kinds.has('completion');
}

function groupEvidence(evidence: ValidatedEvidence[]): Map<string, ValidatedEvidence[]> {
    const grouped = new Map<string, ValidatedEvidence[]>();
    for (const item of evidence) {
        const list = grouped.get(item.requirementId) || [];
        list.push(item);
        grouped.set(item.requirementId, list);
    }
    return grouped;
}

function transitionReason(
    before: RequirementState | null,
    after: RequirementState,
    evidence: ValidatedEvidence[],
): string {
    if (before === null) return `imported at ${after} from currently valid evidence`;
    const regressed = lifecycleStates.indexOf(after) < lifecycleStates.indexOf(before);
    if (regressed) {
        const stale = evidence.filter(item => !item.valid).map(item => `${item.id}: ${item.reason}`);
        return stale.length
            ? `regressed because evidence is no longer valid: ${stale.join('; ')}`
            : 'regressed because required evidence is no longer present';
    }
    return `advanced from ${before} using valid evidence`;
}

function gapReason(requirement: RequirementRecord, evidence: ValidatedEvidence[]): string {
    const missing = nextEvidenceKind(requirement.state);
    const invalid = evidence.filter(item => !item.valid);
    const parts = [missing ? `missing valid ${missing} evidence` : ''];
    if (invalid.length) parts.push(`${invalid.length} evidence record(s) are stale or invalid`);
    if (claimMismatch(requirement)) parts.push('completion claim is ahead of evidence-derived state');
    return parts.filter(Boolean).join('; ');
}

function claimMismatch(requirement: RequirementRecord): boolean {
    return requirement.state !== 'DONE'
        && (requirement.claims.requirementChecked || requirement.claims.completedTaskIds.length > 0);
}

function unique<T>(values: T[]): T[] {
    return [...new Set(values)];
}
