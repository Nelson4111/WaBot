import { createCanvas } from '@napi-rs/canvas'
import { status } from '../../lib/style.js'

/**
 * Render teks rahasia ke dalam kartu gambar estetik berdesain Dark Celestial
 * agar dapat dikirim sebagai Foto Sekali Lihat resmi (View Once ①).
 *
 * @param {string} text - Teks rahasia yang akan ditampilkan
 * @returns {Promise<Buffer>} - Buffer gambar PNG
 */
async function renderSecretCard(text) {
  const width = 960
  const padding = 55
  const maxTextWidth = width - (padding * 2)

  // Pengukuran baris teks secara dinamis
  const tempCanvas = createCanvas(100, 100)
  const tempCtx = tempCanvas.getContext('2d')
  tempCtx.font = '26px sans-serif'

  // Mendukung pemisahan paragraf / baris baru dari pesan pengguna
  const paragraphs = text.split('\n')
  const lines = []

  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push('')
      continue
    }
    const words = para.split(' ')
    let currentLine = ''
    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word
      if (tempCtx.measureText(testLine).width > maxTextWidth) {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)
  }

  const lineHeight = 40
  const headerHeight = 150
  const footerHeight = 85
  const contentHeight = Math.max(lines.length * lineHeight, 80)
  const height = Math.max(headerHeight + contentHeight + footerHeight, 460)

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Latar belakang gradasi gelap celestial
  const bgGrad = ctx.createLinearGradient(0, 0, width, height)
  bgGrad.addColorStop(0, '#0c1017')
  bgGrad.addColorStop(0.5, '#121824')
  bgGrad.addColorStop(1, '#090d14')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // Bingkai luar bertekstur
  ctx.strokeStyle = '#232d3f'
  ctx.lineWidth = 4
  ctx.strokeRect(18, 18, width - 36, height - 36)

  // Garis aksen emas dalam
  ctx.strokeStyle = '#c9a96e'
  ctx.lineWidth = 1.5
  ctx.strokeRect(26, 26, width - 52, height - 52)

  // Pita judul header estetik
  ctx.fillStyle = '#c9a96e'
  ctx.font = 'bold 22px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('──  ୨୧ ✧ PESAN SEKALI LIHAT ✧ ୨୧  ──', width / 2, 70)

  ctx.fillStyle = '#8b9bb4'
  ctx.font = '16px sans-serif'
  ctx.fillText('🔒 Pesan Rahasia Otomatis Hangus Setelah Dibaca', width / 2, 102)

  // Garis pemisah emas
  ctx.strokeStyle = '#c9a96e'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padding, 122)
  ctx.lineTo(width - padding, 122)
  ctx.stroke()

  // Konten teks rahasia
  ctx.fillStyle = '#f0f6fc'
  ctx.font = '26px sans-serif'
  ctx.textAlign = 'left'
  let y = headerHeight + 25
  for (const line of lines) {
    if (line) ctx.fillText(line, padding, y)
    y += lineHeight
  }

  // Garis pemisah footer
  ctx.strokeStyle = '#232d3f'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padding, height - footerHeight + 15)
  ctx.lineTo(width - padding, height - footerHeight + 15)
  ctx.stroke()

  // Teks footer
  ctx.fillStyle = '#7a889b'
  ctx.font = 'italic 15px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('🛡️ Terenkripsi • Anti-Screenshot Protected • Avelia Bot', width / 2, height - 35)

  return canvas.toBuffer('image/png')
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const quoted = m.quoted
  const mediaType = quoted?.mediaType
  const mediaMessage = mediaType ? quoted.mediaMessage?.[mediaType] : null
  const isImage = mediaType === 'imageMessage'
  const isVideo = mediaType === 'videoMessage'

  // 1. KASUS A: Pengguna mengirim atau membalas teks untuk View-Once Text
  const hasTextParam = !!(text && text.trim())
  const hasQuotedText = !!(quoted && quoted.text && !isImage && !isVideo)

  if (hasTextParam || hasQuotedText) {
    const rawSecret = (hasTextParam ? text.trim() : quoted.text).trim()

    await m.react('⏳').catch(() => {})

    try {
      // Bypass native View Once: Render teks ke dalam kartu gambar rahasia berdesain estetik
      const cardBuffer = await renderSecretCard(rawSecret)

      // Kirim sebagai foto sekali lihat resmi WhatsApp (memunculkan gelembung ① Foto)
      await conn.sendMessage(m.chat, {
        image: cardBuffer,
        caption: '🔒 Pesan Rahasia (Sekali Lihat)',
        viewOnce: true
      }, { quoted: m })

      // Jika di dalam grup, hapus pesan perintah pengguna agar teks rahasia tidak bocor di chat log
      if (m.isGroup) {
        await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {})
      }

      await m.react('🔒').catch(() => {})
      return
    } catch (errText) {
      console.error('[ViewOnce Text Error]:', errText)
      return m.reply(status.error(`Gagal memproses pesan rahasia sekali lihat:\n> ${errText?.message || errText}`))
    }
  }

  // 2. KASUS B: Pengguna membalas Media Foto atau Video
  if (quoted && (isImage || isVideo)) {
    await m.react('⏳').catch(() => {})

    try {
      const buffer = await quoted.download()
      if (!buffer?.length) throw new Error('Media tidak berhasil diunduh.')

      const caption = text?.trim() || mediaMessage?.caption || ''
      await conn.sendMessage(m.chat, isImage ? {
        image: buffer,
        mimetype: mediaMessage?.mimetype || 'image/jpeg',
        caption,
        viewOnce: true
      } : {
        video: buffer,
        mimetype: mediaMessage?.mimetype || 'video/mp4',
        caption,
        viewOnce: true
      }, { quoted: m })

      await m.react('✅').catch(() => {})
      return
    } catch (e) {
      await m.react('❌').catch(() => {})
      console.error('[ViewOnce Media Error]:', e)
      return m.reply(status.error(`Gagal mengirim media sebagai sekali lihat:\n> ${e?.message || e}`))
    }
  }

  // 3. Panduan Penggunaan jika tidak ada input yang cocok
  const helpText = `*──  ୨୧ ✧ PESAN SEKALI LIHAT ✧ ୨୧  ──*\n\n` +
    `*╭  〔 ✦ ᴄ ᴀ ʀ ᴀ  ᴘ ᴇ ɴ ɢ ɢ ᴜ ɴ ᴀ ᴀ ɴ 〕*\n` +
    `*┆* ⟡ ᴛᴇᴋꜱ ꜱᴇᴋᴀʟɪ ʟɪʜᴀᴛ :\n` +
    `*┆* › *${usedPrefix + command}* <pesan rahasia>\n` +
    `*┆* ⟡ ᴍᴇᴅɪᴀ ꜱᴇᴋᴀʟɪ ʟɪʜᴀᴛ :\n` +
    `*┆* › Balas foto atau video dengan *${usedPrefix + command}*\n` +
    `*╰───────────────*\n\n` +
    `> 🔒 _Pesan teks otomatis dijadikan kartu gambar sekali lihat berlogo ① yang anti-screenshot dan hangus setelah dibaca._`

  return m.reply(helpText)
}

handler.help = ['vo <teks/media>', 'votext <teks>', 'viewonce']
handler.tags = ['tools']
handler.command = /^(vo|viewonce|votext|sekalilihat)$/i
handler.limit = true
handler.register = true

handler.desc = 'Alat utilitas praktis untuk memproses viewonce.'
handler.tutorial = [
  '.vo <input>',
  'Ketik .vo diikuti input yang diperlukan atau balas pesan target'
]

export default handler
