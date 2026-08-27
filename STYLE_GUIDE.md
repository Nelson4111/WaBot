# ⛩️ NelBot Design System & Style Guide
> **Theme:** *Zen Shinto / Modern Clean Japanese Aesthetic*  
> **Target Platform:** WhatsApp Multi-Device (Mobile & Web)

Dokumen ini adalah panduan resmi format teks dan visual untuk **NelBot-MD**. Gunakan template dan aturan di dokumen ini saat membuat plugin, fitur, atau pesan bot baru agar seluruh teks konsisten, rapi, dan estetik di WhatsApp.

---

## 🌸 1. Aturan Dasar Desain (Design Principles)

1. **Hindari Font Small-Caps Berlebihan**: Hindari `ɪɴғᴏ • ᴜsᴇʀ` karena sulit dibaca dan tidak konsisten di berbagai perangkat. Gunakan `*BOLD KAPITAL*` native WhatsApp.
2. **Hindari Border Box-Drawing yang Melebur**: Hindari `─━─━` karena di HP akan menyatu menjadi satu garis lurus pekat (*ligature*).
3. **Gunakan Karakter Shinto Estetik**:
   - Header frame: `⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆`
   - Badge Judul: `〔 ⛩️ *JUDUL* 〕` atau `〔 ✿ *SUB-JUDUL* 〕`
   - Bullet item: `⟡` (informasi/data) atau `›` (perintah/navigasi)
   - Pembatas bawah: `── · ── · ── · ── · ── · ──`
4. **Ucapan Dinamis Ala Anime**: Selalu gunakan generator ucapan bervariasi dengan kaomoji (`_Konnichiwa, Nenel-san! (｡•̀ᴗ-)✧_`) daripada teks statis yang kaku.

---

## 🛠️ 2. Menggunakan Helper Terpusat (`lib/style.js`)

Semua fungsi styling sudah tersedia di `../../lib/style.js`. Cukup import fungsi yang dibutuhkan:

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

### 📥 A. Template Plugin Downloader / Fetcher (Contoh: Spotify, TikTok, YouTube)
```javascript
import { status } from '../../lib/style.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`〔 ⚠️ *FORMAT SALAH* 〕\n⟡ Contoh penggunaan:\n› *${usedPrefix + command}* <link/judul>`)

  // Kirim status tunggu
  await conn.sendMessage(m.chat, { text: status.wait('Sedang mengunduh media...') }, { quoted: m })

  try {
    // [Proses Fetching Data...]
    let title = "Judul Konten"
    let author = "Pembuat"
    let duration = "03:45"
    let quality = "HD 1080p / MP3 320kbps"

    let caption = `
⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆
   〔 ⛩️ *DOWNLOADER SUKSES* 〕
⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆

〔 ✿ *DETAIL KONTEN* 〕
⟡ *Judul* : ${title}
⟡ *Author* : ${author}
⟡ *Durasi* : ${duration}
⟡ *Kualitas* : ${quality}

── · ── · ── · ── · ── · ──
_Media sedang dikirimkan ke chat ini ✨_
`.trim()

    await conn.sendMessage(m.chat, { image: { url: 'https://...' }, caption }, { quoted: m })
  } catch (e) {
    m.reply(status.error('Gagal memproses media. Coba link lain.'))
  }
}

handler.help = ['dlcontoh <url>']
handler.tags = ['downloader']
handler.command = /^dlcontoh$/i
export default handler
```

---

### ⏳ B. Template Status & Notifikasi (Wait, Success, Error, Warning)
Gunakan objek `status` dari `lib/style.js` atau salin template berikut:

```javascript
// 1. Sedang Memproses (Loading)
`〔 ⏳ *M O H O N  T U N G G U* 〕\n⟡ Sedang memproses permintaanmu...`

// 2. Berhasil (Success)
`〔 ✨ *B E R H A S I L* 〕\n⟡ Pengaturan grup telah diperbarui ke mode Admin Only.`

// 3. Peringatan / Format Salah (Warning)
`〔 ⚠️ *P E R I N G A T A N* 〕\n⟡ Format salah! Gunakan:\n› *.tiktok <url>*`

// 4. Gagal / Error (Error)
`〔 ❌ *G A G A L* 〕\n⟡ Terjadi kesalahan saat menghubungi server.`
```

---

### 📑 C. Template Submenu Kategori Baru (`plugins/menu/menu-*.js`)
```javascript
import fs from 'fs'
import { loadDB } from '../../lib/waifuHelper.js'
import { getGreeting } from '../../lib/style.js'

let handler = async (m, { conn, usedPrefix: _p }) => {
  let wib = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
  let d = new Date(wib)
  let locale = 'id-ID'
  let tanggal = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  let hari = d.toLocaleDateString(locale, { weekday: 'long' })
  let jam = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false })

  let user = global.db.data.users[m.sender] || {}
  const wdb = loadDB()
  const uang = wdb.money?.[m.sender] || 0
  let { limit = 0, role = 'User', name = m.pushName, premiumTime = 0 } = user
  let prems = premiumTime > 0 ? 'Premium Ⓟ' : 'Free Ⓛ'
  let greeting = getGreeting(name, d.getHours())

  let features = Object.values(global.plugins)
    .filter(p => !p.disabled && p.tags && p.tags.includes('NAMATAG'))
    .flatMap(p => (Array.isArray(p.help) ? p.help : [p.help]).map(cmd => ({
      cmd: p.prefix ? cmd : _p + cmd,
      limit: p.limit,
      premium: p.premium
    })))
    .sort((a, b) => a.cmd.localeCompare(b.cmd))
    .map(v => `⟡ ${v.cmd} ${v.premium ? 'Ⓟ' : ''}${v.limit ? 'Ⓛ' : ''}`)
    .join('\n')

  let menuText = `
⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆
   〔 ⛩️ *NAMA KATEGORI MENU* 〕
     ${greeting}
⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆

〔 ✿ *PROFIL PENGGUNA* 〕
⟡ *Nama* : ${name}
⟡ *Role* : ${role}
⟡ *Status* : ${prems}
⟡ *Limit* : ${limit}
⟡ *Saldo* : Rp ${uang.toLocaleString('id-ID')}

〔 ✿ *WAKTU & TANGGAL* 〕
⟡ *Tanggal* : ${tanggal}
⟡ *Hari* : ${hari}
⟡ *Jam* : ${jam} WIB

〔 ✿ *DAFTAR PERINTAH* 〕
${features}

── · ── · ── · ── · ── · ──
_Terima kasih sudah menggunakan ${global.namebot} ✨_
`.trim()

  await conn.sendMessage(m.chat, {
    text: menuText,
    footer: global.namebot,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.command = /^(menukategori)$/i
handler.help = ["menukategori"]
handler.tags = ["main"]
export default handler
```

---

## 🤖 4. AI Prompt Template (Untuk Perintah ke AI Agent)

Jika ingin meminta AI membuat fitur baru dengan format ini, cukup salin dan tempel prompt di bawah ini ke AI:

```markdown
Buatkan plugin WhatsApp bot (ES Modules) untuk fitur [SEBUTKAN NAMA FITUR].
Ikuti standar format "Zen Shinto / Japanese Aesthetic" NelBot:
1. Gunakan helper dari `../../lib/style.js` jika diperlukan (`getGreeting`, `status`, dll.).
2. Format header: `⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆` dengan badge `〔 ⛩️ *JUDUL* 〕`.
3. Format section / card: `〔 ✿ *SUB-JUDUL* 〕`.
4. Bullet poin data menggunakan `⟡ *Label* : Nilai`.
5. Bullet poin navigasi / perintah menggunakan `› *${_p}cmd* ── Keterangan`.
6. Pembatas footer: `── · ── · ── · ── · ── · ──`.
7. Respon status loading/error/warning harus menggunakan format badge `〔 ⏳/❌/⚠️ ... 〕`.
```
