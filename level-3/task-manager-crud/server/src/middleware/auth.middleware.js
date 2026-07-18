const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../errors/ApiError');

/**
 * Middleware to verify JWT tokens and protect routes.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized to access this route, no token'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user id to request
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return next(new ApiError(401, 'Not authorized to access this route, invalid token'));
  }
});

module.exports = {
  protect,
};
