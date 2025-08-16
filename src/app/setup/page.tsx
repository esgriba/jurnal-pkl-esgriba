"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, ExternalLink, Copy } from "lucide-react";

export default function SetupPage() {
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [copied, setCopied] = useState("");

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl || "https://your-project-id.supabase.co"}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey || "your-anon-key-here"}
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here`;

  const sqlScript = `-- Setup Database Schema for Jurnal PKL
-- Run these commands in your Supabase SQL Editor

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET timezone TO 'Asia/Jakarta';

-- Create tables
CREATE TABLE IF NOT EXISTS public.tb_user (
    id SERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    nama VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(19) NOT NULL CHECK (role IN ('siswa', 'guru', 'admin'))
);

CREATE TABLE IF NOT EXISTS public.tb_guru (
    id_guru VARCHAR(100) PRIMARY KEY,
    nama_guru VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tb_dudi (
    id_dudi VARCHAR(100) PRIMARY KEY,
    nama_dudi VARCHAR(100) NOT NULL,
    alamat TEXT NOT NULL,
    id_guru VARCHAR(20) NOT NULL,
    FOREIGN KEY (id_guru) REFERENCES tb_guru(id_guru)
);

CREATE TABLE IF NOT EXISTS public.tb_siswa (
    nisn VARCHAR(20) PRIMARY KEY,
    nama_siswa VARCHAR(100),
    kelas VARCHAR(25),
    tahun_pelajaran VARCHAR(11) NOT NULL,
    semester VARCHAR(25) NOT NULL,
    id_dudi VARCHAR(25) NOT NULL,
    nama_dudi VARCHAR(100),
    id_guru VARCHAR(100) NOT NULL,
    nama_guru VARCHAR(100) NOT NULL,
    FOREIGN KEY (id_guru) REFERENCES tb_guru(id_guru),
    FOREIGN KEY (id_dudi) REFERENCES tb_dudi(id_dudi)
);

CREATE TABLE IF NOT EXISTS public.tb_jurnal (
    id_jurnal VARCHAR(15) PRIMARY KEY,
    nisn VARCHAR(12) NOT NULL,
    nama_siswa VARCHAR(100) NOT NULL,
    tahun_pelajaran VARCHAR(25) NOT NULL,
    semester VARCHAR(25) NOT NULL,
    tanggal VARCHAR(25) NOT NULL,
    evadir_personal VARCHAR(200) NOT NULL,
    evadir_sosial VARCHAR(200) NOT NULL,
    foto_kegiatan VARCHAR(200) NOT NULL,
    deskripsi_kegiatan TEXT NOT NULL,
    lokasi VARCHAR(70),
    id_guru VARCHAR(25) NOT NULL,
    nama_guru VARCHAR(200) NOT NULL,
    id_dudi VARCHAR(100) NOT NULL,
    nama_dudi VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (nisn) REFERENCES tb_siswa(nisn),
    FOREIGN KEY (id_guru) REFERENCES tb_guru(id_guru),
    FOREIGN KEY (id_dudi) REFERENCES tb_dudi(id_dudi)
);

CREATE TABLE IF NOT EXISTS public.tb_absensi (
    id_absensi SERIAL PRIMARY KEY,
    nisn VARCHAR(12) NOT NULL,
    nama_siswa VARCHAR(100) NOT NULL,
    kelas VARCHAR(25) NOT NULL,
    lokasi VARCHAR(100),
    id_dudi VARCHAR(25) NOT NULL,
    nama_dudi VARCHAR(200) NOT NULL,
    tanggal DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Hadir', 'Sakit', 'Izin', 'Alpha')),
    keterangan TEXT,
    id_guru VARCHAR(100) NOT NULL,
    nama_guru VARCHAR(100) NOT NULL,
    jam_absensi TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (nisn) REFERENCES tb_siswa(nisn),
    FOREIGN KEY (id_guru) REFERENCES tb_guru(id_guru),
    FOREIGN KEY (id_dudi) REFERENCES tb_dudi(id_dudi)
);

CREATE TABLE IF NOT EXISTS public.tb_monitoring (
    id_monitoring VARCHAR(11) PRIMARY KEY,
    tanggal DATE NOT NULL,
    catatan_monitoring TEXT NOT NULL,
    id_dudi VARCHAR(20) NOT NULL,
    id_guru VARCHAR(11) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (id_guru) REFERENCES tb_guru(id_guru),
    FOREIGN KEY (id_dudi) REFERENCES tb_dudi(id_dudi)
);

-- Create storage bucket for journal photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('jurnal-photos', 'jurnal-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security policies
ALTER TABLE public.tb_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_dudi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_jurnal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_absensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_monitoring ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.tb_user;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.tb_siswa;
DROP POLICY IF EXISTS "Enable all access for authenticated users on tb_guru" ON public.tb_guru;
DROP POLICY IF EXISTS "Enable all access for authenticated users on tb_dudi" ON public.tb_dudi;
DROP POLICY IF EXISTS "Enable all access for authenticated users on tb_jurnal" ON public.tb_jurnal;
DROP POLICY IF EXISTS "Enable all access for authenticated users on tb_absensi" ON public.tb_absensi;
DROP POLICY IF EXISTS "Enable all access for authenticated users on tb_monitoring" ON public.tb_monitoring;

-- Create new policies
CREATE POLICY "Allow all operations" ON public.tb_user FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.tb_siswa FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.tb_guru FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.tb_dudi FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.tb_jurnal FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.tb_absensi FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.tb_monitoring FOR ALL USING (true);

-- Storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'jurnal-photos');
CREATE POLICY "Authenticated users can upload" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'jurnal-photos');

-- Insert sample data
INSERT INTO public.tb_guru (id_guru, nama_guru) VALUES 
('GURU001', 'Budi Santoso, S.Kom'),
('GURU002', 'Siti Nurhaliza, S.Pd'),
('GURU003', 'Ahmad Fadli, M.Kom')
ON CONFLICT (id_guru) DO NOTHING;

INSERT INTO public.tb_dudi (id_dudi, nama_dudi, alamat, id_guru) VALUES 
('DUDI001', 'PT. Teknologi Nusantara', 'Jl. Raya Industri No. 123, Surabaya', 'GURU001'),
('DUDI002', 'CV. Digital Solusi', 'Jl. Pemuda No. 45, Malang', 'GURU002'),
('DUDI003', 'PT. Maju Bersama', 'Jl. Gatot Subroto No. 78, Sidoarjo', 'GURU003')
ON CONFLICT (id_dudi) DO NOTHING;

INSERT INTO public.tb_siswa (nisn, nama_siswa, kelas, tahun_pelajaran, semester, id_dudi, nama_dudi, id_guru, nama_guru) VALUES 
('2024001', 'Andi Pratama', 'XII RPL 1', '2024/2025', 'Ganjil', 'DUDI001', 'PT. Teknologi Nusantara', 'GURU001', 'Budi Santoso, S.Kom'),
('2024002', 'Sari Dewi', 'XII RPL 1', '2024/2025', 'Ganjil', 'DUDI002', 'CV. Digital Solusi', 'GURU002', 'Siti Nurhaliza, S.Pd'),
('2024003', 'Riko Firmansyah', 'XII RPL 2', '2024/2025', 'Ganjil', 'DUDI003', 'PT. Maju Bersama', 'GURU003', 'Ahmad Fadli, M.Kom')
ON CONFLICT (nisn) DO NOTHING;

INSERT INTO public.tb_user (username, nama, password, role) VALUES 
-- Siswa accounts (username = NISN, password = nisn123)
('2024001', 'Andi Pratama', '2024001123', 'siswa'),
('2024002', 'Sari Dewi', '2024002123', 'siswa'),
('2024003', 'Riko Firmansyah', '2024003123', 'siswa'),
-- Guru accounts (username = id_guru, password = guru123)
('GURU001', 'Budi Santoso, S.Kom', 'guru123', 'guru'),
('GURU002', 'Siti Nurhaliza, S.Pd', 'guru123', 'guru'),
('GURU003', 'Ahmad Fadli, M.Kom', 'guru123', 'guru'),
-- Admin account
('admin', 'Administrator', 'admin123', 'admin')
ON CONFLICT (username) DO NOTHING;`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Setup Jurnal PKL
            </h1>
            <p className="text-gray-600">
              Konfigurasi Supabase untuk menjalankan aplikasi
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Konfigurasi Supabase Diperlukan
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Aplikasi memerlukan konfigurasi Supabase untuk berfungsi
                  dengan baik. Ikuti langkah-langkah berikut untuk setup.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-3">
                  1
                </span>
                <h2 className="text-xl font-semibold text-gray-900">
                  Buat Project Supabase
                </h2>
              </div>
              <div className="ml-11">
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>
                    Buka{" "}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      supabase.com
                    </a>
                  </li>
                  <li>Klik &quot;Start your project&quot; dan buat akun/login</li>
                  <li>Klik &quot;New Project&quot;</li>
                  <li>
                    Isi nama project:{" "}
                    <code className="bg-gray-100 px-1 rounded">jurnal-pkl</code>
                  </li>
                  <li>Pilih region terdekat (Singapore)</li>
                  <li>Buat password database yang kuat</li>
                  <li>Klik &quot;Create new project&quot;</li>
                </ol>
                <div className="mt-4">
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Buka Supabase Dashboard
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-3">
                  2
                </span>
                <h2 className="text-xl font-semibold text-gray-900">
                  Dapatkan API Keys
                </h2>
              </div>
              <div className="ml-11">
                <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-4">
                  <li>Setelah project dibuat, buka project Anda</li>
                  <li>
                    Di sidebar kiri, klik <strong>Settings</strong> →{" "}
                    <strong>API</strong>
                  </li>
                  <li>
                    Copy <strong>Project URL</strong> dan{" "}
                    <strong>anon/public key</strong>
                  </li>
                </ol>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://your-project-id.supabase.co"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Anon Key
                    </label>
                    <input
                      type="text"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={supabaseAnonKey}
                      onChange={(e) => setSupabaseAnonKey(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-3">
                  3
                </span>
                <h2 className="text-xl font-semibold text-gray-900">
                  Update Environment Variables
                </h2>
              </div>
              <div className="ml-11">
                <p className="text-gray-600 mb-4">
                  Copy konten berikut ke file{" "}
                  <code className="bg-gray-100 px-1 rounded">.env.local</code>{" "}
                  di root project:
                </p>
                <div className="relative">
                  <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                    <code>{envContent}</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard(envContent, "env")}
                    className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700"
                  >
                    {copied === "env" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-3">
                  4
                </span>
                <h2 className="text-xl font-semibold text-gray-900">
                  Setup Database
                </h2>
              </div>
              <div className="ml-11">
                <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-4">
                  <li>
                    Di Supabase Dashboard, klik <strong>SQL Editor</strong> di
                    sidebar
                  </li>
                  <li>
                    Klik <strong>New query</strong>
                  </li>
                  <li>Copy dan paste SQL script berikut:</li>
                </ol>

                <div className="relative">
                  <div className="max-h-64 overflow-y-auto bg-gray-100 p-4 rounded-md">
                    <pre className="text-xs">
                      <code>{sqlScript}</code>
                    </pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(sqlScript, "sql")}
                    className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700"
                  >
                    {copied === "sql" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Penting:</strong> Jalankan script SQL ini setelah
                    Anda mengupdate file .env.local untuk membuat tabel dan data
                    sample.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-3">
                  5
                </span>
                <h2 className="text-xl font-semibold text-gray-900">
                  Test Aplikasi
                </h2>
              </div>
              <div className="ml-11">
                <p className="text-gray-600 mb-4">
                  Setelah setup selesai, restart development server dan coba
                  login dengan akun test:
                </p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Akun Siswa:
                  </h4>
                  <p className="text-sm text-gray-600">
                    Username: <code>2024001</code> | Password:{" "}
                    <code>2024001123</code>
                  </p>

                  <h4 className="font-medium text-gray-900 mb-2 mt-4">
                    Akun Guru:
                  </h4>
                  <p className="text-sm text-gray-600">
                    Username: <code>GURU001</code> | Password:{" "}
                    <code>guru123</code>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Setelah setup selesai, aplikasi akan berfungsi normal. Jika masih
              ada masalah, periksa console browser untuk error lebih detail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
