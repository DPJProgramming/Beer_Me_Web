output "cloudfront_url" {
  value = "https://${aws_cloudfront_distribution.main.domain_name}"
}

output "api_endpoint" {
  value = aws_apigatewayv2_api.main.api_endpoint
}

output "dynamodb_table" {
  value = aws_dynamodb_table.beers.name
}