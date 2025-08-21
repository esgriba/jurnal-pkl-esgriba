import React from 'react';
import LocationLink from '@/components/ui/LocationLink';
import { MapPin, ExternalLink } from 'lucide-react';

interface LocationDemoProps {
  className?: string;
}

/**
 * Demo component to showcase the LocationLink feature
 * This can be added to admin/guru pages for testing
 */
export default function LocationDemo({ className = '' }: LocationDemoProps) {
  const sampleLocations = [
    {
      id: 1,
      siswa: "Budi Santoso",
      kelas: "XII RPL 1",
      lokasi: "PT Maju Jaya: -6.200000, 106.816666",
      status: "Hadir",
      jam: "08:15",
      description: "Valid coordinates with company name"
    },
    {
      id: 2,
      siswa: "Siti Aminah",
      kelas: "XII RPL 2", 
      lokasi: "-6.914744, 107.609810",
      status: "Hadir",
      jam: "08:20",
      description: "Valid coordinates without prefix"
    },
    {
      id: 3,
      siswa: "Ahmad Rizki",
      kelas: "XII RPL 1",
      lokasi: "Akses lokasi ditolak",
      status: "Hadir", 
      jam: "08:25",
      description: "Plain text - no clickable link"
    },
    {
      id: 4,
      siswa: "Maya Sari",
      kelas: "XII RPL 3",
      lokasi: "Kantor Pusat: -7.257472, 112.752090",
      status: "Hadir",
      jam: "08:30", 
      description: "Surabaya coordinates"
    }
  ];

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Demo Fitur Link Google Maps
        </h3>
        <p className="text-sm text-gray-600">
          Klik pada koordinat lokasi untuk membuka di Google Maps
        </p>
      </div>

      <div className="space-y-4">
        {sampleLocations.map((item) => (
          <div 
            key={item.id} 
            className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{item.siswa}</h4>
                <p className="text-sm text-gray-600">{item.kelas}</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  {item.status}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {item.jam}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Lokasi Absensi:
                </label>
                <LocationLink 
                  locationStr={item.lokasi}
                  showIcon={true}
                  showFullAddress={true}
                  className="mt-1"
                />
              </div>
              
              <div className="text-xs text-gray-500">
                <em>{item.description}</em>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-1">
          <ExternalLink className="h-4 w-4" />
          Cara Kerja Fitur:
        </h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Sistem otomatis mendeteksi koordinat dalam format "lat, lng"</li>
          <li>• Koordinat valid ditampilkan sebagai link yang dapat diklik</li>  
          <li>• Link membuka Google Maps dengan lokasi yang tepat</li>
          <li>• Teks tanpa koordinat ditampilkan biasa tanpa link</li>
        </ul>
      </div>
    </div>
  );
}

// Usage example in a page:
/*
import LocationDemo from '@/components/ui/LocationDemo';

// Add this to your page component
<LocationDemo className="mb-6" />
*/
