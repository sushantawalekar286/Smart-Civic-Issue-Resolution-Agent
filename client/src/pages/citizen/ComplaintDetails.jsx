import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import SeverityBadge from '../../components/common/SeverityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import ComplaintStatusTimeline from '../../components/complaints/ComplaintStatusTimeline';
import ComplaintEvidence from '../../components/complaints/ComplaintEvidence';
import ComplaintLocation from '../../components/complaints/ComplaintLocation';
import { complaintAPI } from '../../services/complaint.service';

const ComplaintDetails = () => {
  const { complaintId } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComplaint();
  }, [complaintId]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const response = await complaintAPI.getComplaintById(complaintId);
      
      if (!response.data || !response.data.data) {
        setError('Complaint not found.');
        return;
      }
      
      setComplaint(response.data.data);
    } catch (err) {
      setError('Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading complaint details..." />;
  
  if (error || !complaint) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <ErrorMessage message={error} />
        <Link to="/citizen/complaints" className="text-indigo-600 hover:text-indigo-900 font-medium">
          &larr; Back to My Complaints
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/citizen/complaints" className="text-sm text-indigo-600 hover:text-indigo-900 font-medium flex items-center mb-2">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Complaints
          </Link>
          <PageHeader 
            title={`Complaint ${complaint.complaintId || ''}`} 
            description={`Submitted on ${new Date(complaint.createdAt || Date.now()).toLocaleDateString()}`} 
          />
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <SeverityBadge severity={complaint.severity} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Issue Description</h3>
            </div>
            <div className="px-4 py-5 sm:p-6 text-gray-700 whitespace-pre-wrap">
              {complaint.description || complaint.issueType || 'No description provided.'}
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200 grid grid-cols-2 gap-4">
              <div>
                <span className="block text-sm font-medium text-gray-500">Issue Type</span>
                <span className="block text-sm text-gray-900">{complaint.issueType}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500">Department</span>
                <span className="block text-sm text-gray-900">{complaint.department}</span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Evidence</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <ComplaintEvidence evidence={complaint.evidence} />
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Location</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <ComplaintLocation location={complaint.location} />
            </div>
          </div>
          
          {complaint.aiAnalysis && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-indigo-50">
                <h3 className="text-lg leading-6 font-medium text-indigo-900 flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI Assessment Summary
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6 text-sm text-gray-700">
                <p><strong>Confidence:</strong> {complaint.aiAnalysis.classificationConfidence}</p>
                <p className="mt-2"><strong>Severity Reason:</strong> {complaint.aiAnalysis.severityReason}</p>
                <p className="mt-2"><strong>Department Reason:</strong> {complaint.aiAnalysis.departmentReason}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Status Timeline</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <ComplaintStatusTimeline statusHistory={complaint.statusHistory} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
