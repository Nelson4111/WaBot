import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const gameHtmlPath = path.resolve(__dirname, '../../lib/games/tetris.html')

let handler = async (m, { conn, usedPrefix, command }) => {
  if (!fs.existsSync(gameHtmlPath)) {
    return m.reply('⟡ File game Tetris Mini tidak ditemukan di server.')
  }

  const htmlContent = fs.readFileSync(gameHtmlPath, 'utf8')
  await conn.reply(m.chat, '⧗ *Membuka Retro Tetris Mini di gelembung obrolan...*', m)

  try {
    return await conn.sendHtmlApp(m.chat, htmlContent, {
      title: 'TETRIS RETRO MINI',
      label: '✦ Main Tetris Mini',
      height: 440,
      trustedSources: ['hirara.dev', 'nixel.dev']
    })
  } catch (err) {
    console.error('[TETRIS ERROR]:', err)
    return conn.reply(m.chat, `⟡ Gagal memuat Tetris Mini: ${err?.message || err}`, m)
  }
}

handler.help = ['tetris', 'tetrismini', 'gametetris']
handler.tags = ['arcade']
handler.command = /^(tetris|tetrismini|gametetris)$/i

export default handler
