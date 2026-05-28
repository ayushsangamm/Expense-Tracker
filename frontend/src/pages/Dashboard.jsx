// frontend/src/pages/Dashboard.jsx
// Central visual hub of the FinFlow application.

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AddTransactionModal from '../components/AddTransactionModal';
import InsightCard from '../components/InsightCard';
import BudgetProgress from '../components/BudgetProgress';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../utils/api';
import { Plus, Wallet, ArrowDownRight, ArrowUpRight, PiggyBank, Edit2, Trash2, CalendarRange, Utensils, ShoppingBag, Car, Tv, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Modal controllers
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  // States
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    summary: { totalBalance: 0, totalIncome: 0, totalExpense: 0, savingsAmount: 0, savingsRate: 0 },
    categoryBreakdown: [],
    monthlyTrends: [],
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgetProgress, setBudgetProgress] = useState([]);
  const [month, setMonth] = useState('');
  
  // UI notice state
  const [toastMessage, setToastMessage] = useState('');

  // Set default query month (YYYY-MM, e.g. 2026-05) upon load
  useEffect(() => {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7); // e.g. "2026-05"
    setMonth(currentMonth);
  }, []);

  // Fetch all dashboard stats, recent items, and budgets from Express APIs
  const fetchDashboardData = useCallback(async () => {
    if (!month) return;

    try {
      setLoading(true);
      // Run concurrent requests to accelerate loads
      const [statsRes, txRes, budgetRes] = await Promise.all([
        api.get('/transactions/stats'),
        api.get('/transactions?limit=6'), // backend limits returned items
        api.get(`/budgets/progress?month=${month}`),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (txRes.data.success) {
        // Take only the 5 most recent transactions
        setRecentTransactions(txRes.data.data.slice(0, 5));
      }
      if (budgetRes.data.success) {
        setBudgetProgress(budgetRes.data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error.message);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Show a visual micro-toast notification upon CRUD saves
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleTransactionSuccess = (txData, actionType) => {
    fetchDashboardData();
    triggerToast(actionType === 'updated' ? 'Transaction updated successfully!' : 'Transaction added successfully!');
  };

  const handleEditClick = (tx) => {
    setEditingTx(tx);
    setModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction record?')) return;

    try {
      const response = await api.delete(`/transactions/${id}`);
      if (response.data.success) {
        fetchDashboardData();
        triggerToast('Transaction successfully removed.');
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error.message);
    }
  };

  // Helper matching Lucide icons to transaction categories
  const getCategoryDetails = (category, type) => {
    const isIncome = type === 'income';
    
    switch (category) {
      case 'Food':
        return { icon: Utensils, bg: 'bg-orange-500/10 text-orange-400 border-orange-500/10' };
      case 'Shopping':
        return { icon: ShoppingBag, bg: 'bg-pink-500/10 text-pink-400 border-pink-500/10' };
      case 'Travel':
        return { icon: Car, bg: 'bg-sky-500/10 text-sky-400 border-sky-500/10' };
      case 'Bills':
        return { icon: Tv, bg: 'bg-violet-500/10 text-violet-400 border-violet-500/10' };
      case 'Salary':
      case 'Freelance':
      case 'Investment':
        return { icon: Wallet, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' };
      default:
        return { icon: HelpCircle, bg: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/10' };
    }
  };

  // Format timestamp standard strings (e.g. May 28, 2026)
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Floating Micro-Toast alerts overlay */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-950/90 text-emerald-400 shadow-2xl flex items-center gap-2 backdrop-blur-md animate-float font-sans text-xs font-bold">
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
              Welcome back, {user?.name.split(' ')[0]} 👋
            </h2>
            <p className="text-zinc-500 text-xs mt-0.5">
              Command your dashboard metrics and view smart spending analytics.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingTx(null);
              setModalOpen(true);
            }}
            className="btn-primary"
          >
            <Plus size={16} />
            Add Transaction
          </button>
        </div>

        {loading && stats.monthlyTrends.length === 0 ? (
          // Full skeleton layout loader
          <LoadingSkeleton />
        ) : (
          <div className="space-y-8">
            
            {/* Stats Highlight Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Total Balance Card */}
              <div className="glass-card glass-card-hover p-6 flex flex-col justify-between border-zinc-800 shadow-glow-primary/5">
                <div className="flex justify-between items-center text-zinc-500">
                  <span className="text-xs font-medium">Total Balance</span>
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-200">
                    <Wallet size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold text-zinc-100 font-sans tracking-tight">
                    ${stats.summary.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Net earnings subtraction</p>
                </div>
              </div>

              {/* Monthly Income Card */}
              <div className="glass-card glass-card-hover p-6 flex flex-col justify-between border-zinc-800 shadow-glow-income/5">
                <div className="flex justify-between items-center text-zinc-500">
                  <span className="text-xs font-medium">Monthly Income</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                    <ArrowUpRight size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold text-emerald-400 font-sans tracking-tight">
                    +${stats.summary.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Earnings aggregates</p>
                </div>
              </div>

              {/* Monthly Expenses Card */}
              <div className="glass-card glass-card-hover p-6 flex flex-col justify-between border-zinc-800 shadow-glow-expense/5">
                <div className="flex justify-between items-center text-zinc-500">
                  <span className="text-xs font-medium">Monthly Expenses</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/10">
                    <ArrowDownRight size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold text-rose-400 font-sans tracking-tight">
                    -${stats.summary.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Outgoings aggregates</p>
                </div>
              </div>

              {/* Savings Rate Card */}
              <div className="glass-card glass-card-hover p-6 flex flex-col justify-between border-zinc-800 shadow-glow-primary/5">
                <div className="flex justify-between items-center text-zinc-500">
                  <span className="text-xs font-medium">Monthly Savings</span>
                  <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 border border-primary-500/10">
                    <PiggyBank size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold text-primary-400 font-sans tracking-tight">
                    ${stats.summary.savingsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Savings rate: <span className="font-semibold text-emerald-400">{stats.summary.savingsRate}%</span>
                  </p>
                </div>
              </div>

            </div>

            {/* Smart Suggestions AI Panel */}
            <InsightCard transactions={recentTransactions} />

            {/* Dynamic Dashboard Body Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Recent Transactions list */}
              <div className="lg:col-span-2 space-y-4">
                <div className="glass-card p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                    <div>
                      <h4 className="text-zinc-100 font-bold text-sm">Recent Transactions</h4>
                      <p className="text-[10px] text-zinc-500">Your latest income and outgoings logs</p>
                    </div>
                  </div>

                  {recentTransactions.length === 0 ? (
                    <EmptyState onActionClick={() => setModalOpen(true)} />
                  ) : (
                    <div className="divide-y divide-zinc-800/80">
                      {recentTransactions.map((tx) => {
                        const { icon: Icon, bg } = getCategoryDetails(tx.category, tx.type);
                        const isIncome = tx.type === 'income';

                        return (
                          <div key={tx._id} className="py-3.5 flex items-center justify-between group">
                            
                            {/* Left category details */}
                            <div className="flex items-center gap-3 text-left">
                              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${bg} transition-transform group-hover:scale-105 duration-200`}>
                                <Icon size={16} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-zinc-200 line-clamp-1">{tx.title}</p>
                                <span className="text-[9px] text-zinc-500 font-medium">
                                  {tx.category} • {formatDate(tx.date)}
                                </span>
                              </div>
                            </div>

                            {/* Right amounts & actions triggers */}
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className={`text-xs font-bold font-sans ${isIncome ? 'text-emerald-400' : 'text-zinc-200'}`}>
                                  {isIncome ? '+' : '-'}${tx.amount.toFixed(2)}
                                </span>
                                {tx.isRecurring && (
                                  <p className="text-[8px] text-primary-400 bg-primary-500/5 border border-primary-500/10 px-1 rounded uppercase mt-0.5 tracking-wider font-semibold">
                                    Recurring
                                  </p>
                                )}
                              </div>

                              {/* Hover actions buttons */}
                              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                  onClick={() => handleEditClick(tx)}
                                  className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-primary-400 hover:bg-primary-500/10 border border-zinc-700/30 transition-colors"
                                  title="Edit entry"
                                >
                                  <Edit2 size={10} />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(tx._id)}
                                  className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-zinc-700/30 transition-colors"
                                  title="Delete entry"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Budgets Progress Panel */}
              <div className="space-y-6">
                <BudgetProgress
                  progress={budgetProgress}
                  onBudgetUpdated={fetchDashboardData}
                  currentMonth={month}
                />
              </div>

            </div>

          </div>
        )}
      </main>

      {/* Mounting our creation/update modal */}
      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTx(null);
        }}
        onSuccess={handleTransactionSuccess}
        editingTransaction={editingTx}
      />
    </div>
  );
};

export default Dashboard;
