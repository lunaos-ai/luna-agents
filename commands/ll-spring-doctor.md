---
name: ll-spring-doctor
displayName: Luna Spring Doctor — Spring Boot diagnose + fix
description: Diagnose Spring Boot apps for security (Spring Security mis-config, CSRF, JWT), perf (n+1 queries, missing indexes, thread-pool exhaustion), correctness (transactional boundaries, exception mapping), bean lifecycle, actuator exposure, dependency CVEs. Composes SpotBugs, OWASP Dependency-Check, Spring Actuator, error-prone, PMD with a Luna Spring-aware heuristic layer.
version: 1.0.0
category: quality
agent: luna-code-review
parameters:
  - name: path
    type: string
    description: Spring Boot project root.
    required: false
  - name: build_tool
    type: string
    description: "maven" or "gradle". Auto-detect by default.
    required: false
  - name: fix
    type: string
    required: false
  - name: pr
    type: string
    required: false
workflow:
  - detect_spring_boot_project
  - run_spotbugs
  - run_owasp_dependency_check
  - inspect_actuator_endpoints
  - run_luna_spring_heuristics
  - audit_with_no_bluf
---

# Luna Spring Doctor

**Honest note:** no published `spring-doctor` package. This composes
existing JVM tooling with Luna's Spring-aware heuristic layer.

## What it composes

| Tool | What it catches |
|---|---|
| SpotBugs + `find-sec-bugs` plugin | Generic Java + security bug patterns |
| OWASP Dependency-Check | CVEs in deps |
| Spring Boot Actuator audit | Over-exposed endpoints in prod profile |
| `error-prone` | Java correctness |
| PMD | Code quality |
| **Luna Spring heuristic** | Spring-specific (below) |

## Spring-specific checks (Luna heuristic)

- **`@Transactional` on non-public methods** (no-op).
- **n+1 JPA queries** — missing `@EntityGraph` or `JOIN FETCH`.
- **Bean cycles** — circular `@Autowired` graphs.
- **Field injection** — flag `@Autowired` on fields, recommend constructor injection.
- **Open redirect** — `RedirectView` from untrusted input.
- **CSRF disabled in WebSecurityConfigurerAdapter** (or `SecurityFilterChain`) outside test profile.
- **Actuator endpoints exposed** — `management.endpoints.web.exposure.include=*` in prod.
- **`@RequestBody` without validation** — missing `@Valid` + `@Validated`.
- **`RestTemplate` without timeouts** — `ResourceAccessException` waiting to happen.
- **Async `@Async` without dedicated `Executor`** — defaults to single-thread.
- **`@Scheduled` with overlapping fixedDelay + no `@EnableScheduling`**.

## Run it

```bash
/ll-spring-doctor
/ll-spring-doctor build_tool=gradle
/ll-spring-doctor fix=true pr=true
```

## In pipes

```bash
/ll-spring-doctor fix=true >> ll-no-bluf >> pr "chore: spring sweep"
/ll-vertx-doctor >> ll-spring-doctor >> ll-hospital
```

## Pairs with

- [`/ll-vertx-doctor`](ll-vertx-doctor.md), [`/ll-backend-doctor`](ll-backend-doctor.md), [`/ll-no-bluf`](ll-no-bluf.md)
