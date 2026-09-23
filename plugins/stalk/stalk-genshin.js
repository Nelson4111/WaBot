import axios from 'axios'
import { status, toSmallNum } from '../../lib/style.js'

async function genshinRyzumi(uid) {
  const { data } = await axios.get(
    `https://api.ryzumi.net/api/stalk/genshin?userId=${encodeURIComponent(uid)}`,
    {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
  )

  const meta = data?.meta || data?.playerInfo || data?.player || data
  if (!meta || (!meta.nickname && !meta.uid)) {
    throw new Error('Data Genshin Impact tidak ditemukan di Ryzumi')
  }

  const abyss = meta.spiralAbyss || {}
  const abyssStr = abyss.floor ? `Lantai ${abyss.floor}-${abyss.chamber} (${abyss.stars}★)` : '-'

  return {
    nickname: meta.nickname || '-',
    uid: meta.uid || uid,
    level: meta.level || '-',
    worldLevel: meta.worldLevel || '-',
    achievements: meta.achievements || 0,
    signature: meta.signature || '-',
    abyss: abyssStr
  }
}

async function genshinEnkaFallback(uid) {
  const res = await axios.get(`https://enka.network/api/uid/${encodeURIComponent(uid)}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 15000
  })
  const player = res.data?.playerInfo
  if (!player) throw new Error('UID tidak ditemukan atau profil Enka disembunyikan.')

  const abyssStr = player.towerFloorIndex ? `Lantai ${player.towerFloorIndex}-${player.towerLevelIndex}` : '-'
  return {
    nickname: player.nickname || '-',
    uid,
    level: player.level || '-',
    worldLevel: player.worldLevel || '-',
    achievements: player.finishAchievementNum || 0,
    signature: player.signature || '-',
    abyss: abyssStr
  }
}

async function getGenshin(uid) {
  try {
    return await genshinRyzumi(uid)
  } catch (e) {
    console.warn('[Genshin Ryzumi failed]:', e.message)
    return await genshinEnkaFallback(uid)
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const uid = text?.trim()
  if (!uid) {
    return m.reply(
      status.warning(
        `Masukkan UID Genshin Impact!\n` +
        `> Contoh: *${usedPrefix + command} 800000000*`
      )
    )
  }

  await m.react('⏳')

  try {
    const res = await getGenshin(uid)

    const caption = `*──  ୨୧ ✧ GENSHIN IMPACT STALKER ✧ ୨୧  ──*

*╭  〔 ⚔ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴀ ᴋ ᴜ ɴ 〕*
*┆* ⟡ ɴɪᴄᴋɴᴀᴍᴇ   : *${res.nickname}*
*┆* ◈ ᴜɪᴅ        : *${toSmallNum(res.uid)}*
*┆* ✧ ᴀʀ (ʟᴇᴠᴇʟ) : *${toSmallNum(res.level)}*
*┆* ❖ ᴡᴏʀʟᴅ ʟᴠʟ  : *${toSmallNum(res.worldLevel)}*
*┆* 🏆 ᴘᴇɴᴄᴀᴘᴀɪᴀɴ : *${toSmallNum(res.achievements)}*
*┆* 🏰 ᴀʙʏꜱꜱ      : *${toSmallNum(res.abyss)}*
*╰───────────────*

${res.signature && res.signature !== '-' ? `*╭  〔 📝 ꜱ ɪ ɢ ɴ ᴀ ᴛ ᴜ ʀ ᴇ 〕*\n> ${res.signature}\n*╰───────────────*\n\n` : ''}> _Informasi profil Genshin Impact berhasil ditemukan_`.trim()

    await m.reply(caption)
    await m.react('✅')
  } catch (err) {
    console.error('[Genshin Stalk Error]:', err)
    await m.react('❌')
    m.reply(status.error(`Gagal mengambil data Genshin:\n> ${err.message || 'UID tidak valid atau akun di-private.'}`))
  }
}

handler.help = ['genshinstalk <uid>', 'gistalk <uid>']
handler.tags = ['stalk']
handler.command = /^(genshinstalk|gistalk|stalkgi)$/i
handler.limit = true

export default handler
