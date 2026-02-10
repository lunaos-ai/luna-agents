import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';
import { listCommand } from './commands/list.js';
import { runCommand } from './commands/run.js';
import { statusCommand } from './commands/status.js';
import { keysCommand } from './commands/keys.js';
import { createAgentCommand } from './commands/create-agent.js';

const program = new Command();

program
    .name('luna')
    .description(
        chalk.hex('#E8A317')('🌙 LunaOS') +
        ' — AI agent platform for the full software development lifecycle'
    )
    .version('0.1.0');

program.addCommand(initCommand);
program.addCommand(listCommand);
program.addCommand(runCommand);
program.addCommand(statusCommand);
program.addCommand(keysCommand);
program.addCommand(createAgentCommand);

program.parse();
