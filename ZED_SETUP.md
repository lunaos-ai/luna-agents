# Luna Agents Setup for Zed Editor

🚀 **Quick guide to configure Luna Agents MCP servers in Zed**

## Prerequisites

1. ✅ Zed Editor installed
2. ✅ Luna Agents repository cloned
3. ✅ Run `./setup.sh` from luna-agents directory

## Configuration

### 1. Locate Zed Settings

Open Zed settings file:
- **macOS**: `~/.config/zed/settings.json`
- **Linux**: `~/.config/zed/settings.json`
- **Windows**: `%APPDATA%\Zed\settings.json`

Or use Zed's command palette:
1. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "zed: open settings"
3. Select the settings file

### 2. Add MCP Servers Configuration

Add the following to your Zed `settings.json`:

```json
{
  "context_servers": {
    "luna-nexa-rag": {
      "command": "node",
      "args": [
        "/absolute/path/to/luna-agents/mcp-servers/luna-nexa-rag/build/index.js"
      ],
      "env": {}
    },
    "luna-vision-rag": {
      "url": "https://luna-vision-rag-mcp.broad-dew-49ad.workers.dev/mcp"
    }
  }
}
```

**Important**: Replace `/absolute/path/to/luna-agents` with your actual path!

### 3. Find Your Absolute Path

Run this in your terminal from the luna-agents directory:

```bash
pwd
```

Copy the output and use it in the configuration above.

Example:
```json
{
  "context_servers": {
    "luna-nexa-rag": {
      "command": "node",
      "args": [
        "/Users/yourusername/dev/luna-agents/mcp-servers/luna-nexa-rag/build/index.js"
      ],
      "env": {}
    },
    "luna-vision-rag": {
      "url": "https://luna-vision-rag-mcp.broad-dew-49ad.workers.dev/mcp"
    }
  }
}
```

### 4. Restart Zed

1. Quit Zed completely (`Cmd+Q` on macOS)
2. Reopen Zed
3. MCP servers should now be available

## Verify Installation

### Test Luna Vision RAG (Cloud)

In Zed's AI assistant:
```
Use the health_check tool to verify Luna Vision RAG is working
```

### Test Luna Nexa RAG (Local)

In Zed's AI assistant:
```
Use the index_codebase tool to index my current project
```

## Available Tools

### Luna Vision RAG™ (Cloud - 11 Tools)

**RAG Tools:**
- `rag_setup` - Configure RAG for projects
- `rag_query` - Natural language code search
- `rag_index` - Index files into vector DB

**GLM Vision Tools:**
- `glm_capture` - Screenshot capture
- `glm_analyze` - AI-powered UI analysis
- `glm_test` - Automated GUI testing

**Integration Tools:**
- `integration_validate` - Validate UI vs code
- `integration_generate` - Generate automated tests
- `integration_report` - Create test reports

**Utility Tools:**
- `health_check` - Check API health
- `api_info` - Get endpoint information

### Luna Nexa RAG (Local - 4 Tools)

- `index_codebase` - Index your project
- `search_context` - Search semantically
- `get_similar_implementations` - Find similar code
- `get_coding_patterns` - Extract patterns

## Troubleshooting

### MCP Servers Not Appearing

1. **Check settings file syntax**:
   - Ensure valid JSON (no trailing commas)
   - Use double quotes, not single quotes
   - Check brackets are balanced

2. **Verify absolute paths**:
   ```bash
   # From luna-agents directory
   ls -la mcp-servers/luna-nexa-rag/build/index.js
   ```
   Should show the file exists

3. **Check Zed logs**:
   - Look for MCP-related errors in Zed's output panel
   - Check if servers are starting correctly

4. **Restart Zed completely**:
   - Quit Zed (`Cmd+Q`)
   - Reopen Zed
   - Wait a few seconds for servers to initialize

### Luna Nexa RAG Not Working

1. **Ensure it's built**:
   ```bash
   cd mcp-servers/luna-nexa-rag
   npm run build
   ```

2. **Check Node.js version**:
   ```bash
   node --version  # Should be 18+
   ```

3. **Test manually**:
   ```bash
   node mcp-servers/luna-nexa-rag/build/index.js
   ```
   Should start without errors

### Luna Vision RAG Not Working

1. **Test the cloud endpoint**:
   ```bash
   curl https://luna-vision-rag-mcp.broad-dew-49ad.workers.dev/health
   ```
   Should return healthy status

2. **Check internet connection**:
   - Luna Vision RAG requires internet (cloud-based)

## Configuration Examples

### Minimal Configuration (Cloud Only)

If you only want Luna Vision RAG (no local process):

```json
{
  "context_servers": {
    "luna-vision-rag": {
      "url": "https://luna-vision-rag-mcp.broad-dew-49ad.workers.dev/mcp"
    }
  }
}
```

### Full Configuration (Both Servers)

```json
{
  "context_servers": {
    "luna-nexa-rag": {
      "command": "node",
      "args": [
        "/Users/yourusername/dev/luna-agents/mcp-servers/luna-nexa-rag/build/index.js"
      ],
      "env": {}
    },
    "luna-vision-rag": {
      "url": "https://luna-vision-rag-mcp.broad-dew-49ad.workers.dev/mcp"
    }
  }
}
```

### With Additional MCP Servers

```json
{
  "context_servers": {
    "luna-nexa-rag": {
      "command": "node",
      "args": [
        "/Users/yourusername/dev/luna-agents/mcp-servers/luna-nexa-rag/build/index.js"
      ],
      "env": {}
    },
    "luna-vision-rag": {
      "url": "https://luna-vision-rag-mcp.broad-dew-49ad.workers.dev/mcp"
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/your/projects"
      ]
    }
  }
}
```

## Benefits in Zed

✅ **Fast Performance** - Zed's native speed + cloud MCP  
✅ **No Local Process** - Luna Vision RAG runs in the cloud  
✅ **Semantic Search** - Luna Nexa RAG for code understanding  
✅ **GUI Testing** - Luna Vision RAG for visual testing  
✅ **11 + 4 Tools** - 15 total tools available  

## Next Steps

1. ✅ Configure Zed settings
2. ✅ Restart Zed
3. ✅ Test with `health_check` tool
4. ✅ Start using Luna Agents commands
5. ✅ Index your codebase with `index_codebase`

## Support

- **Documentation**: See main README.md
- **Issues**: https://github.com/shacharsol/luna-agent/issues
- **Zed Docs**: https://zed.dev/docs/context-servers

---

**🎉 You're all set! Luna Agents is now configured in Zed!** 🚀
