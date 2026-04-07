# BesaChain GitHub Repository Setup Guide

This document describes the setup for BesaChain's GitHub repositories and deployment infrastructure.

## 📁 Repository Structure

### Created Files

```
/Users/senton/besachain/
├── scripts/
│   ├── github-setup.sh          # Creates GitHub repositories
│   ├── sync-repos.sh            # Manages code syncing between repos
│   ├── deploy-validator.sh      # Deploys validator nodes
│   └── rotate-keys.sh           # Rotates cryptographic keys
├── templates/
│   ├── public-readme.md         # README for public repo
│   └── private-readme.md        # README for private repo
├── configs/
│   ├── public-gitignore         # .gitignore for public repo
│   ├── private-gitignore        # .gitignore for private repo
│   ├── github-actions-public.yml # CI/CD for public repo
│   └── github-actions-private.yml # CI/CD for private repo
└── SETUP.md                     # This file
```

## 🚀 Quick Start

### 1. Create GitHub Repositories

```bash
cd /Users/senton/besachain
chmod +x scripts/*.sh
./scripts/github-setup.sh
```

This will create:
- `besachain` (PUBLIC) - Source code, documentation, SDKs
- `besachain-secrets` (PRIVATE) - Keys, genesis, infrastructure configs

### 2. Initialize Repository Content

```bash
# Initialize public repository
./scripts/sync-repos.sh init-public

# Initialize private repository
./scripts/sync-repos.sh init-private

# Push to GitHub
./scripts/sync-repos.sh deploy-public
./scripts/sync-repos.sh deploy-private
```

### 3. Set Up Repository Secrets

For `besachain-secrets`, add these secrets via GitHub UI:

| Secret Name | Description |
|-------------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key for deployments |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key |
| `AWS_REGION` | AWS Region (e.g., `us-east-1`) |
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password/token |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications |

For `besachain` (public), add:

| Secret Name | Description |
|-------------|-------------|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password/token |
| `CODECOV_TOKEN` | Codecov token for coverage reports |

## 📋 Repository Details

### Public Repository: `besachain`

**Purpose**: All non-sensitive code, documentation, and SDKs

**Structure**:
```
besachain/
├── node-client/          # BSC fork with ML-DSA precompile
├── contracts/            # Smart contracts
├── docs/                 # Documentation
├── scripts/              # Deployment scripts (no sensitive data)
├── sdk/                  # SDKs (Go, JS, Python)
├── genesis-templates/    # Genesis templates (no real addresses)
├── .github/workflows/    # CI/CD
├── README.md
├── LICENSE
├── CONTRIBUTING.md
└── .gitignore
```

**Features**:
- ✅ Open source (MIT License)
- ✅ Community contributions welcome
- ✅ Comprehensive CI/CD with tests
- ✅ Automated releases
- ✅ Docker image builds
- ✅ Documentation auto-deployment

### Private Repository: `besachain-secrets`

**Purpose**: Sensitive configuration, keys, and infrastructure

**Structure**:
```
besachain-secrets/
├── keys/                 # Private keys and addresses
│   ├── root-keys/        # Root authority keys
│   ├── validator-keys/   # Validator operator keys
│   ├── treasury/         # Treasury multi-sig keys
│   └── auditors/         # Auditor access keys
├── genesis/              # Actual genesis files with validator addresses
│   ├── mainnet/
│   ├── testnet/
│   └── devnet/
├── infra/                # Infrastructure configs
│   ├── terraform/        # Terraform state and configs
│   ├── ansible/          # Ansible playbooks
│   ├── kubernetes/       # K8s secrets
│   └── aws/              # AWS-specific configs
├── validators/           # Validator keystore files
│   ├── mainnet/
│   ├── testnet/
│   └── devnet/
├── .github/workflows/    # Deployment CI/CD
├── README.md
├── SECURITY.md
└── .gitignore
```

**Security Features**:
- 🔒 Private repository (core team only)
- 🔐 File encryption with git-crypt
- 🔍 Automated secret scanning
- 📊 Audit logging
- 🔄 Quarterly key rotation
- 🚨 Incident response procedures

## 🔧 Available Commands

### Repository Management

```bash
# Check status of both repos
./scripts/sync-repos.sh status

# Pull latest from both repos
./scripts/sync-repos.sh pull-all

# Link public repo as subtree in private (for CI/CD)
./scripts/sync-repos.sh link-subtree
```

### Public Repository

```bash
# Sync changes locally
./scripts/sync-repos.sh sync-public --message "Updated node client"

# Deploy to GitHub
./scripts/sync-repos.sh deploy-public
```

### Private Repository

```bash
# Sync changes locally
./scripts/sync-repos.sh sync-private --message "Updated genesis config"

# Deploy to GitHub
./scripts/sync-repos.sh deploy-private

# Deploy validator
./scripts/deploy-validator.sh -e testnet -i validator-001

# Rotate keys
./scripts/rotate-keys.sh -e testnet -t validator -b 5
```

## 🔐 Security Best Practices

### 1. Access Control

- **Public Repo**: Anyone can read, core team can write
- **Private Repo**: Core team only, MFA required
- Rotate access credentials quarterly
- Use least-privilege principle

### 2. Secret Management

- Never commit unencrypted secrets
- Use git-crypt for files in private repo
- Store production keys in HSM where possible
- Use AWS KMS for cloud secrets
- Regular key rotation schedule

### 3. Encryption Setup

```bash
# Initialize git-crypt in private repo
cd /Users/senton/besachain/secrets
git-crypt init

# Add team members
git-crypt add-gpg-user team-member@besachain.io

# Lock before pushing
git-crypt lock

# Unlock to work
git-crypt unlock
```

### 4. Incident Response

If a secret is exposed:

1. **Immediate** (0-5 min):
   ```bash
   # Revoke the exposed credential
   ./scripts/emergency-revoke-key.sh --key-id <ID>
   ```

2. **Short-term** (5-30 min):
   - Rotate all related credentials
   - Notify security team
   - Assess impact scope

3. **Recovery** (30+ min):
   - Deploy new credentials
   - Update affected systems
   - Document incident

## 🌐 GitHub API Usage

The setup scripts use the GitHub API with the provided token:

```bash
# Token details (stored in ~/.git-credentials)
Username: skacaniku
Token: <loaded from ~/.git-credentials>
Scopes needed: repo, workflow, write:packages
```

### Manual API Calls

```bash
# List repositories (get token from ~/.git-credentials)
TOKEN=$(grep -o 'ghp_[a-zA-Z0-9]\{36\}' ~/.git-credentials 2>/dev/null || grep -o 'gho_[a-zA-Z0-9]\{36\}' ~/.git-credentials 2>/dev/null)
curl -H "Authorization: token $TOKEN" \
  https://api.github.com/user/repos

# Create repository
curl -X POST \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d '{"name":"besachain","private":false}'
```

## 📊 CI/CD Workflows

### Public Repository Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Push/PR | Lint, test, build |
| Security scan | Push | Gosec, Slither, Nancy |
| Docker build | Release | Build and push images |
| Documentation | Push to main | Deploy docs to GitHub Pages |
| Release | Release published | Create release archives |

### Private Repository Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `deploy.yml` | Push to main | Deploy infrastructure |
| Validate | PR | Validate secrets and configs |
| Security scan | Push | Secret scanning, credential checks |
| Key rotation | Manual | Rotate validator keys |
| Backup | Manual | Backup secrets to S3 |

## 🚀 Deployment Environments

### Testnet

- **Chain ID**: 9701
- **Purpose**: Public testing
- **Validators**: 7
- **Block Time**: 3 seconds

### Mainnet

- **Chain ID**: 9700
- **Purpose**: Production
- **Validators**: 21
- **Block Time**: 3 seconds

## 📞 Support

- **GitHub Issues**: https://github.com/skacaniku/besachain/issues
- **Security**: security@besachain.io
- **DevOps**: devops@besachain.io

---

**Last Updated**: $(date +%Y-%m-%d)
