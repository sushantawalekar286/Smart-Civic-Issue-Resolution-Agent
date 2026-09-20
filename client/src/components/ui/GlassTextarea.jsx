import React, { forwardRef } from 'react';

const GlassTextarea = forwardRef(({ className = '', error, ...props }, ref) => {
  return (
    <div className="w-full">
      <textarea
        ref={ref}
        className={`w-full bg-white/5 border ${error ? 'border-red-400' : 'border-white/20'} text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/50' : 'focus:ring-indigo-500/50'} focus:border-transparent transition-all backdrop-blur-sm resize-y min-h-[100px] ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
});

GlassTextarea.displayName = 'GlassTextarea';
export default GlassTextarea;
