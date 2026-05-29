---
name: ll-svelte-doctor
displayName: Luna Svelte Doctor — Diagnose + fix Svelte codebases
description: Run `npx svelte-doctor-cli@latest` (or `svelte-doctor` if preferred) against the current repo to diagnose state, effects, performance, security, accessibility, architecture, and dead-code issues, then route each finding through `/ll-no-bluf` and open a fix-PR. Wraps the existing Svelte doctor packages — does NOT reinvent.
version: 1.0.0
category: quality
agent: luna-code-review
parameters:
  - name: path
    type: string
    description: Path to the Svelte / SvelteKit project root. Default - current working directory.
    required: false
    prompt: false
  - name: engine
    type: string
    description: Which doctor to use - "cli" (svelte-doctor-cli, broader scope) or "core" (svelte-doctor). Default - cli.
    required: false
    prompt: false
  - name: fix
    type: string
    description: If "true", auto-apply safe fixes and stage them. Default - false (report-only).
    required: false
    prompt: false
  - name: pr
    type: string
    description: If "true", open a pull request with the staged fixes. Default - false.
    required: false
    prompt: false
workflow:
  - detect_svelte_project
  - run_svelte_doctor_scan
  - parse_findings_by_severity
  - apply_safe_fixes_if_requested
  - audit_with_no_bluf
  - open_pr_if_requested
  - emit_summary_report
---

# Luna Svelte Doctor

Wraps either [`svelte-doctor-cli`](https://www.npmjs.com/package/svelte-doctor-cli)
(broader scope, recommended) or [`svelte-doctor`](https://www.npmjs.com/package/svelte-doctor)
(name-parity with react-doctor). Both already exist on npm — Luna does
**not** reinvent.

## What gets checked

Per the upstream packages, svelte-doctor covers:

- **State + reactivity** — incorrect `$state` / `$derived` / `$effect` usage, missing runes-mode migration paths, stale subscriptions.
- **Performance** — unnecessary reactivity, expensive `{#each}` without `key`, hydration mismatches, large bundles.
- **Security** — XSS in `{@html}`, unsanitized form actions, leaky `load` functions.
- **Accessibility** — missing labels, broken focus traps, color contrast in `<style>` blocks.
- **Architecture** — store sprawl, action coupling, layer violations.
- **Dead code** — unused exports, orphan routes, unreachable components.

Supports Svelte 5 + SvelteKit, including runes migration.

## Run it

```bash
/ll-svelte-doctor                             # report-only, uses svelte-doctor-cli
/ll-svelte-doctor engine=core                 # use svelte-doctor (queaxtra) instead
/ll-svelte-doctor fix=true                    # stage safe fixes
/ll-svelte-doctor fix=true pr=true            # stage + open PR
/ll-svelte-doctor path=apps/web               # specific subproject
```

Under the hood:

```bash
# default
npx svelte-doctor-cli@latest <path>
# alternative
npx svelte-doctor@latest <path>
```

## Output

- `.luna/{project}/svelte-doctor/report.json` — raw findings.
- `.luna/{project}/svelte-doctor/summary.md` — human report grouped by severity + category.
- `.luna/{project}/svelte-doctor/fixes.diff` — unified diff of applied fixes (if `fix=true`).

## In pipes

```bash
/ll-svelte-doctor fix=true >> ll-no-bluf >> pr "chore: svelte-doctor sweep"
/ll-svelte-doctor >> ll-readme-sync >> ship cloudflare
/ll-zen                                       # routes through ll-doctor; svelte-doctor runs in phase 3
```

## Pairs with

- [`/ll-no-bluf`](ll-no-bluf.md) — verify the doctor's claims against the code.
- [`/ll-react-doctor`](ll-react-doctor.md) — same shape, React target.
- [`/ll-doctor`](ll-doctor.md) — framework-agnostic dispatcher.
- [`/ll-zen`](ll-zen.md) — runs whichever doctor matches your stack.

## Why not build our own

Two mature packages already exist on npm; the Svelte community is
small enough that duplicating them would fragment the ecosystem.
Luna's value is in **composing** the doctor with no-bluf, readme-sync,
and ship — not in re-implementing the linter.

If both upstream packages stop being maintained, we'll fork. Until
then: wrap, don't reinvent.

## Failure modes

- **Not a Svelte project** — exits with hint to try `/ll-react-doctor` or `/ll-doctor`.
- **Node < 18** — surfaces upstream error verbatim.
- **engine=core but `svelte-doctor` API drift** — falls back to `engine=cli` with a warning.
