import React from 'react';

const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-2xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
