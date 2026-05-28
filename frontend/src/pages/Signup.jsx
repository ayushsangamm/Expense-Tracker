// frontend/src/pages/Signup.jsx
// User registration screen supporting standard email signup.

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, CreditCard } from 'lucide-react';

const Signup = () => {
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If user is already logged in, redirect them immediately to dashboard
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field Validations
    if (!name.trim()) return setError('Please enter your name');
    if (!email.trim()) return setError('Please enter a valid email address');
    if (!password) return setError('Please choose a password');
    if (password.length < 6) return setError('Password must be at least 6 characters long');

    try {
      setLoading(true);
      const result = await signup(name, email, password);
      if (result.success) {
        navigate('/', { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected registration failure occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Decorative glow overlays */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-income/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 z-10">
        
        {/* App Brand Logo */}
        <div className="flex flex-col items-center gap-2 mb-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-primary-500/20">
            <CreditCard size={24} />
          </div>
          <h1 className="font-extrabold text-2xl tracking-tight text-zinc-100 mt-2">Get Started</h1>
          <p className="text-zinc-500 text-sm">Join FinFlow and command your financial destination</p>
        </div>

        {/* Signup Card */}
        <div className="glass-card p-8 border border-cardBorder shadow-2xl relative">
          
          <h2 className="text-xl font-bold text-zinc-200 mb-6">Create Account</h2>
          
          {error && (
            <div className="mb-4 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name Field */}
            <div>
              <label className="block text-zinc-400 text-xs font-bold mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input pl-10"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-zinc-400 text-xs font-bold mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input pl-10"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-zinc-400 text-xs font-bold mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input pl-10 pr-10"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full btn-primary py-3 rounded-xl mt-4 font-bold text-sm shadow-md"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus size={16} />
                  Create Free Account
                </>
              )}
            </button>

          </form>

        </div>

        {/* Link back to login */}
        <p className="text-center text-xs text-zinc-500">
          Already registered?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-bold underline underline-offset-4">
            Sign in here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Signup;
