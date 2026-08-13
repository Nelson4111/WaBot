# Offline Strategy

Dokumen ini menguraikan pendekatan penanganan konektivitas dan *Offline-First* di MoneyTracking V1. Sesuai instruksi desain, **V1 belum mengimplementasikan sinkronisasi *offline-first* secara penuh**, melainkan fokus pada deteksi keadaan *offline* yang *graceful*.

## 1. Strategi V1 Awal (Graceful Degradation)

Pada fase rilis V1, tujuan utama adalah melindungi data pengguna (mencegah kehilangan input saat terputus) dan memberikan *feedback* visual yang jelas saat status jaringan berubah.

- **Deteksi Koneksi**: 
  - Menggunakan Hook React kustom (`useNetworkStatus`) untuk memantau status `window.navigator.onLine` beserta *event listener* `online` dan `offline`.
- **UI & UX Offline**:
  - Saat offline terdeteksi, sebuah **Offline Banner** statis atau Toast peringatan muncul.
  - Komponen form (seperti *Add Transaction* atau *Edit Profile*) harus mendisable tombol Submit/Simpan sementara, atau mencegah aksi submit jika koneksi terputus.
- **Pencegahan Misleading Success**:
  - Hindari simulasi sukses ("Transaksi berhasil disimpan") jika data sebenarnya gagal dikirim ke backend Supabase akibat tidak adanya internet.

## 2. Rencana Masa Depan (Full Offline-First)

Ketika pengembangan memasuki tahap *Offline-First* penuh, kita akan menerapkan arsitektur berikut:

```text
Local Cache (IndexedDB/Redux Persist/PWA Cache)
    ↓
Offline Queue (Antrean aksi saat offline)
    ↓
Reconnect (Koneksi pulih)
    ↓
Sync (Kirim queue ke server)
    ↓
Conflict Resolution (Penyelesaian bentrokan data)
    ↓
Supabase (Update PostgreSQL & trigger Real-time subscription)
```

### 2.1 Mekanisme *Local Cache*
Data esensial (seperti saldo terakhir, daftar akun, dan daftar kategori) akan dicache menggunakan IndexedDB (misalnya via `localforage` atau `idb`). Ini memungkinkan aplikasi dibuka dan menavigasi halaman dasar tanpa koneksi internet sama sekali.

### 2.2 Mekanisme *Offline Queue*
Jika user menambah transaksi saat offline:
1. Transaksi disimpan di *Local Cache* dan UI diupdate secara optimis (Optimistic UI).
2. Aksi "Tambah Transaksi" disimpan sebagai instruksi JSON di dalam *Offline Queue*.
3. Background Service Worker atau Sync Engine akan memantau kembalinya koneksi dan mengeksekusi antrean secara sekuensial.

### 2.3 Mekanisme *Conflict Resolution*
Penyelesaian konflik dapat terjadi jika data dimodifikasi dari perangkat lain. Strategi umum:
- *Last Write Wins* berdasarkan *timestamp*.
- User prompt jika terjadi perubahan kritis (mis. nama akun diubah).
