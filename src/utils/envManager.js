/*
 * T.W.I.N - Ticket Workflow Integration Network
 *
 *   Author : Pandor
 *   Organization : Aincrad-Flux
 *
 *  filename : src/utils/envManager.js
 *  description : Utility for managing environment variables
*/

const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

const ENV_FILE_PATH = path.join(__dirname, '../../.env');

/**
 * Protected environment variables that cannot be retrieved or modified
 */
const PROTECTED_VARS = ['ADMIN_API_KEY'];

/**
 * Read and parse .env file
 */
const readEnvFile = () => {
  try {
    if (!fs.existsSync(ENV_FILE_PATH)) {
      throw new Error('.env file not found');
    }

    const envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });

    return envVars;
  } catch (error) {
    logger.error('Error reading .env file:', error);
    throw error;
  }
};

/**
 * Write environment variables to .env file
 */
const writeEnvFile = (envVars) => {
  try {
    let content = '# T.W.I.N Configuration Environment Variables\n\n';

    // Group variables by sections
    const sections = {
      'Database Configuration': ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'],
      'Jira Webhook Configuration': ['JIRA_WEBHOOK_SECRET', 'JIRA_VALIDATE_SIGNATURE', 'JIRA_REQUIRE_USER_AGENT', 'JIRA_ALLOWED_IPS'],
      'Application Configuration': ['NODE_ENV', 'PORT', 'LOG_LEVEL'],
      'Admin API Key for configuration management': ['ADMIN_API_KEY']
    };

    Object.entries(sections).forEach(([sectionName, sectionVars]) => {
      content += `# ${sectionName}\n`;
      sectionVars.forEach(varName => {
        if (envVars[varName] !== undefined) {
          content += `${varName}=${envVars[varName]}\n`;
        }
      });
      content += '\n';
    });

    // Add any additional variables not in predefined sections
    Object.entries(envVars).forEach(([key, value]) => {
      const isInSections = Object.values(sections).flat().includes(key);
      if (!isInSections) {
        content += `${key}=${value}\n`;
      }
    });

    fs.writeFileSync(ENV_FILE_PATH, content);
    logger.info('Environment file updated successfully');
  } catch (error) {
    logger.error('Error writing .env file:', error);
    throw error;
  }
};

/**
 * Get all environment variables (excluding protected ones)
 */
const getAllEnvVars = () => {
  try {
    const envVars = readEnvFile();
    const filteredVars = {};

    Object.entries(envVars).forEach(([key, value]) => {
      if (!PROTECTED_VARS.includes(key)) {
        filteredVars[key] = value;
      }
    });

    return filteredVars;
  } catch (error) {
    logger.error('Error getting environment variables:', error);
    throw error;
  }
};

/**
 * Update environment variables (excluding protected ones)
 */
const updateEnvVars = (updates) => {
  try {
    // Check for protected variables
    const protectedAttempts = Object.keys(updates).filter(key => PROTECTED_VARS.includes(key));
    if (protectedAttempts.length > 0) {
      throw new Error(`Cannot modify protected variables: ${protectedAttempts.join(', ')}`);
    }

    const currentVars = readEnvFile();
    const updatedVars = { ...currentVars, ...updates };

    writeEnvFile(updatedVars);

    // Update process.env for immediate effect
    Object.entries(updates).forEach(([key, value]) => {
      process.env[key] = value;
    });

    logger.info('Environment variables updated successfully', {
      updatedKeys: Object.keys(updates)
    });

    return updatedVars;
  } catch (error) {
    logger.error('Error updating environment variables:', error);
    throw error;
  }
};

/**
 * Get a specific environment variable value
 */
const getEnvVar = (key) => {
  if (PROTECTED_VARS.includes(key)) {
    throw new Error(`Cannot retrieve protected variable: ${key}`);
  }

  return process.env[key];
};

/**
 * Set a specific environment variable
 */
const setEnvVar = (key, value) => {
  if (PROTECTED_VARS.includes(key)) {
    throw new Error(`Cannot modify protected variable: ${key}`);
  }

  return updateEnvVars({ [key]: value });
};

module.exports = {
  getAllEnvVars,
  updateEnvVars,
  getEnvVar,
  setEnvVar,
  PROTECTED_VARS
};
