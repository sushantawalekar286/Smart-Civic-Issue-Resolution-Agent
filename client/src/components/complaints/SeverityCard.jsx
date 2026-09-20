import React from 'react';

const SeverityCard = ({ severity }) => {
  const getSeverityColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL': return 'text-red-700 bg-red-100';
      case 'HIGH': return 'text-orange-700 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-700 bg-yellow-100';
      case 'LOW': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-4 border border-gray-100">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Severity Assessment</h3>
      <div className="mb-3">
        <span className="block text-sm font-medium text-gray-500 mb-2">Level</span>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(severity?.level)}`}>
          {severity?.level || 'UNKNOWN'}
        </span>
      </div>
      <div>
        <span className="block text-sm font-medium text-gray-500 mb-1">Reasoning</span>
        <p className="text-sm text-gray-800">{severity?.reason || 'No reasoning provided.'}</p>
      </div>
    </div>
  );
};

export default SeverityCard;
