terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {
    # TODO: Replace bucket name with your S3 bucket for Terraform state
    # Created via: aws s3api create-bucket --bucket beer-me-web-terraform --region us-east-1
    bucket = "beer-me-web-terraform"
    key    = "Beer_Me_Web/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  # Ensure AWS credentials are configured via:
  # - AWS CLI: aws configure
  # - Environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
  # - IAM role (if running on EC2/Lambda)
}