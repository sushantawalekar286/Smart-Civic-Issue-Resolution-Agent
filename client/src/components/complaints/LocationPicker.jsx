import React, { useState } from 'react';

const LocationPicker = ({ location, onLocationSelect, error }) => {
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleGetLocation = () => {
    setLoading(true);
    setLocalError('');

    if (!navigator.geolocation) {
      setLocalError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationSelect({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: "" // Address can be reverse-geocoded later
        });
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocalError('Location permission is required to continue.');
        } else {
          setLocalError('Location unavailable. Please try again.');
        }
      }
    );
  };

  return (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', fontWeight: 'bold' }}>
        Use your current location so the responsible authority can identify where the issue is.
      </label>
      
      {!location ? (
        <button type="button" onClick={handleGetLocation} disabled={loading} style={{ marginTop: '5px' }}>
          {loading ? 'Requesting Location...' : 'Use Current Location'}
        </button>
      ) : (
        <div style={{ marginTop: '10px', padding: '10px', background: '#eef' }}>
          <p style={{ margin: '0 0 5px 0', color: 'green' }}>Location captured ✓</p>
          <p style={{ margin: '0' }}>Latitude: {location.latitude.toFixed(6)}</p>
          <p style={{ margin: '0' }}>Longitude: {location.longitude.toFixed(6)}</p>
          <button type="button" onClick={handleGetLocation} style={{ marginTop: '10px' }}>
            Update Location
          </button>
        </div>
      )}

      {(error || localError) && (
        <p style={{ color: 'red', marginTop: '5px', fontSize: '14px' }}>{error || localError}</p>
      )}
    </div>
  );
};

export default LocationPicker;
