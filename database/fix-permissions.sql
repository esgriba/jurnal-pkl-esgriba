-- Fix RLS policies untuk jurnal PKL
-- Jalankan ini jika mengalami masalah dengan permissions

-- Disable RLS temporarily for testing
ALTER TABLE public.tb_user DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_siswa DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_guru DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_dudi DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_jurnal DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_absensi DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_monitoring DISABLE ROW LEVEL SECURITY;

-- Drop all existing storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their files" ON storage.objects;

-- Create simpler storage policies
CREATE POLICY "Allow all operations on jurnal-photos" ON storage.objects
    FOR ALL USING (bucket_id = 'jurnal-photos');

-- Make sure bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('jurnal-photos', 'jurnal-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;
