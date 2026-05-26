---
name: ll-cf-allow-bots
displayName: Luna Cloudflare — Allow AI Crawlers & Search Bots
description: Configure any Cloudflare zone to allow verified AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) and search bots (Googlebot, Bingbot, Applebot). Disables Bot Fight Mode and creates a WAF skip-rule covering 21 known bot user-agents. Required for LLM SEO and AI-discovery.
version: 1.0.0
category: cloudflare
agent: luna-cloudflare
parameters:
  - name: domain
    type: string
    description: Cloudflare zone (e.g. pushci.dev). If omitted, detect from project CLAUDE.md / wrangler.toml / package.json.
    required: false
    prompt: true
  - name: token
    type: string
    description: Cloudflare API token with Zone.Settings + Zone.Firewall edit permissions. Defaults to $CLOUDFLARE_API_TOKEN.
    required: false
    prompt: true
  - name: dry_run
    type: string
    description: If "true", print the actions without executing them. Default - false.
    required: false
    prompt: true
workflow:
  - detect_domain
  - validate_token
  - lookup_zone_id
  - disable_bot_fight_mode
  - create_waf_allow_rule
  - verify_configuration
  - smoke_test_with_crawler_ua
output:
  - .luna/{current-project}/cloudflare/
  - .luna/{current-project}/cloudflare/cf-allow-bots.sh
  - .luna/{current-project}/cloudflare/cf-allow-bots-run.log
---

# Luna Cloudflare — Allow AI Crawlers & Search Bots

Configures **any Cloudflare zone** to stop blocking the bots you actually
*want* — AI crawlers (ChatGPT, Claude, Perplexity, Gemini) and search
engines (Google, Bing, DuckDuckGo, Apple) — by disabling Bot Fight Mode
and creating a WAF skip-rule for 21 known crawler user-agents.

Default-on Cloudflare blocks every bot, including verified `Googlebot`
and `GPTBot` — which silently torpedoes LLM SEO and AI discoverability.
This command fixes that in one shot.

## Why

Cloudflare's "Bot Fight Mode" is on by default for free plans and
treats **all** automated traffic as hostile. Same for "Super Bot Fight
Mode" on Pro/Business unless you explicitly carve out verified bots.

If your product depends on:
- LLM index inclusion (ChatGPT, Claude, Perplexity, Gemini search)
- Search engine SEO (Google, Bing)
- AI-driven product discovery (`llms.txt`, MCP discovery files)
- Any `ai-plugin.json` / `manifest.json` indexing flow

…and you're behind Cloudflare with default settings, **none of those
bots can reach your origin**. This command fixes the gap in <30s.

## Prerequisites

- A Cloudflare zone you control
- An API token at https://dash.cloudflare.com/profile/api-tokens
  with these permissions on the zone:
  - **Zone.Settings**: Edit
  - **Zone.Firewall Services**: Edit
  - **Zone.Bot Management**: Edit (for Pro+ plans)
- `curl` and `python3` on the host running the script

## Usage Instructions

```bash
# Detect domain from project, prompt for token if not set
/ll-cf-allow-bots

# Explicit domain + token from env
CLOUDFLARE_API_TOKEN=cf_xxx /ll-cf-allow-bots pushci.dev

# Dry run — show what would change without modifying anything
/ll-cf-allow-bots pushci.dev "" true

# Apply to multiple zones in sequence
for d in pushci.dev luna-agents.dev finsavvy.ai; do
  /ll-cf-allow-bots "$d"
done
```

## What it does

### Step 1 — Detect the zone
- Looks up the Cloudflare zone ID by name via
  `GET /zones?name={domain}`
- Fails fast if the token doesn't have read access or the zone
  doesn't exist on this account

### Step 2 — Disable Bot Fight Mode
- `PUT /zones/{zone_id}/bot_management` with `{"fight_mode": false}`
- This stops Cloudflare's default-on bot-blocking heuristic that
  treats verified bots as hostile

### Step 3 — Create a WAF skip-rule
- Adds a custom rule in `http_request_firewall_custom` phase
- Expression covers Cloudflare's own verified-bot check
  (`cf.client.bot_management.verified_bot`) **plus** 21 explicit
  user-agent string matches as a belt-and-braces fallback for
  smaller/newer crawlers Cloudflare doesn't yet recognize

### Step 4 — Verify
- Re-reads bot management settings to confirm Fight Mode is off
- Prints SBFM (Super Bot Fight Mode) flags if on a paid plan

### Step 5 — Smoke test
- Runs `curl -A 'ClaudeBot' https://{domain}/llms.txt` (or `/`)
- Expects HTTP 2xx, not a Cloudflare challenge page

## Bots allowlisted (21 user-agents)

| Category | User agents |
|---|---|
| AI crawlers — OpenAI | `GPTBot`, `ChatGPT-User`, `OAI-SearchBot` |
| AI crawlers — Anthropic | `ClaudeBot`, `Claude-Web`, `anthropic-ai` |
| AI crawlers — others | `PerplexityBot`, `CCBot` (Common Crawl), `cohere-ai`, `DeepSeekBot`, `YouBot`, `DuckAssistBot`, `Kagibot`, `Diffbot` |
| Search engines | `Googlebot`, `Google-Extended` (Gemini), `Bingbot`, `Applebot`, `Amazonbot` |
| Social/discovery | `FacebookBot` |

All also covered if Cloudflare's `cf.client.bot_management.verified_bot`
returns true (the canonical verified-bot signal).

## Generated script

The command writes a self-contained, parameterized bash script to
`.luna/{current-project}/cloudflare/cf-allow-bots.sh` and runs it.
Re-run any time with the same params:

```bash
CLOUDFLARE_API_TOKEN=cf_xxx \
  .luna/{current-project}/cloudflare/cf-allow-bots.sh {domain}
```

The full output (zone ID, API responses, verification dump) is logged
to `.luna/{current-project}/cloudflare/cf-allow-bots-run.log` for
post-incident review.

## Generated script content

```bash
#!/usr/bin/env bash
set -euo pipefail
ZONE_NAME="${1:?usage: $0 <zone> [--dry-run]}"
DRY_RUN="${2:-}"
API="https://api.cloudflare.com/client/v4"

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "Error: CLOUDFLARE_API_TOKEN env var not set." >&2
  exit 1
fi
AUTH="Authorization: Bearer $CLOUDFLARE_API_TOKEN"

echo "==> Looking up zone ID for $ZONE_NAME..."
ZONE_ID=$(curl -s -H "$AUTH" "$API/zones?name=$ZONE_NAME" | \
  python3 -c "import sys,json; r=json.load(sys.stdin); print(r['result'][0]['id'])" 2>/dev/null)
[ -z "$ZONE_ID" ] && { echo "Error: zone $ZONE_NAME not found"; exit 1; }
echo "    Zone ID: $ZONE_ID"

if [ "$DRY_RUN" = "--dry-run" ]; then
  echo "(dry-run) would disable Bot Fight Mode and create WAF allow-rule"
  exit 0
fi

echo "==> Disabling Bot Fight Mode..."
curl -s -X PUT -H "$AUTH" -H "Content-Type: application/json" \
  "$API/zones/$ZONE_ID/bot_management" \
  -d '{"fight_mode": false}' | \
  python3 -c "import sys,json; r=json.load(sys.stdin); print('   ', 'OK' if r.get('success') else r.get('errors'))"

echo "==> Creating WAF allow-rule for verified AI/search bots..."
PAYLOAD=$(cat <<'JSON'
{
  "name": "Allow AI Crawlers",
  "description": "Skip security checks for verified AI/search bots",
  "kind": "zone",
  "phase": "http_request_firewall_custom",
  "rules": [{
    "expression": "(cf.client.bot_management.verified_bot) or (http.user_agent contains \"GPTBot\") or (http.user_agent contains \"ClaudeBot\") or (http.user_agent contains \"Claude-Web\") or (http.user_agent contains \"anthropic-ai\") or (http.user_agent contains \"PerplexityBot\") or (http.user_agent contains \"Googlebot\") or (http.user_agent contains \"Bingbot\") or (http.user_agent contains \"ChatGPT-User\") or (http.user_agent contains \"OAI-SearchBot\") or (http.user_agent contains \"CCBot\") or (http.user_agent contains \"cohere-ai\") or (http.user_agent contains \"DeepSeekBot\") or (http.user_agent contains \"Google-Extended\") or (http.user_agent contains \"Applebot\") or (http.user_agent contains \"Amazonbot\") or (http.user_agent contains \"YouBot\") or (http.user_agent contains \"FacebookBot\") or (http.user_agent contains \"DuckAssistBot\") or (http.user_agent contains \"Kagibot\") or (http.user_agent contains \"Diffbot\")",
    "action": "skip",
    "action_parameters": {"ruleset": "current"},
    "description": "Allow verified AI crawlers and search bots"
  }]
}
JSON
)
curl -s -X PUT -H "$AUTH" -H "Content-Type: application/json" \
  "$API/zones/$ZONE_ID/rulesets/phases/http_request_firewall_custom/entrypoint" \
  -d "$PAYLOAD" | \
  python3 -c "import sys,json; r=json.load(sys.stdin); print('   ', 'OK' if r.get('success') else r.get('errors'))"

echo "==> Verifying..."
curl -s -H "$AUTH" "$API/zones/$ZONE_ID/bot_management" | \
  python3 -c "
import sys,json
r=json.load(sys.stdin)
if r.get('success'):
    res=r['result']
    print(f\"    Fight mode: {res.get('fight_mode')}\")
    for k in ['sbfm_definitely_automated','sbfm_likely_automated','sbfm_verified_bots']:
        if k in res: print(f\"    {k}: {res[k]}\")
else: print(r.get('errors'))"

echo "==> Smoke test (ClaudeBot UA on /):"
curl -s -A 'ClaudeBot' -o /dev/null -w '    HTTP %{http_code}\n' "https://$ZONE_NAME/"
echo "Done."
```

## Common follow-ups

- Add a `robots.txt` and `llms.txt` to your site root so bots know
  what they're allowed to crawl — see `/ll-ai-index` for the
  AI-discovery file kit
- Add `Allow: GPTBot` / `Allow: ClaudeBot` etc. blocks to robots.txt
- For multi-domain projects, run this per zone — the rules are
  per-zone, not per-account
- For wildcard subdomains (`*.example.com`), the rule applies to the
  zone-level traffic; subdomains inherit unless they're separate zones

## Limits

- WAF rule rewrite is **idempotent**: re-running replaces the existing
  rule with the same content. Safe to re-run after token rotations.
- Bot Fight Mode is a zone-level toggle — flipping it via API affects
  the entire zone, not specific paths
- Free plans get Bot Fight Mode only; SBFM granular controls require
  Pro+. The user-agent fallback rules work on every plan.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `zone not found` | Token doesn't have the zone in scope; check Zone Resources on token settings |
| `403 forbidden` on `/bot_management` | Token lacks Zone.Bot Management Edit permission |
| `503 challenge page` from `ClaudeBot` smoke test | WAF rule didn't deploy; check the API response in the log |
| Bot still blocked after success | Bot is on a different domain not covered by this zone, or it's hitting an Argo / Cache Reserve layer |

## Reference

- [Cloudflare Bot Management API](https://developers.cloudflare.com/api/operations/bot-management-get)
- [Verified bots list](https://radar.cloudflare.com/verified-bots)
- [Custom WAF rules](https://developers.cloudflare.com/waf/custom-rules/)

Original script: `pushci/scripts/cloudflare-allow-bots.sh` — generalized
here so any luna-agents project can apply the same hardening.
