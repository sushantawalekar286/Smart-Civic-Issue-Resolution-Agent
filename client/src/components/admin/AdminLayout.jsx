import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children, title, subtitle, actions }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'All Complaints', path: '/admin/complaints', icon: '📋' },
    { label: 'Agent Activity', path: '/admin/agent-actions', icon: '⚡' },
    { label: 'User Directory', path: '/admin/users', icon: '👥' },
    { label: 'Authorities', path: '/admin/authorities', icon: '🛡️' },
    { label: 'Departments', path: '/admin/departments', icon: '🏛️' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:static md:block flex flex-col`}>
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-6 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🏛️</span>
            <div>
              <span className="font-bold text-white tracking-wide text-base block leading-tight">SmartCivic</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400">Admin Console</span>
            </div>
          </div>
          <button 
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Current Admin User Info */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="overflow-hidden mr-2">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            🚪
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shadow-xs">
          <div className="flex items-center">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden mr-4 p-2 text-slate-600 hover:text-slate-900 rounded-md focus:outline-none"
            >
              ☰
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 m-0 leading-tight">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 m-0">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center space-x-3">{actions}</div>}
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
