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

// Middleware to validate Jira webhooks
const validateJiraWebhook = (req, res, next) => {
  // TODO: Add IP validation, signature, etc.
  const userAgent = req.get('User-Agent');
  if (!userAgent || !userAgent.includes('Atlassian')) {
    logger.warn(`Suspicious webhook received from ${req.ip}`);
  }
  next();
};

// Main endpoint for Jira webhooks
router.post('/jira', validateJiraWebhook, async (req, res) => {
  try {
    const { webhookEvent, issue } = req.body;

    logger.info(`Webhook received: ${webhookEvent}`, {
      issueKey: issue?.key,
      issueType: issue?.fields?.issuetype?.name,
      status: issue?.fields?.status?.name
    });

    // Asynchronous processing of synchronization
    await syncService.handleWebhook(webhookEvent, req.body);

    res.status(200).json({
      status: 'accepted',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).json({
      error: 'Processing error',
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    message: 'T.W.I.N Webhooks operational',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;