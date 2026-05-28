// backend/routes/transactionRoutes.js
// Defines routing endpoints for transaction actions.

const express = require('express');
const router = express.Router();

const {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
} = require('../controllers/transactionController');

const { protect } = require('../middleware/authMiddleware');

// Secure all transaction routes with JWT authentication middleware
router.use(protect);

// 1. Transaction Aggregates & Dashboard Stats Route
// CRITICAL ROUTING DETAIL: This must be declared BEFORE the /:id routes!
// If we put it after /:id, Express will mistakenly treat the word "stats" as a transaction ID parameter, causing MongoDB CastErrors.
router.get('/stats', getTransactionStats);

// 2. Base CRUD Operations
router.route('/')
  .post(addTransaction)
  .get(getTransactions);

router.route('/:id')
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
