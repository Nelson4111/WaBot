import { areJidsSameUser } from '@whiskeysockets/baileys'

const delay = ms => new Promise(res => setTimeout(res, ms))

let handler = async (m, { conn, participants, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) {
    return m.reply('*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Perintah ini hanya dapat digunakan di dalam ruang grup.\n*╰───────────────*')
  }
  if (!isAdmin) {
    return m.reply('*╭  〔 ◈ ɪ ᴢ ɪ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Khusus untuk Administrator grup.\n*╰───────────────*')
  }
  if (!isBotAdmin) {
    return m.reply('*╭  〔 ◈ ɪ ᴢ ɪ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Bot harus menjadi Administrator terlebih dahulu.\n*╰───────────────*')
  }

  // Ambil target dari tag atau reply
  let targets = []
  if (m.mentionedJid && m.mentionedJid.length) {
    targets = m.mentionedJid
  } else if (m.quoted && m.quoted.sender) {
    targets = [m.quoted.sender]
  }

  if (!targets.length) {
    return m.reply('*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Tandai (tag) atau balas (reply) pesan admin yang ingin diturunkan jabatannya!\n*╰───────────────*')
  }

  let demoted = []

  for (let user of targets) {
    let jid = conn.decodeJid(user)

    let member = participants.find(p =>
      areJidsSameUser(conn.decodeJid(p.id || ''), jid) || 
      areJidsSameUser(conn.decodeJid(p.phoneNumber || ''), jid) ||
      areJidsSameUser(conn.decodeJid(p.jid || ''), jid)
    )

    if (!member) continue
    if (!(member.admin === 'admin' || member.admin === 'superadmin' || member.isAdmin || member.isSuperAdmin)) continue

    try {
      await conn.groupParticipantsUpdate(m.chat, [jid], 'demote')
      demoted.push(jid)
      await delay(800)
    } catch (e) {
      console.error('Error demoting user:', e)
    }
  }

  if (demoted.length > 0) {
    const listLines = demoted.map(u => `*┆* ◈ @${u.split('@')[0].replace(/\D/g, '')} › *Kembali Menjadi Anggota*`).join('\n')
    const txt = `*──  ୨୧ ✧ PERUBAHAN JABATAN PENGURUS ✧ ୨୧  ──*

> Pengguna berikut telah diberhentikan dari jabatan Administrator grup:

*╭  〔 ◈ ᴅ ᴀ ꜰ ᴛ ᴀ ʀ  ᴅ ᴇ ᴍ ᴏ ᴛ ᴇ 〕*
${listLines}
*╰───────────────*

> ｡˚ ⊹ _Terima kasih atas kontribusi dan dedikasi selama bertugas_ ⊹ ˚ ｡`.trim()

    return conn.sendMessage(m.chat, {
      text: txt,
      mentions: demoted
    }, { quoted: m })
  } else {
    return m.reply('*╭  〔 ◈ ɪ ɴ ꜰ ᴏ 〕*\n> Tidak ada admin yang dapat diturunkan jabatannya.\n*╰───────────────*')
  }
}

handler.help = ['demote @tag']
handler.tags = ['group']
handler.command = /^demote$/i

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
