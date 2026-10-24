import { prepareWAMessageMedia } from '@whiskeysockets/baileys'
import { getRpgHelpButtons, isRpgHelpRequest } from './rpgHelpMessage.js'

export async function sendRpgButtons(conn, {
  chat,
  message,
  text,
  title,
  subtitle,
  footer = 'AVELIA • RPG',
  buffer,
  image,
  thumbnailUrl,
  buttonText = '📋 PILIH AKSI',
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
  if (isRpgHelpRequest(message || quoted)) {
    text = fallbackText || text
    buttons = buttons || getRpgHelpButtons(text)
    noThumbnail = true
    noHeader = true
  }

  const actionRows = (buttons || [])
    .filter(button => Array.isArray(button) && button[0] && button[1])
    .map(([label, command]) => ({ title: String(label), id: String(command) }))
  const sectionRows = (sections || []).flatMap(section => section.rows || []).filter(row => row?.id)
  const totalChoices = actionRows.length + sectionRows.length
  if (totalChoices > 2) {
    if (actionRows.length) {
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
    preferV2 = true
  }

  if (sections) {
    const quickReplyButtons = (buttons || [])
      .filter(button => Array.isArray(button) && button[0] && button[1])
    const interactiveSender = typeof sendInteractive === 'function'
      ? sendInteractive
      : typeof conn.sendInteractive === 'function'
        ? content => conn.sendInteractive(chat, content, quoted ? { quoted } : {})
        : null
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
      ...(sectionLines.length ? ['', '📌 *PILIHAN*', ...sectionLines] : [])
    ].join('\n')

    if (interactiveSender) {
      try {
        const media = image
          ? await prepareWAMessageMedia(
            { image: Buffer.isBuffer(image) ? image : { url: image } },
            { upload: conn.waUploadToServer }
          )
          : null
        const interactiveMessage = {
          ...(media?.imageMessage
            ? { header: { hasMediaAttachment: true, imageMessage: media.imageMessage } }
            : {}),
          body: { text: text || '' },
          footer: { text: footer || '' },
          nativeFlowMessage: {
            buttons: [
              {
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                  ...(!noHeader && title ? { title } : {}),
                  sections
                })
              },
              ...quickReplyButtons.map(([label, command]) => ({
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({ display_text: label, id: command })
              }))
            ]
          }
        }
        return await interactiveSender({ interactiveMessage })
      } catch (error) {
        console.error('[RPG targeted list button failed]:', error?.message || error)
      }
    }

    if (image && typeof conn.ButtonV2 === 'function') {
      try {
        const button = new conn.ButtonV2(conn)
        button.setBody(text)
        button.setFooter(footer)
        if (image) {
          const media = await prepareWAMessageMedia(
            { image: Buffer.isBuffer(image) ? image : { url: image } },
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
        for (const [label, command] of quickReplyButtons) {
          button.addButton(label, command)
        }
        return await button.send(chat)
      } catch (error) {
        console.error('[RPG list button failed]:', error?.message || error)
      }
    }

    if (typeof reply === 'function') return reply(listFallbackText)
    if (typeof message?.reply === 'function') return message.reply(listFallbackText)
    return conn.sendMessage(chat, { text: listFallbackText }, quoted ? { quoted } : {})
  }

  const sendV2 = async () => {
    if (typeof conn.sendButtonV2 !== 'function') return null
    try {
      return {
        result: await conn.sendButtonV2(chat, {
          text,
          footer,
          noLocationHeader: true,
          ...(image ? { image } : {}),
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

  if (typeof conn.sendButton === 'function') {
    try {
      return await conn.sendButton(
        chat,
        text,
        footer,
        null,
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
  image,
  thumbnailUrl,
  acceptText = '✅ Lanjutkan',
  acceptCommand,
  cancelText = '↩️ Batalkan',
  cancelCommand,
  buttonText = '📋 PILIH KONFIRMASI',
  mentions = [],
  preferV2 = true,
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
    image,
    thumbnailUrl: thumbnailUrl || m.rpgFeatureImage,
    noThumbnail,
    noHeader,
    buttonText,
    buttons: [
      [acceptText, acceptCommand],
      [cancelText, cancelCommand]
    ],
    mentions,
    quoted: m,
    preferV2,
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
