# 🌙 Luna Agents - Installation Guide

> Complete AI-powered development lifecycle management for Claude Code

## 📋 Prerequisites

Before installing Luna Agents, ensure you have:

- **Claude Code** - Latest version ([Download](https://claude.ai/download))
- **Node.js** - Version 18 or higher ([Download](https://nodejs.org/))
- **Git** - For version control ([Download](https://git-scm.com/))

### Check Your Environment

```bash
# Check Node.js version (should be 18+)
node -v

# Check npm version
npm -v

# Check Git version
git --version
```

## 🚀 Quick Install (Recommended)

### Option 1: Automated Setup Script

The easiest way to install Luna Agents:

```bash
# Clone the repository
git clone https://github.com/yourusername/luna-agents.git
cd luna-agents

# Run the automated setup
chmod +x setup.sh
./setup.sh
```

The script will:
1. ✅ Check all prerequisites
2. ✅ Install MCP server dependencies
3. ✅ Configure the MCP server
4. ✅ Install the Claude plugin
5. ✅ Create quick start guide

**That's it!** Restart Claude Desktop and you're ready to go.

### Option 2: Manual Installation

If you prefer manual control:

#### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/luna-agents.git
cd luna-agents
```

#### Step 2: Setup MCP Server

```bash
cd mcp-servers/luna-nexa-rag
npm install
npm run setup
```

Follow the prompts to configure:
- **Project Path**: Your project directory for semantic search
- **Collection Name**: Database collection name (default: devwrapped-codebase)
- **Nexa Embeddings**: Whether to use Nexa SDK (y/n)
- **ChromaDB Settings**: Host and port (defaults usually work)

#### Step 3: Install Claude Plugin

```bash
cd ../../.claude-plugin
npm install
```

#### Step 4: Link Plugin to Claude

**macOS:**
```bash
mkdir -p ~/Library/Application\ Support/Claude/plugins
ln -s "$(pwd)" ~/Library/Application\ Support/Claude/plugins/luna-agents
```

**Linux:**
```bash
mkdir -p ~/.config/Claude/plugins
ln -s "$(pwd)" ~/.config/Claude/plugins/luna-agents
```

**Windows:**
```powershell
mkdir -p $env:APPDATA\Claude\plugins
New-Item -ItemType SymbolicLink -Path "$env:APPDATA\Claude\plugins\luna-agents" -Target "$(pwd)"
```

#### Step 5: Restart Claude Desktop

Close and reopen Claude Desktop to load the plugin.

## 🎯 Verify Installation

After installation, verify everything works:

### 1. Check Plugin is Loaded

In Claude Code, type `/` and you should see Luna commands:
- `/luna-requirements`
- `/luna-design`
- `/luna-plan`
- etc.

### 2. Test MCP Server

In Claude, you can use the semantic search tools directly:
```
Can you index my codebase at /path/to/project?
```

### 3. Run First Command

Try the requirements analysis:
```
/luna-requirements my-project
```

## 🔧 Configuration

### MCP Server Configuration

The MCP server stores its config at `~/.luna-nexa-rag/config.json`

**Default Configuration:**
```json
{
  "projectPath": "/Users/you/projects",
  "collectionName": "devwrapped-codebase",
  "useNexaEmbeddings": false,
  "nexaEndpoint": "http://localhost:8080",
  "chromaHost": "localhost",
  "chromaPort": "8000",
  "fileTypes": [".js", ".ts", ".py", ".md", ".tsx", ".jsx", ".json"]
}
```

**To Reconfigure:**
```bash
cd mcp-servers/luna-nexa-rag
npm run setup
```

### Claude Desktop Configuration

Luna Agents automatically configures itself, but you can verify the MCP server in your Claude config:

**Location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**Example config entry:**
```json
{
  "mcpServers": {
    "luna-nexa-rag": {
      "command": "node",
      "args": ["/path/to/luna-agents/mcp-servers/luna-nexa-rag/index.js"]
    }
  }
}
```

## 🎓 First Steps

### 1. Start a New Project

```bash
# Navigate to your project
cd /path/to/your/project

# Open in Claude Code
# Then run:
/luna-requirements
```

This analyzes your codebase and creates a requirements document.

### 2. Follow the Workflow

Luna Agents provides a complete development workflow:

```
/luna-requirements  →  /luna-design  →  /luna-plan  →  /luna-execute
         ↓
/luna-review  →  /luna-test  →  /luna-deploy  →  /luna-docs
         ↓
/luna-monitor  →  /luna-review-launch
```

### 3. Use Semantic Search

```
# Index your codebase first
Can you index my codebase?

# Then search semantically
Search for authentication logic in my code

# Find similar implementations
Show me similar implementations of user registration
```

## 📚 Documentation

- **Quick Start**: [QUICK_START.md](./QUICK_START.md)
- **Full README**: [README.md](./README.md)
- **Plugin Documentation**: [.claude-plugin/README.md](./.claude-plugin/README.md)
- **MCP Server**: [mcp-servers/luna-nexa-rag/README.md](./mcp-servers/luna-nexa-rag/README.md)

## 🐛 Troubleshooting

### Plugin Not Appearing

**Issue**: Luna commands don't show up after restart

**Solutions**:
1. Verify plugin is linked correctly:
   ```bash
   ls -la ~/Library/Application\ Support/Claude/plugins/luna-agents  # macOS
   ```
2. Check Claude logs for errors
3. Ensure `.claude-plugin/claude-plugin.json` exists
4. Try reinstalling:
   ```bash
   ./setup.sh
   ```

### MCP Server Not Working

**Issue**: Semantic search tools not available

**Solutions**:
1. Verify MCP server configuration:
   ```bash
   cat ~/.luna-nexa-rag/config.json
   ```
2. Test MCP server manually:
   ```bash
   cd mcp-servers/luna-nexa-rag
   npm start
   ```
3. Check Claude Desktop config includes MCP server
4. Reconfigure:
   ```bash
   npm run setup
   ```

### ChromaDB Connection Issues

**Issue**: "Cannot connect to ChromaDB"

**Solutions**:
1. Disable Nexa embeddings (use default):
   ```bash
   npm run setup
   # Answer 'n' to "Use Nexa embeddings?"
   ```
2. Ensure ChromaDB is running if you're using it
3. Check host/port settings in config

### Command Fails

**Issue**: Luna command returns an error

**Solutions**:
1. Check you're in a project directory
2. Verify previous steps are complete (e.g., run `/luna-requirements` before `/luna-design`)
3. Check generated files in `.luna/[project-name]/` directory
4. Ensure you have the correct scope (project or feature name)

## 🆘 Getting Help

### Error Reporting

If you encounter issues:

1. **Check the logs**: Claude Desktop has detailed logs
2. **Review generated files**: `.luna/` directory contains all generated documents
3. **Configuration files**: Check `~/.luna-nexa-rag/config.json`
4. **GitHub Issues**: [Report bugs](https://github.com/yourusername/luna-agents/issues)

### Community Support

- **Discord**: [Join our community](https://discord.gg/luna-agents)
- **GitHub Discussions**: [Ask questions](https://github.com/yourusername/luna-agents/discussions)
- **Documentation**: [Full docs](https://docs.luna-agents.dev)

## 🔄 Updating Luna Agents

To update to the latest version:

```bash
cd /path/to/luna-agents
git pull origin main
./setup.sh
```

Restart Claude Desktop after updating.

## 🗑️ Uninstalling

To remove Luna Agents:

```bash
# Remove plugin symlink
rm ~/Library/Application\ Support/Claude/plugins/luna-agents  # macOS
# or
rm ~/.config/Claude/plugins/luna-agents  # Linux

# Remove MCP server config
rm -rf ~/.luna-nexa-rag

# Remove repository (optional)
rm -rf /path/to/luna-agents
```

Restart Claude Desktop to complete uninstallation.

## 📊 System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Disk**: 500 MB free space
- **OS**: macOS 10.15+, Ubuntu 20.04+, Windows 10+

### Recommended
- **CPU**: 4+ cores
- **RAM**: 8 GB
- **Disk**: 2 GB free space
- **SSD**: For better performance

## 🔐 Privacy & Security

Luna Agents:
- ✅ Runs entirely locally
- ✅ No data sent to external servers (except Claude API)
- ✅ Full control over your code
- ✅ Open source - audit the code yourself

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details.

---

**Ready to transform your development workflow? Start with** `./setup.sh` **today! 🌙**
