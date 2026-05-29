---
name: ll-go-doctor
displayName: Luna Go Doctor — Go backend diagnose + fix
description: Diagnose Go services via golangci-lint, staticcheck, gosec, govulncheck, ineffassign, errcheck, plus a Luna heuristic layer for goroutine leaks, context.Background misuse, and missing deadlines. No upstream `go-doctor` (the existing project of that name is a refactoring tool, different scope).
version: 1.0.0
category: quality
agent: luna-code-review
parameters:
  - name: path
    type: string
    required: false
  - name: fix
    type: string
    required: false
  - name: pr
    type: string
    required: false
workflow:
  - detect_go_project
  - run_golangci_lint
  - run_gosec
  - run_govulncheck
  - run_luna_go_heuristics
  - audit_with_no_bluf
---

# Luna Go Doctor

**Honest note:** `go-doctor` exists as a Go refactoring tool (different
scope). This Luna command composes the standard Go static-analysis
stack.

## What it composes

- `golangci-lint run` — meta-runner for ~50 linters.
- `gosec -no-fail -fmt json ./...` — security.
- `govulncheck ./...` — known CVEs in deps.
- `staticcheck ./...` — fast type-checker.
- `ineffassign`, `errcheck` — assignment + error handling.
- Luna heuristic layer.

## Go-specific checks (Luna heuristic)

- **Goroutine leaks** — `go func()` without context cancellation path.
- **`context.Background()`** in request handlers (should be request ctx).
- **Missing `context.WithTimeout`** on outbound HTTP/DB calls.
- **`sql.Open` without `db.SetMaxOpenConns`**.
- **`defer` inside loop** — frame growth.
- **`fmt.Sprintf` in SQL** — injection risk.
- **`http.Get` without timeout** — uses default `0` (infinite).
- **`sync.Map` for write-heavy workloads** — wrong tool.
- **Logging in tight loops without sampling**.

## Run it

```bash
/ll-go-doctor
/ll-go-doctor fix=true pr=true
```

## In pipes

```bash
/ll-go-doctor fix=true >> ll-no-bluf >> pr "chore: go sweep"
```

## Pairs with

- [`/ll-rust-doctor`](ll-rust-doctor.md), [`/ll-backend-doctor`](ll-backend-doctor.md)
