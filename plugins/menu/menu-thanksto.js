import { getGreeting } from '../../lib/style.js'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str).replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, usedPrefix }) => {
  const users = global.db.data.users || {}
  const settings = (global.db.data.settings && global.db.data.settings[conn.user.jid]) || {}
  const customThanks = global.db.data.thanks || []

  // 1. Ambil & Urutkan Donatur Teratas
  const sortedDonors = Object.entries(users)
    .filter(([_, data]) => data.totalDonasi && data.totalDonasi > 0)
    .sort((a, b) => b[1].totalDonasi - a[1].totalDonasi)
    .slice(0, 15)

  // Hitung total donasi global
  const totalGlobal = settings.totalDonasi || sortedDonors.reduce((acc, curr) => acc + (curr[1].totalDonasi || 0), 0)

  const mentionsData = []

  // 2. Susun Bagian Papan Donatur
  let donorLines = ''
  if (sortedDonors.length === 0) {
    donorLines = `*┆* _Belum ada donatur terdaftar saat ini._\n*┆* _Ketik *${usedPrefix}donasi* untuk mendukung server!_`
  } else {
    donorLines = sortedDonors.map(([jid, data], i) => {
      const badge = i === 0 ? '❖' : i === 1 ? '✮' : i === 2 ? '✦' : '◈'
      const numStr = toSmallNum(i + 1)
      let nameDisplay = ''

      if (data.namaDonasi) {
        nameDisplay = `*${data.namaDonasi}*`
      } else {
        nameDisplay = `@${jid.split('@')[0]}`
        mentionsData.push(jid)
      }

      const nominalStr = toSmallNum(data.totalDonasi.toLocaleString('id-ID'))
      return `*┆* ${badge} [${numStr}] ${nameDisplay} : *Rp ${nominalStr}*`
    }).join('\n')
  }

  // 3. Susun Bagian Kontributor
  let contribLines = `*┆* ❖ *Nenel* : _Developer / Owner_\n*┆* ✦ *Eza* : _Asisten / Co-Owner_`
  if (customThanks.length > 0) {
    const extraLines = customThanks.map(t => `*┆* ⟡ *${t.name}* : _${t.role}_`).join('\n')
    contribLines += `\n${extraLines}`
  }

  const userGreeting = getGreeting(m.name || m.pushName || 'Sobat')

  const caption = `*──  ୨୧ ✧ ᴛʜᴀɴᴋꜱ ᴛᴏ & ᴅᴏɴᴀᴛᴜʀ ✧ ୨୧  ──*

> *おしらせ!* (ꜱᴘᴇᴄɪᴀʟ ᴛʜᴀɴᴋꜱ!)
> ${userGreeting}
> _Apresiasi setulus hati kepada seluruh pihak yang telah mendedikasikan waktu, tenaga, dan dukungan finansial untuk keberlangsungan Avelia Bot._

*╭  〔 ❖ ᴋ ᴏ ɴ ᴛ ʀ ɪ ʙ ᴜ ᴛ ᴏ ʀ 〕*
${contribLines}
*╰──────────────────────*

*╭  〔 ᰔ ᴘ ᴀ ᴘ ᴀ ɴ  ᴅ ᴏ ɴ ᴀ ᴛ ᴜ ʀ 〕*
*┆* ⌬ ᴛᴏᴛᴀʟ ᴅᴏɴᴀꜱɪ : *Rp ${toSmallNum(totalGlobal.toLocaleString('id-ID'))}*
*┆* ──────────────────
${donorLines}
*╰──────────────────────*

> ｡˚ ⊹ *ꜱᴀʟᴜʀᴋᴀɴ ᴅᴜᴋᴜɴɢᴀɴ ᴀɴᴅᴀ ᴍᴇʟᴀʟᴜɪ ᴛᴏᴍʙᴏʟ ᴅᴏɴᴀꜱɪ* ⊹ ˚ ｡`.trim()

  const buttons = [
    ['ᰔ Dukung Donasi', `${usedPrefix}donasi`],
    ['⟡ Menu Utama', `${usedPrefix}allmenu`]
  ]

  try {
    return await conn.sendButton(
      m.chat,
      caption,
      `${global.namebot} • Hall of Fame & Contributors`,
      null,
      buttons,
      m,
      { mentions: mentionsData }
    )
  } catch (err) {
    return await conn.sendMessage(
      m.chat,
      {
        text: `${caption}\n\n*Perintah Cepat:*\n• *${usedPrefix}donasi*\n• *${usedPrefix}allmenu*`,
        mentions: mentionsData
      },
      { quoted: m }
    )
  }
}

handler.help = ['thanksto', 'tqto', 'credits']
handler.tags = ['thanksto', 'main', 'info']
handler.command = /^(thanksto|tqto|credits|menutqto|menuthanksto)$/i

export default handler
