# Panduan UI Components - Jurnal PKL

## Overview

Sistem Jurnal PKL telah diperbarui dengan tampilan sidebar dan komponen UI yang lebih modern dan user-friendly. Berikut adalah panduan lengkap untuk menggunakan komponen-komponen baru.

## Komponen UI Utama

### 1. Sidebar

Sidebar adalah menu navigasi samping yang dapat diakses di semua halaman dashboard.

**Fitur:**

- ✅ Responsive (mobile-friendly)
- ✅ Menu hierarki dengan expand/collapse
- ✅ Role-based navigation (berbeda untuk admin, guru, siswa)
- ✅ Active state untuk halaman saat ini
- ✅ Logout button di bagian bawah

**Penggunaan:**

```tsx
import DashboardLayout from "@/components/ui/DashboardLayout";

export default function MyPage() {
  return (
    <DashboardLayout userRole="siswa">
      {/* Konten halaman di sini */}
    </DashboardLayout>
  );
}
```

### 2. Card Components

Komponen card untuk menampilkan informasi dengan rapi.

**Jenis Card:**

- `Card` - Card dasar
- `StatCard` - Card untuk menampilkan statistik
- `CardHeader`, `CardTitle`, `CardContent` - Sub-komponen

**Penggunaan:**

```tsx
import { Card, CardHeader, CardTitle, CardContent, StatCard } from "@/components/ui/Card";

// Card biasa
<Card>
  <CardHeader>
    <CardTitle>Judul Card</CardTitle>
  </CardHeader>
  <CardContent>
    Konten card di sini
  </CardContent>
</Card>

// Stat Card
<StatCard
  title="Total Jurnal"
  value={25}
  icon={<BookOpen className="h-6 w-6" />}
  color="blue"
/>
```

### 3. Button Component

Button yang konsisten dengan berbagai variant.

**Variants:**

- `primary` (default) - Biru
- `secondary` - Abu-abu
- `success` - Hijau
- `warning` - Kuning
- `danger` - Merah
- `outline` - Transparan dengan border

**Penggunaan:**

```tsx
import Button from "@/components/ui/Button";

<Button variant="primary" size="md" href="/create">
  Buat Baru
</Button>

<Button variant="success" onClick={handleSubmit}>
  Simpan
</Button>
```

### 4. Table Components

Komponen tabel yang responsive dan mudah digunakan.

**Penggunaan:**

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
} from "@/components/ui/Table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nama</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Aksi</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>
        <Badge variant="success">Aktif</Badge>
      </TableCell>
      <TableCell>
        <Button size="sm">Edit</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>;
```

## Menu Navigation Structure

### Admin

- Dashboard
- Jurnal (Lihat Jurnal)
- Manajemen Users (Semua Users, Tambah User)
- Siswa (Data Siswa, Tambah Siswa)
- Guru (Data Guru, Tambah Guru)
- DUDI (Data DUDI, Tambah DUDI)
- Absensi
- User Profile

### Guru

- Dashboard
- Jurnal (Lihat Jurnal)
- Siswa (Data Siswa)

### Siswa

- Dashboard
- Jurnal (Lihat Jurnal, Buat Jurnal)

## Responsive Design

### Mobile Features

- ✅ Hamburger menu untuk membuka/tutup sidebar
- ✅ Overlay ketika sidebar terbuka
- ✅ Touch-friendly button sizes
- ✅ Responsive grid layouts

### Desktop Features

- ✅ Sidebar selalu terlihat
- ✅ Hover effects
- ✅ Keyboard navigation support

## Dark Mode Support

Semua komponen telah disiapkan dengan dukungan dark mode:

- ✅ Automatic color switching
- ✅ Proper contrast ratios
- ✅ Consistent theming

## Styling Enhancements

- ✅ Custom scrollbar styling
- ✅ Smooth transitions
- ✅ Focus states untuk accessibility
- ✅ Loading animations
- ✅ Hover effects

## File Structure

```
src/components/ui/
├── Sidebar.tsx          # Menu navigasi samping
├── DashboardLayout.tsx  # Layout wrapper
├── Card.tsx            # Komponen card
├── Button.tsx          # Komponen button
├── Table.tsx           # Komponen tabel
├── Loading.tsx         # Loading indicator
└── Toast.tsx           # Notifikasi toast
```

## Cara Menggunakan di Halaman Baru

1. **Import komponen yang diperlukan:**

```tsx
import DashboardLayout from "@/components/ui/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
```

2. **Wrap konten dengan DashboardLayout:**

```tsx
return (
  <DashboardLayout userRole="siswa">{/* Konten halaman */}</DashboardLayout>
);
```

3. **Gunakan komponen UI:**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Judul</CardTitle>
  </CardHeader>
  <CardContent>
    <Button href="/create">Tambah Baru</Button>
  </CardContent>
</Card>
```

## Tips Penggunaan

1. **Konsistensi:** Selalu gunakan komponen UI yang telah disediakan
2. **Accessibility:** Komponen telah dioptimasi untuk accessibility
3. **Performance:** Komponen menggunakan lazy loading dan optimasi React
4. **Responsive:** Selalu test di berbagai ukuran layar
5. **Dark Mode:** Pastikan konten readable di dark mode

## Troubleshooting

### Sidebar tidak muncul

- Pastikan menggunakan `DashboardLayout`
- Cek prop `userRole` sudah benar

### Styling tidak sesuai

- Pastikan Tailwind CSS terkonfigurasi dengan benar
- Cek import CSS di layout utama

### Navigation tidak berfungsi

- Pastikan Next.js router berfungsi
- Cek URL path sesuai dengan struktur folder

## Update Log

### v2.0.0 - Current

- ✅ Sidebar navigation
- ✅ Modern UI components
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Improved accessibility

### v1.0.0 - Previous

- Basic dashboard layout
- Simple components
- Limited responsive support
