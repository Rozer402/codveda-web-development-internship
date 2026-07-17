/**
 * Custom Error class for operational errors.
 * Helps to differentiate between trusted operational errors and programming errors.
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.success = false; // By definition, if it's an error, success is false

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
