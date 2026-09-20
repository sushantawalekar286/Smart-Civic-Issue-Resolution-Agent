import React from 'react';
import { Link } from 'react-router-dom';
import GlassButton from '../components/ui/GlassButton';
import GlassCard from '../components/ui/GlassCard';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <GlassCard className="max-w-md w-full p-12 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -z-10"></div>
        <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-cyan-400 tracking-widest drop-shadow-sm mb-4">404</h1>
        <div className="inline-block bg-white/10 px-3 py-1 text-sm rounded-full border border-white/20 text-white shadow-sm mb-6 uppercase tracking-wider font-semibold">
          Page Not Found
        </div>
        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link to="/" className="inline-block">
          <GlassButton variant="primary" className="px-8">
            Return Home
          </GlassButton>
        </Link>
      </GlassCard>
    </div>
  );
};

export default NotFound;
