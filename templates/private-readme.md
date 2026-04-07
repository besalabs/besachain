# BesaChain Secrets 🔒

> **⚠️ PRIVATE REPOSITORY - RESTRICTED ACCESS**
> 
> This repository contains sensitive cryptographic keys, genesis configurations, and infrastructure secrets for the BesaChain network. Unauthorized access or distribution is strictly prohibited.

## 🚨 Security Notice

- **Access Level**: Core Team Only
- **Encryption**: All sensitive files must be encrypted with `git-crypt` or `sops`
- **Audit**: All access is logged and monitored
- **Rotation**: Keys must be rotated quarterly
- **Incident Response**: Report any suspected breach immediately

## 📁 Repository Structure

```
besachain-secrets/
├── keys/                    # Cryptographic keys
│   ├── root-keys/          # Root authority keys (HSM backed)
│   ├── validator-keys/     # Validator operator keys
│   ├── treasury/           # Treasury multi-sig keys
│   └── auditors/           # Auditor access keys
├── genesis/                 # Genesis configurations
│   ├── mainnet/            # Mainnet genesis (with actual validator addresses)
│   ├── testnet/            # Testnet genesis
│   └── devnet/             # Development network genesis
├── infra/                   # Infrastructure configurations
│   ├── terraform/          # Terraform state and configs
│   ├── ansible/            # Ansible playbooks with sensitive vars
│   ├── kubernetes/         # K8s secrets and configs
│   └── aws/                # AWS-specific configurations
├── validators/              # Validator keystore files
│   ├── mainnet/            # Mainnet validator keystores
│   ├── testnet/            # Testnet validator keystores
│   └── backup/             # Encrypted backups
└── docs/                    # Operational documentation
    ├── runbooks/           # Incident response runbooks
    ├── access-control/     # Access control procedures
    └── key-ceremony/       # Key generation ceremonies
```

## 🔐 Encryption Setup

### Prerequisites

```bash
# Install git-crypt
# macOS
brew install git-crypt

# Ubuntu/Debian
sudo apt-get install git-crypt

# Or build from source
git clone https://github.com/AGWA/git-crypt.git
cd git-crypt && make && sudo make install
```

### Initialize Encryption

```bash
# Initialize git-crypt in this repo
git-crypt init

# Add GPG users who can decrypt
git-crypt add-gpg-user CORE_TEAM_MEMBER_1@besachain.io
git-crypt add-gpg-user CORE_TEAM_MEMBER_2@besachain.io

# Lock files before pushing
git-crypt lock
```

### Working with Encrypted Files

```bash
# Unlock repository for work
git-crypt unlock

# Make changes to files
vim keys/validator-keys/validator-001.key

# Stage and commit (files auto-encrypt on commit)
git add .
git commit -m "Update validator keys"

# Lock before switching branches
git-crypt lock
```

## 🚀 Deployment Workflows

### Deploying Validators

```bash
# 1. Ensure you have the latest secrets
git pull origin main
git-crypt unlock

# 2. Run deployment script
./scripts/deploy-validator.sh --network mainnet --validator-id 001

# 3. Verify deployment
./scripts/verify-validator.sh --network mainnet --validator-id 001
```

### Rotating Keys

```bash
# Run key rotation script (quarterly)
./scripts/rotate-keys.sh --type validator --batch-size 10

# Verify rotation
./scripts/verify-keys.sh --type validator
```

### Genesis Updates

```bash
# Update genesis file
vim genesis/mainnet/genesis.json

# Validate genesis
./scripts/validate-genesis.sh --network mainnet

# Sign genesis update (requires threshold signatures)
./scripts/sign-genesis.sh --network mainnet
```

## 🔧 Infrastructure

### Terraform

```bash
cd infra/terraform

# Initialize
terraform init

# Plan changes
terraform plan -out=tfplan

# Apply (requires approval)
terraform apply tfplan
```

### Kubernetes Secrets

```bash
# Apply secrets to cluster
kubectl apply -f kubernetes/secrets/

# Verify secrets
kubectl get secrets -n besachain

# Rotate K8s secrets
./scripts/rotate-k8s-secrets.sh
```

## 📊 Monitoring

### Access Logs

View repository access logs:
```bash
./scripts/view-access-logs.sh
```

### Key Health Checks

```bash
# Check all key statuses
./scripts/key-health-check.sh

# Check validator connectivity
./scripts/validator-health-check.sh --network mainnet
```

## 🆘 Incident Response

### Compromised Key Response

1. **Immediate** (0-5 minutes):
   ```bash
   # Revoke compromised key
   ./scripts/emergency-revoke-key.sh --key-id COMPROMISED_KEY_ID
   ```

2. **Short-term** (5-30 minutes):
   - Notify security team
   - Assess impact scope
   - Isolate affected systems

3. **Recovery** (30+ minutes):
   - Rotate all related keys
   - Update genesis if needed
   - Deploy new validators
   - Post-incident review

### Emergency Contacts

| Role | Contact | Phone |
|------|---------|-------|
| Security Lead | security@besachain.io | +1-XXX-XXX-XXXX |
| DevOps On-Call | devops@besachain.io | +1-XXX-XXX-XXXX |
| CEO | ceo@besachain.io | +1-XXX-XXX-XXXX |

## 📋 Checklists

### New Validator Onboarding

- [ ] Generate validator keys in HSM
- [ ] Create keystore files
- [ ] Add to genesis (if initial validator)
- [ ] Configure validator node
- [ ] Test signing capability
- [ ] Add to monitoring
- [ ] Document in validator registry

### Quarterly Key Rotation

- [ ] Generate new key pairs
- [ ] Test new keys in staging
- [ ] Schedule maintenance window
- [ ] Rotate keys one-by-one (rolling update)
- [ ] Verify network consensus
- [ ] Revoke old keys
- [ ] Update documentation

### Genesis Update

- [ ] Prepare new genesis file
- [ ] Obtain threshold signatures
- [ ] Test in devnet
- [ ] Announce to validators
- [ ] Coordinate update time
- [ ] Monitor network post-update

## 🔗 Related Repositories

- [besachain](https://github.com/skacaniku/besachain) - Public source code
- [besachain-docs](https://github.com/skacaniku/besachain-docs) - Public documentation
- [besachain-explorer](https://github.com/skacaniku/besachain-explorer) - Block explorer

## 📜 Policies

- [Key Management Policy](docs/policies/key-management.md)
- [Access Control Policy](docs/policies/access-control.md)
- [Incident Response Plan](docs/policies/incident-response.md)
- [Business Continuity Plan](docs/policies/business-continuity.md)

---

<p align="center">
  <strong>🔒 Security First - Trust But Verify 🔒</strong>
</p>
