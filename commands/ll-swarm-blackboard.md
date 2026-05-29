---
name: ll-swarm-blackboard
displayName: Luna Swarm Blackboard — Shared-state multi-agent swarm
description: Scaffold a Blackboard-pattern swarm — every agent reads and writes a typed shared case file (Postgres-backed) instead of passing chat history. Implements pattern §4.5 from blog/swarm-of-agents.md. Use when token cost of message-passing dominates and the case state is structured.
version: 1.0.0
category: ai
agent: luna-design-architect
parameters:
  - name: name
    type: string
    required: true
  - name: goal
    type: string
    required: true
  - name: agents
    type: string
    description: Comma-separated agents that will read+write the blackboard.
    required: true
  - name: case_schema
    type: string
    description: Optional path to a JSON Schema for the case file. Default - generated from goal.
    required: false
  - name: stack
    type: string
    description: Default - node-langgraph.
    required: false
  - name: verifier_required
    type: string
    description: Default - true.
    required: false
workflow:
  - validate_agent_list
  - generate_or_load_case_schema
  - scaffold_blackboard_adapter
  - scaffold_each_agent_with_blackboard_access
  - scaffold_verifier
  - scaffold_audit_tables
  - emit_runbook
---

# Luna Swarm Blackboard

Scaffolds a Blackboard-pattern swarm — typed shared case file in
Postgres, accessed via a single adapter, with per-agent
read/write permissions enforced at the column / JSONB-path level.

## Why this pattern

From the blog: agents should not rely on massive conversation logs.
A structured case file is cheaper, more auditable, and easier to
debug. The blackboard pattern is right when:

- The case state has clear structure (findings, evidence, decisions).
- You want to swap agents without breaking the message format.
- Token cost of passing chat history dominates.
- Verifier needs a typed object to validate, not free-form prose.

## What lands on disk

```
./agents/<name>/
├── blackboard/
│   ├── case.schema.json                 # the shared state schema
│   ├── adapter.ts                       # typed Postgres adapter w/ row-level perms
│   └── policies/blackboard.rego         # which agent can read/write which fields
├── agents/
│   └── <each>/                          # one /ll-agent-build per
├── verifier/                            # checks shape + invariants on each write
├── migrations/                          # blackboard tables + audit
├── tests/golden/                        # blackboard-state golden cases
└── RUNBOOK.md
```

## Run it

```bash
/ll-swarm-blackboard \
  name=incident-board \
  goal="Investigate production incidents using a shared case file" \
  agents="ingest,evidence,timeline,root-cause,fix-proposer" \
  stack=node-langgraph
```

## In pipes

```bash
/pipe \
  ll-swarm-blackboard name=incident-board goal="..." agents="..." \
  >> ll-agent-eval >> ll-agent-deploy target=cf-workers
```

## Honesty

- Row-level permissions are real Postgres policies, not just app code.
- The verifier validates against `case.schema.json`; a write that breaks the schema is rejected at the adapter layer.

## Pairs with

- [`/ll-swarm-supervisor`](ll-swarm-supervisor.md), [`/ll-swarm-debate`](ll-swarm-debate.md), [`/ll-agent-build`](ll-agent-build.md), [`/ll-no-bluf`](ll-no-bluf.md).
