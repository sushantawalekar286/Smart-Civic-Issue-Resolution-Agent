import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminAPI from '../../services/admin.service';
import AdminLayout from '../../components/admin/AdminLayout';
import { StatusBadge, SeverityBadge, ActionTypeBadge } from '../../components/admin/AdminBadges';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminAPI.getDashboard();
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return (
      <AdminLayout title="System Overview" subtitle="Real-time civic operations and autonomous monitoring">
        <div className="py-20 text-center text-slate-500">
          <div className="inline-block animate-spin text-3xl mb-3">⚙️</div>
          <p className="text-sm font-medium">Loading real-time operational metrics...</p>
        </div>
      </AdminLayout>
    );
  }

  const { complaints, agentActions, users, recentComplaints } = data || {};

  return (
    <AdminLayout 
      title="System Overview" 
      subtitle="Real-time civic operations and autonomous monitoring"
      actions={
        <button
          onClick={fetchDashboard}
          className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md shadow-xs transition-colors"
        >
          🔄 Refresh
        </button>
      }
    >
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Complaints</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{complaints?.total ?? 0}</p>
          <span className="text-[11px] text-slate-500">All registered issues</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/30 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Submitted</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{complaints?.submitted ?? 0}</p>
          <span className="text-[11px] text-blue-600">Awaiting assignment</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/30 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">In Progress</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{complaints?.inProgress ?? 0}</p>
          <span className="text-[11px] text-purple-600">Field action active</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/30 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Escalated</p>
          <p className="text-2xl font-bold text-rose-900 mt-1">{complaints?.escalated ?? 0}</p>
          <span className="text-[11px] text-rose-600">SLA breached (48h+)</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Resolved</p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{complaints?.resolved ?? 0}</p>
          <span className="text-[11px] text-emerald-600">Action completed</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Follow-ups</p>
          <p className="text-2xl font-bold text-amber-900 mt-1">{agentActions?.followUpsInitiated ?? 0}</p>
          <span className="text-[11px] text-amber-600">Agent triggered (24h+)</span>
        </div>
      </div>

      {/* Row 2: Severity & Department Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Severity Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span>Severity Distribution</span>
            <span className="text-xs text-slate-400 font-normal">Active Breakdown</span>
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-red-700 font-bold">CRITICAL</span>
                <span>{complaints?.severity?.CRITICAL || 0}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-red-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${complaints?.total ? ((complaints.severity.CRITICAL || 0) / complaints.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-orange-700 font-bold">HIGH</span>
                <span>{complaints?.severity?.HIGH || 0}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${complaints?.total ? ((complaints.severity.HIGH || 0) / complaints.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-yellow-700 font-bold">MEDIUM</span>
                <span>{complaints?.severity?.MEDIUM || 0}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-yellow-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${complaints?.total ? ((complaints.severity.MEDIUM || 0) / complaints.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-600 font-bold">LOW</span>
                <span>{complaints?.severity?.LOW || 0}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-slate-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${complaints?.total ? ((complaints.severity.LOW || 0) / complaints.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Department Volume */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span>Department Routing Volume</span>
            <span className="text-xs text-slate-400 font-normal">By Department</span>
          </h2>
          {complaints?.byDepartment && complaints.byDepartment.length > 0 ? (
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {complaints.byDepartment.map((dept) => (
                <div key={dept.departmentId || dept.code} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-700">
                      {dept.code || 'DEPT'}
                    </span>
                    <span className="text-xs font-medium text-slate-800">{dept.name || 'Department'}</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {dept.count} complaints
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No complaints routed to departments yet.</p>
          )}
        </div>
      </div>

      {/* Row 3: Recent Complaints & Autonomous Agent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Complaints */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 m-0">Recent Complaints</h2>
            <Link to="/admin/complaints" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              View all →
            </Link>
          </div>
          {recentComplaints && recentComplaints.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Complaint ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Department</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentComplaints.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-indigo-600 hover:underline">
                        <Link to={`/admin/complaints/${c.complaintId}`}>{c.complaintId}</Link>
                      </td>
                      <td className="py-2.5 px-3">{c.issueType}</td>
                      <td className="py-2.5 px-3"><SeverityBadge severity={c.severity} /></td>
                      <td className="py-2.5 px-3"><StatusBadge status={c.status} /></td>
                      <td className="py-2.5 px-3 text-slate-500">{c.departmentId?.code || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No complaints recorded yet.</p>
          )}
        </div>

        {/* Recent Agent Actions */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 m-0">Agent Activity</h2>
            <Link to="/admin/agent-actions" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              View all →
            </Link>
          </div>
          {agentActions?.recent && agentActions.recent.length > 0 ? (
            <div className="space-y-3">
              {agentActions.recent.map((action) => (
                <div key={action._id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <ActionTypeBadge actionType={action.actionType} />
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(action.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {action.complaintId?.complaintId && (
                    <p className="text-[11px] text-slate-600 font-mono mb-1">
                      ID: <Link to={`/admin/complaints/${action.complaintId.complaintId}`} className="text-indigo-600 hover:underline">
                        {action.complaintId.complaintId}
                      </Link>
                    </p>
                  )}
                  <p className="text-slate-700 truncate">{action.reason || action.result}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No agent actions recorded yet.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
