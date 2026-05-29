---
name: ll-mongo-doctor
displayName: Luna Mongo Doctor — MongoDB schema + query diagnose
description: Diagnose MongoDB usage via mongoeye (index/coverage), profile-collection analysis, and Luna heuristic layer for unbounded find(), missing indexes, and schema drift.
version: 1.0.0
category: database
agent: luna-database
parameters:
  - name: uri
    type: string
    description: MongoDB URI. Read-only operations.
    required: false
  - name: path
    type: string
    required: false
  - name: fix
    type: string
    required: false
workflow:
  - detect_mongo_artifacts
  - parse_profile_collection_if_uri
  - find_missing_indexes
  - run_luna_mongo_heuristics
  - audit_with_no_bluf
---

# Luna Mongo Doctor

Composes Mongo profiling + heuristic.

## What it composes

- `system.profile` slow-query analysis (if `uri` provided, read-only).
- `db.collection.getIndexes()` audit.
- Luna heuristic layer.

## Mongo-specific checks

- **Unbounded `find()`** in app code without `.limit()`.
- **Missing index** on query predicate fields.
- **`$in` with thousands of values** — query plan inefficiency.
- **Schema drift** — same collection with different shapes per doc.
- **Aggregation without `$match` early** — pipeline scans full collection.
- **`upsert: true`** with non-unique key.
- **Unbounded `$lookup`** between large collections.
- **No `serverSelectionTimeoutMS`** in client config.

## Run it

```bash
/ll-mongo-doctor
/ll-mongo-doctor uri=mongodb://...
```

## Pairs with

- [`/ll-postgres-doctor`](ll-postgres-doctor.md), [`/ll-no-bluf`](ll-no-bluf.md)
