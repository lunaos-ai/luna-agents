---
name: ll-prescribe
displayName: Luna Prescribe — Recommend the right doctors
description: Analyse the repo + recent activity (commits, failing CI, open PRs, recent incidents in `.luna/incidents/`) and print a prescription — which doctors to run, in which order, with rationale. Does not execute.
version: 1.0.0
category: quality
agent: luna-code-review
parameters:
  - name: path
    type: string
    required: false
  - name: focus
    type: string
    description: Optional bias - "security", "performance", "release-readiness", "incident-response".
    required: false
workflow:
  - inventory_repo_stack
  - read_recent_signals
  - rank_doctors_by_impact
  - emit_prescription_md
---

# Luna Prescribe

Doctor's recommendation, not the appointment. Looks at:

- Your stack (frameworks detected from `package.json`, `pom.xml`, etc.).
- Recent git activity (commits in last N days, hot files).
- Failing CI jobs (`.github/workflows/*.yml` last-run state if accessible).
- Open PRs touching critical paths.
- Recent incident notes in `.luna/incidents/` if present.

Outputs an ordered prescription.

## Sample output

```text
Prescription for `acme/api`:

  1. /ll-cve-doctor severity_min=critical
       reason: 14 deps unchanged in 90+ days; kernel CVE bulletin issued this week
  2. /ll-backend-doctor
       reason: Spring Boot 3.2; 3 controllers added in last 7 days, no tests
  3. /ll-postgres-doctor dsn=$DATABASE_URL
       reason: pg_stat_statements shows 2 queries above p95 budget
  4. /ll-react-doctor path=apps/web
       reason: React 18; 6 components changed; no a11y scan in CI

Run as a pipe:
  /ll-cve-doctor severity_min=critical >> ll-backend-doctor >> ll-postgres-doctor >> ll-react-doctor path=apps/web
```

## Run it

```bash
/ll-prescribe
/ll-prescribe focus=security
/ll-prescribe focus=release-readiness
```

## Pairs with

- [`/ll-hospital`](ll-hospital.md), [`/ll-er`](ll-er.md), [`/ll-icu`](ll-icu.md)
