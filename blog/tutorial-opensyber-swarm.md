---
title: "Build the OpenSyber MVP swarm in 20 minutes — supervisor + 3 specialists + verifier, deployed"
slug: tutorial-opensyber-swarm
date: 2026-05-30
author: Luna Pipes team
tags: [tutorial, swarm, opensyber, security, supervisor-pattern, fintech]
description: "Step-by-step: scaffold a Security Supervisor + Cloud Evidence + Remediation Planner + Verifier swarm with /ll-swarm-supervisor, wire approvals, run a critical IAM finding end-to-end, and ship. The 4-agent MVP from blog/swarm-of-agents.md §13, no chaos, no group chat."
---

# Build the OpenSyber MVP swarm in 20 minutes

> The four-agent MVP from [`blog/swarm-of-agents.md`](./swarm-of-agents.md)
> §13. Supervisor + Cloud Evidence + Remediation Planner + Verifier.
> Tool permissions per agent, shared state in Postgres, executor gated
> by approvals inbox, audit log on every step. Pipes through every
> stage.

## What you'll build

```
critical_finding_created
   ↓
Security Supervisor (chooses next specialist)
   ↓
Cloud Evidence Agent  ── reads AWS IAM + CloudTrail (read-only)
   ↓
Remediation Planner   ── drafts safe least-privilege replacement
   ↓
Verifier              ── checks evidence + safety + approval rules
   ↓
Approvals inbox       ── human reviews
   ↓
Executor              ── applies the approved deterministic action
   ↓
Verification Agent    ── confirms fix
```

Tool permissions, hard-enforced:

| Agent | Read tools | Write tools |
|---|---|---|
| Supervisor | shared-state | shared-state |
| Cloud Evidence | aws read-only | none |
| Remediation Planner | policy docs, remediation templates | dry-run only |
| Verifier | shared-state, audit log | none |
| Executor | shared-state | approved API only, requires `approval_id` |

## Step 0 — Install

```bash
npm install -g luna-agents@latest
luna-setup
```

## Step 1 — Scaffold the swarm in one command

```bash
/ll-swarm-supervisor \
  name=opensyber-mvp \
  goal="Investigate AWS findings and prepare safe remediation plans" \
  specialists="cloud-evidence,remediation-planner" \
  stack=node-langgraph \
  shared_state_store=postgres+redis \
  verifier_required=true \
  executor_pattern=approval-required
```

What lands on disk:

```
./agents/opensyber-mvp/
├── supervisor/                # the conductor (LangGraph)
├── specialists/
│   ├── cloud-evidence/        # /ll-agent-build scaffold, autonomy=2 (read-only)
│   └── remediation-planner/   # autonomy=4 (prepare-action, no execute)
├── verifier/                  # critic + rule-based + OPA bundle
├── executor/                  # ONLY write-tool caller; requires approval_id
├── shared-state/
│   ├── case.schema.json
│   └── adapter.ts             # typed Postgres+Redis adapter
├── migrations/                # all 6 audit tables from blog §10
├── compose.yml                # postgres + redis + opa + jaeger + agents
├── tests/golden/              # 4 golden cases pre-written
└── RUNBOOK.md
```

Six audit tables (from `blog/swarm-of-agents.md` §10):
`agent_runs`, `agent_steps`, `agent_tool_calls`, `agent_handoffs`,
`agent_artifacts`, `agent_approvals`. Real SQL in `migrations/`,
not docs.

## Step 2 — Boot local stack

```bash
cd agents/opensyber-mvp
docker compose up -d
```

You get Postgres + Redis + OPA + Jaeger + each agent as a container.
Jaeger at `http://localhost:16686`. Every pipe span lands there.

## Step 3 — Run the eval

```bash
/ll-agent-eval path=./agents/opensyber-mvp
```

Expected:

```
loaded:   4 golden cases
running:  parallel

  case 1: AdministratorAccess on prod role          pass  0.018  4 calls
  case 2: secret leak via IAM passthrough           pass  0.026  6 calls
  case 3: unused but admin role (low risk)          pass  0.012  3 calls
  case 4: approved-action replay attempt            pass  0.004  1 call

pass rate:    4/4 (100%)
hallucinations: 0
policy violations: 0
```

The deploy gate is now open.

## Step 4 — Walk through a real finding

```bash
/pipe ll-agent-call name=opensyber-mvp \
  input='{"finding_id":"F-123","severity":"critical","asset":"prod-billing-db"}'
```

Streaming trace:

```
[01] supervisor.plan
     plan: 1) cloud-evidence  2) remediation-planner  3) verifier
[02] cloud-evidence.run
     tool: aws.list_role_policies (0.8s, $0.004)
     tool: aws.get_policy_document (0.4s, $0.002)
     tool: aws.get_last_accessed (0.3s, $0.002)
     artifact: evidence (3 entries, confidence high)
[03] supervisor.handoff -> remediation-planner
     reason: evidence sufficient; draft replacement
[04] remediation-planner.run
     tool: rag.search_policy (0.6s, $0.003)
     tool: remediation.dry_run (0.9s, $0.005)
     artifact: plan (action: replace_with_least_privilege, dry-run-ok)
[05] supervisor.handoff -> verifier
[06] verifier.run
     check: evidence cited           ok
     check: contradictions           none
     check: approval_required        true
     check: safety                   ok
     ruling: approve-with-human-review
[07] approvals.create
     id: appr_4421
     status: pending
done in 4.2s. cost $0.029. waiting for human approval.
```

The executor has not run. The dangerous action is queued behind an
approval, exactly as Rule 6 requires.

## Step 5 — Human approves

```bash
luna approvals approve appr_4421 --by alice@team.io
```

(Or use the approvals UI scaffolded under `apps/approvals-inbox/`.)

The supervisor wakes up, dispatches the executor:

```
[08] executor.run
     check: approval_id appr_4421 valid  ok
     tool: aws.apply_remediation (signed, approval_id=appr_4421)  ok
     artifact: change_record id=chg_4421
[09] verification.run
     tool: aws.get_policy_document         ok (matches expected)
     tool: aws.get_last_accessed           ok
     ruling: fix verified
case closed.
```

Total cost: $0.041. Full trace in Jaeger. Approval, change, and
verification all linked by `run_id` in `agent_runs`.

## Step 6 — Compose with the rest of the lexicon

```bash
# Nightly: audit yesterday's high-severity findings
/pipe ll-cve-doctor severity_min=high \
  >> ll-agent-call name=opensyber-mvp input=@- \
  >> jira create-issue project=SEC

# Triage a flood: race 5 supervisor variants, pick the cheapest passing one
/pipe ll-agent-swarm name=opensyber-mvp input="$FINDING_ID" variants=5 strategy=cheapest \
  >> ll-no-bluf

# Add a debate when remediation feels risky
/pipe ll-swarm-debate name=remediation-debate primary=remediation-planner critic=remediation-critic rounds=3 \
  >> approvals create channel=jira
```

## Step 7 — Deploy

```bash
/pipe \
  ll-agent-eval path=./agents/opensyber-mvp \
  >> ll-agent-deploy path=./agents/opensyber-mvp target=cf-workers env=staging
```

The eval pass marker (last hour) is required. Staging up, hit the
Worker endpoint with the same payload from Step 4 and you'll get the
same trace — minus the local Jaeger.

For prod:

```bash
/ll-agent-deploy path=./agents/opensyber-mvp target=k8s env=prod confirm=true
```

Helm chart with agent containers + Postgres (or your managed
service) + Redis + OPA + your OTel backend.

## What you learned

- **One command scaffolds the entire pattern.** Supervisor +
  specialists + verifier + executor + shared state + audit tables.
- **The dangerous step waits for a human.** The executor refuses to
  run without `approval_id`. That refusal lives in OPA policy, not
  in the prompt.
- **Tool permissions are per-agent.** Cloud Evidence cannot write.
  Remediation Planner can dry-run only. Executor is the only writer
  and only with approval.
- **All of it is one pipe.** Investigation, drafting, approval,
  execution, verification — every stage greppable, version-
  controllable, and observable.

## Next steps

- Read [`blog/swarm-of-agents.md`](./swarm-of-agents.md) for the full
  architecture, 10 rules, and 5 patterns.
- Add an Attack-Path Agent and a Policy-RAG Agent for the 6-agent
  build per blog §7.1.
- Wire to your real OTel collector instead of local Jaeger.
- Set up the `EventBridge → opensyber-mvp` trigger so new findings
  auto-investigate without a human invoke.

```bash
# The 6-agent extension
/ll-swarm-supervisor \
  name=opensyber-full \
  goal="..." \
  specialists="cloud-evidence,attack-path,policy-rag,risk-scoring,remediation-planner,ticket-writer"
```

That's the OpenSyber MVP. One supervisor command. Three specialists.
One verifier. One executor. Full audit. No group chat.

---

*Questions, missing tools, or a finding the swarm got wrong? Email
[support@lunaos.ai](mailto:support@lunaos.ai) or file an issue at
[github.com/lunaos-ai/luna-agents](https://github.com/lunaos-ai/luna-agents).*
