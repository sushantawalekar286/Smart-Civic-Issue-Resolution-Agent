import React from 'react';

const GlassBadge = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: 'bg-white/10 text-gray-200 border-white/20',
    primary: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    danger: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    info: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
};

export default GlassBadge;
