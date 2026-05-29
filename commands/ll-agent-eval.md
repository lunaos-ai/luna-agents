---
name: ll-agent-eval
displayName: Luna Agent Eval — Golden tests + regression for AI agents
description: Run an agent's golden test suite, score task completion / tool-call efficiency / cost / latency / hallucination rate. Pipes through /ll-no-bluf to verify the agent isn't claiming work it didn't do. Required gate before /ll-agent-deploy.
version: 1.0.0
category: ai
agent: luna-testing-validation
parameters:
  - name: path
    type: string
    description: Path to the scaffolded agent.
    required: true
  - name: cases
    type: string
    description: Optional glob for which golden cases to run. Default - tests/golden/**/*.json.
    required: false
  - name: max_cost_usd
    type: string
    description: Abort run if total cost exceeds this. Default - 5.
    required: false
  - name: pass_threshold
    type: string
    description: Required pass rate (0-1). Default - 0.9.
    required: false
workflow:
  - load_golden_cases
  - run_agent_in_sandbox
  - score_each_case
  - aggregate_metrics
  - audit_with_no_bluf
  - emit_eval_report
  - set_eval_pass_marker_for_deploy
---

# Luna Agent Eval

Production agents without eval are just chatbots. This command runs
the golden test suite scaffolded by `/ll-agent-build` and gates
deployment on the result.

## What gets scored

For each case:

- **Task completion** — did it satisfy the goal?
- **Tool-call efficiency** — number + cost of tool calls vs the budget in the case spec.
- **Hallucination rate** — does every claim cite a real tool result? (via `/ll-no-bluf`)
- **Latency** — p50, p95, p99 across cases.
- **Cost** — token + tool USD per case.
- **Policy compliance** — did it respect the OPA / Cedar bundle?
- **Approval discipline** — did it actually wait for the approval inbox before executing Level-6 actions?

Aggregated:

- Pass rate (passed cases / total).
- Median + p95 latency.
- Mean + p95 cost.
- Hallucination rate.
- Policy violations (must be 0 to pass).

## Run it

```bash
/ll-agent-eval path=./agents/triage
/ll-agent-eval path=./agents/triage cases="tests/golden/critical/*.json" pass_threshold=1.0
/ll-agent-eval path=./agents/triage max_cost_usd=2
```

## In pipes

```bash
/ll-agent-build name=foo goal="..." >> ll-agent-eval >> ll-agent-deploy
/ll-agent-eval path=./agents/foo >> ll-no-bluf >> pr "chore: agent eval baseline"
```

## What it composes

- The agent's own LangGraph (or equivalent) runtime.
- A sandbox harness: tools return canned responses from the golden case spec, so eval is deterministic and cheap.
- `promptfoo` for prompt-level snapshots (optional).
- `/ll-no-bluf` for the honesty pass on the agent's own trace.

## Pairs with

- [`/ll-agent-build`](ll-agent-build.md), [`/ll-agent-deploy`](ll-agent-deploy.md), [`/ll-no-bluf`](ll-no-bluf.md).
