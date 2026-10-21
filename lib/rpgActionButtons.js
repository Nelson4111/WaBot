import { prepareWAMessageMedia } from '@whiskeysockets/baileys'

export async function sendRpgButtons(conn, {
  chat,
  message,
  text,
  title,
  subtitle,
  footer = 'AVELIA • RPG',
  buffer,
  thumbnailUrl,
  buttonText = '📋 BUKA DAFTAR',
  buttons,
  sections,
  fallbackText,
  quoted,
  contextInfo,
  mentions = [],
  reply,
  preferV2 = false,
  classicOnly = false,
  noThumbnail = false,
  noHeader = false,
  sendInteractive
}) {
  let thumbnail = null
  const featureThumbnailUrl = message?.rpgFeatureImage || quoted?.rpgFeatureImage
  const bufferUrl = typeof buffer === 'string' ? buffer : null
  const effectiveThumbnailUrl = thumbnailUrl || bufferUrl || featureThumbnailUrl
  if ((!noThumbnail || thumbnailUrl || featureThumbnailUrl) && (Buffer.isBuffer(buffer) || effectiveThumbnailUrl)) {
    let source = Buffer.isBuffer(buffer) ? buffer : null
    if (!source && effectiveThumbnailUrl) {
      try {
        const response = await fetch(effectiveThumbnailUrl, { signal: AbortSignal.timeout(5000) })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        source = Buffer.from(await response.arrayBuffer())
      } catch (error) {
        console.error('[RPG button thumbnail fetch failed]:', error?.message || error)
      }
    }
    if (source?.length) {
      try {
        thumbnail = await (await import('sharp')).default(source)
          .jpeg({ quality: 85 })
          .toBuffer()
      } catch (error) {
        console.error('[RPG button thumbnail decode failed]:', error?.message || error)
        thumbnail = null
      }
    }
  }
  const hasImageMedia = Boolean(thumbnail)

  if (sections) {
    if (typeof sendInteractive === 'function') {
      try {
        const media = thumbnail
          ? await prepareWAMessageMedia({ image: thumbnail }, { upload: conn.waUploadToServer })
          : null
        const header = {
          ...(media?.imageMessage ? { hasMediaAttachment: true, imageMessage: media.imageMessage } : {})
        }
        const interactiveMessage = {
          ...(Object.keys(header).length ? { header } : {}),
          body: { text: text || '' },
          footer: { text: footer || '' },
          nativeFlowMessage: {
            buttons: [{
              name: 'single_select',
              buttonParamsJson: JSON.stringify({
                ...(!noHeader && title ? { title } : {}),
                sections
              })
            }]
          }
        }
        return await sendInteractive({ interactiveMessage })
      } catch (error) {
        console.error('[RPG targeted list button failed]:', error?.message || error)
        if (typeof reply === 'function') return reply(fallbackText)
        if (typeof message?.reply === 'function') return message.reply(fallbackText)
        return conn.sendMessage(chat, { text: fallbackText }, quoted ? { quoted } : {})
      }
    }

    if (typeof conn.ButtonV2 === 'function') {
      try {
        const button = new conn.ButtonV2(conn)
        button.setBody(text)
        button.setFooter(footer)
        if (thumbnail) {
          const media = await prepareWAMessageMedia(
            { image: thumbnail },
            { upload: conn.waUploadToServer }
          )
          button.setMedia({ headerType: 4, imageMessage: media.imageMessage })
        }
        button.addRawButton({
          buttonId: 'rpg_list_select',
          buttonText: { displayText: buttonText },
          type: 1,
          nativeFlowInfo: {
            name: 'single_select',
            paramsJson: JSON.stringify({
              ...(!noHeader && title ? { title } : {}),
              sections
            })
          }
        })
        return await button.send(chat)
      } catch (error) {
        console.error('[RPG list button failed]:', error?.message || error)
      }
    }

    if (typeof reply === 'function') return reply(fallbackText)
    if (typeof message?.reply === 'function') return message.reply(fallbackText)
    return conn.sendMessage(chat, { text: fallbackText }, quoted ? { quoted } : {})
  }

  const sendV2 = async () => {
    if (typeof conn.sendButtonV2 !== 'function') return null
    try {
      return {
        result: await conn.sendButtonV2(chat, {
          text,
          footer,
          noLocationHeader: true,
          ...(hasImageMedia ? { image: thumbnail } : { buffer: thumbnail }),
          buttons,
          contextInfo: contextInfo || (mentions.length ? { mentions } : undefined)
        }, quoted)
      }
    } catch (error) {
      console.error('[RPG ButtonV2 send failed]:', error?.message || error)
      return null
    }
  }

  if (preferV2) {
    const sent = await sendV2()
    if (sent) return sent.result
  }

  if (!hasImageMedia && typeof conn.sendButton === 'function') {
    try {
      return await conn.sendButton(
        chat,
        text,
        footer,
        thumbnail,
        buttons,
        quoted || null,
        contextInfo || (mentions.length ? { mentions } : {})
      )
    } catch (error) {
      console.error('[RPG buttons send failed]:', error?.message || error)
    }
  }

  if (!preferV2 && !classicOnly) {
    const sent = await sendV2()
    if (sent) return sent.result
  }

  const buttonLines = (buttons || [])
    .filter(button => Array.isArray(button) && button[0] && button[1])
    .map(([label, command]) => `> ↳ ${label}: *${command}*`)
  const buttonFallbackText = [text, ...(buttonLines.length ? ['', '📌 *PILIHAN*', ...buttonLines] : [])].join('\n')
  if (typeof reply === 'function') return reply(buttonFallbackText)
  return conn.sendMessage(chat, {
    text: buttonFallbackText,
    mentions: mentions.length ? mentions : undefined,
    contextInfo
  }, quoted ? { quoted } : {})
}

export async function sendRpgQuickButton(conn, m, {
  text,
  title,
  buttonText,
  command,
  footer = 'AVELIA • RPG',
  noThumbnail = false
}) {
  return sendRpgButtons(conn, {
    chat: m.chat,
    message: m,
    text,
    title,
    thumbnailUrl: m.rpgFeatureImage,
    footer,
    buttons: [[buttonText, command]],
    quoted: m,
    preferV2: !noThumbnail,
    classicOnly: noThumbnail,
    noThumbnail,
    reply: fallbackText => m.reply(fallbackText)
  })
}

export async function sendRpgConfirmButtons(conn, m, {
  text,
  title = '✨ KONFIRMASI AKSI',
  subtitle = 'Pilih langkahmu untuk melanjutkan',
  buffer,
  noThumbnail = false,
  noHeader = false,
  thumbnailUrl,
  acceptText = '✅ Lanjutkan',
  acceptCommand,
  cancelText = '↩️ Batalkan',
  cancelCommand,
  mentions = [],
  footer = 'AVELIA • RPG'
}) {
  return sendRpgButtons(conn, {
    chat: m.chat,
    message: m,
    text,
    title,
    subtitle,
    footer,
    buffer,
    thumbnailUrl: thumbnailUrl || m.rpgFeatureImage,
    noThumbnail,
    noHeader,
    buttons: [
      [acceptText, acceptCommand],
      [cancelText, cancelCommand]
    ],
    mentions,
    quoted: m,
    preferV2: !noThumbnail,
    classicOnly: noThumbnail,
    reply: fallbackText => m.reply(fallbackText)
  })
}

export async function sendRpgHealPrompt(conn, m, {
  text,
  usedPrefix
}) {
  const prefix = usedPrefix || '.'

  return sendRpgButtons(conn, {
    chat: m.chat,
    text,
    title: '💖 PULIHKAN DIRI',
    subtitle: 'Tombol ini memulihkan karakter pengirim pesan',
    footer: 'AVELIA • RPG MEDICAL',
    buttons: [[
      '💖 Heal Diriku Sendiri',
      `${prefix}heal self`
    ]],
    quoted: m,
    preferV2: true,
    noThumbnail: true,
    reply: fallbackText => m.reply(fallbackText)
  })
}

export async function sendRpgRegistrationPrompt(conn, m, usedPrefix, text = 'Petualanganmu menunggu! Buat karakter RPG dan mulai perjalananmu sekarang.') {
  const prefix = usedPrefix || '.'
  return sendRpgButtons(conn, {
    chat: m.chat,
    text,
    buttons: [['🚀 Mulai Petualangan', `${prefix}adventure`]],
    footer: '',
    quoted: m,
    reply: fallbackText => m.reply(fallbackText)
  })
}

export async function sendRpgListButton(conn, m, {
  title,
  subtitle = 'Pilih salah satu menu',
  text,
  footer = 'AVELIA • RPG MENU',
  thumbnailUrl,
  buttonText = '📋 BUKA DAFTAR',
  sections,
  fallbackText,
  reply,
  noThumbnail = false,
  noHeader = false
}) {
  return sendRpgButtons(conn, {
    chat: m.chat,
    message: m,
    quoted: m,
    title,
    subtitle,
    text,
    footer,
    thumbnailUrl,
    buttonText,
    sections,
    fallbackText,
    reply,
    noThumbnail,
    noHeader
  })
}

export async function sendRpgExpActivityList(conn, m, usedPrefix, text) {
  const activities = [
    { header: '🎣 Memancing', title: 'Memancing', description: 'Cari ikan dan kumpulkan EXP', id: `${usedPrefix}mancing` },
    { header: '⛏️ Menambang', title: 'Mining', description: 'Menambang ore sambil mendapat EXP', id: `${usedPrefix}mining` },
    { header: '💼 Bekerja', title: 'Work', description: 'Bekerja dan dapatkan uang serta EXP', id: `${usedPrefix}work` },
    { header: '🗺️ Petualangan', title: 'Adventure', description: 'Jelajahi RPG dan kumpulkan EXP', id: `${usedPrefix}adventure` }
  ]
  const fallbackText = [
    text,
    '',
    '🌱 *PILIH KEGIATAN UNTUK MENAMBAH EXP*',
    ...activities.map(activity => `> ${activity.header}: *${activity.id}*`)
  ].join('\n')

  return sendRpgListButton(conn, m, {
    title: '✦ PETUALANGAN LEVEL ✦',
    subtitle: 'Pilih kegiatan untuk mengumpulkan EXP',
    text,
    footer: 'AVELIA • RPG LEVELING',
    buttonText: '🌱 PILIH KEGIATAN EXP',
    sections: [{ title: 'Pilih aktivitas RPG', rows: activities }],
    fallbackText
  })
}
