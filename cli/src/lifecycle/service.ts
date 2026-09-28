import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { buildCycles, reconcileRequirementStates } from './domain.js';
import { createEvidenceRecord, validateEvidence } from './evidence.js';
import {
    parsePlanMarkdown,
    parseRequirementsMarkdown,
    parseRoadmapMarkdown,
    type ParsedCycle,
    type ParsedRequirement,
} from './markdown.js';
import { LifecycleStore } from './store.js';
import type {
    EvidenceKind,
    EvidenceRecord,
    LifecycleGap,
    LifecycleManifest,
    PlanTask,
    ReconcileResult,
    RequirementRecord,
    StateTransition,
    ValidatedEvidence,
} from './types.js';

export interface ReconcileOptions {
    root: string;
    dryRun?: boolean;
    now?: Date;
    additionalEvidence?: EvidenceRecord[];
}

export async function reconcileProject(options: ReconcileOptions): Promise<ReconcileResult> {
    const root = path.resolve(options.root);
    const now = options.now || new Date();
    const store = new LifecycleStore(root);
    const previous = await store.readManifest();
    const artifactFiles = await discoverArtifactFiles(root);
    const parsedRequirements: ParsedRequirement[] = [];
    const tasks: PlanTask[] = [];
    const cycleDefinitions: ParsedCycle[] = [];

    for (const file of artifactFiles.requirements) {
        const relative = relativeToRoot(root, file);
        parsedRequirements.push(...parseRequirementsMarkdown(await readFile(file, 'utf8'), relative));
    }
    for (const file of artifactFiles.plans) {
        const relative = relativeToRoot(root, file);
        const parsed = parsePlanMarkdown(await readFile(file, 'utf8'), relative);
        tasks.push(...parsed.tasks);
        cycleDefinitions.push(...parsed.cycles);
    }
    for (const file of artifactFiles.roadmaps) {
        const relative = relativeToRoot(root, file);
        cycleDefinitions.push(...parseRoadmapMarkdown(await readFile(file, 'utf8'), relative));
    }

    const requirements = assignStableIds({
        project: path.basename(root),
        parsed: deduplicateParsedRequirements(parsedRequirements),
        previous: previous?.requirements || [],
        tasks,
    });
    const rawEvidence = [
        ...await store.readEvidence(),
        ...(options.additionalEvidence || []),
        ...await discoverVerificationEvidence({
            root,
            files: artifactFiles.verifications,
            requirementIds: new Set(requirements.map(requirement => requirement.id)),
        }),
    ];
    const evidence = await Promise.all(rawEvidence.map(record => validateEvidence(record, root, now)));
    const reconciled = reconcileRequirementStates({
        requirements,
        evidence,
        previous: previous?.requirements,
        occurredAt: now.toISOString(),
    });
    const cycles = buildCycles({
        cycleDefinitions: mergeCycleDefinitions(cycleDefinitions),
        tasks,
        requirements: reconciled.requirements,
    });
    const manifest: LifecycleManifest = {
        schemaVersion: 'lunaos.ai/requirements-lifecycle/v1',
        project: path.basename(root),
        generatedAt: now.toISOString(),
        sourceFiles: [
            ...artifactFiles.requirements,
            ...artifactFiles.plans,
            ...artifactFiles.roadmaps,
            ...artifactFiles.verifications,
        ]
            .map(file => relativeToRoot(root, file)).sort(),
        requirements: reconciled.requirements,
        cycles,
    };

    if (!options.dryRun) {
        await store.writeManifest(manifest);
        await store.appendTransitions(reconciled.transitions);
    }
    return {
        manifest,
        evidence,
        transitions: reconciled.transitions,
        gaps: reconciled.gaps,
        bootstrapped: previous === null,
        dryRun: Boolean(options.dryRun),
    };
}

export async function addRequirementEvidence(options: {
    root: string;
    requirementId: string;
    kind: EvidenceKind;
    source: string;
    note?: string;
    digest?: string;
    observedAt?: string;
    expiresAt?: string;
    attested?: boolean;
    dryRun?: boolean;
}): Promise<{ added: boolean; record: EvidenceRecord; reconcile: ReconcileResult }> {
    const root = path.resolve(options.root);
    const before = await reconcileProject({ root, dryRun: true });
    const requirementId = options.requirementId.toUpperCase();
    if (!before.manifest.requirements.some(requirement => requirement.id === requirementId)) {
        throw new Error(`Unknown requirement ID: ${requirementId}`);
    }
    const record = await createEvidenceRecord({ ...options, root, requirementId });
    const store = new LifecycleStore(root);
    const existing = await store.readEvidence();
    const duplicate = existing.find(item => sameEvidence(item, record));
    const selected = duplicate || record;
    if (!options.dryRun && !duplicate) await store.appendEvidence(record);
    const reconcile = await reconcileProject({
        root,
        dryRun: options.dryRun,
        additionalEvidence: options.dryRun && !duplicate ? [record] : [],
    });
    return { added: !duplicate, record: selected, reconcile };
}

export async function verifyRequirement(options: {
    root: string;
    requirementId: string;
}): Promise<{
    requirement: RequirementRecord;
    evidence: ValidatedEvidence[];
    gap?: LifecycleGap;
    history: StateTransition[];
}> {
    const root = path.resolve(options.root);
    const result = await reconcileProject({ root, dryRun: true });
    const id = options.requirementId.toUpperCase();
    const requirement = result.manifest.requirements.find(item => item.id === id);
    if (!requirement) throw new Error(`Unknown requirement ID: ${id}`);
    const store = new LifecycleStore(root);
    return {
        requirement,
        evidence: result.evidence.filter(item => item.requirementId === id),
        gap: result.gaps.find(item => item.requirementId === id),
        history: (await store.readHistory()).filter(item => item.requirementId === id),
    };
}

function assignStableIds(options: {
    project: string;
    parsed: ReturnType<typeof parseRequirementsMarkdown>;
    previous: RequirementRecord[];
    tasks: PlanTask[];
}): RequirementRecord[] {
    const previousByExplicit = new Map(options.previous.filter(item => item.explicitId)
        .map(item => [item.id, item]));
    const previousByTitle = new Map(options.previous
        .map(item => [`${item.source.path}\0${normalize(item.title)}`, item]));
    const previousByOrdinal = new Map(options.previous
        .map(item => [`${item.source.path}\0${item.source.ordinal}`, item]));
    const used = new Set<string>();

    return options.parsed.map(item => {
        const old = item.explicitId
            ? previousByExplicit.get(item.explicitId)
            : previousByTitle.get(`${item.source.path}\0${normalize(item.title)}`)
                || previousByOrdinal.get(`${item.source.path}\0${item.source.ordinal}`);
        let id = item.explicitId || old?.id || generatedId(options.project, item.source.path, item.title);
        if (used.has(id)) id = `${id}-${shortHash(`${item.source.path}:${item.source.line}`)}`;
        used.add(id);
        const relatedTasks = options.tasks.filter(task => task.requirementIds.includes(id));
        return {
            id,
            title: item.title,
            description: item.description,
            explicitId: Boolean(item.explicitId),
            source: item.source,
            cycleIds: unique(relatedTasks.map(task => task.cycleId)),
            taskIds: unique(relatedTasks.map(task => task.id)),
            evidenceIds: old?.evidenceIds || [],
            state: old?.state || 'PLANNED',
            claims: {
                requirementChecked: item.source.checked,
                completedTaskIds: relatedTasks.filter(task => task.checked).map(task => task.id),
            },
        };
    }).sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true }));
}

async function discoverArtifactFiles(root: string): Promise<{
    requirements: string[];
    plans: string[];
    roadmaps: string[];
    verifications: string[];
}> {
    const luna = path.join(root, '.luna');
    const files = await walk(luna);
    const planning = await walk(path.join(root, '.planning'));
    return {
        requirements: [
            ...files.filter(file => path.basename(file).toLowerCase() === 'requirements.md'),
            ...planning.filter(file => path.relative(path.join(root, '.planning'), file).split(path.sep).length === 1
                && path.basename(file).toLowerCase() === 'requirements.md'),
        ].sort((left, right) => left.startsWith(luna) === right.startsWith(luna)
            ? left.localeCompare(right)
            : left.startsWith(luna) ? -1 : 1),
        plans: files.filter(file => ['implementation-plan.md', 'tasks.md'].includes(path.basename(file))).sort(),
        roadmaps: planning.filter(file => path.relative(path.join(root, '.planning'), file).split(path.sep).length === 1
            && path.basename(file).toLowerCase() === 'roadmap.md').sort(),
        verifications: [
            ...planning.filter(file => /verification.*\.md$/i.test(path.basename(file))),
            ...files.filter(file => /(?:verification|test-validation).*\.md$/i.test(path.basename(file))),
        ].sort(),
    };
}

async function walk(directory: string): Promise<string[]> {
    let entries;
    try {
        entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
        throw error;
    }
    const files: string[] = [];
    for (const entry of entries) {
        if (entry.name === 'lifecycle') continue;
        const resolved = path.join(directory, entry.name);
        if (entry.isDirectory()) files.push(...await walk(resolved));
        else if (entry.isFile()) files.push(resolved);
    }
    return files;
}

function generatedId(project: string, sourcePath: string, title: string): string {
    const prefix = project.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toUpperCase().slice(0, 12) || 'PROJECT';
    return `REQ-${prefix}-${shortHash(`${sourcePath}\0${normalize(title)}`, 8)}`;
}

function sameEvidence(left: EvidenceRecord, right: EvidenceRecord): boolean {
    return left.requirementId === right.requirementId
        && left.kind === right.kind
        && left.source.type === right.source.type
        && left.source.locator === right.source.locator
        && left.source.digest === right.source.digest
        && left.source.revision === right.source.revision
        && left.attested === right.attested
        && left.expiresAt === right.expiresAt
        && left.status === 'active';
}

function relativeToRoot(root: string, file: string): string {
    return path.relative(root, file).split(path.sep).join('/');
}

function normalize(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function shortHash(value: string, length = 6): string {
    return createHash('sha256').update(value).digest('hex').slice(0, length).toUpperCase();
}

function unique<T>(values: T[]): T[] {
    return [...new Set(values)];
}

function deduplicateParsedRequirements(values: ParsedRequirement[]): ParsedRequirement[] {
    const explicit = new Set<string>();
    return values.filter(value => {
        if (!value.explicitId) return true;
        if (explicit.has(value.explicitId)) return false;
        explicit.add(value.explicitId);
        return true;
    });
}

function mergeCycleDefinitions(values: ParsedCycle[]): ParsedCycle[] {
    const merged = new Map<string, ParsedCycle>();
    for (const value of values) {
        const current = merged.get(value.id);
        merged.set(value.id, current ? {
            ...current,
            title: current.title || value.title,
            checked: Boolean(current.checked || value.checked),
            requirementIds: unique([
                ...(current.requirementIds || []),
                ...(value.requirementIds || []),
            ]),
        } : value);
    }
    return [...merged.values()];
}

async function discoverVerificationEvidence(options: {
    root: string;
    files: string[];
    requirementIds: Set<string>;
}): Promise<EvidenceRecord[]> {
    const records: EvidenceRecord[] = [];
    for (const file of options.files) {
        const content = await readFile(file, 'utf8');
        const status = content.match(/^status:\s*([^\s]+)\s*$/mi)?.[1]?.toLowerCase();
        if (!['pass', 'passed', 'verified', 'success'].includes(status || '')) continue;
        const identifiers = new Set<string>();
        const passed = content.match(/^passed:\s*\[([^\]]+)\]/mi)?.[1] || '';
        for (const id of passed.match(/[A-Z][A-Z0-9]{1,11}-\d{1,5}/g) || []) identifiers.add(id);
        for (const line of content.split(/\r?\n/)) {
            const row = line.match(/^\s*\|\s*([A-Z][A-Z0-9]{1,11}-\d{1,5})\s*\|\s*(PASS|PASSED|VERIFIED|SUCCESS)\b/i);
            if (row) identifiers.add(row[1].toUpperCase());
        }
        const relevant = [...identifiers].filter(id => options.requirementIds.has(id));
        if (!relevant.length) continue;
        const revision = content.match(/^source_revision:\s*([0-9a-f]{40})\s*$/mi)?.[1]
            || content.match(/candidate[^`\n]*`([0-9a-f]{40})`/i)?.[1]
            || 'unbound';
        const verifiedAt = content.match(/^verified:\s*([^\s]+)\s*$/mi)?.[1];
        const modifiedAt = (await stat(file)).mtime.toISOString();
        const observedAt = verifiedAt && !Number.isNaN(Date.parse(verifiedAt)) ? verifiedAt : modifiedAt;
        const source = `file:${relativeToRoot(options.root, file)}`;
        for (const requirementId of relevant) {
            for (const kind of ['implementation', 'verification'] as const) {
                records.push(await createEvidenceRecord({
                    root: options.root,
                    requirementId,
                    kind,
                    source,
                    sourceRevision: revision,
                    observedAt,
                    note: 'Imported from a repository verification report',
                }));
            }
        }
    }
    return records;
}
