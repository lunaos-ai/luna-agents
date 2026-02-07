import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';

export const statusCommand = new Command('status')
    .description('Show LunaOS project status')
    .action(async () => {
        const lunaDir = path.join(process.cwd(), '.luna');
        const configPath = path.join(lunaDir, 'config.yaml');
        const reportsDir = path.join(lunaDir, 'reports');

        console.log('');
        console.log(chalk.hex('#E8A317')('🌙 LunaOS Status'));
        console.log('');

        // Check if initialized
        if (!fs.existsSync(configPath)) {
            console.log(chalk.yellow('  ⚠️  Not initialized'));
            console.log(chalk.dim('  Run ') + chalk.cyan('luna init') + chalk.dim(' to get started'));
            console.log('');
            return;
        }

        // Read config
        try {
            const config = yaml.parse(fs.readFileSync(configPath, 'utf-8'));
            console.log(`  ${chalk.dim('Project:')}   ${chalk.white(config.project)}`);
            console.log(`  ${chalk.dim('Provider:')}  ${chalk.white(config.provider)}`);
            console.log(`  ${chalk.dim('Model:')}    ${chalk.white(config.model)}`);
        } catch {
            console.log(chalk.dim('  Could not read config'));
        }

        // Count reports
        if (fs.existsSync(reportsDir)) {
            const reports = fs.readdirSync(reportsDir).filter(f => f.endsWith('.md'));
            console.log(`  ${chalk.dim('Reports:')}  ${chalk.white(reports.length.toString())}`);

            if (reports.length > 0) {
                console.log('');
                console.log(chalk.dim('  Recent reports:'));
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

        // API key status
        console.log('');
        const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
        const hasOpenAI = !!process.env.OPENAI_API_KEY;
        console.log(`  ${chalk.dim('Anthropic:')} ${hasAnthropic ? chalk.green('✓ configured') : chalk.red('✗ missing')}`);
        console.log(`  ${chalk.dim('OpenAI:')}    ${hasOpenAI ? chalk.green('✓ configured') : chalk.red('✗ missing')}`);
        console.log('');
    });

function timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}
