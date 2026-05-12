resource "aws_lambda_function" "api" {
  # TODO: Ensure function.zip is built and located at ../function.zip
  # Build command: zip -r ../function.zip handler.js node_modules/
  filename      = "../function.zip"
  source_code_hash = filebase64sha256("../function.zip")
  function_name = "myapp-api"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "handler.handler" # File: handler.js, Function: handler
  runtime       = "nodejs22.x"
  timeout       = 60

  environment {
    variables = {
      BEERS_TABLE = aws_dynamodb_table.beers.name
      NODE_ENV    = "production"
      S3_BUCKET   = aws_s3_bucket.frontend.bucket
    }
  }
}
