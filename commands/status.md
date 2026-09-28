---
name: status
displayName: Requirements Status
description: Summarize evidence-derived requirement and cycle states
version: 1.0.0
category: lifecycle
runtime: native
---

# /status

Show counts across `PLANNED`, `IMPLEMENTING`, `IMPLEMENTED`, `VERIFIED`,
`DEPLOYED`, `E2E_VERIFIED`, and `DONE`, plus stale evidence and claim gaps.

```bash
luna status --lifecycle-only
luna status --json
luna pipe 'reconcile >> status'
```
