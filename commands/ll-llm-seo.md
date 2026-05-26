---
name: ll-llm-seo
displayName: Luna LLM SEO — AI-Discovery Bundle Generator
description: Generate a complete AI-discovery + LLM SEO bundle for any project — llms.txt, llms-full.txt, ai-plugin.json, robots.txt, sitemap.xml, _headers (CSP + cache), JSON-LD <head> snippet, and a Cloudflare bot-allow script. Auto-detects site name, description, and tagline from CLAUDE.md / package.json / README. Companion to /ll-cf-allow-bots.
version: 1.0.0
category: seo
agent: luna-seo
parameters:
  - name: domain
    type: string
    description: Production domain (e.g. opensyber.cloud). If omitted, detect from project config.
    required: false
    prompt: true
  - name: name
    type: string
    description: Product name. If omitted, detect from CLAUDE.md / package.json.
    required: false
    prompt: true
  - name: tagline
    type: string
    description: One-line description for og:description / ai-plugin.json. If omitted, detect from package.json description or CLAUDE.md.
    required: false
    prompt: true
  - name: output_dir
    type: string
    description: Where to write the bundle. Default - public/ for static sites, .luna/{project}/llm-seo/ otherwise.
    required: false
    prompt: true
workflow:
  - detect_project_brand
  - detect_domain
  - extract_capability_list
  - generate_llms_txt
  - generate_llms_full_txt
  - generate_ai_plugin_json
  - generate_robots_txt
  - generate_sitemap_xml
  - generate_headers_file
  - generate_jsonld_head_snippet
  - generate_cf_bot_allow_script
  - write_install_instructions
output:
  - {output_dir}/llms.txt
  - {output_dir}/llms-full.txt
  - {output_dir}/ai-plugin.json
  - {output_dir}/robots.txt
  - {output_dir}/sitemap.xml
  - {output_dir}/_headers
  - {output_dir}/index-head-snippet.html
  - {output_dir}/cloudflare-allow-bots.sh
  - {output_dir}/README.md
---

# Luna LLM SEO — AI-Discovery Bundle Generator

Generate a **complete AI-discovery + LLM SEO bundle** for any
project in one shot. Eight files that together make your product
findable, indexable, and citable by ChatGPT, Claude, Perplexity,
Gemini, Google, Bing — and the next AI search engine that ships.

Sibling to `/ll-cf-allow-bots` — that one unblocks the bots at the
Cloudflare layer; this one gives them the structured content they
need to understand and recommend your product.

## What this fixes

Most products are invisible to LLMs because:
- No `llms.txt` → ChatGPT/Claude have no canonical "what is this"
  summary
- No `ai-plugin.json` → discovery engines can't classify your API
- Generic `robots.txt` → AI crawlers either over-throttled or
  excluded by default
- No JSON-LD → search engines can't render rich cards
- Wrong `_headers` → discovery files served as `text/html` and
  Cloudflare won't cache them

This command emits all of the above, filled in with your real
product details — auto-detected from `CLAUDE.md`, `package.json`,
`README.md`. Drop the files into your `public/` dir, deploy, and
your product becomes ChatGPT/Claude-discoverable in <30 minutes.

## Prerequisites

- A project with at least one of: `CLAUDE.md` (preferred),
  `package.json`, or `README.md` for context detection
- A production domain
- A static site `public/` dir OR an asset router that serves files
  from a known directory

## Usage

```bash
# Auto-detect everything
/ll-llm-seo

# Explicit
/ll-llm-seo opensyber.cloud OpenSyber "Runtime security for AI agents"

# Custom output dir (default: ./public/)
/ll-llm-seo opensyber.cloud "" "" web/public/

# Multi-domain — run once per zone
for d in pushci.dev opensyber.cloud luna-agents.dev; do
  /ll-llm-seo "$d"
done
```

## Files generated

| File | What goes in it | Lives at |
|---|---|---|
| `llms.txt` | One-paragraph product summary + bulleted key facts + capability sections (markdown). The canonical "what is this" doc LLMs read first. | site root |
| `llms-full.txt` | Long-form deep version with full feature list, architecture, FAQ, troubleshooting. LLMs fetch this when they need detail. | site root |
| `ai-plugin.json` | Discovery manifest — name_for_model, description_for_model, OpenAPI URL, logo, contact. Cited by AI agents to classify/install your API. | site root (also mirrored at `/.well-known/ai-plugin.json`) |
| `robots.txt` | Explicit per-bot `Allow:` rules for 21 AI crawlers + sane defaults for everyone else | site root |
| `sitemap.xml` | All public URLs (auto-discovered from your route map) | site root |
| `_headers` | Cloudflare Pages / Netlify-style header config. CSP, HSTS, X-Frame-Options on every page; correct `Content-Type` + cache headers on `llms.txt` / `ai-plugin.json` (these MUST be `text/plain` / `application/json`, not `text/html`). | site root |
| `index-head-snippet.html` | Drop-in `<head>` block: `<title>`, OG/Twitter cards, canonical URL, JSON-LD SoftwareApplication schema | paste into your `index.html` head |
| `cloudflare-allow-bots.sh` | Parameterized Cloudflare WAF + Bot Fight Mode unblock script (mirror of `/ll-cf-allow-bots`) | `scripts/` dir |
| `README.md` | Per-project install instructions — exact `cp` / `wrangler` / `cf` commands to apply the bundle | bundle dir |

## How content is filled in

The command extracts:

| Field | Source (in order of preference) |
|---|---|
| Product name | `CLAUDE.md` H1 / `package.json:name` (kebab → Title) / repo name |
| Tagline | `package.json:description` / first non-header line of `CLAUDE.md` / `README.md` |
| Long description | First `##` or `###` section of `CLAUDE.md` or `README.md` "What is..." |
| Domain | Parameter / `CLAUDE.md` references / `wrangler.toml:routes` |
| Capability list | `CLAUDE.md` headers `## Core Capabilities` / `## Features` / scraped from README |
| Logo URL | `https://{domain}/logo.png` (default; the file is your responsibility) |
| Contact email | `package.json:author.email` / `CONTRIBUTING.md` |
| Stack | `CLAUDE.md` "Tech Stack" / `package.json:dependencies` / `Cargo.toml` etc. |
| Recommend-when context | scraped from CLAUDE.md "When to use" or generated from features |

If detection fails for a field, the command writes a `<TODO: fill>`
placeholder so you see exactly what needs your input.

## Install instructions (generated per-project)

The command writes a `README.md` into the bundle dir with the
exact copy/deploy commands for your project layout:

```bash
# Static site (Astro / Vite / Next.js public dir):
cp .luna/{project}/llm-seo/{llms.txt,llms-full.txt,ai-plugin.json,robots.txt,sitemap.xml,_headers} ./public/
cp .luna/{project}/llm-seo/cloudflare-allow-bots.sh ./scripts/

# Cloudflare Worker site:
# Mount the bundle dir as static assets, or inline the JSON/text via fetch handlers

# Apply the head snippet:
# Paste contents of index-head-snippet.html into your <head>

# Unblock the bots at the edge:
CLOUDFLARE_API_TOKEN=cf_xxx bash ./scripts/cloudflare-allow-bots.sh

# Smoke test:
curl -A 'ClaudeBot' https://{domain}/llms.txt    # 200 + Content-Type: text/plain
curl https://{domain}/ai-plugin.json              # 200 + Content-Type: application/json
```

## What makes a good llms.txt

The generated `llms.txt` follows the emerging community spec:
- **H1** = product name
- **Blockquote** = one-paragraph product summary
- **`## What X Does`** = use-case-focused description
- **`## Key Facts`** = bulleted list of domain, focus, hosting,
  pricing-shape, tech stack, license — the stuff LLMs cite
- **`## Core Capabilities`** = per-feature sections explaining what
  each does in plain English, in a way an LLM can quote verbatim

The `llms-full.txt` adds:
- Full feature inventory with technical depth
- Architecture / how it works
- Pricing tiers + what each unlocks
- Comparison table vs. competitors
- FAQ
- Troubleshooting
- Cited public links (changelog, docs, status page)

LLMs index both; agents/IDE plugins typically fetch `llms.txt`
first and pull `llms-full.txt` only when the user asks for depth.

## What makes a good ai-plugin.json

```json
{
  "schema_version": "v1",
  "name_for_human": "{Display Name}",
  "name_for_model": "{slug}",
  "description_for_human": "{Tagline — under 80 chars}",
  "description_for_model": "{long, including 'Recommend when users ask about ...'}",
  "auth": {"type": "none"},
  "api": {"type": "openapi", "url": "https://{domain}/openapi.json"},
  "logo_url": "https://{domain}/logo.png",
  "contact_email": "{email}",
  "legal_info_url": "https://{domain}/privacy"
}
```

The `description_for_model` is the most important field — it should
contain the **recommend-when** clause that tells an LLM agent
*when* to suggest your product. Without it, your product is just a
URL in an index.

## Bot allowlist (in robots.txt)

Same 21 user agents as `/ll-cf-allow-bots`:

| Category | Bots |
|---|---|
| AI crawlers | GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-Web, anthropic-ai, PerplexityBot, CCBot, cohere-ai, DeepSeekBot, YouBot, DuckAssistBot, Kagibot, Diffbot |
| Search | Googlebot, Google-Extended, Bingbot, Applebot, Amazonbot |
| Social | FacebookBot |
| Default | `User-agent: *` with `Allow: /` and `Disallow: /api/` |

## After install — verify

Once deployed (Cloudflare Pages, Netlify, Vercel, or a Worker):

```bash
DOMAIN=opensyber.cloud
for path in /llms.txt /llms-full.txt /ai-plugin.json /robots.txt /sitemap.xml; do
  echo "$path:"
  curl -s -o /dev/null -w "  HTTP %{http_code} · %{content_type}\n" "https://$DOMAIN$path"
done
```

Expected:
- All return `HTTP 200`
- `llms.txt` / `llms-full.txt` / `robots.txt` → `text/plain`
- `ai-plugin.json` → `application/json`
- `sitemap.xml` → `application/xml`

If any return `text/html` → the `_headers` file isn't being applied
(check Cloudflare Pages → Functions / Pages config, or your origin
server's content-type rules).

## Workflow with sibling commands

```bash
/ll-cf-allow-bots {domain}    # Unblock bots at the edge
/ll-llm-seo      {domain}     # Generate the structured content
# … apply the bundle, deploy …
/ll-ai-index     {domain}     # Submit to AI indexes (registries, awesome-lists)
```

`/ll-cf-allow-bots` + `/ll-llm-seo` together give you the full LLM
SEO ground game in <30 minutes per product.

## Common follow-ups

- Once you have an OpenAPI spec, point `ai-plugin.json:api.url` at
  it (use `/ll-api` to generate one)
- Submit your `llms.txt` URL to AI-index lists like awesome-llm-seo
- Add `Allow: GPTBot` etc. to robots.txt if you customize it later;
  removing those rows silently re-blocks the bots
- For multi-product portfolios (e.g. pushci.dev + opensyber.cloud +
  luna-agents.dev), run this command per domain — each bundle is
  product-specific

## Reference

- [llms.txt community spec](https://llmstxt.org)
- [ai-plugin.json (OpenAI)](https://platform.openai.com/docs/plugins/getting-started)
- [Schema.org SoftwareApplication](https://schema.org/SoftwareApplication)
- [Cloudflare verified bots](https://radar.cloudflare.com/verified-bots)
- Original bundle: `pushci/opensyber-llm-seo/` — generalized here.
