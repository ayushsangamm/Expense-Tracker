// frontend/src/components/BudgetProgress.jsx
// Visual component containing budget category list progress bars and inline config toggles.

import React, { useState } from 'react';
import { Utensils, ShoppingBag, Car, Tv, AlertTriangle, PenTool, Check, HelpCircle, X, Plus } from 'lucide-react';
import api from '../utils/api';

const BudgetProgress = ({ progress = [], onBudgetUpdated, currentMonth }) => {
  const [editingId, setEditingId] = useState(null);
  const [editLimit, setEditLimit] = useState('');
  const [loading, setLoading] = useState(false);

  // Match Lucide icons to categories
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Food':
        return { icon: Utensils, color: 'text-orange-400 bg-orange-500/10' };
      case 'Shopping':
        return { icon: ShoppingBag, color: 'text-pink-400 bg-pink-500/10' };
      case 'Travel':
        return { icon: Car, color: 'text-sky-400 bg-sky-500/10' };
      case 'Bills':
        return { icon: Tv, color: 'text-violet-400 bg-violet-500/10' };
      default:
        return { icon: HelpCircle, color: 'text-zinc-400 bg-zinc-500/10' };
    }
  };

  // Determine progress bar color based on percentage spent
  const getProgressBarColor = (percentage) => {
    if (percentage >= 100) return 'bg-rose-500 shadow-glow-expense';
    if (percentage >= 80) return 'bg-amber-500';
    return 'bg-primary-500 shadow-glow-primary';
  };

  const handleEditClick = (budget) => {
    setEditingId(budget._id || budget.category);
    setEditLimit(budget.limit);
  };

  const handleSaveBudget = async (category) => {
    if (!editLimit || parseFloat(editLimit) < 0) return;

    try {
      setLoading(true);
      const response = await api.post('/budgets', {
        category,
        limit: parseFloat(editLimit),
        month: currentMonth,
      });

      if (response.data.success) {
        setEditingId(null);
        if (onBudgetUpdated) {
          onBudgetUpdated();
        }
      }
    } catch (error) {
      console.error('Failed to upsert budget limit:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-zinc-100 font-bold text-sm">Monthly Budgets</h4>
          <p className="text-[10px] text-zinc-500">Track and adjust limits for {currentMonth}</p>
        </div>
      </div>

      {progress.length === 0 ? (
        <div className="text-center py-6 text-zinc-500">
          <AlertTriangle size={24} className="mx-auto text-zinc-600 mb-2 animate-bounce" />
          <p className="text-xs">No active budget limits set.</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Use the Profile page to establish monthly category targets.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {progress.map((item) => {
            const isEditing = editingId === (item._id || item.category);
            const { icon: Icon, colorClass } = getCategoryIcon(item.category);
            const isOverall = item.category === 'All';

            return (
              <div
                key={item.category}
                className={`p-3.5 rounded-xl border transition-all ${
                  isOverall
                    ? 'bg-zinc-950/60 border-zinc-800 shadow-inner'
                    : 'bg-zinc-900/30 border-transparent'
                }`}
              >
                {/* Header title & limit text */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    {!isOverall && (
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${getCategoryIcon(item.category).color}`}>
                        <Icon size={14} />
                      </div>
                    )}
                    <div>
                      <span className={`text-xs font-bold ${isOverall ? 'text-zinc-200' : 'text-zinc-300'}`}>
                        {isOverall ? 'Overall Monthly Limit' : item.category}
                      </span>
                    </div>
                  </div>

                  {isEditing ? (
                    // Inline editor inputs
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <span className="absolute left-2 top-1 text-[10px] text-zinc-500">$</span>
                        <input
                          type="number"
                          value={editLimit}
                          onChange={(e) => setEditLimit(e.target.value)}
                          className="w-16 bg-zinc-950 border border-zinc-800 text-zinc-100 py-0.5 pl-4 pr-1 text-xs rounded-lg outline-none focus:border-primary-500"
                          disabled={loading}
                          placeholder="Limit"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveBudget(item.category)}
                        disabled={loading}
                        className="p-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/10 transition-colors"
                      >
                        <Check size={10} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        disabled={loading}
                        className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/10 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    // Limit action toggles
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400">
                        ${Math.round(item.spent)} <span className="text-zinc-600">/</span> ${item.limit}
                      </span>
                      <button
                        onClick={() => handleEditClick(item)}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors"
                        title="Edit limit"
                      >
                        <PenTool size={10} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Progress bar container */}
                <div className="relative w-full h-2 bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(
                      item.percentSpent
                    )}`}
                    style={{ width: `${item.percentSpent}%` }}
                  />
                </div>

                {/* Bottom detail row */}
                <div className="flex justify-between items-center mt-1.5">
                  <span className="text-[9px] text-zinc-500">
                    {item.percentSpent}% Consumed
                  </span>
                  {item.percentSpent >= 100 ? (
                    <span className="text-[9px] text-rose-400 font-semibold flex items-center gap-0.5">
                      <AlertTriangle size={8} /> Limit Exceeded
                    </span>
                  ) : (
                    <span className="text-[9px] text-zinc-400">
                      ${Math.round(item.remaining)} remaining
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetProgress;
