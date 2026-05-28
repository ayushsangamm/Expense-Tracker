// frontend/src/pages/Profile.jsx
// User settings, security modifications, budget targets controls, and avatar selection.

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { User, Key, Shield, HelpCircle, Check, DollarSign, Tag, CheckCircle2, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  // Profile forms parameters
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Budget forms parameters
  const [budgetCategory, setBudgetCategory] = useState('All');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [currentMonth, setCurrentMonth] = useState('');
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [activeBudgetsList, setActiveBudgetsList] = useState([]);

  // Alerts states
  const [toastMessage, setToastMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [budgetError, setBudgetError] = useState('');

  // Illustrated Avatar Options
  const avatarList = [
    `https://api.dicebear.com/7.x/initials/svg?seed=${user ? encodeURIComponent(user.name) : 'A'}`,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  ];

  // Set default values upon load
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setSelectedAvatar(user.avatar);
    }

    const today = new Date();
    const formattedMonth = today.toISOString().slice(0, 7); // e.g. "2026-05"
    setCurrentMonth(formattedMonth);
  }, [user]);

  // Fetch all active budgets configured for this month
  const fetchActiveBudgets = async () => {
    if (!currentMonth) return;
    try {
      const response = await api.get(`/budgets?month=${currentMonth}`);
      if (response.data.success) {
        setActiveBudgetsList(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load active monthly budgets:', err.message);
    }
  };

  useEffect(() => {
    fetchActiveBudgets();
  }, [currentMonth]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Submit profile edits
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');

    if (!name.trim()) return setProfileError('Name cannot be empty');

    try {
      setProfileLoading(true);
      const result = await updateProfile(name, password || undefined, selectedAvatar);
      
      if (result.success) {
        setPassword('');
        triggerToast('Profile updated successfully!');
      } else {
        setProfileError(result.error);
      }
    } catch (err) {
      setProfileError('Failed to save profile changes.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Configure target category budgets
  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    setBudgetError('');

    if (!budgetLimit || parseFloat(budgetLimit) < 0) {
      return setBudgetError('Please enter a valid amount (0 or greater)');
    }

    try {
      setBudgetLoading(true);
      const response = await api.post('/budgets', {
        category: budgetCategory,
        limit: parseFloat(budgetLimit),
        month: currentMonth,
      });

      if (response.data.success) {
        setBudgetLimit('');
        fetchActiveBudgets();
        triggerToast(`Budget limit for ${budgetCategory} updated!`);
      }
    } catch (err) {
      setBudgetError(err.response?.data?.message || 'Failed to save budget settings');
    } finally {
      setBudgetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Visual feedback toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-950/90 text-emerald-400 shadow-2xl flex items-center gap-2 backdrop-blur-md animate-float text-xs font-bold font-sans">
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Title area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Profile & Settings</h2>
            <p className="text-zinc-500 text-xs mt-0.5">
              Customize your profile, select avatars, and define monthly budgets limits.
            </p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Columns: Profile and Security details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customizer Details card */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-6 pb-2 border-b border-zinc-800/80">
                <User size={16} className="text-primary-400" />
                <div>
                  <h4 className="text-zinc-100 font-bold text-sm">Account Customization</h4>
                  <p className="text-[10px] text-zinc-500">Edit your credentials and choose profile avatars</p>
                </div>
              </div>

              {profileError && (
                <div className="mb-4 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-semibold">
                  {profileError}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                
                {/* Avatar selection panels */}
                <div>
                  <label className="block text-zinc-400 text-xs font-bold mb-3">Choose Profile Avatar</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {avatarList.map((avatarUrl, index) => {
                      const isSelected = selectedAvatar === avatarUrl;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedAvatar(avatarUrl)}
                          className={`relative w-12 h-12 rounded-full border overflow-hidden p-0.5 transition-all active:scale-95 ${
                            isSelected
                              ? 'border-primary-500 ring-2 ring-primary-500/30 scale-105'
                              : 'border-zinc-800 hover:border-zinc-600'
                          }`}
                        >
                          <img src={avatarUrl} alt="Avatar option" className="w-full h-full rounded-full object-cover bg-zinc-950" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary-600/20 flex items-center justify-center rounded-full">
                              <Check size={12} className="text-white drop-shadow" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div>
                    <label className="block text-zinc-400 text-xs font-bold mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="glass-input"
                      disabled={profileLoading}
                      required
                    />
                  </div>

                  {/* Email address (locked/read-only for security) */}
                  <div>
                    <label className="block text-zinc-400 text-xs font-bold mb-1.5 flex items-center gap-1">
                      Email Address <span className="text-[9px] text-zinc-600 font-normal uppercase">(Read-Only)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      className="glass-input text-zinc-500 cursor-not-allowed bg-zinc-950/20 border-zinc-900"
                      disabled
                    />
                  </div>
                </div>

                {/* Password field updates */}
                <div className="pt-4 border-t border-zinc-800/80">
                  <div className="flex items-center gap-1.5 mb-3 text-zinc-300 font-bold text-xs">
                    <Key size={14} />
                    <span>Change Password (Leave blank to keep existing)</span>
                  </div>
                  <div className="relative max-w-md">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password (min. 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="glass-input pr-10"
                      disabled={profileLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="btn-primary py-2 px-5 text-xs font-semibold rounded-xl"
                    disabled={profileLoading}
                  >
                    {profileLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Save Profile Settings'
                    )}
                  </button>
                </div>

              </form>
            </div>

            {/* Quick system info */}
            <div className="glass-card p-6 border-zinc-800 flex items-center gap-4 bg-zinc-950/10">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center border border-primary-500/10 shrink-0">
                <Shield size={18} />
              </div>
              <div className="text-left text-xs font-sans text-zinc-400 leading-relaxed">
                <p className="font-bold text-zinc-200 mb-0.5">FinFlow Security Standard</p>
                Session sessions are encrypted via standard Web Tokens. Password hash databases protect logins using advanced bcrypt protocols.
              </div>
            </div>

          </div>

          {/* Right Column: Category Budgets Limit configurations */}
          <div className="space-y-6">
            
            {/* Configure default thresholds */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-6 pb-2 border-b border-b-zinc-800/80">
                <DollarSign size={16} className="text-primary-400" />
                <div>
                  <h4 className="text-zinc-100 font-bold text-sm">Define Category Budgets</h4>
                  <p className="text-[10px] text-zinc-500">Configure monthly maximum limits</p>
                </div>
              </div>

              {budgetError && (
                <div className="mb-4 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-semibold">
                  {budgetError}
                </div>
              )}

              <form onSubmit={handleBudgetSubmit} className="space-y-4">
                
                {/* Category selector */}
                <div>
                  <label className="block text-zinc-400 text-xs font-bold mb-1.5 flex items-center gap-1">
                    <Tag size={12} /> Target Category
                  </label>
                  <select
                    value={budgetCategory}
                    onChange={(e) => setBudgetCategory(e.target.value)}
                    className="glass-input cursor-pointer"
                    disabled={budgetLoading}
                  >
                    <option value="All" className="bg-zinc-950">Overall Monthly Limit</option>
                    <option value="Food" className="bg-zinc-950">Food</option>
                    <option value="Shopping" className="bg-zinc-950">Shopping</option>
                    <option value="Travel" className="bg-zinc-950">Travel</option>
                    <option value="Bills" className="bg-zinc-950">Bills</option>
                    <option value="Entertainment" className="bg-zinc-950">Entertainment</option>
                    <option value="Other" className="bg-zinc-950">Other</option>
                  </select>
                </div>

                {/* Limit input */}
                <div>
                  <label className="block text-zinc-400 text-xs font-bold mb-1.5">Monthly Maximum ($)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 500"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                    className="glass-input"
                    disabled={budgetLoading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-2.5 text-xs font-bold rounded-xl mt-2"
                  disabled={budgetLoading}
                >
                  {budgetLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Configure Limit Target'
                  )}
                </button>

              </form>
            </div>

            {/* List configured budgets summaries */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-b-zinc-800/80">
                <Check size={16} className="text-emerald-400" />
                <div>
                  <h4 className="text-zinc-100 font-bold text-sm">Active Limits</h4>
                  <p className="text-[10px] text-zinc-500">Configured targets for {currentMonth}</p>
                </div>
              </div>

              {activeBudgetsList.length === 0 ? (
                <div className="text-center py-4 text-zinc-600 text-xs flex flex-col items-center gap-1 bg-zinc-950/20 rounded-xl border border-zinc-900">
                  <AlertTriangle size={16} />
                  <span>No limits active this month.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeBudgetsList.map((item) => (
                    <div
                      key={item.category}
                      className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950/40 flex justify-between items-center text-xs"
                    >
                      <span className="font-bold text-zinc-300">{item.category === 'All' ? 'Overall' : item.category}</span>
                      <span className="font-semibold text-zinc-400">${item.limit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
};

export default Profile;
