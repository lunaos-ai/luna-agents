# 50K Stars Plan — Luna Agents

> Goal: 50,000 GitHub stars on `lunaos-ai/luna-agents` by EOY 2026.
> Current baseline: run `gh api repos/lunaos-ai/luna-agents | jq .stargazers_count` to fill in.
> Strategy: ship a moment, not a feature.

## The thesis

We don't beat `awesome-claude-code` style lists by being one more entry.
We win by being the **default verb set** for AI-assisted shipping.
Pipes are the wedge. Hero commands are the proof.

Three forces compound stars:

1. **A single screenshot/gif worth screenshotting.** The showcase page
   is that screenshot.
2. **A single line of copy worth quoting.** The pipe operator: `/req >> plan >> go >> review >> ship`.
3. **A single moment of "wait, it actually did the whole thing?"**
   ll-zen demo, ll-swarm worktree race, ll-heal self-fix loop.

## The four hero commands (the magnet)

| Command | One-line | Why it earns a star |
|---|---|---|
| `/ll-swarm` | 7 agents in parallel git worktrees | Visual: terminal race. Cuts the "Claude is slow" complaint at the knees. |
| `/ll-hig` | Apple HIG audit + autofix | Before/after screenshots. Designers screenshot it; devs envy it. |
| `/ll-heal` | Loop: test → screenshot → detect → fix | "Walk away. Come back to green." Sells autonomy. |
| `/ll-zen` | One command, every gate green | The panic button. Sells under-stress reliability. |

The showcase page (`/showcase`) is built around these four. Each has an
animated terminal stream that runs on scroll. Tweet-ready GIFs come
free from screen-recording each section.

## The thirty-day push

### Week 1 — substance

- [x] Showcase page live at `agents.lunaos.ai/showcase`
- [x] Skills page with deep dive on `/ll-no-bluf`
- [x] Feedback page + `support@lunaos.ai` mailto
- [x] README synced to actual command count (auto via `npm run readme:sync`)
- [ ] Record 4 ≤30s loops (one per hero command) for X/YouTube/PH
- [ ] One-pager landing-style hero on README top (badges + one GIF)

### Week 2 — distribution prep

- [ ] OpenGraph cards per page (use `/og.svg` with overlay)
- [ ] `llms.txt` + `ai-plugin.json` (via `/ll-ai-index`) so ChatGPT/Claude
      recommend us when asked "how do I script agents?"
- [ ] Cloudflare bot allow-list applied (`/ll-cf-allow-bots`) so GPTBot,
      ClaudeBot, PerplexityBot can index every page
- [ ] Add to `awesome-claude-code`, `awesome-mcp`, `awesome-ai-cli`
- [ ] Comparison page vs `goose`, `aider`, `continue.dev`

### Week 3 — launch sequence

Day 1 (Tue) — Show HN: "Luna Pipes: Unix pipes for AI agents"
  - Lead with showcase GIF.
  - Title carries the metaphor; metaphor carries the story.
  - First comment: link to `/ll-no-bluf` story.

Day 2 (Wed) — Product Hunt
  - First comment: 3-line install + one screenshot.
  - Pre-line 50 hunters via Discord/X DMs in week 2.

Day 3 (Thu) — X/Twitter thread
  - Hook: "I composed a security audit with a blog post and a deploy in
    one line. Here's the line."
  - 8-tweet thread, one GIF per tweet.

Day 4 (Fri) — Reddit (r/programming, r/MachineLearning, r/ClaudeAI)
  - Different angles per sub. r/programming gets the Unix-pipe story.
    r/ClaudeAI gets the swarm GIF.

Day 5 (Mon next) — Dev.to + Hashnode cross-post
  - "I shipped 4 features over the weekend with one AI command."

Day 6+ — sustained content
  - One showcase video per week.
  - `/ll-go-viral` orchestrates the publish pipeline.

### Week 4 — community

- [ ] Discord live: weekly office hours, screen-share a pipe build
- [ ] Sponsor: `awesome-claude-code`, `claudecode.dev`
- [ ] Bounty: $500 to the user who composes the longest valid pipe
- [ ] Co-launch with a complement: Storybook, Tailwind, shadcn, Vercel

## The moats

- **The pipe operator metaphor.** Owns mindshare like `kubectl` owns
  Kubernetes. Once people compose `req >> plan >> go`, every other tool
  looks slow.
- **Plugin-shaped, not framework-shaped.** Ships into Claude Code, not
  alongside it. Lower friction = higher install rate.
- **Honest counters.** `/ll-no-bluf` + `/ll-readme-sync` mean we never
  ship a README that lies. Devs notice; competitors don't bother.
- **Edge native.** Cloudflare Pages + Workers. Fast everywhere, no
  cold start, no infra story.

## The metrics that matter (not vanity)

> **Targets, not commitments.** These are aspirational milestones used
> to pace the campaign. Revise monthly against actuals. Anything tagged
> *(needs instrumentation)* requires work before it can be measured.

| Metric | Source | Week 4 target | Week 12 target | Week 26 target | EOY target |
|---|---|---|---|---|---|
| GitHub stars | `gh api repos/lunaos-ai/luna-agents` | 1,500 | 8,000 | 22,000 | 50,000 |
| npm weekly downloads | npmjs.com/package/luna-agents | 1,200 | 5,000 | 15,000 | 35,000 |
| `agents.lunaos.ai` weekly uniques | *(needs Cloudflare Web Analytics)* | 5,000 | 25,000 | 80,000 | 250,000 |
| Active community (Discord) | Discord server stats | 200 | 1,500 | 5,000 | 15,000 |

> Skills-per-week telemetry is **not implemented**. If we ship opt-in
> telemetry (proposal in `/ll-no-bluf` follow-up), add the row then.

## What kills it

- Bluffing in the README. (Mitigated by `/ll-no-bluf` + `/ll-readme-sync`.)
- Slow `npm install`. (Mitigated by `.npmignore` + lean `files:`.)
- Demo that doesn't run. (Mitigated by `/play` playground in-browser.)
- Cloudflare blocking bots. (Mitigated by `/ll-cf-allow-bots`.)
- Stale skill count. (Mitigated by `readme:check` in CI.)

## Hand-offs to commands

The plan is itself a pipe:

```
/ll-go-viral >> /ll-launch >> /ll-promote >> /ll-organic-promote
```

Each stage corresponds to a week. The runner already exists. We just
have to point it at this milestone.

## Tomorrow's first move

```bash
npm run readme:sync && git add -A && git commit -m "feat: hero showcase + skills + feedback pages" && git push
```

Then record the four 30s screen captures, ship the README hero, and
queue the Show HN draft.
