---
name: ll-vertx-doctor
displayName: Luna Vert.x Doctor — Reactive JVM backend triage
description: Diagnose Vert.x (Java / Kotlin) projects for event-loop blocking, codec misuse, cluster manager mis-config, async-handler correctness, and security. Composes existing JVM tooling (SpotBugs, OWASP Dependency-Check, Vert.x BlockedThreadChecker reports, error-prone, PMD) with a Luna heuristic layer. No upstream `vertx-doctor` package exists — this is a Luna-original orchestration.
version: 1.0.0
category: quality
agent: luna-code-review
parameters:
  - name: path
    type: string
    description: Path to Vert.x project root (contains pom.xml or build.gradle). Default - current working directory.
    required: false
  - name: build_tool
    type: string
    description: "maven" or "gradle". Default - auto-detect from pom.xml / build.gradle presence.
    required: false
  - name: fix
    type: string
    description: If "true", stage safe fixes (mostly codec + Future composition refactors).
    required: false
  - name: pr
    type: string
    description: If "true", open a pull request.
    required: false
workflow:
  - detect_vertx_project
  - parse_pom_or_build_gradle
  - run_spotbugs
  - run_owasp_dependency_check
  - parse_blocked_thread_logs
  - run_luna_vertx_heuristics
  - apply_safe_fixes_if_requested
  - audit_with_no_bluf
---

# Luna Vert.x Doctor

**Honest note:** no widely-published `vertx-doctor` package exists on
Maven Central or npm. This command is a Luna-original orchestration of
existing JVM tooling plus a heuristic ruleset for Vert.x idioms.

## What it composes

| Tool | What it catches |
|---|---|
| `mvn spotbugs:check` / `./gradlew spotbugsMain` | Generic Java bug patterns |
| `mvn org.owasp:dependency-check-maven:check` | CVEs in dependencies |
| Vert.x [BlockedThreadChecker](https://vertx.io/docs/vertx-core/java/#_high_availability_and_fail_over) log parsing | Event-loop blocking events at runtime |
| `mvn pmd:check` | Common code-quality issues |
| `error-prone` annotations | Java-level correctness errors |
| **Luna heuristic layer** (Claude-driven, grep + AST) | Vert.x-specific anti-patterns (see below) |

## Vert.x-specific checks (Luna heuristic)

- **Event loop blocking** — direct `Thread.sleep`, synchronous JDBC, `File.readAllBytes` inside `Handler<RoutingContext>` or verticle `start`.
- **Missing `executeBlocking`** — long-running CPU work outside a worker pool.
- **Future composition leaks** — `Future` started but not composed or awaited.
- **Codec correctness** — `EventBus` messages sent without a registered codec for non-primitive types.
- **Cluster manager mis-config** — Hazelcast / Ignite / Infinispan config drift, missing `setHAEnabled`.
- **Verticle leak** — `deployVerticle` without an undeploy hook in tests.
- **Reactive Vert.x** — `Single`/`Maybe`/`Completable` from RxVertx subscribed twice.
- **JsonObject mis-use** — accessing missing keys without `getJsonObject(...)?.getString(...)`-style safety.
- **Body handler before routes** — `BodyHandler.create()` not mounted before route handlers that read body.
- **CORS / auth handler order** — common Router.route() ordering bugs.

## Run it

```bash
/ll-vertx-doctor                                # report-only
/ll-vertx-doctor build_tool=gradle              # force gradle
/ll-vertx-doctor fix=true                       # stage safe refactors
/ll-vertx-doctor fix=true pr=true               # stage + PR
/ll-vertx-doctor path=services/order            # subproject
```

Under the hood (Maven example):

```bash
mvn -B \
  spotbugs:check \
  org.owasp:dependency-check-maven:check \
  pmd:check
# plus Luna heuristic scan via grep + AST
```

For Gradle:

```bash
./gradlew spotbugsMain dependencyCheckAnalyze pmdMain
```

## Output

- `.luna/{project}/vertx-doctor/report.json` — combined findings.
- `.luna/{project}/vertx-doctor/summary.md` — human report.
- `.luna/{project}/vertx-doctor/fixes.diff` — safe refactors (if `fix=true`).
- `.luna/{project}/vertx-doctor/blocked-threads.md` — parsed BlockedThreadChecker log entries grouped by handler.

## In pipes

```bash
/ll-vertx-doctor fix=true >> ll-no-bluf >> pr "chore: vert.x sweep"
/ll-vertx-doctor >> ll-spring-doctor >> ship              # polyglot JVM monorepo
/ll-hospital                                              # runs vert.x doctor as part of full sweep
```

## Pairs with

- [`/ll-spring-doctor`](ll-spring-doctor.md) — Spring Boot equivalent.
- [`/ll-backend-doctor`](ll-backend-doctor.md) — dispatcher.
- [`/ll-no-bluf`](ll-no-bluf.md) — verify findings before PR.

## Why a heuristic doctor for Vert.x

Vert.x's biggest footgun (event-loop blocking) is a runtime behavior,
not a static pattern. SpotBugs won't catch a JDBC call in a handler;
Luna does, by recognising Vert.x types in scope and flagging
synchronous I/O against them.

## Wishlist (future tools to wrap when they ship)

- A community `vertx-doctor` Maven plugin (if/when published).
- Reactor Netty / Project Reactor static analyzers for cross-runtime checks.
