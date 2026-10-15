export async function sendRpgButtons(conn, {
  chat,
  message,
  text,
  title,
  subtitle,
  footer = 'AVELIA • RPG',
  buttonText = '📋 BUKA DAFTAR',
  buttons,
  sections,
  fallbackText,
  quoted,
  reply,
  preferV2 = false
}) {
  if (sections) {
    if (typeof conn.ButtonV2 === 'function') {
      try {
        const button = new conn.ButtonV2(conn)
        button.setTitle(title)
        button.setSubtitle(subtitle || 'Pilih salah satu menu')
        button.setBody(text)
        button.setFooter(footer)
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
      return { result: await conn.sendButtonV2(chat, { title, subtitle, text, footer, buttons }, quoted) }
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
      return await conn.sendButton(chat, text, footer, buttons, quoted || null)
    } catch (error) {
      console.error('[RPG buttons send failed]:', error?.message || error)
    }
  }

  if (!preferV2) {
    const sent = await sendV2()
    if (sent) return sent.result
  }

  const buttonLines = (buttons || [])
    .filter(button => Array.isArray(button) && button[0] && button[1])
    .map(([label, command]) => `> ↳ ${label}: *${command}*`)
  const fallbackText = [text, ...(buttonLines.length ? ['', '📌 *PILIHAN*', ...buttonLines] : [])].join('\n')
  if (typeof reply === 'function') return reply(fallbackText)
  return conn.sendMessage(chat, { text: fallbackText }, quoted ? { quoted } : {})
}

export async function sendRpgQuickButton(conn, m, { text, title, buttonText, command, footer = 'AVELIA • RPG' }) {
  return sendRpgButtons(conn, {
    chat: m.chat,
    text,
    title,
    footer,
    buttons: [[buttonText, command]],
    quoted: m,
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
