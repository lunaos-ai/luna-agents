---
name: ll-swarm-debate
displayName: Luna Swarm Debate — Primary + Critic + Verifier pattern
description: Scaffold a Debate/Review/Verifier-pattern swarm — one agent proposes, a critic challenges, a verifier validates evidence and safety before the final answer. Implements pattern §4.4 from blog/swarm-of-agents.md. Recommended for fintech, security, billing, and any production-action context.
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
  - name: primary
    type: string
    description: Name of the primary analyst agent. Required.
    required: true
  - name: critic
    type: string
    description: Name of the critic agent. Required.
    required: true
  - name: rounds
    type: string
    description: Max debate rounds before forced verifier ruling. Default - 3.
    required: false
  - name: stack
    type: string
    description: Default - node-langgraph.
    required: false
workflow:
  - scaffold_primary_agent
  - scaffold_critic_agent
  - scaffold_verifier_agent
  - scaffold_debate_orchestrator
  - emit_runbook
---

# Luna Swarm Debate

Scaffolds a Debate/Review/Verifier swarm. One agent proposes; a critic
challenges with evidence-backed objections; a verifier rules and
emits the final answer (with a confidence score).

## Why this pattern

From the blog: never trust the first answer. A critic + verifier is
the cheapest way to catch hallucinated tool results, missed evidence,
and unsafe recommendations.

## Flow

```
input
  ↓
primary  →  proposes (with citations)
  ↓
critic   →  challenges (with citations)
  ↓
primary  →  revises (round N)
  ↓
verifier →  rules, emits final answer + confidence
```

## What lands on disk

```
./agents/<name>/
├── primary/         # /ll-agent-build scaffold
├── critic/          # /ll-agent-build scaffold + critic prompt
├── verifier/        # critic + rule-based + policy bundle
├── orchestrator.ts  # round-based debate loop, bounded by `rounds`
└── tests/golden/    # cases with expected verifier ruling
```

## Run it

```bash
# Remediation debate: planner proposes, critic challenges, verifier rules
/ll-swarm-debate \
  name=remediation-debate \
  goal="Propose safe least-privilege replacement for an over-permissioned IAM role" \
  primary=remediation-planner \
  critic=remediation-critic \
  rounds=3
```

## In pipes

```bash
/pipe \
  ll-swarm-debate name=remediation-debate goal="..." primary="..." critic="..." \
  >> ll-no-bluf \
  >> approvals create channel=jira
```

## Honesty

- Each round costs more LLM tokens. Bound `rounds` aggressively for prod.
- The verifier is the final authority; the orchestrator does not let
  the primary "win" simply by speaking last.
- Pairs naturally with `/ll-no-bluf` — the debate produces structured
  claims; no-bluf checks them against tool outputs.

## Pairs with

- [`/ll-swarm-supervisor`](ll-swarm-supervisor.md), [`/ll-swarm-blackboard`](ll-swarm-blackboard.md), [`/ll-agent-build`](ll-agent-build.md), [`/ll-no-bluf`](ll-no-bluf.md).
