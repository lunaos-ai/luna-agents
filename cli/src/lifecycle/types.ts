export const lifecycleStates = [
    'PLANNED',
    'IMPLEMENTING',
    'IMPLEMENTED',
    'VERIFIED',
    'DEPLOYED',
    'E2E_VERIFIED',
    'DONE',
] as const;

export type RequirementState = typeof lifecycleStates[number];

export const evidenceKinds = [
    'implementation_started',
    'implementation',
    'verification',
    'deployment',
    'e2e',
    'completion',
] as const;

export type EvidenceKind = typeof evidenceKinds[number];
export type EvidenceSourceType = 'file' | 'commit' | 'url' | 'attestation';

export interface RequirementSource {
    path: string;
    line: number;
    ordinal: number;
    checked: boolean;
}

export interface RequirementClaim {
    requirementChecked: boolean;
    completedTaskIds: string[];
}

export interface RequirementRecord {
    id: string;
    title: string;
    description: string;
    explicitId: boolean;
    source: RequirementSource;
    cycleIds: string[];
    taskIds: string[];
    evidenceIds: string[];
    state: RequirementState;
    claims: RequirementClaim;
}

export interface PlanTask {
    id: string;
    title: string;
    checked: boolean;
    cycleId: string;
    requirementIds: string[];
    source: { path: string; line: number };
}

export interface CycleRecord {
    id: string;
    title: string;
    requirementIds: string[];
    taskIds: string[];
    checkedTaskCount: number;
    taskCount: number;
    roadmapChecked: boolean;
    sourcePaths: string[];
    state: RequirementState;
    claimMismatch: boolean;
}

export interface EvidenceSource {
    type: EvidenceSourceType;
    locator: string;
    digest?: string;
    revision?: string;
}

export interface EvidenceRecord {
    schemaVersion: 'lunaos.ai/requirement-evidence/v1';
    id: string;
    requirementId: string;
    kind: EvidenceKind;
    source: EvidenceSource;
    observedAt: string;
    expiresAt?: string;
    status: 'active' | 'revoked';
    attested: boolean;
    note?: string;
}

export interface ValidatedEvidence extends EvidenceRecord {
    valid: boolean;
    validation: 'valid' | 'stale' | 'invalid';
    reason: string;
}

export interface StateTransition {
    schemaVersion: 'lunaos.ai/requirement-transition/v1';
    requirementId: string;
    from: RequirementState | null;
    to: RequirementState;
    occurredAt: string;
    reason: string;
    evidenceIds: string[];
}

export interface LifecycleManifest {
    schemaVersion: 'lunaos.ai/requirements-lifecycle/v1';
    project: string;
    generatedAt: string;
    sourceFiles: string[];
    requirements: RequirementRecord[];
    cycles: CycleRecord[];
}

export interface LifecycleGap {
    requirementId: string;
    state: RequirementState;
    missingEvidence: EvidenceKind | null;
    reason: string;
    claimMismatch: boolean;
}

export interface ReconcileResult {
    manifest: LifecycleManifest;
    evidence: ValidatedEvidence[];
    transitions: StateTransition[];
    gaps: LifecycleGap[];
    bootstrapped: boolean;
    dryRun: boolean;
}

/**
 * Provider-neutral issue shape used by lifecycle reconciliation. GitHub-specific
 * response types stay inside the GitHub adapter.
 */
export interface WorkItem {
    providerId: string;
    number: number;
    title: string;
    body: string;
    state: 'open' | 'closed';
    url: string;
}

export interface WorkItemDraft {
    key: string;
    title: string;
    body: string;
    desiredState: 'open' | 'closed';
}

export interface WorkItemProvider {
    list(): Promise<WorkItem[]>;
    create(draft: WorkItemDraft): Promise<WorkItem>;
    update(item: WorkItem, draft: WorkItemDraft): Promise<WorkItem>;
    setState(item: WorkItem, state: 'open' | 'closed'): Promise<WorkItem>;
}

export interface SyncAction {
    kind: 'create' | 'update' | 'reopen' | 'close';
    key: string;
    issueNumber?: number;
    title: string;
    reason: string;
}

export interface SyncResult {
    dryRun: boolean;
    repository: string;
    actions: SyncAction[];
    staleClosures: Array<{ key: string; issueNumber: number; state: RequirementState }>;
    claimMismatches: Array<{
        key: string;
        issueNumber?: number;
        providerState: 'open' | 'closed' | 'missing';
        evidenceState: RequirementState;
        reason: string;
    }>;
    itemCount: number;
}
