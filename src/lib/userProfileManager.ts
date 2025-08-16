// Helper functions untuk mengelola hubungan user dengan guru dan siswa
// Note: Halaman User Profile Management telah dihapus.
// File ini disimpan untuk backward compatibility dan possible future use.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface UserWithProfile {
  user_id: number;
  username: string;
  nama: string;
  role: "admin" | "guru" | "siswa";
  // Guru fields (if role = guru)
  id_guru?: string;
  nama_guru?: string;
  // Siswa fields (if role = siswa)
  nisn?: string;
  nama_siswa?: string;
  kelas?: string;
  tahun_pelajaran?: string;
  semester?: string;
  id_dudi?: string;
  nama_dudi?: string;
  siswa_id_guru?: string;
  siswa_nama_guru?: string;
}

/**
 * Mendapatkan data user lengkap dengan profile guru/siswa
 * DEPRECATED: Halaman User Profile Management telah dihapus
 */
export async function getUserWithProfile(
  username: string
): Promise<UserWithProfile | null> {
  try {
    const { data, error } = await supabase
      .from("v_user_complete")
      .select("*")
      .eq("username", username)
      .single();

    if (error) {
      console.error("Error fetching user with profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserWithProfile:", error);
    return null;
  }
}

/**
 * Membuat user guru baru dengan profile
 * Digunakan di Create User page
 */
export async function createGuruWithUser(data: {
  username: string;
  nama: string;
  password: string;
  id_guru: string;
}) {
  try {
    const { data: result, error } = await supabase.rpc(
      "create_guru_with_user",
      {
        p_username: data.username,
        p_nama: data.nama,
        p_password: data.password,
        p_id_guru: data.id_guru,
      }
    );

    if (error) {
      throw error;
    }

    return { success: true, user_id: result };
  } catch (error) {
    console.error("Error creating guru with user:", error);
    return { success: false, error };
  }
}

/**
 * Membuat user siswa baru dengan profile
 * Digunakan di Create User page
 */
export async function createSiswaWithUser(data: {
  username: string;
  nama: string;
  password: string;
  nisn: string;
  kelas: string;
  tahun_pelajaran: string;
  semester: string;
  id_dudi: string;
  nama_dudi: string;
  id_guru: string;
  nama_guru: string;
}) {
  try {
    const { data: result, error } = await supabase.rpc(
      "create_siswa_with_user",
      {
        p_username: data.username,
        p_nama: data.nama,
        p_password: data.password,
        p_nisn: data.nisn,
        p_kelas: data.kelas,
        p_tahun_pelajaran: data.tahun_pelajaran,
        p_semester: data.semester,
        p_id_dudi: data.id_dudi,
        p_nama_dudi: data.nama_dudi,
        p_id_guru: data.id_guru,
        p_nama_guru: data.nama_guru,
      }
    );

    if (error) {
      throw error;
    }

    return { success: true, user_id: result };
  } catch (error) {
    console.error("Error creating siswa with user:", error);
    return { success: false, error };
  }
}
