/*
 * T.W.I.N - Ticket Workflow Integration Network
 *
 *   Author : Pandor
 *   Organization : Aincrad-Flux
 *
 *  filename : src/server.js
 *  description : Server entry point for T.W.I.N application
*/

const app = require('./app');
const logger = require('./config/logger');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`🚀 T.W.I.N démarré sur le port ${PORT}`);
  logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
  logger.info(`📨 Webhooks: http://localhost:${PORT}/webhooks`);
});

// ===== src/config/logger.js =====
const winston = require('winston');

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

module.exports = logger;