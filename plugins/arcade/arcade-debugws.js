import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const debugHtmlPath = path.resolve(__dirname, '../../lib/games/ws-debugger.html')

let handler = async (m, { conn, usedPrefix, command }) => {
  if (!fs.existsSync(debugHtmlPath)) {
    return m.reply('⟡ File ws-debugger.html tidak ditemukan di server.')
  }

  const html = fs.readFileSync(debugHtmlPath, 'utf8')
  const currentPort = process.env.PORT || 3000
  const webUrl = global.tunnelUrl || `http://localhost:${currentPort}`
  const browserUrl = `${webUrl}/debug-ws`

  const trustedSources = [
    'piesocket.com',
    'demo.piesocket.com',
    'free.blr2.piesocket.com',
    'websocket.org',
    'google.com',
    'trycloudflare.com',
    'nixel.dev'
  ]

  const caption = `*──  ୨୧ ✧ ᴡᴇʙꜱᴏᴄᴋᴇᴛ & ᴡᴇʙᴠɪᴇᴡ ɪɴꜱᴘᴇᴄᴛᴏʀ ✧ ୨୧  ──*

> *おしらせ!* (ɴᴇᴛᴡᴏʀᴋ ᴅɪᴀɢɴᴏꜱᴛɪᴄ!)
> Alat uji koneksi real-time WebSocket langsung di dalam WhatsApp.
> _Gunakan kartu gelembung di atas untuk memeriksa latensi, status handshake, dan user-agent WebView._

*╭  〔 ⚙ ᴘᴀɴᴅᴜᴀɴ ɪɴꜱᴘᴇᴋꜱɪ 〕*
*┆* ⟡ *1.* Ketuk kartu gelembung di atas.
*┆* ✧ *2.* Tunggu proses pengujian WebSocket selesai (~5 detik).
*┆* ✦ *3.* Tekan tombol *Salin Log Lengkap* pada kartu tampilan.
*╰──────────────────────*

> ｡˚ ⊹ *ɢᴜɴᴀᴋᴀɴ ᴛᴏᴍʙᴏʟ ᴅɪ ʙᴀᴡᴀʜ ᴜɴᴛᴜᴋ ᴜᴊɪ ᴄᴏʙᴀ ᴅɪ ʙʀᴏᴡꜱᴇʀ ʜᴘ* ⊹ ˚ ｡`.trim()

  try {
    // 1. Kirim In-Bubble HTML App
    await conn.sendHtmlApp(m.chat, html, {
      title: 'AVELIA NETWORK DIAGNOSTIC',
      label: '⚙ Buka Debugger WebSocket',
      height: 380,
      trustedSources
    })

    // 2. Kirim Tombol Pendamping Browser
    const buttons = [
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: '⚙ Uji di Browser HP (Chrome/Safari)',
          url: browserUrl,
          merchant_url: browserUrl
        })
      }
    ]

    return await conn.sendButton(
      m.chat,
      caption,
      'Avelia • Network & WebSocket Inspector',
      null,
      buttons,
      m
    )
  } catch (err) {
    console.error('[DEBUG-WS ERROR]:', err)
    return m.reply(`⟡ Gagal mengirim kartu diagnostik: ${err?.message || err}`)
  }
}

handler.help = ['tesws', 'debugws', 'cekws']
handler.tags = ['arcade', 'tools']
handler.command = /^(tesws|debugws|cekws|wsdebug)$/i

export default handler
