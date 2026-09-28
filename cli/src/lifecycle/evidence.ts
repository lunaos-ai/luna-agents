import { createHash } from 'node:crypto';
import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import type {
    EvidenceKind,
    EvidenceRecord,
    EvidenceSource,
    ValidatedEvidence,
} from './types.js';

export async function createEvidenceRecord(options: {
    root: string;
    requirementId: string;
    kind: EvidenceKind;
    source: string;
    note?: string;
    digest?: string;
    observedAt?: string;
    expiresAt?: string;
    attested?: boolean;
    sourceRevision?: string;
}): Promise<EvidenceRecord> {
    const source = await normalizeEvidenceSource(options.root, options.source, options.digest);
    if (options.sourceRevision) source.revision = options.sourceRevision;
    const observedAt = options.observedAt || new Date().toISOString();
    const fingerprint = [
        options.requirementId.toUpperCase(), options.kind, source.type,
        source.locator, source.digest || '', source.revision || '', observedAt,
    ].join('\0');
    return {
        schemaVersion: 'lunaos.ai/requirement-evidence/v1',
        id: `EV-${sha256(fingerprint).slice(0, 16).toUpperCase()}`,
        requirementId: options.requirementId.toUpperCase(),
        kind: options.kind,
        source,
        observedAt,
        ...(options.expiresAt ? { expiresAt: options.expiresAt } : {}),
        status: 'active',
        attested: Boolean(options.attested) || source.type === 'file' || source.type === 'commit',
        ...(options.note ? { note: options.note } : {}),
    };
}

export async function validateEvidence(
    record: EvidenceRecord,
    root: string,
    now = new Date(),
): Promise<ValidatedEvidence> {
    if (record.status === 'revoked') return result(record, false, 'invalid', 'evidence was revoked');
    if (record.expiresAt && new Date(record.expiresAt).getTime() <= now.getTime()) {
        return result(record, false, 'stale', `evidence expired at ${record.expiresAt}`);
    }
    if (record.source.type === 'file') return validateFileEvidence(record, root);
    if (record.source.type === 'commit') {
        const exists = await gitObjectExists(root, record.source.locator);
        return exists
            ? result(record, true, 'valid', 'commit is present in the repository')
            : result(record, false, 'stale', 'referenced commit is not present');
    }
    if (!record.attested) {
        return result(record, false, 'invalid', `${record.source.type} evidence requires an explicit attestation`);
    }
    return result(record, true, 'valid', `${record.source.type} evidence is explicitly attested`);
}

async function validateFileEvidence(record: EvidenceRecord, root: string): Promise<ValidatedEvidence> {
    const resolved = resolveInsideRoot(root, record.source.locator);
    if (!resolved) return result(record, false, 'invalid', 'file evidence escapes the project root');
    try {
        const details = await stat(resolved);
        if (!details.isFile() && !details.isDirectory()) {
            return result(record, false, 'invalid', 'file evidence is not a regular file or directory');
        }
        if (record.source.digest) {
            if (!details.isFile()) {
                return result(record, false, 'invalid', 'digests can only bind regular files');
            }
            const current = await digestFile(resolved);
            if (current !== record.source.digest) {
                return result(record, false, 'stale', 'file digest changed after the evidence was recorded');
            }
        }
        if (record.source.revision) {
            if (!/^[0-9a-f]{40}$/i.test(record.source.revision)) {
                return result(record, false, 'invalid', 'verification evidence is not bound to an exact commit');
            }
            const head = await gitHead(root);
            if (!head || head !== record.source.revision.toLowerCase()) {
                return result(record, false, 'stale',
                    `verification evidence binds ${record.source.revision}, current HEAD is ${head || 'unavailable'}`);
            }
        }
        return result(record, true, 'valid', record.source.digest
            ? 'file exists and its digest matches'
            : 'file or directory exists');
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return result(record, false, 'stale', 'referenced file no longer exists');
        }
        throw error;
    }
}

async function normalizeEvidenceSource(root: string, raw: string, digest?: string): Promise<EvidenceSource> {
    const prefixed = raw.match(/^(file|commit|url|attestation):(.+)$/i);
    const type = prefixed?.[1].toLowerCase() as EvidenceSource['type'] | undefined;
    const locator = (prefixed?.[2] || raw).trim();
    if (!locator) throw new Error('evidence source cannot be empty');

    if (type === 'file' || (!type && await pathExists(path.resolve(root, locator)))) {
        const resolved = resolveInsideRoot(root, locator);
        if (!resolved) throw new Error('file evidence must be inside the project root');
        const relative = path.relative(root, resolved).split(path.sep).join('/');
        const details = await stat(resolved);
        const fileDigest = digest || (details.isFile() ? await digestFile(resolved) : undefined);
        return { type: 'file', locator: relative || '.', ...(fileDigest ? { digest: fileDigest } : {}) };
    }
    if (type === 'commit' || (!type && /^[0-9a-f]{7,64}$/i.test(locator))) {
        return { type: 'commit', locator, revision: locator };
    }
    if (type === 'url' || (!type && /^https?:\/\//i.test(locator))) {
        return { type: 'url', locator };
    }
    return { type: type || 'attestation', locator };
}

function result(
    record: EvidenceRecord,
    valid: boolean,
    validation: ValidatedEvidence['validation'],
    reason: string,
): ValidatedEvidence {
    return { ...record, valid, validation, reason };
}

function resolveInsideRoot(root: string, locator: string): string | null {
    const normalizedRoot = path.resolve(root);
    const resolved = path.resolve(normalizedRoot, locator);
    if (resolved === normalizedRoot || resolved.startsWith(`${normalizedRoot}${path.sep}`)) return resolved;
    return null;
}

async function digestFile(file: string): Promise<string> {
    return `sha256:${createHash('sha256').update(await readFile(file)).digest('hex')}`;
}

async function pathExists(file: string): Promise<boolean> {
    try {
        await access(file);
        return true;
    } catch {
        return false;
    }
}

function gitObjectExists(root: string, revision: string): Promise<boolean> {
    return new Promise(resolve => {
        const child = spawn('git', ['cat-file', '-e', `${revision}^{commit}`], {
            cwd: root,
            shell: false,
            stdio: 'ignore',
        });
        child.on('error', () => resolve(false));
        child.on('close', code => resolve(code === 0));
    });
}

function gitHead(root: string): Promise<string | null> {
    return new Promise(resolve => {
        const child = spawn('git', ['rev-parse', 'HEAD'], {
            cwd: root,
            shell: false,
            stdio: ['ignore', 'pipe', 'ignore'],
        });
        let stdout = '';
        child.stdout.on('data', chunk => { stdout += chunk.toString(); });
        child.on('error', () => resolve(null));
        child.on('close', code => resolve(code === 0 ? stdout.trim().toLowerCase() : null));
    });
}

function sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
}
