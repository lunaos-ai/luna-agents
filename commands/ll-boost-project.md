---
name: ll-boost-project
displayName: Luna Boost Project
description: Analyze any project and generate a full integration plan using open-source tools, Claw Gateway, and Luna's intelligence features
version: 1.0.0
category: analysis
agent: luna-task-executor
parameters:
  - name: path
    type: string
    description: "Project path or URL (e.g., '.' for current, '/path/to/project', 'https://github.com/user/repo')"
    required: false
    default: "."
    prompt: true
  - name: depth
    type: string
    description: "Analysis depth: quick (5 min), full (15 min), deep (30 min)"
    required: false
    default: full
prerequisites: []
---

# Luna Boost Project — Supercharge Any Project with Open-Source Intelligence

Analyzes any project's codebase, identifies what it does, what it's missing, and generates a specific integration plan using the full ecosystem of open-source tools, shared infrastructure, and Luna's intelligence features.

## What This Command Does

1. **Scan** — reads the project structure, README, CLAUDE.md, package.json/go.mod, key source files
2. **Classify** — identifies: stack, domain, maturity, strengths, gaps
3. **Match** — maps the project against 15+ researched open-source tools
4. **Plan** — generates a prioritized integration plan with specific code-level steps
5. **Register** — optionally registers the project on the Claw Gateway
6. **Output** — creates an implementation roadmap

## Open-Source Tools Available

### AI Infrastructure (share across all projects)
| Tool | What It Provides |
|------|-----------------|
| **Claw Gateway** | Multi-provider LLM routing, caching, cost tracking — already deployed |
| **ReasoningBank** | KV cache for prompt→response pairs — 30% token savings |
| **Agent Booster** | Skip LLM for simple deterministic transforms — <1ms, $0 |
| **Context Packing** | Trim context to relevant parts — 40-60% token savings |
| **Smart Router** | Self-learning model selection — cheapest viable model |
| **llamafile** | Run LLMs locally as single executable — free, offline |

### Search & Data
| Tool | What It Provides |
|------|-----------------|
| **Hybrid Search** | Sparse+Dense RRF fusion — 20-49% better retrieval |
| **RuVector** | Self-learning vector DB — improves from every query |
| **Graph RAG** | Knowledge graph for multi-hop code understanding |

### Developer Experience
| Tool | What It Provides |
|------|-----------------|
| **Voicebox** | Free local TTS — narrate demos, accessibility audio |
| **Perfetto** | Performance tracing — debug slow operations |
| **flakestress** | Detect flaky tests — CI reliability |
| **Victory** | React charting components — analytics dashboards |

### Gamification & Growth
| Tool | What It Provides |
|------|-----------------|
| **Credit System** | Earn credits for contributions — gamification |
| **Skill Marketplace** | Publish/install reusable components — ecosystem |

### Architecture
| Tool | What It Provides |
|------|-----------------|
| **Queen-Led Swarm** | Multi-agent task decomposition + parallel execution |
| **Product Map** | Visual planning with hierarchical feature cards |
| **Tailscale** | Secure mesh networking between services |

## How It Analyzes

### Step 1: Project Classification
- Stack: Go / TypeScript / Python / Rust / Multi
- Domain: SaaS / DevTool / FinTech / Security / AI / Marketplace
- Maturity: early (< 50 files) / growing (50-500) / mature (500+)
- Has AI: yes/no (checks for LLM calls, embeddings, AI imports)
- Has billing: yes/no (checks for Stripe/LemonSqueezy/payment)
- Has tests: coverage percentage
- Has CI/CD: yes/no

### Step 2: Gap Analysis
For each tool, checks:
- Does the project already have this capability?
- Would this capability benefit the project?
- What's the estimated integration effort?
- What's the expected business impact?

### Step 3: Integration Plan
Generates specific steps:
```
P1 (do now):
  - Register on Claw Gateway (10 min)
  - Add ReasoningBank caching (30 min)
  
P2 (this week):
  - Implement Context Packing (2 hrs)
  - Add Agent Booster for [detected patterns] (2 hrs)
  
P3 (next sprint):
  - Embed Hybrid Search (4 hrs)
  - Add Victory charts to dashboard (4 hrs)
```

### Step 4: Claw Gateway Registration
If not already registered, offers to:
- Generate API key
- Register project on the gateway
- Add env vars to the project

## Usage

```bash
# Analyze current project
/boost-project

# Analyze specific project
/boost-project /path/to/project

# Quick scan
/boost-project . quick

# Deep analysis with implementation
/boost-project . deep
```

## Output

```
.luna/{project}/boost/
  analysis.md           # Full project classification
  gap-analysis.md       # What's missing
  integration-plan.md   # Prioritized steps
  tool-mapping.md       # Which tools apply and why
  claw-registration.md  # Gateway setup instructions
```

## Per-Domain Recommendations

### If SaaS:
→ Claw Gateway + ReasoningBank + billing (LemonSqueezy) + Victory charts

### If DevTool (CLI/extension):
→ llamafile local mode + Agent Booster + Perfetto tracing + flakestress

### If FinTech/Security:
→ Hybrid Search + Tailscale + audit logging + ReasoningBank for compliance caching

### If AI/ML:
→ Claw Gateway + Smart Router + Context Packing + Queen-Led Swarm

### If Testing:
→ flakestress + CodeRailFlow + Agent Booster + Voicebox narration

## Cross-Project Synergies

The analysis also identifies synergies with other portfolio projects:
- Push-CI + PipeWarden = CI/CD security suite
- Qestro + CodeRailFlow = testing + automation suite
- QueryFlux + RuVector = intelligent data platform
- Aegis + Hybrid Search = better AML screening
- All projects + Claw Gateway = shared AI with cost tracking

## In Pipes

```bash
# Boost then implement
/pipe boost-project . >> go

# Boost then audit then fix
/pipe boost-project . >> site-audit https://myapp.com >> fix

# Boost all projects in a directory
/pipe boost-project /path/to/project1 >> boost-project /path/to/project2
```
