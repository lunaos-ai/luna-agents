"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRunner = void 0;
const vscode = require("vscode");
const child_process_1 = require("child_process");
const path = require("path");
const webview_1 = require("./webview");
class AgentRunner {
    constructor(extensionUri) {
        this.extensionUri = extensionUri;
    }
    async runAgent(agentName, filePath) {
        // Create or show the webview panel
        webview_1.AgentWebviewPanel.createOrShow(this.extensionUri, `LunaOS: ${agentName}`);
        webview_1.AgentWebviewPanel.clearContent();
        // 1. Loading state UI
        webview_1.AgentWebviewPanel.appendContent(`<div class="header">
            <div class="spinner"></div>
            <h2>Running ${agentName}...</h2>
        </div>\n\n`);
        if (filePath) {
            webview_1.AgentWebviewPanel.appendContent(`> **Context File:** \`${filePath}\`\n\n`);
        }
        webview_1.AgentWebviewPanel.appendContent(`---\n\n`);
        // Check if luna CLI is installed
        try {
            await this.checkCliInstalled();
        }
        catch (error) {
            webview_1.AgentWebviewPanel.appendContent(`\n\n<div class="error-msg">❌ Error: LunaOS CLI is not installed or not in PATH.</div>\n\nRun \`npm i -g @luna-agents/cli\` to install it.`);
            vscode.window.showErrorMessage('LunaOS CLI is not installed or not in PATH.');
            return;
        }
        const config = vscode.workspace.getConfiguration('lunaos');
        const cliPath = config.get('cliPath', 'luna');
        const provider = config.get('defaultProvider', '');
        const model = config.get('defaultModel', '');
        const args = ['run', agentName];
        if (filePath) {
            args.push('--files', filePath);
            const fileName = path.basename(filePath);
            webview_1.AgentWebviewPanel.appendContent(`> **Context:** \`${fileName}\`\n\n`);
        }
        if (provider)
            args.push('--provider', provider);
        if (model)
            args.push('--model', model);
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const cwd = workspaceFolders ? workspaceFolders[0].uri.fsPath : process.cwd();
        const child = (0, child_process_1.spawn)(cliPath, args, {
            cwd,
            shell: process.platform === 'win32',
            env: process.env,
        });
        // Ensure we strip ANSI color codes from terminal output before sending to Webview Markdown parsing
        const stripAnsi = (str) => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
        child.stdout.on('data', (data) => {
            const cleanStr = stripAnsi(data.toString());
            webview_1.AgentWebviewPanel.appendContent(cleanStr);
        });
        child.stderr.on('data', (data) => {
            // Some tools output progress to stderr, keep it clean
            const cleanStr = stripAnsi(data.toString());
            // Optionally, we could format stderr differently, but we'll append for now
            webview_1.AgentWebviewPanel.appendContent(cleanStr);
        });
        child.on('error', (error) => {
            webview_1.AgentWebviewPanel.appendContent(`\n\n<div class="error-msg">❌ Execution error: ${error.message}</div>`);
            vscode.window.showErrorMessage(`Failed to run agent: ${error.message}`);
        });
        child.on('close', (code) => {
            // Replace the spinner with a success or failure indicator
            webview_1.AgentWebviewPanel.appendContent(`\n\n---`);
            if (code === 0) {
                webview_1.AgentWebviewPanel.appendContent(`\n\n<div class="success-msg">✅ Agent execution completed successfully.</div>`);
                vscode.window.showInformationMessage(`LunaOS: ${agentName} run completed.`);
            }
            else {
                webview_1.AgentWebviewPanel.appendContent(`\n\n<div class="error-msg">❌ Agent execution failed with code ${code}.</div>`);
                vscode.window.showErrorMessage(`LunaOS: ${agentName} run failed.`);
            }
        });
    }
    checkCliInstalled() {
        const cliPath = vscode.workspace.getConfiguration('lunaos').get('cliPath', 'luna');
        return new Promise((resolve, reject) => {
            const check = (0, child_process_1.spawn)(cliPath, ['--version'], {
                shell: process.platform === 'win32',
                env: process.env,
            });
            check.on('error', (err) => {
                reject(err);
            });
            check.on('close', (code) => {
                if (code === 0)
                    resolve();
                else
                    reject(new Error(`Exit code ${code}`));
            });
        });
    }
}
exports.AgentRunner = AgentRunner;
//# sourceMappingURL=agent-runner.js.map