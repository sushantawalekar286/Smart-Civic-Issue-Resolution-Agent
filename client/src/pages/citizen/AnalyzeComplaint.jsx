import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { complaintAnalysisService } from '../../../services/complaintAnalysis.service';

import AIAnalysisCard from '../../../components/complaints/AIAnalysisCard';
import EvidenceAnalysisCard from '../../../components/complaints/EvidenceAnalysisCard';
import SeverityCard from '../../../components/complaints/SeverityCard';
import DepartmentCard from '../../../components/complaints/DepartmentCard';
import GeneratedComplaintCard from '../../../components/complaints/GeneratedComplaintCard';
import ComplaintReviewActions from '../../../components/complaints/ComplaintReviewActions';

const AnalyzeComplaint = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Expecting analysis payload + token passed via route state from ReportIssue
  const { analysisData, analysisToken } = location.state || {};
  
  const [isSubmitting, setIsSubmitting] = false;
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
      // setIsSubmitting(true);
      setError('');
      
      const result = await complaintAnalysisService.submitFinalComplaint(analysisToken);
      
      setSuccess({
        complaintId: result.data?.complaintId,
        status: result.data?.status,
        department: result.data?.department
      });
      
    } catch (err) {
      setError(err);
    } finally {
      // setIsSubmitting(false);
    }
  };

  if (error && !analysisData) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h2>
        <p className="text-red-600 mb-6">{error}</p>
        <button
          onClick={() => navigate('/citizen/report')}
          className="text-indigo-600 font-medium hover:text-indigo-500"
        >
          Go back to Report Issue
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow mt-8 border-t-4 border-green-500 text-center">
        <svg className="mx-auto h-12 w-12 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Complaint Submitted Successfully</h2>
        <p className="text-lg text-gray-600 mb-6">Your civic issue has been recorded and routed.</p>
        
        <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto text-left border border-gray-100 mb-8">
          <div className="mb-2">
            <span className="block text-sm font-medium text-gray-500">Complaint ID</span>
            <span className="block text-lg font-bold text-gray-900">{success.complaintId}</span>
          </div>
          <div className="mb-2">
            <span className="block text-sm font-medium text-gray-500">Status</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 uppercase">
              {success.status}
            </span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500">Routed Department</span>
            <span className="block text-gray-900">{success.department}</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/citizen/dashboard')}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          View Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Review Analysis</h1>
        <p className="mt-2 text-sm text-gray-600">
          Please review the AI analysis of your complaint before final submission.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {analysisData && (
        <>
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
          
          <ComplaintReviewActions 
            onConfirm={handleConfirmSubmit} 
            isSubmitting={isSubmitting} 
          />
        </>
      )}
    </div>
  );
};

export default AnalyzeComplaint;
