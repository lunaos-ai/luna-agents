---
title: "Build, swarm, and ship a payment-investigation agent — tutorial, in pipes"
slug: tutorial-build-payment-agent-with-pipes-and-swarm
date: 2026-05-30
author: Luna Pipes team
tags: [tutorial, ai-agents, swarm, mcp, langgraph, opa, payments, fintech]
description: "Step-by-step: scaffold an agent with /ll-agent-build, expose it as a Luna verb with /ll-agent-call, race five variants with /ll-agent-swarm, audit with /ll-no-bluf, and ship to Cloudflare. ~15 minutes end-to-end. Every step is one pipe."
---

# Build, swarm, and ship a payment-investigation agent — tutorial, in pipes

> **Mission.** A failed payment lands in your inbox. You don't know why.
> By the end of this tutorial you'll have a production-shape AI agent
> that investigates the failure, drafts a customer-facing explanation,
> asks for approval before sending it, and ships to Cloudflare — all
> orchestrated through the Luna Pipes language. Five swarmed variants
> race for the best explanation; the winner gets shipped.
>
> **Time.** ~15 minutes if you have Node + Docker. ~25 if you don't.
>
> **Prerequisites.** Node ≥ 18, Docker, a Claude Code install, and a
> Postgres URL (`docker compose` brings one up if you skip this).

---

## What you'll build

```
incoming alert
       ↓
/ll-agent-swarm  (5 payment-investigator variants race)
       ↓
/ll-no-bluf      (audit the winning trace)
       ↓
/ll-agent-call name=writer  (draft customer explanation)
       ↓
human approval inbox
       ↓
/ll-agent-deploy + email send
```

Five separate Luna verbs, one pipe. Every stage is auditable, budgeted,
and observable. The agent doesn't pretend to be the workflow; it's
*inside* the workflow.

---

## Step 0 — Install

```bash
npm install -g luna-agents
luna-setup
```

Then restart Claude Code so it picks up the 344-command plugin.

```bash
luna --version
# luna 2.0.6
```

---

## Step 1 — Scaffold the investigator

```bash
/ll-agent-build \
  name=payment-investigator \
  goal="Investigate why a payment failed by querying the ledger, transactions, and event logs, then explain the root cause in plain language" \
  autonomy=3 \
  stack=node-langgraph \
  llm=anthropic \
  tools=postgres,filesystem,opensyber \
  rag=pgvector \
  memory=postgres+redis \
  policy_engine=opa \
  human_approval=true
```

What lands on disk:

```
./agents/payment-investigator/
├── agent.json                   # goal contract, autonomy=3, max_steps=12
├── src/
│   ├── orchestrator.ts          # LangGraph state machine
│   ├── planner.ts               # bounded; reads agent.json limits
│   ├── tools/postgres.ts        # MCP client to your ledger DB
│   ├── tools/filesystem.ts      # log file access
│   ├── tools/opensyber.ts       # security-context lookups
│   ├── rag/retriever.ts         # pgvector + permission filter
│   ├── verifier.ts              # critic prompt + structural validators
│   ├── policy/policy.rego       # OPA bundle (read-only at L3)
│   └── observability/otel.ts    # spans, cost meter
├── tests/golden/                # six pre-written cases
└── compose.yml                  # local Postgres + Redis + OPA + Jaeger
```

The autonomy validator already enforced the rule from
[`blog/ai-agent.md`](./ai-agent.md) §12: Level 3 = recommend only. The
agent **cannot** write to the ledger, even if its planner suggests
doing so. That guardrail lives in `policy.rego`, not in the prompt.

---

## Step 2 — Boot the local stack

```bash
cd agents/payment-investigator
docker compose up -d
```

You now have:

- Postgres (the agent's memory + audit log + approvals inbox)
- Redis (short-term task state)
- OPA (policy engine)
- Jaeger (OpenTelemetry collector, view at http://localhost:16686)

Hit `http://localhost:16686` to confirm Jaeger is up. Every agent run
will show up as a trace.

---

## Step 3 — Run the golden eval

```bash
/ll-agent-eval path=./agents/payment-investigator
```

You should see something like:

```
loaded:    6 golden cases
running:   parallel (4 at a time)
  case 1   ok    1.2s  $0.018  3 tool calls
  case 2   ok    0.9s  $0.011  2 tool calls
  case 3   ok    1.7s  $0.024  4 tool calls
  case 4   FAIL  2.1s  $0.029  6 tool calls   (hallucination: cited tx_id not in DB)
  case 5   ok    1.5s  $0.020  3 tool calls
  case 6   ok    1.1s  $0.014  3 tool calls

pass rate:    5/6 (83%)
median latency: 1.2s
median cost:   $0.018
hallucinations: 1
```

83% pass is below the default `pass_threshold=0.9`. That's the gate
working as designed. We have a hallucination on case 4 to fix before
we can deploy.

**Fix in pipes:**

```bash
/pipe ll-no-bluf path=./agents/payment-investigator/tests/golden/case-4.json \
  >> ll-agent-eval path=./agents/payment-investigator
```

`/ll-no-bluf` will rewrite the golden case so the expected behaviour
no longer fabricates tx IDs, and re-run the eval. (In real life you'd
also tighten the verifier prompt; the scaffold leaves a comment where
to do that.)

---

## Step 4 — Call the agent as a Luna verb

Now the interesting part. The agent is just a verb in the lexicon.
Use it inside any pipe:

```bash
/pipe ll-agent-call name=payment-investigator input="$PAYMENT_ID"
```

Output streams the agent's trace into the pipe in real time:

```
[01] /ll-agent-call name=payment-investigator
     plan: 1) fetch_tx 2) fetch_ledger 3) check_logs 4) diagnose
     tool: postgres.run_query (1.1s, $0.003)
     tool: postgres.run_query (0.4s, $0.001)
     tool: filesystem.read_file (0.2s, $0.0)
     verifier: pass (3 claims, 3 cited)
     done: $0.018, 2.1s
     result: "Payment failed due to KYC expiry on customer 4421..."
```

Three things to notice:

1. **The trace is real**. Every tool call is a real OpenTelemetry span.
2. **`no-bluf` runs inside the agent**, before the result is emitted. If a claim isn't backed by a tool result, the verifier flags it and the planner re-tries.
3. **You can pipe the result downstream** — that's the whole point.

---

## Step 5 — Add a writer agent for the customer explanation

```bash
/ll-agent-build \
  name=payment-writer \
  goal="Take a payment failure analysis and write a clear, empathetic customer-facing explanation. Max 120 words. No jargon." \
  autonomy=4 \
  stack=node-langgraph \
  llm=anthropic \
  tools=filesystem \
  human_approval=true
```

Autonomy 4 means "prepare action" — drafts an email but doesn't send.
We'll add the send step explicitly later, behind an approval.

---

## Step 6 — Compose the two agents into one pipe

```bash
/pipe ll-agent-call name=payment-investigator input="$PAYMENT_ID" \
  >> ll-agent-call name=payment-writer input=@- \
  >> approvals create channel=email
```

`@-` is the standard Luna idiom for "stdout from the previous stage."

What happens:

1. Investigator emits its diagnosis + JSON evidence.
2. Writer receives it as `input`, drafts a 120-word explanation.
3. `approvals create` writes an entry to the agent's approval inbox
   (Postgres) and pings whoever owns customer comms.

Until a human approves, nothing is sent. That's Level-4 + Level-6
discipline: prepare, don't execute.

---

## Step 7 — Race five investigator variants with the swarm

For ambiguous failures (timeouts, partial settlements, multi-leg
payments) you don't want one investigation, you want five different
angles. Enter `/ll-agent-swarm`:

```bash
/ll-agent-swarm \
  name=payment-investigator \
  input="$PAYMENT_ID" \
  variants=5 \
  strategy=verifier \
  max_total_cost_usd=2
```

Under the hood:

- Five git worktrees spin up, each with a slight prompt / temperature
  perturbation (defined in `agent.json -> swarm.variants`).
- The runtime calls all five in parallel against the same input.
- When all return (or hit timeout), the verifier scores each:
  - `no-bluf` flag count (lower = better)
  - structural completeness of the diagnosis JSON
  - cost
- The winner is emitted; the others are cleaned up (set `keep_all=true`
  to keep them for inspection).

Sample output:

```
spawned: 5 worktrees in 0.4s
running: parallel
  variant-1  ok  2.1s  $0.018  0 bluffs   score 0.92
  variant-2  ok  1.9s  $0.024  1 bluff    score 0.74
  variant-3  ok  1.4s  $0.014  0 bluffs   score 0.91
  variant-4  ok  2.7s  $0.031  0 bluffs   score 0.88
  variant-5  ok  2.2s  $0.020  2 bluffs   score 0.61

winner: variant-1 (0.92)
total cost: $0.107  (under budget $2.00)
```

The winner's full trace flows into the next pipe stage as if it were
a single call.

---

## Step 8 — The full payment-investigation pipe

This is the one-liner the on-call engineer types when a payment fails:

```bash
/pipe \
  ll-agent-swarm name=payment-investigator input="$PAYMENT_ID" variants=5 strategy=verifier \
  >> ll-no-bluf \
  >> ll-agent-call name=payment-writer input=@- \
  >> approvals create channel=email metadata="payment=$PAYMENT_ID" \
  >> jira create-issue project=OPS title="Payment $PAYMENT_ID failed: $WINNER_SUMMARY"
```

Reading left to right:

1. Five investigator variants race; verifier picks the best.
2. The winner's claims are re-audited by `/ll-no-bluf`.
3. Writer drafts the customer-facing explanation.
4. Approval inbox queues it for human send.
5. Jira issue logs the case for the ops team.

One line. Five agents. Six tool integrations. Zero glue scripts.

---

## Step 9 — Deploy

```bash
/ll-agent-deploy path=./agents/payment-investigator target=cf-workers env=staging
/ll-agent-deploy path=./agents/payment-writer       target=cf-workers env=staging
```

Each deploys to its own Worker with KV (cache) + D1 (audit log) +
Vectorize (RAG). The eval gate is enforced — staging deploys need a
passing eval in the last hour.

For production:

```bash
/pipe \
  ll-agent-eval path=./agents/payment-investigator \
  >> ll-agent-deploy target=cf-workers env=prod confirm=true
```

`confirm=true` is required for prod. If `agent.json` has
`human_approval: true`, deploy *also* files an approval request to
the approvals inbox.

---

## Step 10 — Wire the trigger

Per [`blog/ai-agent.md`](./ai-agent.md) §22, the best agent triggers
are workflow state transitions. Here's the cleanest wiring:

```ts
// payment-process-manager: workflow state machine
on("PAYMENT_FAILED", async (event) => {
  await pipe(`
    ll-agent-swarm name=payment-investigator input=${event.paymentId} variants=5 \
    >> ll-no-bluf \
    >> ll-agent-call name=payment-writer input=@- \
    >> approvals create channel=email \
    >> jira create-issue project=OPS title="${event.paymentId}"
  `);
});
```

Same pipe, fired by the workflow, not the human. The agent gets
auto-triggered; the dangerous action (sending the email) still waits
for approval. Per the autonomy ladder: investigation autonomous,
execution gated.

---

## Step 11 — Watch it in production

`http://localhost:16686` while you develop, your real OTel collector in
prod. Every pipe stage is a parent span; every tool call is a child
span. Cost meters and `no-bluf` counters flow through as span
attributes.

A typical trace looks like:

```
pipe (parent)                          12.4s  $0.142
├── ll-agent-swarm                      8.7s  $0.107
│   ├── variant-1                       2.1s  $0.018  (winner)
│   ├── variant-2                       1.9s  $0.024
│   ├── variant-3                       1.4s  $0.014
│   ├── variant-4                       2.7s  $0.031
│   └── variant-5                       2.2s  $0.020
├── ll-no-bluf                          0.4s  $0.001
├── ll-agent-call name=payment-writer   2.8s  $0.029
├── approvals create                    0.1s  $0.000
└── jira create-issue                   0.4s  $0.005
```

If a pipe goes over budget or misses an SLO, that trace is where you
look. No black box.

---

## Step 12 — What you learned

- An agent is a verb. The verb is `/ll-agent-call name=...`.
- The agent's runtime is real (LangGraph state machine, OPA policy,
  Postgres audit log, OTel spans). No magic.
- Composition is what makes them useful. Two agents in a pipe beat
  one mega-agent. Five swarmed variants beat one expensive run.
- Guardrails live in the tool layer, not the prompt. That's why
  Level-3 / Level-6 enforcement holds even when the LLM
  hallucinates an instruction to bypass it.
- The pipe is the program. Every step is greppable, version-
  controllable, observable, and reusable.

---

## What's next

- Tighten the verifier prompt for case-4-style hallucinations.
- Add a `payment-classifier` agent in front of the swarm so cheap
  failures go to a one-shot diagnose and only ambiguous ones get the
  five-variant treatment.
- Plug a `/ll-cve-doctor` step into the deploy pipeline so a kernel
  CVE doesn't ship in your container.
- Read the other half of the story —
  [`blog/agent-builder.md`](./agent-builder.md) for the framing essay,
  and [`blog/ai-agent.md`](./ai-agent.md) for the architecture in
  full.

---

## The whole tutorial, as one pipe

```bash
# scaffold both agents
/pipe \
  ll-agent-build name=payment-investigator goal="Investigate why a payment failed..." autonomy=3 tools=postgres,filesystem \
  >> ll-agent-build name=payment-writer goal="Draft customer explanation..." autonomy=4 tools=filesystem

# eval, swarm, audit, write, approve, ticket
/pipe \
  ll-agent-eval path=./agents/payment-investigator \
  >> ll-agent-swarm name=payment-investigator input="$PAYMENT_ID" variants=5 strategy=verifier \
  >> ll-no-bluf \
  >> ll-agent-call name=payment-writer input=@- \
  >> approvals create channel=email \
  >> jira create-issue project=OPS title="$PAYMENT_ID"

# ship both
/pipe \
  ll-agent-deploy path=./agents/payment-investigator target=cf-workers env=prod confirm=true \
  >> ll-agent-deploy path=./agents/payment-writer       target=cf-workers env=prod confirm=true
```

Eight pipe stages, two agents, one investigation, one customer
explanation, one approval gate, one Jira ticket, two productions
deploys — and not a single line of glue code.

That's the system around the AI. That's the point of Luna Pipes.

---

*Comments? Found a bluff in the tutorial? Email
[support@lunaos.ai](mailto:support@lunaos.ai) or file an issue at
[github.com/lunaos-ai/luna-agents](https://github.com/lunaos-ai/luna-agents).*
