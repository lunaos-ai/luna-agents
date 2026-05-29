---
name: ll-agent-build
displayName: Luna Agent Builder — Scaffold a production AI agent
description: Scaffold a full production AI agent with planner + executor + RAG + memory + MCP tool layer + verifier + guardrails + human-in-the-loop + audit log + OpenTelemetry. Implements the autonomy-levels architecture from the blog. Output is a runnable repo, not just a prompt.
version: 1.0.0
category: ai
agent: luna-design-architect
parameters:
  - name: name
    type: string
    description: Agent name (kebab-case). Becomes the project directory and service name.
    required: true
  - name: goal
    type: string
    description: One-line goal. The system prompt seed. Be specific (see blog ai-agent.md §6.1).
    required: true
  - name: autonomy
    type: string
    description: Level 0-7 per the autonomy ladder. Default - 3 (recommend). Levels 6/7 require human_approval=true. Level 7 is rejected unless override=true and the goal is read-only.
    required: false
  - name: stack
    type: string
    description: "node-langgraph" | "python-langgraph" | "rust-axum" | "go-fiber" | "cf-workers". Default - node-langgraph.
    required: false
  - name: llm
    type: string
    description: "anthropic" | "openai" | "bedrock" | "local-ollama". Default - anthropic.
    required: false
  - name: tools
    type: string
    description: Comma-separated MCP tools to wire (github, postgres, aws, jira, slack, gmail, filesystem, opensyber). Default - github,postgres,filesystem.
    required: false
  - name: rag
    type: string
    description: "none" | "pgvector" | "elasticsearch" | "qdrant". Default - pgvector.
    required: false
  - name: memory
    type: string
    description: "postgres" | "postgres+redis". Default - postgres+redis.
    required: false
  - name: policy_engine
    type: string
    description: "opa" | "cedar" | "custom". Default - opa.
    required: false
  - name: human_approval
    type: string
    description: If "true", high-risk actions require explicit approval via the approvals/ inbox before execution. Default - true. Cannot be set false if autonomy >= 6.
    required: false
  - name: out_dir
    type: string
    description: Where to scaffold. Default - ./agents/<name>/
    required: false
workflow:
  - validate_autonomy_vs_approval
  - scaffold_orchestrator
  - scaffold_planner
  - scaffold_executor_with_limits
  - scaffold_rag_layer
  - scaffold_memory_layer
  - scaffold_mcp_tool_clients
  - scaffold_verifier_and_critic
  - scaffold_policy_engine_config
  - scaffold_audit_log_schema
  - scaffold_opentelemetry
  - scaffold_human_approval_inbox
  - scaffold_evaluation_harness
  - scaffold_deploy_configs
  - emit_readme_and_runbook
---

# Luna Agent Builder

Scaffolds a full production AI agent following the architecture from
[`blog/ai-agent.md`](../blog/ai-agent.md). The output is a runnable
repository with the eight components every serious agent needs:

1. **Goal contract** — typed input, no free-text drift.
2. **System policy** — constitution + autonomy level + stop conditions.
3. **Planner** — turns goal into bounded step list (`max_steps`, `max_tool_calls`, `max_runtime`).
4. **Context engine** — RAG with query rewrite + hybrid search + permission filter + reranker + compressor. SQL for structured data; vector for documents.
5. **Memory** — short-term in Redis, long-term in Postgres, domain memory in vector store, optional graph layer for attack-path-style relationships.
6. **Tool layer** — MCP servers exposing typed, permission-aware, auditable, idempotent tools.
7. **Verifier / critic** — same-LLM verifier prompt + rule-based validators + policy engine.
8. **Guardrails + human-in-the-loop** — OPA / Cedar policies, approvals inbox, signed action requests, full audit log.

Plus deployment configs and an evaluation harness with golden test
cases — because a production agent without eval is just a chatbot.

## Honest scope

This command **scaffolds** an agent. It writes the orchestrator,
planner, tool clients, RAG retriever, verifier, policy bundles, audit
schema, OpenTelemetry wiring, deploy configs (Docker, Compose,
Cloudflare, k8s), and an evaluation harness. It does **not**:

- Decide your business logic (that's the agent's job).
- Invent LLM or framework wheels — it wires existing best-in-class
  packages (LangGraph, OpenTelemetry, Open Policy Agent, pgvector,
  Anthropic / OpenAI / Bedrock SDKs, MCP TS / Py reference clients).
- Hand you Level-7 autonomy. The autonomy validator rejects unsafe
  combinations (see §22 of the blog).

## What gets written

```
./agents/<name>/
├── README.md                            # what the agent does + how to run it
├── RUNBOOK.md                           # on-call procedures, approval gates, rollback
├── agent.json                           # goal contract, autonomy level, limits
├── src/
│   ├── orchestrator.ts                  # main loop (LangGraph state machine)
│   ├── planner.ts                       # goal -> steps, with limits
│   ├── executor.ts                      # tool call dispatch + retry + idempotency
│   ├── verifier.ts                      # critic + rule-based validators
│   ├── policy/policy.rego               # OPA policy
│   ├── tools/                           # MCP client per tool (one file each)
│   ├── rag/{retriever,reranker,compress}.ts
│   ├── memory/{postgres,redis,vector}.ts
│   ├── observability/otel.ts            # spans + structured logs + cost meter
│   └── human/{approval-inbox,signed-requests}.ts
├── migrations/                          # Postgres schema (tasks, runs, audits, approvals)
├── tests/
│   ├── golden/                          # case + expected behaviour
│   └── e2e/                             # full-loop test against a sandbox
├── Dockerfile
├── compose.yml                          # full local: agent + postgres + redis + opa + jaeger
├── deploy/
│   ├── cf-workers/wrangler.toml         # if stack=cf-workers
│   ├── k8s/                             # helm-style manifests
│   └── terraform/                       # for AWS / GCP variants
├── .github/workflows/agent-ci.yml       # lint + test + golden eval gate
└── .env.example
```

## Autonomy ladder (enforced by the validator)

Per [`blog/ai-agent.md`](../blog/ai-agent.md) §12.

| Level | Can do | Allowed combinations |
|---|---|---|
| 0 | No agent | n/a |
| 1 | Assist (Q&A) | any |
| 2 | Investigate (read-only) | any |
| 3 | Recommend (drafts plans) | any |
| 4 | Prepare action (tickets, PR drafts) | any |
| 5 | Execute low-risk action | requires audit_log + verifier |
| 6 | Execute high-risk with approval | requires human_approval=true |
| 7 | Fully autonomous high-risk | **rejected by default**, override + read-only goal only |

For fintech / billing / cloud security: **3-4 default, 5 for safe
actions, 6 only with approval, avoid 7.**

## Run it

```bash
# A read-only investigation agent (Level 2)
/ll-agent-build name=balance-investigator \
  goal="Investigate customer balance mismatches by querying the ledger, transactions, and event logs" \
  autonomy=2 \
  stack=python-langgraph \
  tools=postgres,filesystem \
  rag=pgvector

# A cloud-remediation agent (Level 6 with approval — OpenSyber style)
/ll-agent-build name=opensyber-remediator \
  goal="Investigate AWS IAM findings, draft remediation plan, request approval before applying" \
  autonomy=6 \
  stack=node-langgraph \
  tools=aws,github,jira,opensyber \
  rag=pgvector \
  memory=postgres+redis \
  policy_engine=opa \
  human_approval=true

# A documentation agent on Cloudflare Workers (Level 3)
/ll-agent-build name=docs-summarizer \
  goal="Summarise new docs uploads and route to the right team channel" \
  autonomy=3 \
  stack=cf-workers \
  tools=filesystem,slack \
  rag=qdrant
```

## In pipes

```bash
# Scaffold + deploy + eval in one line
/ll-agent-build name=triage-bot goal="..." autonomy=3 >> ll-agent-eval >> ll-agent-deploy target=cf-workers

# Scaffold, audit the scaffold for fake claims, then PR
/ll-agent-build name=foo goal="..." autonomy=4 >> ll-no-bluf >> pr "feat: scaffold foo agent"
```

## What it composes (no invention)

- **Orchestration**: [LangGraph](https://www.langchain.com/langgraph) (state-machine), or your stack's equivalent.
- **LLM clients**: official SDKs (Anthropic, OpenAI, Bedrock, Ollama).
- **MCP**: official `@modelcontextprotocol/sdk` (TS) or `mcp` (Python).
- **RAG**: `pgvector`, OpenSearch, Qdrant — your choice.
- **Memory**: Postgres + Redis. Schema scaffolded in `migrations/`.
- **Policy**: [Open Policy Agent](https://www.openpolicyagent.org/) by default; Cedar or custom supported.
- **Observability**: OpenTelemetry SDK with cost/latency/tool-call meters.
- **Eval**: golden cases + regression harness; hooks into `/ll-no-bluf` to check the agent isn't claiming work it didn't do.

## Pairs with

- [`/ll-agent-deploy`](ll-agent-deploy.md) — push the scaffold to CF Workers / Lambda / Cloud Run / k8s.
- [`/ll-agent-eval`](ll-agent-eval.md) — run golden cases + regression suite.
- [`/ll-no-bluf`](ll-no-bluf.md) — verifies the agent's claims about its own runs.
- [`/ll-hospital`](ll-hospital.md) — sweep the scaffolded repo for the usual issues before shipping.

## What it will not do

- Build a Level-7 agent on a high-risk goal. The validator rejects it.
- Wire a tool you didn't ask for. Tools are explicit.
- Hide approval gates. If `human_approval=true`, every Level-6 action goes through the inbox; the inbox is a real DB-backed table, not a UI placeholder.
