/**
 * bot-discord/index.js
 * Entry point bot musik Discord NelMusic
 */

import { fileURLToPath, pathToFileURL } from 'url'
import path, { join } from 'path'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') })

import { Client, GatewayIntentBits, Collection } from 'discord.js'
import { Player } from 'discord-player'
import { YoutubeiExtractor } from 'discord-player-youtubei'
import { Platform } from 'youtubei.js'
import { readdirSync } from 'fs'

// Konfigurasi JavaScript evaluator untuk decipher signature YouTube secara native
Platform.shim.eval = (data, env = {}) => {
    const code = typeof data === 'string' ? data : data.output
    const fn = new Function(...Object.keys(env), code)
    return fn(...Object.values(env))
}

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

// Load semua extractor default KECUALI YoutubeExtractor bawaan yang bermasalah
await player.extractors.loadDefault((ext) => ext !== 'YouTubeExtractor')

// Fungsi pintar untuk mendeteksi dan mengubah Netscape Cookie (dari file/extension) menjadi HTTP Cookie String (key=value)
function parseYoutubeCookie(rawCookie) {
    if (!rawCookie) return '';
    if (rawCookie.includes('Netscape HTTP Cookie File') || rawCookie.includes('\t')) {
        return rawCookie.split('\n')
            .filter(line => line && !line.startsWith('#'))
            .map(line => line.split('\t'))
            .filter(parts => parts.length >= 7)
            .map(parts => `${parts[5]}=${parts[6]}`)
            .join('; ');
    }
    return rawCookie; // Jika sudah format string biasa
}

// Daftarkan YoutubeiExtractor sebagai mesin pencari YouTube utama dengan engine YTMUSIC & Cookie
await player.extractors.register(YoutubeiExtractor, {
    cookie: parseYoutubeCookie(process.env.YOUTUBE_COOKIE),
    streamOptions: {
        useClient: 'YTMUSIC'
    }
})

console.log('[BOT-DC] ✅ Audio extractors dimuat (via YoutubeiExtractor).')

// ─────────────────────────────────────────────
// Player Error Handling
// ─────────────────────────────────────────────
player.events.on('error', (queue, error) => {
    console.error(`[BOT-DC][Player Error] (Connection) di guild ${queue.guild.name}:`, error.message)
    if (queue.metadata?.channel) {
        queue.metadata.channel.send(`⚠️ Terjadi masalah koneksi audio: \`${error.message}\``).catch(() => {})
    }
})

player.events.on('playerError', (queue, error) => {
    console.error(`[BOT-DC][Player Error] (Streaming) di guild ${queue.guild.name}:`, error.message)
    if (queue.metadata?.channel) {
        queue.metadata.channel.send(`⚠️ Gagal memutar lagu, coba lagu lain ya. (\`${error.message}\`)`).catch(() => {})
    }
})

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
await client.login(process.env.DISCORD_TOKEN)


