import fs from 'fs'
import fetch from 'node-fetch'
import { loadDB } from '../../lib/waifuHelper.js'
import { toPTT } from '../../lib/converter.js'

import { getGreeting } from '../../lib/style.js'

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

  let users = global.db.data.users || {}
  let user = users[m.sender] || {}
  const wdb = loadDB()
  const uang = wdb.money?.[m.sender] || 0
  let { limit = 0, role = 'User', premiumTime = 0, pasangan = [] } = user
  let prems = premiumTime > 0 ? 'Premium Ⓟ' : 'Free Ⓛ'

  let partnerDisplay = '💔 Jomblo'
  if (pasangan && pasangan.length > 0) {
      if (pasangan.length === 1) {
          let dur = formatDuration(Date.now() - pasangan[0].nikahTime)
          partnerDisplay = `@${pasangan[0].jid.split('@')[0]} (${dur})`
      } else {
          partnerDisplay = '\n' + pasangan.map((p, i) => {
              let dur = formatDuration(Date.now() - p.nikahTime)
              return `    ${i + 1}. @${p.jid.split('@')[0]} (${dur})`
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
          return `│ ⟡ *${i + 1}.* @${jid.split('@')[0]} : Rp ${data.totalDonasi.toLocaleString('id-ID')}`
      }).join('\n')
  } else {
      donorText = `│ ⟡ *Ketik ${_p}donasi untuk mendukung bot!*`
  }

  let videoMenu = 'https://api.deline.web.id/tMbmgonUvF.mp4'
  try {
    if (fs.existsSync('./media/menu.json')) {
      const listMenu = JSON.parse(fs.readFileSync('./media/menu.json'))
      if (Array.isArray(listMenu) && listMenu.length > 0) {
        videoMenu = listMenu[Math.floor(Math.random() * listMenu.length)]
      }
    }
  } catch (e) {
    videoMenu = 'https://api.deline.web.id/tMbmgonUvF.mp4'
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

  let header = `
⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆
   〔 ✦ *${global.namebot.toUpperCase()}* 〕
> ${greeting}
⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆
`.trim()

  let userCard = `
┌──〔 ✦ *PROFIL PENGGUNA* 〕
│ ⟡ *Nama* : ${name}
│ ⟡ *Role* : ${role}
│ ⟡ *Status* : ${prems}
│ ⟡ *Limit* : ${limit}
│ ⟡ *Saldo* : Rp ${uang.toLocaleString('id-ID')}
│ ⟡ *Pasangan* : ${partnerDisplay}
└────────────────────────
`.trim()

  let botCard = `
┌──〔 ✦ *INFO SISTEM* 〕
│ ⟡ *Bot* : ${global.namebot}
│ ⟡ *Versi* : ${global.versi}
│ ⟡ *Creator* : ${global.author}
│ ⟡ *Mode* : Public
│ ⟡ *Limit Fitur* : Ⓛ
│ ⟡ *Premium Fitur* : Ⓟ
└────────────────────────
`.trim()

  let topDonorsCard = `
┌──〔 ✦ *TOP DONATUR* 〕
${donorText}
└────────────────────────
`.trim()

  let aboutCard = `
┌──〔 ✦ *WAKTU & TANGGAL* 〕
│ ⟡ *Tanggal* : ${tanggal}
│ ⟡ *Hari* : ${hari}
│ ⟡ *Jam* : ${jam} WIB
└────────────────────────
`.trim()

  let listMenuText = `
┌──〔 ✦ *DAFTAR MENU* 〕
│ › ${_p}allmenu ── Semua Perintah
│ › ${_p}menuai ── Fitur AI & ChatBot
│ › ${_p}menuanime ── Fitur Anime
│ › ${_p}menuaudio ── Manipulasi Audio
│ › ${_p}menucsm ── Chainsaw Man RPG
│ › ${_p}menudownload ── Pengunduh Media
│ › ${_p}menufun ── Fitur Hiburan
│ › ${_p}menugame ── Mini Games
│ › ${_p}menugroup ── Manajemen Grup
│ › ${_p}menuinfo ── Informasi Bot
│ › ${_p}menuinternet ── Pencarian Web
│ › ${_p}menumaker ── Pembuat Gambar
│ › ${_p}menumoneytrack ── Catatan Keuangan
│ › ${_p}menuowner ── Khusus Owner
│ › ${_p}menupasangan ── Fitur Hubungan
│ › ${_p}menurpg ── Roleplay Game
│ › ${_p}menusearch ── Pencarian Data
│ › ${_p}menustalker ── Stalker Sosmed
│ › ${_p}menusticker ── Pembuat Stiker
│ › ${_p}menutools ── Alat & Utilitas
└────────────────────────

· · ─ ─ ✦ ─ ─ · ·
> _Ketik ${_p}help <cmd> untuk info detail perintah._
`.trim()

  let caption = [header, userCard, botCard, topDonorsCard, aboutCard, listMenuText].join('\n\n')

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

  try {
    if (videoMenu) {
      await conn.sendMessage(m.chat, {
        video: { url: videoMenu },
        gifPlayback: true,
        caption,
        contextInfo
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        text: caption,
        contextInfo
      }, { quoted: m })
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
