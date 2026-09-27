import { toSmallNum } from '../../lib/style.js'
import { CINCIN_SHOP, isPasanganHidden, replyPasanganPrivately } from '../../lib/pasanganHelper.js'

/**
 * Butik Cincin Pernikahan Plugin
 * Membeli dan menyematkan cincin pernikahan untuk memperbarui ikatan
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn, usedPrefix, args }) => {
  const users = global.db.data.users
  const sender = conn.decodeJid(m.sender)
  const pList = users[sender]?.pasangan || []
  const hidden = isPasanganHidden(users[sender] || {})
  const sendResult = (text) => hidden ? replyPasanganPrivately(conn, m, text) : m.reply(text)

  if (pList.length === 0) {
    return sendResult('*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> Kamu belum memiliki pasangan untuk dihadiahi cincin pernikahan.\n*╰───────────────*')
  }

  const arg = (args[0] || '').toLowerCase()
  if (!arg || !CINCIN_SHOP[arg]) {
    const rows = Object.entries(CINCIN_SHOP).map(([, item]) =>
      `> ${item.icon} *${item.name}*  •  ${toSmallNum(item.price)} Limit`
    )
    const choices = Object.keys(CINCIN_SHOP).join('|')

    const shopTxt = `*──  ୨୧ ✧ BUTIK CINCIN PERNIKAHAN ✧ ୨୧  ──*

*╭  〔 ❖ ᴅ ᴀ ꜰ ᴛ ᴀ ʀ  ᴄ ɪ ɴ ᴄ ɪ ɴ 〕*
${rows.join('\n')}
*╰───────────────*

*📌 BELI CINCIN*
> *${usedPrefix}belicincin <${choices}>*`.trim()

    return sendResult(shopTxt)
  }

  const item = CINCIN_SHOP[arg]
  const userLimit = users[sender].limit || 0

  if (userLimit < item.price) {
    return sendResult(`*╭  〔 ◈ ʟ ɪ ᴍ ɪ ᴛ  ᴋ ᴜ ʀ ᴀ ɴ ɢ 〕*\n> Saldo Limitmu tidak mencukupi!\n> Harga ${item.name} adalah *${toSmallNum(item.price)} Limit*, Limitmu saat ini: *${toSmallNum(userLimit)}*.\n*╰───────────────*`)
  }

  users[sender].limit -= item.price

  // Pasang cincin ke semua pasangan
  pList.forEach(p => {
    p.cincin = item.name
    if (users[p.jid] && users[p.jid].pasangan) {
      const rec = users[p.jid].pasangan.find(x => x.jid === sender)
      if (rec) rec.cincin = item.name
    }
  })

  const successText = `*──  ୨୧ ✧ CINCIN RESMI DIPERBARUI ✧ ୨୧  ──*

> Pembelian *${item.icon} ${item.name}* berhasil.

*╭  〔 ❖ ɪ ɴ ꜰ ᴏ  ᴄ ɪ ɴ ᴄ ɪ ɴ 〕*
*┆* ⟡ ɴᴀᴍᴀ ᴄɪɴᴄɪɴ : *${item.icon} ${item.name}*
*┆* ✧ ʙɪᴀʏᴀ       : *${toSmallNum(item.price)} Limit*
*┆* ✦ ꜱᴛᴀᴛᴜꜱ      : *Tersemat Indah di Jari Pasangan*
*╰───────────────*

> Terpasang pada seluruh ikatan hubunganmu.`.trim()

  return sendResult(successText)
}

handler.help = ['belicincin <silver|gold|topaz|amethyst|ruby|sapphire|emerald|platinum|diamond|jade>', 'cincin']
handler.tags = ['pasangan']
handler.command = /^(belicincin|cincin)$/i

export default handler
