---
post: 04-no-bluf
target: /ll-no-bluf
length: ~1500 chars
voice: founder-developer
hook: hardest-hitting of the four
---

AI assistants bluff.

They claim work is done that isn't.
They cite files that don't exist.
They write commit messages for code they never wrote.
They tell you "tests pass" without running them.
They say "production-ready" when there's a TODO three lines down.

This isn't a model problem. This is an honesty problem.

So we shipped /ll-no-bluf.

It's a closed-loop audit. Here's the cycle:

1. Scan recent commits, README, CHANGELOG, ADRs, every docs/*.md file for claims of the form "X is implemented / tested / shipped".

2. Verify each claim against the actual code. Does the function exist? Does the test pass? Is the endpoint wired? Does the file even live at the path you cited?

3. Triage mismatches into three buckets:
   • bluff — the claim is false
   • drift — the claim was true once and broke
   • missing — the work was done but undocumented

4. Fix or delete. The AI either implements what was claimed, removes the false claim, or rewrites the doc to match reality. No silent acceptance.

5. Re-run until the audit returns zero mismatches.

Run it as a pipe:

/ll-no-bluf >> ll-readme-sync >> pr "docs: keep claims honest"

The commit history of our own repo went through this audit before
shipping. It found:
• "127 HIG checks" → replaced with "WCAG 2.2 AA" (verifiable)
• "48-hour reply SLA" → removed (we don't have one)
• "registered 285 commands" → corrected (the count was stale)
• "luna-agents@luna-agents" plugin syntax → corrected to "@luna-agents-marketplace"

Four bluffs in one PR. Zero in production.

If you're shipping AI features and your reviewers can't tell which
claims are real and which are vibes — install this.

$ npm install -g luna-agents
$ luna-setup
$ /ll-no-bluf

It's free. It's open. It runs locally. Nothing leaves your machine.

→ github.com/lunaos-ai/luna-agents

#AI #DeveloperTools #CodeQuality #OpenSource #Honesty
