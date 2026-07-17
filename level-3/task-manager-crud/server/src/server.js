const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = require('./app');
const connectDB = require('./database/connection');
const env = require('./config/env');

// Start Server
const startServer = async () => {
  // Connect to Database
  await connectDB();
  
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
};

startServer();
