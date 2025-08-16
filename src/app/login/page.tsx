"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  AlertCircle,
  Settings,
  BookOpen,
  GraduationCap,
  School,
} from "lucide-react";
import Link from "next/link";
import { showError, showSuccess, showWarning } from "@/lib/sweetAlert";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Check if Supabase is configured
  useEffect(() => {
    try {
      createClient();
      setSupabaseError(null);
    } catch (error) {
      setSupabaseError((error as Error).message);
    }
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    if (supabaseError) {
      showWarning(
        "Konfigurasi Database Diperlukan",
        "Silakan hubungi administrator untuk setup database"
      );
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Query user from tb_user table
      const { data: userData, error } = await supabase
        .from("tb_user")
        .select("*")
        .eq("username", data.username)
        .single();

      if (error || !userData) {
        showError("Login Gagal", "Username tidak ditemukan");
        setError("username", { message: "Username tidak ditemukan" });
        return;
      }

      // Simple password check (in production, use proper hashing)
      if (userData.password !== data.password) {
        showError("Login Gagal", "Password yang Anda masukkan salah");
        setError("password", { message: "Password salah" });
        return;
      }

      // Create session using Supabase Auth (you might need to implement custom session)
      // For now, we'll use localStorage to store user info
      const userSessionData = {
        id: userData.id,
        username: userData.username,
        nama: userData.nama,
        role: userData.role,
      };

      console.log("Saving user data to localStorage:", userSessionData);
      localStorage.setItem("user", JSON.stringify(userSessionData));

      // Show success message
      showSuccess("Login Berhasil!", `Selamat datang, ${userData.nama}!`);

      // Redirect based on role
      console.log("User role:", userData.role, "redirecting...");

      // Add small delay to ensure localStorage is saved
      setTimeout(() => {
        if (userData.role === "siswa") {
          router.push("/siswa/dashboard");
        } else if (userData.role === "guru") {
          router.push("/guru/dashboard");
        } else {
          console.log("Redirecting admin to dashboard");
          router.push("/admin/dashboard");
        }
      }, 100);
    } catch (error) {
      console.error("Login error:", error);
      showError("Terjadi Kesalahan", "Silakan coba lagi dalam beberapa saat");
      setError("username", { message: "Terjadi kesalahan, silakan coba lagi" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Hero Section */}
          <div className="text-white space-y-8 lg:pr-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <GraduationCap className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                    Jurnal PKL
                  </h1>
                  <p className="text-white/90 text-lg mt-2">
                    SMK PGRI Banyuputih
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-white/95">
                  Platform Digital untuk Praktik Kerja Lapangan
                </h2>
                <p className="text-white/80 text-lg leading-relaxed">
                  Dokumentasikan perjalanan PKL Anda dengan mudah. Catat
                  aktivitas harian, pantau kehadiran, dan berkomunikasi dengan
                  pembimbing dalam satu platform.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <BookOpen className="h-8 w-8 text-white mx-auto mb-2" />
                  <h3 className="font-medium text-white mb-1">
                    Jurnal Digital
                  </h3>
                  <p className="text-white/70 text-sm">Catat kegiatan harian</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <School className="h-8 w-8 text-white mx-auto mb-2" />
                  <h3 className="font-medium text-white mb-1">
                    Absensi Online
                  </h3>
                  <p className="text-white/70 text-sm">
                    Pantau kehadiran real-time
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <User className="h-8 w-8 text-white mx-auto mb-2" />
                  <h3 className="font-medium text-white mb-1">Bimbingan</h3>
                  <p className="text-white/70 text-sm">
                    Komunikasi dengan guru
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                <div className="text-center mb-8">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Masuk ke Akun
                  </h3>
                  <p className="text-gray-600">
                    Silakan masuk untuk melanjutkan
                  </p>
                </div>

                {/* Supabase Configuration Error Alert */}
                {supabaseError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-red-800">
                          Konfigurasi Database Diperlukan
                        </h3>
                        <p className="text-sm text-red-700 mt-1">
                          {supabaseError}
                        </p>
                        <div className="mt-3">
                          <Link
                            href="/setup"
                            className="inline-flex items-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Setup Database
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Username
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" />
                      </div>
                      <input
                        {...register("username")}
                        type="text"
                        id="username"
                        className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Masukkan username"
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" />
                      </div>
                      <input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        id="password"
                        className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Masukkan password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-blue-600 transition-colors duration-200"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !!supabaseError}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {supabaseError ? (
                      <>
                        <Settings className="h-5 w-5 mr-2" />
                        Setup Database Diperlukan
                      </>
                    ) : isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Masuk...
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5 mr-2" />
                        Masuk ke Dashboard
                      </>
                    )}
                  </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                  <p className="text-xs text-gray-500">
                    © 2025 SMK PGRI Banyuputih. Sistem Jurnal PKL Digital.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
