import { toSmallNum } from '../../lib/style.js'

let handler = async (m, { conn }) => {
  if (!m.isGroup) {
    return m.reply('*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Perintah ini hanya dapat digunakan di dalam ruang grup.\n*╰───────────────*')
  }

  let metadata
  try {
    metadata = await conn.groupMetadata(m.chat)
  } catch (e) {
    return m.reply('*╭  〔 ◈ ᴇ ʀ ʀ ᴏ ʀ 〕*\n> Gagal mengambil metadata keanggotaan grup.\n*╰───────────────*')
  }

  const participants = metadata?.participants || []
  if (participants.length === 0) {
    return m.reply('*╭  〔 ◈ ɪ ɴ ꜰ ᴏ 〕*\n> Tidak ada data anggota yang terdeteksi.\n*╰───────────────*')
  }

  const counts = {
    indonesia: 0,
    malaysia: 0,
    singapura: 0,
    usa: 0,
    rusia: 0,
    lainnya: 0
  }

  for (const p of participants) {
    const rawJid = p.id || p.jid || p.phoneNumber
    if (!rawJid) continue
    const jid = conn.decodeJid(rawJid)
    const phone = jid.split('@')[0].replace(/\D/g, '')

    if (phone.startsWith('62')) counts.indonesia++
    else if (phone.startsWith('60')) counts.malaysia++
    else if (phone.startsWith('65')) counts.singapura++
    else if (phone.startsWith('1')) counts.usa++
    else if (phone.startsWith('7')) counts.rusia++
    else counts.lainnya++
  }

  const txt = `*──  ୨୧ ✧ ASAL ANGGOTA GRUP ✧ ୨୧  ──*

> *おしらせ!* (ꜱᴛᴀᴛɪꜱᴛɪᴋ ᴡɪʟᴀʏᴀʜ)
> Demografi nomor keanggotaan grup *${metadata.subject}*

*╭  〔 ❖ ᴅ ᴇ ᴍ ᴏ ɢ ʀ ᴀ ꜰ ɪ 〕*
*┆* ⟡ ɪɴᴅᴏɴᴇꜱɪᴀ   : *${toSmallNum(counts.indonesia)} Anggota*
*┆* ✧ ᴍᴀʟᴀʏꜱɪᴀ    : *${toSmallNum(counts.malaysia)} Anggota*
*┆* ✦ ꜱɪɴɢᴀᴘᴜʀᴀ   : *${toSmallNum(counts.singapura)} Anggota*
*┆* ◈ ᴜꜱᴀ / ᴋᴀɴᴀᴅᴀ: *${toSmallNum(counts.usa)} Anggota*
*┆* ⟡ ʀᴜꜱɪᴀ       : *${toSmallNum(counts.rusia)} Anggota*
*┆* ❖ ʟᴀɪɴɴʏᴀ     : *${toSmallNum(counts.lainnya)} Anggota*
*╰───────────────*

*╭  〔 ⟡ ᴛ ᴏ ᴛ ᴀ ʟ 〕*
*┆* ✦ ᴛᴏᴛᴀʟ ᴍᴇᴍʙᴇʀ : *${toSmallNum(participants.length)} Anggota*
*╰───────────────*

> ｡˚ ⊹ _Menghubungkan persahabatan dari berbagai penjuru wilayah_ ⊹ ˚ ｡`.trim()

  return m.reply(txt)
}

handler.help = ['cekasalmember']
handler.tags = ['group']
handler.command = /^(cekasalmember|demografi(gc)?)$/i
handler.group = true

export default handler