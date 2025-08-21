/**
 * Utility functions for handling location data and Google Maps integration
 */

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

/**
 * Parse location string to extract coordinates
 * Supports various formats:
 * - "lat, lng" (simple coordinate string)
 * - "Location Name: lat, lng"
 * - Just coordinate numbers separated by comma
 */
export function parseLocationString(locationStr: string): LocationCoordinates | null {
  if (!locationStr || typeof locationStr !== 'string') {
    return null;
  }

  // Remove any location name prefix (e.g., "Test Location: ")
  const cleanLocation = locationStr.includes(':') 
    ? locationStr.split(':')[1].trim() 
    : locationStr.trim();

  // Split by comma and try to parse coordinates
  const parts = cleanLocation.split(',').map(part => part.trim());
  
  if (parts.length >= 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    
    // Validate coordinates
    if (!isNaN(lat) && !isNaN(lng) && 
        lat >= -90 && lat <= 90 && 
        lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }
  
  return null;
}

/**
 * Generate Google Maps URL for given coordinates
 */
export function generateGoogleMapsUrl(coordinates: LocationCoordinates): string {
  const { lat, lng } = coordinates;
  return `https://www.google.com/maps?q=${lat},${lng}&z=16`;
}

/**
 * Generate Google Maps URL from location string
 */
export function getGoogleMapsLinkFromLocation(locationStr: string): string | null {
  const coordinates = parseLocationString(locationStr);
  if (coordinates) {
    return generateGoogleMapsUrl(coordinates);
  }
  return null;
}

/**
 * Check if a location string contains valid coordinates
 */
export function hasValidCoordinates(locationStr: string): boolean {
  return parseLocationString(locationStr) !== null;
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(coordinates: LocationCoordinates): string {
  return `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
}

/**
 * Generate a location display with Google Maps link
 */
export interface LocationDisplayProps {
  locationStr: string;
  className?: string;
  showIcon?: boolean;
}

export function getLocationDisplay(locationStr: string) {
  const coordinates = parseLocationString(locationStr);
  
  if (coordinates) {
    return {
      hasCoordinates: true,
      googleMapsUrl: generateGoogleMapsUrl(coordinates),
      displayText: formatCoordinates(coordinates),
      originalText: locationStr
    };
  }
  
  return {
    hasCoordinates: false,
    googleMapsUrl: null,
    displayText: locationStr || 'Lokasi tidak tersedia',
    originalText: locationStr
  };
}
