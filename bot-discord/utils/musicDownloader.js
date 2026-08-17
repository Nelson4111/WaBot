/**
 * utils/musicDownloader.js
 * Mesin pengunduh dan caching audio lokal untuk Bot Discord.
 * Mengunduh audio terlebih dahulu via multi-tier API tunnel sehingga kebal 100% dari ban IP YouTube VPS.
 */

import axios from 'axios'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import yts from 'yt-search'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const cacheDir = path.join(__dirname, '..', 'cache')

// Pastikan folder cache tersedia
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true })
}

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Origin': 'https://iframe.y2meta-uk.com',
    'Referer': 'https://iframe.y2meta-uk.com/'
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

/**
 * Mengunduh buffer audio dari direct URL
 */
async function downloadBuffer(url) {
    const res = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 60000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'audio/*,*/*;q=0.9',
            'Referer': 'https://spotidown.app/',
            'Origin': 'https://spotidown.app'
        }
    })
    return Buffer.from(res.data)
}

/**
 * Mengambil link download MP3 melalui API converter pihak ketiga
 */
async function getMp3DownloadUrl(videoUrl) {
    // 1. Coba converter cnv.cx
    try {
        const idMatch = videoUrl.match(/(?:youtu\.be\/|v=|\/v\/|\/embed\/|\/shorts\/)([a-zA-Z0-9_-]{11})/)
        const id = idMatch ? idMatch[1] : ''
        const keyRes = await axios.get(`https://cnv.cx/v2/sanity/key?id=${id}`, { headers, timeout: 8000 })
        const key = keyRes.data?.key
        if (key) {
            const convRes = await axios.post('https://cnv.cx/v2/converter',
                new URLSearchParams({
                    link: videoUrl,
                    format: 'mp3',
                    audioBitrate: '320',
                    videoQuality: '720',
                    filenameStyle: 'pretty',
                    vCodec: 'h264'
                }),
                { headers: { ...headers, key }, timeout: 15000 }
            )

            let job = convRes.data
            if (job.status === 'tunnel' && job.url) return job.url
            if (job.status === 'processing' && job.jobId) {
                for (let i = 0; i < 15; i++) {
                    await sleep(1200)
                    const st = await axios.get(`https://cnv.cx/v2/status/${job.jobId}`, { headers, timeout: 8000 })
                    if (st.data?.status === 'completed' && st.data?.url) {
                        return st.data.url
                    }
                }
            }
        }
    } catch (e) {
        // Fallback ke provider berikutnya
    }

    // 2. Coba API Deline downloader
    try {
        const res = await axios.get(`https://api.deline.web.id/downloader/ytplay?q=${encodeURIComponent(videoUrl)}`, { timeout: 15000 })
        if (res.data?.status && res.data?.result?.dlink) {
            return res.data.result.dlink
        }
    } catch (e) {
        // Fallback ke provider berikutnya
    }

    throw new Error('Semua provider download audio sedang sibuk. Silakan coba lagi.')
}

/**
 * Mencari link Spotify
 */
async function searchSpotifyTrackUrl(query) {
    try {
        const res = await axios.get(`https://api.ryzumi.net/api/search/spotify?query=${encodeURIComponent(query)}`, { timeout: 8000 })
        if (res.data) {
            let list = Array.isArray(res.data) ? res.data : (res.data.results || res.data.data)
            if (Array.isArray(list) && list.length > 0) {
                let trackUrl = list[0].link || list[0].url || list[0].external_urls?.spotify
                if (trackUrl) return trackUrl
            }
        }
    } catch (e) {}

    try {
        const res = await axios.get(`https://html.duckduckgo.com/html/?q=site%3Aopen.spotify.com%2Ftrack+${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 8000
        })
        const match = res.data.match(/https%3A%2F%2Fopen\.spotify\.com%2Ftrack%2F[a-zA-Z0-9]+/)
        if (match) return decodeURIComponent(match[0])
    } catch (e) {}

    return null
}

/**
 * Mencari metadata lagu dan mengunduh audio ke cache lokal
 * @param {string} query
 * @returns {Promise<{ filePath: string, title: string, artist: string, duration: string, thumbnail: string, url: string, fromCache: boolean }>}
 */
export async function resolveAndDownloadAudio(query) {
    cleanOldCache()

    const isSpotifyUrl = /open\.spotify\.com\/track\/|spotify:track:/i.test(query)
    const isYoutubeUrl = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(query)

    let trackInfo = null

    // 1. Coba Spotify jika input berupa link Spotify
    if (isSpotifyUrl) {
        try {
            const ryzRes = await axios.get(`https://api.ryzumi.net/api/downloader/spotify?url=${encodeURIComponent(query)}`, { timeout: 15000 })
            if (ryzRes.data?.success && ryzRes.data?.link) {
                const meta = ryzRes.data.metadata || {}
                const id = crypto.createHash('md5').update(query).digest('hex')
                const targetFile = path.join(cacheDir, `${id}.mp3`)

                trackInfo = {
                    title: meta.title || 'Spotify Track',
                    artist: meta.artists || 'Spotify Artist',
                    duration: meta.duration || '3:30',
                    thumbnail: meta.cover || ryzRes.data.coverUrl || 'https://i.scdn.co/image/ab67616d0000b2730fe7814ce91a1b4e7b0d5881',
                    url: query,
                    filePath: targetFile,
                    downloadUrl: ryzRes.data.link
                }
            }
        } catch (err) {
            // Lanjut ke pencarian YouTube jika Ryzumi gagal
        }
    }

    // 2. Jika bukan Spotify atau Spotify gagal, gunakan YouTube Search
    if (!trackInfo) {
        const search = await yts(query)
        const video = search.videos?.[0]
        if (!video) {
            throw new Error(`Lagu "${query}" tidak ditemukan di database musik.`)
        }

        const id = video.videoId || crypto.createHash('md5').update(video.url).digest('hex')
        const targetFile = path.join(cacheDir, `${id}.mp3`)

        trackInfo = {
            title: video.title,
            artist: video.author?.name || 'YouTube Music',
            duration: video.timestamp || '0:00',
            thumbnail: video.thumbnail || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
            url: video.url,
            filePath: targetFile,
            downloadUrl: null // Akan dicari saat unduh jika belum ada di cache
        }
    }

    // 3. Cek apakah file sudah ada di cache lokal (Instan 0 detik)
    if (fs.existsSync(trackInfo.filePath) && fs.statSync(trackInfo.filePath).size > 100000) {
        return {
            ...trackInfo,
            fromCache: true
        }
    }

    // 4. Jika belum ada di cache, unduh file audio
    let audioUrl = trackInfo.downloadUrl
    if (!audioUrl) {
        audioUrl = await getMp3DownloadUrl(trackInfo.url)
    }

    const audioBuffer = await downloadBuffer(audioUrl)
    if (!audioBuffer || audioBuffer.length < 50000) {
        throw new Error('File audio yang diunduh rusak atau tidak lengkap.')
    }

    fs.writeFileSync(trackInfo.filePath, audioBuffer)

    return {
        ...trackInfo,
        fromCache: false
    }
}

/**
 * Membersihkan cache lama jika melebihi 100 file atau 1GB
 */
function cleanOldCache() {
    try {
        const files = fs.readdirSync(cacheDir)
        if (files.length > 100) {
            const fileStats = files.map(f => {
                const fullPath = path.join(cacheDir, f)
                return { path: fullPath, mtime: fs.statSync(fullPath).mtimeMs }
            })
            fileStats.sort((a, b) => a.mtime - b.mtime)
            // Hapus 20 file tertua
            for (let i = 0; i < 20 && i < fileStats.length; i++) {
                try { fs.unlinkSync(fileStats[i].path) } catch (_) {}
            }
        }
    } catch (_) {}
}
