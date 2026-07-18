const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import middlewares
const errorMiddleware = require('./middleware/errorMiddleware');
const ApiError = require('./errors/ApiError');

const app = express();

// Middleware - Security
app.use(helmet());

// Middleware - CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Middleware - Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Middleware - Body Parser
app.use(express.json());
// Import Routes
const taskRoutes = require('./routes/task.routes');
const authRoutes = require('./routes/auth.routes');

// Routes
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/auth', authRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

// Setup 404 Middleware
app.all('*', (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

// Setup Central Error Middleware
app.use(errorMiddleware);

module.exports = app;
