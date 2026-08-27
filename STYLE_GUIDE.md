# ✦ NelBot Design System & Style Guide
> **Theme:** *Zen Shinto / Celestial Japanese Aesthetic (Minimalist & Clean)*  
> **Target Platform:** WhatsApp Multi-Device (Android, iOS, Web & Desktop)

Dokumen ini adalah panduan resmi format teks dan visual untuk **NelBot-MD**. Gunakan template dan aturan di dokumen ini saat membuat plugin, fitur, atau pesan bot baru agar seluruh teks konsisten, rapi, modern, dan tidak terlalu ramai oleh emoji.

---

## ✦ 1. Aturan Dasar Desain (Design Principles)

1. **Kurangi Penggunaan Emoji Berlebihan**: Hindari menumpuk banyak emoji warna-warni yang membuat tampilan chat terlalu ramai. Gunakan simbol minimalis nan elegan:
   - Simbol Aksen / Bintang: `✦`, `✧`, `⟡`, `⋆⁺₊⋆`
   - Simbol Navigasi / Bullet: `⟡` (data/info), `›` (perintah/opsi), `·` (titik pemisah)
   - Bracket Jepang: `〔 ... 〕`
2. **Gunakan Blockquote WhatsApp (`>`)**: Gunakan tanda kutip WhatsApp `>` untuk ucapan dinamis, catatan kaki, kutipan, dan deskripsi status agar teks memiliki kedalaman visual (*visual hierarchy*).
3. **Gunakan Box-Drawing Tree yang Presisi**:
   - Awalan Card: `┌──〔 ✦ *JUDUL CARD* 〕`
   - Isi Baris: `│ ⟡ *Label* : Nilai` atau `│ ⟡ .command`
   - Penutup Card: `└────────────────────────`
4. **Divider Celestial**: Gunakan `· · ─ ─ ✦ ─ ─ · ·` sebagai garis pemisah yang bersih.
5. **Header Estetik**:
   ```text
   ⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆
      〔 ✦ *JUDUL MENU / FITUR* 〕
   > _Konnichiwa, User-san! (｡•̀ᴗ-)✧_
   ⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆
   ```
6. **Ucapan Dinamis Ala Anime**: Selalu gunakan `getGreeting(name)` dengan kaomoji halus untuk menyapa pengguna.

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

### 📥 A. Template Plugin Downloader / Fetcher
```javascript
import { status } from '../../lib/style.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`〔 ✦ *P E R I N G A T A N* 〕\n> Format salah! Gunakan:\n> › *${usedPrefix + command}* <link/query>`)

  // Kirim status tunggu
  await conn.sendMessage(m.chat, { text: status.wait('Sedang memproses unduhan media...') }, { quoted: m })

  try {
    // [Proses Fetching Data...]
    let title = "Judul Konten"
    let author = "Pembuat Konten"
    let duration = "03:45"
    let quality = "HD 1080p / MP3 320kbps"

    let caption = `
⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆
   〔 ✦ *DOWNLOADER SUKSES* 〕
⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆

┌──〔 ✦ *DETAIL KONTEN* 〕
│ ⟡ *Judul* : ${title}
│ ⟡ *Author* : ${author}
│ ⟡ *Durasi* : ${duration}
│ ⟡ *Kualitas* : ${quality}
└────────────────────────

· · ─ ─ ✦ ─ ─ · ·
> _Media sedang dikirimkan ke chat ini_
`.trim()

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

### ⏳ B. Template Status & Notifikasi (Minimalist)
Gunakan objek `status` dari `lib/style.js` atau salin template berikut:

```javascript
// 1. Sedang Memproses (Loading)
`〔 ✦ *M O H O N  T U N G G U* 〕\n> Sedang memproses permintaanmu...`

// 2. Berhasil (Success)
`〔 ✦ *B E R H A S I L* 〕\n> Pengaturan grup telah diperbarui ke mode Admin Only.`

// 3. Peringatan / Format Salah (Warning)
`〔 ✦ *P E R I N G A T A N* 〕\n> Format input salah! Gunakan:\n> › *.tiktok <url>*`

// 4. Gagal / Error (Error)
`〔 ✦ *G A G A L* 〕\n> Gagal menghubungi server. Silakan coba sesaat lagi.`
```

---

### 📑 C. Template Submenu Kategori (`plugins/menu/menu-*.js`)
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
    .map(v => `│ ⟡ ${v.cmd} ${v.premium ? 'Ⓟ' : ''}${v.limit ? 'Ⓛ' : ''}`)
    .join('\n')

  let menuText = `
⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆
   〔 ✦ *NAMA KATEGORI MENU* 〕
> ${greeting}
⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆

┌──〔 ✦ *PROFIL PENGGUNA* 〕
│ ⟡ *Nama* : ${name}
│ ⟡ *Role* : ${role}
│ ⟡ *Status* : ${prems}
│ ⟡ *Limit* : ${limit}
│ ⟡ *Saldo* : Rp ${uang.toLocaleString('id-ID')}
└────────────────────────

┌──〔 ✦ *WAKTU & TANGGAL* 〕
│ ⟡ *Tanggal* : ${tanggal}
│ ⟡ *Hari* : ${hari}
│ ⟡ *Jam* : ${jam} WIB
└────────────────────────

┌──〔 ✦ *DAFTAR PERINTAH* 〕
${features}
└────────────────────────

· · ─ ─ ✦ ─ ─ · ·
> _Terima kasih sudah menggunakan ${global.namebot}_
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

Jika ingin meminta AI membuat fitur baru dengan format ini, salin dan tempel prompt di bawah ini ke AI:

```markdown
Buatkan plugin WhatsApp bot (ES Modules) untuk fitur [SEBUTKAN NAMA FITUR].
Ikuti standar format "Zen Shinto / Celestial Japanese Aesthetic" NelBot:
1. Gunakan helper dari `../../lib/style.js` jika diperlukan (`getGreeting`, `status`, `shintoCard`, dll.).
2. Kurangi penggunaan emoji berlebih, prioritaskan simbol minimalis: `✦`, `✧`, `⟡`, `›`, `·`.
3. Format header:
   ⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆
      〔 ✦ *JUDUL* 〕
   > _Greeting / Subjudul_
   ⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆
4. Format card / section dengan box-drawing tree:
   ┌──〔 ✦ *NAMA SECTION* 〕
   │ ⟡ *Label* : Nilai
   └────────────────────────
5. Gunakan blockquote WhatsApp `>` untuk teks catatan, panduan, atau deskripsi.
6. Pembatas divider: `· · ─ ─ ✦ ─ ─ · ·`.
7. Respon status notifikasi (loading/error/warning/success) harus menggunakan format badge simbolis: `〔 ✦ *STATUS* 〕\n> Pesan`.
```
