import { loadDB } from '../../lib/waifuHelper.js'

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
  v >= 80 ? 'Sangat Bahagia' :
  v >= 50 ? 'Senang' :
  v >= 30 ? 'Biasa' : 'Sedih'

const foodText = v =>
  v >= 80 ? 'Sangat Kenyang' :
  v >= 50 ? 'Kenyang' :
  v >= 30 ? 'Cukup' : 'Sangat Lapar'

let handler = async (m, { conn }) => {
  const db = loadDB()

  if (!db.couples) db.couples = {}
  if (!db.status) db.status = {}
  if (!db.profilePP) db.profilePP = {}

  const c = db.couples[m.sender]
  if (!c) return m.reply('Kamu belum punya pasangan')

  const st = db.status[m.sender] || {
    mood: 0,
    lapar: 0,
    afinitas: 0
  }

  const caption = `
────────────────────
${conn.getName(m.sender)} ❤️ ${c.charName}
────────────────────

➤ Poin Hubungan  : ${st.afinitas}

➤ Mood Pasangan   : ${moodText(st.mood)}
   ${bar(st.mood)} ${clamp(st.mood)}/${MAX}

➤ Food Pasangan   : ${foodText(st.lapar)}
   ${bar(st.lapar)} ${clamp(st.lapar)}/${MAX}
────────────────────
`.trim()

  const pp = db.profilePP[c.charId]

  if (pp) {
    try {
      await conn.sendMessage(
        m.chat,
        { image: { url: pp }, caption },
        { quoted: m }
      )
      return
    } catch {
      // fallback ke teks
    }
  }

  await m.reply(
    caption +
    '\n\nFoto pasangan belum tersedia\n' +
    'Reply gambar dengan perintah *.setpdpp*'
  )
}

handler.command = ['mypd']
handler.tags = ['waifu']
handler.help = ['mypd']
handler.register = true

export default handler