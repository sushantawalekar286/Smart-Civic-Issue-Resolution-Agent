import React, { forwardRef } from 'react';

const GlassSelect = forwardRef(({ className = '', error, children, ...props }, ref) => {
  return (
    <div className="w-full relative">
      <select
        ref={ref}
        className={`w-full appearance-none bg-white border ${error ? 'border-red-300' : 'border-slate-200'} text-slate-800 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/50' : 'focus:ring-blue-500/50'} focus:border-transparent transition-all shadow-sm ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
});

GlassSelect.displayName = 'GlassSelect';
export default GlassSelect;
