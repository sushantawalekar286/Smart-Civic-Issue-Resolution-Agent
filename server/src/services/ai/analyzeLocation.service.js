/**
 * Location Analysis Service
 * Builds a structured location summary based solely on supplied coordinates and address.
 * NEVER invents an address if none is provided.
 *
 * @param {Object} location
 * @param {number} [location.latitude]
 * @param {number} [location.longitude]
 * @param {string} [location.address]
 * @returns {{ summary: string }}
 */
function analyzeLocation(location = {}) {
  const { latitude, longitude, address } = location || {};
  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude);
  const cleanAddress = (typeof address === 'string' && address.trim().length > 0) ? address.trim() : '';

  if (cleanAddress && hasCoords) {
    return {
      summary: `Location provided at "${cleanAddress}" (GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}).`
    };
  }

  if (cleanAddress && !hasCoords) {
    return {
      summary: `Address provided as "${cleanAddress}". GPS coordinates were not supplied.`
    };
  }

  if (!cleanAddress && hasCoords) {
    return {
      summary: `GPS coordinates provided (${latitude.toFixed(4)}, ${longitude.toFixed(4)}). No street address was provided with the complaint.`
    };
  }

  return {
    summary: 'Location information was not provided with the complaint.'
  };
}

module.exports = {
  analyzeLocation
};
