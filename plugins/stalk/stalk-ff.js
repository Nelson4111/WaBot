import axios from 'axios'
import * as cheerio from 'cheerio'
import FormData from 'form-data'
import { status, toSmallNum } from '../../lib/style.js'

// ─── Ryzumi Primary ──────────────────────────────────────────────────────────
async function ffStalkRyzumi(id) {
  const { data } = await axios.get(
    `https://api.ryzumi.net/api/stalk/freefire?userId=${encodeURIComponent(id)}`,
    {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
  )

  const info = data?.data?.basicinfo || data?.basicinfo || data
  if (!info || (!info.nickname && !info.accountid)) {
    throw new Error('Data Free Fire tidak ditemukan di Ryzumi')
  }

  const clan = data?.data?.claninfo || data?.claninfo || {}
  const stats = data?.data?.stats || data?.stats || {}

  return {
    nickname: info.nickname || '-',
    accountId: info.accountid || id,
    level: info.level || '-',
    exp: info.exp || '-',
    region: info.region || '-',
    likes: info.liked || 0,
    signature: data?.data?.inventory?.basic_info?.signature || '-',
    clanName: clan.clanname || '-',
    soloWins: stats.solostats?.wins || 0,
    soloKills: stats.solostats?.kills || 0,
    duoWins: stats.duostats?.wins || 0,
    duoKills: stats.duostats?.kills || 0,
    squadWins: stats.quadstats?.wins || 0,
    squadKills: stats.quadstats?.kills || 0
  }
}

// ─── Scraper Fallback ───────────────────────────────────────────────────────
async function ffStalkFallback(id) {
  const formdata = new FormData()
  formdata.append('uid', id)
  const { data } = await axios.post('https://tools.freefireinfo.in/profileinfo.php?success=1', formdata, {
    headers: {
      ...formdata.getHeaders(),
      "origin": "https://tools.freefireinfo.in",
      "referer": "https://tools.freefireinfo.in/profileinfo.php?success=1",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    },
    timeout: 15000
  })

  const $ = cheerio.load(data)
  const tr = $('div.result').html()?.split('<br>') || []
  if (!tr.length) throw new Error('Data tidak ditemukan.')

  const nickname = tr[0]?.split('Name: ')?.[1]?.trim() || '-'
  const level = tr[3]?.split(': ')?.[1]?.trim() || '-'
  const region = tr[5]?.split(': ')?.[1]?.trim() || '-'
  const likes = tr[2]?.split(': ')?.[1]?.trim() || '0'
  const bio = tr[14]?.split(': ')?.[1]?.trim() || '-'

  let clanName = '-'
  if (tr.length > 26 && tr[26]?.includes('Guild:')) {
    clanName = tr[26].split('Guild: ')?.[1]?.trim() || '-'
  }

  return {
    nickname,
    accountId: id,
    level,
    exp: '-',
    region,
    likes,
    signature: bio,
    clanName,
    soloWins: 0,
    soloKills: 0,
    duoWins: 0,
    duoKills: 0,
    squadWins: 0,
    squadKills: 0
  }
}

async function ffStalk(id) {
  try {
    return await ffStalkRyzumi(id)
  } catch (e) {
    console.warn('[FF Stalk Ryzumi failed]:', e.message)
    return await ffStalkFallback(id)
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const id = text?.trim()
  if (!id) {
    return m.reply(
      status.warning(
        `Masukkan User ID Free Fire!\n` +
        `> Contoh: *${usedPrefix + command} 83726718*`
      )
    )
  }

  await m.react('⏳')

  try {
    const res = await ffStalk(id)

    const caption = `*──  ୨୧ ✧ FREE FIRE STALKER ✧ ୨୧  ──*

*╭  〔 🎮 ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴀ ᴋ ᴜ ɴ 〕*
*┆* ⟡ ɴɪᴄᴋɴᴀᴍᴇ : *${res.nickname}*
*┆* ◈ ᴜꜱᴇʀ ɪᴅ  : *${toSmallNum(res.accountId)}*
*┆* ✧ ʟᴇᴠᴇʟ    : *${toSmallNum(res.level)}*
*┆* ❖ ʀᴇɢɪᴏɴ   : *${res.region}*
*┆* ᰔ ʟɪᴋᴇ     : *${toSmallNum(res.likes)}*
*┆* 👥 ɢᴜɪʟᴅ    : *${res.clanName}*
*╰───────────────*

${res.signature && res.signature !== '-' ? `*╭  〔 📝 ʙ ɪ ᴏ 〕*\n> ${res.signature}\n*╰───────────────*\n\n` : ''}*╭  〔 🏆 ꜱ ᴛ ᴀ ᴛ ɪ ꜱ ᴛ ɪ ᴋ 〕*
*┆* ⟡ ꜱᴏʟᴏ     : *${toSmallNum(res.soloWins)} Win / ${toSmallNum(res.soloKills)} Kill*
*┆* ✧ ᴅᴜᴏ      : *${toSmallNum(res.duoWins)} Win / ${toSmallNum(res.duoKills)} Kill*
*┆* ✦ ꜱǫᴜᴀᴅ    : *${toSmallNum(res.squadWins)} Win / ${toSmallNum(res.squadKills)} Kill*
*╰───────────────*

> _Informasi akun Free Fire berhasil ditemukan_`.trim()

    await m.reply(caption)
    await m.react('✅')
  } catch (error) {
    console.error('[FF Stalk Error]:', error)
    await m.react('❌')
    m.reply(status.error(`Gagal mendapatkan data Free Fire:\n> Pastikan ID (${id}) sudah benar.`))
  }
}

handler.help = ['ffstalk <id>', 'freestalk <id>']
handler.tags = ['stalk']
handler.command = /^(ffstalk|freestalk|stalkff)$/i
handler.limit = true

export default handler