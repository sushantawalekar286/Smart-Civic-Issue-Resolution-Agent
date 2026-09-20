import React from 'react';
import GlassCard from '../ui/GlassCard';
import { Camera, MapPin } from 'lucide-react';

const EvidenceAnalysisCard = ({ evidenceAnalysis, locationAnalysis }) => {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
        <Camera className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-bold text-slate-800">Evidence & Location</h3>
      </div>
      
      <div className="mb-6">
        <span className="block text-sm font-medium text-slate-500 mb-2">Evidence Analysis</span>
        <p className="text-sm text-slate-700 leading-relaxed mb-3">{evidenceAnalysis?.summary || 'No evidence analysis provided.'}</p>
        
        {evidenceAnalysis?.findings && evidenceAnalysis.findings.length > 0 && (
          <ul className="space-y-2">
            {evidenceAnalysis.findings.map((finding, index) => (
              <li key={index} className="flex items-start text-sm text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mt-1.5 mr-2 shrink-0" />
                {finding}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span className="block text-sm font-medium text-slate-500">Location Analysis</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">{locationAnalysis?.summary || 'No location analysis provided.'}</p>
      </div>
    </GlassCard>
  );
};

export default EvidenceAnalysisCard;
