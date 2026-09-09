import axios from 'axios'
import * as cheerio from 'cheerio'
import { status, toSmallNum } from '../../lib/style.js'

async function yt5sIo(url) {
    const form = new URLSearchParams()
    form.append("q", url)
    form.append("vt", "home")

    const response = await axios.post('https://yt5s.io/api/ajaxSearch', form, {
        headers: {
            "Accept": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        timeout: 15000
    })

    if (response.data?.status === "ok") {
        const $ = cheerio.load(response.data.data)

        if (/^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/.+/i.test(url)) {
            const videoQualities = []
            $('table tbody tr').each((index, element) => {
                const quality = $(element).find('.video-quality').text().trim()
                const downloadLink = $(element).find('a.download-link-fb').attr("href")
                if (quality && downloadLink) {
                    videoQualities.push({ quality, downloadLink })
                }
            })

            const hdVideo = videoQualities.find(v => v.quality.toLowerCase().includes('hd'))
            const sdVideo = videoQualities.find(v => v.quality.toLowerCase().includes('sd'))
            const videoUrl = hdVideo ? hdVideo.downloadLink : sdVideo ? sdVideo.downloadLink : null

            if (!videoUrl) throw new Error("Tidak ada link download yang tersedia.")
            return { videoUrl, platform: 'Facebook' }

        } else if (/^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel)\/.+/i.test(url)) {
            const videoUrl = $('a[title="Download Video"]').attr("href")
            if (!videoUrl) throw new Error("Tidak ada link download yang tersedia.")
            return { videoUrl, platform: 'Instagram' }

        } else {
            throw new Error("URL tidak valid. Harap masukkan URL Facebook atau Instagram.")
        }
    } else {
        throw new Error(response.data?.message || "Gagal mengambil video.")
    }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(status.warning(`Masukkan URL Facebook atau Instagram!\n> Contoh: *${usedPrefix + command} https://www.facebook.com/...*`))
    }

    await m.reply(status.wait('Sedang memproses unduhan video...'))

    try {
        const result = await yt5sIo(text)

        if (result.videoUrl) {
            const caption = `*──  ୨୧ ✧ YT5S DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴠ ɪ ᴅ ᴇ ᴏ 〕*
*┆* ⟡ ᴘʟᴀᴛꜰᴏʀᴍ : *${result.platform || 'Media'}*
*┆* ◈ ᴛɪᴘᴇ     : *Video MP4*
*╰───────────────*

> _Media berhasil diunduh_`.trim()

            await conn.sendMessage(m.chat, { video: { url: result.videoUrl }, mimetype: 'video/mp4', caption }, { quoted: m })
        } else {
            throw new Error("Gagal mendapatkan link download.")
        }
    } catch (error) {
        m.reply(status.error(`Gagal mengunduh media:\n> ${error.message || error}`))
    }
}

handler.help = ['yt5so <url>']
handler.command = ['yt5so']
handler.tags = ['downloader']
handler.limit = true

export default handler