const MAX_MENU_MESSAGE_BYTES = 60000

export async function replyIfMenuDisabled(conn, m) {
  if (!m.isGroup || global.db?.data?.chats?.[m.chat]?.menu !== false) return false

  await conn.reply(m.chat, '⚠️ Admin telah mematikan menu di grup ini.', m)
  return true
}

export function splitMenuText(text) {
  const chunks = []
  let chunk = ''
  let chunkBytes = 0

  const append = part => {
    const partBytes = Buffer.byteLength(part, 'utf8')
    if (chunkBytes + partBytes <= MAX_MENU_MESSAGE_BYTES) {
      chunk += part
      chunkBytes += partBytes
      return
    }

    if (chunk) {
      chunks.push(chunk)
      chunk = ''
      chunkBytes = 0
    }

    if (partBytes <= MAX_MENU_MESSAGE_BYTES) {
      chunk = part
      chunkBytes = partBytes
      return
    }

    for (const character of part) {
      const characterBytes = Buffer.byteLength(character, 'utf8')
      if (chunkBytes + characterBytes > MAX_MENU_MESSAGE_BYTES) {
        chunks.push(chunk)
        chunk = ''
        chunkBytes = 0
      }
      chunk += character
      chunkBytes += characterBytes
    }
  }

  const lines = String(text ?? '').split('\n')
  lines.forEach((line, index) => append(line + (index < lines.length - 1 ? '\n' : '')))
  if (chunk || chunks.length === 0) chunks.push(chunk)
  return chunks
}

export async function sendMenuText(conn, chat, text, { quoted, contextInfo, mentions } = {}) {
  const chunks = splitMenuText(text)
  for (let index = 0; index < chunks.length; index++) {
    const message = { text: chunks[index] }
    if (index === 0) {
      if (contextInfo) message.contextInfo = contextInfo
      if (mentions) message.mentions = mentions
    }

    const options = index === 0 && quoted ? { quoted } : {}
    await conn.sendMessage(chat, message, options)
  }
}
