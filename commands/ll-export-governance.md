---
name: ll-export-governance
displayName: Luna Export Governance — Emit agent manifests for IAM platforms
description: Read a /ll-agent-build scaffold (or a /ll-swarm-supervisor / /ll-swarm-vote scaffold) and emit a governance manifest in the format expected by Willow, Backstage, a generic IAM platform, an OPA bundle, or an OpenAPI surface. The manifest carries identity, scoped tool permissions, audit endpoints, approval rules, and the OPA bundle. Same source of truth ships to runtime (Cloudflare/k8s) AND to governance.
version: 1.0.0
category: security
agent: luna-365-security
parameters:
  - name: path
    type: string
    description: Path to the scaffolded agent (or swarm) directory.
    required: true
  - name: target
    type: string
    description: "willow" | "backstage" | "generic-iam" | "opa-bundle" | "openapi" | "all". Default - all.
    required: false
  - name: out_dir
    type: string
    description: Where to write the manifests. Default - ./<path>/governance/.
    required: false
  - name: include_secrets
    type: string
    description: If "true", include secret names (NOT values) in the manifest. Default - true. Refuses to include values regardless.
    required: false
  - name: include_dataflow
    type: string
    description: If "true", emit a data-flow diagram showing which tools read what data. Default - true.
    required: false
  - name: identity_strategy
    type: string
    description: "service-account" (default) | "workload-identity" | "oauth-client". How the manifest declares the agent's identity to the governance platform.
    required: false
workflow:
  - load_agent_json_and_policy
  - inventory_tools_and_scopes
  - extract_audit_endpoints_from_otel
  - build_identity_claim
  - emit_target_specific_manifests
  - audit_with_no_bluf
  - emit_summary
---

# Luna Export Governance

Bridges Luna's builder side with the governance side of the stack
(Willow, Backstage, IAM platforms). Reads the scaffold; emits a
manifest that declares — in the target platform's vocabulary —
**this agent's identity, what tools it can call, what data it
touches, where it logs, and how risky actions are gated**.

One source of truth. Same scaffold ships to runtime (Cloudflare,
Lambda, k8s) **and** to governance.

## Why this exists

Most teams maintain two parallel descriptions of an agent: the code
that runs it, and the policy doc the security team needs. They drift.

`/ll-export-governance` removes the second copy by deriving it from
the first. Every field in the manifest comes from a real file in the
scaffold:

| Manifest field | Source |
|---|---|
| `identity.name` | `agent.json -> name` |
| `identity.purpose` | `agent.json -> goal` |
| `tools[].name` | `src/tools/*.ts` |
| `tools[].scopes` | `policy/policy.rego` rule heads |
| `data.reads` / `data.writes` | static analysis of tool calls + `case.schema.json` |
| `audit.endpoint` | `src/observability/otel.ts` |
| `audit.tables` | `migrations/*.sql` |
| `approvals.required` | `agent.json -> human_approval` + autonomy level |
| `risk.autonomy_level` | `agent.json -> autonomy` |
| `secrets.names` | `.env.example` keys |

If any of these is missing in the scaffold, the export fails with a
specific pointer — no silent gaps.

## Targets

### `willow`

Emits `willow-manifest.json` matching the Willow Basecamp ingestion
schema:

```json
{
  "agent": {
    "name": "payment-investigator",
    "identity": {
      "type": "service-account",
      "principal": "luna://agents/payment-investigator"
    },
    "purpose": "Investigate payment failures",
    "autonomy": "level-3-recommend",
    "tools": [
      { "name": "postgres", "scopes": ["read:ledger", "read:transactions"] },
      { "name": "filesystem", "scopes": ["read:logs"] }
    ],
    "data": { "reads": ["ledger", "transactions"], "writes": [] },
    "audit": {
      "endpoint": "otlp://collector.example.com:4317",
      "tables": ["agent_runs", "agent_steps", "agent_tool_calls"]
    },
    "approvals": { "required": true, "channel": "email" },
    "secrets": ["DATABASE_URL", "ANTHROPIC_API_KEY"]
  },
  "policy": { "format": "opa", "bundle": "./policy.tar.gz" }
}
```

### `backstage`

Emits a Backstage `catalog-info.yaml` with the agent as a Component
(`spec.type: ai-agent`), the MCP tools as dependencies, and the
audit endpoint as a System.

### `generic-iam`

Emits a vendor-neutral SCIM-flavoured JSON with the principal,
scopes, and audit metadata. Use for custom IAM, OPA gateways, or
SIEM ingestion.

### `opa-bundle`

Emits a fully-formed OPA bundle (`bundle.tar.gz`) containing the
agent's `policy.rego` plus a derived `permissions.rego` describing
which tools the agent may invoke and under what conditions. Drop
directly into an OPA sidecar.

### `openapi`

Emits an `openapi.yaml` describing the agent's invocation interface
(`POST /invoke`), input/output schemas, auth scheme, and rate
limits. Use for an API gateway or for an LLM-discovery surface.

### `all`

Emits all five. Each in `<out_dir>/<target>/`. Plus a single
`README.md` explaining what each file is for.

## Run it

```bash
# After /ll-agent-build, ship runtime AND governance from one truth
/ll-export-governance path=./agents/payment-investigator target=willow

# Backstage catalogue entry for the platform team
/ll-export-governance path=./agents/payment-investigator target=backstage

# OPA bundle for the gateway sidecar
/ll-export-governance path=./agents/payment-investigator target=opa-bundle

# All formats, vendor-neutral
/ll-export-governance path=./agents/payment-investigator target=all
```

## In pipes

```bash
# Build → eval → ship to runtime AND to Willow → file the policy ticket
/pipe \
  ll-agent-build name=triage goal="..." autonomy=3 \
  >> ll-agent-eval \
  >> ll-export-governance target=willow \
  >> ll-agent-deploy target=cf-workers env=staging \
  >> jira create-issue project=SEC title="New agent: triage" attach=./agents/triage/governance/willow/willow-manifest.json

# Swarm scaffold → governance bundle for the whole swarm
/pipe \
  ll-swarm-supervisor name=opensyber-mvp goal="..." specialists="..." \
  >> ll-export-governance target=all

# CI gate: refuse to deploy if the governance manifest hasn't been re-exported since the last scaffold change
/pipe \
  ll-export-governance path=./agents/triage target=opa-bundle --check \
  >> ll-agent-deploy target=cf-workers env=prod confirm=true
```

## Honest scope

- No values exported, ever. Only secret **names** (`DATABASE_URL`),
  never the value. Refuses to read `.env` (only `.env.example`).
- The OPA bundle is derived from rules in the scaffold's
  `policy.rego` plus the tools wired in `agent.json`. We do not
  invent permissions.
- Willow / Backstage / SCIM schemas are based on each platform's
  public documentation at the time of writing. If a vendor changes
  schema, the exporter version bumps; old manifests stay readable.
- We do not push to the governance platform. The manifest lands on
  disk; you decide when to upload. Pair with the platform's own
  ingestion command (`willow push manifest ...`, `backstage push
  ...`, your IAM API).

## Validation

Before writing, the exporter validates:

- Every tool the agent calls has a scope declared in `policy.rego`.
- `human_approval` matches the autonomy level (Level 6 must be true).
- No tool is wired without a corresponding `data` declaration.
- OTel endpoint is present.

Any failure prints the file + line that needs attention.

## Pairs with

- [`/ll-agent-build`](ll-agent-build.md), [`/ll-swarm-supervisor`](ll-swarm-supervisor.md), [`/ll-swarm-vote`](ll-swarm-vote.md), [`/ll-agent-deploy`](ll-agent-deploy.md), [`/ll-no-bluf`](ll-no-bluf.md), [`/ll-cve-doctor`](ll-cve-doctor.md).
