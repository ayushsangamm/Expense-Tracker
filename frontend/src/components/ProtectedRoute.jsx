// frontend/src/components/ProtectedRoute.jsx
// Secures private routes by validating authentication states before rendering pages.

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If AuthContext is still performing backend session checks upon app start,
  // we render a beautiful dark fullscreen loading spinner to prevent UI flashes.
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        {/* Sleek startup glass loading card */}
        <div className="glass-card p-8 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 font-medium text-sm animate-pulse">Restoring secure session...</p>
        </div>
      </div>
    );
  }

  // If user is unauthenticated, redirect them to the Login screen.
  // We save their original location in state so we can route them back there upon successful login!
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render children pages
  return children;
};

export default ProtectedRoute;
