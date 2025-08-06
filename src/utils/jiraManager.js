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

  // TODO - Add methods for CRUD an issue
  // e.g., createIssue, updateIssue, deleteIssue, etc.
}

//* ------------ Jira Comment ------------

class JiraComment {
  constructor(commentData) {
    this.id = commentData.id;
    this.body = commentData.body;
    this.author = commentData.author;
    this.created = commentData.created;
  }

  // TODO - Add methods for CRUD a comment
  // e.g., addComment, updateComment, deleteComment, etc.
}
