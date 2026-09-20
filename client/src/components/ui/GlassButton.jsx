import React from 'react';

const GlassButton = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  loading = false,
  ...props 
}) => {
  const baseStyle = "relative inline-flex items-center justify-center gap-2 px-4 py-2 font-medium rounded-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow focus:ring-blue-500",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm focus:ring-slate-200",
    danger: "bg-rose-500 hover:bg-rose-600 text-white shadow-sm hover:shadow focus:ring-rose-500",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent focus:ring-slate-200"
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
