import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  Bot,
  Building2,
  Shield,
  X,
  FileCheck2
} from 'lucide-react';

export default function AuthoritySidebar({ mobileOpen, onCloseMobile }) {
  const location = useLocation();
  const { user } = useAuth();

  const deptName = user?.departmentId?.name || user?.departmentId?.code || 'Assigned Department';

  const navItems = [
    { label: 'Authority Dashboard', path: '/authority/dashboard', icon: LayoutDashboard },
    { label: 'Assigned Complaints', path: '/authority/complaints', icon: ClipboardList },
    { label: 'Agent Audit Log', path: '/authority/activity', icon: Bot },
  ];

  const isActive = (path) => {
    if (path === '/authority/dashboard') {
      return location.pathname === '/authority/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
            <Link to="/authority/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-base text-slate-900 tracking-tight block leading-none">
                  SmartCivic
                </span>
                <span className="text-[10px] font-semibold text-blue-600 mt-1 block">
                  Department Authority
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

          {/* Assigned Department Badge */}
          <div className="p-3.5 mx-3 mt-3 rounded-xl bg-blue-50/70 border border-blue-100/90">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>Assigned Jurisdiction</span>
            </div>
            <p className="text-xs font-bold text-slate-900 mt-1 truncate">
              {deptName}
            </p>
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

        {/* Bottom Banner */}
        <div className="p-4 border-t border-slate-100">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100/80 text-center">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center mx-auto mb-1.5 shadow-xs">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Field Operations</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Review, update, and resolve civic issues within your municipal SLA.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
