import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';
import { listCommand } from './commands/list.js';
import { runCommand } from './commands/run.js';
import { statusCommand } from './commands/status.js';
import { keysCommand } from './commands/keys.js';
import { createAgentCommand } from './commands/create-agent.js';
import { indexCommand } from './commands/index.js';
import { chainCommand } from './commands/chain.js';
import { configCommand } from './commands/config.js';
import { loginCommand } from './commands/login.js';
import { ragCommand } from './commands/rag.js';
import { handleError } from './utils/error-handler.js';

const program = new Command();

program
  .name('luna')
  .description(
    chalk.hex('#E8A317')('🌙 LunaOS') +
    ' — AI agent platform for the full software development lifecycle'
  )
  .version('0.1.0')
  .addHelpText('after', `
${chalk.dim('Examples:')}
  ${chalk.cyan('luna init')}                  Initialize LunaOS in your project
  ${chalk.cyan('luna list')}                  List all 28+ agents
  ${chalk.cyan('luna run code-review')}       Run code review on your project
  ${chalk.cyan('luna chain full-review')}     Run multi-agent review chain
  ${chalk.cyan('luna index')}                 Index project for RAG context
  ${chalk.cyan('luna keys add anthropic')}    Add an API key
  ${chalk.cyan('luna config set model gpt-4o')}  Change default model
  ${chalk.cyan('luna rag "how does auth work?"')} Semantic code search
  ${chalk.cyan('luna status')}                Show project status

${chalk.dim('Quick start:')}
  ${chalk.dim('1.')} ${chalk.cyan('luna init')}           — choose your LLM provider & set API key
  ${chalk.dim('2.')} ${chalk.cyan('luna run code-review')}  — run your first agent
  ${chalk.dim('3.')} ${chalk.cyan('luna chain full-review')} — run a full review chain

${chalk.dim('Docs:')} ${chalk.cyan('https://docs.lunaos.ai')}
`);

program.addCommand(initCommand);
program.addCommand(listCommand);
program.addCommand(runCommand);
program.addCommand(chainCommand);
program.addCommand(indexCommand);
program.addCommand(configCommand);
program.addCommand(loginCommand);
program.addCommand(ragCommand);
program.addCommand(statusCommand);
program.addCommand(keysCommand);
program.addCommand(createAgentCommand);

// Global error handler — catches unhandled rejections
process.on('uncaughtException', (error) => {
  handleError(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  handleError(reason instanceof Error ? reason : new Error(String(reason)));
  process.exit(1);
});

program.parse();
