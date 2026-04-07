# BesaChain DNS Records

## Domain: besachain.com

### A Records
| Host | Type | Value | TTL | Description |
|------|------|-------|-----|-------------|
| @ | A | 54.235.85.175 | 300 | Main website |
| www | A | 54.235.85.175 | 300 | WWW redirect |
| dex | A | 54.235.85.175 | 300 | DEX frontend |
| rpc | A | 54.235.85.175 | 300 | L1 RPC endpoint |
| ws | A | 54.235.85.175 | 300 | L1 WebSocket |
| l2-rpc | A | 54.235.85.175 | 300 | L2 RPC endpoint |
| l2-ws | A | 54.235.85.175 | 300 | L2 WebSocket |
| validator1 | A | 54.235.85.175 | 300 | Validator 1 |
| validator2 | A | 3.221.0.18 | 300 | Validator 2 |
| validator3 | A | 54.210.110.215 | 300 | Validator 3 |
| api | A | 54.235.85.175 | 300 | API endpoint |
| explorer | A | 54.235.85.175 | 300 | Block explorer |
| faucet | A | 54.235.85.175 | 300 | Testnet faucet |
| docs | A | 54.235.85.175 | 300 | Documentation |

### TXT Records
| Host | Type | Value | Description |
|------|------|-------|-------------|
| @ | TXT | "v=spf1 include:_spf.google.com ~all" | SPF record |
| _dmarc | TXT | "v=DMARC1; p=quarantine; rua=mailto:dmarc@besachain.com" | DMARC |

---

## Domain: besachain.org

### A Records
| Host | Type | Value | TTL | Description |
|------|------|-------|-----|-------------|
| @ | A | 54.235.85.175 | 300 | Foundation website |
| www | A | 54.235.85.175 | 300 | WWW redirect |
| grants | A | 54.235.85.175 | 300 | Grants program |
| governance | A | 54.235.85.175 | 300 | Governance portal |
| research | A | 54.235.85.175 | 300 | Research papers |
| blog | A | 54.235.85.175 | 300 | Blog |

### TXT Records
| Host | Type | Value | Description |
|------|------|-------|-------------|
| @ | TXT | "v=spf1 include:_spf.google.com ~all" | SPF record |
| _dmarc | TXT | "v=DMARC1; p=quarantine; rua=mailto:dmarc@besachain.org" | DMARC |

---

## Nginx Configuration Summary

All domains point to the same EC2 instance (54.235.85.175) and are routed via Nginx based on Host header.

### Port Mapping
| Domain/Subdomain | Internal Port | Service |
|------------------|---------------|---------|
| besachain.com | 3001 | Main website |
| www.besachain.com | 3001 | Main website |
| dex.besachain.com | 3002 | DEX frontend |
| rpc.besachain.com | 1444 | L1 RPC proxy |
| ws.besachain.com | 14444 | L1 WS proxy |
| l2-rpc.besachain.com | 1445 | L2 RPC proxy |
| l2-ws.besachain.com | 14445 | L2 WS proxy |
| explorer.besachain.com | 3003 | Block explorer |
| docs.besachain.com | 3004 | Documentation |
| besachain.org | 3005 | Foundation site |
| www.besachain.org | 3005 | Foundation site |
| grants.besachain.org | 3005 | Foundation site |
| governance.besachain.org | 3006 | Governance |
