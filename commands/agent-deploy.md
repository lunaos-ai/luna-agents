---
name: agent-deploy
displayName: Agent Deploy (shortcut)
description: "Shortcut: Deploy a scaffolded agent to CF Workers, AWS Lambda, Cloud Run, k8s, Docker Compose, or Fly. Refuses to ship if eval hasn't passed -> /ll-agent-deploy"
version: 1.0.0
category: ai
agent: luna-deployment
shortcut_for: ll-agent-deploy
---

# Agent Deploy

Shortcut for `/ll-agent-deploy`. Pre-deploy gate runs the eval; prod
requires `confirm=true`.
