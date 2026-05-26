# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.8.0] - 2026-05-27

### Added
- `/ll-llm-seo` — generate a complete AI-discovery + LLM SEO bundle
  for any project in one shot. Eight files: `llms.txt`,
  `llms-full.txt`, `ai-plugin.json`, `robots.txt`, `sitemap.xml`,
  `_headers` (CSP + cache + correct content-types for discovery
  files), JSON-LD `<head>` snippet, and a parameterized
  Cloudflare bot-allow script. Auto-detects product name, tagline,
  capabilities, and stack from `CLAUDE.md` / `package.json` /
  `README.md` so the generated content is project-specific, not
  templates. Sibling to `/ll-cf-allow-bots` — that unblocks the
  bots at the edge; this gives them the structured content they
  need to classify and recommend your product.
- `/llm-seo` — shortcut alias.

## [2.7.1] - 2026-05-27

### Changed
- `/ll-cf-allow-bots` script upgraded with two new steps:
  - **Path-based WAF skip rule** for `/llms.txt`, `/llms-full.txt`,
    `/ai-plugin.json`, `/openapi.json`, `/robots.txt`, `/sitemap.xml`,
    `/.well-known/ai-plugin.json` — bypasses security on these paths
    for ANY client (no user-agent required). Fixes sandbox /
    non-browser clients still getting Cloudflare's JS challenge
    after Bot Fight Mode was disabled.
  - **Zone Security Level → `essentially_off`**. App-level rate
    limiting + auth handles abuse; Cloudflare's blunt JS challenge
    is the wrong tool for API + LLM-discovery traffic.
- Verification step now also reads + prints the zone Security Level.
- Smoke test now runs two curls: one with `ClaudeBot` UA, one with
  no UA against `/llms.txt` (must both succeed).

## [2.7.0] - 2026-05-26

### Added
- `/ll-cf-allow-bots` — configure any Cloudflare zone to allow the
  bots you actually *want*: verified AI crawlers (GPTBot, ClaudeBot,
  PerplexityBot, ChatGPT-User, OAI-SearchBot, anthropic-ai,
  Claude-Web, Google-Extended, CCBot, cohere-ai, DeepSeekBot, YouBot,
  DuckAssistBot, Kagibot, Diffbot) and search engines (Googlebot,
  Bingbot, Applebot, Amazonbot, FacebookBot). Disables Bot Fight
  Mode + creates an idempotent WAF skip-rule covering 21 user-agents.
  Required for LLM SEO and AI-discovery — Cloudflare's default-on
  bot blocking silently kills indexing.
- `/cf-allow-bots` — shortcut alias.
- Outputs a self-contained parameterized `cf-allow-bots.sh` to
  `.luna/{project}/cloudflare/` so the action is reproducible and
  re-runnable per zone.

## [2.6.0] - 2026-05-26

### Added
- `/ll-webhook-setup` — copy-paste setup guides for **signed-webhook
  bridges** (Slack v0 signing, Discord Ed25519 interactions, WhatsApp
  Cloud `x-hub-signature-256`, Telegram `secret_token` header,
  Cloudflare Email Routing). Sibling to `/ll-oauth-setup` — handles
  inbound channel webhooks where the platform signs every POST.
- `/webhook-setup` — shortcut alias.
- Per-provider markdown output under `.luna/{project}/webhook-setup/`
  with console walkthroughs, webhook URLs, secret-store deploy
  commands (wrangler / vercel / dotenv), verification curls, and a
  bluff-test forged POST per provider that MUST return 401 when the
  verifier is wired correctly.

## [2.0.0] - 2025-10-18

### Added
- Production-ready Luna Agents plugin for Claude Code
- Complete AI-powered development lifecycle management
- 10 specialized agents for different development phases:
  - Requirements Analyzer
  - Design Architect
  - Task Planner
  - Task Executor
  - Code Review
  - Testing & Validation
  - Deployment
  - Documentation
  - Monitoring & Observability
  - Post-Launch Review
- 10 slash commands for workflow automation
- Semantic code search via Luna RAG MCP server
- Comprehensive project setup and installation scripts
- Production documentation and quick start guides

### Changed
- Updated plugin structure for Claude Code marketplace compatibility
- Improved configuration management and validation
- Enhanced error handling and user feedback
- Streamlined installation and setup process

### Fixed
- Plugin validation and testing scripts
- JSON configuration validation
- Version consistency across all packages

### Removed
- Temporary development files and directories
- Redundant backup files
- Development-only dependencies from production build

### Security
- Updated .gitignore for better security practices
- Removed sensitive files and temporary data
- Added proper dependency management

### Documentation
- Complete README with installation instructions
- Quick start guide for rapid onboarding
- Installation script for automated setup
- Comprehensive troubleshooting documentation

---

## [1.0.0] - 2025-10-10

### Added
- Initial Luna Agents framework
- Basic agent structure and marketplace configuration
- Foundation for AI-powered development workflow

---

## Support

For support, please visit [GitHub Issues](https://github.com/yourusername/luna-agents/issues).