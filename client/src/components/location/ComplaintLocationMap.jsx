import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, AlertCircle } from 'lucide-react';

// Leaflet marker icon configuration for Vite builds
const defaultIcon = typeof L !== 'undefined' && L.icon ? L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
}) : null;

// Helper component to invalidate Leaflet map container sizing when loaded inside dynamic cards
function MapInvalidate({ center }) {
  const map = useMap();
  useEffect(() => {
    if (map && center) {
      const timer = setTimeout(() => {
        map.invalidateSize();
        map.setView([center.lat, center.lng], 15);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [map, center]);
  return null;
}

/**
 * ComplaintLocationMap
 * Reusable read-only OpenStreetMap + Leaflet map component for viewing complaint location.
 */
const ComplaintLocationMap = ({ 
  location, 
  latitude, 
  longitude, 
  address, 
  height = "250px", 
  className = "" 
}) => {
  const rawLat = location?.latitude ?? latitude;
  const rawLng = location?.longitude ?? longitude;
  const locAddress = location?.address || address || "";

  const hasCoordinates = typeof rawLat !== 'undefined' && rawLat !== null && 
                         typeof rawLng !== 'undefined' && rawLng !== null;

  const lat = Number(rawLat);
  const lng = Number(rawLng);

  const isValidRange = !isNaN(lat) && lat >= -90 && lat <= 90 && !isNaN(lng) && lng >= -180 && lng <= 180;
  const isNonZero = lat !== 0 || lng !== 0;

  if (!hasCoordinates || !isNonZero) {
    return (
      <div className={`bg-slate-50 border border-slate-200 rounded-xl p-5 text-center text-slate-500 ${className}`}>
        <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-700">Location coordinates are unavailable for this complaint.</p>
        {locAddress && <p className="text-xs text-slate-500 mt-1">{locAddress}</p>}
      </div>
    );
  }

  if (!isValidRange) {
    return (
      <div className={`bg-rose-50 border border-rose-200 rounded-xl p-5 text-center text-rose-700 ${className}`}>
        <AlertCircle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
        <p className="text-xs font-semibold">Invalid complaint location.</p>
        <div className="text-[11px] font-mono mt-1 text-rose-600">
          Lat: {String(rawLat)}, Lng: {String(rawLng)}
        </div>
        {locAddress && <p className="text-xs text-slate-600 mt-1">{locAddress}</p>}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {locAddress && (
        <p className="text-xs font-semibold text-slate-800 flex items-start gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{locAddress}</span>
        </p>
      )}

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative z-0" style={{ height }}>
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          scrollWheelZoom={false}
          dragging={true}
          doubleClickZoom={false}
          style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapInvalidate center={{ lat, lng }} />
          <Marker position={[lat, lng]} icon={defaultIcon} />
        </MapContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">
        <div>
          <span className="text-slate-500 font-sans">Latitude:</span> <strong className="text-slate-800">{lat.toFixed(6)}</strong>
        </div>
        <div>
          <span className="text-slate-500 font-sans">Longitude:</span> <strong className="text-slate-800">{lng.toFixed(6)}</strong>
        </div>
      </div>
    </div>
  );
};

export default ComplaintLocationMap;
