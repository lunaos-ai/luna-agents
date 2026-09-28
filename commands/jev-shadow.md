---
name: jev-shadow
displayName: Jev Shadow Observer
description: Compare evidence-derived lifecycle state with a typed Jev signal without taking action
version: 1.0.0
category: lifecycle
runtime: native
---

# /jev-shadow

Send a sanitized lifecycle summary to TypeSafe Jev and return one typed Choice,
one Score, and one Noul probability. The result is always advisory:

- it cannot advance or regress lifecycle state;
- it cannot authorize tools, GitHub writes, releases, or access;
- it cannot make AML, sanctions, eligibility, or policy decisions;
- it never writes code or replaces the coding model;
- an unavailable or malformed Jev response degrades safely to `unavailable`.

Preview the exact outbound state without making a network request:

```bash
luna jev-shadow PHASE-6 --dry-run --json
```

Run a shadow observation with a VibeVault-injected key:

```bash
vibevault run --only AMLIQ_JEV_API_KEY -- \
  luna jev-shadow PHASE-6 \
  --api-key-env AMLIQ_JEV_API_KEY \
  --json
```

The default model is pinned to `jev-1.13.0` so early-access observations remain
comparable. Live calls are restricted to TypeSafe's official HTTPS System One
endpoint and redirects are rejected. The response records the returned model
version, snapshot digest, choice probabilities, score probabilities, confidence,
and human-review probability. It does not apply the suggested lane.
