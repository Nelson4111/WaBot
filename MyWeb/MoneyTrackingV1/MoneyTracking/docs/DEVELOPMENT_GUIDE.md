# Panduan Pengembangan (Development Guide)

Selamat datang di kode sumber MoneyTracking! Panduan ini dirancang untuk developer pemula agar mudah memahami cara menjalankan, memodifikasi, dan menambah fitur baru pada aplikasi ini.

## Persiapan Awal (Menjalankan Project)
Pastikan Anda sudah menginstal **Node.js** di komputer Anda.

1. Buka terminal (Command Prompt/PowerShell/VSCode Terminal).
2. Arahkan ke folder project:
   ```bash
   cd C:\Users\aqana\Documents\Projects\MyWeb\MoneyTrackingV1\MoneyTracking
   ```
3. Instal semua dependensi:
   ```bash
   npm install
   ```
4. Jalankan aplikasi di mode *development* (untuk melihat hasil live):
   ```bash
   npm run dev
   ```
5. Buka browser dan akses `http://localhost:5173`.

## Build untuk Produksi
Jika aplikasi sudah siap dirilis, jalankan:
```bash
npm run build
```
Ini akan mengecilkan (minify) semua file dan menyimpannya di folder `dist/`.

---

## Memahami Struktur Folder

Semua kode yang akan sering Anda sentuh berada di dalam folder `src/`. Berikut panduannya:

- `src/components/ui/` = Di sini tempat tombol (`Button`), input (`Input`), dan kartu (`Card`). Komponen ini **tidak peduli** soal uang atau transaksi, mereka cuma "bentuk fisik" UI saja.
- `src/components/finance/` = Di sini komponen yang sudah tahu tentang keuangan. Contoh: `TransactionItem` (komponen untuk menampilkan 1 baris transaksi).
- `src/pages/` = Ini adalah Halaman utuh (misal: halaman Dashboard, halaman Login).
- `src/features/` = Di sini tempat logika aplikasi. Contoh: `WorkspaceContext.tsx` untuk mengatur apakah kita sedang di Workspace Pribadi atau Bisnis.
- `src/lib/` = Tempat file pembantu.
  - `types.ts` = Definisi bentuk data (TypeScript interfaces).
  - `mock-data.ts` = Data palsu untuk testing UI sebelum database asli (Supabase) dipasang.
  - `utils.ts` = Fungsi kecil seperti `formatCurrency` (untuk merubah angka 10000 jadi Rp10.000).

---

## Cara Menambah Halaman Baru

Misal Anda ingin membuat halaman "Daftar Hutang":
1. Buat file baru di `src/pages/HutangPage.tsx`.
2. Tulis struktur dasarnya:
   ```tsx
   import React from 'react';
   import { AppShell, Header } from '../components/layout/AppShell';

   export default function HutangPage() {
     return (
       <AppShell>
         <Header title="Daftar Hutang" showBack />
         <div className="px-4 py-4">
            {/* Isi konten Anda di sini */}
            <p>Halaman Hutang</p>
         </div>
       </AppShell>
     );
   }
   ```
3. Buka `src/App.tsx`, lalu tambahkan route (jalur) agar halaman bisa diakses:
   ```tsx
   import HutangPage from './pages/HutangPage';
   // ...
   <Route path="/hutang" element={<HutangPage />} />
   ```

## Cara Menambahkan Komponen

Misal Anda membuat tombol khusus:
1. Buat file di `src/components/ui/TombolSpesial.tsx`.
2. Gunakan *utility classes* Tailwind CSS untuk styling. Ikuti aturan desain Neo-Brutalism (ada di `UI_DESIGN_SYSTEM.md`).

## TypeScript untuk Pemula
Di TypeScript, kita harus memberi tahu komputer "bentuk" dari data. Jika ada error garis bawah merah di editor Anda, biasanya itu karena TypeScript tidak tahu data apa yang Anda maksud.
Buka `src/lib/types.ts` untuk melihat atau menambahkan bentuk data baru.

Contoh:
```tsx
// Jika Anda bikin variabel user:
const nama: string = "Budi";
const umur: number = 25;
```

Semangat coding! Jangan takut mencoba. Error di layar warna merah saat `npm run dev` adalah hal biasa, baca saja pesan errornya dengan tenang.
