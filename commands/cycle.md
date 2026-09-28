---
name: cycle
displayName: Lifecycle Cycles
description: Compute corrected phase and epic state from their requirements
version: 1.0.0
category: lifecycle
runtime: native
---

# /cycle

Aggregate stable plan phases or epics from their mapped requirement states.
Checked task counts are shown as claims and cannot raise cycle state.

```bash
luna cycle
luna cycle P07 --json
luna pipe 'reconcile >> cycle P07'
```
