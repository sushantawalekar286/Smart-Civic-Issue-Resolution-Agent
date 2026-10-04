import React from 'react';

const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white/90 backdrop-blur-xl border border-slate-200 shadow-md shadow-slate-200/40 rounded-2xl transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
