---
post: 03-luna-pipes-language
target: the Luna Pipes language itself
length: ~1500 chars
voice: founder-developer
---

Unix won because of |.

Every other paradigm — visual graphs, YAML pipelines, JSON workflows,
no-code dashboards — has a worse composition story than the pipe character
the AT&T people shipped in 1973.

So we built Luna Pipes: a concatenative language whose only operator is >>.

Read it left to right:

/req >> plan >> go >> review >> test >> ship

Six verbs. One sentence. A week of glue work.

Or:

/persona generate >> ghost "launch post" * 4 >> publish notion

Drafts personas, writes one launch post per persona, posts all four to Notion.

Or compose agents:

/ll-agent-swarm name=payment-investigator variants=5 strategy=verifier
  >> ll-no-bluf
  >> ll-agent-call name=writer input=@-
  >> approvals create channel=email
  >> jira create-issue

Eight pipe stages. Two agents. Five swarm variants. One approval gate. One ticket. Zero glue code.

The pipe expression is greppable, diffable, version-controllable, CI-runnable.
A drag-drop graph is not.
A YAML config is not.
A chat history is not.

The language has 356 verbs in its lexicon today.
Grammar fits on one page.
Etymology page explains why we picked >> over | (Unicode safety).
Playground validates your input against the real lexicon as you type.

Cursor helps you write code.
Luna helps you run engineering workflows.

→ agents.lunaos.ai/grammar

#AI #ProgrammingLanguages #DeveloperExperience #UnixPipes #ClaudeCode
