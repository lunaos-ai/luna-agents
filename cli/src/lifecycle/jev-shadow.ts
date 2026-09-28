import { createHash } from 'node:crypto';
import { lifecycleStates, type ReconcileResult, type RequirementState } from './types.js';

export const defaultJevEndpoint = 'https://api.typesafe.ai/v1/systemone';
export const defaultJevModel = 'jev-1.13.0';

type JsonRecord = Record<string, unknown>;

export interface JevShadowRequest {
    model: string;
    state: {
        project: string;
        operating_mode: 'shadow_only';
        deterministic_lifecycle: {
            scope: string | null;
            requirement_count: number;
            cycle_count: number;
            state_counts: Record<RequirementState, number>;
            claim_gap_count: number;
            stale_evidence_count: number;
            selected_cycles: Array<{
                id: string;
                state: RequirementState;
                requirement_count: number;
                checked_task_count: number;
                task_count: number;
                roadmap_checked: boolean;
                claim_mismatch: boolean;
            }>;
            selected_requirements: Array<{
                id: string;
                state: RequirementState;
                evidence_count: number;
                claim_mismatch: boolean;
            }>;
        };
        constraints: string[];
    };
    questions: {
        review_lane: {
            type: 'choice';
            instructions: string;
            criteria: Record<'observe_only' | 'human_review' | 'no_signal', string>;
        };
        claim_risk: {
            type: 'score';
            instructions: string;
            criteria: string[];
        };
        needs_human_review: {
            type: 'noul';
            instructions: string;
            criteria: { true: string; false: string };
        };
    };
}

export interface JevChoiceAnswer {
    type: 'choice';
    choice: 'observe_only' | 'human_review' | 'no_signal';
    probabilities: Record<string, number>;
    confidence: number;
}

export interface JevScoreAnswer {
    type: 'score';
    score: number;
    probabilities: Record<string, number>;
    confidence: number;
    legend?: Record<string, string>;
}

export interface JevNoulAnswer {
    type: 'noul';
    noul: number;
}

export interface JevShadowObservation {
    schemaVersion: 'lunaos.ai/jev-shadow-observation/v1';
    mode: 'shadow';
    authoritative: false;
    applied: false;
    status: 'planned' | 'observed' | 'unavailable';
    provider: 'typesafe';
    endpoint: string;
    requestedModel: string;
    observedModel?: string;
    observedAt: string;
    snapshotDigest: string;
    request?: JevShadowRequest;
    answers?: {
        review_lane: JevChoiceAnswer;
        claim_risk: JevScoreAnswer;
        needs_human_review: JevNoulAnswer;
    };
    usage?: { input_tokens?: number; output_tokens?: number };
    unavailableReason?: 'missing_api_key' | 'invalid_endpoint' | 'timeout'
        | 'network_error' | 'invalid_response' | `http_${number}`;
}

export function buildJevShadowRequest(
    result: ReconcileResult,
    options: { scope?: string; model?: string } = {},
): JevShadowRequest {
    const scope = options.scope?.trim() || undefined;
    const normalizedScope = scope?.toUpperCase();
    const stateCounts = Object.fromEntries(lifecycleStates.map(state => [
        state,
        result.manifest.requirements.filter(requirement => requirement.state === state).length,
    ])) as Record<RequirementState, number>;
    const selectedCycles = result.manifest.cycles
        .filter(cycle => matchesScope(cycle.id, cycle.title, normalizedScope))
        .map(cycle => ({
            id: cycle.id,
            state: cycle.state,
            requirement_count: cycle.requirementIds.length,
            checked_task_count: cycle.checkedTaskCount,
            task_count: cycle.taskCount,
            roadmap_checked: cycle.roadmapChecked,
            claim_mismatch: cycle.claimMismatch,
        }));
    const selectedRequirements = result.manifest.requirements
        .filter(requirement => matchesScope(requirement.id, requirement.title, normalizedScope))
        .map(requirement => ({
            id: requirement.id,
            state: requirement.state,
            evidence_count: requirement.evidenceIds.length,
            claim_mismatch: requirement.state !== 'DONE'
                && (requirement.claims.requirementChecked
                    || requirement.claims.completedTaskIds.length > 0),
        }));

    return {
        model: options.model || defaultJevModel,
        state: {
            project: result.manifest.project,
            operating_mode: 'shadow_only',
            deterministic_lifecycle: {
                scope: scope || null,
                requirement_count: result.manifest.requirements.length,
                cycle_count: result.manifest.cycles.length,
                state_counts: stateCounts,
                claim_gap_count: result.gaps.filter(gap => gap.claimMismatch).length,
                stale_evidence_count: result.evidence.filter(evidence => !evidence.valid).length,
                selected_cycles: selectedCycles,
                selected_requirements: selectedRequirements,
            },
            constraints: [
                'Jev output cannot change lifecycle state or evidence.',
                'Jev output cannot authorize an action or bypass a human approval.',
                'Jev output cannot make sanctions, AML screening, eligibility, or policy decisions.',
                'GitHub, code, deterministic rules, signed receipts, and humans remain authoritative.',
            ],
        },
        questions: {
            review_lane: {
                type: 'choice',
                instructions: 'Which observation lane best describes the supplied lifecycle state?',
                criteria: {
                    observe_only: 'Record a low-risk comparison signal; no human escalation is indicated.',
                    human_review: 'Flag the existing deterministic mismatch for human review without taking action.',
                    no_signal: 'The supplied state does not support a useful shadow observation.',
                },
            },
            claim_risk: {
                type: 'score',
                instructions: 'Rate the risk of trusting completion claims without current lifecycle evidence.',
                criteria: [
                    'Low: current evidence supports the completion claim.',
                    'Moderate: some evidence is missing or stale.',
                    'High: completion is claimed while material evidence is missing or stale.',
                    'Critical: an automatic irreversible action is occurring.',
                ],
            },
            needs_human_review: {
                type: 'noul',
                instructions: 'Does the supplied roadmap-versus-evidence state warrant human review?',
                criteria: {
                    true: 'A person should review the deterministic mismatch before any mutation.',
                    false: 'The deterministic state contains no mismatch that needs a person to review.',
                },
            },
        },
    };
}

export async function observeLifecycleWithJev(options: {
    result: ReconcileResult;
    scope?: string;
    model?: string;
    endpoint?: string;
    apiKey?: string;
    timeoutMs?: number;
    dryRun?: boolean;
    fetchImpl?: typeof fetch;
    now?: Date;
}): Promise<JevShadowObservation> {
    const request = buildJevShadowRequest(options.result, {
        scope: options.scope,
        model: options.model,
    });
    const endpoint = normalizeEndpoint(options.endpoint || defaultJevEndpoint);
    const base = {
        schemaVersion: 'lunaos.ai/jev-shadow-observation/v1' as const,
        mode: 'shadow' as const,
        authoritative: false as const,
        applied: false as const,
        provider: 'typesafe' as const,
        endpoint: endpoint?.toString() || 'invalid',
        requestedModel: request.model,
        observedAt: (options.now || new Date()).toISOString(),
        snapshotDigest: digest(request.state),
    };
    if (!endpoint) return { ...base, status: 'unavailable', unavailableReason: 'invalid_endpoint' };
    if (options.dryRun) return { ...base, status: 'planned', request };
    if (!options.apiKey) return { ...base, status: 'unavailable', unavailableReason: 'missing_api_key' };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 15_000);
    try {
        const response = await (options.fetchImpl || fetch)(endpoint, {
            method: 'POST',
            redirect: 'error',
            headers: {
                Authorization: `Bearer ${options.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
            signal: controller.signal,
        });
        if (!response.ok) {
            return { ...base, status: 'unavailable', unavailableReason: `http_${response.status}` };
        }
        const payload = await response.json() as unknown;
        const parsed = parseResponse(payload);
        if (!parsed) return { ...base, status: 'unavailable', unavailableReason: 'invalid_response' };
        return {
            ...base,
            status: 'observed',
            observedModel: parsed.model,
            answers: parsed.answers,
            ...(parsed.usage ? { usage: parsed.usage } : {}),
        };
    } catch (error) {
        return {
            ...base,
            status: 'unavailable',
            unavailableReason: isAbort(error) ? 'timeout' : 'network_error',
        };
    } finally {
        clearTimeout(timer);
    }
}

function parseResponse(value: unknown): {
    model: string;
    answers: NonNullable<JevShadowObservation['answers']>;
    usage?: JevShadowObservation['usage'];
} | null {
    if (!isRecord(value) || typeof value.model !== 'string' || !isRecord(value.answers)) return null;
    const reviewLane = parseChoice(value.answers.review_lane);
    const claimRisk = parseScore(value.answers.claim_risk);
    const needsHumanReview = parseNoul(value.answers.needs_human_review);
    if (!reviewLane || !claimRisk || !needsHumanReview) return null;
    const usage = isRecord(value.usage) ? {
        ...(isNonNegativeInteger(value.usage.input_tokens)
            ? { input_tokens: value.usage.input_tokens } : {}),
        ...(isNonNegativeInteger(value.usage.output_tokens)
            ? { output_tokens: value.usage.output_tokens } : {}),
    } : undefined;
    return {
        model: value.model,
        answers: {
            review_lane: reviewLane,
            claim_risk: claimRisk,
            needs_human_review: needsHumanReview,
        },
        ...(usage && Object.keys(usage).length ? { usage } : {}),
    };
}

function parseChoice(value: unknown): JevChoiceAnswer | null {
    const choices = ['observe_only', 'human_review', 'no_signal'] as const;
    if (!isRecord(value) || value.type !== 'choice'
        || !choices.includes(value.choice as typeof choices[number])
        || !validProbability(value.confidence) || !validProbabilities(value.probabilities)) return null;
    const probabilities = value.probabilities;
    if (!choices.every(choice => Object.hasOwn(probabilities, choice))) return null;
    return {
        type: 'choice',
        choice: value.choice as JevChoiceAnswer['choice'],
        confidence: value.confidence,
        probabilities,
    };
}

function parseScore(value: unknown): JevScoreAnswer | null {
    if (!isRecord(value) || value.type !== 'score' || typeof value.score !== 'number'
        || !Number.isFinite(value.score) || value.score < 0 || value.score > 3
        || !validProbability(value.confidence) || !validProbabilities(value.probabilities)) return null;
    const probabilities = value.probabilities;
    if (!['0', '1', '2', '3'].every(level => Object.hasOwn(probabilities, level))) return null;
    const legend = isRecord(value.legend) && Object.values(value.legend).every(item => typeof item === 'string')
        ? value.legend as Record<string, string>
        : undefined;
    return {
        type: 'score', score: value.score, confidence: value.confidence,
        probabilities,
        ...(legend ? { legend } : {}),
    };
}

function parseNoul(value: unknown): JevNoulAnswer | null {
    if (!isRecord(value) || value.type !== 'noul' || !validProbability(value.noul)) return null;
    return { type: 'noul', noul: value.noul };
}

function matchesScope(id: string, title: string, scope?: string): boolean {
    if (!scope) return false;
    if (id.toUpperCase() === scope) return true;
    const looksLikeStableId = /^(?:[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+|P\d+(?:\.\d+)*)$/.test(scope);
    return !looksLikeStableId && title.toUpperCase().includes(scope);
}

function normalizeEndpoint(value: string): URL | null {
    try {
        const endpoint = new URL(value);
        const official = new URL(defaultJevEndpoint);
        if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password
            || endpoint.origin !== official.origin || endpoint.pathname !== official.pathname
            || endpoint.search || endpoint.hash) return null;
        return endpoint;
    } catch {
        return null;
    }
}

function validProbability(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}

function validProbabilities(value: unknown): value is Record<string, number> {
    return isRecord(value) && Object.keys(value).length > 0
        && Object.values(value).every(validProbability);
}

function isRecord(value: unknown): value is JsonRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isAbort(error: unknown): boolean {
    return error instanceof Error && error.name === 'AbortError';
}

function digest(value: unknown): string {
    return `sha256:${createHash('sha256').update(JSON.stringify(value)).digest('hex')}`;
}
