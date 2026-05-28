// backend/controllers/budgetController.js
// Handles budget targets, supporting standard MongoDB schemas and automatic local JSON mock database backups.

const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const mockDB = require('../config/mockDB');

/**
 * @desc    Create or update (upsert) a budget limit for a specific category and month
 * @route   POST /api/budgets
 */
const upsertBudget = async (req, res, next) => {
  try {
    const { category, limit, month } = req.body;

    if (!category || limit === undefined || !month) {
      res.status(400);
      throw new Error('Please fill in all budget fields');
    }

    if (!/^\d{4}-\d{2}$/.test(month)) {
      res.status(400);
      throw new Error('Month must be in YYYY-MM format (e.g., 2026-05)');
    }

    const numericLimit = parseFloat(limit);
    if (isNaN(numericLimit) || numericLimit < 0) {
      res.status(400);
      throw new Error('Budget limit must be a valid non-negative number');
    }

    // ==========================================
    // OFFLINE MODE FALLBACK (JSON DATABASE)
    // ==========================================
    if (process.env.MOCK_DB === 'true') {
      const db = mockDB.readDB();
      
      let budgetIndex = db.budgets.findIndex(
        (b) =>
          b.user.toString() === req.user._id.toString() &&
          b.category === category &&
          b.month === month
      );

      let budget;
      if (budgetIndex !== -1) {
        // Edit existing
        db.budgets[budgetIndex].limit = numericLimit;
        budget = db.budgets[budgetIndex];
      } else {
        // Create new
        const mockId = 'mock_budget_' + Date.now();
        budget = {
          _id: mockId,
          user: req.user._id,
          category,
          limit: numericLimit,
          month,
          createdAt: new Date().toISOString(),
        };
        db.budgets.push(budget);
      }

      mockDB.writeDB(db);

      return res.status(200).json({
        success: true,
        data: budget,
      });
    }

    // ==========================================
    // ONLINE MODE (MONGODB DATABASE)
    // ==========================================
    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category, month },
      { limit: numericLimit },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all active budget limits for a specific month
 * @route   GET /api/budgets
 */
const getBudgets = async (req, res, next) => {
  try {
    const { month } = req.query;

    if (!month) {
      res.status(400);
      throw new Error('Please specify a query month in YYYY-MM format');
    }

    // ==========================================
    // OFFLINE MODE FALLBACK (JSON DATABASE)
    // ==========================================
    if (process.env.MOCK_DB === 'true') {
      const db = mockDB.readDB();
      const budgets = db.budgets.filter(
        (b) =>
          b.user.toString() === req.user._id.toString() && b.month === month
      );

      return res.status(200).json({
        success: true,
        count: budgets.length,
        data: budgets,
      });
    }

    // ==========================================
    // ONLINE MODE (MONGODB DATABASE)
    // ==========================================
    const budgets = await Budget.find({ user: req.user._id, month });

    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get real-time budget spending progress for a specific month
 * @route   GET /api/budgets/progress
 */
const getBudgetProgress = async (req, res, next) => {
  try {
    const { month } = req.query;

    if (!month) {
      res.status(400);
      throw new Error('Please specify a query month parameter');
    }

    let budgets = [];
    let expenses = [];

    // ==========================================
    // DATA EXTRACTION (MONGODB vs OFFLINE JSON)
    // ==========================================
    if (process.env.MOCK_DB === 'true') {
      const db = mockDB.readDB();
      
      budgets = db.budgets.filter(
        (b) =>
          b.user.toString() === req.user._id.toString() && b.month === month
      );

      const [yearStr, monthStr] = month.split('-');
      const year = parseInt(yearStr);
      const monthIndex = parseInt(monthStr) - 1;

      const startDate = new Date(year, monthIndex, 1).getTime();
      const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999).getTime();

      expenses = db.transactions.filter(
        (t) =>
          t.user.toString() === req.user._id.toString() &&
          t.type === 'expense' &&
          new Date(t.date).getTime() >= startDate &&
          new Date(t.date).getTime() <= endDate
      );
    } else {
      budgets = await Budget.find({ user: req.user._id, month });

      const [yearStr, monthStr] = month.split('-');
      const year = parseInt(yearStr);
      const monthIndex = parseInt(monthStr) - 1;

      const startDate = new Date(year, monthIndex, 1);
      const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

      expenses = await Transaction.find({
        user: req.user._id,
        type: 'expense',
        date: { $gte: startDate, $lte: endDate },
      });
    }

    // 1. Aggregate spent sum by category
    const categorySpentMap = {};
    let totalExpenseAmount = 0;

    expenses.forEach((tx) => {
      categorySpentMap[tx.category] = (categorySpentMap[tx.category] || 0) + tx.amount;
      totalExpenseAmount += tx.amount;
    });

    // 2. Map progress tracking
    const progressReport = budgets.map((budget) => {
      const category = budget.category;
      let spent = 0;

      if (category === 'All') {
        spent = totalExpenseAmount;
      } else {
        spent = categorySpentMap[category] || 0;
      }

      spent = Math.round(spent * 100) / 100;
      const limit = budget.limit;
      const remaining = Math.max(0, Math.round((limit - spent) * 100) / 100);
      const percentSpent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;

      return {
        _id: budget._id,
        category,
        limit,
        spent,
        remaining,
        percentSpent,
        month,
      };
    });

    progressReport.sort((a, b) => {
      if (a.category === 'All') return -1;
      if (b.category === 'All') return 1;
      return 0;
    });

    res.status(200).json({
      success: true,
      data: progressReport,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upsertBudget,
  getBudgets,
  getBudgetProgress,
};
