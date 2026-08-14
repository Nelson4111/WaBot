import axios from 'axios'
import * as cheerio from 'cheerio'

async function tiktokStalkScraper(username) {
  try {
    const response = await axios.get(`https://www.tiktok.com/@${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    })
    const html = response.data
    const $ = cheerio.load(html)
    const scriptData = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').html()
    if (!scriptData) return null

    const parsedData = JSON.parse(scriptData)
    const userDetail = parsedData.__DEFAULT_SCOPE__?.['webapp.user-detail']

    if (!userDetail || userDetail.statusCode !== 0) return null

    const userInfo = userDetail.userInfo?.user
    const stats = userDetail.userInfo?.stats

    return {
      username: userInfo?.uniqueId || username,
      name: userInfo?.nickname || null,
      bio: userInfo?.signature || null,
      verified: userInfo?.verified || false,
      followers: stats?.followerCount || 0,
      following: stats?.followingCount || 0,
      likes: stats?.heart || 0,
      videos: stats?.videoCount || 0,
      avatar: userInfo?.avatarLarger || userInfo?.avatarMedium || null
    }
  } catch (error) {
    return null
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Contoh: *${usedPrefix + command}* khaby.lame`)

  await m.react('⏳')
  let username = text.replace(/^@/, '').trim()

  // Helper untuk format caption seragam di seluruh layer fallback
  const makeCaption = ({ name, username, verified, isPrivate, followers, following, likes, videos, bio }) => {
    let caption = `📤 *TIKTOK STALKER*\n\n`
    caption += `👤 *Nama:* ${name || '-'}\n`
    caption += `🏷️ *Username:* @${username}\n`
    caption += `🔗 *Link:* https://www.tiktok.com/@${username}\n`
    caption += `✔️ *Verified:* ${verified ? 'Ya ✅' : 'Tidak ❌'}\n`
    if (isPrivate !== undefined) caption += `🔒 *Private:* ${isPrivate ? 'Ya 🔒' : 'Tidak 🔓'}\n`
    caption += `👥 *Followers:* ${Number(followers || 0).toLocaleString('id-ID')}\n`
    caption += `🏃 *Following:* ${Number(following || 0).toLocaleString('id-ID')}\n`
    caption += `❤️ *Likes:* ${Number(likes || 0).toLocaleString('id-ID')}\n`
    if (videos !== undefined) caption += `🎬 *Videos:* ${Number(videos || 0).toLocaleString('id-ID')}\n`
    if (bio && bio !== '-') caption += `📝 *Bio:* ${bio}\n`
    return caption.trim()
  }

  // 1. Coba Kyzzz API (Utama)
  try {
    let kRes = await axios.get(`https://api.kyzzz.xyz/api/stalker/tiktok?username=${encodeURIComponent(username)}&apikey=kyzz84647492486568`, { timeout: 15000 })
    let data = kRes.data
    if (data && data.status && data.result) {
      let r = data.result
      let stats = r.stats || {}
      let avatar = r.avatar?.larger || r.avatar?.medium || r.avatar?.thumb || ''

      let caption = makeCaption({
        name: r.nickname || username,
        username: r.username || username,
        verified: !!r.verified,
        isPrivate: !!r.privateAccount,
        followers: stats.followers || 0,
        following: stats.following || 0,
        likes: stats.hearts || 0,
        videos: stats.videos || 0,
        bio: r.signature || '-'
      })

      if (avatar) {
        await conn.sendMessage(m.chat, { image: { url: avatar }, caption }, { quoted: m })
      } else {
        await m.reply(caption)
      }
      return await m.react('✅')
    }
  } catch (e) {
    console.error('Kyzzz TT Stalk failed, trying fallbacks:', e?.message || e)
  }

  // 2. Fallback ke Ryzumi API
  try {
    let ryzRes = await axios.get(`https://api.ryzumi.net/api/stalk/tiktok?username=${encodeURIComponent(username)}`, { timeout: 10000 })
    let data = ryzRes.data
    if (data && (data.username || data.nickname || data.user)) {
      let user = data.username || data.user?.uniqueId || username
      let name = data.nickname || data.name || data.user?.nickname || username
      let bio = data.bio || data.signature || data.user?.signature || '-'
      let verified = data.verified || data.user?.verified || false
      let followers = data.followers || data.stats?.followerCount || 0
      let following = data.following || data.stats?.followingCount || 0
      let likes = data.likes || data.stats?.heartCount || data.stats?.heart || 0
      let avatar = data.avatar || data.avatarLarger || data.user?.avatarLarger || null

      let caption = makeCaption({
        name,
        username: user,
        verified,
        followers,
        following,
        likes,
        bio
      })

      if (avatar) {
        await conn.sendMessage(m.chat, { image: { url: avatar }, caption }, { quoted: m })
      } else {
        await m.reply(caption)
      }
      return await m.react('✅')
    }
  } catch (e) {}

  // 3. Fallback ke Scraper Web TikTok
  try {
    let result = await tiktokStalkScraper(username)
    if (result) {
      let caption = makeCaption({
        name: result.name || username,
        username: result.username,
        verified: result.verified,
        followers: result.followers,
        following: result.following,
        likes: result.likes,
        videos: result.videos,
        bio: result.bio
      })

      if (result.avatar) {
        await conn.sendMessage(m.chat, { image: { url: result.avatar }, caption }, { quoted: m })
      } else {
        await m.reply(caption)
      }
      return await m.react('✅')
    }
  } catch (e) {}

  await m.react('❌')
  m.reply(`❌ *Gagal mengambil data TikTok untuk @${username}.* Pastikan username benar dan akun tidak di-private.`)
}

handler.help = ['ttstalk <username>', 'tiktokstalk <username>']
handler.tags = ['stalk']
handler.command = /^(ttstalk|tiktokstalk)$/i
handler.limit = true

export default handler