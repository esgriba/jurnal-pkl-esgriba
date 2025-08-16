-- Fix database schema inconsistencies for tb_absensi
-- Run this in your Supabase SQL Editor

-- Update tb_absensi column sizes to match other tables and accommodate longer values
ALTER TABLE tb_absensi ALTER COLUMN nisn TYPE VARCHAR(20);
ALTER TABLE tb_absensi ALTER COLUMN id_dudi TYPE VARCHAR(100);
ALTER TABLE tb_absensi ALTER COLUMN kelas TYPE VARCHAR(50);
ALTER TABLE tb_absensi ALTER COLUMN nama_siswa TYPE VARCHAR(150);
ALTER TABLE tb_absensi ALTER COLUMN nama_dudi TYPE VARCHAR(150);
ALTER TABLE tb_absensi ALTER COLUMN lokasi TYPE VARCHAR(200);

-- Also make sure other tables have consistent sizing
ALTER TABLE tb_siswa ALTER COLUMN kelas TYPE VARCHAR(50);
ALTER TABLE tb_siswa ALTER COLUMN nama_siswa TYPE VARCHAR(150);
ALTER TABLE tb_siswa ALTER COLUMN nama_dudi TYPE VARCHAR(150);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_absensi_nisn_tanggal ON tb_absensi(nisn, tanggal);
CREATE INDEX IF NOT EXISTS idx_absensi_tanggal ON tb_absensi(tanggal);
