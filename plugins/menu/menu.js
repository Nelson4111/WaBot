import fs from 'fs'
import fetch from 'node-fetch'
import { loadDB } from '../../lib/waifuHelper.js'
import { toPTT } from '../../lib/converter.js'
import pkg from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto } = pkg

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
  let prems = premiumTime > 0 ? 'ᴘʀᴇᴍɪᴜᴍ' : 'ғʀᴇᴇ'

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
          let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'
          donorMentions.push(jid)
          return `${i === 0 ? '╭' : i === topDonors.length - 1 ? '╰' : '│'} ${medal} @${jid.split('@')[0]} : Rp ${data.totalDonasi.toLocaleString('id-ID')}`
      }).join('\n')
  } else {
      donorText = `╰ 💎 *Ketik ${_p}donasi untuk mendukung bot!*`
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

  let hour = d.getHours()
  let greeting = 'Selamat malam'
  if (hour >= 4 && hour < 11) greeting = 'Selamat pagi'
  else if (hour >= 11 && hour < 15) greeting = 'Selamat siang'
  else if (hour >= 15 && hour < 18) greeting = 'Selamat sore'

  let caption = `
${greeting}, *${name}*! Aku *${global.namebot}*, bot WhatsApp yang siap membantu kamu ✨

[ ⛩️ ]───[ *_ɪɴғᴏ • ᴜsᴇʀ_* ]───✦
╭ 𖥔  ɴᴀᴍᴀ : ${name}
│ 𖥔  ʀᴏʟᴇ : ${role}
│ 𖥔  ᴜꜱᴇʀ : ${prems}
│ 𖥔  ʟɪᴍɪᴛ : ${limit}
│ 𖥔  ᴍᴏɴᴇʏ : Rp ${uang.toLocaleString('id-ID')}
╰ 𖥔  ᴘᴀsᴀɴɢᴀɴ : ${partnerDisplay}

[ ⛩️ ]───[ *_ɪɴғᴏ • ʙᴏᴛ_* ]───✦
╭ 𖥔  ɴᴀᴍᴀ ʙᴏᴛ : ${global.namebot}
│ 𖥔  ᴠᴇʀsɪ : ${global.versi}
│ 𖥔  ᴄʀᴇᴀᴛᴏʀ : ${global.author}
│ 𖥔  ᴍᴏᴅᴇ : Public
│ 𖥔  ʟɪᴍɪᴛ ꜰᴇᴀᴛᴜʀᴇ : Ⓛ
╰ 𖥔  ᴘʀᴇᴍɪᴜᴍ ꜰᴇᴀᴛᴜʀᴇ : Ⓟ

[ 🏆 ]───[ *_ᴛᴏᴘ • ᴅᴏɴᴀᴛᴜʀ_* ]───✦
${donorText}

╭──「 *ᴀʙᴏᴜᴛ* 」✦
│ 𖥔  ᴛᴀɴɢɢᴀʟ : ${tanggal}
│ 𖥔  ʜᴀʀɪ : ${hari}
│ 𖥔  ᴊᴀᴍ : ${jam} WIB
╰──
`.trim()

  /* Backup List Menu Text:
  ╭──「 *ʟɪsᴛ ᴍᴇɴᴜ* 」─✦
  │ ⟡ .allmenu
  │ ⟡ .menuai
  │ ⟡ .menuanime
  │ ⟡ .menuaudio
  │ ⟡ .menudownload
  │ ⟡ .menufun
  │ ⟡ .menugame
  │ ⟡ .menugroup
  │ ⟡ .menuinfo
  │ ⟡ .menuinternet
  │ ⟡ .menumaker
  │ ⟡ .menumoneytrack
  │ ⟡ .menuowner
  │ ⟡ .menupasangan
  │ ⟡ .menurpg
  │ ⟡ .menusearch
  │ ⟡ .menustalker
  │ ⟡ .menusticker
  │ ⟡ .menutools
  ╰──
  */

  let mentions = [m.sender, ...donorMentions]
  if (pasangan && pasangan.length > 0) {
      pasangan.forEach(p => mentions.push(p.jid))
  }

  let menuRows = [
    { title: "All Menu", id: ".allmenu", description: "Tampilkan semua daftar perintah" },
    { title: "AI Menu", id: ".menuai", description: "Fitur kecerdasan buatan" },
    { title: "Anime Menu", id: ".menuanime", description: "Fitur pencarian anime" },
    { title: "Audio Menu", id: ".menuaudio", description: "Manipulasi file audio" },
    { title: "Download Menu", id: ".menudownload", description: "Unduh media dari sosmed" },
    { title: "Fun Menu", id: ".menufun", description: "Fitur hiburan" },
    { title: "Game Menu", id: ".menugame", description: "Daftar mini games" },
    { title: "Group Menu", id: ".menugroup", description: "Manajemen grup" },
    { title: "Info Menu", id: ".menuinfo", description: "Informasi bot" },
    { title: "Internet Menu", id: ".menuinternet", description: "Browsing internet" },
    { title: "Maker Menu", id: ".menumaker", description: "Buat logo & gambar" },
    { title: "Money Track", id: ".menumoneytrack", description: "Pencatatan keuangan" },
    { title: "Owner Menu", id: ".menuowner", description: "Khusus owner bot" },
    { title: "Pasangan Menu", id: ".menupasangan", description: "Fitur relationship" },
    { title: "RPG Menu", id: ".menurpg", description: "Roleplay game features" },
    { title: "Search Menu", id: ".menusearch", description: "Pencarian data" },
    { title: "Stalker Menu", id: ".menustalker", description: "Mata-mata sosmed" },
    { title: "Sticker Menu", id: ".menusticker", description: "Pembuatan stiker" },
    { title: "Tools Menu", id: ".menutools", description: "Alat bantu multifungsi" }
  ]

  try {
    const { prepareWAMessageMedia } = pkg
    const media = await prepareWAMessageMedia({ video: { url: videoMenu }, gifPlayback: true }, { upload: conn.waUploadToServer })

    const interactiveMessage = {
        body: { text: caption },
        footer: { text: global.footer },
        header: {
            title: "",
            hasMediaAttachment: true,
            videoMessage: media.videoMessage
        },
        contextInfo: {
            mentionedJid: mentions,
            isForwarded: true,
            forwardingScore: 1
        },
        nativeFlowMessage: {
            buttons: [
                {
                    name: "single_select",
                    buttonParamsJson: JSON.stringify({
                        title: "Pilih Menu Di Sini ⎙",
                        sections: [{ title: "Daftar Menu", rows: menuRows }]
                    })
                },
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "All Menu 🗂️",
                        id: ".allmenu"
                    })
                },
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "Owner 👑",
                        id: ".owner"
                    })
                }
            ]
        }
    }

    const msg = await generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2
                },
                interactiveMessage
            }
        }
    }, { quoted: null }) // Dibuat null agar tidak terkena heuristic anti-spam WA

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

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
