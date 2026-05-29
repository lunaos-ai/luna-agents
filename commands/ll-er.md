---
name: ll-er
displayName: Luna Emergency Room — Critical-severity triage, fast
description: Fast triage. Runs every doctor in `severity_min=critical` + `parallel=true` mode. Skips style, formatting, and medium findings. For "is anything on fire right now?" checks, under 5 minutes on most repos.
version: 1.0.0
category: quality
agent: luna-code-review
parameters:
  - name: path
    type: string
    required: false
workflow:
  - dispatch_hospital_critical_only
  - emit_triage_report
  - audit_with_no_bluf
---

# Luna Emergency Room

Fast triage. Calls `/ll-hospital wings=backend,frontend,infra,cve` in
critical-only mode, in parallel. Reports nothing below "high" severity.

## Run it

```bash
/ll-er
```

That's it. No flags. No options. Just answers the question:

> Is anything on fire right now?

## When to use

- Before a release.
- Before standup, to see if any overnight CVE landed.
- After merging anything risky.
- As a `pre-push` git hook.

## Pairs with

- [`/ll-hospital`](ll-hospital.md), [`/ll-icu`](ll-icu.md), [`/ll-no-bluf`](ll-no-bluf.md)
