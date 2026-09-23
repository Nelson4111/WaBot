import axios from "axios"
import { status, toSmallNum } from '../../lib/style.js'

// ─── Ryzumi Primary ──────────────────────────────────────────────────────────
async function mlStalkRyzumi(userId, zoneId) {
  const { data } = await axios.get(
    `https://api.ryzumi.net/api/stalk/mobile-legends?userId=${encodeURIComponent(userId)}&zoneId=${encodeURIComponent(zoneId)}`,
    {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
  )

  if (data?.status !== 'success' || !data?.data?.username) {
    throw new Error(data?.message || 'Data Mobile Legends tidak ditemukan')
  }

  const d = data.data
  const age = data.accountAge || {}
  let ageStr = ''
  if (age.years || age.months || age.days) {
    const parts = []
    if (age.years) parts.push(`${age.years} Tahun`)
    if (age.months) parts.push(`${age.months} Bulan`)
    if (age.days) parts.push(`${age.days} Hari`)
    ageStr = parts.join(' ')
  }

  return {
    username: d.username,
    country: d.create_role_country || d.this_login_country || 'ID',
    regTime: d.user_reg_time || '-',
    accountAge: ageStr || '-'
  }
}

// ─── Fallback Scraper ───────────────────────────────────────────────────────
async function mlStalkFallback(userId, zoneId) {
  const home = await axios.get("https://www.gempaytopup.com", { timeout: 10000 })
  const cookies = home.headers["set-cookie"]?.join("; ") || ""
  const csrfToken = home.data.match(/<meta name="csrf-token" content="(.*?)">/)?.[1]
  if (!csrfToken) throw new Error("Gagal mengambil token verifikasi.")

  const { data } = await axios.post(
    "https://www.gempaytopup.com/stalk-ml",
    { uid: userId, zone: zoneId },
    {
      headers: {
        "X-CSRF-Token": csrfToken,
        "Content-Type": "application/json",
        Cookie: cookies
      },
      timeout: 12000
    }
  )

  if (!data?.username) throw new Error("ID atau Zone ID Mobile Legends tidak ditemukan.")
  return {
    username: data.username,
    country: data.region || 'ID',
    regTime: '-',
    accountAge: '-'
  }
}

async function mlStalk(userId, zoneId) {
  try {
    return await mlStalkRyzumi(userId, zoneId)
  } catch (e) {
    console.warn('[ML Stalk Ryzumi failed]:', e.message)
    return await mlStalkFallback(userId, zoneId)
  }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const [userId, zoneId] = (text || '').trim().split(/\s+/)

  if (!userId || !zoneId) {
    return m.reply(
      status.warning(
        `Masukkan User ID dan Zone ID Mobile Legends!\n` +
        `> Contoh: *${usedPrefix + command} 12345678 1234*`
      )
    )
  }

  await m.react('⏳')

  try {
    const res = await mlStalk(userId, zoneId)

    const caption = `*──  ୨୧ ✧ MOBILE LEGENDS STALKER ✧ ୨୧  ──*

*╭  〔 🎮 ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴀ ᴋ ᴜ ɴ 〕*
*┆* ⟡ ᴜꜱᴇʀɴᴀᴍᴇ : *${res.username}*
*┆* ◈ ᴜꜱᴇʀ ɪᴅ  : *${toSmallNum(userId)}*
*┆* ✧ ᴢᴏɴᴇ ɪᴅ  : *(${toSmallNum(zoneId)})*
*┆* ❖ ɴᴇɢᴀʀᴀ   : *${res.country}*
${res.accountAge !== '-' ? `*┆* ⧗ ᴜᴍᴜʀ     : *${toSmallNum(res.accountAge)}*\n` : ''}${res.regTime !== '-' ? `*┆* ⏱ ᴛᴇʀᴅᴀꜰᴛᴀʀ: *${toSmallNum(res.regTime)}*\n` : ''}*╰───────────────*

> _Informasi akun berhasil ditemukan_`.trim()

    await m.reply(caption)
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    m.reply(status.error(`Gagal mendapatkan data Mobile Legends:\n> ${e?.message || e}`))
  }
}

handler.help = ['mlstalk <userId> <zoneId>']
handler.tags = ['stalk']
handler.command = /^(mlstalk|stalkml)$/i
handler.limit = true

export default handler