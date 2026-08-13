# Old Project vs V1 Comparison

Dokumen ini membandingkan fungsionalitas dan struktur dari proyek MoneyTracking lama dengan implementasi V1 saat ini, untuk mengidentifikasi fitur yang hilang (Missing) dan menentukan strategi selanjutnya.

## Tabel Komparasi

| Feature | Old Project | Current V1 | Keep | Refactor | Missing |
|---------|-------------|------------|------|----------|---------|
| **App Shell** | Struktur lengkap dengan Sidebar, Header, Bottom Nav, dan Global Modal | Terbatas, hanya Sidebar & Header dasar | ✅ | ✅ | Sebagian |
| **Header** | Memiliki tombol Hamburger, Tema, dan Avatar Profil interaktif | Hanya menampilkan judul halaman & back button | ✅ | ✅ | Avatar & Menu |
| **Navigation** | Routing internal berbasis JS, merender halaman ke `#pageContent` | Menggunakan `react-router-dom` | ✅ | ✅ | - |
| **Bottom Navigation** | Home, Transaksi, FAB (+), Akun, dan menu "Lainnya" | Home, Transaksi, FAB (+), Laporan, Setting | ✅ | ✅ | Menu Lainnya |
| **Sidebar** | Expand/Collapse, Hide di Mobile, Menu lengkap berdasarkan Role | Fixed lebar, tidak ada kontrol Role | ✅ | ✅ | Role & Collapse |
| **Profile** | Dropdown lengkap (Info, Keamanan, Pengaturan, Bantuan, Logout) | Tidak ada | ✅ | ✅ | ❌ MISSING |
| **Account Menu** | Navigasi khusus ke halaman manajemen Akun & Saldo | Belum tersedia rutenya | ✅ | ✅ | ❌ MISSING |
| **Settings** | Pengaturan Tema (Dark/Light), Warna Aksen, Musik | Rute ada tapi kosong / statis | ✅ | ✅ | ❌ MISSING |
| **Workspace** | Dibedakan melalui tipe transaksi (Pribadi/Bisnis) di backend | Konteks eksplisit (Pribadi/Bisnis switcher) | ✅ | ✅ | - |
| **Dashboard** | Ringkasan Saldo, Charts, Akun Aktif, Transaksi Terbaru | Saldo, Aksi Cepat, Transaksi (statis), Chart statis | ✅ | ✅ | Dinamisasi |
| **Transactions** | List dengan grouping, Filter kompleks, Detail pop-up | List sederhana, UI dasar | ✅ | ✅ | Fitur Filter |
| **Transaction filters**| Pencarian teks, Periode (Dropdown), Jenis (Masuk/Keluar/Transfer) | Tidak ada | ✅ | ✅ | ❌ MISSING |
| **Accounts** | Menampilkan saldo real-time per akun | Belum ada | ✅ | ✅ | ❌ MISSING |
| **Categories** | Manajemen kategori transaksi | Belum ada | ✅ | ✅ | ❌ MISSING |
| **Budget** | Limit pengeluaran bulanan per kategori | Belum ada | ✅ | ✅ | ❌ MISSING |
| **Customers** | Manajemen data pelanggan (CRM Mini) | Belum ada | ✅ | ✅ | ❌ MISSING |
| **Payments** | Pencatatan pembayaran tagihan/piutang | Belum ada | ✅ | ✅ | ❌ MISSING |
| **Reports** | Modal print laporan dengan rentang custom | Belum ada | ✅ | ✅ | ❌ MISSING |
| **Notifications** | Subscription Banner, ReadOnly Banner, Toasts | Hanya UI Toasts dasar | ✅ | ✅ | ❌ MISSING |
| **Donation** | Link donasi via WA/Banner | Ada Banner di Dashboard | ✅ | ✅ | - |
| **Admin** | Bot Log, Kelola Users, Web Setting | Belum ada | ✅ | ✅ | ❌ MISSING |
| **Responsive behavior**| Penuh (Mobile, Tablet, Desktop) dengan Breakpoint JS | Mulai Mobile-First, Tablet belum diuji | ✅ | ✅ | Tablet/Desktop |

## Analisis & Temuan
Dari perbandingan di atas, terlihat jelas bahwa **implementasi V1 sebelumnya terlalu menyederhanakan aplikasi (Oversimplified)**. Banyak elemen krusial seperti navigasi tambahan (Drawer), Profile Dropdown, manajemen Akun, dan sistem Filter Transaksi yang ditinggalkan dengan dalih "membersihkan UI".

### Langkah Perbaikan (Action Plan):
1. **Jangan mengurangi fungsionalitas**: V1 harus menjadi versi yang lebih baik, bukan lebih kecil.
2. **Prioritas App Shell**: Sebelum memperbaiki halaman tunggal seperti Transaksi, kita wajib mengembalikan App Shell secara utuh (Profile Dropdown, Sidebar yang bisa di-collapse, Bottom Drawer untuk menu ekstra).
3. **Peta Navigasi V1**: Memastikan tidak ada halaman 'mati' (Orphan page) yang tidak bisa diakses dari Navigasi.
4. **Modul Transaksi**: Membangun ulang halaman Transaksi agar memiliki arsitektur Filter yang sama ampunhnya dengan proyek lama.
