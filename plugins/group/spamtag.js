import { toSmallNum } from '../../lib/style.js'

const delay = ms => new Promise(res => setTimeout(res, ms))

let handler = async (m, { conn, text, isOwner, isAdmin }) => {
  try {
    const mention = m.mentionedJid && m.mentionedJid.length > 0 ? m.mentionedJid[0] : ''
    if (!mention) {
      return m.reply('*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Tandai pengguna yang ingin kamu panggil berulang!\n> Contoh: *.spamtag @user*\n*╰───────────────*')
    }

    const user = global.db?.data?.users?.[m.sender]
    const maxCount = isOwner ? 10 : (user?.premium ? 5 : 3)
    const targetNum = mention.split('@')[0].replace(/\D/g, '')

    for (let i = 0; i < maxCount; i++) {
      await delay(600)
      await conn.sendMessage(m.chat, {
        text: `*╭  〔 ⟡ ᴘ ᴀ ɴ ɢ ɢ ɪ ʟ ᴀ ɴ  ${toSmallNum(i + 1)} 〕*\n> @${targetNum} mohon segera merespons panggilan penting ini.\n*╰───────────────*`,
        mentions: [mention]
      }, { quoted: m })
    }

    const doneTxt = `*──  ୨୧ ✧ PANGGILAN SELESAI ✧ ୨୧  ──*\n\n> Berhasil mengirimkan *${toSmallNum(maxCount)}* rangkaian panggilan untuk @${targetNum} ✦`
    await conn.sendMessage(m.chat, { text: doneTxt, mentions: [mention] }, { quoted: m })

  } catch (e) {
    m.reply(`*╭  〔 ◈ ᴇ ʀ ʀ ᴏ ʀ 〕*\n> Terjadi kendala saat melakukan spamtag: ${e.message}\n*╰───────────────*`)
  }
}

handler.command = ['spamtag']
handler.help = ['spamtag @user']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = false

export default handler