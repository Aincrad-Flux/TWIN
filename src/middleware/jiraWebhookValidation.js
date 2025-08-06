/*
 * T.W.I.N - Ticket Workflow Integration Network
 *
 *   Author : Pandor
 *   Organization : Aincrad-Flux
 *
 *  filename : src/middleware/jiraWebhookValidation.js
 *  description : Middleware for validating Jira webhooks (signature, IP, User-Agent)
*/

const crypto = require('crypto');
const logger = require('../config/logger');
const webhookConfig = require('../config/webhook');

/**
 * Middleware to validate Jira webhooks
 * Validates signature HMAC, User-Agent and allowed IPs
 */
const validateJiraWebhook = (req, res, next) => {
  try {
    // Validation du User-Agent
    if (webhookConfig.jira.requireUserAgent) {
      const userAgent = req.get('User-Agent');
      if (!userAgent || !userAgent.includes('Atlassian')) {
        logger.warn(`Suspicious webhook received from ${req.ip} - Invalid User-Agent: ${userAgent}`);
        if (process.env.NODE_ENV === 'production') {
          return res.status(401).json({
            error: 'Invalid User-Agent',
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    // Validation de la signature HMAC
    if (webhookConfig.jira.validateSignature && webhookConfig.jira.secret) {
      const signature = req.get('x-hub-signature');

      if (!signature) {
        logger.error(`No signature received from ${req.ip}`);
        return res.status(401).json({
          error: 'Missing signature',
          timestamp: new Date().toISOString()
        });
      }

      // Calculer la signature attendue avec le secret configuré
      const expectedSignature = crypto
        .createHmac('sha256', webhookConfig.jira.secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      // Extraire la signature reçue (enlever le préfixe "sha256=")
      const receivedSignature = signature.replace('sha256=', '');

      // Comparaison sécurisée pour éviter les attaques de timing
      if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(receivedSignature))) {
        logger.error(`Invalid webhook signature from ${req.ip}`, {
          expected: expectedSignature,
          received: receivedSignature,
          rawBody: JSON.stringify(req.body).substring(0, 100) + '...'
        });
        return res.status(401).json({
          error: 'Invalid signature',
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Webhook signature validated successfully');
    } else if (webhookConfig.jira.validateSignature) {
      logger.warn('Signature validation enabled but no secret configured');
    }

    // Validation des IPs autorisées (optionnel)
    if (webhookConfig.jira.allowedIPs && webhookConfig.jira.allowedIPs.length > 0) {
      const clientIP = req.ip || req.connection.remoteAddress;
      const forwardedIPs = req.get('x-forwarded-for');

      let isAllowed = false;
      if (clientIP && webhookConfig.jira.allowedIPs.includes(clientIP)) {
        isAllowed = true;
      } else if (forwardedIPs) {
        const ips = forwardedIPs.split(',').map(ip => ip.trim());
        isAllowed = ips.some(ip => webhookConfig.jira.allowedIPs.includes(ip));
      }

      if (!isAllowed) {
        logger.error(`Webhook from unauthorized IP: ${clientIP}, forwarded: ${forwardedIPs}`);
        return res.status(403).json({
          error: 'Unauthorized IP',
          timestamp: new Date().toISOString()
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Error validating webhook:', error);
    return res.status(500).json({
      error: 'Validation error',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  validateJiraWebhook
};
