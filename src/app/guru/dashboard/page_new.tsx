"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Users, Calendar, LogOut, Eye, Search } from "lucide-react";
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

export default function GuruDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [siswaList, setSiswaList] = useState<SiswaData[]>([]);
  const [recentJournals, setRecentJournals] = useState<JurnalData[]>([]);
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalJurnal: 0,
    jurnalHariIni: 0,
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
      // Fetch siswa yang dibimbing
      const { data: siswaData, error: siswaError } = await supabase
        .from("siswa")
        .select("nisn, nama_siswa, kelas, nama_dudi")
        .eq("username_guru", username);

      if (siswaError) throw siswaError;
      setSiswaList(siswaData || []);

      // Fetch jurnal terbaru
      if (siswaData && siswaData.length > 0) {
        const nisnList = siswaData.map((s) => s.nisn);
        const { data: jurnalData, error: jurnalError } = await supabase
          .from("jurnal")
          .select(
            `
            id_jurnal,
            nisn,
            tanggal,
            deskripsi_kegiatan,
            lokasi,
            siswa!inner(nama_siswa)
          `
          )
          .in("nisn", nisnList)
          .order("tanggal", { ascending: false })
          .limit(5);

        if (jurnalError) throw jurnalError;

        const formattedJurnal =
          jurnalData?.map((j) => ({
            ...j,
            nama_siswa: (j.siswa as any)?.nama_siswa || "",
          })) || [];

        setRecentJournals(formattedJurnal);

        // Calculate stats
        const today = new Date().toISOString().split("T")[0];
        const todayJournals =
          jurnalData?.filter((j) => j.tanggal === today) || [];

        setStats({
          totalSiswa: siswaData.length,
          totalJurnal: jurnalData?.length || 0,
          jurnalHariIni: todayJournals.length,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Total Siswa"
          value={stats.totalSiswa}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />

        <StatCard
          title="Total Jurnal"
          value={stats.totalJurnal}
          icon={<BookOpen className="h-6 w-6" />}
          color="green"
        />

        <StatCard
          title="Jurnal Hari Ini"
          value={stats.jurnalHariIni}
          icon={<Calendar className="h-6 w-6" />}
          color="yellow"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Siswa List */}
        <Card>
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

        {/* Recent Journals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Jurnal Terbaru</CardTitle>
              <Button href="/guru/jurnal" variant="outline" size="sm">
                Lihat Semua
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentJournals.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Belum ada jurnal</p>
            ) : (
              <div className="space-y-4">
                {recentJournals.map((journal) => (
                  <div
                    key={journal.id_jurnal}
                    className="border-l-4 border-blue-500 pl-4"
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <Users className="h-6 w-6 text-blue-600" />
                <h3 className="ml-2 text-lg font-medium text-gray-900">
                  Kelola Siswa
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Lihat dan kelola data siswa bimbingan
              </p>
              <Button href="/guru/siswa" size="sm" className="w-full">
                Kelola Siswa
              </Button>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <BookOpen className="h-6 w-6 text-green-600" />
                <h3 className="ml-2 text-lg font-medium text-gray-900">
                  Monitor Jurnal
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Pantau dan evaluasi jurnal PKL siswa
              </p>
              <Button
                href="/guru/jurnal"
                variant="success"
                size="sm"
                className="w-full"
              >
                Monitor Jurnal
              </Button>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <Search className="h-6 w-6 text-orange-600" />
                <h3 className="ml-2 text-lg font-medium text-gray-900">
                  Monitoring
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Buat catatan monitoring dan penilaian PKL
              </p>
              <Button href="#" variant="warning" size="sm" className="w-full">
                Buat Monitoring
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
