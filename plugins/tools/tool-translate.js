import axios from 'axios'
import { status } from '../../lib/style.js'

async function translateRyzumi(text, targetLang = 'id', sourceLang = 'auto') {
  const { data } = await axios.get(
    `https://api.ryzumi.net/api/tool/translate?text=${encodeURIComponent(text)}&to=${encodeURIComponent(targetLang)}&from=${encodeURIComponent(sourceLang)}`,
    {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
  )

  if (data?.ok && data.result?.translated) {
    return {
      translated: data.result.translated,
      detected: data.result.detected || sourceLang
    }
  }
  throw new Error('Ryzumi translate gagal')
}

async function translateGoogleFallback(query, targetLang = 'id') {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&dt=t&tl=${targetLang}&q=${encodeURIComponent(query)}`
  const { data } = await axios.get(url, { timeout: 10000 })
  if (data && data[0]) {
    return {
      translated: data[0].map(item => item[0].trim()).join('\n'),
      detected: data[2] || 'auto'
    }
  }
  throw new Error('Google translate fallback gagal')
}

async function doTranslate(text, targetLang) {
  try {
    return await translateRyzumi(text, targetLang)
  } catch (e) {
    console.warn('[Translate Ryzumi failed]:', e.message)
    return await translateGoogleFallback(text, targetLang)
  }
}

let handler = async (m, { args, usedPrefix, command }) => {
  let lang = 'id'
  let text = ''

  if (args.length >= 2) {
    lang = args[0].toLowerCase()
    text = args.slice(1).join(' ')
  } else if (m.quoted && m.quoted.text) {
    lang = args[0] ? args[0].toLowerCase() : 'id'
    text = m.quoted.text
  } else {
    return m.reply(
      status.warning(
        `Masukkan bahasa tujuan dan teks yang ingin diterjemahkan!\n` +
        `> Contoh: *${usedPrefix + command} en Selamat pagi kawan*\n` +
        `> Contoh reply pesan: *${usedPrefix + command} ja* (sambil reply teks)`
      )
    )
  }

  await m.react('⏳')

  try {
    const res = await doTranslate(text.trim(), lang)

    const caption = `*──  ୨୧ ✧ GOOGLE TRANSLATE ✧ ୨୧  ──*

*╭  〔 🌐 ᴛ ᴇ ʀ ᴊ ᴇ ᴍ ᴀ ʜ ᴀ ɴ 〕*
*┆* ⟡ ᴅᴀʀɪ   : *${res.detected.toUpperCase()}*
*┆* ◈ ᴋᴇ     : *${lang.toUpperCase()}*
*╰───────────────*

*╭  〔 📝 ʜ ᴀ ꜱ ɪ ʟ 〕*
> ${res.translated}
*╰───────────────*

> _Terjemahan selesai diproses_`.trim()

    await m.reply(caption)
    await m.react('✅')
  } catch (e) {
    console.error('[Translate Error]:', e)
    await m.react('❌')
    m.reply(status.error(`Gagal menerjemahkan teks:\n> ${e?.message || e}`))
  }
}

handler.help = ['translate <kode_bahasa> <teks>', 'tr <kode_bahasa> <teks>']
handler.tags = ['tools']
handler.command = /^(tran(slate)?|tr)$/i
handler.limit = true

export default handler