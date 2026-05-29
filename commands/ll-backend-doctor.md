---
name: ll-backend-doctor
displayName: Luna Backend Doctor — Stack-aware backend triage
description: Auto-detect the backend stack (Node, Java/Vert.x/Spring, Python/Django/FastAPI, Go, Rust, Ruby/Rails, PHP, .NET, Elixir) and run the matching doctor. Pipes through /ll-no-bluf before opening a PR.
version: 1.0.0
category: quality
agent: luna-code-review
parameters:
  - name: path
    type: string
    description: Path to backend project root. Default - current working directory.
    required: false
  - name: fix
    type: string
    description: If "true", auto-apply safe fixes. Default - false.
    required: false
  - name: pr
    type: string
    description: If "true", open a pull request with the staged fixes. Default - false.
    required: false
workflow:
  - detect_backend_stack
  - dispatch_to_specific_doctor
  - aggregate_results
  - audit_with_no_bluf
  - emit_summary_report
---

# Luna Backend Doctor

Dispatcher. Reads project descriptors (`package.json`, `pom.xml`,
`build.gradle`, `requirements.txt`, `pyproject.toml`, `go.mod`,
`Cargo.toml`, `Gemfile`, `composer.json`, `*.csproj`, `mix.exs`)
and routes to the right backend doctor.

| Detected | Routes to |
|---|---|
| Express, Fastify, Hono, Koa, NestJS | [`/ll-node-doctor`](ll-node-doctor.md) |
| Vert.x (Java/Kotlin) | [`/ll-vertx-doctor`](ll-vertx-doctor.md) |
| Spring Boot | [`/ll-spring-doctor`](ll-spring-doctor.md) |
| Django | [`/ll-django-doctor`](ll-django-doctor.md) |
| FastAPI, Starlette | [`/ll-fastapi-doctor`](ll-fastapi-doctor.md) |
| Rails | [`/ll-rails-doctor`](ll-rails-doctor.md) |
| Go (gin, fiber, echo, chi, std net/http) | [`/ll-go-doctor`](ll-go-doctor.md) |
| Rust (axum, actix, rocket) | [`/ll-rust-doctor`](ll-rust-doctor.md) |
| PHP (Laravel, Symfony) | [`/ll-php-doctor`](ll-php-doctor.md) |
| .NET (ASP.NET Core) | [`/ll-dotnet-doctor`](ll-dotnet-doctor.md) |
| Elixir / Phoenix | [`/ll-elixir-doctor`](ll-elixir-doctor.md) |
| Polyglot monorepo | runs each detected doctor in parallel |

## Run it

```bash
/ll-backend-doctor
/ll-backend-doctor fix=true pr=true
/ll-backend-doctor path=services/payments
```

## In pipes

```bash
/ll-backend-doctor fix=true >> ll-no-bluf >> pr "chore: backend sweep"
/ll-doctor >> ll-backend-doctor >> ll-infra-doctor >> ship      # full stack
```

## Pairs with

- [`/ll-doctor`](ll-doctor.md) — frontend dispatcher
- [`/ll-hospital`](ll-hospital.md) — runs every wing (frontend + backend + infra + data) in parallel
- [`/ll-prescribe`](ll-prescribe.md) — analyses stack and prints the doctors you should run
