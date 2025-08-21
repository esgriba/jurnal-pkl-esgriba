"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/ui/DashboardLayout";
import {
  Users,
  BookOpen,
  Calendar,
  Eye,
  Search,
  ArrowLeft,
  MapPin,
  Building2,
} from "lucide-react";
import Link from "next/link";

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
  id_guru: string;
  id_dudi: string;
}

interface JurnalStats {
  totalJurnal: number;
  jurnalBulanIni: number;
  lastEntry: string | null;
}

export default function GuruSiswaPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [siswaList, setSiswaList] = useState<SiswaData[]>([]);
  const [filteredSiswa, setFilteredSiswa] = useState<SiswaData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [jurnalStats, setJurnalStats] = useState<Record<string, JurnalStats>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    filterSiswa();
  }, [siswaList, searchTerm]);

  const checkUser = () => {
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
  };

  const fetchGuruData = async (username: string) => {
    try {
      setIsLoading(true);

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

      if (siswaError) {
        console.error("Error fetching siswa:", siswaError);
        return;
      }

      setSiswaList(siswa || []);

      // Fetch jurnal stats for each siswa
      if (siswa && siswa.length > 0) {
        await fetchJurnalStats(siswa);
      }
    } catch (err) {
      console.error("Error fetching guru data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJurnalStats = async (siswaList: SiswaData[]) => {
    const stats: Record<string, JurnalStats> = {};

    for (const siswa of siswaList) {
      try {
        // Total jurnal
        const { count: totalJurnal } = await supabase
          .from("tb_jurnal")
          .select("*", { count: "exact", head: true })
          .eq("nisn", siswa.nisn);

        // Jurnal bulan ini
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const startOfMonthStr = startOfMonth.toISOString().split("T")[0];

        const { count: jurnalBulanIni } = await supabase
          .from("tb_jurnal")
          .select("*", { count: "exact", head: true })
          .eq("nisn", siswa.nisn)
          .gte("tanggal", startOfMonthStr);

        // Last entry
        const { data: lastJurnal } = await supabase
          .from("tb_jurnal")
          .select("tanggal")
          .eq("nisn", siswa.nisn)
          .order("tanggal", { ascending: false })
          .limit(1);

        stats[siswa.nisn] = {
          totalJurnal: totalJurnal || 0,
          jurnalBulanIni: jurnalBulanIni || 0,
          lastEntry:
            lastJurnal && lastJurnal.length > 0 ? lastJurnal[0].tanggal : null,
        };
      } catch (error) {
        console.error(`Error fetching stats for ${siswa.nisn}:`, error);
        stats[siswa.nisn] = {
          totalJurnal: 0,
          jurnalBulanIni: 0,
          lastEntry: null,
        };
      }
    }

    setJurnalStats(stats);
  };

  const filterSiswa = () => {
    let filtered = siswaList;

    if (searchTerm) {
      filtered = filtered.filter(
        (siswa) =>
          siswa.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
          siswa.nisn.includes(searchTerm) ||
          siswa.kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
          siswa.nama_dudi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSiswa(filtered);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Belum ada";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getActivityStatus = (lastEntry: string | null) => {
    if (!lastEntry) return { text: "Belum aktif", color: "text-red-600" };

    const lastDate = new Date(lastEntry);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1)
      return { text: "Aktif hari ini", color: "text-green-600" };
    if (diffDays <= 3) return { text: "Aktif", color: "text-blue-600" };
    if (diffDays <= 7)
      return { text: "Kurang aktif", color: "text-yellow-600" };
    return { text: "Tidak aktif", color: "text-red-600" };
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="guru">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="guru">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link
                href="/guru/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Kembali
              </Link>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  Siswa Bimbingan
                </h1>
                <p className="text-sm text-gray-600">Guru: {user?.nama}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Siswa Bimbingan
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {siswaList.length} siswa
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Jurnal
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {Object.values(jurnalStats).reduce(
                          (sum, stats) => sum + stats.totalJurnal,
                          0
                        )}{" "}
                        jurnal
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Jurnal Bulan Ini
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {Object.values(jurnalStats).reduce(
                          (sum, stats) => sum + stats.jurnalBulanIni,
                          0
                        )}{" "}
                        jurnal
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="p-6">
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari Siswa
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama, NISN, kelas, atau tempat PKL..."
                    className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Siswa List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Daftar Siswa Bimbingan
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Monitoring siswa yang Anda bimbing
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Siswa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tempat PKL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jurnal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktivitas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSiswa.map((siswa) => {
                    const stats = jurnalStats[siswa.nisn] || {
                      totalJurnal: 0,
                      jurnalBulanIni: 0,
                      lastEntry: null,
                    };
                    const activityStatus = getActivityStatus(stats.lastEntry);

                    return (
                      <tr key={siswa.nisn} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {siswa.nama_siswa}
                            </div>
                            <div className="text-sm text-gray-500">
                              NISN: {siswa.nisn} • {siswa.kelas}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm text-gray-900">
                                {siswa.nama_dudi}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Total: {stats.totalJurnal}
                          </div>
                          <div className="text-sm text-gray-500">
                            Bulan ini: {stats.jurnalBulanIni}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`text-sm font-medium ${activityStatus.color}`}
                          >
                            {activityStatus.text}
                          </div>
                          <div className="text-sm text-gray-500">
                            Terakhir: {formatDate(stats.lastEntry)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/guru/siswa/${siswa.nisn}`}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredSiswa.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {searchTerm
                      ? "Tidak ada siswa yang sesuai"
                      : "Belum ada siswa bimbingan"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm
                      ? "Coba gunakan kata kunci yang lain"
                      : "Hubungi admin untuk mendapatkan siswa bimbingan"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
