import React from 'react';

const InputSummary = ({ description, file, location, onEdit, onSubmit, isSubmitting }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50 border-b border-gray-200">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Review Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Ensure everything is correct before analysis.</p>
        </div>
        <button 
          onClick={onEdit} 
          disabled={isSubmitting}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Edit Details
        </button>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <p className="whitespace-pre-wrap">{description}</p>
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
            <dt className="text-sm font-medium text-gray-500">Evidence</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {file ? (
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <span>1 image uploaded ({file.name})</span>
                </div>
              ) : (
                <span className="text-gray-500 italic">No evidence uploaded</span>
              )}
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Location</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {location ? (
                <div>
                   <p>Latitude: <span className="font-mono">{location.latitude.toFixed(6)}</span></p>
                   <p>Longitude: <span className="font-mono">{location.longitude.toFixed(6)}</span></p>
                </div>
              ) : (
                <span className="text-gray-500 italic">No location provided</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
      
      <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end">
        <button 
          onClick={onSubmit} 
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Analyzing...' : 'Analyze Complaint'}
        </button>
      </div>
    </div>
  );
};

export default InputSummary;
