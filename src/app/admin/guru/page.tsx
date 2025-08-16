"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/Toast";
import {
  GraduationCap,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Filter,
  Users,
  Key,
  UserCheck,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { showConfirmation, showSuccess, showError } from "@/lib/sweetAlert";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Guru {
  id_guru: string;
  nama_guru: string;
  has_account?: boolean;
}

interface User {
  username: string;
  nama: string;
  role: string;
}

export default function AdminGuruPage() {
  const [guru, setGuru] = useState<Guru[]>([]);
  const [filteredGuru, setFilteredGuru] = useState<Guru[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState<Guru | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const router = useRouter();
  const { error, success } = useToast();

  useEffect(() => {
    checkUser();
    fetchGuru();
  }, []);

  useEffect(() => {
    filterGuru();
  }, [guru, searchTerm]);

  const checkUser = () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== "admin") {
      router.push("/login");
      return;
    }

    setCurrentUser(user);
  };

  const fetchGuru = async () => {
    try {
      const { data: guruData, error: fetchError } = await supabase
        .from("tb_guru")
        .select("*")
        .order("nama_guru");

      if (fetchError) throw fetchError;

      // Check which guru have user accounts
      const guruWithAccounts = await Promise.all(
        (guruData || []).map(async (g) => {
          const { data: userData } = await supabase
            .from("tb_user")
            .select("username")
            .eq("username", g.id_guru)
            .single();

          return {
            ...g,
            has_account: !!userData,
          };
        })
      );

      setGuru(guruWithAccounts);
    } catch (fetchError) {
      console.error("Error fetching guru:", fetchError);
      error("Gagal memuat data guru");
    } finally {
      setIsLoading(false);
    }
  };

  const filterGuru = () => {
    if (!searchTerm) {
      setFilteredGuru(guru);
      return;
    }

    const filtered = guru.filter(
      (g) =>
        g.id_guru.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.nama_guru.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGuru(filtered);
  };

  const handleDelete = async (id_guru: string) => {
    const confirmed = await showConfirmation(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus data guru ini? Data user juga akan dihapus.",
      "Ya, Hapus",
      "Batal"
    );

    if (!confirmed) {
      return;
    }

    try {
      // Delete user account first
      await supabase.from("tb_user").delete().eq("username", id_guru);

      // Then delete guru
      const { error: deleteError } = await supabase
        .from("tb_guru")
        .delete()
        .eq("id_guru", id_guru);

      if (deleteError) throw deleteError;

      showSuccess("Data Guru Berhasil Dihapus", "Data guru dan akun user berhasil dihapus");
      fetchGuru();
    } catch (deleteError) {
      console.error("Error deleting guru:", deleteError);
      showError("Gagal Menghapus", "Gagal menghapus data guru");
    }
  };

  const handleChangePassword = async () => {
    if (!selectedGuru || !newPassword.trim()) {
      showError("Password Kosong", "Password tidak boleh kosong");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error: updateError } = await supabase
        .from("tb_user")
        .update({ password: newPassword })
        .eq("username", selectedGuru.id_guru);

      if (updateError) throw updateError;

      showSuccess("Password Berhasil Diubah", "Password guru telah diperbarui");
      setShowPasswordModal(false);
      setNewPassword("");
      setSelectedGuru(null);
    } catch (updateError) {
      console.error("Error changing password:", updateError);
      error("Error mengubah password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const createUserAccount = async (guru: Guru) => {
    try {
      const userData = {
        username: guru.id_guru,
        password: "123456",
        nama: guru.nama_guru,
        role: "guru",
      };

      const { error: insertError } = await supabase
        .from("tb_user")
        .insert([userData]);

      if (insertError) throw insertError;

      success("Akun user berhasil dibuat dengan password: 123456");
      fetchGuru(); // Refresh data
    } catch (insertError) {
      console.error("Error creating user account:", insertError);
      error("Error membuat akun user");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data guru...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link
              href="/admin/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </Link>
            <div className="flex items-center">
              <Users className="h-6 w-6 text-indigo-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">
                Manajemen Guru
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
                    placeholder="Cari ID atau nama guru..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Add Guru Button */}
              <Link
                href="/admin/guru/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Guru
              </Link>
            </div>
          </div>
        </div>

        {/* Guru Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Daftar Guru ({filteredGuru.length})
            </h3>

            {filteredGuru.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Tidak ada data guru
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm
                    ? "Tidak ditemukan guru yang sesuai dengan pencarian."
                    : "Mulai dengan menambahkan guru baru."}
                </p>
                {!searchTerm && (
                  <div className="mt-6">
                    <Link
                      href="/admin/guru/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Guru
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID Guru
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama Guru
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
                    {filteredGuru.map((g) => (
                      <tr key={g.id_guru} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {g.id_guru}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {g.nama_guru}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {g.has_account ? (
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
                              href={`/admin/guru/${g.id_guru}`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/admin/guru/${g.id_guru}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Data"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            {g.has_account ? (
                              <button
                                onClick={() => {
                                  setSelectedGuru(g);
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
                                onClick={() => createUserAccount(g)}
                                className="text-green-600 hover:text-green-900"
                                title="Buat Akun User"
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(g.id_guru)}
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
      {showPasswordModal && selectedGuru && (
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
                  <strong>{selectedGuru.nama_guru}</strong> (ID:{" "}
                  {selectedGuru.id_guru})
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
                    setSelectedGuru(null);
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
