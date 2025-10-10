#!/bin/bash

# Luna Agents - Package Builder
# Creates distributable packages for Luna Agents

set -e

VERSION="1.0.0"
PACKAGE_NAME="luna-agents"
BUILD_DIR="build"
DIST_DIR="dist"

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BLUE}${BOLD}"
echo "╔════════════════════════════════════════════╗"
echo "║                                            ║"
echo "║        Luna Agents Package Builder         ║"
echo "║                                            ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# Clean previous builds
echo -e "${YELLOW}→${NC} Cleaning previous builds..."
rm -rf "$BUILD_DIR"
rm -rf "$DIST_DIR"
mkdir -p "$BUILD_DIR"
mkdir -p "$DIST_DIR"

# Create package structure
echo -e "${YELLOW}→${NC} Creating package structure..."
PACKAGE_DIR="$BUILD_DIR/${PACKAGE_NAME}-installer"
mkdir -p "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR/agents"
mkdir -p "$PACKAGE_DIR/commands"
mkdir -p "$PACKAGE_DIR/docs"

# Copy installer script
echo -e "${YELLOW}→${NC} Copying installer script..."
cp install-luna.sh "$PACKAGE_DIR/"
chmod +x "$PACKAGE_DIR/install-luna.sh"

# Copy agents
echo -e "${YELLOW}→${NC} Copying agent files..."
if [ ! -d "agents" ] || [ -z "$(ls -A agents/*.md 2>/dev/null)" ]; then
    echo -e "${YELLOW}⚠${NC}  No agent files found in agents/ directory"
    echo -e "   Please ensure all 10 Luna agent .md files are in the agents/ folder"
    exit 1
fi
cp agents/*.md "$PACKAGE_DIR/agents/" 2>/dev/null || true

# Copy commands
echo -e "${YELLOW}→${NC} Copying command files..."
if [ ! -d "commands" ] || [ -z "$(ls -A commands/*.md 2>/dev/null)" ]; then
    echo -e "${YELLOW}⚠${NC}  No command files found in commands/ directory"
    echo -e "   Please ensure all 11 command .md files are in the commands/ folder"
    exit 1
fi
cp commands/*.md "$PACKAGE_DIR/commands/" 2>/dev/null || true

# Copy documentation
echo -e "${YELLOW}→${NC} Creating documentation..."

# Package README
cat > "$PACKAGE_DIR/README.md" << 'EOF'
# Luna Agents Installer

## Quick Install

```bash
bash install-luna.sh
```

## What Gets Installed

- 10 Luna agent files in `~/.claude/agents/`
- 11 command shortcuts in `~/.claude/commands/`
- Version information and uninstaller

## Usage

After installation, run Luna commands from any project:

```bash
cd /path/to/your-project
luna-requirements
luna-design
luna-plan
```

See the complete documentation in `~/.claude/commands/README.md` after installation.

## System Requirements

- macOS 10.15 or later
- Claude Code installed
- 50MB free disk space

## Support

For issues or questions, check the troubleshooting section in the README.md file installed at `~/.claude/commands/README.md`.
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

# Create CHANGELOG
cat > "$PACKAGE_DIR/CHANGELOG.md" << EOF
# Changelog

## [1.0.0] - $(date +%Y-%m-%d)

### Added
- Initial release of Luna Agents
- 10 specialized AI agents for complete SDLC automation
- 11 command shortcuts for easy access
- Professional macOS-style installer with progress bars
- Automatic backup of existing installations
- Complete documentation
- Uninstaller script

### Features
- Requirements Analysis Agent
- Design Architect Agent
- Task Planning Agent
- Task Execution Agent
- Code Review Agent
- Testing & Validation Agent
- Deployment Agent
- Documentation Agent
- Monitoring & Observability Agent
- Post-Launch Review Agent
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

# Create ZIP package
echo -e "${YELLOW}→${NC} Creating ZIP package..."
cd "$BUILD_DIR"
zip -r "../$DIST_DIR/${PACKAGE_NAME}-v${VERSION}.zip" "${PACKAGE_NAME}-installer" > /dev/null
cd ..

# Calculate package size
PACKAGE_SIZE=$(du -h "$DIST_DIR/${PACKAGE_NAME}-v${VERSION}.zip" | cut -f1)

# Create installer info file
cat > "$DIST_DIR/INSTALLER-INFO.txt" << EOF
Luna Agents Installer Package
==============================

Version: $VERSION
Package: ${PACKAGE_NAME}-v${VERSION}.zip
Size: $PACKAGE_SIZE
Built: $(date)

Contents:
- 10 Luna Agent files
- 11 Command shortcut files
- Professional installer script
- Complete documentation
- License and changelog

Installation:
1. Extract the ZIP file
2. Run: bash install-luna.sh
3. Follow on-screen instructions

Distribution:
- This package is ready for distribution
- Can be shared/sold as a complete product
- Includes professional installer with progress bars
- Automatic backup and uninstall features
EOF

# Create checksum
echo -e "${YELLOW}→${NC} Generating checksums..."
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
echo -e "       cd ${PACKAGE_NAME}-installer && bash install-luna.sh"
echo ""
echo -e "    ${BLUE}2.${NC} Distribute the package:"
echo -e "       - Upload to your website"
echo -e "       - Share on marketplace"
echo -e "       - Sell as a product"
echo ""
echo -e "  ${BOLD}Package is ready for distribution! 🎉${NC}"
echo ""