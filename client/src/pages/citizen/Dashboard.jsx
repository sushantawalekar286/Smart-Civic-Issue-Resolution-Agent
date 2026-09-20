import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintAPI } from '../../services/complaint.service';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/complaints/StatusBadge';
import SeverityBadge from '../../components/complaints/SeverityBadge';
import GlassButton from '../../components/ui/GlassButton';
import GlassSkeleton from '../../components/ui/GlassSkeleton';
import { FileText, AlertCircle, Clock, CheckCircle, ArrowRight, Activity, Plus, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
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
      setError('Failed to fetch dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { name: 'Total Complaints', stat: complaints.length, icon: <FileText className="w-6 h-6 text-indigo-600" />, bg: 'bg-indigo-100' },
    { name: 'Submitted', stat: complaints.filter(c => c.status === 'SUBMITTED').length, icon: <AlertCircle className="w-6 h-6 text-cyan-600" />, bg: 'bg-cyan-100' },
    { name: 'In Progress', stat: complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length, icon: <Clock className="w-6 h-6 text-amber-600" />, bg: 'bg-amber-100' },
    { name: 'Resolved', stat: complaints.filter(c => c.status === 'RESOLVED').length, icon: <CheckCircle className="w-6 h-6 text-emerald-600" />, bg: 'bg-emerald-100' },
    { name: 'Escalated', stat: complaints.filter(c => c.status === 'ESCALATED').length, icon: <AlertTriangle className="w-6 h-6 text-rose-600" />, bg: 'bg-rose-100' },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <GlassSkeleton className="w-64 h-10 mb-2" />
            <GlassSkeleton className="w-96 h-5" />
          </div>
          <GlassSkeleton className="w-32 h-10" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map(i => (
            <GlassSkeleton key={i} className="w-full h-24" />
          ))}
        </div>
        <div>
          <GlassSkeleton className="w-48 h-8 mb-4" />
          <GlassSkeleton className="w-full h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'Citizen'}</h1>
          <p className="text-slate-600 mt-1">Overview of your civic issue reports and their current status.</p>
        </div>
        <Link to="/citizen/report">
          <GlassButton className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
            <Plus className="w-5 h-5" />
            Report Issue
          </GlassButton>
        </Link>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
          <p className="ml-3 text-sm text-rose-200 font-medium">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((item, idx) => (
          <GlassCard 
            key={item.name} 
            className="p-6 relative overflow-hidden group transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/50 rounded-full blur-xl group-hover:bg-blue-50 transition-colors"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className={`p-3 rounded-xl ${item.bg} border border-slate-100`}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{item.name}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{item.stat}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Recent Complaints */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Recent Complaints
          </h2>
          <Link to="/citizen/complaints" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {complaints.length === 0 ? (
          <GlassCard className="p-12 text-center flex flex-col items-center animate-in slide-in-from-bottom-4">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No complaints found</h3>
            <p className="text-slate-500 mb-6 max-w-sm">You haven't submitted any civic issues yet. Report an issue to help improve your community.</p>
            <Link to="/citizen/report">
              <GlassButton variant="primary" className="transition-transform hover:scale-105">Report an Issue</GlassButton>
            </Link>
          </GlassCard>
        ) : (
          <GlassCard className="overflow-hidden animate-in slide-in-from-bottom-4">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Issue Type</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Severity</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.slice(0, 5).map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => window.location.href = `/citizen/complaints/${complaint._id}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                          {complaint.complaintId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {complaint.issueType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <SeverityBadge severity={complaint.severity} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {complaint.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={complaint.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden flex flex-col divide-y divide-slate-100">
              {complaints.slice(0, 5).map((complaint) => (
                <Link key={complaint._id} to={`/citizen/complaints/${complaint._id}`} className="p-4 hover:bg-slate-50 transition-colors active:bg-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-blue-600">{complaint.complaintId}</span>
                    <span className="text-xs text-slate-500">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-base font-semibold text-slate-800 mb-3">{complaint.issueType}</h4>
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <StatusBadge status={complaint.status} />
                    <SeverityBadge severity={complaint.severity} />
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
