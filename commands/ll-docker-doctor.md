---
name: ll-docker-doctor
displayName: Luna Docker Doctor — Dockerfile + image diagnose + fix
description: Diagnose Dockerfiles and built images via hadolint (Dockerfile lint), dive (image layer analysis), trivy (image CVEs), dockle (CIS Docker benchmark), plus Luna heuristic layer for build-cache layout, multi-stage opportunity, and secret leakage.
version: 1.0.0
category: devops
agent: luna-docker
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
  - detect_dockerfile
  - run_hadolint
  - run_trivy_image_scan
  - run_dockle
  - run_dive_efficiency
  - run_luna_docker_heuristics
  - audit_with_no_bluf
---

# Luna Docker Doctor

Composes the standard container-image audit stack.

## What it composes

- `hadolint Dockerfile` — Dockerfile lint.
- `trivy image <name>` — CVEs in OS packages + language deps.
- `dockle <name>` — CIS Docker benchmark.
- `dive <name>` — wasted layers + image efficiency.
- Luna heuristic layer.

## Docker-specific checks (Luna heuristic)

- **Secrets in `ENV` / `ARG`** — committed credentials.
- **`RUN apt-get update && apt-get install` without `--no-install-recommends`**.
- **No multi-stage** when final image carries build tools (gcc, npm dev deps).
- **`COPY . .`** before `RUN install` — cache busted on every change.
- **`USER root`** in final stage.
- **No `HEALTHCHECK`**.
- **`:latest` base image tag**.
- **Missing `.dockerignore`** when `COPY . .` is present.

## Run it

```bash
/ll-docker-doctor
/ll-docker-doctor fix=true pr=true
```

## Pairs with

- [`/ll-k8s-doctor`](ll-k8s-doctor.md), [`/ll-terraform-doctor`](ll-terraform-doctor.md), [`/ll-no-bluf`](ll-no-bluf.md)
