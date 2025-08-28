"use client";

import { showSuccess, showError, showWarning, showInfo, showConfirmation, showToast } from "@/lib/customAlert";

export default function TestAlertPage() {
  const handleSuccess = () => {
    showSuccess("Login Berhasil!", "Selamat datang, Siska Purwanti, S.E.!");
  };

  const handleError = () => {
    showError("Terjadi Kesalahan", "Silakan coba lagi dalam beberapa saat");
  };

  const handleWarning = () => {
    showWarning("Peringatan", "Data yang dimasukkan tidak valid");
  };

  const handleInfo = () => {
    showInfo("Informasi", "Dashboard monitoring siswa PKL yang Anda bimbing");
  };

  const handleConfirmation = async () => {
    const result = await showConfirmation(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus data ini?"
    );
    if (result) {
      showSuccess("Berhasil", "Data telah dihapus");
    }
  };

  const handleToast = () => {
    showToast("Notifikasi berhasil dikirim", "success");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Test SweetAlert - Mobile Light Mode Fixed
          </h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Perbaikan yang Dilakukan:
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>✅ Fixed mobile animation out-of-frame issue</li>
              <li>✅ Perfect centering for popup alerts on mobile</li>
              <li>✅ Smooth slide animations for toast notifications</li>
              <li>✅ Constrained width to prevent overflow</li>
              <li>✅ Fixed mobile light mode display issue</li>
              <li>✅ Forced light theme for all SweetAlert elements</li>
              <li>✅ Consistent white background and dark text on mobile</li>
              <li>✅ Responsive design untuk mobile (width 85% on mobile)</li>
              <li>✅ Toast position yang adaptif (center di mobile, top-end di desktop)</li>
              <li>✅ Font size yang disesuaikan untuk mobile</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={handleSuccess}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Success Alert
            </button>

            <button
              onClick={handleError}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Error Alert
            </button>

            <button
              onClick={handleWarning}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Warning Alert
            </button>

            <button
              onClick={handleInfo}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Info Alert
            </button>

            <button
              onClick={handleConfirmation}
              className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Confirmation Dialog
            </button>

            <button
              onClick={handleToast}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Toast Notification
            </button>
          </div>

          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
              📱 Animation Fixes Applied:
            </h3>
            <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
              <li>• Alert now animates properly within viewport on mobile</li>
              <li>• Perfect center positioning prevents out-of-frame issues</li>
              <li>• Toast notifications slide smoothly from top</li>
              <li>• Animations respect mobile screen boundaries</li>
              <li>• Maximum width constraints prevent overflow</li>
              <li>• Z-index properly configured for layering</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
