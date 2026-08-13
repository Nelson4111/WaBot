import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

let handler = async (m, { conn }) => {
    let pluginFolder = path.resolve('./plugins')
    let errorList = []

    if (!fs.existsSync(pluginFolder)) {
        return m.reply('❌ Folder *plugins* tidak ditemukan!')
    }

    const listPluginFiles = (dir = pluginFolder) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) return listPluginFiles(fullPath)
        return entry.isFile() && entry.name.endsWith('.js') ? [fullPath] : []
    })

    let files = listPluginFiles()

    for (let file of files) {
        try {
            let plugin = await import(`${pathToFileURL(file)}?update=${Date.now()}`)
            
            // cek apakah export default function
            let hasDefaultFunc = plugin?.default && typeof plugin.default === 'function'
            // cek apakah ada export before/after/cron
            let hasHook = plugin.before || plugin.after || plugin.cron

            if (!hasDefaultFunc && !hasHook) {
                throw new Error('Tidak ada export default function atau hook (before/after/cron)')
            }
        } catch (err) {
            const name = path.relative(pluginFolder, file).split(path.sep).join('/')
            errorList.push(`❌ *${name}* → ${err.message}`)
        }
    }

    if (errorList.length === 0) {
        m.reply('✅ Semua fitur aman, tidak ada error!')
    } else {
        m.reply(`🚨 Ditemukan *${errorList.length}* error pada fitur:\n\n${errorList.join('\n')}`)
    }
}

handler.help = ['checkerror']
handler.tags = ['owner']
handler.command = /^checkerror$/i
handler.rowner = true

export default handler
