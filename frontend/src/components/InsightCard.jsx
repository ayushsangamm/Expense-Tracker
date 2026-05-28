// frontend/src/components/InsightCard.jsx
// Visual component containing dynamic spending heuristics.

import React, { useMemo } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ShieldAlert } from 'lucide-react';

const InsightCard = ({ transactions = [] }) => {
  
  // Calculate dynamic insights based on actual transaction data
  const insights = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [
        {
          type: 'tip',
          icon: Lightbulb,
          color: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
          title: 'Awaiting transactions',
          message: 'Add some income and expense entries to unlock personalized spending tips and dashboard insights.',
        },
      ];
    }

    const tips = [];
    let incomeSum = 0;
    let expenseSum = 0;
    const categorySpent = {};

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        incomeSum += tx.amount;
      } else {
        expenseSum += tx.amount;
        categorySpent[tx.category] = (categorySpent[tx.category] || 0) + tx.amount;
      }
    });

    const netSavings = Math.max(0, incomeSum - expenseSum);
    const savingsRate = incomeSum > 0 ? (netSavings / incomeSum) * 100 : 0;

    // Insight Heuristic 1: High Spending Ratio Alert
    if (incomeSum > 0 && expenseSum / incomeSum > 0.8) {
      const spentPercent = Math.round((expenseSum / incomeSum) * 100);
      tips.push({
        type: 'alert',
        icon: ShieldAlert,
        color: 'text-rose-400 border-rose-500/20 bg-rose-500/5 shadow-glow-expense/5',
        title: 'High income consumption',
        message: `You have consumed ${spentPercent}% of your active income this month. Consider pausing non-essential purchases to safeguard your reserves.`,
      });
    }

    // Insight Heuristic 2: Identify Top Spending Categories & Suggest Actionable Advice
    const categories = Object.keys(categorySpent);
    if (categories.length > 0) {
      // Find category with highest expense sum
      const topCategory = categories.reduce((a, b) => (categorySpent[a] > categorySpent[b] ? a : b));
      const topAmount = Math.round(categorySpent[topCategory]);

      if (topAmount > 30) {
        let advice = 'Auditing expenses in this category is an excellent starting point to reduce outgoings.';
        if (topCategory === 'Food') {
          advice = 'Preparing meals at home more frequently and planning groceries can reduce Food bills by up to 30%.';
        } else if (topCategory === 'Shopping') {
          advice = 'Utilize a "48-hour delay rule" before purchasing non-essential items to curb impulse buys.';
        } else if (topCategory === 'Bills') {
          advice = 'Check for unused subscriptions or consult service providers to negotiate lower utility base rates.';
        } else if (topCategory === 'Travel') {
          advice = 'Consolidating trips or switching to ride-sharing could shave off transit costs this month.';
        }

        tips.push({
          type: 'info',
          icon: Lightbulb,
          color: 'text-primary-400 border-primary-500/20 bg-primary-500/5 shadow-glow-primary/5',
          title: `Heavy outgoings in ${topCategory}`,
          message: `You spent $${topAmount} on ${topCategory} recently. ${advice}`,
        });
      }
    }

    // Insight Heuristic 3: Check Savings Rates against standard 20% guidelines
    if (incomeSum > 0 && savingsRate < 20) {
      tips.push({
        type: 'warning',
        icon: TrendingUp,
        color: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
        title: 'Optimize your savings rate',
        message: `Your current savings rate sits at ${Math.round(savingsRate)}%. Financial experts recommend saving 20% of your earnings to accelerate your milestones.`,
      });
    }

    // Insight Heuristic 4: Encourage and Celebrate Positive Cashflow
    if (incomeSum > 0 && savingsRate >= 20) {
      tips.push({
        type: 'success',
        icon: Sparkles,
        color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5 shadow-glow-income/5',
        title: 'Healthy financial posture',
        message: `Brilliant work! Your active savings rate is ${Math.round(savingsRate)}%, surpassing the target 20% benchmark. You are on track to exceed your goals.`,
      });
    }

    // Return up to two smart cards to prevent dashboard clutter
    return tips.slice(0, 2);
  }, [transactions]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-primary-400 animate-pulse" />
        <h4 className="text-zinc-200 text-sm font-bold">FinFlow Intelligent Insights</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((tip, idx) => {
          const Icon = tip.icon;
          return (
            <div
              key={idx}
              className={`p-4 border rounded-2xl flex gap-3 transition-all duration-300 ${tip.color}`}
            >
              <div className="shrink-0 mt-0.5">
                <Icon size={18} />
              </div>
              <div className="flex-1 text-left">
                <h5 className="font-semibold text-sm mb-1 text-zinc-100">{tip.title}</h5>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">{tip.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InsightCard;
