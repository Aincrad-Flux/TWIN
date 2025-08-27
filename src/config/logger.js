/*
 * T.W.I.N - Ticket Workflow Integration Network
 *
 *   Author : Pandor
 *   Organization : Aincrad-Flux
 *
 *  filename : src/config/logger.js
 *  description : Configuration of the logger for T.W.I.N
*/

const winston = require('winston');
const fs = require('fs').promises;
const path = require('path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'twin' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// En développement, log aussi dans la console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Function to log webhook requests to files
logger.logRequest = async (req, prefix = 'webhook') => {
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
    const filename = `${prefix}-${timestamp.replace(/[:.]/g, '-')}.json`;
    const logPath = path.join(dateFolderPath, filename);

    // Save webhook data to file
    await fs.writeFile(logPath, JSON.stringify(webhookData, null, 2), 'utf8');

    logger.info(`Webhook request data saved to: ${dateFolder}/${filename}`);

    return `${dateFolder}/${filename}`;
  } catch (error) {
    logger.error('Error saving webhook request data:', error);

    // Fallback to console if file writing fails
    console.log('=== WEBHOOK RECEIVED (FALLBACK) ===');
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Query params:', req.query);
    console.log('===================================');

    throw error;
  }
};

module.exports = logger;