import { getMenuThumbnail } from './style.js'
import { prepareWAMessageMedia } from '@whiskeysockets/baileys'

export async function sendRpgButtons(conn, {
  chat,
  message,
  text,
  title,
  subtitle,
  footer = 'AVELIA • RPG',
  buffer,
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
  sendInteractive
}) {
  if (sections) {
    if (typeof sendInteractive === 'function') {
      try {
        const menuThumbnail = buffer || (noThumbnail ? null : await getMenuThumbnail())
        const media = menuThumbnail
          ? await prepareWAMessageMedia({ image: menuThumbnail }, { upload: conn.waUploadToServer })
          : null
        const interactiveMessage = {
          header: {
            title: title || '',
            subtitle: subtitle || '',
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
        button.setTitle(title)
        button.setSubtitle(subtitle || 'Pilih salah satu menu')
        button.setBody(text)
        button.setFooter(footer)
        if (buffer) button.setRawThumbnail(buffer)
        else if (!noThumbnail) {
          const menuThumbnail = await getMenuThumbnail()
          if (menuThumbnail) button.setRawThumbnail(menuThumbnail)
        }
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

  if (!buffer && !noThumbnail) buffer = await getMenuThumbnail()

  const sendV2 = async () => {
    if (typeof conn.sendButtonV2 !== 'function') return null
    try {
      return {
        result: await conn.sendButtonV2(chat, {
          title,
          subtitle,
          text,
          footer,
          buffer,
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
        buffer || null,
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
    reply: fallbackText => m.reply(fallbackText)
  })
}

export async function sendRpgConfirmButtons(conn, m, {
  text,
  title = '✨ KONFIRMASI AKSI',
  subtitle = 'Pilih langkahmu untuk melanjutkan',
  buffer,
  noThumbnail = false,
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
  usedPrefix,
  target,
  mentions = []
}) {
  const prefix = usedPrefix || '.'

  return sendRpgButtons(conn, {
    chat: m.chat,
    text,
    title: '💖 WAKTUNYA PULIH',
    subtitle: 'Pulihkan dirimu dan kembali ke petualangan',
    footer: 'AVELIA • RPG MEDICAL',
    buttons: [[
      '💖 Pulihkan Diri Sekarang',
      `${prefix}heal`
    ]],
    quoted: m,
    mentions: [...new Set([...mentions, ...(target ? [target] : [])])],
    preferV2: true,
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
