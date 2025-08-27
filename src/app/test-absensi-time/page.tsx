"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";

export default function TestAbsensiTimePage() {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentHour, setCurrentHour] = useState<number>(0);
  const [isOutsideAbsensiHours, setIsOutsideAbsensiHours] = useState(false);
  const [testHour, setTestHour] = useState<number>(7);

  // Update real time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const jakartaTime = now.toLocaleTimeString("id-ID", {
        timeZone: "Asia/Jakarta",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      
      const nowWIB = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      const hour = nowWIB.getHours();
      
      setCurrentTime(jakartaTime);
      setCurrentHour(hour);
      setIsOutsideAbsensiHours(hour < 7 || hour >= 12);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Test different hours
  const testScenarios = [
    { hour: 6, description: "06:00 - Sebelum jam absensi", status: "blocked", reason: "Belum waktunya" },
    { hour: 7, description: "07:00 - Awal jam absensi", status: "allowed", reason: "Dapat absen" },
    { hour: 8, description: "08:00 - Masih bisa absen", status: "allowed", reason: "Dapat absen" },
    { hour: 10, description: "10:00 - Masih bisa absen", status: "allowed", reason: "Dapat absen" },
    { hour: 11, description: "11:00 - Akhir jam absensi", status: "allowed", reason: "Dapat absen" },
    { hour: 12, description: "12:00 - Setelah jam absensi", status: "blocked", reason: "Sudah berakhir" },
    { hour: 15, description: "15:00 - Siang hari", status: "blocked", reason: "Sudah berakhir" },
  ];

  // Test different hours
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "allowed":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "blocked":
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Clock className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "allowed":
        return "bg-green-50 border-green-200 text-green-800";
      case "blocked":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const simulateTime = (hour: number) => {
    const isOutside = hour < 7 || hour >= 12;
    
    return {
      isOutsideAbsensiHours: isOutside,
      canAbsen: !isOutside,
      message: isOutside 
        ? (hour < 7 ? "Belum waktunya absensi" : "Waktu absensi telah berakhir")
        : "Dapat absen"
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Test Sistem Waktu Absensi PKL
        </h1>
        
        {/* Current Time Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{currentTime}</div>
            <div className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              Waktu Sekarang (WIB) - Jam {currentHour}
            </div>
            <div className={`inline-flex items-center px-4 py-2 rounded-lg ${
              isOutsideAbsensiHours ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
            }`}>
              {isOutsideAbsensiHours ? (
                <XCircle className="h-5 w-5 mr-2" />
              ) : (
                <CheckCircle className="h-5 w-5 mr-2" />
              )}
              Status: {isOutsideAbsensiHours 
                ? (currentHour < 7 ? "Belum waktunya absensi" : "Waktu absensi berakhir")
                : "Bisa absen"
              }
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
            <Clock className="h-6 w-6 mr-2" />
            Aturan Waktu Absensi
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="font-semibold text-green-800 dark:text-green-200">✅ Dapat Absen</div>
              <div className="text-green-700 dark:text-green-300">07:00 - 11:59 WIB</div>
            </div>
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="font-semibold text-red-800 dark:text-red-200">❌ Tidak Bisa</div>
              <div className="text-red-700 dark:text-red-300">Selain 07:00-12:00</div>
            </div>
          </div>
        </div>

        {/* Test Scenarios */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            Simulasi Berbagai Jam
          </h3>
          <div className="grid gap-4">
            {testScenarios.map((scenario, index) => {
              const simulation = simulateTime(scenario.hour);
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${getStatusColor(scenario.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(scenario.status)}
                      <div>
                        <div className="font-semibold">{scenario.description}</div>
                        <div className="text-sm opacity-80">{simulation.message}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{scenario.reason}</div>
                      <div className="text-sm">
                        {simulation.canAbsen ? "Dapat absen" : "Tidak dapat absen"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Test */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            Test Interaktif
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pilih Jam untuk Simulasi:
            </label>
            <input
              type="range"
              min="0"
              max="23"
              value={testHour}
              onChange={(e) => setTestHour(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:00</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {testHour.toString().padStart(2, '0')}:00 WIB
            </div>
            {(() => {
              const sim = simulateTime(testHour);
              return (
                <div className={`inline-flex items-center px-6 py-3 rounded-lg text-lg font-semibold ${
                  sim.canAbsen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {sim.canAbsen 
                    ? <CheckCircle className="h-6 w-6 mr-2" />
                    : <XCircle className="h-6 w-6 mr-2" />
                  }
                  {sim.message}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Implementation Details */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Detail Implementasi
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Validasi Frontend:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Real-time clock menggunakan Asia/Jakarta timezone</li>
                <li>• Button disabled otomatis di luar jam 07:00-12:00</li>
                <li>• Alert peringatan sesuai kondisi waktu</li>
                <li>• Visual feedback yang jelas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Validasi Backend:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Double-check waktu sebelum menyimpan data</li>
                <li>• Konsistensi timezone di semua operasi</li>
                <li>• Error handling yang tepat</li>
                <li>• Logging untuk debugging</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
