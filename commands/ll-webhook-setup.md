---
name: ll-webhook-setup
displayName: Luna Webhook Bridge Provider Setup Guide
description: Generate copy-paste content and step-by-step guides for setting up signed-webhook bridges (Slack, Discord, WhatsApp Cloud, Telegram, Email, Jira) in each provider's developer console — apps, signing secrets, API tokens, redirect URLs, scopes, wrangler/env deployment, verification curls, gotchas
version: 1.1.0
category: integrations
agent: luna-auth
parameters:
  - name: scope
    type: string
    description: Project scope (press ENTER for current project)
    required: false
    prompt: true
  - name: providers
    type: string
    description: Comma-separated providers (slack,discord,whatsapp,telegram,email,jira). Default - all.
    required: false
    prompt: true
  - name: domain
    type: string
    description: Your production API domain (e.g. api.pushci.dev). Used for webhook URLs.
    required: false
    prompt: true
  - name: secret_store
    type: string
    description: Where to write secrets (cloudflare-workers | vercel | dotenv). Default - cloudflare-workers.
    required: false
    prompt: true
workflow:
  - detect_project_brand
  - extract_brand_content
  - generate_per_provider_setup_guide
  - generate_copy_paste_content
  - generate_deployment_commands
  - generate_verification_tests
  - create_troubleshooting_guide
output:
  - .luna/{current-project}/webhook-setup/
  - .luna/{current-project}/webhook-setup/README.md
  - .luna/{current-project}/webhook-setup/1-slack.md
  - .luna/{current-project}/webhook-setup/2-discord.md
  - .luna/{current-project}/webhook-setup/3-telegram.md
  - .luna/{current-project}/webhook-setup/4-whatsapp.md
  - .luna/{current-project}/webhook-setup/5-email.md
  - .luna/{current-project}/webhook-setup/6-jira.md
---

# Luna Webhook Bridge Provider Setup Guide

Generate copy-paste-ready setup guides for **signed webhook bridges** —
the developer-console work needed to register an app, obtain a signing
secret, point a webhook at your API, and verify the platform-specific
signature header. Sibling to `/ll-oauth-setup` (which handles user-login
OAuth); this handles **inbound channel messages** where the platform
signs every POST.

Covers: **Slack** (v0 signing), **Discord** (Ed25519 interactions),
**WhatsApp Cloud API** (Meta x-hub-signature-256), **Telegram**
(BotFather secret-token header), **Email** (Cloudflare Email Routing
inbound), **Jira Cloud** (Atlassian webhook + REST API tokens, no
Connect/Forge app required).

## What This Command Does

After your channel-bridge code is wired (e.g. `processChannelMessage`
+ webhook signature verification), you still need to go to each
platform's developer console and manually:

1. Create the app/bot
2. Find the signing secret / public key
3. Point the webhook at `https://{api-domain}/channels/bridge/{platform}`
4. Confirm the platform's verification challenge
5. Copy the secret back into your secret store

This command generates a per-provider markdown file with:
- **Exact path** through each console (5–10 nested settings pages)
- **Webhook URL** to paste (production + dev tunnel)
- **Where the signing secret lives** (with screenshots-by-text)
- **Wrangler/env commands** to deploy the secret
- **Verification curl + expected response** so you confirm the bridge
  is locked before declaring done
- **Gotchas** — the specific ways each console traps developers
  (Slack's "Event Subscriptions" save-button hide, Meta's app-secret
  vs phone-token confusion, Discord's interactions-URL handshake)

## Prerequisites

- A channel-bridge endpoint at `https://{domain}/channels/bridge/{platform}`
- Signature verification already wired (e.g. PushCI's `webhook-sig.ts`
  with `verifySlackSignature`, `verifyDiscordSignature`,
  `verifyWhatsAppSignature`)
- Secret-store CLI installed (`wrangler` for Cloudflare Workers,
  `vercel env` for Vercel, etc.)

## Usage Instructions

```bash
/ll-webhook-setup

# With parameters:
/ll-webhook-setup pushci slack,discord,whatsapp api.pushci.dev cloudflare-workers

# Generate guides for all 5 providers:
/ll-webhook-setup . all api.pushci.dev cloudflare-workers
```

## Execution Steps

1. **Detect brand** — Read `CLAUDE.md`, `package.json`, `README.md` for
   product name, description, tagline, support email
2. **Per-provider content** — Generate a copy-paste content file for
   each requested provider containing:
   - All form field values (app name, description, bot name, scopes)
   - Webhook URL (production + dev with ngrok/cloudflared)
   - Required scopes/intents/permissions
   - Exact secret-name to look for in the console
3. **Deployment commands** — Generate the right `secret put` form per
   `secret_store` parameter (wrangler / vercel / dotenv)
4. **Verification curls** — Generate a curl per provider that should
   return 401 (bad sig) and a follow-up that should return 200 (real
   platform-signed payload via console "Send Test" button)
5. **Document gotchas** — Provider-specific debugging knowledge
6. **Master README** — Priority order, time estimates, comparison

## Output Structure

```
.luna/{current-project}/webhook-setup/
  README.md           # Priority order, time estimates, provider map
  1-slack.md          # Slack app + signing secret + Event Subscriptions
  2-discord.md        # Discord app + Public Key + Interactions URL
  3-telegram.md       # BotFather + setWebhook + secret-token header
  4-whatsapp.md       # Meta app + WhatsApp product + App Secret + verify_token
  5-email.md          # Cloudflare Email Routing + worker binding
```

## Per-Provider Content Structure

Each provider file includes:

### Section 1: Metadata
- Time to complete (5 min Telegram → 25 min WhatsApp)
- Console URL
- Cost (free for all 5 at PushCI's scale)
- Prerequisites (e.g. WhatsApp needs a Meta Business account + verified
  phone number)

### Section 2: Console Walkthrough
- Step-by-step click path through nested settings pages
- Screenshot-by-text descriptions (so the guide doesn't rot when
  consoles redesign)
- "Save Changes" button locations (every console hides them differently)

### Section 3: Webhook URL
- Production: `https://{domain}/channels/bridge/{platform}`
- Dev (cloudflared): `https://{tunnel}/channels/bridge/{platform}`
- Verification token / challenge format (WhatsApp, Telegram)

### Section 4: Secret Name + Location
- Slack: **Signing Secret** under *Basic Information → App Credentials*
- Discord: **Public Key** under *General Information*
- WhatsApp: **App Secret** under *App Settings → Basic* (NOT the
  permanent access token, NOT the phone number ID)
- Telegram: secret you choose, passed to `setWebhook?secret_token=`
- Email: Cloudflare-issued KEK for the destination worker
- Jira: **API token** at
  https://id.atlassian.com/manage-profile/security/api-tokens
  (the `ATATT…` value). The webhook auth is a **shared secret you
  pick** and paste into the webhook's custom HTTP header
  (`x-jira-webhook-secret`) — Atlassian doesn't HMAC webhooks by
  default

### Section 5: Required Scopes / Intents / Permissions
- Slack: `app_mentions:read`, `chat:write`, `im:history` — avoid
  full-workspace scopes that trigger app review
- Discord: `GUILD_MESSAGES` + `MESSAGE_CONTENT` intent (privileged —
  needs verification once you cross 100 servers)
- WhatsApp: `whatsapp_business_messaging` + `whatsapp_business_management`
- Telegram: no scopes — bot tokens are full-permission
- Email: destination address + Cloudflare worker binding
- Jira: API token inherits the account's permissions. For comment
  writeback the bot account needs **Browse + Add Comment** on the
  target projects. No marketplace listing or Connect/Forge app
  needed for this lightweight integration mode

### Section 6: Deploy Commands

For **cloudflare-workers**:
```bash
cd api
npx wrangler secret put SLACK_SIGNING_SECRET
npx wrangler secret put DISCORD_PUBLIC_KEY
npx wrangler secret put WHATSAPP_APP_SECRET
npx wrangler secret put WHATSAPP_VERIFY_TOKEN
npx wrangler secret put TELEGRAM_BOT_TOKEN     # also acts as secret-token
# Jira: secrets live PER-CONNECTION in channel_connections (not env-wide),
# because each tenant has its own Atlassian site URL + API token.
# See the d1 INSERT in 6-jira.md.
```

For **vercel**:
```bash
vercel env add SLACK_SIGNING_SECRET production
# repeat per secret
```

For **dotenv**:
```bash
echo "SLACK_SIGNING_SECRET=<paste>" >> .env.production
# repeat per secret
```

### Section 7: Verification

```bash
# Should 401 — sig missing
curl -i -X POST https://{domain}/channels/bridge/slack \
  -H "content-type: application/json" \
  -d '{"event":{"text":"hi"}}'

# Use Slack's "Send a test" button in Event Subscriptions UI;
# response should be 200 OK with empty body
```

Each provider gets its own verify+test pair.

### Section 8: Gotchas
Provider-specific debugging knowledge:
- **Slack**: "Reinstall to Workspace" required after scope changes;
  `request_verification` legacy token is NOT the signing secret;
  payloads use `application/x-www-form-urlencoded` for slash commands
  vs JSON for events — sign the RAW body bytes either way
- **Discord**: "Interactions Endpoint URL" save fails silently if your
  endpoint doesn't return `{type: 1}` to the PING in <3s. Public Key
  is hex, NOT JWT
- **WhatsApp**: App Secret ≠ Phone Number ID ≠ Permanent Access Token
  — three different fields, easy to confuse. `verify_token` is a
  string YOU pick and paste into the webhook config; Meta sends it
  back on subscription so you echo it
- **Telegram**: `setWebhook` is a one-shot HTTP call to BotFather's
  API, not a UI button. Use `secret_token` query param so you can
  verify the `x-telegram-bot-api-secret-token` header
- **Email**: Cloudflare Email Routing is per-domain (DNS-level), not
  per-app. You need DNS access. Inbound payload format is raw MIME,
  not JSON
- **Jira**: Atlassian webhooks have no built-in HMAC signing — auth
  is a custom HTTP header you set in the webhook config. The bridge
  matches by header value against `channel_connections.webhook_secret`
  so multi-tenant isolation works. The bot account email + API token
  are stored on the connection's `access_token` + `config.email`
  (not env-wide secrets), because every Atlassian site has its own
  `*.atlassian.net` URL and credentials. `siteUrl` MUST include the
  protocol (`https://acme.atlassian.net`). REST replies use ADF doc
  format (not markdown / not plain text) on v3 of the API — the
  bridge wraps each line in the required `paragraph` → `text` shape
  automatically

## Provider Priority (Generated in README)

| # | Provider | Effort | Notes |
|---|----------|--------|-------|
| 1 | Telegram | 5 min | Simplest — BotFather + setWebhook |
| 2 | Slack | 10 min | App + signing secret + Event Subscriptions |
| 3 | Discord | 10 min | App + Public Key + Interactions URL |
| 4 | Jira | 10 min | Atlassian API token + webhook custom header + d1 INSERT |
| 5 | Email | 15 min | Cloudflare Email Routing + DNS + worker binding |
| 6 | WhatsApp | 25 min | Meta Business + WA Business product + phone verify |

## Anti-Bluff Verification

For each provider, the guide includes a **bluff test** — a forged
POST that MUST return 401. If your endpoint returns 200 to a request
with no signature header, the verifier is not wired correctly. The
guide encodes this as a copy-paste curl so you can confirm before
declaring the bridge live.

```bash
# Forge a Slack payload — MUST 401 if signing is wired
curl -i -X POST https://{domain}/channels/bridge/slack \
  -H "content-type: application/json" \
  -d '{"team_id":"T_VICTIM","event":{"text":"deploy prod"}}'
# Expected: HTTP/2 401 {"error":"invalid signature"}
```

## Next Steps in Workflow

```bash
/ll-webhook-setup              # This — generate setup guides
# ... manual work in each console ...
# ... paste secrets via wrangler/vercel/dotenv ...
/ll-deploy                     # Push the secrets
/ll-browser-test {domain}/channels/bridge/slack  # Smoke each endpoint
```

## What Makes This Different From `/ll-oauth-setup`

| `/ll-oauth-setup` | `/ll-webhook-setup` (this) |
|-------------------|----------------------------|
| User signs IN via provider | Provider sends EVENTS to you |
| Redirect URI | Webhook URL |
| Client ID + Secret | Signing Secret / Public Key |
| Scopes the USER consents to | Intents/permissions for the BOT |
| OAuth code exchange | HMAC / Ed25519 signature verify |
| Browser-based flow | Server-to-server flow |

Run `/ll-oauth-setup` for login-with-X; run `/ll-webhook-setup` for
talk-to-bot-in-X.

## Tips

- Run this AFTER your `/channels/bridge/{platform}` route is wired
  with signature verification — the bluff test only catches missing
  secrets, not missing verification code
- The Telegram guide is the fastest to follow — start there to build
  confidence with the bluff-test flow
- WhatsApp requires a real verified business phone number — budget
  24h if you don't have one in Meta Business already
- Email is per-domain — share that file with whoever owns DNS
- The "Gotchas" section is the highest-value part: each item is a
  prior debugging session encoded as a one-liner
