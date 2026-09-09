import axios from 'axios'
import * as cheerio from 'cheerio'
import { status, toSmallNum } from '../../lib/style.js'

async function scrapeCapCut(url) {
    if (!url) throw new Error('URL tidak boleh kosong.')
    
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        },
        timeout: 15000
    })
    const $ = cheerio.load(response.data)
    
    return {
        videoUrl: $("video").attr("src") || null
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(status.warning(`Masukkan tautan template CapCut!\n> Contoh: *${usedPrefix + command} https://www.capcut.com/templates/...*`))
    }
    
    await m.reply(status.wait('Sedang memproses tautan CapCut...'))

    try {
        const result = await scrapeCapCut(text)
        if (!result.videoUrl) throw new Error('Video template CapCut tidak ditemukan.')
        
        const caption = `*──  ୨୧ ✧ CAPCUT DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴠ ɪ ᴅ ᴇ ᴏ 〕*
*┆* ◈ ᴛɪᴘᴇ  : *Video MP4 (CapCut)*
*╰───────────────*

> _Template video berhasil diunduh_`.trim()

        await conn.sendMessage(m.chat, { 
            video: { url: result.videoUrl },
            caption
        }, { quoted: m })

    } catch (error) {
        m.reply(status.error(`Terjadi kesalahan saat mengunduh template CapCut:\n> ${error?.message || error}`))
    }
}

handler.help = ['capcut <url>']
handler.tags = ['downloader']
handler.command = /^(capcut)$/i
handler.limit = true

export default handler