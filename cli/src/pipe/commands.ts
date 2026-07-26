import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import type { CommandNode, PipeStep, RunContext } from './types.js';

const agentByCommand: Record<string, string> = {
    req: 'requirements-analyzer',
    des: 'design-architect',
    plan: 'task-planner',
    go: 'task-executor',
    rev: 'code-review',
    test: 'testing-validation',
    ship: 'deployment',
    deploy: 'deployment',
    docs: 'documentation',
    sec: 'sec-orchestrator',
    auth: 'auth',
    brand: 'brand',
    migrate: 'database',
    rollback: 'deployment',
    cf: 'cloudflare',
    fix: 'task-executor',
    debug: 'task-executor',
    refactor: 'task-executor',
};

const governedVerbs: Record<string, { verb: string; environment: string; riskScore: number }> = {
    ship: { verb: 'deploy', environment: 'production', riskScore: 70 },
    deploy: { verb: 'deploy', environment: 'production', riskScore: 70 },
    launch: { verb: 'deploy', environment: 'production', riskScore: 70 },
    cf: { verb: 'deploy', environment: 'production', riskScore: 70 },
    rollback: { verb: 'deploy', environment: 'production', riskScore: 85 },
    release: { verb: 'release', environment: 'production', riskScore: 70 },
    publish: { verb: 'publish', environment: 'production', riskScore: 70 },
    migrate: { verb: 'migrate', environment: 'production', riskScore: 70 },
    secret: { verb: 'secret', environment: 'local', riskScore: 60 },
    secrets: { verb: 'secret', environment: 'local', riskScore: 60 },
    keystore: { verb: 'secret', environment: 'local', riskScore: 60 },
    'git.push': { verb: 'git.push', environment: 'protected', riskScore: 70 },
    'git-push': { verb: 'git.push', environment: 'protected', riskScore: 70 },
    shell: { verb: 'shell', environment: 'local', riskScore: 50 },
    mcp: { verb: 'mcp', environment: 'local', riskScore: 50 },
};

export function toPipeStep(node: CommandNode, repository: string): PipeStep {
    const governed = governedVerbs[node.command] || {
        verb: node.command,
        environment: 'local',
        riskScore: 0,
    };
    return {
        ...node,
        verb: governed.verb,
        operation: node.command,
        target: safeTarget(node, repository),
        environment: governed.environment,
        parameters: { argumentCount: node.args.length },
        riskScore: governed.riskScore,
    };
}

export function createCommandExecutor(options: {
    entrypoint?: string;
    cwd: string;
    dryRun?: boolean;
}): (step: PipeStep, context: RunContext) => Promise<unknown> {
    return async step => {
        if (step.command === 'log') {
            const message = step.args.join(' ');
            console.log(message);
            return { logged: true };
        }
        if (step.command === 'approve') {
            if (process.env.LUNA_APPROVE !== '1') throw new Error('Manual approval requires LUNA_APPROVE=1');
            return { approved: true };
        }
        const agent = agentByCommand[step.command] || step.command;
        if (options.dryRun) return { dryRun: true, agent };
        const entrypoint = options.entrypoint || process.argv[1];
        if (!entrypoint) throw new Error('Unable to locate the Luna CLI entrypoint');
        await spawnLuna(entrypoint, agent, step, options.cwd);
        return { agent, completed: true };
    };
}

function safeTarget(node: CommandNode, repository: string): string {
    if (node.command === 'secret' || node.command === 'secrets' || node.command === 'keystore') {
        return node.args[0] || 'secret-store';
    }
    if (node.command === 'shell') {
        return `sha256:${createHash('sha256').update(node.args.join(' ')).digest('hex')}`;
    }
    return node.args[0] || path.basename(repository);
}

function spawnLuna(entrypoint: string, agent: string, step: PipeStep, cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [entrypoint, 'run', agent], {
            cwd,
            shell: false,
            stdio: 'inherit',
            env: {
                ...process.env,
                LUNA_PIPE_COMMAND: step.command,
                LUNA_PIPE_ARGUMENTS: JSON.stringify(step.args),
            },
        });
        child.on('error', reject);
        child.on('close', code => {
            if (code === 0) resolve();
            else reject(new Error(`Luna agent "${agent}" exited with code ${code ?? -1}`));
        });
    });
}
