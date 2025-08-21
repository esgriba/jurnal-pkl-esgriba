# Fitur Link Lokasi Google Maps

## Deskripsi
Fitur ini menambahkan kemampuan untuk mengubah data lokasi koordinat dalam sistem absensi menjadi link yang dapat diklik untuk membuka Google Maps. Ini memungkinkan guru dan admin untuk dengan mudah memantau lokasi siswa yang melakukan absensi.

## Fitur Utama
1. **Parsing Koordinat**: Sistem dapat mendeteksi dan mengparse koordinat dari berbagai format lokasi
2. **Link Google Maps**: Koordinat yang valid akan ditampilkan sebagai link yang dapat diklik ke Google Maps
3. **Fallback Display**: Jika tidak ada koordinat valid, akan menampilkan teks lokasi biasa
4. **Responsive UI**: Tampilan yang sesuai untuk desktop dan mobile

## Format Lokasi yang Didukung
- `"lat, lng"` (koordinat sederhana)
- `"Nama Lokasi: lat, lng"` (dengan prefix nama lokasi)
- `"-6.200000, 106.816666"` (koordinat Jakarta contoh)

## Komponen yang Dibuat

### 1. LocationUtils (`src/lib/locationUtils.ts`)
Utility functions untuk handling data lokasi:
- `parseLocationString()`: Parse string lokasi menjadi koordinat
- `generateGoogleMapsUrl()`: Generate URL Google Maps
- `getGoogleMapsLinkFromLocation()`: Konversi string lokasi ke Google Maps URL
- `hasValidCoordinates()`: Cek validitas koordinat
- `formatCoordinates()`: Format koordinat untuk display

### 2. LocationLink Component (`src/components/ui/LocationLink.tsx`)
React component untuk menampilkan lokasi dengan link:
- `LocationLink`: Komponen utama dengan icon dan link
- `LocationLinkSimple`: Versi sederhana tanpa wrapper
- `LocationBadge`: Versi badge untuk status display

## Halaman yang Diupdate

### 1. Admin Absensi (`src/app/admin/absensi/page.tsx`)
- Kolom lokasi dalam tabel absensi sekarang menampilkan link Google Maps
- Menggunakan komponen `LocationLink` dengan icon MapPin

### 2. Guru Absensi (`src/app/guru/absensi/page.tsx`)
- Data lokasi dalam card absensi menampilkan link Google Maps
- Menggunakan komponen `LocationLink` tanpa icon untuk tampilan compact

### 3. Guru Dashboard (`src/app/guru/dashboard/page.tsx`)
- Card absensi hari ini menampilkan lokasi dengan link Google Maps
- Ditampilkan di bawah nama siswa dan kelas

## Cara Penggunaan

### Untuk Data yang Sudah Ada
Sistem akan otomatis mendeteksi koordinat yang valid dalam field `lokasi` dan menampilkannya sebagai link Google Maps.

### Untuk Data Baru
Pastikan aplikasi absensi siswa menyimpan koordinat dalam format yang didukung, misalnya:
```
"Test Location: -6.200000, 106.816666"
```

## Tampilan UI

### Dengan Koordinat Valid
```
🗺️ -6.200000, 106.816666 🔗
```
*(dapat diklik untuk membuka Google Maps)*

### Tanpa Koordinat Valid
```
🗺️ Lokasi tidak tersedia
```
*(teks biasa, tidak dapat diklik)*

## Keamanan dan Validasi
- Validasi koordinat untuk memastikan dalam range yang valid (-90 to 90 untuk latitude, -180 to 180 untuk longitude)
- Link Google Maps menggunakan `target="_blank"` dan `rel="noopener noreferrer"` untuk keamanan
- Error handling untuk data lokasi yang tidak valid

## Implementasi Teknis

### Import Component
```tsx
import LocationLink from "@/components/ui/LocationLink";
```

### Penggunaan Dasar
```tsx
<LocationLink 
  locationStr={attendance.lokasi} 
  showIcon={true}
  showFullAddress={false}
  className="max-w-xs"
/>
```

### Props LocationLink
- `locationStr`: String lokasi yang akan diparse
- `showIcon`: Menampilkan icon MapPin (default: true)
- `showFullAddress`: Menampilkan alamat lengkap atau hanya koordinat (default: false)
- `className`: CSS classes tambahan
- `target`: Target link ("_blank" atau "_self", default: "_blank")

## Testing
Untuk testing fitur ini:
1. Pastikan ada data absensi dengan field lokasi berisi koordinat
2. Buka halaman admin absensi atau guru absensi
3. Klik pada link koordinat untuk memastikan membuka Google Maps dengan lokasi yang benar

## Benefit untuk User
1. **Admin**: Dapat memantau lokasi siswa yang absen dengan mudah
2. **Guru**: Dapat memverifikasi kehadiran siswa di lokasi yang tepat
3. **Transparency**: Meningkatkan transparansi dalam sistem absensi
4. **Monitoring**: Memudahkan monitoring kehadiran siswa di tempat PKL

## Future Enhancement
1. **Radius Validation**: Validasi apakah siswa absen dalam radius yang diizinkan dari lokasi DUDI
2. **Location History**: Menyimpan riwayat lokasi absensi siswa
3. **Map Preview**: Menampilkan preview peta langsung di halaman tanpa perlu buka Google Maps
4. **Geofencing**: Implementasi geofencing untuk otomatis validasi lokasi absensi
