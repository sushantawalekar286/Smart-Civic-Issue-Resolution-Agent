import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, List, User, LogOut, Menu, X, ShieldAlert } from 'lucide-react';

const CitizenLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/citizen/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Report Issue', href: '/citizen/report', icon: <FileText className="w-5 h-5" /> },
    { name: 'My Complaints', href: '/citizen/complaints', icon: <List className="w-5 h-5" /> },
    { name: 'Profile', href: '/citizen/profile', icon: <User className="w-5 h-5" /> },
  ];

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Mobile Top Navbar */}
      <nav className="md:hidden sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20 px-4 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500 p-1.5 rounded-lg">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold tracking-wide">CivicAI</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-200 hover:text-white focus:outline-none p-1"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[60px] left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-3xl border-b border-white/10 shadow-2xl">
          <div className="px-4 py-6 flex flex-col gap-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.href)
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
            <div className="h-px bg-white/10 my-4"></div>
            <div className="px-4 mb-2">
              <p className="text-sm text-gray-400">Logged in as</p>
              <p className="text-white font-medium">{user?.firstName} {user?.lastName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all text-left"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-white/5 backdrop-blur-2xl border-r border-white/10 shadow-2xl">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">CivicAI</h1>
            <p className="text-xs text-indigo-300 font-medium tracking-wider uppercase">Citizen Portal</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-4 flex flex-col gap-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                isActive(item.href)
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]'
                  : 'text-gray-400 hover:bg-white/10 hover:text-gray-100 border border-transparent'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        <div className="min-h-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
        
        {/* Footer inside main to respect sidebar space */}
        <footer className="mt-auto border-t border-white/10 py-6 px-4">
          <p className="text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Smart Civic Issue Resolution Agent. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default CitizenLayout;
