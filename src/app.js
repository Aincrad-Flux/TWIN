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

// Middlewares de sécurité et utilitaires
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' })); // Pour les gros payloads Jira

// Routes
app.use('/webhooks', webhookRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'T.W.I.N',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  logger.error('Erreur non gérée:', err);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    timestamp: new Date().toISOString()
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
