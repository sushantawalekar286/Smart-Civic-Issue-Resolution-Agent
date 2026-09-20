import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Bot,
  Users,
  ShieldCheck,
  Building2,
  BarChart3,
  Settings,
  Shield,
  X
} from 'lucide-react';

export default function AdminSidebar({ mobileOpen, onCloseMobile }) {
  const location = useLocation();

  const navItems = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Complaints', path: '/admin/complaints', icon: ClipboardList },
    { label: 'Agent Actions', path: '/admin/agent-actions', icon: Bot },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Authorities', path: '/admin/authorities', icon: ShieldCheck },
    { label: 'Departments', path: '/admin/departments', icon: Building2 },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
            <Link to="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 fill-white/20 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-base text-slate-900 tracking-tight block leading-none">
                  SmartCivic
                </span>
                <span className="text-[10px] font-medium text-slate-400 mt-1 block">
                  Better Cities • Happier Citizens
                </span>
              </div>
            </Link>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-blue-50/90 text-blue-600 shadow-2xs font-bold border border-blue-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Banner matching reference illustration */}
        <div className="p-4 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-sky-50 border border-blue-100/80 text-center relative overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-2 shadow-sm shadow-blue-500/30">
              <Shield className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight">
              Smart Governance
            </h4>
            <p className="text-[10px] text-blue-600 font-medium">Better Tomorrow</p>
            <p className="text-[10px] text-slate-500 mt-1.5 leading-tight">
              Transparent • Accountable • Citizen Focused
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
