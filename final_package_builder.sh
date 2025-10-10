#!/bin/bash

# Luna Agents - Complete Package Builder
# Creates production-ready Claude plugin package

set -e

VERSION="1.0.0"
PACKAGE_NAME="luna-claude-plugins"
BUILD_DIR="build"
DIST_DIR="dist"

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
echo "║     Luna Agents - Claude Plugin Builder   ║"
echo "║                                            ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if source files exist
echo -e "${YELLOW}→${NC} Checking source files..."
REQUIRED_FILES=(
    "luna-testing-validation.md"
    "luna-task-planner.md"
    "luna-task-executor.md"
    "luna-post-launch-review.md"
    "luna-monitoring-observability.md"
    "luna-documentation.md"
    "luna-design-architect.md"
    "luna-deployment.md"
    "luna-code-review.md"
)

MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo -e "${RED}✗${NC} Missing required files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "  - $file"
    done
    echo ""
    echo "Please ensure all Luna agent .md files are in the current directory."
    exit 1
fi

echo -e "${GREEN}✓${NC} All source files found"

# Clean previous builds
echo -e "${YELLOW}→${NC} Cleaning previous builds..."
rm -rf "$BUILD_DIR" "$DIST_DIR"
mkdir -p "$BUILD_DIR" "$DIST_DIR"

# Create package structure
echo -e "${YELLOW}→${NC} Creating package structure..."
PACKAGE_DIR="$BUILD_DIR/${PACKAGE_NAME}"
mkdir -p "$PACKAGE_DIR"/{agents,commands,docs,scripts}

# Copy agent files
echo -e "${YELLOW}→${NC} Copying agent files..."
cp luna-testing-validation.md "$PACKAGE_DIR/agents/"
cp luna-task-planner.md "$PACKAGE_DIR/agents/"
cp luna-task-executor.md "$PACKAGE_DIR/agents/"
cp luna-post-launch-review.md "$PACKAGE_DIR/agents/"
cp luna-monitoring-observability.md "$PACKAGE_DIR/agents/"
cp luna-documentation.md "$PACKAGE_DIR/agents/"
cp luna-design-architect.md "$PACKAGE_DIR/agents/"
cp luna-deployment.md "$PACKAGE_DIR/agents/"
cp luna-code-review.md "$PACKAGE_DIR/agents/"

# Create requirements analyzer agent (complete version)
cat > "$PACKAGE_DIR/agents/luna-requirements-analyzer.md" << 'EOF'
# Luna Requirements Analysis Agent

## Role
You are a senior business analyst and product manager specializing in software requirements engineering. Your task is to analyze the entire project codebase, existing documentation, and context to generate a comprehensive requirements document.

## Initial Setup

### Feature/Project Context
**IMPORTANT**: When this agent is invoked, it MUST first ask the user:

```
🎯 Feature/Project Scope
Please specify the scope for this requirements analysis:
- Press ENTER for entire project (will use project folder name)
- Or enter a feature name (e.g., "user-authentication", "payment-integration")

Feature name: _
```

### Directory Structure Logic

**If user presses ENTER (blank)**:
- Scope: Entire project
- Directory: `.luna/{project_folder_name}/`
- Example: For project in `/path/to/devwrapped/`, create `.luna/devwrapped/requirements.md`

**If user enters a feature name**:
- Scope: Specific feature
- Directory: `.luna/{project_folder_name}/{feature_name}/`
- Example: For feature "user-auth" in project "devwrapped", create `.luna/devwrapped/user-auth/requirements.md`

### Directory Creation
Before generating any files, create the appropriate directory structure:
```bash
# For project-level:
mkdir -p .luna/{project_folder_name}

# For feature-level:
mkdir -p .luna/{project_folder_name}/{feature_name}
```

## Workflow

### Phase 1: Project Discovery
1. **Scan Project Structure**
   - Read all documentation files (README.md, docs/, *.md)
   - Analyze package.json/dependencies for technology stack
   - Identify main application components and modules
   - Review existing configuration files

2. **Analyze Codebase**
   - Identify implemented features by analyzing component files
   - Detect partially implemented functionality
   - Find TODO comments and incomplete sections
   - Identify missing error handling and validation

3. **Review Architecture**
   - Understand data models and database schema
   - Identify API endpoints and integrations
   - Map authentication and authorization flows
   - Detect third-party service dependencies

### Phase 2: Gap Analysis
1. **Feature Completeness**
   - Compare implemented features against apparent product goals
   - Identify missing critical functionality
   - Detect incomplete user workflows
   - Find unimplemented edge cases

2. **Production Readiness**
   - Check for production configuration requirements
   - Identify missing monitoring and logging
   - Assess security implementation gaps
   - Evaluate performance optimization needs

3. **Quality Assurance**
   - Identify missing test coverage
   - Find areas lacking error handling
   - Detect accessibility issues
   - Assess documentation completeness

### Phase 3: Requirements Generation

Generate a comprehensive requirements document with:
- Clear user stories
- 5-10 acceptance criteria per requirement (WHEN-THEN format)
- Testable and measurable conditions
- Performance metrics where applicable
- Security considerations
- Accessibility requirements

## Output

**File Location Logic**:
- Project-level: `.luna/{project_folder_name}/requirements.md`
- Feature-level: `.luna/{project_folder_name}/{feature_name}/requirements.md`

**File Header**:
```markdown
# Requirements Document

**Scope**: {Project Name} / {Feature Name}
**Generated**: {Date}
**Agent**: Luna Requirements Analysis Agent

---
```

## Instructions for Execution

1. **Prompt user for feature/project scope** and wait for input
2. **Determine project folder name** from current directory
3. **Create appropriate directory structure** based on user input
4. Read all project files recursively (filtered by scope if feature-level)
5. Analyze and understand the project architecture
6. Identify gaps between current state and production readiness
7. Generate comprehensive requirements document
8. **Save to appropriate location**: `.luna/{project}/{feature}/requirements.md`
9. Provide summary of identified requirements to user with file location

### Scope Filtering for Features
If user specified a feature name:
- Focus analysis on files related to that feature
- Review feature-specific components and services
- Identify feature-specific requirements
- Reference cross-feature dependencies
- Keep requirements scoped to the feature

## Constraints

- Focus on production readiness and deployment
- Prioritize security, performance, and reliability
- Include specific metrics and thresholds
- Make requirements testable and measurable
- Consider scalability and maintenance

## Success Criteria

Successful requirements analysis:
- Comprehensive coverage of all functionality
- Clear acceptance criteria for each requirement
- Testable and measurable requirements
- Production-ready focus
- Security and performance considerations
- Accessibility compliance
EOF

echo -e "${GREEN}✓${NC} Copied 10 agent files"

# Create command files
echo -e "${YELLOW}→${NC} Creating command files..."

# Requirements command
cat > "$PACKAGE_DIR/commands/luna-requirements.md" << 'EOF'
# Luna: Requirements Analysis

Analyze the project codebase and generate comprehensive requirements document.

## Usage

This command will:
1. Prompt for project/feature scope
2. Scan project structure and codebase
3. Identify gaps and missing functionality
4. Generate requirements.md with acceptance criteria

## Execute

Run from any project directory:

```bash
claude-code --agent ~/luna-agents/luna-requirements-analyzer.md
```

When prompted:
- Press **ENTER** for entire project analysis
- Type **feature-name** for specific feature (e.g., "user-authentication")

## Output

Creates in current project:
- `.luna/{current-project}/requirements.md` (project-level)
- `.luna/{current-project}/{feature}/requirements.md` (feature-level)

## Next Step

After requirements are generated, run:
```bash
luna-design
```
EOF

# Design command
cat > "$PACKAGE_DIR/commands/luna-design.md" << 'EOF'
# Luna: Design Architecture

Transform requirements into comprehensive technical design specification.

## Usage

This command will:
1. Read requirements.md from current project
2. Design system architecture
3. Create component specifications
4. Define data models and API endpoints
5. Generate design.md with implementation guidelines

## Prerequisites

Requires: `.luna/{current-project}/requirements.md`

Run `luna-requirements` first if not yet created.

## Execute

Run from any project directory:

```bash
claude-code --agent ~/luna-agents/luna-design-architect.md
```

When prompted:
- Press **ENTER** for project-level design
- Type **feature-name** to match your requirements scope

## Output

Creates in current project:
- `.luna/{current-project}/design.md` (project-level)
- `.luna/{current-project}/{feature}/design.md` (feature-level)

## Next Step

After design is complete, run:
```bash
luna-plan
```
EOF

# Plan command
cat > "$PACKAGE_DIR/commands/luna-plan.md" << 'EOF'
# Luna: Task Planning

Break down the design into ordered, actionable implementation tasks.

## Usage

This command will:
1. Read design.md and requirements.md from current project
2. Create task hierarchy with dependencies
3. Define acceptance criteria per task
4. Generate implementation-plan.md with checkboxes

## Prerequisites

Requires in current project:
- `.luna/{current-project}/design.md`
- `.luna/{current-project}/requirements.md`

## Execute

Run from any project directory:

```bash
claude-code --agent ~/luna-agents/luna-task-planner.md
```

When prompted:
- Press **ENTER** for project-level planning
- Type **feature-name** to match your design scope

## Output

Creates in current project:
- `.luna/{current-project}/implementation-plan.md` (project-level)
- `.luna/{current-project}/{feature}/implementation-plan.md` (feature-level)

Contains ordered tasks with `[ ]` checkboxes that will be marked `[x]` as completed.

## Next Step

Start implementing tasks:
```bash
luna-execute
```
EOF

# Execute command
cat > "$PACKAGE_DIR/commands/luna-execute.md" << 'EOF'
# Luna: Task Execution

Implement tasks from the implementation plan in order.

## Usage

This command will:
1. Find next uncompleted task `[ ]` in current project
2. Implement code following design specs
3. Write tests for new functionality
4. Mark task complete `[x]`
5. Update implementation-plan.md

## Prerequisites

Requires in current project:
- `.luna/{current-project}/implementation-plan.md`
- `.luna/{current-project}/design.md`
- `.luna/{current-project}/requirements.md`

## Execute

Run from any project directory:

```bash
claude-code --agent ~/luna-agents/luna-task-executor.md
```

When prompted:
- Press **ENTER** for project-level execution
- Type **feature-name** to match your plan scope

## Run Multiple Times

Each execution completes ONE task. Run repeatedly to complete all tasks:

```bash
# Run until all tasks are done
luna-execute  # Completes task 1.1
luna-execute  # Completes task 1.2
luna-execute  # Completes task 1.3
# ... continue until all [ ] become [x]
```

## Output

In current project:
- Modified source code files
- Updated implementation-plan.md with `[x]` marks
- Git commits for each completed task

## Next Step

After all tasks complete, run code review:
```bash
luna-review
```
EOF

# Review command
cat > "$PACKAGE_DIR/commands/luna-review.md" << 'EOF'
# Luna: Code Review

Perform comprehensive code review of implemented features.

## Usage

This command will:
1. Review all completed tasks in current project
2. Check code quality and security
3. Validate against requirements
4. Identify issues and improvements
5. Generate code-review-report.md

## Prerequisites

Requires in current project:
- `.luna/{current-project}/implementation-plan.md` (with completed tasks)
- `.luna/{current-project}/design.md`
- `.luna/{current-project}/requirements.md`
- Implemented source code

## Execute

Run from any project directory:

```bash
claude-code --agent ~/luna-agents/luna-code-review.md
```

When prompted:
- Press **ENTER** for project-level review
- Type **feature-name** to match your implementation scope

## Output

Creates in current project:
- `.luna/{current-project}/code-review-report.md` (project-level)
- `.luna/{current-project}/{feature}/code-review-report.md` (feature-level)

Includes:
- Critical/Major/Minor issues found
- Security analysis
- Performance review
- Recommendations with code examples
- Approval status

## Next Step

After addressing any critical issues, run tests:
```bash
luna-test
```
EOF

# Test command
cat > "$PACKAGE_DIR/commands/luna-test.md" << 'EOF'
# Luna: Testing & Validation

Create comprehensive test suites and validate against requirements.

## Usage

This command will:
1. Create missing test cases in current project
2. Run all test suites (unit, integration, E2E)
3. Validate acceptance criteria
4. Check code coverage
5. Generate test-validation-report.md

## Prerequisites

Requires in current project:
- `.luna/{current-project}/requirements.md`
- `.luna/{current-project}/design.md`
- `.luna/{current-project}/implementation-plan.md`
- `.luna/{current-project}/code-review-report.md`
- Implemented source code

## Execute

Run from any project directory:

```bash
claude-code --agent ~/luna-agents/luna-testing-validation.md
```

When prompted:
- Press **ENTER** for project-level testing
- Type **feature-name** to match your implementation scope

## Output

Creates in current project:
- `.luna/{current-project}/test-validation-report.md` (project-level)
- `.luna/{current-project}/{feature}/test-validation-report.md` (feature-level)

Includes:
- Test coverage summary
- Requirements validation matrix
- Failed/passed tests breakdown
- Performance test results
- Security scan results
- Go/No-Go recommendation

## Next Step

After all tests pass, deploy:
```bash
luna-deploy
```
EOF

# Deploy command
cat > "$PACKAGE_DIR/commands/luna-deploy.md" << 'EOF'
# Luna: Deployment

Deploy application to staging and production environments.

## Usage

This command will:
1. Verify deployment readiness
2. Configure infrastructure
3. Deploy to staging
4. Run smoke tests
5. Deploy to production
6. Generate deployment-report.md

## Prerequisites

Requires in current project:
- `.luna/{current-project}/implementation-plan.md`
- `.luna/{current-project}/code-review-report.md`
- `.luna/{current-project}/test-validation-report.md`
- `.luna/{current-project}/design.md`
- All tests passing

## Execute

Run from any project directory:

```bash
claude-code --agent ~/luna-agents/luna-deployment.md
```

When prompted:
- Press **ENTER** for project-level deployment
- Type **feature-name** to match your implementation scope

## Output

Creates in current project:
- `.luna/{current-project}/deployment-report.md` (project-level)
- `.luna/{current-project}/{feature}/deployment-report.md` (feature-level)

Includes:
- Deployment timeline
- Environment configuration
- Health check results
- Performance validation
- Rollback plan
- Access credentials

## Next Step

After deployment, create documentation:
```bash
luna-docs
```
EOF

# Docs command
cat > "$PACKAGE_DIR/commands/luna-docs.md" << 'EOF'
# Luna: Documentation

Create comprehensive user, developer, and API documentation.

## Usage

This command will:
1. Generate user guides for current project
2. Create developer documentation
3. Document API endpoints
4. Write deployment guides
5. Create operations runbooks

## Prerequisites

Requires in current project:
- `.luna/{current-project}/requirements.md`
- `.luna/{current-project}/design.md`
- `.luna/{current-project}/implementation-plan.md`
- `.luna/{current-project}/deployment-report.md`
- Source code

## Execute

Run from any project directory:

```bash
claude-code --agent ~/luna-agents/luna-documentation.md
```

When prompted:
- Press **ENTER** for project-level documentation
- Type **feature-name** for feature-specific docs

## Output

Creates comprehensive documentation in current project's `docs/` directory:
- `docs/user-guide/` - End-user documentation
- `docs/developers/` - Developer documentation
- `docs/api/` - API reference
- `docs/operations/` - DevOps documentation

References Luna specifications from `.luna/{current-project}/` files.

## Next Step

Set up monitoring:
```bash
luna-monitor
```
EOF

# Monitor command
cat > "$PACKAGE_DIR/commands/luna-monitor.md" << 'EOF'
# Luna: Monitoring & Observability

Set up comprehensive monitoring, dashboards, and alerts.

## Usage

This command will:
1. Configure monitoring tools (Sentry, CloudWatch) for current project
2. Create dashboards (health, performance, business)
3. Set up alerts (critical, warning, info)
4. Configure log aggregation
5. Generate monitoring-observability-report.md

## Prerequisites

Requires in current project:
- `.luna/{current-project}/deployment-report.md`
- `.luna/{current-project}/design.md`
- `.luna/{current-project}/requirements.md`
- Production application running

## Execute

Run from any project directory:

```bash
claude-code --agent ~/luna-agents/luna-monitoring-observability.md
```

When prompted:
- Press **ENTER** for project-level monitoring
- Type **feature-name** for feature-specific monitoring

## Output

Creates in current project:
- `.luna/{current-project}/monitoring-observability-report.md` (project-level)
- `.luna/{current-project}/{feature}/monitoring-observability-report.md` (feature-level)

Includes:
- Monitoring tools configuration
- Dashboard URLs
- Alert configurations
- Current system health
- SLO/SLA status
- Recommendations

## Next Step

After 7 days in production, run post-launch review:
```bash
luna-review-launch
```
EOF

# Post-launch command
cat > "$PACKAGE_DIR/commands/luna-review-launch.md" << 'EOF'
# Luna: Post-Launch Review

Analyze launch metrics and provide recommendations for improvement.

## Usage

This command will:
1. Collect metrics from first 7 days of current project
2. Review incidents and issues
3. Analyze user feedback and adoption
4. Compare against original requirements
5. Generate post-launch-review.md

## Prerequisites

Requires in current project:
- `.luna/{current-project}/deployment-report.md`
- `.luna/{current-project}/monitoring-observability-report.md`
- `.luna/{current-project}/test-validation-report.md`
- `.luna/{current-project}/requirements.md`
- 7 days of production data

**Important**: Run this **7 days after launch** for meaningful metrics.

## Execute

Run from any project directory:

```bash
claude-code --agent ~/luna-agents/luna-post-launch-review.md
```

When prompted:
- Press **ENTER** for project-level review
- Type **feature-name** for feature-specific review

## Output

Creates in current project:
- `.luna/{current-project}/post-launch-review.md` (project-level)
- `.luna/{current-project}/{feature}/post-launch-review.md` (feature-level)

Includes:
- Launch objectives review
- Performance metrics analysis
- User adoption metrics
- Incident summary
- What went well / could improve
- Lessons learned
- Actionable recommendations
- Success metrics for next 30 days

## Continuous Improvement

Schedule regular reviews:
- Week 2-4: Run this command again
- Monthly: Track progress against recommendations
- Quarterly: Major feature reviews
EOF

# Copy README from document
cp README.md "$PACKAGE_DIR/commands/" 2>/dev/null || cat > "$PACKAGE_DIR/commands/README.md" << 'EOF'
# 🌙 Luna Agent Commands

Global Claude Code command shortcuts for the Luna development workflow. Use from any project!

## Complete Workflow

Run commands in order for full development cycle:

```bash
luna-requirements   # 1. Analyze & generate requirements
luna-design         # 2. Create technical design
luna-plan           # 3. Break into tasks
luna-execute        # 4. Implement (run multiple times)
luna-review         # 5. Code review
luna-test           # 6. Test & validate
luna-deploy         # 7. Deploy to production
luna-docs           # 8. Generate documentation
luna-monitor        # 9. Set up monitoring
luna-review-launch  # 10. Post-launch review (after 7 days)
```

## Available Commands

| Command | Purpose | Output Location |
|---------|---------|-----------------|
| `luna-requirements` | Analyze codebase & generate requirements | `.luna/{current-project}/requirements.md` |
| `luna-design` | Create technical design | `.luna/{current-project}/design.md` |
| `luna-plan` | Break design into tasks | `.luna/{current-project}/implementation-plan.md` |
| `luna-execute` | Implement tasks | Code + updated plan |
| `luna-review` | Review code quality | `.luna/{current-project}/code-review-report.md` |
| `luna-test` | Run tests & validate | `.luna/{current-project}/test-validation-report.md` |
| `luna-deploy` | Deploy to production | `.luna/{current-project}/deployment-report.md` |
| `luna-docs` | Generate documentation | `docs/` directory |
| `luna-monitor` | Set up monitoring | `.luna/{current-project}/monitoring-observability-report.md` |
| `luna-review-launch` | Post-launch analysis | `.luna/{current-project}/post-launch-review.md` |

## How It Works

1. **Commands reference global agents**: `~/luna-agents/luna-*.md`
2. **Agents detect current project**: Automatically uses current directory name
3. **Files created locally**: In `.luna/{current-project}/` of current directory
4. **Use in any project**: Same commands work everywhere!

🌙 Happy coding with Luna!
EOF

echo -e "${GREEN}✓${NC} Created 11 command files"

# Create main package README
cat > "$PACKAGE_DIR/README.md" << 'EOF'
# 🌙 Luna Agents - Claude Plugins

AI-powered development workflow automation for Claude.

## Quick Install

```bash
bash install-luna.sh
```

## What Are Luna Agents?

Luna Agents is a complete SDLC automation system that works with Claude Code. It consists of 10 specialized AI agents that handle every phase of software development:

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

## Usage

### Quick Commands

After installation, use these commands in any project:

```bash
cd /path/to/your-project

# Full workflow
luna-requirements    # Analyze and generate requirements
luna-design          # Create technical design
luna-plan            # Break into tasks
luna-execute         # Implement tasks
luna-review          # Code review
luna-test            # Test and validate
luna-deploy          # Deploy to production
luna-docs            # Generate documentation
luna-monitor         # Set up monitoring
luna-review-launch   # Post-launch review
```

## How It Works

### Directory Structure

Luna creates a `.luna/` directory in your project:

```
your-project/
├── .luna/
│   └── project-name/              # Project-level
│       ├── requirements.md
│       ├── design.md
│       ├── implementation-plan.md
│       └── ...
│       └── feature-name/          # Feature-level
│           ├── requirements.md
│           ├── design.md
│           └── ...
```

### Workflow

Each agent:
1. Prompts for scope (entire project or specific feature)
2. Reads relevant Luna files from previous steps
3. Performs its specialized task
4. Generates output in the appropriate `.luna/` directory
5. Provides summary and next steps

## System Requirements

- macOS 10.15 or later
- Claude Code installed
- 50MB free disk space

## Documentation

- **User Guide**: `docs/USER_GUIDE.md`
- **Commands Reference**: `commands/README.md`

## Support

For issues or questions, check the documentation in the `docs/` directory.

## Uninstall

```bash
bash ~/luna-agents/uninstall.sh
```

## License

MIT License

---

🌙 **Luna Agents** - Automate your entire development workflow with AI
EOF

# Create installer
cat > "$PACKAGE_DIR/install-luna.sh" << 'INSTALLER_SCRIPT'
#!/bin/bash

# Luna Agents Installer for Claude
# Version 1.0.0

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# Installation paths
AGENTS_DIR="$HOME/luna-agents"
COMMANDS_DIR="$HOME/.claude/commands"
BACKUP_DIR="$HOME/.luna-backup-$(date +%Y%m%d-%H%M%S)"

clear
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}                    ${BOLD}🌙  Luna Agents${NC}                     ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}              ${DIM}AI-Powered Development Workflow${NC}            ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${DIM}This installer will set up Luna Agents as Claude plugins.${NC}"
echo ""
echo -e "  ${DIM}Installation locations:${NC}"
echo -e "    ${BOLD}Agents:   ${AGENTS_DIR}${NC}"
echo -e "    ${BOLD}Commands: ${COMMANDS_DIR}${NC}"
echo ""
echo -e "  ${YELLOW}Press ENTER to continue or CTRL+C to cancel${NC}"
read

echo ""
echo -e "  ${BOLD}Installing Luna Agents...${NC}"
echo ""

# Create directories
mkdir -p "$AGENTS_DIR" "$COMMANDS_DIR"

# Backup existing installation
if [ -d "$AGENTS_DIR" ] && [ "$(ls -A $AGENTS_DIR/luna-*.md 2>/dev/null)" ]; then
    echo -e "  ${YELLOW}⚠${NC}  Creating backup of existing installation..."
    mkdir -p "$BACKUP_DIR"
    cp -r "$AGENTS_DIR" "$BACKUP_DIR/" 2>/dev/null || true
    [ -d "$COMMANDS_DIR" ] && cp -r "$COMMANDS_DIR" "$BACKUP_DIR/" 2>/dev/null || true
    echo -e "  ${GREEN}✓${NC} Backup created: $BACKUP_DIR"
fi

# Install agents
echo -e "  ${GREEN}✓${NC} Installing 10 agent files..."
cp agents/*.md "$AGENTS_DIR/"

# Install commands
echo -e "  ${GREEN}✓${NC} Installing 11 command files..."
cp commands/*.md "$COMMANDS_DIR/"

# Set permissions
chmod -R 755 "$AGENTS_DIR" "$COMMANDS_DIR"

# Create version file
cat > "$AGENTS_DIR/.luna-version" << EOF
LUNA_VERSION=1.0.0
INSTALL_DATE=$(date +"%Y-%m-%d %H:%M:%S")
AGENTS_PATH=$AGENTS_DIR
COMMANDS_PATH=$COMMANDS_DIR
EOF

# Create uninstaller
cat > "$AGENTS_DIR/uninstall.sh" << 'UNINSTALL'
#!/bin/bash
echo "Uninstalling Luna Agents..."
rm -rf ~/luna-agents/luna-*.md
rm -rf ~/.claude/commands/luna-*.md
rm -f ~/luna-agents/.luna-version
rm -f ~/luna-agents/uninstall.sh
echo "Luna Agents uninstalled successfully"
echo "To remove directories: rm -rf ~/luna-agents ~/.claude"
UNINSTALL

chmod +x "$AGENTS_DIR/uninstall.sh"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}                 ${BOLD}✓  Installation Complete${NC}               ${GREEN}║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}Luna Agents installed successfully!${NC}"
echo ""
echo -e "  ${BOLD}Quick Start:${NC}"
echo -e "    ${DIM}1. Navigate to your project:${NC}"
echo -e "       ${BLUE}cd /path/to/your-project${NC}"
echo ""
echo -e "    ${DIM}2. Run your first Luna command:${NC}"
echo -e "       ${BLUE}claude-code --agent ~/luna-agents/luna-requirements-analyzer.md${NC}"
echo ""
echo -e "  ${BOLD}Available Agents:${NC}"
echo -e "    ${BLUE}~/luna-agents/luna-requirements-analyzer.md${NC}"
echo -e "    ${BLUE}~/luna-agents/luna-design-architect.md${NC}"
echo -e "    ${BLUE}~/luna-agents/luna-task-planner.md${NC}"
echo -e "    ${BLUE}~/luna-agents/luna-task-executor.md${NC}"
echo -e "    ${BLUE}~/luna-agents/luna-code-review.md${NC}"
echo -e "    ${BLUE}~/luna-agents/luna-testing-validation.md${NC}"
echo -e "    ${BLUE}~/luna-agents/luna-deployment.md${NC}"
echo -e "    ${BLUE}~/luna-agents/luna-documentation.md${NC}"
echo -e "    ${BLUE}~/luna-agents/luna-monitoring-observability.md${NC}"
echo -e "    ${BLUE}~/luna-agents/luna-post-launch-review.md${NC}"
echo ""
echo -e "  ${BOLD}Documentation:${NC}"
echo -e "    ${BLUE}cat ~/.claude/commands/README.md${NC}"
echo ""
echo -e "  ${BOLD}Uninstall:${NC}"
echo -e "    ${BLUE}bash ~/luna-agents/uninstall.sh${NC}"
echo ""
echo -e "  ${DIM}Thank you for installing Luna Agents! 🌙${NC}"
echo ""
INSTALLER_SCRIPT

chmod +x "$PACKAGE_DIR/install-luna.sh"

# Create documentation
echo -e "${YELLOW}→${NC} Creating documentation..."

cat > "$PACKAGE_DIR/docs/USER_GUIDE.md" << 'EOF'
# Luna Agents User Guide

## Installation

```bash
cd luna-claude-plugins
bash install-luna.sh
```

## First Use

```bash
cd /path/to/your-project
claude-code --agent ~/luna-agents/luna-requirements-analyzer.md
```

When prompted:
- Press **ENTER** for full project analysis
- Or type a **feature name** (e.g., "user-auth")

## Full Workflow

```bash
# 1. Requirements & Planning
claude-code --agent ~/luna-agents/luna-requirements-analyzer.md
claude-code --agent ~/luna-agents/luna-design-architect.md
claude-code --agent ~/luna-agents/luna-task-planner.md

# 2. Implementation
claude-code --agent ~/luna-agents/luna-task-executor.md  # Run multiple times

# 3. Quality Assurance
claude-code --agent ~/luna-agents/luna-code-review.md
claude-code --agent ~/luna-agents/luna-testing-validation.md

# 4. Deployment
claude-code --agent ~/luna-agents/luna-deployment.md
claude-code --agent ~/luna-agents/luna-monitoring-observability.md

# 5. Documentation & Review
claude-code --agent ~/luna-agents/luna-documentation.md
claude-code --agent ~/luna-agents/luna-post-launch-review.md  # After 7 days
```

## Output

All files are saved to `.luna/` directory in your project:

```
your-project/
├── .luna/
│   └── project-name/
│       ├── requirements.md
│       ├── design.md
│       ├── implementation-plan.md
│       └── ...
├── src/
└── package.json
```

## Multi-Project Usage

Luna works in any project:

```bash
# Project A
cd ~/projects/project-a
claude-code --agent ~/luna-agents/luna-requirements-analyzer.md

# Project B
cd ~/projects/project-b
claude-code --agent ~/luna-agents/luna-requirements-analyzer.md
```

Each project gets its own `.luna/` directory!

🌙 Happy coding with Luna!
EOF

cat > "$PACKAGE_DIR/docs/QUICK_START.md" << 'EOF'
# Luna Agents Quick Start

## 1. Install

```bash
bash install-luna.sh
```

## 2. Use

```bash
cd /your-project
claude-code --agent ~/luna-agents/luna-requirements-analyzer.md
```

## 3. Follow Workflow

- Press ENTER when prompted (for full project)
- Run agents in order (requirements → design → plan → execute → review → test → deploy)
- Each agent creates files in `.luna/project-name/`

## Tips

- Always start with requirements
- Review generated files (they're Markdown!)
- Run execute agent multiple times (one task at a time)
- Keep `.luna/` in git for team collaboration

🌙 Enjoy automated development!
EOF

# Create LICENSE
cat > "$PACKAGE_DIR/LICENSE" << 'EOF'
MIT License

Copyright (c) 2024 Luna Agents

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

# Verify package contents
echo -e "${YELLOW}→${NC} Verifying package contents..."

AGENTS_COUNT=$(find "$PACKAGE_DIR/agents" -name "*.md" | wc -l | tr -d ' ')
COMMANDS_COUNT=$(find "$PACKAGE_DIR/commands" -name "*.md" | wc -l | tr -d ' ')

if [ "$AGENTS_COUNT" -ne 10 ]; then
    echo -e "${YELLOW}⚠${NC}  Warning: Expected 10 agents, found $AGENTS_COUNT"
fi

if [ "$COMMANDS_COUNT" -ne 11 ]; then
    echo -e "${YELLOW}⚠${NC}  Warning: Expected 11 commands, found $COMMANDS_COUNT"
fi

echo -e "${GREEN}✓${NC} Package verification complete"

# Create ZIP package
echo -e "${YELLOW}→${NC} Creating distribution package..."
cd "$BUILD_DIR"
zip -r "../$DIST_DIR/${PACKAGE_NAME}-v${VERSION}.zip" "${PACKAGE_NAME}" > /dev/null
cd ..

# Calculate package size
PACKAGE_SIZE=$(du -h "$DIST_DIR/${PACKAGE_NAME}-v${VERSION}.zip" | cut -f1)

# Create installer info
cat > "$DIST_DIR/INSTALLER-INFO.txt" << EOF
Luna Agents - Claude Plugins Package
====================================

Version: $VERSION
Package: ${PACKAGE_NAME}-v${VERSION}.zip
Size: $PACKAGE_SIZE
Built: $(date)

Contents:
- 10 Luna Agent files (.md format)
- 11 Command shortcut files
- Professional installer script
- Complete documentation
- License

Installation:
1. unzip ${PACKAGE_NAME}-v${VERSION}.zip
2. cd ${PACKAGE_NAME}
3. bash install-luna.sh
4. Follow on-screen instructions

What Gets Installed:
- Agents: ~/luna-agents/*.md
- Commands: ~/.claude/commands/*.md
- Documentation and uninstaller

Usage:
cd /path/to/your-project
claude-code --agent ~/luna-agents/luna-requirements-analyzer.md

Distribution:
- Ready for sharing on GitHub
- Can be distributed commercially
- MIT Licensed
EOF

# Create checksum
cd "$DIST_DIR"
shasum -a 256 "${PACKAGE_NAME}-v${VERSION}.zip" > "${PACKAGE_NAME}-v${VERSION}.zip.sha256"
cd ..

# Summary
echo ""
echo -e "${GREEN}${BOLD}✓ Package built successfully!${NC}"
echo ""
echo -e "  ${BOLD}Package Details:${NC}"
echo -e "    Name:     ${PACKAGE_NAME}-v${VERSION}.zip"
echo -e "    Size:     $PACKAGE_SIZE"
echo -e "    Location: $DIST_DIR/"
echo ""
echo -e "  ${BOLD}Contents:${NC}"
echo -e "    Agents:   $AGENTS_COUNT files"
echo -e "    Commands: $COMMANDS_COUNT files"
echo ""
echo -e "  ${BOLD}Distribution Files:${NC}"
echo -e "    ${BLUE}→${NC} ${PACKAGE_NAME}-v${VERSION}.zip"
echo -e "    ${BLUE}→${NC} ${PACKAGE_NAME}-v${VERSION}.zip.sha256"
echo -e "    ${BLUE}→${NC} INSTALLER-INFO.txt"
echo ""
echo -e "  ${BOLD}Next Steps:${NC}"
echo -e "    ${BLUE}1.${NC} Test the installer:"
echo -e "       cd dist && unzip ${PACKAGE_NAME}-v${VERSION}.zip"
echo -e "       cd ${PACKAGE_NAME} && bash install-luna.sh"
echo ""
echo -e "    ${BLUE}2.${NC} Try it out:"
echo -e "       cd /your-project"
echo -e "       claude-code --agent ~/luna-agents/luna-requirements-analyzer.md"
echo ""
echo -e "    ${BLUE}3.${NC} Distribute:"
echo -e "       - Upload to GitHub"
echo -e "       - Share the ZIP file"
echo -e "       - Add to marketplace"
echo ""
echo -e "  ${BOLD}🌙 Luna package ready for distribution!${NC}"
echo ""
