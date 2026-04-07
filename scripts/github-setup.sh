#!/bin/bash
# BesaChain GitHub Repository Setup Script
# Creates public and private repositories for BesaChain project

set -e

# Configuration
# Get token from environment or git credentials (supports ghp_*, gho_*, github_pat_*)
GITHUB_TOKEN="${GITHUB_TOKEN:-$(grep -oE '(ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{22,})' ~/.git-credentials 2>/dev/null | head -1 || echo '')}"

if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}Error: GitHub token not found${NC}"
    echo "Please set GITHUB_TOKEN environment variable or ensure token is in ~/.git-credentials"
    exit 1
fi
GITHUB_USER="skacaniku"
PUBLIC_REPO="besachain"
PRIVATE_REPO="besachain-secrets"
API_BASE="https://api.github.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== BesaChain GitHub Repository Setup ===${NC}"
echo ""

# Function to check if repo exists
check_repo_exists() {
    local repo_name=$1
    local response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "$API_BASE/repos/$GITHUB_USER/$repo_name")
    echo "$response"
}

# Function to create public repository
create_public_repo() {
    echo -e "${YELLOW}Creating public repository: $PUBLIC_REPO${NC}"
    
    local response=$(curl -s -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "$API_BASE/user/repos" \
        -d '{
            "name": "'"$PUBLIC_REPO"'",
            "description": "BesaChain - Post-Quantum Secure Layer 1 Blockchain with ML-DSA Precompile",
            "private": false,
            "auto_init": false,
            "gitignore_template": "Go",
            "license_template": "mit",
            "has_issues": true,
            "has_projects": true,
            "has_wiki": true,
            "has_discussions": true,
            "allow_merge_commit": true,
            "allow_squash_merge": true,
            "allow_rebase_merge": true,
            "delete_branch_on_merge": true
        }')
    
    if echo "$response" | grep -q '"id"'; then
        echo -e "${GREEN}✓ Public repository created successfully${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to create public repository${NC}"
        echo "$response" | grep -o '"message":"[^"]*"' || echo "$response"
        return 1
    fi
}

# Function to create private repository
create_private_repo() {
    echo -e "${YELLOW}Creating private repository: $PRIVATE_REPO${NC}"
    
    local response=$(curl -s -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "$API_BASE/user/repos" \
        -d '{
            "name": "'"$PRIVATE_REPO"'",
            "description": "BesaChain Secrets - Private keys, genesis files, and infrastructure configs",
            "private": true,
            "auto_init": false,
            "has_issues": true,
            "has_projects": false,
            "has_wiki": false,
            "has_discussions": false,
            "allow_merge_commit": true,
            "allow_squash_merge": true,
            "allow_rebase_merge": true,
            "delete_branch_on_merge": true
        }')
    
    if echo "$response" | grep -q '"id"'; then
        echo -e "${GREEN}✓ Private repository created successfully${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to create private repository${NC}"
        echo "$response" | grep -o '"message":"[^"]*"' || echo "$response"
        return 1
    fi
}

# Function to setup branch protection
setup_branch_protection() {
    local repo_name=$1
    echo -e "${YELLOW}Setting up branch protection for $repo_name${NC}"
    
    curl -s -X PUT \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "$API_BASE/repos/$GITHUB_USER/$repo_name/branches/main/protection" \
        -d '{
            "required_status_checks": {
                "strict": true,
                "contexts": ["ci/tests", "ci/lint"]
            },
            "enforce_admins": false,
            "required_pull_request_reviews": {
                "required_approving_review_count": 1,
                "dismiss_stale_reviews": true,
                "require_code_owner_reviews": true
            },
            "restrictions": null,
            "allow_force_pushes": false,
            "allow_deletions": false
        }' > /dev/null
    
    echo -e "${GREEN}✓ Branch protection configured${NC}"
}

# Function to create repository secrets for private repo
setup_repo_secrets() {
    echo -e "${YELLOW}Note: Repository secrets must be added manually via GitHub UI${NC}"
    echo "Required secrets for besachain-secrets:"
    echo "  - AWS_ACCESS_KEY_ID"
    echo "  - AWS_SECRET_ACCESS_KEY"
    echo "  - AWS_REGION"
    echo "  - TF_CLOUD_TOKEN (if using Terraform Cloud)"
}

# Main execution
echo "Checking existing repositories..."

PUBLIC_EXISTS=$(check_repo_exists "$PUBLIC_REPO")
PRIVATE_EXISTS=$(check_repo_exists "$PRIVATE_REPO")

if [ "$PUBLIC_EXISTS" == "200" ]; then
    echo -e "${YELLOW}Public repository '$PUBLIC_REPO' already exists${NC}"
else
    create_public_repo
fi

if [ "$PRIVATE_EXISTS" == "200" ]; then
    echo -e "${YELLOW}Private repository '$PRIVATE_REPO' already exists${NC}"
else
    create_private_repo
fi

echo ""
echo -e "${GREEN}=== Repository URLs ===${NC}"
echo "Public Repo:  https://github.com/$GITHUB_USER/$PUBLIC_REPO"
echo "Private Repo: https://github.com/$GITHUB_USER/$PRIVATE_REPO"
echo ""

# Optional: Setup branch protection
read -p "Setup branch protection rules? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    setup_branch_protection "$PUBLIC_REPO"
    setup_branch_protection "$PRIVATE_REPO"
fi

# Note about secrets
setup_repo_secrets

echo ""
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo "Next steps:"
echo "1. Clone the repositories"
echo "2. Run sync-repos.sh to populate initial structure"
echo "3. Add repository secrets to besachain-secrets via GitHub UI"
