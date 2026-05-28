// frontend/src/components/Navbar.jsx
// Main floating glassy header navigation panel.

import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, CreditCard, LayoutDashboard, CalendarRange, PieChart, UserCircle, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: CalendarRange },
    { to: '/analytics', label: 'Analytics', icon: PieChart },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/70 border-b border-cardBorder backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand area */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
                <CreditCard size={18} />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent font-sans">
                FinFlow
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-zinc-800 text-zinc-100 shadow-glass-sm border border-cardBorder'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
                    }`
                  }
                >
                  <Icon size={16} />
                  {link.label}
                </NavLink>
              );
            })}
          </div>

          {/* Right side Profile & Logout actions (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3 border-l border-zinc-800 pl-4">
                <Link to="/profile" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-cardBorder object-cover"
                  />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-zinc-200 line-clamp-1 max-w-[100px]">{user.name}</p>
                    <p className="text-[10px] text-zinc-500">Premium account</p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign out of FinFlow"
                  className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Hamburger Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu Panel */}
      {mobileOpen && (
        <div className="md:hidden border-b border-cardBorder bg-background/95 backdrop-blur-lg animate-float-in">
          <div className="px-2 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive
                        ? 'bg-zinc-800 text-zinc-100 border border-cardBorder'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
                    }`
                  }
                >
                  <Icon size={18} />
                  {link.label}
                </NavLink>
              );
            })}

            {user && (
              <div className="border-t border-zinc-800 mt-4 pt-4 px-4 pb-2">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border border-cardBorder object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{user.name}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 font-medium text-sm transition-all"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
