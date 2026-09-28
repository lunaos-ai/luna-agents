import { appendFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type {
    EvidenceRecord,
    LifecycleManifest,
    StateTransition,
} from './types.js';

export class LifecycleStore {
    readonly directory: string;
    readonly manifestFile: string;
    readonly evidenceFile: string;
    readonly historyFile: string;
    readonly syncFile: string;

    constructor(readonly root: string) {
        this.directory = path.join(root, '.luna', 'lifecycle');
        this.manifestFile = path.join(this.directory, 'requirements.json');
        this.evidenceFile = path.join(this.directory, 'evidence.jsonl');
        this.historyFile = path.join(this.directory, 'history.jsonl');
        this.syncFile = path.join(this.directory, 'github-sync.json');
    }

    async readManifest(): Promise<LifecycleManifest | null> {
        return readJson<LifecycleManifest>(this.manifestFile);
    }

    async readEvidence(): Promise<EvidenceRecord[]> {
        return readJsonLines<EvidenceRecord>(this.evidenceFile);
    }

    async readHistory(): Promise<StateTransition[]> {
        return readJsonLines<StateTransition>(this.historyFile);
    }

    async writeManifest(manifest: LifecycleManifest): Promise<void> {
        await writeJsonAtomic(this.manifestFile, manifest);
    }

    async appendEvidence(record: EvidenceRecord): Promise<void> {
        await appendJsonLine(this.evidenceFile, record);
    }

    async appendTransitions(transitions: StateTransition[]): Promise<void> {
        if (!transitions.length) return;
        await mkdir(this.directory, { recursive: true, mode: 0o700 });
        const lines = transitions.map(transition => JSON.stringify(transition)).join('\n');
        await appendFile(this.historyFile, `${lines}\n`, { encoding: 'utf8', mode: 0o600 });
    }

    async writeSyncReceipt(value: Record<string, unknown>): Promise<void> {
        await writeJsonAtomic(this.syncFile, value);
    }
}

async function readJson<T>(file: string): Promise<T | null> {
    try {
        return JSON.parse(await readFile(file, 'utf8')) as T;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
        throw error;
    }
}

async function readJsonLines<T>(file: string): Promise<T[]> {
    try {
        return (await readFile(file, 'utf8')).split(/\r?\n/)
            .filter(Boolean)
            .map(line => JSON.parse(line) as T);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
        throw error;
    }
}

async function writeJsonAtomic(file: string, value: unknown): Promise<void> {
    await mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
    const temporary = `${file}.tmp-${process.pid}-${Date.now()}`;
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
    await rename(temporary, file);
}

async function appendJsonLine(file: string, value: unknown): Promise<void> {
    await mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
    await appendFile(file, `${JSON.stringify(value)}\n`, { encoding: 'utf8', mode: 0o600 });
}
