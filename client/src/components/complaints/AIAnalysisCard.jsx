import React from 'react';

const AIAnalysisCard = ({ issueType, confidence }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-4 border border-gray-100">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">AI Complaint Analysis</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="block text-sm font-medium text-gray-500">Issue Type</span>
          <span className="block mt-1 text-base font-semibold text-gray-900">{issueType || 'Uncategorized'}</span>
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-500">Confidence</span>
          <span className="block mt-1 text-base font-semibold text-blue-600">
            {confidence ? `${(confidence * 100).toFixed(0)}%` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisCard;
