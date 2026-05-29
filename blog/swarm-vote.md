---
title: "Evidence-Based Voting for Democratic AI Agent Swarms"
slug: swarm-vote
date: 2026-05-30
author: Luna Pipes team
tags: [ai-agents, swarm, voting, evidence-weighted, opensyber, fintech]
description: "Majority alone does not decide truth. Evidence decides truth. Policy decides permission. Humans approve risk. The architecture Luna's /ll-swarm-vote scaffolds — independent answers, peer review, evidence-weighted aggregation, verifier veto."
---

# Evidence-Based Voting for Democratic AI Agent Swarms

> Majority alone does not decide truth.
> Evidence decides truth.
> Policy decides permission.
> Humans approve risk.
>
> This is the architecture [`/ll-swarm-vote`](../commands/ll-swarm-vote.md)
> implements. Independent answers, peer review, evidence-weighted
> aggregation, verifier veto, audit log on every step.

## 1. Definition

Evidence-Based Voting is a decision method for multi-agent AI systems
where agents do not simply vote based on opinion. Each agent must
support its vote with evidence, confidence, source quality, and
reasoning.

The final decision is not selected only by the number of votes.

Instead, the system evaluates:

```
votes
+ evidence quality
+ source reliability
+ agent expertise
+ confidence
+ contradictions
+ risk level
+ policy constraints
```

## 2. Why Simple Majority Voting Is Not Enough

Three agents voting "Critical" with weak reasoning beat two voting
"High" with direct AWS evidence — only if you count heads. That's
how majority gets confidently wrong.

Production rule: **do not count only votes. Score the evidence
behind each vote.**

## 3. Where Evidence-Based Voting Fits

```
Task / Question
   ↓
Independent Agent Answers   (no peer visibility yet — prevents groupthink)
   ↓
Evidence Collection
   ↓
Peer Review
   ↓
Vote With Evidence
   ↓
Evidence-Based Aggregator
   ↓
Verifier / Policy Engine
   ↓
Recommendation / Ticket / Report
   ↓
Human Approval if Risky
   ↓
Deterministic Execution API
```

**Use for:** risk classification, root-cause hypothesis ranking,
severity, remediation recommendation, support investigation,
architecture review, code review, compliance mapping.

**Do NOT use alone for:** moving money, posting ledger entries,
deleting resources, rotating production secrets, approving
legal/compliance finals, executing high-risk cloud changes.

## 4. Core Concepts

### 4.1 Vote, Evidence, Quality

| Term | Meaning |
|---|---|
| Vote | Selected answer/position |
| Evidence | Facts supporting the vote, from tools / DB / cloud API / logs / RAG / audit / graph |
| Quality | Direct API > DB source-of-truth > audit > policy > RAG > model reasoning > unverified > contradicted |

### 4.2 Agent Weight

Not all agents have equal influence. The agent closest to the source
of truth gets more weight.

| Agent | Suggested Weight |
|---|---|
| Cloud Evidence Agent | 3 |
| Attack Path Agent | 3 |
| Policy Agent | 2 |
| Risk Scoring Agent | 2 |
| General Reasoning Agent | 1 |
| Ticket Writer Agent | 0 (no technical vote) |
| Verifier Agent | **Veto authority** |

### 4.3 Confidence

LLM confidence is poorly calibrated. Use it only with evidence
quality, never alone.

### 4.4 Contradiction

When one piece of evidence conflicts with another. Lowers the final
score, can trigger verifier review.

### 4.5 Veto

The verifier can block the final result even if most agents voted for it.

```
4 agents vote to execute remediation.
Verifier Agent says approval is missing.
Final result: blocked.
```

For security, fintech, billing, and production systems, veto is essential.

## 5. The Flow (7 Steps)

1. **Independent Answers** — each agent answers without seeing peers. Prevents groupthink.
2. **Evidence Submission** — structured evidence per answer.
3. **Peer Review** — agents review anonymized answers, challenge weak evidence.
4. **Vote With Evidence** — final vote, after seeing reviews.
5. **Aggregation** — weighted by agent, confidence, evidence quality, penalised by contradictions.
6. **Verifier Check** — approve, downgrade, request evidence, block, or escalate.
7. **Final Decision** — includes minority opinions, contradictions, approval requirement, safe next action.

## 6. The Scoring Model

```
score =
  vote_weight
  × agent_weight
  × confidence
  × evidence_quality_score
  − contradiction_penalty
  − unsupported_claim_penalty
```

Evidence quality scores:

| Source | Score |
|---|---|
| Direct API evidence | 1.0 |
| Database source-of-truth | 1.0 |
| Audit log | 0.9 |
| Policy document | 0.8 |
| RAG chunk | 0.7 |
| Model reasoning only | 0.3 |
| Unsupported claim | 0.0 |
| Contradicted claim | −1.0 |

The evidence-backed vote dominates a high-confidence but weak-evidence vote.

## 7. Example: OpenSyber Severity Vote

Input: `AWS role BillingLambdaRole has AdministratorAccess. Decide severity.`

Six agents vote: 4 Critical, 2 High. Simple majority → Critical.

Evidence-based result:

```json
{
  "final_decision": "critical",
  "reason": "Critical IAM permission attached to a role with access path to production DB secret.",
  "evidence": [
    "AdministratorAccess attached to BillingLambdaRole",
    "Role was used in last 24 hours",
    "Role can access Secret Y",
    "Secret Y grants access to production DB"
  ],
  "minority_opinion": "Threat Intel voted High because no active exploitation observed.",
  "approval_required": true,
  "allowed_next_action": "create_ticket_and_request_approval"
}
```

Critical because the evidence supports Critical — not because four agents voted for it.

## 8. Example: Payment Failure Root Cause

Five agents vote on root cause of a failed MASAV payment.

```json
{
  "final_decision": "operator_timeout",
  "confidence": 0.76,
  "evidence": [
    "Payment sent at 10:04",
    "No pacs.002 response received within SLA",
    "No ledger posting occurred",
    "Matching correlation ID found in DLQ"
  ],
  "recommended_action": "manual review or controlled retry",
  "blocked_actions": [
    "automatic resend",
    "manual ledger posting without approval"
  ]
}
```

The swarm may recommend a controlled retry. It does **not**
automatically resend the payment.

## 9. Data Structures (excerpt)

### Agent Answer

```json
{
  "answer_id": "answer_001",
  "agent_id": "iam_evidence_agent",
  "answer": "critical",
  "confidence": 0.84,
  "evidence": [
    {
      "evidence_id": "ev_001",
      "source": "aws_iam",
      "source_type": "direct_api",
      "claim": "AdministratorAccess is attached to BillingLambdaRole",
      "raw_ref": "tool_call_123",
      "quality_score": 1.0
    }
  ],
  "reasoning_summary": "Broad privileges and recent production use.",
  "missing_evidence": [
    "Need to confirm if role can access production secrets"
  ],
  "risks_if_wrong": "Could overstate severity if role is unused or sandbox-only"
}
```

### Peer Review

```json
{
  "review_id": "review_001",
  "reviewer_agent_id": "policy_agent",
  "target_answer_id": "answer_001",
  "assessment": "partially_supported",
  "supported_claims": ["Role has broad IAM permissions"],
  "unsupported_claims": ["Production impact not yet proven"],
  "contradictions": [],
  "requested_more_evidence": ["Asset criticality", "CloudTrail last-used data"]
}
```

### Vote

```json
{
  "vote_id": "vote_001",
  "agent_id": "policy_agent",
  "vote": "high",
  "confidence": 0.74,
  "supports_answer_id": "answer_002",
  "evidence_ids": ["ev_004", "ev_009"],
  "objections": ["Critical requires confirmed production exposure"],
  "approval_required": true
}
```

### Aggregator Result

```json
{
  "final_decision": "critical",
  "decision_method": "weighted_evidence_vote",
  "vote_summary": { "critical": 4, "high": 2, "medium": 0 },
  "weighted_score": { "critical": 8.7, "high": 4.1, "medium": 0 },
  "evidence_quality": "strong",
  "contradictions": ["Threat Intel says no active exploitation observed"],
  "final_confidence": 0.81,
  "requires_human_approval": true,
  "allowed_next_action": "create_ticket_only"
}
```

## 10. Database Tables

```sql
CREATE TABLE agent_evidence (
    id UUID PRIMARY KEY,
    run_id UUID NOT NULL,
    agent_id TEXT NOT NULL,
    source TEXT NOT NULL,
    source_type TEXT NOT NULL,
    claim TEXT NOT NULL,
    raw_ref TEXT,
    quality_score NUMERIC(4,3),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE agent_answers (
    id UUID PRIMARY KEY,
    run_id UUID NOT NULL,
    agent_id TEXT NOT NULL,
    answer TEXT NOT NULL,
    confidence NUMERIC(4,3),
    reasoning_summary TEXT,
    missing_evidence JSONB,
    risks_if_wrong TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE agent_answer_evidence (
    answer_id UUID NOT NULL REFERENCES agent_answers(id),
    evidence_id UUID NOT NULL REFERENCES agent_evidence(id),
    PRIMARY KEY (answer_id, evidence_id)
);

CREATE TABLE agent_reviews (
    id UUID PRIMARY KEY,
    run_id UUID NOT NULL,
    reviewer_agent_id TEXT NOT NULL,
    target_answer_id UUID NOT NULL REFERENCES agent_answers(id),
    assessment TEXT NOT NULL,
    supported_claims JSONB,
    unsupported_claims JSONB,
    contradictions JSONB,
    requested_more_evidence JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE agent_votes (
    id UUID PRIMARY KEY,
    run_id UUID NOT NULL,
    agent_id TEXT NOT NULL,
    vote TEXT NOT NULL,
    confidence NUMERIC(4,3),
    supports_answer_id UUID REFERENCES agent_answers(id),
    evidence_ids JSONB,
    objections JSONB,
    approval_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE agent_vote_results (
    id UUID PRIMARY KEY,
    run_id UUID NOT NULL,
    final_decision TEXT NOT NULL,
    decision_method TEXT NOT NULL,
    vote_summary JSONB,
    weighted_score JSONB,
    evidence_quality TEXT,
    contradictions JSONB,
    final_confidence NUMERIC(4,3),
    requires_human_approval BOOLEAN DEFAULT false,
    allowed_next_action TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
```

These are written by `/ll-swarm-vote` into your scaffold's `migrations/`.

## 11. Pseudocode

```python
def evidence_based_vote(task, agents, verifier):
    # Round 1 — independent answers, no peer visibility
    answers = [a.solve(task, visible_peer_answers=None) for a in agents]

    evidence_graph = normalize_evidence(answers)

    # Round 2 — peer review, answers anonymised
    anon = anonymize_answers(answers)
    reviews = [a.review(task, answers=anon, evidence=evidence_graph) for a in agents]

    # Round 3 — final votes
    votes = [a.vote(task, answers=anon, reviews=reviews, evidence=evidence_graph) for a in agents]

    # Aggregate by evidence, not only count
    result = aggregate_votes(
        votes=votes,
        answers=answers,
        evidence=evidence_graph,
        method="weighted_evidence_vote",
    )

    # Verifier check
    verification = verifier.check(task=task, result=result, evidence=evidence_graph)
    if verification.veto:
        return {
            "status": "blocked",
            "reason": verification.reason,
            "safe_next_step": verification.safe_next_step,
            "result_before_veto": result,
        }

    return {"status": "accepted", "result": result, "verification": verification}
```

## 12. Aggregation Logic

```python
def calculate_vote_score(vote, agent_profile, evidence_items):
    agent_weight = agent_profile.weight
    confidence = vote.confidence or 0.5
    evidence_score = mean(e.quality_score for e in evidence_items)
    contradiction_penalty = count_contradictions(vote) * 0.5
    unsupported_claim_penalty = count_unsupported_claims(vote) * 0.75
    return max(
        agent_weight * confidence * evidence_score
            - contradiction_penalty
            - unsupported_claim_penalty,
        0,
    )
```

## 13. Policy Rules

1. Majority vote cannot override source-of-truth data.
2. Majority vote cannot bypass approval policy.
3. Majority vote cannot authorise high-risk execution.
4. Unsupported claims receive low or zero score.
5. Contradicted claims reduce score.
6. Evidence from direct tools beats model-only reasoning.
7. Verifier can veto unsafe decisions.
8. Human approval is required for risky actions.
9. All votes, evidence, reviews, and tool calls must be logged.
10. Final result must expose minority opinions and uncertainty.

## 14. Recommended Use in OpenSyber

| Use for | Don't use alone for |
|---|---|
| Severity classification | Executing cloud remediation |
| Blast-radius assessment | Deleting IAM users |
| Attack-path confidence | Rotating secrets |
| Remediation plan selection | Changing firewall rules |
| Policy mapping | Quarantining production assets |
| Ticket priority | Closing critical findings without review |
| False-positive analysis |  |

Correct model: Agents vote on recommendation → Verifier checks
evidence → Policy engine checks permission → Human approves risky
actions → Deterministic API executes.

## 15. Recommended Use in Payment / Billing

| Use for | Don't use alone for |
|---|---|
| Root-cause analysis | Posting ledger entries |
| Payment lifecycle reconstruction | Resending payment |
| Operator failure classification | Reversing transaction |
| Ledger mismatch investigation | Issuing refund |
| Support explanation | Changing customer balance |
| Manual operation recommendation | Approving suspicious transaction |

Correct model: Agents vote on likely cause → Verifier checks logs +
DB evidence → Workflow decides next state → Human approves
operational action → Deterministic service performs financial action.

## 16. Final Principle

Evidence-based voting is **not** pure democracy. It is:

```
democracy constrained by evidence
evidence constrained by source-of-truth
source-of-truth constrained by policy
policy constrained by human approval for risk
```

The practical formula:

- Use **voting** to improve reasoning.
- Use **evidence** to decide truth.
- Use **policy** to decide permission.
- Use **humans** to approve risk.
- Use **deterministic services** to execute.
- Use **audit logs** to prove what happened.

---

*Scaffolded by [`/ll-swarm-vote`](../commands/ll-swarm-vote.md).
Pairs naturally with [`/ll-swarm-supervisor`](../commands/ll-swarm-supervisor.md),
[`/ll-swarm-debate`](../commands/ll-swarm-debate.md),
[`/ll-no-bluf`](../commands/ll-no-bluf.md), and
[`/ll-cve-doctor`](../commands/ll-cve-doctor.md).*
