"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Calendar,
  Search,
  Filter,
  Eye,
  Trash2,
  ArrowLeft,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface Absensi {
  id_absensi: number;
  nisn: string;
  nama_siswa: string;
  kelas: string;
  lokasi: string;
  id_dudi: string;
  nama_dudi: string;
  tanggal: string;
  status: string;
  keterangan: string;
  id_guru: string;
  nama_guru: string;
  jam_absensi: string;
  created_at: string;
}

export default function AdminAbsensiPage() {
  const [absensi, setAbsensi] = useState<Absensi[]>([]);
  const [filteredAbsensi, setFilteredAbsensi] = useState<Absensi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  // Helper function to get WIB time
  const getWIBTime = () => {
    const nowUTC = new Date();
    return new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000); // Add 7 hours for WIB
  };

  // State for current time display
  const [currentWIBTime, setCurrentWIBTime] = useState(getWIBTime());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWIBTime(getWIBTime());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    checkUser();
    fetchAbsensi();
  }, []);

  useEffect(() => {
    filterAbsensi();
  }, [absensi, searchTerm, statusFilter, dateFilter]);

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

  const fetchAbsensi = async () => {
    try {
      const { data, error } = await supabase
        .from("tb_absensi")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAbsensi(data || []);
    } catch (error) {
      console.error("Error fetching absensi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAbsensi = () => {
    let filtered = absensi;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.nisn.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.nama_guru.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.nama_dudi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter((a) => a.tanggal === dateFilter);
    }

    setFilteredAbsensi(filtered);
  };

  const handleDelete = async (idAbsensi: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data absensi ini?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("tb_absensi")
        .delete()
        .eq("id_absensi", idAbsensi);

      if (error) throw error;

      // Refresh absensi list
      fetchAbsensi();
      alert("Data absensi berhasil dihapus");
    } catch (error) {
      console.error("Error deleting absensi:", error);
      alert("Error menghapus data absensi");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Hadir":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Sakit":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "Izin":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "Alpha":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Hadir":
        return "bg-green-100 text-green-800";
      case "Sakit":
        return "bg-yellow-100 text-yellow-800";
      case "Izin":
        return "bg-blue-100 text-blue-800";
      case "Alpha":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const exportToCSV = () => {
    if (filteredAbsensi.length === 0) {
      alert("Tidak ada data untuk diekspor");
      return;
    }

    const headers = [
      "ID",
      "NISN",
      "Nama Siswa",
      "Kelas",
      "Tanggal",
      "Status",
      "Jam Absensi",
      "Lokasi",
      "Keterangan",
      "Guru Pembimbing",
      "DUDI",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredAbsensi.map((a) =>
        [
          a.id_absensi,
          a.nisn,
          `"${a.nama_siswa}"`,
          `"${a.kelas}"`,
          a.tanggal,
          a.status,
          a.jam_absensi || "",
          `"${a.lokasi || ""}"`,
          `"${a.keterangan || ""}"`,
          `"${a.nama_guru}"`,
          `"${a.nama_dudi}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `absensi_pkl_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAutoAlpha = async () => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menjalankan Auto Alpha? Ini akan memberikan status Alpha untuk semua siswa yang belum absen hari ini."
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/auto-alpha", {
        method: "POST",
      });

      const result = await response.json();

      console.log("Auto Alpha API Response:", result);

      if (response.ok) {
        // Handle different response types
        if (result.processed !== undefined) {
          if (result.processed > 0) {
            alert(
              `Auto Alpha berhasil! ${result.processed} siswa yang belum absen sampai jam 3 sore diberi status Alpha.`
            );
          } else {
            alert(
              result.message ||
                "Semua siswa sudah melakukan absensi hari ini. Tidak ada yang perlu diberi status Alpha."
            );
          }
          // Refresh data
          fetchAbsensi();
        } else if (result.message) {
          // Handle case when it's before 3 PM
          alert(result.message);
        } else {
          alert("Auto Alpha berhasil dijalankan!");
          fetchAbsensi();
        }
      } else {
        throw new Error(result.error || "Gagal menjalankan auto alpha");
      }
    } catch (error) {
      console.error("Error running auto alpha:", error);
      alert("Gagal menjalankan auto alpha. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading absensi...</p>
        </div>
      </div>
    );
  }

  return (
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
              <Calendar className="h-6 w-6 text-indigo-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">
                Manajemen Absensi PKL
              </h1>
            </div>
            <div className="ml-auto flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Waktu WIB:</span>{" "}
                {currentWIBTime.toLocaleString("id-ID")}
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  currentWIBTime.getHours() >= 15
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                Auto Alpha{" "}
                {currentWIBTime.getHours() >= 15 ? "Aktif" : "Nonaktif"}
              </div>
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
                    placeholder="Cari NISN, nama siswa, kelas..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Semua Status</option>
                    <option value="Hadir">Hadir</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Izin">Izin</option>
                    <option value="Alpha">Alpha</option>
                  </select>
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

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleAutoAlpha}
                  disabled={isLoading}
                  className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    getWIBTime().getHours() >= 15
                      ? "border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 focus:ring-orange-500"
                      : "border-gray-300 text-gray-500 bg-gray-50 cursor-not-allowed"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  title={
                    getWIBTime().getHours() < 15
                      ? `Auto Alpha akan aktif pada jam 15:00 WIB. Sekarang jam ${getWIBTime().getHours()}:${String(
                          getWIBTime().getMinutes()
                        ).padStart(2, "0")} WIB`
                      : "Klik untuk menjalankan Auto Alpha"
                  }
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {isLoading
                    ? "Memproses..."
                    : `Auto Alpha ${
                        getWIBTime().getHours() >= 15
                          ? "(Aktif)"
                          : "(Nonaktif sampai 15:00)"
                      }`}
                </button>

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
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {["Hadir", "Sakit", "Izin", "Alpha"].map((status) => {
            const count = filteredAbsensi.filter(
              (a) => a.status === status
            ).length;
            return (
              <div
                key={status}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">{getStatusIcon(status)}</div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {status}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {count}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Absensi Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Data Absensi PKL ({filteredAbsensi.length})
              </h3>
              {(statusFilter !== "all" || dateFilter) && (
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setDateFilter("");
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Clear filters
                </button>
              )}
            </div>

            {filteredAbsensi.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Tidak ada data absensi
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== "all" || dateFilter
                    ? "Tidak ada data absensi yang sesuai dengan filter"
                    : "Belum ada data absensi yang diinput"}
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
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lokasi
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
                    {filteredAbsensi.map((a) => (
                      <tr key={a.id_absensi} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {a.nama_siswa}
                            </div>
                            <div className="text-sm text-gray-500">
                              {a.kelas} - NISN: {a.nisn}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {a.tanggal}
                          </div>
                          <div className="text-sm text-gray-500">
                            {a.jam_absensi
                              ? `Jam: ${a.jam_absensi}`
                              : "Jam tidak tercatat"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                              a.status
                            )}`}
                          >
                            {getStatusIcon(a.status)}
                            <span className="ml-1">{a.status}</span>
                          </span>
                          {a.keterangan && (
                            <div className="text-xs text-gray-500 mt-1">
                              {a.keterangan}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {a.lokasi || "Tidak disebutkan"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {a.nama_dudi}
                          </div>
                          <div className="text-sm text-gray-500">
                            {a.nama_guru}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleDelete(a.id_absensi)}
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
  );
}
