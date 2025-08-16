"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  BookOpen,
  Eye,
  FileText,
  Building2,
  GraduationCap,
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

interface JurnalData {
  id_jurnal: string;
  nisn: string;
  nama_siswa: string;
  tanggal: string;
  deskripsi_kegiatan: string;
  evadir_personal: string;
  evadir_sosial: string;
  lokasi: string;
  nama_dudi: string;
}

export default function DetailSiswaPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [siswaData, setSiswaData] = useState<SiswaData | null>(null);
  const [jurnalList, setJurnalList] = useState<JurnalData[]>([]);
  const [filteredJurnal, setFilteredJurnal] = useState<JurnalData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJurnal: 0,
    jurnalBulanIni: 0,
    avgPerBulan: 0,
  });

  const router = useRouter();
  const params = useParams();
  const nisn = params.nisn as string;
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    filterJurnal();
  }, [jurnalList, selectedMonth]);

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
    fetchData(parsedUser.username);
  };

  const fetchData = async (username: string) => {
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

      // Fetch siswa data
      const { data: siswa, error: siswaError } = await supabase
        .from("tb_siswa")
        .select("*")
        .eq("nisn", nisn)
        .eq("id_guru", guruData.id_guru)
        .single();

      if (siswaError) {
        console.error("Error fetching siswa:", siswaError);
        router.push("/guru/siswa");
        return;
      }

      setSiswaData(siswa);

      // Fetch jurnal data
      const { data: jurnal, error: jurnalError } = await supabase
        .from("tb_jurnal")
        .select("*")
        .eq("nisn", nisn)
        .order("tanggal", { ascending: false });

      if (jurnalError) {
        console.error("Error fetching jurnal:", jurnalError);
        return;
      }

      setJurnalList(jurnal || []);
      calculateStats(jurnal || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (journalData: JurnalData[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const jurnalBulanIni = journalData.filter((jurnal) => {
      const jurnalDate = new Date(jurnal.tanggal);
      return (
        jurnalDate.getMonth() === currentMonth &&
        jurnalDate.getFullYear() === currentYear
      );
    }).length;

    // Calculate average per month based on existing data
    const monthsWithData = new Set(
      journalData.map((jurnal) => {
        const date = new Date(jurnal.tanggal);
        return `${date.getFullYear()}-${date.getMonth()}`;
      })
    );

    const avgPerBulan =
      monthsWithData.size > 0
        ? Math.round(journalData.length / monthsWithData.size)
        : 0;

    setStats({
      totalJurnal: journalData.length,
      jurnalBulanIni,
      avgPerBulan,
    });
  };

  const filterJurnal = () => {
    let filtered = jurnalList;

    if (selectedMonth) {
      filtered = filtered.filter((jurnal) => {
        const jurnalDate = new Date(jurnal.tanggal);
        const jurnalMonth = `${jurnalDate.getFullYear()}-${(
          jurnalDate.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}`;
        return jurnalMonth === selectedMonth;
      });
    }

    setFilteredJurnal(filtered);
  };

  const getUniqueMonths = () => {
    const months = jurnalList.map((jurnal) => {
      const date = new Date(jurnal.tanggal);
      return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
    });

    return [...new Set(months)].sort().reverse();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatMonthYear = (monthString: string) => {
    const [year, month] = monthString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  };

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

  if (!siswaData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Data siswa tidak ditemukan
          </h3>
          <p className="mt-2 text-gray-600">
            Siswa tidak ada dalam bimbingan Anda
          </p>
          <Link
            href="/guru/siswa"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Kembali ke Daftar Siswa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/guru/siswa"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Kembali
            </Link>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Detail Siswa Bimbingan
              </h1>
              <p className="text-sm text-gray-600">
                {siswaData.nama_siswa} - {siswaData.kelas}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Siswa Info Card */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Informasi Siswa
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Nama</p>
                  <p className="text-sm text-gray-900">
                    {siswaData.nama_siswa}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">NISN</p>
                  <p className="text-sm text-gray-900">{siswaData.nisn}</p>
                </div>
              </div>
              <div className="flex items-center">
                <GraduationCap className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Kelas</p>
                  <p className="text-sm text-gray-900">{siswaData.kelas}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Tempat PKL
                  </p>
                  <p className="text-sm text-gray-900">{siswaData.nama_dudi}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Jurnal
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalJurnal} jurnal
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
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Jurnal Bulan Ini
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.jurnalBulanIni} jurnal
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
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Rata-rata/Bulan
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.avgPerBulan} jurnal
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Bulan
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Semua Bulan</option>
                {getUniqueMonths().map((month) => (
                  <option key={month} value={month}>
                    {formatMonthYear(month)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Jurnal List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Riwayat Jurnal
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {selectedMonth
                ? `Jurnal bulan ${formatMonthYear(selectedMonth)}`
                : "Semua jurnal siswa"}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deskripsi Kegiatan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lokasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJurnal.map((jurnal) => (
                  <tr key={jurnal.id_jurnal} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(jurnal.tanggal)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {jurnal.deskripsi_kegiatan.length > 100
                          ? `${jurnal.deskripsi_kegiatan.substring(0, 100)}...`
                          : jurnal.deskripsi_kegiatan}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {jurnal.lokasi}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/guru/jurnal/${jurnal.id_jurnal}`}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredJurnal.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Belum ada jurnal
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedMonth
                    ? "Tidak ada jurnal pada bulan yang dipilih"
                    : "Siswa belum membuat jurnal"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
