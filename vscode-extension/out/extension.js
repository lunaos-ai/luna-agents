"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const agent_runner_1 = require("./agent-runner");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    console.log('LunaOS VS Code extension is now active!');
    const outputChannel = vscode.window.createOutputChannel("LunaOS");
    const runner = new agent_runner_1.AgentRunner(outputChannel);
    // Register luna.runAgent command
    let runAgentDisposable = vscode.commands.registerCommand('luna.runAgent', async () => {
        // 1. Get list of available agents (hardcoded for now, or fetch from CLI later)
        const agents = [
            'code-review',
            'testing-validation',
            'documentation',
            'deployment',
            'requirements-analyzer',
            'design-architect',
            'security-audit',
            'api-design'
        ];
        // 2. Show QuickPick
        const selectedAgent = await vscode.window.showQuickPick(agents, {
            placeHolder: 'Select an AI agent to run',
            title: 'LunaOS: Run Agent'
        });
        if (selectedAgent) {
            // 3. Prompt for input/context (optional, or rely on file)
            // For now, let's just run it. The CLI might need context, but let's assume it reads from files.
            // Maybe we pass the current file path?
            const editor = vscode.window.activeTextEditor;
            const currentFile = editor ? editor.document.fileName : undefined;
            runner.runAgent(selectedAgent, currentFile);
        }
    });
    // Register luna.runCodeReview shortcut
    let runCodeReviewDisposable = vscode.commands.registerCommand('luna.runCodeReview', () => {
        const editor = vscode.window.activeTextEditor;
        const currentFile = editor ? editor.document.fileName : undefined;
        runner.runAgent('code-review', currentFile);
    });
    context.subscriptions.push(runAgentDisposable);
    context.subscriptions.push(runCodeReviewDisposable);
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map