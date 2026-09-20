import React from 'react';

export const StatusBadge = ({ status }) => {
  const styles = {
    SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200',
    ASSIGNED: 'bg-amber-50 text-amber-700 border-amber-200',
    IN_PROGRESS: 'bg-purple-50 text-purple-700 border-purple-200',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ESCALATED: 'bg-rose-50 text-rose-700 border-rose-300 font-semibold'
  };

  const style = styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {status ? status.replace('_', ' ') : 'UNKNOWN'}
    </span>
  );
};

export const SeverityBadge = ({ severity }) => {
  const styles = {
    LOW: 'bg-slate-100 text-slate-700 border-slate-200',
    MEDIUM: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    HIGH: 'bg-orange-50 text-orange-800 border-orange-200',
    CRITICAL: 'bg-red-100 text-red-800 border-red-300 font-bold animate-pulse'
  };

  const style = styles[severity] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${style}`}>
      {severity || 'NORMAL'}
    </span>
  );
};

export const ActionTypeBadge = ({ actionType }) => {
  const styles = {
    INPUT_RECEIVED: 'bg-sky-50 text-sky-700 border-sky-200',
    ISSUE_CLASSIFIED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    EVIDENCE_ANALYZED: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    LOCATION_ANALYZED: 'bg-teal-50 text-teal-700 border-teal-200',
    SEVERITY_ASSESSED: 'bg-amber-50 text-amber-700 border-amber-200',
    DEPARTMENT_MAPPED: 'bg-blue-50 text-blue-700 border-blue-200',
    COMPLAINT_GENERATED: 'bg-violet-50 text-violet-700 border-violet-200',
    COMPLAINT_SUBMITTED: 'bg-green-50 text-green-700 border-green-200',
    STATUS_CHECKED: 'bg-slate-100 text-slate-700 border-slate-200',
    FOLLOW_UP_INITIATED: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold',
    ESCALATION_INITIATED: 'bg-rose-100 text-rose-900 border-rose-300 font-bold'
  };

  const style = styles[actionType] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border font-mono ${style}`}>
      {actionType}
    </span>
  );
};
