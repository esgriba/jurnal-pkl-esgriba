"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Shield,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  Edit,
  ArrowLeft,
  LogOut,
  BarChart3,
  Database,
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

interface AdminStats {
  totalUsers: number;
  totalSiswa: number;
  totalGuru: number;
  totalDudi: number;
  totalJurnal: number;
  totalAbsensi: number;
  absensiHariIni: number;
  jurnalHariIni: number;
}

export default function ProfilAdminPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
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
        if (parsedUser.role !== "admin") {
          router.push("/login");
          return;
        }

        setUser(parsedUser);
        await fetchAdminStats();
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to initialize profile page");
        setLoading(false);
      }
    };

    initializeData();
  }, [router]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all counts in parallel
      const [
        usersResult,
        siswaResult,
        guruResult,
        dudiResult,
        jurnalResult,
        absensiResult,
      ] = await Promise.all([
        supabase.from("tb_user").select("*", { count: "exact", head: true }),
        supabase.from("tb_siswa").select("*", { count: "exact", head: true }),
        supabase.from("tb_guru").select("*", { count: "exact", head: true }),
        supabase.from("tb_dudi").select("*", { count: "exact", head: true }),
        supabase.from("tb_jurnal").select("*", { count: "exact", head: true }),
        supabase.from("tb_absensi").select("*", { count: "exact", head: true }),
      ]);

      // Get today's stats
      const today = new Date().toISOString().split("T")[0];
      
      const [jurnalHariIniResult, absensiHariIniResult] = await Promise.all([
        supabase
          .from("tb_jurnal")
          .select("*", { count: "exact", head: true })
          .eq("tanggal", today),
        supabase
          .from("tb_absensi")
          .select("*", { count: "exact", head: true })
          .eq("tanggal", today),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalSiswa: siswaResult.count || 0,
        totalGuru: guruResult.count || 0,
        totalDudi: dudiResult.count || 0,
        totalJurnal: jurnalResult.count || 0,
        totalAbsensi: absensiResult.count || 0,
        jurnalHariIni: jurnalHariIniResult.count || 0,
        absensiHariIni: absensiHariIniResult.count || 0,
      });
    } catch (err) {
      console.error("Error fetching admin stats:", err);
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
            onClick={() => router.push("/admin/dashboard")}
            variant="primary"
          >
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!user || !stats) {
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
    <DashboardLayout userRole="admin">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center">
          <Button
            onClick={() => router.push("/admin/dashboard")}
            variant="secondary"
            size="sm"
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profil Administrator</h1>
            <p className="text-gray-600">Informasi admin dan statistik sistem</p>
          </div>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.totalSiswa}</p>
              <p className="text-sm text-gray-600">Total Siswa</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-600">{stats.totalJurnal}</p>
              <p className="text-sm text-gray-600">Total Jurnal</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats.totalAbsensi}</p>
              <p className="text-sm text-gray-600">Total Absensi</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-emerald-600" />
            <div>
              <p className="text-2xl font-bold text-emerald-600">{stats.jurnalHariIni}</p>
              <p className="text-sm text-gray-600">Jurnal Hari Ini</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-2xl font-bold text-indigo-600">{stats.absensiHariIni}</p>
              <p className="text-sm text-gray-600">Absensi Hari Ini</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Profile Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Informasi Administrator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <p className="text-gray-900 font-medium">
                  {user.nama}
                </p>
              </div>
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
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Administrator
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID User
                </label>
                <p className="text-gray-900">#{user.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Ringkasan Sistem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Guru</span>
                <span className="font-medium">{stats.totalGuru}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total DUDI</span>
                <span className="font-medium">{stats.totalDudi}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rasio Siswa:Guru</span>
                <span className="font-medium">
                  {stats.totalGuru > 0 ? Math.round(stats.totalSiswa / stats.totalGuru) : 0}:1
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Aktivitas Hari Ini</span>
                <span className="font-medium">
                  {stats.jurnalHariIni + stats.absensiHariIni} kegiatan
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Akses Cepat Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              href="/admin/users"
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Users className="h-6 w-6" />
              <span>Kelola Users</span>
            </Button>
            <Button
              href="/admin/siswa"
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <GraduationCap className="h-6 w-6" />
              <span>Kelola Siswa</span>
            </Button>
            <Button
              href="/admin/jurnal"
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <BookOpen className="h-6 w-6" />
              <span>Monitor Jurnal</span>
            </Button>
            <Button
              href="/admin/absensi"
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Calendar className="h-6 w-6" />
              <span>Monitor Absensi</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <Button 
          variant="primary" 
          size="sm" 
          href="/admin/profil/edit"
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
