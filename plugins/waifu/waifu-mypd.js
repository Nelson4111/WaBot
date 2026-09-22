import { loadDB, decayWaifuStatus } from '../../lib/waifuHelper.js'
import { toSmallNum, status } from '../../lib/style.js'

const MAX = 100
const clamp = v => Math.max(0, Math.min(MAX, v || 0))

// ===== PROGRESS BAR =====
const bar = (val, max = MAX) => {
  const size = 10
  const filled = Math.round((clamp(val) / max) * size)
  return '█'.repeat(filled) + '░'.repeat(size - filled)
}

// ===== STATUS TEKS =====
const moodText = v =>
  v >= 80 ? 'Sangat Bahagia (Senang Banget ♡)' :
  v >= 50 ? 'Bahagia (Senang)' :
  v >= 30 ? 'Biasa Saja' : 'Murung (Sedih 💔)'

const foodText = v =>
  v >= 80 ? 'Sangat Kenyang (Penuh)' :
  v >= 50 ? 'Kenyang (Cukup)' :
  v >= 30 ? 'Mulai Lapar' : 'Sangat Lapar (Butuh Makan ⚠)'

let handler = async (m, { conn, usedPrefix, command }) => {
  const db = loadDB()

  if (!db.couples) db.couples = {}
  if (!db.status) db.status = {}
  if (!db.profilePP) db.profilePP = {}

  const c = db.couples[m.sender]
  if (!c) {
    return m.reply(
      status.warning(
        `Kamu belum memiliki waifu!\n` +
        `> Cari karakter : *${usedPrefix}waifuchar <nama|uid>*\n` +
        `> Lamar karakter: *${usedPrefix}waifulamar <nama|uid>*`
      )
    )
  }

  // Hitung decay status alami
  decayWaifuStatus(m.sender)

  const st = db.status[m.sender] || {
    mood: 50,
    lapar: 50,
    afinitas: 0
  }

  const masterName = await conn.getName(m.sender)

  const caption = `*──  ୨୧ ✧ VIRTUAL WAIFU STATUS ✧ ୨୧  ──*

*╭  〔 𝜚 ɪ ɴ ꜰ ᴏ  ᴡ ᴀ ɪ ꜰ ᴜ 〕*
*┆* ⟡ ᴍᴀꜱᴛᴇʀ    : *${masterName}*
*┆* ᰔ ᴡᴀɪꜰᴜ     : *${c.charName}*
*┆* ◈ ᴜɪᴅ ᴍᴀʟ   : *#${toSmallNum(c.charId)}*
*┆* ✦ ᴀꜰɪɴɪᴛᴀꜱ   : *${toSmallNum(st.afinitas)} Poin*
*┆*
*┆* ✧ ᴍᴏᴏᴅ      : *${moodText(st.mood)}*
*┆*    ${bar(st.mood)} *${toSmallNum(clamp(st.mood))}/${toSmallNum(MAX)}*
*┆*
*┆* 🍱 ꜰᴏᴏᴅ      : *${foodText(st.lapar)}*
*┆*    ${bar(st.lapar)} *${toSmallNum(clamp(st.lapar))}/${toSmallNum(MAX)}*
*╰───────────────*

> *Menu Interaksi:*
> › *${usedPrefix}waifuact* (Berinteraksi)
> › *${usedPrefix}waifufood* (Beri makan)
> › *${usedPrefix}waifukerja* (Suruh bekerja)
> › *${usedPrefix}waifusetpp* (Ajukan foto custom)
> › *${usedPrefix}waifuputus* (Lepaskan waifu)`.trim()

  const pp = db.profilePP[c.charId] || c.image

  if (pp) {
    try {
      await conn.sendMessage(
        m.chat,
        { image: { url: pp }, caption },
        { quoted: m }
      )
      return
    } catch {
      // fallback ke teks jika media gagal di-fetch
    }
  }

  await m.reply(caption)
}

handler.command = /^(mywaifu|waifustatus|mypd)$/i
handler.tags = ['waifu']
handler.help = ['mywaifu']
handler.register = true

export default handler