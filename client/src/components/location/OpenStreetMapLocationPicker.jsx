import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import GlassButton from '../ui/GlassButton';

// Safe default Leaflet icon definition for React/Vite production builds
const defaultIcon = typeof L !== 'undefined' && L.icon ? L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
}) : null;

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629 // Default to India center
};

function MapClickHandler({ onLocationSelect, setLocalError }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        onLocationSelect({
          latitude: lat,
          longitude: lng
        });
        setLocalError('');
      } else {
        setLocalError('Invalid coordinates selected.');
      }
    }
  });
  return null;
}

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
      map.setView([center.lat, center.lng], map.getZoom() < 13 ? 15 : map.getZoom());
    }
  }, [center, map]);
  return null;
}

const OpenStreetMapLocationPicker = ({ location, onLocationSelect, error }) => {
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [localError, setLocalError] = useState('');

  const currentCenter = location 
    ? { lat: location.latitude, lng: location.longitude }
    : defaultCenter;

  const handleGetLocation = () => {
    setLoadingLocation(true);
    setLocalError('');

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocalError('Geolocation is not supported by your browser');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        onLocationSelect({
          latitude: lat,
          longitude: lng
        });
        setLoadingLocation(false);
      },
      (err) => {
        let msg = 'Unable to retrieve your location.';
        if (err.code === 1) {
          msg = 'Location permission denied. Please click on the map manually or enable location access.';
        } else if (err.code === 2) {
          msg = 'Location unavailable. Please select your position on the map.';
        } else if (err.code === 3) {
          msg = 'Location request timed out. Please try again or click the map.';
        }
        setLocalError(msg);
        setLoadingLocation(false);
      },
      { timeout: 10000 }
    );
  };

  const displayError = error || localError;

  return (
    <div className="mb-6 space-y-4">
      {displayError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm p-3 rounded-lg flex items-start animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{displayError}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <p className="text-sm text-slate-600">
          Click anywhere on the map to set the exact issue location.
        </p>
        <GlassButton 
          type="button"
          onClick={handleGetLocation} 
          loading={loadingLocation}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <Target className="w-4 h-4" />
          {loadingLocation ? 'Locating...' : 'Use My Current Location'}
        </GlassButton>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative z-0 min-h-[300px] h-[320px] sm:h-[350px]">
        <MapContainer 
          center={[currentCenter.lat, currentCenter.lng]} 
          zoom={location ? 15 : 5} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={onLocationSelect} setLocalError={setLocalError} />
          <MapRecenter center={currentCenter} />
          {location && typeof location.latitude === 'number' && typeof location.longitude === 'number' && (
            <Marker position={[location.latitude, location.longitude]} icon={defaultIcon} />
          )}
        </MapContainer>
      </div>

      {location && typeof location.latitude === 'number' && typeof location.longitude === 'number' && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start animate-in zoom-in-95 duration-300">
          <div className="flex-shrink-0 bg-emerald-50 p-2 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="ml-3 w-full">
            <h4 className="text-sm font-semibold text-slate-800">Selected Location</h4>
            <div className="mt-2 text-sm text-slate-600 font-mono flex flex-wrap gap-x-6 gap-y-2">
              <p>Latitude: <span className="text-slate-800 font-semibold">{location.latitude.toFixed(6)}</span></p>
              <p>Longitude: <span className="text-slate-800 font-semibold">{location.longitude.toFixed(6)}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenStreetMapLocationPicker;
