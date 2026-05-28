// backend/controllers/transactionController.js
// Handles transaction database actions, supporting MongoDB schemas and automatic local JSON mock database backups.

const Transaction = require('../models/Transaction');
const mockDB = require('../config/mockDB');

/**
 * @desc    Create a new transaction
 * @route   POST /api/transactions
 */
const addTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, notes, isRecurring, recurringFrequency } = req.body;

    if (!title || !amount || !type || !category) {
      res.status(400);
      throw new Error('Please fill in all required fields');
    }

    // ==========================================
    // OFFLINE MODE FALLBACK (JSON DATABASE)
    // ==========================================
    if (process.env.MOCK_DB === 'true') {
      const db = mockDB.readDB();
      const mockId = 'mock_tx_' + Date.now();
      const newTx = {
        _id: mockId,
        user: req.user._id,
        title,
        amount: parseFloat(amount),
        type,
        category,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        notes: notes || '',
        isRecurring: isRecurring || false,
        recurringFrequency: isRecurring ? (recurringFrequency || 'monthly') : 'none',
        createdAt: new Date().toISOString(),
      };

      db.transactions.push(newTx);
      mockDB.writeDB(db);

      return res.status(201).json({
        success: true,
        data: newTx,
      });
    }

    // ==========================================
    // ONLINE MODE (MONGODB DATABASE)
    // ==========================================
    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount: parseFloat(amount),
      type,
      category,
      date: date || undefined,
      notes,
      isRecurring: isRecurring || false,
      recurringFrequency: isRecurring ? (recurringFrequency || 'monthly') : 'none',
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all transactions belonging to a user
 * @route   GET /api/transactions
 */
const getTransactions = async (req, res, next) => {
  try {
    // ==========================================
    // OFFLINE MODE FALLBACK (JSON DATABASE)
    // ==========================================
    if (process.env.MOCK_DB === 'true') {
      const db = mockDB.readDB();
      let txs = db.transactions.filter((t) => t.user.toString() === req.user._id.toString());

      // 1. Text search
      if (req.query.search) {
        const term = req.query.search.toLowerCase();
        txs = txs.filter((t) => t.title.toLowerCase().includes(term));
      }

      // 2. Category
      if (req.query.category && req.query.category !== 'All') {
        txs = txs.filter((t) => t.category === req.query.category);
      }

      // 3. Type
      if (req.query.type && req.query.type !== 'All') {
        txs = txs.filter((t) => t.type === req.query.type);
      }

      // 4. Date bounds
      if (req.query.startDate) {
        const start = new Date(req.query.startDate).getTime();
        txs = txs.filter((t) => new Date(t.date).getTime() >= start);
      }
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        txs = txs.filter((t) => new Date(t.date).getTime() <= end.getTime());
      }

      // Sort chronological descending
      txs.sort((a, b) => new Date(b.date) - new Date(a.date));

      return res.status(200).json({
        success: true,
        count: txs.length,
        data: txs,
      });
    }

    // ==========================================
    // ONLINE MODE (MONGODB DATABASE)
    // ==========================================
    const query = { user: req.user._id };

    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }
    if (req.query.type && req.query.type !== 'All') {
      query.type = req.query.type;
    }
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) query.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const transactions = await Transaction.find(query).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a transaction
 * @route   PUT /api/transactions/:id
 */
const updateTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, notes, isRecurring, recurringFrequency } = req.body;

    // ==========================================
    // OFFLINE MODE FALLBACK (JSON DATABASE)
    // ==========================================
    if (process.env.MOCK_DB === 'true') {
      const db = mockDB.readDB();
      const txIndex = db.transactions.findIndex(
        (t) => t._id.toString() === req.params.id.toString()
      );

      if (txIndex === -1) {
        res.status(404);
        throw new Error('Transaction record not found');
      }

      if (db.transactions[txIndex].user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to edit this transaction');
      }

      db.transactions[txIndex].title = title || db.transactions[txIndex].title;
      db.transactions[txIndex].amount = amount !== undefined ? parseFloat(amount) : db.transactions[txIndex].amount;
      db.transactions[txIndex].type = type || db.transactions[txIndex].type;
      db.transactions[txIndex].category = category || db.transactions[txIndex].category;
      db.transactions[txIndex].date = date ? new Date(date).toISOString() : db.transactions[txIndex].date;
      db.transactions[txIndex].notes = notes !== undefined ? notes : db.transactions[txIndex].notes;
      db.transactions[txIndex].isRecurring = isRecurring !== undefined ? isRecurring : db.transactions[txIndex].isRecurring;
      db.transactions[txIndex].recurringFrequency = isRecurring ? (recurringFrequency || db.transactions[txIndex].recurringFrequency) : 'none';

      mockDB.writeDB(db);

      return res.status(200).json({
        success: true,
        data: db.transactions[txIndex],
      });
    }

    // ==========================================
    // ONLINE MODE (MONGODB DATABASE)
    // ==========================================
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction record not found');
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to edit this transaction');
    }

    transaction.title = title || transaction.title;
    transaction.amount = amount !== undefined ? parseFloat(amount) : transaction.amount;
    transaction.type = type || transaction.type;
    transaction.category = category || transaction.category;
    transaction.date = date || transaction.date;
    transaction.notes = notes !== undefined ? notes : transaction.notes;
    transaction.isRecurring = isRecurring !== undefined ? isRecurring : transaction.isRecurring;
    transaction.recurringFrequency = isRecurring ? (recurringFrequency || transaction.recurringFrequency) : 'none';

    const updatedTransaction = await transaction.save();

    res.status(200).json({
      success: true,
      data: updatedTransaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a transaction
 * @route   DELETE /api/transactions/:id
 */
const deleteTransaction = async (req, res, next) => {
  try {
    // ==========================================
    // OFFLINE MODE FALLBACK (JSON DATABASE)
    // ==========================================
    if (process.env.MOCK_DB === 'true') {
      const db = mockDB.readDB();
      const txIndex = db.transactions.findIndex(
        (t) => t._id.toString() === req.params.id.toString()
      );

      if (txIndex === -1) {
        res.status(404);
        throw new Error('Transaction record not found');
      }

      if (db.transactions[txIndex].user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this transaction');
      }

      db.transactions.splice(txIndex, 1);
      mockDB.writeDB(db);

      return res.status(200).json({
        success: true,
        message: 'Transaction successfully removed',
        data: { id: req.params.id },
      });
    }

    // ==========================================
    // ONLINE MODE (MONGODB DATABASE)
    // ==========================================
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction record not found');
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this transaction');
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Transaction successfully removed',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregate stats for dashboard summaries and visual graphs
 * @route   GET /api/transactions/stats
 */
const getTransactionStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let userTransactions = [];

    // ==========================================
    // DATA EXTRACTION (MONGODB vs OFFLINE JSON)
    // ==========================================
    if (process.env.MOCK_DB === 'true') {
      const db = mockDB.readDB();
      userTransactions = db.transactions.filter(
        (t) => t.user.toString() === userId.toString()
      );
    } else {
      userTransactions = await Transaction.find({ user: userId });
    }

    // 1. Calculate overall sums
    let totalIncome = 0;
    let totalExpense = 0;

    userTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else if (tx.type === 'expense') {
        totalExpense += tx.amount;
      }
    });

    const totalBalance = totalIncome - totalExpense;
    const savingsAmount = Math.max(0, totalBalance);
    const savingsRate = totalIncome > 0 ? Math.round((savingsAmount / totalIncome) * 100) : 0;

    // 2. Category-wise breakdown
    const categoryMap = {};
    userTransactions.forEach((tx) => {
      if (tx.type === 'expense') {
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
      }
    });

    const categoryBreakdown = Object.keys(categoryMap).map((cat) => ({
      name: cat,
      value: Math.round(categoryMap[cat] * 100) / 100,
    }));

    // 3. Monthly trend summaries
    const monthlyMap = {};
    const sortedTx = [...userTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedTx.forEach((tx) => {
      const d = new Date(tx.date);
      const monthLabel = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });

      if (!monthlyMap[monthLabel]) {
        monthlyMap[monthLabel] = { month: monthLabel, income: 0, expense: 0, balance: 0 };
      }

      if (tx.type === 'income') {
        monthlyMap[monthLabel].income += tx.amount;
      } else {
        monthlyMap[monthLabel].expense += tx.amount;
      }

      monthlyMap[monthLabel].income = Math.round(monthlyMap[monthLabel].income * 100) / 100;
      monthlyMap[monthLabel].expense = Math.round(monthlyMap[monthLabel].expense * 100) / 100;
      monthlyMap[monthLabel].balance = Math.round(
        (monthlyMap[monthLabel].income - monthlyMap[monthLabel].expense) * 100
      ) / 100;
    });

    const monthlyTrends = Object.values(monthlyMap).slice(-6);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalBalance: Math.round(totalBalance * 100) / 100,
          totalIncome: Math.round(totalIncome * 100) / 100,
          totalExpense: Math.round(totalExpense * 100) / 100,
          savingsAmount: Math.round(savingsAmount * 100) / 100,
          savingsRate,
        },
        categoryBreakdown,
        monthlyTrends,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
};
