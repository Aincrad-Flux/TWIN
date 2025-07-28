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
- `GET /webhooks/test` - Test webhook connectivity

## Supported Webhook Events

The service currently handles these Jira webhook events:

1. **`jira:issue_created`** - Triggered when a new issue is created
2. **`jira:issue_updated`** - Triggered when an issue is updated
3. **`comment_created`** - Triggered when a comment is added to an issue

## Authentication

Currently, the service validates Jira webhooks by checking the User-Agent header for "Atlassian" string.

> **Note**: This is a basic validation. For production use, consider implementing:
> - IP whitelist validation
> - Webhook signature verification
> - API key authentication

## Testing the API

### Health Check
```bash
curl -X GET http://localhost:3000/health
```

### Webhook Test
```bash
curl -X GET http://localhost:3000/webhooks/test
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
