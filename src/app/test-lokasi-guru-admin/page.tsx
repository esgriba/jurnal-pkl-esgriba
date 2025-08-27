"use client";

import { useState } from "react";
import { CheckCircle, XCircle, AlertCircle, MapPin, ExternalLink, Calendar, Users, Clock } from "lucide-react";
import LocationLink, { LocationBadge, LocationLinkSimple } from "@/components/ui/LocationLink";

export default function TestLokasiGuruAdminPage() {
  // Sample data untuk demo
  const [attendanceData] = useState([
    {
      id_absensi: 1,
      nisn: "2024001",
      nama_siswa: "Ahmad Rizki",
      kelas: "XII RPL",
      lokasi: "-7.250445,112.768845",
      nama_dudi: "PT. Digital Solutions",
      status: "Hadir",
      jam_absensi: "07:30:00",
      tanggal: "2025-01-15"
    },
    {
      id_absensi: 2,
      nisn: "2024002", 
      nama_siswa: "Siti Nurhaliza",
      kelas: "XII TKJ",
      lokasi: "-6.914744,107.609810",
      nama_dudi: "CV. Tech Indo",
      status: "Sakit",
      jam_absensi: "08:00:00", 
      tanggal: "2025-01-15"
    },
    {
      id_absensi: 3,
      nisn: "2024003",
      nama_siswa: "Budi Santoso", 
      kelas: "XII MM",
      lokasi: "Alamat lengkap tanpa koordinat",
      nama_dudi: "UD. Media Kreatif",
      status: "Izin",
      jam_absensi: "09:00:00",
      tanggal: "2025-01-15" 
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Hadir":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "Sakit":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "Izin":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hadir":
        return "bg-green-100 text-green-800";
      case "Sakit":
        return "bg-red-100 text-red-800";
      case "Izin":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Demo: Tampilan Lokasi untuk Guru & Admin
        </h1>
        
        {/* Component Showcase */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              LocationLink (Default)
            </h3>
            <div className="space-y-3">
              <LocationLink 
                locationStr="-7.250445,112.768845"
                showIcon={true}
              />
              <LocationLink 
                locationStr="Alamat tanpa koordinat"
                showIcon={true}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              LocationBadge
            </h3>
            <div className="space-y-3">
              <LocationBadge locationStr="-7.250445,112.768845" />
              <LocationBadge locationStr="Alamat tanpa koordinat" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              LocationLinkSimple
            </h3>
            <div className="space-y-3">
              <LocationLinkSimple locationStr="-7.250445,112.768845" />
              <LocationLinkSimple locationStr="Alamat tanpa koordinat" />
            </div>
          </div>
        </div>

        {/* Guru Dashboard Style */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Users className="h-6 w-6 mr-2 text-blue-600" />
            Tampilan Halaman Guru - Data Absensi Siswa
          </h3>
          
          <div className="grid gap-4">
            {attendanceData.map((attendance) => (
              <div key={attendance.id_absensi} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(attendance.status)}
                    <div>
                      <div className="font-semibold text-gray-900">
                        {attendance.nama_siswa}
                      </div>
                      <div className="text-sm text-gray-600">
                        {attendance.kelas} • {attendance.nisn}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(attendance.status)}`}>
                      {attendance.status}
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {attendance.jam_absensi}
                    </div>
                    <div className="text-xs text-gray-500">
                      {attendance.tanggal}
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <LocationBadge locationStr={attendance.lokasi} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Table Style */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Calendar className="h-6 w-6 mr-2" />
              Tampilan Halaman Admin - Tabel Absensi
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Siswa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Lokasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    DUDI
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                {attendanceData.map((attendance) => (
                  <tr key={attendance.id_absensi} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(attendance.status)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {attendance.nama_siswa}
                          </div>
                          <div className="text-sm text-gray-500">
                            {attendance.kelas} • {attendance.nisn}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(attendance.status)}`}>
                        {attendance.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {attendance.jam_absensi}
                      </div>
                      <div className="text-sm text-gray-500">
                        {attendance.tanggal}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <LocationLink
                        locationStr={attendance.lokasi}
                        showIcon={true}
                        showFullAddress={false}
                        className="max-w-xs"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {attendance.nama_dudi}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mt-8">
          <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-4">
            ✅ Konsistensi di Semua Role:
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-green-900/10 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                👨‍🎓 Siswa
              </h4>
              <ul className="text-green-700 dark:text-green-300 text-sm space-y-1">
                <li>• Tombol "Lihat Lokasi" saat absen</li>
                <li>• Tombol di hasil absensi</li>
                <li>• Desain yang user-friendly</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-green-900/10 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                👨‍🏫 Guru
              </h4>
              <ul className="text-green-700 dark:text-green-300 text-sm space-y-1">
                <li>• Badge "Lihat Lokasi" di card siswa</li>
                <li>• Konsisten dengan tema biru</li>
                <li>• Mudah diidentifikasi</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-green-900/10 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                👩‍💼 Admin
              </h4>
              <ul className="text-green-700 dark:text-green-300 text-sm space-y-1">
                <li>• Tombol di tabel data</li>
                <li>• Kompak untuk tabel</li>
                <li>• Tetap fungsional</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-8">
          <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
            🔧 Detail Teknis:
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                Komponen yang Diupdate:
              </h4>
              <ul className="text-blue-800 dark:text-blue-300 text-sm space-y-1">
                <li>• <code>LocationLink</code> - Default component</li>
                <li>• <code>LocationBadge</code> - Badge style</li>
                <li>• <code>LocationLinkSimple</code> - Simple version</li>
                <li>• Auto-detect coordinates vs address</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                Fitur yang Ditingkatkan:
              </h4>
              <ul className="text-blue-800 dark:text-blue-300 text-sm space-y-1">
                <li>• Tombol instead of link text</li>
                <li>• Consistent button styling</li>
                <li>• Better hover effects</li>
                <li>• Fallback untuk lokasi tanpa koordinat</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
