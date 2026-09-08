import { toSmallNum } from '../../lib/style.js'

/**
 * Mantra Pelet Cinta Plugin
 * Simulasi ritual mantra asmara dengan persentase keberhasilan
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn, usedPrefix, command }) => {
  const target = m.mentionedJid?.[0]
  if (!target) {
    return m.reply(`*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Tandai orang yang ingin kamu berikan mantra perhatian!\n> Contoh: *${usedPrefix + command} @tag*\n*╰───────────────*`)
  }

  const senderJid = conn.decodeJid(m.sender)
  const targetNum = target.split('@')[0].replace(/\D/g, '')

  const chance = Math.floor(Math.random() * 100)
  const isSuccess = chance > 40

  const statusText = isSuccess ? 'BERHASIL' : 'GAGAL'
  const detailText = isSuccess
    ? `@${targetNum} kini mulai memikirkanmu dan menantikan kehadiranmu setiap saat.`
    : `Target memiliki benteng hati yang kokoh! Mantra tidak mempan dan memantul kembali padamu.`

  const txt = `*──  ୨୧ ✧ RITUAL MANTRA CINTA ✧ ୨୧  ──*

*╭  〔 ◈ ᴘ ᴇ ʟ ᴇ ᴛ  ᴄ ɪ ɴ ᴛ ᴀ 〕*
*┆* ⟡ ᴛᴀʀɢᴇᴛ   : @${targetNum}
*┆* ✧ ᴘᴇʟᴜᴀɴɢ  : *${toSmallNum(chance)}%*
*┆* ✦ ꜱᴛᴀᴛᴜꜱ   : *${statusText}*
*╰───────────────*

> ${detailText}

> ｡˚ ⊹ _Cinta sejati tumbuh dari ketulusan, bukan paksaan mantra_ ⊹ ˚ ｡`.trim()

  return conn.sendMessage(m.chat, {
    text: txt,
    mentions: [senderJid, target]
  }, { quoted: m })
}

handler.help = ['pelet @user']
handler.tags = ['pasangan']
handler.command = /^(pelet)$/i

export default handler
