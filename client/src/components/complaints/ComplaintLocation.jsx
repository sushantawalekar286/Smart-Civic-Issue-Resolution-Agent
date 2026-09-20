import React from 'react';
import { MapPin, Map } from 'lucide-react';

const ComplaintLocation = ({ location }) => {
  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-indigo-300">
        <MapPin className="w-8 h-8 opacity-50 mb-2" />
        <p className="text-sm font-medium">Location not provided.</p>
      </div>
    );
  }

  const { latitude, longitude, address } = location;

  return (
    <div className="bg-white/5 rounded-xl p-5 border border-white/10 backdrop-blur-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0 bg-indigo-500/20 p-2 rounded-lg mr-4">
          <MapPin className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          {address && (
            <p className="text-sm font-semibold text-white mb-2">{address}</p>
          )}
          <div className="text-xs text-indigo-300/80 font-mono bg-black/20 inline-block px-3 py-1.5 rounded-lg border border-white/5">
            <span className="text-indigo-400">Lat:</span> {latitude.toFixed(6)}, <span className="text-indigo-400">Lng:</span> {longitude.toFixed(6)}
          </div>
        </div>
      </div>
      
      {/* Simple Map Placeholder */}
      <div className="mt-5 bg-black/40 h-40 rounded-xl flex items-center justify-center border border-white/5 overflow-hidden relative group">
        <div className="absolute inset-0 bg-indigo-900/20 group-hover:bg-indigo-900/40 transition-colors"></div>
        <p className="text-sm text-indigo-300/60 flex flex-col items-center relative z-10 font-medium">
          <Map className="h-8 w-8 text-indigo-400/50 mb-2 group-hover:scale-110 transition-transform duration-300" />
          Map View Disabled (No API Key)
        </p>
      </div>
    </div>
  );
};

export default ComplaintLocation;
