import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || '').toUpperCase();
  const styles = {
    SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200/80 ring-1 ring-blue-500/10',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200/80 ring-1 ring-amber-500/10',
    ASSIGNED: 'bg-purple-50 text-purple-700 border-purple-200/80 ring-1 ring-purple-500/10',
    IN_PROGRESS: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 ring-1 ring-indigo-500/10',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-500/10',
    ESCALATED: 'bg-rose-50 text-rose-700 border-rose-200/80 ring-1 ring-rose-500/10 font-semibold'
  };

  const style = styles[normalized] || 'bg-slate-50 text-slate-700 border-slate-200 ring-1 ring-slate-400/10';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        normalized === 'RESOLVED' ? 'bg-emerald-500' :
        normalized === 'IN_PROGRESS' ? 'bg-indigo-500' :
        normalized === 'ESCALATED' ? 'bg-rose-500' :
        normalized === 'ASSIGNED' ? 'bg-purple-500' :
        'bg-blue-500'
      }`}></span>
      {normalized ? normalized.replace(/_/g, ' ') : 'UNKNOWN'}
    </span>
  );
};

export const SeverityBadge = ({ severity }) => {
  const normalized = (severity || '').toUpperCase();
  const styles = {
    LOW: 'bg-slate-50 text-slate-700 border-slate-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200/80',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200/80 font-semibold',
    CRITICAL: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse'
  };

  const style = styles[normalized] || 'bg-slate-50 text-slate-600 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${style}`}>
      {normalized || 'NORMAL'}
    </span>
  );
};

export const ActionTypeBadge = ({ actionType }) => {
  const normalized = (actionType || '').toUpperCase();
  const styles = {
    INPUT_RECEIVED: 'bg-sky-50 text-sky-700 border-sky-200',
    ISSUE_CLASSIFIED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    EVIDENCE_ANALYZED: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    LOCATION_ANALYZED: 'bg-teal-50 text-teal-700 border-teal-200',
    SEVERITY_ASSESSED: 'bg-amber-50 text-amber-700 border-amber-200',
    DEPARTMENT_MAPPED: 'bg-blue-50 text-blue-700 border-blue-200',
    COMPLAINT_GENERATED: 'bg-violet-50 text-violet-700 border-violet-200',
    COMPLAINT_SUBMITTED: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    STATUS_CHECKED: 'bg-slate-50 text-slate-700 border-slate-200',
    FOLLOW_UP_INITIATED: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold',
    ESCALATION_INITIATED: 'bg-rose-100 text-rose-900 border-rose-300 font-bold'
  };

  const style = styles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border font-mono tracking-tight ${style}`}>
      {normalized.replace(/_/g, ' ')}
    </span>
  );
};
