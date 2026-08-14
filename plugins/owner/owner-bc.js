/**
 * Plugin Broadcast Tanpa Button (Langsung Kirim)
 * .bc    = broadcast ke semua private chat
 * .bcgc  = broadcast ke semua grup
 * .bcall = broadcast ke semua (private + grup)
 * Akses: Owner ATAU (Admin Grup + Premium)
 */

const handler = async (m, { conn, text, quoted, mime, usedPrefix, command }) => {
  const content = text?.trim() || quoted?.text?.trim() || null

  if (!content && !quoted) {
    return m.reply(
      `╭──『 *📢 BROADCAST NelBot-MD* 』\n` +
      `│\n` +
      `│ *Cara Pakai:*\n` +
      `│ *${usedPrefix}bc* <teks>   → BC ke semua private chat\n` +
      `│ *${usedPrefix}bcgc* <teks> → BC ke semua grup\n` +
      `│ *${usedPrefix}bcall* <teks> → BC ke semua (private+grup)\n` +
      `│\n` +
      `│ 💡 Bisa reply gambar/video + caption\n` +
      `│ untuk broadcast media sekaligus.\n` +
      `╰─────────────────────`
    )
  }

  const isGc = /^bcgc$/i.test(command)
  const isAll = /^bcall$/i.test(command)

  // ── Kumpulkan target ──────────────────────────────────────────────
  let targetIds = []
  const botJid = conn.decodeJid(conn.user?.id || conn.user?.jid || '')

  if (isAll) {
    const users = global.db.data?.users || {}
    const pcIds = Object.keys(users).filter(j => j.endsWith('@s.whatsapp.net') && j !== botJid)
    const groups = await conn.groupFetchAllParticipating().catch(() => ({}))
    const gcIds = Object.keys(groups)
    targetIds = [...new Set([...pcIds, ...gcIds])]
  } else if (isGc) {
    const groups = await conn.groupFetchAllParticipating().catch(() => ({}))
    targetIds = Object.keys(groups)
  } else {
    const users = global.db.data?.users || {}
    targetIds = Object.keys(users).filter(j => j.endsWith('@s.whatsapp.net') && j !== botJid)
  }

  if (targetIds.length === 0) {
    return m.reply(`❌ Tidak ada target yang ditemukan.`)
  }

  const typeLabel = isAll
    ? '🌐 Semua (Private + Grup)'
    : isGc ? '🏘️ Semua Grup' : '👤 Semua Private Chat'

  const hasMedia = !!(quoted && mime && (mime.includes('image') || mime.includes('video')))
  const media = hasMedia ? await quoted.download?.().catch(() => null) : null

  m.reply(
    `🚀 *Broadcast Dimulai!*\n` +
    `📋 Target: *${targetIds.length}* ${typeLabel}\n` +
    `⏱️ Estimasi: ~${Math.ceil(targetIds.length * 3 / 60)} menit\n` +
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
    message: { conversation: global.namebot || 'NelBot-MD' }
  }

  for (const id of targetIds) {
    try {
      await new Promise(resolve => setTimeout(resolve, 3000)) // delay 3 detik anti-spam

      if (hasMedia && media) {
        const msgContent = mime?.includes('image')
          ? { image: media, caption: content || '' }
          : { video: media, caption: content || '' }
        await conn.sendMessage(id, msgContent, { quoted: fakeQuoted })
      } else {
        await conn.sendMessage(id, { text: content || '(pesan)' }, { quoted: fakeQuoted })
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

handler.help = ['bc <pesan>', 'bcgc <pesan>', 'bcall <pesan>']
handler.tags = ['owner']
handler.command = /^(bc|bcgc|bcall)$/i

export default handler
