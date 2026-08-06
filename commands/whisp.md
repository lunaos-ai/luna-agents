---
name: whisp
displayName: Whisp
description: Coordinate work across multiple AI-agent sessions on the same machine so they do not overwrite each other on a repo or its dependency worktrees.
version: 1.0.0
category: meta
agent: luna-whisp
---

# Whisp

Cross-session agent chat. Use `whisp` when you are working in one project and
need to ask, notify, or hand off work to another AI-agent session on the same
machine without editing its repo directly.

## When to use

- A second agent is already running in another project that this repo depends on.
- You need to request a change in a dependency worktree.
- You want to warn other sessions before starting a risky refactor.
- You want to discover which agents are active on a repo and what they are doing.

## What it does

1. Reads the shared session registry at `~/.luna/agents/registry/`.
2. Lists active peers for a repo or worktree.
3. Lets you leave notes, acquire locks, or send structured requests.
4. Polls the inbox for responses from the other session.

## Example

```bash
luna run whisp
```

The Whisp agent will then:

- Find active sessions on the target repo.
- Show recent shared notes.
- Help you send a request or lock the repo before editing.

## See also

- `luna-vault-agent` — the underlying registry/lock/inbox CLI.
- `luna-whisp` — the agent persona that drives this command.
