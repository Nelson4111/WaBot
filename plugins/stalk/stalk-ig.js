import axios from 'axios'
import { status, toSmallNum } from '../../lib/style.js'

async function igStalkRyzumi(username) {
  const { data } = await axios.get(
    `https://api.ryzumi.net/api/stalk/instagram?username=${encodeURIComponent(username)}`,
    {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
  )

  if (!data || (!data.username && !data.name)) {
    throw new Error('Data Instagram tidak ditemukan di Ryzumi')
  }

  return {
    name: data.name || username,
    username: data.username || username,
    verified: !!data.isVerified,
    isPrivate: !!data.isPrivate,
    followers: data.followers || 0,
    following: data.following || 0,
    posts: data.posts || 0,
    bio: data.bio || '-',
    avatar: data.avatar || null
  }
}

async function igStalkDeline(username) {
  const res = await axios.get(`https://api.deline.web.id/stalker/igstalk?username=${encodeURIComponent(username)}`, { timeout: 12000 })
  const r = res.data?.result
  if (!r?.username) throw new Error('Data Deline tidak ditemukan.')

  return {
    name: r.fullname || username,
    username: r.username,
    verified: !!r.is_verified,
    isPrivate: !!r.is_private,
    followers: r.followers || 0,
    following: r.following || 0,
    posts: r.posts || 0,
    bio: r.biography || '-',
    avatar: r.profile_pic || null
  }
}

async function getInstagramProfile(username) {
  try {
    return await igStalkRyzumi(username)
  } catch (e) {
    console.warn('[IG Stalk Ryzumi failed]:', e.message)
    return await igStalkDeline(username)
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const username = text?.replace(/^@/, '').trim()
  if (!username) {
    return m.reply(
      status.warning(
        `Masukkan username Instagram!\n` +
        `> Contoh: *${usedPrefix + command} nelson_randanan*`
      )
    )
  }

  await m.react('⏳')

  try {
    const res = await getInstagramProfile(username)

    const caption = `*──  ୨୧ ✧ INSTAGRAM STALKER ✧ ୨୧  ──*

*╭  〔 𝜚 ᴘ ʀ ᴏ ꜰ ɪ ʟ 〕*
*┆* ⟡ ɴᴀᴍᴀ      : *${res.name}*
*┆* ◈ ᴜꜱᴇʀɴᴀᴍᴇ  : *@${res.username}*
*┆* ✧ ᴠᴇʀɪꜰɪᴇᴅ  : *${res.verified ? 'Ya ❖' : 'Tidak'}*
*┆* ❖ ᴘʀɪᴠᴀᴛᴇ   : *${res.isPrivate ? 'Ya 🔒' : 'Tidak 🔓'}*
*┆* 👥 ꜰᴏʟʟᴏᴡᴇʀꜱ : *${toSmallNum(Number(res.followers).toLocaleString('id-ID'))}*
*┆* ᰔ ꜰᴏʟʟᴏᴡɪɴɢ : *${toSmallNum(Number(res.following).toLocaleString('id-ID'))}*
*┆* ⌬ ᴘᴏꜱᴛɪɴɢᴀɴ : *${toSmallNum(Number(res.posts).toLocaleString('id-ID'))}*
*╰───────────────*

${res.bio && res.bio !== '-' ? `*╭  〔 📝 ʙ ɪ ᴏ 〕*\n> ${res.bio}\n*╰───────────────*\n\n` : ''}> _https://www.instagram.com/${res.username}_`.trim()

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
    console.error('[IG Stalk Error]:', e)
    m.reply(status.error(`Gagal mengambil data Instagram @${username}:\n> Akun mungkin di-private atau tidak ditemukan.`))
  }
}

handler.help = ['igstalk <username>', 'stalkig <username>']
handler.tags = ['stalk']
handler.command = /^(igstalk|stalkig)$/i
handler.limit = true

export default handler