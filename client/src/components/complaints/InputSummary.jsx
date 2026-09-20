import React from 'react';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import { ClipboardList, Edit2, Image as ImageIcon, MapPin, Sparkles } from 'lucide-react';

const InputSummary = ({ description, file, location, onEdit, onSubmit, isSubmitting }) => {
  return (
    <GlassCard className="overflow-hidden">
      <div className="px-6 py-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Review Information</h3>
            <p className="text-sm text-indigo-200 mt-1">Ensure everything is correct before analysis.</p>
          </div>
        </div>
        <GlassButton 
          onClick={onEdit} 
          disabled={isSubmitting}
          variant="secondary"
          className="flex items-center gap-2 sm:w-auto w-full justify-center"
        >
          <Edit2 className="w-4 h-4" />
          Edit Details
        </GlassButton>
      </div>
      
      <div className="px-6 py-6 space-y-6">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
            Description
          </h4>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <p className="whitespace-pre-wrap text-gray-200">{description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Evidence
            </h4>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 h-[calc(100%-2rem)] flex items-center">
              {file ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black/40 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <span className="text-sm text-gray-200 font-medium truncate">{file.name}</span>
                </div>
              ) : (
                <span className="text-gray-400 italic text-sm">No evidence uploaded</span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Location
            </h4>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 h-[calc(100%-2rem)] flex items-center">
              {location ? (
                <div className="font-mono text-sm text-gray-300">
                  <p><span className="text-indigo-400/70">Lat:</span> {location.latitude.toFixed(6)}</p>
                  <p><span className="text-indigo-400/70">Lng:</span> {location.longitude.toFixed(6)}</p>
                </div>
              ) : (
                <span className="text-gray-400 italic text-sm">No location provided</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white/5 px-6 py-5 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-indigo-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          AI will analyze this information
        </p>
        <GlassButton 
          onClick={onSubmit} 
          disabled={isSubmitting}
          loading={isSubmitting}
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          {isSubmitting ? 'Analyzing...' : 'Analyze Complaint'}
          {!isSubmitting && <Sparkles className="w-4 h-4" />}
        </GlassButton>
      </div>
    </GlassCard>
  );
};

export default InputSummary;
