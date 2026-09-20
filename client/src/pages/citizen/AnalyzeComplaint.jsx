import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { complaintAnalysisService } from '../../services/complaintAnalysis.service';

import AIAnalysisCard from '../../components/complaints/AIAnalysisCard';
import EvidenceAnalysisCard from '../../components/complaints/EvidenceAnalysisCard';
import SeverityCard from '../../components/complaints/SeverityCard';
import DepartmentCard from '../../components/complaints/DepartmentCard';
import GeneratedComplaintCard from '../../components/complaints/GeneratedComplaintCard';
import ComplaintReviewActions from '../../components/complaints/ComplaintReviewActions';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import { AlertCircle, CheckCircle, ChevronLeft } from 'lucide-react';

const AnalyzeComplaint = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Expecting analysis payload + token passed via route state from ReportIssue
  const { analysisData, analysisToken } = location.state || {};
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Basic validation: if accessed directly without data, kick them out
    if (!analysisData) {
      setError('Missing analysis data. Please submit a complaint first.');
    }
  }, [analysisData]);

  const handleConfirmSubmit = async () => {
    if (!analysisToken) {
      setError('Missing required analysis token. Cannot submit complaint. (Pending Step 4 Integration)');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const result = await complaintAnalysisService.submitFinalComplaint(analysisToken);
      
      setSuccess({
        complaintId: result.data?.complaintId,
        status: result.data?.status,
        department: result.data?.department
      });
      
    } catch (err) {
      const errorMsg = typeof err === 'string' 
        ? err 
        : (err?.response?.data?.message || err?.message || 'Final complaint submission is temporarily unavailable (Pending Step 5B).');
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error && !analysisData) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center mt-12 animate-in fade-in zoom-in-95 duration-500">
        <GlassCard className="p-12 flex flex-col items-center border-rose-200">
          <div className="bg-rose-50 p-4 rounded-full mb-4 animate-pulse">
            <AlertCircle className="h-12 w-12 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Oops!</h2>
          <p className="text-slate-600 mb-8 max-w-md">{error}</p>
          <GlassButton onClick={() => navigate('/citizen/report')} variant="secondary" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
            <ChevronLeft className="w-4 h-4" /> Go back to Report Issue
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto p-6 mt-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <GlassCard className="p-10 border-emerald-200 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
          <div className="bg-emerald-50 p-4 rounded-full mb-6 inline-block animate-in zoom-in-50 duration-500 delay-150">
            <CheckCircle className="h-16 w-16 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-3">Complaint Submitted Successfully</h2>
          <p className="text-lg text-slate-600 mb-8">Your civic issue has been recorded and routed.</p>
          
          <div className="bg-slate-50/50 rounded-xl p-6 max-w-md mx-auto text-left border border-slate-100 mb-8 grid gap-4 animate-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
            <div>
              <span className="block text-sm font-medium text-slate-500 mb-1">Complaint ID</span>
              <span className="block text-xl font-bold text-blue-700 tracking-wide">{success.complaintId}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-sm font-medium text-slate-500 mb-1">Status</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  {success.status}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-slate-500 mb-1">Routed Department</span>
                <span className="block text-slate-800 font-medium">{success.department}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-4 duration-500 delay-500 fill-mode-both">
            <GlassButton
              onClick={() => navigate(`/citizen/complaints/${success.complaintId}`)}
              variant="primary"
              className="w-full sm:w-auto px-8 transition-transform hover:scale-105 active:scale-95"
            >
              View Complaint Details
            </GlassButton>
            <GlassButton
              onClick={() => navigate('/citizen/complaints')}
              variant="secondary"
              className="w-full sm:w-auto px-8 transition-transform hover:scale-105 active:scale-95"
            >
              My Complaints
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          Review Analysis
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Please review the AI analysis of your complaint before final submission.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
          <p className="ml-3 text-sm text-rose-700 font-medium">{error}</p>
        </div>
      )}

      {analysisData && (
        <div className="space-y-6 relative">
          {/* Overlay loader for final submission */}
          {isSubmitting && (
            <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center animate-in fade-in duration-300">
               <div className="bg-slate-900/90 border border-indigo-500/30 p-8 rounded-2xl flex flex-col items-center shadow-2xl">
                 <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500/30 border-t-indigo-400 mb-4"></div>
                 <p className="text-slate-200 font-medium text-lg">Submitting complaint...</p>
               </div>
            </div>
          )}

          <div className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <AIAnalysisCard 
              issueType={analysisData.issueType} 
              confidence={analysisData.classificationConfidence} 
            />
          </div>
          
          <div className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <EvidenceAnalysisCard 
              evidenceAnalysis={analysisData.evidenceAnalysis}
              locationAnalysis={analysisData.locationAnalysis}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
            <SeverityCard severity={analysisData.severity} />
            <DepartmentCard department={analysisData.department} />
          </div>
          
          <div className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
            <GeneratedComplaintCard 
              generatedComplaint={analysisData.generatedComplaint} 
            />
          </div>
          
          <div className="pt-4 animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
            <ComplaintReviewActions 
              onConfirm={handleConfirmSubmit} 
              isSubmitting={isSubmitting} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyzeComplaint;
