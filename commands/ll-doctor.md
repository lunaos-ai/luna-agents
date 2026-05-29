---
name: ll-doctor
displayName: Luna Doctor — Framework-aware diagnose + fix
description: Auto-detect the framework (React, Next.js, Svelte, SvelteKit, Vue, Solid, Astro) and route to the right doctor. Falls back to `/ll-zen` for full-stack health if no framework match. Pipe through `/ll-no-bluf` before opening a PR.
version: 1.0.0
category: quality
agent: luna-code-review
parameters:
  - name: path
    type: string
    description: Path to project root. Default - current working directory.
    required: false
    prompt: false
  - name: fix
    type: string
    description: If "true", auto-apply safe fixes and stage them. Default - false.
    required: false
    prompt: false
  - name: pr
    type: string
    description: If "true", open a pull request with the staged fixes. Default - false.
    required: false
    prompt: false
workflow:
  - detect_framework
  - dispatch_to_specific_doctor
  - aggregate_results
  - audit_with_no_bluf
  - open_pr_if_requested
  - emit_summary_report
---

# Luna Doctor

The framework-aware dispatcher. Reads `package.json`, detects the
stack, calls the right doctor command:

| Detected | Routes to |
|---|---|
| React, Next.js, React Native | [`/ll-react-doctor`](ll-react-doctor.md) |
| Svelte, SvelteKit | [`/ll-svelte-doctor`](ll-svelte-doctor.md) |
| Vue, Nuxt | `npx vue-doctor@latest` *(when published)* |
| Solid | `npx solid-doctor@latest` *(when published)* |
| Astro | `npx astro check` *(built-in)* |
| Unknown / polyglot | falls back to [`/ll-zen`](ll-zen.md) |

## Run it

```bash
/ll-doctor                                    # auto-detect + report
/ll-doctor fix=true                           # auto-detect + stage fixes
/ll-doctor fix=true pr=true                   # full sweep + PR
/ll-doctor path=apps/dashboard                # specific subproject
```

## Detection rules

Reads `package.json` dependencies in order of specificity:

1. `next` → React + Next-specific rules
2. `react-native` → React Native rules
3. `@sveltejs/kit` → SvelteKit
4. `svelte` → Svelte
5. `nuxt` → Nuxt
6. `vue` → Vue
7. `solid-js` → Solid
8. `astro` → Astro
9. None of the above → polyglot mode, runs `/ll-zen`

## Output

- `.luna/{project}/doctor/report.json` — combined findings.
- `.luna/{project}/doctor/summary.md` — human report.
- `.luna/{project}/doctor/fixes.diff` — unified diff (if `fix=true`).

## In pipes

```bash
/ll-doctor fix=true >> ll-no-bluf >> pr "chore: framework sweep"
/ll-doctor >> ll-readme-sync >> ship
/ll-doctor >> ll-perf-trace >> ll-365-secure        # broader sweep
```

## Why a dispatcher

Most projects don't stay on one framework forever. A monorepo with
Next + SvelteKit shouldn't need two muscle-memory commands. `/ll-doctor`
just works.
