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

---

## 4. Template: Classic ViewOnce ButtonV2 (Struk Statistik ala Bot Yuki & Location Header)
Format tombol kotak tegas klasik (`buttonsMessage`) yang dibungkus dalam protokol ViewOnce. Menggunakan header `locationMessage` (`headerType: 6`) untuk menampilkan **Judul Tebal (Title)**, **Sub-judul (Address)**, dan **Thumbnail Gambar**, diikuti oleh teks pesan dan tombol respon. Format ini sangat stabil di WhatsApp Android, iOS, maupun WA Web.

### A. Format Menu Sambutan & Hybrid ButtonV2 + Native Flow (100% Identik Bot Yuki - Rahasia Terbongkar!)
*Hasil Analisis & Implementasi Protobuf Live:*
- Menggunakan `ButtonV2` dari library `@rexxhayanasi/elaina-baileys`.
- **Visual:** Dirender oleh WhatsApp sebagai **tombol pil solid hijau menyatu rapi di dasar gelembung** tanpa icon garis list (`:≡`) dan tanpa panah dropdown (`▾`).
- **Aksi (Native Flow):** Disuntikkan `nativeFlowInfo` bertipe `single_select` ke dalam tombol tersebut, dibungkus stanza `biz: { interactive: { type: 'native_flow', v: '1' } }`.
- **Saat Ditekan:** Layar HP user **LANGSUNG MEMBUKA POP-UP MODAL BOTTOM SHEET (27 KATEGORI)** tanpa mengirim pesan balasan apa pun ke chat room!

```javascript
const btn = new conn.ButtonV2(conn)
btn.setTitle("⛩️ ʜᴏꜱʜɪɴᴏ-ᴅᴇꜱᴜ")
btn.setSubtitle("ᴋᴀɪ ᴅᴇꜱᴜ • ꜱʏꜱᴛᴇᴍ ᴍᴇɴᴜ")
btn.setBody(yukiText)
btn.setFooter("ʜᴏꜱʜɪɴᴏ-ᴅᴇꜱᴜ")

let avatar = await conn.profilePictureUrl(m.sender, 'image').catch(() => null)
if (avatar) btn.setThumbnail(avatar)

btn.addRawButton({
    buttonId: 'menu_select',
    buttonText: { displayText: 'ᴘɪʟɪʜ ᴍᴇɴᴜ' },
    type: 1,
    nativeFlowInfo: {
        name: 'single_select',
        paramsJson: JSON.stringify({
            title: 'PILIH KATEGORI',
            sections: [
                {
                    title: 'TOTAL 27 KATEGORI',
                    highlight_label: 'KATEGORI',
                    rows: categories.map(cat => ({
                        header: '',
                        title: cat.title,
                        description: cat.desc,
                        id: cat.id
                    }))
                }
            ]
        })
    }
})

await btn.send(m.chat)
```
   ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴍʏ ᴡᴏʀʟᴅ ✨

*╭  〔 👤 ᴜ ꜱ ᴇ ʀ 〕*
*┆* ɴᴀᴍᴀ    : *ɴᴇɴᴇʟ*
*┆* ʟᴇᴠᴇʟ   : *𝟷 (ʀᴏᴏᴋɪᴇ)*
*┆* ʀᴏʟᴇ    : *ɴᴇᴡʙɪᴇ ㋡*
*┆* ʟɪᴍɪᴛ   : *𝟷𝟿*
*┆* ᴇxᴘ     : *𝟼𝟹𝟺𝟸 / 𝟷𝟾𝟾*
*┆* xᴘ𝟺ʟᴠ   : *ꜱɪᴀᴘ ᴜɴᴛᴜᴋ .ʟᴇᴠᴇʟᴜᴘ*
*╰───────────────*

*╭  〔 ⚙️ ꜱ ʏ ꜱ ᴛ ᴇ ᴍ 〕*
*┆* ᴜᴘᴛɪᴍᴇ      : *𝟶𝟷:𝟷𝟸:𝟻𝟽*
*┆* ᴛᴀɴɢɢᴀʟ     : *𝟺 ꜱᴇᴘᴛᴇᴍʙᴇʀ 𝟸𝟶𝟸𝟼*
*┆* ᴅᴀᴛᴀʙᴀꜱᴇ    : *𝟷𝟶𝟶 / 𝟷𝟷𝟼𝟼*
*┆* ᴛᴏᴛᴀʟ ꜰɪᴛᴜʀ : *𝟽𝟻𝟷*
*╰───────────────*

*╭  〔  📌  ɴᴏᴛᴇ  〕*
*┆* Ⓟ = ᴘʀᴇᴍɪᴜᴍ   Ⓛ = ʟɪᴍɪᴛ
*╰───────────────*

   ｡˚ ⊹ *ᴛᴀᴘ ᴛᴏᴍʙᴏʟ ᴅɪ ʙᴀᴡᴀʜ* ⊹ ˚ ｡
✨ *ᴜɴᴛᴜᴋ ᴘɪʟɪʜ ᴋᴀᴛᴇɢᴏʀɪ ᴍᴇɴᴜ* ✨`

const buttons = [
    ["ᴘɪʟɪʜ ᴍᴇɴᴜ", ".allmenu"]
]

// Kirim dengan conn.sendButtonV2
await conn.sendButtonV2(m.chat, {
    title,
    subtitle,
    text: yukiText,
    footer,
    buffer: null, // null agar tidak muncul pin Google Maps!
    buttons
}, m)
```

### B. Format Struk Statistik (Gambar 2 / 2 Tombol Progres & Sisa)
```javascript
const title = "⛩️ MY STATISTICS"
const subtitle = "Hoshino-Desu"
const text = `👤 *+62 812-4243-2747*　「🔥 Streak : 0」
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
  🧾 *STRUK STATISTIK*
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
📊 Total Pesan........ *66*
🎯 Target Menuju...... *5.000*
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

  ⌈ Ｐｒｏｇｒｅｓ ⌋　　  ⌈ Ｓｉｓａ ⌋`
const footer = "HOSHINO X KAI"
const buttons = [
    ["𖤐 1%", ".ping"],
    ["𖤐 4.934", ".allmenu"]
]

// Kirim dengan conn.sendButtonV2
await conn.sendButtonV2(m.chat, {
    title,
    subtitle,
    text,
    footer,
    buffer: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80", // thumbnail / avatar
    buttons
}, m)
```

### B. Format Menu Dashboard (Title + Subtitle + 3 Tombol)
```javascript
await conn.sendButtonV2(m.chat, {
    title: "📜 MAIN MENU DASHBOARD",
    subtitle: "Avelia • Active Online 24/7",
    text: "Halo kak! Pilih menu navigasi cepat di bawah ini:",
    footer: "Avelia v4.0.0",
    buttons: [
        ["⚡ Speedtest", ".ping"],
        ["📋 Semua Menu", ".allmenu"],
        ["👑 Info Owner", ".owner"]
    ]
}, m)
```

### C. Format Clean Header (Title + Subtitle tanpa Gambar)
```javascript
await conn.sendButtonV2(m.chat, {
    title: "🔔 PEMBERITAHUAN PENTING",
    subtitle: "Avelia Notification Service",
    text: "Pesan teks bersih tanpa thumbnail gambar, sangat ringan dan cepat dimuat.",
    footer: "Avelia System Notice",
    buttons: [
        ["✅ Konfirmasi", ".ping"],
        ["🔙 Batal", ".menu"]
    ]
}, m)
```

### D. Format Media Header (Gambar / Dokumen)
```javascript
// 1. Header Gambar Penuh:
await conn.sendButtonV2(m.chat, {
    text: "Pesan dengan banner gambar di bagian atas.",
    footer: "Avelia Image Header",
    media: {
        headerType: 1,
        imageMessage: {
            url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
            mimetype: "image/jpeg"
        }
    },
    buttons: [
        ["👍 Suka", ".ping"],
        ["📋 Menu", ".menu"]
    ]
}, m)

// 2. Header Dokumen PDF:
await conn.sendButtonV2(m.chat, {
    text: "Pesan dengan lampiran kartu dokumen PDF.",
    footer: "Avelia Document Card",
    media: {
        headerType: 3,
        documentMessage: {
            url: "https://example.com/laporan.pdf",
            mimetype: "application/pdf",
            title: "Laporan.pdf",
            fileName: "Laporan.pdf",
            pageCount: 1
        }
    },
    buttons: [
        ["📂 Download", ".ping"],
        ["ℹ️ Info", ".owner"]
    ]
}, m)
```

### E. Format Pop-up List Menu Bersih ala Bot Yuki (Single Select Bottom Sheet + Banner Header)
Format menu sambutan lengkap dengan header gambar, teks estetik, dan tombol pop-up list (*Single Select*) resmi WhatsApp. Saat tombol `[ PILIH MENU ]` ditekan di HP, **TIDAK MENGIRIM PESAN REPLY APAPUN KE CHAT**, melainkan langsung memunculkan **bottom sheet pop-up modal 27 Kategori** lengkap dengan radio button dan tombol `[ Pilih ]`:

```javascript
const btn = new conn.Button(conn)

// 1. Header Banner/Avatar + Judul & Sub-judul
btn.setImage(avatarBufferOrUrl)
btn.setTitle("⛩️ ʜᴏꜱʜɪɴᴏ-ᴅᴇꜱᴜ")
btn.setSubtitle("ᴋᴀɪ ᴅᴇꜱᴜ • ꜱʏꜱᴛᴇᴍ ᴍᴇɴᴜ")

// 2. Teks Sambutan & Footer
btn.setBody(yukiText)
btn.setFooter("ʜᴏꜱʜɪɴᴏ-ᴅᴇꜱᴜ")

// 3. Tombol List Menu Pop-up
btn.addSelection("PILIH MENU")
btn.makeSection("TOTAL 27 KATEGORI", "KATEGORI")

// 4. Masukkan baris kategori (persis seperti Bot Yuki)
const categories = [
    { title: 'Absen', desc: '8 command', id: '.menu absen' },
    { title: 'Ai', desc: '12 command', id: '.menu ai' },
    { title: 'Anime', desc: '72 command', id: '.menu anime' },
    { title: 'Audio', desc: '5 command', id: '.menu audio' },
    { title: 'Clan', desc: '26 command', id: '.menu clan' },
    { title: 'Database', desc: '5 command', id: '.menu database' },
    { title: 'Demo', desc: '14 command', id: '.menu demo' },
    { title: 'Downloader', desc: '36 command', id: '.menu downloader' },
    { title: 'Fun', desc: '35 command', id: '.menu fun' },
    { title: 'Game', desc: '28 command', id: '.menu game' },
    // ... total 27 kategori
]

for (const cat of categories) {
    btn.makeRow('', cat.title, cat.desc, cat.id)
}

if (m) {
    btn.setContextInfo({
        stanzaId: m.key?.id,
        participant: m.sender,
        quotedMessage: m.message
    })
}

await btn.send(m.chat)
```

---

## 5. Template: Dual-Visibility Group Button (Targeted User ala Bot Yuki Akinator)
Format pesan grup dengan visibilitas ganda (Dual-Visibility):
- **Pemain target**: Menerima tombol interaktif asli (Native Flow) yang bisa diklik.
- **Penonton lain di grup**: Menerima teks pesan biasa bergembok (`🔒 ᴛᴏᴍʙᴏʟ ᴊᴀᴡᴀʙᴀɴ ʜᴀɴʏᴀ ᴍᴜɴᴄᴜʟ ᴜɴᴛᴜᴋ ᴘᴇᴍᴀɪɴ`).
- Keduanya dikirim dalam **satu stanza pesan grup yang sama** menggunakan arsitektur _Isolated Sender Key_ (`sendDualGroupMessage`).

```javascript
import { sendDualGroupMessage } from './lib/dual-group-message.js'

const targetJid = m.mentionedJid?.[0] || m.sender
const targetNumber = targetJid.split('@')[0]

// 1. Siapkan Tombol Interaktif untuk Pemain
const btn = new conn.Button(conn)
btn.setBody(`❓ *Pertanyaan:*\nApakah dia tinggal di Indonesia?`)
btn.setFooter(`🧞 Akinator`)
btn.addButton(`✅ Ya`, `.akians ya|${targetNumber}`)
btn.addButton(`❌ Tidak`, `.akians tidak|${targetNumber}`)
btn.addButton(`🤷 Tidak Tahu`, `.akians idk|${targetNumber}`)
const built = await btn.build(m.chat)

// 2. Siapkan Teks Gembok untuk Penonton
const spectatorText = `❓ *Pertanyaan:*\nApakah dia tinggal di Indonesia?\n\n> 🔒 ᴛᴏᴍʙᴏʟ ᴊᴀᴡᴀʙᴀɴ ʜᴀɴʏᴀ ᴍᴜɴᴄᴜʟ ᴜɴᴛᴜᴋ ᴘᴇᴍᴀɪɴ`

// 3. Kirim ke grup dengan visibilitas ganda!
await sendDualGroupMessage(conn, m.chat, targetJid, built.message, spectatorText, {
    quoted: m
})
```
