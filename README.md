# Jurnal PKL - SMK Pgri 9 Banyuputih

Website untuk penginputan jurnal harian siswa dalam pelaksanaan Praktik Kerja Lapangan (PKL).

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom authentication with Supabase
- **Storage**: Supabase Storage (untuk foto kegiatan)
- **Form Validation**: React Hook Form + Zod

## Features

### Untuk Siswa

- ✅ Login dengan NISN
- ✅ Dashboard dengan statistik jurnal
- ✅ Membuat jurnal harian PKL
- ✅ Upload foto kegiatan
- ✅ Melihat daftar jurnal yang telah dibuat
- ✅ Evaluasi diri (personal & sosial)
- 🔄 Absensi PKL

### Untuk Guru

- ✅ Login dengan ID Guru
- ✅ Dashboard monitoring siswa
- ✅ Melihat siswa bimbingan
- ✅ Monitor jurnal siswa
- 🔄 Membuat catatan monitoring

### Untuk Admin

- 🔄 Kelola data master (siswa, guru, DUDI)
- 🔄 Laporan dan analytics

## Setup Project

### 1. Clone Repository

```bash
git clone <repository-url>
cd jurnalpkl
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Buat project di [Supabase](https://supabase.com)
2. Copy URL project dan API key
3. Buat file `.env.local` dan isi dengan:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Setup Database

1. Buka Supabase Dashboard > SQL Editor
2. Jalankan script dari file `database/setup.sql`
3. Script akan membuat:
   - Tabel-tabel yang diperlukan
   - Sample data untuk testing
   - Storage bucket untuk foto
   - Row Level Security policies

### 5. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

## Database Schema

### Tabel Utama

- **tb_user**: Data pengguna (siswa, guru, admin)
- **tb_siswa**: Data siswa PKL
- **tb_guru**: Data guru pembimbing
- **tb_dudi**: Data Dunia Usaha/Dunia Industri
- **tb_jurnal**: Data jurnal harian siswa
- **tb_absensi**: Data kehadiran siswa
- **tb_monitoring**: Catatan monitoring guru

### Relasi

```
tb_guru (1) -> (N) tb_siswa
tb_dudi (1) -> (N) tb_siswa
tb_siswa (1) -> (N) tb_jurnal
tb_siswa (1) -> (N) tb_absensi
```

## Akun Testing

### Siswa

- Username: `2024001` | Password: `2024001123` (Andi Pratama)
- Username: `2024002` | Password: `2024002123` (Sari Dewi)
- Username: `2024003` | Password: `2024003123` (Riko Firmansyah)

### Guru

- Username: `GURU001` | Password: `guru123` (Budi Santoso, S.Kom)
- Username: `GURU002` | Password: `guru123` (Siti Nurhaliza, S.Pd)
- Username: `GURU003` | Password: `guru123` (Ahmad Fadli, M.Kom)

### Admin

- Username: `admin` | Password: `admin123`

## Struktur Project

```
src/
├── app/                    # App Router pages
│   ├── login/             # Halaman login
│   ├── siswa/             # Pages untuk siswa
│   │   ├── dashboard/     # Dashboard siswa
│   │   └── jurnal/        # Manajemen jurnal
│   ├── guru/              # Pages untuk guru
│   │   └── dashboard/     # Dashboard guru
│   └── admin/             # Pages untuk admin
├── lib/                   # Utilities
│   ├── supabase/          # Konfigurasi Supabase
│   └── validations.ts     # Schema validasi Zod
├── types/                 # TypeScript type definitions
│   └── database.ts        # Database types
└── components/            # Reusable components (akan ditambah)
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push code ke GitHub repository
2. Connect repository ke [Vercel](https://vercel.com)
3. Set environment variables di Vercel dashboard
4. Deploy

### Environment Variables untuk Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Todo / Roadmap

- [ ] Implementasi absensi siswa
- [ ] Halaman monitoring untuk guru
- [ ] Dashboard admin lengkap
- [ ] Export laporan (PDF/Excel)
- [ ] Notifikasi real-time
- [ ] Mobile responsiveness
- [ ] PWA support
- [ ] Email notifications
- [ ] Backup & restore data

## Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Support

Jika ada pertanyaan atau butuh bantuan, silakan buat issue di GitHub repository.

---

**SMK Pgri 9 Banyuputih** - Sistem Jurnal PKL
