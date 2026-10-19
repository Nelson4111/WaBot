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
  if (!noThumbnail && title && subtitle) {
    thumbnail = buffer || null
    if (!thumbnail && thumbnailUrl) {
      try {
        const response = await fetch(thumbnailUrl, { signal: AbortSignal.timeout(5000) })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        thumbnail = Buffer.from(await response.arrayBuffer())
      } catch (error) {
        console.error('[RPG button thumbnail fetch failed]:', error?.message || error)
      }
    }
  }
  const headerTitle = noHeader ? undefined : title
  const headerSubtitle = noHeader ? undefined : subtitle

  if (sections) {
    if (typeof sendInteractive === 'function') {
      try {
        const media = thumbnail
          ? await prepareWAMessageMedia({ image: thumbnail }, { upload: conn.waUploadToServer })
          : null
        const interactiveMessage = {
          header: {
            ...(headerTitle ? { title: headerTitle } : {}),
            ...(headerSubtitle ? { subtitle: headerSubtitle } : {}),
            ...(media?.imageMessage ? { hasMediaAttachment: true, imageMessage: media.imageMessage } : {})
          },
          body: { text: text || '' },
          footer: { text: footer || '' },
          nativeFlowMessage: {
            buttons: [{
              name: 'single_select',
              buttonParamsJson: JSON.stringify({ title, sections })
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
        if (headerTitle) button.setTitle(headerTitle)
        if (headerSubtitle) button.setSubtitle(headerSubtitle)
        button.setBody(text)
        button.setFooter(footer)
        if (thumbnail) button.setRawThumbnail(thumbnail)
        button.addRawButton({
          buttonId: 'rpg_list_select',
          buttonText: { displayText: buttonText },
          type: 1,
          nativeFlowInfo: {
            name: 'single_select',
            paramsJson: JSON.stringify({ title, sections })
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
          title: headerTitle,
          subtitle: headerSubtitle,
          text,
          footer,
          buffer: thumbnail,
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
    text,
    title,
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
  acceptText = '✅ Lanjutkan',
  acceptCommand,
  cancelText = '↩️ Batalkan',
  cancelCommand,
  footer = 'AVELIA • RPG'
}) {
  return sendRpgButtons(conn, {
    chat: m.chat,
    text,
    title,
    subtitle,
    footer,
    buffer,
    noThumbnail,
    noHeader,
    buttons: [
      [acceptText, acceptCommand],
      [cancelText, cancelCommand]
    ],
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
      '💖 Pulihkan HP-ku',
      `${prefix}heal`
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
  buttonText = '📋 BUKA DAFTAR',
  sections,
  fallbackText,
  reply
}) {
  return sendRpgButtons(conn, {
    chat: m.chat,
    message: m,
    quoted: m,
    title,
    subtitle,
    text,
    footer,
    buttonText,
    sections,
    fallbackText,
    reply
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
