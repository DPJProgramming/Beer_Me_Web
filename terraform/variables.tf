# AWS Region - change if deploying to a different region
variable "aws_region" {
  default = "us-east-1"
}

# TODO: Replace with your actual VPC ID from AWS Console
variable "vpc_id" {
  default = "vpc-0cfb54f4382c80e48"  
}

# TODO: Replace with your actual public subnet IDs from AWS Console
variable "public_subnet_ids" {
  type = list(string)
  # Get from: AWS Console > VPC > Subnets (select public subnets)
  # Example: ["subnet-12345678", "subnet-87654321"]
}

# Database configuration - customize as needed
variable "db_name" {
  default = "myapp"
}

variable "db_username" {
  default = "admin"
}

# TODO: Set this via terraform.tfvars or environment variable
# NEVER commit sensitive credentials to version control
variable "db_password" {
  sensitive = true
  # Use: terraform.tfvars with db_password = "your-secure-password"
}