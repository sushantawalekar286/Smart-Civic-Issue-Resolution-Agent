import React from 'react';

const SeverityBadge = ({ severity }) => {
  if (!severity) return null;

  let colorClasses = "bg-gray-100 text-gray-800";
  
  switch (severity.toUpperCase()) {
    case 'LOW':
      colorClasses = "bg-green-100 text-green-800";
      break;
    case 'MEDIUM':
      colorClasses = "bg-yellow-100 text-yellow-800";
      break;
    case 'HIGH':
      colorClasses = "bg-orange-100 text-orange-800";
      break;
    case 'CRITICAL':
      colorClasses = "bg-red-100 text-red-800 font-bold";
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${colorClasses}`}>
      {severity}
    </span>
  );
};

export default SeverityBadge;
