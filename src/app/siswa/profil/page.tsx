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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole="siswa">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center">
          <Button
            onClick={() => router.push("/siswa/dashboard")}
            variant="secondary"
            size="sm"
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profil Siswa</h1>
            <p className="text-gray-600">Informasi data diri dan akademik</p>
          </div>
        </div>
      </div>

      {/* Profile Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informasi Pribadi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <p className="text-gray-900 font-medium">
                  {siswaData.nama_siswa}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NISN
                </label>
                <p className="text-gray-900">{siswaData.nisn}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2" />
              Informasi Akademik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kelas
                </label>
                <p className="text-gray-900 font-medium">{siswaData.kelas}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Tahun Pelajaran
                </label>
                <p className="text-gray-900">{siswaData.tahun_pelajaran}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester
                </label>
                <p className="text-gray-900">{siswaData.semester}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Building className="h-4 w-4 inline mr-1" />
                  DUDI (Dunia Usaha/Dunia Industri)
                </label>
                <p className="text-gray-900">{siswaData.nama_dudi}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="h-4 w-4 inline mr-1" />
                  Guru Pembimbing
                </label>
                <p className="text-gray-900">{siswaData.nama_guru}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Informasi Akun
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <p className="text-gray-900">{user.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {user.role}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <Button 
          variant="primary" 
          size="sm" 
          href="/siswa/profil/edit"
          className="flex-1 sm:flex-none"
        >
          <Edit className="h-4 w-4 mr-2" />
          Ubah Password
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="flex-1 sm:flex-none text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </DashboardLayout>
  );
}
