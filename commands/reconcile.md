---
name: reconcile
displayName: Reconcile Requirements
description: Derive requirement and cycle state from current, validated evidence
version: 1.0.0
category: lifecycle
runtime: native
---

# /reconcile

Import existing `.luna/**/requirements.md` and implementation plans, preserve
stable IDs, validate evidence, and derive lifecycle state. Source artifacts are
never overwritten; native sidecars live under `.luna/lifecycle/`.

```bash
luna reconcile --dry-run
luna reconcile
luna pipe 'reconcile >> gaps >> status'
```

State can advance or regress as evidence becomes valid or stale. Every change
is appended to lifecycle history.
