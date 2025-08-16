"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  UserCheck,
  Edit,
  Save,
  X,
  Plus,
  ArrowLeft,
  Search,
  BookOpen,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

interface SiswaData {
  nisn: string;
  nama_siswa: string;
  kelas: string;
  id_guru: string;
  nama_guru: string;
  nama_dudi: string;
}

interface GuruData {
  id_guru: string;
  nama_guru: string;
  nip?: string;
}

interface Assignment {
  nisn: string;
  nama_siswa: string;
  kelas: string;
  id_guru: string;
  nama_guru: string;
  nama_dudi: string;
}

export default function PembimbingManagementPage() {
  const [siswaList, setSiswaList] = useState<SiswaData[]>([]);
  const [guruList, setGuruList] = useState<GuruData[]>([]);
  const [filteredSiswa, setFilteredSiswa] = useState<SiswaData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuru, setSelectedGuru] = useState("");
  const [editingNisn, setEditingNisn] = useState<string | null>(null);
  const [tempGuru, setTempGuru] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { success, error } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    filterSiswa();
  }, [siswaList, searchTerm, selectedGuru]);

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

    fetchData();
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch siswa data
      const { data: siswaData, error: siswaError } = await supabase
        .from("tb_siswa")
        .select("*")
        .order("nama_siswa");

      if (siswaError) {
        console.error("Error fetching siswa:", siswaError);
        error("Gagal mengambil data siswa");
        return;
      }

      // Fetch guru data
      const { data: guruData, error: guruError } = await supabase
        .from("tb_guru")
        .select("*")
        .order("nama_guru");

      if (guruError) {
        console.error("Error fetching guru:", guruError);
        error("Gagal mengambil data guru");
        return;
      }

      setSiswaList(siswaData || []);
      setGuruList(guruData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      error("Terjadi kesalahan saat mengambil data");
    } finally {
      setIsLoading(false);
    }
  };

  const filterSiswa = () => {
    let filtered = siswaList;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (siswa) =>
          siswa.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
          siswa.nisn.includes(searchTerm) ||
          siswa.kelas.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by selected guru
    if (selectedGuru) {
      filtered = filtered.filter((siswa) => siswa.id_guru === selectedGuru);
    }

    setFilteredSiswa(filtered);
  };

  const handleEditStart = (nisn: string, currentGuruId: string) => {
    setEditingNisn(nisn);
    setTempGuru(currentGuruId);
  };

  const handleEditCancel = () => {
    setEditingNisn(null);
    setTempGuru("");
  };

  const handleEditSave = async (nisn: string) => {
    if (!tempGuru) {
      error("Pilih guru pembimbing");
      return;
    }

    setIsSaving(true);

    try {
      // Get guru data
      const selectedGuruData = guruList.find((g) => g.id_guru === tempGuru);
      if (!selectedGuruData) {
        error("Data guru tidak ditemukan");
        return;
      }

      // Update siswa data
      const { error: updateError } = await supabase
        .from("tb_siswa")
        .update({
          id_guru: tempGuru,
          nama_guru: selectedGuruData.nama_guru,
        })
        .eq("nisn", nisn);

      if (updateError) {
        console.error("Error updating siswa:", updateError);
        error("Gagal mengupdate guru pembimbing");
        return;
      }

      // Update local state
      setSiswaList((prev) =>
        prev.map((siswa) =>
          siswa.nisn === nisn
            ? {
                ...siswa,
                id_guru: tempGuru,
                nama_guru: selectedGuruData.nama_guru,
              }
            : siswa
        )
      );

      success("Guru pembimbing berhasil diupdate");
      setEditingNisn(null);
      setTempGuru("");
    } catch (err) {
      console.error("Error updating guru pembimbing:", err);
      error("Terjadi kesalahan saat mengupdate");
    } finally {
      setIsSaving(false);
    }
  };

  const getGuruSiswaCount = (guruId: string) => {
    return siswaList.filter((siswa) => siswa.id_guru === guruId).length;
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
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/admin/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Kembali
            </Link>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Kelola Guru Pembimbing
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
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
                      Total Siswa
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {siswaList.length}
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
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Guru
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {guruList.length}
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
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Rata-rata Siswa/Guru
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {guruList.length > 0
                        ? Math.round(siswaList.length / guruList.length)
                        : 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari Siswa
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama, NISN, atau kelas..."
                    className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Filter by Guru */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter Guru
                </label>
                <select
                  value={selectedGuru}
                  onChange={(e) => setSelectedGuru(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Semua Guru</option>
                  {guruList.map((guru) => (
                    <option key={guru.id_guru} value={guru.id_guru}>
                      {guru.nama_guru} ({getGuruSiswaCount(guru.id_guru)} siswa)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Assignment Guru Pembimbing
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Kelola assignment siswa ke guru pembimbing
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
                    Kelas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tempat PKL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guru Pembimbing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSiswa.map((siswa) => (
                  <tr key={siswa.nisn} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {siswa.nama_siswa}
                        </div>
                        <div className="text-sm text-gray-500">
                          NISN: {siswa.nisn}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {siswa.kelas}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {siswa.nama_dudi}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingNisn === siswa.nisn ? (
                        <select
                          value={tempGuru}
                          onChange={(e) => setTempGuru(e.target.value)}
                          className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Pilih Guru</option>
                          {guruList.map((guru) => (
                            <option key={guru.id_guru} value={guru.id_guru}>
                              {guru.nama_guru}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {siswa.nama_guru}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {siswa.id_guru}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingNisn === siswa.nisn ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditSave(siswa.nisn)}
                            disabled={isSaving}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleEditCancel}
                            disabled={isSaving}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            handleEditStart(siswa.nisn, siswa.id_guru)
                          }
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSiswa.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Tidak ada data siswa
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || selectedGuru
                    ? "Tidak ada siswa yang sesuai dengan filter"
                    : "Belum ada data siswa"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
