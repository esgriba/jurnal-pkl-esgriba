-- Script untuk melihat definisi view v_user_complete sebelum mengubah kolom
-- Jalankan ini terlebih dahulu untuk backup definisi view

-- Melihat definisi view yang ada
SELECT definition 
FROM pg_views 
WHERE viewname = 'v_user_complete';

-- Alternatif: Melihat dengan pg_get_viewdef
SELECT pg_get_viewdef('v_user_complete'::regclass, true);

-- Melihat semua view yang terkait dengan tabel tb_siswa
SELECT DISTINCT schemaname, viewname 
FROM pg_views 
WHERE definition LIKE '%tb_siswa%';

-- Melihat dependency yang lebih detail
SELECT 
    t.schemaname,
    t.tablename,
    v.schemaname as view_schema,
    v.viewname,
    v.definition
FROM pg_tables t
JOIN pg_views v ON v.definition LIKE '%' || t.tablename || '%'
WHERE t.tablename = 'tb_siswa';
