import { xpRange } from '../../lib/levelling.js'
import fs from 'fs'
import fetch from 'node-fetch'
import { loadDB } from '../../lib/waifuHelper.js'
import { toPTT } from '../../lib/converter.js'
import { getGreeting, getMenuThumbnail } from '../../lib/style.js'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str).replace(/[0-9]/g, d => map[d] || d)
}

const defaultMenu = {
  before: `
*──  ୨୧ ✧ ALL COMMAND MENU ✧ ୨୧  ──*

> *こんにちわ!* (ʜᴇʟʟᴏ!)
> %greetingWaktu *%name* ♡
> %greeting

*╭  〔 𝜚 ᴜ ꜱ ᴇ ʀ 〕*
*┆* ⟡ ɴᴀᴍᴀ     : *%name*
*┆* ✧ ʀᴏʟᴇ     : *%role ㋡*
*┆* ✦ ꜱᴛᴀᴛᴜꜱ   : *%prems*
*┆* ⌬ ʟɪᴍɪᴛ    : *%limit*
*┆* ❖ ꜱᴀʟᴅᴏ    : *Rp %uang*
*╰───────────────*

*╭  〔 ⚙ ꜱ ʏ ꜱ ᴛ ᴇ ᴍ 〕*
*┆* ⟡ ʙᴏᴛ         : *${global.namebot}*
*┆* ◈ ᴠᴇʀꜱɪ       : *v%versi*
*┆* ✧ ᴄʀᴇᴀᴛᴏʀ     : *${global.author || 'Nenel'}*
*┆* ⧗ ᴜᴘᴛɪᴍᴇ      : *%uptime*
*┆* 𖦹 ᴍᴏᴅᴇ        : *Public*
*┆* ✦ ᴛᴏᴛᴀʟ ꜰɪᴛᴜʀ : *%totalFitur+*
*╰───────────────*

*╭  〔 ⏱ ᴡ ᴀ ᴋ ᴛ ᴜ 〕*
*┆* ⟡ ʜᴀʀɪ    : *%hari*
*┆* ◈ ᴛᴀɴɢɢᴀʟ : *%tanggal*
*┆* ✧ ᴊᴀᴍ     : *%jam ᴡɪʙ*
*╰───────────────*
%readmore
`.trim(),
  header: `*╭  〔 ✦ %category 〕*`,
  body: `*┆* ⟡ %cmd %isPremium %islimit`,
  footer: `*╰───────────────*\n`,
  after: `> Ⓟ = ᴘʀᴇᴍɪᴜᴍ   •   Ⓛ = ʟɪᴍɪᴛ\n> ｡˚ ⊹ *ᴛᴀᴘ ᴛᴏᴍʙᴏʟ ᴅɪ ʙᴀᴡᴀʜ ᴜɴᴛᴜᴋ ᴋᴇᴍʙᴀʟɪ* ⊹ ˚ ｡\n> _Terima kasih sudah menggunakan ${global.namebot}_`,
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  if (m.isGroup && !global.db.data.chats[m.chat].menu)
    throw '⚠️ Admin telah mematikan menu'

  // Waktu & Tanggal (WIB)
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

  let videoMenu = null
  try {
    const listMenu = JSON.parse(fs.readFileSync('./media/menu.json'))
    videoMenu = listMenu[Math.floor(Math.random() * listMenu.length)]
  } catch { videoMenu = null }

  let audioMenu = null
  try {
    const listMusic = JSON.parse(fs.readFileSync('./media/music.json'))
    audioMenu = listMusic[Math.floor(Math.random() * listMusic.length)]
  } catch { audioMenu = null }

  try {
    const lprem = 'Ⓟ'
    const llim = 'Ⓛ'
    const uptime = clockString(process.uptime() * 1000)

    let user = global.db.data.users[m.sender] || {}
    const wdb = loadDB()
    const uang = wdb.money?.[m.sender] || 0

    let { limit = 0, role: dbRole = 'User', name: dbName, registered = false, premiumTime = 0 } = user
    let name = registered ? dbName || m.pushName || await conn.getName(m.sender) : m.pushName || await conn.getName(m.sender)
    user.name = name

    let prems = premiumTime > 0 ? 'ᴘʀᴇᴍɪᴜᴍ Ⓟ' : 'ꜰʀᴇᴇ Ⓛ'
    const owners = global.owner.map(v => v[0] + '@s.whatsapp.net')
    let role = owners.includes(m.sender) ? 'Owner' : dbRole
    let greeting = getGreeting(name, d.getHours())
    let totalFitur = Object.keys(global.plugins || {}).length || 750

    let help = Object.values(global.plugins)
      .filter(p => !p.disabled)
      .map(p => ({
        help: Array.isArray(p.help) ? p.help : [p.help],
        tags: Array.isArray(p.tags) ? p.tags : [p.tags],
        prefix: 'customPrefix' in p,
        limit: p.limit,
        premium: p.premium,
      }))

    let tags = {
      main: 'MAIN MENU',
      info: 'INFO MENU',
      waifu: 'PASANGAN & WAIFU',
      rpg: 'RPG GAME',
      csm: 'CSM RPG (CHAINSAW MAN)',
      moneytrack: 'MONEYTRACK',
      ai: 'AI & CHATBOT',
      downloader: 'DOWNLOADER',
      internet: 'INTERNET & SEARCH',
      memfess: 'MENFESS',
      maker: 'IMAGE MAKER',
      anime: 'ANIME & MANGA',
      sticker: 'STICKER TOOLS',
      tools: 'UTILITY TOOLS',
      group: 'GROUP MANAGEMENT',
      fun: 'FUN & GAMES',
      search: 'DATABASE SEARCH',
      stalk: 'STALKER MENU',
      game: 'MINI GAMES',
      arcade: 'IN-BUBBLE ARCADE',
      owner: 'OWNER ONLY',
      audio: 'AUDIO MANIPULATION'
    }

    let sortedTags = Object.keys(tags).sort((a, b) => {
      if (a === 'main') return -1
      if (b === 'main') return 1
      if (a === 'info') return -1
      if (b === 'info') return 1
      return tags[a].localeCompare(tags[b])
    })

    let _text = [
      defaultMenu.before,
      ...sortedTags.map(tag => {
        let list = help
          .filter(menu => menu.tags.includes(tag))
          .flatMap(menu => 
            menu.help.map(cmd => ({
              cmd: menu.prefix ? cmd : _p + cmd,
              limit: menu.limit,
              premium: menu.premium
            }))
          )
          .sort((a, b) => a.cmd.localeCompare(b.cmd))
          .map(menu => 
            defaultMenu.body
              .replace('%cmd', menu.cmd)
              .replace('%islimit', menu.limit ? llim : '')
              .replace('%isPremium', menu.premium ? lprem : '')
          ).join('\n')

        return list ? `${defaultMenu.header.replace('%category', tags[tag])}\n${list}\n${defaultMenu.footer.trim()}` : ''
      }).filter(Boolean),
      defaultMenu.after
    ].join('\n\n')

    let replace = { 
      uptime: toSmallNum(uptime),
      _p,
      name,
      prems,
      greeting,
      greetingWaktu,
      versi: toSmallNum(global.versi || '4.0.0'),
      totalFitur: toSmallNum(totalFitur),
      uang: toSmallNum(uang.toLocaleString('id-ID')), 
      limit: toSmallNum(limit),
      role, 
      tanggal: toSmallNum(tanggal),
      hari,
      jam: toSmallNum(jam),
      readmore: readMore,
      sender: m.sender.split('@')[0]
    }
    
    let text = _text.replace(new RegExp(`%(${Object.keys(replace).join('|')})`, 'g'), (_, key) => replace[key])
    let footer = `${global.namebot} • Versi ${toSmallNum(global.versi || '4.0.0')}`

    let contextInfo = {
      forwardingScore: 999,
      isForwarded: true,
      mentionedJid: [m.sender],
      forwardedNewsletterMessageInfo: {
        newsletterName: `「 ${global.namebot} 」`,
        newsletterJid: global.ch
      }
    }

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
              { header: 'Audio', title: 'Manipulasi Audio', description: 'Sound effect, convert audio, TTS', id: `${_p}menuaudio` },
              { header: 'RPG', title: 'Chainsaw Man RPG', description: 'Game RPG Chainsaw Man', id: `${_p}menucsm` },
              { header: 'Downloader', title: 'Pengunduh Media', description: 'Download TikTok, IG, YT, dll', id: `${_p}menudownload` },
              { header: 'Hiburan', title: 'Fitur Hiburan', description: 'Fitur seru-seruan & jokes', id: `${_p}menufun` },
              { header: 'Games', title: 'Mini Games', description: 'Game tebak-tebakan, catur, dll', id: `${_p}menugame` },
              { header: 'Arcade', title: 'In-Bubble Arcade', description: 'Game HTML5, GD, Block Blast, Tetris', id: `${_p}menuarcade` },
              { header: 'Grup', title: 'Manajemen Grup', description: 'Admin tools & pengaturan grup', id: `${_p}menugroup` },
              { header: 'Informasi', title: 'Informasi Bot', description: 'Info status sistem & bot', id: `${_p}menuinfo` },
              { header: 'Internet', title: 'Pencarian Web', description: 'Google, Wikipedia, Cuaca, dll', id: `${_p}menuinternet` },
              { header: 'Maker', title: 'Pembuat Gambar', description: 'Canvas maker, logo, quotes', id: `${_p}menumaker` },
              { header: 'Keuangan', title: 'Catatan Keuangan', description: 'Money track & scanner struk', id: `${_p}menumoneytrack` },
              { header: 'Owner', title: 'Khusus Owner', description: 'Perintah kendali owner', id: `${_p}menuowner` },
              { header: 'Hubungan', title: 'Fitur Hubungan', description: 'Pernikahan, pasangan, dll', id: `${_p}menupasangan` },
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

    const menuThumb = await getMenuThumbnail()

    let sent = false
    if (typeof conn.ButtonV2 === 'function') {
      try {
        const btn = new conn.ButtonV2(conn)
        btn.setTitle(`✦ ${global.namebot.toUpperCase()}`)
        btn.setSubtitle('ꜱᴇᴍᴜᴀ ᴘᴇʀɪɴᴛᴀʜ ʙᴏᴛ')
        btn.setBody(text.trim())
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
        console.error('[ButtonV2 allmenu.js error]:', errBtnV2?.message || errBtnV2)
        sent = false
      }
    }

    if (!sent) {
      try {
        if (menuThumb) {
          await conn.sendMessage(m.chat, {
            image: menuThumb,
            caption: text.trim(),
            footer,
            contextInfo
          }, { quoted: m })
        } else {
          await conn.sendMessage(m.chat, {
            text: text.trim(),
            footer,
            contextInfo
          }, { quoted: m })
        }
      } catch (e) {
        await conn.sendMessage(m.chat, { text: text.trim(), contextInfo }, { quoted: m })
      }
    }

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
        console.error('Failed to send allmenu VN:', errAudio?.message || errAudio)
      }
    }
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '⚠️ Menu sedang error', m)
  }
}

handler.help = ['allmenu']
handler.tags = ['main']
handler.command = /^(allmenu)$/i

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return `${h}j ${m}m ${s}s`
}
