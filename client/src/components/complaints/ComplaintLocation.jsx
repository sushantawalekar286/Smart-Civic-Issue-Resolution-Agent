import React from 'react';
import { MapPin, Map } from 'lucide-react';

const ComplaintLocation = ({ location }) => {
  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
        <MapPin className="w-8 h-8 opacity-50 mb-2" />
        <p className="text-sm font-medium">Location not provided.</p>
      </div>
    );
  }

  const { latitude, longitude, address } = location;

  return (
    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
      <div className="flex items-start">
        <div className="flex-shrink-0 bg-blue-100 p-2 rounded-lg mr-4">
          <MapPin className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          {address && (
            <p className="text-sm font-semibold text-slate-800 mb-2">{address}</p>
          )}
          <div className="text-xs text-slate-700 font-mono bg-blue-50/50 inline-block px-3 py-1.5 rounded-lg border border-blue-200">
            <span className="text-blue-600">Lat:</span> {latitude.toFixed(6)}, <span className="text-blue-600">Lng:</span> {longitude.toFixed(6)}
          </div>
        </div>
      </div>
      
      {/* Simple Map Placeholder */}
      <div className="mt-5 bg-slate-100 h-40 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden relative group">
        <div className="absolute inset-0 bg-blue-50/50 group-hover:bg-blue-100/50 transition-colors"></div>
        <p className="text-sm text-slate-500 flex flex-col items-center relative z-10 font-medium">
          <Map className="h-8 w-8 text-blue-300 mb-2 group-hover:scale-110 transition-transform duration-300" />
          Map View Disabled (No API Key)
        </p>
      </div>
    </div>
  );
};

export default ComplaintLocation;
