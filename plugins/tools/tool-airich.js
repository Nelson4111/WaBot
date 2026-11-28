import { status } from '../../lib/style.js'

// Cache-buster v4 agar saat plugin ini di-reload oleh watcher main.js,
// modul lib/aiRichMessage.js terbaru langsung aktif + me-reload handler.js tanpa perlu restart bot!
const MODULE_VERSION = Date.now()
let _aiRichModulePromise = null

function getAIRichModule() {
  if (!_aiRichModulePromise) {
    _aiRichModulePromise = import(`../../lib/aiRichMessage.js?v=${MODULE_VERSION}`).then(mod => {
      if (global.conn && typeof mod.installAutoReactionSocketHooks === 'function') {
        mod.installAutoReactionSocketHooks(global.conn)
      }
      return mod
    })
  }
  return _aiRichModulePromise
}

// Preload modul & pasang hook pada global.conn saat plugin dimuat
getAIRichModule().then(() => {
  if (typeof global.reloadHandler === 'function') {
    setTimeout(() => {
      try { global.reloadHandler(false) } catch {}
    }, 250)
  }
}).catch(() => {})

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

let handler = async (m, { conn, text, args, usedPrefix, command, isOwner }) => {
  const cmd = command.toLowerCase()
  const {
    sendAIRichMessage,
    sendStickerReaction,
    addOwnerReactionSticker,
    removeOwnerReactionSticker,
    listOwnerReactionStickers,
    isAutoReactionEnabled,
    setAutoReactionEnabled,
    extractStickerAudioData,
    installAutoReactionSocketHooks,
    ensureAIRichProto
  } = await getAIRichModule()

  ensureAIRichProto()
  installAutoReactionSocketHooks(conn)

  // ── 1. Command Khusus Owner: .listreact / .reactlist (Lihat Daftar Koleksi Stiker Reaksi) ──
  if (cmd === 'listreact' || cmd === 'reactlist') {
    if (!isOwner) {
      return m.reply(status.error('Perintah ini khusus untuk *Owner Bot*!'))
    }
    const items = listOwnerReactionStickers()
    const autoOn = isAutoReactionEnabled()

    if (!items.length) {
      return m.reply(
        status.info(
          `Daftar Koleksi Stiker Reaksi Owner masih kosong (saat ini menggunakan Stiker Default Avelia).\n\n` +
          `*Cara Menambah Stiker & Audio ke Daftar:*\n` +
          `> 1. Balas *Stiker Bersuara* atau *Video* dengan *${usedPrefix}addreact [nama]*\n` +
          `> 2. Atau balas *Stiker Biasa* dengan *${usedPrefix}addreact*, lalu balas *Audio/VN* dengan *${usedPrefix}addreact*`
        )
      )
    }

    const lines = items.map((item, idx) => {
      const soundBadge = item.hasAudio ? `🔊 Bersuara (${item.seconds || 4}s)` : `🔇 Visual`
      const animBadge = item.isAnimated ? `Animasi` : `Statis`
      return `*${idx + 1}.* *${item.name}* (\`${item.id}\`)\n   ↳ ${soundBadge} • ${animBadge}`
    }).join('\n')

    return m.reply(
      `*──  ୨୧ ✧ KOLEKSI STIKER REAKSI OWNER ✧ ୨୧  ──*\n\n` +
      `*╭  〔 ⚙ ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ  ꜱ ɪ ꜱ ᴛ ᴇ ᴍ 〕*\n` +
      `*┆* ⟡ ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ ꜱᴇʟᴇꜱᴀɪ : *${autoOn ? '🟢 AKTIF (Random)' : '🔴 NONAKTIF'}*\n` +
      `*┆* ✧ ᴛᴏᴛᴀʟ ᴋᴏʟᴇᴋꜱɪ      : *${items.length} Stiker*\n` +
      `*╰──────────────────────*\n\n` +
      `*╭  〔 ✦ ᴅ ᴀ ꜰ ᴛ ᴀ ʀ  ꜱ ᴛ ɪ ᴋ ᴇ ʀ 〕*\n` +
      `${lines}\n` +
      `*╰──────────────────────*\n\n` +
      `> *Panduan Owner:*\n` +
      `> › Tambah stiker/audio: reply media dengan *${usedPrefix}addreact [nama]*\n` +
      `> › Hapus stiker: *${usedPrefix}delreact <nomor / all>*\n` +
      `> › Tes reaksi manual: *${usedPrefix}sreact [nomor]*\n` +
      `> › Toggle auto-react: *${usedPrefix}autoreact on/off*`
    )
  }

  // ── 2. Command Khusus Owner: .delreact (Hapus Stiker dari Daftar Koleksi) ──
  if (cmd === 'delreact' || cmd === 'removereact') {
    if (!isOwner) {
      return m.reply(status.error('Perintah ini khusus untuk *Owner Bot*!'))
    }
    if (!args[0]) {
      return m.reply(
        status.warning(
          `Masukkan nomor urut stiker atau \`all\` yang ingin dihapus!\n` +
          `> Contoh: *${usedPrefix + command} 1* atau *${usedPrefix + command} all*\n` +
          `> Cek nomor urut di *${usedPrefix}listreact*`
        )
      )
    }

    const res = await removeOwnerReactionSticker(args[0])
    if (!res.removedCount) {
      return m.reply(status.warning(`Stiker dengan nomor/ID *${args[0]}* tidak ditemukan di daftar. Cek *${usedPrefix}listreact*.`))
    }

    const label = res.removedItem ? `*${res.removedItem.name}* (\`${res.removedItem.id}\`)` : `*${res.removedName}*`
    return m.reply(
      status.success(
        `Berhasil menghapus ${label} dari koleksi reaksi!\n` +
        `> Sisa koleksi saat ini: *${res.remaining} stiker*`
      )
    )
  }

  // ── 3. Command Khusus Owner: .autoreact (On/Off Reaksi Otomatis Saat Proses Selesai) ──
  if (cmd === 'autoreact') {
    if (!isOwner) {
      return m.reply(status.error('Perintah ini khusus untuk *Owner Bot*!'))
    }
    const mode = (args[0] || '').toLowerCase()
    if (!['on', 'off', 'aktif', 'mati', 'enable', 'disable'].includes(mode)) {
      const current = isAutoReactionEnabled()
      return m.reply(
        status.info(
          `Status Auto-Reaction Selesai Proses saat ini: *${current ? '🟢 AKTIF' : '🔴 NONAKTIF'}*\n` +
          `> Gunakan *${usedPrefix}autoreact on* atau *${usedPrefix}autoreact off*`
        )
      )
    }
    const nextState = ['on', 'aktif', 'enable'].includes(mode)
    await setAutoReactionEnabled(nextState)
    return m.reply(
      status.success(
        `Auto-Reaction Stiker Selesai Proses berhasil diatur ke: *${nextState ? '🟢 AKTIF (Random Pool)' : '🔴 NONAKTIF'}*`
      )
    )
  }

  // ── 4. Command Khusus Owner: .addreact / .setsreact (Tambah Stiker & Audio ke Koleksi Random) ──
  if (cmd === 'addreact' || cmd === 'setsreact') {
    if (!isOwner) {
      return m.reply(status.error('Hanya *Owner Bot* yang dapat menambahkan stiker ke koleksi reaksi selesai proses!'))
    }

    const quoted = m.quoted || m
    const mime = (quoted.msg || quoted).mimetype || quoted.mediaType || ''

    if (!/webp|image|video|audio/i.test(mime)) {
      return m.reply(
        status.warning(
          `Balas (reply) media yang ingin ditambahkan ke koleksi Stiker Reaksi Owner:\n` +
          `> 1. Reply *Stiker Bersuara* atau *Video* dengan *${usedPrefix + command} [nama]*\n` +
          `> 2. Reply *Stiker Biasa / Gambar* dengan *${usedPrefix + command} [nama]*\n` +
          `> 3. Reply *Audio / Voice Note* dengan *${usedPrefix + command} [nomor]* untuk memasang suara ke stiker di daftar!\n` +
          `> Lihat koleksi saat ini: *${usedPrefix}listreact*`
        )
      )
    }

    await m.react('⏳')
    try {
      const dl = await quoted.download()
      if (!Buffer.isBuffer(dl) || dl.length < 16) {
        throw new Error('Gagal mengunduh media.')
      }

      let addedEntry = null
      const customName = text.trim()

      // Jika Owner me-reply Audio / Voice Note -> pasangkan suara ke stiker terakhir (atau nomor yang dipilih)
      if (/audio/i.test(mime)) {
        const targetNum = /^\d+$/.test(args[0] || '') ? args[0] : null
        const cleanName = targetNum ? args.slice(1).join(' ').trim() : customName
        addedEntry = await addOwnerReactionSticker(null, {
          name: cleanName,
          audioBuffer: dl,
          targetIndexOrId: targetNum,
          addedBy: m.sender
        })
      } else {
        // Jika Owner me-reply Stiker, Video, atau Gambar
        const audioData = await extractStickerAudioData(conn, m, quoted, dl)
        const rawAudioBuf = (!audioData && /video/i.test(mime)) ? dl : null
        addedEntry = await addOwnerReactionSticker(dl, {
          name: customName,
          audioBuffer: rawAudioBuf,
          audioData,
          addedBy: m.sender
        })
      }

      const allItems = listOwnerReactionStickers()
      const idx = allItems.findIndex(x => x.id === addedEntry.id) + 1

      // Langsung demokan reaksi stiker yang baru ditambahkan ke pesan tersebut!
      await quoted.react('✅')
      await sendStickerReaction(conn, m.chat, quoted, addedEntry)

      const soundStatus = addedEntry.hasAudio
        ? `🔊 *Bersuara (${addedEntry.seconds || 4} detik)*`
        : `🔇 *Visual Tanpa Suara* (Tips: reply sebuah *Audio/VN* dengan *${usedPrefix}addreact ${idx}* jika ingin memberi suara pada stiker ini!)`

      return m.reply(
        status.success(
          `Berhasil menyimpan ke Koleksi Stiker Reaksi Owner!\n` +
          `> ⟡ Nomor Urut : *#${idx}* dari *${allItems.length} stiker*\n` +
          `> ✧ Nama       : *${addedEntry.name}* (\`${addedEntry.id}\`)\n` +
          `> ◈ Tipe       : ${soundStatus}\n\n` +
          `> _Bot sekarang akan memilih stiker secara acak (random) dari ${allItems.length} koleksi saat proses fitur berat (.ssound, download, stiker, dll) selesai!_`
        )
      )
    } catch (err) {
      console.error('[Add Owner Reaction Sticker Error]:', err)
      await m.react('❌')
      return m.reply(status.error(`Gagal menambahkan stiker reaksi:\n> ${err?.message || err}`))
    }
  }

  // ── 5. Command .sreact (Tes Reaksi Stiker Acak dari Pool Owner, atau Pilih Nomor Tertentu) ──
  if (cmd === 'sreact' || cmd === 'reactsticker' || cmd === 'stickerreact') {
    const targetMsg = m.quoted || m
    const quotedMime = m.quoted ? ((m.quoted.msg || m.quoted).mimetype || m.quoted.mediaType || '') : ''

    try {
      // Jika Owner me-reply sebuah stiker sambil mengetik .sreact add, tambahkan ke pool
      if (isOwner && /webp/i.test(quotedMime) && /^(add|tambah|simpan)$/i.test(args[0] || '')) {
        const dl = await m.quoted.download()
        if (Buffer.isBuffer(dl) && dl.length > 16) {
          const audioData = await extractStickerAudioData(conn, m, m.quoted, dl)
          const added = await addOwnerReactionSticker(dl, {
            name: args.slice(1).join(' ').trim(),
            audioData,
            addedBy: m.sender
          })
          await targetMsg.react('✅')
          await sendStickerReaction(conn, m.chat, targetMsg, added)
          const total = listOwnerReactionStickers().length
          return m.reply(status.success(`Stiker ditambahkan ke koleksi Owner! (Total: *${total} stiker*).`))
        }
      }

      const specificPick = args[0] ? args[0].trim() : null
      await targetMsg.react('✅')
      await sendStickerReaction(conn, m.chat, targetMsg, null, {
        specificIndexOrId: specificPick
      })
    } catch (err) {
      console.error('[Sticker Reaction Error]:', err)
      await m.react('❌')
      return m.reply(status.error(`Gagal mengirim Sticker Reaction:\n> ${err?.message || err}`))
    }
    return
  }

  // ── 6. Mode Pengiriman Pesan AI Rich UI (Heading Font, Code Preview/Copy, Table, Anti Read-More) ──
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

handler.help = [
  'airich [markdown]',
  'rich [markdown]',
  'sreact [nomor]',
  'addreact [nama] (Owner)',
  'listreact (Owner)',
  'delreact <nomor/all> (Owner)',
  'autoreact <on/off> (Owner)'
]
handler.tags = ['tools', 'owner']
handler.command = /^(airich|rich|tesrich|richui|sreact|setsreact|addreact|delreact|removereact|listreact|reactlist|autoreact|reactsticker|stickerreact)$/i

handler.desc = 'Mengirim teks dalam format AI Rich Card khusus (kotak kode salin rapi).'
handler.tutorial = [
  '.rich <teks>',
  'Ketik .rich teks atau balas pesan untuk diformat ke gaya rich message'
]

export default handler
