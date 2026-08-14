let handler = async (m, { conn }) => {
  let hasMention = /(@\d{5,})/.test(m.text || '')
  let rawWho = (hasMention && m.mentionedJid?.[0]) || (m.fromMe ? conn.user.jid : m.sender)
  let who = conn.decodeJid(rawWho)

  let pp = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'
  try { pp = await conn.profilePictureUrl(who, 'image') } catch {}

  let user = global.db.data.users[who] || {}
  let limit = user.limit !== undefined ? user.limit : 10
  let isSelf = who === m.sender

  let caption = `💳 *L I M I T - U S E R* 💳\n\n` +
    `👤 *User:* @${who.split('@')[0]}\n` +
    `🎟️ *Sisa Limit:* *${limit}* Limit\n\n` +
    `📌 _${isSelf ? 'Ketik .buyllimit untuk membeli limit tambahan' : 'Pengguna ini memiliki ' + limit + ' limit'}_`

  await conn.sendFile(m.chat, pp, 'limit.jpg', caption, m, false, { mentions: [who] })
}

handler.help = ['limit', 'ceklimit']
handler.tags = ['info', 'main']
handler.command = /^(limit|ceklimit)$/i
handler.limit = false

export default handler