# 🌙 Luna Agents Quick Reference

## Commands
- `/luna-requirements` - Analyze project requirements
- `/luna-design` - Create technical design
- `/luna-plan` - Generate implementation plan
- `/luna-execute` - Execute tasks
- `/luna-review` - Code review
- `/luna-test` - Create tests
- `/luna-deploy` - Deploy to production
- `/luna-docs` - Generate documentation
- `/luna-monitor` - Setup monitoring
- `/luna-review-launch` - Post-launch review

## Workflow
1. Start in your project directory
2. Run `/luna-requirements [project-name]`
3. Follow commands in order
4. Check `.luna/[project-name]/` for generated files

## Semantic Search
- `index_codebase` - Index your code
- `search_context` - Search by meaning
- `get_similar_implementations` - Find similar code

## Configuration
- MCP: `~/.luna-nexa-rag/config.json`
- Plugin: `~/.config/Claude/plugins/luna-agents`

## Reconfigure
```bash
cd mcp-servers/luna-nexa-rag
npm run setup
```

## Help
- Docs: ./README.md
- Issues: github.com/yourusername/luna-agents/issues
