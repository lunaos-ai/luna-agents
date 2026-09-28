---
name: req
displayName: Requirements (shortcut)
description: "Shortcut: Generate stable, evidence-governed requirements → /ll-requirements"
version: 2.0.0
category: analysis
agent: luna-requirements-analyzer
parameters:
  - name: scope
    type: string
    description: Project or feature scope
    required: true
    prompt: true
---

# /req — Requirements Analysis

Shortcut for `/luna-requirements`.

Analyze the project codebase and generate a comprehensive requirements document.

## What it does

1. Scans codebase structure, dependencies, and patterns
2. Preserves or assigns stable requirement IDs
3. Separates lifecycle claims from inspectable evidence
4. Generates `.luna/{project}/requirements.md` for native reconciliation

## Usage

```
/req
```

Then enter scope when prompted (press ENTER for full project).

## Next

```
/reconcile → /des → /plan → /go → /evidence → /verify-requirement
```
