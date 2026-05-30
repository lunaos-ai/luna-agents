---
target: e2b-dev/awesome-ai-agents (or similar awesome-ai-agents list)
section: Tools / Frameworks / Open Source
pr_title: "Add Luna Agents: 8-component production agent scaffolder with swarm patterns"
---

# Suggested entry

```markdown
- **[Luna Agents](https://github.com/lunaos-ai/luna-agents)** — MIT open-source agent builder + composition language. `/ll-agent-build` scaffolds all 8 components a production agent needs (orchestrator, planner with budgets, RAG with permission filter, memory, MCP tool layer, verifier/critic, OPA guardrails, audit + OpenTelemetry). 4 swarm patterns (supervisor, blackboard, debate, evidence-weighted voting). Deploy targets: Cloudflare Workers, AWS Lambda, Cloud Run, k8s, Fly. Composes via `>>` pipe operator. Runs locally, no SaaS.
```

# Suggested PR body

Adding [Luna Agents](https://github.com/lunaos-ai/luna-agents).

Quick facts:

- **Builder:** `/ll-agent-build` scaffolds an entire production-shape agent — orchestrator (LangGraph), planner with `max_steps` / `max_tool_calls` / `max_runtime` budgets, RAG (pgvector / Elasticsearch / Qdrant) with permission filter + reranker, memory (Postgres + Redis), MCP tool clients with per-agent permission scoping, verifier + critic, OPA policy bundle, six-table audit log, OpenTelemetry, approval inbox, golden-case evaluation harness. Deploy configs for Cloudflare Workers / AWS Lambda / Cloud Run / k8s / Docker Compose / Fly.
- **Composition:** agents are verbs. `/ll-agent-call name=X input="..."` invokes one. `>>` composes.
- **Swarm patterns:** supervisor (safest production), blackboard (typed shared state), debate (primary + critic + verifier), evidence-weighted vote (three rounds, aggregator penalises contradictions + unsupported claims, verifier veto).
- **Honesty:** `/ll-no-bluf` audits agent outputs (and human commits + docs) for unverifiable claims. Refuses to ship lies.
- **Autonomy validator:** Level 7 rejected by default unless `override=true` and the goal is read-only. Per the architecture in `blog/ai-agent.md` §12.
- **MIT, runs locally, no SaaS.**

Install:

```bash
npm install -g luna-agents && luna-setup
```

Architecture writeups in `blog/`:
- `blog/ai-agent.md` — the 8-component mental model
- `blog/swarm-of-agents.md` — 5 patterns, 10 rules, OpenSyber reference
- `blog/swarm-vote.md` — evidence-weighted voting architecture
- `blog/agent-builder.md` — what the builder ships

Website: https://agents.lunaos.ai

Happy to refine the entry. Open to a different section placement.
