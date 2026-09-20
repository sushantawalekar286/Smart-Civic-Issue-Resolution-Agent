import React, { useState } from 'react';

const LocationPicker = ({ location, onLocationSelect, error }) => {
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleGetLocation = () => {
    setLoading(true);
    setLocalError('');

    if (!navigator.geolocation) {
      setLocalError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationSelect({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoading(false);
      },
      (err) => {
        setLocalError('Unable to retrieve your location');
        setLoading(false);
      }
    );
  };

  return (
    <div className="mb-6">
      {!location ? (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <button 
            type="button" 
            onClick={handleGetLocation} 
            disabled={loading} 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {loading ? 'Locating...' : 'Use Current Location'}
          </button>
        </div>
      ) : (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5 flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 w-full">
            <h4 className="text-sm font-medium text-indigo-900">Location captured</h4>
            <div className="mt-2 text-sm text-indigo-700">
              <p>Latitude: <span className="font-mono">{location.latitude.toFixed(6)}</span></p>
              <p>Longitude: <span className="font-mono">{location.longitude.toFixed(6)}</span></p>
            </div>
            <div className="mt-4">
              <button 
                type="button" 
                onClick={handleGetLocation} 
                className="inline-flex items-center text-sm font-medium text-indigo-700 hover:text-indigo-600 focus:outline-none"
              >
                Update Location
              </button>
            </div>
          </div>
        </div>
      )}
      
      {(error || localError) && (
        <p className="mt-2 text-sm text-red-600">{error || localError}</p>
      )}
    </div>
  );
};

export default LocationPicker;
