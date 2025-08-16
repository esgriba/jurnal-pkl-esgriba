export interface Database {
  public: {
    Tables: {
      tb_user: {
        Row: {
          id: number;
          username: string;
          nama: string | null;
          password: string;
          role: string;
        };
        Insert: {
          id?: number;
          username: string;
          nama?: string | null;
          password: string;
          role: string;
        };
        Update: {
          id?: number;
          username?: string;
          nama?: string | null;
          password?: string;
          role?: string;
        };
      };
      tb_siswa: {
        Row: {
          nisn: string;
          nama_siswa: string | null;
          kelas: string | null;
          tahun_pelajaran: string;
          semester: string;
          id_dudi: string;
          nama_dudi: string | null;
          id_guru: string;
          nama_guru: string;
        };
        Insert: {
          nisn: string;
          nama_siswa?: string | null;
          kelas?: string | null;
          tahun_pelajaran: string;
          semester: string;
          id_dudi: string;
          nama_dudi?: string | null;
          id_guru: string;
          nama_guru: string;
        };
        Update: {
          nisn?: string;
          nama_siswa?: string | null;
          kelas?: string | null;
          tahun_pelajaran?: string;
          semester?: string;
          id_dudi?: string;
          nama_dudi?: string | null;
          id_guru?: string;
          nama_guru?: string;
        };
      };
      tb_guru: {
        Row: {
          id_guru: string;
          nama_guru: string;
        };
        Insert: {
          id_guru: string;
          nama_guru: string;
        };
        Update: {
          id_guru?: string;
          nama_guru?: string;
        };
      };
      tb_dudi: {
        Row: {
          id_dudi: string;
          nama_dudi: string;
          alamat: string;
          id_guru: string;
        };
        Insert: {
          id_dudi: string;
          nama_dudi: string;
          alamat: string;
          id_guru: string;
        };
        Update: {
          id_dudi?: string;
          nama_dudi?: string;
          alamat?: string;
          id_guru?: string;
        };
      };
      tb_jurnal: {
        Row: {
          id_jurnal: string;
          nisn: string;
          nama_siswa: string;
          tahun_pelajaran: string;
          semester: string;
          tanggal: string;
          evadir_personal: string;
          evadir_sosial: string;
          foto_kegiatan: string;
          deskripsi_kegiatan: string;
          lokasi: string | null;
          id_guru: string;
          nama_guru: string;
          id_dudi: string;
          nama_dudi: string;
        };
        Insert: {
          id_jurnal: string;
          nisn: string;
          nama_siswa: string;
          tahun_pelajaran: string;
          semester: string;
          tanggal: string;
          evadir_personal: string;
          evadir_sosial: string;
          foto_kegiatan: string;
          deskripsi_kegiatan: string;
          lokasi?: string | null;
          id_guru: string;
          nama_guru: string;
          id_dudi: string;
          nama_dudi: string;
        };
        Update: {
          id_jurnal?: string;
          nisn?: string;
          nama_siswa?: string;
          tahun_pelajaran?: string;
          semester?: string;
          tanggal?: string;
          evadir_personal?: string;
          evadir_sosial?: string;
          foto_kegiatan?: string;
          deskripsi_kegiatan?: string;
          lokasi?: string | null;
          id_guru?: string;
          nama_guru?: string;
          id_dudi?: string;
          nama_dudi?: string;
        };
      };
      tb_absensi: {
        Row: {
          id_absensi: number;
          nisn: string;
          nama_siswa: string;
          kelas: string;
          lokasi: string | null;
          id_dudi: string;
          nama_dudi: string;
          tanggal: string;
          status: string | null;
          keterangan: string | null;
          id_guru: string;
          nama_guru: string;
          jam_absensi: string | null;
        };
        Insert: {
          id_absensi?: number;
          nisn: string;
          nama_siswa: string;
          kelas: string;
          lokasi?: string | null;
          id_dudi: string;
          nama_dudi: string;
          tanggal: string;
          status?: string | null;
          keterangan?: string | null;
          id_guru: string;
          nama_guru: string;
          jam_absensi?: string | null;
        };
        Update: {
          id_absensi?: number;
          nisn?: string;
          nama_siswa?: string;
          kelas?: string;
          lokasi?: string | null;
          id_dudi?: string;
          nama_dudi?: string;
          tanggal?: string;
          status?: string | null;
          keterangan?: string | null;
          id_guru?: string;
          nama_guru?: string;
          jam_absensi?: string | null;
        };
      };
      tb_monitoring: {
        Row: {
          id_monitoring: string;
          tanggal: string;
          catatan_monitoring: string;
          id_dudi: string;
          id_guru: string;
        };
        Insert: {
          id_monitoring: string;
          tanggal: string;
          catatan_monitoring: string;
          id_dudi: string;
          id_guru: string;
        };
        Update: {
          id_monitoring?: string;
          tanggal?: string;
          catatan_monitoring?: string;
          id_dudi?: string;
          id_guru?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
