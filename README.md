<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/🌙_Luna_Agents-AI_SDLC-a855f7?style=for-the-badge&labelColor=0a0a1a">
    <img alt="Luna Agents" src="https://img.shields.io/badge/🌙_Luna_Agents-AI_SDLC-a855f7?style=for-the-badge&labelColor=0a0a1a">
  </picture>
</p>

<p align="center">
  <strong>28 specialized AI agents for every stage of your software development lifecycle.</strong>
  <br>
  One CLI. One API. From requirements to production.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@luna-agents/cli"><img src="https://img.shields.io/npm/v/@luna-agents/cli?color=a855f7&label=CLI" alt="npm"></a>
  <a href="https://lunaos.ai"><img src="https://img.shields.io/badge/website-lunaos.ai-3b82f6" alt="Website"></a>
  <a href="https://docs.lunaos.ai"><img src="https://img.shields.io/badge/docs-docs.lunaos.ai-10b981" alt="Docs"></a>
  <a href="https://status.lunaos.ai"><img src="https://img.shields.io/badge/status-operational-10b981" alt="Status"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-888" alt="License"></a>
</p>

---

## ⚡ Start in 30 Seconds

```bash
# No install needed — run directly
npx @luna-agents/cli run code-review

# Or install globally
npm i -g @luna-agents/cli
luna run code-review
```

That's it. The CLI reads your codebase, sends it to a specialized AI agent, and streams the results back.

---

## 🎯 What It Does

Luna Agents replaces manual workflows at every stage of the SDLC:

| Phase | Agent | What It Does |
|:------|:------|:-------------|
| 📋 **Plan** | `requirements-analyzer` | Analyzes codebase → generates requirements spec |
| 🏗️ **Design** | `design-architect` | Creates architecture docs, component diagrams, API contracts |
| 📝 **Plan Tasks** | `task-planner` | Breaks design into dependency-ordered implementation tasks |
| 💻 **Build** | `task-executor` | Implements code following your specs + standards |
| 🔍 **Review** | `code-review` | Security audit, performance check, best practices review |
| 🧪 **Test** | `testing-validation` | Generates test suites, validates requirements coverage |
| 🎨 **UI Testing** | `ui-test` | E2E visual testing with Playwright: accessibility + responsiveness |
| 🔧 **UI Fix** | `ui-fix` | Auto-fixes accessibility, responsive, and design system issues |
| 🚀 **Deploy** | `deployment` | Production configs, CI/CD pipelines, infrastructure setup |
| 📚 **Document** | `documentation` | API docs, user guides, changelogs |
| 📊 **Monitor** | `monitoring` | Logging, alerting, health checks, dashboards |
| 📈 **Review** | `post-launch-review` | Performance analysis, optimization recommendations |
| 🔐 **Security** | `365-security` | Continuous security scanning and compliance |
| 🗄️ **Database** | `database` | Schema design, migrations, query optimization |
| 🔌 **API** | `api-generator` | RESTful API scaffolding from specifications |
| 🐳 **Docker** | `docker` | Containerization, multi-stage builds, Compose configs |
| ☁️ **Cloud** | `cloudflare` | Workers, Pages, D1, R2 deployment automation |
| 🍋 **Billing** | `lemonsqueezy` | Payment integration and subscription management |
| 🔒 **Auth** | `auth` | JWT, OAuth, RBAC implementation |
| 📈 **Analytics** | `analytics` | Usage tracking, event pipelines, insight dashboards |
| 🔎 **SEO** | `seo` | Meta tags, schema markup, performance optimization |
| 🎨 **HIG** | `hig` | Apple Human Interface Guidelines compliance |
| 🧠 **RAG** | `rag` | Semantic code search across your entire codebase |
| 👁️ **Vision** | `glm-vision` | Screenshot-to-code analysis and GUI testing |
| 📱 **OpenAI App** | `openai-app` | OpenAI integration patterns and app scaffolding |
| 🏃 **Runner** | `run` | Pipeline orchestration and multi-agent workflows |
| 📖 **User Guide** | `user-guide` | End-user documentation generation |
| 🔍 **RAG Enhanced** | `rag-enhanced` | Advanced RAG with hybrid search + re-ranking |

---

## 🚀 Usage

### CLI

```bash
# Run a specific agent
luna run code-review
luna run testing-validation
luna run deployment

# Run a full pipeline
luna chain full-review    # code-review → testing → security

# List all available agents
luna agents list

# Search your codebase with AI
luna rag search "How does authentication work?"
```

### API

```bash
curl https://api.lunaos.ai/agents/execute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "code-review",
    "context": "Review this Express middleware for security issues..."
  }'
```

### MCP Integration

Luna works with any MCP-compatible platform — Claude Desktop, Windsurf, Cline, Zed, and more.

```json
{
  "mcpServers": {
    "luna-vision-rag": {
      "url": "https://luna-vision-rag-mcp.workers.dev/mcp",
      "headers": {
        "X-API-Key": "luna_YOUR_API_KEY"
      }
    }
  }
}
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLI / Dashboard                       │
│              luna run code-review · agents.lunaos.ai         │
├─────────────────────────────────────────────────────────────┤
│                     API Gateway (Hono)                        │
│        api.lunaos.ai — Cloudflare Workers (Edge)             │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│    D1    │    KV    │ Vectorize│  Workers │    Stripe       │
│ Database │  Cache   │   RAG    │    AI    │   Billing       │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
          │                                     │
   ┌──────┴──────┐                    ┌─────────┴─────────┐
   │ 28 AI Agents │                    │ LLM Providers     │
   │  Personas    │                    │ DeepSeek·Claude·  │
   │  + Context   │                    │ OpenAI·Workers AI │
   └─────────────┘                    └───────────────────┘
```

- **Edge-native** — API runs on Cloudflare Workers (200+ PoPs, <10ms cold start)
- **Multi-provider** — DeepSeek R1, Claude, GPT-4, Workers AI
- **Streaming** — SSE responses for real-time agent output
- **Composable** — Chain agents into pipelines (code-review → testing → deploy)

---

## 💎 Pricing

| | Free | Pro | Team |
|:---|:---:|:---:|:---:|
| **Price** | $0/mo | $29/mo | $79/mo |
| **Agents** | 10 core | All 28 | All 28 |
| **Executions** | 50/mo | Unlimited | Unlimited |
| **RAG Search** | 100 queries | Unlimited | Unlimited |
| **Chain Pipelines** | — | ✅ | ✅ |
| **Vision & GUI Testing** | — | ✅ | ✅ |
| **Team Members** | 1 | 1 | 10 |
| **Support** | Community | Priority | Dedicated |

[**Get Started →**](https://lunaos.ai/#pricing)

---

## 📦 Installation

### From npm (recommended)

```bash
npm i -g @luna-agents/cli
```

### From source

```bash
git clone https://github.com/lunaos-ai/luna-agents.git
cd luna-agents
./setup.sh
```

### Requirements

- Node.js 18+
- Any MCP-compatible AI assistant (optional, for MCP integration)

---

## 🔗 Links

| Resource | URL |
|:---------|:----|
| 🌐 Website | [lunaos.ai](https://lunaos.ai) |
| 📚 Documentation | [docs.lunaos.ai](https://docs.lunaos.ai) |
| 🎛️ Dashboard | [agents.lunaos.ai](https://agents.lunaos.ai) |
| 📊 Status | [status.lunaos.ai](https://status.lunaos.ai) |
| 🐛 Issues | [GitHub Issues](https://github.com/lunaos-ai/luna-agents/issues) |

---

## 📄 License

MIT © [Shachar Solomon](https://github.com/shacharsol)

<p align="center">
  <sub>Built with ❤️ and a lot of AI agents.</sub>
</p>