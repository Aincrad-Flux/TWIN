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
const fs = require('fs').promises;
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
router.post('/test', async (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    const date = new Date();
    const dateFolder = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const webhookData = {
      timestamp,
      headers: req.headers,
      body: req.body,
      queryParams: req.query,
      method: req.method,
      url: req.url,
      ip: req.ip
    };

    // Create date folder if it doesn't exist
    const dateFolderPath = path.join(__dirname, '../../logs', dateFolder);
    await fs.mkdir(dateFolderPath, { recursive: true });

    // Create filename with timestamp
    const filename = `webhook-test-${timestamp.replace(/[:.]/g, '-')}.json`;
    const logPath = path.join(dateFolderPath, filename);

    // Save webhook data to file
    await fs.writeFile(logPath, JSON.stringify(webhookData, null, 2), 'utf8');

    logger.info(`Webhook test data saved to: ${dateFolder}/${filename}`);

    res.status(200).json({
      message: 'T.W.I.N Webhooks operational',
      timestamp,
      received: true,
      bodyType: typeof req.body,
      hasBody: !!req.body,
      logFile: `${dateFolder}/${filename}`
    });
  } catch (error) {
    logger.error('Error saving webhook test data:', error);

    // Fallback to console if file writing fails
    console.log('=== WEBHOOK RECEIVED (FALLBACK) ===');
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Query params:', req.query);
    console.log('===================================');

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