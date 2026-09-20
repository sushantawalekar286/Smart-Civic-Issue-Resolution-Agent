import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import authorityAPI from '../../services/authority.service';
import AuthorityLayout from '../../components/authority/AuthorityLayout';
import ComplaintStatusControl from '../../components/authority/ComplaintStatusControl';
import ComplaintTimeline from '../../components/authority/ComplaintTimeline';
import ComplaintEvidence from '../../components/authority/ComplaintEvidence';
import ComplaintLocationMap from '../../components/location/ComplaintLocationMap';
import { StatusBadge, SeverityBadge } from '../../components/admin/AdminBadges';
import {
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  Building2,
  Sparkles,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileText
} from 'lucide-react';

const AuthorityComplaintDetails = () => {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await authorityAPI.getAuthorityComplaint(complaintId);
      setComplaint(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (complaintId) {
      fetchDetails();
    }
  }, [complaintId]);

  const handleStatusUpdated = (updated) => {
    setComplaint(updated);
  };

  if (loading) {
    return (
      <AuthorityLayout title={`Complaint ${complaintId}`} subtitle="Loading jurisdiction record...">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-500">Retrieving official complaint record...</p>
        </div>
      </AuthorityLayout>
    );
  }

  if (error || !complaint) {
    return (
      <AuthorityLayout title="Complaint Details" subtitle="Record Retrieval Error">
        <div className="max-w-2xl mx-auto py-12">
          <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Complaint Not Accessible</h2>
            <p className="text-sm text-slate-500 mb-6">{error || 'Unable to access complaint or jurisdiction mismatch.'}</p>
            <Link
              to="/authority/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Department Queue
            </Link>
          </div>
        </div>
      </AuthorityLayout>
    );
  }

  const ai = complaint.aiAnalysis;

  return (
    <AuthorityLayout
      title={`Complaint: ${complaint.complaintId}`}
      subtitle={`Submitted on ${new Date(complaint.createdAt).toLocaleString()}`}
    >
      <div className="space-y-6">
        {/* Navigation & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate('/authority/dashboard')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Department Queue</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">ID: {complaint.complaintId}</span>
            <StatusBadge status={complaint.status} />
            <SeverityBadge severity={complaint.severity} />
          </div>
        </div>

        {/* Complaint Main Overview Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold font-mono">
                  {complaint.issueType}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(complaint.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight pt-1">
                {complaint.description ? complaint.description.substring(0, 90) + (complaint.description.length > 90 ? '...' : '') : 'Civic Issue'}
              </h1>
            </div>

            {/* Jurisdiction Badge */}
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200/70 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Department</span>
                <span className="text-xs font-bold text-slate-800">
                  {complaint.departmentId?.name || 'Assigned Department'}
                </span>
                {complaint.departmentId?.code && (
                  <span className="ml-1.5 text-[10px] font-mono font-bold text-blue-600 bg-blue-100 px-1.5 py-0.2 rounded">
                    {complaint.departmentId.code}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Workflow Action Control */}
          <div className="pt-6">
            <ComplaintStatusControl complaint={complaint} onStatusUpdated={handleStatusUpdated} />
          </div>
        </div>

        {/* 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Issue Description, Evidence, AI Insights */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description & Citizen Report */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Citizen Report & Details</h3>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-4">
                {complaint.description}
              </div>

              {/* Citizen Information */}
              {complaint.citizenId && (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/50 border border-blue-100/60 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      {complaint.citizenId.name ? complaint.citizenId.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{complaint.citizenId.name}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{complaint.citizenId.email}</div>
                    </div>
                  </div>
                  {complaint.citizenId.phone && (
                    <span className="text-slate-600 font-mono text-xs">📞 {complaint.citizenId.phone}</span>
                  )}
                </div>
              )}
            </div>

            {/* Attached Evidence Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Citizen Attached Evidence</h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {complaint.evidence?.length || 0} file(s) attached
                </span>
              </div>
              <ComplaintEvidence evidence={complaint.evidence} />
            </div>

            {/* AI Intelligence & Automated Analysis */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">AI Intelligence & Pipeline Summary</h3>
                    <p className="text-[11px] text-slate-400">Autonomous issue validation & priority classification</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Automated Pipeline
                </span>
              </div>

              {ai ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        AI Issue Classification
                      </span>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-800 text-xs">{ai.classification?.issueType || complaint.issueType}</strong>
                        {ai.classification?.confidence && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                            {(ai.classification.confidence * 100).toFixed(0)}% confidence
                          </span>
                        )}
                      </div>
                      {ai.classification?.reason && (
                        <p className="text-slate-500 text-[11px] mt-1">{ai.classification.reason}</p>
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Severity Assessment
                      </span>
                      <strong className="text-slate-800 text-xs">{ai.severityAnalysis?.severity || complaint.severity}</strong>
                      {ai.severityAnalysis?.reason && (
                        <p className="text-slate-500 text-[11px] mt-1">{ai.severityAnalysis.reason}</p>
                      )}
                    </div>
                  </div>

                  {ai.generatedComplaint && (
                    <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                        Formalized AI Brief
                      </span>
                      <pre className="text-slate-700 text-xs font-sans whitespace-pre-wrap leading-relaxed">
                        {ai.generatedComplaint}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No automated AI analysis attached.</p>
              )}
            </div>
          </div>

          {/* Right Col: Geographic Location, SLA Tracking & Status History */}
          <div className="space-y-6">
            {/* Location Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Geographic Location</h3>
              </div>

              <ComplaintLocationMap location={complaint.location} height="220px" />
            </div>

            {/* Officer Assignment */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Assigned Officer</h3>
              </div>

              {complaint.assignedTo ? (
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-900 text-sm">{complaint.assignedTo.name}</div>
                  <div className="text-slate-500 font-mono">{complaint.assignedTo.email}</div>
                  {complaint.assignedTo.phone && (
                    <div className="text-slate-500 pt-1">📞 {complaint.assignedTo.phone}</div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  Pending field authority assignment.
                </div>
              )}
            </div>

            {/* Status History & Audit Trail */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Status History Audit</h3>
              </div>

              <ComplaintTimeline statusHistory={complaint.statusHistory} />
            </div>
          </div>
        </div>
      </div>
    </AuthorityLayout>
  );
};

export default AuthorityComplaintDetails;
