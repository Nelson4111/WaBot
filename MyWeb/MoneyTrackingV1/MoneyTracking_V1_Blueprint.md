# MoneyTracking V1 - Project Blueprint

> Dokumen acuan utama saat mengembangkan MoneyTracking V1.
>
> **Tujuan:** menjaga agar implementasi Web, PWA, Android, backend, database, dan Admin Panel tidak melenceng dari konsep yang sudah disepakati.

---

## 1. Status Proyek

MoneyTracking V1 adalah pembangunan ulang dari prototype lama.

Prototype lama dianggap sebagai **referensi**, bukan fondasi kode yang wajib dipertahankan.

### Prinsip

- Jangan menambal struktur lama yang sudah berantakan jika lebih aman membuat ulang.
- Data lama dari Google Sheets tetap dipertahankan untuk proses migrasi.
- Jangan membuat database final sebelum rancangan schema disetujui.
- Jangan mengimplementasikan fitur di luar blueprint tanpa memperbarui dokumen ini terlebih dahulu.

---

# 2. Tujuan Produk

MoneyTracking adalah aplikasi pencatatan dan pengelolaan keuangan yang dapat digunakan untuk:

- Keuangan pribadi
- Keuangan bisnis
- Keuangan pribadi + bisnis

Aplikasi dirancang agar satu user dapat mengelola konteks keuangan secara terpisah tetapi tetap menggunakan satu akun.

---

# 3. Teknologi Utama

Rencana arsitektur:

```text
Google OAuth
     ↓
Supabase Auth
     ↓
PostgreSQL / Supabase
     ↓
MoneyTracking
 ┌───┼───────────┐
Web PWA       Android
     │
     └── Bot / Integrasi lain
```

### Komponen

- Authentication: Supabase Auth
- Login: Google OAuth
- Database: PostgreSQL melalui Supabase
- Security: Row Level Security (RLS)
- Web: aplikasi utama
- PWA: tahap pengembangan berikutnya
- Android: menggunakan backend/database yang sama
- Bot: menggunakan backend/database yang sama jika diaktifkan

---

# 4. Konsep Akun Pengguna

Saat pertama menggunakan aplikasi, user memilih:

```text
🏠 Pribadi
💼 Bisnis
🏠💼 Keduanya
```

Pilihan ini **bukan kategori transaksi** dan bukan database terpisah.

Pilihan tersebut menentukan konfigurasi awal dan pengalaman pengguna.

## Pribadi

Fokus pada:

- Dashboard
- Transaksi
- Akun
- Kategori
- Budget
- Laporan

## Bisnis

Fokus pada:

- Dashboard
- Transaksi
- Akun
- Kategori
- Budget
- Laporan
- Pelanggan
- Fitur bisnis yang relevan

## Keduanya

User memiliki konteks:

```text
🏠 Pribadi
💼 Bisnis
```

Data pribadi dan bisnis harus dapat dipisahkan dengan jelas.

---

# 5. Workspace

Konsep yang direkomendasikan:

```text
User
├── 🏠 Workspace Pribadi
└── 💼 Workspace Bisnis
```

User yang memilih Pribadi hanya membutuhkan workspace pribadi.

User yang memilih Bisnis hanya membutuhkan workspace bisnis.

User yang memilih Keduanya memiliki keduanya.

### Catatan

Pilihan awal tidak boleh mengunci user secara permanen.

Contoh:

```text
Awalnya:
🏠 Pribadi

Kemudian user mulai memiliki usaha:

Pengaturan
    ↓
Aktifkan Bisnis
    ↓
🏠 Pribadi
💼 Bisnis
```

---

# 6. Fitur Core V1

## 🔴 Prioritas utama

### Authentication

- Google Login
- Supabase Auth
- Profile user

### Workspace

- Pribadi
- Bisnis
- Keduanya
- Pemisahan data antar workspace

### Transactions

Minimal:

- Pemasukan
- Pengeluaran
- Transfer

Transaksi harus berhubungan dengan workspace dan akun yang sesuai.

### Accounts

Contoh:

- Cash
- Bank
- E-wallet
- Kartu

Satu workspace dapat memiliki banyak akun.

### Categories

Mendukung:

- Kategori default sistem
- Kategori custom user
- Kategori yang relevan dengan konteks pribadi/bisnis

### Budget

User dapat membuat budget dan memantau penggunaannya.

### Transfer

Transfer antar akun harus diperlakukan sebagai perpindahan uang, bukan sekadar pemasukan dan pengeluaran biasa.

Contoh:

```text
BCA
- Rp100.000
    ↓
DANA
+ Rp100.000
```

### Dashboard

Minimal menampilkan:

- Total saldo
- Pemasukan
- Pengeluaran
- Ringkasan keuangan

### Reports

Minimal:

- Pemasukan
- Pengeluaran
- Saldo
- Pengeluaran berdasarkan kategori
- Perbandingan periode

Untuk bisnis dapat dikembangkan menjadi:

- Pendapatan
- Pengeluaran
- Laba/rugi
- Piutang

### Export

User harus dapat mengambil data miliknya.

Minimal:

- CSV

Dapat dikembangkan menjadi:

- Excel
- PDF

---

# 7. Fitur Bisnis

## Pelanggan

Konsep pelanggan dipertahankan karena MoneyTracking mendukung penggunaan bisnis.

Contoh:

```text
Pelanggan: Andi
Total transaksi: Rp500.000
Sudah dibayar: Rp300.000
Piutang: Rp200.000
```

Pelanggan harus dipertimbangkan sebagai data yang berhubungan dengan workspace bisnis.

### Catatan

Jangan menganggap `PELANGGAN` sama dengan user MoneyTracking.

---

# 8. Fitur Prioritas Berikutnya

## 🟡 V1.1

- Recurring Transaction
- Notifications
- Global Search
- PWA
- Donation System
- Top Donors
- Admin Panel

## 🟢 Tahap berikutnya / V2

- Financial Goals
- Bot integration
- Advanced Business Reports
- Android native app
- Advanced Notifications
- AI Financial Assistant

Prioritas dapat berubah setelah pengembangan dan pengujian.

---

# 9. Recurring Transaction

Fitur yang direncanakan untuk transaksi berulang.

Contoh:

```text
Setiap tanggal 1
Gaji + Rp5.000.000

Setiap tanggal 10
Internet - Rp300.000
```

Belum menjadi prioritas sebelum core transaction system stabil.

---

# 10. Donation System

Untuk V1, MoneyTracking direncanakan **gratis**.

Tidak ada subscription atau paket Pro untuk tahap awal.

Dukungan pengembangan dilakukan melalui donasi sukarela.

## Alur

```text
User
 ↓
❤️ Donasi
 ↓
Pilih nominal
 ↓
Transfer manual
 ↓
Isi formulir
 ↓
Kirim ke WhatsApp Admin
 ↓
Kirim screenshot bukti transfer melalui WhatsApp
 ↓
Admin mengecek transfer
 ↓
Approve / Reject
```

## Bukti Transfer

Screenshot bukti transfer **tidak disimpan di database atau Supabase Storage**.

Bukti dikirim langsung oleh user melalui WhatsApp Admin.

Database hanya menyimpan informasi donasi dan status verifikasi.

### Status

```text
pending
approved
rejected
```

Hanya donasi yang `approved` yang boleh masuk ke leaderboard.

---

# 11. Donation Form

Informasi yang direncanakan:

- Nominal
- Nama tampilan
- Pilihan anonymous/private
- Pesan opsional

User bebas menentukan nama yang ditampilkan.

Contoh:

```text
Nelson
Seseorang
Nama samaran
Private
```

Jika nama dikosongkan, sistem dapat menggunakan tampilan seperti:

```text
Private Donor
```

### Privacy

Nama Google user tidak boleh otomatis ditampilkan sebagai nama donatur.

User menentukan sendiri nama tampilan donasi.

---

# 12. Top Donors

Papan penghargaan untuk donatur.

Contoh:

```text
🏆 TOP DONATUR

🥇 Seseorang
🥈 Nelson
🥉 Private Donor
```

Leaderboard hanya menampilkan informasi yang memang diizinkan oleh donatur.

Jangan menampilkan:

- Screenshot bukti transfer
- Nomor rekening
- Detail rekening
- Data pribadi transfer yang tidak diperlukan

Leaderboard dapat dikembangkan menjadi:

- Minggu ini
- Bulan ini
- Sepanjang waktu

---

# 13. Admin Panel

Admin tidak membutuhkan database terpisah.

Gunakan database utama dengan Role-Based Access Control dan RLS.

## Role

Konsep awal:

```text
user
admin
superadmin
```

## Fungsi Admin

Direncanakan:

```text
Admin Dashboard
├── User Management
├── System Settings
├── Default Categories
├── Donation Verification
├── Bot Logs
└── Audit Logs
```

---

# 14. Admin User Management

Admin dapat memiliki kemampuan seperti:

- Melihat daftar user
- Mengelola role sesuai kewenangan
- Mengaktifkan/nonaktifkan akun
- Melihat status user

User biasa hanya dapat mengakses data yang memang menjadi miliknya.

---

# 15. System Configuration

Konsep tabel konfigurasi sistem untuk pengaturan global.

Contoh:

- Maintenance mode
- Minimum app version
- Feature toggle
- Batas tertentu yang memang diperlukan sistem

### Catatan

Secret/API key tidak boleh sembarangan disimpan atau diekspos ke frontend.

---

# 16. Subscription

## Untuk V1: TIDAK DIGUNAKAN

MoneyTracking saat ini direncanakan gratis.

Jangan membuat sistem berikut hanya untuk berjaga-jaga:

- Pro Monthly
- Pro Yearly
- Subscription plans
- Subscription billing

Jika di masa depan MoneyTracking memiliki paket berbayar, desain subscription dapat ditambahkan kemudian.

---

# 17. System Payments vs Transactions

Jangan mencampur transaksi keuangan user dengan pembayaran ke MoneyTracking.

Contoh transaksi user:

```text
User membeli makanan Rp25.000
→ transactions
```

Contoh pembayaran kepada MoneyTracking:

```text
User mendukung aplikasi dengan donasi Rp50.000
→ donations
```

Jika kelak ada subscription, pembayaran subscription juga harus menjadi data sistem yang terpisah dari transaksi keuangan user.

---

# 18. Bot

Bot tetap dipertahankan sebagai integrasi yang direncanakan.

Contoh:

```text
Bot
 ↓
/expense 50000 makan
 ↓
MoneyTracking
 ↓
Transaction
```

`bot_logs` dapat digunakan untuk:

- Command
- Status
- Error
- User terkait
- Timestamp

Bot bukan prioritas utama sebelum core web stabil.

---

# 19. Audit Logs

Admin membutuhkan jejak perubahan penting.

Konsep:

```text
WHO
WHAT
WHEN
```

Contoh:

```text
Admin A
mengubah role User B
user → admin
```

Audit log berguna untuk mengetahui siapa melakukan perubahan penting pada sistem.

---

# 20. Security

## RLS

User biasa harus hanya dapat membaca/mengubah data yang memang menjadi haknya.

Konsep dasar:

```text
auth.uid()
    ↓
User ID
    ↓
Data milik user/workspace yang sesuai
```

Admin dapat memiliki policy khusus sesuai kewenangan.

### Penting

RLS harus dirancang setelah struktur tabel dan relasi final.

Jangan copy-paste policy lama tanpa review.

---

# 21. Data Lama Google Sheets

Google Sheets lama memiliki sheet:

```text
TRANSAKSI
AKUN
KATEGORI
BUDGET
PELANGGAN
PEMBAYARAN
BOT LOG
PENGATURAN
```

Data lama tidak boleh langsung dipindahkan secara membabi buta.

Proses:

```text
Google Sheets lama
        ↓
Analisis struktur
        ↓
Mapping
        ↓
Database schema baru
        ↓
Validasi
        ↓
Migration
```

Google Sheets tetap dipertahankan sebagai sumber data/backup selama proses migrasi.

---

# 22. Database Design

Database belum boleh dianggap final sebelum requirement lengkap.

Kandidat awal:

```text
profiles
workspaces
accounts
categories
transactions
budgets
customers
donations
system_configs
bot_logs
audit_logs
```

Tabel tambahan hanya dibuat jika benar-benar diperlukan.

### Jangan membuat tabel hanya karena:

- fitur terdengar keren
- "mungkin nanti diperlukan"
- AI menyarankan
- ingin terlihat kompleks

---

# 23. Relasi Data yang Harus Dipikirkan

Minimal perlu menentukan:

```text
User
 ↓
Workspace
 ↓
Accounts
 ↓
Transactions
 ↓
Categories
```

Untuk bisnis:

```text
Workspace Bisnis
 ↓
Customers
 ↓
Transactions
```

Untuk admin:

```text
Admin
 ↓
System Data
 ├── System Config
 ├── Default Categories
 ├── Donations
 ├── Bot Logs
 └── Audit Logs
```

Relasi final belum disetujui.

---

# 24. UI/UX Principles

MoneyTracking harus:

- Mobile-friendly
- Responsive
- Tidak berat
- Mudah digunakan
- Tidak menampilkan fitur yang tidak relevan
- Dashboard menyesuaikan konteks user
- Pribadi dan bisnis tidak membingungkan

User yang memilih Pribadi tidak perlu dibanjiri fitur bisnis.

User yang memilih Bisnis harus mendapatkan fitur bisnis yang relevan.

User Keduanya harus dapat berpindah konteks dengan jelas.

---

# 25. Performance

Prioritas:

- Query database efisien
- Index dibuat berdasarkan pola query nyata
- Jangan mengambil seluruh transaksi jika hanya membutuhkan sebagian
- Pagination untuk data besar
- Hindari request API berlebihan
- Optimasi mobile
- Jangan mengirim data yang tidak diperlukan ke frontend

Index belum final dan harus ditentukan setelah schema dan query utama jelas.

---

# 26. Privacy

Data user harus dipisahkan.

User A tidak boleh melihat data:

```text
User B
```

Data donasi juga harus memperhatikan privasi.

Bukti transfer:

```text
WhatsApp Admin
```

bukan:

```text
Supabase Storage publik
```

---

# 27. Account Deletion

Direncanakan:

```text
Settings
 ↓
Export data
 ↓
Delete account
```

User tidak boleh dibuat terjebak di aplikasi.

Detail cascade/delete policy harus dirancang sebelum implementasi final.

---

# 28. Development Rules

Saat coding:

1. Jangan menambah fitur besar tanpa memperbarui blueprint.
2. Jangan mengubah struktur database tanpa memahami dampaknya ke Web/Android/Bot.
3. Jangan membuat database per user.
4. Jangan menyimpan secret di frontend.
5. Jangan menggunakan frontend sebagai sumber kebenaran pembayaran.
6. Jangan menganggap screenshot donasi sebagai data database.
7. Jangan membuat subscription sebelum memang dibutuhkan.
8. Jangan membuat tabel tanpa alasan yang jelas.
9. Jangan menghapus data lama sebelum migrasi tervalidasi.
10. Jangan menganggap prototype lama sebagai arsitektur final.

---

# 29. Development Order

Urutan yang disarankan:

```text
1. Product Requirements
        ↓
2. User Flow
        ↓
3. Feature Scope
        ↓
4. Database Schema
        ↓
5. Relationships
        ↓
6. RLS / Security
        ↓
7. Supabase Setup
        ↓
8. Authentication
        ↓
9. Core Data Layer
        ↓
10. Transactions
        ↓
11. Accounts
        ↓
12. Categories
        ↓
13. Budget
        ↓
14. Customers / Business
        ↓
15. Dashboard
        ↓
16. Reports
        ↓
17. Export
        ↓
18. Testing
        ↓
19. PWA
        ↓
20. Android
        ↓
21. Optional Bot / Donations / Admin enhancements
```

---

# 30. Current Project Status

## Sudah disepakati

- [x] Mulai ulang dari prototype lama
- [x] Google OAuth
- [x] Supabase Auth
- [x] PostgreSQL
- [x] RLS sebagai security layer
- [x] Pribadi
- [x] Bisnis
- [x] Keduanya
- [x] Konsep workspace
- [x] Transactions
- [x] Accounts
- [x] Categories
- [x] Budget
- [x] Transfer
- [x] Customers untuk konteks bisnis
- [x] Dashboard
- [x] Reports
- [x] Free model
- [x] Voluntary donations
- [x] Manual donation verification melalui WhatsApp
- [x] Screenshot bukti transfer tidak disimpan di database
- [x] Custom donor display name
- [x] Private donor option
- [x] Top Donors
- [x] Admin Panel
- [x] Admin roles
- [x] Bot logs concept
- [x] Audit logs concept
- [x] Export concept

## Belum final

- [ ] Detail seluruh database columns
- [ ] Final workspace schema
- [ ] Final transaction schema
- [ ] Final customer schema
- [ ] Final donation schema
- [ ] Final RLS policies
- [ ] Final indexes
- [ ] UI/UX design
- [ ] Exact technology/framework frontend
- [ ] Android implementation strategy
- [ ] Payment/donation method
- [ ] Bot integration details
- [ ] Migration mapping dari Google Sheets

---     

# 31. Golden Rule

> **Jika suatu keputusan teknis bertentangan dengan kebutuhan produk, jangan langsung coding. Kembali ke blueprint dan review keputusan tersebut.**

> **Jika fitur baru ingin ditambahkan, tentukan dulu apakah fitur tersebut masuk V1, V1.1, atau V2.**

> **Jangan biarkan AI coding agent memperluas scope proyek tanpa persetujuan.**

---

# 32. Prinsip Utama MoneyTracking

```text
SIMPLE
SECURE
FAST
PRIVATE
SCALABLE
USER-CONTROLLED
```

MoneyTracking harus tetap sederhana untuk user pribadi, tetapi cukup kuat untuk user bisnis.

Fitur tambahan tidak boleh membuat fitur inti menjadi rumit.
