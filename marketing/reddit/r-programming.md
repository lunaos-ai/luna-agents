---
subreddit: r/programming
optimal_window: Tue/Wed 9-11am ET
angle: Unix-pipe-metaphor + open-source angle (no marketing-speak)
---

# Title

I ported the Unix pipe idea to AI workflows. Open source, 358 verbs, no SaaS.

# Body

Unix won because of `|`. 

Every modern alternative for composing work — visual graphs, YAML pipelines, JSON workflows, no-code dashboards — has a worse composition story than what AT&T shipped in 1973.

So I built Luna Pipes: a concatenative shell language whose only operator is `>>`. 358 verbs in the lexicon. MIT. Runs locally. No telemetry. No SaaS dependency.

```
/req >> plan >> go >> review >> test >> ship
```

Same expression runs in your terminal, in Claude Code, in CI.

Three things that might be interesting to /r/programming:

1. **The README cannot lie.** A script that ships in the package syncs all counters (number of commands, agents, etc.) from the filesystem. `npm run readme:check` fails CI on drift. The honesty pass is a first-class command (`/ll-no-bluf`) that audits commits and docs for unverifiable claims.

2. **The agent builder doesn't pretend.** Most "production AI agent" tutorials ship a chatbot with two components (LLM + tool) and call it done. `/ll-agent-build` scaffolds all eight components a production agent actually needs: orchestrator, planner with budgets, context engine (RAG + perm filter + reranker), memory (Postgres + Redis), MCP tool layer with per-agent permissions, verifier/critic, OPA policy bundle, audit log. Plus OpenTelemetry, golden-eval harness, deploy configs for Cloudflare Workers / Lambda / k8s / Fly. The Level-7 autonomy validator refuses unsafe combinations.

3. **Composition over framework.** It's not LangGraph or CrewAI — those build bespoke agent products. Luna composes them. You can pipe in an agent (`/ll-agent-call name=X`), race five variants of it (`/ll-agent-swarm`), run an evidence-weighted vote across multiple agents (`/ll-swarm-vote` — 3 rounds with anonymised peer review and aggregator that penalises contradictions + unsupported claims), then audit the result with `/ll-no-bluf`, then `/ll-pr`. One line.

The whole thing installs with:

```bash
npm install -g luna-agents && luna-setup
```

GitHub (MIT): https://github.com/lunaos-ai/luna-agents
Website: https://agents.lunaos.ai

Critiques welcome. The /vs page is upfront about when Luna is the wrong choice (non-coders → use n8n; building a customer agent product → use LangGraph; don't use Claude Code or a Unix-style terminal → the pipe metaphor is paying tax for no benefit).
