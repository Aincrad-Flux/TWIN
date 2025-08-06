/*
 * T.W.I.N - Ticket Workflow Integration Network
 *
 *   Author : Pandor
 *   Organization : Aincrad-Flux
 *
 *  filename : src/routes/config.js
 *  description : Routes for handling configuration management and retrieval.
 *  For get the environment variables and other configuration settings
 *  Need a admin api key to access those endpoints
*/

const express = require('express');
const path = require('path');
const router = express.Router();
const logger = require('../config/logger');
const { validateAdminApiKey } = require('../middleware/key');
const envManager = require('../utils/envManager');

// Endpoint to get the current configuration (protected)
router.get('/config', validateAdminApiKey, (req, res) => {
  try {
    // Retrieve configuration from environment variables or config file
    const config = {
      env: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3000,
      version: require('../../package.json').version,
      logLevel: process.env.LOG_LEVEL || 'info',
      dbHost: process.env.DB_HOST,
      dbPort: process.env.DB_PORT,
      dbName: process.env.DB_NAME
    };

    logger.info('Configuration retrieved successfully', {
      config: { ...config, requestedBy: req.ip }
    });

    res.status(200).json({
      status: 'success',
      data: config
    });
  } catch (error) {
    logger.error('Error retrieving configuration:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve configuration'
    });
  }
});

// Endpoint to get all environment variables (protected, excludes ADMIN_API_KEY)
router.get('/environment', validateAdminApiKey, (req, res) => {
  try {
    const envVars = envManager.getAllEnvVars();

    logger.info('Environment variables retrieved successfully', {
      requestedBy: req.ip,
      variableCount: Object.keys(envVars).length
    });

    res.status(200).json({
      status: 'success',
      data: envVars
    });
  } catch (error) {
    logger.error('Error retrieving environment variables:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve environment variables'
    });
  }
});

// Endpoint to get a specific environment variable (protected)
router.get('/environment/:key', validateAdminApiKey, (req, res) => {
  try {
    const { key } = req.params;
    const value = envManager.getEnvVar(key);

    if (value === undefined) {
      return res.status(404).json({
        status: 'error',
        message: `Environment variable '${key}' not found`
      });
    }

    logger.info('Environment variable retrieved successfully', {
      key,
      requestedBy: req.ip
    });

    res.status(200).json({
      status: 'success',
      data: {
        key,
        value
      }
    });
  } catch (error) {
    logger.error('Error retrieving environment variable:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve environment variable'
    });
  }
});

// Endpoint to update multiple environment variables (protected)
router.put('/environment', validateAdminApiKey, (req, res) => {
  try {
    const updates = req.body;

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        status: 'error',
        message: 'Request body must be an object with key-value pairs'
      });
    }

    const updatedVars = envManager.updateEnvVars(updates);

    logger.info('Environment variables updated successfully', {
      updatedKeys: Object.keys(updates),
      requestedBy: req.ip
    });

    res.status(200).json({
      status: 'success',
      message: 'Environment variables updated successfully',
      data: {
        updated: Object.keys(updates),
        total: Object.keys(updatedVars).length
      }
    });
  } catch (error) {
    logger.error('Error updating environment variables:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update environment variables'
    });
  }
});

// Endpoint to set a specific environment variable (protected)
router.put('/environment/:key', validateAdminApiKey, (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Value is required in request body'
      });
    }

    envManager.setEnvVar(key, value);

    logger.info('Environment variable set successfully', {
      key,
      requestedBy: req.ip
    });

    res.status(200).json({
      status: 'success',
      message: `Environment variable '${key}' updated successfully`,
      data: {
        key,
        value
      }
    });
  } catch (error) {
    logger.error('Error setting environment variable:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to set environment variable'
    });
  }
});

// Endpoint to delete an environment variable (protected)
router.delete('/environment/:key', validateAdminApiKey, (req, res) => {
  try {
    const { key } = req.params;

    // Get current env vars and remove the specified key
    const currentVars = envManager.getAllEnvVars();

    if (!(key in currentVars)) {
      return res.status(404).json({
        status: 'error',
        message: `Environment variable '${key}' not found`
      });
    }

    delete currentVars[key];
    envManager.updateEnvVars(currentVars);

    // Also remove from process.env
    delete process.env[key];

    logger.info('Environment variable deleted successfully', {
      key,
      requestedBy: req.ip
    });

    res.status(200).json({
      status: 'success',
      message: `Environment variable '${key}' deleted successfully`
    });
  } catch (error) {
    logger.error('Error deleting environment variable:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete environment variable'
    });
  }
});

// Endpoint to get protected variables list (for information only)
router.get('/protected-variables', validateAdminApiKey, (req, res) => {
  try {
    logger.info('Protected variables list requested', { requestedBy: req.ip });

    res.status(200).json({
      status: 'success',
      data: {
        protectedVariables: envManager.PROTECTED_VARS,
        message: 'These variables cannot be retrieved or modified via API'
      }
    });
  } catch (error) {
    logger.error('Error retrieving protected variables list:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve protected variables list'
    });
  }
});

module.exports = router;
