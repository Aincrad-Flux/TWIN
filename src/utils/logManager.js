/*
 * T.W.I.N - Ticket Workflow Integration Network
 *
 *   Author : Pandor
 *   Organization : Aincrad-Flux
 *
 *  filename : src/utils/logManager.js
 *  description : Utility for managing and retrieving log files
*/

const fs = require('fs').promises;
const path = require('path');
const logger = require('../config/logger');

const LOGS_DIR = path.join(__dirname, '../../logs');

/**
 * Get list of available log files
 */
const getLogFiles = async () => {
  try {
    const files = await fs.readdir(LOGS_DIR);
    const logFiles = [];

    for (const file of files) {
      const filePath = path.join(LOGS_DIR, file);
      const stats = await fs.stat(filePath);

      if (stats.isFile() && (file.endsWith('.log') || file.endsWith('.json'))) {
        logFiles.push({
          name: file,
          size: stats.size,
          modified: stats.mtime,
          type: file.endsWith('.log') ? 'log' : 'json'
        });
      } else if (stats.isDirectory()) {
        // Check for webhook logs in date directories
        try {
          const subFiles = await fs.readdir(filePath);
          for (const subFile of subFiles) {
            if (subFile.endsWith('.json')) {
              const subFilePath = path.join(filePath, subFile);
              const subStats = await fs.stat(subFilePath);
              logFiles.push({
                name: `${file}/${subFile}`,
                size: subStats.size,
                modified: subStats.mtime,
                type: 'webhook'
              });
            }
          }
        } catch (error) {
          logger.warn(`Error reading subdirectory ${file}:`, error.message);
        }
      }
    }

    return logFiles.sort((a, b) => b.modified - a.modified);
  } catch (error) {
    logger.error('Error getting log files:', error);
    throw error;
  }
};

/**
 * Read a specific log file
 */
const readLogFile = async (filename, options = {}) => {
  try {
    const { lines = null, tail = false, filter = null } = options;
    const filePath = path.join(LOGS_DIR, filename);

    // Security check - ensure the file is within logs directory
    const resolvedPath = path.resolve(filePath);
    const resolvedLogsDir = path.resolve(LOGS_DIR);
    if (!resolvedPath.startsWith(resolvedLogsDir)) {
      throw new Error('Access denied: File outside logs directory');
    }

    const content = await fs.readFile(filePath, 'utf8');

    if (filename.endsWith('.json')) {
      // Parse JSON log files (webhook logs)
      return JSON.parse(content);
    }

    // Handle text log files
    let logLines = content.split('\n').filter(line => line.trim());

    // Apply filter if specified
    if (filter) {
      logLines = logLines.filter(line =>
        line.toLowerCase().includes(filter.toLowerCase())
      );
    }

    // Get specific number of lines
    if (lines) {
      if (tail) {
        logLines = logLines.slice(-lines);
      } else {
        logLines = logLines.slice(0, lines);
      }
    }

    return {
      filename,
      totalLines: content.split('\n').length,
      returnedLines: logLines.length,
      content: logLines
    };
  } catch (error) {
    logger.error(`Error reading log file ${filename}:`, error);
    throw error;
  }
};

/**
 * Get log statistics
 */
const getLogStats = async () => {
  try {
    const files = await getLogFiles();

    const stats = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      byType: {},
      recentActivity: files.slice(0, 5).map(file => ({
        name: file.name,
        modified: file.modified,
        size: file.size
      }))
    };

    // Group by type
    files.forEach(file => {
      if (!stats.byType[file.type]) {
        stats.byType[file.type] = { count: 0, size: 0 };
      }
      stats.byType[file.type].count++;
      stats.byType[file.type].size += file.size;
    });

    return stats;
  } catch (error) {
    logger.error('Error getting log statistics:', error);
    throw error;
  }
};

/**
 * Search across log files
 */
const searchLogs = async (query, options = {}) => {
  try {
    const { filePattern = null, limit = 100, caseSensitive = false } = options;
    const files = await getLogFiles();
    const results = [];

    const searchRegex = new RegExp(
      query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      caseSensitive ? 'g' : 'gi'
    );

    for (const file of files) {
      // Skip if file pattern specified and doesn't match
      if (filePattern && !file.name.includes(filePattern)) {
        continue;
      }

      try {
        const content = await fs.readFile(path.join(LOGS_DIR, file.name), 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          if (searchRegex.test(line)) {
            results.push({
              file: file.name,
              line: index + 1,
              content: line.trim(),
              timestamp: file.modified
            });

            if (results.length >= limit) {
              return;
            }
          }
        });

        if (results.length >= limit) {
          break;
        }
      } catch (error) {
        logger.warn(`Error searching in file ${file.name}:`, error.message);
      }
    }

    return {
      query,
      totalResults: results.length,
      results: results.slice(0, limit)
    };
  } catch (error) {
    logger.error('Error searching logs:', error);
    throw error;
  }
};

/**
 * Clean old log files
 */
const cleanOldLogs = async (daysToKeep = 30) => {
  try {
    const files = await getLogFiles();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const filesToDelete = files.filter(file => file.modified < cutoffDate);
    let deletedCount = 0;
    let deletedSize = 0;

    for (const file of filesToDelete) {
      try {
        await fs.unlink(path.join(LOGS_DIR, file.name));
        deletedCount++;
        deletedSize += file.size;
        logger.info(`Deleted old log file: ${file.name}`);
      } catch (error) {
        logger.warn(`Error deleting log file ${file.name}:`, error.message);
      }
    }

    return {
      deletedCount,
      deletedSize,
      remainingFiles: files.length - deletedCount
    };
  } catch (error) {
    logger.error('Error cleaning old logs:', error);
    throw error;
  }
};

/**
 * Format file size for display
 */
const formatFileSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

module.exports = {
  getLogFiles,
  readLogFile,
  getLogStats,
  searchLogs,
  cleanOldLogs,
  formatFileSize
};
