"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import WarningModal from "@/components/ui/WarningModal";
import {
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  ExternalLink,
} from "lucide-react";
import DashboardLayout from "@/components/ui/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface UserData {
  id: number;
  username: string;
  nama: string;
  role: string;
}

interface SiswaData {
  nisn: string;
  nama_siswa: string;
  kelas: string;
  tahun_pelajaran: string;
  semester: string;
  id_dudi: string;
  nama_dudi: string;
  id_guru: string;
  nama_guru: string;
}

interface AbsensiData {
  id_absensi: number;
  nisn: string;
  nama_siswa: string;
  kelas: string;
  lokasi: string;
  id_dudi: string;
  nama_dudi: string;
  tanggal: string;
  status: "Hadir" | "Sakit" | "Izin" | "Alpha";
  keterangan: string | null;
  id_guru: string;
  nama_guru: string;
  jam_absensi: string;
  created_at: string;
}

export default function AbsensiPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [siswaData, setSiswaData] = useState<SiswaData | null>(null);
  const [todayAbsensi, setTodayAbsensi] = useState<AbsensiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [location, setLocation] = useState<string>("");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [serverTime, setServerTime] = useState<Date | null>(null);
  const [isLate, setIsLate] = useState(false);
  const [isAfter3PM, setIsAfter3PM] = useState(false);
  const [isServerTimeAvailable, setIsServerTimeAvailable] = useState(false);
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [selectedKehadiran, setSelectedKehadiran] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<{
    type: "masuk" | "pulang";
    kehadiran: string;
  } | null>(null);

  const router = useRouter();
  const supabase = createClient();

  // Calculate disable conditions - only disable if not mounted, submitting, or already attended
  const isButtonDisabled = !isMounted || isSubmitting || todayAbsensi !== null;

  // Debug logging
  useEffect(() => {
    console.log("Button disable state:", {
      isMounted,
      isSubmitting,
      isAfter3PM,
      todayAbsensi: !!todayAbsensi,
      isButtonDisabled,
      serverTime: serverTime?.toISOString(),
      environment: process.env.NODE_ENV,
    });
  }, [
    isMounted,
    isSubmitting,
    isAfter3PM,
    todayAbsensi,
    isButtonDisabled,
    serverTime,
  ]);

  // Function to get server time from world clock API
  const getServerTime = async (): Promise<Date> => {
    try {
      // Use local API for consistent Jakarta time
      const response = await fetch("/api/time", {
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const serverDateTime = new Date(data.datetime);
        setServerTime(serverDateTime);
        setIsServerTimeAvailable(true);
        return serverDateTime;
      }
    } catch (error) {
      console.log("API time failed, using local calculation");
      // Fallback to local time if API fails
      const localTime = new Date();
      setServerTime(localTime);
      setIsServerTimeAvailable(false);
      return localTime;
    }

    // Fallback jika tidak ada yang berhasil
    const localTime = new Date();
    setServerTime(localTime);
    setIsServerTimeAvailable(false);
    return localTime;
  };

  // Function to get address from coordinates
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      setIsLoadingAddress(true);
      // Using OpenStreetMap Nominatim API (free alternative to Google Geocoding)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.display_name) {
        setLocationAddress(data.display_name);
      } else {
        setLocationAddress("Alamat tidak ditemukan");
      }
    } catch (error) {
      console.error("Error getting address:", error);
      setLocationAddress("Gagal mendapatkan alamat");
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Function to open Google Maps
  const openGoogleMaps = () => {
    if (coordinates) {
      const url = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
      window.open(url, "_blank");
    }
  };

  // Check hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "siswa") {
      router.push("/login");
      return;
    }

    setUser(parsedUser);
    fetchSiswaData(parsedUser.username);
    updateCurrentTime();

    // Update time every minute
    const timeInterval = setInterval(updateCurrentTime, 60000);

    return () => clearInterval(timeInterval);
  }, [router]);

  useEffect(() => {
    if (siswaData) {
      checkTodayAbsensi();
      getCurrentLocation();
    }
  }, [siswaData]);

  // Get address when coordinates change
  useEffect(() => {
    if (coordinates) {
      getAddressFromCoordinates(coordinates.lat, coordinates.lng);
    }
  }, [coordinates]);

  const updateCurrentTime = async () => {
    try {
      // Use consistent WIB calculation like in admin page
      const nowUTC = new Date();
      const nowWIB = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000); // Add 7 hours for WIB

      // Format time for display (HH:MM:SS)
      const jakartaTime = `${String(nowWIB.getUTCHours()).padStart(
        2,
        "0"
      )}:${String(nowWIB.getUTCMinutes()).padStart(2, "0")}:${String(
        nowWIB.getUTCSeconds()
      ).padStart(2, "0")}`;

      setCurrentTime(jakartaTime);

      // Get WIB hour for business logic
      const hour = nowWIB.getUTCHours(); // This is WIB hour since we added 7 hours
      const isLateValue = hour >= 8;
      const isAfter3PMValue = hour >= 15;

      console.log("Time check (WIB):", {
        utc: nowUTC.toISOString(),
        wib: nowWIB.toISOString(),
        displayTime: jakartaTime,
        hour,
        isLateValue,
        isAfter3PMValue,
      });

      setIsLate(isLateValue);
      setIsAfter3PM(isAfter3PMValue);
    } catch (error) {
      console.error("Error updating current time:", error);

      // Emergency fallback: Use direct WIB calculation
      const fallbackUTC = new Date();
      const fallbackWIB = new Date(fallbackUTC.getTime() + 7 * 60 * 60 * 1000);
      const fallbackTime = `${String(fallbackWIB.getUTCHours()).padStart(
        2,
        "0"
      )}:${String(fallbackWIB.getUTCMinutes()).padStart(2, "0")}:${String(
        fallbackWIB.getUTCSeconds()
      ).padStart(2, "0")}`;

      setCurrentTime(fallbackTime);

      const hour = fallbackWIB.getUTCHours();
      setIsLate(hour >= 8);
      setIsAfter3PM(hour >= 15);
    }
  };

  const fetchSiswaData = async (username: string) => {
    try {
      console.log("Fetching data for username:", username);

      // First get user data to get the nama
      const { data: userData, error: userError } = await supabase
        .from("tb_user")
        .select("nama")
        .eq("username", username)
        .single();

      if (userError) {
        throw new Error(
          `User fetch failed: ${userError.message || "Unknown error"}`
        );
      }

      console.log("User data found:", userData);

      // Then find siswa data by matching nama_siswa with user nama
      const { data: siswa, error } = await supabase
        .from("tb_siswa")
        .select("*")
        .eq("nama_siswa", userData.nama)
        .single();

      if (error) {
        throw new Error(
          `Siswa fetch failed: ${error.message || "Unknown error"}`
        );
      }

      console.log("Siswa data found:", siswa);
      setSiswaData(siswa);
      setIsLoading(false);
    } catch (error) {
      console.error("Unexpected error in fetchSiswaData:", error);
      setIsLoading(false);
    }
  };

  const checkTodayAbsensi = async () => {
    if (!siswaData) return;

    try {
      // Always get today's date in Jakarta timezone consistently
      const today = new Date();

      // Use Intl API to get Jakarta date in YYYY-MM-DD format
      const jakartaDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(today);

      console.log(
        "Checking attendance for Jakarta date:",
        jakartaDate,
        "NISN:",
        siswaData.nisn,
        "Source UTC:",
        today.toISOString()
      );

      const { data, error } = await supabase
        .from("tb_absensi")
        .select("*")
        .eq("nisn", siswaData.nisn)
        .eq("tanggal", jakartaDate)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error;
      }

      console.log("Today's attendance data:", data);
      setTodayAbsensi(data);
    } catch (error) {
      console.error("Error checking today's absensi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lng: longitude });

          // Reverse geocoding (you might want to use a service like Google Maps API)
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocation("Lokasi tidak tersedia");
        }
      );
    } else {
      setLocation("Geolocation tidak didukung");
    }
  };

  // Handle button click with time warning
  const handleAbsensiClick = (type: "masuk" | "pulang", kehadiran: string) => {
    // Check if it's after 3 PM (15:00)
    if (isAfter3PM) {
      setSelectedKehadiran(kehadiran);
      setPendingSubmission({ type, kehadiran });
      setShowWarningModal(true);
    } else {
      // Proceed directly if not after 3 PM
      if (type === "masuk") {
        submitAbsensi(kehadiran as "Hadir" | "Sakit" | "Izin");
      } else {
        // Handle pulang logic here if needed
        submitAbsensi(kehadiran as "Hadir" | "Sakit" | "Izin");
      }
    }
  };

  // Confirm submission after warning
  const handleConfirmSubmission = () => {
    if (pendingSubmission) {
      if (pendingSubmission.type === "masuk") {
        submitAbsensi(
          pendingSubmission.kehadiran as "Hadir" | "Sakit" | "Izin"
        );
      } else {
        // Handle pulang logic here if needed
        submitAbsensi(
          pendingSubmission.kehadiran as "Hadir" | "Sakit" | "Izin"
        );
      }
      setPendingSubmission(null);
    }
  };

  const submitAbsensi = async (status: "Hadir" | "Sakit" | "Izin") => {
    if (!siswaData || !user) return;

    setIsSubmitting(true);

    try {
      const now = new Date();

      // Use Jakarta timezone for both date and time
      const jakartaDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(now);

      // Get Jakarta time for database (HH:MM:SS format)
      const jakartaTimeForDB = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);

      // Get Jakarta time for display (Indonesian format)
      const jakartaTimeForDisplay = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);

      console.log("Submit attendance with Jakarta time:", {
        jakartaDate,
        jakartaTimeForDB,
        jakartaTimeForDisplay,
        sourceUTC: now.toISOString(),
      });

      const absensiData = {
        nisn: siswaData.nisn,
        nama_siswa: siswaData.nama_siswa,
        kelas: siswaData.kelas,
        lokasi: location,
        id_dudi: siswaData.id_dudi,
        nama_dudi: siswaData.nama_dudi,
        tanggal: jakartaDate,
        status: status,
        keterangan: isLate && status === "Hadir" ? "Terlambat" : null,
        id_guru: siswaData.id_guru,
        nama_guru: siswaData.nama_guru,
        jam_absensi: jakartaTimeForDB, // Use Jakarta time format
      };

      console.log("Submitting attendance data:", absensiData);

      const { data, error } = await supabase
        .from("tb_absensi")
        .insert(absensiData)
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw new Error(`Database error: ${error.message || "Unknown error"}`);
      }

      setTodayAbsensi(data);

      // Simple success feedback (you can replace with your preferred notification method)
      alert(
        `Absensi Berhasil! Status: ${status} pada ${jakartaTimeForDisplay}`
      );
    } catch (error) {
      console.error("Error submitting absensi:", error);

      // Show more specific error message
      if (error instanceof Error) {
        alert(`Gagal Menyimpan Absensi: ${error.message}`);
      } else {
        alert(
          "Gagal Menyimpan Absensi: Terjadi kesalahan tidak dikenal. Silakan coba lagi."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {!isMounted ? "Memuat halaman..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Hadir":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "Sakit":
        return <XCircle className="h-6 w-6 text-red-600" />;
      case "Izin":
        return <AlertCircle className="h-6 w-6 text-yellow-600" />;
      default:
        return <User className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hadir":
        return "text-green-600 bg-green-100";
      case "Sakit":
        return "text-red-600 bg-red-100";
      case "Izin":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <DashboardLayout userRole="siswa">
        {/* Hero Header Section */}
        <div className="mb-8 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 rounded-3xl shadow-2xl text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-6 py-8 sm:px-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                  Absensi PKL 📋
                </h1>
                <p className="text-blue-100 text-lg mb-4">
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <div className="inline-flex items-center px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="font-semibold">
                    {isAfter3PM
                      ? "Waktu absensi telah berakhir"
                      : "Waktu absensi tersedia hingga 15:00 WIB"}
                  </span>
                </div>
              </div>
              <div className="lg:ml-8 mt-6 lg:mt-0">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-1">{currentTime}</div>
                    <div className="text-blue-100">Waktu Sekarang (WIB)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Late Warning */}
        {isLate && !todayAbsensi && (
          <div className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 mr-3" />
              <div>
                <div className="font-semibold">Perhatian!</div>
                <div className="text-yellow-100">
                  Sudah melewati jam 8 pagi. Absensi akan dianggap terlambat.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Location Section */}
        <div className="mb-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
            <div className="flex items-center">
              <MapPin className="h-6 w-6 text-white mr-3" />
              <h3 className="text-lg font-semibold text-white">Lokasi Anda</h3>
            </div>
          </div>
          <div className="p-6">
            {coordinates ? (
              <div className="space-y-4">
                {/* Clickable Coordinates */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors">
                  <button
                    onClick={openGoogleMaps}
                    className="flex items-center gap-3 text-blue-600 hover:text-blue-800 cursor-pointer w-full text-left group"
                  >
                    <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {coordinates.lat.toFixed(6)},{" "}
                        {coordinates.lng.toFixed(6)}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        Klik untuk buka di Google Maps
                        <ExternalLink className="h-3 w-3" />
                      </p>
                    </div>
                  </button>
                </div>

                {/* Address Information */}
                {isLoadingAddress ? (
                  <div className="flex items-center gap-3 text-gray-600 p-4 bg-blue-50 rounded-xl">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                    <span>Mencari alamat...</span>
                  </div>
                ) : locationAddress ? (
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
                ) : null}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600">Mendeteksi lokasi...</p>
              </div>
            )}
          </div>
        </div>
        {/* Absensi Status */}
        {todayAbsensi ? (
          <div className="mb-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <div className="flex items-center">
                {getStatusIcon(todayAbsensi.status)}
                <h3 className="text-lg font-semibold text-white ml-3">
                  Absensi Hari Ini
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Status:</span>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                        todayAbsensi.status
                      )}`}
                    >
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
                {todayAbsensi.keterangan && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">
                        Keterangan:
                      </span>
                      <span className="font-semibold text-yellow-800">
                        {todayAbsensi.keterangan}
                      </span>
                    </div>
                  </div>
                )}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Lokasi:</span>
                    <span className="text-sm text-gray-800">
                      {todayAbsensi.lokasi}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">
                Pilih Status Kehadiran
              </h3>
              {isAfter3PM && (
                <div className="mt-2 bg-red-500/20 border border-red-300 rounded-lg p-3">
                  <p className="text-red-100 text-sm">
                    ⏰ Waktu absensi telah berakhir (setelah jam 15:00 WIB).
                    Silakan hubungi guru pembimbing jika ada keperluan khusus.
                  </p>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Hadir Button */}
                <div
                  className={`group bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border-2 border-green-200 transition-all duration-300 ${
                    isButtonDisabled
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:border-green-400 hover:shadow-lg"
                  }`}
                >
                  <div className="text-center">
                    <div
                      className={`bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl mx-auto w-16 h-16 flex items-center justify-center mb-4 transition-transform duration-300 ${
                        isButtonDisabled ? "" : "group-hover:scale-110"
                      }`}
                    >
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      Hadir
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {todayAbsensi
                        ? "Anda sudah melakukan absensi hari ini"
                        : isAfter3PM
                        ? "Waktu absensi telah berakhir"
                        : "Saya hadir hari ini"}
                    </p>
                    <Button
                      variant="success"
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:hover:from-green-500 disabled:hover:to-emerald-600 disabled:pointer-events-none"
                      onClick={() => handleAbsensiClick("masuk", "Hadir")}
                      disabled={isButtonDisabled}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Hadir
                    </Button>
                  </div>
                </div>

                {/* Sakit Button */}
                <div
                  className={`group bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-6 border-2 border-red-200 transition-all duration-300 ${
                    isButtonDisabled
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:border-red-400 hover:shadow-lg"
                  }`}
                >
                  <div className="text-center">
                    <div
                      className={`bg-gradient-to-r from-red-500 to-pink-600 text-white p-4 rounded-xl mx-auto w-16 h-16 flex items-center justify-center mb-4 transition-transform duration-300 ${
                        isButtonDisabled ? "" : "group-hover:scale-110"
                      }`}
                    >
                      <XCircle className="h-8 w-8" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      Sakit
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {todayAbsensi
                        ? "Anda sudah melakukan absensi hari ini"
                        : isAfter3PM
                        ? "Waktu absensi telah berakhir"
                        : "Saya sedang sakit"}
                    </p>
                    <Button
                      variant="danger"
                      className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:hover:from-red-500 disabled:hover:to-pink-600 disabled:pointer-events-none"
                      onClick={() => handleAbsensiClick("masuk", "Sakit")}
                      disabled={isButtonDisabled}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Sakit
                    </Button>
                  </div>
                </div>

                {/* Izin Button */}
                <div
                  className={`group bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl p-6 border-2 border-yellow-200 transition-all duration-300 ${
                    isButtonDisabled
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:border-yellow-400 hover:shadow-lg"
                  }`}
                >
                  <div className="text-center">
                    <div
                      className={`bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-4 rounded-xl mx-auto w-16 h-16 flex items-center justify-center mb-4 transition-transform duration-300 ${
                        isButtonDisabled ? "" : "group-hover:scale-110"
                      }`}
                    >
                      <AlertCircle className="h-8 w-8" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      Izin
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {todayAbsensi
                        ? "Anda sudah melakukan absensi hari ini"
                        : isAfter3PM
                        ? "Waktu absensi telah berakhir"
                        : "Saya ada keperluan"}
                    </p>
                    <Button
                      variant="warning"
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:hover:from-yellow-500 disabled:hover:to-orange-600 disabled:pointer-events-none"
                      onClick={() => handleAbsensiClick("masuk", "Izin")}
                      disabled={isButtonDisabled}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Izin
                    </Button>
                  </div>
                </div>
              </div>

              {isSubmitting && (
                <div className="mt-6 text-center bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-3"></div>
                  <p className="text-blue-800 font-medium">
                    Menyimpan absensi...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">
              Informasi Absensi
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-green-800">Hadir</div>
                  <div className="text-green-700">
                    Anda hadir dan siap melaksanakan PKL
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl">
                <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-800">Sakit</div>
                  <div className="text-red-700">
                    Anda tidak dapat hadir karena sakit
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-yellow-800">Izin</div>
                  <div className="text-yellow-700">
                    Anda tidak dapat hadir karena ada keperluan
                  </div>
                </div>
              </div>
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-l-4 border-blue-500">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-900 mb-1">
                      Catatan Penting:
                    </div>
                    <div className="text-blue-800">
                      Absensi harus dilakukan sebelum jam 8:00 WIB. Jika belum
                      absen sampai jam 15.00 WIB, status akan otomatis menjadi
                      Alpha.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Modal */}
        <WarningModal
          isOpen={showWarningModal}
          onClose={() => {
            setShowWarningModal(false);
            setPendingSubmission(null);
          }}
          title="Peringatan Waktu Absensi"
          message="Waktu absensi sudah lewat dari jam 15:00 WIB. Apakah Anda yakin ingin melanjutkan absensi?"
          onConfirm={handleConfirmSubmission}
          confirmText="Ya, Lanjutkan"
          cancelText="Batal"
        />
      </DashboardLayout>
    </div>
  );
}
