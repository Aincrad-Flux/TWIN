# T.W.I.N - Ticket Workflow Integration Network

[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Project Overview

**T.W.I.N** is a complete redesign of the legacy JIR.A project, designed to reliably synchronize two distinct Jira instances (internal and external) bidirectionally. The system enables development teams to maintain consistency between their internal tools and external platforms while keeping control over shared information.

### Use Case
- **Users**: Enterprise development teams
- **Deployment**: One T.W.I.N instance per development team
- **Volume**: ~20 tickets/day per team on average
- **Architecture**: Jira webhook-based with Docker containerization

## 🎯 Features by Priority

### 🔴 Core Features

#### 1. Bidirectional Issue Synchronization
- **External → Internal**: Complete automatic synchronization
  - Title reformatting: `ID | TYPE | Original Title`
  - Status mapping via labels
  - Preservation of all metadata
- **Internal → External**: On-demand synchronization
  - `!sync` tag to change status
  - Configured status mapping compliance

#### 2. Robust Anti Ping-Pong System
- Database modification tracking
- Correspondence tables between instances
- Infinite loop detection and prevention
- Detailed action logs for auditing

#### 3. Correspondence Management
- Robust database (PostgreSQL/MySQL)
- Ticket mapping table between instances
- Customizable status correspondence table
- Synchronization history

### 🟡 Secondary Features

#### 1. Comment Synchronization
- **Phase 1**: External → Internal only
- **Phase 2**: Bidirectional with `!send [comment]` tag
- Author and timestamp preservation
- System comment filtering

#### 2. Advanced Monitoring System
- Database logs (no more .log files)
- Teams bot "Cardinal" for critical alerts
- Synchronization dashboard (optional)
- Performance metrics

#### 3. Enhanced Error Handling
- Automatic retry system
- Synchronization queue for failures
- Teams notifications for critical errors
- Detailed error reports

### 🟢 Tertiary Features

#### 1. Attachment Synchronization
- File support between instances
- Permission and security management
- Configurable size limitations

#### 2. Web Monitoring Interface
- Synchronized ticket view
- Event history
- Mapping configuration
- Usage statistics

## 🛠 Tech Stack

### Backend
- **Runtime**: JavaScript with Express.js
- **Database**: PostgreSQL with connection pooling
- **Logging**: Winston with log rotation
- **Security**: Helmet, CORS protection
- **Development**: Nodemon for hot reloading

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Environment**: dotenv for configuration
- **Monitoring**: Request logging with Morgan

## 🏗 Architecture

### Core Components
1. **Webhook Receiver**: Jira event reception
2. **Sync Engine**: Synchronization logic and anti ping-pong
3. **Database Layer**: Correspondence and log management
4. **Notification Service**: Teams "Cardinal" integration
5. **Configuration Manager**: Mapping and rule management

### Database Schema (PostgreSQL)
```sql
-- Main tables
- tickets_mapping (internal_id, external_id, created_date, last_sync)
- sync_logs (timestamp, action, source, destination, status, details)
- status_mapping (external_status, internal_label)
- configuration (key, value, description)
```

### Security
- **Challenge**: Jira doesn't support webhook tokens
- **Solutions**:
  - Source IP validation (whitelist)
  - HMAC signature when possible
  - Dedicated endpoint with complex URL
  - Rate limiting to prevent abuse

## 🚀 Getting Started

### Prerequisites
- PostgreSQL 13+
- Docker & Docker Compose (for production)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Aincrad-Flux/TWIN.git
cd TWIN
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Database setup**
```bash
# Create database and run migrations
npm run db:setup
```

5. **Start development server**
```bash
npm run dev
```

### Docker Deployment

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f twin
```

## 📚 API Documentation

### Interactive Swagger Documentation
Once the server is running, access the interactive API documentation at:
- **Local Development**: http://localhost:3000/doc
- **Production**: https://your-domain.com/doc

The Swagger UI provides:
- Complete API endpoint documentation
- Interactive testing interface
- Request/response examples
- Authentication requirements

### Alternative Documentation Access
If the integrated Swagger UI is not available, you can:

1. **Use Online Swagger Editor**:
   - Copy content from `doc/swagger.yaml`
   - Visit [Swagger Editor](https://editor.swagger.io/)
   - Paste the content for interactive viewing

2. **Local Swagger UI with Docker**:
   ```bash
   docker run -p 8080:8080 -v $(pwd)/doc:/usr/share/nginx/html/swagger \
     -e SWAGGER_JSON=/swagger/swagger.yaml swaggerapi/swagger-ui
   ```
   Access at: http://localhost:8080

For detailed API documentation, see: [API_DOCUMENTATION.md](doc/API_DOCUMENTATION.md)

## 📊 Configuration

### Environment Variables
```env
# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=twin_db
DB_USER=twin_user
DB_PASSWORD=your_secure_password

# Jira Webhook Security Configuration
JIRA_WEBHOOK_SECRET=your-webhook-secret-key
JIRA_VALIDATE_SIGNATURE=true
JIRA_REQUIRE_USER_AGENT=true
JIRA_ALLOWED_IPS=185.166.141.115,another.ip.address

# Jira Instance Configuration (Future use)
INTERNAL_JIRA_URL=https://internal.jira.com
EXTERNAL_JIRA_URL=https://external.jira.com
JIRA_USERNAME=your_username
JIRA_API_TOKEN=your_api_token

# Teams Integration (Future use)
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...
```

### Configuration Details

#### Database Settings
- `DB_HOST`: PostgreSQL server hostname
- `DB_PORT`: PostgreSQL server port (default: 5432)
- `DB_NAME`: Database name for T.W.I.N
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password

#### Security Settings
- `JIRA_WEBHOOK_SECRET`: Secret key for HMAC signature validation
- `JIRA_VALIDATE_SIGNATURE`: Enable/disable webhook signature validation
- `JIRA_REQUIRE_USER_AGENT`: Require Atlassian User-Agent header
- `JIRA_ALLOWED_IPS`: Comma-separated list of allowed IP addresses

#### Application Settings
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `LOG_LEVEL`: Logging level (error/warn/info/debug)

### Status Mapping
Configure status mappings in the database or via the web interface:
```sql
INSERT INTO status_mapping (external_status, internal_label)
VALUES ('In Progress', 'WIP'), ('Done', 'COMPLETED');
```

## 🔧 API Endpoints

For complete API documentation with interactive testing, visit `/doc` when the server is running.

### Core Endpoints
- `GET /health` - Service health check
- `POST /webhooks/jira` - Jira webhook receiver (secured)
- `POST /webhooks/test` - Webhook testing endpoint

### Security
All webhook endpoints require proper authentication:
- Valid Atlassian User-Agent header
- IP address whitelist validation (configurable)
- HMAC signature verification (when configured)


## 📈 Monitoring

### Logs
- Structured logging with Winston
- Database log storage
- Log levels: ERROR, WARN, INFO, DEBUG

### Metrics
- Synchronization success/failure rates
- Response times
- Daily ticket volume

### Alerts
- Teams bot "Cardinal" for critical errors
- Webhook failure notifications
- Database connection issues

## 🐛 Troubleshooting

### Common Issues

**Ping-pong loops detected**
- Check the anti ping-pong system logs
- Verify ticket mapping table integrity
- Review synchronization timestamps

**Webhook not receiving events**
- Verify Jira webhook configuration
- Check firewall and network settings
- Validate endpoint URL accessibility

**Database connection errors**
- Check PostgreSQL service status
- Verify connection credentials
- Review database logs

## 🛡 Security Considerations

- Webhook endpoint IP whitelisting
- Rate limiting implementation
- Secure credential storage
- Regular security audits
- HTTPS enforcement in production


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Aincrad-Flux/TWIN/issues)
- **Documentation**: [Wiki](https://github.com/Aincrad-Flux/TWIN/wiki)
- **Teams**: Contact the development team via github issue

---

**Next Steps**: Stack validation, technical choices finalization, and MVP development kickoff.