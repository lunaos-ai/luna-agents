---
name: ll-rails-doctor
displayName: Luna Rails Doctor — Ruby on Rails diagnose + fix
description: Run `npx rails-doctor@latest` (real package) plus brakeman (security), bundler-audit (CVEs), rubocop (lint), and a Luna heuristic layer for n+1, fat-controller, missing strong params, and CSRF gaps.
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
  - detect_rails_project
  - run_rails_doctor_npx
  - run_brakeman
  - run_bundler_audit
  - run_rubocop
  - run_luna_rails_heuristics
  - audit_with_no_bluf
---

# Luna Rails Doctor

Wraps:

- **[`rails-doctor`](https://www.npmjs.com/package/rails-doctor)** v0.1.8 — real npm package for Rails diagnostics.
- **`brakeman`** — Rails security scanner.
- **`bundler-audit`** — gem CVEs.
- **`rubocop -A`** — auto-fix safe style issues.
- Luna heuristic layer.

## Rails-specific checks (Luna heuristic)

- **n+1** — controller `.each` over association without `includes`.
- **Strong params** missing on `create`/`update`.
- **Mass-assignment** through `permit!`.
- **Open redirect** — `redirect_to params[:url]`.
- **`raw` / `html_safe`** on untrusted input.
- **Missing `protect_from_forgery`** in `ApplicationController`.
- **`render :file`** with user input.
- **Slow callbacks** in `before_save` doing network calls.
- **N+1 in views** — partials accessing associations.

## Run it

```bash
/ll-rails-doctor
/ll-rails-doctor fix=true pr=true
```

## In pipes

```bash
/ll-rails-doctor fix=true >> ll-no-bluf >> pr "chore: rails sweep"
```

## Pairs with

- [`/ll-backend-doctor`](ll-backend-doctor.md), [`/ll-no-bluf`](ll-no-bluf.md)
