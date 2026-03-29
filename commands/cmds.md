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

## AI & Intelligence

| Type | Does | Full command |
|------|------|-------------|
| `/nexa` | Nexa semantic code analysis (review, bugs, explain) | `/ll-nexa` |
| `/lam` | Goal-driven autonomous actions (Large Action Model) | `/ll-lam` |
| `/oh` | Delegate to OpenHands autonomous agent | `/ll-openhands` |
| `/chain` | Chain agents together (rag->nexa->openhands) | `/ll-agent-chain` |
| `/vision` | Screenshot-to-code, UI analysis, visual diff | `/ll-vision` |
| `/search` | Multi-engine search (RAG + Nexa + grep) | `/ll-smart-search` |
| `/q` | RAG codebase search | `/ll-rag` |

## Tools

| Type | Does | Full command |
|------|------|-------------|
| `/hig` | Apple HIG audit | `/ll-hig` |
| `/ui` | Convert to HIG design | `/ll-ui-convert` |
| `/docs` | Generate docs | `/ll-docs` |
| `/cfg` | Configuration | `/ll-config` |

## Pipeline Runner

| Type | Does | Full command |
|------|------|-------------|
| `/pipe` | Combine commands: `>>` sequential, `~~` parallel | `/ll-pipe` |

### Operators
```
>>   sequential (run one after another)
~~   parallel (run all at once)
( )  group commands
?>>  run next only if previous succeeded
!>>  run next only if previous failed
*N   loop N times                        go *5
*N?  loop up to N, stop on success       (fix >> test) *3?
*N!  loop up to N, stop on failure       go *10!
*?   loop until success (max 10)         (fix >> test) *?
@before:CMD  run before each step        @before:rules
@after:CMD   run after each step         @after:test
@each:CMD    run before+after each step  @each:lint
```

### Pipeline Examples

```
# Standard dev workflow (sequential)
/pipe req >> des >> plan >> go >> rev >> test >> ship

# Quality gate (parallel checks, then deploy)
/pipe (lint ~~ test ~~ typecheck ~~ security) >> ship

# Conditional deploy (deploy if pass, fix if fail)
/pipe test ?>> deploy !>> fix

# AI-powered pipeline
/pipe search "auth" >> nexa review >> lam "improve auth" >> test >> pr

# Implement 5 tasks, quality gate, ship
/pipe go *5 >> (lint ~~ test ~~ typecheck) >> ship

# Auto-fix loop (try 3 times)
/pipe (fix "bug" >> test) *3? >> pr

# Apply rules + test after every task
/pipe @before:rules @after:test go *5 >> ship

# Feature with quality gates
/pipe feature "add billing" >> (lint ~~ test) ?>> pr
```

## Tips

- `/feature` is the autopilot — plan, implement, test, fix in a loop
- `/go` runs one task at a time — repeat until all tasks are `[x]`
- `/parallel build,test,lint` — run multiple checks simultaneously
- `/fix "bug description"` — systematic fix with failing test first
- `/rules` at session start — enforces 100-line cap + full tests
- `/search "how does X work?"` — multi-engine code search
- `/nexa review src/` — AI code analysis with Nexa
- `/lam "add feature X"` — autonomous goal-driven implementation
- `/chain "rag -> nexa -> fix"` — compose agent pipelines
- `/cmds` — show this cheat sheet anytime
