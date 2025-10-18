# Luna Agents Plugin for Claude Code

🌙 **Complete AI-powered development lifecycle management in a single plugin**

## Overview

Luna Agents is a comprehensive Claude Code plugin that provides an end-to-end software development workflow powered by specialized AI agents. From requirements analysis to post-launch monitoring, Luna automates and streamlines every phase of your development process.

## Features

### 🔄 Complete Development Workflow
- **Requirements Analysis** - Automatically analyze codebase and generate comprehensive requirements
- **Technical Design** - Create detailed architecture specifications and component designs
- **Task Planning** - Break down designs into actionable, ordered implementation tasks
- **Task Execution** - Implement code with quality standards and progress tracking
- **Code Review** - Automated code quality and security assessments
- **Testing & Validation** - Comprehensive test creation and requirements validation
- **Deployment** - Production-ready deployment with infrastructure setup
- **Documentation** - Auto-generated technical documentation
- **Monitoring & Observability** - Complete monitoring stack setup
- **Post-Launch Review** - Performance analysis and optimization recommendations

### 📚 Comprehensive Skills Reference
- **Web Development** - HTML5, CSS3, JavaScript ES6+, React/Vue/Svelte
- **Server Architecture** - Node.js, Express, Databases, APIs, Security
- **Apple HIG** - Design principles, typography, spacing, motion
- **Design Patterns** - MVC, Repository, Factory, Observer, Strategy
- **Best Practices** - Claude Code optimization, testing, performance
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
- Claude Code (latest version)
- Node.js 16+ (for some features)
- Git (for version control)

### Install Plugin

**Option 1: Install via Marketplace (Recommended)**

1. **Add marketplace source** in Claude Code:
```bash
/plugin marketplace add https://github.com/shacharsol/luna-agent
```

2. **Install the plugin**:
```bash
/plugin install luna-agents
```

3. **Restart Claude Code** to complete installation

**Option 2: Manual Installation**

1. **Download** the plugin folder to your Claude plugins directory:
```bash
# Typical location
mkdir -p ~/.claude/plugins
cp -r luna-agents/.claude-plugin ~/.claude/plugins/luna-agents
```

2. **Enable** the plugin in Claude Code settings:
   - Open Claude Code
   - Go to Settings → Plugins
   - Enable "Luna Agents"

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
/luna-requirements   # 1. Analyze & generate requirements
/luna-design         # 2. Create technical design
/luna-plan           # 3. Break into tasks
/luna-execute        # 4. Implement (run multiple times)
/luna-review         # 5. Code review
/luna-test           # 6. Test & validate
/luna-deploy         # 7. Deploy to production
/luna-docs           # 8. Generate documentation
/luna-monitor        # 9. Set up monitoring
/luna-postlaunch     # 10. Post-launch review (after 7 days)
```

## Commands Reference

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

### Claude Code Best Practices
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

## Agent Capabilities

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

To enhance your Luna workflow with MCP servers, add them to your Claude Code configuration using the proper format:

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

## Troubleshooting

### Common Issues

**Command not found**
- Ensure plugin is properly installed and enabled
- Check that command files are in the correct directory
- Restart Claude Code if needed

**Missing prerequisites**
- Run commands in the correct order
- Check that previous steps completed successfully
- Verify required files exist in `.luna/` directory

**Wrong project scope**
- Always use the same scope (project name or feature name) across commands
- Check you're in the correct project directory
- Review the prompt messages carefully

### Getting Help

For additional support:
- Check the generated reports in `.luna/` directory
- Review the agent documentation in the plugin
- Use `/luna-docs` to generate comprehensive project documentation
- Consult the Luna workflow guidelines

## Contributing

Luna Agents is an open-source project. Contributions welcome!

## License

MIT License - see LICENSE file for details.

---

**Transform your development workflow with Luna Agents - AI-powered software development, end-to-end.** 🚀