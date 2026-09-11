const elfariaPhotos = [
  {
    url: 'https://c.termai.cc/i148/gg33YBC.jpg',
    name: 'Elfaria Albis Serfort',
    anime: 'Wistoria: Wand and Sword'
  },
  {
    url: 'https://c.termai.cc/i128/ArQR.jpg',
    name: 'Elfaria Albis Serfort',
    anime: 'Wistoria: Wand and Sword'
  },
  {
    url: 'https://c.termai.cc/i179/axY.jpg',
    name: 'Elfaria Albis Serfort',
    anime: 'Wistoria: Wand and Sword'
  },
  {
    url: 'https://c.termai.cc/i134/UQX9I.jpg',
    name: 'Elfaria Albis Serfort',
    anime: 'Wistoria: Wand and Sword'
  }
]

let handler = async (m, { conn }) => {
  global.elfariaState = global.elfariaState || {}
  const chatId = m.chat || 'default'
  const index = Number(global.elfariaState[chatId] ?? 0)
  const photo = elfariaPhotos[index]

  global.elfariaState[chatId] = (index + 1) % elfariaPhotos.length

  await conn.sendFile(
  m.chat,
  photo.url,
  `elfaria-${index + 1}.jpg`,
  `╭─❏「 E L F A R I A 」❏\n` +
  `│ 🧝 *${photo.name}*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `📋 *Asal Anime :*\n` +
  `> ↳ ${photo.anime}\n\n` +
  `─━━━━━━━━━━━━━━─`,
  m
)
}

handler.help = ['elfaria']
handler.tags = ['anime']
handler.command = /^(elfaria)$/i

export default handler
