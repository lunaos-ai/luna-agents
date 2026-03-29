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

Combine Luna commands with `>>` (sequential) and `~~` (parallel).

## Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| `>>` | Run sequentially (left finishes, then right starts) | `req >> des >> plan` |
| `~~` | Run in parallel (both start simultaneously) | `lint ~~ test ~~ typecheck` |
| `( )` | Group commands | `(lint ~~ test) >> deploy` |
| `?>>` | Run next only if previous succeeded | `test ?>> deploy` |
| `!>>` | Run next only if previous failed | `test !>> fix` |
| `*N` | Loop N times | `go *5` (run execute 5 times) |
| `*N?` | Loop up to N times, stop on success | `(fix >> test) *3?` |
| `*N!` | Loop up to N times, stop on failure | `go *10!` (stop when task fails) |
| `*?` | Loop until success (max 10) | `(fix >> test) *?` |

## Usage

### Sequential — one after another
```
/pipe req >> des >> plan >> go
```
Runs requirements, then design, then plan, then execute — each waits for the previous.

### Parallel — all at once
```
/pipe lint ~~ test ~~ typecheck ~~ security
```
Runs lint, test, typecheck, and security scan simultaneously.

### Mixed — parallel then sequential
```
/pipe (lint ~~ test ~~ typecheck) >> deploy
```
Runs lint, test, and typecheck in parallel. When ALL pass, deploys.

### Conditional — succeed/fail branching
```
/pipe test ?>> deploy !>> fix
```
If tests pass, deploy. If tests fail, run fix.

### Loop — repeat N times
```
/pipe go *5
```
Runs execute 5 times (implement 5 tasks in a row).

```
/pipe (go >> test) *10!
```
Implement + test, repeat up to 10 times — stops on first failure.

```
/pipe (fix "login bug" >> test) *3?
```
Try fix + test up to 3 times — stops when tests pass.

```
/pipe (fix >> test) *?
```
Keep fixing and testing until it passes (max 10 iterations).

### Loop + Conditional — auto-fix loops
```
/pipe go *5 >> (lint ~~ test) ?>> pr !>> (fix >> test) *3?
```
Execute 5 tasks, run quality checks in parallel. If pass, create PR. If fail, try fix+test up to 3 times.

### Full pipeline examples

```
# Standard dev workflow
/pipe req >> des >> plan >> go >> rev >> test >> ship

# Quality gate before deploy
/pipe (lint ~~ test ~~ typecheck ~~ security) >> (ship ~~ docs)

# Feature autopilot with quality gates
/pipe feature "add billing" >> (lint ~~ test) ?>> pr !>> fix

# AI-powered pipeline
/pipe search "auth" >> nexa review >> lam "improve auth" >> test >> pr

# Parallel builds + sequential deploy
/pipe (build ~~ test ~~ e2e) >> ship >> watch

# Implement all tasks then ship
/pipe go *10! >> (lint ~~ test) >> ship

# Auto-fix loop (try 3 times)
/pipe (fix "bug" >> test) *3? >> pr

# Full autopilot: implement 5 tasks, quality gate, auto-fix, PR
/pipe go *5 >> (lint ~~ test ~~ typecheck) ?>> pr !>> (fix >> test) *3?
```

## Command References

Use shortcut names or full names:

```
# These are equivalent:
/pipe req >> des >> plan
/pipe ll-requirements >> ll-design >> ll-plan
```

## Available Commands

All Luna commands work in pipes:

**Workflow**: `req`, `des`, `plan`, `go`, `rev`, `test`, `ship`, `watch`, `retro`
**Autopilot**: `feature`, `parallel`, `fix`, `debug`, `refactor`, `pr`
**Quality**: `rules`, `perf`, `a11y`, `deps`, `mock`, `storybook`
**Code Gen**: `auth`, `brand`, `api-client`, `migrate`, `i18n`, `ci`, `changelog`
**DevOps**: `env`, `rollback`, `dock`, `cf`, `sec`
**AI**: `nexa`, `lam`, `oh`, `chain`, `vision`, `search`, `q`
**Tools**: `hig`, `ui`, `docs`, `cfg`

## Execution Rules

1. **Sequential (`>>`)**: Next command starts only after previous completes
2. **Parallel (`~~`)**: All commands in the group start simultaneously
3. **Groups (`()`)**: Treated as a single unit — all must complete before moving on
4. **Conditional (`?>>`)**: Next runs only if previous exited successfully
5. **Fail branch (`!>>`)**: Next runs only if previous failed
6. **Loop (`*N`)**: Repeats command or group N times
7. **Loop until success (`*N?`)**: Repeats up to N times, stops when command succeeds
8. **Loop until failure (`*N!`)**: Repeats up to N times, stops when command fails
9. **Loop forever (`*?`)**: Repeats until success, max 10 iterations (safety cap)
10. **Scope inheritance**: All commands in a pipe share the same project scope
11. **Fail-fast**: By default, pipeline stops on first failure (use `?>>` / `!>>` for control)
12. **Report**: Each command's output is captured in the pipeline report

## Tips

- Use `~~` for independent checks (lint, test, typecheck don't depend on each other)
- Use `>>` when output of one feeds into the next
- Use `?>>` before deploy — only ship if tests pass
- Use `!>>` for automatic recovery — fix on failure
- Nest `()` for complex pipelines
- All commands share the same scope so context flows through
