import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import adminAPI from '../../services/admin.service';
import AdminLayout from '../../components/admin/AdminLayout';
import { StatusBadge, SeverityBadge } from '../../components/admin/AdminBadges';
import ComplaintAgentTimeline from '../../components/admin/ComplaintAgentTimeline';

const ComplaintDetails = () => {
  const { complaintId } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [agentActions, setAgentActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionsLoading, setActionsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await adminAPI.getComplaintById(complaintId);
        setComplaint(res.data || res || null);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load complaint details');
      } finally {
        setLoading(false);
      }
    };

    const fetchActions = async () => {
      try {
        setActionsLoading(true);
        const res = await adminAPI.getComplaintAgentActions(complaintId);
        setAgentActions(res.actions || res.data?.actions || []);
      } catch (err) {
        // Safe fallback if actions fail
        setAgentActions([]);
      } finally {
        setActionsLoading(false);
      }
    };

    fetchDetails();
    fetchActions();
  }, [complaintId]);

  if (loading && !complaint) {
    return (
      <AdminLayout title={`Complaint ${complaintId}`} subtitle="Inspecting complaint audit record">
        <div className="py-20 text-center text-slate-500 text-sm">
          Loading complaint details...
        </div>
      </AdminLayout>
    );
  }

  if (error || !complaint) {
    return (
      <AdminLayout title="Complaint Details" subtitle="Error loading record">
        <div className="p-6 bg-white rounded-xl border border-slate-200 text-center">
          <p className="text-rose-600 font-semibold mb-4">{error || 'Complaint not found'}</p>
          <Link to="/admin/complaints" className="px-4 py-2 bg-indigo-600 text-white rounded text-xs font-semibold">
            ← Back to Complaints
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title={`Complaint: ${complaint.complaintId}`}
      subtitle={`Submitted on ${new Date(complaint.createdAt).toLocaleString()}`}
      actions={
        <Link
          to="/admin/complaints"
          className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md shadow-xs transition-colors"
        >
          ← Back to List
        </Link>
      }
    >
      {/* Top Banner Status & Severity */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <StatusBadge status={complaint.status} />
          <SeverityBadge severity={complaint.severity} />
          <span className="text-xs font-semibold text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
            Type: {complaint.issueType}
          </span>
        </div>

        <div className="flex items-center space-x-4 text-xs text-slate-500">
          <span>Input Method: <strong className="text-slate-800 uppercase">{complaint.inputMethod || 'TEXT'}</strong></span>
          <span>Last Updated: <strong className="text-slate-800">{new Date(complaint.updatedAt).toLocaleDateString()}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left 2 Cols: Issue, Evidence, AI Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Description */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Issue Description</h2>
            <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
          </div>

          {/* Evidence Photos */}
          {complaint.evidence && complaint.evidence.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Submitted Evidence</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {complaint.evidence.map((ev, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <img src={ev.url} alt="Evidence" className="w-full h-36 object-cover" />
                    <div className="p-2 text-[10px] text-slate-500 truncate">
                      {ev.fileName || `Evidence ${idx + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis Card */}
          {complaint.aiAnalysis && (
            <div className="bg-white p-6 rounded-xl border border-indigo-100 bg-indigo-50/20 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-900 flex items-center">
                  <span className="mr-2">🤖</span> AI Pipeline Analysis
                </h2>
                {complaint.aiAnalysis.classification?.confidence && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono">
                    Confidence: {(complaint.aiAnalysis.classification.confidence * 100).toFixed(0)}%
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-white rounded-lg border border-indigo-100">
                  <span className="font-semibold text-slate-700 block mb-1">Classification Reason:</span>
                  <p className="text-slate-600">{complaint.aiAnalysis.classification?.reason || 'Standard pipeline mapping.'}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-indigo-100">
                  <span className="font-semibold text-slate-700 block mb-1">Severity Assessment:</span>
                  <p className="text-slate-600">{complaint.aiAnalysis.severityAnalysis?.reason || 'Calculated based on hazard context.'}</p>
                </div>
              </div>

              {complaint.aiAnalysis.generatedComplaint && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-100 text-xs">
                  <span className="font-semibold text-slate-700 block mb-1">AI Normalized Formal Summary:</span>
                  <p className="text-slate-700 font-mono text-[11px] leading-relaxed">{complaint.aiAnalysis.generatedComplaint}</p>
                </div>
              )}
            </div>
          )}

          {/* Autonomous Agent Actions Timeline */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-1 flex items-center">
              <span className="mr-2">⚡</span> Autonomous Agent Timeline
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Chronological log of agent workflow execution, follow-ups, and escalations.
            </p>
            <ComplaintAgentTimeline actions={agentActions} loading={actionsLoading} />
          </div>

          {/* Status Change History Audit Trail */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
              Status Change History
            </h2>
            {complaint.statusHistory && complaint.statusHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Changed By</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Note</th>
                      <th className="py-2.5 px-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {complaint.statusHistory.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3"><StatusBadge status={item.status} /></td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {item.changedBy?.name || (item.changedByRole === 'agent' ? 'Autonomous Agent' : 'System')}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] uppercase">{item.changedByRole}</td>
                        <td className="py-2.5 px-3 text-slate-700">{item.note || '—'}</td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">
                          {new Date(item.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No status transitions recorded yet.</p>
            )}
          </div>
        </div>

        {/* Right Col: Routing & Stakeholder Info */}
        <div className="space-y-6">
          {/* Department Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Department Routing</h2>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Department Name:</span>
                <span className="font-semibold text-slate-900 text-sm">{complaint.departmentId?.name || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Code:</span>
                <span className="font-mono text-indigo-700 font-bold">{complaint.departmentId?.code || 'N/A'}</span>
              </div>
              {complaint.departmentId?.contactEmail && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Contact:</span>
                  <span className="text-slate-600">{complaint.departmentId.contactEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Authority */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Assigned Authority</h2>
            {complaint.assignedTo ? (
              <div className="space-y-1 text-xs">
                <p className="font-bold text-slate-800 text-sm">{complaint.assignedTo.name}</p>
                <p className="text-slate-500">{complaint.assignedTo.email}</p>
                {complaint.assignedTo.phone && <p className="text-slate-500">📞 {complaint.assignedTo.phone}</p>}
              </div>
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
                Awaiting department authority assignment.
              </p>
            )}
          </div>

          {/* Citizen Reporter */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Citizen Reporter</h2>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-800 text-sm">{complaint.citizenId?.name || 'Citizen'}</p>
              <p className="text-slate-500">{complaint.citizenId?.email}</p>
              {complaint.citizenId?.phone && <p className="text-slate-500">📞 {complaint.citizenId.phone}</p>}
            </div>
          </div>

          {/* Geographic Location */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Location</h2>
            <div className="space-y-2 text-xs">
              <p className="text-slate-800 font-medium">{complaint.location?.address || 'No street address provided'}</p>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100 font-mono text-[11px] text-slate-600">
                <div>Lat: {complaint.location?.latitude}</div>
                <div>Lng: {complaint.location?.longitude}</div>
              </div>
            </div>
          </div>

          {/* SLA Tracking Info */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">SLA Tracking Status</h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Follow-up Triggers:</span>
                <span className="font-bold text-slate-800">{complaint.followUp?.count || 0}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Escalation Status:</span>
                <span className={`font-bold ${complaint.escalation?.isEscalated ? 'text-rose-600' : 'text-slate-800'}`}>
                  {complaint.escalation?.isEscalated ? `Level ${complaint.escalation.level}` : 'Normal'}
                </span>
              </div>
              {complaint.escalation?.escalatedAt && (
                <div className="text-[11px] text-slate-500">
                  Escalated on: {new Date(complaint.escalation.escalatedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ComplaintDetails;
