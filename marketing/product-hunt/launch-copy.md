---
platform: product-hunt
optimal_window: 12:01am PT, weekday
notes: Coordinate with hunter + first-50 supporters via Discord/X before launch
---

# Product name

Luna Pipes

# Tagline (60 char max)

Unix pipes for AI work. 358 verbs. MIT. Runs locally.

# Description (260 char)

A concatenative shell language whose only operator is >>. Compose 358 verbs into pipes that run in your terminal, in Claude Code, or in CI. AI honesty auditor, full agent builder, 21 stack-aware doctors, evidence-weighted voting swarm. MIT, no SaaS.

# Topics

- Developer Tools
- AI
- Open Source
- Productivity
- Artificial Intelligence
- Programming Languages

# Maker first comment

Hi Product Hunt 👋

I'm Shachar. I built Luna Pipes because I spent the last year shipping AI features and kept hitting three walls:

1. AI assistants bluff. They claim work is done that isn't.
2. Most "AI agent" tutorials ship chatbots and call them production.
3. Workflows that aren't greppable don't survive a month.

Luna Pipes is one operator (`>>`) and 358 verbs. Compose them like Unix pipes:

```
/req >> plan >> go >> review >> test >> ship
```

Six verbs. A whole sprint.

What's in v2.0.10:

🛡️ /ll-no-bluf — detects and removes AI bluffing in commits and docs (closed-loop audit; this is the differentiator)
🤖 /ll-agent-build — scaffolds the 8 components a production agent actually needs (planner + RAG + MCP + verifier + OPA + approvals + OTel + eval harness)
🗳️ /ll-swarm-vote — evidence-weighted democratic voting (3 rounds; aggregator penalises contradictions; verifier has veto authority)
🏥 21 stack-aware doctors across 5 wings (React, Svelte, Node, Vert.x, Spring, Django, FastAPI, Rails, Go, Rust, PHP, .NET, Elixir, Docker, K8s, Terraform, Postgres, Mongo, CVE)
🎯 4 hero commands: /ll-swarm, /ll-hig, /ll-heal, /ll-zen
🌐 3D architecture page rendered with Three.js, drag to orbit
🎮 In-browser playground that validates against the real 358-verb lexicon

MIT. Runs locally. No telemetry. Install:

```bash
npm install -g luna-agents && luna-setup
```

Things I'd love your feedback on:
• The /ll-no-bluf approach — does it solve a real pain you have?
• The /vs positioning — Luna sits in a new category ("AI shell language") rather than competing with Cursor / Claude Code / LangGraph
• The 21 doctors — what stack would you add next?

I'll be in the comments all day. AMA.

→ Website: https://agents.lunaos.ai
→ Source (MIT): https://github.com/lunaos-ai/luna-agents
→ npm: https://www.npmjs.com/package/luna-agents

— Shachar
