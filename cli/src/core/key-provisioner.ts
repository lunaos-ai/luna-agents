import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { BaseExtractor } from './extractors/base';
import chalk from 'chalk';
import ora from 'ora';

// Dynamic import for playwright type
import type { Browser, Page, ChromiumBrowser } from 'playwright';

export class KeyProvisioner {
    private static async getPlaywright(): Promise<typeof import('playwright') | null> {
        try {
            return await import('playwright');
        } catch (e) {
            return null;
        }
    }

    private static async isPlaywrightInstalled(): Promise<boolean> {
        return !!(await this.getPlaywright());
    }

    private static async installPlaywright(): Promise<boolean> {
        const spinner = ora('Installing Playwright...').start();
        try {
            // Install playwright locally
            await new Promise<void>((resolve, reject) => {
                const child = spawn('npm', ['install', 'playwright', '--no-save'], { stdio: 'inherit' });
                child.on('close', (code) => {
                    if (code === 0) resolve();
                    else reject(new Error(`npm install failed with code ${code}`));
                });
            });

            // Install browsers
            spinner.text = 'Installing browsers...';
            const playwright = await import('playwright');
            // This part is tricky - usually `npx playwright install` does the binary fetching.
            // Let's rely on npx for the browser install part.
            await new Promise<void>((resolve, reject) => {
                const child = spawn('npx', ['playwright', 'install', 'chromium'], { stdio: 'inherit' });
                child.on('close', (code) => {
                    if (code === 0) resolve();
                    else reject(new Error(`npx playwright install failed with code ${code}`));
                });
            });

            spinner.succeed('Playwright installed successfully.');
            return true;
        } catch (error) {
            spinner.fail('Failed to install Playwright.');
            console.error(error);
            return false;
        }
    }

    static async provision(extractor: BaseExtractor): Promise<string | null> {
        console.log(chalk.blue(`\n🤖 Starting automated key provisioning for ${extractor.name}...\n`));

        let playwright = await this.getPlaywright();
        if (!playwright) {
            console.log(chalk.yellow('Playwright is required for this feature but not installed.'));
            // @ts-ignore
            const inquirer = (await import('inquirer')).default;
            const answers = await inquirer.prompt([{
                type: 'confirm',
                name: 'shouldInstall',
                message: 'Would you like to install Playwright now? (It will be installed locally)',
                default: true
            }]);
            const shouldInstall = (answers as any).shouldInstall;

            if (shouldInstall) {
                const success = await this.installPlaywright();
                if (!success) return null;
                playwright = await this.getPlaywright();
            } else {
                console.log(chalk.red('Cannot proceed without Playwright.'));
                return null;
            }
        }

        if (!playwright) return null;

        const spinner = ora('Launching browser...').start();
        let browser: ChromiumBrowser | null = null;
        try {
            // Launch headed browser so user can see and interact
            browser = await playwright.chromium.launch({ headless: false });
            const context = await browser.newContext();
            const page = await context.newPage();

            spinner.text = `Navigating to ${extractor.name} login...`;
            await page.goto(extractor.loginUrl);
            spinner.stop();

            console.log(chalk.cyan(`\n👉 Please log in to ${extractor.name} in the browser window.`));
            console.log(chalk.dim('   The CLI is waiting for you to complete login...'));

            // Wait for user to navigate away from login page or reach a dashboard-like URL? 
            // Or just wait for a specific selector that indicates logged-in state?
            // Let the extractor handle the waits.

            const key = await extractor.extract(page);

            if (key) {
                console.log(chalk.green(`\n✅ Successfully retrieved API key!`));
                return key;
            } else {
                console.log(chalk.red('\n❌ Failed to retrieve API key.'));
                return null;
            }
        } catch (error: any) {
            // If browser closed by user, that's okay
            if (error.message.includes('Target closed') || error.message.includes('browser has been closed')) {
                console.log(chalk.yellow('\nBrowser closed by user.'));
            } else {
                console.error(chalk.red('\nError during provisioning:'), error);
            }
            return null;
        } finally {
            if (browser) await browser.close();
        }
    }
}
