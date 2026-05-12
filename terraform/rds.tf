# DynamoDB table for storing beers
resource "aws_dynamodb_table" "beers" {
  name           = "beers"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name = "beers-table"
  }
}

# Security group for Lambda (allows outbound to S3 and DynamoDB)
resource "aws_security_group" "lambda" {
  name   = "lambda-sg"
  vpc_id = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS for DynamoDB, S3, and API calls"
  }
}

# Gateway VPC endpoint for S3 so Lambdas in the VPC can access S3 without NAT
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = var.vpc_id
  service_name      = "com.amazonaws.${var.aws_region}.s3"
  vpc_endpoint_type = "Gateway"

  # Route table ID for the VPC's main route table. Replace if different in your AWS account.
  route_table_ids = ["rtb-0552b8d471c6d1126"]

  tags = {
    Name = "s3-gateway-endpoint"
  }
}