import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚔️ *Genshin Impact Stalker*\n\nContoh penggunaan:\n*${usedPrefix + command}* 800000000`)

  let uid = text.trim()
  await conn.sendMessage(m.chat, { react: { text: "⏰", key: m.key } })

  // 1. Coba Ryzumi Genshin Stalk API
  try {
    let ryzRes = await axios.get(`https://api.ryzumi.net/api/stalk/genshin?userId=${encodeURIComponent(uid)}`, { timeout: 15000 })
    let data = ryzRes.data
    if (data && (data.nickname || data.player || data.playerInfo)) {
      let player = data.playerInfo || data.player || data
      let nick = player.nickname || data.nickname || '-'
      let ar = player.level || data.level || '-'
      let wl = player.worldLevel || data.worldLevel || '-'
      let sig = player.signature || data.signature || '-'
      let ach = player.finishAchievementNum || data.achievements || '-'

      let caption = `⚔️ *GENSHIN IMPACT STALKER*\n\n`
      caption += `👤 *Nickname:* ${nick}\n`
      caption += `🆔 *UID:* ${uid}\n`
      caption += `🌟 *Adventure Rank (AR):* ${ar}\n`
      caption += `🌍 *World Level (WL):* ${wl}\n`
      caption += `🏆 *Achievements:* ${ach}\n`
      if (sig !== '-') caption += `📝 *Signature:* ${sig}\n`

      await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
      return await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
    }
  } catch (e) {}

  // 2. Fallback ke Enka Network API
  try {
    let res = await axios.get(`https://enka.network/api/uid/${encodeURIComponent(uid)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000
    })
    let player = res.data?.playerInfo
    if (!player) throw new Error('UID tidak ditemukan atau profil Enka disembunyikan.')

    let caption = `⚔️ *GENSHIN IMPACT STALKER (FALLBACK)*\n\n`
    caption += `👤 *Nickname:* ${player.nickname || '-'}\n`
    caption += `🆔 *UID:* ${uid}\n`
    caption += `🌟 *Adventure Rank (AR):* ${player.level || '-'}\n`
    caption += `🌍 *World Level (WL):* ${player.worldLevel || '-'}\n`
    caption += `🏆 *Achievements:* ${player.finishAchievementNum || '-'}\n`
    caption += `🏰 *Abyss:* Spiral ${player.towerFloorIndex || '-'}-${player.towerLevelIndex || '-'}\n`
    if (player.signature) caption += `📝 *Signature:* ${player.signature}\n`

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
  } catch (err) {
    console.error('Genshin Stalk Error:', err)
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
    m.reply(`❌ *Gagal mengambil data Genshin:* ${err.message || 'UID tidak valid atau profil di-private.'}`)
  }
}

handler.help = ['genshinstalk <uid>', 'gistalk <uid>']
handler.tags = ['stalk']
handler.command = /^(genshinstalk|gistalk)$/i
handler.limit = true

export default handler
