import { toSmallNum } from '../../lib/style.js'

/**
 * Ramalan Jodoh & Jodohin Plugin
 * Menganalisis kecocokan jodoh antar anggota grup
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

const getRamalanByScore = (score) => {
  if (score >= 85) return "Pasangan takdir langit! Sangat serasi, harmonis, dan saling melengkapi."
  if (score >= 65) return "Sangat cocok! Miliki visi sejalan dan saling memahami satu sama lain."
  if (score >= 45) return "Cukup serasi, riak-riak kecil dalam hubungan justru mempererat rasa rindu."
  if (score >= 25) return "Terkadang timbul perbedaan sudut pandang, namun ketulusan selalu mendamaikan."
  return "Perlu komitmen lebih kuat agar tidak terjebak dalam hubungan tanpa kepastian."
}

let handler = async (m, { conn, usedPrefix, command, participants }) => {
  const inputCmd = command.toLowerCase()
  const senderJid = conn.decodeJid(m.sender)
  const senderNum = senderJid.split('@')[0].replace(/\D/g, '')

  // 1. JODOHKU / JODOH (Memilih anggota acak di grup)
  if (['jodoh', 'jodohku'].includes(inputCmd)) {
    if (!m.isGroup) {
      return m.reply('*╭  〔 ᰔ ɢ ʀ ᴜ ᴘ  ꜱ ᴀ ᴊ ᴀ 〕*\n> Fitur ramalan jodoh acak hanya dapat digunakan di grup!\n*╰───────────────*')
    }

    const members = (participants || [])
      .map(u => conn.decodeJid(u.id || u.jid))
      .filter(v => v !== senderJid && v !== conn.user.jid)

    if (members.length === 0) {
      return m.reply('*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> Anggota grup belum mencukupi untuk ramalan jodoh.\n*╰───────────────*')
    }

    const randomJodoh = members[Math.floor(Math.random() * members.length)]
    const targetNum = randomJodoh.split('@')[0].replace(/\D/g, '')
    const score = Math.floor(Math.random() * 85) + 15
    const ramalan = getRamalanByScore(score)

    const txt = `*──  ୨୧ ✧ RAMALAN JODOH TAKDIR ✧ ୨୧  ──*

*╭  〔 ᰔ ʜ ᴀ ꜱ ɪ ʟ  ʀ ᴀ ᴍ ᴀ ʟ ᴀ ɴ 〕*
*┆* ⟡ ᴘᴇᴍᴏʜᴏɴ    : @${senderNum}
*┆* ✧ ᴊᴏᴅᴏʜ ᴛᴀᴋᴅɪʀ: @${targetNum}
*┆* ✦ ᴋᴇᴄᴏᴄᴏᴋᴀɴ  : *${toSmallNum(score)}%*
*┆* ◈ ᴀɴᴀʟɪꜱɪꜱ   : ${ramalan}
*╰───────────────*

> ｡˚ ⊹ _Mulailah menyapa jodohmu dengan perintah .lamar @tag!_ ⊹ ˚ ｡`.trim()

    return conn.sendMessage(m.chat, {
      text: txt,
      mentions: [senderJid, randomJodoh]
    }, { quoted: m })
  }

  // 2. JODOHIN / CEKJODOH (Menganalisis 2 orang tertentu)
  if (['jodohin', 'cekjodoh'].includes(inputCmd)) {
    const targets = m.mentionedJid || []
    if (targets.length < 2) {
      return m.reply(`*╭  〔 ᰔ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Tandai 𝟸 orang untuk dianalisis kecocokan jodohnya!\n> Contoh: *${usedPrefix + command} @user1 @user2*\n*╰───────────────*`)
    }

    const user1 = targets[0]
    const user2 = targets[1]
    const u1Num = user1.split('@')[0].replace(/\D/g, '')
    const u2Num = user2.split('@')[0].replace(/\D/g, '')

    const score = Math.floor(Math.random() * 85) + 15
    const ramalan = getRamalanByScore(score)

    const txt = `*──  ୨୧ ✧ ANALISIS KECOCOKAN JODOH ✧ ୨୧  ──*

*╭  〔 ᰔ ʜ ᴀ ꜱ ɪ ʟ  ᴀ ɴ ᴀ ʟ ɪ ꜱ ɪ ꜱ 〕*
*┆* ⟡ ᴘᴀꜱᴀɴɢᴀɴ   : @${u1Num} ♡ @${u2Num}
*┆* ✧ ᴋᴇᴄᴏᴄᴏᴋᴀɴ  : *${toSmallNum(score)}%*
*┆* ✦ ᴀɴᴀʟɪꜱɪꜱ   : ${ramalan}
*╰───────────────*

> ｡˚ ⊹ _Keserasian hati dibangun melalui saling pengertian dan komitmen_ ⊹ ˚ ｡`.trim()

    return conn.sendMessage(m.chat, {
      text: txt,
      mentions: [user1, user2]
    }, { quoted: m })
  }
}

handler.help = ['jodoh', 'jodohku', 'jodohin @u1 @u2', 'cekjodoh @u1 @u2']
handler.tags = ['pasangan']
handler.command = /^(jodoh|jodohku|jodohin|cekjodoh)$/i

export default handler
