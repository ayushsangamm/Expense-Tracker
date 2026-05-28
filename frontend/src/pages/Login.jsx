// frontend/src/pages/Login.jsx
// User login portal supporting standard email and Google sign-in.

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn, CreditCard, Sparkles } from 'lucide-react';

const Login = () => {
  const { login, googleLogin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form input parameters
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  // Get destination path (defaults to dashboard "/")
  const from = location.state?.from?.pathname || '/';

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Mount Google GIS Identity Services Button
  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          // Make sure this client_id matches the one in backend or standard credentials
          client_id: 'your-google-client-id-here.apps.googleusercontent.com',
          callback: async (response) => {
            try {
              setLoading(true);
              const result = await googleLogin(response.credential);
              if (result.success) {
                navigate(from, { replace: true });
              } else {
                setError(result.error);
              }
            } catch (err) {
              setError('Failed to login via Google.');
            } finally {
              setLoading(false);
            }
          },
        });

        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInDiv'),
          { 
            theme: 'filled_black', 
            size: 'large', 
            width: '100%', 
            text: 'signin_with',
            shape: 'circle'
          }
        );
      }
    };

    // Delay initialization slightly to let the script mount in index.html
    const timer = setTimeout(initializeGoogle, 600);
    return () => clearTimeout(timer);
  }, [googleLogin, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      return setError('Please fill in both email and password fields.');
    }

    try {
      setLoading(true);
      const result = await login(email, password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected login failure occurred.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * One-Click Demo Developer login bypass
   * Passes a mock JWT credential directly to trigger our offline verification backend code.
   */
  const handleDemoLogin = async () => {
    setError('');
    try {
      setDemoLoading(true);
      
      // Simulate standard base64 google credential for local developer offline fallback
      const mockPayload = {
        email: 'developer@finflow.local',
        name: 'Demo Developer',
        sub: 'google_demo_12345',
        picture: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo'
      };
      
      const headerStr = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payloadStr = btoa(JSON.stringify(mockPayload));
      const mockCredential = `${headerStr}.${payloadStr}.signature_placeholder`;

      const result = await googleLogin(mockCredential);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Local developer mock bypass failed.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Decorative colored glow spheres in background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-income/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 z-10">
        
        {/* App Logo Indicator */}
        <div className="flex flex-col items-center gap-2 mb-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-primary-500/20">
            <CreditCard size={24} />
          </div>
          <h1 className="font-extrabold text-2xl tracking-tight text-zinc-100 mt-2">Welcome to FinFlow</h1>
          <p className="text-zinc-500 text-sm">Empower your finances with modern startup tracking</p>
        </div>

        {/* Login Glass Card */}
        <div className="glass-card p-8 border border-cardBorder shadow-2xl relative">
          
          <h2 className="text-xl font-bold text-zinc-200 mb-6">Sign In</h2>
          
          {error && (
            <div className="mb-4 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
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
                  disabled={loading || demoLoading}
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input pl-10 pr-10"
                  disabled={loading || demoLoading}
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

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full btn-primary py-3 rounded-xl mt-4 font-bold text-sm shadow-md"
              disabled={loading || demoLoading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={16} />
                  Login to Account
                </>
              )}
            </button>

          </form>

          {/* Separation line */}
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink mx-4 text-zinc-600 text-xs uppercase font-sans">Or continue with</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          {/* Social Sign-In buttons grid */}
          <div className="space-y-3">
            {/* Official Google sign-in container */}
            <div id="googleSignInDiv" className="w-full overflow-hidden flex justify-center"></div>

            {/* One-Click developer demonstration bypass button */}
            <button
              onClick={handleDemoLogin}
              className="w-full py-2.5 rounded-full border border-primary-500/20 bg-primary-500/5 hover:bg-primary-500/10 text-primary-400 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              disabled={loading || demoLoading}
              type="button"
            >
              {demoLoading ? (
                <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles size={14} className="animate-pulse" />
                  One-Click Demo Developer Login
                </>
              )}
            </button>
          </div>

        </div>

        {/* Link to Signup */}
        <p className="text-center text-xs text-zinc-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-bold underline underline-offset-4">
            Sign up now
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
