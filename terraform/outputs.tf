# BesaChain Outputs - L1 (1444) and L2 (1445)

output "besachain_instance_id" {
  description = "EC2 instance running BesaChain (shared with LibyaChain)"
  value       = data.aws_instance.libyachain.id
}

output "besachain_instance_ip" {
  description = "Public IP of BesaChain instance"
  value       = data.aws_instance.libyachain.public_ip
}

# L1 Outputs
output "besachain_l1_chain_id" {
  description = "BesaChain L1 Chain ID"
  value       = var.besachain_chain_id
}

output "besachain_l1_rpc" {
  description = "BesaChain L1 RPC endpoint"
  value       = "http://${data.aws_instance.libyachain.public_ip}:1444"
}

output "besachain_l1_ws" {
  description = "BesaChain L1 WebSocket endpoint"
  value       = "ws://${data.aws_instance.libyachain.public_ip}:14444"
}

output "besachain_l1_p2p" {
  description = "BesaChain L1 P2P port"
  value       = "31444"
}

# L2 Outputs
output "besachain_l2_chain_id" {
  description = "BesaChain L2 Chain ID"
  value       = var.besachain_l2_chain_id
}

output "besachain_l2_rpc" {
  description = "BesaChain L2 RPC endpoint"
  value       = "http://${data.aws_instance.libyachain.public_ip}:1445"
}

output "besachain_l2_ws" {
  description = "BesaChain L2 WebSocket endpoint"
  value       = "ws://${data.aws_instance.libyachain.public_ip}:14445"
}

output "besachain_backup_bucket" {
  description = "S3 bucket for BesaChain backups"
  value       = aws_s3_bucket.besachain_backups.id
}

output "deployment_summary" {
  description = "Summary of BesaChain deployment"
  value = <<-EOT
    ╔══════════════════════════════════════════════════════════════════════════════╗
    ║                        BESA CHAIN DEPLOYMENT SUMMARY                         ║
    ╚══════════════════════════════════════════════════════════════════════════════╝
    
    Instance: ${data.aws_instance.libyachain.id}
    Public IP: ${data.aws_instance.libyachain.public_ip}
    
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                              LAYER 1 (L1)                                   │
    ├─────────────────────────────────────────────────────────────────────────────┤
    │  Chain ID:  ${var.besachain_chain_id}                                        │
    │  RPC:       http://${data.aws_instance.libyachain.public_ip}:1444           │
    │  WS:        ws://${data.aws_instance.libyachain.public_ip}:14444            │
    │  P2P:       31444                                                           │
    │  Metrics:   http://${data.aws_instance.libyachain.public_ip}:14440          │
    └─────────────────────────────────────────────────────────────────────────────┘
    
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                              LAYER 2 (L2)                                   │
    ├─────────────────────────────────────────────────────────────────────────────┤
    │  Chain ID:  ${var.besachain_l2_chain_id}                                     │
    │  RPC:       http://${data.aws_instance.libyachain.public_ip}:1445           │
    │  WS:        ws://${data.aws_instance.libyachain.public_ip}:14445            │
    │  P2P:       31445                                                           │
    │  Metrics:   http://${data.aws_instance.libyachain.public_ip}:14450          │
    └─────────────────────────────────────────────────────────────────────────────┘
    
    Shared Instance with LibyaChain (21801) - Cost Savings: ~$150-300/month
  EOT
}
