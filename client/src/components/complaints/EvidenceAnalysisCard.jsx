import React from 'react';

const EvidenceAnalysisCard = ({ evidenceAnalysis, locationAnalysis }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-4 border border-gray-100">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Evidence & Location</h3>
      
      <div className="mb-4">
        <span className="block text-sm font-medium text-gray-500 mb-1">Evidence Analysis</span>
        <p className="text-sm text-gray-800">{evidenceAnalysis?.summary || 'No evidence analysis provided.'}</p>
        
        {evidenceAnalysis?.findings && evidenceAnalysis.findings.length > 0 && (
          <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
            {evidenceAnalysis.findings.map((finding, index) => (
              <li key={index}>{finding}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <span className="block text-sm font-medium text-gray-500 mb-1">Location Analysis</span>
        <p className="text-sm text-gray-800">{locationAnalysis?.summary || 'No location analysis provided.'}</p>
      </div>
    </div>
  );
};

export default EvidenceAnalysisCard;
