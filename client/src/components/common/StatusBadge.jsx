import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  let colorClasses = "bg-gray-100 text-gray-800";
  
  switch (status.toUpperCase()) {
    case 'SUBMITTED':
      colorClasses = "bg-blue-100 text-blue-800";
      break;
    case 'ASSIGNED':
      colorClasses = "bg-yellow-100 text-yellow-800";
      break;
    case 'IN_PROGRESS':
      colorClasses = "bg-purple-100 text-purple-800";
      break;
    case 'RESOLVED':
      colorClasses = "bg-green-100 text-green-800";
      break;
    case 'ESCALATED':
      colorClasses = "bg-red-100 text-red-800";
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${colorClasses}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
