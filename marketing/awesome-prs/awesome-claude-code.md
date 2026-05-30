---
target: hesreallyhim/awesome-claude-code
file: README.md (or similar curated list)
section: Plugins / Productivity
pr_title: "Add Luna Agents: 358-verb Claude Code plugin with AI honesty auditor"
note: Fork first, add line, open PR. Use this body verbatim or as template.
---

# Suggested entry

```markdown
- **[Luna Agents](https://github.com/lunaos-ai/luna-agents)** — MIT-licensed Claude Code plugin with 358 slash commands composed via a `>>` pipe operator. Includes `/ll-no-bluf` (closed-loop audit that detects and removes AI bluffing in commits and docs), `/ll-agent-build` (scaffolds a production agent with planner + RAG + MCP tools + verifier + OPA guardrails + approvals + OpenTelemetry + eval harness), `/ll-swarm-vote` (evidence-weighted democratic voting), and 21 stack-aware "doctor" commands (React, Svelte, Vue, Node, Vert.x, Spring, Django, FastAPI, Rails, Go, Rust, PHP, .NET, Elixir, Docker, K8s, Terraform, Postgres, Mongo, CVE). Runs locally, no SaaS dependency.
```

# Suggested PR body

Adding [Luna Agents](https://github.com/lunaos-ai/luna-agents), an MIT-licensed Claude Code plugin distributed via npm.

Quick facts:
- 358 slash-command verbs composed via a `>>` pipe operator
- Includes the `/ll-no-bluf` AI honesty auditor (detects and removes bluffing in commits and docs)
- `/ll-agent-build` scaffolds production AI agents with all 8 components (planner + RAG + MCP + verifier + OPA + approvals + OTel + eval)
- `/ll-swarm-vote` runs evidence-weighted democratic voting across multiple agents (beats simple majority by weighting evidence over vote count)
- 21 stack-aware doctor commands for code quality + security
- Runs locally; no SaaS, no telemetry

Install:

```bash
npm install -g luna-agents
luna-setup
```

Then in Claude Code:

```
/plugin marketplace add lunaos-ai/luna-agents
/plugin install luna-agents@luna-agents-marketplace
```

Website (the language reference): https://agents.lunaos.ai

Happy to refine the entry if you'd like a shorter / longer / different-section placement.
