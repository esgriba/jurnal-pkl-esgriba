"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/ui/DashboardLayout";
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Filter,
  UserPlus,
  GraduationCap,
  UserCheck,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { showConfirmation, showSuccess, showError } from "@/lib/sweetAlert";

interface User {
  id: number;
  username: string;
  nama: string;
  role: "admin" | "guru" | "siswa";
  created_at: string;
  // Profile data from view
  id_guru?: string;
  nama_guru?: string;
  nisn?: string;
  nama_siswa?: string;
  kelas?: string;
  tahun_pelajaran?: string;
  semester?: string;
  id_dudi?: string;
  nama_dudi?: string;
}

interface DUDI {
  id_dudi: string;
  nama_dudi: string;
}

interface Guru {
  id_guru: string;
  nama_guru: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [dudiList, setDudiList] = useState<DUDI[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const router = useRouter();
  const { success, error: showError, warning } = useToast();
  const supabase = createClient();

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    nama: "",
    password: "",
    role: "siswa" as "admin" | "guru" | "siswa",
    // Guru specific
    id_guru: "",
    // Siswa specific
    nisn: "",
    kelas: "",
    tahun_pelajaran: "2024/2025",
    semester: "Ganjil",
    id_dudi: "",
    id_guru_pembimbing: "",
  });

  useEffect(() => {
    checkUser();
    fetchData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

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

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch users with complete profile data using view
      const { data: usersData, error: usersError } = await supabase
        .from("v_user_complete")
        .select("*")
        .order("nama");

      if (usersError) {
        console.warn("View not available, using basic user data:", usersError);
        // Fallback to basic user table if view doesn't exist
        const { data: basicUsers, error: basicError } = await supabase
          .from("tb_user")
          .select("*")
          .order("nama");

        if (basicError) throw basicError;
        setUsers(basicUsers || []);
      } else {
        setUsers(usersData || []);
      }

      // Fetch DUDI list for dropdown
      const { data: dudiData, error: dudiError } = await supabase
        .from("tb_dudi")
        .select("id_dudi, nama_dudi")
        .order("nama_dudi");

      if (dudiError) console.warn("Error fetching DUDI:", dudiError);
      setDudiList(dudiData || []);

      // Fetch Guru list for dropdown
      const { data: guruData, error: guruError } = await supabase
        .from("tb_guru")
        .select("id_guru, nama_guru")
        .order("nama_guru");

      if (guruError) console.warn("Error fetching Guru:", guruError);
      setGuruList(guruData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      showError("Gagal memuat data user");
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.nama.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      nama: "",
      password: "",
      role: "siswa",
      id_guru: "",
      nisn: "",
      kelas: "",
      tahun_pelajaran: "2024/2025",
      semester: "Ganjil",
      id_dudi: "",
      id_guru_pembimbing: "",
    });
  };

  const generateId = (role: string, nama: string) => {
    const cleanName = nama
      .replace(/[^a-zA-Z]/g, "")
      .substring(0, 3)
      .toUpperCase();
    const timestamp = Date.now().toString().slice(-4);

    if (role === "guru") {
      return `GR${cleanName}${timestamp}`;
    } else if (role === "siswa") {
      return Date.now().toString().slice(-10); // NISN 10 digit
    }
    return "";
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (formData.role === "admin") {
        // Simple admin creation
        const { error: userError } = await supabase.from("tb_user").insert([
          {
            username: formData.username,
            nama: formData.nama,
            password: formData.password,
            role: formData.role,
          },
        ]);

        if (userError) throw userError;
      } else if (formData.role === "guru") {
        // Try to use stored function, fallback to manual creation
        const id_guru = formData.id_guru || generateId("guru", formData.nama);

        try {
          const { error: createError } = await supabase.rpc(
            "create_guru_with_user",
            {
              p_username: formData.username,
              p_nama: formData.nama,
              p_password: formData.password,
              p_id_guru: id_guru,
            }
          );

          if (createError) throw createError;
        } catch (rpcError) {
          console.warn(
            "RPC function not available, using manual creation:",
            rpcError
          );

          // Manual creation
          const { data: userData, error: userError } = await supabase
            .from("tb_user")
            .insert([
              {
                username: formData.username,
                nama: formData.nama,
                password: formData.password,
                role: formData.role,
              },
            ])
            .select()
            .single();

          if (userError) throw userError;

          const { error: guruError } = await supabase.from("tb_guru").insert([
            {
              id_guru: id_guru,
              nama_guru: formData.nama,
              user_id: userData.id,
            },
          ]);

          if (guruError) throw guruError;
        }
      } else if (formData.role === "siswa") {
        // Create siswa with user
        const nisn = formData.nisn || generateId("siswa", formData.nama);
        const selectedDudi = dudiList.find(
          (d) => d.id_dudi === formData.id_dudi
        );
        const selectedGuru = guruList.find(
          (g) => g.id_guru === formData.id_guru_pembimbing
        );

        if (!selectedDudi || !selectedGuru) {
          showError("Pilih DUDI dan Guru Pembimbing untuk siswa");
          return;
        }

        try {
          const { error: createError } = await supabase.rpc(
            "create_siswa_with_user",
            {
              p_username: formData.username,
              p_nama: formData.nama,
              p_password: formData.password,
              p_nisn: nisn,
              p_kelas: formData.kelas,
              p_tahun_pelajaran: formData.tahun_pelajaran,
              p_semester: formData.semester,
              p_id_dudi: formData.id_dudi,
              p_nama_dudi: selectedDudi.nama_dudi,
              p_id_guru: formData.id_guru_pembimbing,
              p_nama_guru: selectedGuru.nama_guru,
            }
          );

          if (createError) throw createError;
        } catch (rpcError) {
          console.warn(
            "RPC function not available, using manual creation:",
            rpcError
          );

          // Manual creation
          const { data: userData, error: userError } = await supabase
            .from("tb_user")
            .insert([
              {
                username: formData.username,
                nama: formData.nama,
                password: formData.password,
                role: formData.role,
              },
            ])
            .select()
            .single();

          if (userError) throw userError;

          const { error: siswaError } = await supabase.from("tb_siswa").insert([
            {
              nisn: nisn,
              nama_siswa: formData.nama,
              kelas: formData.kelas,
              tahun_pelajaran: formData.tahun_pelajaran,
              semester: formData.semester,
              id_dudi: formData.id_dudi,
              nama_dudi: selectedDudi.nama_dudi,
              id_guru: formData.id_guru_pembimbing,
              nama_guru: selectedGuru.nama_guru,
              user_id: userData.id,
            },
          ]);

          if (siswaError) throw siswaError;
        }
      }

      success(`User ${formData.role} berhasil dibuat`);
      setShowCreateModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error("Error creating user:", err);
      showError(`Gagal membuat user: ${err.message}`);
    }
  };

  const handleDelete = async (userId: number) => {
    const userToDelete = users.find((u) => u.id === userId);

    const confirmed = await showConfirmation(
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus user "${userToDelete?.nama}"?`,
      "Ya, Hapus",
      "Batal"
    );

    if (!confirmed) {
      return;
    }

    try {
      const { error } = await supabase
        .from("tb_user")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      // Refresh users list
      fetchData();
      showSuccess(
        "User Berhasil Dihapus",
        `User ${userToDelete?.nama} telah dihapus dari sistem.`
      );
    } catch (error) {
      console.error("Error deleting user:", error);
      showError(
        "Gagal menghapus user",
        "Terjadi kesalahan saat menghapus user. Silakan coba lagi."
      );
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "guru":
        return "bg-blue-100 text-blue-800";
      case "siswa":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
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
                <Users className="h-6 w-6 text-indigo-600 mr-2" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Manajemen Users
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
                      placeholder="Cari username atau nama..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Role Filter */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                    >
                      <option value="all">Semua Role</option>
                      <option value="admin">Admin</option>
                      <option value="guru">Guru</option>
                      <option value="siswa">Siswa</option>
                    </select>
                  </div>
                </div>

                {/* Add User Button */}
                <Link
                  href="/admin/users/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah User
                </Link>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Daftar Users ({filteredUsers.length})
              </h3>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Tidak ada users
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || roleFilter !== "all"
                      ? "Tidak ada users yang sesuai dengan filter"
                      : "Mulai dengan menambah user baru"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Info
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.nama}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{user.username}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                                user.role
                              )}`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ID: {user.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <Link
                                href={`/admin/users/${user.id}`}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link
                                href={`/admin/users/${user.id}/edit`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                              {user.id !== currentUser?.id && (
                                <button
                                  onClick={() => handleDelete(user.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
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
