import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminAPI from '../../services/admin.service';
import AdminLayout from '../../components/admin/AdminLayout';
import { StatusBadge, SeverityBadge } from '../../components/admin/AdminBadges';

const ComplaintsList = () => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [issueType, setIssueType] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [page, setPage] = useState(1);

  // Load departments once for filter dropdown
  useEffect(() => {
    adminAPI.getDepartments()
      .then(res => setDepartments(res.data.data || []))
      .catch(() => {});
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit: 10,
        ...(search && { search }),
        ...(status && { status }),
        ...(severity && { severity }),
        ...(issueType && { issueType }),
        ...(departmentId && { departmentId })
      };

      const res = await adminAPI.getComplaints(params);
      setComplaints(res.data.complaints || []);
      setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, status, severity, issueType, departmentId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setSeverity('');
    setIssueType('');
    setDepartmentId('');
    setPage(1);
  };

  return (
    <AdminLayout title="All Complaints" subtitle="Comprehensive civic issue tracking across all municipal jurisdictions">
      {/* Filters Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs mb-6">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by ID or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="ESCALATED">ESCALATED</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Severity</label>
            <select
              value={severity}
              onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
            >
              <option value="">All Severities</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          {/* Issue Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Issue Type</label>
            <select
              value={issueType}
              onChange={(e) => { setIssueType(e.target.value); setPage(1); }}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
            >
              <option value="">All Types</option>
              <option value="Pothole">Pothole</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Garbage">Garbage</option>
              <option value="Damaged Streetlight">Damaged Streetlight</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Drainage">Drainage</option>
              <option value="Public Infrastructure Damage">Public Infra</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Department</label>
            <select
              value={departmentId}
              onChange={(e) => { setDepartmentId(e.target.value); setPage(1); }}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
        </form>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-500">
            Showing <strong className="text-slate-700">{complaints.length}</strong> of <strong className="text-slate-700">{pagination.total}</strong> complaints
          </span>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Complaints Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">No complaints found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Complaint ID</th>
                  <th className="py-3 px-4">Issue Type</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Citizen</th>
                  <th className="py-3 px-4">Tracking</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {c.complaintId}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {c.issueType}
                    </td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={c.severity} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="font-medium text-slate-800 block">{c.departmentId?.name || 'Unassigned'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{c.departmentId?.code}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="block font-medium text-slate-700">{c.citizenId?.name || 'Citizen'}</span>
                      <span className="text-[10px] text-slate-400">{c.citizenId?.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {c.followUp?.count > 0 && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                            🔔 {c.followUp.count} Follow-up
                          </span>
                        )}
                        {c.escalation?.isEscalated && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                            🚨 Esc. Level {c.escalation.level}
                          </span>
                        )}
                        {!c.followUp?.count && !c.escalation?.isEscalated && (
                          <span className="text-[11px] text-slate-400">Normal</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/admin/complaints/${c.complaintId}`}
                        className="inline-flex items-center px-3 py-1 bg-slate-100 hover:bg-indigo-50 text-indigo-700 font-semibold rounded text-xs transition-colors"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="px-3 py-1 text-xs font-medium bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs text-slate-600">
              Page <strong className="text-slate-800">{page}</strong> of <strong className="text-slate-800">{pagination.pages}</strong>
            </span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, pagination.pages))}
              disabled={page >= pagination.pages}
              className="px-3 py-1 text-xs font-medium bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ComplaintsList;
