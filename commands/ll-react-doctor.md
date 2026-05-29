---
name: ll-react-doctor
displayName: Luna React Doctor — Diagnose + fix React codebases
description: Run `npx react-doctor@latest` against the current repo to diagnose security, performance, correctness, accessibility, bundle-size, and architecture issues, then route each finding through `/ll-no-bluf` and open a fix-PR. Wraps millionco/react-doctor.
version: 1.0.0
category: quality
agent: luna-code-review
parameters:
  - name: path
    type: string
    description: Path to the React project root. Default - current working directory.
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
  - detect_react_project
  - run_react_doctor_scan
  - parse_findings_by_severity
  - apply_safe_fixes_if_requested
  - audit_with_no_bluf
  - open_pr_if_requested
  - emit_summary_report
---

# Luna React Doctor

Wraps [`react-doctor`](https://www.npmjs.com/package/react-doctor) — the
diagnostic tool from million.dev that catches React anti-patterns
oxlint, ESLint, and TypeScript miss.

## What gets checked

Per the upstream package, react-doctor flags issues across:

- **Security** — XSS in `dangerouslySetInnerHTML`, unsanitized props, leaky env access.
- **Performance** — wasted re-renders, missing `useMemo` / `useCallback`, large list rendering without virtualization, expensive effects.
- **Correctness** — stale closures, missing dep arrays, broken Rules of Hooks.
- **Accessibility** — missing alt text, unlabeled inputs, poor focus order, ARIA misuse.
- **Bundle size** — unused exports, duplicate deps, oversized polyfills, missing tree-shake hints.
- **Architecture** — circular imports, layer violations, dead code, prop-drilling depth.

Powered by `oxlint` + `eslint-plugin-react-hooks` + a dedicated
`oxlint-plugin-react-doctor` ruleset. Stays current with the React
Compiler.

## Run it

```bash
/ll-react-doctor                              # report-only
/ll-react-doctor fix=true                     # stage safe fixes
/ll-react-doctor fix=true pr=true             # stage + open PR
/ll-react-doctor path=apps/web                # specific subproject
```

Under the hood:

```bash
npx react-doctor@latest <path>
```

## Output

- `.luna/{project}/react-doctor/report.json` — raw findings.
- `.luna/{project}/react-doctor/summary.md` — human report grouped by severity + category.
- `.luna/{project}/react-doctor/fixes.diff` — unified diff of applied fixes (if `fix=true`).

## In pipes

```bash
/ll-react-doctor fix=true >> ll-no-bluf >> pr "chore: react-doctor sweep"
/ll-react-doctor >> ll-readme-sync >> ship cloudflare
/ll-zen                                       # already calls ll-react-doctor in phase 3
```

## Pairs with

- [`/ll-no-bluf`](ll-no-bluf.md) — verify the doctor's claims against the code before opening a PR.
- [`/ll-svelte-doctor`](ll-svelte-doctor.md) — same shape, Svelte target.
- [`/ll-doctor`](ll-doctor.md) — framework-agnostic dispatcher; routes to the right doctor for your stack.
- [`/ll-zen`](ll-zen.md) — runs react-doctor as part of the full health sweep.

## Failure modes

- **Not a React project** — exits with a hint to try `/ll-svelte-doctor` or `/ll-doctor`.
- **Node < 18** — react-doctor needs modern Node; surfaces the upstream error verbatim.
- **CI mode** — set `pr=false` and pipe to `ll-no-bluf --mode report-only` for a non-mutating check.

## Why wrap it

Same reason we wrap any external tool: composability. `react-doctor`
outputs JSON; the Luna runtime pipes that into `/ll-no-bluf` for
honesty checks, then into `/pr` for the PR, then into `/notify` for
team comms. No glue script.
