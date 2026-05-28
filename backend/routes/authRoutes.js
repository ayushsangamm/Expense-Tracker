// backend/routes/authRoutes.js
// Defines authentication endpoints for FinFlow.

const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  googleLogin,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// Public endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);

// Protected endpoints (require active JWT validation headers)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
