import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan username Twitter/X:
> › *${usedPrefix + command}* <username>
>
> Contoh:
> › *${usedPrefix + command} elonmusk*
*╰───────────────*`)
  }

  const username = text.trim().replace(/^@/, '')

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    let u = null
    // 1. Primary: Ryzumi Twitter Stalk API
    try {
      const res = await axios.get(`https://api.ryzumi.net/api/stalk/twitter?username=${encodeURIComponent(username)}`, {
        timeout: 20000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      u = res.data?.user
    } catch (e1) {}

    // 2. Fallback: zenzxz stalker
    if (!u) {
      const resFallback = await axios.get(`https://zenzxz.dpdns.org/stalker/twitter?username=${encodeURIComponent(username)}`, {
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      const fd = resFallback.data?.data
      if (fd) {
        u = {
          name: fd.name,
          screen_name: fd.username,
          description: fd.description,
          followers: fd.followers_count,
          following: fd.following_count,
          avatar_url: fd.profile_image_url,
          joined_at: fd.created_at
        }
      }
    }

    if (!u || !u.screen_name) {
      throw new Error(`Pengguna Twitter/X "@${username}" tidak ditemukan.`)
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const caption = `*──  ୨୧ ✧ ᴛᴡɪᴛᴛᴇʀ / x ꜱᴛᴀʟᴋ ✧ ୨୧  ──*

*╭  〔 𝜚 ᴘ ʀ ᴏ ꜰ ɪ ʟ  ᴜ ꜱ ᴇ ʀ 〕*
*┆* ⟡ ɴᴀᴍᴀ     : *${u.name || '-'}*
*┆* ✧ ᴜꜱᴇʀɴᴀᴍᴇ : *@${u.screen_name}*
*┆* ❖ ʟᴏᴋᴀꜱɪ   : *${u.location || '-'}*
*┆* ◈ ᴡᴇʙꜱɪᴛᴇ  : *${u.website || '-'}*
> ✦ ʙɪᴏ : ${u.description || 'Tidak ada bio'}
*╰───────────────*

*╭  〔 ⌬ ꜱ ᴛ ᴀ ᴛ ɪ ꜱ ᴛ ɪ ᴋ 〕*
*┆* ✦ ꜰᴏʟʟᴏᴡᴇʀꜱ : *${toSmallNum(Number(u.followers || 0).toLocaleString('id-ID'))}*
*┆* ❖ ꜰᴏʟʟᴏᴡɪɴɢ : *${toSmallNum(Number(u.following || 0).toLocaleString('id-ID'))}*
*┆* ⚙ ʟɪᴋᴇꜱ     : *${toSmallNum(Number(u.likes || 0).toLocaleString('id-ID'))}*
*┆* ⏱ ᴛᴇʀᴅᴀꜰᴛᴀʀ : *${toSmallNum(u.joined_at || '-')}*
*╰───────────────*

> › 🔗 *${u.url || `https://x.com/${u.screen_name}`}*`.trim()

    if (u.avatar_url) {
      return conn.sendMessage(m.chat, {
        image: { url: u.avatar_url },
        caption
      }, { quoted: m })
    }

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal melakukan stalk Twitter: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['twitterstalk <username>', 'xstalk <username>']
handler.tags = ['stalk']
handler.command = /^(twitterstalk|xstalk|twstalk)$/i
handler.limit = true

export default handler