# Analisis Project Lama (MoneyTracking)

Dokumen ini berisi hasil audit teknis terhadap versi lama dari aplikasi MoneyTracking (`C:\Users\aqana\Documents\Projects\MyWeb\MoneyTracking`), sebelum migrasi ke versi V1 (React + TypeScript).

## 1. Ringkasan Project Lama
Project lama adalah aplikasi *single-page* monolitik yang dibangun menggunakan Vanilla JavaScript, HTML tunggal, dan CSS tunggal. Data disimpan pada variabel global dan backend mengandalkan Google Apps Script (`code.gs`) yang awalnya dirancang untuk bot WhatsApp. Aplikasi ini menangani pencatatan keuangan pribadi dan bisnis dengan konsep role-based access.

## 2. Struktur Folder Lama
Struktur folder sangat sederhana namun sulit di-maintain untuk skala besar:
```
├── index.html        (View tunggal, memuat semua elemen UI)
├── style.css         (Satu file raksasa untuk styling seluruh aplikasi)
├── script.js         (Vanilla JS raksasa, mengatur state, navigasi, dan logic)
├── code.gs           (Google Apps Script backend)
├── database.json     (Schema database bot, mencampur data chat dengan transaksi)
└── media files       (Video background, favicon, images)
```

## 3. Fitur yang Ditemukan
- **Authentication:** Sistem login sederhana dengan UI password "show/hide".
- **Navigation:** Top navbar, sidebar (desktop), bottom navigation (mobile).
- **Dashboard:** Statistik keuangan, "Aksi Cepat", transaksi terbaru.
- **Transaksi:** Pemasukan, Pengeluaran, Transfer, list per hari, fitur undo/redo struk.
- **Data Master:** Kelola Akun, Kategori, Pelanggan (untuk bisnis), Pembayaran.
- **Lainnya:** Laporan/Chart, Budgeting, Notifikasi login, Mode ReadOnly/Langganan.

## 4. Fitur yang Masih Relevan (Akan Dibawa ke V1)
- Pemisahan keuangan **Pribadi** dan **Bisnis** (Konsep Workspace).
- Kategori transaksi default (Income/Expense/Transfer) beserta ikon.
- Konsep Multi-akun (BCA, Kas, DANA, dll).
- Budgeting dan limit peringatan.
- Fitur pelacakan pelanggan dan invoice (khusus mode Bisnis).
- Notifikasi dan Announcement system.

## 5. Fitur yang Tidak Relevan (Akan Dihapus/Didesain Ulang)
- Video background malam/sore (Mempengaruhi performa, tidak sesuai gaya clean finance).
- Logika bot WhatsApp yang terlalu spesifik pada frontend (`menu.js`, `store-order-actions.js`).
- "Struk Manual" yang terlalu kompleks di tahap awal aplikasi finance modern.
- Music player background (Tidak standar untuk UX aplikasi finansial).

## 6. Masalah Arsitektur
- **Spaghetti Code:** Tidak ada pemisahan antara UI, state, dan business logic (`script.js` berisi fungsi DOM manipulation bercampur operasi data).
- **Tightly Coupled:** Perubahan kecil pada HTML memerlukan perubahan manual query selector di JS.
- **Routing Palsu:** Halaman berpindah hanya dengan `display: none` / `block`. Ini mematikan fungsi "Back" browser dan merusak history.

## 7. Masalah UI/UX
- Desain tidak konsisten antara komponen.
- Header dan beberapa elemen mengalami *horizontal overflow* pada mobile.
- Tombol yang saling berdempetan tanpa *touch target* yang nyaman.
- Hirarki tipografi kurang jelas (heading sama besar dengan page title).

## 8. Masalah Performance
- Memuat file JS/CSS yang besar sekaligus di awal (`script.js` ~300KB).
- DOM reflow yang berlebihan akibat manipulasi `innerHTML`.
- Penggunaan video *auto-play* sebagai background menguras baterai HP dan memori.

## 9. Masalah Security
- Tidak ada *client-side route guarding* yang benar-benar memblokir render UI admin untuk user biasa (elemen hanya di-*hide* via class `hidden`).
- *Token* dan status akses mudah dimanipulasi melalui browser developer tools.

## 10. Masalah Maintainability
- Sulit menambah fitur baru karena harus memodifikasi file berukuran ribuan baris.
- Sulit di-test karena dependensi pada DOM global.

## 11. Rekomendasi Architecture V1
Berdasarkan temuan di atas, arsitektur V1 akan menggunakan:
1. **React.js + TypeScript:** Untuk tipe data statis dan komponen UI terpisah.
2. **Vite:** Untuk build tool yang cepat dan module bundling modern.
3. **Tailwind CSS:** Untuk utility-first styling agar tidak ada lagi file CSS raksasa yang *dead code*.
4. **React Router:** Untuk navigasi berbasis URL yang sebenarnya.
5. **Component-Based:** Pemisahan `pages`, `components/ui`, `components/finance`, `features`, `lib`.
6. **Supabase (Future):** Sebagai pengganti Google Apps Script, memberikan auth dan RLS yang aman secara default.
