/*
 * T.W.I.N - Ticket Workflow Integration Network
 *
 *   Author : Pandor
 *   Organization : Aincrad-Flux
 *
 *  filename : src/utils/jiraManager.js
 *  description : Utility for managing Jira API interactions
*/

const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

//* ------------ Jira Issue ------------

class JiraIssue {
  constructor(issueData) {
    this.key = issueData.key;
    this.id = issueData.id;
    this.type = issueData.fields.issuetype?.name || 'Unknown';
    this.status = issueData.fields.status?.name || 'Unknown';
    this.name = issueData.fields.summary || 'No Summary';
    this.description = issueData.fields.description || 'No Description';
    this.project = issueData.fields.project?.name || 'Unknown Project';
  }

    static fromJSON(jsonData) {
      return new JiraIssue(jsonData);
    }

    createIssue() {
      // TODO - make logic to create a new Jira issue
      logger.info(`Creating Jira issue: ${this.name}`);
    }

    updateIssue() {
      // TODO - make logic to update an existing Jira issue
      logger.info(`Updating Jira issue: ${this.key}`);
    }

    deleteIssue() {
      // TODO - make logic to delete a Jira issue
      logger.info(`Deleting Jira issue: ${this.key}`);
    }

    getIssue() {
      // TODO - make logic to get all Jira issues
      logger.info(`Getting all Jira issues`);
    }

    getIssueById(issueId) {
      // TODO - make logic to get a Jira issue by ID
      logger.info(`Getting Jira issue by ID: ${issueId}`);
    }

}

//* ------------ Jira Comment ------------

class JiraComment {
  constructor(commentData) {
    this.id = commentData.id;
    this.body = commentData.body;
    this.author = commentData.author;
    this.created = commentData.created;
  }

    static fromJSON(jsonData) {
        return new JiraComment(jsonData);
    }

    createComment(issueKey) {
      // TODO - make logic to create a new comment on a Jira issue
      logger.info(`Creating comment on Jira issue: ${issueKey}`);
    }

    updateComment(issueKey, commentId) {
      // TODO - make logic to update an existing comment on a Jira issue
      logger.info(`Updating comment ${commentId} on Jira issue: ${issueKey}`);
    }

    deleteComment(issueKey, commentId) {
      // TODO - make logic to delete a comment on a Jira issue
      logger.info(`Deleting comment ${commentId} on Jira issue: ${issueKey}`);
    }

    getComments(issueKey) {
      // TODO - make logic to get all comments on a Jira issue
      logger.info(`Getting comments for Jira issue: ${issueKey}`);
    }

    getCommentById(issueKey, commentId) {
      // TODO - make logic to get a specific comment by ID on a Jira issue
      logger.info(`Getting comment ${commentId} for Jira issue: ${issueKey}`);
    }

}
