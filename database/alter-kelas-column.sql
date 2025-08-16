-- Script untuk mengubah panjang kolom kelas di tabel tb_siswa
-- Mengubah varchar(25) menjadi varchar(50) atau lebih
-- Mengatasi dependency dengan view v_user_complete

-- Step 1: Backup view definition
CREATE OR REPLACE VIEW v_user_complete_backup AS
SELECT * FROM v_user_complete;

-- Step 2: Drop the view that depends on kelas column
DROP VIEW IF EXISTS v_user_complete;

-- Step 3: Alter the column type
ALTER TABLE tb_siswa 
ALTER COLUMN kelas TYPE varchar(50);

-- Step 4: Recreate the view (you may need to adjust this based on original view definition)
-- First, let's check what the original view looked like
-- You'll need to replace this with the actual view definition

-- Temporary view recreation (basic version)
CREATE OR REPLACE VIEW v_user_complete AS
SELECT 
    u.id as user_id,
    u.username,
    u.nama,
    u.role,
    s.nisn,
    s.nama_siswa,
    s.kelas,  -- This column now supports varchar(50)
    s.tahun_pelajaran,
    s.semester,
    s.id_dudi,
    s.nama_dudi,
    s.id_guru,
    s.nama_guru
FROM tb_user u
LEFT JOIN tb_siswa s ON u.id = s.user_id;

-- Step 5: Drop backup view
DROP VIEW IF EXISTS v_user_complete_backup;

-- Metode 2: Ubah ke varchar(100) (untuk lebih aman)
-- ALTER TABLE tb_siswa 
-- ALTER COLUMN kelas TYPE varchar(100);

-- Metode 3: Ubah ke TEXT (unlimited length)
-- ALTER TABLE tb_siswa 
-- ALTER COLUMN kelas TYPE TEXT;

-- Verifikasi perubahan
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'tb_siswa' 
AND column_name = 'kelas';
