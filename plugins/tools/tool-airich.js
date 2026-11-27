import { status } from '../../lib/style.js'

// Cache-buster agar saat plugin ini di-reload oleh watcher main.js,
// modul lib/aiRichMessage.js & lib/audioSticker.js terbaru ikut dimuat ulang tanpa harus restart bot!
const MODULE_VERSION = Date.now()
let _aiRichModulePromise = null

function getAIRichModule() {
  if (!_aiRichModulePromise) {
    _aiRichModulePromise = import(`../../lib/aiRichMessage.js?v=${MODULE_VERSION}`)
  }
  return _aiRichModulePromise
}

const DEMO_MARKDOWN = `# Avelia Rich UI Engine
Tampilan ini menggunakan protokol native **AIRichResponseMessage** di WhatsApp (setara dengan tampilan platform AI modern seperti ChatGPT & Gemini).

### 1. Keunggulan Tampilan Ini
* **Ukuran Font Dinamis:** Mendukung Heading besar (\`#\`, \`##\`, \`###\`) langsung di gelembung chat.
* **Tanpa Potongan "Baca Selengkapnya":** Pesan panjang langsung tampil utuh dari atas ke bawah dalam satu gelembung chat tanpa terpotong tombol *Read more*.
* **Kotak Kode Interaktif:** Dilengkapi *Syntax Highlighting* berwarna, tombol **Salin (Copy)** sekali sentuh, dan layar **Full Preview** saat ditekan.

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
  const {
    sendAIRichMessage,
    sendStickerReaction,
    setUserReactionSticker,
    extractStickerAudioData,
    ensureAIRichProto
  } = await getAIRichModule()

  ensureAIRichProto()

  // ── Mode 1: Sticker Reaction / Sticker Annotation ("1 stiker ditambahkan", associationType: 11) ──
  // Mendukung penuh:
  // 1. Ketik .sreact atau reply pesan apa saja dengan .sreact -> Tempelkan reaksi "✅" + Stiker Reaksi!
  // 2. Reply Stiker Biasa atau Stiker Bersuara (Sound Sticker) dengan .setsreact / .sreact:
  //    -> Menyimpan visual WebP SEKALIGUS stream suaranya (audioMessage/Opus)!
  // 3. Reply sebuah Audio / Voice Note dengan .setsreact:
  //    -> Memasangkan suara Audio/VN tersebut ke Stiker Reaksi milikmu agar stiker reaksimu bersuara!
  if (cmd === 'sreact' || cmd === 'setsreact' || cmd === 'reactsticker' || cmd === 'stickerreact') {
    const targetMsg = m.quoted || m
    const quotedMime = m.quoted ? ((m.quoted.msg || m.quoted).mimetype || m.quoted.mediaType || '') : ''
    const selfMime = (m.msg || m).mimetype || m.mediaType || ''

    try {
      let customEntry = null

      // Kasus A: User me-reply sebuah Audio / Voice Note dengan .setsreact (tambahkan suara ke stiker reaksi)
      if (cmd === 'setsreact' && /audio/i.test(quotedMime)) {
        const audioBuf = await m.quoted.download()
        if (Buffer.isBuffer(audioBuf) && audioBuf.length > 32) {
          customEntry = await setUserReactionSticker(m.sender, null, {
            audioBuffer: audioBuf
          })
        }
      }
      // Kasus B: User me-reply sebuah Stiker (atau Gambar/Video saat .setsreact)
      else if (/webp/i.test(quotedMime) || (cmd === 'setsreact' && /webp|image|video/i.test(quotedMime))) {
        const dl = await m.quoted.download()
        if (Buffer.isBuffer(dl) && dl.length > 16) {
          // Ekstrak audioMessage jika stiker yang di-reply adalah Sound Sticker ( atau jika video, ambil audionya )
          let audioData = await extractStickerAudioData(conn, m, m.quoted, dl)
          let rawAudioBuf = null
          if (!audioData && /video/i.test(quotedMime)) {
            rawAudioBuf = dl
          }
          customEntry = await setUserReactionSticker(m.sender, dl, {
            audioBuffer: rawAudioBuf,
            audioData
          })
        }
      }
      // Kasus C: User mengirim gambar/stiker langsung dengan caption .setsreact / .sreact
      else if (/webp/i.test(selfMime) || (cmd === 'setsreact' && /webp|image|video/i.test(selfMime))) {
        const dl = await m.download()
        if (Buffer.isBuffer(dl) && dl.length > 16) {
          const audioData = await extractStickerAudioData(conn, m, m, dl)
          const rawAudioBuf = (!audioData && /video/i.test(selfMime)) ? dl : null
          customEntry = await setUserReactionSticker(m.sender, dl, {
            audioBuffer: rawAudioBuf,
            audioData
          })
        }
      }

      // Berikan reaksi emoji ✅ terlebih dahulu, lalu tempelkan Sticker Reaction!
      await targetMsg.react('✅')
      await sendStickerReaction(conn, m.chat, targetMsg, customEntry, {
        sender: m.sender
      })

      if (cmd === 'setsreact' && customEntry) {
        const soundInfo = customEntry.hasAudio
          ? `🔊 *Mode Stiker Bersuara (Sound Sticker):* Aktif!`
          : `🔇 *Mode Stiker:* Tanpa Suara (Tips: kamu juga bisa reply *Stiker Bersuara*, *Video*, atau *Audio/VN* dengan *${usedPrefix}setsreact* agar stiker reaksimu ada suaranya!)`
        return m.reply(
          status.success(
            `Stiker Reaksi favorit kamu berhasil diperbarui!\n` +
            `> ${soundInfo}\n` +
            `> Sekarang cukup balas pesan mana saja dengan *${usedPrefix}sreact* untuk menempelkan stiker ini.`
          )
        )
      }
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

handler.help = ['airich [markdown]', 'rich [markdown]', 'sreact (reply pesan / stiker)', 'setsreact (reply stiker / video / vn)']
handler.tags = ['tools']
handler.command = /^(airich|rich|tesrich|richui|sreact|setsreact|reactsticker|stickerreact)$/i

export default handler
