# UI Design System: Neo-Brutalism Finance

Sistem desain MoneyTracking V1 menggabungkan estetika **Neo-Brutalism** (bold, playful, kontrast tinggi) dengan fungsionalitas aplikasi keuangan yang bersih (**Clean Finance UX**). Dokumen ini adalah acuan agar desain tetap konsisten ketika Anda menambah halaman atau komponen baru di masa depan.

## 1. Warna Utama (Colors)

Gunakan variabel CSS (ditulis di `index.css`) atau Tailwind utility class berikut:

| Peran | Warna / Hex | Tailwind Class | Keterangan |
|---|---|---|---|
| **Background** | Warm Cream (`#F5F5E8`) | `bg-[#F5F5E8]` | Warna dasar semua halaman. Jangan gunakan putih bersih untuk background utama. |
| **Primary** | Lime Green (`#AADD00`) | `bg-[#AADD00]` | Aksi utama, tombol positif, income. |
| **Secondary** | Hot Pink (`#FF4D8D`) | `bg-[#FF4D8D]` | Aksi sekunder, badge peringatan, expense. |
| **Borders** | Solid Black (`#111111`) | `border-[#111111]` | Digunakan di hampir semua elemen UI. |
| **Surface** | White (`#FFFFFF`) | `bg-white` | Latar belakang untuk Card dan Modal. |

## 2. Tipografi (Typography)

Kita menggunakan font **Inter** untuk keterbacaan (readability) maksimal, khas aplikasi finance.

- **Page Title:** `24px - 28px`, font-weight: `extrabold` (Tailwind: `text-2xl font-extrabold`)
- **Section Heading:** `18px - 20px`, font-weight: `bold` (Tailwind: `text-lg font-bold`)
- **Body Text:** `14px - 16px`, font-weight: `medium` (Tailwind: `text-sm font-medium`)
- **Secondary Text (Muted):** `12px`, font-weight: `medium`, warna `#666666` (Tailwind: `text-xs text-[#666]`)
- **Nominal Uang Besar:** `30px - 36px`, font-weight: `extrabold` (Tailwind: `text-3xl font-extrabold`)

## 3. Gaya Elemen Brutalist (Borders & Shadows)

Elemen terpenting dari desain ini adalah border hitam yang tegas dan bayangan (shadow) yang **hard** (tidak nge-blur).

### Borders
- Gunakan border setebal `2px` (`border-2 border-black`) untuk elemen kecil (tombol, input).
- Gunakan border `3px` (`border-[3px] border-black`) untuk elemen besar/hero (misal: Card Saldo).

### Hard Shadows
- **Card biasa / Button:** `box-shadow: 4px 4px 0px #111111` (Tailwind: `shadow-[4px_4px_0px_#111]`)
- **Card besar / Modal:** `box-shadow: 6px 6px 0px #111111` (Tailwind: `shadow-[6px_6px_0px_#111]`)
- **Hover/Active State:** Saat tombol ditekan, tombol harus "turun" menghapus bayangan. 
  Contoh Tailwind: `active:translate-x-1 active:translate-y-1 active:shadow-none`

## 4. Spacing (Pola Jarak)

Terapkan spasi yang nyaman (tidak terlalu padat). Pendekatan Tailwind spacing:
- **Mobile Page Padding (Kiri/Kanan):** `16px` (`px-4`)
- **Jarak antar bagian (Section Gap):** `20px - 24px` (`space-y-5` atau `mb-6`)
- **Padding dalam Card:** `16px - 20px` (`p-4` atau `p-5`)
- **Padding Bottom Aplikasi:** Selalu tambahkan padding ekstra di paling bawah (sekitar `80px`) agar list transaksi terakhir tidak tertutup oleh *Bottom Navigation*.

## 5. Aturan yang TIDAK BOLEH Dilakukan (Don'ts)
- ❌ Jangan gunakan *Glassmorphism* (blur/transparan).
- ❌ Jangan gunakan *Soft Shadow* (bayangan abu-abu nge-blur standar).
- ❌ Jangan membuat tombol berbentuk *Pill* yang melengkung penuh, kecuali untuk badge kecil (Gunakan `rounded-lg` atau `rounded-xl`).
- ❌ Jangan gunakan warna gradasi (Gradient) berlebihan.
- ❌ Jangan membuat ukuran teks heading (h1/h2) terlalu raksasa di tampilan mobile.
- ❌ Jangan sampai ada elemen yang melebar ke kanan (Horizontal Overflow) hingga layar bisa di-scroll ke samping.

## 6. UX States (Wajib Ada)
Setiap komponen yang menampilkan data harus mempertimbangkan 6 status:
1. **Loading** (Skeleton loading / animasi spinner kotak)
2. **Empty** (Card putih dengan icon lucu dan tulisan "Belum ada data")
3. **Success** (Toast hijau atau tombol berubah centang)
4. **Error** (Toast merah)
5. **Disabled** (Tombol warna abu-abu, tidak bisa ditekan)
6. **Normal** (State default)
