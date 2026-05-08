output "cloudfront_url" {
  value = "https://${aws_cloudfront_distribution.main.domain_name}"
}
output "api_endpoint" {
  value = aws_apigatewayv2_api.main.api_endpoint
}
output "db_host" {
  value = aws_db_instance.mysql.address
}