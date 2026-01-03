#!/bin/bash

# Luna Auto-Execute Installation Script
# Sets up the luna-execute-auto command for system-wide use

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="$HOME/.local/bin"

echo "🔧 Installing luna-execute-auto command..."

# Create installation directory if it doesn't exist
mkdir -p "$INSTALL_DIR"

# Create symbolic link to the command
ln -sf "$SCRIPT_DIR/bin/luna-execute-auto" "$INSTALL_DIR/luna-execute-auto"

# Make sure it's executable
chmod +x "$INSTALL_DIR/luna-execute-auto"

# Add to PATH if not already there
SHELL_PROFILE=""
if [ -n "$BASH_VERSION" ]; then
    SHELL_PROFILE="$HOME/.bashrc"
elif [ -n "$ZSH_VERSION" ]; then
    SHELL_PROFILE="$HOME/.zshrc"
fi

if [ -n "$SHELL_PROFILE" ] && [ -f "$SHELL_PROFILE" ]; then
    if ! grep -q "$INSTALL_DIR" "$SHELL_PROFILE"; then
        echo "" >> "$SHELL_PROFILE"
        echo "# Luna Auto-Execute" >> "$SHELL_PROFILE"
        echo "export PATH=\"\$PATH:$INSTALL_DIR\"" >> "$SHELL_PROFILE"
        echo "✅ Added to PATH in $SHELL_PROFILE"
    fi
fi

echo "✅ Installation completed!"
echo ""
echo "📋 Usage:"
echo "  luna-execute-auto                    # Execute all remaining tasks"
echo "  luna-execute-auto --continue         # Continue from where we left off"
echo "  luna-execute-auto --dry-run          # Show execution plan only"
echo "  luna-execute-auto --max-tasks 5      # Execute only next 5 tasks"
echo ""
echo "📖 For more options, run:"
echo "  luna-execute-auto --help"
echo ""
echo "🔄 To use the new PATH, run:"
echo "  source $SHELL_PROFILE"
echo ""
echo "or start a new terminal session."