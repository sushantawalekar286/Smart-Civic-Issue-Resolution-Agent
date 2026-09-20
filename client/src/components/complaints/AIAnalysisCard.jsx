import React from 'react';
import GlassCard from '../ui/GlassCard';
import { Cpu } from 'lucide-react';

const AIAnalysisCard = ({ issueType, confidence }) => {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
        <Cpu className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-slate-800">AI Complaint Analysis</h3>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <span className="block text-sm font-medium text-slate-500">Issue Type</span>
          <span className="block mt-1 text-lg font-semibold text-slate-800">{issueType || 'Uncategorized'}</span>
        </div>
        <div>
          <span className="block text-sm font-medium text-slate-500">Confidence</span>
          <span className="block mt-1 text-lg font-semibold text-blue-600">
            {confidence ? `${(confidence * 100).toFixed(0)}%` : 'N/A'}
          </span>
        </div>
      </div>
    </GlassCard>
  );
};

export default AIAnalysisCard;
