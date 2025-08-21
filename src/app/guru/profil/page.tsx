"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Building,
  GraduationCap,
  Mail,
  Phone,
  Edit,
  ArrowLeft,
  LogOut,
  Users,
  BookOpen,
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

interface GuruData {
  id_guru: string;
  nama_guru: string;
  nip: string;
  email?: string;
  no_telp?: string;
  alamat?: string;
  mata_pelajaran?: string;
}

interface GuruStats {
  totalSiswa: number;
  totalJurnal: number;
  totalAbsensiHadir: number;
}

export default function ProfilGuruPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [guruData, setGuruData] = useState<GuruData | null>(null);
  const [stats, setStats] = useState<GuruStats | null>(null);
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
        if (parsedUser.role !== "guru") {
          router.push("/login");
          return;
        }

        setUser(parsedUser);
        await fetchGuruData(parsedUser.username);
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to initialize profile page");
        setLoading(false);
      }
    };

    initializeData();
  }, [router]);

  const fetchGuruData = async (username: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching profile data for guru username:", username);

      // Get guru data
      const { data: guruData, error: guruError } = await supabase
        .from("tb_guru")
        .select("*")
        .eq("id_guru", username)
        .single();

      if (guruError) {
        throw new Error(`Failed to fetch guru data: ${guruError.message}`);
      }

      if (!guruData) {
        throw new Error("Guru data not found");
      }

      setGuruData(guruData);

      // Get statistics
      await fetchGuruStats(username);
    } catch (err) {
      console.error("Error fetching guru data:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGuruStats = async (idGuru: string) => {
    try {
      // Get total siswa bimbingan
      const { count: totalSiswa } = await supabase
        .from("tb_siswa")
        .select("*", { count: "exact", head: true })
        .eq("id_guru", idGuru);

      // Get siswa list to get their NISNs
      const { data: siswaList } = await supabase
        .from("tb_siswa")
        .select("nisn")
        .eq("id_guru", idGuru);

      const nisnList = siswaList?.map(s => s.nisn) || [];

      // Get total jurnal from siswa bimbingan
      let totalJurnal = 0;
      let totalAbsensiHadir = 0;

      if (nisnList.length > 0) {
        const { count: jurnalCount } = await supabase
          .from("tb_jurnal")
          .select("*", { count: "exact", head: true })
          .in("nisn", nisnList);

        const { count: absensiCount } = await supabase
          .from("tb_absensi")
          .select("*", { count: "exact", head: true })
          .in("nisn", nisnList)
          .eq("status", "Hadir");

        totalJurnal = jurnalCount || 0;
        totalAbsensiHadir = absensiCount || 0;
      }

      setStats({
        totalSiswa: totalSiswa || 0,
        totalJurnal,
        totalAbsensiHadir,
      });
    } catch (err) {
      console.error("Error fetching guru stats:", err);
      // Don't fail the whole page if stats fail
      setStats({
        totalSiswa: 0,
        totalJurnal: 0,
        totalAbsensiHadir: 0,
      });
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
            onClick={() => router.push("/guru/dashboard")}
            variant="primary"
          >
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!user || !guruData) {
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
    <DashboardLayout userRole="guru">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center">
          <Button
            onClick={() => router.push("/guru/dashboard")}
            variant="secondary"
            size="sm"
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profil Guru</h1>
            <p className="text-gray-600">Informasi data diri dan statistik bimbingan</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.totalSiswa}</p>
                <p className="text-sm text-gray-600">Siswa Bimbingan</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.totalJurnal}</p>
                <p className="text-sm text-gray-600">Total Jurnal</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.totalAbsensiHadir}</p>
                <p className="text-sm text-gray-600">Kehadiran</p>
              </div>
            </div>
          </Card>
        </div>
      )}

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
                  {guruData.nama_guru}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIP (Nomor Induk Pegawai)
                </label>
                <p className="text-gray-900">{guruData.nip || "Tidak tersedia"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Guru
                </label>
                <p className="text-gray-900">{guruData.id_guru}</p>
              </div>
              {guruData.mata_pelajaran && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <GraduationCap className="h-4 w-4 inline mr-1" />
                    Mata Pelajaran
                  </label>
                  <p className="text-gray-900">{guruData.mata_pelajaran}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Informasi Kontak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {guruData.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email
                  </label>
                  <p className="text-gray-900">{guruData.email}</p>
                </div>
              )}
              {guruData.no_telp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Nomor Telepon
                  </label>
                  <p className="text-gray-900">{guruData.no_telp}</p>
                </div>
              )}
              {guruData.alamat && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Building className="h-4 w-4 inline mr-1" />
                    Alamat
                  </label>
                  <p className="text-gray-900">{guruData.alamat}</p>
                </div>
              )}
              {!guruData.email && !guruData.no_telp && !guruData.alamat && (
                <p className="text-gray-500 text-sm italic">
                  Informasi kontak belum tersedia
                </p>
              )}
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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
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
          href="/guru/profil/edit"
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
