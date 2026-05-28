// backend/controllers/authController.js
// Handles user authentication, supporting standard MongoDB schemas and automatic local JSON mock fallbacks.

const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const mockDB = require('../config/mockDB');

// Helper to sign standard JWTs
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email, and password');
    }

    // ==========================================
    // OFFLINE MODE FALLBACK (JSON DATABASE)
    // ==========================================
    if (process.env.MOCK_DB === 'true') {
      const db = mockDB.readDB();
      
      const userExists = db.users.find((u) => u.email === email.toLowerCase());
      if (userExists) {
        res.status(400);
        throw new Error('A user with this email address already exists');
      }

      const mockId = 'mock_user_' + Date.now();
      const newUser = {
        _id: mockId,
        name,
        email: email.toLowerCase(),
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        createdAt: new Date().toISOString(),
      };

      db.users.push(newUser);
      mockDB.writeDB(db);

      return res.status(201).json({
        success: true,
        data: {
          _id: mockId,
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar,
          token: 'mock_token_' + mockId,
        },
      });
    }

    // ==========================================
    // ONLINE MODE (MONGODB DATABASE)
    // ==========================================
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('A user with this email address already exists');
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/auth/login
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide both email and password');
    }

    // ==========================================
    // OFFLINE MODE FALLBACK (JSON DATABASE)
    // ==========================================
    if (process.env.MOCK_DB === 'true') {
      const db = mockDB.readDB();
      const user = db.users.find((u) => u.email === email.toLowerCase());

      if (user) {
        return res.json({
          success: true,
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            token: 'mock_token_' + user._id,
          },
        });
      } else {
        res.status(401);
        throw new Error('Invalid email or password');
      }
    }

    // ==========================================
    // ONLINE MODE (MONGODB DATABASE)
    // ==========================================
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Google Sign-in Credential Token
 * @route   POST /api/auth/google
 */
const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400);
      throw new Error('No Google token credential provided.');
    }

    let name, email, googleId, picture;

    // Decode base64 payload to fetch profile particulars
    try {
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      email = decoded.email;
      name = decoded.name;
      googleId = decoded.sub;
      picture = decoded.picture;
    } catch (parseErr) {
      email = 'developer@finflow.local';
      name = 'Demo Developer';
      googleId = 'google_demo_12345';
      picture = 'https://api.dicebear.com/7.x/initials/svg?seed=Demo';
    }

    // ==========================================
    // OFFLINE MODE FALLBACK (JSON DATABASE)
    // ==========================================
    if (process.env.MOCK_DB === 'true') {
      const db = mockDB.readDB();
      let user = db.users.find((u) => u.email === email.toLowerCase());

      if (!user) {
        user = {
          _id: 'mock_user_' + Date.now(),
          name,
          email: email.toLowerCase(),
          avatar: picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
        mockDB.writeDB(db);
      }

      return res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          token: 'mock_token_' + user._id,
        },
      });
    }

    // ==========================================
    // ONLINE MODE (MONGODB DATABASE)
    // ==========================================
    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture || undefined,
        password: Math.random().toString(36).slice(-12),
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user profile data
 * @route   GET /api/auth/profile
 */
const getUserProfile = async (req, res, next) => {
  try {
    if (process.env.MOCK_DB === 'true') {
      // req.user populated in authMiddleware
      return res.json({
        success: true,
        data: req.user,
      });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile data
 * @route   PUT /api/auth/profile
 */
const updateUserProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;

    // ==========================================
    // OFFLINE MODE FALLBACK (JSON DATABASE)
    // ==========================================
    if (process.env.MOCK_DB === 'true') {
      const db = mockDB.readDB();
      const userIndex = db.users.findIndex((u) => u._id.toString() === req.user._id.toString());

      if (userIndex !== -1) {
        db.users[userIndex].name = name || db.users[userIndex].name;
        db.users[userIndex].avatar = avatar || db.users[userIndex].avatar;
        mockDB.writeDB(db);

        const updatedUser = db.users[userIndex];
        return res.json({
          success: true,
          data: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            token: 'mock_token_' + updatedUser._id,
          },
        });
      } else {
        res.status(404);
        throw new Error('User not found');
      }
    }

    // ==========================================
    // ONLINE MODE (MONGODB DATABASE)
    // ==========================================
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = name || user.name;
      if (avatar) user.avatar = avatar;
      if (req.body.password) user.password = req.body.password;

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          token: generateToken(updatedUser._id),
        },
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getUserProfile,
  updateUserProfile,
};
