import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthorityLayout from '../../components/authority/AuthorityLayout';
import { StatusBadge, SeverityBadge } from '../../components/admin/AdminBadges';
import authorityAPI from '../../services/authority.service';
import {
  FolderKanban,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Calendar,
  Eye,
  Edit3,
  X,
  Send,
  Sparkles
} from 'lucide-react';

const ALLOWED_TRANSITIONS = {
  SUBMITTED: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS', 'ESCALATED'],
  IN_PROGRESS: ['RESOLVED', 'ESCALATED'],
  RESOLVED: [],
  ESCALATED: []
};

export default function AuthorityDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  // Modal State for Status Update
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (severityFilter) params.severity = severityFilter;

      const res = await authorityAPI.getAuthorityComplaints(params);
      if (res.data?.success) {
        setComplaints(res.data.data || []);
        setStats(res.data.stats || null);
      } else {
        throw new Error(res.data?.message || 'Failed to fetch department complaints.');
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load department complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, severityFilter]);

  // Open status modal
  const handleOpenStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    const transitions = ALLOWED_TRANSITIONS[complaint.status] || [];
    setNewStatus(transitions[0] || '');
    setNote('');
    setModalError('');
  };

  // Submit status update
  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !newStatus) return;
    setUpdating(true);
    setModalError('');
    try {
      const cid = selectedComplaint.complaintId || selectedComplaint._id;
      const res = await authorityAPI.updateComplaintStatus(cid, {
        status: newStatus,
        note: note.trim()
      });

      if (res.data?.success) {
        setSelectedComplaint(null);
        setSuccessMsg(`Complaint ${cid} successfully updated to ${newStatus}.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchComplaints();
      } else {
        throw new Error(res.data?.error || 'Failed to update status');
      }
    } catch (err) {
      setModalError(err.response?.data?.error || err.message || 'Status update failed.');
    } finally {
      setUpdating(false);
    }
  };

  // Client-side search filtering
  const filteredComplaints = complaints.filter((c) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const idStr = (c.complaintId || '').toLowerCase();
    const issueStr = (c.issueType || '').toLowerCase();
    const descStr = (c.description || '').toLowerCase();
    const addrStr = (c.location?.address || '').toLowerCase();
    return idStr.includes(term) || issueStr.includes(term) || descStr.includes(term) || addrStr.includes(term);
  });

  const deptName = user?.departmentId?.name || user?.departmentId?.code || 'Department Authority';

  return (
    <AuthorityLayout>
      <div className="space-y-6">
        {/* 1. Header Hero Banner matching Reference */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-indigo-500/10 border border-blue-100 p-6 sm:p-7 shadow-xs">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-blue-700 shadow-2xs border border-blue-100 mb-2">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{deptName}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Department Resolution Command
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 max-w-xl">
                Review assigned municipal issues, inspect AI-analyzed evidence, and update task progress towards SLA completion.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={fetchComplaints}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/95 hover:bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 shadow-2xs transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Live</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800">✕</button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={fetchComplaints} className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold">
              Retry
            </button>
          </div>
        )}

        {/* 2. Key Statistics Cards matching Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Assigned */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Assigned Complaints
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FolderKanban className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {stats?.total ?? complaints.length}
              </span>
            </div>
            <div className="mt-2 text-xs font-semibold text-blue-600">
              Department scope
            </div>
          </div>

          {/* Pending Triage */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pending Triage
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {(stats?.submitted || 0) + (stats?.assigned || 0)}
              </span>
            </div>
            <div className="mt-2 text-xs font-semibold text-amber-600">
              Needs status advancement
            </div>
          </div>

          {/* In Progress */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                In Progress
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {stats?.inProgress || 0}
              </span>
            </div>
            <div className="mt-2 text-xs font-semibold text-indigo-600">
              Active field resolution
            </div>
          </div>

          {/* Resolved */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Resolved
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {stats?.resolved || 0}
              </span>
            </div>
            <div className="mt-2 text-xs font-semibold text-emerald-600">
              {stats?.escalated ? `${stats.escalated} Escalated` : 'Closed within SLA'}
            </div>
          </div>
        </div>

        {/* 3. Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Search Complaints
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by ID, description, address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="ESCALATED">Escalated</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Priority
              </label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Assigned Complaints Table matching Reference */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Department Complaints Directory
              </h3>
              <p className="text-xs text-slate-500">
                Showing {filteredComplaints.length} assigned civic records
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-2"></div>
              <p className="text-xs font-semibold text-slate-500">Loading department records...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <FolderKanban className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No complaints found</p>
              <p className="text-xs text-slate-400 mt-1">
                {search || statusFilter || severityFilter
                  ? 'No issues match your current filters.'
                  : 'All complaints for your department have been resolved.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Complaint ID</th>
                    <th className="py-3 px-4">Issue & Description</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredComplaints.map((comp) => {
                    const cid = comp.complaintId || comp._id;
                    const transitions = ALLOWED_TRANSITIONS[comp.status] || [];
                    const canAdvance = transitions.length > 0;
                    const dateStr = comp.createdAt
                      ? new Date(comp.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—';

                    return (
                      <tr key={comp._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">
                          <Link to={`/authority/complaints/${cid}`}>
                            {cid}
                          </Link>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <span className="font-bold text-slate-900 block truncate">
                            {comp.issueType || 'Civic Issue'}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {comp.description}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate">
                          {comp.location?.address || `${comp.location?.latitude?.toFixed(4)}, ${comp.location?.longitude?.toFixed(4)}` || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <SeverityBadge severity={comp.severity} />
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={comp.status} />
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {dateStr}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {canAdvance && (
                              <button
                                onClick={() => handleOpenStatusModal(comp)}
                                className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Update Status</span>
                              </button>
                            )}
                            <Link
                              to={`/authority/complaints/${cid}`}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 5. Status Transition Modal with Lifecycle Guarding */}
        {selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-in">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Advance Complaint Status</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    ID: {selectedComplaint.complaintId || selectedComplaint._id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateStatusSubmit} className="p-6 space-y-4">
                {modalError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {modalError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Current Status
                  </label>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <StatusBadge status={selectedComplaint.status} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    New Status Transition *
                  </label>
                  <select
                    required
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {(ALLOWED_TRANSITIONS[selectedComplaint.status] || []).map((st) => (
                      <option key={st} value={st}>
                        Advance to: {st.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Strict municipal lifecycle prevents invalid back-transitions.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Action / Operational Note
                  </label>
                  <textarea
                    rows="3"
                    placeholder="e.g. Field inspection completed, work crew dispatched to location."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating || !newStatus}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{updating ? 'Saving Status...' : 'Apply Status Update'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthorityLayout>
  );
}
