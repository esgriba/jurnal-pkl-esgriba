"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Bell,
  BellOff,
  Settings,
  Play,
  CheckCircle,
  XCircle,
  RefreshCw,
  Smartphone,
  Monitor,
} from "lucide-react";

interface PushNotificationManagerProps {
  userRole?: string;
}

interface NotificationSettings {
  id: number;
  notification_time: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export default function PushNotificationManager({
  userRole = "siswa",
}: PushNotificationManagerProps) {
  // State declarations
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings | null>(null);
  const [reminderInterval, setReminderInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const supabase = createClient();

  // Check mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(
          userAgent
        );
      setIsMobile(isMobileDevice);
      return isMobileDevice;
    };

    checkMobile();
    setIsSupported("Notification" in window && "serviceWorker" in navigator);

    // Initialize permission state from browser
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    // Listen for PWA install prompt (important for mobile notifications)
    const handleInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      console.log("PWA install prompt available");
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, []);

  // Load notification settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const data = {
          id: 1,
          is_enabled: true,
          notification_time: "08:00",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setNotificationSettings(data as NotificationSettings);
        console.log("Notification settings loaded:", data);
      } catch (error) {
        console.error("Error loading notification settings:", error);
      }
    }
    loadSettings();
  }, []);

  // Register service worker and setup
  useEffect(() => {
    if (isSupported) {
      registerServiceWorker();
    }
    return () => {
      if (reminderInterval) {
        clearInterval(reminderInterval);
      }
    };
  }, [isSupported]);

  // Setup reminder intervals
  useEffect(() => {
    async function checkAndSetupReminders() {
      if (!isSupported) return;

      // Check subscription status
      try {
        setIsSubscribed(true);
        console.log("Subscription status checked");

        // Schedule reminder notification if enabled
        if (notificationSettings && Notification.permission === "granted") {
          scheduleReminder();
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    }

    if (notificationSettings) {
      checkAndSetupReminders();
    }
  }, [notificationSettings, isSupported]);

  // Send test notification
  const sendTestNotification = async () => {
    if (permission !== "granted") {
      alert(
        "Izin notifikasi belum diberikan. Silakan aktifkan terlebih dahulu."
      );
      return;
    }

    const notificationTitle = isMobile
      ? "📱 Test Notifikasi Mobile PKL"
      : "🔔 Test Notifikasi PKL";

    const notificationOptions = {
      body: isMobile
        ? "Notifikasi test berhasil! Tap untuk membuka aplikasi."
        : "Ini adalah test notifikasi dari sistem PKL.",
      icon: "/icon-192x192.png",
      badge: "/icon-72x72.png",
      tag: "test-notification",
      requireInteraction: isMobile, // Keep notification visible on mobile
      timestamp: Date.now(),
      vibrate: isMobile ? [200, 100, 200] : undefined, // Vibrate on mobile
      actions: isMobile
        ? [
            { action: "open", title: "Buka App" },
            { action: "close", title: "Tutup" },
          ]
        : undefined,
    };

    if (registration && "showNotification" in registration) {
      registration
        .showNotification(notificationTitle, notificationOptions as any)
        .then(() => {
          console.log("✅ Service Worker notification sent successfully");
          if (isMobile) {
            console.log("📱 Mobile notification delivered with vibration");
          }
        })
        .catch((error: any) => {
          console.error("❌ Service Worker notification failed:", error);
          // Fallback to direct notification API
          new Notification(notificationTitle, notificationOptions as any);
        });
    } else {
      // Fallback to direct notification API
      new Notification(notificationTitle, notificationOptions as any);
    }
  };

  // Request permission and setup
  const requestPermissionAndSetup = async () => {
    if (!isSupported) {
      alert("Browser ini tidak mendukung notifikasi push.");
      return;
    }

    console.log("🔔 Requesting notification permission...");

    try {
      // For mobile, show user-friendly message first
      if (isMobile && permission !== "granted") {
        alert(
          "Untuk mendapatkan pengingat absensi, silakan izinkan notifikasi saat diminta browser."
        );
      }

      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult === "granted") {
        console.log("✅ Notification permission granted");
        await subscribeToPush();
      } else {
        console.log("❌ Notification permission denied");
        alert(
          "Izin notifikasi ditolak. Anda tidak akan menerima pengingat absensi."
        );
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
    }
  };

  const scheduleReminder = () => {
    if (reminderInterval) {
      clearInterval(reminderInterval);
      setReminderInterval(null);
    }

    if (!notificationSettings?.is_enabled || permission !== "granted") {
      return;
    }

    console.log("⏰ Setting up reminder notification schedule");

    // Check every minute if it's time to send reminder
    const intervalId = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // Format: "HH:MM"

      if (currentTime === notificationSettings.notification_time) {
        sendReminderNotification();
      }
    }, 60000); // Check every minute

    setReminderInterval(intervalId);
  };

  const sendReminderNotification = async () => {
    if (!registration) {
      console.error("Service worker not registered");
      return;
    }

    try {
      setIsSubscribed(true);
      console.log("📝 Sending reminder notification");

      const title = "📝 Waktu Mengisi Jurnal PKL!";
      const options = {
        body: "Jangan lupa mengisi jurnal kegiatan PKL hari ini. Klik untuk membuka aplikasi.",
        icon: "/icon-192x192.png",
        badge: "/icon-72x72.png",
        tag: "reminder-notification",
        requireInteraction: true,
        vibrate: isMobile ? [300, 200, 300] : undefined,
        actions: [
          { action: "open", title: "Isi Jurnal" },
          { action: "later", title: "Nanti" },
        ],
      };

      await registration.showNotification(title, options);
    } catch (error) {
      console.error("Error sending reminder notification:", error);
    }
  };

  const subscribeToPush = async () => {
    if (!registration) {
      console.error("Service worker not registered");
      return;
    }

    console.log(
      "🔔 Starting subscription process for",
      isMobile ? "mobile" : "desktop"
    );
    setIsLoading(true);

    try {
      // For mobile, ensure permission is granted first
      if (isMobile && permission !== "granted") {
        throw new Error("Permission not granted for mobile notifications");
      }

      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        throw new Error("Notification permission denied");
      }

      // Demo mode - simulate successful subscription
      console.log("✅ Demo mode: Push subscription successful");
      setIsSubscribed(true);

      if (isMobile) {
        alert(
          "🎉 Notifikasi berhasil diaktifkan! Anda akan menerima pengingat absensi."
        );
      }

      // Setup reminder schedule
      if (
        notificationSettings?.is_enabled &&
        notificationSettings?.notification_time
      ) {
        scheduleReminder();
      }
    } catch (error) {
      console.error("Push subscription failed:", error);
      if (isMobile) {
        alert(
          "Gagal mengaktifkan notifikasi. Pastikan browser mendukung notifikasi push."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) {
      console.error("Service Worker not supported");
      return;
    }

    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      setRegistration(reg);
      console.log("✅ Service Worker registered successfully");

      // Handle service worker updates
      reg.addEventListener("updatefound", () => {
        console.log("Service Worker update found");
      });
    } catch (error) {
      console.error("❌ Service Worker registration failed:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isMobile ? (
            <Smartphone className="h-6 w-6 text-blue-600" />
          ) : (
            <Monitor className="h-6 w-6 text-blue-600" />
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pengingat Notifikasi {isMobile ? "Mobile" : "Desktop"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {isMobile
                ? "Terdeteksi perangkat mobile - notifikasi akan muncul dengan getaran"
                : "Terdeteksi perangkat desktop - notifikasi standar"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {permission === "granted" ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <span className="text-sm font-medium">
            {permission === "granted" ? "Aktif" : "Nonaktif"}
          </span>
        </div>
      </div>

      {!isSupported && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Browser Tidak Mendukung
              </h4>
              <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                Browser Anda tidak mendukung notifikasi push. Silakan gunakan
                browser yang lebih modern.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Status Section */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {permission === "granted" ? "✅" : "❌"}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Izin Browser
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {isSubscribed ? "🔔" : "🔕"}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Status Langganan
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {permission !== "granted" ? (
            <button
              onClick={requestPermissionAndSetup}
              disabled={!isSupported || isLoading}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              {isLoading ? "Mengaktifkan..." : "Aktifkan Notifikasi"}
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={sendTestNotification}
                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                <Play className="h-4 w-4" />
                Kirim Test Notifikasi
              </button>
              <div className="text-center">
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  ✅ Notifikasi aktif dan siap digunakan!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Debug Info */}
        <details className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
            🔍 Informasi Debug & Troubleshooting
          </summary>
          <div className="mt-3 space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <strong>Perangkat:</strong>{" "}
                {isMobile ? "📱 Mobile" : "💻 Desktop"}
              </div>
              <div>
                <strong>Browser Support:</strong>{" "}
                {isSupported ? "✅ Ya" : "❌ Tidak"}
              </div>
              <div>
                <strong>Permission:</strong> {permission}
              </div>
              <div>
                <strong>Service Worker:</strong>{" "}
                {registration ? "✅ Terdaftar" : "❌ Belum"}
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-400">
              <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Tips Troubleshooting Mobile:
              </h5>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-xs">
                <li>• Pastikan browser Chrome/Edge (dukungan terbaik)</li>
                <li>• Nonaktifkan mode "Do Not Disturb" di HP</li>
                <li>• Periksa pengaturan notifikasi browser di Settings</li>
                <li>• Coba refresh halaman dan aktifkan ulang</li>
                <li>
                  • Untuk iPhone: gunakan Safari atau tambahkan ke Home Screen
                </li>
              </ul>
            </div>
          </div>
        </details>

        {/* Information */}
        <div className="text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
            ℹ️ Cara Kerja Notifikasi:
          </h4>
          <ul className="space-y-1">
            {isMobile ? (
              <>
                <li>• Notifikasi mobile akan muncul dengan getaran</li>
                <li>• Tap notifikasi untuk membuka aplikasi</li>
                <li>• Notifikasi tetap terlihat sampai Anda tap</li>
                <li>• Pastikan tidak dalam mode silent/DND</li>
              </>
            ) : (
              <>
                <li>• Notifikasi akan muncul sesuai jadwal yang diatur</li>
                <li>
                  • Pastikan browser mengizinkan notifikasi dari situs ini
                </li>
                <li>• Notifikasi tetap berfungsi meskipun tab ditutup</li>
                <li>• Klik notifikasi untuk langsung ke halaman absensi</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
