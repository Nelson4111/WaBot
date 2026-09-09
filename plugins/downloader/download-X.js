import axios from "axios"
import * as cheerio from "cheerio"
import { status, toSmallNum } from '../../lib/style.js'

export async function twitter(url) {
    if (!/(twitter\.com|x\.com)\/.*?\/status/gi.test(url)) {
        throw new Error("URL tidak valid! Pastikan menggunakan link Twitter / X status yang benar.")
    }

    const base_url = "https://x2twitter.com"
    const base_headers = {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9,id;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "x-requested-with": "XMLHttpRequest",
        Referer: "https://x2twitter.com/en"
    }

    const tokenRes = await axios.post(
        `${base_url}/api/userverify`,
        new URLSearchParams({ url }).toString(),
        { headers: base_headers, timeout: 15000 }
    ).catch(() => { throw new Error("Gagal verifikasi token X2Twitter.") })

    const token = tokenRes.data?.token
    if (!token) throw new Error("Token verifikasi X2Twitter kosong.")

    const r = await axios.post(
        `${base_url}/api/ajaxSearch`,
        new URLSearchParams({ q: url, lang: "id", cftoken: token }).toString(),
        { headers: base_headers, timeout: 15000 }
    ).then(v => v.data).catch(() => { throw new Error("Gagal mengambil data dari server X2Twitter.") })

    if (r.status !== "ok" || !r.data) {
        throw new Error(r.msg || "Media tidak ditemukan pada postingan X / Twitter ini.")
    }

    const $ = cheerio.load(r.data)
    let type = $("div").eq(0).attr("class") || ""

    type = type.includes("tw-video") ? "video"
        : type.includes("video-data") && $(".photo-list").length ? "image"
        : "hybrid"

    let d = { type, download: [] }
    if (type === "video") {
        d.download = $(".dl-action p").map((i, el) => {
            let name = $(el).text().trim()
            let fileType = name.includes("MP4") ? "mp4" : null
            let reso = fileType === "mp4" ? name.split(" ").pop().replace(/[()]/g, "") : null

            return {
                type: fileType,
                reso,
                url: $(el).find("a").attr("href")
            }
        }).get().filter(v => v.url)
    } else if (type === "image") {
        d.download = $("ul.download-box li").map((i, el) => ({
            type: "image",
            url: $(el).find("a").attr("href")
        })).get().filter(v => v.url)
    }

    return d
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(status.warning(`Masukkan URL X / Twitter yang valid!\n> Contoh: *${usedPrefix + command} https://x.com/.../status/...*`))
    }

    await m.reply(status.wait('Sedang memproses unduhan dari X / Twitter...'))

    try {
        let result = await twitter(text)

        if (result.type === "video" && result.download.length > 0) {
            let selectedVideo = result.download.find(v => v.type === "mp4" && (v.reso === "1024p" || v.reso === "720p")) || result.download[0]
            if (!selectedVideo?.url) throw new Error("URL video tidak ditemukan.")

            const caption = `*──  ୨୧ ✧ X (TWITTER) DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ᴠ ɪ ᴅ ᴇ ᴏ 〕*
*┆* ◈ ᴋᴜᴀʟɪᴛᴀꜱ : *${selectedVideo.reso ? toSmallNum(selectedVideo.reso) : 'HD'}*
*┆* ⟡ ꜰᴏʀᴍᴀᴛ   : *Video MP4*
*╰───────────────*

> _Media berhasil diunduh_`.trim()

            await conn.sendMessage(m.chat, { video: { url: selectedVideo.url }, caption }, { quoted: m })
        } else if (result.type === "image" && result.download.length > 0) {
            const footer = `${global.namebot} • Versi ${toSmallNum(global.versi || '4.0.0')}`
            for (let i = 0; i < result.download.length; i++) {
                const img = result.download[i]
                const caption = `*──  ୨୧ ✧ X (TWITTER) DOWNLOADER ✧ ୨୧  ──*

*╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ɢ ᴀ ᴍ ʙ ᴀ ʀ 〕*
*┆* ⟡ ꜱʟɪᴅᴇ   : *${toSmallNum(i + 1)} / ${toSmallNum(result.download.length)}*
*╰───────────────*`.trim()
                await conn.sendButtonV2(m.chat, {
                    title: '⛩️ X (TWITTER) DOWNLOADER',
                    subtitle: `Slide ${toSmallNum(i + 1)} / ${toSmallNum(result.download.length)}`,
                    text: caption,
                    footer,
                    buffer: img.url,
                    buttons: [
                        ['📜 Menu Utama', `${usedPrefix}menu`]
                    ]
                }, m)
            }
        } else {
            throw new Error("Tidak ada media yang dapat diunduh pada tautan ini.")
        }
    } catch (e) {
        m.reply(status.error(`Gagal memproses media Twitter / X.\n> ${e?.message || e}`))
    }
}

handler.help = ['twitter <url>', 'x <url>']
handler.tags = ['downloader']
handler.command = ['twitter', 'x']
handler.limit = true

export default handler