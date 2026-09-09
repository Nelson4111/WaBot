import axios from "axios"
import { status, toSmallNum } from '../../lib/style.js'

async function redNote(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            },
            timeout: 15000
        })

        const extractMeta = (pattern) => (data.match(pattern) || [])[1]?.trim() || ""

        const noteId = extractMeta(/<meta\s+name="og:url"\s+content="(.*?)"/i).split('/').pop()
        const nickname = extractMeta(/<meta\s+name="og:title"\s+content="(.*?)"/i).split(" - ")[0]
        const title = extractMeta(/<title>(.*?)<\/title>/i)
        const description = extractMeta(/<meta\s+name="description"\s+content="(.*?)"/i)
        const duration = extractMeta(/<meta\s+name="og:videotime"\s+content="(.*?)"/i)
        const videoUrl = extractMeta(/<meta\s+name="og:video"\s+content="(.*?)"/i)
        const likes = extractMeta(/<meta\s+name="og:xhs:note_like"\s+content="(.*?)"/i)

        const images = [...data.matchAll(/<meta\s+name="og:image"\s+content="(.*?)"/gi)].map((match) => match[1]?.trim()).filter(Boolean)

        return {
            metadata: {
                noteId,
                nickname,
                title,
                description,
                duration,
                likes,
            },
            media: {
                videoUrl,
                images,
            },
        }
    } catch (err) {
        console.error("Failed to fetch Xiaohongshu data:", err.message)
        return null
    }
}

let handler = async (m, { text, conn, usedPrefix, command }) => {
    if (!text) {
        return m.reply(status.warning(`Masukkan URL Xiaohongshu yang valid!\n> Contoh: *${usedPrefix + command} https://xhslink.com/...*`))
    }

    await m.reply(status.wait('Sedang memproses tautan Xiaohongshu...'))

    const result = await redNote(text)
    if (!result) return m.reply(status.error('Gagal mengambil data! Pastikan tautan Xiaohongshu valid dan publik.'))

    let { media, metadata } = result

    const caption = `*──  ୨୧ ✧ XIAOHONGSHU DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴍ ᴇ ᴅ ɪ ᴀ 〕*
*┆* ⟡ ᴊᴜᴅᴜʟ   : *${metadata.title || '-'}*
*┆* ✧ ᴀᴜᴛʜᴏʀ  : *${metadata.nickname || '-'}*
*┆* ᰔ ʟɪᴋᴇ    : *${toSmallNum(metadata.likes || '-')}*
*╰───────────────*

> _Media berhasil diunduh_`.trim()

    if (media.videoUrl) {
        await conn.sendMessage(m.chat, {
            video: { url: media.videoUrl },
            caption
        }, { quoted: m })
    } else if (media.images.length > 0) {
        const footer = `${global.namebot} • Versi ${toSmallNum(global.versi || '4.0.0')}`
        for (let i = 0; i < media.images.length; i++) {
            const slideCap = `*──  ୨୧ ✧ XIAOHONGSHU SLIDE ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ɢ ᴀ ᴍ ʙ ᴀ ʀ 〕*
*┆* ⟡ ꜱʟɪᴅᴇ : *${toSmallNum(i + 1)} / ${toSmallNum(media.images.length)}*
*╰───────────────*`.trim()
            await conn.sendButtonV2(m.chat, {
                title: '⛩️ XIAOHONGSHU SLIDE',
                subtitle: `Slide ${toSmallNum(i + 1)} / ${toSmallNum(media.images.length)}`,
                text: slideCap,
                footer,
                buffer: media.images[i],
                buttons: [
                    ['📜 Menu Utama', `${usedPrefix}menu`]
                ]
            }, m)
        }
    } else {
        m.reply(status.error('Tidak ada media yang ditemukan pada catatan ini.'))
    }
}

handler.help = ['xhs <url>']
handler.tags = ['downloader']
handler.command = ['xhs']
handler.limit = true

export default handler