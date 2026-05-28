// backend/models/Budget.js
// Database Schema representing category and overall budget thresholds.

const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Budget must belong to a user'],
    },
    category: {
      type: String,
      required: [true, 'Please specify a category for this budget limit'],
      trim: true,
      default: 'All', // 'All' represents an overall monthly savings/spending limit
      enum: [
        'All',
        'Food',
        'Shopping',
        'Travel',
        'Bills',
        'Entertainment',
        'Other',
      ],
    },
    limit: {
      type: Number,
      required: [true, 'Please define a budget amount limit'],
      min: [0, 'Budget limit must be 0 or greater'],
    },
    month: {
      type: String,
      required: [true, 'Please specify the month (Format: YYYY-MM)'],
      trim: true,
      match: [/^\d{4}-\d{2}$/, 'Please specify month in YYYY-MM format (e.g., 2026-05)'],
    },
  },
  {
    timestamps: true, // Tracks timestamps for changes
  }
);

// We define a compound unique index so a user cannot have multiple budget entries for the exact same category and month.
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
