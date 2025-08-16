"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  MapPin,
  Clock,
  Filter,
  Download,
  Users,
} from "lucide-react";
import DashboardLayout from "@/components/ui/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { showSuccess, showError } from "@/lib/sweetAlert";

interface UserData {
  id: number;
  username: string;
  nama: string;
  role: string;
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

interface SiswaData {
  nisn: string;
  nama_siswa: string;
  kelas: string;
  nama_dudi: string;
}

export default function GuruAbsensiPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [siswaList, setSiswaList] = useState<SiswaData[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    hadir: 0,
    sakit: 0,
    izin: 0,
    alpha: 0,
    belumAbsen: 0,
  });

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "guru") {
      router.push("/login");
      return;
    }

    setUser(parsedUser);
    fetchData(parsedUser.username);
  }, [router, selectedDate]);

  const fetchData = async (username: string) => {
    try {
      setIsLoading(true);

      // Get guru data
      const { data: guruData, error: guruError } = await supabase
        .from("tb_guru")
        .select("*")
        .eq("id_guru", username)
        .single();

      if (guruError) throw guruError;

      // Get siswa list for this guru
      const { data: siswaData, error: siswaError } = await supabase
        .from("tb_siswa")
        .select("*")
        .eq("id_guru", username);

      if (siswaError) throw siswaError;

      setSiswaList(siswaData || []);

      if (siswaData && siswaData.length > 0) {
        const nisnList = siswaData.map((s) => s.nisn);

        // Get attendance data for selected date
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("tb_absensi")
          .select("*")
          .in("nisn", nisnList)
          .eq("tanggal", selectedDate)
          .order("jam_absensi", { ascending: true });

        if (attendanceError) {
          console.error("Error fetching attendance:", attendanceError);
        } else {
          setAttendanceData(attendanceData || []);
        }

        // Calculate stats
        const attendanceByStatus = (attendanceData || []).reduce(
          (acc, curr) => {
            acc[curr.status.toLowerCase()] =
              (acc[curr.status.toLowerCase()] || 0) + 1;
            return acc;
          },
          { hadir: 0, sakit: 0, izin: 0, alpha: 0 }
        );

        const belumAbsen = siswaData.length - (attendanceData?.length || 0);

        setStats({
          ...attendanceByStatus,
          belumAbsen,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Hadir":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "Sakit":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "Izin":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "Alpha":
        return <User className="h-5 w-5 text-gray-600" />;
      default:
        return <User className="h-5 w-5 text-gray-400" />;
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
      case "Alpha":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const handleAutoAlpha = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auto-alpha", {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        showSuccess(
          "Auto Alpha Berhasil!",
          `${result.processed} siswa yang belum absen sampai jam 3 sore diberi status Alpha.`
        );
        // Refresh data
        fetchData(user?.username || "");
      } else {
        throw new Error(result.error || "Gagal menjalankan auto alpha");
      }
    } catch (error) {
      console.error("Error running auto alpha:", error);
      showError("Gagal Auto Alpha", "Gagal menjalankan auto alpha");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAttendance = attendanceData.filter((item) => {
    if (selectedStatus === "all") return true;
    return item.status.toLowerCase() === selectedStatus;
  });

  // Get students who haven't attended
  const attendedNisns = attendanceData.map((a) => a.nisn);
  const studentsNotAttended = siswaList.filter(
    (s) => !attendedNisns.includes(s.nisn)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole="guru">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Monitor Absensi Siswa
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Pantau kehadiran siswa PKL bimbingan Anda
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Semua Status</option>
                <option value="hadir">Hadir</option>
                <option value="sakit">Sakit</option>
                <option value="izin">Izin</option>
                <option value="alpha">Alpha</option>
              </select>
            </div>
            {/*             
            <div className="flex items-end gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
              <Button
                variant="secondary"
                className="flex items-center gap-2"
                onClick={handleAutoAlpha}
              >
                <Clock className="h-4 w-4" />
                Auto Alpha (3 PM)
              </Button>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.hadir}</p>
              <p className="text-sm text-gray-600">Hadir</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.sakit}</p>
              <p className="text-sm text-gray-600">Sakit</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.izin}</p>
              <p className="text-sm text-gray-600">Izin</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-gray-600" />
            <div>
              <p className="text-2xl font-bold text-gray-600">{stats.alpha}</p>
              <p className="text-sm text-gray-600">Alpha</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {stats.belumAbsen}
              </p>
              <p className="text-sm text-gray-600">Belum Absen</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Attendance List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students who attended */}
        <Card>
          <CardHeader>
            <CardTitle>Sudah Absen ({filteredAttendance.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAttendance.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Tidak ada data absensi untuk filter yang dipilih
              </p>
            ) : (
              <div className="space-y-3">
                {filteredAttendance.map((attendance) => (
                  <div
                    key={attendance.id_absensi}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(attendance.status)}
                        <div>
                          <p className="font-medium text-gray-900">
                            {attendance.nama_siswa}
                          </p>
                          <p className="text-sm text-gray-600">
                            {attendance.kelas} • {attendance.nama_dudi}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          attendance.status
                        )}`}
                      >
                        {attendance.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{attendance.jam_absensi}</span>
                      </div>
                      {attendance.lokasi && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{attendance.lokasi}</span>
                        </div>
                      )}
                    </div>

                    {attendance.keterangan && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <strong>Keterangan:</strong> {attendance.keterangan}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students who haven't attended */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">
              Belum Absen ({studentsNotAttended.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentsNotAttended.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <p className="text-green-600 font-medium">
                  Semua siswa sudah melakukan absensi!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {studentsNotAttended.map((siswa) => (
                  <div
                    key={siswa.nisn}
                    className="p-4 border border-red-200 bg-red-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-900">
                          {siswa.nama_siswa}
                        </p>
                        <p className="text-sm text-red-700">
                          {siswa.kelas} • {siswa.nama_dudi}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
