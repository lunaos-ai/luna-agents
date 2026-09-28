import { afterEach, describe, expect, it } from 'vitest';
import { access, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { reconcileProject, addRequirementEvidence } from '../src/lifecycle/service.js';
import { LifecycleStore } from '../src/lifecycle/store.js';
import { buildDrafts, syncLifecycleWorkItems } from '../src/lifecycle/sync.js';
import type { WorkItem, WorkItemDraft, WorkItemProvider } from '../src/lifecycle/types.js';
import { createCommandExecutor, toPipeStep } from '../src/pipe/commands.js';
import { executeLifecycleVerb } from '../src/lifecycle/verbs.js';
import { buildJevShadowRequest, observeLifecycleWithJev } from '../src/lifecycle/jev-shadow.js';

const fixtureRoots: string[] = [];

afterEach(async () => {
    await Promise.all(fixtureRoots.splice(0).map(root => rm(root, { recursive: true, force: true })));
});

class MemoryWorkItems implements WorkItemProvider {
    items: WorkItem[] = [];
    createCount = 0;

    async list(): Promise<WorkItem[]> { return this.items.map(item => ({ ...item })); }

    async create(draft: WorkItemDraft): Promise<WorkItem> {
        this.createCount++;
        const number = this.items.length + 1;
        const item: WorkItem = {
            providerId: 'memory', number, title: draft.title, body: draft.body,
            state: 'open', url: `https://example.test/issues/${number}`,
        };
        this.items.push(item);
        return { ...item };
    }

    async update(item: WorkItem, draft: WorkItemDraft): Promise<WorkItem> {
        return this.replace(item.number, { ...item, title: draft.title, body: draft.body });
    }

    async setState(item: WorkItem, state: 'open' | 'closed'): Promise<WorkItem> {
        return this.replace(item.number, { ...item, state });
    }

    private replace(number: number, item: WorkItem): WorkItem {
        const index = this.items.findIndex(candidate => candidate.number === number);
        this.items[index] = item;
        return { ...item };
    }
}

describe('requirements lifecycle', () => {
    it('does not let a closed provider issue mark a requirement DONE', async () => {
        const root = await fixtureProject();
        const reconciled = await reconcileProject({ root, dryRun: true });
        expect(reconciled.manifest.requirements[0].state).toBe('PLANNED');

        const provider = new MemoryWorkItems();
        provider.items.push({
            providerId: 'memory', number: 42, title: '[REQ-001] Ship widget',
            body: '<!-- luna:item:requirement:REQ-001 -->\nclosed by a human',
            state: 'closed', url: 'https://example.test/issues/42',
        });
        const sync = await syncLifecycleWorkItems({
            provider, manifest: reconciled.manifest, repository: 'acme/demo', dryRun: true,
            scope: 'REQ-001',
        });

        expect(sync.actions.some(action => action.kind === 'reopen')).toBe(true);
        expect(sync.staleClosures).toEqual([
            { key: 'requirement:REQ-001', issueNumber: 42, state: 'PLANNED' },
        ]);
        expect(reconciled.manifest.requirements[0].state).not.toBe('DONE');
    });

    it('is idempotent and creates no duplicate provider issues on repeated sync', async () => {
        const root = await fixtureProject();
        const reconciled = await reconcileProject({ root, dryRun: true });
        const provider = new MemoryWorkItems();

        const first = await syncLifecycleWorkItems({
            provider, manifest: reconciled.manifest, repository: 'acme/demo', dryRun: false,
        });
        const second = await syncLifecycleWorkItems({
            provider, manifest: reconciled.manifest, repository: 'acme/demo', dryRun: false,
        });

        expect(first.actions.filter(action => action.kind === 'create')).toHaveLength(2);
        expect(provider.createCount).toBe(2);
        expect(provider.items).toHaveLength(2);
        expect(second.actions).toEqual([]);
    });

    it('regresses stale evidence while preserving append-only transition history', async () => {
        const root = await fixtureProject(false);
        const artifact = path.join(root, 'src', 'widget.ts');
        await mkdir(path.dirname(artifact), { recursive: true });
        await writeFile(artifact, 'export const widget = true;\n');
        await reconcileProject({ root });

        const added = await addRequirementEvidence({
            root, requirementId: 'REQ-001', kind: 'implementation', source: 'file:src/widget.ts',
        });
        expect(added.reconcile.manifest.requirements[0].state).toBe('IMPLEMENTED');

        await writeFile(artifact, 'export const widget = false;\n');
        const regressed = await reconcileProject({ root });
        expect(regressed.manifest.requirements[0].state).toBe('PLANNED');

        const history = await new LifecycleStore(root).readHistory();
        expect(history.some(item => item.from === 'PLANNED' && item.to === 'IMPLEMENTED')).toBe(true);
        expect(history.at(-1)).toMatchObject({
            requirementId: 'REQ-001', from: 'IMPLEMENTED', to: 'PLANNED',
        });
        expect(history.at(-1)?.reason).toMatch(/digest changed|no longer valid/);
    });

    it('bootstraps existing .luna artifacts without overwriting them', async () => {
        const root = await fixtureProject();
        const requirementFile = path.join(root, '.luna', 'demo', 'requirements.md');
        const before = await readFile(requirementFile, 'utf8');

        const result = await reconcileProject({ root });

        expect(result.bootstrapped).toBe(true);
        expect(await readFile(requirementFile, 'utf8')).toBe(before);
        expect(JSON.parse(await readFile(
            path.join(root, '.luna', 'lifecycle', 'requirements.json'), 'utf8',
        ))).toMatchObject({ schemaVersion: 'lunaos.ai/requirements-lifecycle/v1' });
    });

    it('keeps generated requirement IDs stable when requirement wording changes', async () => {
        const root = await fixtureProject(false);
        const requirementFile = path.join(root, '.luna', 'demo', 'requirements.md');
        await writeFile(requirementFile, '- [ ] **Ship widget:** The widget must ship safely.\n');
        const first = await reconcileProject({ root });

        await writeFile(requirementFile, '- [ ] **Ship safer widget:** The widget must ship safely.\n');
        const second = await reconcileProject({ root, dryRun: true });

        expect(first.manifest.requirements[0].explicitId).toBe(false);
        expect(second.manifest.requirements[0].id).toBe(first.manifest.requirements[0].id);
    });

    it('previews evidence-derived advancement without writing sidecars in dry-run mode', async () => {
        const root = await fixtureProject(false);
        const artifact = path.join(root, 'src', 'widget.ts');
        await mkdir(path.dirname(artifact), { recursive: true });
        await writeFile(artifact, 'export const widget = true;\n');

        const preview = await addRequirementEvidence({
            root,
            requirementId: 'REQ-001',
            kind: 'implementation',
            source: 'file:src/widget.ts',
            dryRun: true,
        });

        expect(preview.added).toBe(true);
        expect(preview.reconcile.manifest.requirements[0].state).toBe('IMPLEMENTED');
        await expect(access(path.join(root, '.luna', 'lifecycle'))).rejects.toMatchObject({ code: 'ENOENT' });
    });

    it('keeps direct CLI verbs and pipe verbs conformant', async () => {
        const root = await fixtureProject();
        const direct = await executeLifecycleVerb('gaps', [], {
            cwd: root, forceDryRun: true,
        });
        const execute = createCommandExecutor({ cwd: root, dryRun: true });
        const piped = await execute(toPipeStep({
            type: 'command', id: 'step-1-gaps', command: 'gaps', args: [],
        }, root), {
            runId: 'test-run', workflow: 'test', repository: root,
            actor: { id: 'tester', type: 'operator', provider: 'luna' },
        });
        expect(piped).toEqual(direct);
    });

    it('detects a checked roadmap phase whose evidence-derived state is still open', async () => {
        const root = await fixtureProject(false);
        const planning = path.join(root, '.planning');
        await mkdir(planning, { recursive: true });
        await writeFile(path.join(planning, 'ROADMAP.md'), [
            '# Roadmap',
            '',
            '- [x] **Phase 1: Widget launch** - claimed complete',
            '',
            '### Phase 1: Widget launch',
            '**Requirements**: REQ-001',
        ].join('\n'));

        const result = await reconcileProject({ root, dryRun: true });
        expect(result.manifest.cycles.find(cycle => cycle.id === 'PHASE-1')).toMatchObject({
            roadmapChecked: true,
            requirementIds: ['REQ-001'],
            state: 'PLANNED',
            claimMismatch: true,
        });
    });

    it('ships a real requirements analyzer rather than the former post-launch agent', async () => {
        const agent = await readFile(path.resolve(
            import.meta.dirname, '../../agents/luna-requirements-analyzer.md',
        ), 'utf8');
        expect(agent).toContain('# Luna Requirements Analyzer Agent');
        expect(agent).toMatch(/stable requirement IDs/i);
        expect(agent).not.toContain('# Luna Post-Launch Review Agent');
    });

    it('keeps GitHub apply behind the existing pipe governance boundary', () => {
        const apply = toPipeStep({
            type: 'command', id: 'sync-1', command: 'sync-github', args: ['--apply'],
        }, '/repo');
        const preview = toPipeStep({
            type: 'command', id: 'sync-2', command: 'sync-github', args: ['--dry-run'],
        }, '/repo');
        expect(apply).toMatchObject({ verb: 'github.sync', environment: 'remote', riskScore: 65 });
        expect(preview).toMatchObject({ verb: 'github.read', environment: 'remote', riskScore: 0 });
    });

    it('keeps live Jev observation behind pipe governance while dry-run stays local', () => {
        const live = toPipeStep({
            type: 'command', id: 'jev-1', command: 'jev-shadow', args: ['REQ-001'],
        }, '/repo');
        const preview = toPipeStep({
            type: 'command', id: 'jev-2', command: 'jev-shadow', args: ['REQ-001', '--dry-run'],
        }, '/repo');
        expect(live).toMatchObject({ verb: 'jev.shadow', environment: 'remote', riskScore: 20 });
        expect(preview).toMatchObject({ verb: 'jev.plan', environment: 'local', riskScore: 0 });
    });

    it('builds a sanitized Jev shadow request without granting authority', async () => {
        const root = await fixtureProject();
        const reconciled = await reconcileProject({ root, dryRun: true });
        const before = JSON.stringify(reconciled.manifest);
        const request = buildJevShadowRequest(reconciled, { scope: 'REQ-001' });
        const observation = await observeLifecycleWithJev({
            result: reconciled,
            scope: 'REQ-001',
            dryRun: true,
            now: new Date('2026-09-28T10:00:00.000Z'),
        });

        expect(request.state.deterministic_lifecycle.selected_requirements).toEqual([
            expect.objectContaining({ id: 'REQ-001', state: 'PLANNED' }),
        ]);
        expect(JSON.stringify(request)).not.toContain('Ship widget');
        expect(JSON.stringify(request)).not.toContain('.luna/demo/requirements.md');
        expect(observation).toMatchObject({
            status: 'planned', mode: 'shadow', authoritative: false, applied: false,
        });
        expect(JSON.stringify(reconciled.manifest)).toBe(before);
    });

    it('validates typed Jev answers and never exposes the API key', async () => {
        const root = await fixtureProject();
        const reconciled = await reconcileProject({ root, dryRun: true });
        let authorization = '';
        const observation = await observeLifecycleWithJev({
            result: reconciled,
            scope: 'REQ-001',
            apiKey: 'test-secret-key',
            fetchImpl: async (_input, init) => {
                authorization = new Headers(init?.headers).get('authorization') || '';
                return new Response(JSON.stringify({
                    model: 'jev-1.13.0',
                    answers: {
                        review_lane: {
                            type: 'choice', choice: 'human_review', confidence: 0.96,
                            probabilities: { observe_only: 0.03, human_review: 0.97, no_signal: 0 },
                        },
                        claim_risk: {
                            type: 'score', score: 2, confidence: 0.99,
                            probabilities: { 0: 0, 1: 0, 2: 0.99, 3: 0.01 },
                        },
                        needs_human_review: { type: 'noul', noul: 0.95 },
                    },
                    usage: { input_tokens: 100, output_tokens: 20 },
                }), { status: 200, headers: { 'Content-Type': 'application/json' } });
            },
            now: new Date('2026-09-28T10:00:00.000Z'),
        });

        expect(authorization).toBe('Bearer test-secret-key');
        expect(observation).toMatchObject({
            status: 'observed', authoritative: false, applied: false,
            observedModel: 'jev-1.13.0',
            answers: {
                review_lane: { choice: 'human_review' },
                claim_risk: { score: 2 },
                needs_human_review: { noul: 0.95 },
            },
        });
        expect(JSON.stringify(observation)).not.toContain('test-secret-key');
    });

    it('degrades safely when Jev is unavailable or returns an invalid response', async () => {
        const root = await fixtureProject();
        const reconciled = await reconcileProject({ root, dryRun: true });
        const missing = await observeLifecycleWithJev({ result: reconciled });
        const invalid = await observeLifecycleWithJev({
            result: reconciled,
            apiKey: 'test-secret-key',
            fetchImpl: async () => new Response('{"answers":{}}', { status: 200 }),
        });
        const invalidEndpoint = await observeLifecycleWithJev({
            result: reconciled,
            endpoint: 'https://user:secret@example.test/v1/systemone',
            dryRun: true,
        });
        const alternateEndpoint = await observeLifecycleWithJev({
            result: reconciled,
            endpoint: 'https://example.test/v1/systemone',
            dryRun: true,
        });

        expect(missing).toMatchObject({ status: 'unavailable', unavailableReason: 'missing_api_key' });
        expect(invalid).toMatchObject({ status: 'unavailable', unavailableReason: 'invalid_response' });
        expect(invalidEndpoint).toMatchObject({
            status: 'unavailable', endpoint: 'invalid', unavailableReason: 'invalid_endpoint',
        });
        expect(alternateEndpoint).toMatchObject({
            status: 'unavailable', endpoint: 'invalid', unavailableReason: 'invalid_endpoint',
        });
        expect(JSON.stringify(invalidEndpoint)).not.toContain('secret');
        expect(missing.authoritative).toBe(false);
        expect(invalid.applied).toBe(false);
    });

    it('treats a stable sync scope as an exact ID rather than a prefix', async () => {
        const root = await fixtureProject(false);
        const reconciled = await reconcileProject({ root, dryRun: true });
        reconciled.manifest.requirements = [];
        reconciled.manifest.cycles = ['PHASE-6', 'PHASE-60'].map(id => ({
            id,
            title: id,
            requirementIds: [],
            taskIds: [],
            checkedTaskCount: 0,
            taskCount: 0,
            roadmapChecked: false,
            sourcePaths: [],
            state: 'PLANNED',
            claimMismatch: false,
        }));

        expect(buildDrafts(reconciled.manifest, 'PHASE-6').map(draft => draft.key))
            .toEqual(['cycle:PHASE-6']);
    });
});

async function fixtureProject(checked = true): Promise<string> {
    const root = await mkdtemp(path.join(os.tmpdir(), 'luna-lifecycle-'));
    fixtureRoots.push(root);
    const luna = path.join(root, '.luna', 'demo');
    await mkdir(luna, { recursive: true });
    await writeFile(path.join(luna, 'requirements.md'), [
        '# Requirements',
        '',
        `- [${checked ? 'x' : ' '}] **REQ-001 — Ship widget:** The widget must ship safely.`,
        '',
    ].join('\n'));
    await writeFile(path.join(luna, 'implementation-plan.md'), [
        '# Implementation Plan',
        '',
        '### P01 — Widget launch',
        '',
        `- [${checked ? 'x' : ' '}] **P01.1 — Implement widget**`,
        '  - **Requirements:** REQ-001',
        '',
    ].join('\n'));
    return root;
}
