"use client";

import { useState, useEffect } from "react";
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

export default function CreateGuruPage() {
  const [formData, setFormData] = useState<FormData>({
    id_guru: "",
    nama_guru: "",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.id_guru.trim()) {
      error("ID Guru harus diisi");
      return false;
    }

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

    setIsLoading(true);

    try {
      // Check if ID already exists in guru table
      const { data: existingGuru } = await supabase
        .from("tb_guru")
        .select("id_guru")
        .eq("id_guru", formData.id_guru.trim())
        .single();

      if (existingGuru) {
        error("ID Guru sudah ada dalam sistem");
        setIsLoading(false);
        return;
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("tb_user")
        .select("username")
        .eq("username", formData.id_guru.trim())
        .single();

      // If user doesn't exist, create user account first
      if (!existingUser) {
        const userData = {
          username: formData.id_guru.trim(),
          password: "123456", // Default password
          nama: formData.nama_guru.trim(),
          role: "guru",
        };

        const { error: userError } = await supabase
          .from("tb_user")
          .insert([userData]);

        if (userError) {
          console.error("Error creating user:", userError);
          throw new Error("Gagal membuat akun user untuk guru");
        }
      }

      // Insert new guru
      const { error: insertError } = await supabase.from("tb_guru").insert([
        {
          id_guru: formData.id_guru.trim(),
          nama_guru: formData.nama_guru.trim(),
        },
      ]);

      if (insertError) throw insertError;

      success(
        "Data guru dan akun user berhasil ditambahkan dengan password default: 123456"
      );
      router.push("/admin/guru");
    } catch (submitError: any) {
      console.error("Error creating guru:", submitError);
      error(submitError?.message || "Gagal menambahkan data guru");
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
              href="/admin/guru"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </Link>
            <div className="flex items-center">
              <User className="h-6 w-6 text-indigo-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">
                Tambah Guru Baru
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
              Informasi Guru
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ID Guru */}
              <div>
                <label
                  htmlFor="id_guru"
                  className="block text-sm font-medium text-gray-700"
                >
                  ID Guru <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="id_guru"
                  id="id_guru"
                  required
                  value={formData.id_guru}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Masukkan ID guru"
                  disabled={isLoading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  ID unik untuk guru (contoh: GR001, GR002, dll)
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
                  disabled={isLoading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Nama lengkap guru (maksimal 100 karakter)
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Link
                  href="/admin/guru"
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
