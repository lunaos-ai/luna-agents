#!/bin/bash

# Luna Agents - One-Command Setup
# Run this script to build, test, and optionally install Luna

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

clear
echo -e "${BLUE}${BOLD}"
cat << "EOF"
╔════════════════════════════════════════════╗
║                                            ║
║         🌙  Luna Agents Setup              ║
║                                            ║
║     Complete SDLC Automation for Claude    ║
║                                            ║
╚════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo ""

# Step 1: Check prerequisites
echo -e "${BOLD}Step 1: Checking Prerequisites${NC}"
echo -e "${YELLOW}→${NC} Checking required files..."

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

ALL_FOUND=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}✗${NC} Missing: $file"
        ALL_FOUND=false
    fi
done

if [ "$ALL_FOUND" = false ]; then
    echo ""
    echo -e "${RED}Error: Missing required Luna agent files${NC}"
    echo ""
    echo "Please ensure all Luna .md files are in the current directory:"
    for file in "${REQUIRED_FILES[@]}"; do
        echo "  - $file"
    done
    echo ""
    echo "Also needed (if you have them):"
    echo "  - luna-requirements-analyzer.md"
    echo "  - README.md"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} All required files found"
echo ""

# Step 2: Build package
echo -e "${BOLD}Step 2: Building Package${NC}"
echo -e "${YELLOW}→${NC} Running package builder..."
echo ""

if [ ! -f "final_package_builder.sh" ]; then
    echo -e "${RED}✗${NC} final_package_builder.sh not found"
    echo ""
    echo "Please ensure the builder script is in the current directory."
    exit 1
fi

chmod +x final_package_builder.sh
./final_package_builder.sh

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}✗${NC} Package build failed"
    exit 1
fi

echo ""
echo -e "${GREEN}✓${NC} Package built successfully"
echo ""

# Step 3: Offer installation
echo -e "${BOLD}Step 3: Installation${NC}"
echo ""
echo "Would you like to install Luna Agents now?"
echo ""
echo -e "  ${BLUE}1.${NC} Yes, install for me"
echo -e "  ${BLUE}2.${NC} No, I'll install later"
echo ""
read -p "Choice (1 or 2): " install_choice

if [ "$install_choice" = "1" ]; then
    echo ""
    echo -e "${YELLOW}→${NC} Installing Luna Agents..."
    echo ""
    
    cd dist
    unzip -q luna-claude-plugins-v1.0.0.zip
    cd luna-claude-plugins
    bash install-luna.sh
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✓${NC} Installation complete!"
        INSTALLED=true
    else
        echo ""
        echo -e "${RED}✗${NC} Installation failed"
        INSTALLED=false
    fi
    
    cd ../..
else
    echo ""
    echo -e "${YELLOW}⊙${NC} Skipped installation"
    INSTALLED=false
fi

# Step 4: Summary
echo ""
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo -e "${BOLD}                 Summary                   ${NC}"
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo ""

echo -e "${GREEN}✓${NC} Package built successfully"
echo -e "  Location: ${BLUE}dist/luna-claude-plugins-v1.0.0.zip${NC}"
echo ""

if [ "$INSTALLED" = true ]; then
    echo -e "${GREEN}✓${NC} Luna Agents installed"
    echo -e "  Agents:   ${BLUE}~/luna-agents/${NC}"
    echo -e "  Commands: ${BLUE}~/.claude/commands/${NC}"
    echo ""
    echo -e "${BOLD}Next Steps:${NC}"
    echo ""
    echo -e "  ${BLUE}1.${NC} Navigate to a project:"
    echo -e "     ${DIM}cd /path/to/your-project${NC}"
    echo ""
    echo -e "  ${BLUE}2.${NC} Run your first Luna agent:"
    echo -e "     ${DIM}claude-code --agent ~/luna-agents/luna-requirements-analyzer.md${NC}"
    echo ""
    echo -e "  ${BLUE}3.${NC} When prompted:"
    echo -e "     ${DIM}- Press ENTER for project-wide analysis${NC}"
    echo -e "     ${DIM}- Or type a feature name${NC}"
    echo ""
    echo -e "${BOLD}Available Agents:${NC}"
    echo -e "  ${BLUE}~/luna-agents/luna-requirements-analyzer.md${NC}"
    echo -e "  ${BLUE}~/luna-agents/luna-design-architect.md${NC}"
    echo -e "  ${BLUE}~/luna-agents/luna-task-planner.md${NC}"
    echo -e "  ${BLUE}~/luna-agents/luna-task-executor.md${NC}"
    echo -e "  ${BLUE}~/luna-agents/luna-code-review.md${NC}"
    echo -e "  ${BLUE}~/luna-agents/luna-testing-validation.md${NC}"
    echo -e "  ${BLUE}~/luna-agents/luna-deployment.md${NC}"
    echo -e "  ${BLUE}~/luna-agents/luna-documentation.md${NC}"
    echo -e "  ${BLUE}~/luna-agents/luna-monitoring-observability.md${NC}"
    echo -e "  ${BLUE}~/luna-agents/luna-post-launch-review.md${NC}"
    echo ""
    echo -e "${BOLD}Documentation:${NC}"
    echo -e "  ${BLUE}cat ~/.claude/commands/README.md${NC}"
    echo ""
else
    echo -e "${YELLOW}⊙${NC} Luna Agents not installed yet"
    echo ""
    echo -e "${BOLD}To Install:${NC}"
    echo -e "  ${BLUE}cd dist${NC}"
    echo -e "  ${BLUE}unzip luna-claude-plugins-v1.0.0.zip${NC}"
    echo -e "  ${BLUE}cd luna-claude-plugins${NC}"
    echo -e "  ${BLUE}bash install-luna.sh${NC}"
    echo ""
fi

echo -e "${BOLD}Distribution:${NC}"
echo -e "  Share this file: ${BLUE}dist/luna-claude-plugins-v1.0.0.zip${NC}"
echo -e "  Checksum:        ${BLUE}dist/luna-claude-plugins-v1.0.0.zip.sha256${NC}"
echo -e "  Info:            ${BLUE}dist/INSTALLER-INFO.txt${NC}"
echo ""

echo -e "${BOLD}Support:${NC}"
echo -e "  Documentation: ${BLUE}dist/luna-claude-plugins/docs/${NC}"
echo -e "  Commands help: ${BLUE}~/.claude/commands/README.md${NC}"
echo -e "  Uninstall:     ${BLUE}bash ~/luna-agents/uninstall.sh${NC}"
echo ""

echo -e "${GREEN}${BOLD}🌙 Luna Agents setup complete!${NC}"
echo ""

# Optional: Open test project prompt
if [ "$INSTALLED" = true ]; then
    echo ""
    read -p "Would you like to test Luna in a project now? (y/n): " test_choice
    
    if [ "$test_choice" = "y" ] || [ "$test_choice" = "Y" ]; then
        echo ""
        read -p "Enter project path (or press ENTER to skip): " project_path
        
        if [ -n "$project_path" ] && [ -d "$project_path" ]; then
            echo ""
            echo -e "${YELLOW}→${NC} Opening project: $project_path"
            echo ""
            cd "$project_path"
            echo -e "${GREEN}✓${NC} Ready to run Luna agents!"
            echo ""
            echo "Run: ${BLUE}claude-code --agent ~/luna-agents/luna-requirements-analyzer.md${NC}"
            echo ""
        fi
    fi
fi
