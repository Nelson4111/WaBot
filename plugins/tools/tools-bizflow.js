/**
 * BizFlow Interactive Message Plugin
 * Mengirim interactiveMessage + nativeFlowMessage dengan additionalNodes biz v9 mixed.
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

import { sendBizFlowMessage, BIZ_NATIVE_FLOW_NODES } from '../../lib/bizFlowHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const raw = (text || '').trim()

  // 1. Mode Tombol (Jika diawali dengan 'btn' atau 'button')
  // Format: .bizflow btn Teks Pesan | Tombol 1 | .cmd1 | Tombol 2 | .cmd2
  if (/^(btn|button)\b/i.test(raw)) {
    const input = raw.replace(/^(btn|button)\s*/i, '').trim()
    const parts = input.split('|').map(s => s.trim())
    const bodyText = parts[0] || 'ya kamu lah, siapa lagi wkwk'

    const buttons = []
    for (let i = 1; i < parts.length; i += 2) {
      const label = parts[i]
      const action = parts[i + 1] || label
      if (label) {
        buttons.push({
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: label,
            id: action
          })
        })
      }
    }

    // Default button jika parameter tombol kosong
    if (buttons.length === 0) {
      buttons.push(
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: '✨ Pilihan 1',
            id: `${usedPrefix}ping`
          })
        },
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: '📋 Menu',
            id: `${usedPrefix}menu`
          })
        }
      )
    }

    await sendBizFlowMessage(conn, m.chat, {
      text: bodyText,
      buttons
    })
    return
  }

  // 2. Mode Pesan Langsung / Default Sesuai Snippet
  // Jika tanpa argumen, default: "ya kamu lah, siapa lagi wkwk"
  const bodyText = raw || 'ya kamu lah, siapa lagi wkwk'

  await conn.relayMessage(
    m.chat,
    {
      interactiveMessage: {
        body: {
          text: bodyText
        },
        nativeFlowMessage: {
          messageParamsJson: '{}'
        }
      }
    },
    {
      additionalNodes: BIZ_NATIVE_FLOW_NODES
    }
  )
}

handler.help = ['bizflow [teks]', 'bizflow btn <teks>|<tombol>|<cmd>']
handler.tags = ['tools', 'info']
handler.command = /^(bizflow|bizmsg|flowmsg|relaybiz)$/i

export default handler
