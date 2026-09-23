import axios from 'axios'

if (!global.ryzumiSessions) global.ryzumiSessions = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const isReset = /^(aireset|resetai)$/i.test(command)

  if (isReset) {
    const existingSession = global.ryzumiSessions[m.sender]
    if (existingSession) {
      try {
        await axios.get(`https://api.ryzumi.net/api/misc/clear-ai-session?session=${encodeURIComponent(existingSession)}`, { timeout: 10000 })
      } catch (e) {}
      delete global.ryzumiSessions[m.sender]
    }
    return m.reply(`*╭  〔 ✦ ʙ ᴇ ʀ ʜ ᴀ ꜱ ɪ ʟ 〕*\n> Memori sesi percakapan AI Anda telah berhasil direset.\n*╰───────────────*`)
  }

  if (!text) {
    return m.reply(`*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*
> Format input salah! Masukkan pertanyaan atau obrolan:
> › *${usedPrefix + command}* <pertanyaan>
>
> Contoh:
> › *${usedPrefix + command} Halo, jelaskan apa itu quantum computing!*
>
> Shortcut:
> › *${usedPrefix}aireset* (Reset memori obrolan)
*╰───────────────*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  const session = global.ryzumiSessions[m.sender] || ''
  const systemPrompt = 'Kamu adalah Avelia, asisten AI WhatsApp yang cerdas, sopan, ramah, dan membantu.'

  try {
    let url = `https://api.ryzumi.net/api/ai/text-model?text=${encodeURIComponent(text.trim())}&model=gpt-4o&prompt=${encodeURIComponent(systemPrompt)}`
    if (session) {
      url += `&session=${encodeURIComponent(session)}`
    }

    const res = await axios.get(url, {
      timeout: 45000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const data = res.data
    if (!data?.success || !data?.result) {
      throw new Error(data?.message || 'AI tidak memberikan respons.')
    }

    if (data.session) {
      global.ryzumiSessions[m.sender] = data.session
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    const header = `*──  ୨୧ ✧ ᴀᴠᴇʟɪᴀ ᴀɪ ✧ ୨୧  ──*\n\n`
    return m.reply(header + data.result)
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const msg = err.response?.data?.message || err.message
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*
> Gagal memproses obrolan AI: ${msg}
*╰───────────────*`)
  }
}

handler.help = ['ryzumiai <teks>', 'aireset']
handler.tags = ['ai']
handler.command = /^(ryzumiai|ryzumi|aireset|resetai)$/i
handler.limit = true

export default handler
