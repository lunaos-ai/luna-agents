---
name: ll-agent-call
displayName: Luna Agent Call — Invoke a built agent as a pipe stage
description: Call an agent (built by /ll-agent-build) as a Luna Pipes verb. Streams the agent's trace back into the pipe so downstream stages can react to its output. Lets agents be composed like any other verb — pipe in input, pipe out structured result.
version: 1.0.0
category: ai
agent: luna-design-architect
parameters:
  - name: name
    type: string
    description: Agent name (matches the directory under ./agents/<name>/). Required.
    required: true
  - name: input
    type: string
    description: The input passed to the agent's goal contract. Required.
    required: true
  - name: env
    type: string
    description: "local" | "staging" | "prod". Default - local (runs via docker-compose); staging/prod hit the deployed endpoint.
    required: false
  - name: timeout_ms
    type: string
    description: Hard timeout for the agent run. Default - 180000 (3 min).
    required: false
  - name: max_cost_usd
    type: string
    description: Abort if the run cost exceeds this. Default - 5.
    required: false
  - name: as
    type: string
    description: Output shape - "json" (default), "text", "markdown".
    required: false
workflow:
  - resolve_agent_directory
  - validate_goal_contract_against_input
  - launch_run_with_limits
  - stream_trace_into_pipe
  - emit_result_in_requested_shape
  - audit_with_no_bluf
---

# Luna Agent Call

Treats a `/ll-agent-build`-scaffolded agent as a verb in the Luna
lexicon. Pipe input in, structured result out — same shape as any
other Luna stage.

## Why this matters

Without `ll-agent-call`, agents are siloed apps. With it, they're
composable verbs:

```bash
# Investigate a failed payment, audit the agent's claims, file a ticket
/pipe ll-agent-call name=payment-investigator input="$PAYMENT_ID" \
  >> ll-no-bluf \
  >> jira create-issue "Payment investigation: $PAYMENT_ID"

# Run a triage agent, then route critical results to slack
/pipe ll-agent-call name=triage input="$ALERT" as=json \
  >> jq '.severity == "critical"' \
  >> slack send "#oncall" "..."
```

The agent's run trace streams into the pipe in real time. Downstream
stages see what the agent decided, which tools it called, and what it
concluded. No black box.

## What gets enforced

- The agent's `agent.json` declares an input schema. `ll-agent-call`
  validates the input against it before launching. No silent type
  drift.
- `max_cost_usd`, `timeout_ms`, and `max_tool_calls` (from
  `agent.json`) are all honoured. Runs that hit any limit emit a
  truncated result with the failure reason.
- The autonomy level is the scaffold's. `ll-agent-call` can't raise
  it; it can only lower it via `dry_run=true`.

## Run it

```bash
# Local: spins up docker-compose if not running, calls the agent
/ll-agent-call name=triage input="alert payload"

# Staging: hits the deployed endpoint
/ll-agent-call name=triage input="alert payload" env=staging

# Prod, JSON output, tight budget
/ll-agent-call name=triage input="alert payload" env=prod max_cost_usd=1 as=json
```

## In pipes

```bash
# Agent calls agent
/pipe ll-agent-call name=research input="$TOPIC" \
  >> ll-agent-call name=writer input="@-"  \
  >> publish notion

# Eval-then-call: only call the agent if eval passed today
/pipe ll-agent-eval path=./agents/triage \
  >> ll-agent-call name=triage input="$ALERT"
```

`@-` means "the previous stage's stdout" — standard Luna idiom.

## Honesty

- The agent's planner may itself emit Luna pipes via the
  `/ll-agent-build`-scaffolded `tools/pipe.ts` adapter. So an agent
  can decide *"run `/ll-no-bluf` on my own output before returning"*.
  This is bounded by the same `max_tool_calls` budget.
- Cost meter is real; OpenTelemetry spans flow to whatever collector
  the scaffold configured.
- No silent retries. If the agent fails, the failure flows through
  the pipe like any other stage error.

## Pairs with

- [`/ll-agent-build`](ll-agent-build.md), [`/ll-agent-eval`](ll-agent-eval.md), [`/ll-agent-deploy`](ll-agent-deploy.md), [`/ll-agent-swarm`](ll-agent-swarm.md), [`/ll-no-bluf`](ll-no-bluf.md), [`/ll-pipe`](ll-pipe.md).
