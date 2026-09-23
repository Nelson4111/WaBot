import axios from 'axios'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str || '').replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Gunakan:
> › *${usedPrefix + command}* <ip_server>
>
> Contoh:
> › *${usedPrefix + command} hypixel.net*
> › *${usedPrefix + command} play.kaboom.pw*
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const res = await axios.get(`https://api.ryzumi.net/api/tool/mc-lookup?ip=${encodeURIComponent(text.trim())}`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const d = res.data?.data
    if (!d) {
      throw new Error('Informasi server Minecraft tidak ditemukan.')
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const isOnline = d.online !== false
    const motdClean = Array.isArray(d.motd?.clean) ? d.motd.clean.join(' ').trim() : (d.motd?.clean || 'Tidak ada MOTD')
    const playersOnline = d.players?.online ?? 0
    const playersMax = d.players?.max ?? 0
    const versionName = d.version?.name_clean || d.version?.name || 'Java / Bedrock'

    const caption = `*──  ୨୧ ✧ ᴍɪɴᴇᴄʀᴀꜰᴛ ꜱᴇʀᴠᴇʀ ✧ ୨୧  ──*

*╭  〔 🎮 ꜱ ᴇ ʀ ᴠ ᴇ ʀ  ɪ ɴ ꜰ ᴏ 〕*
*┆* ⟡ ɪᴘ ꜱᴇʀᴠᴇʀ : *${d.ip || text}${d.port ? `:${d.port}` : ''}*
*┆* ✧ ꜱᴛᴀᴛᴜꜱ    : *${isOnline ? 'Online 🟢' : 'Offline 🔴'}*
*┆* ✦ ᴘʟᴀʏᴇʀꜱ   : *${toSmallNum(playersOnline)} / ${toSmallNum(playersMax)}*
*┆* ◈ ᴠᴇʀꜱɪ     : *${versionName}*
> ❖ ᴍᴏᴛᴅ : ${motdClean}
*╰───────────────*

> _Informasi status dan latency server Minecraft real-time._`.trim()

    if (d.icon && d.icon.startsWith('data:image')) {
      const base64Data = d.icon.split(',')[1]
      if (base64Data) {
        const buffer = Buffer.from(base64Data, 'base64')
        return conn.sendMessage(m.chat, {
          image: buffer,
          caption
        }, { quoted: m })
      }
    }

    return m.reply(caption)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memeriksa server Minecraft: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['mclookup <server_ip>', 'mcserver <server_ip>']
handler.tags = ['tools']
handler.command = /^(mclookup|mcserver|mcstatus)$/i
handler.limit = true

export default handler
