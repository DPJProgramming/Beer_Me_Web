resource "aws_db_subnet_group" "main" {
  name = "main-subnet-group"
  # TODO: Provide public_subnet_ids in terraform.tfvars
  # Get from: AWS Console > VPC > Subnets (select your public subnets)
  subnet_ids = var.public_subnet_ids
}
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
    description = "HTTPS for Secrets Manager and API calls"
  }
}

resource "aws_security_group" "rds" {
  name   = "rds-sg"
  vpc_id = var.vpc_id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
  }

  dynamic "ingress" {
    for_each = var.rds_allowed_cidr_blocks
    content {
      from_port   = 3306
      to_port     = 3306
      protocol    = "tcp"
      cidr_blocks = [ingress.value]
    }
  }
}
resource "aws_db_instance" "mysql" {
  identifier             = "myapp-mysql"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  skip_final_snapshot    = true
  publicly_accessible    = var.rds_publicly_accessible

}

# Security group for the Secrets Manager interface endpoint
resource "aws_security_group" "secrets_endpoint_sg" {
  name   = "secrets-endpoint-sg"
  vpc_id = var.vpc_id

  description = "Security group for Secrets Manager VPC endpoint"

  ingress {
    description       = "Allow Lambda SG to talk HTTPS to the endpoint"
    from_port         = 443
    to_port           = 443
    protocol          = "tcp"
    security_groups   = [aws_security_group.lambda.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Interface VPC endpoint for AWS Secrets Manager (private access to Secrets Manager)
resource "aws_vpc_endpoint" "secretsmanager" {
  vpc_id            = var.vpc_id
  service_name      = "com.amazonaws.${var.aws_region}.secretsmanager"
  vpc_endpoint_type = "Interface"

  # Place the endpoint ENIs in the same subnets as the Lambda
  subnet_ids = var.public_subnet_ids

  security_group_ids = [aws_security_group.secrets_endpoint_sg.id]

  private_dns_enabled = true

  tags = {
    Name = "secretsmanager-endpoint"
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