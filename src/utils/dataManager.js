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