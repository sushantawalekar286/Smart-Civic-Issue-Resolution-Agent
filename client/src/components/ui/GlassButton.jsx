import React from 'react';

const GlassButton = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  loading = false,
  ...props 
}) => {
  const baseStyle = "relative inline-flex items-center justify-center gap-2 px-4 py-2 font-medium rounded-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";
  
  const variants = {
    primary: "bg-indigo-600/80 hover:bg-indigo-500/90 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] border border-indigo-400/50 hover:shadow-[0_0_20px_rgba(79,70,229,0.7)] focus:ring-indigo-500",
    secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md focus:ring-white/50",
    danger: "bg-red-500/80 hover:bg-red-400/90 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-400/50 focus:ring-red-500",
    ghost: "bg-transparent hover:bg-white/10 text-gray-300 hover:text-white border border-transparent focus:ring-white/30"
  };

  const disabledStyle = "opacity-50 cursor-not-allowed transform-none";

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${disabled || loading ? disabledStyle : 'hover:-translate-y-0.5'} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default GlassButton;
