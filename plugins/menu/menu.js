import fs from 'fs'
import fetch from 'node-fetch'
import { loadDB } from '../../lib/waifuHelper.js'
import { toPTT } from '../../lib/converter.js'

import { getGreeting, getMenuThumbnail } from '../../lib/style.js'

const toSmallNum = (str) => {
    const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
    return String(str).replace(/[0-9]/g, d => map[d] || d)
}

const formatUptime = (sec) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0')
    const mi = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
    const s = Math.floor(sec % 60).toString().padStart(2, '0')
    return `${h}:${mi}:${s}`
}

const formatDuration = (ms) => {
    let seconds = Math.floor(ms / 1000)
    let minutes = Math.floor(seconds / 60)
    let hours = Math.floor(minutes / 60)
    let days = Math.floor(hours / 24)

    if (days > 0) return `${days} Hari`
    if (hours > 0) return `${hours} Jam`
    return `${minutes} Menit`
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  let name = m.pushName || await conn.getName(m.sender)
  
  let wib = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
  let d = new Date(wib)
  let locale = 'id-ID'
  let tanggal = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  let hari = d.toLocaleDateString(locale, { weekday: 'long' })
  let jam = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false })

  const hour = d.getHours()
  let greetingWaktu = 'ꜱᴇʟᴀᴍᴀᴛ ᴍᴀʟᴀᴍ'
  if (hour >= 4 && hour < 11) greetingWaktu = 'ꜱᴇʟᴀᴍᴀᴛ ᴘᴀɢɪ'
  else if (hour >= 11 && hour < 15) greetingWaktu = 'ꜱᴇʟᴀᴍᴀᴛ ꜱɪᴀɴɢ'
  else if (hour >= 15 && hour < 18) greetingWaktu = 'ꜱᴇʟᴀᴍᴀᴛ ꜱᴏʀᴇ'

  let users = global.db.data.users || {}
  let user = users[m.sender] || {}
  const wdb = loadDB()
  const uang = wdb.money?.[m.sender] || 0
  let { limit = 0, role = 'User', premiumTime = 0, pasangan = [] } = user
  let prems = premiumTime > 0 ? 'ᴘʀᴇᴍɪᴜᴍ Ⓟ' : 'ꜰʀᴇᴇ Ⓛ'

  let partnerDisplay = '― (Single)'
  if (pasangan && pasangan.length > 0) {
      if (pasangan.length === 1) {
          let dur = formatDuration(Date.now() - pasangan[0].nikahTime)
          partnerDisplay = `@${pasangan[0].jid.split('@')[0]} (${toSmallNum(dur)})`
      } else {
          partnerDisplay = '\n' + pasangan.map((p, i) => {
              let dur = formatDuration(Date.now() - p.nikahTime)
              return `*┆*     ${toSmallNum(i + 1)}. @${p.jid.split('@')[0]} (${toSmallNum(dur)})`
          }).join('\n')
      }
  }

  // Ambil Top 3 Donatur secara dinamis
  let topDonors = Object.entries(users)
      .filter(([_, data]) => data.totalDonasi > 0)
      .sort((a, b) => b[1].totalDonasi - a[1].totalDonasi)
      .slice(0, 3)

  let donorText = ''
  let donorMentions = []
  if (topDonors.length > 0) {
      donorText = topDonors.map(([jid, data], i) => {
          donorMentions.push(jid)
          return `*┆* ⟡ *${toSmallNum(i + 1)}.* @${jid.split('@')[0]} : *Rp ${toSmallNum(data.totalDonasi.toLocaleString('id-ID'))}*`
      }).join('\n')
  } else {
      donorText = `*┆* ⟡ *Ketik ${_p}donasi untuk mendukung bot!*`
  }

  let videoMenu = 'https://c.termai.cc/v174/zFX'
  try {
    if (fs.existsSync('./media/menu.json')) {
      const listMenu = JSON.parse(fs.readFileSync('./media/menu.json'))
      if (Array.isArray(listMenu) && listMenu.length > 0) {
        videoMenu = listMenu[Math.floor(Math.random() * listMenu.length)]
      }
    }
  } catch (e) {
    videoMenu = 'https://c.termai.cc/v174/zFX'
  }

  let audioMenu = 'https://c.termai.cc/a100/hMW4'
  try {
    if (fs.existsSync('./media/music.json')) {
      const listMusic = JSON.parse(fs.readFileSync('./media/music.json'))
      if (Array.isArray(listMusic) && listMusic.length > 0) {
        audioMenu = listMusic[Math.floor(Math.random() * listMusic.length)]
      }
    }
  } catch {
    audioMenu = 'https://c.termai.cc/a100/hMW4'
  }

  let greeting = getGreeting(name, d.getHours())

  let header = `*──  ୨୧ ✧ ${global.namebot.toUpperCase()} ✧ ୨୧  ──*

> *こんにちわ!* (ʜᴇʟʟᴏ!)
> ${greetingWaktu} *${name}* ♡
> ${greeting}`

  let userCard = `*╭  〔 𝜚 ᴜ ꜱ ᴇ ʀ 〕*
*┆* ⟡ ɴᴀᴍᴀ     : *${name}*
*┆* ✧ ʀᴏʟᴇ     : *${role} ㋡*
*┆* ✦ ꜱᴛᴀᴛᴜꜱ   : *${prems}*
*┆* ⌬ ʟɪᴍɪᴛ    : *${toSmallNum(limit)}*
*┆* ❖ ꜱᴀʟᴅᴏ    : *Rp ${toSmallNum(uang.toLocaleString('id-ID'))}*
*┆* ᰔ ᴘᴀꜱᴀɴɢᴀɴ : *${partnerDisplay}*
*╰───────────────*`

  let topDonorsCard = `*╭  〔 ❖ ᴛ ᴏ ᴘ  ᴅ ᴏ ɴ ᴀ ᴛ ᴜ ʀ 〕*
${donorText}
*╰───────────────*`

  let botCard = `*╭  〔 ⚙ ꜱ ʏ ꜱ ᴛ ᴇ ᴍ 〕*
*┆* ⟡ ʙᴏᴛ         : *${global.namebot}*
*┆* ◈ ᴠᴇʀꜱɪ       : *v${toSmallNum(global.versi || '4.0.0')}*
*┆* ✧ ᴄʀᴇᴀᴛᴏʀ     : *${global.author || 'Nenel'}*
*┆* ⧗ ᴜᴘᴛɪᴍᴇ      : *${toSmallNum(formatUptime(process.uptime()))}*
*┆* 𖦹 ᴍᴏᴅᴇ        : *Public*
*┆* ✦ ᴛᴏᴛᴀʟ ꜰɪᴛᴜʀ : *${toSmallNum(Object.keys(global.plugins || {}).length || 750)}+*
*╰───────────────*`

  let aboutCard = `*╭  〔 ⏱ ᴡ ᴀ ᴋ ᴛ ᴜ 〕*
*┆* ⟡ ʜᴀʀɪ    : *${hari}*
*┆* ◈ ᴛᴀɴɢɢᴀʟ : *${toSmallNum(tanggal)}*
*┆* ✧ ᴊᴀᴍ     : *${toSmallNum(jam)} ᴡɪʙ*
*╰───────────────*`

  let notesBlock = `> Ⓟ = ᴘʀᴇᴍɪᴜᴍ   •   Ⓛ = ʟɪᴍɪᴛ
> ｡˚ ⊹ *ᴛᴀᴘ ᴛᴏᴍʙᴏʟ ᴅɪ ʙᴀᴡᴀʜ ᴜɴᴛᴜᴋ ᴘɪʟɪʜ ᴋᴀᴛᴇɢᴏʀɪ* ⊹ ˚ ｡`

  let caption = [header, userCard, topDonorsCard,botCard, aboutCard, notesBlock].join('\n\n')
  let footer = `${global.namebot} • Versi ${toSmallNum(global.versi || '4.0.0')}`

  let listButton = {
    name: 'single_select',
    buttonParamsJson: JSON.stringify({
      title: '✦ PILIH KATEGORI',
      sections: [
        {
          title: '✦ DAFTAR KATEGORI MENU',
          highlight_label: 'Populer',
          rows: [
            { header: 'Utama', title: 'Semua Perintah', description: 'Tampilkan seluruh menu bot', id: `${_p}allmenu` },
            { header: 'AI', title: 'AI & ChatBot', description: 'Fitur ChatGPT, Claude, AI Edit, dll', id: `${_p}menuai` },
            { header: 'Anime', title: 'Anime & Wibu', description: 'Fitur Anime, Waifu, Gambar Anime', id: `${_p}menuanime` },
            { header: 'Audio', title: 'Audio & Soundboard', description: '20+ efek suara, VN, sound meme, toaudio', id: `${_p}menuaudio` },
            { header: 'RPG', title: 'Chainsaw Man RPG', description: 'Game RPG Chainsaw Man', id: `${_p}menucsm` },
            { header: 'Downloader', title: 'Pengunduh Media', description: 'Download TikTok, IG, YT, dll', id: `${_p}menudownload` },
            { header: 'Hiburan', title: 'Fitur Hiburan', description: 'Fitur seru-seruan & jokes', id: `${_p}menufun` },
            { header: 'Games', title: 'Mini Games', description: 'Game tebak-tebakan, catur, dll', id: `${_p}menugame` },
            { header: 'Arcade', title: 'In-Bubble Arcade Games', description: 'Game HTML5: GD, Block Blast, Tetris, Mabar', id: `${_p}menuarcade` },
            { header: 'Grup', title: 'Manajemen Grup', description: 'Admin tools & pengaturan grup', id: `${_p}menugroup` },
            { header: 'Informasi', title: 'Informasi Bot', description: 'Info status sistem & bot', id: `${_p}menuinfo` },
            { header: 'Internet', title: 'Pencarian Web', description: 'Google, Wikipedia, Cuaca, dll', id: `${_p}menuinternet` },
            { header: 'Maker', title: 'Pembuat Gambar', description: 'Canvas maker, logo, quotes', id: `${_p}menumaker` },
            { header: 'Keuangan', title: 'Catatan Keuangan', description: 'Money track & scanner struk', id: `${_p}menumoneytrack` },
            { header: 'Owner', title: 'Khusus Owner', description: 'Perintah kendali owner', id: `${_p}menuowner` },
            { header: 'Hubungan', title: 'Fitur Hubungan', description: 'Pernikahan, pasangan, dll', id: `${_p}menupasangan` },
            { header: 'Quotes', title: 'Quotes & Kata Bijak', description: 'Anime, motivasi, bucin, senja, dll', id: `${_p}menuquotes` },
            { header: 'Random', title: 'Random & Media', description: 'Foto cecan, wallpaper, media acak', id: `${_p}menurandom` },
            { header: 'RPG', title: 'Roleplay Game', description: 'Game RPG petualangan klasik', id: `${_p}menurpg` },
            { header: 'Pencarian', title: 'Pencarian Data', description: 'Search data & scraper', id: `${_p}menusearch` },
            { header: 'Stalker', title: 'Stalker Sosmed', description: 'Stalk akun Instagram, TikTok, dll', id: `${_p}menustalker` },
            { header: 'Stiker', title: 'Pembuat Stiker', description: 'Buat stiker foto, teks, video', id: `${_p}menusticker` },
            { header: 'Alat', title: 'Alat & Utilitas', description: 'Tools pembantu sehari-hari', id: `${_p}menutools` },
            { header: 'Apresiasi', title: 'Thanks To & Donatur', description: 'Kontributor & daftar donatur bot', id: `${_p}thanksto` }
          ]
        }
      ]
    })
  }

  let mentions = [m.sender, ...donorMentions]
  if (pasangan && pasangan.length > 0) {
      pasangan.forEach(p => mentions.push(p.jid))
  }

  let contextInfo = {
    mentionedJid: mentions,
    forwardingScore: 1,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterName: `「 ${global.namebot} 」`,
      newsletterJid: global.ch
    }
  }

  const menuThumb = await getMenuThumbnail()

  try {
    let sent = false
    if (typeof conn.ButtonV2 === 'function') {
      try {
        const btn = new conn.ButtonV2(conn)
        btn.setTitle(`✦ ${global.namebot.toUpperCase()}`)
        btn.setSubtitle('ᴡʜᴀᴛꜱᴀᴘᴘ ᴍᴜʟᴛɪ-ᴅᴇᴠɪᴄᴇ ᴀꜱꜱɪꜱᴛᴀɴᴛ')
        btn.setBody(caption)
        btn.setFooter(footer)
        if (menuThumb) btn.setRawThumbnail(menuThumb)

        // 1. Tombol List Kategori Dropdown
        btn.addRawButton({
          buttonId: 'menu_select',
          buttonText: { displayText: '✦ PILIH KATEGORI' },
          type: 1,
          nativeFlowInfo: {
            name: 'single_select',
            paramsJson: listButton.buttonParamsJson
          }
        })

        // 2. Tombol Quick Reply Owner & Donasi
        btn.addButton('❖ Info Owner', `${_p}owner`)
        btn.addButton('⟡ Donasi', `${_p}donasi`)

        if (contextInfo) {
          btn.setContextInfo(contextInfo)
        }

        await btn.send(m.chat)
        sent = true
      } catch (errBtnV2) {
        console.error('[ButtonV2 menu.js error]:', errBtnV2?.message || errBtnV2)
        sent = false
      }
    }

    if (!sent) {
      if (menuThumb) {
        await conn.sendMessage(m.chat, {
          image: menuThumb,
          caption,
          footer,
          mentions,
          contextInfo
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          text: caption,
          footer,
          mentions,
          contextInfo
        }, { quoted: m })
      }
    }

    // Send Background Voice Note
    if (audioMenu) {
      try {
        const res = await fetch(audioMenu)
        const contentType = res.headers.get('content-type') || ''
        if (res.ok && !contentType.includes('text/html')) {
          const rawBuffer = Buffer.from(await res.arrayBuffer())
          if (rawBuffer && rawBuffer.length > 2000) {
            await conn.sendFile(m.chat, rawBuffer, 'menu.opus', '', m, 1, { mimetype: 'audio/mp4', ptt: true })
          }
        }
      } catch (errAudio) {
        console.error('Failed to send menu VN:', errAudio?.message || errAudio)
      }
    }
  } catch (e) {
    conn.reply(m.chat, caption, m, { mentions })
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = /^(menu|help|\?)$/i
handler.limit = false

export default handler
