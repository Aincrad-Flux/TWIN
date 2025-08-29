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
const manager = require('./envManager.js');
const { Interface } = require('readline');

class JiraInterface {
  constructor(section) {
    // Accept only a string
    if (typeof section !== 'string') {
      throw new Error('Invalid section: Section must be a string');
    }
    this.section = String(section || 'UNKNOWN').toUpperCase();
    this.url = manager.getEnvVar(`JIRA_${this.section}_URL`);
    this.api = manager.getEnvVar(`JIRA_${this.section}_API`);
    this.key = manager.getEnvVar(`JIRA_${this.section}_KEY`);

    logger.info(`Initialized JiraInterface for section: ${this.section}`);
  }

  async getAllIssues() {
    logger.info(`Getting all Jira issues for section: ${this.section}`);

    // Generate url
    const url = `${this.api}/search?jql=project=${this.section}`;

    // Make API call to get all issues
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.key}:`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      logger.error(`Failed to fetch Jira issues: ${response.statusText}`);
      throw new Error(`Failed to fetch Jira issues: ${response.statusText}`);
    }

    const data = await response.json();
    return data.issues.map(issue => new JiraIssue(issue));
  }

  static async getAllIssues(section) {
    const inst = new JiraInterface(section);
    return inst.getAllIssues();
  }

}

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
}

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

module.exports = { JiraInterface, JiraIssue, JiraComment };
