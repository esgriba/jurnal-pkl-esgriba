"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  UserCheck,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  TrendingUp,
  AlertCircle,
  Eye,
  Edit,
  Plus,
  UserCog,
  LinkIcon,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/ui/DashboardLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatCard,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
} from "@/components/ui/Table";

interface DashboardStats {
  totalUsers: number;
  totalSiswa: number;
  totalGuru: number;
  totalDudi: number;
  totalJurnal: number;
  totalAbsensi: number;
  recentJurnal: Array<{
    id_jurnal: string;
    nama_siswa: string;
    tanggal: string;
    deskripsi_kegiatan: string;
  }>;
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAndFetchData = async () => {
      const userValid = await checkUser();
      if (userValid) {
        await fetchDashboardData();
      }
      setIsChecking(false);
    };

    checkAndFetchData();
  }, []);

  const checkUser = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      // Add small delay to ensure localStorage is ready
      setTimeout(() => {
        const userData = localStorage.getItem("user");
        console.log("Checking userData from localStorage:", userData);

        if (!userData) {
          console.log("No userData found, redirecting to login");
          router.push("/login");
          resolve(false);
          return;
        }

        try {
          const parsedUser = JSON.parse(userData);
          console.log("Parsed user:", parsedUser);

          if (parsedUser.role !== "admin") {
            console.log(
              "User role is not admin:",
              parsedUser.role,
              "redirecting to login"
            );
            router.push("/login");
            resolve(false);
            return;
          }

          console.log("User is admin, setting user state");
          setUser(parsedUser);
          resolve(true);
        } catch (error) {
          console.error("Error parsing user data:", error);
          router.push("/login");
          resolve(false);
        }
      }, 100); // Small delay to ensure localStorage is ready
    });
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch counts for all entities
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

      // Fetch recent jurnal entries
      const { data: recentJurnal } = await supabase
        .from("tb_jurnal")
        .select("id_jurnal, nama_siswa, tanggal, deskripsi_kegiatan")
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        totalUsers: usersResult.count || 0,
        totalSiswa: siswaResult.count || 0,
        totalGuru: guruResult.count || 0,
        totalDudi: dudiResult.count || 0,
        totalJurnal: jurnalResult.count || 0,
        totalAbsensi: absensiResult.count || 0,
        recentJurnal: recentJurnal || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: <Users className="h-6 w-6" />,
      color: "blue" as const,
      link: "/admin/users",
    },
    {
      title: "Total Siswa",
      value: stats?.totalSiswa || 0,
      icon: <GraduationCap className="h-6 w-6" />,
      color: "green" as const,
      link: "/admin/siswa",
    },
    {
      title: "Total Guru",
      value: stats?.totalGuru || 0,
      icon: <UserCheck className="h-6 w-6" />,
      color: "purple" as const,
      link: "/admin/guru",
    },
    {
      title: "Total DUDI",
      value: stats?.totalDudi || 0,
      icon: <Building2 className="h-6 w-6" />,
      color: "yellow" as const,
      link: "/admin/dudi",
    },
    {
      title: "Total Jurnal",
      value: stats?.totalJurnal || 0,
      icon: <BookOpen className="h-6 w-6" />,
      color: "red" as const,
      link: "/admin/jurnal",
    },
    {
      title: "Total Absensi",
      value: stats?.totalAbsensi || 0,
      icon: <Calendar className="h-6 w-6" />,
      color: "indigo" as const,
      link: "/admin/absensi",
    },
  ];

  return (
    <DashboardLayout userRole="admin">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <Link key={index} href={card.link}>
            <StatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
            />
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jurnal */}
        <Card>
          <CardHeader>
            <CardTitle>Jurnal Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentJurnal.length === 0 ? (
                <p className="text-gray-500 text-sm">Belum ada jurnal</p>
              ) : (
                stats?.recentJurnal.map((jurnal) => (
                  <div
                    key={jurnal.id_jurnal}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {jurnal.nama_siswa}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {jurnal.tanggal} -{" "}
                        {jurnal.deskripsi_kegiatan.substring(0, 50)}...
                      </p>
                    </div>
                    <Link
                      href={`/admin/jurnal?search=${jurnal.id_jurnal}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Button href="/admin/jurnal" variant="outline" size="sm">
                Lihat semua jurnal →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <Button
                  href="/admin/users/create"
                  variant="primary"
                  size="sm"
                  className="justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah User Baru
                </Button>
                <Button
                  href="/admin/siswa/create"
                  variant="success"
                  size="sm"
                  className="justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Siswa Baru
                </Button>
                <Button
                  href="/admin/guru/create"
                  variant="secondary"
                  size="sm"
                  className="justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Guru Baru
                </Button>
                <Button
                  href="/admin/dudi/create"
                  variant="warning"
                  size="sm"
                  className="justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah DUDI Baru
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
