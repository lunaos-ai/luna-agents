---
title: "The agent is not the AI. Here's the one-line command that builds one anyway."
slug: agent-builder
date: 2026-05-30
author: Luna Pipes team
tags: [ai-agents, mcp, langgraph, opa, opentelemetry, cloudflare, kubernetes, agent-architecture]
description: "Production AI agents need eight components and most teams ship two of them. /ll-agent-build scaffolds all eight — planner, RAG, MCP tools, verifier, guardrails, approvals, audit, eval — in one command."
---

# The agent is not the AI. Here's the one-line command that builds one anyway.

> **TL;DR.** Production AI agents are eight components, not two.
> `/ll-agent-build` scaffolds all eight — planner, RAG layer, memory,
> MCP tool clients, verifier, OPA guardrails, human-approval inbox,
> OpenTelemetry, and an evaluation harness — in a single command, on
> the stack of your choice. Then `/ll-agent-eval` gates the deploy;
> `/ll-agent-deploy` ships it to Cloudflare Workers, AWS Lambda,
> Cloud Run, k8s, Docker Compose, or Fly. Defense-only by default.
> Level-7 autonomy is rejected unless you really know what you're
> doing.

## The thing most "AI agent" tutorials get wrong

The word "agent" has been doing too much heavy lifting. People hear
it and picture an LLM with a tool call. Then they ship a chatbot
behind an MCP server and call it production.

Real production agents are closer to this:

```
Goal
 ↓
Agent Orchestrator
 ↓
Planner / Reasoner               (bounded steps, budget, runtime)
 ↓
Context Engine: RAG + memory     (with permission filter + rerank)
 ↓
Tool Layer: MCP servers / APIs   (typed, idempotent, auditable)
 ↓
Verifier / Critic                (catches hallucinated tool results)
 ↓
Guardrails / Policy / Approval   (OPA + signed action requests)
 ↓
Action / final answer            (with full audit trail)
```

Eight components. Most teams ship two — the LLM and the tool. The
other six are why agents that "work great in demos" don't survive
their first month in production.

We wrote a longer essay on this in [`blog/ai-agent.md`](./ai-agent.md).
Read it if you want the mental model in full. This post is about the
command we shipped so you don't have to write all eight by hand.

## Meet `/ll-agent-build`

```bash
/ll-agent-build \
  name=opensyber-remediator \
  goal="Investigate AWS IAM findings, draft remediation plan, request approval before applying" \
  autonomy=6 \
  stack=node-langgraph \
  tools=aws,github,jira,opensyber \
  rag=pgvector \
  memory=postgres+redis \
  policy_engine=opa \
  human_approval=true
```

That command lands in your repo a directory like this:

```
./agents/opensyber-remediator/
├── README.md                        # what this agent does + how to run it
├── RUNBOOK.md                       # on-call procedures, approval gates, rollback
├── agent.json                       # goal contract, autonomy level, limits
├── src/
│   ├── orchestrator.ts              # LangGraph state machine
│   ├── planner.ts                   # goal → steps, with max_steps/calls/runtime
│   ├── executor.ts                  # tool dispatch + retry + idempotency keys
│   ├── verifier.ts                  # critic prompt + rule-based validators
│   ├── policy/policy.rego           # OPA policy
│   ├── tools/                       # one MCP client per tool
│   ├── rag/{retriever,reranker,compress}.ts
│   ├── memory/{postgres,redis,vector}.ts
│   ├── observability/otel.ts        # spans + cost meter + structured logs
│   └── human/{approval-inbox,signed-requests}.ts
├── migrations/                      # Postgres schema for tasks, runs, audits, approvals
├── tests/
│   ├── golden/                      # input + expected behaviour
│   └── e2e/                         # full-loop test against a sandbox
├── Dockerfile
├── compose.yml                      # full local: agent + postgres + redis + opa + jaeger
├── deploy/                          # CF Workers / k8s / Terraform per stack
├── .github/workflows/agent-ci.yml   # lint + test + golden eval gate
└── .env.example
```

That's the eight components, materialised. Run `npm install && docker
compose up`, and you have a local-running agent with Postgres + Redis
+ OPA + a Jaeger dashboard.

## What we are honest about

This is a scaffold, not a magician.

- It does **not** decide your business logic. The agent does.
- It does **not** ship a Level-7 autonomous agent unless your goal is
  read-only and you pass `override=true`. The autonomy validator
  rejects unsafe combinations.
- It does **not** invent tools — every MCP client is the official
  reference client wired into the executor.
- It does **not** write your tests. It writes the *harness*. Golden
  cases are your job; the eval command runs them.

These are the same constraints any production agent should have. We
just bake them into the scaffold so you can't accidentally ship
without them.

## The autonomy ladder, enforced

From [`blog/ai-agent.md`](./ai-agent.md) §12:

| Level | What the agent can do | Default? |
|---|---|---|
| 0 | Nothing (no agent) | n/a |
| 1 | Assist (Q&A) | OK |
| 2 | Investigate (read-only) | OK |
| 3 | Recommend | **Default for new builds** |
| 4 | Prepare action (draft tickets / PRs) | OK |
| 5 | Execute low-risk action | requires audit + verifier |
| 6 | Execute high-risk action with approval | requires `human_approval=true` |
| 7 | Fully autonomous high-risk | **rejected by default** |

For fintech, billing, cloud security, payments, and compliance: 3-4
by default, 5 for safe actions, 6 only with approval, avoid 7.

The validator enforces this. You can't pass `autonomy=7` and
`human_approval=false` unless your goal is provably read-only. If you
try, the command exits with a clear refusal:

```
✗ autonomy=7 with human_approval=false is rejected.
  Goal mentions: "apply remediation", "execute", "modify".
  These are not read-only actions.
  Use autonomy=6 + human_approval=true, or revise the goal.
```

## The eval gate

```bash
/ll-agent-eval path=./agents/opensyber-remediator
```

Runs the golden suite scaffolded in `tests/golden/`, scores each
case on:

- **Task completion** — did it satisfy the goal?
- **Tool-call efficiency** — calls vs the budget in the case spec.
- **Hallucination rate** — every claim cites a real tool result (verified through `/ll-no-bluf`).
- **Latency** — p50, p95, p99.
- **Cost** — token + tool USD per case.
- **Policy compliance** — OPA / Cedar bundle violations (must be 0).
- **Approval discipline** — did it actually wait for the inbox before executing Level-6 actions?

The eval pass marker is required by `/ll-agent-deploy`. If eval
hasn't passed in the last hour, deploy refuses (override:
`skip_eval=true`, audited).

## The deploy

```bash
/ll-agent-deploy path=./agents/opensyber-remediator target=k8s env=prod confirm=true
```

Targets supported today:

- `cf-workers` — Worker + KV (cache) + D1 (audit) + Vectorize (RAG).
- `aws-lambda` — Lambda + RDS / Aurora Serverless + ElastiCache + OpenSearch + EventBridge triggers.
- `cloud-run` — Cloud Run + Cloud SQL + Memorystore + Vertex AI optional.
- `k8s` — Helm chart with agent + Postgres + Redis + OPA + Jaeger.
- `docker-compose` — local dev only.
- `fly` — Fly Machine + Fly Postgres + Upstash Redis.

Each uses the platform's native tooling — `wrangler deploy`, `sam
deploy`, `gcloud run deploy`, `helm upgrade`, `flyctl deploy`. No
magic. No invented dashboards.

## End-to-end, in one line

The whole flow composes through the pipe operator the way Unix
pipes always wanted you to:

```bash
/pipe ll-agent-build name=triage goal="Investigate failed payments and draft an explanation" autonomy=3 \
  >> ll-no-bluf \
  >> ll-agent-eval \
  >> ll-agent-deploy target=cf-workers env=staging
```

That builds the scaffold, audits it for fake claims, runs the golden
suite, and deploys to staging — in a single line, with the eval gate
enforced.

## What's next

A few things on the path:

- **More stack templates**: `python-langgraph`, `rust-axum`, `go-fiber`, `cf-workers` are in the first release. `java-spring`, `kotlin-vertx`, and `csharp-aspnet` are coming.
- **More MCP tools wired**: the first cut covers github, postgres, aws, jira, slack, gmail, filesystem, opensyber. Tell us what's missing in [/feedback](/feedback).
- **A live demo agent** in the [/play](/play) playground that scaffolds itself in front of you. We'll ship this once the playground has a sandbox executor.

## Try it

```bash
npm install -g luna-agents@latest
luna-setup

# Inside Claude Code, or in your shell:
/ll-agent build name=my-first-agent goal="..."  autonomy=3
```

Or compose with the rest of the [hospital](/hospital), the
[showcase](/showcase), and the [skills](/skills) the way Unix
intended.

The agent is not the AI. The agent is the system around the AI. We
just shipped a command that scaffolds the system.

---

*If you want the long-form mental model — workflow vs agent, autonomy
levels, triggers, when not to use an agent — read
[`blog/ai-agent.md`](./ai-agent.md). It's the architecture that
`/ll-agent-build` implements.*
