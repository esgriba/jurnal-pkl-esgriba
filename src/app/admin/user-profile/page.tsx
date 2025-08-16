"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/Toast";
import {
  Users,
  UserCheck,
  AlertTriangle,
  LinkIcon,
  Unlink,
  ArrowLeft,
  Search,
  Filter,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import {
  getUserWithProfile,
  getAllGuruWithUsers,
  getAllSiswaWithUsers,
  linkUserToGuru,
  linkUserToSiswa,
  UserWithProfile,
} from "@/lib/userProfileManager";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UnlinkedUser {
  id: number;
  username: string;
  nama: string;
  role: string;
}

interface UnlinkedProfile {
  id: string;
  nama: string;
  type: "guru" | "siswa";
}

export default function UserProfileManagementPage() {
  const [linkedUsers, setLinkedUsers] = useState<UserWithProfile[]>([]);
  const [unlinkedUsers, setUnlinkedUsers] = useState<UnlinkedUser[]>([]);
  const [unlinkedProfiles, setUnlinkedProfiles] = useState<UnlinkedProfile[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const { error, success } = useToast();

  useEffect(() => {
    checkUser();
    fetchData();
  }, []);

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

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch linked users (with profiles)
      const linkedData: UserWithProfile[] = [];

      const guruResult = await getAllGuruWithUsers();
      if (guruResult.success && guruResult.data) {
        linkedData.push(...guruResult.data.filter((u) => u.id_guru));
      }

      const siswaResult = await getAllSiswaWithUsers();
      if (siswaResult.success && siswaResult.data) {
        linkedData.push(...siswaResult.data.filter((u) => u.nisn));
      }

      setLinkedUsers(linkedData);

      // Fetch unlinked users
      const { data: allUsers, error: usersError } = await supabase
        .from("tb_user")
        .select("id, username, nama, role")
        .neq("role", "admin");

      if (usersError) throw usersError;

      const linkedUserIds = linkedData.map((u) => u.user_id);
      const unlinked =
        allUsers?.filter((u) => !linkedUserIds.includes(u.id)) || [];
      setUnlinkedUsers(unlinked);

      // Fetch unlinked profiles
      const unlinkedProfilesList: UnlinkedProfile[] = [];

      // Unlinked guru profiles
      const { data: unlinkedGuru, error: guruError } = await supabase
        .from("tb_guru")
        .select("id_guru, nama_guru")
        .is("user_id", null);

      if (!guruError && unlinkedGuru) {
        unlinkedProfilesList.push(
          ...unlinkedGuru.map((g) => ({
            id: g.id_guru,
            nama: g.nama_guru,
            type: "guru" as const,
          }))
        );
      }

      // Unlinked siswa profiles
      const { data: unlinkedSiswa, error: siswaError } = await supabase
        .from("tb_siswa")
        .select("nisn, nama_siswa")
        .is("user_id", null);

      if (!siswaError && unlinkedSiswa) {
        unlinkedProfilesList.push(
          ...unlinkedSiswa.map((s) => ({
            id: s.nisn,
            nama: s.nama_siswa,
            type: "siswa" as const,
          }))
        );
      }

      setUnlinkedProfiles(unlinkedProfilesList);
    } catch (err) {
      console.error("Error fetching data:", err);
      error("Gagal memuat data hubungan user-profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkUserToProfile = async (
    userId: number,
    profileId: string,
    profileType: "guru" | "siswa"
  ) => {
    try {
      let result;

      if (profileType === "guru") {
        result = await linkUserToGuru(userId, profileId);
      } else {
        result = await linkUserToSiswa(userId, profileId);
      }

      if (result.success) {
        success(`User berhasil dihubungkan dengan profile ${profileType}`);
        fetchData(); // Refresh data
      } else {
        error(`Gagal menghubungkan user dengan profile ${profileType}`);
      }
    } catch (err) {
      console.error("Error linking user to profile:", err);
      error("Terjadi kesalahan saat menghubungkan user");
    }
  };

  const handleUnlinkUser = async (
    userId: number,
    profileType: "guru" | "siswa",
    profileId: string
  ) => {
    if (!confirm("Apakah Anda yakin ingin memutuskan hubungan ini?")) {
      return;
    }

    try {
      const table = profileType === "guru" ? "tb_guru" : "tb_siswa";
      const idField = profileType === "guru" ? "id_guru" : "nisn";

      const { error: unlinkError } = await supabase
        .from(table)
        .update({ user_id: null })
        .eq(idField, profileId);

      if (unlinkError) throw unlinkError;

      success("Hubungan user-profile berhasil diputuskan");
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Error unlinking user:", err);
      error("Gagal memutuskan hubungan user-profile");
    }
  };

  const filteredLinkedUsers = linkedUsers.filter((user) => {
    const matchesSearch =
      user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredUnlinkedUsers = unlinkedUsers.filter((user) => {
    const matchesSearch =
      user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Memuat data hubungan user-profile...
          </p>
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
                Manajemen Hubungan User-Profile
              </h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Semua Role</option>
              <option value="guru">Guru</option>
              <option value="siswa">Siswa</option>
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      User Terhubung
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {linkedUsers.length}
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
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      User Belum Terhubung
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {unlinkedUsers.length}
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
                  <UserPlus className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Profile Tersedia
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {unlinkedProfiles.length}
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
                  <LinkIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Hubungan
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {linkedUsers.length + unlinkedUsers.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linked Users Table */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              User yang Sudah Terhubung ({filteredLinkedUsers.length})
            </h3>

            {filteredLinkedUsers.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Tidak ada user terhubung
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Belum ada user yang terhubung dengan profile.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profile ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profile Name
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLinkedUsers.map((user) => (
                      <tr key={user.user_id} className="hover:bg-gray-50">
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
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === "guru"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.role === "guru" ? user.id_guru : user.nisn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.role === "guru"
                            ? user.nama_guru
                            : user.nama_siswa}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() =>
                              handleUnlinkUser(
                                user.user_id,
                                user.role as "guru" | "siswa",
                                user.role === "guru"
                                  ? user.id_guru!
                                  : user.nisn!
                              )
                            }
                            className="text-red-600 hover:text-red-900"
                            title="Putuskan Hubungan"
                          >
                            <Unlink className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Unlinked Users and Profiles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Unlinked Users */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                User Belum Terhubung ({filteredUnlinkedUsers.length})
              </h3>

              {filteredUnlinkedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Semua user sudah terhubung
                  </h3>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUnlinkedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.nama}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{user.username} • {user.role}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {unlinkedProfiles
                          .filter((profile) => profile.type === user.role)
                          .map((profile) => (
                            <button
                              key={profile.id}
                              onClick={() =>
                                handleLinkUserToProfile(
                                  user.id,
                                  profile.id,
                                  profile.type
                                )
                              }
                              className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                              title={`Hubungkan dengan ${profile.nama}`}
                            >
                              {profile.nama}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Unlinked Profiles */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Profile Belum Terhubung ({unlinkedProfiles.length})
              </h3>

              {unlinkedProfiles.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Semua profile sudah terhubung
                  </h3>
                </div>
              ) : (
                <div className="space-y-3">
                  {unlinkedProfiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {profile.nama}
                        </div>
                        <div className="text-sm text-gray-500">
                          {profile.type} • ID: {profile.id}
                        </div>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          profile.type === "guru"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {profile.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
