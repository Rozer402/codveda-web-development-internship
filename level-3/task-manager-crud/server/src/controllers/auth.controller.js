const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../errors/ApiResponse');
const ApiError = require('../errors/ApiError');

/**
 * Controller layer for Authentication.
 * Handles HTTP requests and responses for auth flows.
 */
class AuthController {
  
  // POST /api/v1/auth/register
  register = asyncHandler(async (req, res) => {
    const result = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      token: result.token,
      user: result.user
    });
  });

  // POST /api/v1/auth/login
  login = asyncHandler(async (req, res) => {
    const result = await authService.loginUser(req.body);
    res.status(200).json({
      success: true,
      token: result.token,
      user: result.user
    });
  });

  // GET /api/v1/auth/me
  getMe = asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  });
}

module.exports = new AuthController();
