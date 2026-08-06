---
name: ll-whisp
displayName: Whisp — cross-session agent chat
description: Coordinate work across multiple AI-agent sessions on the same machine so they do not overwrite each other on a repo or its dependency worktrees.
version: 1.0.0
category: meta
agent: luna-whisp
parameters:
  - name: action
    type: string
    description: "discover | lock | note | ask | status"
    required: false
  - name: repo
    type: string
    description: Repo path to scope the action to.
    required: false
  - name: to
    type: string
    description: Target session id when action=ask.
    required: false
  - name: task
    type: string
    description: Task description when action=ask.
    required: false
  - name: text
    type: string
    description: Note text when action=note.
    required: false
workflow:
  - detect_active_sessions
  - choose_action
  - execute_and_report
---

# Whisp

Cross-session agent chat. Use Whisp when you are working in one project and
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

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | no | `discover`, `lock`, `note`, `ask`, or `status` |
| `repo` | string | no | Repo path to scope the action |
| `to` | string | no | Target session id when `action=ask` |
| `task` | string | no | Task description when `action=ask` |
| `text` | string | no | Note text when `action=note` |

## Example

```bash
/ll-whisp repo=/Users/me/project-x action=discover
```

## See also

- `/whisp` — shortcut for this command.
- `vibevault agent` — the underlying registry/lock/inbox CLI.
- `luna run whisp` — run the Whisp agent persona in the terminal.
