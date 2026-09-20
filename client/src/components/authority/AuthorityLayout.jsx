import React, { useState } from 'react';
import AuthoritySidebar from './AuthoritySidebar';
import AdminTopNavbar from '../admin/AdminTopNavbar';

export default function AuthorityLayout({ children, title, subtitle, actions }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Sidebar Navigation */}
      <AuthoritySidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <AdminTopNavbar
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          title={title}
          subtitle={subtitle}
        />

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {actions && (
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200/80">
              <div>
                {title && (
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-3">{actions}</div>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
