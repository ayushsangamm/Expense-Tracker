// backend/models/User.js
// Database Schema representing a User in our application.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: function () {
        // Password is only required if googleId is not present
        return !this.googleId;
      },
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    googleId: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: function () {
        // Automatically generate a initials-based avatar using a free open API
        return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.name)}`;
      },
    },
  },
  {
    timestamps: true, // Automatically includes createdAt and updatedAt dates
  }
);

// Mongoose Pre-save Hook: Runs automatically before a user document is written to MongoDB.
// If the password field was modified (e.g. during signup or changing password), we encrypt it.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash the plaintext password using bcrypt
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance Method: Enables comparing entered passwords against stored hashed passwords.
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
