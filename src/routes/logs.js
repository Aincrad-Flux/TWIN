/*
 * T.W.I.N - Ticket Workflow Integration Network
 *
 *   Author : Pandor
 *   Organization : Aincrad-Flux
 *
 *  filename : src/routes/logs.js
 *  description : Routes for handling log management and retrieval
*/

const express = require('express');
const path = require('path');
const router = express.Router();
const logger = require('../config/logger');
const { validateAdminApiKey } = require('../middleware/key');
const logManager = require('../utils/logManager');

// Get list of all log files
router.get('/logs', validateAdminApiKey, async (req, res) => {
  try {
    const files = await logManager.getLogFiles();

    logger.info('Log files list retrieved successfully', {
      requestedBy: req.ip,
      fileCount: files.length
    });

    res.status(200).json({
      status: 'success',
      data: {
        files: files.map(file => ({
          ...file,
          sizeFormatted: logManager.formatFileSize(file.size)
        })),
        total: files.length
      }
    });
  } catch (error) {
    logger.error('Error retrieving log files:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve log files'
    });
  }
});

// Get log statistics
router.get('/logs/stats', validateAdminApiKey, async (req, res) => {
  try {
    const stats = await logManager.getLogStats();

    logger.info('Log statistics retrieved successfully', {
      requestedBy: req.ip,
      totalFiles: stats.totalFiles
    });

    res.status(200).json({
      status: 'success',
      data: {
        ...stats,
        totalSizeFormatted: logManager.formatFileSize(stats.totalSize),
        byType: Object.entries(stats.byType).reduce((acc, [type, data]) => {
          acc[type] = {
            ...data,
            sizeFormatted: logManager.formatFileSize(data.size)
          };
          return acc;
        }, {})
      }
    });
  } catch (error) {
    logger.error('Error retrieving log statistics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve log statistics'
    });
  }
});

// Get content of a specific log file
router.get('/logs/file/:filename(*)', validateAdminApiKey, async (req, res) => {
  try {
    const { filename } = req.params;
    const { lines, tail, filter } = req.query;

    const options = {
      lines: lines ? parseInt(lines) : null,
      tail: tail === 'true',
      filter: filter || null
    };

    const content = await logManager.readLogFile(filename, options);

    logger.info('Log file content retrieved successfully', {
      requestedBy: req.ip,
      filename,
      options
    });

    res.status(200).json({
      status: 'success',
      data: content
    });
  } catch (error) {
    logger.error('Error retrieving log file content:', error);

    if (error.message.includes('Access denied')) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied to requested file'
      });
    }

    if (error.code === 'ENOENT') {
      return res.status(404).json({
        status: 'error',
        message: 'Log file not found'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve log file content'
    });
  }
});

// Get recent error logs
router.get('/logs/errors', validateAdminApiKey, async (req, res) => {
  try {
    const { lines = 50 } = req.query;

    const content = await logManager.readLogFile('error.log', {
      lines: parseInt(lines),
      tail: true
    });

    logger.info('Error logs retrieved successfully', {
      requestedBy: req.ip,
      lines: parseInt(lines)
    });

    res.status(200).json({
      status: 'success',
      data: content
    });
  } catch (error) {
    logger.error('Error retrieving error logs:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve error logs'
    });
  }
});

// Get recent combined logs
router.get('/logs/combined', validateAdminApiKey, async (req, res) => {
  try {
    const { lines = 100 } = req.query;

    const content = await logManager.readLogFile('combined.log', {
      lines: parseInt(lines),
      tail: true
    });

    logger.info('Combined logs retrieved successfully', {
      requestedBy: req.ip,
      lines: parseInt(lines)
    });

    res.status(200).json({
      status: 'success',
      data: content
    });
  } catch (error) {
    logger.error('Error retrieving combined logs:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve combined logs'
    });
  }
});

// Search across log files
router.get('/logs/search', validateAdminApiKey, async (req, res) => {
  try {
    const { q: query, file, limit = 100, case_sensitive } = req.query;

    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Query parameter "q" is required'
      });
    }

    const options = {
      filePattern: file || null,
      limit: parseInt(limit),
      caseSensitive: case_sensitive === 'true'
    };

    const results = await logManager.searchLogs(query, options);

    logger.info('Log search completed successfully', {
      requestedBy: req.ip,
      query,
      resultCount: results.totalResults
    });

    res.status(200).json({
      status: 'success',
      data: results
    });
  } catch (error) {
    logger.error('Error searching logs:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search logs'
    });
  }
});

// Clean old log files
router.delete('/logs/cleanup', validateAdminApiKey, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const result = await logManager.cleanOldLogs(parseInt(days));

    logger.info('Log cleanup completed successfully', {
      requestedBy: req.ip,
      daysToKeep: parseInt(days),
      deletedCount: result.deletedCount
    });

    res.status(200).json({
      status: 'success',
      message: 'Log cleanup completed successfully',
      data: {
        ...result,
        deletedSizeFormatted: logManager.formatFileSize(result.deletedSize)
      }
    });
  } catch (error) {
    logger.error('Error during log cleanup:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to clean up logs'
    });
  }
});

// Get webhook logs for a specific date
router.get('/logs/webhooks/:date', validateAdminApiKey, async (req, res) => {
  try {
    const { date } = req.params;

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    const files = await logManager.getLogFiles();
    const webhookFiles = files.filter(file =>
      file.type === 'webhook' && file.name.startsWith(date)
    );

    logger.info('Webhook logs for date retrieved successfully', {
      requestedBy: req.ip,
      date,
      fileCount: webhookFiles.length
    });

    res.status(200).json({
      status: 'success',
      data: {
        date,
        files: webhookFiles.map(file => ({
          ...file,
          sizeFormatted: logManager.formatFileSize(file.size)
        })),
        total: webhookFiles.length
      }
    });
  } catch (error) {
    logger.error('Error retrieving webhook logs for date:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve webhook logs for specified date'
    });
  }
});

// Get recent webhook logs (last 24 hours)
router.get('/logs/webhooks/recent', validateAdminApiKey, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const files = await logManager.getLogFiles();

    // Filter webhook files from last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentWebhooks = files
      .filter(file => file.type === 'webhook' && file.modified > yesterday)
      .slice(0, parseInt(limit));

    logger.info('Recent webhook logs retrieved successfully', {
      requestedBy: req.ip,
      limit: parseInt(limit),
      fileCount: recentWebhooks.length
    });

    res.status(200).json({
      status: 'success',
      data: {
        files: recentWebhooks.map(file => ({
          ...file,
          sizeFormatted: logManager.formatFileSize(file.size)
        })),
        total: recentWebhooks.length,
        period: 'last 24 hours'
      }
    });
  } catch (error) {
    logger.error('Error retrieving recent webhook logs:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve recent webhook logs'
    });
  }
});

module.exports = router;


