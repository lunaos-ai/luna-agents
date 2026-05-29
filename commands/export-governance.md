---
name: export-governance
displayName: Export Governance (shortcut)
description: "Shortcut: Emit agent manifests for Willow / Backstage / generic IAM / OPA / OpenAPI from a Luna scaffold -> /ll-export-governance"
version: 1.0.0
category: security
agent: luna-365-security
shortcut_for: ll-export-governance
---

# Export Governance

Shortcut for `/ll-export-governance`.

Single source of truth: derive the governance manifest from the
runtime scaffold. One change in `agent.json` updates both. No
parallel policy doc.
