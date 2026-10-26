import { prepareWAMessageMedia } from '@whiskeysockets/baileys'
import { getRpgHelpButtons, isRpgHelpRequest } from './rpgHelpMessage.js'

export async function sendRpgButtons(conn, {
  chat,
  message,
  text,
  title,
  footer = 'AVELIA • RPG',
  image,
  buffer,
  thumbnailUrl,
  buttons,
  sections,
  fallbackText,
  quoted,
  contextInfo,
  mentions = [],
  reply,
  noHeader = false,
  keepButtonsWithSections = false,
  sendInteractive
}) {
  const mediaImage = image || buffer || thumbnailUrl

  if (isRpgHelpRequest(message || quoted)) {
    text = fallbackText || text
    buttons = buttons || getRpgHelpButtons(text)
    noHeader = true
  }

  const actionRows = (buttons || [])
    .filter(button => Array.isArray(button) && button[0] && button[1])
    .map(([label, command]) => ({ title: String(label), id: String(command) }))
  const sectionRows = (sections || []).flatMap(section => section.rows || []).filter(row => row?.id)
  const totalChoices = actionRows.length + sectionRows.length
  if (totalChoices > 2) {
    if (actionRows.length && !keepButtonsWithSections) {
      sections = sections
        ? [...sections, { title: 'Pilihan tambahan', rows: actionRows }]
        : [{ title: title || 'Pilih aksi RPG', rows: actionRows }]
      buttons = []
    }
  } else if (totalChoices > 0) {
    buttons = [
      ...sectionRows.map(row => [String(row.title || row.header || row.id), String(row.id)]),
      ...actionRows.map(row => [row.title, row.id])
    ]
    sections = undefined
  }

  const quickReplyButtons = (buttons || [])
    .filter(button => Array.isArray(button) && button[0] && button[1])
    .map(([label, command]) => ({
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({ display_text: String(label), id: String(command) })
    }))
  const interactiveSender = typeof sendInteractive === 'function'
    ? sendInteractive
    : typeof conn.sendInteractive === 'function'
      ? content => conn.sendInteractive(chat, content, quoted ? { quoted } : {})
      : null
  const sendInteractiveButtons = async nativeFlowButtons => {
    if (!interactiveSender) return null
    try {
      const media = mediaImage
        ? await prepareWAMessageMedia(
          { image: Buffer.isBuffer(mediaImage) ? mediaImage : typeof mediaImage === 'string' ? { url: mediaImage } : mediaImage },
          { upload: conn.waUploadToServer }
        )
        : null
      const interactiveMessage = {
        ...(media?.imageMessage
          ? { header: { hasMediaAttachment: true, imageMessage: media.imageMessage } }
          : {}),
        body: { text: text || '' },
        footer: { text: footer || '' },
        nativeFlowMessage: { buttons: nativeFlowButtons },
        ...(contextInfo || mentions.length
          ? { contextInfo: contextInfo || { mentionedJid: mentions } }
          : {})
      }
      return { result: await interactiveSender({ interactiveMessage }) }
    } catch (error) {
      console.error('[RPG Native Flow send failed]:', error?.message || error)
      return null
    }
  }

  const sendFallback = async fallbackText => {
    if (mediaImage) {
      const imageContent = Buffer.isBuffer(mediaImage)
        ? mediaImage
        : typeof mediaImage === 'string'
          ? { url: mediaImage }
          : mediaImage
      return conn.sendMessage(chat, {
        image: imageContent,
        caption: fallbackText,
        mentions: mentions.length ? mentions : undefined,
        contextInfo
      }, quoted ? { quoted } : {})
    }
    if (typeof reply === 'function') return reply(fallbackText)
    if (typeof message?.reply === 'function') return message.reply(fallbackText)
    return conn.sendMessage(chat, { text: fallbackText }, quoted ? { quoted } : {})
  }

  if (sections) {
    const sectionLines = sections.flatMap(section =>
      (section.rows || [])
        .filter(row => row?.id)
        .map(row => {
          const label = row.title || row.header || row.id
          const description = row.description ? ` — ${row.description}` : ''
          return `> ↳ ${label}${description}: *${row.id}*`
        })
    )
    const listFallbackText = fallbackText || [
      text,
      ...(sectionLines.length || actionRows.length
        ? [
            '',
            '📌 *PILIHAN*',
            ...sectionLines,
            ...actionRows.map(row => `> ↳ ${row.title}: *${row.id}*`)
          ]
        : [])
    ].join('\n')

    const sent = await sendInteractiveButtons([
      {
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
          ...(!noHeader && title ? { title } : {}),
          sections
        })
      },
      ...quickReplyButtons
    ])
    if (sent) return sent.result

    return sendFallback(listFallbackText)
  }

  if (quickReplyButtons.length) {
    const sent = await sendInteractiveButtons(quickReplyButtons)
    if (sent) return sent.result
  }

  const buttonLines = (buttons || [])
    .filter(button => Array.isArray(button) && button[0] && button[1])
    .map(([label, command]) => `> ↳ ${label}: *${command}*`)
  const buttonFallbackText = [text, ...(buttonLines.length ? ['', '📌 *PILIHAN*', ...buttonLines] : [])].join('\n')
  if (mediaImage) return sendFallback(buttonFallbackText)
  if (typeof reply === 'function') return reply(buttonFallbackText)
  return conn.sendMessage(chat, {
    text: buttonFallbackText,
    mentions: mentions.length ? mentions : undefined,
    contextInfo
  }, quoted ? { quoted } : {})
}

export async function sendRpgQuickButton(conn, m, {
  text,
  buttonText,
  command,
  footer = 'AVELIA • RPG'
}) {
  return sendRpgButtons(conn, {
    chat: m.chat,
    message: m,
    text,
    footer,
    buttons: [[buttonText, command]],
    quoted: m,
    reply: fallbackText => m.reply(fallbackText)
  })
}

export async function sendRpgConfirmButtons(conn, m, {
  text,
  title,
  noHeader = false,
  image,
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
    footer,
    image,
    noHeader,
    buttons: [
      [acceptText, acceptCommand],
      [cancelText, cancelCommand]
    ],
    mentions,
    quoted: m,
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
      `${prefix}heal me`
    ]],
    quoted: m,
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
  text,
  footer = 'AVELIA • RPG MENU',
  sections,
  fallbackText,
  reply,
  noHeader = false
}) {
  return sendRpgButtons(conn, {
    chat: m.chat,
    message: m,
    quoted: m,
    title,
    text,
    footer,
    sections,
    fallbackText,
    reply,
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
