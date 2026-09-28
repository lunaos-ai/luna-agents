import { spawn } from 'node:child_process';
import type { WorkItem, WorkItemDraft, WorkItemProvider } from './types.js';

interface GitHubCliIssue {
    number: number;
    title: string;
    body?: string;
    state: string;
    url: string;
}

export class GitHubCliWorkItemProvider implements WorkItemProvider {
    constructor(readonly repository: string, private readonly cwd: string) {}

    async list(): Promise<WorkItem[]> {
        const output = await run('gh', [
            'issue', 'list', '--repo', this.repository, '--state', 'all', '--limit', '1000',
            '--json', 'number,title,body,state,url',
        ], this.cwd);
        return (JSON.parse(output) as GitHubCliIssue[]).map(toWorkItem);
    }

    async create(draft: WorkItemDraft): Promise<WorkItem> {
        const url = (await run('gh', [
            'issue', 'create', '--repo', this.repository,
            '--title', draft.title, '--body', draft.body,
        ], this.cwd)).trim();
        const number = Number(url.match(/\/(\d+)\/?$/)?.[1]);
        if (!number) throw new Error(`GitHub did not return a usable issue URL: ${url}`);
        return {
            providerId: 'github', number, title: draft.title, body: draft.body,
            state: 'open', url,
        };
    }

    async update(item: WorkItem, draft: WorkItemDraft): Promise<WorkItem> {
        await run('gh', [
            'issue', 'edit', String(item.number), '--repo', this.repository,
            '--title', draft.title, '--body', draft.body,
        ], this.cwd);
        return { ...item, title: draft.title, body: draft.body };
    }

    async setState(item: WorkItem, state: 'open' | 'closed'): Promise<WorkItem> {
        await run('gh', [
            'issue', state === 'open' ? 'reopen' : 'close', String(item.number),
            '--repo', this.repository,
        ], this.cwd);
        return { ...item, state };
    }
}

export async function resolveGitHubRepository(cwd: string, override?: string): Promise<string> {
    if (override) {
        if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(override)) {
            throw new Error('repository must use owner/name format');
        }
        return override;
    }
    const remote = (await run('git', ['remote', 'get-url', 'origin'], cwd)).trim();
    const match = remote.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/i);
    if (!match) throw new Error('Unable to resolve a GitHub owner/name from the origin remote');
    return `${match[1]}/${match[2]}`;
}

function toWorkItem(issue: GitHubCliIssue): WorkItem {
    return {
        providerId: 'github',
        number: issue.number,
        title: issue.title,
        body: issue.body || '',
        state: issue.state.toLowerCase() === 'closed' ? 'closed' : 'open',
        url: issue.url,
    };
}

function run(command: string, args: string[], cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { cwd, shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', chunk => { stdout += chunk.toString(); });
        child.stderr.on('data', chunk => { stderr += chunk.toString(); });
        child.on('error', reject);
        child.on('close', code => {
            if (code === 0) resolve(stdout);
            else reject(new Error(`${command} ${args.slice(0, 2).join(' ')} failed: ${stderr.trim()}`));
        });
    });
}
