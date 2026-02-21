import * as vscode from 'vscode';

export class AgentWebviewPanel {
    public static currentPanel: AgentWebviewPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private _currentContent: string = "";

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view changes
        this._panel.onDidChangeViewState(
            e => {
                if (this._panel.visible) {
                    this._update();
                }
            },
            null,
            this._disposables
        );
    }

    public static createOrShow(extensionUri: vscode.Uri, title: string = "LunaOS Agent") {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (AgentWebviewPanel.currentPanel) {
            AgentWebviewPanel.currentPanel._panel.reveal(column);
            AgentWebviewPanel.currentPanel._panel.title = title;
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            'lunaosAgentView',
            title,
            column || vscode.ViewColumn.One,
            {
                // Enable javascript in the webview
                enableScripts: true,
                // Restrict the webview to only loading content from our extension's `media` directory.
                // localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
            }
        );

        AgentWebviewPanel.currentPanel = new AgentWebviewPanel(panel, extensionUri);
    }

    public static appendContent(content: string) {
        if (AgentWebviewPanel.currentPanel) {
            AgentWebviewPanel.currentPanel._currentContent += content;
            AgentWebviewPanel.currentPanel._update();
        }
    }

    public static clearContent() {
        if (AgentWebviewPanel.currentPanel) {
            AgentWebviewPanel.currentPanel._currentContent = "";
            AgentWebviewPanel.currentPanel._update();
        }
    }

    public dispose() {
        AgentWebviewPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview, this._currentContent);
    }

    private _getHtmlForWebview(webview: vscode.Webview, content: string) {
        // Use marked.js from CDN for simple rendering in the webview, or just parse basic markdown
        // For production, we should bundle this or use a VS Code built-in markdown renderer if possible

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LunaOS Agent Output</title>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            line-height: 1.6;
            font-size: 14px;
        }
        pre {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 16px;
            border-radius: 6px;
            overflow-x: auto;
            border: 1px solid var(--vscode-widget-border);
        }
        code {
            font-family: var(--vscode-editor-font-family);
            color: var(--vscode-textPreformat-foreground);
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 4px;
            border-radius: 4px;
        }
        pre code {
            padding: 0;
            background-color: transparent;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
            color: var(--vscode-editor-foreground);
        }
        h1 { font-size: 2em; border-bottom: 1px solid var(--vscode-widget-border); padding-bottom: .3em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid var(--vscode-widget-border); padding-bottom: .3em; }
        a {
            color: var(--vscode-textLink-foreground);
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        blockquote {
            margin: 0;
            padding: 0 1em;
            color: var(--vscode-textBlockQuote-foreground);
            border-left: .25em solid var(--vscode-textBlockQuote-background);
        }
        /* Agent header and spinner */
        .header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--vscode-widget-border);
        }
        .header h2 {
            margin: 0;
            border: none;
        }
        .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(195, 195, 195, 0.6);
            border-radius: 50%;
            border-top-color: var(--vscode-button-background);
            animation: spin 1s ease-in-out infinite;
            margin-right: 12px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .error-msg {
            color: var(--vscode-errorForeground);
            font-weight: bold;
            margin-top: 10px;
        }
        .success-msg {
            color: var(--vscode-testing-iconPassed);
            font-weight: bold;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div id="content"></div>
    <script>
        const contentDiv = document.getElementById('content');
        const rawContent = ${JSON.stringify(content)};
        
        // Use marked to parse markdown to HTML
        if (window.marked) {
            // Configure marked to use GitHub flavored markdown
            marked.setOptions({
                gfm: true,
                breaks: true
            });
            contentDiv.innerHTML = marked.parse(rawContent || "Waiting for agent output...");
        } else {
            contentDiv.textContent = rawContent;
        }
        
        // Auto-scroll to bottom
        window.scrollTo(0, document.body.scrollHeight);
    </script>
</body>
</html>`;
    }
}
