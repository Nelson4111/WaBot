import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
  if (!isOwner) return m.reply('❌ Khusus owner.')

  if (!text) return m.reply(`📦 Contoh:\n${usedPrefix + command} namaplugin.js`)

  // Pastikan nama file diakhiri .js
  if (!text.endsWith('.js')) text += '.js'

  const pluginRoot = path.resolve('./plugins')
  let filePath = path.resolve(pluginRoot, text)
  if (!filePath.startsWith(pluginRoot + path.sep)) return m.reply('❌ Path plugin tidak valid.')
  if (!fs.existsSync(filePath) && !text.includes('/') && !text.includes('\\')) {
    const matches = findPluginFiles(pluginRoot).filter(file => path.basename(file) === text)
    if (matches.length > 1) return m.reply(`❌ Nama plugin ambigu:\n${matches.map(file => path.relative(pluginRoot, file).split(path.sep).join('/')).join('\n')}`)
    if (matches.length === 1) filePath = matches[0]
  }
  if (!fs.existsSync(filePath)) return m.reply('❌ Plugin tidak ditemukan.')

  try {
    fs.unlinkSync(filePath)
    await m.reply(`✅ Plugin *${text}* berhasil dihapus.`)
  } catch (e) {
    console.error(e)
    await m.reply('❌ Gagal menghapus plugin.')
  }
}

const findPluginFiles = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const fullPath = path.join(dir, entry.name)
  if (entry.isDirectory()) return findPluginFiles(fullPath)
  return entry.isFile() && entry.name.endsWith('.js') ? [fullPath] : []
})

handler.help = ['deleteplugin <namafile>']
handler.tags = ['owner']
handler.command = /^(deleteplugin|delplugin)$/i
handler.owner = true

export default handler
