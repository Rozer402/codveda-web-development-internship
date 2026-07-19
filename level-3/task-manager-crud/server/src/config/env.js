/**
 * Environment configuration manager
 * Centralizes environment variables with default values to prevent undefined errors.
 */

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

if (!env.MONGO_URI) {
  console.error('❌ FATAL ERROR: MongoDB Connection Error - MONGO_URI (or MONGODB_URI) environment variable is missing.');
  process.exit(1);
}

module.exports = env;
