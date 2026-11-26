import { sendAIRichMessage, sendStickerReaction } from '../../lib/aiRichMessage.js'
import { status } from '../../lib/style.js'

const DEMO_MARKDOWN = `# Avelia Rich UI Engine
Tampilan ini menggunakan protokol native **AIRichResponseMessage** di WhatsApp (setara dengan tampilan platform AI modern seperti ChatGPT & Gemini).

### 1. Keunggulan Tampilan Ini
* **Ukuran Font Dinamis:** Mendukung Heading besar (\`#\`, \`##\`, \`###\`) langsung di gelembung chat.
* **Tanpa Potongan "Baca Selengkapnya":** Pesan panjang langsung tampil utuh dari atas ke bawah dalam satu gelembung chat tanpa terpotong tombol *Read more*.
* **Kotak Kode Interaktif:** Dilengkapi *Syntax Highlighting* berwarna, tombol **Salin (Copy)** sekali sentuh, dan layar **Full Preview** saat ditekan.

---

### 2. Contoh Kotak Kode (Klik untuk Full Preview / Salin)
\`\`\`javascript
import { sendAIRichMessage } from './lib/aiRichMessage.js'

export async function renderCodeCard(conn, m) {
  const greeting = "Halo dari Avelia Rich UI!"
  const calculation = 1024 * 60
  console.log(greeting, calculation)
  return true
}
\`\`\`

### 3. Contoh Tabel Grid Native WhatsApp
| Fitur UI | Protokol WAProto | Status |
| --- | --- | --- |
| Heading Font Besar | GenAIMarkdownTextUXPrimitive | Aktif |
| Code Block + Copy | GenAICodeUXPrimitive | Aktif |
| Tabel Native | GenATableUXPrimitive | Aktif |
| Anti Read-More | AIRichResponseMessage | Aktif |`

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const cmd = command.toLowerCase()

  // ── Mode 1: Eksperimen Sticker Reaction / Sticker Annotation (associationType: 11) ──
  if (cmd === 'sreact' || cmd === 'reactsticker' || cmd === 'stickerreact') {
    if (!m.quoted) {
      return m.reply(
        status.warning(
          `Balas (reply) pesan target sambil mengirim stiker/gambar, atau balas stiker dengan perintah:\n` +
          `> › *${usedPrefix + command}*`
        )
      )
    }

    // Jika user mengirim gambar/stiker sambil me-reply pesan target, atau me-reply stiker
    const mediaSource = (m.mtype === 'stickerMessage' || m.mtype === 'imageMessage') ? m : m.quoted
    const mime = (mediaSource.msg || mediaSource).mimetype || mediaSource.mediaType || ''

    if (!/webp|image|video/i.test(mime)) {
      return m.reply(status.warning(`Pesan yang dipilih harus berupa *Stiker* atau *Gambar* untuk dijadikan Sticker Reaction.`))
    }

    await m.react('⏳')
    try {
      const mediaBuf = await mediaSource.download()
      if (!mediaBuf) throw new Error('Gagal mengunduh media stiker.')

      const targetMsg = (mediaSource === m && m.quoted) ? m.quoted : m.quoted
      await sendStickerReaction(conn, m.chat, targetMsg, mediaBuf)
      await m.react('✨')
    } catch (err) {
      console.error('[Sticker Reaction Error]:', err)
      await m.react('❌')
      return m.reply(status.error(`Gagal mengirim Sticker Reaction:\n> ${err?.message || err}`))
    }
    return
  }

  // ── Mode 2: Pengiriman Pesan AI Rich UI (Heading Font, Code Preview/Copy, Table, Anti Read-More) ──
  const t0 = Date.now()
  const rawInput = (text || (m.quoted?.text ? m.quoted.text : '')).trim()
  const contentToRender = rawInput || DEMO_MARKDOWN
  const botLabel = global.namebot || 'Avelia'

  await m.react('⏳')
  try {
    const elapsedSec = Math.max(1, Math.round((Date.now() - t0) / 1000))
    await sendAIRichMessage(conn, m.chat, contentToRender, {
      quoted: m,
      footer: `🧰 0 langkah • ⏱ ${elapsedSec}s\n• ${botLabel}`
    })
    await m.react('✨')
  } catch (err) {
    console.error('[AIRich Command Error]:', err)
    await m.react('❌')
    return m.reply(status.error(`Gagal merender pesan Rich UI:\n> ${err?.message || err}`))
  }
}

handler.help = ['airich [markdown]', 'rich [markdown]', 'sreact (reply stiker)']
handler.tags = ['tools']
handler.command = /^(airich|rich|tesrich|richui|sreact|reactsticker|stickerreact)$/i

export default handler
