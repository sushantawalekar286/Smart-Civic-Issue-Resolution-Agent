import React, { forwardRef } from 'react';

const GlassInput = forwardRef(({ className = '', error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        ref={ref}
        className={`w-full bg-white border ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'} text-slate-800 placeholder-slate-400 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 transition-all shadow-sm ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-rose-500">{error}</p>}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';
export default GlassInput;
