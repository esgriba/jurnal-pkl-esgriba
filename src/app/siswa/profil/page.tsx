"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Building,
  GraduationCap,
  Calendar,
  Edit,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import DashboardLayout from "@/components/ui/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface UserData {
  id: number;
  username: string;
  nama: string;
  role: string;
}

interface SiswaData {
  nisn: string;
  nama_siswa: string;
  kelas: string;
  tahun_pelajaran: string;
  semester: string;
  nama_dudi: string;
  nama_guru: string;
}

export default function ProfilSiswaPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [siswaData, setSiswaData] = useState<SiswaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Initialize supabase client
  const supabase = createClient();

  useEffect(() => {
    const initializeData = async () => {
      try {
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
        await fetchSiswaData(parsedUser.username);
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to initialize profile page");
        setLoading(false);
      }
    };

    initializeData();
  }, [router]);

  const fetchSiswaData = async (username: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching profile data for username:", username);

      // Get user data to get the nama
      const { data: userData, error: userError } = await supabase
        .from("tb_user")
        .select("nama")
        .eq("username", username)
        .single();

      if (userError) {
        throw new Error(`Failed to fetch user data: ${userError.message}`);
      }

      if (!userData) {
        throw new Error("User data not found");
      }

      // Get siswa data with joined information
      const { data: siswaData, error: siswaError } = await supabase
        .from("tb_siswa")
        .select(
          `
          nisn,
          nama_siswa,
          kelas,
          tahun_pelajaran,
          semester,
          id_dudi,
          id_guru
        `
        )
        .eq("nama_siswa", userData.nama)
        .single();

      if (siswaError) {
        throw new Error(`Failed to fetch siswa data: ${siswaError.message}`);
      }

      if (!siswaData) {
        throw new Error("Siswa data not found");
      }

      // Get DUDI data
      const { data: dudiData } = await supabase
        .from("tb_dudi")
        .select("nama_dudi")
        .eq("id_dudi", siswaData.id_dudi)
        .single();

      // Get Guru data
      const { data: guruData } = await supabase
        .from("tb_guru")
        .select("nama_guru")
        .eq("id_guru", siswaData.id_guru)
        .single();

      const formattedSiswaData = {
        nisn: siswaData.nisn,
        nama_siswa: siswaData.nama_siswa,
        kelas: siswaData.kelas,
        tahun_pelajaran: siswaData.tahun_pelajaran,
        semester: siswaData.semester,
        nama_dudi: dudiData?.nama_dudi || "N/A",
        nama_guru: guruData?.nama_guru || "N/A",
      };

      setSiswaData(formattedSiswaData);
    } catch (err) {
      console.error("Error fetching siswa data:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-800 font-medium">
            Loading profile data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
          <p className="text-slate-700 mb-4 font-medium">{error}</p>
          <Button
            onClick={() => router.push("/siswa/dashboard")}
            variant="primary"
          >
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!user || !siswaData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-800 font-medium">
            Loading profile data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <DashboardLayout userRole="siswa">
        {/* Hero Header Section */}
        <div className="mb-8 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 rounded-3xl shadow-2xl text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-6 py-8 sm:px-8">
            <div className="flex items-center">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                  Profil Siswa
                </h1>
                <p className="text-blue-100 text-lg">
                  Informasi data diri dan akademik
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="px-6 py-4 border-b border-white/30">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl mr-3">
                  <User className="h-5 w-5 text-white" />
                </div>
                Informasi Pribadi
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <p className="text-gray-900 font-bold text-base">
                    {siswaData.nama_siswa}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    NISN
                  </label>
                  <p className="text-gray-900 font-semibold text-base">
                    {siswaData.nisn}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="px-6 py-4 border-b border-white/30">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl mr-3">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                Informasi Akademik
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Kelas
                  </label>
                  <p className="text-gray-900 font-bold text-base">
                    {siswaData.kelas}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Tahun Pelajaran
                  </label>
                  <p className="text-gray-900 font-semibold text-base">
                    {siswaData.tahun_pelajaran}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">
                    Semester
                  </label>
                  <p className="text-slate-900 font-medium text-base">
                    {siswaData.semester}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">
                    <Building className="h-4 w-4 inline mr-1" />
                    DUDI (Dunia Usaha/Dunia Industri)
                  </label>
                  <p className="text-gray-900 font-semibold text-base">
                    {siswaData.nama_dudi}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    <User className="h-4 w-4 inline mr-1" />
                    Guru Pembimbing
                  </label>
                  <p className="text-gray-900 font-semibold text-base">
                    {siswaData.nama_guru}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
          <div className="px-6 py-4 border-b border-white/30">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-xl mr-3">
                <User className="h-5 w-5 text-white" />
              </div>
              Informasi Akun
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Username
                </label>
                <p className="text-gray-900 font-semibold text-base">
                  {user.username}
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Role
                </label>
                <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button
            variant="primary"
            size="sm"
            href="/siswa/profil/edit"
            className="flex-1 sm:flex-none bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Edit className="h-4 w-4 mr-2" />
            Ubah Password
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex-1 sm:flex-none bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </DashboardLayout>
    </div>
  );
}
