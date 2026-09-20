import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComplaintForm from '../../components/complaints/ComplaintForm';
import GlassCard from '../../components/ui/GlassCard';
import { FileText, Sparkles } from 'lucide-react';

const ReportIssue = () => {
  const navigate = useNavigate();

  const handleAnalyzed = (payload) => {
    // Navigate to the analysis review page, passing the payload in state
    navigate('/citizen/analyze/new', {
      state: {
        analysisData: payload.analysisData,
        analysisToken: payload.analysisToken
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-8 h-8 text-indigo-400" />
            Report a Civic Issue
          </h1>
          <p className="text-indigo-200 mt-2 text-lg">
            Provide details, photos, and location of the issue so we can analyze and route it to the correct department.
          </p>
        </div>
      </div>
      
      <GlassCard className="p-6 md:p-8">
        <div className="flex items-center gap-2 text-indigo-300 font-medium mb-6 bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Powered by CivicAI. Our AI will automatically categorize your report.
        </div>
        <ComplaintForm onAnalyzed={handleAnalyzed} />
      </GlassCard>
    </div>
  );
};

export default ReportIssue;
