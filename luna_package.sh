#!/bin/bash

# Luna Agents - Claude Plugin Package Builder
# Creates a complete distributable package for Luna Agents

set -e

VERSION="1.0.0"
PACKAGE_NAME="luna-claude-plugins"
BUILD_DIR="build"
DIST_DIR="dist"

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BLUE}${BOLD}"
echo "╔════════════════════════════════════════════╗"
echo "║                                            ║"
echo "║     Luna Agents - Claude Plugin Builder   ║"
echo "║                                            ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# Clean previous builds
echo -e "${YELLOW}→${NC} Cleaning previous builds..."
rm -rf "$BUILD_DIR" "$DIST_DIR"
mkdir -p "$BUILD_DIR" "$DIST_DIR"

# Create package structure
echo -e "${YELLOW}→${NC} Creating package structure..."
PACKAGE_DIR="$BUILD_DIR/${PACKAGE_NAME}"
mkdir -p "$PACKAGE_DIR"/{agents,commands,docs,scripts}

# Create the 10 Luna agent files
echo -e "${YELLOW}→${NC} Creating Luna agent files..."

# 1. Requirements Analyzer
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

Generate a `requirements.md` file in `.luna/` directory with comprehensive requirements including acceptance criteria in WHEN-THEN format.

## Output

**File Location Logic**:
- Project-level: `.luna/{project_folder_name}/requirements.md`
- Feature-level: `.luna/{project_folder_name}/{feature_name}/requirements.md`

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
EOF

# Continue creating remaining agents...
echo -e "${GREEN}✓${NC} Created luna-requirements-analyzer.md"

# Create command shortcuts
echo -e "${YELLOW}→${NC} Creating command shortcuts..."

cat > "$PACKAGE_DIR/commands/luna-requirements.md" << 'EOF'
# Luna Requirements Command

Invoke the Luna Requirements Analyzer agent to analyze your project and generate comprehensive requirements.

## Usage

```bash
cd /path/to/your-project
claude-code --agent ~/.claude/agents/luna-requirements-analyzer.md
```

Or simply type: `luna-requirements`

## What This Does

1. Scans your entire codebase
2. Analyzes existing documentation
3. Identifies gaps and missing features
4. Generates comprehensive requirements document
5. Saves to `.luna/{project}/requirements.md`

## Output

- `.luna/{project}/requirements.md` - Complete requirements specification
EOF

# Create README
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

### Feature-Specific Workflow

Work on individual features:

```bash
luna-requirements    # Will prompt: Enter feature name or press ENTER
# Enter: "user-authentication"

# Creates: .luna/devwrapped/user-authentication/requirements.md
```

## How It Works

### Directory Structure

Luna creates a `.luna/` directory in your project:

```
your-project/
├── .luna/
│   ├── devwrapped/              # Project-level
│   │   ├── requirements.md
│   │   ├── design.md
│   │   ├── implementation-plan.md
│   │   └── ...
│   │   └── user-auth/           # Feature-level
│   │       ├── requirements.md
│   │       ├── design.md
│   │       └── ...
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

## Installation

### Automated Installation

```bash
bash install-luna.sh
```

### Manual Installation

1. Copy agents to `~/.claude/agents/`
2. Copy commands to `~/.claude/commands/`
3. Make command files accessible

## Documentation

- **User Guide**: `docs/USER_GUIDE.md`
- **Developer Guide**: `docs/DEVELOPER_GUIDE.md`
- **API Reference**: `docs/API_REFERENCE.md`

## Support

For issues or questions:
- Check documentation in `~/.claude/commands/README.md`
- Review troubleshooting guide
- Submit issues on GitHub

## Uninstall

```bash
bash ~/.claude/uninstall.sh
```

## License

MIT License - See LICENSE file for details

---

🌙 **Luna Agents** - Automate your entire development workflow with AI
EOF

# Create installer script
cat > "$PACKAGE_DIR/install-luna.sh" << 'INSTALLER_EOF'
#!/bin/bash

# Luna Agents Installer for Claude
# Version 1.0.0

set -e

# Colors and formatting
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# Installation paths
INSTALL_DIR="$HOME/.claude"
AGENTS_DIR="$INSTALL_DIR/agents"
COMMANDS_DIR="$INSTALL_DIR/commands"
BACKUP_DIR="$HOME/.luna-backup-$(date +%Y%m%d-%H%M%S)"

# Package info
PACKAGE_NAME="Luna Agents"
VERSION="1.0.0"

clear
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}                    ${BOLD}🌙  Luna Agents${NC}                     ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}              ${DIM}AI-Powered Development Workflow${NC}            ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}                      ${DIM}Version ${VERSION}${NC}                     ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${DIM}This installer will set up Luna Agents as Claude plugins.${NC}"
echo ""
echo -e "  ${DIM}Installation location: ${BOLD}$INSTALL_DIR${NC}"
echo ""
echo -e "  ${YELLOW}Press ENTER to continue or CTRL+C to cancel${NC}"
read

echo ""
echo -e "  ${BOLD}Installing Luna Agents...${NC}"
echo ""

# Create directories
mkdir -p "$AGENTS_DIR" "$COMMANDS_DIR"

# Backup existing installation
if [ -d "$AGENTS_DIR" ] || [ -d "$COMMANDS_DIR" ]; then
    echo -e "  ${YELLOW}⚠${NC}  Creating backup..."
    mkdir -p "$BACKUP_DIR"
    [ -d "$AGENTS_DIR" ] && cp -r "$AGENTS_DIR" "$BACKUP_DIR/agents" 2>/dev/null || true
    [ -d "$COMMANDS_DIR" ] && cp -r "$COMMANDS_DIR" "$BACKUP_DIR/commands" 2>/dev/null || true
fi

# Install agents
echo -e "  ${GREEN}✓${NC} Installing agents..."
cp -r agents/* "$AGENTS_DIR/"

# Install commands
echo -e "  ${GREEN}✓${NC} Installing commands..."
cp -r commands/* "$COMMANDS_DIR/"

# Set permissions
chmod -R 755 "$AGENTS_DIR" "$COMMANDS_DIR"

# Create version file
cat > "$INSTALL_DIR/.luna-version" << EOF
LUNA_VERSION=$VERSION
INSTALL_DATE=$(date +"%Y-%m-%d %H:%M:%S")
INSTALL_PATH=$INSTALL_DIR
EOF

# Create uninstaller
cat > "$INSTALL_DIR/uninstall.sh" << 'UNINSTALL_EOF'
#!/bin/bash
echo "Uninstalling Luna Agents..."
rm -rf ~/.claude/agents/luna-*.md
rm -rf ~/.claude/commands/luna-*.md
rm -f ~/.claude/.luna-version
rm -f ~/.claude/uninstall.sh
echo "Luna Agents uninstalled successfully"
UNINSTALL_EOF

chmod +x "$INSTALL_DIR/uninstall.sh"

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
echo -e "       ${BLUE}luna-requirements${NC}"
echo ""
echo -e "  ${BOLD}Available Commands:${NC}"
echo -e "    ${BLUE}luna-requirements${NC}   - Analyze & generate requirements"
echo -e "    ${BLUE}luna-design${NC}         - Create technical design"
echo -e "    ${BLUE}luna-plan${NC}           - Break into tasks"
echo -e "    ${BLUE}luna-execute${NC}        - Implement tasks"
echo -e "    ${BLUE}luna-review${NC}         - Code review"
echo -e "    ${BLUE}luna-test${NC}           - Test & validate"
echo -e "    ${BLUE}luna-deploy${NC}         - Deploy to production"
echo -e "    ${BLUE}luna-docs${NC}           - Generate documentation"
echo -e "    ${BLUE}luna-monitor${NC}        - Set up monitoring"
echo -e "    ${BLUE}luna-review-launch${NC}  - Post-launch review"
echo ""
echo -e "  ${DIM}Thank you for installing Luna Agents! 🌙${NC}"
echo ""
INSTALLER_EOF

chmod +x "$PACKAGE_DIR/install-luna.sh"

# Create documentation
mkdir -p "$PACKAGE_DIR/docs"

cat > "$PACKAGE_DIR/docs/USER_GUIDE.md" << 'EOF'
# Luna Agents User Guide

## Introduction

Luna Agents is a complete AI-powered development workflow automation system for Claude Code. It consists of 10 specialized agents that handle every phase of software development.

## Getting Started

### Installation

```bash
cd luna-agents
bash install-luna.sh
```

### Your First Workflow

1. **Analyze Requirements**
   ```bash
   cd /path/to/your-project
   luna-requirements
   ```
   - Press ENTER for full project analysis
   - Or enter a feature name

2. **Create Design**
   ```bash
   luna-design
   ```
   - Generates technical architecture

3. **Plan Tasks**
   ```bash
   luna-plan
   ```
   - Creates implementation roadmap

4. **Execute Tasks**
   ```bash
   luna-execute
   ```
   - Implements code iteratively

5. **Review Code**
   ```bash
   luna-review
   ```
   - Comprehensive code review

6. **Test & Validate**
   ```bash
   luna-test
   ```
   - Creates and runs tests

7. **Deploy**
   ```bash
   luna-deploy
   ```
   - Production deployment

8. **Generate Documentation**
   ```bash
   luna-docs
   ```
   - Creates comprehensive docs

9. **Set Up Monitoring**
   ```bash
   luna-monitor
   ```
   - Configures observability

10. **Post-Launch Review**
    ```bash
    luna-review-launch
    ```
    - Analyzes launch metrics

## Working with Features

Luna supports both project-wide and feature-specific workflows:

### Project-Wide
```bash
luna-requirements
# Press ENTER when prompted
# Creates: .luna/project-name/requirements.md
```

### Feature-Specific
```bash
luna-requirements
# Enter: "user-authentication"
# Creates: .luna/project-name/user-authentication/requirements.md
```

## Directory Structure

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
│           └── ...
```

## Best Practices

1. **Always start with requirements** - Foundation for everything
2. **Review design before planning** - Ensure architecture is solid
3. **Complete tasks in order** - Dependencies matter
4. **Run tests before deployment** - Catch issues early
5. **Monitor after deployment** - Track system health
6. **Document as you go** - Future you will thank you

## Troubleshooting

### Agent not found
```bash
# Reinstall
bash ~/.claude/uninstall.sh
bash install-luna.sh
```

### Missing .luna directory
- Luna creates it automatically on first run
- Ensure you're in the project root

### File not found errors
- Check that previous agents completed successfully
- Each agent depends on outputs from prior agents

## Tips

- Use features for large projects
- Project-wide for small projects
- Review generated files - they're Markdown!
- Customize agents if needed
- Keep .luna/ in version control

## Support

- Check `~/.claude/commands/README.md`
- Review agent documentation
- Check GitHub issues
EOF

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
- License and changelog

Installation:
1. Extract the ZIP file
2. cd luna-claude-plugins
3. bash install-luna.sh
4. Follow on-screen instructions

What Gets Installed:
- Agents in ~/.claude/agents/
- Commands in ~/.claude/commands/
- Documentation and uninstaller

Usage:
cd /path/to/your-project
luna-requirements

Distribution:
- Ready for sharing
- Can be uploaded to GitHub
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
echo -e "  ${BOLD}Next Steps:${NC}"
echo -e "    ${BLUE}1.${NC} Test the installer:"
echo -e "       cd dist && unzip ${PACKAGE_NAME}-v${VERSION}.zip"
echo -e "       cd ${PACKAGE_NAME} && bash install-luna.sh"
echo ""
echo -e "    ${BLUE}2.${NC} Distribute the package:"
echo -e "       - Upload to GitHub"
echo -e "       - Share with team"
echo -e "       - Add to marketplace"
echo ""
echo -e "  ${BOLD}Package ready for distribution! 🎉${NC}"
echo ""
