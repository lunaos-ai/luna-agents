---
name: ll-icu
displayName: Luna ICU — Production-down recovery loop
description: Production is broken. Runs `/ll-365-secure` + `/ll-perf-trace` + `/ll-heal` + `/ll-zen` in a closed loop until every gate is green or you stop the loop. For incident response, not preventive medicine.
version: 1.0.0
category: quality
agent: luna-code-review
parameters:
  - name: path
    type: string
    required: false
  - name: max_loops
    type: string
    description: Maximum self-heal iterations. Default - 8.
    required: false
  - name: pr
    type: string
    description: If "true", open a PR with the recovery diff once green.
    required: false
workflow:
  - snapshot_current_state
  - run_security_scan
  - run_perf_trace
  - run_heal_loop
  - run_zen_gates
  - re_run_until_green_or_max
  - emit_postmortem
---

# Luna ICU

Intensive Care Unit. Production is on fire and you want the patient
stable. This command runs the full recovery stack on loop until
either everything's green or you've hit `max_loops`.

## What it runs (on loop)

1. `/ll-365-secure` — block any active critical CVE / OWASP issue.
2. `/ll-perf-trace` — find p95 regressions.
3. `/ll-heal` — test → screenshot → detect → fix.
4. `/ll-zen` — all gates (a11y, sec, perf, tests, lint, deps, build).
5. Audit with `/ll-no-bluf`.
6. If anything red → loop. Else → emit postmortem.

## Output

- `.luna/{project}/icu/snapshot-{start}.tar.gz` — pre-recovery state, for rollback.
- `.luna/{project}/icu/loop-NN.md` — each loop's findings + fixes.
- `.luna/{project}/icu/postmortem.md` — final report with timeline.

## Run it

```bash
/ll-icu
/ll-icu max_loops=12 pr=true
```

## Caution

- **Never run on a production cluster directly.** Run on a recent
  snapshot or a green branch.
- **No data destruction.** The loop will refuse to drop tables or
  truncate stores.
- **Pair with `/ll-no-bluf`** — every claim of "fixed" is verified.

## Pairs with

- [`/ll-er`](ll-er.md), [`/ll-hospital`](ll-hospital.md), [`/ll-zen`](ll-zen.md), [`/ll-no-bluf`](ll-no-bluf.md)
