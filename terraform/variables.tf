variable "aws_region" {
  description = "AWS region for BesaChain infrastructure"
  type        = string
  default     = "us-east-1"
}

variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
  default     = "251986419274"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "besachain_chain_id" {
  description = "BesaChain L1 Chain ID"
  type        = string
  default     = "1444"
}

variable "besachain_l2_chain_id" {
  description = "BesaChain L2 Chain ID"
  type        = string
  default     = "1445"
}

variable "libyachain_instance_id" {
  description = "Existing LibyaChain EC2 instance ID to share"
  type        = string
  default     = "i-0c0d1218308b3506d"
}

variable "vpc_id" {
  description = "VPC ID for BesaChain"
  type        = string
  default     = "vpc-09f3a7baeb64d63d2"
}

variable "subnet_ids" {
  description = "Subnet IDs for BesaChain"
  type        = list(string)
  default     = ["subnet-041a2201d71b73b95", "subnet-0b87bfa5ea429bc08"]
}

variable "bootnodes" {
  description = "List of BesaChain bootnode enodes"
  type        = list(string)
  default     = []
}

variable "validator_count" {
  description = "Number of validators"
  type        = number
  default     = 3
}

variable "node_ports" {
  description = "Port configuration for BesaChain (must not conflict with LibyaChain)"
  type = object({
    p2p     = number
    rpc     = number
    ws      = number
    metrics = number
  })
  default = {
    p2p     = 30403  # LibyaChain uses 30303
    rpc     = 8645   # LibyaChain uses 8545
    ws      = 8646   # LibyaChain uses 8546
    metrics = 6070   # LibyaChain uses 6060
  }
}
