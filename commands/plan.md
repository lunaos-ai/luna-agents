---
name: plan
displayName: Plan (shortcut)
description: "Shortcut: Create stable cycles and evidence-targeted tasks → /ll-plan"
version: 2.0.0
category: planning
agent: luna-task-planner
parameters:
  - name: scope
    type: string
    description: Project or feature scope
    required: true
    prompt: true
---

# /plan — Implementation Plan

Shortcut for `/luna-plan`.

Break the technical design into ordered, actionable implementation tasks.

## What it does

1. Reads design from `.luna/{project}/design.md`
2. Preserves exact requirement IDs in every task
3. Creates stable phase/epic and task IDs with evidence targets
4. Generates `.luna/{project}/implementation-plan.md`

## Usage

```
/plan
```

## Next

```
/reconcile → /go → /evidence → /verify-requirement
```
