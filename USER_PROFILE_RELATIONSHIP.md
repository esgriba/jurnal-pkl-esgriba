# 🔗 Panduan Menghubungkan Data User dengan Data Guru dan Siswa

## 📋 **Ringkasan Masalah**

Sistem sebelumnya memiliki hubungan yang lemah antara tabel `tb_user` dengan `tb_guru` dan `tb_siswa`. Hubungan hanya berdasarkan pencocokan nama yang tidak reliable dan tidak ada foreign key yang proper.

## ✅ **Solusi yang Diimplementasikan**

### 1. **Update Database Schema**

#### **Menambahkan Foreign Key Relationships**

```sql
-- Tambahkan kolom user_id ke tb_guru
ALTER TABLE public.tb_guru
ADD COLUMN IF NOT EXISTS user_id INTEGER,
ADD CONSTRAINT fk_guru_user
FOREIGN KEY (user_id) REFERENCES tb_user(id);

-- Tambahkan kolom user_id ke tb_siswa
ALTER TABLE public.tb_siswa
ADD COLUMN IF NOT EXISTS user_id INTEGER,
ADD CONSTRAINT fk_siswa_user
FOREIGN KEY (user_id) REFERENCES tb_user(id);
```

#### **Unique Constraints**

```sql
-- Pastikan satu user hanya punya satu profile
ALTER TABLE public.tb_guru ADD CONSTRAINT unique_guru_user UNIQUE (user_id);
ALTER TABLE public.tb_siswa ADD CONSTRAINT unique_siswa_user UNIQUE (user_id);
```

### 2. **Database View untuk Query Mudah**

Dibuat view `v_user_complete` yang menggabungkan semua data user dengan profile mereka:

```sql
CREATE OR REPLACE VIEW v_user_complete AS
SELECT
  u.id as user_id, u.username, u.nama, u.role, u.password,
  g.id_guru, g.nama_guru,
  s.nisn, s.nama_siswa, s.kelas, s.tahun_pelajaran, s.semester,
  s.id_dudi, s.nama_dudi, s.id_guru as siswa_id_guru, s.nama_guru as siswa_nama_guru
FROM public.tb_user u
LEFT JOIN public.tb_guru g ON u.id = g.user_id
LEFT JOIN public.tb_siswa s ON u.id = s.user_id;
```

### 3. **Stored Functions untuk Operasi CRUD**

#### **Membuat User + Guru Sekaligus**

```sql
CREATE OR REPLACE FUNCTION create_guru_with_user(
  p_username VARCHAR(20), p_nama VARCHAR(100),
  p_password VARCHAR(255), p_id_guru VARCHAR(100)
) RETURNS INTEGER;
```

#### **Membuat User + Siswa Sekaligus**

```sql
CREATE OR REPLACE FUNCTION create_siswa_with_user(
  -- semua parameter siswa dan user
) RETURNS INTEGER;
```

### 4. **Helper Library TypeScript**

File: `src/lib/userProfileManager.ts`

#### **Interface Utama**

```typescript
export interface UserWithProfile {
  user_id: number;
  username: string;
  nama: string;
  role: "admin" | "guru" | "siswa";
  // Guru fields (if role = guru)
  id_guru?: string;
  nama_guru?: string;
  // Siswa fields (if role = siswa)
  nisn?: string;
  nama_siswa?: string;
  kelas?: string;
  // ... dll
}
```

#### **Functions Utama**

- `getUserWithProfile(username)` - Ambil user dengan profile lengkap
- `createGuruWithUser(data)` - Buat user + guru sekaligus
- `createSiswaWithUser(data)` - Buat user + siswa sekaligus
- `linkUserToGuru(userId, idGuru)` - Hubungkan user existing ke guru
- `linkUserToSiswa(userId, nisn)` - Hubungkan user existing ke siswa
- `validateUserProfileConnection(username)` - Validasi hubungan

### 5. **Admin Interface**

Halaman: `/admin/user-profile`

#### **Fitur Utama:**

- ✅ **Dashboard Statistik**: User terhubung, belum terhubung, profile tersedia
- ✅ **Tabel User Terhubung**: Lihat semua user yang sudah memiliki profile
- ✅ **Management Interface**: Hubungkan user dengan profile yang tersedia
- ✅ **Putuskan Hubungan**: Unlink user dari profile jika diperlukan
- ✅ **Search & Filter**: Cari berdasarkan nama, username, atau role

## 🚀 **Cara Menggunakan**

### **1. Jalankan Update Database**

```bash
# Jalankan script SQL di Supabase SQL Editor
cat database/update-user-relations.sql
```

### **2. Menggunakan Helper Functions**

#### **Ambil Data User Lengkap**

```typescript
import { getUserWithProfile } from "@/lib/userProfileManager";

const user = await getUserWithProfile("guru001");
if (user && user.role === "guru") {
  console.log("ID Guru:", user.id_guru);
  console.log("Nama Guru:", user.nama_guru);
}
```

#### **Validasi Hubungan User**

```typescript
import { validateUserProfileConnection } from "@/lib/userProfileManager";

const validation = await validateUserProfileConnection("siswa001");
if (!validation.isConnected) {
  console.log("Problem:", validation.message);
}
```

### **3. Menggunakan Admin Interface**

1. **Buka `/admin/user-profile`**
2. **Lihat statistik hubungan user-profile**
3. **Hubungkan user yang belum terhubung:**
   - Klik tombol nama profile di sebelah user
   - Profile akan otomatis terhubung
4. **Putuskan hubungan jika diperlukan:**
   - Klik ikon Unlink di tabel user terhubung

## 📊 **Struktur Database Setelah Update**

### **Relasi Baru:**

```
tb_user (1) ←→ (1) tb_guru
tb_user (1) ←→ (1) tb_siswa
tb_guru (1) → (N) tb_siswa  [existing]
tb_dudi (1) → (N) tb_siswa  [existing]
```

### **Keuntungan:**

1. ✅ **Reliable**: Tidak lagi bergantung pada pencocokan nama
2. ✅ **Data Integrity**: Foreign key constraints mencegah data orphan
3. ✅ **Performance**: Index yang tepat untuk query cepat
4. ✅ **Scalable**: Mudah ditambahkan fitur baru
5. ✅ **Maintainable**: Helper functions mempermudah development

## 🔧 **Migrasi Data Existing**

Script SQL sudah include migrasi otomatis:

```sql
-- Update data yang sudah ada - hubungkan user dengan guru berdasarkan nama
UPDATE public.tb_guru
SET user_id = (
  SELECT u.id FROM public.tb_user u
  WHERE u.nama = tb_guru.nama_guru AND u.role = 'guru'
  LIMIT 1
) WHERE user_id IS NULL;

-- Update data yang sudah ada - hubungkan user dengan siswa berdasarkan nama
UPDATE public.tb_siswa
SET user_id = (
  SELECT u.id FROM public.tb_user u
  WHERE u.nama = tb_siswa.nama_siswa AND u.role = 'siswa'
  LIMIT 1
) WHERE user_id IS NULL;
```

## 🎯 **Penggunaan Praktis**

### **Dalam Login System:**

```typescript
// Daripada mencari berdasarkan nama (tidak reliable)
const userData = await getUserWithProfile(username);
if (userData.role === "guru") {
  // Langsung dapat id_guru yang pasti benar
  const siswaList = await getSiswaBimbinganByGuru(userData.id_guru!);
}
```

### **Dalam Dashboard:**

```typescript
// Tampilkan data user lengkap dengan profile
const currentUser = await getUserWithProfile(session.username);
console.log("Logged in as:", currentUser.nama);
if (currentUser.role === "siswa") {
  console.log("NISN:", currentUser.nisn);
  console.log("Kelas:", currentUser.kelas);
}
```

### **Dalam CRUD Operations:**

```typescript
// Buat user dan profile sekaligus (atomic)
const result = await createGuruWithUser({
  username: "guru001",
  nama: "Pak Budi",
  password: "hashedpassword",
  id_guru: "GR001",
});
```

## 🛡️ **Data Security & Validation**

1. **Foreign Key Constraints**: Mencegah data inconsistent
2. **Unique Constraints**: Satu user = satu profile
3. **Validation Functions**: Cek hubungan sebelum operasi
4. **Row Level Security**: Policies Supabase tetap aktif
5. **Type Safety**: TypeScript interfaces untuk compile-time checking

---

**📝 Note**: Semua perubahan backward compatible. Sistem lama tetap berfungsi sambil secara bertahap menggunakan sistem baru yang lebih robust.
