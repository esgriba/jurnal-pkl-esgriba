"use client";

import { useState, useEffect, use } from "react";
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

interface EditDudiPageProps {
  params: Promise<{
    id_dudi: string;
  }>;
}

export default function EditDudiPage({ params }: EditDudiPageProps) {
  const resolvedParams = use(params);
  const [formData, setFormData] = useState<FormData>({
    id_dudi: "",
    nama_dudi: "",
    alamat_dudi: "",
    kontak_dudi: "",
    lokasi_map: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const { error, success } = useToast();

  useEffect(() => {
    checkUser();
    fetchDudiData();
  }, [resolvedParams.id_dudi]);

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

  const fetchDudiData = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("tb_dudi")
        .select("*")
        .eq("id_dudi", resolvedParams.id_dudi)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          error("Data DUDI tidak ditemukan");
          router.push("/admin/dudi");
          return;
        }
        throw fetchError;
      }

      setFormData({
        id_dudi: data.id_dudi,
        nama_dudi: data.nama_dudi,
        alamat_dudi: data.alamat_dudi || "",
        kontak_dudi: data.kontak_dudi || "",
        lokasi_map: data.lokasi_map || "",
      });
    } catch (fetchError) {
      console.error("Error fetching dudi data:", fetchError);
      error("Gagal memuat data DUDI");
      router.push("/admin/dudi");
    } finally {
      setIsLoading(false);
    }
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

    setIsSaving(true);

    try {
      // Update DUDI with lokasi_map support
      const { error: updateError } = await supabase
        .from("tb_dudi")
        .update({
          nama_dudi: formData.nama_dudi.trim(),
          alamat_dudi: formData.alamat_dudi.trim() || null,
          kontak_dudi: formData.kontak_dudi.trim() || null,
          lokasi_map: formData.lokasi_map.trim() || null,
        })
        .eq("id_dudi", resolvedParams.id_dudi);

      if (updateError) throw updateError;

      success("Data DUDI berhasil diperbarui");
      router.push(`/admin/dudi/${resolvedParams.id_dudi}`);
    } catch (updateError) {
      console.error("Error updating dudi:", updateError);
      console.error(
        "Full error details:",
        JSON.stringify(updateError, null, 2)
      );

      // More specific error messages
      if (
        updateError &&
        typeof updateError === "object" &&
        "message" in updateError
      ) {
        error(`Gagal memperbarui data DUDI: ${updateError.message}`);
      } else if (
        updateError &&
        typeof updateError === "object" &&
        "code" in updateError
      ) {
        error(
          `Database error (${updateError.code}): Gagal memperbarui data DUDI`
        );
      } else {
        error("Gagal memperbarui data DUDI");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data DUDI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link
              href={`/admin/dudi/${resolvedParams.id_dudi}`}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </Link>
            <div className="flex items-center">
              <Building2 className="h-6 w-6 text-indigo-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">Edit DUDI</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
              Edit Informasi DUDI
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ID DUDI (Read-only) */}
              <div>
                <label
                  htmlFor="id_dudi"
                  className="block text-sm font-medium text-gray-700"
                >
                  ID DUDI
                </label>
                <input
                  type="text"
                  name="id_dudi"
                  id="id_dudi"
                  value={formData.id_dudi}
                  readOnly
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  ID DUDI tidak dapat diubah
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
                  disabled={isSaving}
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
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 placeholder:text-gray-400 bg-white"
                  placeholder="Masukkan alamat lengkap DUDI"
                  disabled={isSaving}
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
                  disabled={isSaving}
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
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 placeholder:text-gray-400 bg-white"
                  placeholder="Masukkan URL Google Maps atau embed code"
                  disabled={isSaving}
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
                  href={`/admin/dudi/${resolvedParams.id_dudi}`}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Perubahan
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
