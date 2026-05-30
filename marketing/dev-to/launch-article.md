---
title: "I built a programming language for AI work. It has one operator and 358 verbs."
published: false
description: "Luna Pipes is a concatenative shell language for composing AI work. >> is the only operator. 358 slash commands in the lexicon. MIT, open source, runs locally. Here's why a 1973 Unix idea is still the right answer for AI workflows in 2026."
tags: ai, claudecode, opensource, developertools
canonical_url: https://agents.lunaos.ai/manifesto
series: Luna Pipes
cover_image: https://agents.lunaos.ai/og.svg
---

Unix won because of `|`.

Every modern alternative — visual graphs, YAML pipelines, JSON workflows, no-code dashboards, chat history as state — has a worse composition story than the pipe character the AT&T people shipped in 1973.

So I built [Luna Pipes](https://agents.lunaos.ai): a concatenative AI shell language whose only operator is `>>`.

Read left to right:

```
/req >> plan >> go >> review >> test >> ship
```

Six verbs. One sentence. A full software-development-lifecycle pipeline.

Or:

```
/persona generate >> ghost "launch post" * 4 >> publish notion
```

Generates 4 personas, writes one launch post per persona, publishes all four to Notion.

Or compose agents:

```
/ll-agent-swarm name=payment-investigator variants=5 strategy=verifier
  >> ll-no-bluf
  >> ll-agent-call name=writer input=@-
  >> approvals create channel=email
  >> jira create-issue
```

Eight pipe stages. Two agents. Five swarm variants. One approval gate. One ticket. Zero glue code.

## Why this, why now

Three things broke for me in the last year of building with AI:

**1. AI assistants bluff.**

They claim work is done that isn't. They cite files that don't exist. They write commit messages for code they never wrote. They tell you "tests pass" without running them. They say "production-ready" with a TODO three lines down.

This isn't a model problem. It's an honesty problem.

So I built [`/ll-no-bluf`](https://agents.lunaos.ai/skills#no-bluf) — a closed-loop audit that scans commits + docs, verifies each claim against the actual code, and either fixes or removes the lies. The history of the Luna repo went through this audit before shipping. It found:

- "127 HIG checks" → replaced with "WCAG 2.2 AA" (verifiable)
- "48-hour reply SLA" → removed (we don't have one)
- "registered 285 commands" → corrected (count was stale)
- Plugin install syntax `luna-agents@luna-agents` → corrected to the actual marketplace name

Four bluffs in one PR. Zero in production.

**2. "AI agent" tutorials build chatbots.**

Real production agents have eight components. Most builds ship two (the LLM and the tool) and call it production:

```
Goal → Orchestrator → Planner → Context engine (RAG + memory)
     → Tool layer (MCP) → Verifier/critic
     → Guardrails/policy/approval → Action with audit trail
```

So [`/ll-agent-build`](https://agents.lunaos.ai/skills) scaffolds all eight. One command. The output is a runnable repo with a LangGraph orchestrator, OPA policy bundle, six audit tables in Postgres, OpenTelemetry wired, golden-eval harness, and deploy configs for Cloudflare Workers / AWS Lambda / Cloud Run / k8s / Fly.

**3. Workflows that aren't greppable don't survive a month.**

A YAML config is not a workflow language. A drag-drop graph is not a workflow language. A chat history is not a workflow language.

The pipe expression is greppable, diffable, version-controllable, CI-runnable. Same line runs in your terminal, in Claude Code, in GitHub Actions.

## What's in the box

- 358 verbs (slash commands) in the lexicon
- 45 specialized agents
- 21 stack-aware "doctor" commands across 5 wings (React, Svelte, Vue, Node, Vert.x, Spring, Django, FastAPI, Rails, Go, Rust, PHP, .NET, Elixir, Docker, K8s, Terraform, Postgres, Mongo, CVE)
- 4 swarm patterns: supervisor, blackboard, debate, evidence-weighted vote
- Full agent builder (`/ll-agent-build`) + eval harness + deployer
- 3D system architecture page (Three.js)
- 60-second in-browser playground that validates against the real lexicon

All MIT. Runs locally. No SaaS dependency. No telemetry.

```bash
npm install -g luna-agents
luna-setup
```

Then inside Claude Code, type `/` and you get every verb.

## The one that surprised people most

`/ll-swarm-vote` — an evidence-weighted democratic swarm. Three rounds: (1) independent answers, (2) anonymised peer review, (3) vote with evidence. The aggregator scores by `agent_weight × confidence × evidence_quality − contradictions − unsupported_claims`. Verifier has veto authority.

Result: a 3-to-2 majority for "Critical" can lose to 2 voters with stronger evidence. That's the whole point. Majority does not decide truth — evidence does.

## Where it sits in the stack

Luna doesn't replace Cursor (you still write code in it). Luna doesn't replace Claude Code (it ships *as* a Claude Code plugin). Luna doesn't replace LangGraph / CrewAI (those are frameworks for building bespoke agent products; Luna is for shipping *your own* features faster).

| Product | Mental model |
|---|---|
| Cursor | AI pair programmer |
| Claude Code | AI terminal operator |
| LangGraph / CrewAI | Agent workflow engine |
| n8n / Zapier | Visual automation |
| Willow | AI agent governance / IAM |
| **Luna Pipes** | **AI shell language** |

That last category was uncontested when I started.

## Try it

- Website: [agents.lunaos.ai](https://agents.lunaos.ai)
- npm: `luna-agents`
- GitHub (MIT): [lunaos-ai/luna-agents](https://github.com/lunaos-ai/luna-agents)
- 60-second playground: [agents.lunaos.ai/play](https://agents.lunaos.ai/play)

If you ship AI features and your reviewers can't tell which claims are real and which are vibes — install [`/ll-no-bluf`](https://agents.lunaos.ai/skills) and let me know how many bluffs it finds in your first PR. Open an issue, I read every one.

— Shachar
