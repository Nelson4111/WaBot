import axios from 'axios'
import * as cheerio from 'cheerio'
import { getMenuThumbnail, toSmallNum, status } from '../../lib/style.js'

async function pindl(url) {
    try {
        let a = await axios.get(url, {
            headers: {
                'User-Agent': "Mozilla/5.0 (Linux; Android 12; SAMSUNG SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/17.0 Chrome/96.0.4664.104 Mobile Safari/537.36",
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            },
            timeout: 15000
        })

        let $ = cheerio.load(a.data)
        let x = $('script[data-test-id="leaf-snippet"]').text()
        let y = $('script[data-test-id="video-snippet"]').text()

        let info = x ? JSON.parse(x) : {}
        let videoInfo = y ? JSON.parse(y) : null

        return {
            status: true,
            isVideo: !!(videoInfo?.contentUrl),
            info,
            image: info.image,
            video: videoInfo ? videoInfo.contentUrl : ''
        }
    } catch (e) {
        return {
            status: false,
            mess: "Gagal mengekstrak media dari tautan Pinterest."
        }
    }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(status.warning(`Kirimkan tautan Pinterest untuk mengunduh gambar atau video!\n> Contoh: *${usedPrefix + command} https://pin.it/...*`))
    }

    await m.reply(status.wait('Sedang memproses tautan Pinterest...'))

    const url = text.trim()
    const result = await pindl(url)

    if (result.status) {
        const caption = `*──  ୨୧ ✧ PINTEREST DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴍ ᴇ ᴅ ɪ ᴀ 〕*
*┆* ◈ ᴛɪᴘᴇ    : *${result.isVideo ? 'Video MP4' : 'Gambar / Foto'}*
*╰───────────────*

> _Media berhasil diunduh_`.trim()

        const footer = `${global.namebot} • Versi ${toSmallNum(global.versi || '4.0.0')}`

        if (result.isVideo && result.video) {
            await conn.sendMessage(m.chat, {
                video: { url: result.video },
                caption
            }, { quoted: m })
        } else if (result.image) {
            // Sesuai aturan: jika ada image, gunakan button (ke .menu jika tidak ada aksi lain)
            await conn.sendButtonV2(m.chat, {
                title: '⛩️ PINTEREST MEDIA',
                subtitle: 'Avelia • Media Service',
                text: caption,
                footer,
                buffer: result.image,
                buttons: [
                    ['📜 Menu Utama', `${usedPrefix}menu`]
                ]
            }, m)
        } else {
            m.reply(status.error('Media tidak ditemukan pada halaman ini.'))
        }
    } else {
        m.reply(status.error(result.mess))
    }
}

handler.help = ['pindl <url>']
handler.tags = ["downloader"]
handler.command = /^(pindl)$/i
handler.limit = true

export default handler