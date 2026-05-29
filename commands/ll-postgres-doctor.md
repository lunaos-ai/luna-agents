---
name: ll-postgres-doctor
displayName: Luna Postgres Doctor — Schema + query diagnose
description: Diagnose PostgreSQL schemas and queries via sqlfluff (SQL lint), pg_stat_statements analysis, missing-index detection, and Luna heuristic layer for unbounded queries, lock contention patterns, and migration safety.
version: 1.0.0
category: database
agent: luna-database
parameters:
  - name: dsn
    type: string
    description: Postgres connection string. If omitted, scans SQL files in path.
    required: false
  - name: path
    type: string
    description: Repo path with migrations / sql files. Default - cwd.
    required: false
  - name: fix
    type: string
    required: false
workflow:
  - detect_postgres_artifacts
  - run_sqlfluff
  - parse_pg_stat_statements_if_dsn
  - find_missing_indexes
  - run_luna_pg_heuristics
  - audit_with_no_bluf
---

# Luna Postgres Doctor

Composes SQL lint + (optional) live-DB analysis.

## What it composes

- `sqlfluff lint` — SQL lint.
- `pg_stat_statements` analysis (if `dsn` provided, read-only) — slow queries.
- Missing-index detector (suggests, doesn't create).
- Migration safety heuristics.
- Luna heuristic layer.

## Postgres-specific checks

- **Unbounded `SELECT`** — no LIMIT in user-facing query.
- **Sequential scan on indexed columns** — wrong index order.
- **`ALTER TABLE … ADD COLUMN NOT NULL` without DEFAULT** — full-table rewrite.
- **`CREATE INDEX` without `CONCURRENTLY`** in prod migration.
- **`SELECT *`** in hot path.
- **`text` vs `varchar(n)`** — pointless length constraints.
- **Missing FK indexes** on tables joined often.
- **`pg_stat_statements` top-10 query** with no index covering WHERE.
- **`UUID` PK** without `gen_random_uuid()` default.

## Run it

```bash
/ll-postgres-doctor                              # files only
/ll-postgres-doctor dsn=postgres://...           # also scan live (read-only)
/ll-postgres-doctor fix=true                     # propose migration fixes
```

## Pairs with

- [`/ll-mongo-doctor`](ll-mongo-doctor.md), [`/ll-no-bluf`](ll-no-bluf.md)
