import fs from 'fs'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  await m.react('🕒')

  let totalFitur = Object.values(global.plugins).filter(v => v.help && v.tags).length
  let totalCommand = Object.values(global.plugins)
    .map(v => v.command)
    .filter(v => v)
    .map(v => Array.isArray(v) ? v.length : 1)
    .reduce((a, b) => a + b, 0)

  let thumb
  try {
    const listThumb = JSON.parse(fs.readFileSync('./media/thumb.json'))
    const pickThumb = listThumb[Math.floor(Math.random() * listThumb.length)]
    thumb = await (await fetch(pickThumb)).buffer()
  } catch {
    thumb = fs.readFileSync('./media/thumbnail.jpg')
  }

  let audioMenu = null
  try {
    const listMusic = JSON.parse(fs.readFileSync('./media/music.json'))
    audioMenu = listMusic[Math.floor(Math.random() * listMusic.length)]
  } catch {
    audioMenu = null
  }

  await m.react('✅')

  let caption = `
🔧 *Total Fitur:* ${totalFitur}
📖 *Total Command:* ${totalCommand}
`.trim()

  await conn.sendMessage(m.chat, {
    text: caption,
    contextInfo: {
      externalAdReply: {
        title: `${global.namebot || 'NelBot-MD'} Status`,
        body: `Created by ${global.author || 'Nenel'}`,
        thumbnail: thumb,
        mediaType: 1,
        renderLargerThumbnail: true,
        sourceUrl: global.ch || ""
      }
    }
  }, { quoted: m })

  if (audioMenu) {
    try {
      await conn.sendFile(
        m.chat,
        audioMenu,
        'menu.mp3',
        null,
        m,
        true,
        {
          type: 'audioMessage',
          ptt: true,
          seconds: 0
        }
      )
    } catch {}
  }
}

handler.help = ['totalfitur']
handler.tags = ['info']
handler.command = ['totalfitur']

export default handler