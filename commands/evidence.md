---
name: evidence
displayName: Requirement Evidence
description: Attach digest-bound or attested evidence to a stable requirement ID
version: 1.0.0
category: lifecycle
runtime: native
---

# /evidence

Append evidence for one lifecycle gate. File evidence is digest-bound by
default, so later file changes make it stale and reconciliation regresses state.

```bash
luna evidence PAY-001 --kind implementation --source file:src/payments.ts
luna evidence PAY-001 --kind verification --source file:reports/payments-test.json
luna evidence PAY-001 --kind deployment --source url:https://deploy.example/receipt --attested
```

Kinds are `implementation_started`, `implementation`, `verification`,
`deployment`, `e2e`, and `completion`.
