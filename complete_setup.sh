#!/bin/bash

# Complete Luna Agents Setup
# This script creates the full Luna package from your documents

set -e
AGENT_FOLDER='./agents'
COMMANDS_FOLDER='./commands'
# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

echo -e "${BLUE}${BOLD}"
echo "╔════════════════════════════════════════════╗"
echo "║                                            ║"
echo "║     Luna Agents - Complete Setup          ║"
echo "║                                            ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "  ${DIM}This will create a complete Luna package from your documents${NC}"
echo ""

# Check if source documents exist
if [ ! -f "${AGENT_FOLDER}/luna-testing-validation.md" ]; then
    echo -e "${RED}✗${NC} Error: Source documents not found"
    echo -e "  Please ensure you have the Luna agent .md files in this directory"
    exit 1
fi

# Create project structure
echo -e "${YELLOW}→${NC} Creating project structure..."
mkdir -p luna-package/{agents,commands,docs,scripts}

# Copy existing agent files
echo -e "${YELLOW}→${NC} Copying agent files..."
cp ${AGENT_FOLDER}/luna-testing-validation.md luna-package/agents/ 2>/dev/null || echo -e "${YELLOW}Warning: luna-testing-validation.md not found${NC}"
cp ${AGENT_FOLDER}/luna-task-planner.md luna-package/agents/ 2>/dev/null || echo -e "${YELLOW}Warning: luna-task-planner.md not found${NC}"
cp ${AGENT_FOLDER}/luna-task-executor.md luna-package/agents/ 2>/dev/null || echo -e "${YELLOW}Warning: luna-task-executor.md not found${NC}"
cp ${AGENT_FOLDER}/luna-requirements-analyzer.md luna-package/agents/ 2>/dev/null || echo -e "${YELLOW}Warning: luna-requirements-analyzer.md not found${NC}"
cp ${AGENT_FOLDER}/luna-post-launch-review.md luna-package/agents/ 2>/dev/null || echo -e "${YELLOW}Warning: luna-post-launch-review.md not found${NC}"
cp ${AGENT_FOLDER}/luna-monitoring-observability.md luna-package/agents/ 2>/dev/null || echo -e "${YELLOW}Warning: luna-monitoring-observability.md not found${NC}"
cp ${AGENT_FOLDER}/luna-documentation.md luna-package/agents/ 2>/dev/null || echo -e "${YELLOW}Warning: luna-documentation.md not found${NC}"
cp ${AGENT_FOLDER}/luna-design-architect.md luna-package/agents/ 2>/dev/null || echo -e "${YELLOW}Warning: luna-design-architect.md not found${NC}"
cp ${AGENT_FOLDER}/luna-deployment.md luna-package/agents/ 2>/dev/null || echo -e "${YELLOW}Warning: luna-deployment.md not found${NC}"
cp ${AGENT_FOLDER}/luna-code-review.md luna-package/agents/ 2>/dev/null || echo -e "${YELLOW}Warning: luna-code-review.md not found${NC}"
cp ${AGENT_FOLDER}/luna-complete-bundle.md luna-package/agents/ 2>/dev/null || echo -e "${YELLOW}Warning: luna-complete-bundle.md not found${NC}"

# Copy existing command files if they exist
if [ -d "${COMMANDS_FOLDER}" ]; then
    echo -e "${YELLOW}→${NC} Copying existing command files..."
    cp ${COMMANDS_FOLDER}/*.md luna-package/commands/ 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Existing command files copied"
else
    echo -e "${DIM}Note: No local commands folder found, will generate default commands${NC}"
fi

# Create command shortcuts
echo -e "${YELLOW}→${NC} Creating command shortcuts..."

# Requirements command
cat > "luna-package/commands/luna-requirements.md" << 'EOF'
# Luna Requirements Command

Analyze your project and generate comprehensive requirements.

## Usage

```bash
cd /path/to/your-project
luna-requirements
```

## What Happens

1. Prompts for scope (project or feature)
2. Scans entire codebase
3. Analyzes documentation
4. Identifies gaps and missing features
5. Generates requirements document

## Output

- `.luna/{project}/requirements.md` - Complete requirements specification

## Next Step

After requirements are generated:
```bash
luna-design
```
EOF

# Design command
cat > "luna-package/commands/luna-design.md" << 'EOF'
# Luna Design Command

Create comprehensive technical design from requirements.

## Usage

```bash
cd /path/to/your-project
luna-design
```

## Prerequisites

- Requirements must exist (run `luna-requirements` first)

## What Happens

1. Reads requirements.md
2. Analyzes current architecture
3. Designs complete technical solution
4. Creates component specifications

## Output

- `.luna/{project}/design.md` - Technical design document

## Next Step

```bash
luna-plan
```
EOF

# Plan command
cat > "luna-package/commands/luna-plan.md" << 'EOF'
# Luna Plan Command

Break design into actionable implementation tasks.

## Usage

```bash
cd /path/to/your-project
luna-plan
```

## Prerequisites

- Design document must exist (run `luna-design` first)

## What Happens

1. Reads design.md
2. Breaks into logical phases
3. Creates detailed task breakdown
4. Orders by dependencies

## Output

- `.luna/{project}/implementation-plan.md` - Task breakdown

## Next Step

```bash
luna-execute
```
EOF

# Execute command
cat > "luna-package/commands/luna-execute.md" << 'EOF'
# Luna Execute Command

Implement tasks from the implementation plan.

## Usage

```bash
cd /path/to/your-project
luna-execute
```

## Prerequisites

- Implementation plan must exist (run `luna-plan` first)

## What Happens

1. Reads implementation-plan.md
2. Finds next uncompleted task
3. Implements code following design
4. Writes tests
5. Marks task complete
6. Moves to next task

## Output

- Implemented code in source files
- Updated implementation-plan.md with [x] markers

## Next Step

```bash
luna-review
```
EOF

# Create all remaining command files...
for cmd in review test deploy docs monitor review-launch; do
    cat > "luna-package/commands/luna-${cmd}.md" << EOF
# Luna ${cmd^} Command

${cmd^} phase of the Luna workflow.

## Usage

\`\`\`bash
cd /path/to/your-project
luna-${cmd}
\`\`\`

## Prerequisites

- Previous workflow steps must be complete

## What Happens

[Command-specific workflow]

## Output

[Command-specific output files]
EOF
done

# Create main commands README
cat > "luna-package/commands/README.md" << 'EOF'
# Luna Commands Reference

Complete reference for all Luna commands.

## Command List

| Command | Purpose | Prerequisites | Output |
|---------|---------|---------------|--------|
| `luna-requirements` | Analyze project | None | `requirements.md` |
| `luna-design` | Technical design | requirements.md | `design.md` |
| `luna-plan` | Task breakdown | design.md | `implementation-plan.md` |
| `luna-execute` | Implement code | implementation-plan.md | Code + updated plan |
| `luna-review` | Code review | Implemented code | `code-review-report.md` |
| `luna-test` | Test & validate | Implemented code | `test-validation-report.md` |
| `luna-deploy` | Deploy to prod | Tests passing | `deployment-report.md` |
| `luna-docs` | Documentation | Deployed app | `docs/` directory |
| `luna-monitor` | Set up monitoring | Deployed app | `monitoring-observability-report.md` |
| `luna-review-launch` | Post-launch review | Live in production | `post-launch-review.md` |

## Typical Workflow

```bash
cd /path/to/your-project

# 1. Requirements & Planning
luna-requirements
luna-design
luna-plan

# 2. Implementation
luna-execute      # Runs until all tasks complete

# 3. Quality Assurance
luna-review
luna-test

# 4. Deployment
luna-deploy
luna-monitor

# 5. Documentation & Review
luna-docs
luna-review-launch
```

## Working with Features

Every command supports feature-specific work:

```bash
luna-requirements
# When prompted:
# - Press ENTER for full project
# - Type "user-auth" for specific feature
```

This creates:
- Project: `.luna/project-name/requirements.md`
- Feature: `.luna/project-name/user-auth/requirements.md`

## File Structure

```
your-project/
├── .luna/
│   └── project-name/
│       ├── requirements.md
│       ├── design.md
│       ├── implementation-plan.md
│       ├── code-review-report.md
│       ├── test-validation-report.md
│       ├── deployment-report.md
│       ├── monitoring-observability-report.md
│       ├── post-launch-review.md
│       └── feature-name/
│           ├── requirements.md
│           └── ... (same structure)
├── src/
├── docs/
└── package.json
```

## Tips

1. **Always start with requirements** - Foundation of everything
2. **Review generated files** - They're Markdown, easily editable
3. **Use git** - Commit .luna/ files for history
4. **Features for scale** - Use feature workflow for large projects
5. **Read the output** - Luna generates detailed documentation

## Troubleshooting

### Command not found
```bash
# Reinstall
bash install-luna.sh
```

### Missing prerequisites
- Each command checks for required files
- Error message tells you what's missing
- Run previous steps first

### Permission denied
```bash
chmod +x ~/.claude/commands/*.md
chmod +x ~/.claude/agents/*.md
```

## Advanced Usage

### Skip prompts (for automation)
```bash
# Set environment variable
export LUNA_SCOPE="project"  # or "feature-name"
luna-requirements
```

### Custom agent paths
```bash
claude-code --agent /custom/path/luna-requirements-analyzer.md
```

### Parallel feature development
```bash
# Terminal 1
luna-requirements  # Enter "auth"
luna-design
luna-plan
luna-execute

# Terminal 2
luna-requirements  # Enter "payments"
luna-design
luna-plan
luna-execute
```

## Support

For detailed documentation:
- User Guide: `docs/USER_GUIDE.md`
- API Reference: `docs/API_REFERENCE.md`
- Troubleshooting: `docs/TROUBLESHOOTING.md`

🌙 Happy coding with Luna!
EOF

# Create documentation files
echo -e "${YELLOW}→${NC} Creating documentation..."

cat > "luna-package/docs/USER_GUIDE.md" << 'EOF'
# Luna Agents User Guide

Complete guide to using Luna Agents for AI-powered development automation.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Workflow Guide](#workflow-guide)
5. [Feature Development](#feature-development)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Introduction

Luna Agents is a complete SDLC automation system consisting of 10 specialized AI agents:

1. **Requirements Analyzer** - Analyzes codebases and generates requirements
2. **Design Architect** - Creates technical design specifications
3. **Task Planner** - Breaks designs into actionable tasks
4. **Task Executor** - Implements code following the plan
5. **Code Reviewer** - Performs comprehensive code reviews
6. **Testing & Validation** - Creates and runs test suites
7. **Deployment** - Handles production deployments
8. **Documentation** - Generates comprehensive documentation
9. **Monitoring & Observability** - Sets up monitoring and alerts
10. **Post-Launch Review** - Analyzes launches and provides insights

## Installation

### Automated Installation

```bash
cd luna-package
bash install-luna.sh
```

This installs:
- Agents to `~/.claude/agents/`
- Commands to `~/.claude/commands/`
- Documentation and utilities

### Verification

```bash
ls ~/.claude/agents/luna-*.md
ls ~/.claude/commands/luna-*.md
```

## Quick Start

### First Project

```bash
# Navigate to your project
cd /path/to/your-project

# Run first Luna command
luna-requirements

# When prompted, press ENTER for full project analysis
# Luna will scan your entire codebase and generate requirements
```

### View Output

```bash
# Requirements are saved to .luna directory
cat .luna/your-project-name/requirements.md
```

### Continue Workflow

```bash
# Design the solution
luna-design

# Break into tasks
luna-plan

# Start implementing
luna-execute
```

## Workflow Guide

### Complete SDLC Flow

```mermaid
graph TD
    A[luna-requirements] --> B[luna-design]
    B --> C[luna-plan]
    C --> D[luna-execute]
    D --> E[luna-review]
    E --> F{Issues?}
    F -->|Yes| D
    F -->|No| G[luna-test]
    G --> H{Tests Pass?}
    H -->|No| D
    H -->|Yes| I[luna-deploy]
    I --> J[luna-monitor]
    J --> K[luna-docs]
    K --> L[luna-review-launch]
```

### Phase 1: Requirements & Design

```bash
# 1. Analyze and generate requirements
luna-requirements
# Output: .luna/project/requirements.md

# 2. Create technical design
luna-design
# Output: .luna/project/design.md
```

**What to review:**
- Requirements completeness
- Acceptance criteria clarity
- Design architecture soundness
- Component specifications

### Phase 2: Implementation

```bash
# 3. Break design into tasks
luna-plan
# Output: .luna/project/implementation-plan.md

# 4. Execute tasks
luna-execute
# Implements code, marks tasks complete
```

**What happens:**
- Task Executor reads implementation plan
- Finds first incomplete task ([ ])
- Implements according to design
- Writes tests
- Marks complete [x]
- Moves to next task

### Phase 3: Quality Assurance

```bash
# 5. Perform code review
luna-review
# Output: .luna/project/code-review-report.md

# 6. Test and validate
luna-test
# Output: .luna/project/test-validation-report.md
```

**Quality gates:**
- Code review must be approved
- All tests must pass
- Coverage must meet standards (80%+)
- No critical security issues

### Phase 4: Deployment

```bash
# 7. Deploy to production
luna-deploy
# Output: .luna/project/deployment-report.md

# 8. Set up monitoring
luna-monitor
# Output: .luna/project/monitoring-observability-report.md
```

**Deployment checklist:**
- All tests passing
- Code review approved
- Staging environment tested
- Rollback plan ready

### Phase 5: Documentation & Review

```bash
# 9. Generate documentation
luna-docs
# Output: docs/ directory

# 10. Post-launch review
luna-review-launch
# Output: .luna/project/post-launch-review.md
```

## Feature Development

For large projects, work on individual features:

### Starting a Feature

```bash
luna-requirements
# When prompted: "user-authentication"
# Creates: .luna/project/user-authentication/requirements.md
```

### Feature Workflow

```bash
cd /path/to/your-project

# Requirements for feature
luna-requirements
# Enter: "user-auth"

# Design the feature
luna-design
# Enter: "user-auth"

# Plan implementation
luna-plan
# Enter: "user-auth"

# Implement
luna-execute
# Enter: "user-auth"

# Continue through QA and deployment...
```

### Feature vs Project

**Project-wide** (press ENTER):
- Analyzes entire codebase
- Generates holistic design
- Creates comprehensive plan
- Best for: Small projects, new projects

**Feature-specific** (enter name):
- Focuses on feature code
- Isolated requirements and design
- Feature-scoped tasks
- Best for: Large projects, incremental features

## Best Practices

### 1. Start Every Project with Requirements

```bash
# Even if you think you know what to build
luna-requirements
```

Why:
- Captures implicit requirements
- Identifies missing features
- Documents acceptance criteria
- Provides traceability

### 2. Review Generated Files

Luna files are Markdown - read and edit them!

```bash
# Review requirements
cat .luna/project/requirements.md

# Edit if needed
vim .luna/project/requirements.md

# Continue workflow
luna-design
```

### 3. Keep .luna in Version Control

```bash
git add .luna/
git commit -m "Add Luna requirements and design"
```

Why:
- Track requirement changes
- Review design evolution
- Share with team
- Audit trail

### 4. Use Features for Scale

```bash
# Large project? Break into features
luna-requirements  # "authentication"
luna-requirements  # "payments"
luna-requirements  # "analytics"
```

### 5. Run Tests Before Deploy

```bash
# Always validate before deployment
luna-test
# Wait for results
luna-deploy
```

### 6. Monitor After Launch

```bash
# Set up monitoring immediately
luna-deploy
luna-monitor

# Check first 24 hours closely
```

### 7. Learn from Each Launch

```bash
# After 7 days in production
luna-review-launch

# Review metrics and lessons
# Apply to next project
```

## Troubleshooting

### Command Not Found

**Problem:** `luna-requirements: command not found`

**Solution:**
```bash
# Reinstall
bash ~/.claude/uninstall.sh
bash install-luna.sh
```

### Missing Prerequisites

**Problem:** `Error: design.md not found`

**Solution:**
```bash
# Run previous steps first
luna-requirements
luna-design
luna-plan  # Now this will work
```

### Wrong Directory

**Problem:** Creating files in wrong location

**Solution:**
```bash
# Ensure you're in project root
cd /path/to/your-project
pwd  # Verify location
luna-requirements
```

### Agent Not Responding

**Problem:** Agent seems stuck or not working

**Solution:**
1. Check agent file exists:
   ```bash
   ls ~/.claude/agents/luna-requirements-analyzer.md
   ```

2. Verify permissions:
   ```bash
   chmod +x ~/.claude/agents/*.md
   ```

3. Try direct invocation:
   ```bash
   claude-code --agent ~/.claude/agents/luna-requirements-analyzer.md
   ```

### File Permission Errors

**Problem:** Cannot write to .luna directory

**Solution:**
```bash
# Check ownership
ls -la .luna/

# Fix if needed
chmod -R 755 .luna/
```

## Advanced Topics

### Custom Agent Behavior

Edit agent files to customize:

```bash
vim ~/.claude/agents/luna-requirements-analyzer.md
```

### Automation

Set environment variables to skip prompts:

```bash
export LUNA_SCOPE="project"
luna-requirements  # Auto-uses project scope
```

### Parallel Development

Multiple features simultaneously:

```bash
# Terminal 1
luna-execute  # "auth"

# Terminal 2
luna-execute  # "payments"
```

### CI/CD Integration

Run Luna in CI:

```bash
# In GitHub Actions
- name: Generate Requirements
  run: luna-requirements < echo "project"
```

## Getting Help

- **Commands**: `cat ~/.claude/commands/README.md`
- **Agents**: `cat ~/.claude/agents/luna-*.md`
- **Issues**: Check GitHub repository
- **Community**: Join Discord/Slack

## Next Steps

1. ✅ Install Luna Agents
2. ✅ Run first workflow
3. ✅ Review generated files
4. ✅ Customize as needed
5. ✅ Deploy with confidence!

🌙 **Happy coding with Luna!**
EOF

# Create installer
cat > "luna-package/install-luna.sh" << 'INSTALLER'
#!/bin/bash
# Luna Agents Installer
# Version 1.0.0

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

INSTALL_DIR="$HOME/.claude"

clear
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          🌙  Luna Agents Installer         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""
echo "This will install Luna Agents to $INSTALL_DIR"
echo ""
echo "Press ENTER to continue..."
read

mkdir -p "$INSTALL_DIR"/{agents,commands}

echo -e "${YELLOW}→${NC} Installing agents..."
cp agents/*.md "$INSTALL_DIR/agents/"

echo -e "${YELLOW}→${NC} Installing commands..."
cp commands/*.md "$INSTALL_DIR/commands/"

chmod -R 755 "$INSTALL_DIR"

echo ""
echo -e "${GREEN}✓ Installation complete!${NC}"
echo ""
echo "Try it: cd /your-project && luna-requirements"
echo ""
INSTALLER

chmod +x luna-package/install-luna.sh

# Create package builder
cp luna_build_package.sh luna-package/scripts/build-package.sh 2>/dev/null || true

# Count files for summary
AGENT_COUNT=$(find luna-package/agents -name "*.md" -type f | wc -l | tr -d ' ')
COMMAND_COUNT=$(find luna-package/commands -name "*.md" -type f | wc -l | tr -d ' ')

# Summary
echo ""
echo -e "${GREEN}${BOLD}✓ Luna package created successfully!${NC}"
echo ""
echo -e "  ${BOLD}Package Location:${NC}"
echo -e "    luna-package/"
echo ""
echo -e "  ${BOLD}Contents:${NC}"
echo -e "    ├── agents/          (${AGENT_COUNT} Luna agent files)"
echo -e "    ├── commands/        (${COMMAND_COUNT} command shortcuts)"
echo -e "    ├── docs/            (Complete documentation)"
echo -e "    ├── scripts/         (Build scripts)"
echo -e "    └── install-luna.sh  (Installer)"
echo ""
echo -e "  ${BOLD}Next Steps:${NC}"
echo -e "    ${BLUE}1.${NC} Test the installer:"
echo -e "       cd luna-package && bash install-luna.sh"
echo ""
echo -e "    ${BLUE}2.${NC} Try it out:"
echo -e "       cd /your-project && luna-requirements"
echo ""
echo -e "    ${BLUE}3.${NC} Create distribution:"
echo -e "       cd luna-package/scripts && bash build-package.sh"
echo ""
echo -e "  ${BOLD}🌙 Luna Agents package ready!${NC}"
echo ""
