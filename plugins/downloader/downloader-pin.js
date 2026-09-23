import axios from 'axios'
import crypto from 'crypto'
import * as Baileys from '@whiskeysockets/baileys'
import * as Elaina from '@rexxhayanasi/elaina-baileys'
import { status, toSmallNum } from '../../lib/style.js'

const generateWAMessage = Elaina.generateWAMessage || Baileys.generateWAMessage
const generateWAMessageFromContent = Elaina.generateWAMessageFromContent || Baileys.generateWAMessageFromContent
const jidNormalizedUser = Elaina.jidNormalizedUser || Baileys.jidNormalizedUser

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ─── API 1: Ryzumi Pinterest Search ─────────────────────────────────────────
async function searchPinterestViaRyzumi(query) {
  const { data } = await axios.get(
    `https://api.ryzumi.net/api/search/pinterest?query=${encodeURIComponent(query)}`,
    {
      timeout: 20000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36'
      }
    }
  )

  if (!Array.isArray(data) || !data.length) {
    throw new Error('Ryzumi: hasil pencarian kosong')
  }

  const urls = data
    .map(item => item?.directLink || item?.link)
    .filter(u => typeof u === 'string' && u.startsWith('http'))

  if (!urls.length) {
    throw new Error('Ryzumi: tidak ada URL gambar yang valid')
  }

  return urls
}

// ─── API 2: Deline Pinterest Search (Fallback) ──────────────────────────────
async function searchPinterestViaDeline(query) {
  const { data } = await axios.get(
    `https://api.deline.web.id/search/pinterest?q=${encodeURIComponent(query)}`,
    {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }
  )

  const arr = Array.isArray(data?.data) ? data.data : []
  const urls = arr.map(it => it.image).filter(u => typeof u === 'string' && u.startsWith('http'))

  if (!urls.length) {
    throw new Error('Deline: hasil pencarian kosong')
  }

  return urls
}

// ─── Master Pinterest Search ────────────────────────────────────────────────
async function searchPinterest(query) {
  const apis = [
    { name: 'Ryzumi', fn: () => searchPinterestViaRyzumi(query) },
    { name: 'Deline', fn: () => searchPinterestViaDeline(query) }
  ]

  let lastErr = ''
  for (const api of apis) {
    try {
      const urls = await api.fn()
      if (urls && urls.length > 0) {
        console.log(`[Pinterest] ✅ Berhasil via ${api.name}`)
        return urls
      }
    } catch (e) {
      lastErr = e.message || String(e)
      console.warn(`[Pinterest] ⚠️ ${api.name} gagal: ${lastErr}`)
    }
  }

  throw new Error(`Gagal mencari gambar Pinterest.\n> (${lastErr || 'Semua provider tidak merespon'})`)
}

// ─── HANDLER UTAMA ──────────────────────────────────────────────────────────
const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      status.warning(
        `Masukkan kata kunci pencarian Pinterest!\n` +
        `> Contoh: *${usedPrefix + command} elaina*\n` +
        `> Contoh dengan jumlah: *${usedPrefix + command} elaina 3*`
      )
    )
  }

  let query = text.trim()

  // ─── Direct Pinterest Link Download ─────────────────────────────────────────
  if (/^https?:\/\/(?:[a-zA-Z0-9_-]+\.)?(?:pinterest\.com\/pin\/|pin\.it\/)/i.test(query)) {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
    try {
      const res = await axios.get(`https://api.ryzumi.net/api/downloader/pinterest?url=${encodeURIComponent(query)}`, {
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      const d = res.data
      const mediaUrl = d?.url || d?.download || d?.video || d?.image || d?.media
      if (d && mediaUrl) {
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        const caption = `*──  ୨୧ ✧ PINTEREST DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴍ ᴇ ᴅ ɪ ᴀ 〕*
> ⟡ ᴊᴜᴅᴜʟ : *${d.title || 'Pinterest Media'}*
> ◈ ᴛɪᴘᴇ  : *${d.type || (mediaUrl.includes('.mp4') ? 'Video' : 'Gambar')}*
*╰───────────────*

> _Media Pinterest berhasil diunduh._`.trim()

        if (mediaUrl.includes('.mp4')) {
          return conn.sendMessage(m.chat, { video: { url: mediaUrl }, caption }, { quoted: m })
        } else {
          return conn.sendMessage(m.chat, { image: { url: mediaUrl }, caption }, { quoted: m })
        }
      }
    } catch (ePinDl) {
      console.warn('[Pinterest Downloader Link Error, falling back to search]:', ePinDl.message)
    }
  }

  let maxCount = 5

  // Parse custom image count jika ada (contoh: ".pin elaina 3")
  const parts = query.split(/\s+/)
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1]
    if (/^\d+$/.test(lastPart)) {
      const parsed = parseInt(lastPart, 10)
      if (parsed > 0 && parsed <= 10) {
        maxCount = parsed
        query = parts.slice(0, -1).join(' ')
      }
    }
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const rawUrls = await searchPinterest(query)
    const selectedUrls = shuffle(rawUrls).slice(0, maxCount)

    const mediaList = []
    for (let i = 0; i < selectedUrls.length; i++) {
      const url = selectedUrls[i]
      try {
        const resp = await axios.get(url, {
          responseType: 'arraybuffer',
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
            'Referer': 'https://www.pinterest.com/'
          }
        })
        const contentType = resp.headers['content-type'] || ''
        if (contentType && !contentType.startsWith('image/')) continue

        const buffer = Buffer.from(resp.data)
        const caption = `*──  ୨୧ ✧ PINTEREST SEARCH ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ɢ ᴀ ᴍ ʙ ᴀ ʀ 〕*
> ⟡ ᴘᴇɴᴄᴀʀɪᴀɴ : *${query}*
> ◈ ꜱʟɪᴅᴇ     : *${toSmallNum(mediaList.length + 1)} / ${toSmallNum(selectedUrls.length)}*
*╰───────────────*`.trim()

        mediaList.push({
          image: buffer,
          caption
        })
      } catch (err) {
        console.warn(`[Pinterest Download Image Error]:`, err?.message || err)
      }
    }

    if (!mediaList.length) {
      throw new Error(`Tidak ada gambar valid yang berhasil diunduh untuk "${query}".`)
    }

    if (mediaList.length === 1) {
      await conn.sendMessage(m.chat, mediaList[0], { quoted: m })
    } else {
      let sentAlbum = false
      const userJid = jidNormalizedUser(conn.user.id)
      try {
        const opener = generateWAMessageFromContent(
          m.chat,
          {
            messageContextInfo: { messageSecret: crypto.randomBytes(32) },
            albumMessage: {
              expectedImageCount: mediaList.length,
              expectedVideoCount: 0
            }
          },
          {
            userJid,
            quoted: m.message ? m : undefined,
            upload: conn.waUploadToServer
          }
        )

        await conn.relayMessage(opener.key.remoteJid, opener.message, {
          messageId: opener.key.id
        })

        for (const content of mediaList) {
          const msg = await generateWAMessage(opener.key.remoteJid, content, {
            userJid,
            upload: conn.waUploadToServer
          })

          msg.message.messageContextInfo = {
            messageSecret: crypto.randomBytes(32),
            messageAssociation: {
              associationType: 1,
              parentMessageKey: opener.key
            }
          }

          await conn.relayMessage(msg.key.remoteJid, msg.message, {
            messageId: msg.key.id
          })
        }
        sentAlbum = true
      } catch (albumErr) {
        console.warn('[Pinterest Album Relay Error]:', albumErr?.message || albumErr)
      }

      // Fallback jika albumMessage gagal
      if (!sentAlbum) {
        for (const content of mediaList) {
          await conn.sendMessage(m.chat, content, { quoted: m })
          await new Promise(r => setTimeout(r, 600))
        }
      }
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    console.error('[Pinterest Handler Error]:', e)
    m.reply(status.error(`Gagal memproses pencarian Pinterest:\n> ${e?.message || e}`))
  }
}

handler.help = ['pin <query>', 'pinterest <query>']
handler.tags = ['downloader', 'internet']
handler.command = /^(pin|pinterest)$/i
handler.limit = true

export default handler