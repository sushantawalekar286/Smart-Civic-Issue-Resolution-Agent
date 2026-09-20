import React from 'react';
import GlassCard from '../ui/GlassCard';
import { FileText } from 'lucide-react';

const GeneratedComplaintCard = ({ generatedComplaint }) => {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
        <FileText className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-slate-800">Generated Official Complaint</h3>
      </div>
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed relative z-10">
          {generatedComplaint || 'No official complaint text generated.'}
        </p>
      </div>
    </GlassCard>
  );
};

export default GeneratedComplaintCard;
