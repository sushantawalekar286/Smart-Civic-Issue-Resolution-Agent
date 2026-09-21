import React, { forwardRef } from 'react';

const GlassInput = forwardRef(({ className = '', error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        ref={ref}
        className={`w-full bg-slate-950/80 border ${
          error 
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' 
            : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
        } text-slate-100 placeholder-slate-400 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all shadow-inner text-sm font-sans ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-rose-400 font-medium">{error}</p>}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';
export default GlassInput;
