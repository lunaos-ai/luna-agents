---
platform: hacker-news
type: Show HN
notes: Submit at https://news.ycombinator.com/submit
optimal_window: Tue/Wed 8-10am ET
---

# Title (80 char max)

Show HN: Luna Pipes – Unix pipes for AI work (358 verbs, MIT, runs locally)

# URL

https://agents.lunaos.ai

# First comment (author)

Hi HN — Shachar here. I built Luna Pipes after a year of shipping AI features and watching three things break repeatedly:

1. AI assistants bluff. They claim work is done that isn't, cite files that don't exist, write commit messages for code they never wrote. Most "AI agent" tooling has no honesty layer at all. So I built /ll-no-bluf — a closed-loop audit that scans commits + docs, verifies each claim against actual code, and either fixes or removes the lies. The Luna repo's own commit history went through this audit before shipping; it found four bluffs in one PR (including a stale command count and a fake 48-hour SLA promise).

2. "Production AI agents" in most tutorials are chatbots. Real production agents need eight components: orchestrator, planner with budgets, context engine (RAG + permission filter + reranker), memory, MCP tool layer, verifier/critic, guardrails/policy, audit. /ll-agent-build scaffolds all eight in one command. The output is a runnable repo with a LangGraph state machine, OPA policy bundle, six Postgres audit tables, OpenTelemetry wired, a golden-eval harness, and deploy configs for Cloudflare Workers / Lambda / k8s / Fly.

3. Workflows that aren't greppable, diffable, and version-controllable don't survive their first month. So everything in Luna is a single pipe expression. Same line runs in your shell, in Claude Code, in GitHub Actions.

The whole thing installs with one command:

  npm install -g luna-agents && luna-setup

Things I'd love feedback on:

- The /ll-swarm-vote evidence-weighted voting (3 rounds — independent answers, anonymised peer review, vote with evidence — aggregator penalises contradictions and unsupported claims, verifier has veto). It exists because in our tests, a 3-to-2 weak-evidence majority for "Critical" kept losing to 2 voters with direct API evidence. The whole point of the swarm is to not trust majority alone.

- The 21 stack-aware "doctors" (React, Svelte, Node, Vert.x, Spring, Django, FastAPI, Rails, Go, Rust, PHP, .NET, Elixir, Docker, K8s, Terraform, Postgres, Mongo, CVE). Each one is honest about which checks are wrapped from existing tools (gosec, clippy, brakeman, hadolint, etc.) vs Luna-original heuristics — vertx-doctor for example is Luna-original because no upstream package exists.

- The /vs page positions Luna as "AI shell language" (uncontested category) vs Cursor / Claude Code / LangGraph / CrewAI / n8n / Willow. It also tries to be explicit about when Luna is the wrong choice (you're a non-coder; you're building a customer-facing agent product; you don't use Claude Code or a Unix-style terminal).

MIT. Runs locally. No telemetry. No SaaS. The README counters are auto-synced from the filesystem by a script that ships in the package — the README cannot lie about how many commands exist, /ll-no-bluf wouldn't allow it.

Source: https://github.com/lunaos-ai/luna-agents
npm: https://www.npmjs.com/package/luna-agents

Happy to answer anything, especially critiques.
