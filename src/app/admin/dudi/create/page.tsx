"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FormData {
  id_dudi: string;
  nama_dudi: string;
  alamat_dudi: string;
  kontak_dudi: string;
  lokasi_map: string;
}

export default function CreateDudiPage() {
  const [formData, setFormData] = useState<FormData>({
    id_dudi: "",
    nama_dudi: "",
    alamat_dudi: "",
    kontak_dudi: "",
    lokasi_map: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const { error, success } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== "admin") {
      router.push("/login");
      return;
    }

    setCurrentUser(user);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.id_dudi.trim()) {
      error("ID DUDI harus diisi");
      return false;
    }

    if (!formData.nama_dudi.trim()) {
      error("Nama DUDI harus diisi");
      return false;
    }

    if (formData.nama_dudi.length > 255) {
      error("Nama DUDI maksimal 255 karakter");
      return false;
    }

    if (formData.alamat_dudi.length > 500) {
      error("Alamat DUDI maksimal 500 karakter");
      return false;
    }

    if (formData.kontak_dudi.length > 100) {
      error("Kontak DUDI maksimal 100 karakter");
      return false;
    }

    if (formData.lokasi_map.length > 500) {
      error("Lokasi Google Maps maksimal 500 karakter");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Check if ID already exists
      const { data: existingDudi } = await supabase
        .from("tb_dudi")
        .select("id_dudi")
        .eq("id_dudi", formData.id_dudi.trim())
        .single();

      if (existingDudi) {
        error("ID DUDI sudah ada dalam sistem");
        setIsLoading(false);
        return;
      }

      // Insert new DUDI with lokasi_map support
      const { error: insertError } = await supabase.from("tb_dudi").insert([
        {
          id_dudi: formData.id_dudi.trim(),
          nama_dudi: formData.nama_dudi.trim(),
          alamat_dudi: formData.alamat_dudi.trim() || null,
          kontak_dudi: formData.kontak_dudi.trim() || null,
          lokasi_map: formData.lokasi_map.trim() || null,
        },
      ]);

      if (insertError) throw insertError;

      success("Data DUDI berhasil ditambahkan");
      router.push("/admin/dudi");
    } catch (submitError) {
      console.error("Error creating dudi:", submitError);
      console.error(
        "Full error details:",
        JSON.stringify(submitError, null, 2)
      );

      // More specific error messages
      if (
        submitError &&
        typeof submitError === "object" &&
        "message" in submitError
      ) {
        error(`Gagal menambahkan data DUDI: ${submitError.message}`);
      } else if (
        submitError &&
        typeof submitError === "object" &&
        "code" in submitError
      ) {
        error(
          `Database error (${submitError.code}): Gagal menambahkan data DUDI`
        );
      } else {
        error("Gagal menambahkan data DUDI");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link
              href="/admin/dudi"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </Link>
            <div className="flex items-center">
              <Building2 className="h-6 w-6 text-indigo-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">
                Tambah DUDI Baru
              </h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
              Informasi DUDI
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ID DUDI */}
              <div>
                <label
                  htmlFor="id_dudi"
                  className="block text-sm font-medium text-gray-700"
                >
                  ID DUDI <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="id_dudi"
                  id="id_dudi"
                  required
                  value={formData.id_dudi}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Masukkan ID DUDI"
                  disabled={isLoading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  ID unik untuk DUDI (contoh: DU001, DU002, dll)
                </p>
              </div>

              {/* Nama DUDI */}
              <div>
                <label
                  htmlFor="nama_dudi"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nama DUDI <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_dudi"
                  id="nama_dudi"
                  required
                  maxLength={255}
                  value={formData.nama_dudi}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Masukkan nama lengkap DUDI"
                  disabled={isLoading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Nama lengkap Dunia Usaha/Dunia Industri (maksimal 255
                  karakter)
                </p>
              </div>

              {/* Alamat DUDI */}
              <div>
                <label
                  htmlFor="alamat_dudi"
                  className="block text-sm font-medium text-gray-700"
                >
                  Alamat DUDI
                </label>
                <textarea
                  name="alamat_dudi"
                  id="alamat_dudi"
                  rows={3}
                  maxLength={500}
                  value={formData.alamat_dudi}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Masukkan alamat lengkap DUDI"
                  disabled={isLoading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Alamat lengkap DUDI (opsional, maksimal 500 karakter)
                </p>
              </div>

              {/* Kontak DUDI */}
              <div>
                <label
                  htmlFor="kontak_dudi"
                  className="block text-sm font-medium text-gray-700"
                >
                  Kontak DUDI
                </label>
                <input
                  type="text"
                  name="kontak_dudi"
                  id="kontak_dudi"
                  maxLength={100}
                  value={formData.kontak_dudi}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Masukkan nomor telepon atau email"
                  disabled={isLoading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Nomor telepon atau email kontak DUDI (opsional, maksimal 100
                  karakter)
                </p>
              </div>

              {/* Lokasi Google Maps */}
              <div>
                <label
                  htmlFor="lokasi_map"
                  className="block text-sm font-medium text-gray-700"
                >
                  Lokasi Google Maps
                </label>
                <textarea
                  name="lokasi_map"
                  id="lokasi_map"
                  rows={3}
                  maxLength={500}
                  value={formData.lokasi_map}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Masukkan URL Google Maps atau embed code"
                  disabled={isLoading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  URL Google Maps atau embed code untuk lokasi DUDI (opsional,
                  maksimal 500 karakter)
                </p>
                {formData.lokasi_map && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Preview:</p>
                    <div className="text-xs text-blue-600 break-all bg-blue-50 p-2 rounded">
                      {formData.lokasi_map}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Link
                  href="/admin/dudi"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
