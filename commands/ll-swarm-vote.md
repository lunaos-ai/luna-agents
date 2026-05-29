---
name: ll-swarm-vote
displayName: Luna Swarm Vote — Evidence-weighted democratic swarm
description: Scaffold a democratic agent swarm with evidence-weighted voting. Three rounds (independent answers, peer review, vote-with-evidence), aggregation by agent weight × confidence × evidence quality (penalised by contradictions + unsupported claims), and verifier veto authority. Implements blog/swarm-vote.md end-to-end. Majority alone does not decide truth.
version: 1.0.0
category: ai
agent: luna-design-architect
parameters:
  - name: name
    type: string
    description: Swarm name (./agents/<name>/).
    required: true
  - name: question
    type: string
    description: The decision question the swarm votes on. Required.
    required: true
  - name: voters
    type: string
    description: Comma-separated voter agents. Each gets a /ll-agent-build scaffold. Default - "evidence,risk,policy,general".
    required: false
  - name: weights
    type: string
    description: JSON map of voter -> integer weight (e.g. {"evidence":3,"risk":2,"policy":2,"general":1}). Default - derived from a curated registry.
    required: false
  - name: rounds
    type: string
    description: "3" (default, full flow) | "2" (skip peer review) | "1" (independent only). Production should keep 3.
    required: false
  - name: anonymize_peer_review
    type: string
    description: If "true" (default), peer review sees anonymised answers. Prevents identity-bias.
    required: false
  - name: verifier_required
    type: string
    description: Default - true. Verifier has veto authority per blog §4.7.
    required: false
  - name: policy_engine
    type: string
    description: "opa" | "cedar" | "custom". Default - opa. Enforces the 10 policy rules from blog §13.
    required: false
  - name: stack
    type: string
    description: Default - node-langgraph.
    required: false
  - name: allow_human_approval
    type: string
    description: If "true" (default), risky decisions route through the approvals inbox.
    required: false
workflow:
  - validate_voters_and_weights
  - scaffold_each_voter_via_agent_build
  - scaffold_aggregator_with_scoring_model
  - scaffold_verifier_with_veto_authority
  - scaffold_policy_bundle_implementing_section_13
  - scaffold_voting_tables_from_section_10
  - scaffold_three_round_orchestrator
  - emit_runbook_and_readme
---

# Luna Swarm Vote

Scaffolds an evidence-weighted democratic swarm following
[`blog/swarm-vote.md`](../blog/swarm-vote.md) §5. The output is a
runnable repo with three voting rounds, an aggregator that scores by
evidence (not just count), a verifier with veto authority, and the
six audit tables from §10.

## The flow it scaffolds

```
Question
   ↓
Round 1 — independent answers   (no peer visibility — prevents groupthink)
   ↓
Round 2 — peer review            (anonymised — prevents identity bias)
   ↓
Round 3 — vote with evidence
   ↓
Aggregator
   = weight × confidence × evidence quality
   − contradictions − unsupported claims
   ↓
Verifier (veto authority)
   ↓
Final decision + minority opinions + approval requirement
   ↓
Approvals inbox (if risky)
   ↓
Deterministic execution API
```

## What lands on disk

```
./agents/<name>/
├── voters/                                    # one /ll-agent-build per voter
│   ├── evidence/   weight=3, read-only tools
│   ├── risk/       weight=2
│   ├── policy/     weight=2
│   └── general/    weight=1
├── aggregator/
│   ├── scoring.ts                             # implements the §6 formula
│   └── score-spec.json                        # tunable weights and quality table
├── verifier/
│   ├── verifier.ts                            # veto authority
│   └── policies/swarm-vote.rego               # §13 policy rules in OPA
├── orchestrator/
│   ├── rounds.ts                              # 3-round driver
│   └── anonymizer.ts                          # for peer review
├── migrations/                                # 6 tables from blog §10:
│                                              # agent_evidence, agent_answers,
│                                              # agent_answer_evidence, agent_reviews,
│                                              # agent_votes, agent_vote_results
├── tests/golden/                              # severity-vote + root-cause cases
├── compose.yml                                # postgres + redis + opa + jaeger + voters
└── RUNBOOK.md
```

## Run it

```bash
# OpenSyber severity vote (blog §7)
/ll-swarm-vote \
  name=opensyber-severity \
  question="What is the severity of this AWS finding?" \
  voters="iam-evidence,attack-path,asset-criticality,policy,threat-intel,verifier" \
  weights='{"iam-evidence":3,"attack-path":3,"policy":2,"asset-criticality":2,"threat-intel":1,"verifier":99}' \
  rounds=3 \
  verifier_required=true \
  policy_engine=opa

# Payment failure root-cause vote (blog §8)
/ll-swarm-vote \
  name=payment-root-cause \
  question="What is the root cause of this failed MASAV payment?" \
  voters="message-lifecycle,ledger,operator-response,log-analysis" \
  weights='{"message-lifecycle":3,"ledger":3,"log-analysis":2,"operator-response":1}' \
  allow_human_approval=true
```

## In pipes

```bash
# Race 5 swarm-vote variants, audit the winner, file the ticket
/pipe \
  ll-agent-swarm name=opensyber-severity input="$FINDING_ID" variants=5 strategy=verifier \
  >> ll-no-bluf \
  >> jira create-issue project=SEC

# Single swarm-vote run with approval gate
/pipe \
  ll-swarm-vote name=opensyber-severity \
  >> ll-agent-call name=opensyber-severity input="$FINDING_ID" \
  >> approvals create channel=jira

# Compose with a debate before the vote
/pipe \
  ll-swarm-debate name=remediation-debate primary=remediation-planner critic=remediation-critic \
  >> ll-swarm-vote name=remediation-vote question="Approve the proposed remediation?" \
  >> approvals create channel=email
```

## Enforced policy (§13 of the blog)

The scaffolded OPA bundle enforces:

1. Majority cannot override source-of-truth data.
2. Majority cannot bypass approval policy.
3. Majority cannot authorise high-risk execution.
4. Unsupported claims → zero score.
5. Contradicted claims → negative score.
6. Direct tool evidence beats model-only reasoning.
7. Verifier veto is binding.
8. Risky actions require human approval.
9. Every vote, evidence, review, and tool call is logged.
10. Final result exposes minority opinions and uncertainty.

These live in `verifier/policies/swarm-vote.rego`, not in a prompt.

## Honesty

- The scoring formula is the one from §6 of the blog, in real
  TypeScript / Python, tunable via `score-spec.json`.
- The six DB tables from §10 are verbatim — not paraphrased.
- Verifier veto is a real return value the orchestrator honours; you
  can't bypass it by re-running.
- Peer review anonymisation is real: voter identities are stripped
  before the round-2 prompts are built.

## Pairs with

- [`/ll-swarm-supervisor`](ll-swarm-supervisor.md), [`/ll-swarm-debate`](ll-swarm-debate.md), [`/ll-swarm-blackboard`](ll-swarm-blackboard.md), [`/ll-agent-swarm`](ll-agent-swarm.md) (parallel race), [`/ll-agent-build`](ll-agent-build.md), [`/ll-agent-call`](ll-agent-call.md), [`/ll-no-bluf`](ll-no-bluf.md).
