"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  BookOpen,
  Calendar,
  Clock,
  LogOut,
  User,
  Plus,
  Eye,
  MapPin,
  CheckCircle,
  AlertCircle,
  XCircle,
  GraduationCap,
  Building,
  UserCheck,
  TrendingUp,
  Star,
  Award,
  Activity,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "@/components/ui/DashboardLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatCard,
} from "@/components/ui/Card";
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
  nama_dudi: string;
  nama_guru: string;
}

interface AttendanceData {
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

export default function SiswaDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [siswaData, setSiswaData] = useState<SiswaData | null>(null);
  const [jurnalCount, setJurnalCount] = useState(0);
  const [absensiCount, setAbsensiCount] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverTime, setServerTime] = useState<Date | null>(null);
  const [serverTimeString, setServerTimeString] = useState("");
  const [isAfter3PM, setIsAfter3PM] = useState(false);
  const [isServerTimeAvailable, setIsServerTimeAvailable] = useState(false);
  const router = useRouter();

  // Initialize supabase client
  const supabase = createClient();

  useEffect(() => {
    const initializeData = async () => {
      try {
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
        await fetchSiswaData(parsedUser.username);
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to initialize dashboard");
        setLoading(false);
      }
    };

    initializeData();
  }, [router]);

  const fetchSiswaData = async (username: string) => {
    try {
      setLoading(true);
      setError(null);

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

      // Fetch jurnal count using the NISN from siswa data
      console.log("Fetching jurnal count for NISN:", siswa.nisn);
      const { count } = await supabase
        .from("tb_jurnal")
        .select("*", { count: "exact", head: true })
        .eq("nisn", siswa.nisn);

      setJurnalCount(count || 0);
      console.log("Jurnal count:", count);

      // Fetch absensi count (total kehadiran)
      console.log("Fetching absensi count for NISN:", siswa.nisn);
      const { count: absensiCountData } = await supabase
        .from("tb_absensi")
        .select("*", { count: "exact", head: true })
        .eq("nisn", siswa.nisn)
        .eq("status", "hadir");

      setAbsensiCount(absensiCountData || 0);
      console.log("Absensi count:", absensiCountData);

      // Fetch today's attendance
      const today = new Date().toISOString().split("T")[0];
      console.log("Fetching attendance for date:", today, "NISN:", siswa.nisn);

      const { data: attendanceData, error: attendanceError } = await supabase
        .from("tb_absensi")
        .select("*")
        .eq("nisn", siswa.nisn)
        .eq("tanggal", today)
        .single();

      if (attendanceError) {
        console.log(
          "No attendance found (expected if not yet checked in):",
          attendanceError
        );
      }

      if (!attendanceError && attendanceData) {
        console.log("Attendance data found:", attendanceData);
        setTodayAttendance(attendanceData);
      }

      setLoading(false);
    } catch (error) {
      console.error("Unexpected error in fetchSiswaData:", error);
      console.error("Error type:", typeof error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      setError("Failed to load student data");
      setLoading(false);

      // If it's a network error, show a more helpful message
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
    }
  };

  // Get Jakarta time directly (simpler and more reliable)
  const getJakartaTime = () => {
    const now = new Date();

    // Use Intl.DateTimeFormat - this is the most reliable method
    const jakartaTimeString = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(now);

    // Get Jakarta hour for business logic
    const jakartaHour = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      hour: "numeric",
      hour12: false,
    }).format(now);

    const hour = parseInt(jakartaHour, 10);

    setServerTime(now);
    setServerTimeString(jakartaTimeString);
    setIsAfter3PM(hour >= 15);
    setIsServerTimeAvailable(true);

    console.log("🕐 Jakarta Time Calculated:", {
      localTime: now.toString(),
      jakartaTimeDisplay: jakartaTimeString,
      jakartaHour: hour,
      isAfter3PM: hour >= 15,
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  };

  useEffect(() => {
    getJakartaTime();
    const interval = setInterval(getJakartaTime, 1000); // update every second for real-time display
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!user || !siswaData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <DashboardLayout userRole="siswa">
        {/* Hero Header Section */}
        <div className="mb-8 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 rounded-3xl shadow-2xl text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-6 py-8 sm:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                  Halo, {siswaData.nama_siswa}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right"></div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Jurnal Count */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl mr-4 shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {jurnalCount}
                </p>
                <p className="text-sm text-gray-600">Total Jurnal</p>
              </div>
            </div>
          </div>

          {/* Today's Attendance */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div
                className={`p-3 rounded-xl mr-4 shadow-lg ${
                  todayAttendance
                    ? todayAttendance.status === "Hadir"
                      ? "bg-gradient-to-br from-green-500 to-emerald-600"
                      : "bg-gradient-to-br from-red-500 to-rose-600"
                    : "bg-gradient-to-br from-gray-400 to-gray-500"
                }`}
              >
                {todayAttendance ? (
                  todayAttendance.status === "Hadir" ? (
                    <CheckCircle className="h-6 w-6 text-white" />
                  ) : (
                    <XCircle className="h-6 w-6 text-white" />
                  )
                ) : (
                  <Clock className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {todayAttendance ? todayAttendance.status : "Belum Absen"}
                </p>
                <p className="text-sm text-gray-600">Status Hari Ini</p>
              </div>
            </div>
          </div>

          {/* Attendance Status */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div
                className={`p-3 rounded-xl mr-4 shadow-lg ${
                  isAfter3PM
                    ? "bg-gradient-to-br from-red-500 to-rose-600"
                    : "bg-gradient-to-br from-green-500 to-emerald-600"
                }`}
              >
                {isAfter3PM ? (
                  <XCircle className="h-6 w-6 text-white" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {isAfter3PM ? "Tutup" : "Buka"}
                </p>
                <p className="text-sm text-gray-600">Absensi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 mb-8">
          <div className="px-6 py-4 border-b border-white/30">
            <h2 className="text-xl font-bold text-gray-900">Aksi Utama</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Create Journal */}
              <Link
                href="/siswa/jurnal/create"
                className="flex items-center p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-white group"
              >
                <div className="bg-white/20 p-3 rounded-xl mr-4 group-hover:bg-white/30">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Buat Jurnal</h3>
                  <p className="text-sm text-blue-100">
                    Catat kegiatan PKL hari ini
                  </p>
                </div>
              </Link>

              {/* Attendance */}
              <Link
                href="/siswa/absensi"
                className={`flex items-center p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group ${
                  todayAttendance
                    ? "bg-gray-300 opacity-50 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                }`}
              >
                <div
                  className={`p-3 rounded-xl mr-4 ${
                    todayAttendance
                      ? "bg-gray-300"
                      : "bg-white/20 group-hover:bg-white/30"
                  }`}
                >
                  <CheckCircle
                    className={`h-6 w-6 ${
                      todayAttendance ? "text-gray-600" : "text-white"
                    }`}
                  />
                </div>
                <div>
                  <h3
                    className={`font-bold mb-1 ${
                      todayAttendance ? "text-gray-600" : "text-white"
                    }`}
                  >
                    {todayAttendance ? "Sudah Absen" : "Absensi"}
                  </h3>
                  <p
                    className={`text-sm ${
                      todayAttendance ? "text-gray-500" : "text-green-100"
                    }`}
                  >
                    {todayAttendance
                      ? `Status: ${todayAttendance.status}`
                      : "Absen kehadiran hari ini"}
                  </p>
                </div>
              </Link>

              {/* View Journals */}
              <Link
                href="/siswa/jurnal"
                className="flex items-center p-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-white group"
              >
                <div className="bg-white/20 p-3 rounded-xl mr-4 group-hover:bg-white/30">
                  <Eye className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Lihat Jurnal</h3>
                  <p className="text-sm text-purple-100">
                    Daftar semua jurnal yang dibuat
                  </p>
                </div>
              </Link>

              {/* Profile */}
              <Link
                href="/siswa/profil"
                className="flex items-center p-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-white group"
              >
                <div className="bg-white/20 p-3 rounded-xl mr-4 group-hover:bg-white/30">
                  <User className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Profil</h3>
                  <p className="text-sm text-orange-100">
                    Kelola akun dan password
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 mb-8">
          <div className="px-6 py-4 border-b border-white/30">
            <h2 className="text-xl font-bold text-gray-900">Informasi PKL</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    NISN
                  </label>
                  <p className="text-gray-900">{siswaData.nisn}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Kelas
                  </label>
                  <p className="text-gray-900">{siswaData.kelas}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Tahun Pelajaran
                  </label>
                  <p className="text-gray-900">{siswaData.tahun_pelajaran}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    DUDI
                  </label>
                  <p className="text-gray-900">{siswaData.nama_dudi}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Guru Pembimbing
                  </label>
                  <p className="text-gray-900">{siswaData.nama_guru}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Semester
                  </label>
                  <p className="text-gray-900">{siswaData.semester}</p>
                </div>
              </div>
            </div>

            {/* Today's Attendance Location */}
            {todayAttendance && todayAttendance.lokasi && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Absensi Hari Ini
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-900">
                      {todayAttendance.lokasi}
                    </span>
                  </div>
                  {todayAttendance.jam_absensi && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-900">
                        {todayAttendance.jam_absensi}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}
