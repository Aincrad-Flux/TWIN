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
    logger.info(`Processing event: ${webhookEvent}`);

    switch (webhookEvent) {
      case 'jira:issue_created':
        return await this.handleIssueCreated(payload);
      case 'jira:issue_updated':
        return await this.handleIssueUpdated(payload);
      case 'comment_created':
        return await this.handleCommentCreated(payload);
      default:
        logger.debug(`Event ignored: ${webhookEvent}`);
    }
  }

  async handleIssueCreated(payload) {
    // TODO: Issue creation logic
    logger.info('Issue creation detected', {
      key: payload.issue?.key,
      summary: payload.issue?.fields?.summary
    });
  }

  async handleIssueUpdated(payload) {
    // TODO: Issue update logic
    logger.info('Issue update detected', {
      key: payload.issue?.key,
      changelog: payload.changelog
    });
  }

  async handleCommentCreated(payload) {
    // TODO: Comment logic
    logger.info('Comment created', {
      key: payload.issue?.key,
      comment: payload.comment?.body
    });
  }
}

module.exports = new SyncService();