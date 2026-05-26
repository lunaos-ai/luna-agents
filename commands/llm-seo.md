---
name: llm-seo
displayName: LLM SEO Bundle (shortcut)
description: "Shortcut: Generate llms.txt + ai-plugin.json + robots.txt + sitemap + JSON-LD + Cloudflare bot-allow for any project -> /ll-llm-seo"
version: 1.0.0
category: seo
agent: luna-seo
shortcut_for: ll-llm-seo
---

# LLM SEO Bundle

Shortcut for `/ll-llm-seo`.

Generates the complete AI-discovery + LLM SEO bundle for any project:
`llms.txt`, `llms-full.txt`, `ai-plugin.json`, `robots.txt`,
`sitemap.xml`, `_headers` (CSP + cache), JSON-LD `<head>` snippet,
and a Cloudflare bot-allow script. Auto-fills site name + tagline
from `CLAUDE.md` / `package.json` / `README.md`.

Sibling to `/cf-allow-bots` — that unblocks the bots; this gives
them the structured content they need.

Run `/ll-llm-seo <domain>` for the full command.
