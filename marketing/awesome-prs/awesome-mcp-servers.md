---
target: punkpeye/awesome-mcp-servers (or similar awesome-mcp curated list)
section: "Code Execution", "Knowledge", or "Aggregators"
pr_title: "Add luna-agents bundle (luna-nexa-rag, luna-glm-vision, luna-vision-rag-client, luna-lexicon)"
---

# Suggested entry

```markdown
- **[luna-agents](https://github.com/lunaos-ai/luna-agents)** — Bundle of four MCP servers shipped with the Luna Agents Claude Code plugin: `luna-nexa-rag` (semantic code search via Nexa SDK embeddings), `luna-glm-vision` (GLM-4V image understanding for UI audits), `luna-vision-rag-client` (composed RAG + vision client), `luna-lexicon` (358-verb Luna Pipes lexicon over MCP). MIT, stdio transport, installs with `npm install -g luna-agents`.
```

# Suggested PR body

Adding [luna-agents](https://github.com/lunaos-ai/luna-agents) — a bundle of four MCP servers shipped together as one npm package.

The servers:

| Server | What it does |
|---|---|
| `luna-nexa-rag` | Semantic code search powered by Nexa SDK embeddings, on-device |
| `luna-glm-vision` | GLM-4V image understanding for UI audits |
| `luna-vision-rag-client` | Composes RAG + vision MCPs into one client |
| `luna-lexicon` | Exposes the 358-verb Luna Pipes lexicon over MCP |

All four are stdio transport, MIT licensed, no SaaS dependency. Installation:

```bash
npm install -g luna-agents
luna-setup
```

Each server's MCP manifest is at `mcp-servers/<name>/.claude-plugin/mcp.json` in the repo.

The package also ships a 358-verb Claude Code plugin and a CLI, but I figured the MCP-server angle is what matters here.

Discovery files:
- https://agents.lunaos.ai/mcp.json
- https://agents.lunaos.ai/server.json
- https://agents.lunaos.ai/llms.txt

Happy to refine the entry — shorter, longer, different section.
