import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import adminAPI from '../../services/admin.service';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';

export default function Reports() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(res => setDashboardData(res.data?.data || null))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const total = dashboardData?.summary?.totalComplaints || 0;
  const resolved = dashboardData?.summary?.resolved || 0;
  const inProgress = dashboardData?.summary?.inProgress || 0;
  const pending = dashboardData?.summary?.pending || 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <AdminLayout
      title="Civic Analytics & Operational Reports"
      subtitle="Comprehensive performance audits, SLA adherence reports, and departmental metrics"
    >
      <div className="space-y-6">
        {/* Top Controls Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Municipal Audit Reports</h2>
              <p className="text-xs text-slate-400">Quarterly civic resolution & AI throughput logs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
              <Calendar className="w-3.5 h-3.5" />
              <span>Current Cycle (Q1 2026)</span>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Summary</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Overall Resolution Rate
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{resolutionRate}%</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Target: 80%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${resolutionRate}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Logged Incidents
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{total}</span>
              <span className="text-xs font-bold text-blue-600">Complaints</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">Verified across all departments</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active In Investigation
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-600">{inProgress}</span>
              <span className="text-xs font-bold text-amber-700">In Progress</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">Field teams mobilized</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Escalation Rate
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-600">
                {total > 0 ? Math.round(((dashboardData?.summary?.escalated || 0) / total) * 100) : 0}%
              </span>
              <span className="text-xs font-bold text-rose-600">Strict SLA</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">Autonomous agent escalations</p>
          </div>
        </div>

        {/* Detailed Breakdown Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span>Departmental Resolution Index</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Assigned Complaints</th>
                  <th className="py-3 px-4">Resolution Performance</th>
                  <th className="py-3 px-4">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboardData?.departmentBreakdown && dashboardData.departmentBreakdown.length > 0 ? (
                  dashboardData.departmentBreakdown.map((dept, idx) => {
                    const pct = total > 0 ? Math.round((dept.count / total) * 100) : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-bold text-slate-800">{dept.name}</td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-700">{dept.count} complaints</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(pct * 2, 100)}%` }} />
                            </div>
                            <span className="text-slate-600 font-mono text-[11px]">{pct}% share</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Active Duty
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400">
                      Loading departmental analytics...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
