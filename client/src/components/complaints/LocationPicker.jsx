import React, { useState } from 'react';
import { MapPin, Target, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
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
        setLocalError('Unable to retrieve your location. Please check browser permissions.');
        setLoading(false);
      }
    );
  };

  const displayError = error || localError;

  return (
    <div className="mb-6">
      {!location ? (
        <div className={`p-8 rounded-xl border text-center backdrop-blur-sm transition-all duration-300 ${displayError ? 'bg-rose-500/5 border-rose-500/30' : 'bg-white/5 border-white/20'}`}>
          <div className="bg-indigo-500/20 p-3 rounded-full w-fit mx-auto mb-4 border border-indigo-500/30">
            <MapPin className="h-8 w-8 text-indigo-400" />
          </div>
          <p className="text-gray-300 mb-6 max-w-sm mx-auto">We need your location to accurately route this issue to the responsible department.</p>
          <GlassButton 
            onClick={handleGetLocation} 
            loading={loading}
            className="flex items-center gap-2 mx-auto transition-transform hover:scale-105 active:scale-95"
          >
            <Target className="w-4 h-4" />
            {loading ? 'Locating...' : 'Use Current Location'}
          </GlassButton>
        </div>
      ) : (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-5 flex items-start backdrop-blur-sm animate-in zoom-in-95 duration-300">
          <div className="flex-shrink-0 bg-emerald-500/20 p-2 rounded-lg">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="ml-4 w-full">
            <h4 className="text-base font-semibold text-emerald-300 tracking-tight">Location captured successfully</h4>
            <div className="mt-3 text-sm text-indigo-300/80 bg-black/20 px-4 py-3 rounded-lg font-mono inline-flex gap-6 border border-white/5">
              <p className="flex flex-col"><span className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Latitude</span> <span className="text-white text-base">{location.latitude.toFixed(6)}</span></p>
              <p className="flex flex-col"><span className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Longitude</span> <span className="text-white text-base">{location.longitude.toFixed(6)}</span></p>
            </div>
            <div className="mt-4">
              <button 
                type="button" 
                onClick={handleGetLocation} 
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 focus:outline-none transition-colors group"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Updating...' : 'Update Location'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {displayError && (
        <div className="mt-3 flex items-start gap-2 text-rose-400 animate-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{displayError}</p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
