---
name: ll-hospital
displayName: Luna Hospital — Full-stack diagnose across every wing
description: Runs every relevant doctor in parallel — frontend, backend, infra, data, CVE — across your entire repo. The meta-dispatcher of dispatchers. Use when you want a single command to find every issue worth finding.
version: 1.0.0
category: quality
agent: luna-code-review
parameters:
  - name: path
    type: string
    required: false
  - name: wings
    type: string
    description: Comma-separated list of wings to run. Default - "frontend,backend,infra,data,cve".
    required: false
  - name: parallel
    type: string
    description: If "true" (default), run wings in parallel. If "false", sequential.
    required: false
  - name: fix
    type: string
    required: false
  - name: pr
    type: string
    required: false
workflow:
  - detect_repo_stack
  - dispatch_each_wing
  - merge_results
  - prioritise_by_severity
  - audit_with_no_bluf
  - open_pr_if_requested
---

# Luna Hospital

The full ward round. Routes to every applicable doctor and merges the
findings into one prioritised report.

## Wings

| Wing | Doctors |
|---|---|
| Frontend | [`/ll-doctor`](ll-doctor.md) → react / svelte / vue / solid / astro |
| Backend | [`/ll-backend-doctor`](ll-backend-doctor.md) → node / vert.x / spring / django / fastapi / rails / go / rust / php / .NET / elixir |
| Infra | [`/ll-docker-doctor`](ll-docker-doctor.md), [`/ll-k8s-doctor`](ll-k8s-doctor.md), [`/ll-terraform-doctor`](ll-terraform-doctor.md) |
| Data | [`/ll-postgres-doctor`](ll-postgres-doctor.md), [`/ll-mongo-doctor`](ll-mongo-doctor.md) |
| CVE | [`/ll-cve-doctor`](ll-cve-doctor.md) |

## Run it

```bash
/ll-hospital                                      # all wings, parallel
/ll-hospital wings=backend,cve                    # just two wings
/ll-hospital fix=true pr=true                     # full sweep, fix + PR
```

## Output

- `.luna/{project}/hospital/report.json` — every finding from every doctor.
- `.luna/{project}/hospital/summary.md` — human report grouped by wing + severity.
- `.luna/{project}/hospital/triage.md` — top 20 findings ranked by severity × reachability.
- `.luna/{project}/hospital/fixes.diff` — applied fixes if `fix=true`.

## In pipes

```bash
/ll-hospital fix=true >> ll-no-bluf >> pr "chore: hospital sweep"
/ll-prescribe >> ll-hospital wings=backend,cve     # prescribe first, then run those
/ll-er                                              # the emergency-room shortcut to critical-only
```

## Pairs with

- [`/ll-prescribe`](ll-prescribe.md) — recommend which doctors to run first.
- [`/ll-er`](ll-er.md) — critical-severity only, fast triage.
- [`/ll-icu`](ll-icu.md) — production-down recovery loop.
- [`/ll-no-bluf`](ll-no-bluf.md) — final honesty audit.

## When to use which

| Situation | Use |
|---|---|
| Pre-release sweep, plenty of time | `/ll-hospital` |
| 5-minute critical check before standup | `/ll-er` |
| Production is on fire | `/ll-icu` |
| Not sure where to start | `/ll-prescribe` |
| One framework only | the specific doctor |
