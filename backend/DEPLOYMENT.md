# Luna RAG Backend Deployment Guide

This guide will help you deploy the Luna RAG backend to AWS Lambda using the Serverless Framework.

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **Node.js** (v18 or higher)
3. **AWS CLI** configured with your credentials
4. **Serverless Framework** installed globally

### Setup AWS CLI

```bash
# Configure AWS CLI
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter default region (recommended: us-east-1)
# Enter default output format (json)
```

### Install Serverless Framework

```bash
npm install -g serverless
```

## Quick Deployment

### 1. Configure Environment

The backend uses environment variables for configuration. Update `serverless.yml` with your specific values:

```yaml
environment:
  NODE_ENV: ${opt:stage, 'dev'}
  LEMONSQUEEZY_API_KEY: ${ssm:/luna-rag/lemonsqueezy-api-key}
  LEMONSQUEEZY_STORE_ID: '214097'
  LEMONSQUEEZY_WEBHOOK_SECRET: ${ssm:/luna-rag/webhook-secret}
  JWT_SECRET: ${ssm:/luna-rag/jwt-secret}
  DYNAMODB_TABLE: ${self:service}-users-${opt:stage, 'dev'}
  REGION: ${self:provider.region}
```

### 2. Store Secrets in AWS Systems Manager (SSM)

```bash
# Store LemonSqueezy API key
aws ssm put-parameter \
  --name "/luna-rag/lemonsqueezy-api-key" \
  --value "your-lemonsqueezy-api-key" \
  --type "SecureString" \
  --description "Luna RAG LemonSqueezy API Key"

# Store webhook secret
aws ssm put-parameter \
  --name "/luna-rag/webhook-secret" \
  --value "your-webhook-secret" \
  --type "SecureString" \
  --description "Luna RAG Webhook Secret"

# Store JWT secret
aws ssm put-parameter \
  --name "/luna-rag/jwt-secret" \
  --value "your-jwt-secret-key" \
  --type "SecureString" \
  --description "Luna RAG JWT Secret"
```

### 3. Deploy

```bash
# Clone and navigate to backend directory
cd backend

# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

## Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Install dependencies
npm install

# Deploy to dev stage
serverless deploy --stage dev

# Deploy to production
serverless deploy --stage prod
```

## Post-Deployment Configuration

### 1. LemonSqueezy Webhook Setup

After deployment, configure LemonSqueezy webhooks:

1. Go to your LemonSqueezy dashboard
2. Navigate to Settings → Webhooks
3. Add a new webhook with URL: `[YOUR_API_ENDPOINT]/webhook`
4. Enable these events:
   - Order created
   - Subscription created
   - Subscription payment succeeded
   - Subscription cancelled
   - Subscription updated

### 2. API Endpoint Configuration

Update your Claude Code plugin configuration with the new API endpoint:

```json
{
  "apiEndpoint": "https://your-api-id.execute-api.us-east-1.amazonaws.com/dev",
  "apiKey": "your-jwt-token-for-authentication"
}
```

### 3. Test the Deployment

```bash
# Test health endpoint
curl https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/health

# Test status endpoint
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/query \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user", "message": "status"}'
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment stage (dev/prod) | Yes |
| `LEMONSQUEEZY_API_KEY` | LemonSqueezy API key | Yes |
| `LEMONSQUEEZY_STORE_ID` | LemonSqueezy store ID (214097) | Yes |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Webhook signature secret | Yes |
| `JWT_SECRET` | JWT token signing secret | Yes |
| `DYNAMODB_TABLE` | DynamoDB table name | Yes |
| `REGION` | AWS region | Yes |

## AWS Resources Created

The deployment will create:

- **Lambda Functions**: API handlers for RAG queries
- **API Gateway**: HTTP endpoint for the API
- **DynamoDB Table**: User data and usage tracking
- **IAM Roles**: Permissions for Lambda functions
- **CloudWatch Logs**: Logging and monitoring

## Monitoring and Debugging

### View Logs

```bash
# View function logs
serverless logs -f ragQuery --stage dev

# View all logs
serverless logs --stage dev
```

### Monitor Usage

```bash
# Check DynamoDB table
aws dynamodb scan --table-name "luna-rag-backend-users-dev"

# Check CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace "AWS/Lambda" \
  --metric-name "Invocations" \
  --dimensions Name=FunctionName,Value=ragQuery-dev \
  --start-time $(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --period 60 \
  --statistics Sum
```

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure your AWS user has Lambda, API Gateway, and DynamoDB permissions
2. **Environment Variables**: Check that all required variables are set in SSM
3. **LemonSqueezy Integration**: Verify webhook URL and API key are correct
4. **CORS Issues**: Ensure API Gateway has CORS enabled for your domain

### Deployment Rollback

```bash
# Remove all resources
serverless remove --stage dev
```

### Performance Tuning

- Adjust Lambda memory and timeout in `serverless.yml`
- Enable Lambda concurrency limits if needed
- Configure DynamoDB auto-scaling for high traffic

## Security Considerations

1. **API Security**: All endpoints require JWT authentication
2. **Data Encryption**: DynamoDB encryption enabled by default
3. **Secrets Management**: Use AWS SSM Parameter Store for sensitive data
4. **Network Security**: API Gateway with WAF recommended for production
5. **Monitoring**: Enable CloudWatch Alarms for suspicious activity

## Production Checklist

- [ ] Enable API Gateway throttling
- [ ] Set up CloudWatch Alarms
- [ ] Configure backup for DynamoDB
- [ ] Enable VPC for Lambda if required
- [ ] Set up custom domain for API Gateway
- [ ] Configure SSL certificates
- [ ] Set up monitoring dashboards
- [ ] Test load balancing
- [ ] Verify LemonSqueezy webhook security

## Support

For deployment issues:

1. Check AWS CloudWatch logs
2. Verify environment variables in SSM
3. Test LemonSqueezy webhook connectivity
4. Review IAM permissions
5. Contact support if issues persist