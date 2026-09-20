import React from 'react';

const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
