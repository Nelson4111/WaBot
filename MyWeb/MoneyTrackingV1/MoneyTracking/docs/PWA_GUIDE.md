# PWA Readiness Guide

Dokumen ini menjelaskan strategi untuk menjadikan MoneyTracking V1 sebagai Progressive Web App (PWA). Implementasi PWA akan dilakukan pada fase lanjutan, namun fondasinya disiapkan dari awal.

## 1. Persyaratan PWA Dasar

Untuk memenuhi standar PWA yang dapat diinstal (installable), MoneyTracking V1 akan memiliki komponen berikut:

- **Web App Manifest (`manifest.json`)**: Berisi nama aplikasi, short name, warna tema, warna background, orientasi, dan array ikon (192x192, 512x512).
- **Service Worker**: Script yang berjalan di background untuk manajemen cache dan dukungan *offline*.
- **HTTPS**: Wajib disajikan melalui jaringan aman (di-handle oleh Supabase/Vercel/hosting).
- **Maskable Icons**: Ikon yang mendukung format maskable agar tampil optimal di berbagai launcher Android.

## 2. Tema & Viewport (Mobile-First)

Konfigurasi `<head>` di `index.html` harus mencakup:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#fcfbf7"> <!-- Warm cream background -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
```

- **Safe Area**: CSS environment variables `env(safe-area-inset-*)` harus digunakan di App Shell (khususnya Header dan Bottom Navigation) untuk menghindari tabrakan dengan notch atau indikator home di iOS/Android.

## 3. Responsif & UX

- Desain diprioritaskan untuk layar berukuran `375px`, `390px`, dan `412px`.
- Interaksi sentuh (touch targets) minimum `44x44px` untuk tombol dan navigasi.
- Menonaktifkan pinch-to-zoom ganda (`touch-action: manipulation;`) pada tombol untuk mencegah zoom tidak sengaja saat interaksi cepat.
- Tidak boleh ada konten normal yang menempel langsung ke layar, gunakan variabel padding:
  - Mobile: `16px`
  - Tablet: `24px`
  - Desktop: `32px`

## 4. Indikator Konektivitas (PWA Awal)

Pada tahap V1, kita belum membangun fungsionalitas offline penuh (Offline-First). Namun, aplikasi harus mampu secara elegan (graceful) menangani hilangnya koneksi:

1. **Deteksi Offline**: Gunakan event listener `online` dan `offline` di Window.
2. **Offline Banner**: Tampilkan banner peringatan (misalnya di atas header) saat koneksi terputus: *"Anda sedang offline. Beberapa fitur mungkin tidak berfungsi."*
3. **Pencegahan Error Palsu**: Cegah user melakukan submit form (misal: Tambah Transaksi) saat koneksi terputus agar data tidak lenyap. Tombol "Simpan" harus didisable sementara atau memberikan alert yang jelas.

## 5. Rencana Instalasi PWA

- PWA akan menampilkan prompt "Install App" (A2HS - Add to Home Screen) jika syarat teknis terpenuhi.
- Tombol custom "Install App" dapat disediakan di halaman Settings untuk memudahkan pengguna iOS yang harus menambahkan PWA secara manual via menu browser (Share -> Add to Home Screen).
