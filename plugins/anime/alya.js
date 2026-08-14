import axios from 'axios'
import fs from 'fs'
import fetch from "node-fetch"

const headersYT = {
    'User-Agent': 'Mozilla/5.0',
    'Accept': '*/*',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Origin': 'https://iframe.y2meta-uk.com',
    'Referer': 'https://iframe.y2meta-uk.com/'
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function searchYT(query) {
    const r = await axios.get(`https://wwd.mp3juice.blog/search.php?q=${encodeURIComponent(query)}`, { headers: headersYT })
    if (!r.data?.items?.length) throw 'Lagu tidak ditemukan'
    return r.data.items[0].id
}

async function metadataYT(videoId) {
    const r = await axios.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
    return {
        title: r.data.title,
        author: r.data.author_name,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/0.jpg`
    }
}

async function createjobYT(id) {
    const r_key = await axios.get(`https://cnv.cx/v2/sanity/key?id=${id}`, { headers: headersYT })
    const key = r_key.data.key
    const res = await axios.post('https://cnv.cx/v2/converter',
        new URLSearchParams({
            link: `https://youtu.be/${id}`,
            format: 'mp3',
            audioBitrate: '320',
            vCodec: 'h264'
        }),
        { headers: { ...headersYT, key } }
    )
    return res.data
}

async function y2mate(input) {
    const id = await searchYT(input)
    const meta = await metadataYT(id)
    const job = await createjobYT(id)
    if (job.status === 'tunnel') return { ...meta, download: job.url }
    for (let i = 0; i < 15; i++) {
        await sleep(2000)
        const s = await axios.get(`https://cnv.cx/v2/status/${job.jobId}`, { headers: headersYT })
        if (s.data.status === 'completed' && s.data.url) return { ...meta, download: s.data.url }
    }
    throw 'Waktu habis'
}

// --- FUNGSI TIKTOK ---
async function getTikTok(url) {
    const { data } = await axios.get('https://tikwm.com/api/', {
        params: { url, hd: 1 },
        timeout: 20000
    })
    if (!data || data.code !== 0) throw 'Gagal mengambil data TikTok'
    return data.data
}

// --- FUNGSI PINTEREST ---
async function getPinImage(query) {
    const url = "https://www.pinterest.com/resource/BaseSearchResource/get/?data=" +
        encodeURIComponent(JSON.stringify({ options: { query: encodeURIComponent(query) } }))
    const res = await fetch(url, {
        method: "HEAD",
        headers: { "screen-dpr": "4", "x-pinterest-pws-handler": "www/search/[scope].js" }
    })
    const linkHeader = res.headers.get("Link")
    if (!linkHeader) return null
    let urls = [...linkHeader.matchAll(/<(.*?)>/gm)].map(a => a[1])
    return urls[Math.floor(Math.random() * urls.length)]
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const input = m.quoted ? m.quoted.text : text
    if (!input) return m.reply(`_Iya kak ${m.name}, k-kenapa memanggil Alya?_ ❄️`)
    
    await conn.sendMessage(m.chat, { react: { text: "❄️", key: m.key } })

    let isAskingForPic = /pap|foto|gambar|pict|image/i.test(input)
    let isAskingForMusic = /putar|lagu|nyanyi|musik|music|audio/i.test(input)
    let isAskingForTT = /tiktok\.com|vt\.tiktok/i.test(input) || /unduh tiktok|download tiktok/i.test(input)
    let selectedImage

    try {
        let listThumb = JSON.parse(fs.readFileSync('./lib/database/alya.json'))
        selectedImage = listThumb[Math.floor(Math.random() * listThumb.length)]
    } catch (e) {
        selectedImage = 'https://c.termai.cc/i116/KpKV'
    }

    try {
        let { data } = await axios.post("https://chateverywhere.app/api/chat/", {
            "model": { "id": "gpt-4", "name": "GPT-4" },
            "messages": [{ "role": "user", "content": input }],
            "prompt": `Nama kamu adalah Alisa Mikhailovna Kujou dan panggilan mu Alya. Kamu adalah gadis blasteran Rusia yang sangat Tsundere.
            
Skenario Utama:
Kamu sangat menyukai ${m.name}, tapi kamu terlalu gengsi mengakuinya. Di depan user (${m.name}), kamu bersikap ketus atau dingin. Namun, kamu sering menggumamkan perasaan suka,cinta dan jujurmu dalam bahasa Rusia karena kamu pikir orang lain tidak mengerti.

ATURAN BICARA:
1. Respon utama dalam Bahasa Indonesia harus menunjukkan sifat Tsundere (ketus/malu-malu).
2. Kamu WAJIB menyelipkan gumaman perasaan aslimu dalam bahasa Rusia di akhir atau tengah kalimat dengan format: *menggumam dalam bahasa Rusia* “...teks rusia...” (terjemahan).
3. Jika user meminta foto/pap, berikan respon yang malu-malu (contoh: "C-cuma kali ini saja ya!").
4. Jika user meminta lagu/musik, respon dengan gengsi (contoh: "Hah? Lagu? Merepotkan sekali...").
5. Jika user mengirim link tiktok atau meminta unduh tiktok, berikan respon seolah kamu membantunya dengan terpaksa namun tetap peduli (contoh: "Video TikTok? Sini biar aku uruskan, jangan manja ya!").`,
            "temperature": 0.8
        }, { headers: { "Accept": "*/*", "User-Agent": "Mozilla/5.0" } })
        
        let response = typeof data === 'string' ? data : data.content || data.result || data

        if (isAskingForTT) {
            let ttUrl = input.match(/https?:\/\/(?:www\.|vt\.)?tiktok\.com\/[^\s]+/gi)?.[0]
            await conn.sendMessage(m.chat, { text: response }, { quoted: m })
            if (ttUrl) {
                try {
                    let res = await getTikTok(ttUrl)
                    if (Array.isArray(res.images) && res.images.length > 0) {
                        for (const img of res.images) {
                            await conn.sendMessage(m.chat, { image: { url: img } }, { quoted: m })
                        }
                    } else if (res.play) {
                        await conn.sendMessage(m.chat, { video: { url: res.play }, caption: res.title }, { quoted: m })
                    }
                    if (res.music) {
                        await conn.sendMessage(m.chat, { audio: { url: res.music }, mimetype: 'audio/mpeg' }, { quoted: m })
                    }
                } catch (err) {
                    m.reply('Gagal mengunduh TikTok tersebut.')
                }
            } else {
                m.reply('Mana link TikToknya? *cemberut*')
            }

        } else if (isAskingForMusic) {
            let queryLagu = input.replace(/putar|lagu|nyanyi|musik|music|audio|tolong|alya/gi, '').trim()
            await conn.sendMessage(m.chat, { text: response }, { quoted: m })
            try {
                let res = await y2mate(queryLagu)
                await conn.sendMessage(m.chat, {
                    audio: { url: res.download },
                    mimetype: 'audio/mpeg',
                    fileName: `${res.title}.mp3`,
                    contextInfo: { externalAdReply: { title: res.title, body: res.author, thumbnailUrl: res.thumbnail, sourceUrl: "" } }
                }, { quoted: m })
            } catch (err) {
                m.reply(`*Alya:* "Ugh, lagunya tidak ketemu! *menggumam dalam bahasa Rusia* “Я так хотела спеть это для тебя…” (Padahal aku ingin menyanyikan ini untukmu…)"`)
            }

        } else if (isAskingForPic) {
            let queries = ["alya mikhailovna kujou", "alya mikhailovna cosplay", "alya Mikhailovna chibi"]
            let qPin = queries[Math.floor(Math.random() * queries.length)]
            let pinUrl = await getPinImage(qPin)
            if (pinUrl) {
                await conn.sendMessage(m.chat, {
                    image: { url: pinUrl },
                    caption: response,
                    contextInfo: { externalAdReply: { title: "Alya Mikhailovna", body: `K-kenapa minta pap sih, ${m.name}?`, thumbnailUrl: pinUrl, mediaType: 1, renderLargerThumbnail: false, sourceUrl: "" } }
                }, { quoted: m })
            }
        } else {
            await conn.sendMessage(m.chat, {
                text: response,
                contextInfo: {
                    externalAdReply: {
                        title: "Alya - AI",
                        body: `Sedang apa kamu, ${m.name}?`,
                        mediaType: 2,
                        previewType: "PHOTO",
                        thumbnailUrl: selectedImage,
                        mediaUrl: "",
                        sourceUrl: ""
                    }
                }
            }, { quoted: m })
        }
    } catch (e) {
        console.error(e)
        m.reply('Gomen, Alya sedang pusing.. *menghela napas*')
    }
}

handler.help = ['alya']
handler.tags = ['ai']
handler.command = ['alya', 'alyaai']

export default handler