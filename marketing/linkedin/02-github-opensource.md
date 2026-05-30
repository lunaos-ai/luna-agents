---
post: 02-github-opensource
target: GitHub repo lunaos-ai/luna-agents
length: ~1400 chars
voice: founder-developer
---

I shipped 358 slash commands as an open-source npm package.

MIT. No telemetry. No SaaS dependency. No cloud account needed to use it.

What's in the box:
• 358 verbs (45 agents + 200+ commands + shortcuts)
• 21 stack-aware "doctors" — React, Svelte, Vue, Node, Vert.x, Spring, Django, FastAPI, Rails, Go, Rust, PHP, .NET, Elixir, Docker, K8s, Terraform, Postgres, Mongo, CVE
• An evidence-weighted democratic voting swarm (/ll-swarm-vote) that beats simple majority
• An honesty auditor (/ll-no-bluf) that detects AI bluffing in commits and docs
• A full agent builder (/ll-agent-build) that scaffolds planner + RAG + MCP tools + verifier + OPA guardrails + approvals + OTel + eval harness
• A 3D system architecture page built with Three.js
• A 60-second playground that parses against the real lexicon

The whole thing installs with one command:
$ npm install -g luna-agents && luna-setup

Then in Claude Code, type / and you get every verb.

The README counters are auto-synced from the filesystem by a script
that ships in the package. The README cannot lie about how many
commands exist. /ll-no-bluf wouldn't let it.

→ github.com/lunaos-ai/luna-agents
→ npmjs.com/package/luna-agents

#OpenSource #AI #ClaudeCode #DeveloperTools #MIT
