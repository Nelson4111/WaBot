import { xpRange } from '../../lib/levelling.js'
import fs from 'fs'
import fetch from 'node-fetch'
import { loadDB } from '../../lib/waifuHelper.js'
import { toPTT } from '../../lib/converter.js'

import { getGreeting } from '../../lib/style.js'

const defaultMenu = {
  before: `
⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆
   〔 ✦ *ALL COMMAND MENU* 〕
> %greeting
⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆

┌──〔 ✦ *PROFIL PENGGUNA* 〕
│ ⟡ *Nama* : %name
│ ⟡ *Role* : %role
│ ⟡ *Status* : %prems
│ ⟡ *Limit* : %limit
│ ⟡ *Saldo* : Rp %uang
└────────────────────────

┌──〔 ✦ *INFO SISTEM* 〕
│ ⟡ *Bot* : ${global.namebot}
│ ⟡ *Versi* : ${global.versi}
│ ⟡ *Creator* : ${global.author}
│ ⟡ *Uptime* : %uptime
│ ⟡ *Limit Fitur* : Ⓛ
│ ⟡ *Premium Fitur* : Ⓟ
└────────────────────────

┌──〔 ✦ *WAKTU & TANGGAL* 〕
│ ⟡ *Tanggal* : %tanggal
│ ⟡ *Hari* : %hari
│ ⟡ *Jam* : %jam WIB
└────────────────────────
%readmore
`.trim(),
  header: `┌──〔 ✦ *%category* 〕`,
  body: `│ ⟡ %cmd %isPremium %islimit`,
  footer: `└────────────────────────\n`,
  after: `· · ─ ─ ✦ ─ ─ · ·\n> _Terima kasih sudah menggunakan ${global.namebot}_`,
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

    let prems = premiumTime > 0 ? 'Premium Ⓟ' : 'Free Ⓛ'
    const owners = global.owner.map(v => v[0] + '@s.whatsapp.net')
    let role = owners.includes(m.sender) ? 'Owner' : dbRole
    let greeting = getGreeting(name, d.getHours())

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

        return list ? defaultMenu.header.replace('%category', tags[tag]) + '\n' + list : ''
      }).filter(Boolean),
      defaultMenu.after
    ].join('\n\n')

    let replace = { 
        uptime, _p, name, prems, greeting,
        uang: uang.toLocaleString('id-ID'), 
        limit, role, 
        tanggal, hari, jam,
        readmore: readMore,
        sender: m.sender.split('@')[0]
    }
    
    let text = _text.replace(new RegExp(`%(${Object.keys(replace).join('|')})`, 'g'), (_, key) => replace[key])

    let contextInfo = {
      forwardingScore: 999,
      isForwarded: true,
      mentionedJid: [m.sender],
      forwardedNewsletterMessageInfo: {
        newsletterName: `「 ${global.namebot} 」`,
        newsletterJid: global.ch
      }
    }

    try {
      if (videoMenu) {
        await conn.sendMessage(m.chat, {
          video: { url: videoMenu },
          gifPlayback: true,
          caption: text.trim(),
          contextInfo
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          text: text.trim(),
          contextInfo
        }, { quoted: m })
      }
    } catch (e) {
      await conn.sendMessage(m.chat, { text: text.trim(), contextInfo }, { quoted: m })
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
handler.command = /^(allmenu|help|\?)$/i

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return `${h}j ${m}m ${s}s`
}
