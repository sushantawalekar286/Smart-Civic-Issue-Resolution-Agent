import React from 'react';
import GlassCard from '../ui/GlassCard';
import { AlertTriangle } from 'lucide-react';

const SeverityCard = ({ severity }) => {
  const getSeverityColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL': return 'text-rose-300 bg-rose-500/20 border-rose-500/30';
      case 'HIGH': return 'text-orange-300 bg-orange-500/20 border-orange-500/30';
      case 'MEDIUM': return 'text-amber-300 bg-amber-500/20 border-amber-500/30';
      case 'LOW': return 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30';
      default: return 'text-gray-300 bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
        <AlertTriangle className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-bold text-white">Severity Assessment</h3>
      </div>
      <div className="mb-4">
        <span className="block text-sm font-medium text-gray-400 mb-2">Level</span>
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getSeverityColor(severity?.level)}`}>
          {severity?.level || 'UNKNOWN'}
        </span>
      </div>
      <div>
        <span className="block text-sm font-medium text-gray-400 mb-1">Reasoning</span>
        <p className="text-sm text-gray-300 leading-relaxed">{severity?.reason || 'No reasoning provided.'}</p>
      </div>
    </GlassCard>
  );
};

export default SeverityCard;
