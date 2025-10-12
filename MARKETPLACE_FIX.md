# Marketplace Plugin Discovery Fix

## Problem
When adding the marketplace with `/plugin marketplace add https://github.com/shacharsol/luna-agent`, no available plugins were showing up.

## Root Cause
The `marketplace.json` file was located inside the `.claude-plugin/` directory instead of at the repository root. Claude Code looks for `marketplace.json` at the root of the repository when discovering available plugins from a marketplace source.

## Solution
Created a `marketplace.json` file at the repository root (`/marketplace.json`) that:

1. **Defines the marketplace metadata** - Owner information and marketplace name
2. **Lists available plugins** - Currently contains the `luna-agents` plugin
3. **Specifies the plugin source** - Points to the GitHub repository with the `.claude-plugin` path where the actual plugin files are located

## File Structure
```
luna-agents/
├── marketplace.json          # NEW - Marketplace discovery file (root level)
├── .claude-plugin/
│   ├── marketplace.json      # OLD - Plugin-specific marketplace config
│   ├── claude-plugin.json    # Plugin definition
│   ├── package.json          # Plugin package info
│   ├── commands/             # Plugin commands
│   └── agents/               # Plugin agents
```

## How It Works
1. User runs: `/plugin marketplace add https://github.com/shacharsol/luna-agent`
2. Claude Code fetches the repository and looks for `marketplace.json` at root
3. Reads the marketplace metadata and discovers available plugins
4. Shows "luna-agents" as an available plugin to install
5. When user installs, Claude Code fetches from the specified `path: ".claude-plugin"`

## Testing
After pushing this change to GitHub, users should:
1. Run: `/plugin marketplace add https://github.com/shacharsol/luna-agent`
2. See "luna-agents" listed as an available plugin
3. Install with: `/plugin install luna-agents`

## Key Configuration
The critical part of the new `marketplace.json`:
```json
{
  "plugins": [
    {
      "name": "luna-agents",
      "source": {
        "type": "github",
        "repo": "shacharsol/luna-agent",
        "path": ".claude-plugin"  // Points to actual plugin directory
      }
    }
  ]
}
```

## Next Steps
1. Commit and push the new `marketplace.json` to GitHub
2. Test the marketplace discovery
3. Update documentation if needed
