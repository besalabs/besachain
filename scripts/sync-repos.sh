#!/bin/bash
# BesaChain Repository Sync Script
# Manages syncing code between public and private repositories

set -e

# Configuration
GITHUB_USER="skacaniku"
PUBLIC_REPO="besachain"
PRIVATE_REPO="besachain-secrets"
BESA_BASE="/Users/senton/besachain"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Show usage
usage() {
    echo -e "${BLUE}BesaChain Repository Sync Tool${NC}"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  init-public      Initialize public repository with initial structure"
    echo "  init-private     Initialize private repository with initial structure"
    echo "  sync-public      Sync local changes to public repo"
    echo "  sync-private     Sync local changes to private repo"
    echo "  pull-all         Pull latest from both repos"
    echo "  status           Show sync status"
    echo "  deploy-public    Deploy public repo to remote"
    echo "  deploy-private   Deploy private repo to remote"
    echo "  link-subtree     Link public repo as subtree in private (for CI/CD)"
    echo ""
    echo "Examples:"
    echo "  $0 init-public"
    echo "  $0 sync-public --message 'Updated node client'"
    echo "  $0 deploy-private"
    echo ""
}

# Initialize directories
init_dirs() {
    echo -e "${YELLOW}Creating BesaChain directory structure...${NC}"
    
    # Public repo structure
    mkdir -p "$BESA_BASE"/{node-client,contracts,docs,scripts,sdk,genesis-templates}
    
    # Private repo structure
    mkdir -p "$BESA_BASE/secrets"/{keys,genesis,infra,validators}
    
    # Copy templates
    if [ -f "$BESA_BASE/templates/public-readme.md" ]; then
        cp "$BESA_BASE/templates/public-readme.md" "$BESA_BASE/README.md"
    fi
    
    if [ -f "$BESA_BASE/configs/public-gitignore" ]; then
        cp "$BESA_BASE/configs/public-gitignore" "$BESA_BASE/.gitignore"
    fi
    
    if [ -f "$BESA_BASE/configs/github-actions-public.yml" ]; then
        mkdir -p "$BESA_BASE/.github/workflows"
        cp "$BESA_BASE/configs/github-actions-public.yml" "$BESA_BASE/.github/workflows/ci.yml"
    fi
    
    echo -e "${GREEN}✓ Directory structure created${NC}"
}

# Initialize public repository
init_public() {
    echo -e "${YELLOW}Initializing public repository...${NC}"
    
    cd "$BESA_BASE"
    
    # Initialize git if not already
    if [ ! -d ".git" ]; then
        git init
        git remote add origin "https://github.com/$GITHUB_USER/$PUBLIC_REPO.git"
    fi
    
    # Create initial structure
    init_dirs
    
    # Create LICENSE if not exists
    if [ ! -f "LICENSE" ]; then
        cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2026 BesaChain

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
    fi
    
    # Create CONTRIBUTING.md
    if [ !f "CONTRIBUTING.md" ]; then
        cat > CONTRIBUTING.md << 'EOF'
# Contributing to BesaChain

Thank you for your interest in contributing to BesaChain! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/besachain.git`
3. Create a branch: `git checkout -b feature/your-feature-name`

## Code Standards

### Go (Node Client)
- Follow standard Go formatting (`gofmt`)
- Run `golint` and `go vet` before committing
- Write unit tests for new functionality
- Maintain test coverage above 80%

### Solidity (Smart Contracts)
- Follow Solidity style guide
- Run `solhint` for linting
- Write comprehensive test suites with Foundry/Hardhat
- Document all public functions with NatSpec

### TypeScript (SDK)
- Use strict TypeScript settings
- Run `eslint` and `prettier`
- Write unit and integration tests

## Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

## Pull Request Process

1. Ensure all tests pass locally
2. Update documentation if needed
3. Add entries to CHANGELOG.md
4. Request review from maintainers
5. Address review feedback
6. Squash commits if requested

## Security

For security issues, please email security@besachain.io instead of opening a public issue.

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code.
EOF
    fi
    
    # Stage and commit
    git add -A
    git commit -m "Initial commit: BesaChain public repository structure

- Add node-client directory for BSC fork with ML-DSA precompile
- Add contracts directory for smart contracts
- Add docs directory for documentation
- Add scripts directory for deployment scripts
- Add sdk directory for developer SDK
- Add genesis-templates directory for genesis configurations
- Add MIT LICENSE
- Add CONTRIBUTING.md guidelines"
    
    echo -e "${GREEN}✓ Public repository initialized${NC}"
    echo "Run 'git push -u origin main' to push to GitHub"
}

# Initialize private repository
init_private() {
    echo -e "${YELLOW}Initializing private repository...${NC}"
    
    cd "$BESA_BASE/secrets"
    
    # Initialize git if not already
    if [ ! -d ".git" ]; then
        git init
        git remote add origin "https://github.com/$GITHUB_USER/$PRIVATE_REPO.git"
    fi
    
    # Copy private README template
    if [ -f "$BESA_BASE/templates/private-readme.md" ]; then
        cp "$BESA_BASE/templates/private-readme.md" "$BESA_BASE/secrets/README.md"
    fi
    
    # Copy private gitignore
    if [ -f "$BESA_BASE/configs/private-gitignore" ]; then
        cp "$BESA_BASE/configs/private-gitignore" "$BESA_BASE/secrets/.gitignore"
    fi
    
    # Create directory structure
    mkdir -p {keys,genesis,infra,validators}
    
    # Create placeholder files
    touch keys/.gitkeep
    touch genesis/.gitkeep
    touch infra/.gitkeep
    touch validators/.gitkeep
    
    # Create SECURITY.md
    cat > SECURITY.md << 'EOF'
# Security Policy

This repository contains sensitive configuration and cryptographic keys for the BesaChain network.

## Access Control

- Only core team members should have access to this repository
- All access is logged and audited
- Use MFA for GitHub access
- Rotate access keys quarterly

## Handling Secrets

- Never commit unencrypted secrets
- Use git-crypt or sops for encryption
- Store production keys in HSM where possible
- Regular key rotation schedule

## Incident Response

1. Immediately revoke compromised keys
2. Rotate all affected credentials
3. Notify security team within 1 hour
4. Document incident in incident log

## Contact

Security Team: security@besachain.io
Emergency: +1-XXX-XXX-XXXX
EOF
    
    # Stage and commit
    git add -A
    git commit -m "Initial commit: BesaChain secrets repository

- Add keys/ directory for private keys and addresses
- Add genesis/ directory for genesis files with validator addresses
- Add infra/ directory for Terraform state and AWS configs
- Add validators/ directory for validator keystore files
- Add SECURITY.md with access control policies"
    
    echo -e "${GREEN}✓ Private repository initialized${NC}"
    echo "Run 'cd secrets && git push -u origin main' to push to GitHub"
}

# Sync to public repo
sync_public() {
    local message="${1:-'Update public repository'}"
    
    echo -e "${YELLOW}Syncing public repository...${NC}"
    
    cd "$BESA_BASE"
    
    git add -A
    git commit -m "$message" || echo "No changes to commit"
    
    echo -e "${GREEN}✓ Public repository synced locally${NC}"
}

# Sync to private repo
sync_private() {
    local message="${1:-'Update private repository'}"
    
    echo -e "${YELLOW}Syncing private repository...${NC}"
    
    cd "$BESA_BASE/secrets"
    
    git add -A
    git commit -m "$message" || echo "No changes to commit"
    
    echo -e "${GREEN}✓ Private repository synced locally${NC}"
}

# Deploy to remote
deploy_public() {
    echo -e "${YELLOW}Deploying public repository to GitHub...${NC}"
    
    cd "$BESA_BASE"
    
    # Check if remote exists
    if ! git remote | grep -q origin; then
        git remote add origin "https://github.com/$GITHUB_USER/$PUBLIC_REPO.git"
    fi
    
    git push -u origin main || git push origin main
    
    echo -e "${GREEN}✓ Public repository deployed${NC}"
}

deploy_private() {
    echo -e "${YELLOW}Deploying private repository to GitHub...${NC}"
    
    cd "$BESA_BASE/secrets"
    
    # Check if remote exists
    if ! git remote | grep -q origin; then
        git remote add origin "https://github.com/$GITHUB_USER/$PRIVATE_REPO.git"
    fi
    
    git push -u origin main || git push origin main
    
    echo -e "${GREEN}✓ Private repository deployed${NC}"
}

# Pull latest
pull_all() {
    echo -e "${YELLOW}Pulling latest changes...${NC}"
    
    # Public repo
    if [ -d "$BESA_BASE/.git" ]; then
        cd "$BESA_BASE"
        git pull origin main || echo "Public repo not yet pushed"
    fi
    
    # Private repo
    if [ -d "$BESA_BASE/secrets/.git" ]; then
        cd "$BESA_BASE/secrets"
        git pull origin main || echo "Private repo not yet pushed"
    fi
    
    echo -e "${GREEN}✓ Repositories updated${NC}"
}

# Show status
show_status() {
    echo -e "${BLUE}=== BesaChain Repository Status ===${NC}"
    echo ""
    
    # Public repo status
    if [ -d "$BESA_BASE/.git" ]; then
        echo -e "${GREEN}Public Repository (besachain):${NC}"
        cd "$BESA_BASE"
        git status --short
        echo ""
    else
        echo -e "${YELLOW}Public repository not initialized${NC}"
    fi
    
    # Private repo status
    if [ -d "$BESA_BASE/secrets/.git" ]; then
        echo -e "${GREEN}Private Repository (besachain-secrets):${NC}"
        cd "$BESA_BASE/secrets"
        git status --short
        echo ""
    else
        echo -e "${YELLOW}Private repository not initialized${NC}"
    fi
}

# Link public as subtree in private (for CI/CD workflows)
link_subtree() {
    echo -e "${YELLOW}Linking public repo as subtree in private repo...${NC}"
    
    cd "$BESA_BASE/secrets"
    
    # Add public repo as remote
    if ! git remote | grep -q public; then
        git remote add public "https://github.com/$GITHUB_USER/$PUBLIC_REPO.git"
    fi
    
    # Fetch public repo
    git fetch public
    
    # Add as subtree
    git subtree add --prefix=besachain-src public main --squash || \
    git subtree pull --prefix=besachain-src public main --squash
    
    echo -e "${GREEN}✓ Public repository linked as subtree${NC}"
    echo "This allows CI/CD in private repo to build using public source"
}

# Main command handler
case "${1:-}" in
    init-public)
        init_public
        ;;
    init-private)
        init_private
        ;;
    sync-public)
        shift
        sync_public "$@"
        ;;
    sync-private)
        shift
        sync_private "$@"
        ;;
    deploy-public)
        deploy_public
        ;;
    deploy-private)
        deploy_private
        ;;
    pull-all)
        pull_all
        ;;
    status)
        show_status
        ;;
    link-subtree)
        link_subtree
        ;;
    *)
        usage
        exit 1
        ;;
esac
