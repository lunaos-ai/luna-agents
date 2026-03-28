---
name: cmds
displayName: Command Cheat Sheet
description: Show all Luna shortcuts and their full command mappings
version: 1.0.0
category: meta
---

# /cmds — Luna Command Cheat Sheet

Quick reference for all shortcuts. Type any of these in Claude Code:

## Dev Workflow (in order)

| Type | Does | Full command |
|------|------|-------------|
| `/req` | Gather requirements | `/ll-requirements` |
| `/des` | Technical design | `/ll-design` |
| `/plan` | Break into tasks | `/ll-plan` |
| `/go` | Execute next task | `/ll-execute` |
| `/rev` | Code review | `/ll-review` |
| `/test` | Run tests | `/ll-test` |
| `/ship` | Deploy | `/ll-deploy` |
| `/watch` | Set up monitoring | `/ll-monitor` |
| `/retro` | Post-launch review | `/ll-postlaunch` |

## Autopilot & Automation

| Type | Does | Full command |
|------|------|-------------|
| `/feature` | Full feature lifecycle until done | `/ll-feature` |
| `/parallel` | Run agents in parallel (build+test+lint) | `/ll-parallel` |
| `/fix` | Systematic bug fix workflow | `/ll-fix` |
| `/debug` | Scientific debugging with persistent state | `/ll-debug` |
| `/refactor` | Split files, extract logic, rename | `/ll-refactor` |
| `/pr` | Generate pull request with summary | `/ll-pr` |

## Quality & Testing

| Type | Does | Full command |
|------|------|-------------|
| `/rules` | Apply session rules (100-line cap, full tests, Playwright) | `/ll-rules` |
| `/perf` | Performance profiling | `/ll-perf` |
| `/a11y` | Accessibility audit (WCAG 2.2) | `/ll-a11y` |
| `/deps` | Dependency audit & cleanup | `/ll-deps` |
| `/mock` | Generate test fixtures & MSW handlers | `/ll-mock` |
| `/storybook` | Generate component stories | `/ll-storybook` |

## Code Generation

| Type | Does | Full command |
|------|------|-------------|
| `/auth` | Build Auth.js system with social providers | `/ll-auth` |
| `/brand` | Generate brand identity from codebase | `/ll-brand` |
| `/api-client` | Generate typed API client SDK | `/ll-api-client` |
| `/migrate` | Generate database migrations | `/ll-migrate` |
| `/i18n` | Internationalization setup | `/ll-i18n` |
| `/ci` | Generate CI/CD pipeline | `/ll-ci` |
| `/changelog` | Auto-generate changelog from git | `/ll-changelog` |

## Infrastructure & DevOps

| Type | Does | Full command |
|------|------|-------------|
| `/env` | Validate & manage .env files | `/ll-env` |
| `/rollback` | Generate rollback procedures | `/ll-rollback` |
| `/dock` | Dockerize | `/ll-dockerize` |
| `/cf` | Cloudflare deploy | `/ll-cloudflare` |
| `/sec` | Security audit | `/ll-365-secure` |

## Tools

| Type | Does | Full command |
|------|------|-------------|
| `/q` | Search codebase (RAG) | `/ll-rag` |
| `/hig` | Apple HIG audit | `/ll-hig` |
| `/ui` | Convert to HIG design | `/ll-ui-convert` |
| `/docs` | Generate docs | `/ll-docs` |
| `/cfg` | Configuration | `/ll-config` |

## Full Pipeline

```
/req -> /des -> /plan -> /go -> /rev -> /test -> /sec -> /hig -> /ship -> /watch -> /retro
```

## Autopilot Pipeline

```
/feature "description" -> implements, tests, reviews, fixes until done -> /pr
```

## Tips

- `/feature` is the autopilot — plan, implement, test, fix in a loop
- `/go` runs one task at a time — repeat until all tasks are `[x]`
- `/parallel build,test,lint` — run multiple checks simultaneously
- `/fix "bug description"` — systematic fix with failing test first
- `/rules` at session start — enforces 100-line cap + full tests
- `/q how does X work?` — ask anything about your code
- `/cmds` — show this cheat sheet anytime
