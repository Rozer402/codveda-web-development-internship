const User = require('../models/user.model');
const ApiError = require('../errors/ApiError');
const jwt = require('jsonwebtoken');

/**
 * Service layer for Authentication.
 * Contains pure business logic independent of HTTP requests/responses.
 */
class AuthService {
  /**
   * Generate JWT Token
   * @param {string} id
   */
  generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });
  }

  /**
   * Register a new user
   * @param {Object} userData 
   */
  async registerUser(userData) {
    const { name, email, password } = userData;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ApiError(409, 'User with this email already exists');
    }

    // Create user (password hashes in model pre-save hook)
    const user = await User.create({
      name,
      email,
      password
    });

    const token = this.generateToken(user._id);

    return { user, token };
  }

  /**
   * Login user
   * @param {Object} credentials 
   */
  async loginUser(credentials) {
    const { email, password } = credentials;

    // Check for user (need to explicitly select password since select is false in model)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // generate token
    const token = this.generateToken(user._id);

    return { user, token };
  }

  /**
   * Get current user
   * @param {string} userId 
   */
  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }
}

module.exports = new AuthService();
