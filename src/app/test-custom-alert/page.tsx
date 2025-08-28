"use client";

import { showSuccess, showError, showWarning, showInfo, showConfirmation, showToast } from "@/lib/customAlert";
import { useSweetAlert } from "@/lib/customAlert";

export default function TestCustomAlertPage() {
  const sweetAlert = useSweetAlert();

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

  const handleSuccessToast = () => {
    sweetAlert.showSuccess("Data berhasil disimpan!", undefined, 3000);
  };

  const handleLongToast = () => {
    showToast("Ini adalah pesan notifikasi yang panjang untuk menguji bagaimana tampilan di mobile device", "info", 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Custom Alert System - Mobile Optimized
          </h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🎉 Fitur Sistem Alert Baru:
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>✅ Native React components untuk performa optimal</li>
              <li>✅ Animasi smooth dan responsif untuk semua device</li>
              <li>✅ Perfect centering yang tidak pernah keluar frame</li>
              <li>✅ Touch-friendly untuk mobile interaction</li>
              <li>✅ Auto-positioning toast: desktop (kanan atas) vs mobile (atas tengah)</li>
              <li>✅ Backdrop yang tidak mengganggu positioning</li>
              <li>✅ Light theme consistency</li>
              <li>✅ Accessible dengan keyboard navigation</li>
              <li>✅ TypeScript support penuh</li>
              <li>✅ Backward compatible dengan API SweetAlert</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <button
              onClick={handleSuccess}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors touch-manipulation"
            >
              Success Alert
            </button>

            <button
              onClick={handleError}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors touch-manipulation"
            >
              Error Alert
            </button>

            <button
              onClick={handleWarning}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-6 rounded-lg transition-colors touch-manipulation"
            >
              Warning Alert
            </button>

            <button
              onClick={handleInfo}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors touch-manipulation"
            >
              Info Alert
            </button>

            <button
              onClick={handleConfirmation}
              className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-6 rounded-lg transition-colors touch-manipulation"
            >
              Confirmation Dialog
            </button>

            <button
              onClick={handleToast}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-6 rounded-lg transition-colors touch-manipulation"
            >
              Toast Notification
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={handleSuccessToast}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-lg transition-colors touch-manipulation"
            >
              Success Toast (3s)
            </button>

            <button
              onClick={handleLongToast}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors touch-manipulation"
            >
              Long Message Toast
            </button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              📱 Mobile Optimization Features:
            </h3>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• Alert modal: Perfect centering dengan max-width constraint</li>
              <li>• Toast desktop: Slide dari kanan atas</li>
              <li>• Toast mobile: Slide dari atas tengah untuk visibility</li>
              <li>• Touch-friendly button sizing (44px minimum)</li>
              <li>• Safe area respect untuk notch/rounded corners</li>
              <li>• Smooth 60fps animations</li>
              <li>• Auto-dismiss dengan manual close option</li>
              <li>• Multiple toast stacking yang rapi</li>
            </ul>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              🔄 Backward Compatibility:
            </h3>
            <p className="text-blue-700 text-sm">
              Semua fungsi SweetAlert yang sudah ada tetap bisa digunakan dengan API yang sama. 
              Tidak perlu mengubah kode yang sudah ada - sistem akan otomatis menggunakan 
              alert system yang baru dan lebih optimal!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
