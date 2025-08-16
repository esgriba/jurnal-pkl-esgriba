"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/Toast";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// For admin operations, we might need elevated permissions
// Let's add a test to see if this is a permissions issue
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("tb_siswa")
      .select("count", { count: "exact", head: true });

    console.log("Connection test:", { data, error });
    return !error;
  } catch (e) {
    console.error("Connection test failed:", e);
    return false;
  }
};

interface Siswa {
  nisn: string;
  nama_siswa: string;
  kelas: string;
  tahun_pelajaran: string;
  semester: string;
  id_guru: string;
  nama_guru: string;
  id_dudi: string;
  nama_dudi: string;
}

interface Dudi {
  id_dudi: string;
  nama_dudi: string;
  alamat: string;
}

interface Guru {
  id_guru: string;
  nama_guru: string;
}

export default function EditSiswaPage() {
  const params = useParams();
  const router = useRouter();
  const { error, success } = useToast();
  const [siswa, setSiswa] = useState<Siswa | null>(null);
  const [dudi, setDudi] = useState<Dudi[]>([]);
  const [guru, setGuru] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const nisn = params.nisn as string;

  useEffect(() => {
    testSupabaseConnection();
    fetchSiswa();
    fetchDudi();
    fetchGuru();
  }, [nisn]);

  const fetchSiswa = async () => {
    try {
      console.log("Fetching siswa with NISN:", nisn);

      const { data, error: fetchError } = await supabase
        .from("tb_siswa")
        .select("*")
        .eq("nisn", nisn)
        .single();

      console.log("Fetch result:", { data, error: fetchError });

      if (fetchError) throw fetchError;

      console.log("Siswa data structure:", Object.keys(data || {}));
      setSiswa(data);
    } catch (fetchError) {
      console.error("Error fetching siswa:", fetchError);
      error("Gagal memuat data siswa");
    } finally {
      setLoading(false);
    }
  };

  const fetchDudi = async () => {
    try {
      const { data, error } = await supabase
        .from("tb_dudi")
        .select("*")
        .order("nama_dudi");

      if (error) throw error;
      setDudi(data || []);
    } catch (error) {
      console.error("Error fetching dudi:", error);
    }
  };

  const fetchGuru = async () => {
    try {
      const { data, error } = await supabase
        .from("tb_guru")
        .select("*")
        .order("nama_guru");

      if (error) throw error;
      setGuru(data || []);
    } catch (error) {
      console.error("Error fetching guru:", error);
    }
  };

  const fetchUserName = async (username: string) => {
    try {
      const { data, error } = await supabase
        .from("tb_user")
        .select("nama")
        .eq("username", username)
        .single();

      if (error) throw error;
      return data?.nama || "";
    } catch (error) {
      console.error("Error fetching user name:", error);
      return "";
    }
  };

  const handleNisnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNisn = e.target.value;
    if (newNisn) {
      const userName = await fetchUserName(newNisn);
      if (userName) {
        // Auto-fill nama field
        const namaInput = document.querySelector(
          'input[name="nama"]'
        ) as HTMLInputElement;
        if (namaInput) {
          namaInput.value = userName;
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!siswa) return;

    setSaving(true);
    try {
      const formData = new FormData(e.currentTarget);

      // Prepare update data with the correct field names
      const selectedDudi = dudi.find(
        (d) => d.id_dudi === formData.get("id_dudi")
      );
      const selectedGuru = guru.find(
        (g) => g.id_guru === formData.get("id_guru")
      );

      const updateData = {
        nama_siswa: formData.get("nama_siswa")?.toString() || "",
        kelas: formData.get("kelas")?.toString() || "",
        tahun_pelajaran: formData.get("tahun_pelajaran")?.toString() || "",
        semester: formData.get("semester")?.toString() || "",
        id_dudi: formData.get("id_dudi")?.toString() || "",
        nama_dudi: selectedDudi?.nama_dudi || "",
        id_guru: formData.get("id_guru")?.toString() || "",
        nama_guru: selectedGuru?.nama_guru || "",
      };

      const { error: updateError } = await supabase
        .from("tb_siswa")
        .update(updateData)
        .eq("nisn", nisn);

      if (updateError) {
        console.error("Detailed error:", JSON.stringify(updateError, null, 2));
        throw updateError;
      }

      success("Data siswa berhasil diperbarui");
      router.push("/admin/siswa");
    } catch (updateError: any) {
      console.error("Error updating siswa:", updateError);

      // Show detailed error in toast for debugging
      const errorMessage =
        updateError?.message ||
        updateError?.error_description ||
        updateError?.details ||
        "Unknown error occurred";

      error(`Gagal memperbarui data siswa: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data siswa...</p>
        </div>
      </div>
    );
  }

  if (!siswa) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Siswa Tidak Ditemukan
          </h1>
          <p className="text-gray-600 mb-6">
            NISN {nisn} tidak ditemukan dalam database.
          </p>
          <button
            onClick={() => router.push("/admin/siswa")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Kembali ke Daftar Siswa
          </button>
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
              <h1 className="text-3xl font-bold text-gray-900">Edit Siswa</h1>
              <p className="mt-2 text-gray-600">NISN: {siswa.nisn}</p>
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
              {/* NISN - Read Only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NISN
                </label>
                <input
                  type="text"
                  value={siswa.nisn}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              {/* Nama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="nama_siswa"
                  defaultValue={siswa.nama_siswa}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Kelas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kelas
                </label>
                <select
                  name="kelas"
                  defaultValue={siswa.kelas}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih Kelas</option>
                  <option value="XII Akuntansi">XII Akuntansi</option>
                  <option value="XII TKJ">XII TKJ</option>
                  <option value="XII TKR">XII TKR</option>
                </select>
              </div>

              {/* Tahun Pelajaran */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun Pelajaran
                </label>
                <input
                  type="text"
                  name="tahun_pelajaran"
                  defaultValue={siswa.tahun_pelajaran}
                  required
                  placeholder="2024/2025"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester
                </label>
                <select
                  name="semester"
                  defaultValue={siswa.semester}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih Semester</option>
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>

              {/* Guru Pembimbing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guru Pembimbing
                </label>
                <select
                  name="id_guru"
                  defaultValue={siswa.id_guru}
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

              {/* DUDI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempat PKL (DUDI)
                </label>
                <select
                  name="id_dudi"
                  defaultValue={siswa.id_dudi}
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
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
