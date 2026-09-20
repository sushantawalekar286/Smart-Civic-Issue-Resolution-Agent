import React from 'react';
import { useNavigate } from 'react-router-dom';

const ComplaintReviewActions = ({ onConfirm, isSubmitting }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    // Navigates back to the report page for editing
    // We could ideally pass state back, but for simplicity, we just navigate.
    navigate('/citizen/report');
  };

  return (
    <div className="flex items-center justify-between mt-8 border-t pt-4">
      <button
        type="button"
        onClick={handleEdit}
        disabled={isSubmitting}
        className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        Edit Complaint
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isSubmitting}
        className="px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </>
        ) : (
          'Confirm & Submit'
        )}
      </button>
    </div>
  );
};

export default ComplaintReviewActions;
