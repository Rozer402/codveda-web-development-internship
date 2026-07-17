/**
 * Wrapper for async route handlers.
 * Eliminates the need for explicit try/catch blocks in every controller.
 * Any error thrown will be caught and passed to the next() middleware.
 * 
 * @param {Function} requestHandler 
 * @returns {Function} Express middleware function
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

module.exports = asyncHandler;
