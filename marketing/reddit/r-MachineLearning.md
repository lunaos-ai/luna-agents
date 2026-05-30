---
subreddit: r/MachineLearning
optimal_window: weekday morning
angle: technical/research-flavoured; lead with evidence-weighted voting
---

# Title

[P] Evidence-weighted voting for multi-agent decisions — open-source implementation

# Body

I shipped an open-source implementation of evidence-weighted democratic voting for multi-agent decisions, as part of a broader AI shell language.

**The problem:** simple majority voting among LLM agents fails when 3 agents share the same hallucinated assumption and beat 2 agents with direct tool evidence. Confidence calibration in LLMs is poor; agent count is gameable; chain-of-thought reasoning is not evidence.

**The implementation:**

Three rounds:
1. Independent answers (no peer visibility — prevents groupthink)
2. Peer review on anonymised answers (prevents identity bias)
3. Vote with structured evidence (each vote cites evidence_ids)

Aggregation formula:

```
score = agent_weight × confidence × evidence_quality_score
        − contradiction_penalty
        − unsupported_claim_penalty
```

Evidence quality scores (defaults, tunable):
- direct API result: 1.0
- DB source-of-truth: 1.0
- audit log: 0.9
- policy document: 0.8
- RAG chunk: 0.7
- model reasoning only: 0.3
- unsupported claim: 0.0
- contradicted claim: -1.0

Plus a verifier with veto authority (the orchestrator honours veto; you can't re-run to bypass).

**Concrete result:** in our test cases, a 3-vote majority for "Critical" with model-reasoning-only evidence (score 0.71) loses to a 2-vote minority for "High" with direct AWS CloudTrail evidence (score 1.66). The verifier also surfaces minority opinions and required approvals in the final output.

**Six Postgres audit tables** for full traceability: `agent_evidence`, `agent_answers`, `agent_answer_evidence`, `agent_reviews`, `agent_votes`, `agent_vote_results`.

**Scaffolded by** `/ll-swarm-vote` in the [luna-agents](https://github.com/lunaos-ai/luna-agents) package (MIT). The OPA policy bundle that enforces the 10 voting rules ships with the scaffold; it lives in `verifier/policies/swarm-vote.rego`, not in a prompt.

**Architecture writeup:** https://github.com/lunaos-ai/luna-agents/blob/main/blog/swarm-vote.md

**Tutorial:** https://github.com/lunaos-ai/luna-agents/blob/main/blog/tutorial-evidence-voting-swarm.md

Install (uses an LLM provider you configure):

```bash
npm install -g luna-agents
luna-setup
```

I'd value feedback particularly on:
- The aggregation formula (currently linear; would a power-law penalty on contradictions match human judgment better?)
- The independent-then-review-then-vote 3-round structure (vs single-shot + post-hoc verifier)
- Comparison with Anthropic's Constitutional AI critic loop, Google's Self-Consistency, and the recent "Self-Refine" papers

The voting layer is one of several swarm patterns (others: supervisor, blackboard, debate); they compose via a pipe operator (`>>`). Reference architecture is from `blog/ai-agent.md` and `blog/swarm-of-agents.md` in the same repo.
