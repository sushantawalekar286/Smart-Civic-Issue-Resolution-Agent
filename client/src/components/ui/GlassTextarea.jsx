import React, { forwardRef } from 'react';

const GlassTextarea = forwardRef(({ className = '', error, ...props }, ref) => {
  return (
    <div className="w-full">
      <textarea
        ref={ref}
        className={`w-full bg-white border ${error ? 'border-red-300' : 'border-slate-200'} text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/50' : 'focus:ring-blue-500/50'} focus:border-transparent transition-all resize-y min-h-[100px] shadow-sm ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
});

GlassTextarea.displayName = 'GlassTextarea';
export default GlassTextarea;
