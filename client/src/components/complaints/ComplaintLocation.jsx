import React from 'react';

const ComplaintLocation = ({ location }) => {
  if (!location) {
    return <div className="text-gray-500 italic text-sm">Location not provided.</div>;
  }

  const { latitude, longitude, address } = location;

  return (
    <div className="bg-gray-50 rounded p-4 border border-gray-200">
      <div className="flex items-start">
        <svg className="flex-shrink-0 h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <div>
          {address && (
            <p className="text-sm font-medium text-gray-900 mb-1">{address}</p>
          )}
          <p className="text-xs text-gray-500 font-mono bg-white inline-block px-2 py-1 rounded border border-gray-200">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        </div>
      </div>
      
      {/* Simple Map Placeholder - avoid complex GIS for hackathon MVP unless API keys are provided */}
      <div className="mt-4 bg-gray-200 h-32 rounded flex items-center justify-center border border-gray-300">
        <p className="text-sm text-gray-500 flex flex-col items-center">
          <svg className="h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Map View Disabled (No API Key)
        </p>
      </div>
    </div>
  );
};

export default ComplaintLocation;
