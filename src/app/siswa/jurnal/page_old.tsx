"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Calendar, MapPin, Eye, Search } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import DashboardLayout from "@/components/ui/DashboardLayout";
import Button from "@/components/ui/Button";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
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

  // Remove search and filter functionality for iOS clean design
  useEffect(() => {
    setFilteredJournals(journals);
  }, [journals]);

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
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterJournals = () => {
    let filtered = journals;

    if (searchTerm) {
      filtered = filtered.filter(
        (journal) =>
          journal.deskripsi_kegiatan
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          journal.lokasi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMonth) {
      filtered = filtered.filter((journal) => {
        const journalMonth = journal.tanggal.substring(0, 7); // YYYY-MM format
        return journalMonth === selectedMonth;
      });
    }

    setFilteredJournals(filtered);
  };

  const getUniqueMonths = () => {
    const months = journals.map((journal) => journal.tanggal.substring(0, 7));
    return [...new Set(months)].sort().reverse();
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
                  {journals.length} {journals.length === 1 ? 'jurnal' : 'jurnal'}
                </p>
              </div>
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

        {/* iOS Style Journal List */}
        <div className="px-6">
          {journals.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Belum Ada Jurnal
              </h3>
              <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                Mulai dokumentasikan kegiatan PKL Anda dengan membuat jurnal pertama.
              </p>
              <Link
                href="/siswa/jurnal/create"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Buat Jurnal Pertama
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {journals.map((journal) => (
                <div
                  key={journal.id_jurnal}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-3">
                          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            {format(parseISO(journal.tanggal), "dd MMM yyyy", { locale: id })}
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
                              <span className="font-medium">Evaluasi Personal:</span>{" "}
                              <span className="text-gray-800">{journal.evadir_personal}</span>
                            </div>
                          )}
                          {journal.evadir_sosial && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Evaluasi Sosial:</span>{" "}
                              <span className="text-gray-800">{journal.evadir_sosial}</span>
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
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-xl">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-900 mb-1">
              {filteredJournals.length}
            </div>
            <div className="text-blue-700 font-medium">Total Jurnal</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-xl">
                <MapPin className="h-6 w-6" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-900 mb-1">
              {journals.length}
            </div>
            <div className="text-green-700 font-medium">Semua Jurnal</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl p-6 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-3 rounded-xl">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-900 mb-1">
              {getUniqueMonths().length}
            </div>
            <div className="text-orange-700 font-medium">Bulan Aktif</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">Filter Jurnal</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-semibold text-gray-700 mb-3"
                >
                  Cari Jurnal
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all duration-200"
                    placeholder="Cari berdasarkan kegiatan atau lokasi..."
                  />
                </div>
              </div>
            </div>
            <div>
              <label
                htmlFor="month"
                className="block text-sm font-semibold text-gray-700 mb-3"
              >
                Filter Bulan
              </label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all duration-200"
              >
                <option value="">Semua Bulan</option>
                {getUniqueMonths().map((month) => (
                  <option key={month} value={month}>
                    {format(parseISO(month + "-01"), "MMMM yyyy", {
                      locale: id,
                    })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-xl">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-900 mb-1">
              {journals.length}
            </div>
            <div className="text-blue-700 font-medium">Total Jurnal</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-xl">
                <Search className="h-6 w-6" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-900 mb-1">
              {filteredJournals.length}
            </div>
            <div className="text-green-700 font-medium">Hasil Pencarian</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl p-6 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-3 rounded-xl">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-900 mb-1">
              {getUniqueMonths().length}
            </div>
            <div className="text-orange-700 font-medium">Bulan Aktif</div>
          </div>
        </div>

        {/* Journal List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-white mr-3" />
              <h3 className="text-lg font-semibold text-white">Jurnal PKL</h3>
            </div>
          </div>
          <div className="p-6">
            {filteredJournals.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Calendar className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Belum Ada Jurnal
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Anda belum membuat jurnal PKL. Mulai dokumentasikan kegiatan
                  PKL Anda dengan membuat jurnal pertama.
                </p>
                <Button
                  href="/siswa/jurnal/create"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Buat Jurnal Pertama
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJournals.map((journal, index) => (
                  <div
                    key={journal.id_jurnal}
                    className="group bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 hover:border-indigo-300 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                            {format(parseISO(journal.tanggal), "dd MMM yyyy", {
                              locale: id,
                            })}
                          </div>
                          {journal.lokasi && (
                            <div className="flex items-center bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-sm font-medium">
                              <MapPin className="h-4 w-4 mr-1" />
                              {journal.lokasi}
                            </div>
                          )}
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                          {journal.deskripsi_kegiatan}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {journal.evadir_personal && (
                            <div className="bg-blue-50 p-3 rounded-xl">
                              <div className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">
                                Evaluasi Personal
                              </div>
                              <div className="text-blue-800 text-sm">
                                {journal.evadir_personal}
                              </div>
                            </div>
                          )}
                          {journal.evadir_sosial && (
                            <div className="bg-purple-50 p-3 rounded-xl">
                              <div className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">
                                Evaluasi Sosial
                              </div>
                              <div className="text-purple-800 text-sm">
                                {journal.evadir_sosial}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-6">
                        <Link
                          href={`/siswa/jurnal/${journal.id_jurnal}`}
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-110 inline-flex items-center justify-center group-hover:shadow-lg"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}
