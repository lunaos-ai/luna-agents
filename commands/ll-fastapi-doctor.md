---
name: ll-fastapi-doctor
displayName: Luna FastAPI Doctor — FastAPI / Starlette diagnose + fix
description: Diagnose FastAPI / Starlette apps via ruff (lint), bandit (security), mypy (types), openapi-spec-validator (contract), plus Luna heuristic layer for async-route blocking, dependency injection cycles, response model leaks. No upstream `fastapi-doctor` package — composes existing Python tooling.
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
  - detect_fastapi_project
  - run_ruff
  - run_bandit
  - run_mypy
  - validate_openapi_spec
  - run_luna_fastapi_heuristics
  - audit_with_no_bluf
---

# Luna FastAPI Doctor

**Honest note:** no published `fastapi-doctor` package. Luna-original
orchestration of existing Python tools.

## What it composes

- `ruff check` — fast Python linting.
- `bandit -r .` — security.
- `mypy --strict` — static types.
- `openapi-spec-validator` on the auto-generated spec.
- Luna heuristic for FastAPI idioms.

## FastAPI-specific checks (Luna heuristic)

- **Blocking I/O in async routes** — `requests.get`, `time.sleep`, `psycopg2`.
- **`Depends()` cycles** — DI graph has a cycle.
- **`response_model` leakage** — internal fields leaking through response.
- **`oauth2_scheme` without `Security(...)`** — auth not enforced.
- **`@app.exception_handler`** missing for `RequestValidationError`.
- **`background_tasks` swallowing exceptions** without logging.
- **`Depends(get_db)` called twice in same request** — session leak.
- **Pydantic v1 vs v2 mixed usage** — flag migration debt.
- **CORS allow_origins=["*"] with allow_credentials=True** — security smell.
- **Routes without rate-limit middleware in `/login`-style paths**.

## Run it

```bash
/ll-fastapi-doctor
/ll-fastapi-doctor fix=true pr=true
```

## In pipes

```bash
/ll-fastapi-doctor fix=true >> ll-no-bluf >> pr "chore: fastapi sweep"
```

## Pairs with

- [`/ll-django-doctor`](ll-django-doctor.md), [`/ll-backend-doctor`](ll-backend-doctor.md), [`/ll-no-bluf`](ll-no-bluf.md)
