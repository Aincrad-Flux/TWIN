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
require('dotenv').config();

const webhookRoutes = require('./routes/webhooks');
const logger = require('./config/logger');

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' })); // For large Jira payloads

// Routes
app.use('/webhooks', webhookRoutes);

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
