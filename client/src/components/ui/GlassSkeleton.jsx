import React from 'react';

const GlassSkeleton = ({ className = '', variant = 'rectangular' }) => {
  const baseClasses = "animate-pulse bg-slate-200/60 border border-slate-100";
  
  const variants = {
    rectangular: "rounded-xl",
    circular: "rounded-full",
    text: "rounded-md h-4",
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}></div>
  );
};

export default GlassSkeleton;
