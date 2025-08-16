"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/Toast";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Dudi {
  id_dudi: string;
  nama_dudi: string;
  alamat: string;
}

interface Guru {
  id_guru: string;
  nama_guru: string;
}

export default function CreateSiswaPage() {
  const router = useRouter();
  const { error, success } = useToast();
  const [dudi, setDudi] = useState<Dudi[]>([]);
  const [guru, setGuru] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nisn: "",
    nama: "",
    kelas: "",
    tahun_pelajaran: "",
    semester: "",
    id_dudi: "",
    id_guru: "",
  });

  useEffect(() => {
    fetchDudi();
    fetchGuru();
  }, []);

  const fetchDudi = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("tb_dudi")
        .select("*")
        .order("nama_dudi");

      if (fetchError) throw fetchError;
      setDudi(data || []);
    } catch (fetchError) {
      console.error("Error fetching dudi:", fetchError);
    }
  };

  const fetchGuru = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("tb_guru")
        .select("*")
        .order("nama_guru");

      if (fetchError) throw fetchError;
      setGuru(data || []);
    } catch (fetchError) {
      console.error("Error fetching guru:", fetchError);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserName = async (username: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("tb_user")
        .select("nama")
        .eq("username", username)
        .single();

      if (fetchError) {
        // If no user found, return empty string
        return "";
      }
      return data?.nama || "";
    } catch (fetchError) {
      console.error("Error fetching user name:", fetchError);
      return "";
    }
  };

  const handleNisnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNisn = e.target.value;
    setFormData((prev) => ({ ...prev, nisn: newNisn }));

    if (newNisn.length >= 4) {
      // Only try to fetch after some characters
      const userName = await fetchUserName(newNisn);
      if (userName) {
        setFormData((prev) => ({ ...prev, nama: userName }));
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Get selected DUDI and Guru details
      const selectedDudi = dudi.find((d) => d.id_dudi === formData.id_dudi);
      const selectedGuru = guru.find((g) => g.id_guru === formData.id_guru);

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("tb_user")
        .select("username")
        .eq("username", formData.nisn)
        .single();

      // If user doesn't exist, create user account first
      if (!existingUser) {
        const userData = {
          username: formData.nisn,
          password: "123456", // Default password
          nama: formData.nama,
          role: "siswa",
        };

        const { error: userError } = await supabase
          .from("tb_user")
          .insert([userData]);

        if (userError) {
          console.error("Error creating user:", userError);
          throw new Error("Gagal membuat akun user untuk siswa");
        }
      }

      // Create siswa data
      const siswaData = {
        nisn: formData.nisn,
        nama_siswa: formData.nama,
        kelas: formData.kelas,
        tahun_pelajaran: formData.tahun_pelajaran,
        semester: formData.semester,
        id_dudi: formData.id_dudi,
        nama_dudi: selectedDudi?.nama_dudi || "",
        id_guru: formData.id_guru,
        nama_guru: selectedGuru?.nama_guru || "",
      };

      const { error: insertError } = await supabase
        .from("tb_siswa")
        .insert([siswaData]);

      if (insertError) throw insertError;

      success(
        "Data siswa dan akun user berhasil ditambahkan dengan password default: 123456"
      );
      router.push("/admin/siswa");
    } catch (insertError: any) {
      console.error("Error creating siswa:", insertError);
      error(insertError?.message || "Gagal menambahkan data siswa");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tambah Siswa Baru
              </h1>
              <p className="mt-2 text-gray-600">Masukkan data siswa PKL</p>
            </div>
            <button
              onClick={() => router.push("/admin/siswa")}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Kembali
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NISN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NISN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nisn"
                  value={formData.nisn}
                  onChange={handleNisnChange}
                  required
                  placeholder="Masukkan NISN siswa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Nama akan otomatis terisi jika NISN terdaftar dalam sistem
                </p>
              </div>

              {/* Nama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  required
                  placeholder="Nama akan otomatis terisi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Kelas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kelas <span className="text-red-500">*</span>
                </label>
                <select
                  name="kelas"
                  value={formData.kelas}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih Kelas</option>
                  <option value="XII Akuntansi">XII Akuntansi</option>
                  <option value="XII TKJ">
                    XII TKJ (Teknik Komputer dan Jaringan)
                  </option>
                  <option value="XII TKR">
                    XII TKR (Teknik Kendaraan Ringan)
                  </option>
                </select>
              </div>

              {/* Tahun Pelajaran */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun Pelajaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tahun_pelajaran"
                  value={formData.tahun_pelajaran}
                  onChange={handleInputChange}
                  required
                  placeholder="2024/2025"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih Semester</option>
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>

              {/* DUDI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempat PKL (DUDI) <span className="text-red-500">*</span>
                </label>
                <select
                  name="id_dudi"
                  value={formData.id_dudi}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih DUDI</option>
                  {dudi.map((item) => (
                    <option key={item.id_dudi} value={item.id_dudi}>
                      {item.nama_dudi} - {item.alamat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Guru Pembimbing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guru Pembimbing <span className="text-red-500">*</span>
                </label>
                <select
                  name="id_guru"
                  value={formData.id_guru}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih Guru</option>
                  {guru.map((item) => (
                    <option key={item.id_guru} value={item.id_guru}>
                      {item.nama_guru} (ID: {item.id_guru})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push("/admin/siswa")}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan Siswa"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
