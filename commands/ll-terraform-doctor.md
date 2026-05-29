---
name: ll-terraform-doctor
displayName: Luna Terraform Doctor — IaC diagnose + fix
description: Diagnose Terraform / OpenTofu via tflint, tfsec, checkov, terrascan, plus Luna heuristic layer for state drift, over-permissive IAM, and missing tags.
version: 1.0.0
category: devops
agent: luna-cloudflare
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
  - detect_terraform_project
  - run_terraform_validate
  - run_tflint
  - run_tfsec
  - run_checkov
  - run_luna_iac_heuristics
  - audit_with_no_bluf
---

# Luna Terraform Doctor

Composes the IaC scan stack.

## What it composes

- `terraform validate` — syntax + provider schema.
- `tflint` — code style + provider rules.
- `tfsec` — security misconfig.
- `checkov` — policy + compliance.
- Luna heuristic layer.

## IaC-specific checks (Luna heuristic)

- **`*` in IAM policy `Action` or `Resource`** — over-grant.
- **Public S3 / R2 buckets** with no explicit comment.
- **Security group `0.0.0.0/0` on tcp/22 or tcp/3389**.
- **No `lifecycle { prevent_destroy = true }`** on stateful resources.
- **Hard-coded credentials** in `tfvars`.
- **Missing tags** — `Project`, `Owner`, `Environment`.
- **`force_destroy = true`** on prod buckets.

## Run it

```bash
/ll-terraform-doctor
/ll-terraform-doctor fix=true pr=true
```

## Pairs with

- [`/ll-docker-doctor`](ll-docker-doctor.md), [`/ll-k8s-doctor`](ll-k8s-doctor.md), [`/ll-no-bluf`](ll-no-bluf.md)
