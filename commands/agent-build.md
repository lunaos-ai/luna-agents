---
name: agent-build
displayName: Agent Build (shortcut)
description: "Shortcut: Scaffold a full production AI agent (planner + RAG + MCP + verifier + guardrails + approvals + OTel + eval harness) -> /ll-agent-build"
version: 1.0.0
category: ai
agent: luna-design-architect
shortcut_for: ll-agent-build
---

# Agent Build

Shortcut for `/ll-agent-build`.

Scaffolds a production-shape AI agent: orchestrator, planner,
executor with cost / step / runtime limits, context engine (RAG +
SQL), memory (Postgres + Redis), MCP tool layer, verifier, OPA
policy, audit log, OpenTelemetry, human-approval inbox, and a
golden-case eval harness. Per the autonomy-levels architecture in
[`blog/ai-agent.md`](../blog/ai-agent.md).
