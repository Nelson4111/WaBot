/**
 * bot-discord/deploy-commands.js
 * Jalankan SEKALI untuk mendaftarkan slash commands ke Discord:
 *   node deploy-commands.js
 */

import 'dotenv/config'
import { REST, Routes } from 'discord.js'
import { readdirSync } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const commands = []

const commandsPath = join(__dirname, 'commands')
const commandFiles = readdirSync(commandsPath).filter(f => f.endsWith('.js'))

for (const file of commandFiles) {
    const filePath = pathToFileURL(join(commandsPath, file)).href
    const mod = await import(filePath)
    if (mod.default?.data) {
        commands.push(mod.default.data.toJSON())
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN)

console.log(`🔄 Mendaftarkan ${commands.length} slash commands ke server ${process.env.GUILD_ID}...`)

try {
    const data = await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
    )
    console.log(`✅ Berhasil mendaftarkan ${data.length} slash commands!`)
    data.forEach(cmd => console.log(`   /${cmd.name}`))
} catch (err) {
    console.error('❌ Gagal mendaftarkan commands:', err.message)
    process.exit(1)
}
