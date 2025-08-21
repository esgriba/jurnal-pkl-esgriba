# Fitur Profil Guru dan Tombol Logout

## Deskripsi
Fitur ini menambahkan halaman profil lengkap untuk guru beserta tombol logout yang mudah diakses baik di sidebar maupun mobile navigation. Guru dapat melihat informasi pribadi, statistik bimbingan, dan mengubah password.

## Fitur Utama

### 1. Halaman Profil Guru (`/guru/profil`)
- **Informasi Pribadi**: Nama, NIP, ID Guru, Mata Pelajaran
- **Informasi Kontak**: Email, Nomor Telepon, Alamat (jika tersedia)
- **Statistik Bimbingan**: Total siswa, jurnal, dan kehadiran siswa bimbingan
- **Informasi Akun**: Username dan role
- **Tombol Aksi**: Edit Password dan Logout

### 2. Halaman Edit Password (`/guru/profil/edit`)
- **Form Ganti Password**: Password lama, password baru, konfirmasi password
- **Validasi Keamanan**: Minimal 6 karakter, verifikasi password lama
- **Show/Hide Password**: Toggle untuk melihat/sembunyikan password
- **Persyaratan Password**: Panduan keamanan password

### 3. Navigasi dan Aksesibilitas
- **Sidebar Menu**: Tambahan menu "Profil" untuk guru dan siswa
- **Mobile Bottom Navigation**: Akses profil di mobile
- **Tombol Logout**: Tersedia di sidebar, profil, dan mobile nav
- **Responsive Design**: Optimal untuk desktop dan mobile

## Files yang Dibuat/Dimodifikasi

### 1. Halaman Profil Guru
**File**: `src/app/guru/profil/page.tsx`
- ✅ Dashboard layout dengan statistik bimbingan
- ✅ Informasi pribadi dan kontak guru
- ✅ Integrasi dengan database tb_guru
- ✅ Loading states dan error handling
- ✅ Tombol logout dan edit password

### 2. Halaman Edit Password
**File**: `src/app/guru/profil/edit/page.tsx`
- ✅ Form validasi password yang aman
- ✅ Verifikasi password lama dari database
- ✅ Show/hide password toggle
- ✅ Sweet Alert untuk konfirmasi dan notifikasi
- ✅ Redirect setelah berhasil update

### 3. Update Navigasi Sidebar
**File**: `src/components/ui/Sidebar.tsx`
- ✅ Tambah menu "Profil" untuk guru dan siswa
- ✅ Tombol logout tetap di footer sidebar
- ✅ Navigation highlighting aktif

### 4. Update Mobile Navigation
**File**: `src/components/ui/MobileBottomNav.tsx`
- ✅ Fix path profil guru dari `/guru/profile` ke `/guru/profil`
- ✅ Icon profil di bottom navigation mobile
- ✅ Responsive navigation untuk mobile

## Cara Penggunaan

### Akses Profil Guru:
1. **Desktop**: Klik menu "Profil" di sidebar kiri
2. **Mobile**: Tap icon "Profil" di bottom navigation
3. **Direct URL**: `http://localhost:3001/guru/profil`

### Ganti Password:
1. Buka halaman profil guru
2. Klik tombol "Ubah Password"
3. Isi form: password lama → password baru → konfirmasi
4. Klik "Ubah Password" untuk menyimpan

### Logout:
1. **Dari Sidebar**: Klik tombol "Logout" di footer sidebar
2. **Dari Profil**: Klik tombol "Logout" di halaman profil
3. **Mobile**: Akses melalui menu atau profil

## Statistik yang Ditampilkan

### Dashboard Guru Profil:
- 📊 **Total Siswa Bimbingan**: Jumlah siswa yang dibimbing
- 📚 **Total Jurnal**: Semua jurnal dari siswa bimbingan
- ✅ **Total Kehadiran**: Jumlah absensi "Hadir" siswa bimbingan

### Data yang Diambil:
```sql
-- Siswa bimbingan
SELECT COUNT(*) FROM tb_siswa WHERE id_guru = 'guru_username'

-- Jurnal siswa bimbingan
SELECT COUNT(*) FROM tb_jurnal WHERE nisn IN (siswa_bimbingan_nisns)

-- Kehadiran siswa bimbingan
SELECT COUNT(*) FROM tb_absensi 
WHERE nisn IN (siswa_bimbingan_nisns) AND status = 'Hadir'
```

## Security Features

### 1. Authentication Check:
- ✅ Validasi user login dan role guru
- ✅ Redirect ke login jika tidak authenticated
- ✅ Protection untuk halaman guru only

### 2. Password Security:
- ✅ Verifikasi password lama sebelum update
- ✅ Validasi minimal 6 karakter
- ✅ Password baru harus berbeda dari password lama
- ✅ Konfirmasi password untuk mencegah typo

### 3. Database Security:
- ✅ Prepared statements untuk mencegah SQL injection
- ✅ Error handling yang aman
- ✅ No sensitive data exposure

## UI/UX Features

### 1. Loading States:
- ✅ Spinner loading saat fetch data
- ✅ Loading button saat submit form
- ✅ Skeleton loading untuk better UX

### 2. Error Handling:
- ✅ Sweet Alert untuk notifikasi
- ✅ Error page dengan tombol kembali
- ✅ Form validation dengan pesan yang jelas

### 3. Responsive Design:
- ✅ Card layout yang adaptif
- ✅ Mobile-first bottom navigation
- ✅ Optimal viewing di semua device

### 4. Accessibility:
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ High contrast colors
- ✅ Clear visual hierarchy

## Integration dengan Sistem

### 1. Database Schema:
```sql
-- tb_guru: Data guru lengkap
-- tb_siswa: Relasi id_guru untuk bimbingan
-- tb_jurnal: Jurnal siswa bimbingan
-- tb_absensi: Kehadiran siswa bimbingan
-- tb_user: Authentication dan password
```

### 2. Supabase Client:
- ✅ Real-time data fetching
- ✅ Secure API calls
- ✅ Error handling yang robust

### 3. Sweet Alert Integration:
- ✅ Konfirmasi sebelum logout
- ✅ Success notification setelah update password
- ✅ Error alerts untuk debugging

## Testing

### Manual Testing:
1. ✅ **Load profil page**: Data guru tampil lengkap
2. ✅ **Statistik bimbingan**: Angka sesuai database
3. ✅ **Edit password**: Validasi dan update berhasil
4. ✅ **Logout functionality**: Redirect ke login
5. ✅ **Mobile navigation**: Responsif dan accessible
6. ✅ **Error handling**: Graceful error states

### Browser Compatibility:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (iOS/macOS)
- ✅ Mobile browsers

## Future Enhancements

### 1. Profile Picture:
- Upload dan crop foto profil
- Default avatar generator
- Image optimization

### 2. Advanced Settings:
- Notifikasi preferences
- Theme selection (dark/light mode)
- Language selection

### 3. Two-Factor Authentication:
- SMS/Email verification
- Authenticator app support
- Backup codes

### 4. Activity Log:
- Login history
- Password change history
- Session management

---

## 🎉 Status Implementasi: **COMPLETED** ✅

Semua fitur profil guru dan tombol logout telah berhasil diimplementasi dan siap untuk production! Guru sekarang dapat dengan mudah mengakses profil mereka, melihat statistik bimbingan, mengubah password, dan logout dengan aman dari berbagai titik akses di aplikasi.
