/*
 * T.W.I.N - Ticket Workflow Integration Network
 *
 *   Author : Pandor
 *   Organization : Aincrad-Flux
 *
 *  filename : src/app.js
 *  description : Application Express for handling Jira webhooks and synchronizations
*/

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const webhookRoutes = require('./routes/webhooks');
const configRoutes = require('./routes/config');
const logRoutes = require('./routes/logs');
const logger = require('./config/logger');

const app = express();

// Load Swagger documentation with error handling
let swaggerDocument = null;
const swaggerPath = path.join(__dirname, '../doc/swagger.yaml');

try {
  const fs = require('fs');
  if (fs.existsSync(swaggerPath)) {
    swaggerDocument = YAML.load(swaggerPath);
    logger.info('📚 Swagger documentation loaded successfully');
  } else {
    logger.warn('⚠️  Swagger file not found at:', swaggerPath);
  }
} catch (error) {
  logger.error('❌ Error loading Swagger documentation:', error.message);
}

// Security and utility middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' })); // For large Jira payloads

// Swagger documentation route (only if swagger document is loaded)
if (swaggerDocument) {
  app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'T.W.I.N API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
    }
  }));
} else {
  // Fallback route when Swagger is not available
  app.get('/doc', (req, res) => {
    res.status(503).json({
      error: 'API Documentation not available',
      message: 'Swagger documentation could not be loaded',
      timestamp: new Date().toISOString()
    });
  });
}

// Routes
app.use('/webhooks', webhookRoutes);
app.use('/api/config', configRoutes);
app.use('/api/logs', logRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'T.W.I.N',
    timestamp: new Date().toISOString()
  });
});

// Global error handling
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 route
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
