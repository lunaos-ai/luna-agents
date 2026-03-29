---
name: pipe
displayName: Pipeline Runner (shortcut)
description: "Shortcut: Combine commands with >> (sequential) and ~~ (parallel) -> /ll-pipe"
version: 1.0.0
category: workflow
shortcut_for: ll-pipe
---

# /pipe — Pipeline Runner

Shortcut for `/ll-pipe`.

```
/pipe req >> des >> plan              # Sequential
/pipe lint ~~ test ~~ typecheck       # Parallel
/pipe (lint ~~ test) >> deploy        # Mixed
/pipe test ?>> deploy !>> fix         # Conditional
```
