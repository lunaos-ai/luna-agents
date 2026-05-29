---
name: ll-agent
displayName: Luna Agent — build / eval / deploy dispatcher
description: One verb to drive the agent toolchain. Routes to /ll-agent-build, /ll-agent-eval, /ll-agent-deploy based on the subcommand. Default - if `path` exists and has agent.json, runs eval+deploy; else builds.
version: 1.0.0
category: ai
agent: luna-design-architect
parameters:
  - name: subcommand
    type: string
    description: "build" | "eval" | "deploy" | "auto". Default - auto.
    required: false
  - name: path
    type: string
    description: Path to an existing scaffold (for eval / deploy) or where to scaffold (for build).
    required: false
workflow:
  - parse_subcommand_or_autodetect
  - dispatch
---

# Luna Agent

Single entry point for the agent toolchain. Picks the right command
based on what's already on disk.

## Subcommands

| Subcommand | Routes to |
|---|---|
| `build` | [`/ll-agent-build`](ll-agent-build.md) |
| `eval` | [`/ll-agent-eval`](ll-agent-eval.md) |
| `deploy` | [`/ll-agent-deploy`](ll-agent-deploy.md) |
| `auto` (default) | build if path doesn't exist; else eval + deploy |

## Run it

```bash
/ll-agent build name=triage goal="..." autonomy=3
/ll-agent eval path=./agents/triage
/ll-agent deploy path=./agents/triage env=staging
/ll-agent path=./agents/triage         # auto: eval + deploy
```

## Pairs with

- [`/ll-agent-build`](ll-agent-build.md), [`/ll-agent-eval`](ll-agent-eval.md), [`/ll-agent-deploy`](ll-agent-deploy.md), [`/ll-no-bluf`](ll-no-bluf.md).
