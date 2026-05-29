---
name: readme-sync
displayName: README Sync (shortcut)
description: "Shortcut: Regenerate README.md + website skills data from commands/, agents/, skills/ -> /ll-readme-sync"
version: 1.0.0
category: documentation
agent: luna-documentation
shortcut_for: ll-readme-sync
---

# README Sync

Shortcut for `/ll-readme-sync`.

Regenerates README.md counters and the auto-generated command index
from the actual contents of `commands/`, `agents/`, and `skills/`. Use
`/ll-readme-sync check=true` in CI to fail on drift.
