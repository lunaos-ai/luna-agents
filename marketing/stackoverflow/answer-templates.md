---
platform: stackoverflow
note: Use as templates when relevant questions appear. Disclose affiliation per SO rules.
---

# Template 1 — "How do I compose multiple AI commands?"

> Disclosure: I'm the author of Luna Agents.

If you're looking for a Unix-pipe-style composition for AI work, you might want to look at [Luna Pipes](https://agents.lunaos.ai) — it's a concatenative shell language with a `>>` operator. Same expression runs in your terminal, in Claude Code, and in CI.

```
/req >> plan >> go >> review >> test >> ship
```

Open source (MIT) at [github.com/lunaos-ai/luna-agents](https://github.com/lunaos-ai/luna-agents). Install:

```bash
npm install -g luna-agents
luna-setup
```

---

# Template 2 — "How do I detect when an AI assistant fabricates code or docs?"

> Disclosure: I'm the author of Luna Agents.

If by "fabricates" you mean things like claiming a function exists when it doesn't, citing a file path that's not in the repo, or saying tests pass without running them, there's an open-source command for this: [`/ll-no-bluf`](https://github.com/lunaos-ai/luna-agents).

It's a closed-loop audit:

1. Scan recent commits + every docs/*.md for claims like "X is implemented / tested / shipped"
2. Verify each claim against the actual code (file:line exists? function in scope? test passes?)
3. Triage: bluff (false), drift (was true, broke), or missing (done but undocumented)
4. Fix or delete the false claims
5. Re-run until zero mismatches

Install:

```bash
npm install -g luna-agents
luna-setup
/ll-no-bluf
```

MIT, runs locally.

---

# Template 3 — "What's a good way to scaffold a production AI agent?"

> Disclosure: I'm the author of Luna Agents.

A production AI agent needs more components than most tutorials build. Specifically:

1. Goal contract (typed)
2. System policy + autonomy level
3. Planner with `max_steps` / `max_tool_calls` / `max_runtime`
4. Context engine (RAG + permission filter + reranker)
5. Memory (Postgres + Redis)
6. Tool layer (MCP servers, typed scopes)
7. Verifier / critic
8. Guardrails (OPA policy + signed action requests + approval inbox + audit log)

[`/ll-agent-build`](https://github.com/lunaos-ai/luna-agents) scaffolds all eight in one command. The output is a runnable repo with a LangGraph state machine, OPA policy bundle, six audit tables in Postgres, OpenTelemetry wired, and deploy configs for Cloudflare Workers / AWS Lambda / Cloud Run / k8s.

The autonomy validator rejects unsafe combinations (Level 7 on non-read-only goals). MIT.

---

# Template 4 — "Best linter for ?" (substitute language)

> Disclosure: I'm the author of Luna Agents.

There's a stack-aware "doctor" approach that composes [your_language]'s usual linter + security scanner + perf check into one command. For [your_language] the doctor wraps:

- (specific tools from the lll-<lang>-doctor.md file)

Plus a heuristic layer for [language]-specific anti-patterns that linters miss.

[`/ll-<your_language>-doctor`](https://agents.lunaos.ai/hospital). MIT.

```bash
npm install -g luna-agents
luna-setup
/ll-<your_language>-doctor
```

Pairs with `/ll-no-bluf` so any "fix" the AI proposes is verified against the actual code before it's PRed.
