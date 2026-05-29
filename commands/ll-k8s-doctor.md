---
name: ll-k8s-doctor
displayName: Luna K8s Doctor — Kubernetes manifests + cluster diagnose
description: Diagnose Kubernetes manifests + (optionally) a live cluster via kube-linter, kubeval, kube-score, polaris, trivy k8s, plus Luna heuristic layer for pod security, RBAC over-grant, and CVE exposure including kernel CVEs (e.g. CVE-2026-31431 Copy Fail container escape).
version: 1.0.0
category: devops
agent: luna-cloudflare
parameters:
  - name: path
    type: string
    required: false
  - name: context
    type: string
    description: kubectl context to scan live (optional). Read-only.
    required: false
  - name: fix
    type: string
    required: false
  - name: pr
    type: string
    required: false
workflow:
  - detect_k8s_manifests
  - run_kubelinter
  - run_kubeval
  - run_kubescore
  - run_polaris_audit
  - run_trivy_k8s_if_context_set
  - run_luna_k8s_heuristics
  - audit_with_no_bluf
---

# Luna K8s Doctor

Composes Kubernetes security + correctness tooling.

## What it composes

- `kube-linter lint <path>` — manifest lint.
- `kubeval <files>` — schema validation against Kubernetes API version.
- `kube-score score <files>` — production-readiness checks.
- `polaris audit --audit-path <path>` — best-practices.
- `trivy k8s --report summary cluster` (if `context` provided) — live cluster CVEs.
- Luna heuristic layer.

## K8s-specific checks (Luna heuristic)

- **No `securityContext.runAsNonRoot: true`** on workload pods.
- **`hostPath` volumes** outside namespaced controllers.
- **Privileged containers** outside cluster-system namespaces.
- **`allowPrivilegeEscalation: true`** (or default).
- **Missing `seccompProfile: RuntimeDefault`**.
- **`hostNetwork: true`** on app workloads.
- **RBAC `*` verbs/resources** in non-admin roles.
- **NetworkPolicy missing** in app namespace.
- **PodSecurityAdmission label missing or `privileged`** on app namespaces.
- **CVE-2026-31431 (Copy Fail) exposure** — flag clusters whose nodes report kernel ≤ patched-version range; suggests upgrade + `Sysctl` `kernel.unprivileged_userns_clone=0` mitigation pending vendor patch.

## Run it

```bash
/ll-k8s-doctor                                  # manifests only
/ll-k8s-doctor context=prod                      # also scan live cluster (read-only)
/ll-k8s-doctor fix=true pr=true
```

## Pairs with

- [`/ll-docker-doctor`](ll-docker-doctor.md), [`/ll-terraform-doctor`](ll-terraform-doctor.md), [`/ll-cve-doctor`](ll-cve-doctor.md), [`/ll-no-bluf`](ll-no-bluf.md)
