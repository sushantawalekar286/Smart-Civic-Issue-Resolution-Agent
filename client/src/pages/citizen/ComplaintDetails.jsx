import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import StatusBadge from '../../components/complaints/StatusBadge';
import SeverityBadge from '../../components/complaints/SeverityBadge';
import GlassCard from '../../components/ui/GlassCard';
import ComplaintStatusTimeline from '../../components/complaints/ComplaintStatusTimeline';
import ComplaintEvidence from '../../components/complaints/ComplaintEvidence';
import ComplaintLocation from '../../components/complaints/ComplaintLocation';
import { complaintAPI } from '../../services/complaint.service';
import { ChevronLeft, FileText, Image as ImageIcon, MapPin, BrainCircuit, Activity, AlertCircle } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-indigo-200">Loading complaint details...</p>
      </div>
    );
  }
  
  if (error || !complaint) {
    return (
      <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start mb-6">
          <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
          <p className="ml-3 text-sm text-rose-200 font-medium">{error}</p>
        </div>
        <Link 
          to="/citizen/complaints" 
          className="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to My Complaints
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <Link 
            to="/citizen/complaints" 
            className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Complaints
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            Complaint #{complaint.complaintId || ''}
          </h1>
          <p className="text-indigo-200 mt-2 text-lg">
            Submitted on {new Date(complaint.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-2 md:mt-0">
          <SeverityBadge severity={complaint.severity} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Issue Description</h3>
            </div>
            <div className="px-6 py-6 text-gray-300 whitespace-pre-wrap leading-relaxed text-[15px]">
              {complaint.description || complaint.issueType || 'No description provided.'}
            </div>
            <div className="bg-white/5 px-6 py-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-sm font-medium text-gray-400 mb-1">Issue Type</span>
                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {complaint.issueType}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-400 mb-1">Department</span>
                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-slate-800 text-gray-300 border border-white/10">
                  {complaint.department}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Evidence</h3>
            </div>
            <div className="p-6">
              <ComplaintEvidence evidence={complaint.evidence} />
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Location</h3>
            </div>
            <div className="p-6">
              <ComplaintLocation location={complaint.location} />
            </div>
          </GlassCard>
          
          {complaint.aiAnalysis && (
            <GlassCard className="overflow-hidden border-indigo-500/30">
              <div className="px-6 py-4 border-b border-indigo-500/20 bg-indigo-500/10 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-indigo-200">AI Assessment Summary</h3>
              </div>
              <div className="px-6 py-6 text-sm text-gray-300 space-y-4">
                <div className="flex items-start">
                  <div className="w-32 flex-shrink-0 font-medium text-gray-400">Confidence:</div>
                  <div className="font-mono text-indigo-300">{complaint.aiAnalysis.classificationConfidence}</div>
                </div>
                <div className="flex items-start">
                  <div className="w-32 flex-shrink-0 font-medium text-gray-400">Severity Reason:</div>
                  <div>{complaint.aiAnalysis.severityReason}</div>
                </div>
                <div className="flex items-start">
                  <div className="w-32 flex-shrink-0 font-medium text-gray-400">Dept. Reason:</div>
                  <div>{complaint.aiAnalysis.departmentReason}</div>
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {complaint.escalation?.isEscalated && (
            <GlassCard className="overflow-hidden border-rose-500/30">
              <div className="px-6 py-4 border-b border-rose-500/20 bg-rose-500/10 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <h3 className="text-lg font-semibold text-rose-200">Escalated</h3>
              </div>
              <div className="p-6 text-sm text-gray-300">
                <p className="mb-2"><span className="font-semibold text-rose-300">Level:</span> {complaint.escalation.level}</p>
                <p className="mb-2"><span className="font-semibold text-rose-300">Reason:</span> {complaint.escalation.reason || 'SLA breached'}</p>
                {complaint.escalation.escalatedAt && (
                  <p><span className="font-semibold text-rose-300">Date:</span> {new Date(complaint.escalation.escalatedAt).toLocaleDateString()}</p>
                )}
              </div>
            </GlassCard>
          )}

          {complaint.followUp?.count > 0 && (
            <GlassCard className="overflow-hidden border-amber-500/30">
              <div className="px-6 py-4 border-b border-amber-500/20 bg-amber-500/10 flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-semibold text-amber-200">Agent Follow-ups</h3>
              </div>
              <div className="p-6 text-sm text-gray-300">
                <p className="mb-2"><span className="font-semibold text-amber-300">Total Follow-ups:</span> {complaint.followUp.count}</p>
                {complaint.followUp.lastReason && (
                  <p className="mb-2"><span className="font-semibold text-amber-300">Latest Reason:</span> {complaint.followUp.lastReason}</p>
                )}
                {complaint.followUp.lastTriggeredAt && (
                  <p><span className="font-semibold text-amber-300">Last Triggered:</span> {new Date(complaint.followUp.lastTriggeredAt).toLocaleDateString()}</p>
                )}
              </div>
            </GlassCard>
          )}

          <GlassCard className="overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Status Timeline</h3>
            </div>
            <div className="p-6">
              <ComplaintStatusTimeline statusHistory={complaint.statusHistory} />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
