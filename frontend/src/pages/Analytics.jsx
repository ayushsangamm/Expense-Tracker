// frontend/src/pages/Analytics.jsx
// Visual analytics graphs using Recharts.

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { GraphSkeleton } from '../components/LoadingSkeleton';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { PieChart as PieIcon, BarChart3, TrendingUp, DollarSign, Calendar, TrendingDown } from 'lucide-react';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    summary: { totalBalance: 0, totalIncome: 0, totalExpense: 0, savingsAmount: 0, savingsRate: 0 },
    categoryBreakdown: [],
    monthlyTrends: [],
  });

  // Recharts color palettes matching our custom Tailwind config
  const CHART_COLORS = ['#8b5cf6', '#ec4899', '#f97316', '#0ea5e9', '#10b981', '#64748b'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/transactions/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to load visual analytics:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Spending Analytics</h2>
            <p className="text-zinc-500 text-xs mt-0.5">
              Visualize your monthly trends, balance growth, and category outgoings.
            </p>
          </div>
        </div>

        {loading ? (
          // Blinking analytics skeletons loader
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraphSkeleton />
            <GraphSkeleton />
            <GraphSkeleton />
            <GraphSkeleton />
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Quick Metrics highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="glass-card p-5 border-zinc-800 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/10">
                  <TrendingUp size={18} />
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase">Total Inflows</span>
                  <p className="text-lg font-bold text-zinc-100 mt-0.5">${stats.summary.totalIncome.toFixed(2)}</p>
                </div>
              </div>

              <div className="glass-card p-5 border-zinc-800 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/10">
                  <TrendingDown size={18} />
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase">Total Outflows</span>
                  <p className="text-lg font-bold text-zinc-100 mt-0.5">${stats.summary.totalExpense.toFixed(2)}</p>
                </div>
              </div>

              <div className="glass-card p-5 border-zinc-800 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center border border-primary-500/10">
                  <DollarSign size={18} />
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase">Net Savings</span>
                  <p className="text-lg font-bold text-zinc-100 mt-0.5">${stats.summary.savingsAmount.toFixed(2)}</p>
                </div>
              </div>

            </div>

            {/* Charts Row 1: Donut breakdown & Monthly Comparisons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Category Pie/Donut Chart */}
              <div className="glass-card p-6 flex flex-col min-h-[350px]">
                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-zinc-800/80">
                  <PieIcon size={16} className="text-primary-400" />
                  <div>
                    <h4 className="text-zinc-100 font-bold text-sm">Expenses Category Breakdown</h4>
                    <p className="text-[10px] text-zinc-500">Distribution of your outgoings by category</p>
                  </div>
                </div>

                <div className="flex-1 min-h-[220px] flex items-center justify-center">
                  {stats.categoryBreakdown.length === 0 ? (
                    <p className="text-xs text-zinc-500">No expense records found to compile breakdowns.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.categoryBreakdown}
                          cx="50%"
                          cy="45%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {stats.categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            borderColor: 'rgba(255,255,255,0.08)',
                            borderRadius: '12px',
                            color: '#e4e4e7',
                            fontSize: '11px',
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          iconSize={10}
                          iconType="circle"
                          wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Monthly Income vs Expense Dual Bars */}
              <div className="glass-card p-6 flex flex-col min-h-[350px]">
                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-zinc-800/80">
                  <BarChart3 size={16} className="text-primary-400" />
                  <div>
                    <h4 className="text-zinc-100 font-bold text-sm">Income vs Expense Trends</h4>
                    <p className="text-[10px] text-zinc-500">Monthly dual performance comparison</p>
                  </div>
                </div>

                <div className="flex-1 min-h-[220px]">
                  {stats.monthlyTrends.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                      No historical logs available yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.monthlyTrends} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis dataKey="month" stroke="#71717a" fontSize={10} tickLine={false} />
                        <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            borderColor: 'rgba(255,255,255,0.08)',
                            borderRadius: '12px',
                            color: '#e4e4e7',
                            fontSize: '11px',
                          }}
                        />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                        <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
                        <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>

            {/* Charts Row 2: Net Cash reserves growth area curve */}
            <div className="glass-card p-6 flex flex-col min-h-[350px]">
              <div className="flex items-center gap-2 mb-6 pb-2 border-b border-zinc-800/80">
                <Calendar size={16} className="text-primary-400" />
                <div>
                  <h4 className="text-zinc-100 font-bold text-sm">Monthly Balance Growth</h4>
                  <p className="text-[10px] text-zinc-500">Progression of your net savings over time</p>
                </div>
              </div>

              <div className="flex-1 min-h-[220px]">
                {stats.monthlyTrends.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                    No historical logs available yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.monthlyTrends} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="month" stroke="#71717a" fontSize={10} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#18181b',
                          borderColor: 'rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          color: '#e4e4e7',
                          fontSize: '11px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        name="Balance"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorBalance)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default Analytics;
