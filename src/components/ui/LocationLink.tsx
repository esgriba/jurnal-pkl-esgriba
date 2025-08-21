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

  // If coordinates are available, show as clickable link
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && <MapPin className="h-4 w-4 text-blue-500" />}
      <a
        href={locationData.googleMapsUrl!}
        target={target}
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline text-sm transition-colors"
        title="Buka lokasi di Google Maps"
      >
        <span>
          {showFullAddress && locationData.originalText !== locationData.displayText 
            ? locationData.originalText 
            : locationData.displayText}
        </span>
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

/**
 * Simplified version that just returns the link without wrapper div
 */
export function LocationLinkSimple({ 
  locationStr, 
  className = 'text-blue-600 hover:text-blue-800 hover:underline',
  target = '_blank' 
}: Pick<LocationLinkProps, 'locationStr' | 'className' | 'target'>) {
  const locationData = getLocationDisplay(locationStr);
  
  if (!locationData.hasCoordinates) {
    return (
      <span className="text-gray-600 text-sm">
        {locationData.displayText}
      </span>
    );
  }

  return (
    <a
      href={locationData.googleMapsUrl!}
      target={target}
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 ${className} text-sm transition-colors`}
      title="Buka lokasi di Google Maps"
    >
      {locationData.displayText}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

/**
 * Badge version for status displays
 */
export function LocationBadge({ 
  locationStr, 
  className = '' 
}: Pick<LocationLinkProps, 'locationStr' | 'className'>) {
  const locationData = getLocationDisplay(locationStr);
  
  if (!locationData.hasCoordinates) {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 ${className}`}>
        <MapPin className="h-3 w-3 mr-1" />
        Lokasi tidak tersedia
      </span>
    );
  }

  return (
    <a
      href={locationData.googleMapsUrl!}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors ${className}`}
      title="Buka lokasi di Google Maps"
    >
      <MapPin className="h-3 w-3 mr-1" />
      Lihat Lokasi
      <ExternalLink className="h-3 w-3 ml-1" />
    </a>
  );
}
