#!/bin/bash
# Setup script for op-deployer
# Downloads pre-built op-deployer binary from GitHub releases

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOYER_VERSION="${DEPLOYER_VERSION:-v0.6.0}"
BIN_DIR="$SCRIPT_DIR/bin"

echo "=== OP Deployer Setup ==="
echo "Version: $DEPLOYER_VERSION"
echo ""

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$ARCH" in
    x86_64|amd64)
        ARCH="amd64"
        ;;
    arm64|aarch64)
        ARCH="arm64"
        ;;
    *)
        echo "Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

case "$OS" in
    linux)
        PLATFORM="linux-$ARCH"
        ;;
    darwin)
        PLATFORM="darwin-$ARCH"
        ;;
    *)
        echo "Unsupported OS: $OS"
        exit 1
        ;;
esac

echo "Detected platform: $PLATFORM"

# Create bin directory
mkdir -p "$BIN_DIR"

# Download URL
DOWNLOAD_URL="https://github.com/ethereum-optimism/optimism/releases/download/op-deployer/$DEPLOYER_VERSION/op-deployer-${DEPLOYER_VERSION#v}-$PLATFORM.tar.gz"

echo "Downloading op-deployer..."
echo "URL: $DOWNLOAD_URL"

if ! curl -L --progress-bar -o "/tmp/op-deployer.tar.gz" "$DOWNLOAD_URL"; then
    echo "Failed to download op-deployer"
    exit 1
fi

# Extract
echo "Extracting..."
tar -xzf "/tmp/op-deployer.tar.gz" -C "$BIN_DIR" --strip-components=1 2>/dev/null || tar -xzf "/tmp/op-deployer.tar.gz" -C "$BIN_DIR"

# Make executable
chmod +x "$BIN_DIR/op-deployer" 2>/dev/null || true

# Verify
if [ -f "$BIN_DIR/op-deployer" ]; then
    echo ""
    echo "✓ op-deployer installed successfully!"
    echo ""
    "$BIN_DIR/op-deployer" --version
    echo ""
    echo "Add to PATH:"
    echo "  export PATH=\"$BIN_DIR:\$PATH\""
    echo ""
    echo "Or use directly:"
    echo "  $BIN_DIR/op-deployer --help"
else
    echo "Installation failed - binary not found"
    ls -la "$BIN_DIR"
    exit 1
fi

# Cleanup
rm -f "/tmp/op-deployer.tar.gz"

echo "Setup complete!"
