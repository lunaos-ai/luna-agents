---
name: ll-dotnet-doctor
displayName: Luna .NET Doctor — ASP.NET Core diagnose + fix
description: Diagnose .NET / ASP.NET Core projects via dotnet format, dotnet-outdated, Roslyn analyzers, security-code-scan, plus Luna heuristic layer for DI scope, EF Core n+1, and middleware ordering.
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
  - detect_dotnet_project
  - run_dotnet_format
  - run_dotnet_outdated
  - run_roslyn_analyzers
  - run_security_code_scan
  - run_luna_dotnet_heuristics
  - audit_with_no_bluf
---

# Luna .NET Doctor

**Honest note:** no published `dotnet-doctor` package. Composes
standard .NET tooling.

## What it composes

- `dotnet format` — formatting + analyzer auto-fixes.
- `dotnet outdated` — outdated NuGet packages.
- Roslyn analyzers (configured via `.editorconfig`).
- `security-code-scan` — SCA for ASP.NET.
- Luna heuristic layer.

## .NET-specific checks (Luna heuristic)

- **EF Core n+1** — `.ToList()` in a loop without `.Include()`.
- **Scoped service injected into singleton** — captive dependency.
- **`async void`** outside event handlers.
- **`.Result` / `.Wait()`** on Task in request path — deadlock risk.
- **Missing `[Authorize]`** on controllers in protected areas.
- **Middleware ordering** — `UseRouting` after `UseEndpoints`.
- **`AllowAnyOrigin().AllowCredentials()`** in CORS.
- **`HttpClient` `new`'d per request** — socket exhaustion.

## Run it

```bash
/ll-dotnet-doctor
/ll-dotnet-doctor fix=true pr=true
```

## Pairs with

- [`/ll-backend-doctor`](ll-backend-doctor.md), [`/ll-no-bluf`](ll-no-bluf.md)
