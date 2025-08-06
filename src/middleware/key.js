/*
 * T.W.I.N - Ticket Workflow Integration Network
 *
 *   Author : Pandor
 *   Organization : Aincrad-Flux
 *
 *  filename : src/middleware/key.js
 *  description : Middleware for handling API key validation
*/

const logger = require('../config/logger');

/**
 * Middleware to validate admin API key
 * The admin API key is required for configuration management endpoints
 */
const validateAdminApiKey = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    const adminApiKey = process.env.ADMIN_API_KEY;

    if (!adminApiKey) {
      logger.error('ADMIN_API_KEY not configured in environment variables');
      return res.status(500).json({
        status: 'error',
        message: 'Server configuration error'
      });
    }

    if (!apiKey) {
      logger.warn('API key not provided in request', {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        endpoint: req.originalUrl
      });
      return res.status(401).json({
        status: 'error',
        message: 'API key required'
      });
    }

    if (apiKey !== adminApiKey) {
      logger.warn('Invalid API key provided', {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        endpoint: req.originalUrl,
        providedKey: apiKey.substring(0, 8) + '...' // Log only first 8 chars for security
      });
      return res.status(403).json({
        status: 'error',
        message: 'Invalid API key'
      });
    }

    logger.info('Admin API key validated successfully', {
      ip: req.ip,
      endpoint: req.originalUrl
    });

    next();
  } catch (error) {
    logger.error('Error validating API key:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  validateAdminApiKey
};

