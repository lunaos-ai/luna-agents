import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';

const DEFAULT_CONFIG = {
    version: '1.0',
    project: '',
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    agents: {
        free: [
            'code-review',
            'testing-validation',
            'documentation',
            'deployment',
            'requirements-analyzer',
            'design-architect',
        ],
    },
    output: {
        dir: '.luna/reports',
        format: 'markdown',
    },
};

export const initCommand = new Command('init')
    .description('Initialize LunaOS in your project')
    .option('-p, --provider <provider>', 'LLM provider (anthropic, openai)', 'anthropic')
    .option('-m, --model <model>', 'Model name', 'claude-sonnet-4-20250514')
    .action(async (options) => {
        const projectName = path.basename(process.cwd());
        const lunaDir = path.join(process.cwd(), '.luna');
        const configPath = path.join(lunaDir, 'config.yaml');
        const reportsDir = path.join(lunaDir, 'reports');

        if (fs.existsSync(configPath)) {
            console.log(chalk.yellow('⚠️  LunaOS already initialized in this project.'));
            console.log(chalk.dim(`  Config: ${configPath}`));
            return;
        }

        // Create directories
        fs.mkdirSync(lunaDir, { recursive: true });
        fs.mkdirSync(reportsDir, { recursive: true });

        // Generate config
        const config = {
            ...DEFAULT_CONFIG,
            project: projectName,
            provider: options.provider,
            model: options.model,
        };

        fs.writeFileSync(configPath, yaml.stringify(config), 'utf-8');

        // Create .gitignore for .luna
        const gitignorePath = path.join(lunaDir, '.gitignore');
        fs.writeFileSync(
            gitignorePath,
            'reports/\n*.log\n',
            'utf-8'
        );

        console.log('');
        console.log(chalk.hex('#E8A317')('🌙 LunaOS initialized!'));
        console.log('');
        console.log(chalk.dim('  Created:'));
        console.log(`    ${chalk.green('✓')} .luna/config.yaml`);
        console.log(`    ${chalk.green('✓')} .luna/reports/`);
        console.log(`    ${chalk.green('✓')} .luna/.gitignore`);
        console.log('');
        console.log(chalk.dim('  Next steps:'));
        console.log(`    ${chalk.cyan('luna list')}       — see available agents`);
        console.log(`    ${chalk.cyan('luna run review')} — run your first code review`);
        console.log('');
    });
