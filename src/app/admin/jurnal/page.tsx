"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/ui/DashboardLayout";
import {
  BookOpen,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  Calendar,
  Download,
} from "lucide-react";
import Link from "next/link";
import { showConfirmation, showSuccess, showError } from "@/lib/customAlert";

interface Jurnal {
  id_jurnal: string;
  nisn: string;
  nama_siswa: string;
  kelas?: string;
  tanggal: string;
  deskripsi_kegiatan: string;
  lokasi: string;
  evadir_personal: string;
  evadir_sosial: string;
  nama_guru: string;
  nama_dudi: string;
  created_at: string;
}

export default function AdminJurnalPage() {
  const [jurnal, setJurnal] = useState<Jurnal[]>([]);
  const [filteredJurnal, setFilteredJurnal] = useState<Jurnal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUser();
    fetchJurnal();
  }, []);

  useEffect(() => {
    filterJurnal();
  }, [jurnal, searchTerm, dateFilter]);

  const checkUser = () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      router.push("/login");
      return;
    }

    setCurrentUser(parsedUser);
  };

  const fetchJurnal = async () => {
    try {
      const { data, error } = await supabase
        .from("tb_jurnal")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setJurnal(data || []);
    } catch (error) {
      console.error("Error fetching jurnal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterJurnal = () => {
    let filtered = jurnal;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (j) =>
          j.id_jurnal.toLowerCase().includes(searchTerm.toLowerCase()) ||
          j.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
          j.deskripsi_kegiatan
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          j.nama_guru.toLowerCase().includes(searchTerm.toLowerCase()) ||
          j.nama_dudi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter((j) => j.tanggal === dateFilter);
    }

    setFilteredJurnal(filtered);
  };

  const handleDelete = async (idJurnal: string) => {
    const confirmed = await showConfirmation(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus jurnal ini?",
      "Ya, Hapus",
      "Batal"
    );

    if (!confirmed) {
      return;
    }

    try {
      const { error } = await supabase
        .from("tb_jurnal")
        .delete()
        .eq("id_jurnal", idJurnal);

      if (error) throw error;

      // Refresh jurnal list
      fetchJurnal();
      showSuccess(
        "Jurnal Berhasil Dihapus",
        "Data jurnal telah dihapus dari sistem"
      );
    } catch (error) {
      console.error("Error deleting jurnal:", error);
      showError("Gagal Menghapus", "Error menghapus jurnal");
    }
  };

  const exportToCSV = () => {
    if (filteredJurnal.length === 0) {
      showError("Tidak Ada Data", "Tidak ada data untuk diekspor");
      return;
    }

    const headers = [
      "ID Jurnal",
      "NISN",
      "Nama Siswa",
      "Tanggal",
      "Deskripsi Kegiatan",
      "Lokasi",
      "Evaluasi Personal",
      "Evaluasi Sosial",
      "Guru Pembimbing",
      "DUDI",
      "Dibuat",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredJurnal.map((j) =>
        [
          j.id_jurnal,
          j.nisn,
          `"${j.nama_siswa}"`,
          j.tanggal,
          `"${j.deskripsi_kegiatan.replace(/"/g, '""')}"`,
          `"${j.lokasi}"`,
          `"${j.evadir_personal.replace(/"/g, '""')}"`,
          `"${j.evadir_sosial.replace(/"/g, '""')}"`,
          `"${j.nama_guru}"`,
          `"${j.nama_dudi}"`,
          new Date(j.created_at).toLocaleDateString("id-ID"),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `jurnal_pkl_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading jurnal...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link
                href="/admin/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back
              </Link>
              <div className="flex items-center">
                <BookOpen className="h-6 w-6 text-indigo-600 mr-2" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Manajemen Jurnal PKL
                </h1>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Filters and Actions */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari ID, nama siswa, deskripsi..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-80"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Date Filter */}
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>
                </div>

                {/* Export Button */}
                <button
                  onClick={exportToCSV}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Jurnal Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Daftar Jurnal PKL ({filteredJurnal.length})
                </h3>
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter("")}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Clear date filter
                  </button>
                )}
              </div>

              {filteredJurnal.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Tidak ada jurnal
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || dateFilter
                      ? "Tidak ada jurnal yang sesuai dengan filter"
                      : "Belum ada jurnal yang dibuat siswa"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Siswa
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kegiatan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pembimbing
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          DUDI
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredJurnal.map((j) => (
                        <tr key={j.id_jurnal} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {j.nama_siswa}
                              </div>
                              <div className="text-sm text-gray-500">
                                NISN: {j.nisn}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {j.id_jurnal}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {j.tanggal}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(j.created_at).toLocaleDateString(
                                "id-ID"
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {j.deskripsi_kegiatan}
                            </div>
                            <div className="text-sm text-gray-500">
                              Lokasi: {j.lokasi || "Tidak disebutkan"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {j.nama_guru}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {j.nama_dudi}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <Link
                                href={`/admin/jurnal/${j.id_jurnal}`}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Lihat Detail"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => handleDelete(j.id_jurnal)}
                                className="text-red-600 hover:text-red-900"
                                title="Hapus"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
