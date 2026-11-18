import sharp from 'sharp'
import fetch from 'node-fetch'

const thumbnailCache = new Map()
const bufferThumbnailCache = new WeakMap()
const MAX_URL_THUMBNAILS = 128

async function loadImageBuffer(media) {
  if (Buffer.isBuffer(media)) return media
  const url = typeof media === 'string' ? media : media?.url
  if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) return null

  const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.startsWith('image/')) throw new Error(`Invalid image content type: ${contentType}`)
  return Buffer.from(await response.arrayBuffer())
}

export async function makeButtonThumbnail(media) {
  if (!media) return null

  const mediaUrl = typeof media === 'string' ? media : media?.url
  if (mediaUrl && thumbnailCache.has(mediaUrl)) {
    const cached = thumbnailCache.get(mediaUrl)
    thumbnailCache.delete(mediaUrl)
    thumbnailCache.set(mediaUrl, cached)
    return cached
  }
  if (Buffer.isBuffer(media) && bufferThumbnailCache.has(media)) {
    return bufferThumbnailCache.get(media)
  }

  try {
    const image = await loadImageBuffer(media)
    if (!image?.length) return null
    const thumbnail = await sharp(image)
      .resize(250, 250, { fit: 'inside' })
      .jpeg({ quality: 70 })
      .toBuffer()

    if (mediaUrl) {
      thumbnailCache.set(mediaUrl, thumbnail)
      if (thumbnailCache.size > MAX_URL_THUMBNAILS) {
        thumbnailCache.delete(thumbnailCache.keys().next().value)
      }
    } else if (Buffer.isBuffer(media)) {
      bufferThumbnailCache.set(media, thumbnail)
    }
    return thumbnail
  } catch (error) {
    console.error(`[Button thumbnail preparation failed]: ${error?.message || error}`)
    return null
  }
}

function getButtonFallback(text, buttons, sections) {
  const options = [
    ...(sections || []).flatMap(section =>
      (section.rows || []).map(row => `> ↳ ${row.title || row.header || row.id}: *${row.id}*`)
    ),
    ...(buttons || []).map(([label, command]) => `> ↳ ${label}: *${command}*`)
  ]
  return [text, ...(options.length ? ['', '📌 *PILIHAN*', ...options] : [])].join('\n')
}

export async function sendThumbnailButtonCard(conn, {
  chat,
  text,
  title,
  subtitle,
  footer = 'AVELIA',
  thumbnail,
  buttons = [],
  sections,
  buttonText = '📋 Buka Pilihan',
  quoted,
  mentions = [],
  contextInfo,
  fallbackText
}) {
  const imageThumbnail = await makeButtonThumbnail(thumbnail)
  const messageText = fallbackText || getButtonFallback(text, buttons, sections)

  if (typeof conn?.ButtonV2 === 'function') {
    try {
      const button = new conn.ButtonV2(conn)
      if (title) button.setTitle(String(title))
      if (subtitle) button.setSubtitle(String(subtitle))
      button.setBody(String(text || ''))
      if (footer) button.setFooter(String(footer))
      if (imageThumbnail) button.setRawThumbnail(imageThumbnail)

      if (sections?.length) {
        button.addRawButton({
          buttonId: 'media_card_select',
          buttonText: { displayText: buttonText },
          type: 1,
          nativeFlowInfo: {
            name: 'single_select',
            paramsJson: JSON.stringify({
              ...(title ? { title } : {}),
              sections
            })
          }
        })
      }
      for (const [label, command] of buttons) {
        if (label && command) button.addButton(String(label), String(command))
      }

      const messageContext = { ...(contextInfo || {}) }
      if (quoted) {
        Object.assign(messageContext, {
          stanzaId: quoted.key?.id,
          participant: quoted.sender || quoted.key?.participant || quoted.key?.remoteJid,
          quotedMessage: quoted.message || (quoted.vM ? quoted.vM.message : undefined)
        })
      }
      if (mentions.length) messageContext.mentionedJid = mentions
      if (Object.keys(messageContext).length) button.setContextInfo(messageContext)

      return await button.send(chat)
    } catch (error) {
      console.error('[Thumbnail button card send failed]:', error?.message || error)
    }
  }

  if (typeof conn?.sendButtonV2 === 'function') {
    try {
      const backupButtons = buttons.length
        ? buttons
        : (sections || []).flatMap(section =>
            (section.rows || []).map(row => [row.title || row.header || row.id, row.id])
          ).slice(0, 2)
      return await conn.sendButtonV2(chat, {
        title,
        subtitle,
        text: messageText,
        footer,
        rawThumbnail: imageThumbnail,
        buttons: backupButtons,
        contextInfo
      }, quoted)
    } catch (error) {
      console.error('[Thumbnail button fallback failed]:', error?.message || error)
    }
  }

  if (typeof conn?.sendMessage === 'function') {
    return conn.sendMessage(chat, {
      text: messageText,
      mentions: mentions.length ? mentions : undefined,
      contextInfo
    }, quoted ? { quoted } : {})
  }
  if (typeof quoted?.reply === 'function') return quoted.reply(messageText)
}
