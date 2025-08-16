// Helper functions untuk mengelola hubungan user dengan guru dan siswa
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
 * Mendapatkan data user berdasarkan ID
 */
export async function getUserById(
  userId: number
): Promise<UserWithProfile | null> {
  try {
    const { data, error } = await supabase
      .from("v_user_complete")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user by ID:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
}

/**
 * Membuat user guru baru dengan profile
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

/**
 * Menghubungkan user yang sudah ada dengan profile guru
 */
export async function linkUserToGuru(userId: number, idGuru: string) {
  try {
    const { error } = await supabase
      .from("tb_guru")
      .update({ user_id: userId })
      .eq("id_guru", idGuru);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error linking user to guru:", error);
    return { success: false, error };
  }
}

/**
 * Menghubungkan user yang sudah ada dengan profile siswa
 */
export async function linkUserToSiswa(userId: number, nisn: string) {
  try {
    const { error } = await supabase
      .from("tb_siswa")
      .update({ user_id: userId })
      .eq("nisn", nisn);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error linking user to siswa:", error);
    return { success: false, error };
  }
}

/**
 * Mendapatkan semua guru beserta user data mereka
 */
export async function getAllGuruWithUsers() {
  try {
    const { data, error } = await supabase
      .from("v_user_complete")
      .select("*")
      .eq("role", "guru")
      .order("nama_guru");

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching guru with users:", error);
    return { success: false, error };
  }
}

/**
 * Mendapatkan semua siswa beserta user data mereka
 */
export async function getAllSiswaWithUsers() {
  try {
    const { data, error } = await supabase
      .from("v_user_complete")
      .select("*")
      .eq("role", "siswa")
      .order("nama_siswa");

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching siswa with users:", error);
    return { success: false, error };
  }
}

/**
 * Mendapatkan siswa yang dibimbing oleh guru tertentu
 */
export async function getSiswaBimbinganByGuru(idGuru: string) {
  try {
    const { data, error } = await supabase
      .from("v_user_complete")
      .select("*")
      .eq("role", "siswa")
      .eq("siswa_id_guru", idGuru)
      .order("nama_siswa");

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching siswa bimbingan:", error);
    return { success: false, error };
  }
}

/**
 * Validasi apakah user sudah terhubung dengan profile
 */
export async function validateUserProfileConnection(username: string) {
  try {
    const user = await getUserWithProfile(username);

    if (!user) {
      return {
        isConnected: false,
        message: "User tidak ditemukan",
      };
    }

    if (user.role === "guru" && !user.id_guru) {
      return {
        isConnected: false,
        message: "User guru belum terhubung dengan profile guru",
      };
    }

    if (user.role === "siswa" && !user.nisn) {
      return {
        isConnected: false,
        message: "User siswa belum terhubung dengan profile siswa",
      };
    }

    return {
      isConnected: true,
      message: "User sudah terhubung dengan profile",
      user,
    };
  } catch (error) {
    console.error("Error validating user profile connection:", error);
    return {
      isConnected: false,
      message: "Terjadi kesalahan saat validasi",
    };
  }
}
