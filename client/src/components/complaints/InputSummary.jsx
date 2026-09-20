import React, { useState, useEffect } from 'react';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import { ClipboardList, Edit2, Image as ImageIcon, MapPin, Sparkles, CheckCircle2, Loader2, Circle } from 'lucide-react';

const AnalysisLoader = () => {
  const [step, setStep] = useState(0);
  
  const steps = [
    "Analyzing issue description...",
    "Classifying complaint category...",
    "Analyzing evidence & location...",
    "Assessing priority & severity...",
    "Mapping to appropriate department...",
    "Generating formal report..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200); // Simulate progress every 1.2s

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-400 rounded-full border-t-transparent animate-spin"></div>
        <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
      </div>
      <div className="w-full max-w-sm space-y-3">
        {steps.map((s, index) => {
          let Icon = Circle;
          let iconClass = "text-gray-600";
          let textClass = "text-gray-500";
          
          if (index < step) {
            Icon = CheckCircle2;
            iconClass = "text-emerald-400";
            textClass = "text-gray-300";
          } else if (index === step) {
            Icon = Loader2;
            iconClass = "text-indigo-400 animate-spin";
            textClass = "text-indigo-200 font-medium";
          }

          return (
            <div key={index} className="flex items-center gap-3 transition-all duration-300">
              <Icon className={`w-5 h-5 ${iconClass}`} />
              <span className={`text-sm ${textClass} transition-colors duration-300`}>{s}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const InputSummary = ({ description, file, location, onEdit, onSubmit, isSubmitting }) => {
  if (isSubmitting) {
    return (
      <GlassCard className="overflow-hidden animate-in fade-in duration-500">
        <div className="bg-indigo-500/5 px-6 py-5 border-b border-white/10 text-center">
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            CivicAI Analysis in Progress
          </h3>
        </div>
        <AnalysisLoader />
      </GlassCard>
    );
  }

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
          className="flex items-center gap-2 sm:w-auto w-full justify-center hover:scale-105 transition-transform"
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
          className="flex items-center gap-2 w-full sm:w-auto justify-center hover:scale-105 transition-transform"
        >
          Analyze Complaint
          <Sparkles className="w-4 h-4" />
        </GlassButton>
      </div>
    </GlassCard>
  );
};

export default InputSummary;
