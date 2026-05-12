# AWS Region - change if deploying to a different region
variable "aws_region" {
  default = "us-east-1"
}

# TODO: Replace with your actual VPC ID from AWS Console
variable "vpc_id" {
  default = "vpc-xxxxxxxxxxxxxxxxx"
}

# TODO: Replace with your actual public subnet IDs from AWS Console
variable "public_subnet_ids" {
  type = list(string)
  # Get from: AWS Console > VPC > Subnets (select public subnets)
  # Example: ["subnet-12345678", "subnet-87654321"]
}