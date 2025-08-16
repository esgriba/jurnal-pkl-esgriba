"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/Toast";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Siswa {
  nisn: string;
  nama: string;
  kelas: string;
  jurusan: string;
  id_dudi: string;
  tempat_pkl: string;
  alamat_pkl: string;
  status: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
}

interface Dudi {
  id_dudi: string;
  nama_dudi: string;
  alamat: string;
}

export default function SiswaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { error, success } = useToast();
  const [siswa, setSiswa] = useState<Siswa | null>(null);
  const [dudi, setDudi] = useState<Dudi[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const nisn = params.nisn as string;

  useEffect(() => {
    fetchSiswa();
    fetchDudi();
  }, [nisn]);

  const fetchSiswa = async () => {
    try {
      const { data, error } = await supabase
        .from("tb_siswa")
        .select("*")
        .eq("nisn", nisn)
        .single();

      if (error) throw error;
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!siswa) return;

    setSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const selectedDudi = dudi.find(
        (d) => d.id_dudi === formData.get("id_dudi")
      );

      const updateData = {
        nama: formData.get("nama"),
        kelas: formData.get("kelas"),
        jurusan: formData.get("jurusan"),
        id_dudi: formData.get("id_dudi"),
        tempat_pkl: selectedDudi?.nama_dudi || "",
        alamat_pkl: selectedDudi?.alamat || "",
        status: formData.get("status"),
        tanggal_mulai: formData.get("tanggal_mulai"),
        tanggal_selesai: formData.get("tanggal_selesai"),
      };

      const { error: updateError } = await supabase
        .from("tb_siswa")
        .update(updateData)
        .eq("nisn", nisn);

      if (updateError) throw updateError;

      success("Data siswa berhasil diperbarui");
      router.push("/admin/siswa");
    } catch (updateError) {
      console.error("Error updating siswa:", updateError);
      error("Gagal memperbarui data siswa");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!siswa) return;

    if (!confirm("Apakah Anda yakin ingin menghapus data siswa ini?")) {
      return;
    }

    setSaving(true);
    try {
      const { error: deleteError } = await supabase
        .from("tb_siswa")
        .delete()
        .eq("nisn", nisn);

      if (deleteError) throw deleteError;

      success("Data siswa berhasil dihapus");
      router.push("/admin/siswa");
    } catch (deleteError) {
      console.error("Error deleting siswa:", deleteError);
      error("Gagal menghapus data siswa");
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
              <h1 className="text-3xl font-bold text-gray-900">Detail Siswa</h1>
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
                  name="nama"
                  defaultValue={siswa.nama}
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
                  <option value="XI">XI</option>
                  <option value="XII">XII</option>
                </select>
              </div>

              {/* Jurusan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jurusan
                </label>
                <select
                  name="jurusan"
                  defaultValue={siswa.jurusan}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih Jurusan</option>
                  <option value="Akuntansi">Akuntansi</option>
                  <option value="Teknik Komputer dan Jaringan">
                    Teknik Komputer dan Jaringan
                  </option>
                  <option value="Teknik Kendaraan Ringan">
                    Teknik Kendaraan Ringan
                  </option>
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

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status PKL
                </label>
                <select
                  name="status"
                  defaultValue={siswa.status}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="aktif">Aktif</option>
                  <option value="selesai">Selesai</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Tanggal Mulai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai PKL
                </label>
                <input
                  type="date"
                  name="tanggal_mulai"
                  defaultValue={siswa.tanggal_mulai}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Tanggal Selesai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Selesai PKL
                </label>
                <input
                  type="date"
                  name="tanggal_selesai"
                  defaultValue={siswa.tanggal_selesai}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Hapus Siswa
              </button>

              <div className="flex space-x-4">
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
