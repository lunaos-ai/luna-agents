#!/bin/bash

# Luna Agents Installer
# Professional macOS-style installation script
# Version 1.0.0

set -e

# Colors and formatting
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m' # No Color

# Installation paths
INSTALL_DIR="$HOME/.claude"
AGENTS_DIR="$INSTALL_DIR/agents"
COMMANDS_DIR="$INSTALL_DIR/commands"
BACKUP_DIR="$HOME/.luna-backup-$(date +%Y%m%d-%H%M%S)"

# Package info
PACKAGE_NAME="Luna Agents"
VERSION="1.0.0"
VENDOR="Luna Development"
TOTAL_STEPS=8

# Clear screen and show header
clear_screen() {
    clear
    echo ""
}

# Print centered text
print_centered() {
    local text="$1"
    local width=$(tput cols)
    local padding=$(( (width - ${#text}) / 2 ))
    printf "%${padding}s%s\n" "" "$text"
}

# Show welcome screen
show_welcome() {
    clear_screen
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}                                                            ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}                    ${BOLD}🌙  Luna Agents${NC}                     ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}                                                            ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}              ${DIM}AI-Powered Development Workflow${NC}            ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}                                                            ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}                      ${DIM}Version ${VERSION}${NC}                     ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}                                                            ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${DIM}This installer will set up Luna Agents on your system.${NC}"
    echo ""
    echo -e "  ${DIM}Installation location: ${BOLD}$INSTALL_DIR${NC}"
    echo ""
    echo -e "  ${YELLOW}Press ENTER to continue or CTRL+C to cancel${NC}"
    read
}

# Animated progress bar
progress_bar() {
    local current=$1
    local total=$2
    local status=$3
    local width=50
    local percentage=$((current * 100 / total))
    local completed=$((width * current / total))
    local remaining=$((width - completed))
    
    printf "\r  ["
    printf "%${completed}s" | tr ' ' '█'
    printf "%${remaining}s" | tr ' ' '░'
    printf "] %3d%% - %s" "$percentage" "$status"
}

# Spinner animation
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local temp
    
    while ps -p $pid > /dev/null 2>&1; do
        temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# Check system requirements
check_requirements() {
    local step=1
    progress_bar $step $TOTAL_STEPS "Checking system requirements..."
    echo ""
    
    # Check if running on macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo -e "\n  ${RED}✗${NC} This installer is designed for macOS"
        echo -e "  ${DIM}Please install manually on your system${NC}\n"
        exit 1
    fi
    
    # Check for required commands
    local required_commands=("curl" "git")
    for cmd in "${required_commands[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            echo -e "\n  ${RED}✗${NC} Required command not found: ${BOLD}$cmd${NC}"
            exit 1
        fi
    done
    
    echo -e "\n  ${GREEN}✓${NC} System requirements met"
    sleep 0.5
}

# Backup existing installation
backup_existing() {
    local step=2
    progress_bar $step $TOTAL_STEPS "Checking for existing installation..."
    echo ""
    
    if [ -d "$AGENTS_DIR" ] || [ -d "$COMMANDS_DIR" ]; then
        echo -e "\n  ${YELLOW}⚠${NC}  Existing Luna installation detected"
        echo -e "  ${DIM}Creating backup at: $BACKUP_DIR${NC}"
        
        mkdir -p "$BACKUP_DIR"
        
        if [ -d "$AGENTS_DIR" ]; then
            cp -r "$AGENTS_DIR" "$BACKUP_DIR/agents" 2>/dev/null || true
        fi
        
        if [ -d "$COMMANDS_DIR" ]; then
            cp -r "$COMMANDS_DIR" "$BACKUP_DIR/commands" 2>/dev/null || true
        fi
        
        echo -e "  ${GREEN}✓${NC} Backup created successfully"
    else
        echo -e "\n  ${GREEN}✓${NC} No existing installation found"
    fi
    sleep 0.5
}

# Create directory structure
create_directories() {
    local step=3
    progress_bar $step $TOTAL_STEPS "Creating directory structure..."
    echo ""
    
    mkdir -p "$AGENTS_DIR"
    mkdir -p "$COMMANDS_DIR"
    
    echo -e "\n  ${GREEN}✓${NC} Directories created"
    echo -e "    ${DIM}→ $AGENTS_DIR${NC}"
    echo -e "    ${DIM}→ $COMMANDS_DIR${NC}"
    sleep 0.5
}

# Install agents
install_agents() {
    local step=4
    progress_bar $step $TOTAL_STEPS "Installing Luna agents..."
    echo ""
    
    local agents=(
        "luna-requirements-analyzer.md"
        "luna-design-architect.md"
        "luna-task-planner.md"
        "luna-task-executor.md"
        "luna-code-review.md"
        "luna-testing-validation.md"
        "luna-deployment.md"
        "luna-documentation.md"
        "luna-monitoring-observability.md"
        "luna-post-launch-review.md"
    )
    
    local count=0
    local total=${#agents[@]}
    
    for agent in "${agents[@]}"; do
        count=$((count + 1))
        if [ -f "agents/$agent" ]; then
            cp "agents/$agent" "$AGENTS_DIR/"
            printf "\r  ${GREEN}✓${NC} Installing agents... (%d/%d) %s" $count $total "$agent"
        else
            echo -e "\n  ${RED}✗${NC} Agent file not found: $agent"
            exit 1
        fi
    done
    
    echo -e "\n  ${GREEN}✓${NC} All agents installed successfully"
    sleep 0.5
}

# Install commands
install_commands() {
    local step=5
    progress_bar $step $TOTAL_STEPS "Installing command shortcuts..."
    echo ""
    
    local commands=(
        "README.md"
        "luna-requirements.md"
        "luna-design.md"
        "luna-plan.md"
        "luna-execute.md"
        "luna-review.md"
        "luna-test.md"
        "luna-deploy.md"
        "luna-docs.md"
        "luna-monitor.md"
        "luna-review-launch.md"
    )
    
    local count=0
    local total=${#commands[@]}
    
    for cmd in "${commands[@]}"; do
        count=$((count + 1))
        if [ -f "commands/$cmd" ]; then
            cp "commands/$cmd" "$COMMANDS_DIR/"
            printf "\r  ${GREEN}✓${NC} Installing commands... (%d/%d) %s" $count $total "$cmd"
        else
            echo -e "\n  ${RED}✗${NC} Command file not found: $cmd"
            exit 1
        fi
    done
    
    echo -e "\n  ${GREEN}✓${NC} All commands installed successfully"
    sleep 0.5
}

# Set permissions
set_permissions() {
    local step=6
    progress_bar $step $TOTAL_STEPS "Setting permissions..."
    echo ""
    
    chmod -R 755 "$AGENTS_DIR"
    chmod -R 755 "$COMMANDS_DIR"
    
    echo -e "\n  ${GREEN}✓${NC} Permissions configured"
    sleep 0.5
}

# Verify installation
verify_installation() {
    local step=7
    progress_bar $step $TOTAL_STEPS "Verifying installation..."
    echo ""
    
    local agents_count=$(find "$AGENTS_DIR" -name "*.md" | wc -l | tr -d ' ')
    local commands_count=$(find "$COMMANDS_DIR" -name "*.md" | wc -l | tr -d ' ')
    
    if [ "$agents_count" -eq 10 ] && [ "$commands_count" -eq 11 ]; then
        echo -e "\n  ${GREEN}✓${NC} Installation verified"
        echo -e "    ${DIM}→ 10 agents installed${NC}"
        echo -e "    ${DIM}→ 11 commands installed${NC}"
    else
        echo -e "\n  ${RED}✗${NC} Verification failed"
        echo -e "    ${DIM}Expected: 10 agents, 11 commands${NC}"
        echo -e "    ${DIM}Found: $agents_count agents, $commands_count commands${NC}"
        exit 1
    fi
    sleep 0.5
}

# Final setup
final_setup() {
    local step=8
    progress_bar $step $TOTAL_STEPS "Finalizing installation..."
    echo ""
    
    # Create version file
    cat > "$INSTALL_DIR/.luna-version" << EOF
LUNA_VERSION=$VERSION
INSTALL_DATE=$(date +"%Y-%m-%d %H:%M:%S")
INSTALL_PATH=$INSTALL_DIR
EOF
    
    # Create uninstaller
    cat > "$INSTALL_DIR/uninstall.sh" << 'EOF'
#!/bin/bash
echo "Uninstalling Luna Agents..."
rm -rf ~/.claude/agents/luna-*.md
rm -rf ~/.claude/commands/luna-*.md
rm -rf ~/.claude/commands/README.md
rm -f ~/.claude/.luna-version
rm -f ~/.claude/uninstall.sh
echo "Luna Agents uninstalled successfully"
EOF
    
    chmod +x "$INSTALL_DIR/uninstall.sh"
    
    echo -e "\n  ${GREEN}✓${NC} Installation complete"
    sleep 0.5
}

# Show success screen
show_success() {
    clear_screen
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}                                                            ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}                 ${BOLD}✓  Installation Complete${NC}               ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}                                                            ${GREEN}║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${BOLD}Luna Agents ${VERSION} has been successfully installed!${NC}"
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
    echo -e "  ${BOLD}Documentation:${NC}"
    echo -e "    ${DIM}Read the complete guide:${NC}"
    echo -e "    ${BLUE}cat ~/.claude/commands/README.md${NC}"
    echo ""
    echo -e "  ${BOLD}Installation Details:${NC}"
    echo -e "    ${DIM}Agents:    ${AGENTS_DIR}${NC}"
    echo -e "    ${DIM}Commands:  ${COMMANDS_DIR}${NC}"
    if [ -d "$BACKUP_DIR" ]; then
        echo -e "    ${DIM}Backup:    ${BACKUP_DIR}${NC}"
    fi
    echo ""
    echo -e "  ${BOLD}Uninstall:${NC}"
    echo -e "    ${BLUE}bash ~/.claude/uninstall.sh${NC}"
    echo ""
    echo -e "  ${DIM}Thank you for installing Luna Agents! 🌙${NC}"
    echo ""
}

# Main installation flow
main() {
    show_welcome
    
    echo ""
    echo -e "  ${BOLD}Installation Progress:${NC}"
    echo ""
    
    check_requirements
    backup_existing
    create_directories
    install_agents
    install_commands
    set_permissions
    verify_installation
    final_setup
    
    echo ""
    echo ""
    
    show_success
}

# Run installer
main