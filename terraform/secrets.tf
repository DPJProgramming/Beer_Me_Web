resource "aws_secretsmanager_secret" "db_password" {
  name = "myapp-db-password"
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = var.db_password
}

resource "aws_iam_role_policy" "lambda_secrets" {
  name = "lambda_secrets_policy"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = [
        "secretsmanager:GetSecretValue"
      ]
      Effect   = "Allow"
      Resource = aws_secretsmanager_secret.db_password.arn
    }]
  })
}
