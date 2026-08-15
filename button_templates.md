# 🚀 Panduan & Template Tombol Interaktif (Baileys)

File ini berisi template kode siap pakai untuk membuat berbagai macam tombol interaktif (Native Flow) di script Baileys kamu. Kamu tinggal _copy-paste_ ke dalam file plugin yang diinginkan.

---

## 1. Template: Tombol Biasa (Quick Reply)
Gunakan ini jika kamu hanya butuh memunculkan 1 sampai 3 tombol biasa (teks sederhana).

> [!NOTE]
> Maksimal tombol yang diizinkan oleh WhatsApp adalah 3 tombol.

```javascript
let buttons = [
    ["Teks Tombol 1", ".perintah1"],
    ["Teks Tombol 2", ".perintah2"]
]
// Format: conn.sendButton(jid, teks_utama, footer, daftar_tombol, pesan_kutipan)
await conn.sendButton(m.chat, "Pesan utama di sini", "Footer pesan", buttons, null)
```

---

## 2. Template: List Menu (Dropdown)
Gunakan ini jika kamu punya banyak menu (lebih dari 3 opsi). List menu akan memunculkan menu model pop-up/bottom-sheet.

```javascript
let sections = [
    {
        title: "Kategori 1",
        rows: [
            { title: "Opsi 1", id: ".perintah1", description: "Deskripsi opsi 1" },
            { title: "Opsi 2", id: ".perintah2", description: "Deskripsi opsi 2" }
        ]
    },
    {
        title: "Kategori 2",
        rows: [
            { title: "Opsi 3", id: ".perintah3", description: "Deskripsi opsi 3" }
        ]
    }
]

// HACK: Hindari blokir anti-spam WA dengan delay sebentar sebelum memunculkan menu
await new Promise(resolve => setTimeout(resolve, 1500))

// Format: conn.sendList(jid, judul, teks_utama, footer, nama_tombol_list, daftar_sections, pesan_kutipan, opsi_tambahan)
await conn.sendList(
    m.chat, 
    "Judul List", 
    "Silakan pilih menu di bawah ini", 
    "Footer teks", 
    "Buka Daftar Menu", 
    sections, 
    null,
    {
        contextInfo: { isForwarded: true, forwardingScore: 1 } // Trik bypass deteksi spam
    }
)
```

---

## 3. Template: Gabungan (List + Tombol) + Gambar/Video
Gunakan ini jika kamu ingin membuat pesan canggih yang punya **Gambar/Video + Tombol List + Tombol Biasa** sekaligus! 
_(Ini mirip dengan yang kita pakai di `menu.js` utama)_

> [!IMPORTANT]
> Jangan lupa import `generateWAMessageFromContent` dan `prepareWAMessageMedia` dari Baileys di atas file plugin-mu.

```javascript
const { generateWAMessageFromContent, prepareWAMessageMedia } = (await import('@whiskeysockets/baileys')).default

// 1. Siapkan Media (Bisa berupa URL gambar atau video)
// Ganti { video: { url: ... } } menjadi { image: { url: ... } } jika ingin gambar
const media = await prepareWAMessageMedia({ 
    video: { url: "https://link-video.mp4" }, 
    gifPlayback: true 
}, { upload: conn.waUploadToServer })

// 2. Siapkan isi List Menu
let menuRows = [
    { title: "Pilihan 1", id: ".perintah1", description: "Klik untuk pilihan 1" },
    { title: "Pilihan 2", id: ".perintah2", description: "Klik untuk pilihan 2" }
]

// 3. Bangun Pesan Interaktif
const interactiveMessage = {
    body: { text: "Halo, ini teks utama pesan gabungan." },
    footer: { text: "Teks footer di bawah" },
    header: {
        title: "Judul Atas",
        hasMediaAttachment: true,
        videoMessage: media.videoMessage // Ubah ke imageMessage jika gambar
    },
    contextInfo: {
        isForwarded: true,
        forwardingScore: 1
    },
    nativeFlowMessage: {
        buttons: [
            // Tombol 1: Tipe List Menu
            {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                    title: "Buka List Menu ⎙",
                    sections: [{ title: "Daftar Menu", rows: menuRows }]
                })
            },
            // Tombol 2: Tipe Quick Reply (Tombol Biasa)
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "Ping 📶",
                    id: ".ping"
                })
            }
        ]
    }
}

// 4. Bungkus dalam ViewOnce (Wajib untuk UI modern)
const msg = await generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
        message: {
            messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
            },
            interactiveMessage
        }
    }
}, { quoted: null }) // Quoted null agar tidak spam-blocked

// 5. Kirim pesannya!
await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
```
