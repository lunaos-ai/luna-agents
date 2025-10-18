#!/bin/bash

# Luna Agents - Automated Setup Script
# This script sets up the complete Luna Agents plugin and MCP server

set -e

echo "🌙 Luna Agents Setup"
echo "===================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}➜${NC} $1"
}

# Check prerequisites
print_info "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi
print_success "Node.js $(node -v) detected"

# Check Git
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi
print_success "Git $(git --version | cut -d' ' -f3) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi
print_success "npm $(npm -v) detected"

echo ""
print_info "All prerequisites met!"
echo ""

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Setup MCP Server
print_info "Setting up Luna Nexa RAG MCP Server..."
cd mcp-servers/luna-nexa-rag

if [ -f "package.json" ]; then
    print_info "Installing MCP server dependencies..."
    npm install
    print_success "MCP server dependencies installed"
else
    print_error "MCP server package.json not found"
    exit 1
fi

# Run MCP setup
print_info "Configuring MCP server..."
echo ""
echo "You'll be asked to configure the MCP server."
echo "Press Enter to accept defaults or enter custom values."
echo ""

npm run setup

cd "$PROJECT_ROOT"

# Setup Claude Plugin
print_info "Setting up Claude Code Plugin..."
cd .claude-plugin

if [ -f "package.json" ]; then
    print_info "Installing plugin dependencies..."
    npm install
    print_success "Plugin dependencies installed"
fi

cd "$PROJECT_ROOT"

# Create symlink or copy plugin to Claude config
CLAUDE_CONFIG_DIR=""
if [[ "$OSTYPE" == "darwin"* ]]; then
    CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CLAUDE_CONFIG_DIR="$HOME/.config/Claude"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    CLAUDE_CONFIG_DIR="$APPDATA/Claude"
fi

if [ -n "$CLAUDE_CONFIG_DIR" ]; then
    PLUGINS_DIR="$CLAUDE_CONFIG_DIR/plugins"
    mkdir -p "$PLUGINS_DIR"
    
    print_info "Installing plugin to Claude..."
    PLUGIN_DEST="$PLUGINS_DIR/luna-agents"
    
    if [ -L "$PLUGIN_DEST" ] || [ -d "$PLUGIN_DEST" ]; then
        print_info "Removing existing plugin installation..."
        rm -rf "$PLUGIN_DEST"
    fi
    
    ln -s "$PROJECT_ROOT/.claude-plugin" "$PLUGIN_DEST"
    print_success "Plugin installed to $PLUGIN_DEST"
fi

# Create quick start guide
print_info "Creating quick start guide..."
cat > QUICK_START.md << 'EOF'
# 🚀 Luna Agents Quick Start

## What You Just Installed

Luna Agents provides:
- **10 AI Agents** for complete development lifecycle
- **MCP Server** for semantic code search
- **Commands** for workflow automation

## Usage

### In Claude Code:

1. **Start a new project workflow:**
   ```
   /luna-requirements
   ```

2. **Design architecture:**
   ```
   /luna-design
   ```

3. **Create implementation plan:**
   ```
   /luna-plan
   ```

4. **Execute tasks:**
   ```
   /luna-execute
   ```

5. **Review code:**
   ```
   /luna-review
   ```

### Available Commands:
- `/luna-requirements` - Analyze requirements
- `/luna-design` - Create technical design
- `/luna-plan` - Generate task plan
- `/luna-execute` - Implement tasks
- `/luna-review` - Code review
- `/luna-test` - Create tests
- `/luna-deploy` - Deploy to production
- `/luna-docs` - Generate documentation
- `/luna-monitor` - Setup monitoring
- `/luna-review-launch` - Post-launch review

### Semantic Code Search:

The MCP server provides:
- `index_codebase` - Index your project
- `search_context` - Search semantically
- `get_similar_implementations` - Find similar code
- `get_coding_patterns` - Extract patterns

## Configuration

### MCP Server
Config location: `~/.luna-nexa-rag/config.json`

To reconfigure:
```bash
cd mcp-servers/luna-nexa-rag
npm run setup
```

### Plugin
Plugin location: `~/.config/Claude/plugins/luna-agents` (or similar)

## Next Steps

1. **Restart Claude Desktop** to load the plugin
2. Open your project in Claude Code
3. Run `/luna-requirements` to start
4. Follow the workflow commands in order

## Getting Help

- Check generated files in `.luna/[project-name]/`
- Review agent documentation in `.claude-plugin/`
- See main README.md for detailed information

---

**Happy coding with Luna! 🌙**
EOF

print_success "Quick start guide created: QUICK_START.md"

echo ""
echo "=========================================="
print_success "Setup Complete!"
echo "=========================================="
echo ""
echo "📝 What's Next:"
echo ""
echo "1. Restart Claude Desktop to load the plugin"
echo "2. Open your project in Claude Code"
echo "3. Run '/luna-requirements' to start your workflow"
echo ""
echo "📖 Documentation:"
echo "   - Quick Start: ./QUICK_START.md"
echo "   - Full Guide: ./README.md"
echo "   - Plugin Docs: ./.claude-plugin/README.md"
echo ""
echo "🔧 Configuration:"
echo "   - MCP Config: ~/.luna-nexa-rag/config.json"
echo "   - Plugin: $PLUGINS_DIR/luna-agents"
echo ""
echo "🆘 Troubleshooting:"
echo "   - Run 'npm run setup' in mcp-servers/luna-nexa-rag/ to reconfigure"
echo "   - Check Claude Desktop logs for plugin issues"
echo "   - Ensure ChromaDB is running if using Nexa embeddings"
echo ""
print_success "Luna Agents is ready to use! 🌙"
echo ""
