let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Perintah ini hanya bisa digunakan di grup.')

  let metadata
  try {
    metadata = await conn.groupMetadata(m.chat)
  } catch (e) {
    return m.reply('❌ Gagal mengambil data grup.')
  }

  let participants = metadata.participants || []

  let countIndonesia = 0
  let countMalaysia = 0
  let countUSA = 0
  let countRussia = 0
  let countOther = 0

  for (let p of participants) {
    // Gunakan JID asli, bukan LID
    let jid = p.jid
    if (!jid) continue

    let phone = jid.split('@')[0]

    if (phone.startsWith('62')) countIndonesia++
    else if (phone.startsWith('60')) countMalaysia++
    else if (phone.startsWith('1')) countUSA++
    else if (phone.startsWith('7')) countRussia++
    else countOther++
  }

  let msg = `
📊 *Asal Anggota Grup*

🇮🇩 Indonesia : *${countIndonesia}*
🇲🇾 Malaysia  : *${countMalaysia}*
🇺🇸 USA       : *${countUSA}*
🇷🇺 Rusia     : *${countRussia}*
🌍 Lainnya    : *${countOther}*

👥 Total : *${participants.length}*
`.trim()

  m.reply(msg)
}

handler.help = ['cekasalmember']
handler.tags = ['group']
handler.command = /^cekasalmember$/i
handler.group = true

export default handler