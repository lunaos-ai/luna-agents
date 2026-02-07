import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'node:fs';
import path from 'node:path';
import { loadAgent } from '../core/persona-parser.js';
import { buildContext, formatContext } from '../core/context-builder.js';
import { streamLLM, resolveApiKey, defaultModel, PROVIDERS } from '../core/llm-client.js';
import type { LLMConfig, Provider } from '../core/llm-client.js';

const providerNames = Object.keys(PROVIDERS).join(', ');

export const runCommand = new Command('run')
    .description('Run an agent on your project')
    .argument('<agent>', 'Agent to run (e.g., code-review, testing-validation, deployment)')
    .option('-p, --provider <provider>', `LLM provider (${providerNames})`, 'anthropic')
    .option('-m, --model <model>', 'Model to use')
    .option('--no-context', 'Skip auto-context gathering')
    .option('-f, --files <files...>', 'Specific files to include')
    .option('-o, --output <path>', 'Output file path')
    .option('--cloud', 'Use LunaOS cloud API instead of local LLM')
    .option('--verbose', 'Show debug info')
    .action(async (agentSlug: string, options) => {
        const startTime = Date.now();

        // 1. Load agent persona
        const spinner = ora({ text: 'Loading agent...', color: 'yellow' }).start();
        const agent = await loadAgent(agentSlug);

        if (!agent) {
            spinner.fail(chalk.red(`Agent "${agentSlug}" not found`));
            console.log(chalk.dim('  Run ') + chalk.cyan('luna list') + chalk.dim(' to see available agents'));
            process.exit(1);
        }

        spinner.text = `Loading ${chalk.hex('#E8A317')(agent.name)} agent...`;

        // 2. Resolve API key
        const provider = (options.provider || 'anthropic') as Provider;
        const providerInfo = PROVIDERS[provider];

        if (!providerInfo) {
            spinner.fail(chalk.red(`Unknown provider "${provider}"`));
            console.log(chalk.dim(`  Available: ${providerNames}`));
            process.exit(1);
        }

        const apiKey = resolveApiKey(provider);

        if (!apiKey) {
            spinner.fail(chalk.red(`Missing ${providerInfo.name} API key`));
            console.log('');
            console.log(chalk.dim(`  Set your API key:`));
            console.log(`    export ${providerInfo.envVar}=your-key-here`);
            console.log(chalk.dim(`  Or run: ${chalk.cyan('luna init')} to configure`));
            console.log('');
            process.exit(1);
        }

        // 3. Gather project context
        let contextStr = '';
        if (options.context !== false) {
            spinner.text = 'Scanning project files...';
            try {
                const ctx = await buildContext(process.cwd());
                contextStr = formatContext(ctx);
                spinner.text = `Scanned ${ctx.files.length} files (${(ctx.files.reduce((a, f) => a + f.size, 0) / 1024).toFixed(0)} KB)`;
            } catch (error) {
                if (options.verbose) {
                    console.log(chalk.dim(`\n  Context gathering failed: ${error}`));
                }
            }
        }

        // 4. Build the user message
        let userMessage = '';
        if (options.files && options.files.length > 0) {
            // Use specific files
            const filesContent = options.files.map((f: string) => {
                const fullPath = path.resolve(process.cwd(), f);
                if (!fs.existsSync(fullPath)) return `# ${f}\n(file not found)`;
                const content = fs.readFileSync(fullPath, 'utf-8');
                const ext = path.extname(f).slice(1);
                return `## ${f}\n\`\`\`${ext}\n${content}\n\`\`\``;
            }).join('\n\n');
            userMessage = `Please analyze the following files:\n\n${filesContent}`;
        } else if (contextStr) {
            userMessage = `Please analyze this project:\n\n${contextStr}`;
        } else {
            userMessage = `Please provide guidance for a project in the current directory: ${path.basename(process.cwd())}`;
        }

        // 5. Execute — cloud or local
        spinner.succeed(chalk.hex('#E8A317')(`🌙 ${agent.name}`));

        let fullOutput = '';

        if (options.cloud) {
            // --- CLOUD MODE: call LunaOS Engine API ---
            console.log(chalk.dim(`  Mode: ☁️  cloud | Provider: ${provider}`));
            console.log(chalk.dim('─'.repeat(60)));
            console.log('');

            // Load cloud token from credentials
            const os = await import('node:os');
            const yaml = await import('yaml');
            const credPath = path.join(os.default.homedir(), '.luna', 'credentials.yaml');
            let cloudToken = '';

            if (fs.existsSync(credPath)) {
                try {
                    const creds = yaml.default.parse(fs.readFileSync(credPath, 'utf-8'));
                    cloudToken = creds?.cloud_token || '';
                } catch { /* ignore */ }
            }

            if (!cloudToken) {
                console.error(chalk.red('  ✗ No cloud token found.'));
                console.error(chalk.dim('    Run: luna init --cloud   to configure'));
                console.error(chalk.dim('    Or login at: https://agents.lunaos.ai'));
                process.exit(1);
            }

            const API_BASE = process.env.LUNA_API_URL || 'https://api.lunaos.ai';

            try {
                const response = await fetch(`${API_BASE}/agents/execute`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${cloudToken}`,
                    },
                    body: JSON.stringify({
                        agent: agent.slug,
                        context: userMessage,
                        provider,
                        model: options.model,
                    }),
                });

                if (!response.ok) {
                    const err = await response.json() as any;
                    throw new Error(err.error || `HTTP ${response.status}`);
                }

                // Parse SSE stream from cloud API
                const reader = response.body?.getReader();
                if (!reader) throw new Error('No response body');

                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data:')) {
                            const data = line.slice(5).trim();
                            if (!data) continue;

                            // Check for event type in preceding line
                            const eventLine = lines[lines.indexOf(line) - 1];
                            if (eventLine?.includes('event: token')) {
                                process.stdout.write(data);
                                fullOutput += data;
                            } else if (eventLine?.includes('event: done')) {
                                // Execution complete
                            } else if (eventLine?.includes('event: error')) {
                                const err = JSON.parse(data);
                                throw new Error(err.error);
                            } else {
                                // Fallback: treat as token
                                process.stdout.write(data);
                                fullOutput += data;
                            }
                        }
                    }
                }
            } catch (error: any) {
                console.error('');
                console.error(chalk.red(`  ✗ Cloud execution failed: ${error.message}`));
                process.exit(1);
            }
        } else {
            // --- LOCAL MODE: direct LLM call ---
            console.log(chalk.dim(`  Provider: ${provider} | Model: ${options.model || defaultModel(provider)}`));
            console.log(chalk.dim('─'.repeat(60)));
            console.log('');

            const config: LLMConfig = {
                provider,
                model: options.model || defaultModel(provider),
                apiKey,
                maxTokens: 8192,
                temperature: 0.3,
            };

            try {
                fullOutput = await streamLLM(
                    config,
                    agent.systemPrompt,
                    userMessage,
                    {
                        onToken: (token) => process.stdout.write(token),
                        onDone: () => { },
                        onError: (err) => {
                            console.error(chalk.red(`\n\nError: ${err.message}`));
                        },
                    }
                );
            } catch (error: any) {
                console.error('');
                console.error(chalk.red(`  ✗ Agent execution failed: ${error.message}`));
                process.exit(1);
            }
        }

        // 6. Save report
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log('');
        console.log(chalk.dim('─'.repeat(60)));

        const reportDir = path.join(process.cwd(), '.luna', 'reports');
        const dateStr = new Date().toISOString().split('T')[0];
        const reportFilename = `${agent.slug}-${dateStr}.md`;
        const reportPath = options.output || path.join(reportDir, reportFilename);

        try {
            fs.mkdirSync(path.dirname(reportPath), { recursive: true });

            const reportContent = [
                `# ${agent.name} Report`,
                ``,
                `**Date**: ${new Date().toISOString()}`,
                `**Agent**: ${agent.slug}`,
                `**Provider**: ${provider}`,
                `**Model**: ${options.model || defaultModel(provider)}`,
                `**Duration**: ${duration}s`,
                ``,
                `---`,
                ``,
                fullOutput,
            ].join('\n');

            fs.writeFileSync(reportPath, reportContent, 'utf-8');
            console.log(chalk.green(`  ✓ Report saved: ${path.relative(process.cwd(), reportPath)}`));
        } catch {
            // If we can't save, that's OK — output was already streamed
            if (options.verbose) {
                console.log(chalk.dim(`  Could not save report to ${reportPath}`));
            }
        }

        console.log(chalk.dim(`  ⏱ Completed in ${duration}s`));
        console.log('');
    });
