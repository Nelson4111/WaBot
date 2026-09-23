import axios from 'axios'
import { status, toSmallNum } from '../../lib/style.js'

async function getIpLocationRyzumi(ip) {
  const { data } = await axios.get(
    `https://api.ryzumi.net/api/tool/iplocation?ip=${encodeURIComponent(ip)}`,
    {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
  )

  if (!data || !data.country_name) throw new Error('IP tidak valid atau tidak ditemukan di Ryzumi')
  return {
    ip: data.ip || ip,
    city: data.city || '-',
    region: data.region || '-',
    country: data.country_name || '-',
    timezone: data.timezone || '-',
    isp: data.org || data.asn || '-',
    currency: data.currency_name || data.currency || '-',
    latitude: data.latitude,
    longitude: data.longitude
  }
}

async function getIpLocationFallback(ip) {
  const { data } = await axios.get(`https://ipwho.is/${encodeURIComponent(ip)}`, { timeout: 10000 })
  if (!data?.success) throw new Error(data?.message || 'IP tidak ditemukan.')
  return {
    ip: data.ip,
    city: data.city || '-',
    region: data.region || '-',
    country: data.country || '-',
    timezone: data.timezone?.id || '-',
    isp: data.connection?.isp || data.connection?.org || '-',
    currency: data.currency?.code || '-',
    latitude: data.latitude,
    longitude: data.longitude
  }
}

async function getIp(ip) {
  try {
    return await getIpLocationRyzumi(ip)
  } catch (e) {
    console.warn('[IP Location Ryzumi failed]:', e.message)
    return await getIpLocationFallback(ip)
  }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const ip = text?.trim()
  if (!ip) {
    return m.reply(
      status.warning(
        `Masukkan alamat IP target!\n` +
        `> Contoh: *${usedPrefix + command} 112.90.150.204*`
      )
    )
  }

  await m.react('⏳')

  try {
    const res = await getIp(ip)

    const caption = `*──  ୨୧ ✧ IP GEOLOCATION LOOKUP ✧ ୨୧  ──*

*╭  〔 🌐 ᴅ ᴇ ᴛ ᴀ ɪ ʟ  ʟ ᴏ ᴋ ᴀ ꜱ ɪ 〕*
*┆* ⟡ ɪᴘ ᴀᴅᴅʀᴇꜱꜱ : *${res.ip}*
*┆* ◈ ᴋᴏᴛᴀ       : *${res.city}*
*┆* ✧ ᴡɪʟᴀʏᴀʜ    : *${res.region}*
*┆* ❖ ɴᴇɢᴀʀᴀ     : *${res.country}*
*┆* ⏱ ᴢᴏɴᴀ ᴡᴀᴋᴛᴜ: *${res.timezone}*
*┆* ⚙ ɪꜱᴘ / ᴏʀɢ  : *${res.isp}*
*┆* ⌬ ᴍᴀᴛᴀ ᴜᴀɴɢ  : *${res.currency}*
*╰───────────────*

> _Informasi geolokasi IP publik berhasil diambil_`.trim()

    if (res.latitude && res.longitude) {
      try {
        await conn.sendMessage(m.chat, {
          location: {
            degreesLatitude: Number(res.latitude),
            degreesLongitude: Number(res.longitude)
          }
        }, { quoted: m })
      } catch (locErr) {
        console.warn('[Location send failed]:', locErr)
      }
    }

    await m.reply(caption)
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    console.error('[IP Stalk Error]:', e)
    m.reply(status.error(`Gagal melacak IP:\n> ${e?.message || e}`))
  }
}

handler.help = ['ip <ip_address>', 'iplookup <ip_address>']
handler.tags = ['tools']
handler.command = /^(ip(location|lookup)?)$/i
handler.limit = true
handler.register = true

export default handler