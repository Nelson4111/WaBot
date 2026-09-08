/**
 * Plugin Broadcast Tanpa Button (Langsung Kirim)
 * .bc    = broadcast ke semua private chat
 * .bcgc  = broadcast ke semua grup
 * .bcall = broadcast ke semua (private + grup)
 * Akses: Owner ATAU (Admin Grup + Premium)
 */

function parseSpintax(text) {
  if (!text) return text
  return text.replace(/\{([^{}]+)\}/g, (_, choices) => {
    const options = choices.split('|')
    return options[Math.floor(Math.random() * options.length)]
  })
}

function randomizeContent(text) {
  if (!text) return text
  const parsed = parseSpintax(text)
  // Sisipkan 1-5 zero-width spaces acak di akhir agar hash pesan berbeda di tiap tujuan
  const salt = '\u200B'.repeat(Math.floor(Math.random() * 5) + 1)
  return parsed + salt
}

const handler = async (m, { conn, text, quoted, mime, usedPrefix, command }) => {
  const content = text?.trim() || quoted?.text?.trim() || null

  if (/^(bc|bcall)$/i.test(command)) {
    return m.reply(
      `*╭  〔 ✕ ʙʀᴏᴀᴅᴄᴀꜱᴛ ᴘᴄ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ 〕*\n` +
      `> Broadcast ke Private Chat dimatikan demi keselamatan nomor bot dari pembatasan Reachout Timelock & Error 463 WhatsApp.\n` +
      `> Gunakan *${usedPrefix}bcgc <teks>* untuk broadcast ke seluruh grup bot.\n` +
      `*╰───────────────*`
    )
  }

  if (!content && !quoted) {
    return m.reply(
      `╭──『 *📢 BROADCAST GRUP Avelia* 』\n` +
      `│\n` +
      `│ *Cara Pakai:*\n` +
      `│ *${usedPrefix}bcgc* <teks> → Broadcast ke semua grup\n` +
      `│\n` +
      `│ 💡 Bisa reply gambar/video + caption\n` +
      `│ 💡 Dukung Spintax: {Halo|Hai|Pagi} kawan!\n` +
      `│ 🛡️ Dilengkapi delay acak aman (8-14s)\n` +
      `╰─────────────────────`
    )
  }

  // ── Kumpulkan target grup saja ──────────────────────────────────────────
  const groups = await conn.groupFetchAllParticipating().catch(() => ({}))
  let targetIds = Object.keys(groups)

  if (targetIds.length === 0) {
    return m.reply(`❌ Tidak ada grup yang ditemukan.`)
  }

  const typeLabel = isAll
    ? '🌐 Semua (Private + Grup)'
    : isGc ? '🏘️ Semua Grup' : '👤 Semua Private Chat'

  const hasMedia = !!(quoted && mime && (mime.includes('image') || mime.includes('video')))
  const media = hasMedia ? await quoted.download?.().catch(() => null) : null

  const estimatedMinutes = Math.ceil((targetIds.length * 11) / 60)
  m.reply(
    `🚀 *Broadcast Dimulai!*\n` +
    `📋 Target: *${targetIds.length}* ${typeLabel}\n` +
    `⏱️ Estimasi: ~${estimatedMinutes} menit (Safe Humanized Delay 8-14s)\n` +
    `⏳ Harap tunggu...`
  )

  let sukses = 0
  let gagal = 0

  const fakeQuoted = {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast'
    },
    message: { conversation: global.namebot || 'Avelia' }
  }

  for (const id of targetIds) {
    try {
      // Delay acak manusiawi 8-14 detik anti-spam WhatsApp
      const randomDelay = Math.floor(Math.random() * 6000) + 8000
      await new Promise(resolve => setTimeout(resolve, randomDelay))

      const randomizedText = randomizeContent(content)

      if (hasMedia && media) {
        const msgContent = mime?.includes('image')
          ? { image: media, caption: randomizedText || '' }
          : { video: media, caption: randomizedText || '' }
        await conn.sendMessage(id, msgContent, { quoted: fakeQuoted })
      } else {
        await conn.sendMessage(id, { text: randomizedText || '(pesan)' }, { quoted: fakeQuoted })
      }

      sukses++
    } catch {
      gagal++
    }
  }

  return conn.sendMessage(m.chat, {
    text:
      `✅ *Broadcast Selesai!*\n\n` +
      `📊 *Laporan:*\n` +
      `┌ ✅ Berhasil : *${sukses}*\n` +
      `└ ❌ Gagal    : *${gagal}*\n` +
      `━━━━━━━━━━━━━━━\n` +
      `📋 Total      : *${targetIds.length}*`
  }, { quoted: m })
}

handler.help = ['bcgc <pesan>']
handler.tags = ['owner']
handler.command = /^(bc|bcgc|bcall)$/i
handler.owner = true

export default handler

