/**
 * bot-discord/index.js
 * Entry point bot musik Discord NelMusic
 */

import 'dotenv/config'
import { Client, GatewayIntentBits, Collection } from 'discord.js'
import { Player } from 'discord-player'
import { readdirSync } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─────────────────────────────────────────────
// Inisialisasi Discord Client
// ─────────────────────────────────────────────
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
})

// Koleksi untuk menyimpan semua slash commands
client.commands = new Collection()

// ─────────────────────────────────────────────
// Load Slash Commands
// ─────────────────────────────────────────────
const commandsPath = join(__dirname, 'commands')
const commandFiles = readdirSync(commandsPath).filter(f => f.endsWith('.js'))

for (const file of commandFiles) {
    const filePath = pathToFileURL(join(commandsPath, file)).href
    const mod = await import(filePath)
    const command = mod.default
    if (command?.data && command?.execute) {
        client.commands.set(command.data.name, command)
        console.log(`[BOT-DC] ✅ Command dimuat: /${command.data.name}`)
    } else {
        console.warn(`[BOT-DC] ⚠️ Melewati ${file}: tidak ada properti data/execute.`)
    }
}

// ─────────────────────────────────────────────
// Inisialisasi discord-player
// ─────────────────────────────────────────────
const player = new Player(client, {
    skipFFmpeg: false,
    useLegacyFFmpeg: false,
})

// Load semua extractor (YouTube, Spotify, SoundCloud, dll)
await player.extractors.loadDefault()
console.log('[BOT-DC] ✅ Audio extractors dimuat.')

// ─────────────────────────────────────────────
// Load Event Handlers (Discord Events)
// ─────────────────────────────────────────────
const eventsPath = join(__dirname, 'events')
const eventFiles = readdirSync(eventsPath).filter(f => f.endsWith('.js') && f !== 'playerEvents.js')

for (const file of eventFiles) {
    const filePath = pathToFileURL(join(eventsPath, file)).href
    const mod = await import(filePath)
    const event = mod.default
    if (event?.once) {
        client.once(event.name, (...args) => event.execute(...args, client))
    } else if (event?.name) {
        client.on(event.name, (...args) => event.execute(...args, client))
    }
}

// ─────────────────────────────────────────────
// Load Player Events (Music Events)
// ─────────────────────────────────────────────
const { default: setupPlayerEvents } = await import(
    pathToFileURL(join(__dirname, 'events', 'playerEvents.js')).href
)
setupPlayerEvents(player)

// ─────────────────────────────────────────────
// Login ke Discord
// ─────────────────────────────────────────────
console.log('[DEBUG] cwd:', process.cwd());
console.log('[DEBUG] token exists:', !!process.env.DISCORD_TOKEN);
console.log('[DEBUG] token length:', process.env.DISCORD_TOKEN?.length || 0);

await client.login(process.env.DISCORD_TOKEN)

