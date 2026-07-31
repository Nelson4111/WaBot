import fs from 'fs'
import path from 'path'

const pluginRoot = path.resolve('./plugins')
const findPluginFiles = (dir = pluginRoot) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return findPluginFiles(fullPath)
    return entry.isFile() && entry.name.endsWith('.js') ? [fullPath] : []
})

let handler = async (m, { conn, isROwner, usedPrefix, command, text }) => {
await m.reply(global.wait)
    if (!isROwner) return
    const files = findPluginFiles()
    const names = files.map(file => path.relative(pluginRoot, file).split(path.sep).join('/'))
    if (!text) throw `uhm.. where the text?\n\nexample:\n${usedPrefix + command} owner/owner-exec`

    let requested = text.endsWith('.js') ? text : `${text}.js`
    let matches = names.filter(name => name === requested || path.basename(name) === requested)
    if (matches.length > 1) return m.reply(`*🗃️ NAMA AMBIGU!*\n==================================\n\n${matches.map(v => ' ' + v).join`\n`}`)
    if (!matches.length) return m.reply(`*🗃️ NOT FOUND!*\n==================================\n\n${names.map(v => ' ' + v.replace(/\.js$/, '')).join`\n`}`)

    const filePath = path.join(pluginRoot, ...matches[0].split('/'))
    m.reply(fs.readFileSync(filePath, 'utf8'))
}
handler.help = ['getplugin'].map(v => v + ' <text>')
handler.tags = ['owner']
handler.command = /^(getplugin|gp)$/i
handler.rowner = true

export default handler
