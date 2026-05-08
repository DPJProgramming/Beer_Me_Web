# AWS Setup Guide for Beer Me Web Terraform

## Step 1: Get Your VPC ID and Subnet IDs

### Find Your VPC ID:
1. Go to AWS Console: https://console.aws.amazon.com/vpc/
2. Click **"Your VPCs"** in the left sidebar
3. Find your VPC (likely the default VPC)
4. Copy the **VPC ID** (format: `vpc-xxxxxxxxx`)
5. Add to `terraform.tfvars`:
   ```
   vpc_id = "vpc-xxxxxxxxx"
   ```

### Find Your Public Subnet IDs:
1. In AWS VPC Console, click **"Subnets"** in the left sidebar
2. Filter by your VPC ID from Step 1
3. Look for subnets marked as "Public" (Route Table has route to Internet Gateway)
4. Select at least 2 subnets in different Availability Zones
5. Copy their **Subnet IDs** (format: `subnet-xxxxxxxxx`)
6. Add to `terraform.tfvars`:
   ```
   public_subnet_ids = [
     "subnet-xxxxxxxx",
     "subnet-yyyyyyyy"
   ]
   ```

## Step 2: Prepare Your Database Password

Choose a secure database password:
- Minimum 8 characters
- Mix uppercase, lowercase, numbers, and special characters
- Example: `P@ssw0rd!MyBeerApp`

Add to `terraform.tfvars`:
```
db_password = "YourSecurePasswordHere"
```

## Step 3: S3 Bucket for CloudFront (Optional but Recommended)

If you want to serve static files via CloudFront:

1. Create an S3 bucket:
   ```bash
   aws s3 mb s3://your-static-bucket-name --region us-east-1
   ```

2. Get your bucket domain name:
   - Format: `your-static-bucket-name.s3.amazonaws.com`

3. In `terraform/cloudfront.tf`, update the origin:
   ```hcl
   domain_name = "your-static-bucket-name.s3.amazonaws.com"
   ```

## Step 4: Create CloudFront Origin Access Identity (OAI) - Optional

For secure S3 access via CloudFront:

1. AWS Console > CloudFront > Origin Access Identities
2. Click "Create Origin Access Identity"
3. Copy the resulting OAI ARN: `origin-access-identity/cloudfront/ABCDEFG123456`
4. Update in `terraform/cloudfront.tf`:
   ```hcl
   origin_access_identity = "origin-access-identity/cloudfront/ABCDEFG123456"
   ```

## Step 5: Lambda Function ZIP

Your Lambda function needs to be packaged as `function.zip`:

```bash
# From project root
cd /path/to/Beer_Me_Web
zip -r function.zip handler.js node_modules/
```

This creates `function.zip` in your project root.

## Step 6: AWS Credentials

Ensure your AWS credentials are configured:

### Option A: AWS CLI (Recommended)
```bash
aws configure
# Enter: AWS Access Key ID
# Enter: AWS Secret Access Key
# Enter: Default region: us-east-1
```

### Option B: Environment Variables
```bash
# PowerShell
$env:AWS_ACCESS_KEY_ID = "your-access-key"
$env:AWS_SECRET_ACCESS_KEY = "your-secret-key"
$env:AWS_DEFAULT_REGION = "us-east-1"

# Bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

### Get Your AWS Credentials:
1. AWS Console > IAM > Users > (Your User)
2. Click "Create access key"
3. Copy **Access Key ID** and **Secret Access Key**
4. ⚠️ Store securely, never commit to git

## Step 7: Create terraform.tfvars

1. Copy the example file:
   ```bash
   cp terraform/terraform.tfvars.example terraform/terraform.tfvars
   ```

2. Edit `terraform/terraform.tfvars` with your values:
   ```hcl
   vpc_id = "vpc-xxxxxxxxxxxxxxxxx"
   public_subnet_ids = ["subnet-12345678", "subnet-87654321"]
   db_password = "YourSecurePasswordHere"
   ```

3. Make sure `.gitignore` includes `*.tfvars` (it should already)

## Step 8: Deploy

```bash
cd terraform/

# Initialize Terraform
terraform init

# Review changes
terraform plan

# Apply changes
terraform apply
```

## Troubleshooting

### "Error: error reading S3 Bucket"
- Make sure the S3 bucket name in `main.tf` is correct
- Bucket must already exist: `aws s3api list-buckets`

### "Error: InvalidParameterValue"
- Check that VPC ID and Subnet IDs are correct
- Verify subnets belong to the VPC
- Ensure subnets are in different Availability Zones

### "Error: InvalidInput - Subnet is not public"
- Update `cloudfront.tf` to use private subnets if needed
- Or configure NAT Gateway for RDS access

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `terraform.tfvars` (contains passwords)
- Never commit `secrets.json`, `*.tfstate`, or `*.tfstate.bak`
- These are protected by `.gitignore` - verify before pushing to git
- Rotate credentials regularly
- Use AWS Secrets Manager (configured in `secrets.tf`) for runtime secrets

## Reference: AWS Service Locations

| Service | AWS Console Path |
|---------|-----------------|
| VPC | https://console.aws.amazon.com/vpc/ |
| Subnets | VPC > Subnets |
| CloudFront | https://console.aws.amazon.com/cloudfront/ |
| RDS | https://console.aws.amazon.com/rds/ |
| Lambda | https://console.aws.amazon.com/lambda/ |
| IAM | https://console.aws.amazon.com/iam/ |
| Secrets Manager | https://console.aws.amazon.com/secretsmanager/ |

---

Once you've completed these steps, your Terraform files are ready to deploy!
