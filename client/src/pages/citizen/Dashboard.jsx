import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintAPI } from '../../services/complaint.service';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/complaints/StatusBadge';
import SeverityBadge from '../../components/complaints/SeverityBadge';
import GlassButton from '../../components/ui/GlassButton';
import { FileText, AlertCircle, Clock, CheckCircle, ArrowRight, Activity, Plus } from 'lucide-react';

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await complaintAPI.getMyComplaints();
      setComplaints(response.data?.data || []);
    } catch (err) {
      setError('Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { name: 'Total Complaints', stat: complaints.length, icon: <FileText className="w-6 h-6 text-indigo-400" />, bg: 'bg-indigo-500/20' },
    { name: 'Submitted', stat: complaints.filter(c => c.status === 'SUBMITTED').length, icon: <AlertCircle className="w-6 h-6 text-cyan-400" />, bg: 'bg-cyan-500/20' },
    { name: 'In Progress', stat: complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length, icon: <Clock className="w-6 h-6 text-amber-400" />, bg: 'bg-amber-500/20' },
    { name: 'Resolved', stat: complaints.filter(c => c.status === 'RESOLVED').length, icon: <CheckCircle className="w-6 h-6 text-emerald-400" />, bg: 'bg-emerald-500/20' },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-indigo-200">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-indigo-200 mt-1">Overview of your civic issue reports and their current status.</p>
        </div>
        <Link to="/citizen/report">
          <GlassButton className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Report Issue
          </GlassButton>
        </Link>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
          <p className="ml-3 text-sm text-rose-200 font-medium">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <GlassCard key={item.name} className="p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className={`p-3 rounded-xl ${item.bg} border border-white/10`}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">{item.name}</p>
                <p className="text-2xl font-bold text-white mt-1">{item.stat}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Recent Complaints */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Recent Complaints
          </h2>
          <Link to="/citizen/complaints" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {complaints.length === 0 ? (
          <GlassCard className="p-12 text-center flex flex-col items-center">
            <div className="bg-white/5 p-4 rounded-full mb-4">
              <FileText className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No complaints found</h3>
            <p className="text-gray-400 mb-6 max-w-sm">You haven't submitted any civic issues yet. Report an issue to help improve your community.</p>
            <Link to="/citizen/report">
              <GlassButton variant="primary">Report an Issue</GlassButton>
            </Link>
          </GlassCard>
        ) : (
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-300 uppercase tracking-wider">Issue Type</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-300 uppercase tracking-wider">Severity</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-300 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-300 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {complaints.slice(0, 5).map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/citizen/complaints/${complaint._id}`} className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
                          {complaint.complaintId}
                        </Link>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
