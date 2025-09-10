"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  BookOpen,
  Users,
  Calendar,
  LogOut,
  Eye,
  Search,
  CheckCircle,
  UserX,
  Clock,
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
import LocationLink from "@/components/ui/LocationLink";

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
  nama_dudi: string;
}

interface JurnalData {
  id_jurnal: string;
  nisn: string;
  nama_siswa: string;
  tanggal: string;
  deskripsi_kegiatan: string;
  lokasi: string;
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
}

export default function GuruDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [siswaList, setSiswaList] = useState<SiswaData[]>([]);
  const [recentJournals, setRecentJournals] = useState<JurnalData[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalJurnal: 0,
    jurnalHariIni: 0,
    hadirHariIni: 0,
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
  }, [router]);

  const fetchData = async (username: string) => {
    try {
      setIsLoadingData(true);

      // Fetch siswa yang dibimbing
      const { data: siswaData, error: siswaError } = await supabase
        .from("tb_siswa")
        .select("nisn, nama_siswa, kelas, nama_dudi")
        .eq("id_guru", username);

      if (siswaError) throw siswaError;
      setSiswaList(siswaData || []);

      // Fetch jurnal hari ini saja
      if (siswaData && siswaData.length > 0) {
        const nisnList = siswaData.map((s) => s.nisn);

        // Get today's date in Jakarta timezone
        const today = new Date();
        const jakartaDate = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Jakarta",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(today);

        console.log(
          "Dashboard - Using Jakarta date:",
          jakartaDate,
          "UTC source:",
          today.toISOString()
        );

        // Fetch only today's journals
        const { data: jurnalData, error: jurnalError } = await supabase
          .from("tb_jurnal")
          .select("*")
          .in("nisn", nisnList)
          .eq("tanggal", jakartaDate)
          .order("created_at", { ascending: false });

        if (jurnalError) throw jurnalError;

        // Add nama_siswa to jurnal data
        const formattedJurnal =
          jurnalData?.map((j) => {
            const siswa = siswaData.find((s) => s.nisn === j.nisn);
            return {
              ...j,
              nama_siswa: siswa?.nama_siswa || "",
            };
          }) || [];

        setRecentJournals(formattedJurnal);

        // Fetch today's attendance data using the same jakartaDate
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("tb_absensi")
          .select("*")
          .in("nisn", nisnList)
          .eq("tanggal", jakartaDate);

        if (attendanceError) {
          console.error("Error fetching attendance:", attendanceError);
        } else {
          setTodayAttendance(attendanceData || []);
        }

        // Calculate stats - jurnal hari ini saja
        const todayJournals = jurnalData || [];

        // Debug logging for troubleshooting
        console.log("Dashboard calculation debug:", {
          teacherUsername: user?.username || "unknown",
          teacherName: user?.nama || "unknown",
          totalStudents: siswaData.length,
          todayDate: jakartaDate,
          journalsToday: todayJournals.length,
          todayJournalDetails: todayJournals.map((j) => ({
            student: j.nama_siswa,
            nisn: j.nisn,
            date: j.tanggal,
          })),
        });

        const hadirCount =
          attendanceData?.filter((a) => a.status === "Hadir").length || 0;
        const belumAbsenCount =
          siswaData.length - (attendanceData?.length || 0);

        setStats({
          totalSiswa: siswaData.length,
          totalJurnal: 0, // Tidak digunakan lagi
          jurnalHariIni: todayJournals.length,
          hadirHariIni: hadirCount,
          belumAbsen: belumAbsenCount,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) {
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
      {/* Welcome Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Selamat Datang, {user.nama}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Dashboard monitoring siswa PKL yang Anda bimbing
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Siswa"
          value={isLoadingData ? "..." : stats.totalSiswa}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />

        <StatCard
          title="Hadir Hari Ini"
          value={isLoadingData ? "..." : stats.hadirHariIni}
          icon={<CheckCircle className="h-6 w-6" />}
          color="green"
        />

        <StatCard
          title="Belum Absen"
          value={isLoadingData ? "..." : stats.belumAbsen}
          icon={<UserX className="h-6 w-6" />}
          color="red"
        />

        <StatCard
          title="Jurnal Hari Ini"
          value={isLoadingData ? "..." : stats.jurnalHariIni}
          icon={<Calendar className="h-6 w-6" />}
          color="yellow"
          subtitle="dari siswa bimbingan Anda"
        />
      </div>

      {/* Info note */}
      {!isLoadingData && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Catatan:</strong> Dashboard ini menampilkan data hari
                ini saja dari siswa yang Anda bimbing. Statistik jurnal merujuk
                pada jurnal yang dibuat hari ini oleh siswa bimbingan Anda.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Attendance Summary Today */}
        <Card className="mb-3">
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
              <Button href="/guru/absensi" variant="outline" size="sm">
                Lihat Detail
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {todayAttendance.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Belum ada siswa yang melakukan absensi hari ini
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayAttendance.map((attendance) => (
                  <div
                    key={attendance.id_absensi}
                    className={`p-3 rounded-lg border ${
                      attendance.status === "Hadir"
                        ? "bg-green-50 border-green-200"
                        : attendance.status === "Alpha"
                        ? "bg-red-300 border-red-200"
                        : "bg-yellow-200 border-yellow-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {attendance.nama_siswa}
                        </p>
                        <p className="text-sm text-gray-600">
                          {attendance.kelas}
                        </p>
                        {attendance.lokasi && (
                          <div className="mt-1">
                            <LocationLink
                              locationStr={attendance.lokasi}
                              showIcon={true}
                              className="text-xs"
                            />
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            attendance.status === "Hadir"
                              ? "bg-green-100 text-green-800"
                              : attendance.status === "Alpha"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {attendance.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {attendance.jam_absensi}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Show students who haven't attended yet */}
            {stats.belumAbsen > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">
                  {stats.belumAbsen} siswa belum melakukan absensi hari ini
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Journals */}
        <Card className="mb-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Jurnal Hari Ini (
                {new Date().toLocaleDateString("id-ID", {
                  timeZone: "Asia/Jakarta",
                })}
                )
              </CardTitle>
              <Button href="/guru/jurnal" variant="outline" size="sm">
                Lihat Semua
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentJournals.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Belum ada jurnal hari ini
              </p>
            ) : (
              <div className="space-y-4">
                {recentJournals.map((journal) => (
                  <div
                    key={journal.id_jurnal}
                    className="border-l-4 border-green-500 pl-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {journal.nama_siswa}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(journal.tanggal).toLocaleDateString(
                            "id-ID"
                          )}
                          {journal.lokasi && ` • ${journal.lokasi}`}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
                          {journal.deskripsi_kegiatan}
                        </p>
                      </div>
                      <Link
                        href={`/guru/jurnal/${journal.id_jurnal}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Siswa List */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Siswa Bimbingan</CardTitle>
            <Button href="/guru/siswa" variant="outline" size="sm">
              Lihat Semua
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {siswaList.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Belum ada siswa bimbingan
            </p>
          ) : (
            <div className="space-y-3">
              {siswaList.slice(0, 5).map((siswa) => (
                <div
                  key={siswa.nisn}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {siswa.nama_siswa}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {siswa.kelas} • {siswa.nama_dudi}
                    </p>
                  </div>
                  <Link
                    href={`/guru/siswa/${siswa.nisn}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
