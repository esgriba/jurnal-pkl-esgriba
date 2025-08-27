"use client";

import { useState } from "react";
import { MapPin, ExternalLink, CheckCircle } from "lucide-react";

export default function TestLokasiPage() {
  const [coordinates] = useState({ lat: -7.250445, lng: 112.768845 });
  const [locationAddress] = useState("Jl. Raya Banyuputih No.123, Banyuputih, Situbondo, Jawa Timur");
  const [todayAbsensi] = useState({
    status: "Hadir",
    jam_absensi: "07:30:00",
    lokasi: "-7.250445,112.768845"
  });

  const openGoogleMaps = () => {
    if (coordinates) {
      const url = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
      window.open(url, "_blank");
    }
  };

  const openAbsensiLocation = () => {
    const locationText = todayAbsensi.lokasi;
    if (locationText && locationText.includes(',') && !locationText.includes(' ')) {
      // If it looks like coordinates (contains comma but no spaces)
      const url = `https://www.google.com/maps?q=${locationText}`;
      window.open(url, "_blank");
    } else {
      // If it's an address, search for it
      const url = `https://www.google.com/maps/search/${encodeURIComponent(locationText)}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Demo: Tampilan Lokasi Baru
        </h1>
        
        {/* Before/After Comparison */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Before */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-red-600 mb-4 text-center">
              ❌ Sebelum (Koordinat Membingungkan)
            </h3>
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border-2 border-gray-200">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    -7.250445, 112.768845
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    Klik untuk buka di Google Maps
                    <ExternalLink className="h-3 w-3" />
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 text-center text-sm text-red-600">
              😵 Membingungkan! Angka-angka koordinat tidak informatif
            </div>
          </div>

          {/* After */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-green-600 mb-4 text-center">
              ✅ Sesudah (Tombol Jelas)
            </h3>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Lokasi Terdeteksi
                    </p>
                    <p className="text-sm text-gray-600">
                      Lokasi Anda berhasil diidentifikasi
                    </p>
                  </div>
                </div>
                <button
                  onClick={openGoogleMaps}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Lihat Lokasi
                </button>
              </div>
            </div>
            <div className="mt-3 text-center text-sm text-green-600">
              😊 Jelas! Tombol yang mudah dipahami
            </div>
          </div>
        </div>

        {/* Current Location Demo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            🎯 Tampilan Saat Mengatur Lokasi
          </h3>
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 rounded-t-xl">
            <div className="flex items-center">
              <MapPin className="h-6 w-6 text-white mr-3" />
              <h4 className="text-lg font-semibold text-white">Lokasi Anda</h4>
            </div>
          </div>
          <div className="p-6 border-x border-b border-gray-200 rounded-b-xl">
            <div className="space-y-4">
              {/* New Location Display */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Lokasi Terdeteksi
                      </p>
                      <p className="text-sm text-gray-600">
                        Lokasi Anda berhasil diidentifikasi
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={openGoogleMaps}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Lihat Lokasi
                  </button>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-l-4 border-blue-500">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">
                      📍 Alamat Lengkap:
                    </p>
                    <p className="text-blue-800 leading-relaxed">
                      {locationAddress}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Result Demo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            📋 Tampilan Hasil Absensi
          </h3>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 rounded-t-xl">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-white mr-3" />
              <h4 className="text-lg font-semibold text-white">Absensi Hari Ini</h4>
            </div>
          </div>
          <div className="p-6 border-x border-b border-gray-200 rounded-b-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Status:</span>
                  <span className="px-4 py-2 rounded-full text-sm font-semibold text-green-600 bg-green-100">
                    {todayAbsensi.status}
                  </span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Waktu:</span>
                  <span className="font-semibold text-gray-900">
                    {todayAbsensi.jam_absensi}
                  </span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Lokasi:</span>
                  <button
                    onClick={openAbsensiLocation}
                    className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Lihat Lokasi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-8">
          <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
            🎉 Keuntungan Perubahan Ini:
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="bg-green-100 p-1 rounded-full mt-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-blue-800 dark:text-blue-300">
                  <strong>User Friendly:</strong> Tombol jelas dan mudah dipahami
                </span>
              </div>
              <div className="flex items-start gap-2">
                <div className="bg-green-100 p-1 rounded-full mt-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-blue-800 dark:text-blue-300">
                  <strong>Tidak Membingungkan:</strong> Tidak ada angka koordinat yang rumit
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="bg-green-100 p-1 rounded-full mt-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-blue-800 dark:text-blue-300">
                  <strong>Konsisten:</strong> Semua lokasi menggunakan tombol yang sama
                </span>
              </div>
              <div className="flex items-start gap-2">
                <div className="bg-green-100 p-1 rounded-full mt-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-blue-800 dark:text-blue-300">
                  <strong>Fungsional:</strong> Tetap bisa buka Google Maps dengan mudah
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
