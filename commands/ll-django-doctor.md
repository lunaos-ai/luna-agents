---
name: ll-django-doctor
displayName: Luna Django Doctor — Django diagnose + fix
description: Diagnose Django projects via `python manage.py check --deploy`, bandit (security), pylint-django, django-extensions, plus Luna heuristic layer for n+1 queries, signal misuse, async-view correctness, and template XSS. Composes existing tools — no upstream `django-doctor` Python package.
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
  - detect_django_project
  - run_manage_check_deploy
  - run_bandit
  - run_pylint_django
  - run_luna_django_heuristics
  - audit_with_no_bluf
---

# Luna Django Doctor

**Honest note:** there is a commercial `django-doctor.com` web
service. This command does NOT use it; it composes open-source tools
locally.

## What it composes

- `python manage.py check --deploy` — Django's own deploy checklist.
- `bandit -r .` — Python security linter.
- `pylint --load-plugins pylint_django` — Django-aware Python linting.
- `django-extensions` `show_urls` / `validate_templates` (if installed).
- Luna heuristic layer for Django-specific anti-patterns.

## Django-specific checks (Luna heuristic)

- **n+1 queries** — `Model.objects.all()` looped without `select_related` / `prefetch_related`.
- **Missing `transaction.atomic`** on multi-write views.
- **CSRF exempt in production paths**.
- **`render(request, template, locals())`** — leaks all locals to template.
- **Async views calling sync ORM** — `@async_to_sync` wrap missing.
- **`SECRET_KEY` hard-coded** or in committed `settings.py`.
- **`DEBUG=True` in any settings module outside `dev`**.
- **Template autoescape disabled** — `{% autoescape off %}` blocks reviewed.
- **`get_object_or_404` with user-supplied PK and no permission check**.
- **Signals registered at module top-level without `ready()`**.
- **`User.objects.filter(...).delete()`** — missing CASCADE check on FKs.

## Run it

```bash
/ll-django-doctor
/ll-django-doctor fix=true pr=true
```

## In pipes

```bash
/ll-django-doctor fix=true >> ll-no-bluf >> pr "chore: django sweep"
```

## Pairs with

- [`/ll-fastapi-doctor`](ll-fastapi-doctor.md), [`/ll-backend-doctor`](ll-backend-doctor.md), [`/ll-no-bluf`](ll-no-bluf.md)
