---
name: ll-agent-swarm
displayName: Luna Agent Swarm — Race N agent variants, keep the best
description: Spawn N variants of an agent in isolated git worktrees, run them in parallel on the same input, then pick the best result by consensus, by verifier score, or by lowest cost. Built on /ll-swarm. Use for ambiguous tasks where you want diverse first attempts before committing.
version: 1.0.0
category: ai
agent: luna-design-architect
parameters:
  - name: name
    type: string
    description: Agent name (scaffold under ./agents/<name>/). Required.
    required: true
  - name: input
    type: string
    description: Input passed to each variant. Required.
    required: true
  - name: variants
    type: string
    description: Number of variants to spawn. Default - 5. Each variant lives in its own git worktree with a slight prompt or temperature perturbation.
    required: false
  - name: strategy
    type: string
    description: "consensus" (majority of K variants must agree) | "verifier" (best score from /ll-no-bluf + verifier) | "cheapest" (lowest cost among passing). Default - verifier.
    required: false
  - name: max_total_cost_usd
    type: string
    description: Total budget across all variants. Default - 10.
    required: false
  - name: keep_all
    type: string
    description: If "true", keep all worktrees + traces for inspection. Default - false (cleanup non-winners).
    required: false
workflow:
  - spawn_variant_worktrees
  - run_each_variant_in_parallel
  - score_each_result
  - apply_strategy
  - emit_winner_with_trace
  - cleanup_unless_keep_all
---

# Luna Agent Swarm

Variant racing for agent runs. Spawns N copies of the agent into
isolated git worktrees, runs them in parallel against the same
input, and picks the winner by your chosen strategy. Built on
[`/ll-swarm`](ll-swarm.md).

## When to use

- **Ambiguous task** — multiple valid approaches; you want to see them.
- **High-stakes recommendation** — consensus across variants > single run.
- **Cost-bounded exploration** — race three cheap variants, keep the cheapest passing one.
- **Verifier-driven** — let `/ll-no-bluf` + the agent's own verifier pick.

## Strategies

| Strategy | Picks |
|---|---|
| `verifier` (default) | Highest score on the agent's verifier + lowest `no-bluf` flag count. |
| `consensus` | Result that K-of-N variants agree on (semantic + structural similarity). |
| `cheapest` | Lowest USD cost among results that pass eval. |

## Run it

```bash
# Race 5 variants of a triage agent
/ll-agent-swarm name=triage input="$ALERT" variants=5

# Three variants of an investigator, pick the cheapest that passes no-bluf
/ll-agent-swarm name=investigator input="$CASE" variants=3 strategy=cheapest

# 7-variant consensus run with a fat budget
/ll-agent-swarm name=remediator input="$FINDING" variants=7 strategy=consensus max_total_cost_usd=20
```

## In pipes

```bash
# Swarm-investigate, audit the winner, file the ticket
/pipe ll-agent-swarm name=investigator input="$CASE" variants=5 \
  >> ll-no-bluf \
  >> jira create-issue "Investigation: $CASE"

# Swarm-build code, race 3 implementations, pick the one that passes /ll-zen
/pipe ll-agent-swarm name=feature-impl input="$SPEC" variants=3 strategy=verifier \
  >> ll-zen \
  >> pr "feat: $SPEC"
```

## Cost guardrails

- `max_total_cost_usd` is shared across variants. If three variants
  cost $9 each at a $20 cap, the fourth is rejected before launch.
- Each variant inherits its parent agent's per-run limits
  (`max_cost_usd`, `max_tool_calls`, `timeout_ms`).
- A swarm where all variants fail eval emits no winner and exits
  non-zero so downstream pipe stages can branch.

## Honesty

- This is real parallelism via git worktrees and the runtime's
  `Promise.all` — not pseudo-async. The worktree paths are printed.
- The "variants" are real prompt / temperature / seed perturbations,
  not the same run repeated. See `agent.json -> swarm.variants` in
  the scaffold.
- `consensus` strategy uses semantic similarity + structural shape
  matching; it's documented in `src/orchestrator.ts` of the
  scaffold. No magic.

## Pairs with

- [`/ll-swarm`](ll-swarm.md) — the underlying worktree-race primitive.
- [`/ll-agent-call`](ll-agent-call.md) — single-shot agent call.
- [`/ll-agent-eval`](ll-agent-eval.md) — eval the winner before ship.
- [`/ll-no-bluf`](ll-no-bluf.md) — verifier input for the `verifier` strategy.
