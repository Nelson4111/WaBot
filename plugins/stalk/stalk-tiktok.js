import axios from 'axios'
import * as cheerio from 'cheerio'
import { status, toSmallNum } from '../../lib/style.js'

// ─── Ryzumi Primary ──────────────────────────────────────────────────────────
async function tiktokStalkRyzumi(username) {
  const { data } = await axios.get(
    `https://api.ryzumi.net/api/stalk/tiktok?username=${encodeURIComponent(username)}`,
    {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
  )

  const u = data?.userInfo || data?.data?.userInfo || data?.user || data
  if (!u || (!u.username && !u.name && !u.id)) {
    throw new Error('Data profil TikTok tidak ditemukan di Ryzumi')
  }

  return {
    username: u.username || username,
    name: u.name || u.nickname || username,
    bio: u.bio || u.signature || '-',
    verified: !!u.verified,
    followers: u.totalFollowers || u.followers || 0,
    following: u.totalFollowing || u.following || 0,
    likes: u.totalLikes || u.likes || 0,
    videos: u.totalVideos || u.videos || 0,
    avatar: u.avatar || u.avatarLarger || null
  }
}

// ─── Scraper Fallback ───────────────────────────────────────────────────────
async function tiktokStalkScraper(username) {
  const response = await axios.get(`https://www.tiktok.com/@${username}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36'
    },
    timeout: 15000
  })
  const html = response.data
  const $ = cheerio.load(html)
  const scriptData = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').html()
  if (!scriptData) throw new Error('Data tidak ditemukan.')

  const parsedData = JSON.parse(scriptData)
  const userDetail = parsedData.__DEFAULT_SCOPE__?.['webapp.user-detail']
  if (!userDetail || userDetail.statusCode !== 0) throw new Error('User detail kosong.')

  const userInfo = userDetail.userInfo?.user
  const stats = userDetail.userInfo?.stats

  return {
    username: userInfo?.uniqueId || username,
    name: userInfo?.nickname || username,
    bio: userInfo?.signature || '-',
    verified: !!userInfo?.verified,
    followers: stats?.followerCount || 0,
    following: stats?.followingCount || 0,
    likes: stats?.heart || 0,
    videos: stats?.videoCount || 0,
    avatar: userInfo?.avatarLarger || userInfo?.avatarMedium || null
  }
}

async function getTikTokProfile(username) {
  try {
    return await tiktokStalkRyzumi(username)
  } catch (e) {
    console.warn('[TikTok Stalk Ryzumi failed]:', e.message)
    return await tiktokStalkScraper(username)
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const username = text?.replace(/^@/, '').trim()
  if (!username) {
    return m.reply(
      status.warning(
        `Masukkan username TikTok!\n` +
        `> Contoh: *${usedPrefix + command} khaby.lame*`
      )
    )
  }

  await m.react('⏳')

  try {
    const res = await getTikTokProfile(username)

    const caption = `*──  ୨୧ ✧ TIKTOK STALKER ✧ ୨୧  ──*

*╭  〔 𝜚 ᴘ ʀ ᴏ ꜰ ɪ ʟ 〕*
*┆* ⟡ ɴᴀᴍᴀ      : *${res.name}*
*┆* ◈ ᴜꜱᴇʀɴᴀᴍᴇ  : *@${res.username}*
*┆* ✧ ᴠᴇʀɪꜰɪᴇᴅ  : *${res.verified ? 'Ya ❖' : 'Tidak'}*
*┆* 👥 ꜰᴏʟʟᴏᴡᴇʀꜱ : *${toSmallNum(Number(res.followers).toLocaleString('id-ID'))}*
*┆* ᰔ ꜰᴏʟʟᴏᴡɪɴɢ : *${toSmallNum(Number(res.following).toLocaleString('id-ID'))}*
*┆* ❖ ʟɪᴋᴇꜱ     : *${toSmallNum(Number(res.likes).toLocaleString('id-ID'))}*
*┆* ⌬ ᴠɪᴅᴇᴏ     : *${toSmallNum(Number(res.videos).toLocaleString('id-ID'))}*
*╰───────────────*

${res.bio && res.bio !== '-' ? `*╭  〔 📝 ʙ ɪ ᴏ 〕*\n> ${res.bio}\n*╰───────────────*\n\n` : ''}> _https://www.tiktok.com/@${res.username}_`.trim()

    if (res.avatar) {
      await conn.sendMessage(m.chat, {
        image: { url: res.avatar },
        caption
      }, { quoted: m })
    } else {
      await m.reply(caption)
    }

    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    console.error('[TikTok Stalk Error]:', e)
    m.reply(status.error(`Gagal mengambil data TikTok @${username}:\n> Akun mungkin di-private atau tidak ditemukan.`))
  }
}

handler.help = ['ttstalk <username>', 'tiktokstalk <username>']
handler.tags = ['stalk']
handler.command = /^(ttstalk|tiktokstalk)$/i
handler.limit = true

export default handler