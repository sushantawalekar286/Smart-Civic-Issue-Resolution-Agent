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
      <div className="max-w-3xl mx-auto p-6 text-center mt-12 animate-in fade-in duration-500">
        <GlassCard className="p-12 flex flex-col items-center">
          <div className="bg-rose-500/10 p-4 rounded-full mb-4">
            <AlertCircle className="h-12 w-12 text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Oops!</h2>
          <p className="text-rose-300 mb-8 max-w-md">{error}</p>
          <GlassButton onClick={() => navigate('/citizen/report')} variant="secondary" className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Go back to Report Issue
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto p-6 mt-8 text-center animate-in fade-in duration-500">
        <GlassCard className="p-10 border-emerald-500/30">
          <div className="bg-emerald-500/10 p-4 rounded-full mb-6 inline-block">
            <CheckCircle className="h-16 w-16 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">Complaint Submitted Successfully</h2>
          <p className="text-lg text-emerald-200/80 mb-8">Your civic issue has been recorded and routed.</p>
          
          <div className="bg-black/30 rounded-xl p-6 max-w-md mx-auto text-left border border-white/10 mb-8 grid gap-4">
            <div>
              <span className="block text-sm font-medium text-gray-400 mb-1">Complaint ID</span>
              <span className="block text-xl font-bold text-white tracking-wide">{success.complaintId}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-sm font-medium text-gray-400 mb-1">Status</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                  {success.status}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-400 mb-1">Routed Department</span>
                <span className="block text-white font-medium">{success.department}</span>
              </div>
            </div>
          </div>

          <GlassButton
            onClick={() => navigate('/citizen/dashboard')}
            variant="primary"
            className="w-full sm:w-auto px-8"
          >
            View Dashboard
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Review Analysis</h1>
        <p className="mt-2 text-lg text-indigo-200">
          Please review the AI analysis of your complaint before final submission.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
          <p className="ml-3 text-sm text-rose-200 font-medium">{error}</p>
        </div>
      )}

      {analysisData && (
        <div className="space-y-6">
          <AIAnalysisCard 
            issueType={analysisData.issueType} 
            confidence={analysisData.classificationConfidence} 
          />
          
          <EvidenceAnalysisCard 
            evidenceAnalysis={analysisData.evidenceAnalysis}
            locationAnalysis={analysisData.locationAnalysis}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SeverityCard severity={analysisData.severity} />
            <DepartmentCard department={analysisData.department} />
          </div>
          
          <GeneratedComplaintCard 
            generatedComplaint={analysisData.generatedComplaint} 
          />
          
          <div className="pt-4">
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
