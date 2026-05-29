---
name: ll-agent-deploy
displayName: Luna Agent Deploy — Push a scaffolded agent to prod
description: Deploy an agent scaffolded by /ll-agent-build to Cloudflare Workers, AWS Lambda, Google Cloud Run, Kubernetes, or Docker Compose. Provisions managed dependencies (Postgres, Redis, vector store) per the stack. Idempotent. Refuses to deploy if /ll-agent-eval has not passed.
version: 1.0.0
category: ai
agent: luna-deployment
parameters:
  - name: path
    type: string
    description: Path to the scaffolded agent (the directory created by /ll-agent-build).
    required: true
  - name: target
    type: string
    description: "cf-workers" | "aws-lambda" | "cloud-run" | "k8s" | "docker-compose" | "fly". Default - cf-workers.
    required: false
  - name: env
    type: string
    description: "dev" | "staging" | "prod". Default - staging. prod requires --confirm.
    required: false
  - name: confirm
    type: string
    description: Required for env=prod. Defaults to false.
    required: false
  - name: skip_eval
    type: string
    description: Skip the pre-deploy eval gate. Default - false. Strongly discouraged for prod.
    required: false
workflow:
  - validate_scaffold_present
  - run_pre_deploy_eval_unless_skipped
  - validate_secrets_present
  - provision_managed_dependencies
  - build_and_push_image_if_needed
  - apply_target_specific_manifests
  - run_post_deploy_smoke_tests
  - emit_deploy_record
---

# Luna Agent Deploy

The deploy half of the agent toolchain. Takes a `/ll-agent-build`
scaffold and pushes it to the chosen target with the right managed
dependencies wired up.

## Targets supported

| Target | What deploys |
|---|---|
| `cf-workers` | Worker + KV (cache) + D1 (audit log) + Vectorize (RAG). |
| `aws-lambda` | Lambda + RDS Postgres (or Aurora Serverless) + ElastiCache + OpenSearch + EventBridge for triggers. |
| `cloud-run` | Cloud Run service + Cloud SQL Postgres + Memorystore + Vertex AI optional. |
| `k8s` | Helm chart with the agent + Postgres + Redis + OPA + Jaeger. |
| `docker-compose` | Local dev only — agent + postgres + redis + opa + jaeger in one `compose up`. |
| `fly` | Fly Machine + Fly Postgres + Upstash Redis. |

## Pre-deploy gate

Refuses to deploy if `/ll-agent-eval` has not passed in the last hour
on this scaffold. Override with `skip_eval=true` (logged, audited,
discouraged for prod).

## Approval workflow

For `env=prod`, deploy refuses without `confirm=true`. If the
scaffold's `agent.json` carries `human_approval: true`, deploy ALSO
files an approval request to whatever inbox the scaffold uses
(`approvals` table by default).

## Run it

```bash
/ll-agent-deploy path=./agents/balance-investigator target=cf-workers env=staging
/ll-agent-deploy path=./agents/opensyber-remediator target=k8s env=prod confirm=true
```

## In pipes

```bash
# Build, evaluate, deploy in one flow
/ll-agent-build name=triage goal="..." >> ll-agent-eval >> ll-agent-deploy target=cf-workers env=staging

# Re-deploy on every green main commit
/ll-zen >> ll-agent-eval >> ll-agent-deploy path=./agents/triage env=prod confirm=true
```

## Honesty

- No magic. Each target uses the platform's native tooling (`wrangler deploy`, `sam deploy`, `gcloud run deploy`, `helm upgrade`, `docker compose up`, `flyctl deploy`).
- No invented dashboards. Observability flows to the OpenTelemetry collector you configure; we wire the SDK, you pick the backend.
- No silent secret writes. If a secret is missing in the target's secret manager, deploy stops and prints the exact command to set it.

## Pairs with

- [`/ll-agent-build`](ll-agent-build.md), [`/ll-agent-eval`](ll-agent-eval.md), [`/ll-no-bluf`](ll-no-bluf.md), [`/ll-zen`](ll-zen.md), [`/ll-hospital`](ll-hospital.md).
