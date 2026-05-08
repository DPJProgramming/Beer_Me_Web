resource "aws_lambda_function" "api" {
  # TODO: Ensure function.zip is built and located at ../function.zip
  # Build command: zip -r ../function.zip handler.js node_modules/
  filename         = "../function.zip"
  source_code_hash = filebase64sha256("../function.zip")
  function_name    = "myapp-api"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "handler.handler"  # File: handler.js, Function: handler
  runtime          = "nodejs20.x"
  timeout          = 30

  vpc_config {
    subnet_ids         = var.public_subnet_ids
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_HOST     = aws_db_instance.mysql.address
      DB_USER     = var.db_username
      DB_NAME     = var.db_name
      DB_SECRET_ARN = aws_secretsmanager_secret.db_password.arn
      NODE_ENV    = "production"
    }
  }
}