# MoneyTracking V1

Aplikasi pencatatan keuangan pribadi dan bisnis modern dengan pendekatan antarmuka **Neo-Brutalism**. 
Versi ini merupakan perombakan total (rewrite) dari project MoneyTracking sebelumnya, menggunakan arsitektur komponen modern yang lebih scalable, bersih, dan *mobile-first*.

## Teknologi (Tech Stack)
- **Frontend Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (dengan custom CSS tokens)
- **Icons:** Lucide React
- **Router:** React Router v6
- **Database / Backend:** Supabase + PostgreSQL (Dalam tahap integrasi)

## Karakteristik Aplikasi
1. **Pemisahan Workspace:** Pengguna dapat dengan tegas memisahkan keuangan **Pribadi 🏠** dan **Bisnis 💼** dalam satu akun tanpa tercampur.
2. **Mobile-First UX:** Dirancang secara native untuk ukuran layar HP (375px - 412px) dengan bottom navigation yang ergonomis, tanpa mengorbankan fungsionalitas di desktop (adaptive sidebar).
3. **Neo-Brutalism Design:** Menggunakan identitas visual kuat berupa warm-cream background, border hitam tebal, hard shadow, serta aksen warna lime green dan hot pink.
4. **Clean Finance:** Meski visualnya playful, tata letak dan hierarki tipografi dijaga ketat agar aplikasi tetap terlihat profesional untuk mencatat angka uang dan membaca laporan.

## Memulai Proyek (Getting Started)

### Kebutuhan Sistem
- Node.js (Versi 18 atau lebih baru)
- NPM atau Yarn

### Instalasi
1. Clone repositori ini.
2. Masuk ke direktori project:
   ```bash
   cd MoneyTracking
   ```
3. Instal dependencies:
   ```bash
   npm install
   ```
4. Jalankan *development server*:
   ```bash
   npm run dev
   ```
5. Akses aplikasi melalui `http://localhost:5173`.

## Panduan Dokumentasi
Project ini dilengkapi dengan dokumentasi ekstensif untuk mempermudah Developer Pemula melanjutkan pengembangan. Semua dokumen berada di dalam folder `docs/`:

- [DEVELOPMENT_GUIDE.md](./docs/DEVELOPMENT_GUIDE.md) — Panduan dasar cara modifikasi komponen dan membuat halaman.
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Penjelasan struktur folder dan alur data React.
- [UI_DESIGN_SYSTEM.md](./docs/UI_DESIGN_SYSTEM.md) — Aturan warna, tipografi, padding, dan styling Neo-Brutalist.
- [OLD_PROJECT_ANALYSIS.md](./docs/OLD_PROJECT_ANALYSIS.md) — Alasan mengapa kita pindah dari Vanilla JS ke React.
- [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) — Rencana tabel relasional di database.
- [SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) — Langkah mengaktifkan backend cloud dan authentication.

## Fitur Utama
- [x] Dashboard & Ringkasan Saldo
- [x] Pencatatan Transaksi (Pemasukan, Pengeluaran, Transfer)
- [x] Manajemen Kategori (Bawaan & Kustom)
- [x] Manajemen Akun / Dompet
- [x] Workspace Pribadi vs Bisnis
- [ ] Anggaran (Budgeting) (Dalam pengerjaan)
- [ ] Manajemen Pelanggan (Bisnis) (Dalam pengerjaan)
- [ ] Laporan & Grafik (Dalam pengerjaan)
- [ ] Sistem Donasi & Leaderboard (Dalam pengerjaan)

## Lisensi
MoneyTracking adalah software *Free & Open Source* untuk pengguna, didukung secara opsional melalui donasi sukarela.
