---
name: ll-swarm-supervisor
displayName: Luna Swarm Supervisor — Scaffold supervisor/manager-pattern multi-agent system
description: Scaffold a Supervisor/Manager-pattern swarm — supervisor agent picks the next specialist, specialists return artifacts, verifier gates the final output, executor runs deterministic approved actions only. The safest production pattern from blog/swarm-of-agents.md §4.1.
version: 1.0.0
category: ai
agent: luna-design-architect
parameters:
  - name: name
    type: string
    description: Swarm name (becomes ./agents/<name>/).
    required: true
  - name: goal
    type: string
    description: High-level goal the supervisor will plan against.
    required: true
  - name: specialists
    type: string
    description: Comma-separated specialist agents to scaffold. Each becomes its own /ll-agent-build. Example - "cloud-evidence,attack-path,policy-rag,risk-scoring,remediation-planner,ticket-writer".
    required: true
  - name: tools_per_agent
    type: string
    description: JSON map of specialist -> comma-separated allowed tools. Enforces Rule 5 (tool permissions per agent). Default - derived from a curated registry.
    required: false
  - name: stack
    type: string
    description: "node-langgraph" | "python-langgraph" | "java-spring" | "clojure-pedestal". Default - node-langgraph.
    required: false
  - name: workflow_engine
    type: string
    description: Optional - "temporal" | "step-functions" | "camunda" | "custom". If set, the supervisor is wired as a workflow task instead of a long-running agent. Default - none (supervisor is a LangGraph agent).
    required: false
  - name: shared_state_store
    type: string
    description: "postgres" | "postgres+redis". Default - postgres+redis. Always provisioned; supervisor + specialists read/write via a single typed adapter.
    required: false
  - name: verifier_required
    type: string
    description: Must be "true" for production. Default - true.
    required: false
  - name: executor_pattern
    type: string
    description: "approval-required" (default) | "deterministic-api-only". executor agent uses signed action requests + approval_id from approvals inbox.
    required: false
workflow:
  - validate_specialist_list
  - scaffold_supervisor_agent
  - scaffold_each_specialist_via_agent_build
  - scaffold_verifier_agent
  - scaffold_executor_agent
  - scaffold_shared_state_schema_and_adapter
  - scaffold_audit_tables_from_blog_swarm_of_agents
  - scaffold_handoff_schema
  - emit_supervisor_orchestrator
  - emit_runbook_and_readme
---

# Luna Swarm Supervisor

Scaffolds a Supervisor/Manager-pattern swarm — the safest production
pattern from [`blog/swarm-of-agents.md`](../blog/swarm-of-agents.md)
§4.1. Specialists do narrow work; supervisor decides what runs next;
verifier gates the final output; executor is the only agent allowed
to call write tools, and only with a valid `approval_id`.

## What lands on disk

```
./agents/<name>/
├── supervisor/                          # the conductor (LangGraph)
│   ├── src/orchestrator.ts              # picks next specialist
│   ├── src/planner.ts                   # bounded steps + budgets
│   └── agent.json                       # role, goal, limits
├── specialists/
│   ├── <each>/                          # one /ll-agent-build scaffold per
├── verifier/
│   └── src/verifier.ts                  # critic + rule-based + policy
├── executor/
│   └── src/executor.ts                  # ONLY write-tool caller; needs approval_id
├── shared-state/
│   ├── adapter.ts                       # typed Postgres+Redis adapter
│   └── case.schema.json                 # shared case file schema
├── handoffs/
│   └── handoff.schema.json              # cross-agent handoff envelope
├── migrations/                          # agent_runs, agent_steps, agent_tool_calls,
│                                        #   agent_handoffs, agent_artifacts, agent_approvals
├── compose.yml                          # postgres + redis + opa + jaeger + each agent
├── deploy/                              # cf-workers / k8s / aws / cloud-run
├── tests/golden/                        # per-flow golden cases
└── RUNBOOK.md                           # on-call procedures, approval handling, rollback
```

## Permission enforcement (Rule 5 from the blog)

Each specialist gets a curated tool list. The executor is the only
agent allowed to call write tools, and the policy engine rejects any
executor call without a matching `approval_id` in the approvals
inbox. This is enforced in `policy.rego`, not in the prompt.

## Run it

```bash
# OpenSyber MVP swarm
/ll-swarm-supervisor \
  name=opensyber-swarm \
  goal="Investigate AWS findings and prepare safe remediation plans" \
  specialists="cloud-evidence,attack-path,policy-rag,risk-scoring,remediation-planner,ticket-writer" \
  stack=node-langgraph \
  shared_state_store=postgres+redis \
  verifier_required=true \
  executor_pattern=approval-required

# Payment investigation swarm (4-agent MVP from §13)
/ll-swarm-supervisor \
  name=payment-swarm \
  goal="Investigate failed payments and explain the root cause" \
  specialists="payment-timeline,ledger-reconciliation,explanation-writer" \
  stack=python-langgraph
```

## In pipes

```bash
# Scaffold, audit, eval, deploy in one flow
/pipe \
  ll-swarm-supervisor name=opensyber-swarm goal="..." specialists="..." \
  >> ll-no-bluf \
  >> ll-agent-eval path=./agents/opensyber-swarm \
  >> ll-agent-deploy path=./agents/opensyber-swarm target=cf-workers env=staging

# Use the deployed supervisor as a verb
/pipe \
  ll-agent-call name=opensyber-swarm input="$FINDING_ID" \
  >> jira create-issue project=SEC
```

## Honesty

- The supervisor is a real LangGraph state machine, not a meta-prompt.
- Each specialist is a full `/ll-agent-build` scaffold; budgets stack.
- The executor's write tools are gated by OPA against the approvals
  table. There is no path from a specialist directly to a write tool.
- DB tables (`agent_runs`, `agent_steps`, `agent_tool_calls`,
  `agent_handoffs`, `agent_artifacts`, `agent_approvals`) are the
  ones spec'd in §10 of the swarm blog.

## Pairs with

- [`/ll-swarm-blackboard`](ll-swarm-blackboard.md), [`/ll-swarm-debate`](ll-swarm-debate.md), [`/ll-agent-build`](ll-agent-build.md), [`/ll-agent-call`](ll-agent-call.md), [`/ll-agent-swarm`](ll-agent-swarm.md), [`/ll-no-bluf`](ll-no-bluf.md).
