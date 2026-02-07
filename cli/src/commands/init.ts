import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'yaml';
import { createInterface } from 'node:readline';
import { PROVIDERS, type Provider } from '../core/llm-client.js';

function prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
        const rl = createInterface({ input: process.stdin, output: process.stdout });
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

const PROVIDER_LIST: Array<{ key: Provider; label: string; tag?: string }> = [
    { key: 'anthropic', label: 'Anthropic (Claude)', tag: '← recommended' },
    { key: 'openai', label: 'OpenAI (GPT-4o)' },
    { key: 'deepseek', label: 'DeepSeek', tag: '💰 cheapest' },
    { key: 'google', label: 'Google (Gemini)', tag: '🆓 free tier' },
    { key: 'xai', label: 'xAI (Grok)' },
    { key: 'groq', label: 'Groq', tag: '⚡ fastest' },
    { key: 'mistral', label: 'Mistral AI' },
    { key: 'cohere', label: 'Cohere (Command R+)' },
    { key: 'perplexity', label: 'Perplexity (Sonar)' },
    { key: 'together', label: 'Together AI' },
    { key: 'fireworks', label: 'Fireworks AI' },
    { key: 'openrouter', label: 'OpenRouter', tag: '🌐 200+ models' },
];

export const initCommand = new Command('init')
    .description('Initialize LunaOS in your project')
    .option('--skip-keys', 'Skip API key setup')
    .action(async (options) => {
        const projectName = path.basename(process.cwd());
        const lunaDir = path.join(process.cwd(), '.luna');
        const configPath = path.join(lunaDir, 'config.yaml');
        const reportsDir = path.join(lunaDir, 'reports');
        const globalDir = path.join(os.homedir(), '.luna');
        const credentialsPath = path.join(globalDir, 'credentials.yaml');

        console.log('');
        console.log(chalk.hex('#E8A317')('🌙 LunaOS Setup'));
        console.log(chalk.dim(`  Project: ${projectName}`));
        console.log('');

        // Step 1: Choose provider
        console.log(chalk.white.bold('  Choose your LLM provider:'));
        console.log('');
        PROVIDER_LIST.forEach((p, i) => {
            const num = chalk.cyan(`  ${String(i + 1).padStart(2)}`);
            const tag = p.tag ? chalk.dim(` ${p.tag}`) : '';
            console.log(`${num}  ${p.label}${tag}`);
        });
        console.log('');

        const providerChoice = await prompt('  Provider [1]: ');
        const choiceIndex = parseInt(providerChoice || '1', 10) - 1;
        const selectedProvider = PROVIDER_LIST[choiceIndex] || PROVIDER_LIST[0];
        const provider = selectedProvider.key;
        const providerInfo = PROVIDERS[provider];
        const model = providerInfo.defaultModel;

        console.log(`  ${chalk.green('✓')} Selected: ${chalk.white(providerInfo.name)} (${chalk.dim(model)})`);

        // Step 2: API Key
        let existingCreds: Record<string, string> = {};
        if (fs.existsSync(credentialsPath)) {
            try {
                existingCreds = yaml.parse(fs.readFileSync(credentialsPath, 'utf-8')) || {};
            } catch { /* ignore */ }
        }

        const existingKey = existingCreds[providerInfo.envVar] || process.env[providerInfo.envVar];

        if (!options.skipKeys) {
            if (existingKey) {
                const masked = existingKey.slice(0, 7) + '...' + existingKey.slice(-4);
                console.log(`  ${chalk.green('✓')} API key found: ${chalk.dim(masked)}`);
            } else {
                console.log('');
                console.log(chalk.white.bold(`  🔑 ${providerInfo.name} API Key Setup`));
                console.log('');
                console.log(chalk.dim(`  How to get your key:`));
                providerInfo.keyGuide.split('\n').forEach(line => {
                    console.log(chalk.dim(`  ${line.trim()}`));
                });
                console.log('');
                console.log(chalk.dim(`  URL: ${chalk.cyan(providerInfo.signupUrl)}`));
                console.log('');

                const apiKey = await prompt(`  API Key: `);

                if (apiKey) {
                    fs.mkdirSync(globalDir, { recursive: true });
                    existingCreds[providerInfo.envVar] = apiKey;
                    fs.writeFileSync(credentialsPath, yaml.stringify(existingCreds), 'utf-8');
                    fs.chmodSync(credentialsPath, 0o600);
                    console.log(`  ${chalk.green('✓')} Key saved to ${chalk.dim('~/.luna/credentials.yaml')}`);
                } else {
                    console.log(chalk.yellow(`  ⚠ No key provided. Set ${providerInfo.envVar} env var before running agents.`));
                }
            }
        }

        // Step 3: Create project .luna/ dir
        fs.mkdirSync(lunaDir, { recursive: true });
        fs.mkdirSync(reportsDir, { recursive: true });

        const config = {
            version: '1.0',
            project: projectName,
            provider,
            model,
            agents: {
                free: [
                    'code-review', 'testing-validation', 'documentation',
                    'deployment', 'requirements-analyzer', 'design-architect',
                ],
            },
            output: { dir: '.luna/reports', format: 'markdown' },
        };

        fs.writeFileSync(configPath, yaml.stringify(config), 'utf-8');
        fs.writeFileSync(path.join(lunaDir, '.gitignore'), 'reports/\n*.log\n', 'utf-8');

        console.log('');
        console.log(chalk.hex('#E8A317')('🌙 LunaOS initialized!'));
        console.log('');
        console.log(chalk.dim('  Created:'));
        console.log(`    ${chalk.green('✓')} .luna/config.yaml  ${chalk.dim(`(${providerInfo.name}, ${model})`)}`);
        console.log(`    ${chalk.green('✓')} .luna/reports/`);
        console.log('');
        console.log(chalk.dim('  Try it now:'));
        console.log(`    ${chalk.cyan('luna list')}              — see all 28 agents`);
        console.log(`    ${chalk.cyan(`luna run code-review`)}   — review your code`);
        console.log('');
    });
