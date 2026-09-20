import React from 'react';
import { ActionTypeBadge } from './AdminBadges';

const ComplaintAgentTimeline = ({ actions = [], loading = false }) => {
  if (loading) {
    return (
      <div className="py-8 text-center text-slate-500 text-sm">
        Loading agent action timeline...
      </div>
    );
  }

  if (!actions || actions.length === 0) {
    return (
      <div className="py-6 text-center text-slate-500 text-sm bg-slate-50 rounded-lg border border-slate-200">
        No autonomous agent actions recorded for this complaint yet.
      </div>
    );
  }

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'INPUT_RECEIVED': return '📥';
      case 'ISSUE_CLASSIFIED': return '🏷️';
      case 'EVIDENCE_ANALYZED': return '🔍';
      case 'LOCATION_ANALYZED': return '📍';
      case 'SEVERITY_ASSESSED': return '⚖️';
      case 'DEPARTMENT_MAPPED': return '🏛️';
      case 'COMPLAINT_GENERATED': return '📝';
      case 'COMPLAINT_SUBMITTED': return '✅';
      case 'STATUS_CHECKED': return '⏱️';
      case 'FOLLOW_UP_INITIATED': return '🔔';
      case 'ESCALATION_INITIATED': return '🚨';
      default: return '🤖';
    }
  };

  return (
    <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 my-4">
      {actions.map((action, idx) => (
        <div key={action._id || idx} className="relative group">
          {/* Node dot with icon */}
          <div className="absolute -left-[35px] top-0 flex items-center justify-center w-7 h-7 rounded-full bg-white border-2 border-indigo-500 text-sm shadow-xs">
            {getActionIcon(action.actionType)}
          </div>

          {/* Action details card */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center space-x-2">
                <ActionTypeBadge actionType={action.actionType} />
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(action.timestamp).toLocaleString()}
              </span>
            </div>

            {action.reason && (
              <p className="text-xs text-slate-600 mb-1">
                <span className="font-semibold text-slate-700">Reason: </span>
                {action.reason}
              </p>
            )}

            {action.result && (
              <p className="text-xs text-slate-800 bg-slate-50 p-2 rounded border border-slate-100 font-mono">
                <span className="font-semibold text-slate-900">Result: </span>
                {action.result}
              </p>
            )}

            {action.metadata && Object.keys(action.metadata).length > 0 && (
              <details className="mt-2 text-[11px] text-slate-500">
                <summary className="cursor-pointer text-indigo-600 hover:text-indigo-800 font-medium select-none">
                  View Technical Metadata
                </summary>
                <pre className="mt-1 p-2 bg-slate-900 text-emerald-400 rounded overflow-x-auto text-[10px] font-mono">
                  {JSON.stringify(action.metadata, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComplaintAgentTimeline;
