-- Update Database Schema untuk Menghubungkan User dengan Guru dan Siswa
-- Run these commands in your Supabase SQL Editor

-- 1. Tambahkan kolom user_id ke tb_guru
ALTER TABLE public.tb_guru 
ADD COLUMN IF NOT EXISTS user_id INTEGER,
ADD CONSTRAINT fk_guru_user 
FOREIGN KEY (user_id) REFERENCES tb_user(id);

-- 2. Tambahkan kolom user_id ke tb_siswa  
ALTER TABLE public.tb_siswa 
ADD COLUMN IF NOT EXISTS user_id INTEGER,
ADD CONSTRAINT fk_siswa_user 
FOREIGN KEY (user_id) REFERENCES tb_user(id);

-- 3. Tambahkan unique constraint untuk memastikan satu user hanya punya satu profile
ALTER TABLE public.tb_guru 
ADD CONSTRAINT unique_guru_user 
UNIQUE (user_id);

ALTER TABLE public.tb_siswa 
ADD CONSTRAINT unique_siswa_user 
UNIQUE (user_id);

-- 4. Update data yang sudah ada - hubungkan user dengan guru berdasarkan nama
UPDATE public.tb_guru 
SET user_id = (
  SELECT u.id 
  FROM public.tb_user u 
  WHERE u.nama = tb_guru.nama_guru 
  AND u.role = 'guru'
  LIMIT 1
)
WHERE user_id IS NULL;

-- 5. Update data yang sudah ada - hubungkan user dengan siswa berdasarkan nama
UPDATE public.tb_siswa 
SET user_id = (
  SELECT u.id 
  FROM public.tb_user u 
  WHERE u.nama = tb_siswa.nama_siswa 
  AND u.role = 'siswa'
  LIMIT 1
)
WHERE user_id IS NULL;

-- 6. Buat view untuk memudahkan query data lengkap user
CREATE OR REPLACE VIEW v_user_complete AS
SELECT 
  u.id as user_id,
  u.username,
  u.nama,
  u.role,
  u.password,
  g.id_guru,
  g.nama_guru,
  s.nisn,
  s.nama_siswa,
  s.kelas,
  s.tahun_pelajaran,
  s.semester,
  s.id_dudi,
  s.nama_dudi,
  s.id_guru as siswa_id_guru,
  s.nama_guru as siswa_nama_guru
FROM public.tb_user u
LEFT JOIN public.tb_guru g ON u.id = g.user_id
LEFT JOIN public.tb_siswa s ON u.id = s.user_id;

-- 7. Buat function untuk membuat user dan profile sekaligus
CREATE OR REPLACE FUNCTION create_guru_with_user(
  p_username VARCHAR(20),
  p_nama VARCHAR(100),
  p_password VARCHAR(255),
  p_id_guru VARCHAR(100)
) RETURNS INTEGER AS $$
DECLARE
  v_user_id INTEGER;
BEGIN
  -- Insert user
  INSERT INTO public.tb_user (username, nama, password, role)
  VALUES (p_username, p_nama, p_password, 'guru')
  RETURNING id INTO v_user_id;
  
  -- Insert guru profile
  INSERT INTO public.tb_guru (id_guru, nama_guru, user_id)
  VALUES (p_id_guru, p_nama, v_user_id);
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_siswa_with_user(
  p_username VARCHAR(20),
  p_nama VARCHAR(100),
  p_password VARCHAR(255),
  p_nisn VARCHAR(20),
  p_kelas VARCHAR(25),
  p_tahun_pelajaran VARCHAR(11),
  p_semester VARCHAR(25),
  p_id_dudi VARCHAR(25),
  p_nama_dudi VARCHAR(100),
  p_id_guru VARCHAR(100),
  p_nama_guru VARCHAR(100)
) RETURNS INTEGER AS $$
DECLARE
  v_user_id INTEGER;
BEGIN
  -- Insert user
  INSERT INTO public.tb_user (username, nama, password, role)
  VALUES (p_username, p_nama, p_password, 'siswa')
  RETURNING id INTO v_user_id;
  
  -- Insert siswa profile
  INSERT INTO public.tb_siswa (
    nisn, nama_siswa, kelas, tahun_pelajaran, semester,
    id_dudi, nama_dudi, id_guru, nama_guru, user_id
  )
  VALUES (
    p_nisn, p_nama, p_kelas, p_tahun_pelajaran, p_semester,
    p_id_dudi, p_nama_dudi, p_id_guru, p_nama_guru, v_user_id
  );
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Tambahkan index untuk performa yang lebih baik
CREATE INDEX IF NOT EXISTS idx_guru_user_id ON public.tb_guru(user_id);
CREATE INDEX IF NOT EXISTS idx_siswa_user_id ON public.tb_siswa(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role ON public.tb_user(role);

COMMENT ON TABLE public.tb_guru IS 'Data guru dengan relasi ke tb_user';
COMMENT ON TABLE public.tb_siswa IS 'Data siswa dengan relasi ke tb_user';
COMMENT ON COLUMN public.tb_guru.user_id IS 'Foreign key ke tb_user.id';
COMMENT ON COLUMN public.tb_siswa.user_id IS 'Foreign key ke tb_user.id';
