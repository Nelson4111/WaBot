import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const gameHtmlPath = path.resolve(__dirname, '../../lib/games/block-blast.html')

let handler = async (m, { conn, usedPrefix, command }) => {
  if (!fs.existsSync(gameHtmlPath)) {
    return m.reply('⟡ File game Block Blast Mini tidak ditemukan di server.')
  }

  const htmlContent = fs.readFileSync(gameHtmlPath, 'utf8')
  await conn.reply(m.chat, '⧗ *Membuka Block Blast Mini di gelembung obrolan...*', m)

  try {
    return await conn.sendHtmlApp(m.chat, htmlContent, {
      title: 'BLOCK BLAST MINI',
      label: '✧ Main Block Blast Mini',
      height: 420,
      trustedSources: ['hirara.dev', 'nixel.dev']
    })
  } catch (err) {
    console.error('[BLOCK BLAST ERROR]:', err)
    return conn.reply(m.chat, `⟡ Gagal memuat Block Blast Mini: ${err?.message || err}`, m)
  }
}

handler.help = ['blockblast', 'bbmini', 'bb', 'blockgame']
handler.tags = ['arcade']
handler.command = /^(blockblast|bbmini|bb|blockgame)$/i

export default handler
