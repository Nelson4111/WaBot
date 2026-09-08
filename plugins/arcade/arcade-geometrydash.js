import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const gameHtmlPath = path.resolve(__dirname, '../../lib/games/geometry-dash.html')

let handler = async (m, { conn, usedPrefix, command }) => {
  if (!fs.existsSync(gameHtmlPath)) {
    return m.reply('⟡ File game Geometry Dash Mini tidak ditemukan di server.')
  }

  const htmlContent = fs.readFileSync(gameHtmlPath, 'utf8')
  await conn.reply(m.chat, '⧗ *Membuka Geometry Dash Mini di gelembung obrolan...*', m)

  try {
    return await conn.sendHtmlApp(m.chat, htmlContent, {
      title: 'GEOMETRY DASH MINI',
      label: '⟡ Main Geometry Dash Mini',
      height: 420,
      trustedSources: ['hirara.dev', 'nixel.dev']
    })
  } catch (err) {
    console.error('[GEOMETRY DASH ERROR]:', err)
    return conn.reply(m.chat, `⟡ Gagal memuat Geometry Dash Mini: ${err?.message || err}`, m)
  }
}

handler.help = ['geometrydash', 'gdmini', 'gd']
handler.tags = ['arcade']
handler.command = /^(geometrydash|gdmini|gd|geometrygame)$/i

export default handler
