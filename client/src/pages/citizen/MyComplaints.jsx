import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/complaints/StatusBadge';
import SeverityBadge from '../../components/complaints/SeverityBadge';
import GlassCard from '../../components/ui/GlassCard';
import GlassSelect from '../../components/ui/GlassSelect';
import GlassButton from '../../components/ui/GlassButton';
import { complaintAPI } from '../../services/complaint.service';
import { List, Filter, FileText, ChevronRight, AlertCircle, XCircle } from 'lucide-react';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintAPI.getMyComplaints();
      setComplaints(response.data?.data || []);
    } catch (err) {
      setError('Failed to fetch complaints.');
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    let matchesStatus = true;
    let matchesSeverity = true;

    if (statusFilter) {
      matchesStatus = complaint.status === statusFilter;
    }
    
    if (severityFilter) {
      matchesSeverity = complaint.severity === severityFilter;
    }

    return matchesStatus && matchesSeverity;
  });

  const clearFilters = () => {
    setStatusFilter('');
    setSeverityFilter('');
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-indigo-200">Loading your complaints...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <List className="w-8 h-8 text-indigo-400" />
            My Complaints
          </h1>
          <p className="text-indigo-200 mt-2 text-lg">View and track the status of all your submitted civic issues.</p>
        </div>
        <Link to="/citizen/report">
          <GlassButton variant="primary">Report New Issue</GlassButton>
        </Link>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
          <p className="ml-3 text-sm text-rose-200 font-medium">{error}</p>
        </div>
      )}

      {complaints.length > 0 && (
        <GlassCard className="p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4 text-indigo-300 font-medium">
            <Filter className="w-5 h-5" />
            Filter Complaints
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <GlassSelect
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="" className="bg-slate-800">All Statuses</option>
                <option value="SUBMITTED" className="bg-slate-800">Submitted</option>
                <option value="ASSIGNED" className="bg-slate-800">Assigned</option>
                <option value="IN_PROGRESS" className="bg-slate-800">In Progress</option>
                <option value="RESOLVED" className="bg-slate-800">Resolved</option>
                <option value="ESCALATED" className="bg-slate-800">Escalated</option>
              </GlassSelect>
            </div>
            <div className="flex-1">
              <label htmlFor="severity-filter" className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
              <GlassSelect
                id="severity-filter"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="" className="bg-slate-800">All Severities</option>
                <option value="LOW" className="bg-slate-800">Low</option>
                <option value="MEDIUM" className="bg-slate-800">Medium</option>
                <option value="HIGH" className="bg-slate-800">High</option>
                <option value="CRITICAL" className="bg-slate-800">Critical</option>
              </GlassSelect>
            </div>
          </div>
        </GlassCard>
      )}

      {complaints.length === 0 ? (
        <GlassCard className="p-12 text-center flex flex-col items-center">
          <div className="bg-white/5 p-4 rounded-full mb-4">
            <FileText className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No submitted complaints yet</h3>
          <p className="text-gray-400 mb-6 max-w-sm">You haven't submitted any civic issues. Report an issue to help improve your community.</p>
          <Link to="/citizen/report">
            <GlassButton variant="primary">Report an Issue</GlassButton>
          </Link>
        </GlassCard>
      ) : filteredComplaints.length === 0 ? (
        <GlassCard className="p-12 text-center flex flex-col items-center">
           <div className="bg-white/5 p-4 rounded-full mb-4">
            <XCircle className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-gray-300 text-lg mb-4">No complaints match your selected filters.</p>
          <GlassButton onClick={clearFilters} variant="secondary">
            Clear Filters
          </GlassButton>
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-300 uppercase tracking-wider">Complaint ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-300 uppercase tracking-wider">Issue Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-300 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-300 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                      {complaint.complaintId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {complaint.issueType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SeverityBadge severity={complaint.severity} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {complaint.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/citizen/complaints/${complaint._id}`} 
                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        View <ChevronRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default MyComplaints;
