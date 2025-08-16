-- Setup Database Schema for Jurnal PKL
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
VALUES ('jurnal-photos', 'jurnal-photos', true);

-- Set up Row Level Security policies
ALTER TABLE public.tb_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_dudi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_jurnal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_absensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_monitoring ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Enable read access for all authenticated users" ON public.tb_user
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON public.tb_siswa
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON public.tb_guru
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON public.tb_dudi
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON public.tb_jurnal
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON public.tb_absensi
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON public.tb_monitoring
    FOR ALL USING (auth.role() = 'authenticated');

-- Storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'jurnal-photos');
CREATE POLICY "Authenticated users can upload" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'jurnal-photos' AND auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO public.tb_guru (id_guru, nama_guru) VALUES 
('GURU001', 'Budi Santoso, S.Kom'),
('GURU002', 'Siti Nurhaliza, S.Pd'),
('GURU003', 'Ahmad Fadli, M.Kom');

INSERT INTO public.tb_dudi (id_dudi, nama_dudi, alamat, id_guru) VALUES 
('DUDI001', 'PT. Teknologi Nusantara', 'Jl. Raya Industri No. 123, Surabaya', 'GURU001'),
('DUDI002', 'CV. Digital Solusi', 'Jl. Pemuda No. 45, Malang', 'GURU002'),
('DUDI003', 'PT. Maju Bersama', 'Jl. Gatot Subroto No. 78, Sidoarjo', 'GURU003');

INSERT INTO public.tb_siswa (nisn, nama_siswa, kelas, tahun_pelajaran, semester, id_dudi, nama_dudi, id_guru, nama_guru) VALUES 
('2024001', 'Andi Pratama', 'XII RPL 1', '2024/2025', 'Ganjil', 'DUDI001', 'PT. Teknologi Nusantara', 'GURU001', 'Budi Santoso, S.Kom'),
('2024002', 'Sari Dewi', 'XII RPL 1', '2024/2025', 'Ganjil', 'DUDI002', 'CV. Digital Solusi', 'GURU002', 'Siti Nurhaliza, S.Pd'),
('2024003', 'Riko Firmansyah', 'XII RPL 2', '2024/2025', 'Ganjil', 'DUDI003', 'PT. Maju Bersama', 'GURU003', 'Ahmad Fadli, M.Kom');

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
('admin', 'Administrator', 'admin123', 'admin');
