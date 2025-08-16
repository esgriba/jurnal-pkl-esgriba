// Geocoding utilities with multiple fallback services
export interface GeocodingResult {
  address: string;
  success: boolean;
  service?: string;
}

// Fallback geocoding services
const GEOCODING_SERVICES = {
  nominatim: {
    url: (lat: number, lng: number) => 
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
    headers: {
      'User-Agent': 'JurnalPKL/1.0 (Educational Purpose)',
    },
    parser: (data: any) => data?.display_name || null,
  },
  
  locationiq: {
    // Alternative service (requires API key in production)
    url: (lat: number, lng: number) => 
      `https://us1.locationiq.com/v1/reverse.php?key=YOUR_API_KEY&lat=${lat}&lon=${lng}&format=json`,
    headers: {},
    parser: (data: any) => data?.display_name || null,
  },
};

export async function getAddressFromCoordinates(
  lat: number, 
  lng: number, 
  timeout = 8000
): Promise<GeocodingResult> {
  
  // First try Nominatim (free service)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(
      GEOCODING_SERVICES.nominatim.url(lat, lng),
      {
        signal: controller.signal,
        headers: GEOCODING_SERVICES.nominatim.headers,
      }
    );
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const address = GEOCODING_SERVICES.nominatim.parser(data);
      
      if (address) {
        return {
          address,
          success: true,
          service: 'nominatim',
        };
      }
    }
  } catch (error) {
    console.warn('Nominatim geocoding failed:', error);
  }

  // If all services fail, return coordinates as fallback
  const fallbackAddress = `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  
  return {
    address: fallbackAddress,
    success: false,
    service: 'fallback',
  };
}

// Validate coordinates
export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' && 
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    !isNaN(lat) && !isNaN(lng)
  );
}

// Format coordinates for display
export function formatCoordinates(lat: number, lng: number, precision = 6): string {
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
}
