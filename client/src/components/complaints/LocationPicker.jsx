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
        <div className={`p-8 rounded-xl border text-center transition-all duration-300 ${displayError ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
          <div className="bg-blue-50 p-3 rounded-full w-fit mx-auto mb-4 border border-blue-200">
            <MapPin className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-slate-600 mb-6 max-w-sm mx-auto">We need your location to accurately route this issue to the responsible department.</p>
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
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex items-start animate-in zoom-in-95 duration-300">
          <div className="flex-shrink-0 bg-emerald-50 p-2 rounded-lg">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="ml-4 w-full">
            <h4 className="text-base font-semibold text-emerald-700 tracking-tight">Location captured successfully</h4>
            <div className="mt-3 text-sm text-blue-800 bg-blue-50/50 px-4 py-3 rounded-lg font-mono inline-flex gap-6 border border-blue-100">
              <p className="flex flex-col"><span className="text-slate-500 text-xs mb-1 uppercase tracking-wider">Latitude</span> <span className="text-slate-800 font-medium text-base">{location.latitude.toFixed(6)}</span></p>
              <p className="flex flex-col"><span className="text-slate-500 text-xs mb-1 uppercase tracking-wider">Longitude</span> <span className="text-slate-800 font-medium text-base">{location.longitude.toFixed(6)}</span></p>
            </div>
            <div className="mt-4">
              <button 
                type="button" 
                onClick={handleGetLocation} 
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none transition-colors group"
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
