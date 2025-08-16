# Panduan Penggunaan Sistem Notifikasi Baru

## Overview

Sistem notifikasi telah diupgrade dari `alert()` JavaScript menjadi komponen React modern dengan animasi, typing, dan context management.

## Features

- ✅ 4 jenis notifikasi: Success, Error, Warning, Info
- ✅ Auto-dismiss dengan timer yang bisa dikustomisasi
- ✅ Action buttons untuk interaksi
- ✅ Animasi smooth slide-in/out
- ✅ TypeScript support penuh
- ✅ Responsive design
- ✅ Position fixed di top-right
- ✅ Stack multiple notifications

## Cara Penggunaan

### 1. Import Hook

```tsx
import { useNotifications } from "@/components/ui/Notification";
```

### 2. Inisialisasi dalam Component

```tsx
const notifications = useNotifications();
```

### 3. Penggunaan Dasar

#### Success Notification

```tsx
notifications.success("Operasi Berhasil", "Data berhasil disimpan ke database");
```

#### Error Notification

```tsx
notifications.error(
  "Terjadi Kesalahan",
  "Gagal menyimpan data, silakan coba lagi"
);
```

#### Warning Notification

```tsx
notifications.warning(
  "Peringatan",
  "File yang dipilih melebihi batas maksimal"
);
```

#### Info Notification

```tsx
notifications.info("Informasi", "Sistem akan maintenance dalam 30 menit");
```

### 4. Penggunaan Advanced

#### Dengan Action Button

```tsx
notifications.success("Import Berhasil", "42 siswa berhasil diimport", {
  action: {
    label: "Lihat Data",
    onClick: () => router.push("/admin/siswa"),
  },
});
```

#### Custom Duration

```tsx
notifications.error("Error Kritis", "Koneksi database terputus", {
  duration: 10000, // 10 detik
});
```

#### Persistent Notification (tidak auto-dismiss)

```tsx
notifications.info("Proses Berjalan", "Sedang mengupload file...", {
  duration: 0, // Tidak akan hilang otomatis
});
```

## Integration Status

### ✅ Sudah Diintegrasikan:

- Login page - notifikasi login success/error
- Import siswa page - semua status import
- Layout root - provider setup

### 🚧 Akan Diintegrasikan Selanjutnya:

- Absensi pages - konfirmasi absen
- CRUD operations - create/update/delete feedback
- Form validations - error messages
- File uploads - progress status

## Technical Details

### File Structure

```
src/components/ui/Notification.tsx     // Main component
src/app/layout.tsx                     // Provider setup
src/app/globals.css                    // Animations
```

### Context Provider

```tsx
<NotificationProvider>
  <App />
</NotificationProvider>
```

### CSS Animations

- `slide-in-right`: Entry animation
- `slide-out-right`: Exit animation
- `fade-in`: Fallback animation

## Migration dari alert()

### Sebelum (old):

```tsx
alert("Data berhasil disimpan");
```

### Sesudah (new):

```tsx
notifications.success("Data Tersimpan", "Data berhasil disimpan ke database");
```

## Best Practices

1. **Gunakan tipe yang sesuai**:

   - Success: operasi berhasil
   - Error: kesalahan/gagal
   - Warning: peringatan
   - Info: informasi umum

2. **Title singkat, message deskriptif**:

   ```tsx
   // ✅ Good
   notifications.error("Login Gagal", "Username atau password salah");

   // ❌ Avoid
   notifications.error("Error", "Something went wrong");
   ```

3. **Gunakan action untuk navigation**:

   ```tsx
   notifications.success("Data Saved", "Go to list?", {
     action: {
       label: "View List",
       onClick: () => router.push("/list"),
     },
   });
   ```

4. **Set duration sesuai kebutuhan**:
   - Success: 3-5 detik (default)
   - Error: 7-10 detik (lebih lama untuk dibaca)
   - Info: 5 detik
   - Warning: 6-8 detik

## Troubleshooting

### Error: "useNotification must be used within NotificationProvider"

**Solusi**: Pastikan component dibungkus dengan `<NotificationProvider>`

### Notifikasi tidak muncul

**Solusi**:

1. Cek console untuk error
2. Pastikan import path benar
3. Verifikasi provider di layout.tsx

### Animasi tidak smooth

**Solusi**:

1. Cek CSS animations di globals.css
2. Pastikan Tailwind CSS terkonfigurasi benar

Sistem notifikasi siap digunakan! 🎉
