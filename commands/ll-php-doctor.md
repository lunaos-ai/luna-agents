---
name: ll-php-doctor
displayName: Luna PHP Doctor — Laravel / Symfony / PHP diagnose + fix
description: Diagnose PHP projects via psalm, phpstan, composer audit, php-cs-fixer, plus Luna heuristic layer for Laravel n+1, Symfony service-container leaks, and SQL builder injection.
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
  - detect_php_project
  - run_psalm
  - run_phpstan
  - run_composer_audit
  - run_luna_php_heuristics
  - audit_with_no_bluf
---

# Luna PHP Doctor

**Honest note:** no published `php-doctor` package. Composes the
standard PHP static-analysis stack.

## What it composes

- `vendor/bin/psalm --no-cache` — static analysis.
- `vendor/bin/phpstan analyse` — type checking.
- `composer audit` — CVE check.
- `vendor/bin/php-cs-fixer fix` — auto-format.
- Luna heuristic layer.

## PHP-specific checks (Luna heuristic)

- **Laravel n+1** — Eloquent loop without `->with(...)`.
- **Mass assignment** — `Model::create($request->all())`.
- **CSRF middleware** missing on POST routes.
- **`DB::raw`** with user input.
- **Symfony service-container leak** — services held statically.
- **`eval()`, `unserialize()`** on untrusted input.
- **Open redirect** — `redirect($request->input('url'))`.
- **Missing CSP headers** in production middleware.

## Run it

```bash
/ll-php-doctor
/ll-php-doctor fix=true pr=true
```

## Pairs with

- [`/ll-backend-doctor`](ll-backend-doctor.md), [`/ll-no-bluf`](ll-no-bluf.md)
