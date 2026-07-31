import axios from 'axios'

let handler = async (m, { text, usedPrefix, command }) => {
    let query = (text || '').toString().trim()
    if (!query) return m.reply(`Masukkan pertanyaanmu!\n\nContoh: *${usedPrefix + command}* apa itu nodejs?`)

    try {
        let res = await axios.get(`https://api.zenzxz.my.id/ai/chatgpt?q=${encodeURIComponent(query)}`)
        if (!res.data.status) return m.reply('❌ Terjadi kesalahan pada API.')

        let result = res.data.result
        await m.reply(result.trim())

    } catch (e) {
        m.reply('❌ Server sedang bermasalah.')
    }
}

handler.help = ['chatgpt']
handler.tags = ['ai']
handler.command = ['chatgpt']

export default handler
