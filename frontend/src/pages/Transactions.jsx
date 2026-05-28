// frontend/src/pages/Transactions.jsx
// Complete searchable, filterable logs page for transactions, supporting browser CSV downloads.

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import AddTransactionModal from '../components/AddTransactionModal';
import EmptyState from '../components/EmptyState';
import { ListItemSkeleton } from '../components/LoadingSkeleton';
import api from '../utils/api';
import { Search, Filter, Calendar, Download, Plus, Edit2, Trash2, HelpCircle, Utensils, ShoppingBag, Car, Tv, Wallet, CheckCircle2 } from 'lucide-react';

const Transactions = () => {
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  // States
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Search & Filter parameters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All'); // 'All' | 'income' | 'expense'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch transactions based on search and filter states
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      // Construct API query query parameters
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search);
      if (category !== 'All') params.append('category', category);
      if (type !== 'All') params.append('type', type);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/transactions?${params.toString()}`);
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load transaction list:', error.message);
    } finally {
      setLoading(false);
    }
  }, [search, category, type, startDate, endDate]);

  // Triggers visual feedback toasts
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    // Implement standard debounce to avoid query calls on every keyboard character stroke
    const debounceQuery = setTimeout(fetchTransactions, 300);
    return () => clearTimeout(debounceQuery);
  }, [search, category, type, startDate, endDate, fetchTransactions]);

  const handleTransactionSuccess = (txData, actionType) => {
    fetchTransactions();
    triggerToast(actionType === 'updated' ? 'Transaction saved successfully!' : 'Transaction logged successfully!');
  };

  const handleEditClick = (tx) => {
    setEditingTx(tx);
    setModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Remove this transaction log?')) return;

    try {
      const response = await api.delete(`/transactions/${id}`);
      if (response.data.success) {
        fetchTransactions();
        triggerToast('Transaction removed successfully.');
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error.message);
    }
  };

  /**
   * Resume Worthy Client-Side CSV Generator
   * Maps current filters array, structures tables, and triggers quick downloads.
   */
  const handleExportToCSV = () => {
    if (transactions.length === 0) return;

    const headers = ['Date', 'Title', 'Type', 'Category', 'Amount ($)', 'Notes', 'Recurring'];
    const rows = transactions.map((tx) => [
      new Date(tx.date).toLocaleDateString(),
      `"${tx.title.replace(/"/g, '""')}"`,
      tx.type,
      tx.category,
      tx.amount.toFixed(2),
      `"${(tx.notes || '').replace(/"/g, '""')}"`,
      tx.isRecurring ? 'Yes' : 'No',
    ]);

    // Format content stream
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', encodedUri);
    downloadLink.setAttribute('download', `FinFlow_Transactions_Export_${new Date().toISOString().split('T')[0]}.csv`);
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    triggerToast('Transactions exported to CSV!');
  };

  // Helper matching visual icons to categories
  const getCategoryDetails = (cat, txType) => {
    switch (cat) {
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

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setType('All');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Floating visual success toasts */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-950/90 text-emerald-400 shadow-2xl flex items-center gap-2 backdrop-blur-md animate-float text-xs font-bold font-sans">
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page title area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Transaction Logs</h2>
            <p className="text-zinc-500 text-xs mt-0.5">
              Review, filter, search, and export your cashflow records.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportToCSV}
              disabled={transactions.length === 0}
              className="btn-secondary"
            >
              <Download size={16} />
              Export to CSV
            </button>
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
        </div>

        {/* Filter Configuration Bar */}
        <div className="glass-card p-6 mb-6 space-y-4">
          <div className="flex items-center gap-2 text-zinc-400 pb-3 border-b border-zinc-800/80">
            <Filter size={14} className="text-primary-500" />
            <span className="text-xs font-bold">Search & Filter Controls</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Title search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-zinc-500" size={16} />
              <input
                type="text"
                placeholder="Search descriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="glass-input pl-9"
              />
            </div>

            {/* Type selector */}
            <div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="glass-input cursor-pointer"
              >
                <option value="All" className="bg-zinc-950">All Types</option>
                <option value="expense" className="bg-zinc-950">Expenses</option>
                <option value="income" className="bg-zinc-950">Income</option>
              </select>
            </div>

            {/* Category selector */}
            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="glass-input cursor-pointer"
              >
                <option value="All" className="bg-zinc-950">All Categories</option>
                {type === 'income' ? (
                  <>
                    <option value="Salary" className="bg-zinc-950">Salary</option>
                    <option value="Freelance" className="bg-zinc-950">Freelance</option>
                    <option value="Investment" className="bg-zinc-950">Investment</option>
                  </>
                ) : (
                  <>
                    <option value="Food" className="bg-zinc-950">Food</option>
                    <option value="Shopping" className="bg-zinc-950">Shopping</option>
                    <option value="Travel" className="bg-zinc-950">Travel</option>
                    <option value="Bills" className="bg-zinc-950">Bills</option>
                    <option value="Entertainment" className="bg-zinc-950">Entertainment</option>
                  </>
                )}
                <option value="Other" className="bg-zinc-950">Other</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-zinc-500 pointer-events-none" size={16} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="glass-input pl-9 text-xs"
                placeholder="From date"
              />
            </div>

            {/* End Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-zinc-500 pointer-events-none" size={16} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="glass-input pl-9 text-xs"
                placeholder="To date"
              />
            </div>

          </div>

          {/* Quick reset actions */}
          {(search || category !== 'All' || type !== 'All' || startDate || endDate) && (
            <div className="flex justify-end pt-1">
              <button
                onClick={clearFilters}
                className="text-[10px] font-bold text-zinc-500 hover:text-rose-400 transition-colors uppercase tracking-wider"
              >
                Clear Active Filters
              </button>
            </div>
          )}
        </div>

        {/* Transactions log container */}
        <div className="glass-card p-6">
          
          {loading ? (
            // Blinking skeleton lists loader
            <div className="space-y-3">
              <ListItemSkeleton />
              <ListItemSkeleton />
              <ListItemSkeleton />
              <ListItemSkeleton />
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              title={search || category !== 'All' || type !== 'All' || startDate || endDate ? "No matches found" : "No transactions recorded"}
              message={search || category !== 'All' || type !== 'All' || startDate || endDate ? "Adjust your search parameters or filter limits." : "Add your first entry to begin mapping financial flows."}
              buttonText="Reset Filters"
              onActionClick={search || category !== 'All' || type !== 'All' || startDate || endDate ? clearFilters : () => setModalOpen(true)}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {transactions.map((tx) => {
                    const { icon: Icon, bg } = getCategoryDetails(tx.category, tx.type);
                    const isIncome = tx.type === 'income';

                    return (
                      <tr key={tx._id} className="hover:bg-zinc-900/10 group transition-colors">
                        
                        {/* Title descriptions with category symbols */}
                        <td className="py-3.5 px-4 font-bold text-zinc-200">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${bg}`}>
                              <Icon size={14} />
                            </div>
                            <div>
                              <p className="line-clamp-1">{tx.title}</p>
                              {tx.isRecurring && (
                                <span className="text-[7.5px] px-1 font-bold text-primary-400 bg-primary-500/5 border border-primary-500/10 rounded uppercase">
                                  Recurring ({tx.recurringFrequency})
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 text-zinc-400">
                          {tx.category}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap">
                          {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>

                        {/* Notes snippet */}
                        <td className="py-3.5 px-4 text-zinc-500 max-w-[150px] truncate" title={tx.notes}>
                          {tx.notes || '—'}
                        </td>

                        {/* Amount */}
                        <td className={`py-3.5 px-4 text-right font-bold font-sans whitespace-nowrap ${isIncome ? 'text-emerald-400' : 'text-zinc-200'}`}>
                          {isIncome ? '+' : '-'}${tx.amount.toFixed(2)}
                        </td>

                        {/* Action controllers */}
                        <td className="py-3.5 px-4">
                          <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            <button
                              onClick={() => handleEditClick(tx)}
                              className="p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-primary-400 hover:bg-primary-500/10 border border-zinc-700/30 transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={10} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(tx._id)}
                              className="p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-zinc-700/30 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </main>

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

export default Transactions;
