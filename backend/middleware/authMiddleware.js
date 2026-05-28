// backend/middleware/authMiddleware.js
// Middleware to protect private routes, supporting both standard JWTs and Offline Mock DB sessions.

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mockDB = require('../config/mockDB');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // OFFLINE MODE: Handle local mock sessions
      if (token.startsWith('mock_token_') || process.env.MOCK_DB === 'true') {
        const db = mockDB.readDB();
        
        // Extract userId: mock tokens are formatted as "mock_token_<userId>"
        // If it's a standard token but we're in mock mode, try to find a user or default to the first mock user
        const userId = token.startsWith('mock_token_') 
          ? token.split('mock_token_')[1] 
          : (db.users[0]?._id || 'mock_user_123');

        const mockUser = db.users.find((u) => u._id.toString() === userId.toString());

        if (mockUser) {
          req.user = mockUser;
          return next();
        } else if (db.users.length > 0) {
          // Fallback to the first registered user to keep testing smooth
          req.user = db.users[0];
          return next();
        }
      }

      // STANDARD ONLINE MODE: Verify actual JWT Signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      return next();
    } catch (error) {
      // If verification fails but we're in mock mode, try to recover session
      if (process.env.MOCK_DB === 'true') {
        const db = mockDB.readDB();
        if (db.users.length > 0) {
          req.user = db.users[0];
          return next();
        }
      }

      console.error('JWT Token Verification Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized! Token verification failed.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized! No token provided.',
    });
  }
};

module.exports = { protect };
