import fs from 'fs'
import { getMenuThumbnail } from '../../lib/style.js'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str).replace(/[0-9]/g, d => map[d] || d)
}

let handler = async (m, { conn, usedPrefix: _p, command }) => {
  try {
    const userName = m.pushName || await conn.getName(m.sender) || 'User'
    let d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
    const hour = d.getHours()
    let greetingWaktu = 'ꜱᴇʟᴀᴍᴀᴛ ᴍᴀʟᴀᴍ'
    if (hour >= 4 && hour < 11) greetingWaktu = 'ꜱᴇʟᴀᴍᴀᴛ ᴘᴀɢɪ'
    else if (hour >= 11 && hour < 15) greetingWaktu = 'ꜱᴇʟᴀᴍᴀᴛ ꜱɪᴀɴɢ'
    else if (hour >= 15 && hour < 18) greetingWaktu = 'ꜱᴇʟᴀᴍᴀᴛ ꜱᴏʀᴇ'

    let videoMenu = null
    try {
      const listMenu = JSON.parse(fs.readFileSync('./media/menu.json'))
      if (Array.isArray(listMenu) && listMenu.length > 0) {
        videoMenu = listMenu[Math.floor(Math.random() * listMenu.length)]
      }
    } catch { videoMenu = null }

    const categories = [
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

    const bodyText = `*──  ୨୧ ✧ ${global.namebot.toUpperCase()} ✧ ୨୧  ──*

> *こんにちわ!* (ʜᴇʟʟᴏ!)
> ${greetingWaktu} *${userName}* ♡
> Silakan pilih kategori menu di bawah ini.
> Tersedia *${toSmallNum(categories.length)} Kategori* fitur bot siap pakai.

> ｡˚ ⊹ *ᴛᴀᴘ ᴛᴏᴍʙᴏʟ ᴅɪ ʙᴀᴡᴀʜ ᴜɴᴛᴜᴋ ᴘɪʟɪʜ ᴋᴀᴛᴇɢᴏʀɪ* ⊹ ˚ ｡`

    const footer = `${global.namebot} • Versi ${toSmallNum(global.versi || '4.0.0')}`

    let listButton = {
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
        title: '✦ PILIH KATEGORI',
        sections: [
          {
            title: '✦ DAFTAR KATEGORI MENU',
            highlight_label: 'Populer',
            rows: categories
          }
        ]
      })
    }

    let contextInfo = {
      forwardingScore: 999,
      isForwarded: true,
      mentionedJid: [m.sender],
      forwardedNewsletterMessageInfo: {
        newsletterName: `「 ${global.namebot} 」`,
        newsletterJid: global.ch
      }
    }

    const menuThumb = await getMenuThumbnail()

    let sent = false
    if (typeof conn.ButtonV2 === 'function') {
      try {
        const btn = new conn.ButtonV2(conn)
        btn.setTitle(`✦ ${global.namebot.toUpperCase()}`)
        btn.setSubtitle('ꜱʏꜱᴛᴇᴍ ᴋᴀᴛᴇɢᴏʀɪ ᴍᴇɴᴜ')
        btn.setBody(bodyText)
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
        console.error('[ButtonV2 menu-select.js error]:', errBtnV2?.message || errBtnV2)
        sent = false
      }
    }

    if (!sent) {
      let listText = categories.map(c => `*┆* ⟡ *${c.title}* › \`${c.id}\`\n*┆*   _${c.description}_`).join('\n')
      let cardText = `*╭  〔 ✦ ᴅ ᴀ ꜰ ᴛ ᴀ ʀ  ᴋ ᴀ ᴛ ᴇ ɢ ᴏ ʀ ɪ 〕*\n${listText}\n*╰───────────────*`
      let fallbackCaption = `${bodyText}\n\n${cardText}`

      if (menuThumb) {
        await conn.sendMessage(m.chat, {
          image: menuThumb,
          caption: fallbackCaption,
          footer,
          contextInfo
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          text: fallbackCaption,
          footer,
          contextInfo
        }, { quoted: m })
      }
    }
  } catch (err) {
    console.error('[MENU-SELECT ERROR]:', err)
    return m.reply(`*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*\n> Terjadi kesalahan saat memuat menu: ${err.message}\n*╰───────────────*`)
  }
}

handler.help = ['menu_select', 'menulist', 'listmenu']
handler.tags = ['main']
handler.command = /^(menu_select|menulist|listmenu)$/i

export default handler
