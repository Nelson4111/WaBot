import { toSmallNum } from '../../lib/style.js'
import { formatDuration, getIntimacyRank } from '../../lib/pasanganHelper.js'

/**
 * Status Pernikahan Plugin
 * Menampilkan rincian status pernikahan, keintiman, dan cincin pasangan
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn }) => {
  const users = global.db.data.users
  const sender = conn.decodeJid(m.sender)
  const who = conn.decodeJid(m.mentionedJid?.[0] || m.quoted?.sender || sender)
  const whoNum = who.split('@')[0].replace(/\D/g, '')
  const isSelf = who === sender

  const pList = users[who]?.pasangan || []

  if (pList.length === 0) {
    const notMarriedText = isSelf
      ? `*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> Kamu saat ini berstatus single (Jomblo).\n> Gunakan perintah *.lamar @user* untuk mencari pasangan!\n*╰───────────────*`
      : `*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> @${whoNum} saat ini belum memiliki pasangan (Jomblo).\n*╰───────────────*`

    return conn.sendMessage(m.chat, {
      text: notMarriedText,
      mentions: [who]
    }, { quoted: m })
  }

  let cards = []
  pList.forEach((p, i) => {
    const partnerNum = p.jid.split('@')[0].replace(/\D/g, '')
    const dur = formatDuration(Date.now() - p.nikahTime)
    const dateStr = new Date(p.nikahTime).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    })
    const rank = getIntimacyRank(p.poinBucin || 0)

    let card = `*╭  〔 ᰔ ᴘ ᴀ ꜱ ᴀ ɴ ɢ ᴀ ɴ  ${toSmallNum(i + 1)} 〕*
*┆* ⟡ ᴘᴀꜱᴀɴɢᴀɴ   : @${partnerNum}
*┆* ✧ ᴛᴀɴɢɢᴀʟ    : *${dateStr}*
*┆* ✦ ᴅᴜʀᴀꜱɪ     : *${dur}*
*┆* ᰔ ᴘᴏɪɴ ʙᴜᴄɪɴ : *${toSmallNum(p.poinBucin || 0)} Poin*
*┆* ◈ ᴛɪɴɢᴋᴀᴛ    : *${rank.title}*
*┆* ✧ ʙᴜꜰꜰ       : *${rank.buff}*
*┆* ❖ ᴄɪɴᴄɪɴ     : *${p.cincin || 'Cincin Perak'}*
*╰───────────────*`
    cards.push(card)
  })

  const fullText = `*──  ୨୧ ✧ STATUS PERNIKAHAN RESMI ✧ ୨୧  ──*

> *おしらせ!* (ᴘʀᴏꜰɪʟ ᴘᴇʀɴɪᴋᴀʜᴀɴ)
> Informasi status ikatan pernikahan untuk @${whoNum} ♡

${cards.join('\n\n')}

> ｡˚ ⊹ _Ketik .kencan atau .loveclaim untuk meningkatkan keharmonisan!_ ⊹ ˚ ｡`.trim()

  return conn.sendMessage(m.chat, {
    text: fullText,
    mentions: [who, ...pList.map(p => p.jid)]
  }, { quoted: m })
}

handler.help = ['pasangan [@user]', 'ceknikah [@user]', 'istri', 'suami']
handler.tags = ['pasangan']
handler.command = /^(pasangan|ceknikah|istri|suami)$/i

export default handler
