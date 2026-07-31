import fs from 'fs'

let handler = m => m

handler.before = async function (m, { conn }) {
  if (!m.isGroup || !m.text) return false
  
  // Ambil prefix yang cocok
  const prefixMatch = getPrefixMatch(m.text, conn.prefix ? conn.prefix : global.prefix)
  if (!prefixMatch) return false
  
  // Parse command
  const noPrefix = m.text.replace(prefixMatch, '').trim()
  const [cmd] = noPrefix.split(/\s+/).filter(Boolean)
  if (!cmd) return false
  
  const cleanCmd = cmd.toLowerCase()
  
  // Pastikan database list untuk chat ini ada
  const chat = global.db.data.chats[m.chat]
  if (!chat || !chat.list || !chat.list[cleanCmd]) return false
  
  const entry = chat.list[cleanCmd]
  
  // Tandai sebagai command agar tidak memicu suggestions/error logs
  m.plugin = 'group-list-handler'
  m.isCommand = true
  
  // Kirim response sesuai tipe
  if (entry.type === 'text') {
    await conn.reply(m.chat, entry.text, m)
  } else if (entry.type === 'media') {
    if (fs.existsSync(entry.filePath)) {
      await conn.sendFile(m.chat, entry.filePath, entry.filename || 'file', entry.caption || '', m, entry.ptt || false)
    } else {
      await conn.reply(m.chat, `⚠️ File media untuk command *${prefixMatch + cleanCmd}* tidak ditemukan di server.`, m)
    }
  }
  
  return true
}

function getPrefixMatch(text, prefix) {
  if (typeof text !== 'string') return null
  const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
  let matches = (prefix instanceof RegExp ? [[prefix.exec(text), prefix]] :
      Array.isArray(prefix) ? prefix.map(p => {
          let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
          return [re.exec(text), re]
      }) :
      typeof prefix === 'string' ? [[new RegExp(str2Regex(prefix)).exec(text), new RegExp(str2Regex(prefix))]] :
      [[[], new RegExp]]
  ).find(p => p[0])
  return (matches?.[0] || '')[0] || null
}

export default handler;
