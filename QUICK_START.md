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
