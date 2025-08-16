"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft, Save, User } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FormData {
  id_guru: string;
  nama_guru: string;
}

interface EditGuruPageProps {
  params: Promise<{
    id_guru: string;
  }>;
}

export default function EditGuruPage({ params }: EditGuruPageProps) {
  const resolvedParams = use(params);
  const [formData, setFormData] = useState<FormData>({
    id_guru: "",
    nama_guru: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const { error, success } = useToast();

  useEffect(() => {
    checkUser();
    fetchGuruData();
  }, [resolvedParams.id_guru]);

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

  const fetchGuruData = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("tb_guru")
        .select("*")
        .eq("id_guru", resolvedParams.id_guru)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          error("Data guru tidak ditemukan");
          router.push("/admin/guru");
          return;
        }
        throw fetchError;
      }

      setFormData({
        id_guru: data.id_guru,
        nama_guru: data.nama_guru,
      });
    } catch (fetchError) {
      console.error("Error fetching guru data:", fetchError);
      error("Gagal memuat data guru");
      router.push("/admin/guru");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.nama_guru.trim()) {
      error("Nama Guru harus diisi");
      return false;
    }

    if (formData.nama_guru.length > 100) {
      error("Nama guru maksimal 100 karakter");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const { error: updateError } = await supabase
        .from("tb_guru")
        .update({
          nama_guru: formData.nama_guru.trim(),
        })
        .eq("id_guru", resolvedParams.id_guru);

      if (updateError) throw updateError;

      success("Data guru berhasil diperbarui");
      router.push(`/admin/guru/${resolvedParams.id_guru}`);
    } catch (updateError) {
      console.error("Error updating guru:", updateError);
      error("Gagal memperbarui data guru");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data guru...</p>
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
              href={`/admin/guru/${resolvedParams.id_guru}`}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </Link>
            <div className="flex items-center">
              <User className="h-6 w-6 text-indigo-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">Edit Guru</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
              Edit Informasi Guru
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ID Guru (Read-only) */}
              <div>
                <label
                  htmlFor="id_guru"
                  className="block text-sm font-medium text-gray-700"
                >
                  ID Guru
                </label>
                <input
                  type="text"
                  name="id_guru"
                  id="id_guru"
                  value={formData.id_guru}
                  readOnly
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  ID guru tidak dapat diubah
                </p>
              </div>

              {/* Nama Guru */}
              <div>
                <label
                  htmlFor="nama_guru"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nama Guru <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_guru"
                  id="nama_guru"
                  required
                  maxLength={100}
                  value={formData.nama_guru}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Masukkan nama lengkap guru"
                  disabled={isSaving}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Nama lengkap guru (maksimal 100 karakter)
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Link
                  href={`/admin/guru/${resolvedParams.id_guru}`}
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
