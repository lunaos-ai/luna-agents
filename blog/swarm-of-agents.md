---
title: "Swarm of AI Agents — Architecture, Rules, and Implementation"
slug: swarm-of-agents
date: 2026-05-30
author: Luna Pipes team
tags: [ai-agents, swarm, architecture, opensyber, fintech, mcp, langgraph]
description: "The mental model: workflow as PM, supervisor as team-lead, specialists as workers, verifier as QA, audit log as compliance memory. Five patterns, ten rules, and the OpenSyber-shaped swarm Luna's /ll-swarm-supervisor scaffolds for you."
---

# Swarm of AI Agents — Architecture, Rules, and Implementation

> A swarm should behave like an enterprise team, not a group chat.
> This is the architecture Luna's `/ll-swarm-supervisor`,
> `/ll-swarm-blackboard`, and `/ll-swarm-debate` commands implement.
> If you're building anything beyond a demo, read this first.

## 1. What Is a Swarm of Agents?

A swarm of agents means multiple specialized AI agents work together on one larger goal.

Instead of one general agent doing everything, the work is split between smaller expert agents.

Example — a single general agent might:

- read docs
- check AWS
- query DB
- write report
- create ticket
- recommend fix

A swarm decomposes this into specialists:

- Security Analyst Agent
- Cloud Inventory Agent
- RAG / Knowledge Agent
- Risk Scoring Agent
- Remediation Agent
- Verifier Agent
- Ticket Writer Agent

The goal is not chaos. The goal is a controlled team of AI workers.

A production swarm = specialized agents + explicit coordination rules + shared state + controlled tools + supervisor/workflow + audit trail.

## 2. Simple Mental Model

| Role | Responsibility |
|---|---|
| Workflow | Project manager |
| Supervisor Agent | Team lead |
| Specialist Agents | Workers |
| Shared State | Case file |
| Tools | Controlled systems |
| Verifier Agent | QA / security reviewer |
| Human Approval | Change board |
| Audit Log | Legal / compliance memory |

The swarm should behave like an enterprise team, not a random group chat.

## 3. Example: OpenSyber Agent Swarm

**Goal:** Analyze this critical AWS finding and prepare a remediation plan.

Possible swarm:

1. Cloud Inventory Agent — fetches cloud assets, IAM, network exposure, configuration.
2. Attack Path Agent — builds path from identity to sensitive asset.
3. RAG / Policy Agent — checks company policy, runbooks, compliance rules, previous incidents.
4. Risk Scoring Agent — ranks severity and business impact.
5. Remediation Planner Agent — proposes safe fix, dry-run action, rollback plan, ticket content.
6. Verifier Agent — checks evidence, contradictions, safety, approval requirements.
7. Ticket Agent — creates Jira/Linear draft ticket.

The final output is one clear result, but several agents contributed.

## 4. Main Swarm Patterns

### 4.1 Supervisor / Manager Pattern — `/ll-swarm-supervisor`

The safest production pattern.

```
User / Event
   ↓
Supervisor Agent
   ↓
Chooses which specialist to call
   ↓
Specialist Agent
   ↓
Returns result
   ↓
Supervisor decides next step
```

Use when you want controlled orchestration.

### 4.2 Handoff Chain Pattern

One agent passes control to another agent.

```
Support Agent → Billing Agent → Ledger Agent → Reply Agent
```

Use when the request naturally moves between domains.

### 4.3 Parallel Agents Pattern — `/ll-agent-swarm` (already shipped)

Several agents work at the same time.

```
                ┌─ IAM Agent
Finding ────────┼─ Network Agent
                ├─ Secrets Agent
                ├─ Compliance Agent
                └─ Asset Criticality Agent
                         ↓
                    Aggregator Agent
```

Faster, but costs more and needs a strong merge/verifier step.

### 4.4 Debate / Review / Verifier Pattern — `/ll-swarm-debate`

```
Primary Analyst → Critic → Verifier → Final Answer
```

For fintech, security, billing, and production systems, highly recommended.

### 4.5 Blackboard / Shared Workspace Pattern — `/ll-swarm-blackboard`

All agents read and write to a shared case file. Better than passing huge message histories between agents.

```json
{
  "case_id": "finding-123",
  "facts": [],
  "evidence": [],
  "hypotheses": [],
  "tool_results": [],
  "decisions": [],
  "open_questions": [],
  "final_artifacts": []
}
```

## 5. The Ten Rules

| Rule | What it means |
|---|---|
| 1. No agents-by-job-title | Map agents to concrete tasks, not vague personas |
| 2. Every agent needs a narrow contract | role, goal, tools, forbidden, input/output schema, budget, stop condition, handoff rules |
| 3. Use a supervisor or workflow as the boss | Don't let agents freely talk forever |
| 4. Shared structured state, not only chat history | Postgres / Redis / workflow state store |
| 5. Tool permissions per agent | Not every agent gets every tool |
| 6. Separate recommendation from execution | Investigate auto; execute with approval |
| 7. Add a verifier before final output | Catches hallucination, contradictions, approval gaps |
| 8. Limit loops and cost | max_agents, max_tool_calls, max_handoffs, max_runtime |
| 9. Agents return artifacts, not prose | JSON schemas |
| 10. Log everything | agent_runs, agent_steps, agent_tool_calls, agent_handoffs, agent_artifacts, agent_decisions, agent_approvals, agent_errors |

## 6. Implementation Models

| Model | Best for |
|---|---|
| Workflow-First Swarm (Temporal / Camunda / Step Functions) | Production |
| Supervisor-Agent Swarm | Dynamic investigations |
| Role-Based Crew | Prototypes and demos |
| Group Chat | Brainstorming, research — risky for production |
| Event-Driven Swarm | Backend / microservice scale |

## 7. Recommended OpenSyber Swarm Architecture

```
OpenSyber Workflow Engine
        ↓
Security Supervisor Agent
        ↓
Specialist Agents
        ↓
Verifier Agent
        ↓
Approval Gate
        ↓
Deterministic Remediation API
```

### Recommended agents

1. Finding Intake Agent
2. Cloud Evidence Agent
3. Attack Path Agent
4. Policy / RAG Agent
5. Risk Scoring Agent
6. Remediation Planner Agent
7. Verifier Agent
8. Ticket Agent
9. Executor Agent

### Critical permission rule

Only Executor Agent can call write tools. Executor can only act with `approval_id`. All other agents are read-only or draft-only.

## 8. Example OpenSyber Flow

```
critical_finding_created
   ↓
Supervisor receives finding
   ↓
Cloud Evidence Agent  — collects IAM/network/secrets evidence
   ↓
Attack Path Agent     — exploit path to production
   ↓
Policy Agent          — relevant customer policy
   ↓
Risk Agent            — scores severity
   ↓
Remediation Agent     — drafts fix
   ↓
Verifier Agent        — validates evidence + safety
   ↓
Ticket Agent          — Jira draft
   ↓
Human approves
   ↓
Executor runs deterministic approved action
   ↓
Verification Agent    — confirms fix
   ↓
Workflow closes or reopens
```

## 9. Implementation Skeleton

### Agent definition

```yaml
id: cloud_evidence_agent
name: Cloud Evidence Agent
purpose: Collect cloud evidence for a security finding
model: gpt-5.5
tools:
  - aws.list_iam_roles
  - aws.get_policy_document
  - aws.get_cloudtrail_activity
permissions:
  mode: read_only
input_schema:
  finding_id: string
  cloud_account_id: string
  asset_id: string
output_schema:
  evidence: list
  open_questions: list
  confidence: low|medium|high
limits:
  max_tool_calls: 8
  timeout_seconds: 60
handoff_allowed_to:
  - attack_path_agent
  - verifier_agent
```

### Shared state

```json
{
  "run_id": "run_001",
  "tenant_id": "tenant_123",
  "goal": "Investigate critical finding",
  "status": "collecting_evidence",
  "finding": {},
  "evidence": [],
  "hypotheses": [],
  "risk_score": null,
  "recommendations": [],
  "approval": { "required": false, "status": "not_requested" }
}
```

### Handoff object

```json
{
  "from_agent": "cloud_evidence_agent",
  "to_agent": "attack_path_agent",
  "reason": "Need to determine whether IAM permission creates path to production DB",
  "payload": {
    "role_arn": "arn:aws:iam::123:role/BillingLambdaRole",
    "policies": ["AdministratorAccess"],
    "evidence_ids": ["ev_001", "ev_002"]
  }
}
```

## 10. Recommended Database Tables

```sql
CREATE TABLE agent_runs (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    goal TEXT NOT NULL,
    status TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    trigger_ref TEXT,
    started_at TIMESTAMP NOT NULL DEFAULT now(),
    finished_at TIMESTAMP,
    created_by TEXT
);

CREATE TABLE agent_steps (
    id UUID PRIMARY KEY,
    run_id UUID NOT NULL REFERENCES agent_runs(id),
    agent_id TEXT NOT NULL,
    step_name TEXT NOT NULL,
    status TEXT NOT NULL,
    input_json JSONB,
    output_json JSONB,
    started_at TIMESTAMP NOT NULL DEFAULT now(),
    finished_at TIMESTAMP
);

CREATE TABLE agent_tool_calls (
    id UUID PRIMARY KEY,
    run_id UUID NOT NULL REFERENCES agent_runs(id),
    step_id UUID REFERENCES agent_steps(id),
    agent_id TEXT NOT NULL,
    tool_name TEXT NOT NULL,
    input_json JSONB,
    output_summary JSONB,
    status TEXT NOT NULL,
    duration_ms INTEGER,
    cost_usd NUMERIC(12,6),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE agent_handoffs (
    id UUID PRIMARY KEY,
    run_id UUID NOT NULL REFERENCES agent_runs(id),
    from_agent TEXT NOT NULL,
    to_agent TEXT NOT NULL,
    reason TEXT,
    payload_json JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE agent_artifacts (
    id UUID PRIMARY KEY,
    run_id UUID NOT NULL REFERENCES agent_runs(id),
    artifact_type TEXT NOT NULL,
    title TEXT,
    content_json JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE agent_approvals (
    id UUID PRIMARY KEY,
    run_id UUID NOT NULL REFERENCES agent_runs(id),
    requested_action TEXT NOT NULL,
    requested_by_agent TEXT NOT NULL,
    status TEXT NOT NULL,
    approved_by TEXT,
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
```

These schemas are written by `/ll-swarm-supervisor` into your scaffold's `migrations/` directory.

## 11. Biggest Mistakes to Avoid

1. Too many agents too early
2. Agents with overlapping responsibilities
3. No supervisor
4. No shared state schema
5. No tool permissions
6. No verifier
7. No cost limits
8. No audit log
9. Agents executing production changes directly
10. Using group chat for everything

## 12. Best Starting Swarm

| Use case | Start with |
|---|---|
| OpenSyber MVP | Security Supervisor + Cloud Evidence + Remediation Planner + Verifier |
| Payment / billing investigation | Payment Timeline + Ledger Reconciliation + Explanation + Verifier |
| General investigation | Investigator + Planner + Verifier |

Do not start with 12 agents.

## 13. Production-Safe Formula

- Many agents can think.
- Few agents can write.
- Almost no agent can execute dangerous actions.
- All actions are audited.
- High-risk actions need approval.

## 14. Final Principle

A swarm of agents should not replace your workflow engine, rules engine, or APIs.

The correct model:

```
Workflow controls the process.
Rules control what is allowed.
Supervisor controls the swarm.
Specialist agents perform narrow tasks.
Verifier checks correctness and safety.
Humans approve risky actions.
APIs execute deterministic changes.
Audit log records everything.
```

For OpenSyber and fintech/payment systems, the right philosophy:

> Autonomous intelligence. Controlled execution. Full auditability.

---

*This is the architecture the following commands implement:
[`/ll-swarm-supervisor`](../commands/ll-swarm-supervisor.md),
[`/ll-swarm-blackboard`](../commands/ll-swarm-blackboard.md),
[`/ll-swarm-debate`](../commands/ll-swarm-debate.md),
[`/ll-agent-swarm`](../commands/ll-agent-swarm.md) (parallel race),
[`/ll-agent-build`](../commands/ll-agent-build.md), and
[`/ll-agent-call`](../commands/ll-agent-call.md).*
