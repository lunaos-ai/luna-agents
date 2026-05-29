---
name: ll-elixir-doctor
displayName: Luna Elixir Doctor — Phoenix / Elixir diagnose + fix
description: Diagnose Elixir / Phoenix apps via credo, sobelow (security), mix audit, mix dialyzer / dialyxir, plus Luna heuristic layer for GenServer state, supervision tree, and LiveView assigns leakage.
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
  - detect_elixir_project
  - run_credo
  - run_sobelow
  - run_mix_audit
  - run_dialyxir
  - run_luna_elixir_heuristics
  - audit_with_no_bluf
---

# Luna Elixir Doctor

**Honest note:** no published `elixir-doctor` package. Composes
existing Elixir tooling.

## What it composes

- `mix credo --strict` — style + complexity.
- `mix sobelow --config` — Phoenix security.
- `mix deps.audit` (via `mix_audit`) — hex CVEs.
- `mix dialyzer` — type analysis.
- Luna heuristic layer.

## Elixir-specific checks (Luna heuristic)

- **GenServer with unbounded state** — list accumulation in `handle_info`.
- **Supervision tree** — :transient + crash-loop risk.
- **LiveView assigns** — sensitive data assigned without `temporary_assigns`.
- **N+1 Ecto** — `Repo.all` then iterating with `Repo.get`.
- **`raise` in GenServer init** without supervisor restart strategy clarification.
- **`Task.async` without `Task.Supervisor`** — orphan task.
- **Phoenix Channel auth** — `connect/3` accepting any params.

## Run it

```bash
/ll-elixir-doctor
/ll-elixir-doctor fix=true pr=true
```

## Pairs with

- [`/ll-backend-doctor`](ll-backend-doctor.md), [`/ll-no-bluf`](ll-no-bluf.md)
