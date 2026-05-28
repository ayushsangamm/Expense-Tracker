// backend/routes/budgetRoutes.js
// Defines routing endpoints for budget limit configurations.

const express = require('express');
const router = express.Router();

const {
  upsertBudget,
  getBudgets,
  getBudgetProgress,
} = require('../controllers/budgetController');

const { protect } = require('../middleware/authMiddleware');

// Secure all budget routes with JWT authorization filters
router.use(protect);

// 1. Budget Progress calculations endpoint
router.get('/progress', getBudgetProgress);

// 2. Base Budget operations
router.route('/')
  .post(upsertBudget)
  .get(getBudgets);

module.exports = router;
