---
name: ll-pipe
displayName: Luna Pipeline Runner
description: Combine Luna commands — >> for sequential, ~~ for parallel execution
version: 1.0.0
category: workflow
agent: luna-task-executor
parameters:
  - name: pipeline
    type: string
    description: Pipeline expression using >> (sequential) and ~~ (parallel)
    required: true
    prompt: true
workflow:
  - parse_pipeline_expression
  - validate_commands
  - execute_pipeline
  - collect_results
  - generate_pipeline_report
output:
  - .luna/{current-project}/pipeline-report.md
prerequisites: []
---

# Luna Pipeline Runner

Combine Luna commands with `>>` (sequential), `~~` (parallel), loops, and hooks.

**All commands in a pipe are Luna commands** — shortcuts or full names.

## Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| `>>` | Run sequentially (left finishes, then right starts) | `req >> des >> plan` |
| `~~` | Run in parallel (both start simultaneously) | `rev ~~ test ~~ sec` |
| `( )` | Group commands | `(rev ~~ test) >> ship` |
| `?>>` | Run next only if previous succeeded | `test ?>> ship` |
| `!>>` | Run next only if previous failed | `test !>> fix` |
| `*N` | Loop N times | `go *5` |
| `*N?` | Loop up to N times, stop on success | `(fix >> test) *3?` |
| `*N!` | Loop up to N times, stop on failure | `go *10!` |
| `*?` | Loop until success (max 10) | `(fix >> test) *?` |
| `@before:CMD` | Run Luna CMD before each step | `@before:rules` |
| `@after:CMD` | Run Luna CMD after each step | `@after:test` |
| `@each:CMD` | Run Luna CMD before + after each step | `@each:rev` |

## Usage

### Sequential — one after another
```
/pipe req >> des >> plan >> go
```
Runs `/req`, then `/des`, then `/plan`, then `/go` — each waits for the previous.

### Parallel — all at once
```
/pipe rev ~~ test ~~ sec ~~ a11y
```
Runs code review, tests, security audit, and accessibility audit simultaneously.

### Mixed — parallel then sequential
```
/pipe (rev ~~ test ~~ sec) >> ship
```
Runs review, test, and security in parallel. When ALL pass, deploys.

### Conditional — succeed/fail branching
```
/pipe test ?>> ship !>> fix
```
If `/test` passes, run `/ship`. If `/test` fails, run `/fix`.

### Loop — repeat N times
```
/pipe go *5
```
Runs `/go` (execute next task) 5 times in a row.

```
/pipe (go >> test) *10!
```
Execute task + test, repeat up to 10 times — stops on first test failure.

```
/pipe (fix "login bug" >> test) *3?
```
Try `/fix` + `/test` up to 3 times — stops when tests pass.

```
/pipe (fix >> test) *?
```
Keep fixing and testing until it passes (max 10 iterations).

### Loop + Conditional — auto-fix loops
```
/pipe go *5 >> (rev ~~ test) ?>> pr !>> (fix >> test) *3?
```
Execute 5 tasks, run review + tests in parallel. If pass, create PR. If fail, try fix+test up to 3 times.

### Hooks — run Luna command before/after each step

```
/pipe @before:rules go *5 >> rev >> ship
```
Applies `/rules` before every step — ensures 100-line cap, full tests, Playwright e2e on every task.

```
/pipe @after:test go *5
```
Runs `/test` after each `/go` — validates every task immediately.

```
/pipe @before:rules @after:test go *3 >> rev >> ship
```
Apply `/rules` before each step AND run `/test` after each step.

```
/pipe @each:rev req >> des >> plan >> go *5
```
Code review runs both before and after every step in the pipeline.

```
/pipe @after:rev go *5 >> (test ~~ sec) ?>> pr
```
Code review after every task, then quality gate, then PR.

```
/pipe @before:rules @after:(test ~~ rev) go *10! >> ship
```
Apply `/rules` before each step. After each step, run `/test` and `/rev` in parallel.

### Full pipeline examples

```
# Standard dev workflow
/pipe req >> des >> plan >> go >> rev >> test >> ship

# Full workflow with monitoring
/pipe req >> des >> plan >> go *5 >> rev >> test >> sec >> hig >> ship >> watch >> retro

# Quality gate before deploy
/pipe (rev ~~ test ~~ sec ~~ a11y) >> (ship ~~ docs)

# Feature autopilot with quality gates
/pipe feature "add billing" >> (rev ~~ test) ?>> pr !>> fix

# AI-powered pipeline
/pipe search "auth" >> nexa review >> lam "improve auth" >> test >> pr

# Parallel quality + sequential deploy
/pipe (rev ~~ test ~~ sec ~~ perf) >> ship >> watch

# Implement all tasks then ship
/pipe go *10! >> (rev ~~ test) >> ship

# Auto-fix loop (try 3 times)
/pipe (fix "bug" >> test) *3? >> pr

# Full autopilot: implement 5 tasks, quality gate, auto-fix, PR
/pipe go *5 >> (rev ~~ test ~~ sec) ?>> pr !>> (fix >> test) *3?

# Brand + auth + deploy
/pipe brand >> auth >> hig >> test >> ship

# AI review then fix
/pipe nexa review >> nexa bugs >> (fix >> test) *3? >> pr

# Complete project from scratch
/pipe req >> des >> plan >> @before:rules @after:test go *10! >> rev >> sec >> hig >> ship >> docs >> watch

# Refactor with safety net
/pipe @after:test refactor *3 >> rev >> pr

# Database migration with validation
/pipe migrate >> test >> ship ?>> watch !>> rollback

# i18n setup with quality check
/pipe i18n >> hig >> a11y >> test >> pr

# Generate everything for launch
/pipe brand >> auth >> ci >> env >> docs >> changelog >> ship
```

## Command References

Use shortcut names or full names — both work:

```
# These are equivalent:
/pipe req >> des >> plan
/pipe ll-requirements >> ll-design >> ll-plan
```

## Available Luna Commands

All Luna commands work in pipes:

**Workflow**: `req`, `des`, `plan`, `go`, `rev`, `test`, `ship`, `watch`, `retro`
**Autopilot**: `feature`, `parallel`, `fix`, `debug`, `refactor`, `pr`
**Quality**: `rules`, `perf`, `a11y`, `deps`, `mock`, `storybook`
**Code Gen**: `auth`, `brand`, `api-client`, `migrate`, `i18n`, `ci`, `changelog`
**DevOps**: `env`, `rollback`, `dock`, `cf`, `sec`
**AI**: `nexa`, `lam`, `oh`, `chain`, `vision`, `search`, `q`
**Tools**: `hig`, `ui`, `docs`, `cfg`

## Execution Rules

1. **Sequential (`>>`)**: Next Luna command starts only after previous completes
2. **Parallel (`~~`)**: All Luna commands in the group start simultaneously
3. **Groups (`()`)**: Treated as a single unit — all must complete before moving on
4. **Conditional (`?>>`)**: Next runs only if previous Luna command succeeded
5. **Fail branch (`!>>`)**: Next runs only if previous Luna command failed
6. **Loop (`*N`)**: Repeats Luna command or group N times
7. **Loop until success (`*N?`)**: Repeats up to N times, stops when command succeeds
8. **Loop until failure (`*N!`)**: Repeats up to N times, stops when command fails
9. **Loop forever (`*?`)**: Repeats until success, max 10 iterations (safety cap)
10. **Before hook (`@before:CMD`)**: Runs Luna CMD before each step in the pipe
11. **After hook (`@after:CMD`)**: Runs Luna CMD after each step in the pipe
12. **Each hook (`@each:CMD`)**: Runs Luna CMD both before and after each step
13. **Hook groups**: Hooks support `()` for parallel — `@after:(test ~~ rev)`
14. **Multiple hooks**: Stack them — `@before:rules @after:test`
15. **Scope inheritance**: All Luna commands in a pipe share the same project scope
16. **Fail-fast**: By default, pipeline stops on first failure (use `?>>` / `!>>` for control)
17. **Report**: Each command's output is captured in the pipeline report
