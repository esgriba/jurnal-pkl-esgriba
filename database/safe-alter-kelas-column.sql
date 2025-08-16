-- LANGKAH AMAN: Mengubah kolom kelas dengan mengatasi dependency view
-- Jalankan satu per satu, jangan sekaligus!

-- STEP 1: Backup definisi view (JALANKAN INI DULU!)
SELECT pg_get_viewdef('v_user_complete'::regclass, true) as view_definition;

-- STEP 2: Drop view yang dependent (COPY hasil Step 1 dulu!)
DROP VIEW IF EXISTS v_user_complete;

-- STEP 3: Alter column type (Sekarang baru bisa dijalankan)
ALTER TABLE tb_siswa 
ALTER COLUMN kelas TYPE varchar(50);

-- STEP 4: Recreate view (Gunakan definisi dari Step 1)
-- GANTI DENGAN DEFINISI ASLI DARI STEP 1!
-- Contoh (sesuaikan dengan hasil Step 1):
CREATE OR REPLACE VIEW v_user_complete AS
SELECT 
    u.id,
    u.username,
    u.nama,
    u.role,
    s.nisn,
    s.nama_siswa,
    s.kelas,
    s.tahun_pelajaran,
    s.semester
FROM tb_user u
LEFT JOIN tb_siswa s ON u.id = s.user_id;

-- STEP 5: Verifikasi hasil
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'tb_siswa' 
AND column_name = 'kelas';

-- STEP 6: Test view masih berfungsi
SELECT * FROM v_user_complete LIMIT 5;
