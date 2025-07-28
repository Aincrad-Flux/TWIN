/*
 * T.W.I.N - Ticket Workflow Integration Network
 *
 *   Author : Pandor
 *   Organization : Aincrad-Flux
 *
 *  filename : src/routes/webhooks.js
 *  description : Routes for handling Jira webhooks and providing a test endpoint
*/

const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const syncService = require('../services/syncService');

// Middleware pour valider les webhooks Jira
const validateJiraWebhook = (req, res, next) => {
  // TODO: Ajouter validation IP, signature, etc.
  const userAgent = req.get('User-Agent');
  if (!userAgent || !userAgent.includes('Atlassian')) {
    logger.warn(`Webhook suspect reçu de ${req.ip}`);
  }
  next();
};

// Endpoint principal pour les webhooks Jira
router.post('/jira', validateJiraWebhook, async (req, res) => {
  try {
    const { webhookEvent, issue } = req.body;

    logger.info(`Webhook reçu: ${webhookEvent}`, {
      issueKey: issue?.key,
      issueType: issue?.fields?.issuetype?.name,
      status: issue?.fields?.status?.name
    });

    // Traitement asynchrone de la synchronisation
    await syncService.handleWebhook(webhookEvent, req.body);

    res.status(200).json({
      status: 'accepted',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Erreur lors du traitement du webhook:', error);
    res.status(500).json({
      error: 'Erreur lors du traitement',
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint de test
router.get('/test', (req, res) => {
  res.json({
    message: 'Webhooks T.W.I.N opérationnels',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;