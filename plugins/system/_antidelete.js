/**
 * Anti-Delete System Plugin
 * Mendeteksi pesan terhapus dan mengirimkannya kembali ke grup
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

export async function handleAntidelete(conn, chatJid, cachedMsg, targetKey) {
  try {
    const sender = targetKey.participant || cachedMsg.key?.participant || targetKey.remoteJid
    const userNumber = (sender || '').split('@')[0].split(':')[0].replace(/\D/g, '')

    const d = new Date()
    const jam = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' })

    const rawMsg = cachedMsg.message || {}
    let mtype = Object.keys(rawMsg)[0] || 'conversation'
    if (mtype === 'messageContextInfo') {
      const keys = Object.keys(rawMsg).filter(k => k !== 'messageContextInfo')
      if (keys.length) mtype = keys[0]
    }

    const typeMap = {
      conversation: 'Teks Biasa',
      extendedTextMessage: 'Teks Panjang',
      imageMessage: 'Foto / Gambar',
      videoMessage: 'Video',
      stickerMessage: 'Stiker',
      audioMessage: 'Audio / Voice Note',
      documentMessage: 'Dokumen',
      locationMessage: 'Lokasi',
      contactMessage: 'Kontak'
    }
    const typeLabel = typeMap[mtype] || 'Pesan Media'

    const headerText = `*──  ୨୧ ✧ PESAN TERHAPUS TERDETEKSI ✧ ୨୧  ──*

*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴅ ᴇ ʟ ᴇ ᴛ ᴇ 〕*
*┆* ⟡ ᴘᴇɴɢɪʀɪᴍ : @${userNumber}
*┆* ✧ ᴡᴀᴋᴛᴜ    : *${jam} WIB*
*┆* ✦ ᴛɪᴘᴇ     : *${typeLabel}*
*╰───────────────*`.trim()

    // 1. Jika pesan teks murni
    if (mtype === 'conversation' || mtype === 'extendedTextMessage') {
      const deletedText = rawMsg[mtype]?.text || rawMsg.conversation || ''
      const fullText = `${headerText}

> *Isi Pesan Terhapus:*
> ${deletedText.split('\n').join('\n> ')}`

      await conn.sendMessage(chatJid, {
        text: fullText,
        mentions: [sender]
      }).catch(() => null)
      return
    }

    // 2. Jika pesan adalah media (gambar, video, stiker, audio, dokumen)
    await conn.sendMessage(chatJid, {
      text: headerText,
      mentions: [sender]
    }).catch(() => null)

    // Forward pesan asli tanpa quote
    if (typeof conn.copyNForward === 'function') {
      await conn.copyNForward(chatJid, cachedMsg, false).catch(async () => {
        // Fallback jika copyNForward gagal
        if (rawMsg[mtype]?.caption) {
          await conn.sendMessage(chatJid, {
            text: `> *Keterangan Media:* ${rawMsg[mtype].caption}`,
            mentions: [sender]
          }).catch(() => null)
        }
      })
    }
  } catch (err) {
    console.error('[ANTIDELETE HANDLER ERROR]:', err?.message || err)
  }
}

let handler = m => m
export default handler
