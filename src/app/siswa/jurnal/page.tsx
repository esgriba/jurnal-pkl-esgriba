"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Calendar, MapPin, Eye, Search, Filter, X } from "lucide-react";
import Link from "next/link";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import { id } from "date-fns/locale";
import DashboardLayout from "@/components/ui/DashboardLayout";

interface UserData {
  id: number;
  username: string;
  nama: string;
  role: string;
}

interface JurnalData {
  id_jurnal: string;
  tanggal: string;
  deskripsi_kegiatan: string;
  lokasi: string;
  evadir_personal: string;
  evadir_sosial: string;
  foto_kegiatan: string;
}

export default function JurnalListPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [journals, setJournals] = useState<JurnalData[]>([]);
  const [filteredJournals, setFilteredJournals] = useState<JurnalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const supabase = createClient();

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
    fetchJournals(parsedUser.username);
  }, [router]);

  const fetchJournals = async (username: string) => {
    try {
      // First get user data to get the nama
      const { data: userData, error: userError } = await supabase
        .from("tb_user")
        .select("nama")
        .eq("username", username)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        return;
      }

      // Then find siswa data by matching nama_siswa with user nama
      const { data: siswaData, error: siswaError } = await supabase
        .from("tb_siswa")
        .select("nisn")
        .eq("nama_siswa", userData.nama)
        .single();

      if (siswaError) {
        console.error("Error fetching siswa data:", siswaError);
        return;
      }

      // Now fetch journals using the NISN
      const { data, error } = await supabase
        .from("tb_jurnal")
        .select("*")
        .eq("nisn", siswaData.nisn)
        .order("tanggal", { ascending: false });

      if (error) {
        console.error("Error fetching journals:", error);
        return;
      }

      setJournals(data || []);
      setFilteredJournals(data || []);
    } catch (error) {
      console.error("Error in fetchJournals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...journals];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (journal) =>
          journal.deskripsi_kegiatan
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          journal.lokasi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          journal.evadir_personal
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          journal.evadir_sosial
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Apply date filters
    if (selectedMonth && selectedYear) {
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth) - 1; // JavaScript months are 0-indexed
      const monthStart = startOfMonth(new Date(year, month));
      const monthEnd = endOfMonth(new Date(year, month));

      filtered = filtered.filter((journal) => {
        const journalDate = parseISO(journal.tanggal);
        return isWithinInterval(journalDate, {
          start: monthStart,
          end: monthEnd,
        });
      });
    } else if (selectedYear) {
      filtered = filtered.filter((journal) => {
        const journalDate = parseISO(journal.tanggal);
        return journalDate.getFullYear() === parseInt(selectedYear);
      });
    }

    setFilteredJournals(filtered);
  }, [journals, searchQuery, selectedMonth, selectedYear]);

  // Get available years from journals
  const availableYears = Array.from(
    new Set(journals.map((journal) => parseISO(journal.tanggal).getFullYear()))
  ).sort((a, b) => b - a);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedMonth("");
    setSelectedYear("");
    setShowFilters(false);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedMonth || selectedYear;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardLayout userRole="siswa">
        {/* iOS Style Clean Header */}
        <div className="bg-white border-b border-gray-200 mb-8">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                  Jurnal
                </h1>
                <p className="mt-1 text-gray-600 font-medium">
                  {filteredJournals.length}{" "}
                  {filteredJournals.length === 1 ? "jurnal" : "jurnal"}
                  {hasActiveFilters && ` dari ${journals.length} total`}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-3 rounded-lg transition-colors duration-200 flex items-center ${
                    hasActiveFilters
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Filter className="h-5 w-5" />
                </button>
                <Link
                  href="/siswa/jurnal/create"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Buat
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="px-6 mb-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari jurnal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Filter</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Hapus Filter
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tahun
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Semua Tahun</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Month Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bulan
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!selectedYear}
                  >
                    <option value="">Semua Bulan</option>
                    <option value="1">Januari</option>
                    <option value="2">Februari</option>
                    <option value="3">Maret</option>
                    <option value="4">April</option>
                    <option value="5">Mei</option>
                    <option value="6">Juni</option>
                    <option value="7">Juli</option>
                    <option value="8">Agustus</option>
                    <option value="9">September</option>
                    <option value="10">Oktober</option>
                    <option value="11">November</option>
                    <option value="12">Desember</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* iOS Style Journal List */}
        <div className="px-6">
          {filteredJournals.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              {hasActiveFilters ? (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Tidak Ada Jurnal Ditemukan
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                    Tidak ada jurnal yang sesuai dengan filter yang dipilih.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 inline-flex items-center"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Hapus Filter
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Belum Ada Jurnal
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                    Mulai dokumentasikan kegiatan PKL Anda dengan membuat jurnal
                    pertama.
                  </p>
                  <Link
                    href="/siswa/jurnal/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 inline-flex items-center"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Buat Jurnal Pertama
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJournals.map((journal) => (
                <div
                  key={journal.id_jurnal}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-3">
                          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            {format(parseISO(journal.tanggal), "dd MMM yyyy", {
                              locale: id,
                            })}
                          </span>
                          {journal.lokasi && (
                            <span className="ml-3 text-sm text-gray-500 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {journal.lokasi}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                          {journal.deskripsi_kegiatan}
                        </h3>
                        <div className="space-y-2">
                          {journal.evadir_personal && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">
                                Evaluasi Personal:
                              </span>{" "}
                              <span className="text-gray-800">
                                {journal.evadir_personal}
                              </span>
                            </div>
                          )}
                          {journal.evadir_sosial && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">
                                Evaluasi Sosial:
                              </span>{" "}
                              <span className="text-gray-800">
                                {journal.evadir_sosial}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-6 flex-shrink-0">
                        <Link
                          href={`/siswa/jurnal/${journal.id_jurnal}`}
                          className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 inline-flex items-center"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </div>
  );
}
