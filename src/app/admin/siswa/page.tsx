"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  GraduationCap,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Filter,
  Key,
  UserCheck,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { showConfirmation, showSuccess, showError } from "@/lib/sweetAlert";

interface Siswa {
  nisn: string;
  nama_siswa: string;
  kelas: string;
  tahun_pelajaran: string;
  semester: string;
  id_guru: string;
  nama_guru: string;
  id_dudi: string;
  nama_dudi: string;
  has_account?: boolean;
}

interface User {
  username: string;
  nama: string;
  role: string;
}

export default function AdminSiswaPage() {
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [filteredSiswa, setFilteredSiswa] = useState<Siswa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [kelasFilter, setKelasFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUser();
    fetchSiswa();
  }, []);

  useEffect(() => {
    filterSiswa();
  }, [siswa, searchTerm, kelasFilter]);

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

  const fetchSiswa = async () => {
    try {
      const { data: siswaData, error } = await supabase
        .from("tb_siswa")
        .select("*")
        .order("nama_siswa", { ascending: true });

      if (error) throw error;

      // Check which siswa have user accounts
      const siswaWithAccounts = await Promise.all(
        (siswaData || []).map(async (s) => {
          const { data: userData } = await supabase
            .from("tb_user")
            .select("username")
            .eq("username", s.nisn)
            .single();

          return {
            ...s,
            has_account: !!userData,
          };
        })
      );

      setSiswa(siswaWithAccounts);
    } catch (error) {
      console.error("Error fetching siswa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSiswa = () => {
    let filtered = siswa;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.nisn.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.nama_guru.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.nama_dudi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by kelas
    if (kelasFilter !== "all") {
      filtered = filtered.filter((s) => s.kelas === kelasFilter);
    }

    setFilteredSiswa(filtered);
  };

  const handleDelete = async (nisn: string) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus siswa ini? Data user juga akan dihapus."
      )
    ) {
      return;
    }

    try {
      // Delete user account first
      await supabase.from("tb_user").delete().eq("username", nisn);

      // Then delete siswa
      const { error } = await supabase
        .from("tb_siswa")
        .delete()
        .eq("nisn", nisn);

      if (error) throw error;

      // Refresh siswa list
      fetchSiswa();
      alert("Siswa dan akun user berhasil dihapus");
    } catch (error) {
      console.error("Error deleting siswa:", error);
      alert("Error menghapus siswa");
    }
  };

  const handleChangePassword = async () => {
    if (!selectedSiswa || !newPassword.trim()) {
      alert("Password tidak boleh kosong");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase
        .from("tb_user")
        .update({ password: newPassword })
        .eq("username", selectedSiswa.nisn);

      if (error) throw error;

      alert("Password berhasil diubah");
      setShowPasswordModal(false);
      setNewPassword("");
      setSelectedSiswa(null);
    } catch (error) {
      console.error("Error changing password:", error);
      showError("Gagal Mengubah Password", "Error mengubah password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const createUserAccount = async (siswa: Siswa) => {
    try {
      const userData = {
        username: siswa.nisn,
        password: "123456",
        nama: siswa.nama_siswa,
        role: "siswa",
      };

      const { error } = await supabase.from("tb_user").insert([userData]);

      if (error) throw error;

      showSuccess("Akun User Berhasil Dibuat", "Akun user berhasil dibuat dengan password: 123456");
      fetchSiswa(); // Refresh data
    } catch (error) {
      console.error("Error creating user account:", error);
      showError("Gagal Membuat Akun", "Error membuat akun user");
    }
  };

  const getUniqueKelas = () => {
    const kelasSet = new Set(siswa.map((s) => s.kelas));
    return Array.from(kelasSet).sort();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading siswa...</p>
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
              <GraduationCap className="h-6 w-6 text-indigo-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">
                Manajemen Siswa
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari NISN, nama siswa, guru, atau DUDI..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Kelas Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                    value={kelasFilter}
                    onChange={(e) => setKelasFilter(e.target.value)}
                  >
                    <option value="all">Semua Kelas</option>
                    {getUniqueKelas().map((kelas) => (
                      <option key={kelas} value={kelas}>
                        {kelas}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link
                  href="/admin/import-siswa"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Import Excel
                </Link>
                <Link
                  href="/admin/siswa/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Siswa
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Siswa Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Daftar Siswa ({filteredSiswa.length})
            </h3>

            {filteredSiswa.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Tidak ada siswa
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || kelasFilter !== "all"
                    ? "Tidak ada siswa yang sesuai dengan filter"
                    : "Mulai dengan menambah siswa baru"}
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
                        Kelas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guru Pembimbing
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DUDI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status Akun
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSiswa.map((s) => (
                      <tr key={s.nisn} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {s.nama_siswa}
                            </div>
                            <div className="text-sm text-gray-500">
                              NISN: {s.nisn}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{s.kelas}</div>
                          <div className="text-sm text-gray-500">
                            {s.tahun_pelajaran} - {s.semester}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {s.nama_guru}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {s.id_guru}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {s.nama_dudi}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {s.id_dudi}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {s.has_account ? (
                            <div className="flex items-center">
                              <UserCheck className="h-4 w-4 text-green-500 mr-1" />
                              <span className="text-sm text-green-700">
                                Ada Akun
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <UserX className="h-4 w-4 text-red-500 mr-1" />
                              <span className="text-sm text-red-700">
                                Belum Ada
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/admin/siswa/${s.nisn}`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/admin/siswa/${s.nisn}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Data"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            {s.has_account ? (
                              <button
                                onClick={() => {
                                  setSelectedSiswa(s);
                                  setShowPasswordModal(true);
                                  setNewPassword("");
                                }}
                                className="text-orange-600 hover:text-orange-900"
                                title="Ubah Password"
                              >
                                <Key className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => createUserAccount(s)}
                                className="text-green-600 hover:text-green-900"
                                title="Buat Akun User"
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(s.nisn)}
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

      {/* Password Change Modal */}
      {showPasswordModal && selectedSiswa && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100">
                <Key className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                Ubah Password
              </h3>
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-4">
                  Mengubah password untuk: <br />
                  <strong>{selectedSiswa.nama_siswa}</strong> (NISN:{" "}
                  {selectedSiswa.nisn})
                </p>
                <input
                  type="text"
                  placeholder="Masukkan password baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="items-center gap-4 mt-6 flex">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedSiswa(null);
                    setNewPassword("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Batal
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !newPassword.trim()}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white text-base font-medium rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? "Mengubah..." : "Ubah Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
