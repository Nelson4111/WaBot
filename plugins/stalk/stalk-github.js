import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Gunakan:
> › *${usedPrefix + command}* <username_github>
>
> Contoh:
> › *${usedPrefix + command} torvalds*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/stalk/github?username=${encodeURIComponent(text.trim())}`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const u = res.data
    if (!u || !u.login) {
      throw new Error(`Pengguna GitHub "${text}" tidak ditemukan.`)
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const dateRegistered = u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'

    const caption = `*──  ୨୧ ✧ ɢɪᴛʜᴜʙ ꜱᴛᴀʟᴋ ✧ ୨୧  ──*

*╭  〔 𝜚 ᴘ ʀ ᴏ ꜰ ɪ ʟ  ᴜ ꜱ ᴇ ʀ 〕*
*┆* ⟡ ᴜꜱᴇʀɴᴀᴍᴇ : *${u.login}*
*┆* ✧ ɴᴀᴍᴀ     : *${u.name || '-'}*
*┆* ❖ ʟᴏᴋᴀꜱɪ   : *${u.location || '-'}*
*┆* ⚙ ᴋᴀɴᴛᴏʀ   : *${u.company || '-'}*
*┆* ◈ ʙʟᴏɢ     : *${u.blog || '-'}*
> ✦ ʙɪᴏ : ${u.bio || 'Tidak ada bio'}
*╰───────────────*

*╭  〔 ⌬ ꜱ ᴛ ᴀ ᴛ ɪ ꜱ ᴛ ɪ ᴋ 〕*
*┆* ⟡ ʀᴇᴘᴏꜱɪᴛᴏʀʏ : *${toSmallNum(u.public_repos || 0)}*
*┆* ✧ ɢɪꜱᴛꜱ      : *${toSmallNum(u.public_gists || 0)}*
*┆* ✦ ꜰᴏʟʟᴏᴡᴇʀꜱ  : *${toSmallNum(u.followers || 0)}*
*┆* ❖ ꜰᴏʟʟᴏᴡɪɴɢ  : *${toSmallNum(u.following || 0)}*
*┆* ⏱ ᴛᴇʀᴅᴀꜰᴛᴀʀ  : *${toSmallNum(dateRegistered)}*
*╰───────────────*

> › 🔗 *${u.html_url}*`.trim()

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
> Gagal melakukan stalk GitHub: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['ghstalk <username>', 'githubstalk <username>']
handler.tags = ['stalk']
handler.command = /^(ghstalk|githubstalk)$/i
handler.limit = true

export default handler
