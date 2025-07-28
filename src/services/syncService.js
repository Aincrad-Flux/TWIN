/*
 * T.W.I.N - Ticket Workflow Integration Network
 *
 *   Author : Pandor
 *   Organization : Aincrad-Flux
 *
 *  filename : src/services/syncService.js
 *  description : Service for handling synchronization logic based on webhook events
*/

const logger = require('../config/logger');

class SyncService {

  async handleWebhook(webhookEvent, payload) {
    logger.info(`Traitement de l'événement: ${webhookEvent}`);

    switch (webhookEvent) {
      case 'jira:issue_created':
        return await this.handleIssueCreated(payload);
      case 'jira:issue_updated':
        return await this.handleIssueUpdated(payload);
      case 'comment_created':
        return await this.handleCommentCreated(payload);
      default:
        logger.debug(`Événement ignoré: ${webhookEvent}`);
    }
  }

  async handleIssueCreated(payload) {
    // TODO: Logique de création d'issue
    logger.info('Création d\'issue détectée', {
      key: payload.issue?.key,
      summary: payload.issue?.fields?.summary
    });
  }

  async handleIssueUpdated(payload) {
    // TODO: Logique de mise à jour d'issue
    logger.info('Mise à jour d\'issue détectée', {
      key: payload.issue?.key,
      changelog: payload.changelog
    });
  }

  async handleCommentCreated(payload) {
    // TODO: Logique de commentaire
    logger.info('Commentaire créé', {
      key: payload.issue?.key,
      comment: payload.comment?.body
    });
  }
}

module.exports = new SyncService();