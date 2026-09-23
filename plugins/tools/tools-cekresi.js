import axios from 'axios'
import * as cheerio from 'cheerio'
import FormData from 'form-data'
import CryptoJS from 'crypto-js'
import { status, toSmallNum } from '../../lib/style.js'

// ─── Ryzumi Primary ──────────────────────────────────────────────────────────
async function cekresiRyzumi(resi) {
  const { data } = await axios.get(
    `https://api.ryzumi.net/api/tool/cek-resi?resi=${encodeURIComponent(resi)}`,
    {
      timeout: 20000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
  )

  if (!data?.success || !data?.result) {
    throw new Error(data?.message || 'Nomor resi tidak ditemukan di Ryzumi')
  }

  const r = data.result
  return {
    resi: r.noResi || resi,
    ekspedisi: r.expedisi || 'Ekspedisi',
    status: r.status || '-',
    pengirim: r.pengirim || '-',
    tujuan: r.tujuan || '-',
    tanggalKirim: r.tanggalKirim || '-',
    lastPosition: r.posisiTerakhir || '-',
    history: (r.riwayat || []).map(h => ({
      tanggal: h.tanggal || '',
      keterangan: h.keterangan || ''
    }))
  }
}

// ─── Fallback Scraper ───────────────────────────────────────────────────────
function createTimers(resi) {
  try {
    const keyHex = '79540e250fdb16afac03e19c46dbdeb3'
    const ivHex = 'eb2bb9425e81ffa942522e4414e95bd0'
    const key = CryptoJS.enc.Hex.parse(keyHex)
    const iv = CryptoJS.enc.Hex.parse(ivHex)
    const encrypted = CryptoJS.AES.encrypt(resi, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    return encrypted.toString()
  } catch (e) {
    return null
  }
}

async function cekresiFallback(noresi, ekspedisi = 'shopee-express') {
  const _ekspedisi = {
    'shopee-express': 'SPX',
    'ninja': 'NINJA',
    'lion-parcel': 'LIONPARCEL',
    'pos-indonesia': 'POS',
    'tiki': 'TIKI',
    'jne': 'JNE',
    'jnt': 'JNT',
    'sicepat': 'SICEPAT'
  }

  const form = new FormData()
  form.append('e', _ekspedisi[ekspedisi] || 'SPX')
  form.append('noresi', noresi.toUpperCase().replace(/\s/g, ''))
  form.append('timers', createTimers(noresi))

  const { data } = await axios.post(
    `https://apa2.cekresi.com/cekresi/resi/initialize.php?ui=e0ad7e971ce77822056ba7a155f85c11&p=1`,
    form,
    {
      headers: {
        ...form.getHeaders(),
        'user-agent': 'Mozilla/5.0'
      },
      timeout: 15000
    }
  )

  const $res = cheerio.load(data)
  return {
    resi: noresi,
    ekspedisi: $res('#nama_expedisi').text().trim() || ekspedisi,
    status: $res('table.table-striped tbody tr:contains("Status") td:last-child').text().trim() || '-',
    pengirim: '-',
    tujuan: '-',
    tanggalKirim: '-',
    lastPosition: $res('#last_position').text().trim() || '-',
    history: []
  }
}

async function cekresi(noresi, ekspedisi) {
  try {
    return await cekresiRyzumi(noresi)
  } catch (e) {
    console.warn('[CekResi Ryzumi failed]:', e.message)
    return await cekresiFallback(noresi, ekspedisi)
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      status.warning(
        `Masukkan nomor resi paket!\n` +
        `> Contoh: *${usedPrefix + command} SPXID054330680586*\n` +
        `> Contoh dengan kurir: *${usedPrefix + command} SPXID054330680586|shopee-express*`
      )
    )
  }

  const [resi, ekspedisi] = text.split('|').map(v => v.trim())
  await m.react('⏳')

  try {
    const data = await cekresi(resi, ekspedisi)

    let caption = `*──  ୨୧ ✧ STATUS PENGIRIMAN PAKET ✧ ୨୧  ──*

*╭  〔 📦 ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ʀ ᴇ ꜱ ɪ 〕*
*┆* ⟡ ɴᴏ. ʀᴇꜱɪ  : *${data.resi}*
*┆* ◈ ᴇᴋꜱᴘᴇᴅɪꜱɪ : *${data.ekspedisi}*
*┆* ✧ ꜱᴛᴀᴛᴜꜱ    : *${data.status}*
${data.pengirim !== '-' ? `*┆* 👤 ᴘᴇɴɢɪʀɪᴍ : *${data.pengirim}*\n` : ''}${data.tujuan !== '-' ? `*┆* 📍 ᴛᴜᴊᴜᴀɴ   : *${data.tujuan}*\n` : ''}${data.tanggalKirim !== '-' ? `*┆* ⏱ ᴛɢʟ ᴋɪʀɪᴍ : *${toSmallNum(data.tanggalKirim)}*\n` : ''}*╰───────────────*

${data.lastPosition !== '-' ? `*╭  〔 📍 ᴘ ᴏ ꜱ ɪ ꜱ ɪ  ᴛ ᴇ ʀ ᴀ ᴋ ʜ ɪ ʀ 〕*\n> ${data.lastPosition}\n*╰───────────────*\n\n` : ''}`

    if (data.history && data.history.length > 0) {
      caption += `*╭  〔 📜 ʀ ɪ ᴡ ᴀ ʏ ᴀ ᴛ  ᴛ ᴇ ʀ ᴀ ᴋ ʜ ɪ ʀ 〕*\n`
      const list = data.history.slice(-4).reverse()
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        caption += `> ⟡ *${item.tanggal || '-'}*\n> ${item.keterangan || '-'}\n`
      }
      caption += `*╰───────────────*\n\n`
    }

    caption += `> _Data pelacakan paket berhasil diperbarui_`

    await m.reply(caption.trim())
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    console.error('[CekResi Error]:', e)
    m.reply(status.error(`Gagal melacak nomor resi:\n> ${e?.message || e}`))
  }
}

handler.help = ['cekresi <noresi>']
handler.tags = ['tools']
handler.command = /^cekresi$/i
handler.limit = true

export default handler