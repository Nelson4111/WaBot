import { areJidsSameUser } from '@whiskeysockets/baileys'

const delay = ms => new Promise(res => setTimeout(res, ms))

let handler = async (m, { conn, text, isAdmin, isOwner, usedPrefix, command }) => {
  if (!isAdmin && !isOwner) {
    return m.reply('*╭  〔 ◈ ɪ ᴢ ɪ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Khusus untuk Administrator grup.\n*╰───────────────*')
  }

  let targets = []

  // 1. Dari Reply
  if (m.quoted && m.quoted.sender) {
    targets.push(m.quoted.sender)
  }

  // 2. Dari Mention
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    targets.push(...m.mentionedJid)
  }

  // 3. Dari Teks (Nomor HP)
  if (text) {
    let numbers = text.split(/[\s,]+/)
      .map(v => v.replace(/[^0-9]/g, ''))
      .filter(v => v.length >= 7 && v.length <= 15)
      .map(v => v + '@s.whatsapp.net')
    targets.push(...numbers)
  }

  let botJid = conn.decodeJid(conn.user.id || conn.user.jid)
  targets = [...new Set(targets)].filter(u => !areJidsSameUser(u, botJid))

  if (!targets.length) {
    return m.reply(`*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Balas pesan, tandai @tag, atau masukkan nomor target yang ingin dikeluarkan!\n> Contoh: *${usedPrefix + command} @user*\n*╰───────────────*`)
  }

  const metadata = await conn.groupMetadata(m.chat)
  const memberJids = metadata.participants.map(p => conn.decodeJid(p.id || p.jid))

  let kicked = []
  for (let user of targets) {
    let cleanJid = conn.decodeJid(user)
    if (!memberJids.includes(cleanJid)) continue
    try {
      await conn.groupParticipantsUpdate(m.chat, [cleanJid], 'remove')
      kicked.push(cleanJid)
      await delay(600)
    } catch (err) {
      console.error(`Failed to kick ${cleanJid}:`, err)
    }
  }

  if (kicked.length > 0) {
    const listLines = kicked.map(u => `*┆* ◈ @${u.split('@')[0].replace(/\D/g, '')} › *Dikeluarkan dari Grup*`).join('\n')
    const txt = `*──  ୨୧ ✧ TINDAKAN DISIPLIN GRUP ✧ ୨୧  ──*

> Pengguna berikut telah resmi dikeluarkan dari ruang grup:

*╭  〔 ◈ ᴅ ᴀ ꜰ ᴛ ᴀ ʀ  ᴋ ɪ ᴄ ᴋ 〕*
${listLines}
*╰───────────────*

> ｡˚ ⊹ _Mari senantiasa mematuhi peraturan grup agar suasana tetap tertib_ ⊹ ˚ ｡`.trim()

    return conn.sendMessage(m.chat, {
      text: txt,
      mentions: kicked
    }, { quoted: m })
  } else {
    return m.reply('*╭  〔 ◈ ɪ ɴ ꜰ ᴏ 〕*\n> Gagal mengeluarkan anggota. Pastikan target ada di dalam grup dan bot berstatus Admin.\n*╰───────────────*')
  }
}

handler.help = ['kick @user/nomor']
handler.tags = ['group']
handler.command = /^(kick|dor)$/i
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
