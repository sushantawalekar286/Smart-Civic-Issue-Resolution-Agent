import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Settings as SettingsIcon,
  Sliders,
  Shield,
  Bell,
  Cpu,
  Save,
  CheckCircle2
} from 'lucide-react';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({
    followUpThresholdHours: '24',
    escalationThresholdHours: '48',
    aiModel: 'Gemini 1.5 Pro',
    autoAssignEnabled: true,
    notificationEmails: true,
    strictSlaEnforcement: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout
      title="Platform & Autonomous Agent Settings"
      subtitle="Configure SLA triggers, autonomous agent parameters, and municipal notification preferences"
    >
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Platform configurations saved successfully.</span>
          </div>
        )}

        {/* SLA & Escalation Engine Settings */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Autonomous Monitoring & Escalation Rules</h3>
              <p className="text-xs text-slate-400">Define agentic intervention triggers for unresolved civic issues</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Follow-Up Threshold (Hours)
              </label>
              <input
                type="number"
                value={config.followUpThresholdHours}
                onChange={(e) => setConfig({ ...config, followUpThresholdHours: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Agent initiates automated reminder to assigned authority when complaint is unaddressed.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Escalation Threshold (Hours)
              </label>
              <input
                type="number"
                value={config.escalationThresholdHours}
                onChange={(e) => setConfig({ ...config, escalationThresholdHours: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Agent escalates to senior supervisory department upon SLA breach.
              </span>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.strictSlaEnforcement}
                onChange={(e) => setConfig({ ...config, strictSlaEnforcement: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-700">
                Enforce Strict Autonomous SLA Interventions (Auto-Flag Violations)
              </span>
            </label>
          </div>
        </div>

        {/* AI Engine & Gemini Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Engine & Multimodal Intelligence</h3>
              <p className="text-xs text-slate-400">Gemini generative model & fallback engine configurations</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Active Generative Model
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  disabled
                  value={config.aiModel}
                  className="flex-1 px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 cursor-not-allowed"
                />
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-mono text-xs font-bold rounded-lg border border-emerald-200">
                  Online & Connected
                </span>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoAssignEnabled}
                onChange={(e) => setConfig({ ...config, autoAssignEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-700">
                Enable Autonomous Department Assignment based on AI Classification Confidence &gt; 80%
              </span>
            </label>
          </div>
        </div>

        {/* Save Controls */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-xs transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
