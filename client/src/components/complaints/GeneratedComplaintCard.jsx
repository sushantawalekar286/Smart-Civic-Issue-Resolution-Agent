import React from 'react';

const GeneratedComplaintCard = ({ generatedComplaint }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-4 border border-gray-100">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Generated Official Complaint</h3>
      <div className="bg-gray-50 p-4 rounded border border-gray-200">
        <p className="text-sm text-gray-800 whitespace-pre-wrap font-serif">
          {generatedComplaint || 'No official complaint text generated.'}
        </p>
      </div>
    </div>
  );
};

export default GeneratedComplaintCard;
