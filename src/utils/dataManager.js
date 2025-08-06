/*
 * T.W.I.N - Ticket Workflow Integration Network
 *
 *   Author : Pandor
 *   Organization : Aincrad-Flux
 *
 *  filename : src/utils/dataManager.js
 *  description : Utility for managing Database interactions
*/

const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

//* ------------ Main Data Manager ------------
class DataManager {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.data = {};
  }

  // TODO - Add methods for CRUD operations
  /*
   * See for the different tables to create :
   *  - Issues
   *  - Comments
   *  - LogActions
   */
}

//* ------------ Issue Data Manager ------------
class Issue extends DataManager {
  constructor(issueData) {
    super();
    this.id = issueData.id;
    this.key = issueData.key;
    this.summary = issueData.summary;
    this.description = issueData.description;
    this.status = issueData.status;
    this.assignee = issueData.assignee;
    this.createdAt = new Date(issueData.createdAt);
    this.updatedAt = new Date(issueData.updatedAt);
  }

  static fromJSON(jsonData) {
    return new Issue(jsonData);
  }
}

//* ------------ Comment Data Manager ------------
class Comment extends DataManager {
    constructor(commentData) {
        super();
        this.id = commentData.id;
        this.issueId = commentData.issueId;
        this.author = commentData.author;
        this.content = commentData.content;
        this.createdAt = new Date(commentData.createdAt);
    }

    static fromJSON(jsonData) {
        return new Comment(jsonData);
    }
}