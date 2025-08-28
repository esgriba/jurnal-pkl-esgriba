"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "../../../components/ui/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  BookOpen,
  Search,
  Filter,
  Calendar,
  Eye,
  FileText,
  User,
  MapPin,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface Jurnal {
  id_jurnal: string;
  nisn: string;
  nama_siswa: string;
  tanggal: string;
  deskripsi_kegiatan: string;
  lokasi: string;
  evadir_personal: string;
  evadir_sosial: string;
  foto_kegiatan: string;
  created_at: string;
  id_dudi: string;
  nama_dudi: string;
}

interface Siswa {
  nisn: string;
  nama_siswa: string;
  kelas: string;
  nama_dudi: string;
}

export default function GuruJurnalPage() {
  const [user, setUser] = useState<any>(null);
  const [jurnalList, setJurnalList] = useState<Jurnal[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [filteredJurnal, setFilteredJurnal] = useState<Jurnal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSiswa, setSelectedSiswa] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
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

  useEffect(() => {
    filterJurnal();
  }, [jurnalList, searchTerm, selectedSiswa, selectedMonth]);

  const fetchData = async (username: string) => {
    try {
      setIsLoading(true);

      // Get siswa yang dibimbing
      const { data: siswaData, error: siswaError } = await supabase
        .from("tb_siswa")
        .select("nisn, nama_siswa, kelas, nama_dudi")
        .eq("id_guru", username);

      if (siswaError) throw siswaError;
      setSiswaList(siswaData || []);

      if (siswaData && siswaData.length > 0) {
        const nisnList = siswaData.map((s) => s.nisn);

        // Get jurnal data
        const { data: jurnalData, error: jurnalError } = await supabase
          .from("tb_jurnal")
          .select("*")
          .in("nisn", nisnList)
          .order("tanggal", { ascending: false });

        if (jurnalError) throw jurnalError;
        setJurnalList(jurnalData || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterJurnal = () => {
    let filtered = jurnalList;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (jurnal) =>
          jurnal.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
          jurnal.deskripsi_kegiatan
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          jurnal.lokasi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by siswa
    if (selectedSiswa !== "all") {
      filtered = filtered.filter((jurnal) => jurnal.nisn === selectedSiswa);
    }

    // Filter by month
    if (selectedMonth) {
      filtered = filtered.filter((jurnal) =>
        jurnal.tanggal.startsWith(selectedMonth)
      );
    }

    setFilteredJurnal(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout userRole="guru">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Jurnal PKL Siswa
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola dan pantau jurnal PKL siswa bimbingan Anda
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Jurnal
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {jurnalList.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Siswa Aktif
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {siswaList.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bulan Ini</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      filteredJurnal.filter((j) =>
                        j.tanggal.startsWith(selectedMonth)
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hari Ini</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      jurnalList.filter(
                        (j) =>
                          j.tanggal === new Date().toISOString().split("T")[0]
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari jurnal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Siswa Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={selectedSiswa}
                  onChange={(e) => setSelectedSiswa(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">Semua Siswa</option>
                  {siswaList.map((siswa) => (
                    <option key={siswa.nisn} value={siswa.nisn}>
                      {siswa.nama_siswa} - {siswa.kelas}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Filter */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jurnal List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Daftar Jurnal ({filteredJurnal.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : filteredJurnal.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Tidak ada jurnal ditemukan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJurnal.map((jurnal) => (
                  <div
                    key={jurnal.id_jurnal}
                    className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                            {jurnal.nama_siswa}
                          </h3>
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                            ({jurnal.nisn})
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{formatDate(jurnal.tanggal)}</span>
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 ml-2 sm:ml-4 flex-shrink-0" />
                            <span className="truncate">{formatTime(jurnal.created_at)}</span>
                          </div>

                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{jurnal.lokasi}</span>
                          </div>

                          <p className="text-gray-800 mt-2 text-sm sm:text-base">
                            {jurnal.deskripsi_kegiatan.length > 150
                              ? `${jurnal.deskripsi_kegiatan.substring(
                                  0,
                                  150
                                )}...`
                              : jurnal.deskripsi_kegiatan}
                          </p>

                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm">
                            <span className="text-blue-600">
                              <strong>Personal:</strong>{" "}
                              {jurnal.evadir_personal}
                            </span>
                            <span className="text-green-600">
                              <strong>Sosial:</strong> {jurnal.evadir_sosial}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end items-start ml-2 flex-shrink-0">
                        <Link href={`/guru/jurnal/${jurnal.id_jurnal}`}>
                          <button
                            className="inline-flex items-center justify-center w-8 h-8 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-full transition-colors duration-200"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
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
