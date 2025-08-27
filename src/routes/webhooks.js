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
const path = require('path');
const router = express.Router();
const logger = require('../config/logger');
const syncService = require('../services/syncService');
const { validateJiraWebhook } = require('../middleware/jiraWebhookValidation');

// Main endpoint for Jira webhooks
router.post('/jira', validateJiraWebhook, async (req, res) => {
  try {
    const { webhookEvent, issue } = req.body;

    logger.info(`Webhook received: ${webhookEvent}`, {
      issueKey: issue?.key,
      issueType: issue?.fields?.issuetype?.name,
      status: issue?.fields?.status?.name
    });

    // Log the webhook request to file
    try {
      await logger.logRequest(req, 'jira-webhook');
    } catch (logError) {
      logger.warn('Failed to log webhook request to file, continuing processing', logError);
    }

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
router.post('/test', validateJiraWebhook, async (req, res) => {
  try {
    const timestamp = new Date().toISOString();

    // Use the logger function to save webhook data
    const logFile = await logger.logRequest(req, 'webhook-test');

    res.status(200).json({
      message: 'T.W.I.N Webhooks operational',
      timestamp,
      received: true,
      bodyType: typeof req.body,
      hasBody: !!req.body,
      logFile
    });
  } catch (error) {
    logger.error('Error saving webhook test data:', error);

    res.status(200).json({
      message: 'T.W.I.N Webhooks operational (with error)',
      timestamp: new Date().toISOString(),
      received: true,
      bodyType: typeof req.body,
      hasBody: !!req.body,
      error: 'Log file creation failed'
    });
  }
});

module.exports = router;