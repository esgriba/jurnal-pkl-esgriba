# Admin Panel - Sistem Jurnal PKL

## 🎯 Overview

Sistem admin panel yang komprehensif untuk mengelola seluruh data dalam aplikasi Jurnal PKL SMK Pgri 9 Banyuputih.

## 🔐 Akses Admin

- **URL Login**: `http://localhost:3002/login`
- **Role Required**: `admin`
- **Default Admin**: Buat user dengan role admin melalui database atau form user

## 📋 Fitur Admin Panel

### 1. **Dashboard Admin** (`/admin/dashboard`)

- **Overview Statistik**:
  - Total Users (semua role)
  - Total Siswa
  - Total Guru
  - Total DUDI
  - Total Jurnal
  - Total Absensi
- **Jurnal Terbaru**: 5 jurnal terakhir yang diinput
- **Quick Actions**: Link cepat untuk menambah data baru

### 2. **Manajemen Users** (`/admin/users`)

- **Daftar Users**: Semua user dengan role (admin, guru, siswa)
- **Filter & Search**: Berdasarkan nama, username, role
- **CRUD Operations**:
  - ✅ Create: Tambah user baru dengan form validasi
  - ✅ Read: Lihat daftar dan detail user
  - ✅ Update: Edit data user (coming soon)
  - ✅ Delete: Hapus user (kecuali admin yang sedang login)

### 3. **Manajemen Siswa** (`/admin/siswa`)

- **Daftar Siswa**: Semua data siswa PKL
- **Filter & Search**: Berdasarkan NISN, nama, kelas, guru, DUDI
- **View Details**: Info lengkap siswa dan relasinya
- **CRUD Operations**: Create, Read, Update, Delete siswa

### 4. **Manajemen Jurnal** (`/admin/jurnal`)

- **Daftar Jurnal**: Semua jurnal yang dibuat siswa
- **Filter Advanced**:
  - Search: ID jurnal, nama siswa, deskripsi kegiatan
  - Date: Filter berdasarkan tanggal tertentu
- **Export CSV**: Download data jurnal dalam format CSV
- **Detail View**: Lihat jurnal lengkap dengan evaluasi diri
- **Delete**: Hapus jurnal yang tidak sesuai

### 5. **Manajemen Absensi** (`/admin/absensi`)

- **Daftar Absensi**: Semua data kehadiran siswa PKL
- **Filter Multi-criteria**:
  - Status: Hadir, Sakit, Izin, Alpha
  - Tanggal: Filter tanggal tertentu
  - Search: NISN, nama, kelas
- **Statistik Visual**: Card counts per status absensi
- **Export CSV**: Download data absensi
- **Delete**: Hapus data absensi yang salah

### 6. **Manajemen Guru** (`/admin/guru`) [Planned]

- CRUD operasi untuk data guru pembimbing

### 7. **Manajemen DUDI** (`/admin/dudi`) [Planned]

- CRUD operasi untuk data Dunia Usaha/Dunia Industri

## 🛠️ Technical Features

### Authentication & Authorization

- **Role-based access**: Hanya admin yang dapat mengakses
- **Session management**: Menggunakan localStorage
- **Auto-redirect**: Redirect otomatis berdasarkan role user

### Data Management

- **Real-time data**: Fetch langsung dari Supabase
- **Pagination**: Handled by database query limits
- **Search & Filter**: Client-side filtering untuk performance
- **Export functionality**: CSV export dengan format proper

### UI/UX

- **Responsive Design**: Mobile-friendly dengan Tailwind CSS
- **Interactive Elements**: Hover states, loading states
- **Icon System**: Lucide React icons yang konsisten
- **Color Coding**: Status indicators dengan warna yang meaningful

## 📊 Database Tables Managed

1. **tb_user**: User management (admin, guru, siswa)
2. **tb_siswa**: Data siswa PKL
3. **tb_guru**: Data guru pembimbing
4. **tb_dudi**: Data tempat PKL
5. **tb_jurnal**: Jurnal harian siswa
6. **tb_absensi**: Data kehadiran siswa

## 🔧 Development Guidelines

### File Structure

```
src/app/admin/
├── page.tsx                 # Redirect ke dashboard
├── dashboard/
│   └── page.tsx            # Main admin dashboard
├── users/
│   ├── page.tsx            # User management list
│   └── create/
│       └── page.tsx        # Create new user form
├── siswa/
│   └── page.tsx            # Student management
├── jurnal/
│   ├── page.tsx            # Journal management list
│   └── [id]/
│       └── page.tsx        # Journal detail view
└── absensi/
    └── page.tsx            # Attendance management
```

### Code Patterns

- **Hooks**: useState, useEffect untuk state management
- **Router**: useRouter untuk navigation, useParams untuk dynamic routes
- **Data Fetching**: Supabase client dengan error handling
- **Form Handling**: React Hook Form + Zod validation
- **Loading States**: Spinner dengan informative messages

### Security Considerations

- ✅ Role validation di setiap halaman admin
- ✅ Client-side auth check dengan redirect
- ✅ Input validation dengan Zod schemas
- ⚠️ Note: Password belum di-hash (untuk production perlu encrypt)

## 🚀 Usage Instructions

### 1. Setup Admin User

Buat user admin melalui database atau gunakan form create user:

```sql
INSERT INTO tb_user (username, password, nama, role)
VALUES ('admin', 'password123', 'Administrator', 'admin');
```

### 2. Login as Admin

1. Buka `http://localhost:3002/login`
2. Login dengan credentials admin
3. Akan redirect ke `/admin/dashboard`

### 3. Navigation

- Dashboard: Overview dan quick access
- Sidebar navigation ke setiap module
- Breadcrumb untuk easy navigation back

### 4. Data Management

- **View**: Click nama/ID untuk detail
- **Edit**: Click edit icon (when available)
- **Delete**: Click trash icon dengan confirmation
- **Export**: Click export button untuk download CSV

## 🎨 UI Components

### Cards & Stats

- **Stat Cards**: Color-coded dengan icons
- **Data Tables**: Sortable, searchable, responsive
- **Forms**: Validation errors, loading states

### Actions

- **Buttons**: Primary, secondary, danger variants
- **Icons**: Consistent Lucide React icon set
- **Modals**: Confirmation dialogs untuk delete actions

## 📈 Future Enhancements

1. **Advanced Reporting**: Charts dan analytics
2. **Bulk Operations**: Mass edit/delete functions
3. **User Permissions**: Granular permission system
4. **Audit Logs**: Track admin actions
5. **API Integration**: RESTful API untuk mobile apps
6. **Real-time Updates**: WebSocket untuk live data

## 🐛 Known Issues & TODOs

- [ ] Password hashing untuk security
- [ ] Edit forms untuk users, siswa, dll
- [ ] Pagination untuk large datasets
- [ ] Advanced search dengan multiple criteria
- [ ] Role-based permissions (admin vs super admin)
- [ ] Backup & restore functionality

---

**Status**: ✅ MVP Complete - Core admin functionality implemented and ready for use
