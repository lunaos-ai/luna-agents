---
name: cf-allow-bots
displayName: Cloudflare Allow AI Crawlers (shortcut)
description: "Shortcut: Disable Bot Fight Mode + add WAF allow-rule for 21 AI/search bots on any Cloudflare zone -> /ll-cf-allow-bots"
version: 1.0.0
category: cloudflare
agent: luna-cloudflare
shortcut_for: ll-cf-allow-bots
---

# Cloudflare Allow AI Crawlers

Shortcut for `/ll-cf-allow-bots`.

Disables Cloudflare Bot Fight Mode and adds a WAF skip-rule covering
21 known AI crawler + search engine user-agents (GPTBot, ClaudeBot,
PerplexityBot, Googlebot, Bingbot, etc.). Required for LLM SEO and
AI-discovery — Cloudflare's default-on bot blocking silently kills
indexing.

Run `/ll-cf-allow-bots <domain>` for the full command.
