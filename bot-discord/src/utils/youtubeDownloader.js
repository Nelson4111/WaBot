const axios = require('axios');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CACHE_DIR = path.join(os.tmpdir(), 'bot_music_cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

let serverPort = 0;
let serverInstance = null;

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'Content-Type': 'application/x-www-form-urlencoded',
  'Origin': 'https://iframe.y2meta-uk.com',
  'Referer': 'https://iframe.y2meta-uk.com/'
};

/**
 * Memulai internal HTTP server untuk menyajikan audio lokal ke Lavalink
 */
function initServer() {
  if (serverInstance) return Promise.resolve(serverPort);

  return new Promise((resolve) => {
    serverInstance = http.createServer((req, res) => {
      const urlPath = req.url || '';
      if (!urlPath.startsWith('/audio/')) {
        res.writeHead(404);
        return res.end('Not found');
      }

      const fileId = urlPath.replace('/audio/', '').replace(/[^a-zA-Z0-9_-]/g, '');
      const filePath = path.join(CACHE_DIR, `${fileId}.mp3`);

      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        return res.end('Audio file expired or not found');
      }

      const stat = fs.statSync(filePath);
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'audio/mpeg'
        });
        file.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': stat.size,
          'Content-Type': 'audio/mpeg',
          'Accept-Ranges': 'bytes'
        });
        fs.createReadStream(filePath).pipe(res);
      }
    });

    serverInstance.listen(0, '127.0.0.1', () => {
      serverPort = serverInstance.address().port;
      resolve(serverPort);
    });
  });
}

/**
 * Ekstraksi link download MP3 dari converter multi-tier
 */
async function extractMp3Url(videoInput) {
  let id = '';
  let queryTitle = '';
  const idMatch = videoInput.match(/(?:youtu\.be\/|v=|\/v\/|\/embed\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (idMatch) {
    id = idMatch[1];
  } else {
    // 1. Coba Ryzumi Search API
    try {
      const ryz = await axios.get(`https://api.ryzumi.net/api/search/yt?query=${encodeURIComponent(videoInput)}`, {
        headers: { 'accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
        timeout: 5000
      });
      if (ryz.data?.videos?.length > 0) {
        id = ryz.data.videos[0].id;
        queryTitle = ryz.data.videos[0].title;
      }
    } catch (_) {}

    // 2. Fallback ke yt-search lokal
    if (!id) {
      try {
        const yts = require('yt-search');
        const searchRes = await yts(videoInput);
        if (searchRes?.videos?.length > 0) {
          id = searchRes.videos[0].videoId;
          queryTitle = searchRes.videos[0].title;
        }
      } catch (_) {}
    }
  }

  if (!id) throw new Error('Invalid YouTube video ID or search query');
  const videoUrl = `https://www.youtube.com/watch?v=${id}`;

  // 1. Coba Ryzumi ytmp3 Downloader API (v1 & v2)
  try {
    const ryzRes = await axios.get(`https://api.ryzumi.net/api/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`, {
      headers: { 'accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      timeout: 8000
    });
    if (ryzRes.data?.url) {
      return {
        url: ryzRes.data.url,
        title: ryzRes.data.title || queryTitle || 'YouTube Audio',
        videoId: id
      };
    }
  } catch (_) {}

  // 2. Coba cnv.cx API dengan arsitektur ytv.js
  try {
    const cnvHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0',
      'Origin': 'https://frame.y2meta-uk.com',
      'Accept': '*/*'
    };
    const keyRes = await axios.get(`https://cnv.cx/v2/sanity/key?id=${id}`, { headers: cnvHeaders, timeout: 8000 });
    const key = keyRes.data?.key;
    if (key) {
      const convRes = await axios.post('https://cnv.cx/v2/converter',
        new URLSearchParams({
          link: `https://www.youtube.com/watch?v=${id}`,
          format: 'mp3',
          audioBitrate: '128',
          videoQuality: '720',
          filenameStyle: 'pretty',
          vCodec: 'h264'
        }),
        { headers: { ...cnvHeaders, key }, timeout: 10000 }
      );

      const job = convRes.data;
      if (job?.status === 'tunnel' && job.url) {
        return { url: job.url, title: job.filename || queryTitle, videoId: id };
      }
    }
  } catch (_) {}

  // 2. Coba Deline API
  try {
    const fallbackRes = await axios.get(`https://api.deline.web.id/downloader/ytplay?q=${encodeURIComponent(videoUrl)}`, { timeout: 8000 });
    if (fallbackRes.data?.status && fallbackRes.data?.result?.dlink) {
      return {
        url: fallbackRes.data.result.dlink,
        title: fallbackRes.data.result.title || queryTitle || 'YouTube Audio',
        videoId: id
      };
    }
  } catch (_) {}

  throw new Error('All MP3 extraction converters failed');
}

/**
 * Mengunduh audio YouTube dan menyajikannya via internal HTTP stream
 */
async function getDownloadedAudioTrack(videoUrl) {
  const port = await initServer();
  const mp3Info = await extractMp3Url(videoUrl);
  const filePath = path.join(CACHE_DIR, `${mp3Info.videoId}.mp3`);

  // Jika sudah ada di cache lokal dan ukuran > 0, gunakan langsung
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size < 10000) {
    const writer = fs.createWriteStream(filePath);
    const downloadRes = await axios.get(mp3Info.url, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0',
        'Referer': 'https://v6.www-y2mate.com/',
        'Range': 'bytes=0-',
        'Accept': '*/*'
      },
      timeout: 20000
    });

    await new Promise((resolve, reject) => {
      downloadRes.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  // Cleanup file cache lama (>30 menit)
  cleanOldCache();

  return {
    streamUrl: `http://127.0.0.1:${port}/audio/${mp3Info.videoId}`,
    title: mp3Info.title || 'YouTube Track',
    videoId: mp3Info.videoId
  };
}

function cleanOldCache() {
  try {
    const now = Date.now();
    const files = fs.readdirSync(CACHE_DIR);
    for (const file of files) {
      const p = path.join(CACHE_DIR, file);
      const stat = fs.statSync(p);
      if (now - stat.mtimeMs > 30 * 60 * 1000) {
        fs.unlinkSync(p);
      }
    }
  } catch (_) {}
}

module.exports = {
  extractMp3Url,
  getDownloadedAudioTrack,
  initServer
};
