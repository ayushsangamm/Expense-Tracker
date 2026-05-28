// backend/models/Transaction.js
// Database Schema representing an income or expense transaction in FinFlow.

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must belong to a user'],
    },
    title: {
      type: String,
      required: [true, 'Please add a transaction title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Please add a transaction amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      required: [true, 'Please specify transaction type'],
      enum: {
        values: ['income', 'expense'],
        message: '{VALUE} is not a valid transaction type (income/expense)',
      },
    },
    category: {
      type: String,
      required: [true, 'Please specify a transaction category'],
      trim: true,
      default: 'Other',
      // Standard categories for visual charts
      enum: [
        'Food',
        'Shopping',
        'Travel',
        'Bills',
        'Entertainment',
        'Salary',
        'Freelance',
        'Investment',
        'Other',
      ],
    },
    date: {
      type: Date,
      required: [true, 'Please choose a transaction date'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ['none', 'weekly', 'monthly'],
      default: 'none',
    },
  },
  {
    timestamps: true, // Captures createdAt and updatedAt system stamps
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
