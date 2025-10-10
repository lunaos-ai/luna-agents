#!/bin/bash

# Luna Agent File Extractor
# Extracts all Luna agent files from the source documents

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🌙 Luna Agent File Extractor${NC}"
echo ""

# Create directory structure
mkdir -p luna-agents/{agents,commands,docs}

echo -e "${YELLOW}→${NC} Creating agent files..."

# Array of agent files to create
declare -A agents=(
    ["luna-requirements-analyzer"]="Requirements Analysis"
    ["luna-design-architect"]="Design Architect"
    ["luna-task-planner"]="Task Planning"
    ["luna-task-executor"]="Task Execution"
    ["luna-code-review"]="Code Review"
    ["luna-testing-validation"]="Testing and Validation"
    ["luna-deployment"]="Deployment"
    ["luna-documentation"]="Documentation"
    ["luna-monitoring-observability"]="Monitoring and Observability"
    ["luna-post-launch-review"]="Post-Launch Review"
)

# Create each agent file with the proper header
for agent in "${!agents[@]}"; do
    desc="${agents[$agent]}"
    
    cat > "luna-agents/agents/${agent}.md" << EOF
# Luna ${desc} Agent

## Role
You are a senior professional specialized in ${desc,,}. [Role description varies by agent]

## Initial Setup

### Feature/Project Context
**IMPORTANT**: When this agent is invoked, it MUST first ask the user:

\`\`\`
🎯 Feature/Project Scope
Please specify the scope for this ${desc,,}:
- Press ENTER for entire project (will use project folder name)
- Or enter a feature name (e.g., "user-authentication", "payment-integration")

Feature name: _
\`\`\`

### Directory Structure Logic

**If user presses ENTER (blank)**:
- Scope: Entire project
- Directory: \`.luna/{project_folder_name}/\`

**If user enters a feature name**:
- Scope: Specific feature
- Directory: \`.luna/{project_folder_name}/{feature_name}/\`

### Directory Validation
Before starting, verify required files exist in appropriate location

## Input
- Previous Luna files as needed
- Source code and documentation
- Project context

**Note**: {project} is the project folder name, {feature} is optional feature subfolder

## Workflow

[Agent-specific workflow phases go here]

## Output

**File Location Logic**:
- Project-level: \`.luna/{project_folder_name}/[output-file].md\`
- Feature-level: \`.luna/{project_folder_name}/{feature_name}/[output-file].md\`

## Instructions for Execution

1. **Prompt user for feature/project scope** and wait for input
2. **Determine project folder name** from current directory
3. **Validate required files exist** in \`.luna/{project}/{feature}/\`
4. [Agent-specific steps]
5. Generate comprehensive output
6. **Save to appropriate location**: \`.luna/{project}/{feature}/[output].md\`
7. Provide summary to user

### Scope Considerations for Features
If working on a specific feature:
- Focus on feature-specific work
- Ensure integration with existing system
- Keep scope manageable and focused

## Constraints

[Agent-specific constraints]

## Success Criteria

[Agent-specific success criteria]
EOF

    echo -e "${GREEN}✓${NC} Created ${agent}.md"
done

# Create command files
echo ""
echo -e "${YELLOW}→${NC} Creating command shortcuts..."

declare -A commands=(
    ["luna-requirements"]="requirements-analyzer"
    ["luna-design"]="design-architect"
    ["luna-plan"]="task-planner"
    ["luna-execute"]="task-executor"
    ["luna-review"]="code-review"
    ["luna-test"]="testing-validation"
    ["luna-deploy"]="deployment"
    ["luna-docs"]="documentation"
    ["luna-monitor"]="monitoring-observability"
    ["luna-review-launch"]="post-launch-review"
)

for cmd in "${!commands[@]}"; do
    agent="${commands[$cmd]}"
    
    cat > "luna-agents/commands/${cmd}.md" << EOF
# ${cmd^} Command

Invoke the Luna ${agent} agent.

## Usage

\`\`\`bash
cd /path/to/your-project
claude-code --agent ~/.claude/agents/luna-${agent}.md
\`\`\`

Or simply type: \`${cmd}\`

## What This Does

[Command-specific description]

## Output

[Expected output files and locations]
EOF

    echo -e "${GREEN}✓${NC} Created ${cmd}.md"
done

# Create main README
cat > "luna-agents/commands/README.md" << 'EOF'
# Luna Commands Reference

Quick reference for all Luna commands.

## Available Commands

| Command | Description | Output File |
|---------|-------------|-------------|
| `luna-requirements` | Analyze project and generate requirements | `requirements.md` |
| `luna-design` | Create technical design | `design.md` |
| `luna-plan` | Break design into tasks | `implementation-plan.md` |
| `luna-execute` | Implement tasks | Updates `implementation-plan.md` |
| `luna-review` | Perform code review | `code-review-report.md` |
| `luna-test` | Test and validate | `test-validation-report.md` |
| `luna-deploy` | Deploy to production | `deployment-report.md` |
| `luna-docs` | Generate documentation | `docs/` directory |
| `luna-monitor` | Set up monitoring | `monitoring-observability-report.md` |
| `luna-review-launch` | Post-launch review | `post-launch-review.md` |

## Usage Pattern

```bash
cd /path/to/your-project

# Full workflow
luna-requirements    # Start here
luna-design          # Then design
luna-plan            # Plan implementation
luna-execute         # Execute tasks
luna-review          # Review code
luna-test            # Test thoroughly
luna-deploy          # Deploy safely
luna-docs            # Document everything
luna-monitor         # Monitor production
luna-review-launch   # Review and improve
```

## Working with Features

Each command will prompt you:
- Press ENTER for project-wide work
- Enter feature name for feature-specific work

## File Locations

All Luna files are stored in `.luna/` directory:

```
.luna/
└── project-name/
    ├── requirements.md
    ├── design.md
    └── ...
    └── feature-name/
        ├── requirements.md
        └── ...
```

## Tips

- Always start with `luna-requirements`
- Review generated files before proceeding
- Keep `.luna/` in version control
- Use features for large projects
EOF

echo -e "${GREEN}✓${NC} Created README.md"

# Create documentation
echo ""
echo -e "${YELLOW}→${NC} Creating documentation..."

cat > "luna-agents/docs/QUICK_START.md" << 'EOF'
# Luna Agents Quick Start

## Installation

```bash
bash install-luna.sh
```

## First Use

```bash
cd /path/to/your-project
luna-requirements
```

When prompted:
- Press **ENTER** for full project analysis
- Or type a **feature name** (e.g., "user-auth")

## Full Workflow

```bash
luna-requirements    # Generate requirements
luna-design          # Create technical design
luna-plan            # Break into tasks
luna-execute         # Implement code
luna-review          # Review code quality
luna-test            # Test and validate
luna-deploy          # Deploy to production
luna-docs            # Generate documentation
luna-monitor         # Set up monitoring
luna-review-launch   # Review launch
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
├── package.json
└── ...
```

## Next Steps

- Read generated requirements
- Review technical design
- Follow implementation plan
- Deploy with confidence!

🌙 Happy coding with Luna!
EOF

# Create summary
echo ""
echo -e "${GREEN}${BOLD}✓ Extraction complete!${NC}"
echo ""
echo -e "  ${BOLD}Created Structure:${NC}"
echo -e "    luna-agents/"
echo -e "    ├── agents/          (10 agent files)"
echo -e "    ├── commands/        (11 command files)"
echo -e "    └── docs/            (documentation)"
echo ""
echo -e "  ${BOLD}Next Steps:${NC}"
echo -e "    ${BLUE}1.${NC} Review the generated files in luna-agents/"
echo -e "    ${BLUE}2.${NC} Customize agent files with full content from your documents"
echo -e "    ${BLUE}3.${NC} Run the package builder: bash luna_package_builder.sh"
echo ""
