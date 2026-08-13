# Old MoneyTracking Project Map

Dokumen ini memetakan struktur, fitur, dan fungsionalitas dari proyek MoneyTracking lama (Vanilla JS/Apps Script) yang berlokasi di `C:\Users\aqana\Documents\Projects\MyWeb\MoneyTracking`. Pemetaan ini digunakan sebagai *Source of Truth* agar tidak ada fitur atau alur pengguna yang tertinggal saat migrasi ke V1.

## 1. Application Structure (App Shell)
- **Top Navigation (`#topNav`)**: 
  - Kiri: Tombol Hamburger (Sidebar toggle), Logo & Nama Brand.
  - Kanan: Tombol Tema (Light/Dark), Area Avatar Profil (menampilkan avatar, indikator status, nama, dan role).
  - Interaksi: Mengklik avatar membuka `Profile Dropdown`.
- **Sidebar (`#sidebar`)**:
  - Desktop/Tablet: Bisa di-toggle antara mode normal dan *compact*.
  - Mobile: Muncul sebagai *off-canvas* overlay.
  - Berisi daftar menu navigasi penuh (dikontrol berdasarkan role user).
- **Bottom Navigation (`#bottomNav`)**:
  - Tampil hanya di perangkat mobile.
  - Menu: Home, Transaksi, FAB (Floating Action Button) "+" yang menonjol di tengah, Akun, dan "Lainnya" (Membuka Bottom Drawer).
- **Bottom More Drawer (`#bottomMoreDrawer`)**:
  - Muncul dari bawah saat "Lainnya" ditekan di Bottom Nav.
  - Berisi menu-menu tambahan yang tidak muat di Bottom Nav (Kategori, Laporan, Budget, dll).
- **Global UI Elements**:
  - Banners: `SubscriptionBanner` (Peringatan langganan habis), `ReadOnlyBanner` (Peringatan mode akses terbatas).
  - Modal: `GlobalModal` untuk semua pop-up detail dan form (Add/Edit).
  - Toasts: `ToastContainer` untuk notifikasi sukses/error.
  - Floating Music Fab: Tombol pemutar musik BGM melayang.
  - Pull-to-Refresh: Implementasi custom touch-move untuk refresh halaman di mobile.

## 2. Profile Dropdown & Settings
Terdapat di menu dropdown saat avatar diklik.
- **Informasi Akun**: Menampilkan Nama, Username, Email, No WA, Role, Status, Langganan, Tanggal dibuat, dan form Upload Foto Profil & Edit Nama.
- **Keamanan**: Status sesi login dan form ganti password.
- **Pengaturan**: 
  - Toggle Mode Gelap/Terang.
  - Color Picker untuk Warna Aksen (Lime, Cyan, Purple, dll).
  - Toggle Musik.
- **Bantuan**: Tombol redirect ke WhatsApp Admin.
- **Logout**: Mengakhiri sesi.

## 3. Fitur per Halaman

### Dashboard (`dashboard`)
- **Fungsi**: Halaman utama ringkasan finansial.
- **Komponen**:
  - Header: Judul & Tombol Refresh.
  - Summary Cards: Total Saldo, Pemasukan (Berdasarkan filter periode), Pengeluaran, Sisa Bersih.
  - Filter Periode: Dropdown (7 Hari, 1 Bulan, 6 Bulan, 1 Tahun, Semua).
  - Charts: Trend Keuangan (Line chart Pemasukan vs Pengeluaran), Pribadi vs Bisnis (Bar chart), Top Pengeluaran (Doughnut), Top Pemasukan (Doughnut).
  - Daftar Akun Aktif: Menampilkan list akun beserta saldo saat ini dan indikator warna.
  - Transaksi Terbaru: List mini transaksi terakhir dengan tombol "Lihat Semua".

### Transaksi (`transaksi`)
- **Fungsi**: Melihat, mencari, memfilter, menambah, dan menghapus riwayat transaksi.
- **Komponen**:
  - Header: Tombol Tambah Transaksi, Tombol Refresh.
  - Summary Cards (Opsional/Desktop): Ringkasan khusus berdasarkan hasil filter.
  - Filter Bar: Input pencarian (Search), Dropdown Periode, Bulan, Tahun, dan Jenis (Pemasukan/Pengeluaran/Transfer).
  - List Transaksi: Dikelompokkan per tanggal. Tiap item memiliki warna berdasarkan tipe (Hijau = Masuk, Merah = Keluar, Biru/Neon = Transfer). Mendukung mode Pribadi vs Bisnis.
  - Modal Detail Transaksi: Muncul saat item diklik. Menampilkan informasi detail, rincian biaya admin (jika ada), serta tombol Edit dan Hapus (kecuali mode ReadOnly).

### Akun & Saldo (`akun`)
- **Fungsi**: Manajemen dompet/rekening (Account).
- **Ekspektasi V1**: Menampilkan daftar akun, saldo per akun, fitur tambah/edit akun, dan riwayat mutasi per akun.

### Kategori (`kategori`)
- **Fungsi**: Manajemen kategori pemasukan & pengeluaran.
- **Ekspektasi V1**: List kategori, icon kategori, warna, dan kemampuan CRUD kategori.

### Laporan (`laporan`)
- **Fungsi**: Analisis data dan cetak laporan (PDF/Print).
- **Komponen**: Modal Cetak Laporan (filter berdasar tampilan data, bulan, tahun, atau custom range tanggal), Ringkasan Data (Tabel pemasukan/pengeluaran).

### Budget (`budget`)
- **Fungsi**: Menentukan batas pengeluaran bulanan per kategori.
- **Ekspektasi V1**: Indikator progress bar untuk tiap kategori budget vs realisasi.

### Pelanggan (`pelanggan`)
- **Fungsi**: CRM mini untuk transaksi tipe 'Bisnis'.
- **Ekspektasi V1**: CRUD data pelanggan, riwayat transaksi pelanggan, dan pencatatan utang/piutang (jika ada).

### Pembayaran (`pembayaran`)
- **Fungsi**: Pencatatan piutang/pembayaran tagihan.
- **Ekspektasi V1**: Manajemen invoice atau pembayaran tertunda.

### Struk Manual (`strukmanual`)
- **Fungsi**: Membuat struk/invoice secara manual (generator struk).

### Admin Features (`botlog`, `adminsetting`, `kelolausers`, `settingweb`)
- **Fungsi**: Manajemen sistem untuk pengguna berstatus Admin.
- **Ekspektasi V1**: Log history bot WA, kelola data user, dan pengaturan web master.

## 4. Kesimpulan Refactor ke V1
**Semua fitur inti, navigasi, dan informasi di atas HARUS TERSEDIA atau diakomodasi di dalam struktur React V1**. App Shell di V1 harus mampu mereplikasi fungsi Sidebar, Top Nav, Profile Dropdown, dan Bottom Nav Drawer seperti di proyek lama. Halaman Transaksi di V1 harus lebih dari sekadar list statis, tetapi harus mendukung pencarian, filter komprehensif, pengelompokan tanggal, detail pop-up, dan pemisahan logika Pribadi/Bisnis sesuai *Source of Truth* ini.
