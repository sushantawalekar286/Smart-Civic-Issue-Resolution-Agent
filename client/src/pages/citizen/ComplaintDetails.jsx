import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import StatusBadge from '../../components/complaints/StatusBadge';
import SeverityBadge from '../../components/complaints/SeverityBadge';
import GlassCard from '../../components/ui/GlassCard';
import ComplaintStatusTimeline from '../../components/complaints/ComplaintStatusTimeline';
import ComplaintEvidence from '../../components/complaints/ComplaintEvidence';
import ComplaintLocation from '../../components/complaints/ComplaintLocation';
import GlassSkeleton from '../../components/ui/GlassSkeleton';
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
      setError('Unable to load complaint details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div className="flex justify-between items-start mb-6">
          <div>
            <GlassSkeleton className="w-24 h-4 mb-4" />
            <GlassSkeleton className="w-64 h-10 mb-2" />
            <GlassSkeleton className="w-48 h-5" />
          </div>
          <div className="flex gap-2">
            <GlassSkeleton className="w-24 h-8" />
            <GlassSkeleton className="w-24 h-8" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <GlassSkeleton className="w-full h-48" />
            <GlassSkeleton className="w-full h-64" />
            <GlassSkeleton className="w-full h-64" />
          </div>
          <div className="space-y-6">
            <GlassSkeleton className="w-full h-96" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !complaint) {
    return (
      <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start mb-6 animate-in slide-in-from-top-2">
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
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium mb-4 transition-transform hover:-translate-x-1"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Complaints
          </Link>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Complaint #{complaint.complaintId || ''}
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
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
          <GlassCard className="overflow-hidden animate-in slide-in-from-bottom-4" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-800">Issue Description</h3>
            </div>
            <div className="px-6 py-6 text-slate-700 whitespace-pre-wrap leading-relaxed text-[15px]">
              {complaint.description || complaint.issueType || 'No description provided.'}
            </div>
            <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-sm font-medium text-slate-500 mb-1">Issue Type</span>
                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  {complaint.issueType}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-slate-500 mb-1">Department</span>
                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {complaint.department}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden animate-in slide-in-from-bottom-4" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-800">Evidence</h3>
            </div>
            <div className="p-6">
              <ComplaintEvidence evidence={complaint.evidence} />
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden animate-in slide-in-from-bottom-4" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-800">Location</h3>
            </div>
            <div className="p-6">
              <ComplaintLocation location={complaint.location} />
            </div>
          </GlassCard>
          
          {complaint.aiAnalysis && (
            <GlassCard className="overflow-hidden border-blue-200 animate-in slide-in-from-bottom-4" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
              <div className="px-6 py-4 border-b border-blue-100 bg-blue-50/50 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-800">AI Assessment Summary</h3>
              </div>
              <div className="px-6 py-6 text-sm text-slate-700 space-y-4">
                <div className="flex items-start">
                  <div className="w-32 flex-shrink-0 font-medium text-slate-500">Confidence:</div>
                  <div className="font-mono text-blue-700">{complaint.aiAnalysis.classificationConfidence}</div>
                </div>
                <div className="flex items-start">
                  <div className="w-32 flex-shrink-0 font-medium text-slate-500">Severity Reason:</div>
                  <div className="leading-relaxed">{complaint.aiAnalysis.severityReason}</div>
                </div>
                <div className="flex items-start">
                  <div className="w-32 flex-shrink-0 font-medium text-slate-500">Dept. Reason:</div>
                  <div className="leading-relaxed">{complaint.aiAnalysis.departmentReason}</div>
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {complaint.escalation?.isEscalated && (
            <GlassCard className="overflow-hidden border-rose-200 animate-in slide-in-from-right-4" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              <div className="px-6 py-4 border-b border-rose-100 bg-rose-50 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500 animate-pulse" />
                <h3 className="text-lg font-semibold text-rose-700">Escalated</h3>
              </div>
              <div className="p-6 text-sm text-slate-700">
                <p className="mb-2"><span className="font-semibold text-rose-600">Level:</span> {complaint.escalation.level}</p>
                <p className="mb-2"><span className="font-semibold text-rose-600">Reason:</span> {complaint.escalation.reason || 'SLA breached'}</p>
                {complaint.escalation.escalatedAt && (
                  <p><span className="font-semibold text-rose-600">Date:</span> {new Date(complaint.escalation.escalatedAt).toLocaleDateString()}</p>
                )}
              </div>
            </GlassCard>
          )}

          {complaint.followUp?.count > 0 && (
            <GlassCard className="overflow-hidden border-amber-200 animate-in slide-in-from-right-4" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
              <div className="px-6 py-4 border-b border-amber-100 bg-amber-50 flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-amber-700">Agent Follow-ups</h3>
              </div>
              <div className="p-6 text-sm text-slate-700">
                <p className="mb-2"><span className="font-semibold text-amber-600">Total Follow-ups:</span> {complaint.followUp.count}</p>
                {complaint.followUp.lastReason && (
                  <p className="mb-2"><span className="font-semibold text-amber-600">Latest Reason:</span> {complaint.followUp.lastReason}</p>
                )}
                {complaint.followUp.lastTriggeredAt && (
                  <p><span className="font-semibold text-amber-600">Last Triggered:</span> {new Date(complaint.followUp.lastTriggeredAt).toLocaleDateString()}</p>
                )}
              </div>
            </GlassCard>
          )}

          <GlassCard className="overflow-hidden animate-in slide-in-from-right-4" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-800">Status Timeline</h3>
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
