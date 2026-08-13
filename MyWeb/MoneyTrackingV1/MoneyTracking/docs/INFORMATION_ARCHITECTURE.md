# Information Architecture

Dokumen ini mendefinisikan struktur dan hierarki informasi lengkap untuk aplikasi MoneyTracking V1. Struktur ini menjabarkan fitur apa saja yang tersedia, lokasinya di dalam UI, dan ketersediaannya berdasarkan tipe *Workspace* atau peran (Role).

## 1. Struktur Navigasi Utama (App Shell)

Sistem navigasi bergantung pada platform:
- **Mobile**: Menggunakan *Bottom Navigation* untuk menu primer, dan *More Drawer* untuk sekunder.
- **Desktop/Tablet**: Menggunakan *Sidebar* yang menampung seluruh menu navigasi.

### Komponen Navigasi Mobile
1. **Header**:
   - Judul Halaman/Branding.
   - Ikon Notifikasi.
   - Akses Profil (Avatar dropdown).
   - Workspace Switcher.
2. **Bottom Navigation (Primer)**:
   - Home (Dashboard)
   - Transaksi
   - **FAB (+)** (Quick Add Transaction)
   - Akun
   - Lainnya (Membuka *More Drawer*)
3. **Bottom More Drawer (Sekunder)**:
   - Kategori
   - Budget
   - Pelanggan (Hanya Bisnis)
   - Pembayaran / Piutang (Hanya Bisnis)
   - Laporan
   - Donasi
   - Pengaturan
   - Bantuan
4. **Profile Menu Dropdown**:
   - Profil Pengguna (Edit Nama, Email, Foto)
   - Keamanan (Password, Provider Auth)
   - Status & Role
   - Keluar (Logout)

## 2. Ketersediaan Fitur (Feature Matrix)

| Fitur / Modul | Personal Workspace | Business Workspace | Admin / Superadmin | Lokasi Navigasi (Mobile) | Ketersediaan |
|---------------|--------------------|--------------------|--------------------|--------------------------|--------------|
| **Dashboard** | ✅ Ya | ✅ Ya | ✅ Ya | Bottom Nav | V1 |
| **Transactions** | ✅ Ya | ✅ Ya | ✅ Ya | Bottom Nav | V1 |
| **Accounts** | ✅ Ya | ✅ Ya | ✅ Ya | Bottom Nav | V1 |
| **Categories** | ✅ Ya | ✅ Ya | ✅ Ya | More Drawer | V1 |
| **Budgets** | ✅ Ya | ✅ Ya | ✅ Ya | More Drawer | V1 |
| **Customers** | ❌ Tidak | ✅ Ya | ✅ Ya | More Drawer | V1 |
| **Payments** | ❌ Tidak | ✅ Ya | ✅ Ya | More Drawer | V1 |
| **Reports** | ✅ Ya | ✅ Ya (Extended) | ✅ Ya | More Drawer | V1 |
| **Notifications** | ✅ Ya | ✅ Ya | ✅ Ya | Header Icon | V1 |
| **Donations** | ✅ Ya | ✅ Ya | ✅ Ya | More Drawer | V1 |
| **Profile** | ✅ Ya | ✅ Ya | ✅ Ya | Profile Menu (Header) | V1 |
| **Settings** | ✅ Ya | ✅ Ya | ✅ Ya | More Drawer / Profile | V1 |
| **Admin Center** | ❌ Tidak | ❌ Tidak | ✅ Ya | More Drawer | V1.1 (Tahap 23) |

*Catatan:*
- Fitur `Admin Center` tertutup untuk pengguna biasa. Di dalamnya terdapat fitur seperti *Bot Log*, *User Management*, *Review Donations*, dan *Audit Log*.
- Fitur *Bisnis* hanya dirender jika *Workspace* aktif bertipe Bisnis.

## 3. Konsep Workspace & Isolasi Data

Aplikasi V1 sepenuhnya berbasis arsitektur Multi-Workspace:
- **Tipe Workspace**: Pribadi (`personal`), Bisnis (`business`).
- **Data yang Terisolasi per Workspace**:
  - `Accounts`
  - `Categories`
  - `Transactions`
  - `Budgets`
  - `Customers`
  - `Payments`
- Setiap operasi CRUD *wajib* menyertakan `workspace_id`. Konsep pemisahan Pribadi vs Bisnis *bukan* sekadar filter UI, melainkan isolasi data yang dikawal oleh *Row Level Security* (RLS) di PostgreSQL/Supabase nantinya.

## 4. Rute Halaman (Direct Routes)

Struktur URL (React Router) direncanakan sebagai berikut:

```text
/                      (Dashboard)
/onboarding            (Pemilihan Workspace Awal)
/login                 (Autentikasi Google)
/transactions          (Daftar Transaksi, Search, Filter)
/transactions/add      (Form Tambah Transaksi)
/accounts              (Manajemen Saldo)
/categories            (Manajemen Kategori)
/budgets               (Tracking Pengeluaran)
/customers             (Hanya Bisnis - CRM Mini)
/payments              (Hanya Bisnis - Invoice/Piutang)
/reports               (Laporan Keuangan & Chart)
/profile               (Informasi Pengguna)
/settings              (Preferensi Aplikasi)
/donations             (Donasi & Top Supporter)
/admin                 (Dashboard Admin)
```

Seluruh *Direct Routes* di atas harus didukung penuh dan tidak terputus (Orphan).
