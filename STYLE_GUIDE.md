# ✦ Avelia Design System & Style Guide
> **Theme:** *Zen Shinto / Celestial Japanese Aesthetic (Minimalist, Varied Icons & Clean)*  
> **Target Platform:** WhatsApp Multi-Device (Android, iOS, Web & Desktop)

Dokumen ini adalah panduan resmi format teks dan visual untuk **Avelia**. Gunakan template dan aturan di dokumen ini saat membuat plugin, fitur, atau pesan bot baru agar seluruh teks konsisten, rapi, modern, variatif, dan tidak monoton.

---

## ✦ 1. Aturan Dasar Desain (Design Principles)

1. **Variasi Simbol & Ikon Estetik (Biar Tidak Polos & Monoton)**:
   Hindari menumpuk emoji kartun warna-warni yang ramai (seperti 👤, ⚙️, 📌, 💔, 📋, 👑). Namun, **jangan juga hanya mengulang 1 simbol saja (misal `✦` di setiap baris)**. Gunakan palet simbol Unicode yang variatif dan harmonis sesuai konteksnya:
   - **Profil / Pengguna**: `𝜚` (aksen pita/profil), `ᰔ` / `♡` (pasangan/cinta), `﹫` (user/mention), `㋡` (role/senyum).
   - **Sistem / Teknis**: `⚙` (roda gigi sistem), `⌬` (limit/database), `𖦹` (mode public/jaringan), `⧗` / `⏱` (uptime/waktu).
   - **Peringkat / Donatur**: `❖` (lencana kehormatan), `👑` / `🏆` (top 1), `✮` / `✰` (bintang).
   - **Waktu & Kalender**: `⏱` (jam/waktu), `◈` (tanggal/kalender), `⟡` (hari).
   - **Data & Navigasi Bullet**: `⟡` (poin utama), `✧` (poin kedua), `✦` (poin ketiga), `›` / `»` (perintah klik).
   - **Header & Pita Estetik**: `*──  ୨୧ ✧ [JUDUL] ✧ ୨୧  ──*`, `⋆⁺₊⋆`.
   - **Petunjuk Aksi / Tombol**: `｡˚ ⊹ *[Teks Petunjuk]* ⊹ ˚ ｡`.

2. **Wajib Pertahankan Blockquote WhatsApp (`>`)**:
   Tanda kutip WhatsApp `>` memberikan garis vertikal aksen abu-abu di sisi kiri yang memberikan kesan pesan berkelas, eksklusif, dan memiliki kedalaman visual (*visual hierarchy*). **Jangan pernah hilangkan `>`!** Gunakan untuk:
   - Blok sapaan / greeting pembuka:
     ```text
     > *こんにちわ!* (ʜᴇʟʟᴏ!)
     > ꜱᴇʟᴀᴍᴀᴛ ᴘᴀɢɪ *User* ♡
     > _Ohayou gozaimasu, User-san! (◕‿◕✿)_
     ```
   - Catatan lisensi & panduan ringkas:
     ```text
     > Ⓟ = ᴘʀᴇᴍɪᴜᴍ   •   Ⓛ = ʟɪᴍɪᴛ
     > _Ketik .help <cmd> untuk info detail perintah._
     ```
   - Call to Action (CTA) tombol:
     ```text
     > ｡˚ ⊹ *ᴛᴀᴘ ᴛᴏᴍʙᴏʟ ᴅɪ ʙᴀᴡᴀʜ ᴜɴᴛᴜᴋ ᴘɪʟɪʜ ᴋᴀᴛᴇɢᴏʀɪ* ⊹ ˚ ｡
     ```

3. **Gaya Bingkai Card (Border Style) Simetris**:
   Gunakan struktur bingkai modern berikut untuk membungkus grup informasi:
   ```text
   *╭  〔 [IKON] [JUDUL SMALL CAPS] 〕*
   *┆* [SIMBOL] [LABEL SMALL CAPS] : *[Nilai]*
   *╰───────────────*
   ```
   *Contoh:*
   ```text
   *╭  〔 𝜚 ᴜ ꜱ ᴇ ʀ 〕*
   *┆* ⟡ ɴᴀᴍᴀ     : *Nenel*
   *┆* ✧ ʀᴏʟᴇ     : *User ㋡*
   *┆* ✦ ꜱᴛᴀᴛᴜꜱ   : *ꜰʀᴇᴇ Ⓛ*
   *┆* ⌬ ʟɪᴍɪᴛ    : *𝟸𝟶*
   *┆* ❖ ꜱᴀʟᴅᴏ    : *Rp 𝟻𝟶.𝟶𝟶𝟶*
   *┆* ᰔ ᴘᴀꜱᴀɴɢᴀɴ : *― (Single)*
   *╰───────────────*
   ```

4. **Tipografi Small Caps & Angka Kecil (`toSmallNum`)**:
   - Teks label informasi gunakan **Small Caps** (Contoh: `ɴᴀᴍᴀ`, `ʀᴏʟᴇ`, `ꜱᴛᴀᴛᴜꜱ`, `ʟɪᴍɪᴛ`, `ꜱᴀʟᴅᴏ`, `ᴘᴀꜱᴀɴɢᴀɴ`, `ʙᴏᴛ`, `ᴠᴇʀꜱɪ`, `ᴄʀᴇᴀᴛᴏʀ`, `ᴜᴘᴛɪᴍᴇ`, `ᴍᴏᴅᴇ`, `ᴛᴏᴛᴀʟ ꜰɪᴛᴜʀ`, `ʜᴀʀɪ`, `ᴛᴀɴɢɢᴀʟ`, `ᴊᴀᴍ`).
   - Angka statistik dan tanggal konversikan menggunakan fungsi helper `toSmallNum` agar menjadi karakter angka kecil Unicode yang rapi:
     ```javascript
     const toSmallNum = (str) => {
         const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
         return String(str).replace(/[0-9]/g, d => map[d] || d)
     }
     ```

5. **Ucapan Dinamis Ala Anime**: Selalu kombinasikan salam waktu (`greetingWaktu`) dengan `getGreeting(name)` dari `lib/style.js`.

---

## 🛠️ 2. Menggunakan Helper Terpusat (`lib/style.js`)

Semua fungsi styling sudah distandarisasi di `../../lib/style.js`. Cukup import helper yang dibutuhkan:

```javascript
import { 
  getGreeting, 
  shintoHeader, 
  shintoCard, 
  shintoSection, 
  shintoDivider, 
  shintoFooter, 
  status 
} from '../../lib/style.js'
```

---

## 📋 3. Template Siap Pakai (Ready-to-Copy Boilerplates)

### 🌟 A. Template Menu Utama GIFFLOW (Looping Video/GIF + Card Variatif + Blockquote)
Template resmi yang digunakan di `plugins/menu/menu.js`:

```javascript
import fs from 'fs'
import fetch from 'node-fetch'
import { loadDB } from '../../lib/waifuHelper.js'
import { getGreeting } from '../../lib/style.js'

const toSmallNum = (str) => {
    const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
    return String(str).replace(/[0-9]/g, d => map[d] || d)
}

const formatUptime = (sec) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0')
    const mi = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
    const s = Math.floor(sec % 60).toString().padStart(2, '0')
    return `${h}:${mi}:${s}`
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  let name = m.pushName || await conn.getName(m.sender)
  let d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  let locale = 'id-ID'
  let tanggal = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  let hari = d.toLocaleDateString(locale, { weekday: 'long' })
  let jam = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false })

  const hour = d.getHours()
  let greetingWaktu = 'ꜱᴇʟᴀᴍᴀᴛ ᴍᴀʟᴀᴍ'
  if (hour >= 4 && hour < 11) greetingWaktu = 'ꜱᴇʟᴀᴍᴀᴛ ᴘᴀɢɪ'
  else if (hour >= 11 && hour < 15) greetingWaktu = 'ꜱᴇʟᴀᴍᴀᴛ ꜱɪᴀɴɢ'
  else if (hour >= 15 && hour < 18) greetingWaktu = 'ꜱᴇʟᴀᴍᴀᴛ ꜱᴏʀᴇ'

  let user = global.db.data.users[m.sender] || {}
  const wdb = loadDB()
  const uang = wdb.money?.[m.sender] || 0
  let { limit = 0, role = 'User', premiumTime = 0 } = user
  let prems = premiumTime > 0 ? 'ᴘʀᴇᴍɪᴜᴍ Ⓟ' : 'ꜰʀᴇᴇ Ⓛ'
  let greeting = getGreeting(name, d.getHours())

  let header = `*──  ୨୧ ✧ ${global.namebot.toUpperCase()} ✧ ୨୧  ──*

> *こんにちわ!* (ʜᴇʟʟᴏ!)
> ${greetingWaktu} *${name}* ♡
> ${greeting}`

  let userCard = `*╭  〔 𝜚 ᴜ ꜱ ᴇ ʀ 〕*
*┆* ⟡ ɴᴀᴍᴀ     : *${name}*
*┆* ✧ ʀᴏʟᴇ     : *${role} ㋡*
*┆* ✦ ꜱᴛᴀᴛᴜꜱ   : *${prems}*
*┆* ⌬ ʟɪᴍɪᴛ    : *${toSmallNum(limit)}*
*┆* ❖ ꜱᴀʟᴅᴏ    : *Rp ${toSmallNum(uang.toLocaleString('id-ID'))}*
*╰───────────────*`

  let botCard = `*╭  〔 ⚙ ꜱ ʏ ꜱ ᴛ ᴇ ᴍ 〕*
*┆* ⟡ ʙᴏᴛ         : *${global.namebot}*
*┆* ◈ ᴠᴇʀꜱɪ       : *v${toSmallNum(global.versi || '4.0.0')}*
*┆* ✧ ᴄʀᴇᴀᴛᴏʀ     : *${global.author || 'Nenel'}*
*┆* ⧗ ᴜᴘᴛɪᴍᴇ      : *${toSmallNum(formatUptime(process.uptime()))}*
*┆* 𖦹 ᴍᴏᴅᴇ        : *Public*
*┆* ✦ ᴛᴏᴛᴀʟ ꜰɪᴛᴜʀ : *${toSmallNum(Object.keys(global.plugins || {}).length || 750)}+*
*╰───────────────*`

  let aboutCard = `*╭  〔 ⏱ ᴡ ᴀ ᴋ ᴛ ᴜ 〕*
*┆* ⟡ ʜᴀʀɪ    : *${hari}*
*┆* ◈ ᴛᴀɴɢɢᴀʟ : *${toSmallNum(tanggal)}*
*┆* ✧ ᴊᴀᴍ     : *${toSmallNum(jam)} ᴡɪʙ*
*╰───────────────*`

  let notesBlock = `> Ⓟ = ᴘʀᴇᴍɪᴜᴍ   •   Ⓛ = ʟɪᴍɪᴛ
> _Ketik ${_p}help <cmd> untuk info detail perintah._
> ｡˚ ⊹ *ᴛᴀᴘ ᴛᴏᴍʙᴏʟ ᴅɪ ʙᴀᴡᴀʜ ᴜɴᴛᴜᴋ ᴘɪʟɪʜ ᴋᴀᴛᴇɢᴏʀɪ* ⊹ ˚ ｡`

  let caption = [header, userCard, botCard, aboutCard, notesBlock].join('\n\n')
  let footer = `${global.namebot} • Versi ${toSmallNum(global.versi || '4.0.0')}`

  // Kirim dengan conn.Button (Native Flow Looping GIF Playback)
  const btn = new conn.Button(conn)
  btn.setBody(caption)
  btn.setFooter(footer)
  btn.setVideo('https://c.termai.cc/v174/zFX', { gifPlayback: true })
  btn.addButton('single_select', JSON.stringify({
      title: '✦ PILIH KATEGORI',
      sections: [{
          title: '✦ DAFTAR KATEGORI',
          rows: [{ title: 'Semua Menu', id: `${_p}allmenu` }]
      }]
  }))
  btn.addReply('✦ Semua Menu', `${_p}allmenu`)
  btn.addReply('✧ Info Owner', `${_p}owner`)
  await btn.send(m.chat)
}
```

---

### 📥 B. Template Plugin Downloader / Fetcher
```javascript
import { status } from '../../lib/style.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`*╭  〔 ✦ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n> Format salah! Gunakan:\n> › *${usedPrefix + command}* <link/query>\n*╰───────────────*`)

  // Kirim status tunggu
  await conn.sendMessage(m.chat, { text: status.wait('Sedang memproses unduhan media...') }, { quoted: m })

  try {
    let title = "Judul Konten"
    let author = "Pembuat Konten"
    let duration = "03:45"
    let quality = "HD 1080p / MP3 320kbps"

    let caption = `*──  ୨୧ ✧ DOWNLOADER SUKSES ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴋ ᴏ ɴ ᴛ ᴇ ɴ 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ    : *${title}*
*┆* ✧ ᴀᴜᴛʜᴏʀ   : *${author}*
*┆* ⧗ ᴅᴜʀᴀꜱɪ   : *${duration}*
*┆* ◈ ᴋᴜᴀʟɪᴛᴀꜱ : *${quality}*
*╰───────────────*

> _Media sedang dikirimkan ke chat ini_`.trim()

    await conn.sendMessage(m.chat, { image: { url: 'https://...' }, caption }, { quoted: m })
  } catch (e) {
    m.reply(status.error('Gagal memproses media. Pastikan tautan valid.'))
  }
}

handler.help = ['dlcontoh <url>']
handler.tags = ['downloader']
handler.command = /^dlcontoh$/i
export default handler
```

---

### ⏳ C. Template Status & Notifikasi (Minimalist)
Gunakan objek `status` dari `lib/style.js` atau salin template berikut:

```javascript
// 1. Sedang Memproses (Loading)
`*╭  〔 ⧗ ᴍ ᴏ ʜ ᴏ ɴ  ᴛ ᴜ ɴ ɢ ɢ ᴜ 〕*\n> Sedang memproses permintaanmu...\n*╰───────────────*`

// 2. Berhasil (Success)
`*╭  〔 ✦ ʙ ᴇ ʀ ʜ ᴀ ꜱ ɪ ʟ 〕*\n> Pengaturan grup telah diperbarui ke mode Admin Only.\n*╰───────────────*`

// 3. Peringatan / Format Salah (Warning)
`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n> Format input salah! Gunakan:\n> › *.tiktok <url>*\n*╰───────────────*`

// 4. Gagal / Error (Error)
`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*\n> Gagal menghubungi server. Silakan coba sesaat lagi.\n*╰───────────────*`
```

---

## 🤖 4. AI Prompt Template (Untuk Perintah ke AI Agent)

Jika ingin meminta AI membuat fitur baru dengan format ini, salin dan tempel prompt di bawah ini ke AI:

```markdown
Buatkan plugin WhatsApp bot (ES Modules) untuk fitur [SEBUTKAN NAMA FITUR].
Ikuti standar format "Zen Shinto / Celestial Japanese Aesthetic" Avelia:
1. Gunakan palet simbol bervariasi: `𝜚`, `ᰔ`, `㋡`, `⚙`, `⌬`, `❖`, `⧗`, `⏱`, `◈`, `⟡`, `✧`, `✦`, `›`. Hindari pengulangan simbol tunggal yang monoton.
2. Pertahankan penggunaan blockquote WhatsApp `>` untuk sapaan, kutipan, catatan, dan petunjuk.
3. Gunakan gaya bingkai Card Button 6:
   *╭  〔 [IKON] [JUDUL SMALL CAPS] 〕*
   *┆* [SIMBOL] [LABEL SMALL CAPS] : *[Nilai]*
   *╰───────────────*
4. Gunakan tipografi Small Caps untuk label data dan fungsi `toSmallNum` untuk angka statistik/tanggal.
5. Header menggunakan pita estetik: `*──  ୨୧ ✧ [JUDUL] ✧ ୨୧  ──*`.
6. Jangan menumpuk emoji warna-warni yang ramai; utamakan simbol Unicode yang elegan.
```

