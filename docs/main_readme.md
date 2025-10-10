# 🌙 Luna Agents - Claude Plugin Package

Complete AI-powered development workflow automation for Claude.

## Overview

Luna Agents is a comprehensive SDLC automation system consisting of 10 specialized AI agents that handle every phase of software development - from requirements to post-launch review.

## What's Included

### 10 Specialized Agents

1. **Requirements Analyzer** - Scans codebases and generates comprehensive requirements
2. **Design Architect** - Creates detailed technical design specifications
3. **Task Planner** - Breaks designs into ordered, actionable tasks
4. **Task Executor** - Implements code following the plan iteratively
5. **Code Reviewer** - Performs thorough code reviews with security and performance analysis
6. **Testing & Validation** - Creates and executes comprehensive test suites
7. **Deployment** - Handles safe production deployments with rollback
8. **Documentation** - Generates complete project documentation
9. **Monitoring & Observability** - Sets up monitoring, dashboards, and alerts
10. **Post-Launch Review** - Analyzes launch metrics and provides improvement recommendations

### Command Shortcuts

11 easy-to-use commands for invoking agents:
- `luna-requirements`
- `luna-design`
- `luna-plan`
- `luna-execute`
- `luna-review`
- `luna-test`
- `luna-deploy`
- `luna-docs`
- `luna-monitor`
- `luna-review-launch`

## Quick Start

### 1. Build the Package

```bash
# Run the complete setup script
bash complete_luna_setup.sh
```

This creates a complete `luna-package/` directory with everything needed.

### 2. Install

```bash
cd luna-package
bash install-luna.sh
```

### 3. Use

```bash
cd /path/to/your-project
luna-requirements
```

When prompted:
- Press **ENTER** for full project analysis
- Or enter a **feature name** (e.g., "user-authentication")

## How It Works

### Directory Structure

Luna creates a `.luna/` directory in your project:

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
│       └── feature-name/           # Feature-specific
│           ├── requirements.md
│           ├── design.md
│           └── ...
├── src/
├── package.json
└── ...
```

### Typical Workflow

```bash
cd /your-project

# 1. Requirements & Planning
luna-requirements    # Analyze codebase, generate requirements
luna-design          # Create technical design
luna-plan            # Break into tasks

# 2. Implementation
luna-execute         # Implement tasks iteratively

# 3. Quality Assurance
luna-review          # Comprehensive code review
luna-test            # Test and validate

# 4. Deployment
luna-deploy          # Deploy to production
luna-monitor         # Set up monitoring

# 5. Documentation & Review
luna-docs            # Generate documentation
luna-review-launch   # Post-launch analysis
```

## Key Features

### 🎯 Scope Control

Every agent asks for scope:
- **Project-wide**: Press ENTER (analyzes entire project)
- **Feature-specific**: Enter feature name (focused analysis)

### 📁 Smart File Organization

All Luna files are organized by project and feature:
```
.luna/
└── {project}/
    ├── [project-level files]
    └── {feature}/
        └── [feature-level files]
```

### 🔄 Sequential Workflow

Each agent builds on previous outputs:
- Requirements → Design → Plan → Execute → Review → Test → Deploy → Monitor → Document → Review Launch

### ✅ Quality Gates

Built-in quality checks:
- 80%+ code coverage required
- Security vulnerability scanning
- Performance validation
- Accessibility compliance

### 📊 Comprehensive Documentation

Every agent generates detailed Markdown reports with:
- Executive summaries
- Detailed findings
- Actionable recommendations
- Clear next steps

## Working with Features

For large projects, work on features independently:

```bash
# Feature 1: Authentication
luna-requirements    # Enter: "authentication"
luna-design          # Enter: "authentication"
luna-plan            # Enter: "authentication"
luna-execute         # Enter: "authentication"

# Feature 2: Payments (parallel development)
luna-requirements    # Enter: "payments"
luna-design          # Enter: "payments"
# ... continue
```

## Files in This Repository

### Source Files (Your Documents)

- `luna-testing-validation.md` - Testing agent source
- `luna-task-planner.md` - Planning agent source
- `luna-task-executor.md` - Execution agent source
- `luna-requirements-analyzer.md` - Requirements agent source
- `luna-post-launch-review.md` - Review agent source
- `luna-monitoring-observability.md` - Monitoring agent source
- `luna-documentation.md` - Documentation agent source
- `luna-design-architect.md` - Design agent source
- `luna-deployment.md` - Deployment agent source
- `luna-code-review.md` - Review agent source
- `luna-complete-bundle.md` - Complete bundle

### Build Scripts

- `complete_luna_setup.sh` - **Main setup script** (run this first)
- `luna_build_package.sh` - Package builder
- `luna_installer_main.sh` - Installer template

### Generated Artifacts

After running `complete_luna_setup.sh`, you'll have:
- `luna-package/` - Complete installable package
  - `agents/` - 10 agent files
  - `commands/` - 11 command files
  - `docs/` - Complete documentation
  - `install-luna.sh` - Installer script

## Installation

### Option 1: Complete Setup (Recommended)

```bash
# 1. Run complete setup
bash complete_luna_setup.sh

# 2. Install
cd luna-package
bash install-luna.sh

# 3. Done! Try it:
cd /your-project
luna-requirements
```

### Option 2: Manual Setup

```bash
# 1. Create package directory
mkdir -p luna-package/{agents,commands,docs}

# 2. Copy agent files
cp luna-*.md luna-package/agents/

# 3. Create command shortcuts (see commands/ directory)

# 4. Run installer
bash luna-package/install-luna.sh
```

## Distribution

### Create Distributable Package

```bash
cd luna-package
bash scripts/build-package.sh
```

This creates:
- `dist/luna-claude-plugins-v1.0.0.zip` - Distributable package
- `dist/luna-claude-plugins-v1.0.0.zip.sha256` - Checksum
- `dist/INSTALLER-INFO.txt` - Distribution info

### Share the Package

```bash
# Upload to GitHub
gh release create v1.0.0 dist/*.zip

# Or share directly
cp dist/luna-claude-plugins-v1.0.0.zip /path/to/share/
```

### Users Install

```bash
# Download and extract
unzip luna-claude-plugins-v1.0.0.zip
cd luna-claude-plugins
bash install-luna.sh
```

## Documentation

After installation, comprehensive documentation is available:

- **User Guide**: `~/.claude/commands/README.md`
- **API Reference**: Check individual agent files
- **Quick Reference**: Run `luna-requirements --help` (if implemented)

## System Requirements

- **OS**: macOS 10.15 or later
- **Claude Code**: Installed and configured
- **Disk Space**: ~50MB
- **Dependencies**: bash, git, curl (standard on macOS)

## Troubleshooting

### Command not found

```bash
# Reinstall
bash ~/.claude/uninstall.sh
cd luna-package && bash install-luna.sh
```

### Permission denied

```bash
chmod +x ~/.claude/agents/*.md
chmod +x ~/.claude/commands/*.md
```

### Agent not responding

```bash
# Try direct invocation
claude-code --agent ~/.claude/agents/luna-requirements-analyzer.md
```

## Advanced Usage

### Custom Agent Modifications

Agents are Markdown files - edit them!

```bash
vim ~/.claude/agents/luna-requirements-analyzer.md
```

### Environment Variables

Skip prompts for automation:

```bash
export LUNA_SCOPE="project"
luna-requirements  # Auto-uses project scope
```

### CI/CD Integration

```yaml
# .github/workflows/luna.yml
name: Luna Analysis
on: [push]
jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Luna
        run: |
          export LUNA_SCOPE="project"
          luna-requirements
```

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License - See LICENSE file for details

## Support

- **Documentation**: Check `luna-package/docs/`
- **Issues**: Submit on GitHub
- **Community**: Join Discord/Slack
- **Email**: support@luna-agents.dev

## Roadmap

- [ ] VS Code extension
- [ ] Web dashboard for .luna files