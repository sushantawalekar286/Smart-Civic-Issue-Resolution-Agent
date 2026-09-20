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
    <div className="min-h-screen flex flex-col md:flex-row relative bg-slate-50">
      {/* Mobile Top Navbar */}
      <nav className="md:hidden sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-800 font-bold tracking-wide">SmartCivic</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-500 hover:text-slate-800 focus:outline-none p-1"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[60px] left-0 right-0 z-40 bg-white border-b border-slate-200 shadow-xl">
          <div className="px-4 py-6 flex flex-col gap-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
            <div className="h-px bg-slate-100 my-4"></div>
            <div className="px-4 mb-2">
              <p className="text-sm text-slate-500">Logged in as</p>
              <p className="text-slate-800 font-medium">{user?.firstName} {user?.lastName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all text-left"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-white border-r border-slate-200 shadow-sm z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-600/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">SmartCivic</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wider uppercase">Citizen Portal</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-4 flex flex-col gap-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-800 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100"
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
        <footer className="mt-auto border-t border-slate-200 py-6 px-4">
          <p className="text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Smart Civic Issue Resolution Agent. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default CitizenLayout;
