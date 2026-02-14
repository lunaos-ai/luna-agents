"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRunner = void 0;
const vscode = require("vscode");
const child_process_1 = require("child_process");
class AgentRunner {
    constructor(outputChannel) {
        this.outputChannel = outputChannel;
    }
    async runAgent(agentName, filePath) {
        // Show output channel
        this.outputChannel.show(true);
        this.outputChannel.clear();
        this.outputChannel.appendLine(`🚀 LunaOS: Running agent '${agentName}'...`);
        if (filePath) {
            this.outputChannel.appendLine(`📂 Context: ${filePath}`);
        }
        this.outputChannel.appendLine('---');
        // Check if luna CLI is installed
        // We'll try running 'luna --version' first
        try {
            await this.checkCliInstalled();
        }
        catch (error) {
            vscode.window.showErrorMessage('LunaOS CLI is not installed or not in PATH. Run "npm i -g @luna-agents/cli" to install.');
            this.outputChannel.appendLine('❌ Error: LunaOS CLI not found.');
            return;
        }
        // Prepare args
        const args = ['run', agentName];
        // If there's an active file, maybe we want to pass it as context?
        // The CLI currently auto-detects context. Maybe subsequent versions support explicit context files.
        // For now, let's rely on CLI auto-detection.
        if (filePath) {
            // If CLI supports passing a file, add it here.
            // e.g. args.push('--file', filePath);
        }
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const cwd = workspaceFolders ? workspaceFolders[0].uri.fsPath : process.cwd();
        this.outputChannel.appendLine(`📂 Working Directory: ${cwd}`);
        const child = (0, child_process_1.spawn)('luna', args, {
            cwd,
            shell: process.platform === 'win32', // Use shell on Windows for path resolution
            env: process.env // Inherit env vars (PATH, etc)
        });
        child.stdout.on('data', (data) => {
            this.outputChannel.append(data.toString());
        });
        child.stderr.on('data', (data) => {
            // CLI uses stderr for spinner/progress sometimes, or actual errors
            this.outputChannel.append(data.toString());
        });
        child.on('error', (error) => {
            this.outputChannel.appendLine(`❌ Execution error: ${error.message}`);
            vscode.window.showErrorMessage(`Failed to run agent: ${error.message}`);
        });
        child.on('close', (code) => {
            if (code === 0) {
                this.outputChannel.appendLine('\n✅ Agent execution completed successfully.');
                vscode.window.showInformationMessage(`LunaOS: ${agentName} run completed.`);
            }
            else {
                this.outputChannel.appendLine(`\n❌ Agent execution failed with code ${code}.`);
                vscode.window.showErrorMessage(`LunaOS: ${agentName} run failed.`);
            }
        });
    }
    checkCliInstalled() {
        return new Promise((resolve, reject) => {
            const check = (0, child_process_1.spawn)('luna', ['--version'], {
                shell: process.platform === 'win32',
                env: process.env
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