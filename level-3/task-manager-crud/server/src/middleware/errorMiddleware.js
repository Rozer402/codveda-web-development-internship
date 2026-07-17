const env = require('../config/env');
const ApiError = require('../errors/ApiError');

/**
 * Global Error Handler Middleware
 */
const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // If the error is not an instance of our ApiError, format it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode ? error.statusCode : 500;
    const message = error.message || 'Something went wrong';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Handle Mongoose Bad ObjectId Error
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    error = new ApiError(404, message);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ApiError(400, message);
  }

  const response = {
    ...error,
    message: error.message,
    ...(env.NODE_ENV === 'development' && { stack: error.stack }), // Only show stack in development
  };

  res.status(error.statusCode).json(response);
};

module.exports = errorMiddleware;
