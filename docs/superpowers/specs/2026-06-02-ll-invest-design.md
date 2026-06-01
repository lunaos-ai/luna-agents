# Design Spec — `/ll-invest` Skill

**Date**: 2026-06-02
**Owner**: Shahar Solomon
**Status**: Draft (awaiting review)
**Repo**: `luna-agents`

## Summary

A reusable Luna Agents skill that creates an investor-facing subdomain (`invest.<product-domain>`) backed by a Cloudflare Pages site. The skill auto-researches market data, scaffolds an Astro + Tailwind landing page tailored for investors, and deploys it through the Cloudflare API. It ships across every luna-agents surface: Claude Code slash command, plugin shortcut, npm CLI, agent definition, and MCP tool.

## Goals

1. One command spins up `invest.<product-domain>` with an elegant, investor-grade landing page.
2. Page content (problem, market sizing, competitor comparison, GTM, certifications, cashflow model, pricing research) is auto-researched, then human-gated before publish.
3. Deployment uses the Cloudflare API end-to-end (Pages project + DNS + custom domain bind).
4. Skill is reusable across every product in the LunaOS portfolio.
5. Available on every luna-agents surface: Claude Code, npm CLI, plugin marketplace, agent registry, MCP server.

## Non-Goals

- Generating financial projections from scratch (user provides revenue assumptions; skill only renders).
- Replacing professional pitch deck or data-room tooling (skill produces public landing page, not gated investor portal).
- Auto-publishing AI-drafted financial claims without human review (default mode is gated).
- Touching billing, payments, or live financial systems.

## User-Facing Surfaces

| Surface | Invocation | Backing file |
|---|---|---|
| Claude Code slash command | `/ll-invest <product> <domain> [flags]` | `commands/ll-invest.md` |
| Claude Code shortcut | `/invest <product> <domain>` | `commands/invest.md` |
| Plugin marketplace listing | `growth` category | `.claude-plugin/marketplace.json` |
| npm CLI | `luna invest --product <p> --domain <d> --mode <m>` | `cli/src/commands/invest.ts` |
| Agent | spawn `luna-invest` agent with params | `agents/luna-invest.md` |
| MCP tool | `luna_invest` tool callable from any MCP client | `mcp-servers/luna-nexa-rag/src/tools/invest.ts` |

All surfaces delegate to a single shared core library at `cli/src/lib/invest/` so behavior is identical across entry points.

## Parameters

| Param | Type | Required | Default | Purpose |
|---|---|---|---|---|
| `product` | string | yes | — | Product name (e.g. `finsavvyai`). Used as identifier in Cloudflare project name and `.luna/<product>/` storage. |
| `domain` | string | yes | — | Apex domain to bind the subdomain under (e.g. `finsavvyai.com`). Must already be on Cloudflare. |
| `mode` | enum | no | `draft` | One of `draft`, `publish`, `one-shot`. See *Modes*. |
| `accent` | hex | no | `#7c5cfc` | Brand accent color for the landing page. |
| `certs` | csv | no | `soc2,gdpr,ccpa` | Comma-separated cert badges to render. Allowed: `soc2`, `gdpr`, `ccpa`, `iso27001`, `pci-dss`. |
| `auto-publish` | bool | no | `false` | Shortcut equivalent to `--mode one-shot`. |
| `research-depth` | enum | no | `standard` | `quick` (3 sources), `standard` (10 sources), `deep` (25 sources). |

## Modes

| Mode | What it does | When to use |
|---|---|---|
| `draft` (default) | Phase 1 + Phase 2 (research + scaffold). Stops before deploy. Writes `INVESTOR-DRAFT.md` for user review. | First-time setup. Sensitive copy. Default for safety. |
| `publish` | Phase 3 only. Assumes `site/invest/` already exists. Deploys to Cloudflare. | After user has reviewed and edited the draft. |
| `one-shot` | All three phases end-to-end. | CI pipelines, repeat regenerations, power users. |

## Architecture

### Three-phase pipeline

```
Phase 1: RESEARCH
  ├─ Read product context (README, package.json, CLAUDE.md if present)
  ├─ WebSearch + WebFetch over market sizing, competitors, cert costs, GTM playbooks
  ├─ Persist findings to .luna/<product>/invest/research.json with source URLs + access dates
  └─ Produces a structured research artifact, not page output

Phase 2: SCAFFOLD
  ├─ Generate site/invest/ (Astro + Tailwind project)
  ├─ Render 14 page sections (see Landing Page Sections)
  ├─ Pull copy from research.json
  ├─ Write INVESTOR-DRAFT.md (review checklist with claim → source mapping)
  └─ Stop. Wait for user.

Phase 3: DEPLOY
  ├─ Build site/invest/ (Astro build → dist/)
  ├─ Create Cloudflare Pages project (named invest-<product>)
  ├─ Upload dist/ via Pages deployment API
  ├─ Add DNS CNAME (invest → <project>.pages.dev) on the apex zone
  ├─ Bind custom domain (invest.<domain>) to the Pages project
  └─ Poll cert provisioning until ready or timeout (5 minutes)
```

### Shared core library

```
cli/src/lib/invest/
├── index.ts          # Orchestrator: routes mode → phases
├── research.ts       # WebSearch + WebFetch + parsing
├── scaffold.ts       # Astro project generator
├── cloudflare.ts     # CF API client (Pages + DNS + custom domain)
├── content.ts        # Section-level copy templates
├── schema.ts         # Zod schemas for research.json + params
└── types.ts          # Shared types
```

Each surface (slash command, CLI, MCP tool, agent) is a thin wrapper that parses its own argument shape and calls `lib/invest/index.ts`. No surface contains business logic.

## Landing Page Sections

The Astro site renders the following sections, in order:

1. **Hero** — product name, one-line investment thesis, primary CTA (`Request Deck`)
2. **The Problem** — quantified pain (dollars lost, time wasted, market gap)
3. **The Solution** — product overview, three screenshots, one-paragraph "why now"
4. **Market** — TAM / SAM / SOM with sources cited inline
5. **Cashflow Model** — interactive chart (Years 1–5 ARR, MRR, churn, CAC, LTV); data sourced from `research.json` defaults, overridable via `site/invest/src/data/financials.json`
6. **Competitors** — feature × price matrix; our row highlighted
7. **GTM Strategy** — phased timeline (launch → 1k users → 10k → enterprise)
8. **Traction** — current metrics or honest "pre-launch" badge
9. **Team** — founders, advisors, key planned hires
10. **Certifications** — SOC 2 Type II, GDPR, CCPA badges with status (`in-progress`, `audited`, `target Q3 2026`)
11. **Use of Funds** — pie chart, milestones unlocked per tranche
12. **The Ask** — round size, valuation, instrument type (SAFE / equity / convertible)
13. **FAQ** — top 10 investor objections with answers
14. **Contact** — Calendly embed, secure data-room link (mailto-gated)

## Research Module

### Sources queried

| Topic | Method | Query pattern |
|---|---|---|
| Market size | WebSearch | `"<industry> market size 2026 site:gartner.com OR site:statista.com OR site:idc.com"` |
| Competitor pricing | WebSearch + WebFetch | `"<competitor> pricing"` then fetch top result and extract tiers |
| Cert costs | WebSearch | `"SOC 2 Type II cost 2026"`, `"GDPR audit cost"`, `"CCPA compliance cost"` |
| GTM playbooks | WebSearch | `"<industry> go-to-market strategy <year>"` |
| Industry benchmarks | WebSearch | `"<industry> SaaS benchmarks ARR churn CAC LTV"` |

### Output shape

`.luna/<product>/invest/research.json`:

```json
{
  "product": "finsavvyai",
  "generated_at": "2026-06-02T10:30:00Z",
  "depth": "standard",
  "market": {
    "tam_usd": 50000000000,
    "sam_usd": 8000000000,
    "som_usd": 250000000,
    "sources": [{"url": "...", "title": "...", "accessed": "2026-06-02"}]
  },
  "competitors": [
    {"name": "...", "url": "...", "starting_price_usd": 29, "tiers": [...]}
  ],
  "certs": {
    "soc2": {"cost_low_usd": 20000, "cost_high_usd": 60000, "timeline_months": 6, "sources": [...]},
    "gdpr": {"cost_low_usd": 5000, "cost_high_usd": 15000, "sources": [...]},
    "ccpa": {"cost_low_usd": 5000, "cost_high_usd": 10000, "sources": [...]}
  },
  "gtm_playbooks": [{"summary": "...", "source": "..."}]
}
```

Every numeric claim renders with an inline citation linking back to a source. Builds trust during investor due diligence.

## Cloudflare API Surface

Required environment: `CF_API_TOKEN` with scopes `Zone:Read`, `Zone:DNS:Edit`, `Account:Pages:Edit`, plus the target apex domain already on Cloudflare.

Endpoints used:

```
GET  /accounts/{acct}/pages/projects/{name}                # check exists
POST /accounts/{acct}/pages/projects                       # create project
POST /accounts/{acct}/pages/projects/{name}/deployments    # multipart upload
GET  /zones?name={apex}                                    # resolve zone id
GET  /zones/{zone}/dns_records?name=invest.{apex}          # check existing
POST /zones/{zone}/dns_records                             # create CNAME
PATCH /zones/{zone}/dns_records/{id}                       # update CNAME
POST /accounts/{acct}/pages/projects/{name}/domains        # bind custom domain
GET  /accounts/{acct}/pages/projects/{name}/domains/{d}    # poll cert status
```

Pattern reused from existing `commands/ll-email-routing.md` skill.

## Error Handling

| Error | Behavior |
|---|---|
| `CF_API_TOKEN` missing | Fail fast. Print setup link (`https://dash.cloudflare.com/profile/api-tokens`) and required scopes. |
| Apex domain not on Cloudflare | Fail fast. Suggest `/ll-cloudflare onboard`. |
| DNS record already exists with different target | Print existing record and prompt. Update only if `--force` flag set. |
| Pages project name collision | Suffix with `-2`, `-3`, etc., up to `-9`. Then fail. |
| Cert provisioning timeout (5 min) | Leave deployment live. Print manual verification URL. Return exit code 0 with warning. |
| Research API rate limit | Degrade gracefully. Use placeholder text. Mark affected sections in `INVESTOR-DRAFT.md`. |
| Astro build failure | Preserve `site/invest/` for inspection. Print build log path. Return exit code 1. |

All errors written to `.luna/<product>/invest/errors.log` with ISO timestamp, correlation ID, and stack.

## Registration Across Surfaces

### Claude Code slash command (`commands/ll-invest.md`)

YAML frontmatter follows existing pattern (see `commands/ll-landing.md`). Body holds usage docs, examples, and prompt template for `luna-task-executor` agent. Max 200 lines.

### Shortcut (`commands/invest.md`)

Thin redirect. YAML frontmatter sets `redirect: ll-invest`. Body is a one-paragraph "Shortcut for `/ll-invest`. See `/ll-invest` for full docs."

### npm CLI (`cli/src/commands/invest.ts`)

```
luna invest --product <name> --domain <apex> --mode <draft|publish|one-shot>
            [--accent <hex>] [--certs <csv>] [--research-depth <quick|standard|deep>]
            [--auto-publish] [--force]
```

Registered in `cli/src/cli.ts` via `program.command('invest', ...)`. Help text auto-generated by Commander. Returns exit codes: 0 success, 1 user error, 2 API error, 3 build error.

### Agent (`agents/luna-invest.md`)

Defines `luna-invest` agent type with input/output schemas. Used when another agent orchestrates investor-page generation (e.g., `/ll-launch` → spawns `luna-invest`).

### MCP tool (`mcp-servers/luna-nexa-rag/src/tools/invest.ts`)

Exposes `luna_invest` tool over MCP stdio. Parameters mirror CLI flags. Tool description references the same docs as the slash command.

### Plugin manifest

- `.claude-plugin/index.js` → add `'ll-invest'` and `'invest'` to commands array
- `.claude-plugin/claude-plugin.json` → bump version, list in `commands`
- `.claude-plugin/marketplace.json` → entry under `growth` category
- `README.md` → auto-synced by `scripts/sync-readme.mjs` (counter bumps from 285 → 287)

## File Layout Produced (per run)

In the consumer product's repo:

```
site/invest/
├── astro.config.mjs
├── tailwind.config.cjs
├── package.json
├── src/
│   ├── layouts/InvestorLayout.astro
│   ├── pages/index.astro
│   ├── components/
│   │   ├── Hero.astro
│   │   ├── CashflowChart.astro
│   │   ├── CompetitorTable.astro
│   │   ├── MarketMap.astro
│   │   ├── GTMTimeline.astro
│   │   ├── CertBadge.astro
│   │   └── UseOfFunds.astro
│   └── data/
│       ├── research.json     (read-only, generated)
│       └── financials.json   (user-editable: revenue assumptions, valuation)
└── public/og-investor.png
```

In the user's home directory (per product):

```
.luna/<product>/invest/
├── research.json
├── INVESTOR-DRAFT.md
└── errors.log
```

## Testing Strategy

| Layer | Tool | Coverage target |
|---|---|---|
| Unit (research parser) | Jest, mocked WebSearch / WebFetch responses | 100% |
| Unit (CF API client) | Jest, mocked fetch | 100% |
| Unit (scaffold generator) | Jest, fs mock | 95% |
| Integration (draft mode) | Jest + real Astro build on test fixtures | All 14 sections render |
| E2E (publish mode) | Manual against `lunaos-test.dev` zone | Cert provisions, all sections live, axe-core passes |
| Accessibility | axe-core CLI on built `dist/` | Zero violations |

Coverage thresholds (matches portfolio root rule):
- Line: ≥ 90%
- Branch: ≥ 85%
- Critical paths (CF API client, research parser): 100%

## Security Considerations

- `CF_API_TOKEN` read from environment only; never written to disk, log, or `research.json`.
- Token scope checked at startup; missing scopes fail fast with clear message.
- All AI-generated copy gated through `INVESTOR-DRAFT.md` review before publish (default mode).
- Cited sources stored with URL + access date so investors can verify claims.
- No PII collected on the landing page; Calendly embed is the only third-party script.
- Cert badges represent *status*, not audited claims; `target` and `in-progress` states explicit.

## Release Checklist

- [ ] All six surfaces (slash, shortcut, CLI, agent, MCP tool, plugin entries) registered
- [ ] `commands/ll-invest.md` ≤ 200 lines
- [ ] `cli/src/commands/invest.ts` ≤ 200 lines
- [ ] Each `cli/src/lib/invest/*.ts` ≤ 200 lines
- [ ] Coverage ≥ 90% line / ≥ 85% branch
- [ ] CF API client unit tests 100% covered
- [ ] Integration test against test zone passes
- [ ] axe-core scan on default scaffold passes
- [ ] `npm pack` clean; tarball contains new files
- [ ] `README.md` regenerated by `scripts/sync-readme.mjs`
- [ ] `CHANGELOG.md` entry added
- [ ] No critical/high SAST findings on new code

## Open Questions Resolved

| Question | Decision |
|---|---|
| Reusable or product-specific? | Reusable. `product` and `domain` are required params. |
| Stack? | Astro + Tailwind. |
| Content source? | Auto-researched via WebSearch + WebFetch with cited sources. |
| DNS flow? | Cloudflare API end-to-end. |
| Default certs? | SOC 2 Type II, GDPR, CCPA. |
| Architecture? | All three modes (`draft`, `publish`, `one-shot`) selectable. Default `draft` for safety. |
| Surfaces? | Six: slash, shortcut, CLI, agent, MCP tool, plugin marketplace. |

## Next Steps

1. User reviews this spec.
2. On approval, invoke `superpowers:writing-plans` to break implementation into ordered, testable tasks.
3. Implement in order, with TDD per `superpowers:test-driven-development`.
4. Ship behind a beta flag; gather feedback on draft quality before promoting to default.
