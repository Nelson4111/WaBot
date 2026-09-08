let handler = async (m, { conn, args, usedPrefix, command }) => {
  const mode = (args[0] || '').toLowerCase()
  const isClose = {
    'open': 'not_announcement',
    'buka': 'not_announcement',
    'close': 'announcement',
    'tutup': 'announcement'
  }[mode]

  if (isClose === undefined) {
    return m.reply(`*╭  〔 ◈ ꜰ ᴏ ʀ ᴍ ᴀ ᴛ  ᴘ ᴇ ʀ ɪ ɴ ᴛ ᴀ ʜ 〕*
*┆* › *${usedPrefix + command} open*  (Buka Grup)
*┆* › *${usedPrefix + command} close* (Tutup Grup)
*╰───────────────*`)
  }

  await conn.groupSettingUpdate(m.chat, isClose)

  if (isClose === 'not_announcement') {
    const txt = `*──  ୨୧ ✧ GERBANG GRUP DIBUKA ✧ ୨୧  ──*

> Gerbang percakapan grup resmi dibuka ✦
> Seluruh anggota kini dapat mengirimkan pesan secara bebas dan tertib.`
    await conn.sendMessage(m.chat, { text: txt })
  } else {
    const txt = `*──  ୨୧ ✧ GERBANG GRUP DITUTUP ✧ ୨୧  ──*

> Gerbang percakapan grup resmi ditutup ✦
> Saat ini hanya Administrator grup yang dapat mengirimkan pesan.`
    await conn.sendMessage(m.chat, { text: txt })
  }
}

handler.help = ['group open/close']
handler.tags = ['group']
handler.command = /^(group|gc)$/i

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
