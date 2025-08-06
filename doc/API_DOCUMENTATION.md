# T.W.I.N API Documentation

This directory contains the API documentation for the T.W.I.N (Ticket Workflow Integration Network) service.

## Files

- `swagger.yaml` - OpenAPI 3.0 specification for the T.W.I.N API
- `CONTRIBUTING.md` - Guidelines for contributing to the project

## Viewing the API Documentation

### Online Swagger Editor
1. Copy the content of `swagger.yaml`
2. Go to [Swagger Editor](https://editor.swagger.io/)
3. Paste the content to view the interactive documentation

### Local Swagger UI (Recommended)

#### Option 1: Using Docker
```bash
# Run Swagger UI with Docker
docker run -p 8080:8080 -v $(pwd)/doc:/usr/share/nginx/html/swagger -e SWAGGER_JSON=/swagger/swagger.yaml swaggerapi/swagger-ui

# Access the documentation at: http://localhost:8080
```

#### Option 2: Using Swagger UI Express (if you want to integrate it into the app)
```bash
# Install swagger dependencies
npm install swagger-ui-express yamljs

# Add to your Express app (example)
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./doc/swagger.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

## API Overview

The T.W.I.N API provides the following endpoints:

### Health Monitoring
- `GET /health` - Check service health status

### Webhooks
- `POST /webhooks/jira` - Receive and process Jira webhooks
- `POST /webhooks/test` - Test webhook connectivity and validation

## Supported Webhook Events

The service currently handles these Jira webhook events:

1. **`jira:issue_created`** - Triggered when a new issue is created
2. **`jira:issue_updated`** - Triggered when an issue is updated
3. **`comment_created`** - Triggered when a comment is added to an issue

## Authentication

The service validates Jira webhooks through multiple security layers:

1. **User-Agent Validation**: Checks for "Atlassian" in the User-Agent header
2. **IP Whitelist**: Validates requests from allowed IP addresses (configurable)
3. **HMAC Signature**: Verifies webhook signature when configured

### Configuration
Security features can be configured via environment variables:
- `JIRA_REQUIRE_USER_AGENT=true` - Enable User-Agent validation
- `JIRA_ALLOWED_IPS=ip1,ip2,ip3` - Comma-separated list of allowed IPs
- `JIRA_WEBHOOK_SECRET=secret` - HMAC secret for signature validation
- `JIRA_VALIDATE_SIGNATURE=true` - Enable signature validation

> **Note**: For production environments, all security features should be enabled.

## Testing the API

### Health Check
```bash
curl -X GET http://localhost:3000/health
```

### Webhook Test
```bash
curl -X POST http://localhost:3000/webhooks/test \
  -H "Content-Type: application/json" \
  -H "User-Agent: Atlassian-HttpClient/1.0" \
  -d '{
    "test": true,
    "message": "Testing webhook endpoint"
  }'
```

### Simulate Jira Webhook
```bash
curl -X POST http://localhost:3000/webhooks/jira \
  -H "Content-Type: application/json" \
  -H "User-Agent: Atlassian-HttpClient/1.0" \
  -d '{
    "webhookEvent": "jira:issue_created",
    "timestamp": 1690540800000,
    "issue": {
      "key": "TEST-123",
      "fields": {
        "summary": "Test issue",
        "issuetype": { "name": "Bug" },
        "status": { "name": "Open" }
      }
    }
  }'
```

## Logging and Monitoring

### Request Logging
The service automatically logs all webhook requests to JSON files in the `logs/` directory:
- **Webhook Test Requests**: `logs/YYYY-MM-DD/webhook-test-*.json`
- **Jira Webhook Requests**: `logs/YYYY-MM-DD/jira-webhook-*.json`

### Log Structure
```json
{
  "timestamp": "2025-08-06T10:30:00.000Z",
  "method": "POST",
  "url": "/webhooks/test",
  "headers": {
    "user-agent": "Atlassian-HttpClient/1.0",
    "content-type": "application/json"
  },
  "body": {
    "test": true,
    "message": "Testing webhook endpoint"
  },
  "ip": "127.0.0.1"
}
```

### Application Logs
Application logs are written to:
- `logs/combined.log` - All log levels
- `logs/error.log` - Error level only
- Console output in development mode

## API Endpoints Detail

### Health Check Endpoint
**GET** `/health`

Returns the current status of the T.W.I.N service.

**Response:**
```json
{
  "status": "OK",
  "service": "T.W.I.N",
  "timestamp": "2025-08-06T10:30:00.000Z"
}
```

### Jira Webhook Endpoint
**POST** `/webhooks/jira`

Processes Jira webhook events with full security validation.

**Security Requirements:**
- Valid User-Agent containing "Atlassian"
- Source IP in allowed list (if configured)
- Valid HMAC signature (if configured)

**Response:**
```json
{
  "status": "accepted",
  "timestamp": "2025-08-06T10:30:00.000Z"
}
```

### Test Webhook Endpoint
**POST** `/webhooks/test`

Tests webhook reception and validation, logs the request for debugging.

**Response:**
```json
{
  "message": "T.W.I.N Webhooks operational",
  "timestamp": "2025-08-06T10:30:00.000Z",
  "received": true,
  "bodyType": "object",
  "hasBody": true,
  "logFile": "webhook-test-2025-08-06T10-30-00-000Z.json"
}
```

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "error": "Invalid User-Agent",
  "timestamp": "2025-08-06T10:30:00.000Z"
}
```

**404 Not Found:**
```json
{
  "error": "Route not found",
  "timestamp": "2025-08-06T10:30:00.000Z"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Processing error",
  "timestamp": "2025-08-06T10:30:00.000Z"
}
```

## Updating the Documentation

When you add new endpoints or modify existing ones:

1. Update the `swagger.yaml` file
2. Follow the OpenAPI 3.0 specification
3. Add examples for request/response bodies
4. Update this README if necessary
5. Test the documentation with Swagger UI

## Resources

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger Editor](https://editor.swagger.io/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Jira Webhooks Documentation](https://developer.atlassian.com/cloud/jira/platform/webhooks/)
