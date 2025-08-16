"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Settings,
  Clock,
  Bell,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "@/components/ui/DashboardLayout";

interface UserData {
  id: number;
  username: string;
  nama: string;
  role: string;
}

interface NotificationSettings {
  id?: number;
  notification_time: string;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function AdminSettings() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    notification_time: "08:00",
    is_enabled: true,
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();
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
        await loadSettings();
      } catch (error) {
        console.error("Error initializing:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [router]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") {
        // If table doesn't exist, create default settings
        if (error.message.includes("does not exist")) {
          console.log(
            "Table does not exist, will create default settings on first save"
          );
          return;
        }
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const settingsData = {
        notification_time: settings.notification_time,
        is_enabled: settings.is_enabled,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (settings.id) {
        // Update existing settings
        result = await supabase
          .from("notification_settings")
          .update(settingsData)
          .eq("id", settings.id)
          .select()
          .single();
      } else {
        // Create new settings
        result = await supabase
          .from("notification_settings")
          .insert({
            ...settingsData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setSettings(result.data);
      setMessage({ type: "success", text: "Pengaturan berhasil disimpan!" });

      // Broadcast settings change to all clients
      await supabase.channel("notification-settings").send({
        type: "broadcast",
        event: "settings-updated",
        payload: result.data,
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: "error", text: "Gagal menyimpan pengaturan!" });
    } finally {
      setSaving(false);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({
      ...prev,
      notification_time: e.target.value,
    }));
  };

  const handleEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({
      ...prev,
      is_enabled: e.target.checked,
    }));
  };

  if (loading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <Settings className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Pengaturan Sistem
            </h1>
          </div>
          <p className="text-gray-600">
            Kelola pengaturan notifikasi dan sistem aplikasi
          </p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center">
              {message.type === "success" ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Notification Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Bell className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Pengaturan Notifikasi Absensi
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Atur waktu dan status notifikasi reminder absensi untuk siswa
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {/* Enable/Disable Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Status Notifikasi
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Aktifkan atau nonaktifkan notifikasi reminder absensi
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifications-enabled"
                    checked={settings.is_enabled}
                    onChange={handleEnabledChange}
                    className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="notifications-enabled"
                    className="ml-2 text-sm text-gray-700"
                  >
                    {settings.is_enabled ? "Aktif" : "Nonaktif"}
                  </label>
                </div>
              </div>

              {/* Notification Time */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Waktu Notifikasi
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Tentukan jam berapa notifikasi reminder absensi akan dikirim
                  ke siswa
                </p>
                <input
                  type="time"
                  value={settings.notification_time}
                  onChange={handleTimeChange}
                  disabled={!settings.is_enabled}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !settings.is_enabled ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Format: 24 jam (contoh: 08:00 untuk jam 8 pagi)
                </p>
              </div>

              {/* Current Settings Preview */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Preview Pengaturan Saat Ini
                </h3>
                <div className="space-y-1 text-sm">
                  <p className="text-blue-800">
                    <strong>Status:</strong>{" "}
                    {settings.is_enabled ? "Aktif" : "Nonaktif"}
                  </p>
                  <p className="text-blue-800">
                    <strong>Waktu Notifikasi:</strong>{" "}
                    {settings.notification_time} WIB
                  </p>
                  <p className="text-blue-700">
                    {settings.is_enabled
                      ? `Siswa akan menerima notifikasi reminder absensi setiap hari pada jam ${settings.notification_time} WIB`
                      : "Notifikasi reminder absensi saat ini dinonaktifkan"}
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-between items-center pt-4">
                {/* Debug Test Button - Development Only */}
                {process.env.NODE_ENV === "development" && (
                  <button
                    onClick={() => {
                      const now = new Date();
                      const oneMinuteLater = new Date(now.getTime() + 60000);
                      const jakartaTime = new Intl.DateTimeFormat("sv-SE", {
                        timeZone: "Asia/Jakarta",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }).format(oneMinuteLater);

                      setSettings((prev) => ({
                        ...prev,
                        notification_time: jakartaTime,
                        is_enabled: true,
                      }));
                      alert(
                        `Test: Setting notifikasi ke ${jakartaTime} (1 menit dari sekarang)`
                      );
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    🧪 Test: Set +1 Menit
                  </button>
                )}

                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving ? "Menyimpan..." : "Simpan Pengaturan"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Informasi Penting
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Perubahan pengaturan akan berlaku untuk semua siswa. Pastikan
                waktu notifikasi sesuai dengan jam kerja PKL siswa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
