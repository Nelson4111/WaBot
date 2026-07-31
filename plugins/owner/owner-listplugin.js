import fs from 'fs'
import path from 'path'

global.listedPlugins = [] // simpan di global

const pluginRoot = path.resolve('./plugins')
const listPluginFiles = (dir = pluginRoot) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const fullPath = path.join(dir, entry.name)
  if (entry.isDirectory()) return listPluginFiles(fullPath)
  return entry.isFile() && entry.name.endsWith('.js')
    ? [path.relative(pluginRoot, fullPath).split(path.sep).join('/')]
    : []
})

let handler = async (m, { conn }) => {
  try {
    const files = listPluginFiles().sort((a, b) => a.localeCompare(b))
    if (!files.length) return m.reply('❌ Tidak ada plugin ditemukan.')

    global.listedPlugins = files // simpan ke global

    let list = `📦 *Daftar Plugin:*\n\n`
    files.forEach((file, i) => {
      list += `${i + 1}. ${file}\n`
    })

    m.reply(list)
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal membaca folder plugins.')
  }
}

handler.help = ['listplugin']
handler.tags = ['owner']
handler.command = /^listplugin$/i
handler.owner = true

export default handler
