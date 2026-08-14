import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`📸 *Instagram Stalker*\n\nContoh penggunaan:\n*${usedPrefix + command}* nelson_randanan`)
  }

  let username = text.replace(/^@/, '').trim()
  await m.react('⏳')

  // Helper untuk format caption seragam di semua layer
  const makeCaption = ({ name, username, verified, isPrivate, followers, following, posts, bio }) => {
    let caption = `📸 *INSTAGRAM STALKER*\n\n`
    caption += `👤 *Nama:* ${name || '-'}\n`
    caption += `🏷️ *Username:* @${username}\n`
    caption += `🔗 *Link:* https://www.instagram.com/${username}\n`
    caption += `✔️ *Verified:* ${verified ? 'Ya ✅' : 'Tidak ❌'}\n`
    caption += `🔒 *Private:* ${isPrivate ? 'Ya 🔒' : 'Tidak 🔓'}\n`
    caption += `👥 *Followers:* ${Number(followers || 0).toLocaleString('id-ID')}\n`
    caption += `👥 *Following:* ${Number(following || 0).toLocaleString('id-ID')}\n`
    caption += `🖼️ *Posts:* ${Number(posts || 0).toLocaleString('id-ID')}\n`
    if (bio && bio !== '-') caption += `📝 *Bio:* ${bio}\n`
    return caption.trim()
  }

  // 1. Coba Kyzzz API (Utama)
  try {
    let kRes = await axios.get(`https://api.kyzzz.xyz/api/stalker/ig?username=${encodeURIComponent(username)}&apikey=kyzz84647492486568`, { timeout: 15000 })
    let data = kRes.data
    if (data && data.status && data.result) {
      let meta = data.result.metadata || {}
      let user = data.result.stories?.data?.user || {}

      let caption = makeCaption({
        name: user.full_name || username,
        username,
        verified: !!user.is_verified,
        isPrivate: !!user.is_private,
        followers: meta.followers || user.edge_followed_by || 0,
        following: meta.following || user.edge_follow || 0,
        posts: meta.posts || user.edges_count || 0,
        bio: user.biography || '-'
      })

      let avatar = meta.avatar || user.profile_pic_url || ''

      if (avatar) {
        await conn.sendMessage(m.chat, { image: { url: avatar }, caption }, { quoted: m })
      } else {
        await m.reply(caption)
      }
      return await m.react('✅')
    }
  } catch (e) {
    console.error('Kyzzz IG Stalk failed, trying fallbacks:', e?.message || e)
  }

  // 2. Fallback ke Ryzumi API
  try {
    let rRes = await axios.get(`https://api.ryzumi.net/api/stalk/instagram?username=${encodeURIComponent(username)}`, { timeout: 10000 })
    let data = rRes.data

    if (data && data.username) {
      let caption = makeCaption({
        name: data.name || username,
        username: data.username,
        verified: !!data.verified,
        isPrivate: false,
        followers: data.followers || 0,
        following: data.following || 0,
        posts: data.posts || 0,
        bio: data.bio || '-'
      })

      if (data.avatar) {
        await conn.sendMessage(m.chat, { image: { url: data.avatar }, caption }, { quoted: m })
      } else {
        await m.reply(caption)
      }
      return await m.react('✅')
    }
  } catch (e) {}

  // 3. Fallback ke Deline API
  try {
    let fRes = await axios.get(`https://api.deline.web.id/stalker/igstalk?username=${encodeURIComponent(username)}`, { timeout: 10000 })
    let r = fRes.data?.result
    if (r && r.username) {
      let caption = makeCaption({
        name: r.fullname || username,
        username: r.username,
        verified: !!r.is_verified,
        isPrivate: !!r.is_private,
        followers: r.followers || 0,
        following: r.following || 0,
        posts: r.posts || 0,
        bio: r.biography || '-'
      })

      if (r.profile_pic) {
        await conn.sendMessage(m.chat, { image: { url: r.profile_pic }, caption }, { quoted: m })
      } else {
        await m.reply(caption)
      }
      return await m.react('✅')
    }
  } catch (fErr) {}

  await m.react('❌')
  m.reply(`❌ *Gagal mengambil data Instagram untuk @${username}.* Pastikan akun publik dan username benar.`)
}

handler.help = ['igstalk <username>', 'stalkig <username>']
handler.tags = ['stalk', 'tools']
handler.command = /^(igstalk|stalkig)$/i
handler.limit = true

export default handler