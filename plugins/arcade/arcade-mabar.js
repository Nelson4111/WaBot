import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { startTunnel } from '../../lib/tunnel/tunnel-manager.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const arenaHtmlPath = path.resolve(__dirname, '../../lib/games/star-arena.html')

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!fs.existsSync(arenaHtmlPath)) {
    return m.reply('⟡ File game Star Arena tidak ditemukan di server.')
  }

  // Tentukan Room ID & Channel ID
  const rawRoom = (text ? text.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') : (m.isGroup ? m.chat.split('@')[0] : 'arena-utama')) || 'arena-utama'
  const channelId = rawRoom.startsWith('nel_') ? rawRoom : `nel_${rawRoom}`
  const roomId = rawRoom
  const playerName = (m.pushName || 'Player').substring(0, 15).replace(/[<>]/g, '')

  // Konfigurasi Relay WebSocket PieSocket
  const PIESOCKET_API_KEY = process.env.PIESOCKET_API_KEY || 'OZhgMu47NmZgmMWMIzXUY3NXL26NWHABe3zJGQCF'
  const PIESOCKET_CLUSTER = process.env.PIESOCKET_CLUSTER || 'free.blr2'

  // Primary: demo.piesocket.com
  const primaryWss = `wss://demo.piesocket.com/v3/${channelId}?api_key=${PIESOCKET_API_KEY}&notify_self`
  // Fallback: cluster regional free.blr2
  const fallbackWss = `wss://${PIESOCKET_CLUSTER}.piesocket.com/v3/${channelId}?api_key=${PIESOCKET_API_KEY}&notify_self`

  const currentPort = process.env.PORT || 3000
  const webUrl = global.tunnelUrl || `http://localhost:${currentPort}`

  const trustedSources = [
    'piesocket.com',
    'demo.piesocket.com',
    `${PIESOCKET_CLUSTER}.piesocket.com`,
    'trycloudflare.com',
    'nixel.dev',
    'hirara.dev'
  ]

  // Baca dan sesuaikan HTML template
  let rawHtml = fs.readFileSync(arenaHtmlPath, 'utf8')
  const finalHtml = rawHtml
    .replace(/\{\{WSS_URL\}\}/g, primaryWss)
    .replace(/\{\{WSS_URL_FALLBACK\}\}/g, fallbackWss)
    .replace(/\{\{ROOM_ID\}\}/g, roomId)
    .replace(/\{\{PLAYER_NAME\}\}/g, playerName)

  const arenaBrowserUrl = `${webUrl}/arena/${encodeURIComponent(roomId)}?name=${encodeURIComponent(playerName)}`

  const caption = `*──  ୨୧ ✧ ꜱᴛᴀʀ ᴀʀᴇɴᴀ ᴍᴜʟᴛɪᴘʟᴀʏᴇʀ ✧ ୨୧  ──*

> *おしらせ!* (ᴀʀᴇɴᴀ ʙᴀᴛᴛʟᴇ!)
> Pertarungan bintang multipemain real-time di WhatsApp.
> _Buka kartu gelembung di atas bersama teman grupmu untuk mabar secara langsung._

*╭  〔 ◈ ɪɴꜰᴏʀᴍᴀꜱɪ ʀᴏᴏᴍ 〕*
*┆* ⟡ ʀᴏᴏᴍ ɪᴅ    : \`${roomId}\`
*┆* ✧ ᴘᴇᴍᴀɪɴ     : *${playerName}*
*┆* ✦ ꜱᴇʀᴠᴇʀ     : *Online (PieSocket Relay)*
*╰──────────────────────*

> ｡˚ ⊹ *ɢᴜɴᴀᴋᴀɴ ᴛᴏᴍʙᴏʟ ᴅɪ ʙᴀᴡᴀʜ ᴜɴᴛᴜᴋ ᴠᴇʀꜱɪ ʟᴀʏᴀʀ ᴘᴇɴᴜʜ* ⊹ ˚ ｡`.trim()

  try {
    // 1. Kirim In-Bubble HTML App untuk Android
    await conn.sendHtmlApp(m.chat, finalHtml, {
      title: `STAR ARENA • ROOM: ${roomId}`,
      label: `◈ Masuk Star Arena (${roomId})`,
      height: 380,
      trustedSources
    })

    // 2. Kirim pesan pendamping dengan tombol / link untuk pemain iOS & WhatsApp Web
    const buttons = [
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: '◈ Buka Arena Mabar (Layar Penuh)',
          url: arenaBrowserUrl,
          merchant_url: arenaBrowserUrl
        })
      }
    ]

    return await conn.sendButton(
      m.chat,
      caption,
      'Avelia • Multiplayer Real-Time Game',
      null,
      buttons,
      m
    )
  } catch (err) {
    console.error('[MABAR ERROR]:', err)
    return conn.reply(m.chat, `⟡ Gagal memuat game arena: ${err?.message || err}\n\nKamu juga bisa membuka via browser di:\n${arenaBrowserUrl}`, m)
  }
}

handler.help = ['mabar [nama_room]', 'arena [nama_room]', 'stararena']
handler.tags = ['arcade']
handler.command = /^(mabar|arena|stararena)$/i

export default handler
