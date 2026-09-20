import React from 'react';
import GlassCard from '../ui/GlassCard';
import { Camera, MapPin } from 'lucide-react';

const EvidenceAnalysisCard = ({ evidenceAnalysis, locationAnalysis }) => {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
        <Camera className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-bold text-white">Evidence & Location</h3>
      </div>
      
      <div className="mb-6">
        <span className="block text-sm font-medium text-gray-400 mb-2">Evidence Analysis</span>
        <p className="text-sm text-gray-300 leading-relaxed mb-3">{evidenceAnalysis?.summary || 'No evidence analysis provided.'}</p>
        
        {evidenceAnalysis?.findings && evidenceAnalysis.findings.length > 0 && (
          <ul className="space-y-2">
            {evidenceAnalysis.findings.map((finding, index) => (
              <li key={index} className="flex items-start text-sm text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 mt-1.5 mr-2 shrink-0" />
                {finding}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span className="block text-sm font-medium text-gray-400">Location Analysis</span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{locationAnalysis?.summary || 'No location analysis provided.'}</p>
      </div>
    </GlassCard>
  );
};

export default EvidenceAnalysisCard;
