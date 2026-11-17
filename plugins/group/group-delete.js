const MAX_DELETE_AGE = 60 * 60 * 60 * 1000

let handler = async (m, { conn, isAdmin, isOwner, text, usedPrefix, command }) => {
  if (!m.quoted) {
    const input = text?.trim()
    if (!input) {
      return m.reply(`*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Balas (reply) pesan yang ingin kamu hapus!\n> Tanpa reply, gunakan *${usedPrefix + command} <jumlah>* atau *${usedPrefix + command} all* untuk menghapus pesan bot terbaru.\n*╰───────────────*`)
    }

    const isAll = /^all$/i.test(input)
    const requestedCount = /^\d+$/.test(input) ? Number(input) : NaN
    if (!isAll && (!Number.isSafeInteger(requestedCount) || requestedCount < 1)) {
      return m.reply(`Gunakan *${usedPrefix + command} <jumlah>* atau *${usedPrefix + command} all* tanpa reply.`)
    }
    if (!m.isGroup) return m.reply('Perintah jumlah atau *all* hanya dapat digunakan di grup.')
    if (!isAdmin) return m.reply('Perintah jumlah atau *all* hanya dapat digunakan oleh Admin grup.')

    const now = Date.now()
    const chatJid = conn.decodeJid?.(m.chat) || m.chat
    const history = conn.chats?.[chatJid]?.botMessages
    const eligibleMessages = (Array.isArray(history) ? history : [])
      .filter(message => {
        const key = message?.key
        const timestamp = Number(message?.timestamp)
        return (
          key?.id &&
          key.remoteJid === chatJid &&
          timestamp <= now &&
          now - timestamp < MAX_DELETE_AGE
        )
      })
      .sort((a, b) => b.timestamp - a.timestamp)
    const targets = isAll ? eligibleMessages : eligibleMessages.slice(0, requestedCount)

    if (!targets.length) {
      return m.reply('Tidak ada pesan bot yang tercatat dalam 60 jam terakhir. Pesan yang dikirim sebelum fitur pencatatan aktif tidak tersedia untuk dihapus dengan jumlah.')
    }

    let deleted = 0
    const deletedIds = new Set()
    let stoppedOnError = false
    for (const { key } of targets) {
      try {
        await conn.sendMessage(m.chat, {
          delete: { remoteJid: m.chat, fromMe: true, id: key.id }
        })
        deleted++
        deletedIds.add(key.id)
      } catch (error) {
        console.error(`[Group Delete] Gagal menghapus pesan bot ${key.id}:`, error?.message || error)
        stoppedOnError = true
        break
      }
    }

    if (history && deletedIds.size) {
      conn.chats[chatJid].botMessages = history.filter(({ key }) => !deletedIds.has(key?.id))
    }

    const summary = deleted
      ? `Berhasil menghapus ${deleted} pesan bot.`
      : stoppedOnError
        ? 'Tidak ada pesan yang berhasil dihapus.'
        : 'Tidak ada pesan yang dihapus.'
    return m.reply(`${summary}${stoppedOnError ? '\nProses dihentikan karena ada pesan yang tidak dapat dihapus.' : ''}`)
  }

  const { fromMe, id, sender } = m.quoted
  const rawPart = m.msg?.contextInfo?.participant || m.quoted.vM?.key?.participant || ''
  const primaryPart = (m.isGroup && !fromMe) ? (rawPart || sender) : undefined
  const altPart = (m.isGroup && !fromMe && rawPart && sender && rawPart !== sender) ? sender : undefined

  if (m.isGroup) {
    if (!(isAdmin || isOwner)) {
      if (!fromMe) {
        return m.reply('*╭  〔 ◈ ɪ ᴢ ɪ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Menghapus pesan anggota lain hanya dapat dilakukan oleh Administrator!\n> Kamu hanya dapat menghapus pesan yang dikirim oleh bot.\n*╰───────────────*')
      }
    }
  }

  // 1. Coba hapus langsung dengan m.quoted.delete()
  if (typeof m.quoted.delete === 'function') {
    await m.quoted.delete().catch(() => {})
  }

  // 2. Kirim delete dengan raw LID
  const key = {
    remoteJid: m.chat,
    fromMe: fromMe,
    id: id,
    ...(primaryPart ? { participant: primaryPart } : {})
  }
  await conn.sendMessage(m.chat, { delete: key }).catch(() => {})

  // 3. Cadangan jika WhatsApp membutuhkan format Phone JID
  if (altPart) {
    await conn.sendMessage(m.chat, { delete: { ...key, participant: altPart } }).catch(() => {})
  }
}

handler.help = ['delete', 'delete <jumlah>', 'delete all']
handler.tags = ['group']
handler.command = /^(del|delete|unsend?)$/i
handler.limit = false

export default handler