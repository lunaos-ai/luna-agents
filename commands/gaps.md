---
name: gaps
displayName: Requirements Gaps
description: Explain the next missing or stale evidence gate for each requirement
version: 1.0.0
category: lifecycle
runtime: native
---

# /gaps

List requirements that have not reached `DONE`, the next evidence kind they
need, and places where checked plans are ahead of evidence-derived truth.

```bash
luna gaps
luna gaps PAY-001 --json
luna pipe 'reconcile >> gaps'
```
