---
name: webhook-setup
displayName: Webhook Bridge Setup (shortcut)
description: "Shortcut: Generate copy-paste webhook bridge setup guides (Slack, Discord, WhatsApp, Telegram, Email, Jira) -> /ll-webhook-setup"
version: 1.0.0
category: integrations
agent: luna-auth
shortcut_for: ll-webhook-setup
---

# Webhook Bridge Setup

Shortcut for `/ll-webhook-setup`.

Generates per-provider copy-paste content for setting up **signed
webhook bridges** in each platform's developer console (Slack signing
secret, Discord Ed25519 public key, WhatsApp Cloud x-hub-signature,
Telegram secret-token header, Cloudflare Email Routing, Jira
custom-header webhook + Atlassian API token). Sibling to
`/ll-oauth-setup` (which handles user-login OAuth). Includes a bluff
test per provider — a forged POST that MUST 401 if your verifier is
wired correctly.

Run `/ll-webhook-setup` for the full command.
