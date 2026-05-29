---
title: "Build a democratic, evidence-weighted swarm in 10 minutes — `/ll-swarm-vote`"
slug: tutorial-evidence-voting-swarm
date: 2026-05-30
author: Luna Pipes team
tags: [tutorial, swarm, voting, evidence-weighted, opensyber, mcp]
description: "Step-by-step: scaffold a 6-agent democratic swarm with /ll-swarm-vote, run a real AWS finding through three rounds (independent answers, peer review, vote-with-evidence), watch the verifier veto a hasty Critical call, ship the result with /ll-no-bluf + approval inbox."
---

# Build a democratic, evidence-weighted swarm in 10 minutes

> Three rounds. Six voters. One verifier with veto authority. The
> aggregator scores by evidence quality × agent weight × confidence,
> penalised by contradictions and unsupported claims. Majority alone
> does not decide truth — that's the whole point.
>
> By the end you'll have a runnable swarm that classifies the
> severity of an AWS finding, exposes minority opinions, refuses to
> downgrade an unsupported "Critical" vote, and routes risky actions
> through an approval inbox. ~10 minutes.

## What you'll build

```
question: "What is the severity of this AWS finding?"
   ↓
6 voters answer independently (no peer visibility)
   ↓
peer review (anonymised)
   ↓
vote with evidence
   ↓
aggregator (weight × confidence × evidence quality − contradictions)
   ↓
verifier (veto authority)
   ↓
final decision + minority opinions + approval requirement
   ↓
approvals inbox if risky
   ↓
ticket
```

## Step 0 — Install

```bash
npm install -g luna-agents@latest
luna-setup
```

## Step 1 — Scaffold the OpenSyber severity-vote swarm

```bash
/ll-swarm-vote \
  name=opensyber-severity \
  question="What is the severity of this AWS finding?" \
  voters="iam-evidence,attack-path,asset-criticality,policy,threat-intel,verifier" \
  weights='{"iam-evidence":3,"attack-path":3,"policy":2,"asset-criticality":2,"threat-intel":1,"verifier":99}' \
  rounds=3 \
  verifier_required=true \
  policy_engine=opa
```

What lands on disk:

```
./agents/opensyber-severity/
├── voters/                                # one /ll-agent-build per voter
│   ├── iam-evidence/    weight=3          # read-only AWS IAM tools
│   ├── attack-path/     weight=3          # graph DB only
│   ├── asset-criticality/ weight=2
│   ├── policy/          weight=2
│   ├── threat-intel/    weight=1
│   └── verifier/        weight=99         # veto authority
├── aggregator/
│   ├── scoring.ts                         # implements blog §6 formula
│   └── score-spec.json                    # tunable
├── verifier/
│   └── policies/swarm-vote.rego           # OPA bundle of blog §13 rules
├── orchestrator/
│   ├── rounds.ts                          # 3-round driver
│   └── anonymizer.ts                      # for round 2
├── migrations/                            # blog §10 tables (6 of them)
├── tests/golden/                          # 4 cases incl. the §7 example
├── compose.yml
└── RUNBOOK.md
```

## Step 2 — Boot the stack

```bash
cd agents/opensyber-severity
docker compose up -d
```

Postgres + Redis + OPA + Jaeger + voter containers. Jaeger at
`http://localhost:16686`.

## Step 3 — Run the golden eval

```bash
/ll-agent-eval path=./agents/opensyber-severity
```

Expected:

```
loaded:   4 golden cases

  case 1: AdminAccess on prod role         pass  $0.038  6 agents, 3 rounds
  case 2: unused admin role (low risk)     pass  $0.022  veto by verifier
  case 3: contradicted evidence            pass  $0.029  exposed minority opinion
  case 4: 4-Critical 2-High weak majority  pass  $0.034  evidence flipped result

pass rate:    4/4 (100%)
verifier vetoes: 1
evidence-flips:  1
```

Note case 4: a 4-vs-2 majority would have voted Critical. The
evidence-based aggregator scored High higher because the High voters
had direct AWS CloudTrail evidence and the Critical voters relied on
model reasoning. That's the whole point.

## Step 4 — Run a real finding

```bash
/pipe ll-agent-call name=opensyber-severity \
  input='{"finding_id":"F-123","role":"BillingLambdaRole","permission":"AdministratorAccess"}'
```

Streaming trace:

```
[01] orchestrator: round 1 — independent answers
     iam-evidence       → critical   conf 0.84   evidence: ev_001..ev_003
     attack-path        → critical   conf 0.78   evidence: ev_004..ev_005
     asset-criticality  → high       conf 0.71   evidence: ev_006
     policy             → critical   conf 0.80   evidence: ev_007..ev_008
     threat-intel       → high       conf 0.62   evidence: ev_009 (no active exploit)
     verifier           → pending

[02] orchestrator: round 2 — peer review (anonymised)
     policy        challenges answer_3: "claim 'critical' unsupported by asset criticality"
     threat-intel  challenges answer_1: "no active exploitation observed"
     iam-evidence  supports answer_2 with ev_004

[03] orchestrator: round 3 — vote with evidence
     iam-evidence  vote critical   evidence ev_001..ev_005
     attack-path   vote critical   evidence ev_004..ev_005
     policy        vote critical   evidence ev_007..ev_008
     asset-criticality  vote high  evidence ev_006
     threat-intel  vote high       evidence ev_009  objection "no active exploit"

[04] aggregator
     critical weighted: 3×0.84×1.0 + 3×0.78×1.0 + 2×0.80×0.9 = 6.30
     high weighted:     2×0.71×0.8 + 1×0.62×0.9 = 1.69
     contradictions: 1 (threat-intel)  → −0.5
     final score critical 5.80, high 1.69

[05] verifier
     evidence cited: ok
     contradictions surfaced: ok
     approval_required: true (writes touch prod)
     ruling: APPROVE  decision=critical  confidence=0.81

[06] approvals.create id=appr_5521 channel=email
```

The result includes minority opinions and the approval gate. The
verifier did not need to veto — the aggregator already handled the
contradiction.

## Step 5 — Watch a Critical vote get vetoed

```bash
# A case where 3 agents say Critical with weak reasoning, 2 say High with strong evidence
/pipe ll-agent-call name=opensyber-severity input=@tests/golden/case-4.json
```

Trace tail:

```
[04] aggregator
     critical weighted: 3×0.79×0.3 = 0.71   (model reasoning only, quality 0.3)
     high weighted:     2×0.83×1.0 = 1.66   (direct AWS evidence, quality 1.0)
     final score critical 0.71, high 1.66

[05] verifier
     evidence cited: ok
     unsupported claims: 2 critical voters
     ruling: APPROVE  decision=high  confidence=0.78
     minority_opinion: "3 voters said critical based on model reasoning without
                       direct evidence; evidence-weighted aggregator demoted to high"
```

3-to-2 majority for Critical → final decision High. Evidence
dominated. That's `/ll-swarm-vote` doing its job.

## Step 6 — Compose with the rest of the toolchain

```bash
# Race 5 voting swarms in parallel, pick the cheapest passing one
/pipe \
  ll-agent-swarm name=opensyber-severity input="$FINDING_ID" variants=5 strategy=cheapest \
  >> ll-no-bluf

# Debate then vote
/pipe \
  ll-swarm-debate name=remediation-debate primary=remediation-planner critic=remediation-critic \
  >> ll-swarm-vote name=remediation-vote question="Approve the proposed remediation?" \
  >> approvals create channel=email \
  >> jira create-issue project=SEC

# Vote, then audit, then ship
/pipe \
  ll-agent-call name=opensyber-severity input="$FINDING_ID" \
  >> ll-no-bluf \
  >> approvals create channel=jira metadata="finding=$FINDING_ID"
```

## Step 7 — Deploy

```bash
/pipe \
  ll-agent-eval path=./agents/opensyber-severity \
  >> ll-agent-deploy path=./agents/opensyber-severity target=cf-workers env=staging
```

The eval pass marker is required. Worker + KV + D1 (audit log) +
Vectorize (RAG) come up; each voter is a sub-route.

For prod:

```bash
/ll-agent-deploy path=./agents/opensyber-severity target=k8s env=prod confirm=true
```

Helm chart with one container per voter, the aggregator, the
verifier, and the orchestrator. Postgres + Redis + OPA as you've
configured them.

## What you learned

- **Three rounds, not one.** Independent answers prevent groupthink;
  peer review surfaces contradictions; vote-with-evidence ties
  reasoning to facts.
- **Weight × confidence × evidence quality.** The aggregator's
  formula is the one from `blog/swarm-vote.md` §6 in real
  TypeScript, tunable via `score-spec.json`.
- **Verifier veto is binding.** The orchestrator honours it; you
  can't bypass by re-running.
- **Six audit tables, verbatim.** Every answer, evidence item,
  review, vote, aggregation, and verifier ruling is logged. You can
  reconstruct a decision months later.
- **Minority opinions are exposed.** The result always shows who
  disagreed and why. No silent dissent.

## What's next

- Add a graph-DB-backed Attack-Path voter for the full 7-agent
  OpenSyber severity swarm.
- Tune `score-spec.json` against your historical data.
- Wire the OpenSyber workflow engine to invoke this swarm on every
  `critical_finding_created` event.
- Read the architecture: [`blog/swarm-vote.md`](./swarm-vote.md).
- Pair with [`blog/swarm-of-agents.md`](./swarm-of-agents.md)
  patterns: vote inside a supervisor, vote on the output of a
  debate, vote across blackboard hypotheses.

---

## The whole tutorial as one pipe

```bash
# scaffold + eval + run + audit + ticket
/pipe \
  ll-swarm-vote name=opensyber-severity question="What is the severity?" voters="iam-evidence,attack-path,asset-criticality,policy,threat-intel,verifier" \
  >> ll-agent-eval path=./agents/opensyber-severity \
  >> ll-agent-call name=opensyber-severity input="$FINDING_ID" \
  >> ll-no-bluf \
  >> approvals create channel=jira \
  >> jira create-issue project=SEC title="Severity vote: $FINDING_ID" \
  >> ll-agent-deploy target=cf-workers env=prod confirm=true
```

Seven verbs, one swarm, six voters, three rounds, one approval gate,
one ticket, one production deploy. No glue code.

Voting alone does not decide truth. Evidence does. That's the
architecture. That's the command.

---

*Found a swarm-vote bug? Email
[support@lunaos.ai](mailto:support@lunaos.ai) or file an issue at
[github.com/lunaos-ai/luna-agents](https://github.com/lunaos-ai/luna-agents).*
