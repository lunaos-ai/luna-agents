# Luna Agents - AI-Powered Development Lifecycle

🌙 **Complete AI-powered development lifecycle management with MCP integration**

## Overview

Luna Agents is a comprehensive development workflow system powered by specialized AI agents. Works with any MCP-compatible platform including Claude Desktop, Windsurf, and other AI coding assistants. From requirements analysis to post-launch monitoring, Luna automates and streamlines every phase of your development process.

## Features

### 🔄 Complete Development Workflow
- **Requirements Analysis** - Automatically analyze codebase and generate comprehensive requirements
- **Technical Design** - Create detailed architecture specifications and component designs
- **Task Planning** - Break down designs into actionable, ordered implementation tasks
- **Task Execution** - Implement code with quality standards and progress tracking
- **Code Review** - Automated code quality and security assessments
- **Testing & Validation** - Comprehensive test creation and requirements validation
- **UI/UX Testing** - End-to-end visual testing with Playwright integration
- **Deployment** - Production-ready deployment with Cloudflare automation
- **Documentation** - Auto-generated technical documentation
- **Monitoring & Observability** - Complete monitoring stack setup
- **Post-Launch Review** - Performance analysis and optimization recommendations

### 🎨 UI/UX Design & Testing
- **Apple HIG Compliance** - Convert UI to Apple Human Interface Guidelines
- **Modern Design System** - Decart-inspired glassmorphism and neumorphism
- **Automated UI Testing** - Visual regression and accessibility testing
- **UI Issue Detection** - Automatically fix responsive and accessibility issues
- **Cross-browser Testing** - Chromium, Firefox, WebKit compatibility
- **Performance Optimization** - Core Web Vitals and bundle size optimization

### 🚀 Cloud Deployment & Infrastructure
- **Cloudflare Workers** - Serverless API deployment
- **Cloudflare Pages** - Static site hosting with CI/CD
- **Automated Deployment** - One-command full-stack deployment
- **API Authentication** - Premium feature access control
- **Custom Domains** - Automatic SSL and DNS configuration
- **Global CDN** - Automatic geographic distribution

### 🔍 Search & Intelligence Commands
- **Luna RAG™** - Intelligent semantic code search with single guided flow
- **Natural Language Queries** - Ask questions about your codebase naturally
- **Pattern Recognition** - Find coding patterns and best practices automatically
- **Vision Analysis** - Screenshot-to-code analysis with context understanding
- **Usage Analytics** - Track search patterns and codebase insights

### ⚡ Quick Shortcuts System
- **Command Aliases** - Quick access to all Luna features
- **Workflow Shortcuts** - Multi-command sequences
- **Category-based Navigation** - Design, deployment, testing groups
- **Custom Shortcuts** - Create your own command aliases
- **Git-style Commands** - Familiar command patterns

### 💎 Premium Features (Pro/Enterprise)
- **Luna Vision RAG™** - Cloud-based GUI testing and screenshot analysis
- **Luna GLM Vision** - Advanced visual AI testing automation
- **Unlimited Search & Indexing** - No limits on codebase size or queries
- **Priority Support** - 24-hour response time for Pro users
- **Team Collaboration** - Enterprise-grade sharing and analytics
- **Priority Support** - Fast-track assistance
- **Advanced Analytics** - Usage metrics and insights
- **Custom Integrations** - Tailored solutions

### 📚 Comprehensive Skills Reference
- **Web Development** - HTML5, CSS3, JavaScript ES6+, React/Vue/Svelte
- **Server Architecture** - Node.js, Express, Databases, APIs, Security
- **Apple HIG** - Design principles, typography, spacing, motion
- **Design Patterns** - MVC, Repository, Factory, Observer, Strategy
- **Best Practices** - AI coding assistant optimization, testing, performance
- **Quick Reference** - Commands, configurations, common patterns

### 🎯 Flexible Scoping
- **Project-level**: Work on entire projects from root directory
- **Feature-level**: Focus on specific features within larger projects
- **Multi-project**: Switch between projects seamlessly

### 🛠️ Smart Features
- **Automatic project detection** from current directory
- **Dependency management** between workflow steps
- **Progress tracking** with checkbox-based task lists
- **Scope consistency** across all commands
- **File organization** following Luna conventions

## Installation

### Requirements
- **Any MCP-compatible platform** (Claude Desktop, Windsurf, Cline, Roo Cline, Zed, etc.)
- Node.js 18+ (for Luna RAG)
- Python 3 (for auto-configuration)
- Git (for version control)

### 🚀 One-Command Installation

```bash
# Clone the repository
git clone https://github.com/shacharsol/luna-agent.git
cd luna-agent

# Run automated setup
./setup.sh

# Restart your AI coding assistant
```

**That's it!** Everything is configured automatically.

### Available MCP Servers

1. **Luna RAG** - Semantic code search and RAG capabilities
2. **Luna Vision RAG™** - Cloud-based GUI testing and visual analysis (no local setup required!)
3. **Luna GLM Vision** - Advanced GUI testing automation with GLM integration
4. **Luna API Auth** - Authentication service for premium features

### What Gets Installed

✅ **Luna Agents Plugin** - 15+ AI agents for complete development lifecycle
✅ **Auto-Configuration** - MCP config updated automatically
✅ **Quick Start Guide** - Ready-to-use documentation
✅ **Luna Shortcuts System** - Quick command aliases and workflows
✅ **UI/UX Testing Suite** - Comprehensive testing with Playwright
✅ **Cloudflare Deployment** - Automated deployment pipeline
✅ **API Key Authentication** - Premium feature access control

### What Happens During Setup

1. ✅ Checks prerequisites (Node.js, Git, npm)
2. ✅ Installs Luna RAG dependencies
3. ✅ Configures Luna RAG MCP server
4. ✅ Installs Luna Agents plugin
5. ✅ **Configures Luna Vision RAG cloud MCP server** (no local process needed!)
6. ✅ **Sets up Luna GLM Vision integration**
7. ✅ **Deploys API Auth service for premium features**
8. ✅ Updates MCP configuration file
9. ✅ Creates `QUICK_START.md` guide

### Verify Installation

After restarting your AI coding assistant, verify everything works:

```
In your AI assistant, type:
"Use the health_check tool"
```

Your assistant should call the Luna Vision RAG cloud MCP server and return a healthy status.

### Zero Local Processes! ⭐

Unlike traditional MCP servers, Luna Vision RAG runs entirely in the cloud:
- ❌ No `node index.js` in a separate terminal
- ❌ No local server management
- ❌ No port configuration
- ✅ Just restart and it works in any MCP-compatible platform!

## 🌙 Luna RAG Backend Setup (Optional)

For full Luna RAG functionality with premium features, deploy the backend to Cloudflare Workers:

### Quick Backend Deployment

```bash
# Navigate to backend directory
cd backend

# Deploy to Cloudflare Workers
./deploy.sh
```

### Why Cloudflare Workers? ⚡

- **🌍 Global Edge Network** - 200+ locations worldwide with <10ms latency
- **💰 60-80% Cost Savings** vs AWS Lambda and other providers
- **🚀 Zero Cold Starts** - Instant responses from anywhere
- **📈 Automatic Scaling** - Handle millions of requests seamlessly
- **🆓 Generous Free Tier** - 100K requests/day included

### What the Backend Provides

- **User Authentication** - API key generation and JWT validation
- **Usage Tracking** - Free tier limits and Pro analytics
- **Payment Processing** - LemonSqueezy subscription management
- **Email Services** - Welcome emails, trial notifications, payment confirmations
- **Webhook Handling** - Real-time payment and subscription updates
- **Database Storage** - User data and usage analytics (Cloudflare D1)
- **Global Caching** - Ultra-fast KV storage for responses

### Backend Requirements

- Cloudflare account with Workers and D1 enabled
- LemonSqueezy account with products configured
- Wrangler CLI installed (`npm install -g wrangler`)

### One-Command Deployment

The deployment script automatically handles:

```bash
# This single command does everything:
./deploy.sh

✅ Creates D1 database and runs migrations
✅ Sets up KV storage for caching
✅ Configures environment secrets
✅ Deploys to Cloudflare Workers
✅ Tests the deployment
✅ Provides LemonSqueezy webhook URL
```

### Configure Secrets

During deployment, you'll be prompted to set these secrets:

```bash
wrangler secret put LEMONSQUEEZY_API_KEY
wrangler secret put LEMONSQUEEZY_WEBHOOK_SECRET
wrangler secret put JWT_SECRET
wrangler secret put SENDGRID_API_KEY
wrangler secret put EMAIL_FROM
wrangler secret put EMAIL_SUPPORT
```

### LemonSqueezy Webhook Setup

After deployment, configure LemonSqueezy:

- Webhook URL: `[YOUR_WORKER_URL]/webhook`
- Events: Order created, Subscription created, Payment succeeded, Subscription cancelled

### Update API Configuration

Your Claude Code plugin will automatically detect and use the deployed backend for premium features.

### Manual Setup Guide

For detailed setup instructions, see: [Cloudflare Deployment Guide](backend/DEPLOYMENT.md)

## Quick Start

### Start New Project
```bash
cd your-project-directory
/luna-requirements  # Press ENTER for project-level
```

### Start New Feature
```bash
cd your-project-directory
/luna-requirements  # Type: feature-name
```

### Complete Workflow
```bash
/luna-rag "How does this project work?"    # 0. Understand existing codebase
/luna-requirements                        # 1. Analyze & generate requirements
/luna-design                              # 2. Create technical design
/luna-plan                                # 3. Break into tasks
/luna-execute                             # 4. Implement (run multiple times)
/luna-review                              # 5. Code review
/luna-test                                # 6. Test & validate
/luna-deploy                              # 7. Deploy to production
/luna-docs                                # 8. Generate documentation
/luna-monitor                             # 9. Set up monitoring
/luna-postlaunch                          # 10. Post-launch review (after 7 days)
```

## Commands Reference

### Core Development Commands

| Command | Purpose | Prerequisites |
|---------|---------|---------------|
| `/luna-requirements` | Analyze codebase & generate requirements | - |
| `/luna-design` | Create technical design | requirements.md |
| `/luna-plan` | Break design into tasks | design.md, requirements.md |
| `/luna-execute` | Implement tasks | implementation-plan.md |
| `/luna-review` | Review code quality | Completed implementation |
| `/luna-test` | Test & validate | Code review complete |
| `/luna-deploy` | Deploy to production | All tests passing |
| `/luna-docs` | Generate documentation | Deployed code |
| `/luna-monitor` | Set up monitoring | Running in production |
| `/luna-postlaunch` | Post-launch analysis | 7+ days in production |

### 🔍 Search & Intelligence Commands

| Command | Purpose | Prerequisites |
|---------|---------|---------------|
| `/luna-rag` | **Intelligent code search & context** | - |
| `/luna-rag search` | Semantic code search | - |
| `/luna-rag index` | Index project for search | - |
| `/luna-rag patterns` | Extract coding patterns | - |
| `/luna-rag compare` | Compare implementations | - |

### UI/UX Design & Testing Commands

| Command | Purpose | Prerequisites |
|---------|---------|---------------|
| `/luna-ui-convert` | Convert UI to Apple HIG + modern design | Existing UI components |
| `/luna-ui-test` | Run comprehensive UI/UX tests | Deployed application |
| `/luna-ui-fix` | Automatically fix UI issues | Test results |
| `/luna-hig` | Apple Human Interface Guidelines analysis | Any UI components |

### Deployment & Infrastructure Commands

| Command | Purpose | Prerequisites |
|---------|---------|---------------|
| `/luna-cloudflare-auto` | Automated Cloudflare deployment | Built application |
| `/luna-dockerize` | Containerize application | Source code |
| `/luna-config` | Configure development environment | - |

### Quick Shortcuts System

| Command | Purpose | Example |
|---------|---------|---------|
| `/luna-shortcuts` | List all available shortcuts | `luna-shortcuts` |
| `/luna-shortcuts` [category] | Show category-specific shortcuts | `luna-shortcuts design` |
| `/luna-shortcuts` [name] | Run specific shortcut | `luna-shortcuts ui-convert` |
| `/luna-shortcuts` create [name] [command] | Create custom shortcut | `luna-shortcuts create my-pipeline "luna-test && luna-deploy"` |

### Popular Shortcuts Examples

```bash
# UI Design Pipeline
luna-shortcuts ui-pipeline        # Convert → Test → Fix UI

# Quick Deployment
luna-shortcuts cf-auto           # Automated Cloudflare deployment

# Apple HIG Analysis
luna-shortcuts hig               # Quick HIG compliance check

# Full Testing Suite
luna-shortcuts test-all          # Run all test types

# Development Workflow
luna-shortcuts dev-flow          # Execute → Review → Test
```


---

## 📚 Skills Reference

Luna Agents includes a comprehensive **skills.md** reference file that contains:

### Web Development Mastery
- **HTML5 Semantic Markup** - Accessibility, SEO, form validation
- **Modern CSS & Responsive Design** - Flexbox, Grid, variables, animations
- **JavaScript ES6+** - Async/await, destructuring, modules, best practices
- **Frontend Frameworks** - React, Vue, Svelte patterns and lifecycle
- **API Integration** - RESTful patterns, error handling, loading states
- **Performance Optimization** - Lazy loading, code splitting, Web Vitals

### Server & Backend Excellence
- **Node.js/Express** - Middleware, routing, async handlers
- **Database Design** - SQL/NoSQL, ORMs, migrations, indexing
- **Authentication & Security** - JWT, OAuth, bcrypt, security headers
- **API Design** - RESTful conventions, status codes, pagination
- **DevOps & Deployment** - Docker, CI/CD, environment management
- **Monitoring & Logging** - Winston, error tracking, metrics

### Apple Design Principles
- **Human Interface Guidelines** - Clarity, Deference, Depth
- **Typography & Color** - System fonts, semantic colors, contrast
- **Layout & Spacing** - Grid systems, touch targets, responsive design
- **Motion & Animation** - Natural transitions, micro-interactions
- **Component Patterns** - Cards, buttons, elevation, shadows

### Software Architecture Patterns
- **Architectural Patterns** - MVC, Component-based, Repository, Service Layer
- **Creational Patterns** - Factory, Singleton, Builder
- **Behavioral Patterns** - Observer, Strategy, Command, Middleware
- **Structural Patterns** - Adapter, Decorator, Facade

### AI Coding Assistant Best Practices
- **Effective Prompting** - Specificity, context, tech stack constraints
- **Project Structures** - Full-stack setup, component creation, API design
- **Testing Strategies** - Unit, integration, E2E testing approaches
- **Code Review Patterns** - Security, performance, quality assessment

### Quick Reference
- **Git Commands** - Branching, commits, merging strategies
- **npm/Node** - Package management, scripts, development workflow
- **Docker** - Containerization, multi-stage builds, compose
- **Database** - Prisma commands, migrations, seeding

**How to use:** Reference specific sections when working with Luna agents:
```bash
"Use the repository pattern from skills.md:line 150"
"Apply Apple HIG spacing from skills.md:line 400"
"Implement JWT auth as shown in skills.md:line 250"
```

## Directory Structure

Luna creates organized files in your project:

```
your-project/
├── .luna/                        # Luna workspace
│   └── your-project/             # Project-specific files
│       ├── requirements.md       # Generated requirements
│       ├── design.md            # Technical design
│       ├── implementation-plan.md # Task breakdown
│       ├── code-review-report.md  # Review results
│       ├── test-validation-report.md # Test results
│       ├── deployment-report.md   # Deployment status
│       ├── monitoring-observability-report.md # Monitoring setup
│       └── post-launch-review.md  # Post-launch analysis
├── docs/                         # Generated by luna-docs
└── src/                          # Your source code
```

## Usage Examples

### Example 1: New E-commerce Project
```bash
cd ~/projects/ecommerce-app
/luna-requirements  # Press ENTER
/luna-design        # Press ENTER
/luna-plan          # Press ENTER
/luna-execute       # Run 15+ times until all tasks complete
/luna-review
/luna-test
/luna-deploy
```

### Example 2: Add User Authentication Feature
```bash
cd ~/projects/existing-app
/luna-requirements  # Type: user-authentication
/luna-design        # Type: user-authentication
/luna-plan          # Type: user-authentication
/luna-execute       # Run until feature complete
/luna-review        # Type: user-authentication
/luna-test          # Type: user-authentication
```

### Example 3: Continue Work on Existing Project
```bash
cd ~/projects/existing-project
/luna-execute       # Continue implementing remaining tasks
```

## 💎 Premium Features & Pricing

### Luna Free Tier
✅ **Perfect for getting started**
- 10 Core AI Agents (Requirements → Documentation)
- Basic Luna RAG functionality
- 100 queries per day
- 1,000 files indexed
- Community support
- Local development only

### Luna Pro ($29/month)
🚀 **For professional developers**
- Everything in Free, plus:
- **Luna Vision RAG™** - Cloud GUI testing & analysis
- **Luna GLM Vision** - Advanced visual AI testing
- **Luna UI Test Agent** - Playwright automation
- **Luna UI Fix Agent** - Automated issue correction
- **Luna Cloudflare Deployment** - One-click deployment
- Unlimited queries and indexing
- Priority support
- Advanced analytics dashboard

### Luna Enterprise (Custom)
🏢 **For teams and organizations**
- Everything in Pro, plus:
- Unlimited everything
- Custom integrations
- Dedicated support
- Team collaboration features
- Custom AI model training
- SLA guarantees
- On-premise deployment options

### 🚀 Quick Start with Premium Features

1. **Get Your API Key**
   ```bash
   # Visit https://agent.lunaos.ai/pricing
   # Subscribe to Pro or Enterprise
   # Copy your API key
   ```

2. **Configure Your MCP Client**
   ```json
   {
     "mcpServers": {
       "luna-vision-rag": {
         "url": "https://luna-vision-rag-mcp.workers.dev/mcp",
         "headers": {
           "X-API-Key": "luna_YOUR_API_KEY_HERE"
         }
       }
     }
   }
   ```

3. **Start Using Premium Features**
   ```bash
   /luna-rag "How does authentication work?"    # Intelligent code search
   /luna-shortcuts ui-pipeline                  # Modern UI conversion
   /luna-ui-test                                # Comprehensive testing
   /luna-cloudflare-auto                        # One-click deployment
   ```

---

## Agent Capabilities

### Core Development Agents

### Luna Requirements Analyzer
- Analyzes existing codebase structure
- Identifies business logic and user workflows
- Documents technical requirements and constraints
- Generates comprehensive requirements specifications

### Luna Design Architect
- Creates system architecture diagrams
- Designs component interactions and interfaces
- Defines data models and API specifications
- Plans infrastructure and deployment architecture

### Luna Task Planner
- Breaks down designs into actionable tasks
- Creates dependency-ordered implementation plans
- Defines acceptance criteria and testing requirements
- Estimates development effort and timelines

### Luna Task Executor
- Implements code following design specifications
- Maintains code quality and security standards
- Writes comprehensive tests
- Tracks progress with real-time updates

### Luna Code Review
- Performs automated code quality assessments
- Checks for security vulnerabilities
- Validates against coding standards
- Provides improvement recommendations

### Luna Testing & Validation
- Creates comprehensive test suites
- Runs unit, integration, and E2E tests
- Validates requirements coverage
- Generates detailed test reports

### Luna Deployment
- Creates production-ready deployment configurations
- Sets up CI/CD pipelines
- Configures infrastructure and monitoring
- Manages release processes

### Luna Documentation
- Generates comprehensive technical documentation
- Creates API documentation
- Writes user guides and developer docs
- Maintains changelog and release notes

### Luna Monitoring & Observability
- Sets up application monitoring
- Configures logging and alerting
- Creates performance dashboards
- Implements health checks

### Luna Post-Launch Review
- Analyzes production performance
- Reviews user feedback and metrics
- Identifies optimization opportunities
- Provides improvement recommendations

### 🎨 UI/UX Premium Agents

### Luna UI Test Agent
- **End-to-end user journey testing** with Playwright
- **Visual regression testing** with screenshot comparison
- **Accessibility compliance** (WCAG 2.1 AA)
- **Performance testing** (Core Web Vitals)
- **Cross-browser testing** (Chromium, Firefox, WebKit)
- **Responsive design validation** across devices

### Luna UI Fix Agent
- **Automated issue detection** and fixing
- **Accessibility remediation** (ARIA labels, contrast)
- **Design system enforcement** consistency
- **Responsive design fixes** for mobile/tablet
- **Performance optimizations** (lazy loading, compression)
- **Code quality improvements** and formatting

### 🚀 Infrastructure Premium Agents

### Luna Cloudflare Deployment Agent
- **Automated Workers deployment** for serverless APIs
- **Pages deployment** for static sites with CI/CD
- **D1 database setup** and migration automation
- **R2 object storage** configuration
- **Custom domain setup** with SSL provisioning
- **Global CDN configuration** for optimal performance

## 🔌 Recommended MCP Servers

Luna Agents works seamlessly with Model Context Protocol (MCP) servers to enhance capabilities. Here are the most relevant MCP servers for each development phase:

### 🏗️ Development & Infrastructure
- **[Terraform](https://github.com/hashicorp/terraform-mcp-server)** - Infrastructure as Code management
- **[Pulumi](https://www.pulumi.com/docs/using-pulumi/mcp-server/)** - Modern Infrastructure as Code with programming languages
- **[CircleCI](https://github.com/CircleCI-Public/circleci-mcp-server)** - CI/CD pipeline management

### 📊 Monitoring & Observability
- **[Grafana](https://github.com/grafana/mcp-grafana)** - Dashboard and monitoring integration
- **[Sentry](https://mcp.sentry.dev/mcp)** - Error tracking and performance monitoring
- **[Dynatrace](https://github.com/Dynatrace/dynatrace-mcp-server)** - Application performance monitoring

### 🗄️ Database & Data Management
- **[PostgreSQL](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)** - Database operations and schema management
- **[SQLite](https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite)** - Lightweight database for local development
- **[Supabase](https://github.com/supabase/mcp-supabase)** - Backend as a Service integration
- **[MongoDB](https://github.com/mongodb/mcp-mongodb)** - NoSQL database operations

### 📁 File System & Version Control
- **[Filesystem](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)** - Secure file operations with access controls
- **[Git](https://github.com/modelcontextprotocol/servers/tree/main/src/git)** - Repository management and operations
- **[GitHub](https://github.com/modelcontextprotocol/servers-archived/tree/main/src/github)** - GitHub API integration

### 🤖 Browser Automation & Testing
- **[Playwright](https://github.com/modelcontextprotocol/servers/tree/main/src/playwright)** - Modern browser automation for E2E testing
- **[Puppeteer](https://github.com/puppeteer/mcp-server)** - Headless Chrome automation and web scraping
- **[Browser Automation](https://github.com/ModelContextProtocol/server-playwright)** - End-to-end testing and web interactions

### 🌐 Web & Utility Services
- **[Fetch](https://github.com/modelcontextprotocol/servers/tree/main/src/fetch)** - Web content fetching and HTTP requests
- **[Memory](https://github.com/modelcontextprotocol/servers/tree/main/src/memory)** - Persistent memory and knowledge management
- **[Sequential Thinking](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking)** - Structured problem-solving and reasoning
- **[Time](https://github.com/modelcontextprotocol/servers/tree/main/src/time)** - Time zone conversion and scheduling

### 🧪 Testing & Quality Assurance
- **[Browser Automation](https://github.com/ModelContextProtocol/server-playwright)** - End-to-end testing with Playwright
- **[Postman](https://github.com/postmanlabs/postman-mcp-server)** - API testing and documentation
- **[Web Testing](https://github.com/puppeteer/mcp-server)** - Automated web application testing

### 🔧 Development Tools
- **[Stripe](https://github.com/stripe/stripe-mcp)** - Payment integration for billing features
- **[LaunchDarkly](https://github.com/launchdarkly/ld-mcp-server)** - Feature flag management
- **[Postman](https://github.com/postmanlabs/postman-mcp-server)** - API development and testing

### 📝 Productivity & Collaboration
- **[Notion](https://github.com/di-on-projects/mcp-notion)** - Documentation and project management
- **[Monday.com](https://github.com/mondaycom/monday-mcp-server)** - Project tracking and collaboration

### MCP Installation with Luna

To enhance your Luna workflow with MCP servers, add them to your MCP configuration file:

**Common Config Locations:**
- **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windsurf**: `~/Library/Application Support/Windsurf/config.json`
- **Zed**: `~/.config/zed/settings.json` - See [ZED_SETUP.md](./ZED_SETUP.md) for detailed instructions
- **Cline/Roo Cline**: VSCode settings or MCP config
- **Other platforms**: Check your platform's MCP documentation

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/your/projects"]
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git", "/path/to/your/projects"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://user:password@localhost:5432/yourdb"
      }
    },
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "/path/to/your/database.db"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-playwright"],
      "env": {
        "HEADLESS": "true"
      }
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@puppeteer/mcp-server"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "time": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-time"]
    },
    "grafana": {
      "command": "mcp-grafana",
      "env": {
        "GRAFANA_URL": "http://localhost:3000",
        "GRAFANA_SERVICE_ACCOUNT_TOKEN": "your-service-account-token"
      }
    },
    "sentry": {
      "command": "node",
      "args": ["-e", "require('https://mcp.sentry.dev/mcp')"],
      "env": {
        "SENTRY_DSN": "your-sentry-dsn",
        "SENTRY_AUTH_TOKEN": "your-sentry-token"
      }
    },
    "terraform": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "hashicorp/terraform-mcp-server:0.2.3"]
    }
  }
}
```

### Installation Commands

You can install these MCP servers using npm or docker:

```bash
# Core file and version control servers
npm install -g @modelcontextprotocol/server-filesystem @modelcontextprotocol/server-git

# Database servers
npm install -g @modelcontextprotocol/server-postgres @modelcontextprotocol/server-sqlite

# Browser automation servers
npm install -g @modelcontextprotocol/server-playwright @puppeteer/mcp-server

# Web and utility servers
npm install -g @modelcontextprotocol/server-fetch @modelcontextprotocol/server-memory
npm install -g @modelcontextprotocol/server-sequential-thinking @modelcontextprotocol/server-time

# Monitoring and observability
npm install -g mcp-grafana

# Infrastructure
docker pull hashicorp/terraform-mcp-server:0.2.3
```

### Quick Setup Example

Here's a minimal working configuration for Luna:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "~/projects"]
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git", "~/projects"]
    }
  }
}
```

### Workflow Integration

Luna Agents automatically leverages available MCP servers:

- **🔍 Requirements Analysis**: Uses filesystem and Git MCPs to analyze codebase structure
- **🏗️ Design Architect**: Integrates with database and infrastructure MCPs for architecture planning
- **📋 Task Planner**: Works with all available MCPs to create comprehensive implementation plans
- **💻 Task Executor**: Utilizes Git, filesystem, and development tool MCPs for implementation
- **🔬 Code Review**: Integrates with security and quality MCPs for thorough reviews
- **🧪 Testing Agent**: Uses browser automation and database MCPs for comprehensive testing
- **🚀 Deployment Agent**: Integrates with Terraform/Pulumi and CI/CD MCPs for deployment
- **📊 Monitoring Agent**: Connects to Grafana, Sentry, and observability MCPs
- **📚 Documentation Agent**: Uses filesystem and Git MCPs for documentation generation

## Best Practices

### Project Management
- Use consistent scope (project or feature) across all commands
- Run commands in the recommended order
- Check prerequisites before running each command
- Review generated reports after each step

### Code Quality
- Always run `/luna-execute` until all tasks are complete
- Don't skip the code review step
- Ensure all tests pass before deployment
- Review documentation for accuracy

### Team Collaboration
- Share Luna-generated documents with team members
- Use the implementation plan for task assignment
- Track progress through the checkbox system
- Maintain consistent file organization

## 🆕 What's New in Version 2.0

### Latest Features (November 2025)

- **🎨 Luna UI Convert** - Transform any UI to Apple HIG + modern design
- **🧪 Luna UI Test** - Comprehensive UI/UX testing with Playwright
- **🔧 Luna UI Fix** - Automatically detect and fix UI issues
- **⚡ Luna Shortcuts** - Quick command aliases and workflow automation
- **🚀 Luna Cloudflare Auto** - One-command full-stack deployment
- **🔐 API Authentication** - Premium feature access control
- **💳 LemonSqueezy Integration** - Subscription management and billing
- **📊 Usage Analytics** - Track API usage and performance metrics
- **🌐 Custom Domain Support** - `agent.lunaos.ai` with SSL
- **📱 User Dashboard** - Manage subscription and view usage

### New Premium Agents

- **Luna UI Test Agent** - End-to-end visual testing automation
- **Luna UI Fix Agent** - Automated issue correction and remediation
- **Luna Cloudflare Deployment Agent** - Zero-config deployment pipeline

### Enhanced Integrations

- **RAG + GLM Vision Integration** - Context-aware GUI testing
- **MCP Server Cross-Communication** - Unified agent ecosystem
- **Cloudflare Workers Integration** - Serverless premium features
- **Advanced Authentication** - API key-based access control

---

## 🛠️ Technical Implementation

### Cloud Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Luna Agents   │───▶│   MCP Servers    │───▶│  Cloud Services │
│   (Local CLI)   │    │ (RAG/Vision/API) │    │ (Cloudflare)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ 15+ AI Agents   │    │  Semantic Search │    │  Auth & Billing │
│ Complete DevOps │    │  Vision Analysis │    │  Usage Tracking │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Key Integrations

- **Luna RAG + GLM Vision**: Unified semantic and visual understanding
- **LemonSqueezy**: Subscription billing and webhook processing
- **Cloudflare Workers**: Serverless compute for premium features
- **Pinecone/Qdrant**: Vector databases for semantic search
- **Playwright**: Automated browser testing
- **Apple HIG**: Design system compliance

---

## Troubleshooting

### Common Issues

**Command not found**
- Ensure plugin is properly installed and enabled
- Check that command files are in the correct directory
- Restart your AI coding assistant if needed

**Missing prerequisites**
- Run commands in the correct order
- Check that previous steps completed successfully
- Verify required files exist in `.luna/` directory

**Wrong project scope**
- Always use the same scope (project name or feature name) across commands
- Check you're in the correct project directory
- Review the prompt messages carefully

**API Key Issues (Premium)**
- Verify API key format: `luna_AbCdEfGh1234567890IjKlMnOpQrSt`
- Check subscription is active at https://agent.lunaos.ai/dashboard
- Ensure MCP configuration includes API key in headers

### Getting Help

For additional support:
- Check the generated reports in `.luna/` directory
- Review the agent documentation in the plugin
- Use `/luna-docs` to generate comprehensive project documentation
- Visit https://agent.lunaos.ai for guides and tutorials
- Email support@lunaos.ai for premium support

---

## Roadmap

### Version 2.1 (Coming Soon)
- **Team Collaboration Features** - Shared workspaces and projects
- **Advanced Analytics** - Detailed usage insights and recommendations
- **Custom Model Training** - Train models on your codebase
- **VS Code Extension** - Native Luna integration
- **Mobile App** - On-the-go project management

### Version 3.0 (Q1 2026)
- **Multi-language Support** - Python, Java, Go, Rust agents
- **Advanced CI/CD** - Full pipeline automation
- **Enterprise SSO** - SAML, LDAP integration
- **Custom Agent Builder** - Create your own specialized agents
- **Marketplace** - Community-built agents and integrations

---

## Contributing

Luna Agents is an open-source project. Contributions welcome!

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Setup
```bash
git clone https://github.com/shacharsol/luna-agent.git
cd luna-agent
npm install
npm run dev
```

---

## License

MIT License - see LICENSE file for details.

---

**🌙 Transform your development workflow with Luna Agents - AI-powered software development, end-to-end.**

**🚀 Get started at [https://agent.lunaos.ai](https://agent.lunaos.ai)**