"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Save,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "@/components/ui/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { showSuccess, showError, showConfirmation } from "@/lib/customAlert";

interface UserData {
  id: number;
  username: string;
  nama: string;
  role: string;
}

export default function EditPasswordGuruPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        setLoading(false);
      } catch (err) {
        console.error("Initialization error:", err);
        router.push("/login");
      }
    };

    initializeData();
  }, [router]);

  const validateForm = () => {
    if (!currentPassword.trim()) {
      showError("Validasi Gagal", "Password saat ini harus diisi");
      return false;
    }

    if (!newPassword.trim()) {
      showError("Validasi Gagal", "Password baru harus diisi");
      return false;
    }

    if (newPassword.length < 6) {
      showError("Validasi Gagal", "Password baru minimal 6 karakter");
      return false;
    }

    if (newPassword !== confirmPassword) {
      showError("Validasi Gagal", "Konfirmasi password tidak cocok");
      return false;
    }

    if (currentPassword === newPassword) {
      showError("Validasi Gagal", "Password baru harus berbeda dari password saat ini");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const confirmed = await showConfirmation(
      "Konfirmasi Ubah Password",
      "Apakah Anda yakin ingin mengubah password?",
      "Ya, Ubah",
      "Batal"
    );

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (!user) {
        throw new Error("User data tidak ditemukan");
      }

      // Verify current password first
      const { data: currentUserData, error: verifyError } = await supabase
        .from("tb_user")
        .select("password")
        .eq("username", user.username)
        .single();

      if (verifyError) {
        throw new Error("Gagal verifikasi password saat ini");
      }

      if (!currentUserData || currentUserData.password !== currentPassword) {
        throw new Error("Password saat ini tidak benar");
      }

      // Update password
      const { error: updateError } = await supabase
        .from("tb_user")
        .update({ password: newPassword })
        .eq("username", user.username);

      if (updateError) {
        throw new Error("Gagal mengubah password: " + updateError.message);
      }

      await showSuccess(
        "Password Berhasil Diubah!",
        "Password Anda telah berhasil diperbarui. Silakan login kembali dengan password baru."
      );

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Redirect to profile page
      router.push("/guru/profil");
    } catch (error: any) {
      console.error("Error updating password:", error);
      showError("Gagal Ubah Password", error.message || "Terjadi kesalahan saat mengubah password");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout userRole="guru">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center">
          <Button
            onClick={() => router.push("/guru/profil")}
            variant="secondary"
            size="sm"
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ubah Password</h1>
            <p className="text-gray-600">Perbarui password akun Anda</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Ubah Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Saat Ini
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Masukkan password saat ini"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Masukkan password baru"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Minimal 6 karakter
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Konfirmasi password baru"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Persyaratan Password:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Minimal 6 karakter</li>
                      <li>Berbeda dari password saat ini</li>
                      <li>Hindari password yang mudah ditebak</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Mengubah...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Ubah Password
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/guru/profil")}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
