---
name: verify-requirement
displayName: Verify Requirement
description: Validate one requirement's evidence chain, gaps, and transition history
version: 1.0.0
category: lifecycle
runtime: native
---

# /verify-requirement

Inspect one stable requirement ID without mutating the project. The result
includes validated and stale evidence, the derived state, the next gap, and
append-only transition history.

```bash
luna verify-requirement PAY-001
luna pipe 'verify-requirement PAY-001'
```
