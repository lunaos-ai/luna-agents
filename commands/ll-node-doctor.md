---
name: ll-node-doctor
displayName: Luna Node Doctor — Node.js backend diagnose + fix
description: Run `npx node-doctor@latest` (real package) plus npm audit, eslint, and Luna heuristic scan against Express / Fastify / Hono / Koa / NestJS / Bun / Deno backends. Composes with /ll-no-bluf for honest fix PRs.
version: 1.0.0
category: quality
agent: luna-code-review
parameters:
  - name: path
    type: string
    description: Path to Node project root. Default - current working directory.
    required: false
  - name: fix
    type: string
    description: If "true", auto-apply safe fixes. Default - false.
    required: false
  - name: pr
    type: string
    description: If "true", open a pull request with staged fixes. Default - false.
    required: false
workflow:
  - detect_node_framework
  - run_node_doctor_npx
  - run_npm_audit
  - run_eslint
  - apply_safe_fixes_if_requested
  - audit_with_no_bluf
  - open_pr_if_requested
---

# Luna Node Doctor

Wraps three things:

1. **[`node-doctor`](https://www.npmjs.com/package/node-doctor)** v1.1.0 — real npm package, runs targeted checks for Node runtimes.
2. **`npm audit`** — built-in dependency CVE scan.
3. **ESLint** — your project's existing config, plus a curated security/perf preset.

Plus a Luna heuristic layer for things tools miss: blocking I/O on the
event loop, sync `fs` in request paths, missing error handlers,
unbounded JSON parsing, unhandled promise rejections.

## Run it

```bash
/ll-node-doctor                              # report-only
/ll-node-doctor fix=true                     # stage safe fixes
/ll-node-doctor fix=true pr=true             # stage + open PR
```

Under the hood:

```bash
npx node-doctor@latest <path>
npm audit --omit=dev
npx eslint --ext .js,.ts,.mjs <path>
```

## What gets checked

- **Security** — CVEs in deps, prototype pollution, SSRF, command injection, weak crypto, missing helmet/CORS configs.
- **Performance** — sync I/O on event loop, missing `keepAlive`, oversized payloads, missing compression.
- **Correctness** — unhandled rejections, missing `await`, broken error-first callbacks.
- **Architecture** — circular requires, oversized files (>200 lines), missing layer boundaries.

## In pipes

```bash
/ll-node-doctor fix=true >> ll-no-bluf >> pr "chore: node sweep"
/ll-node-doctor >> ll-perf-trace >> ship
```

## Pairs with

- [`/ll-backend-doctor`](ll-backend-doctor.md), [`/ll-no-bluf`](ll-no-bluf.md), [`/ll-zen`](ll-zen.md)
