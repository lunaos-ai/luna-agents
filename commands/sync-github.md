---
name: sync-github
displayName: Sync GitHub Cycles
description: Dry-run or apply idempotent requirement and cycle synchronization to GitHub issues
version: 1.0.0
category: lifecycle
runtime: native
---

# /sync-github

Synchronize requirements and cycles through the provider-neutral work-item
interface. GitHub issue bodies receive stable hidden keys and a managed block,
so repeated synchronization creates no duplicates and preserves text outside
that block.

Dry-run is the default:

```bash
luna sync-github --repo owner/project
luna sync-github P07 --repo owner/project --json
```

Apply only after reviewing the plan:

```bash
luna sync-github --repo owner/project --apply
luna pipe --policy-mode enforce --approve 'sync-github --apply'
```

A closed issue is reopened when its requirement or cycle has not reached
evidence-derived `DONE`. Issue closure never advances lifecycle state.
