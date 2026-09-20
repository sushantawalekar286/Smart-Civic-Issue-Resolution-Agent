import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { StatusBadge, SeverityBadge } from '../../components/admin/AdminBadges';
import { getDashboard } from '../../services/admin.service';
import {
  FolderKanban,
  Clock,
  Wrench,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Shield,
  Building2,
  Users,
  Bot,
  Activity,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trendPeriod, setTrendPeriod] = useState('7D');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboard();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        throw new Error(res.message || 'Failed to load dashboard metrics');
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const complaints = data?.complaints || {};
  const agentActions = data?.agentActions || {};
  const recentComplaints = data?.recentComplaints || [];
  const recentActions = agentActions?.recent || [];
  const byDept = complaints?.byDepartment || [];

  // Derived metrics
  const totalComplaints = complaints.total || 0;
  const pendingCount = (complaints.submitted || 0) + (complaints.assigned || 0);
  const inProgressCount = complaints.inProgress || 0;
  const resolvedCount = complaints.resolved || 0;
  const escalatedCount = complaints.escalated || 0;

  // Completion percentage
  const completionRate = totalComplaints > 0
    ? Math.round((resolvedCount / totalComplaints) * 100)
    : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 1. Welcome / Hero Banner matching Reference */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-sky-500/10 border border-blue-100 p-6 sm:p-7 shadow-xs">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-blue-700 shadow-2xs border border-blue-100 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Good Morning, Admin 👋</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Welcome back to SmartCivic!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 max-w-xl">
                Monitor civic complaints in real-time, inspect autonomous agent decisions, and ensure rapid resolution for citizens.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/95 hover:bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Live Data</span>
              </button>
              <Link
                to="/admin/complaints"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/20 transition"
              >
                <span>View All Complaints</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchDashboardData}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* 2. Top 4 Statistics Cards matching Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Complaints */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Complaints
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FolderKanban className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {totalComplaints}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real-time intake stream</span>
            </div>
          </div>

          {/* Pending / Unresolved */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pending Triage
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {pendingCount}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-amber-600">
              <span>{complaints.unresolved || pendingCount} awaiting field action</span>
            </div>
          </div>

          {/* In Progress */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                In Progress
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {inProgressCount}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
              <span>Active departmental work</span>
            </div>
          </div>

          {/* Resolved */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Resolved
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {resolvedCount}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span>{completionRate}% overall resolution rate</span>
            </div>
          </div>
        </div>

        {/* 3. Middle Section: Trend Chart & Department Distribution & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Complaints Trend Chart (2 columns on lg) */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Complaints Trend</h3>
                  <p className="text-xs text-slate-500 font-medium">Daily resolution volume across municipal jurisdictions</p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                  {['7D', '30D', '3M', '6M'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setTrendPeriod(period)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                        trendPeriod === period
                          ? 'bg-white text-blue-600 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trend Chart Visualization (SVG Area Chart) */}
              <div className="mt-6 h-52 w-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#F1F5F9" strokeWidth="1" />

                  {/* Total Area & Line */}
                  <path
                    d="M 0 110 Q 70 80, 140 95 T 280 60 T 420 40 L 500 35 L 500 150 L 0 150 Z"
                    fill="url(#totalGrad)"
                  />
                  <path
                    d="M 0 110 Q 70 80, 140 95 T 280 60 T 420 40 L 500 35"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Resolved Area & Line */}
                  <path
                    d="M 0 130 Q 70 120, 140 125 T 280 100 T 420 85 L 500 70 L 500 150 L 0 150 Z"
                    fill="url(#resolvedGrad)"
                  />
                  <path
                    d="M 0 130 Q 70 120, 140 125 T 280 100 T 420 85 L 500 70"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>

                {/* X-Axis labels */}
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mt-3 pt-2 border-t border-slate-100">
                  <span>Day 1</span>
                  <span>Day 2</span>
                  <span>Day 3</span>
                  <span>Day 4</span>
                  <span>Day 5</span>
                  <span>Day 6</span>
                  <span>Today</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span>Total Incoming ({totalComplaints})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>Resolved Complaints ({resolvedCount})</span>
              </div>
            </div>
          </div>

          {/* Department Overview & Quick Gauge (1 column) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Department Overview</h3>
                  <p className="text-xs text-slate-500">Volume distribution by civic unit</p>
                </div>
                <Link to="/admin/departments" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Department breakdown list */}
              <div className="mt-4 space-y-3.5">
                {byDept.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No departmental complaint records available yet.
                  </div>
                ) : (
                  byDept.map((d, idx) => {
                    const percentage = totalComplaints > 0
                      ? Math.round((d.count / totalComplaints) * 100)
                      : 0;

                    const colors = [
                      'bg-blue-500',
                      'bg-cyan-500',
                      'bg-amber-500',
                      'bg-purple-500',
                      'bg-emerald-500'
                    ];
                    const barColor = colors[idx % colors.length];

                    return (
                      <div key={d._id || idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{d.name || d.code}</span>
                          <div className="flex items-center gap-2 font-mono text-slate-500">
                            <span>{d.count} issues</span>
                            <span className="font-bold text-slate-900">{percentage}%</span>
                          </div>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor} transition-all duration-500`}
                            style={{ width: `${Math.max(percentage, 6)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Stats Radial Gauge at bottom */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70 p-3 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                  {completionRate}%
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Municipal SLA Health</span>
                  <span className="text-[11px] text-slate-500">Resolution velocity is optimal</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Healthy
              </span>
            </div>
          </div>
        </div>

        {/* 4. Bottom Row: Recent Complaints Table + Quick Actions & Agent Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent Complaints Table (2 cols) */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recent Complaints</h3>
                  <p className="text-xs text-slate-500">Latest civic reports submitted by citizens</p>
                </div>
                <Link
                  to="/admin/complaints"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>View All Complaints</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentComplaints.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No recent complaints recorded.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Issue</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentComplaints.slice(0, 5).map((comp) => {
                        const cid = comp.complaintId || comp._id;
                        return (
                          <tr key={comp._id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-blue-600">
                              <Link to={`/admin/complaints/${cid}`}>
                                {comp.complaintId || comp._id.substring(0, 10)}
                              </Link>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              {comp.issueType || 'Civic Issue'}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {comp.departmentId?.name || comp.departmentId?.code || 'Assigned'}
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge status={comp.status} />
                            </td>
                            <td className="py-3 px-4">
                              <SeverityBadge severity={comp.severity} />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Link
                                to={`/admin/complaints/${cid}`}
                                className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-lg transition"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="p-4 bg-slate-50/70 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Link
                to="/admin/complaints"
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-center hover:bg-blue-50 hover:border-blue-200 transition group"
              >
                <FolderKanban className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-700 block">All Complaints</span>
              </Link>
              <Link
                to="/admin/users"
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-center hover:bg-indigo-50 hover:border-indigo-200 transition group"
              >
                <Users className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-indigo-700 block">Users Directory</span>
              </Link>
              <Link
                to="/admin/departments"
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-center hover:bg-cyan-50 hover:border-cyan-200 transition group"
              >
                <Building2 className="w-4 h-4 mx-auto mb-1 text-cyan-600" />
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-cyan-700 block">Departments</span>
              </Link>
              <Link
                to="/admin/agent-actions"
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-center hover:bg-purple-50 hover:border-purple-200 transition group"
              >
                <Bot className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-700 block">Agent Audit</span>
              </Link>
            </div>
          </div>

          {/* Recent Agent Activities (1 col) */}
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recent Agent Actions</h3>
                  <p className="text-xs text-slate-500">Autonomous AI audit trail</p>
                </div>
                <Link to="/admin/agent-actions" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Feed List */}
              <div className="mt-4 space-y-3.5">
                {recentActions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No autonomous actions recorded yet.
                  </div>
                ) : (
                  recentActions.slice(0, 5).map((act, idx) => {
                    const timeStr = act.timestamp || act.createdAt
                      ? new Date(act.timestamp || act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Recently';

                    return (
                      <div key={act._id || idx} className="flex items-start gap-3 text-xs">
                        <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-slate-900 truncate">
                              {act.actionType ? act.actionType.replace(/_/g, ' ') : 'Agent Event'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">{timeStr}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {act.reason || act.result || 'Autonomous workflow step executed.'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* System Status Indicators Card matching Reference */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                System Infrastructure Status
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-700">
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Backend API</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>MongoDB</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Cloudinary</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Gemini AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
