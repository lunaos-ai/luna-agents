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
| `/req` | Gather requirements | `/luna-requirements` |
| `/des` | Technical design | `/luna-design` |
| `/plan` | Break into tasks | `/luna-plan` |
| `/go` | Execute next task | `/luna-execute` |
| `/rev` | Code review | `/luna-review` |
| `/test` | Run tests | `/luna-test` |
| `/ship` | Deploy | `/luna-deploy` |
| `/watch` | Set up monitoring | `/luna-monitor` |
| `/retro` | Post-launch review | `/luna-postlaunch` |

## Tools

| Type | Does | Full command |
|------|------|-------------|
| `/q` | Search codebase | `/luna-rag` |
| `/hig` | Apple HIG audit | `/luna-hig` |
| `/ui` | Convert to HIG design | `/luna-ui-convert` |
| `/sec` | Security audit | `/luna-365-secure` |
| `/docs` | Generate docs | `/luna-docs` |
| `/cfg` | Configuration | `/luna-config` |
| `/dock` | Dockerize | `/luna-dockerize` |
| `/cf` | Cloudflare deploy | `/luna-cloudflare-auto` |
| `/auth` | Build Auth.js system | `/ll-auth` |
| `/brand` | Generate brand identity | `/ll-brand` |
| `/rules` | Apply session rules (100-line cap, full tests, Playwright e2e) | `/ll-rules` |

## Full Pipeline

```
/req → /des → /plan → /go → /rev → /test → /sec → /hig → /ship → /watch → /retro
```

## Tips

- `/go` runs one task at a time — repeat until all tasks are `[x]`
- `/q how does X work?` — ask anything about your code
- `/cmds` — show this cheat sheet anytime
