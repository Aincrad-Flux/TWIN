/*
 * T.W.I.N - Ticket Workflow Integration Network
 *
 *   Author : Pandor
 *   Organization : Aincrad-Flux
 *
 *  filename : src/config/webhook.js
 *  description : Configuration for webhook security and validation
*/

module.exports = {
  jira: {
    secret: process.env.JIRA_WEBHOOK_SECRET || null,
    validateSignature: process.env.JIRA_VALIDATE_SIGNATURE !== 'false', // true par défaut
    allowedIPs: process.env.JIRA_ALLOWED_IPS ? process.env.JIRA_ALLOWED_IPS.split(',') : [],
    requireUserAgent: process.env.JIRA_REQUIRE_USER_AGENT !== 'false' // true par défaut
  }
};
