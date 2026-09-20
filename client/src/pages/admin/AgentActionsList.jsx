import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { ActionTypeBadge } from '../../components/admin/AdminBadges';
import { getAgentActions } from '../../services/admin.service';

const ACTION_TYPES = [
  'INPUT_RECEIVED',
  'ISSUE_CLASSIFIED',
  'EVIDENCE_ANALYZED',
  'LOCATION_ANALYZED',
  'SEVERITY_ASSESSED',
  'DEPARTMENT_MAPPED',
  'COMPLAINT_GENERATED',
  'COMPLAINT_SUBMITTED',
  'STATUS_CHECKED',
  'FOLLOW_UP_INITIATED',
  'ESCALATION_INITIATED'
];

export default function AgentActionsList() {
  const [actions, setActions] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [actionType, setActionType] = useState('');
  const [complaintId, setComplaintId] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchActions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (actionType) params.actionType = actionType;
      if (complaintId.trim()) params.complaintId = complaintId.trim();

      const res = await getAgentActions(params);
      if (res.success) {
        setActions(res.actions || []);
        if (res.pagination) {
          setTotal(res.pagination.total || 0);
          setTotalPages(res.pagination.pages || 1);
        }
      } else {
        throw new Error(res.message || 'Failed to fetch agent activities');
      }
    } catch (err) {
      console.error('Error fetching agent actions:', err);
      setError(err.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [page, actionType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchActions();
  };

  const handleReset = () => {
    setActionType('');
    setComplaintId('');
    setPage(1);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Autonomous Agent Activity Log
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Complete audit trail of AI agent decisions, confidence scores, follow-ups, and escalations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
              Live Agent Stream
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Filter by Action Type
              </label>
              <select
                value={actionType}
                onChange={(e) => {
                  setActionType(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">All Action Types</option>
                {ACTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Complaint ID
              </label>
              <input
                type="text"
                placeholder="e.g. CIV-2026..."
                value={complaintId}
                onChange={(e) => setComplaintId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Filter Activity
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-lg transition"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Action Feed / Table */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
            <p className="mt-2 text-sm text-slate-500 font-medium">Fetching agent operations log...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
            <p className="text-sm font-bold text-rose-800">{error}</p>
            <button
              onClick={fetchActions}
              className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        ) : actions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-sm font-bold text-slate-800">No agent actions recorded</h3>
            <p className="text-xs text-slate-500 mt-1">No autonomous operations match your current filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {actions.map((act) => {
                const isExpanded = expandedId === act._id;
                const dateStr = act.timestamp || act.createdAt
                  ? new Date(act.timestamp || act.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })
                  : 'N/A';

                const targetComplaintId = typeof act.complaintId === 'object' && act.complaintId !== null
                  ? (act.complaintId.complaintId || act.complaintId._id)
                  : act.complaintId;

                return (
                  <div key={act._id} className="p-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <ActionTypeBadge actionType={act.actionType} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-slate-500">
                              ResolutionEngine
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-400">{dateStr}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900 mt-1">
                            {act.reason || act.result || 'Autonomous agent event executed.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-auto">
                        {targetComplaintId && (
                          <Link
                            to={`/admin/complaints/${targetComplaintId}`}
                            className="inline-flex items-center gap-1 text-xs font-mono font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-md transition"
                          >
                            <span>Target: {targetComplaintId}</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </Link>
                        )}
                        <button
                          onClick={() => toggleExpand(act._id)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-white transition"
                        >
                          {isExpanded ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Result & Metadata Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50 rounded-lg p-3 text-xs font-mono text-slate-800 space-y-2">
                        {act.result && (
                          <div>
                            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Result:</span>
                            <div className="p-2 bg-slate-900 text-emerald-400 rounded overflow-x-auto text-[11px] leading-relaxed">
                              {typeof act.result === 'object' ? JSON.stringify(act.result, null, 2) : act.result}
                            </div>
                          </div>
                        )}
                        {act.evidenceSummary && (
                          <div>
                            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Evidence Summary:</span>
                            <div className="p-2 bg-slate-100 text-slate-800 rounded font-sans text-xs">
                              {act.evidenceSummary}
                            </div>
                          </div>
                        )}
                        {act.metadata && Object.keys(act.metadata).length > 0 && (
                          <div>
                            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Metadata:</span>
                            <pre className="p-2 bg-slate-900 text-cyan-300 rounded overflow-x-auto text-[11px] leading-relaxed">
                              {JSON.stringify(act.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing <span className="font-bold text-slate-700">{actions.length}</span> of{' '}
                <span className="font-bold text-slate-700">{total}</span> total autonomous operations
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-slate-200 rounded-md bg-white font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <span className="px-2 font-bold text-slate-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 border border-slate-200 rounded-md bg-white font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
