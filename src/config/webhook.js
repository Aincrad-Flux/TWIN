/*
 * T.W.I.N - Ticket Workflow Integration Network
 *
 *   Author : Pandor
 *   Organization : Aincrad-Flux
 *
 *  filename : src/config/webhook.js
 *  description : Configuration for webhook security and validation
*/

const config = {
  jira: {
    secret: process.env.JIRA_WEBHOOK_SECRET || null,
    validateSignature: process.env.JIRA_VALIDATE_SIGNATURE !== 'false', // true par défaut
    allowedIPs: process.env.JIRA_ALLOWED_IPS ? process.env.JIRA_ALLOWED_IPS.split(',') : [],
    requireUserAgent: process.env.JIRA_REQUIRE_USER_AGENT !== 'false' // true par défaut
  }
};

// Log de débogage pour vérifier le chargement des variables d'environnement
if (process.env.NODE_ENV === 'development') {
  console.log('Webhook config loaded:', {
    hasSecret: !!config.jira.secret,
    secretLength: config.jira.secret ? config.jira.secret.length : 0,
    validateSignature: config.jira.validateSignature,
    requireUserAgent: config.jira.requireUserAgent,
    allowedIPsCount: config.jira.allowedIPs.length
  });
}

module.exports = config;
