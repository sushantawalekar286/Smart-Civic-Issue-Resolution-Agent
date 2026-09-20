import React, { useState } from 'react';
import { MapPin, Target, RefreshCw } from 'lucide-react';
import GlassButton from '../ui/GlassButton';

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
        <div className="bg-white/5 p-8 rounded-xl border border-white/20 text-center backdrop-blur-sm">
          <div className="bg-indigo-500/20 p-3 rounded-full w-fit mx-auto mb-4 border border-indigo-500/30">
            <MapPin className="h-8 w-8 text-indigo-400" />
          </div>
          <p className="text-gray-300 mb-6 max-w-sm mx-auto">We need your location to accurately route this issue to the responsible department.</p>
          <GlassButton 
            onClick={handleGetLocation} 
            loading={loading}
            className="flex items-center gap-2 mx-auto"
          >
            <Target className="w-4 h-4" />
            {loading ? 'Locating...' : 'Use Current Location'}
          </GlassButton>
        </div>
      ) : (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-5 flex items-start backdrop-blur-sm">
          <div className="flex-shrink-0 bg-indigo-500/20 p-2 rounded-lg">
            <MapPin className="h-6 w-6 text-indigo-400" />
          </div>
          <div className="ml-4 w-full">
            <h4 className="text-base font-semibold text-indigo-200 tracking-tight">Location captured</h4>
            <div className="mt-2 text-sm text-indigo-300/80 bg-black/20 p-3 rounded-lg font-mono inline-block">
              <p>Lat: <span className="text-white">{location.latitude.toFixed(6)}</span></p>
              <p>Lng: <span className="text-white">{location.longitude.toFixed(6)}</span></p>
            </div>
            <div className="mt-4">
              <button 
                type="button" 
                onClick={handleGetLocation} 
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 focus:outline-none transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Update Location
              </button>
            </div>
          </div>
        </div>
      )}
      
      {(error || localError) && (
        <p className="mt-2 text-sm text-rose-400 font-medium">{error || localError}</p>
      )}
    </div>
  );
};

export default LocationPicker;
