import { toSmallNum } from '../../lib/style.js'
import { CINCIN_SHOP } from '../../lib/pasanganHelper.js'

/**
 * Butik Cincin Pernikahan Plugin
 * Membeli dan menyematkan cincin pernikahan untuk memperbarui ikatan
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn, usedPrefix, args }) => {
  const users = global.db.data.users
  const sender = conn.decodeJid(m.sender)
  const pList = users[sender]?.pasangan || []

  if (pList.length === 0) {
    return m.reply('*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> Kamu belum memiliki pasangan untuk dihadiahi cincin pernikahan.\n*╰───────────────*')
  }

  const arg = (args[0] || '').toLowerCase()
  if (!arg || !CINCIN_SHOP[arg]) {
    let rows = []
    for (let key in CINCIN_SHOP) {
      const item = CINCIN_SHOP[key]
      rows.push(`*┆* ${item.icon} *${item.name}* : *${toSmallNum(item.price)} Limit* (› *${usedPrefix}belicincin ${key}*)`)
    }

    const shopTxt = `*──  ୨୧ ✧ BUTIK CINCIN PERNIKAHAN ✧ ୨୧  ──*

> *おしらせ!* (ᴋᴀᴛᴀʟᴏɢ ᴄɪɴᴄɪɴ)
> Perbarui cincin pernikahanmu untuk memperindah profil pasangan!

*╭  〔 ❖ ᴅ ᴀ ꜰ ᴛ ᴀ ʀ  ᴄ ɪ ɴ ᴄ ɪ ɴ 〕*
${rows.join('\n')}
*╰───────────────*

> ｡˚ ⊹ _Sematkan cincin terindah sebagai lambang ketulusan janjimu_ ⊹ ˚ ｡`.trim()

    return m.reply(shopTxt)
  }

  const item = CINCIN_SHOP[arg]
  const userLimit = users[sender].limit || 0

  if (userLimit < item.price) {
    return m.reply(`*╭  〔 ◈ ʟ ɪ ᴍ ɪ ᴛ  ᴋ ᴜ ʀ ᴀ ɴ ɢ 〕*\n> Saldo Limitmu tidak mencukupi!\n> Harga ${item.name} adalah *${toSmallNum(item.price)} Limit*, Limitmu saat ini: *${toSmallNum(userLimit)}*.\n*╰───────────────*`)
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

> Selamat! Pembelian *${item.name}* telah berhasil ♡

*╭  〔 ❖ ɪ ɴ ꜰ ᴏ  ᴄ ɪ ɴ ᴄ ɪ ɴ 〕*
*┆* ⟡ ɴᴀᴍᴀ ᴄɪɴᴄɪɴ : *${item.name}*
*┆* ✧ ʙɪᴀʏᴀ       : *${toSmallNum(item.price)} Limit*
*┆* ✦ ꜱᴛᴀᴛᴜꜱ      : *Tersemat Indah di Jari Pasangan*
*╰───────────────*

> ｡˚ ⊹ _Cincin baru kini telah terpasang di status pernikahan kalian!_ ⊹ ˚ ｡`.trim()

  return m.reply(successText)
}

handler.help = ['belicincin <perak|emas|diamond>', 'cincin']
handler.tags = ['pasangan']
handler.command = /^(belicincin|cincin)$/i

export default handler
