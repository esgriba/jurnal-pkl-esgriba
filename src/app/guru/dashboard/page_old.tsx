"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Users, Calendar, LogOut, Eye, Search } from "lucide-react";
import DashboardLayout from "@/components/ui/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent, StatCard } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from "@/components/ui/Table";

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
    fetchGuruData(parsedUser.username);
  }, [router]);

  const fetchGuruData = async (username: string) => {
    try {
      // First get guru user data to get the nama
      const { data: userData, error: userError } = await supabase
        .from("tb_user")
        .select("nama")
        .eq("username", username)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        return;
      }

      // Then find guru data by matching nama_guru with user nama
      const { data: guruData, error: guruError } = await supabase
        .from("tb_guru")
        .select("id_guru")
        .eq("nama_guru", userData.nama)
        .single();

      if (guruError) {
        console.error("Error fetching guru data:", guruError);
        return;
      }

      // Fetch siswa yang dibimbing guru ini using id_guru
      const { data: siswa, error: siswaError } = await supabase
        .from("tb_siswa")
        .select("*")
        .eq("id_guru", guruData.id_guru);

      if (!siswaError && siswa) {
        setSiswaList(siswa);

        // Get NISN list
        const nisnList = siswa.map((s) => s.nisn);

        // Fetch total jurnal
        const { count: totalJurnal } = await supabase
          .from("tb_jurnal")
          .select("*", { count: "exact", head: true })
          .in("nisn", nisnList);

        // Fetch jurnal hari ini
        const today = new Date().toISOString().split("T")[0];
        const { count: jurnalHariIni } = await supabase
          .from("tb_jurnal")
          .select("*", { count: "exact", head: true })
          .in("nisn", nisnList)
          .eq("tanggal", today);

        // Fetch recent journals
        const { data: journals } = await supabase
          .from("tb_jurnal")
          .select(
            "id_jurnal, nisn, nama_siswa, tanggal, deskripsi_kegiatan, lokasi"
          )
          .in("nisn", nisnList)
          .order("tanggal", { ascending: false })
          .limit(5);

        setStats({
          totalSiswa: siswa.length,
          totalJurnal: totalJurnal || 0,
          jurnalHariIni: jurnalHariIni || 0,
        });

        setRecentJournals(journals || []);
      }
    } catch (error) {
      console.error("Error fetching guru data:", error);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                Jurnal PKL - Guru
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{user.nama}</span>
                <span className="ml-2 text-gray-500">({user.role})</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Selamat Datang, {user.nama}
          </h1>
          <p className="text-gray-600">
            Dashboard monitoring siswa PKL yang Anda bimbing
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Siswa</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalSiswa}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Jurnal
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalJurnal}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Jurnal Hari Ini
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.jurnalHariIni}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daftar Siswa */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Siswa Bimbingan
                </h3>
                <Link
                  href="/guru/siswa"
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  Lihat Semua
                </Link>
              </div>
            </div>
            <div className="p-6">
              {siswaList.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Belum ada siswa bimbingan
                </p>
              ) : (
                <div className="space-y-4">
                  {siswaList.slice(0, 5).map((siswa) => (
                    <div
                      key={siswa.nisn}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {siswa.nama_siswa}
                        </p>
                        <p className="text-sm text-gray-500">
                          {siswa.kelas} - {siswa.nama_dudi}
                        </p>
                      </div>
                      <Link
                        href={`/guru/siswa/${siswa.nisn}`}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Jurnal Terbaru */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Jurnal Terbaru
                </h3>
                <Link
                  href="/guru/jurnal"
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  Lihat Semua
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentJournals.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Belum ada jurnal
                </p>
              ) : (
                <div className="space-y-4">
                  {recentJournals.map((journal) => (
                    <div
                      key={journal.id_jurnal}
                      className="border-l-4 border-indigo-500 pl-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {journal.nama_siswa}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(journal.tanggal).toLocaleDateString(
                              "id-ID"
                            )}
                            {journal.lokasi && ` • ${journal.lokasi}`}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {journal.deskripsi_kegiatan}
                          </p>
                        </div>
                        <Link
                          href={`/guru/jurnal/${journal.id_jurnal}`}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/guru/siswa"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-indigo-500"
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Kelola Siswa
                </h3>
                <p className="text-sm text-gray-500">
                  Lihat dan kelola data siswa bimbingan
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/guru/jurnal"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500"
          >
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Monitor Jurnal
                </h3>
                <p className="text-sm text-gray-500">Pantau jurnal PKL siswa</p>
              </div>
            </div>
          </Link>

          <Link
            href="/guru/monitoring"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-orange-500"
          >
            <div className="flex items-center">
              <Search className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Monitoring
                </h3>
                <p className="text-sm text-gray-500">
                  Buat catatan monitoring PKL
                </p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
