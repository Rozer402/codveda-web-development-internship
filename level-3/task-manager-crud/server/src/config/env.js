/**
 * Environment configuration manager
 * Centralizes environment variables with default values to prevent undefined errors.
 */

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/task-manager',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

module.exports = env;
