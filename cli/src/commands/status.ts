import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';
import { loadCredentials, getApiUrl, loadConfig } from '../utils/config-store.js';
import { executeLifecycleVerb } from '../lifecycle/verbs.js';

interface LifecycleStatus {
    project: string;
    requirementCount: number;
    cycleCount: number;
    sourceFiles: string[];
    counts: Record<string, number>;
    claimMismatchCount: number;
    staleEvidenceCount: number;
}

export const statusCommand = new Command('status')
    .aliases(['s', 'stat'])
    .description('Show LunaOS project status, plan, and usage')
    .option('--json', 'Print evidence-derived lifecycle status as JSON')
    .option('--lifecycle-only', 'Show only requirements lifecycle status')
    .addHelpText('after', `
Examples:
  luna status                  Show project config, plan, usage, and recent reports
`)
    .action(async (command) => {
        const options = typeof command.opts === 'function' ? command.opts() : command;
        const lunaDir = path.join(process.cwd(), '.luna');
        const configPath = path.join(lunaDir, 'config.yaml');
        const reportsDir = path.join(lunaDir, 'reports');
        const lifecycle = await executeLifecycleVerb('status', [], {
            cwd: process.cwd(),
            forceDryRun: true,
        }) as LifecycleStatus;

        if (options.json) {
            console.log(JSON.stringify(lifecycle, null, 2));
            return;
        }
        if (options.lifecycleOnly) {
            printLifecycleStatus(lifecycle);
            return;
        }

        console.log('');
        console.log(chalk.hex('#E8A317')('🌙 LunaOS Status'));
        console.log('');

        // ─── Project Config ──────────────────────
        if (!fs.existsSync(configPath)) {
            console.log(chalk.yellow('  ⚠️  Not initialized'));
            console.log(chalk.dim('  Run ') + chalk.cyan('luna init') + chalk.dim(' for provider setup'));
        } else {
            try {
                const config = yaml.parse(fs.readFileSync(configPath, 'utf-8'));
                console.log(`  ${chalk.dim('Project:')}   ${chalk.white(config.project)}`);
                console.log(`  ${chalk.dim('Provider:')}  ${chalk.white(config.provider)}`);
                console.log(`  ${chalk.dim('Model:')}    ${chalk.white(config.model)}`);
            } catch {
                console.log(chalk.dim('  Could not read config'));
            }
        }

        // ─── Cloud Auth & Usage ──────────────────
        const creds = loadCredentials();
        const cloudToken = creds.cloud_token;

        if (cloudToken) {
            const API_BASE = getApiUrl();
            console.log('');

            try {
                // Fetch user info and usage in parallel
                const [meRes, usageRes] = await Promise.all([
                    fetch(`${API_BASE}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${cloudToken}` },
                    }).catch(() => null),
                    fetch(`${API_BASE}/billing/usage`, {
                        headers: { 'Authorization': `Bearer ${cloudToken}` },
                    }).catch(() => null),
                ]);

                // User info
                if (meRes?.ok) {
                    const meData = await meRes.json() as any;
                    const tier = meData.user?.tier || 'free';
                    const tierLabel = tier === 'free'
                        ? chalk.dim('Free')
                        : tier === 'pro'
                            ? chalk.hex('#A78BFA')('⚡ Pro')
                            : chalk.hex('#F59E0B')('⚡ Team');
                    console.log(`  ${chalk.dim('Plan:')}     ${tierLabel}`);
                    console.log(`  ${chalk.dim('Account:')}  ${chalk.white(meData.user?.email || 'connected')}`);
                }

                // Usage
                if (usageRes?.ok) {
                    const usage = await usageRes.json() as any;
                    const used = usage.used || 0;
                    const limit = usage.limit || 100;
                    const remaining = usage.remaining ?? (limit - used);
                    const pct = Math.min(Math.round((used / limit) * 100), 100);

                    // Color based on usage percentage
                    const usedColor = pct >= 90 ? chalk.red : pct >= 75 ? chalk.yellow : chalk.green;
                    const barWidth = 20;
                    const filled = Math.round((pct / 100) * barWidth);
                    const bar = usedColor('█'.repeat(filled)) + chalk.dim('░'.repeat(barWidth - filled));

                    console.log(`  ${chalk.dim('Usage:')}    ${bar} ${usedColor(`${used}`)}${chalk.dim(`/${limit}`)} ${chalk.dim(`(${pct}%)`)}`);
                    console.log(`  ${chalk.dim('Remaining:')} ${chalk.white(remaining.toLocaleString())} runs this month`);

                    // Warning at 80%+
                    if (pct >= 80 && pct < 100) {
                        console.log('');
                        console.log(chalk.yellow(`  ⚠ ${pct}% of monthly limit used`));
                        if (usage.tier === 'free') {
                            console.log(chalk.dim('  Upgrade: ') + chalk.cyan('https://agents.lunaos.ai/pricing'));
                        }
                    } else if (pct >= 100) {
                        console.log('');
                        console.log(chalk.red('  ✗ Monthly limit reached'));
                        console.log(chalk.dim('  Upgrade for more runs: ') + chalk.cyan('https://agents.lunaos.ai/pricing'));
                    }

                    // Agent access
                    const tier = usage.tier || 'free';
                    const agentCount = 28;
                    console.log(`  ${chalk.dim('Agents:')}   ${chalk.white(agentCount.toString())}${chalk.dim(`/28 available`)}`);
                }
            } catch {
                console.log(chalk.dim('  Could not reach cloud API'));
            }
        } else {
            console.log('');
            console.log(`  ${chalk.dim('Cloud:')}    ${chalk.dim('not connected')}`);
            console.log(chalk.dim('  Run ') + chalk.cyan('luna login') + chalk.dim(' to connect'));
        }

        // ─── Reports ─────────────────────────────
        if (fs.existsSync(reportsDir)) {
            const reports = fs.readdirSync(reportsDir).filter(f => f.endsWith('.md'));
            console.log('');
            console.log(`  ${chalk.dim('Reports:')}  ${chalk.white(reports.length.toString())}`);

            if (reports.length > 0) {
                console.log('');
                console.log(chalk.dim('  Recent:'));
                const sorted = reports
                    .map(f => ({ name: f, time: fs.statSync(path.join(reportsDir, f)).mtime }))
                    .sort((a, b) => b.time.getTime() - a.time.getTime())
                    .slice(0, 5);

                for (const report of sorted) {
                    const ago = timeAgo(report.time);
                    console.log(`    ${chalk.green('•')} ${chalk.white(report.name)} ${chalk.dim(`(${ago})`)}`);
                }
            }
        }

        // ─── Local API Keys ─────────────────────
        console.log('');
        const configStore = loadConfig();
        const provider = configStore.provider || 'anthropic';
        const envVarMap: Record<string, string> = {
            anthropic: 'ANTHROPIC_API_KEY',
            openai: 'OPENAI_API_KEY',
            deepseek: 'DEEPSEEK_API_KEY',
            google: 'GOOGLE_API_KEY',
            groq: 'GROQ_API_KEY',
            mistral: 'MISTRAL_API_KEY',
        };
        const envVar = envVarMap[provider] || `${provider.toUpperCase()}_API_KEY`;
        const hasKey = !!(creds[envVar] || process.env[envVar]);
        console.log(`  ${chalk.dim(`${provider}:`)} ${hasKey ? chalk.green('✓ configured') : chalk.red('✗ missing')}`);

        printLifecycleStatus(lifecycle);
        console.log('');
    });

function printLifecycleStatus(status: LifecycleStatus): void {
    console.log('');
    console.log(chalk.white.bold('  Requirements lifecycle'));
    console.log(`  ${chalk.dim('Requirements:')} ${status.requirementCount}`);
    console.log(`  ${chalk.dim('Cycles:')}       ${status.cycleCount}`);
    const stateLine = Object.entries(status.counts)
        .filter(([, count]) => count > 0)
        .map(([state, count]) => `${state}=${count}`)
        .join('  ');
    if (stateLine) console.log(`  ${chalk.dim('States:')}       ${stateLine}`);
    console.log(`  ${chalk.dim('Claim gaps:')}   ${status.claimMismatchCount}`);
    console.log(`  ${chalk.dim('Stale evidence:')} ${status.staleEvidenceCount}`);
}

function timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}
