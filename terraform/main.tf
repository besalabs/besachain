# BesaChain Infrastructure - Parallel Deployment with LibyaChain
# Uses same AWS instances to save costs

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "besachain-terraform-state-us-east-1"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "besachain-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "BesaChain"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Chain       = "besachain"
    }
  }
}

# Data sources for existing LibyaChain infrastructure
data "aws_instance" "libyachain" {
  filter {
    name   = "instance-id"
    values = [var.libyachain_instance_id]
  }
}

data "aws_vpc" "main" {
  id = "vpc-0c1d5d1e7b63cd7c2"
}

data "aws_subnet" "public_1" {
  id = "subnet-0504ac789be4182d0"
}

data "aws_security_group" "ec2" {
  id = "sg-00fc3596750d6dfe1"
}

# CloudWatch Log Group for BesaChain
resource "aws_cloudwatch_log_group" "besachain" {
  name              = "/besachain/${var.environment}"
  retention_in_days = 30

  tags = {
    Name = "besachain-logs"
  }
}

# Additional security group rules for BesaChain (different ports)
resource "aws_security_group_rule" "besachain_p2p" {
  type              = "ingress"
  from_port         = 30403
  to_port           = 30403
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = data.aws_security_group.ec2.id
  description       = "BesaChain P2P (separate from LibyaChain 30303)"
}

resource "aws_security_group_rule" "besachain_rpc" {
  type              = "ingress"
  from_port         = 8645
  to_port           = 8645
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = data.aws_security_group.ec2.id
  description       = "BesaChain RPC (separate from LibyaChain 8545)"
}

resource "aws_security_group_rule" "besachain_ws" {
  type              = "ingress"
  from_port         = 8646
  to_port           = 8646
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = data.aws_security_group.ec2.id
  description       = "BesaChain WebSocket (separate from LibyaChain 8546)"
}

resource "aws_security_group_rule" "besachain_metrics" {
  type              = "ingress"
  from_port         = 6070
  to_port           = 6070
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = data.aws_security_group.ec2.id
  description       = "BesaChain Metrics (separate from LibyaChain 6060)"
}

# S3 Bucket for BesaChain backups
resource "aws_s3_bucket" "besachain_backups" {
  bucket = "besachain-backups-${var.aws_account_id}"

  tags = {
    Name        = "besachain-backups"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "besachain_backups" {
  bucket = aws_s3_bucket.besachain_backups.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "besachain_backups" {
  bucket = aws_s3_bucket.besachain_backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# SSM Parameters for BesaChain configuration
resource "aws_ssm_parameter" "besachain_chain_id" {
  name  = "/besachain/${var.environment}/chain_id"
  type  = "String"
  value = var.besachain_chain_id
}

resource "aws_ssm_parameter" "besachain_bootnodes" {
  name  = "/besachain/${var.environment}/bootnodes"
  type  = "String"
  value = join(",", var.bootnodes)
}

# IAM Role for BesaChain on existing instance
resource "aws_iam_role_policy" "besachain_s3_access" {
  name = "besachain-s3-access"
  role = "libyachain-ec2-role"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.besachain_backups.arn,
          "${aws_s3_bucket.besachain_backups.arn}/*"
        ]
      }
    ]
  })
}
