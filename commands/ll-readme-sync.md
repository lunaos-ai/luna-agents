---
name: ll-readme-sync
displayName: Luna README Sync — Regenerate docs from code
description: Regenerate README.md (and optionally the website skills/lexicon pages) from the actual contents of commands/, agents/, and skills/. Keeps counters honest, builds the command index, and prevents docs from drifting out of sync with code.
version: 1.0.0
category: documentation
agent: luna-documentation
parameters:
  - name: check
    type: string
    description: If "true", run in check-only mode (exit non-zero on drift, no writes). Use in CI. Default - false.
    required: false
    prompt: false
  - name: sync_site
    type: string
    description: If "true", also rebuild site/src/data/skills.json + site/src/data/skill-status.json from commands/. Default - true.
    required: false
    prompt: false
workflow:
  - count_commands
  - count_agents
  - count_skills
  - update_counters_in_readme
  - regenerate_command_index_section
  - regenerate_agent_list_section
  - rebuild_site_lexicon_data
  - report_diff
---

# Luna README Sync

Single source of truth: the filesystem. README, website skills pages, and
plugin counters are all derived from `commands/`, `agents/`, and
`skills/` at sync time. No manual count maintenance.

## What it does

1. Counts `commands/*.md`, `agents/*.md`, `skills/*.md`.
2. Replaces every "N slash commands" / "N specialized AI agents" /
   "Claude Code Commands (N)" string in README.md with the live count.
3. Regenerates three marker-delimited sections in README.md:
   - `LUNA:COUNTERS` — totals table
   - `LUNA:COMMAND-INDEX` — every command with its frontmatter
     description, as a sortable table
   - `LUNA:AGENT-LIST` — every agent with its frontmatter description
4. Rebuilds `site/src/data/skills.json` from the same source so the
   website lexicon page never drifts from the plugin.

## Run it

```bash
npm run readme:sync          # write
npm run readme:check         # CI mode: exit 1 on drift
```

Or from Claude Code:

```
/ll-readme-sync              # default sync
/ll-readme-sync check=true   # CI mode
```

## Why

Hand-edited counters lie. Every release the README claimed N commands
and the directory had N+k. The sync command makes the README a
function of the codebase, not a parallel document to maintain.

Pairs with `/ll-no-bluf` — together they keep claimed-vs-actual aligned.
