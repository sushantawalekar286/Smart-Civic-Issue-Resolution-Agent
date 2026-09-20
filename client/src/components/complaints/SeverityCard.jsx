import React from 'react';
import GlassCard from '../ui/GlassCard';
import { AlertTriangle } from 'lucide-react';

const SeverityCard = ({ severity }) => {
  const getSeverityColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL': return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'HIGH': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'MEDIUM': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'LOW': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-bold text-slate-800">Severity Assessment</h3>
      </div>
      <div className="mb-4">
        <span className="block text-sm font-medium text-slate-500 mb-2">Level</span>
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getSeverityColor(severity?.level)}`}>
          {severity?.level || 'UNKNOWN'}
        </span>
      </div>
      <div>
        <span className="block text-sm font-medium text-slate-500 mb-1">Reasoning</span>
        <p className="text-sm text-slate-700 leading-relaxed">{severity?.reason || 'No reasoning provided.'}</p>
      </div>
    </GlassCard>
  );
};

export default SeverityCard;
