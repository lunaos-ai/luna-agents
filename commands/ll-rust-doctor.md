---
name: ll-rust-doctor
displayName: Luna Rust Doctor — Rust backend diagnose + fix
description: Run `npx rust-doctor@latest` (real package) plus cargo clippy, cargo audit, cargo deny, cargo udeps. Luna heuristic layer for async runtime mixing, panic-in-async, and unsafe scope.
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
  - detect_rust_project
  - run_rust_doctor_npx
  - run_cargo_clippy
  - run_cargo_audit
  - run_cargo_deny
  - run_luna_rust_heuristics
  - audit_with_no_bluf
---

# Luna Rust Doctor

Wraps:

- **[`rust-doctor`](https://www.npmjs.com/package/rust-doctor)** v0.1.20 — real npm package.
- **`cargo clippy --all-targets -- -D warnings`** — lint.
- **`cargo audit`** — CVEs in crates.
- **`cargo deny check`** — license + advisory + ban policy.
- **`cargo +nightly udeps`** — unused dependencies.
- Luna heuristic layer.

## Rust-specific checks (Luna heuristic)

- **Async runtime mixing** — tokio and async-std types in same crate.
- **`unwrap()` / `expect()`** in async hot paths.
- **`block_on` inside async fn** — deadlock risk.
- **`unsafe` blocks** — flagged with file:line, summarised.
- **`Arc<Mutex<T>>` over `Arc<RwLock<T>>`** for read-heavy data.
- **`.clone()` on `String` in tight loops**.
- **Missing `#[must_use]`** on builder-style methods.

## Run it

```bash
/ll-rust-doctor
/ll-rust-doctor fix=true pr=true
```

## In pipes

```bash
/ll-rust-doctor fix=true >> ll-no-bluf >> pr "chore: rust sweep"
```

## Pairs with

- [`/ll-go-doctor`](ll-go-doctor.md), [`/ll-backend-doctor`](ll-backend-doctor.md)
