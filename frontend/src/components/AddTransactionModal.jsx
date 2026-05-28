// frontend/src/components/AddTransactionModal.jsx
// Interactive form modal supporting creating and editing income/expense logs.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, Type, FileText, RefreshCw } from 'lucide-react';
import api from '../utils/api';

const AddTransactionModal = ({
  isOpen,
  onClose,
  onSuccess,
  editingTransaction = null,
}) => {
  const isEditing = !!editingTransaction;

  // Form state parameters
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense'); // 'income' | 'expense'
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default categories based on chosen transaction type
  const expenseCategories = ['Food', 'Shopping', 'Travel', 'Bills', 'Entertainment', 'Other'];
  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Other'];

  // Automatically adjust default category when transaction type toggles
  useEffect(() => {
    if (!isEditing) {
      if (type === 'income') {
        setCategory('Salary');
      } else {
        setCategory('Food');
      }
    }
  }, [type, isEditing]);

  // If in edit mode, populate inputs with the target transaction's existing details
  useEffect(() => {
    if (editingTransaction) {
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount);
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setNotes(editingTransaction.notes || '');
      setIsRecurring(editingTransaction.isRecurring || false);
      setRecurringFrequency(editingTransaction.recurringFrequency || 'monthly');
      
      // Format ISO date string to YYYY-MM-DD for standard html date picker input
      if (editingTransaction.date) {
        const d = new Date(editingTransaction.date);
        const formattedDate = d.toISOString().split('T')[0];
        setDate(formattedDate);
      }
      setError('');
    } else {
      // Clear out inputs for new entries
      setTitle('');
      setAmount('');
      setType('expense');
      setCategory('Food');
      setNotes('');
      setIsRecurring(false);
      setRecurringFrequency('monthly');
      setDate(new Date().toISOString().split('T')[0]); // defaults to today
      setError('');
    }
  }, [editingTransaction, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Input Validations
    if (!title.trim()) return setError('Please specify a title');
    if (!amount || parseFloat(amount) <= 0) return setError('Please specify a valid amount greater than 0');
    if (!date) return setError('Please choose a date');

    try {
      setLoading(true);
      const payload = {
        title,
        amount: parseFloat(amount),
        type,
        category,
        date: new Date(date),
        notes,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : 'none',
      };

      let response;
      if (isEditing) {
        // Send PUT update request
        response = await api.put(`/transactions/${editingTransaction._id}`, payload);
      } else {
        // Send POST creation request
        response = await api.post('/transactions', payload);
      }

      if (response.data.success) {
        onSuccess(response.data.data, isEditing ? 'updated' : 'created');
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Frosted dark backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="w-full max-w-lg glass-card bg-background-card overflow-hidden z-10 shadow-2xl relative border border-cardBorder"
          >
            {/* Header Area */}
            <div className="flex items-center justify-between p-6 border-b border-cardBorder bg-zinc-900/40">
              <h3 className="text-zinc-100 font-bold text-lg">
                {isEditing ? 'Edit Transaction Details' : 'Add New Transaction'}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Transaction Type Sliding Tab Selector */}
              <div>
                <label className="block text-zinc-400 text-xs font-bold mb-2">Transaction Type</label>
                <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-950 border border-cardBorder">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                      type === 'expense'
                        ? 'bg-expense text-white shadow-lg shadow-expense/20'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                      type === 'income'
                        ? 'bg-income text-white shadow-lg shadow-income/20'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Title & Amount Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-xs font-bold mb-1.5">Description Title</label>
                  <div className="relative">
                    <Type className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
                    <input
                      type="text"
                      placeholder="e.g. Weekly Groceries"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="glass-input pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-bold mb-1.5">Amount ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="glass-input pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Category & Date Picker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-xs font-bold mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="glass-input appearance-none"
                    disabled={loading}
                  >
                    {type === 'expense'
                      ? expenseCategories.map((cat) => (
                          <option key={cat} value={cat} className="bg-zinc-950 text-zinc-100">
                            {cat}
                          </option>
                        ))
                      : incomeCategories.map((cat) => (
                          <option key={cat} value={cat} className="bg-zinc-950 text-zinc-100">
                            {cat}
                          </option>
                        ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-bold mb-1.5">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3.5 text-zinc-500 pointer-events-none" size={16} />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="glass-input pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Recurring Transaction Toggle */}
              <div className="p-3.5 rounded-xl border border-cardBorder bg-zinc-950/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="text-zinc-500" size={16} />
                    <div>
                      <p className="text-zinc-200 text-xs font-semibold">Recurring Transaction</p>
                      <p className="text-[10px] text-zinc-500">Automatically repeat this entry</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4 text-primary-500 rounded bg-zinc-950 border-zinc-800 focus:ring-primary-500 focus:ring-2 focus:ring-offset-background"
                  />
                </div>

                {isRecurring && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between gap-4"
                  >
                    <span className="text-zinc-400 text-xs">Interval Frequency:</span>
                    <select
                      value={recurringFrequency}
                      onChange={(e) => setRecurringFrequency(e.target.value)}
                      className="glass-input max-w-[150px] py-1 px-3 text-xs"
                    >
                      <option value="weekly" className="bg-zinc-950">Weekly</option>
                      <option value="monthly" className="bg-zinc-950">Monthly</option>
                    </select>
                  </motion.div>
                )}
              </div>

              {/* Notes Field */}
              <div>
                <label className="block text-zinc-400 text-xs font-bold mb-1.5">Notes (Optional)</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
                  <textarea
                    rows="2"
                    placeholder="Provide comments or transaction notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="glass-input pl-10 resize-none"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary py-2 px-4 text-xs font-semibold rounded-xl"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-5 text-xs font-semibold rounded-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : isEditing ? (
                    'Save Changes'
                  ) : (
                    'Add Transaction'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddTransactionModal;
