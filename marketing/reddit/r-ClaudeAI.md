---
subreddit: r/ClaudeAI
optimal_window: any
angle: Claude Code plugin + practical usage
---

# Title

Built a Claude Code plugin with 358 slash commands, including an honesty auditor that catches when Claude bluffs

# Body

I've been using Claude Code daily for ~6 months and shipped a plugin that adds 358 slash commands. MIT, on npm.

```bash
npm install -g luna-agents
luna-setup
```

Then in Claude Code:

```
/plugin marketplace add lunaos-ai/luna-agents
/plugin install luna-agents@luna-agents-marketplace
```

The one I want to call out specifically because it solved a real problem for me: `/ll-no-bluf`.

Claude (and every other AI assistant) bluffs. It claims work is done that isn't. It cites files that don't exist. It writes commit messages for code it never wrote.

`/ll-no-bluf` is a closed-loop audit:

1. Scan recent commits + every docs/*.md for claims like "X is implemented / tested / shipped".
2. Verify each claim against the actual code.
3. Triage: bluff (false), drift (was true, broke), missing (done but undocumented).
4. Fix or delete.
5. Re-run until zero mismatches.

The Luna repo's own commit history went through this before shipping. It found:
- "127 HIG checks" → replaced with "WCAG 2.2 AA" (verifiable)
- "48-hour reply SLA" → removed (we don't have one)
- "registered 285 commands" → corrected (count was stale)

Other things in the bundle that might be useful:

- `/ll-agent-build` — scaffolds a full production agent (planner + RAG + MCP tools + verifier + OPA guardrails + approvals + OTel + eval harness) in one command
- `/ll-swarm-vote` — three-round democratic voting across multiple agents where evidence beats majority
- 21 stack-aware doctors: /ll-react-doctor, /ll-svelte-doctor, /ll-node-doctor, /ll-vertx-doctor, /ll-spring-doctor, /ll-django-doctor, /ll-fastapi-doctor, /ll-rails-doctor, /ll-go-doctor, /ll-rust-doctor, /ll-php-doctor, /ll-dotnet-doctor, /ll-elixir-doctor, /ll-docker-doctor, /ll-k8s-doctor, /ll-terraform-doctor, /ll-postgres-doctor, /ll-mongo-doctor, /ll-cve-doctor + meta /ll-hospital
- `/ll-zen` — the panic button. One command, every gate green: a11y, sec, perf, tests, deps, build, deploy

Composable via the `>>` pipe operator inside Claude Code:

```
/luna-agents:pipe rev >> ll-no-bluf >> pr "chore: honest review"
```

Full lexicon + grammar reference + 60-second playground: https://agents.lunaos.ai

Source (MIT): https://github.com/lunaos-ai/luna-agents

Happy to help if anyone hits install issues. /ll-no-bluf is the one I'd start with — let me know how many bluffs it finds in your first PR 🙂
