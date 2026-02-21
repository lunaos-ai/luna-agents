import * as vscode from 'vscode';
import { AgentRunner } from './agent-runner';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    console.log('LunaOS VS Code extension is now active!');

    const runner = new AgentRunner(context.extensionUri);

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
export function deactivate() { }
