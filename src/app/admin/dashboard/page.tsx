"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  UserCheck,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  TrendingUp,
  AlertCircle,
  Eye,
  Edit,
  Plus,
  UserCog,
  LinkIcon,
  UserPlus,
  Clock,
  Filter,
  CheckCircle,
  XCircle,
  UserX,
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/ui/DashboardLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatCard,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
} from "@/components/ui/Table";

interface DashboardStats {
  totalUsers: number;
  totalSiswa: number;
  totalGuru: number;
  totalDudi: number;
  totalJurnal: number;
  totalAbsensi: number;
  recentJurnal: Array<{
    id_jurnal: string;
    nama_siswa: string;
    tanggal: string;
    deskripsi_kegiatan: string;
  }>;
}

interface AttendanceData {
  id_absensi: number;
  nisn: string;
  nama_siswa: string;
  kelas: string;
  status: "Hadir" | "Sakit" | "Izin" | "Alpha";
  tanggal: string;
  jam_absensi: string;
  lokasi: string;
  nama_guru: string;
}

interface GuruData {
  id_guru: string;
  nama_guru: string;
}

interface SiswaData {
  nisn: string;
  nama_siswa: string;
  kelas: string;
  nama_guru: string;
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceData[]>([]);
  const [guruList, setGuruList] = useState<GuruData[]>([]);
  const [selectedGuru, setSelectedGuru] = useState<string>("all");
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [allSiswa, setAllSiswa] = useState<SiswaData[]>([]);
  const [studentsNotPresent, setStudentsNotPresent] = useState<SiswaData[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAndFetchData = async () => {
      const userValid = await checkUser();
      if (userValid) {
        await fetchDashboardData();
        await fetchTodayAttendance();
        await fetchGuruList();
        await fetchAllSiswa();
      }
      setIsChecking(false);
    };

    checkAndFetchData();
  }, []);

  // Re-fetch attendance when guru filter changes
  useEffect(() => {
    if (allSiswa.length > 0) {
      updateStudentsNotPresent(todayAttendance);
    }
  }, [selectedGuru, allSiswa, todayAttendance]);

  const checkUser = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      // Add small delay to ensure localStorage is ready
      setTimeout(() => {
        const userData = localStorage.getItem("user");
        console.log("Checking userData from localStorage:", userData);

        if (!userData) {
          console.log("No userData found, redirecting to login");
          router.push("/login");
          resolve(false);
          return;
        }

        try {
          const parsedUser = JSON.parse(userData);
          console.log("Parsed user:", parsedUser);

          if (parsedUser.role !== "admin") {
            console.log(
              "User role is not admin:",
              parsedUser.role,
              "redirecting to login"
            );
            router.push("/login");
            resolve(false);
            return;
          }

          console.log("User is admin, setting user state");
          setUser(parsedUser);
          resolve(true);
        } catch (error) {
          console.error("Error parsing user data:", error);
          router.push("/login");
          resolve(false);
        }
      }, 100); // Small delay to ensure localStorage is ready
    });
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch counts for all entities
      const [
        usersResult,
        siswaResult,
        guruResult,
        dudiResult,
        jurnalResult,
        absensiResult,
      ] = await Promise.all([
        supabase.from("tb_user").select("*", { count: "exact", head: true }),
        supabase.from("tb_siswa").select("*", { count: "exact", head: true }),
        supabase.from("tb_guru").select("*", { count: "exact", head: true }),
        supabase.from("tb_dudi").select("*", { count: "exact", head: true }),
        supabase.from("tb_jurnal").select("*", { count: "exact", head: true }),
        supabase.from("tb_absensi").select("*", { count: "exact", head: true }),
      ]);

      // Fetch recent jurnal entries
      const { data: recentJurnal } = await supabase
        .from("tb_jurnal")
        .select("id_jurnal, nama_siswa, tanggal, deskripsi_kegiatan")
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        totalUsers: usersResult.count || 0,
        totalSiswa: siswaResult.count || 0,
        totalGuru: guruResult.count || 0,
        totalDudi: dudiResult.count || 0,
        totalJurnal: jurnalResult.count || 0,
        totalAbsensi: absensiResult.count || 0,
        recentJurnal: recentJurnal || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGuruList = async () => {
    try {
      const { data: guruData, error } = await supabase
        .from("tb_guru")
        .select("id_guru, nama_guru")
        .order("nama_guru", { ascending: true });

      if (error) throw error;
      setGuruList(guruData || []);
    } catch (error) {
      console.error("Error fetching guru list:", error);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      setIsLoadingAttendance(true);

      // Get today's date in Jakarta timezone
      const today = new Date();
      const jakartaDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(today);

      // Fetch today's attendance data
      const { data: attendanceData, error } = await supabase
        .from("tb_absensi")
        .select("*")
        .eq("tanggal", jakartaDate)
        .order("jam_absensi", { ascending: false });

      if (error) throw error;
      setTodayAttendance(attendanceData || []);
    } catch (error) {
      console.error("Error fetching today's attendance:", error);
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  const fetchAllSiswa = async () => {
    try {
      setIsLoadingStudents(true);

      const { data: siswaData, error } = await supabase
        .from("tb_siswa")
        .select("nisn, nama_siswa, kelas, nama_guru")
        .order("nama_siswa", { ascending: true });

      if (error) throw error;
      setAllSiswa(siswaData || []);
    } catch (error) {
      console.error("Error fetching all students:", error);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const updateStudentsNotPresent = (attendanceData: AttendanceData[]) => {
    // Only proceed if we have students data
    if (allSiswa.length === 0) return;

    // Get list of NISN who have taken attendance today
    const presentNISNs = new Set(
      attendanceData.map((attendance) => attendance.nisn)
    );

    // Filter students who haven't taken attendance
    const notPresentStudents = allSiswa.filter(
      (siswa) => !presentNISNs.has(siswa.nisn)
    );
    setStudentsNotPresent(notPresentStudents);
  };

  // Filter attendance by selected guru (case-insensitive)
  const filteredAttendance = todayAttendance.filter((attendance) => {
    if (selectedGuru === "all") return true;
    return attendance.nama_guru.toLowerCase() === selectedGuru.toLowerCase();
  });

  // Filter students not present by selected guru (case-insensitive)
  const filteredStudentsNotPresent = studentsNotPresent.filter((siswa) => {
    if (selectedGuru === "all") return true;
    return siswa.nama_guru.toLowerCase() === selectedGuru.toLowerCase();
  });

  // Calculate attendance stats
  const attendanceStats = {
    total: filteredAttendance.length,
    hadir: filteredAttendance.filter((a) => a.status === "Hadir").length,
    sakit: filteredAttendance.filter((a) => a.status === "Sakit").length,
    izin: filteredAttendance.filter((a) => a.status === "Izin").length,
    alpha: filteredAttendance.filter((a) => a.status === "Alpha").length,
    belumAbsen: filteredStudentsNotPresent.length,
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Siswa",
      value: stats?.totalSiswa || 0,
      icon: <GraduationCap className="h-6 w-6" />,
      color: "green" as const,
      link: "/admin/siswa",
    },
    {
      title: "Total Jurnal",
      value: stats?.totalJurnal || 0,
      icon: <BookOpen className="h-6 w-6" />,
      color: "red" as const,
      link: "/admin/jurnal",
    },
    {
      title: "Total Absensi",
      value: stats?.totalAbsensi || 0,
      icon: <Calendar className="h-6 w-6" />,
      color: "indigo" as const,
      link: "/admin/absensi",
    },
  ];

  return (
    <DashboardLayout userRole="admin">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <Link key={index} href={card.link}>
            <StatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
            />
          </Link>
        ))}
      </div>

      {/* Activity Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jurnal */}
        <Card>
          <CardHeader>
            <CardTitle>Jurnal Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentJurnal.length === 0 ? (
                <p className="text-gray-500 text-sm">Belum ada jurnal</p>
              ) : (
                stats?.recentJurnal.map((jurnal) => (
                  <div
                    key={jurnal.id_jurnal}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {jurnal.nama_siswa}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {jurnal.tanggal} -{" "}
                        {jurnal.deskripsi_kegiatan.substring(0, 50)}...
                      </p>
                    </div>
                    <Link
                      href={`/admin/jurnal?search=${jurnal.id_jurnal}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Button href="/admin/jurnal" variant="outline" size="sm">
                Lihat semua jurnal →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Attendance Dashboard */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Absensi Hari Ini (
                {new Date().toLocaleDateString("id-ID", {
                  timeZone: "Asia/Jakarta",
                })}
                )
              </CardTitle>
              <Button href="/admin/absensi" variant="outline" size="sm">
                Lihat Detail
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filter Guru */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">
                  Filter Guru Bimbingan:
                </label>
              </div>
              <select
                value={selectedGuru}
                onChange={(e) => setSelectedGuru(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Semua Guru</option>
                {guruList.map((guru) => (
                  <option key={guru.id_guru} value={guru.nama_guru}>
                    {guru.nama_guru}
                  </option>
                ))}
              </select>
            </div>

            {/* Attendance Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-xs font-medium text-green-600">
                    HADIR
                  </span>
                </div>
                <div className="text-xl font-bold text-green-700">
                  {attendanceStats.hadir}
                </div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <XCircle className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-xs font-medium text-red-600">
                    ALPHA
                  </span>
                </div>
                <div className="text-xl font-bold text-red-700">
                  {attendanceStats.alpha}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="h-4 w-4 text-gray-600 mr-1" />
                  <span className="text-xs font-medium text-gray-600">
                    BELUM ABSEN
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-700">
                  {attendanceStats.belumAbsen}
                </div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mr-1" />
                  <span className="text-xs font-medium text-yellow-600">
                    SAKIT
                  </span>
                </div>
                <div className="text-xl font-bold text-yellow-700">
                  {attendanceStats.sakit}
                </div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <UserX className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-xs font-medium text-blue-600">
                    IZIN
                  </span>
                </div>
                <div className="text-xl font-bold text-blue-700">
                  {attendanceStats.izin}
                </div>
              </div>
              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 text-indigo-600 mr-1" />
                  <span className="text-xs font-medium text-indigo-600">
                    TOTAL
                  </span>
                </div>
                <div className="text-xl font-bold text-indigo-700">
                  {attendanceStats.total + attendanceStats.belumAbsen}
                </div>
              </div>
            </div>

            {/* Attendance List */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 border-b pb-2">
                Sudah Absensi Hari Ini
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {isLoadingAttendance ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading...</p>
                  </div>
                ) : filteredAttendance.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    {selectedGuru === "all"
                      ? "Belum ada absensi hari ini"
                      : `Belum ada absensi dari siswa ${selectedGuru} hari ini`}
                  </p>
                ) : (
                  filteredAttendance.map((attendance) => (
                    <div
                      key={attendance.id_absensi}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        attendance.status === "Hadir"
                          ? "bg-green-50 border-green-200"
                          : attendance.status === "Alpha"
                          ? "bg-red-50 border-red-200"
                          : attendance.status === "Sakit"
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {attendance.nama_siswa}
                        </p>
                        <p className="text-xs text-gray-500">
                          {attendance.kelas} • {attendance.nama_guru}
                        </p>
                        {attendance.jam_absensi && (
                          <p className="text-xs text-gray-400">
                            {attendance.jam_absensi}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            attendance.status === "Hadir"
                              ? "bg-green-100 text-green-800"
                              : attendance.status === "Alpha"
                              ? "bg-red-100 text-red-800"
                              : attendance.status === "Sakit"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {attendance.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Students Not Present List */}
            <div className="space-y-3 mt-6">
              <h4 className="text-sm font-medium text-gray-700 border-b pb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                Belum Absensi Hari Ini
                {filteredStudentsNotPresent.length > 0 && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {filteredStudentsNotPresent.length}
                  </span>
                )}
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {isLoadingStudents ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading...</p>
                  </div>
                ) : filteredStudentsNotPresent.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    {selectedGuru === "all"
                      ? "Semua siswa sudah absensi hari ini 🎉"
                      : `Semua siswa ${selectedGuru} sudah absensi hari ini 🎉`}
                  </p>
                ) : (
                  filteredStudentsNotPresent.map((siswa) => (
                    <div
                      key={siswa.nisn}
                      className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 border-gray-200"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {siswa.nama_siswa}
                        </p>
                        <p className="text-xs text-gray-500">
                          {siswa.kelas} • {siswa.nama_guru}
                        </p>
                        <p className="text-xs text-gray-400">
                          NISN: {siswa.nisn}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Belum Absen
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Summary */}
            {(filteredAttendance.length > 0 ||
              filteredStudentsNotPresent.length > 0) && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="text-sm text-gray-600 text-center space-y-1">
                  <p>
                    Sudah Absensi:{" "}
                    <span className="font-medium text-green-600">
                      {attendanceStats.total} siswa
                    </span>
                  </p>
                  <p>
                    Belum Absensi:{" "}
                    <span className="font-medium text-gray-600">
                      {attendanceStats.belumAbsen} siswa
                    </span>
                  </p>
                  <p className="border-t pt-2 mt-2">
                    Total Keseluruhan:{" "}
                    <span className="font-medium text-indigo-600">
                      {attendanceStats.total + attendanceStats.belumAbsen} siswa
                    </span>
                    {selectedGuru !== "all" && (
                      <span className="text-xs text-gray-500 block">
                        dari {selectedGuru}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
