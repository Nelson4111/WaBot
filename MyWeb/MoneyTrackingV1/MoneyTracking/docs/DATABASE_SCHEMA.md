# Database Schema Design

Dokumen ini berisi rancangan relasional database untuk MoneyTracking V1. Implementasi final akan menggunakan PostgreSQL via Supabase.

## Tabel Utama

### 1. `users` (di-manage oleh auth.users Supabase)
Data otentikasi inti.

### 2. `profiles`
Ekstensi dari tabel user untuk menyimpan preferensi aplikasi.
- `id` (UUID, PK, FK ke auth.users)
- `email` (String)
- `name` (String)
- `role` (Enum: user, admin, superadmin) - Default: user
- `avatar_url` (String, nullable)
- `created_at` (Timestamp)

### 3. `workspaces`
Mengelola isolasi data antara Pribadi dan Bisnis.
- `id` (UUID, PK)
- `user_id` (UUID, FK ke profiles)
- `name` (String) - e.g., "Keuangan Pribadi", "Toko Bangunan"
- `type` (Enum: personal, business)
- `currency` (String) - Default: IDR
- `created_at` (Timestamp)

### 4. `accounts` (Akun/Dompet)
Menyimpan asal muasal atau tujuan uang (BCA, Kas, DANA).
- `id` (UUID, PK)
- `workspace_id` (UUID, FK ke workspaces)
- `name` (String)
- `type` (Enum: bank, cash, ewallet, credit)
- `balance` (Numeric) - Berubah otomatis via trigger saat transaksi terjadi
- `is_active` (Boolean) - Soft delete
- `created_at` (Timestamp)

### 5. `categories`
Kategori transaksi.
- `id` (UUID, PK)
- `workspace_id` (UUID, FK ke workspaces, nullable jika default system)
- `name` (String)
- `type` (Enum: income, expense, transfer)
- `icon` (String)
- `color` (String)
- `is_system` (Boolean) - True jika kategori bawaan (tidak bisa dihapus)

### 6. `transactions`
Tabel paling krusial, menyimpan mutasi uang.
- `id` (UUID, PK)
- `workspace_id` (UUID, FK ke workspaces)
- `account_id` (UUID, FK ke accounts)
- `category_id` (UUID, FK ke categories)
- `type` (Enum: income, expense, transfer)
- `amount` (Numeric)
- `date` (Timestamp/Date)
- `note` (String, nullable)
- `transfer_to_account_id` (UUID, FK ke accounts, nullable) - Hanya terisi jika type = transfer
- `created_at` (Timestamp)

### 7. `budgets`
Target pengeluaran per bulan/kategori.
- `id` (UUID, PK)
- `workspace_id` (UUID, FK ke workspaces)
- `category_id` (UUID, FK ke categories, nullable) - Null berarti budget total
- `amount` (Numeric) - Limit budget
- `month` (String) - Format YYYY-MM
- `created_at` (Timestamp)

### 8. `customers` (Khusus Workspace Bisnis)
- `id` (UUID, PK)
- `workspace_id` (UUID, FK ke workspaces)
- `name` (String)
- `phone` (String, nullable)
- `address` (Text, nullable)
- `created_at` (Timestamp)

### 9. `donations`
Mencatat partisipasi user dalam pengembangan aplikasi (Leaderboard).
- `id` (UUID, PK)
- `user_id` (UUID, FK ke profiles, nullable)
- `display_name` (String) - Bisa diisi nama, "Anonymous", atau dikosongkan
- `amount` (Numeric)
- `status` (Enum: pending, verified, rejected)
- `payment_method` (String)
- `created_at` (Timestamp)

## Relasi & Aturan Kunci (Constraints)
- Semua data transaksi, akun, kategori (non-system), budget, dan pelanggan **WAJIB** terikat pada `workspace_id`.
- Penghapusan Workspace akan memicu cascade delete (atau soft-delete) pada semua data turunannya.
- Penghapusan Akun/Kategori idealnya menggunakan soft-delete (`is_active = false`) agar history transaksi lama tidak rusak.

## Row Level Security (RLS) Policy Target
Karena menggunakan Supabase, RLS akan diterapkan sebagai berikut:
- `SELECT`, `INSERT`, `UPDATE`, `DELETE` pada `transactions` -> HANYA DIIZINKAN JIKA `auth.uid() == workspaces.user_id`. User tidak bisa melihat transaksi dari workspace milik orang lain.
