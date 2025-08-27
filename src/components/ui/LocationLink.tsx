import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { getLocationDisplay } from '@/lib/locationUtils';

interface LocationLinkProps {
  locationStr: string;
  className?: string;
  showIcon?: boolean;
  showFullAddress?: boolean;
  target?: '_blank' | '_self';
}

/**
 * Component that displays location with Google Maps link if coordinates are available
 */
export default function LocationLink({ 
  locationStr, 
  className = '', 
  showIcon = true, 
  showFullAddress = false,
  target = '_blank' 
}: LocationLinkProps) {
  const locationData = getLocationDisplay(locationStr);
  
  if (!locationData.hasCoordinates) {
    // If no coordinates, just show the location text without link
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <MapPin className="h-4 w-4 text-gray-400" />}
        <span className="text-gray-600 text-sm">
          {locationData.displayText}
        </span>
      </div>
    );
  }

  // If coordinates are available, show as clickable button
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && <MapPin className="h-4 w-4 text-blue-500" />}
      <button
        onClick={() => {
          window.open(locationData.googleMapsUrl!, target);
        }}
        className="inline-flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        title="Klik untuk buka lokasi di Google Maps"
      >
        <ExternalLink className="h-3 w-3" />
        Lihat Lokasi
      </button>
    </div>
  );
}

/**
 * Simplified version that just returns the button without wrapper div
 */
export function LocationLinkSimple({ 
  locationStr, 
  className = 'bg-blue-100 hover:bg-blue-200 text-blue-800',
  target = '_blank' 
}: Pick<LocationLinkProps, 'locationStr' | 'className' | 'target'>) {
  const locationData = getLocationDisplay(locationStr);
  
  if (!locationData.hasCoordinates) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs bg-gray-100 text-gray-600 font-medium">
        <MapPin className="h-3 w-3 mr-1" />
        Lokasi tidak tersedia
      </span>
    );
  }

  return (
    <button
      onClick={() => {
        window.open(locationData.googleMapsUrl!, target);
      }}
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg ${className} text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md`}
      title="Klik untuk buka lokasi di Google Maps"
    >
      <ExternalLink className="h-3 w-3" />
      Lihat Lokasi
    </button>
  );
}

/**
 * Badge version for status displays - Updated design
 */
export function LocationBadge({ 
  locationStr, 
  className = '' 
}: Pick<LocationLinkProps, 'locationStr' | 'className'>) {
  const locationData = getLocationDisplay(locationStr);
  
  if (!locationData.hasCoordinates) {
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs bg-gray-100 text-gray-600 font-medium ${className}`}>
        <MapPin className="h-3 w-3 mr-1" />
        Lokasi tidak tersedia
      </span>
    );
  }

  return (
    <button
      onClick={() => {
        window.open(locationData.googleMapsUrl!, "_blank");
      }}
      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 transition-all duration-200 font-medium shadow-sm hover:shadow-md ${className}`}
      title="Klik untuk buka lokasi di Google Maps"
    >
      <ExternalLink className="h-3 w-3 mr-1" />
      Lihat Lokasi
    </button>
  );
}
