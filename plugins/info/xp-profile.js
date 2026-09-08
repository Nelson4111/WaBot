import { createHash } from 'crypto'
import sharp from 'sharp'
import { loadDB } from '../../lib/waifuHelper.js'
import { xpRange } from '../../lib/levelling.js'
import { getGreeting, getMenuThumbnail } from '../../lib/style.js'
import { getIntimacyRank } from '../../lib/pasanganHelper.js'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str).replace(/[0-9]/g, d => map[d] || d)
}

const formatDuration = (ms) => {
  if (!ms || isNaN(ms) || ms <= 0) return 'Baru Saja'
  let seconds = Math.floor(ms / 1000)
  let minutes = Math.floor(seconds / 60)
  let hours = Math.floor(minutes / 60)
  let days = Math.floor(hours / 24)
  let months = Math.floor(days / 30)
  let years = Math.floor(months / 12)

  if (years > 0) return `${toSmallNum(years)} Tahun ${toSmallNum(months % 12)} Bulan`
  if (months > 0) return `${toSmallNum(months)} Bulan ${toSmallNum(days % 30)} Hari`
  if (days > 0) return `${toSmallNum(days)} Hari ${toSmallNum(hours % 24)} Jam`
  if (hours > 0) return `${toSmallNum(hours)} Jam ${toSmallNum(minutes % 60)} Menit`
  return `${toSmallNum(minutes)} Menit`
}

const createProgressBar = (percent, length = 10) => {
  const filled = Math.min(length, Math.max(0, Math.round((percent / 100) * length)))
  const empty = length - filled
  return '■'.repeat(filled) + '□'.repeat(empty)
}

let handler = async (m, { conn, text, usedPrefix: _p }) => {
  let rawNumber = text ? text.replace(/[^0-9]/g, '') : ''
  let who
  if (m.mentionedJid && m.mentionedJid[0]) {
    who = m.mentionedJid[0]
  } else if (m.quoted && m.quoted.sender) {
    who = m.quoted.sender
  } else if (rawNumber && rawNumber.length >= 10) {
    who = rawNumber + '@s.whatsapp.net'
  } else {
    who = m.sender
  }
  who = conn.decodeJid(who)

  // 1. Ambil Foto Profil Pengguna Asli
  let pp = null
  try {
    pp = await conn.profilePictureUrl(who, 'image')
  } catch {}

  // 2. Data Pengguna dari Database
  let user = (global.db && global.db.data && global.db.data.users && global.db.data.users[who]) || {}
  let {
    name,
    registered = false,
    age = '-',
    gender = '-',
    role = 'User',
    limit = 0,
    exp = 0,
    level = 0,
    premiumTime = 0,
    pasangan = []
  } = user

  let username = registered ? (name || conn.getName(who)) : conn.getName(who)
  if (!username) username = 'User'

  // Periksa Role Khusus (Owner / Co-Owner)
  const owners = (global.owner || []).map(v => (Array.isArray(v) ? v[0] : v).replace(/\D/g, '') + '@s.whatsapp.net')
  const senderNumber = who.split('@')[0]
  if (owners.some(o => o.includes(senderNumber))) {
    role = 'Owner ❖'
  } else if (user.isCoOwner) {
    role = 'Co-Owner ✦'
  }

  let isPremium = (premiumTime || 0) > Date.now() || user.premium
  let prems = isPremium ? 'ᴘʀᴇᴍɪᴜᴍ Ⓟ' : 'ꜰʀᴇᴇ Ⓛ'
  let premExpired = ''
  if (isPremium && premiumTime) {
    premExpired = `\n*┆* ⏱ ᴇxᴘɪʀᴇᴅ   : *${formatDuration(premiumTime - Date.now())} lagi*`
  }

  // 3. Data Finansial & Ekonomi
  const wdb = loadDB()
  const uang = wdb.money?.[who] || 0
  const bank = user.rpg?.bank || 0
  const totalAset = uang + bank

  // 4. Data Leveling & Progres EXP
  let { min, max, xp: reqXp } = xpRange(level)
  let currentExpInLevel = Math.max(0, exp - min)
  let percent = Math.min(100, Math.max(0, Math.floor((currentExpInLevel / (reqXp || 1)) * 100)))
  let remainingExp = Math.max(0, max - exp)
  let progressBar = createProgressBar(percent, 10)

  // 5. Data Hubungan & Asmara (Mendukung Sistem Poligami Multi-Pasangan)
  let mentions = [who]
  let hubunganCard = ''

  if (pasangan && pasangan.length > 0) {
    if (pasangan.length === 1) {
      let p = pasangan[0]
      let partnerNum = p.jid.split('@')[0].replace(/\D/g, '')
      let dur = formatDuration(Date.now() - (p.nikahTime || Date.now()))
      let ring = p.cincin || user.pasanganCincin || 'Cincin Perak'
      let rank = getIntimacyRank(p.poinBucin || 0)
      mentions.push(p.jid)

      hubunganCard = `*╭  〔 ᰔ ʜ ᴜ ʙ ᴜ ɴ ɢ ᴀ ɴ 〕*
*┆* ⟡ ꜱᴛᴀᴛᴜꜱ    : *Menikah ᰔ*
*┆* ✧ ᴘᴀꜱᴀɴɢᴀɴ  : *@${partnerNum}*
*┆* ✦ ᴅᴜʀᴀꜱɪ    : *${dur}*
*┆* ◈ ᴄɪɴᴄɪɴ    : *${ring}*
*┆* ᰔ ᴋᴇɪɴᴛɪᴍᴀɴ : *${toSmallNum(p.poinBucin || 0)} Poin* (${rank.title})
*╰──────────────────────*`
    } else {
      let spouseList = pasangan.map((p, i) => {
        let partnerNum = p.jid.split('@')[0].replace(/\D/g, '')
        let dur = formatDuration(Date.now() - (p.nikahTime || Date.now()))
        let ring = p.cincin || 'Cincin Perak'
        let rank = getIntimacyRank(p.poinBucin || 0)
        mentions.push(p.jid)

        return `*┆*   ⟡ [${toSmallNum(i + 1)}] *@${partnerNum}*
*┆*       ◈ ᴅᴜʀᴀꜱɪ : *${dur}* • *${ring}*
*┆*       ᰔ ʙᴜᴄɪɴ  : *${toSmallNum(p.poinBucin || 0)} Poin* (${rank.title})`
      }).join('\n')

      hubunganCard = `*╭  〔 ᰔ ʜ ᴜ ʙ ᴜ ɴ ɢ ᴀ ɴ 〕*
*┆* ⟡ ꜱᴛᴀᴛᴜꜱ    : *Poligami (${toSmallNum(pasangan.length)} Pasangan) ᰔ*
*┆* ✧ ᴅᴀꜰᴛᴀʀ ᴘᴀꜱᴀɴɢᴀɴ :
${spouseList}
*╰──────────────────────*`
    }
  } else {
    const couple = wdb.couples?.[who]
    if (couple) {
      hubunganCard = `*╭  〔 ᰔ ʜ ᴜ ʙ ᴜ ɴ ɢ ᴀ ɴ 〕*
*┆* ⟡ ꜱᴛᴀᴛᴜꜱ    : *Pacaran ᰔ*
*┆* ✧ ᴘᴀꜱᴀɴɢᴀɴ  : *${couple.charName || 'Waifu'}*
*┆* ✦ ᴋᴇᴛᴇʀᴀɴɢᴀɴ: *Waifu Virtual*
*╰──────────────────────*`
    } else {
      hubunganCard = `*╭  〔 ᰔ ʜ ᴜ ʙ ᴜ ɴ ɢ ᴀ ɴ 〕*
*┆* ⟡ ꜱᴛᴀᴛᴜꜱ    : *Single (Bebas)*
*┆* ✧ ᴘᴀꜱᴀɴɢᴀɴ  : *― (Belum ada)*
*┆* ◈ ᴄɪɴᴄɪɴ    : *―*
*┆* ᰔ ꜱᴀʀᴀɴ     : _.lamar @user untuk menikah_
*╰──────────────────────*`
    }
  }

  // 6. Serial Number Key
  let sn = createHash('md5').update(who).digest('hex')

  // 7. Salam Waktu
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  const hour = d.getHours()
  let greetingWaktu = 'ꜱᴇʟᴀᴍᴀᴛ ᴍᴀʟᴀᴍ'
  if (hour >= 4 && hour < 11) greetingWaktu = 'ꜱᴇʟᴀᴍᴀᴛ ᴘᴀɢɪ'
  else if (hour >= 11 && hour < 15) greetingWaktu = 'ꜱᴇʟᴀᴍᴀᴛ ꜱɪᴀɴɢ'
  else if (hour >= 15 && hour < 18) greetingWaktu = 'ꜱᴇʟᴀᴍᴀᴛ ꜱᴏʀᴇ'

  let userGreeting = getGreeting(username, hour)

  // 8. Susun Kartu Informasi Sesuai STYLE_GUIDE.md (Zen Shinto Aesthetic)
  let caption = `*──  ୨୧ ✧ ᴜ ꜱ ᴇ ʀ  ᴘ ʀ ᴏ ꜰ ɪ ʟ ᴇ ✧ ୨୧  ──*

> *こんにちわ!* (ʜᴇʟʟᴏ!)
> ${greetingWaktu} *${username}* ♡
> ${userGreeting}

*╭  〔 𝜚 ᴜ ꜱ ᴇ ʀ  ᴘ ʀ ᴏ ꜰ ɪ ʟ ᴇ 〕*
*┆* ⟡ ɴᴀᴍᴀ      : *${username}*
*┆* ✧ ɴᴏᴍᴏʀ     : *@${senderNumber}*
*┆* ✦ ᴜᴍᴜʀ      : *${toSmallNum(age)} Tahun*
*┆* ㋡ ʀᴏʟᴇ      : *${role}*
*┆* ❖ ꜱᴛᴀᴛᴜꜱ    : *${prems}*${premExpired}
*┆* ◈ ʀᴇɢɪꜱᴛᴇʀ  : *${registered ? 'ᴛᴇʀᴅᴀꜰᴛᴀʀ ㋡' : 'ʙᴇʟᴜᴍ ᴛᴇʀᴅᴀꜰᴛᴀʀ'}*
*┆* ⌬ ꜱɴ ᴋᴇʏ    : \`${sn}\`
*╰──────────────────────*

*╭  〔 ✮ ʟ ᴇ ᴠ ᴇ ʟ  &  ᴇ x ᴘ 〕*
*┆* ⟡ ʟᴇᴠᴇʟ     : *${toSmallNum(level)}*
*┆* ✧ ᴇxᴘ       : *${toSmallNum(exp.toLocaleString('id-ID'))}*
*┆* ✦ xᴘ ᴋᴇ ʟᴠʟ : *${toSmallNum(remainingExp.toLocaleString('id-ID'))} EXP lagi*
*┆* ◈ ᴘʀᴏɢʀᴇꜱ   : *[${progressBar}] (${toSmallNum(percent)}%)*
*╰──────────────────────*

*╭  〔 ❖ ᴋ ᴇ ᴜ ᴀ ɴ ɢ ᴀ ɴ 〕*
*┆* ⟡ ꜱᴀʟᴅᴏ     : *Rp ${toSmallNum(uang.toLocaleString('id-ID'))}*
*┆* ✧ ᴛᴀʙᴜɴɢᴀɴ  : *Rp ${toSmallNum(bank.toLocaleString('id-ID'))}*
*┆* ✦ ʟɪᴍɪᴛ     : *${toSmallNum(limit)} Ⓛ*
*┆* ◈ ᴛᴏᴛᴀʟ ᴀꜱᴇᴛ : *Rp ${toSmallNum(totalAset.toLocaleString('id-ID'))}*
*╰──────────────────────*

${hubunganCard}

> Ⓟ = ᴘʀᴇᴍɪᴜᴍ   •   Ⓛ = ʟɪᴍɪᴛ
> ｡˚ ⊹ *ᴛᴀᴘ ᴛᴏᴍʙᴏʟ ᴅɪ ʙᴀᴡᴀʜ ᴜɴᴛᴜᴋ ᴘɪʟɪʜ ᴋᴀᴛᴇɢᴏʀɪ* ⊹ ˚ ｡`.trim()

  // 9. Susun 22 Kategori Menu Lengkap (Format single_select persis seperti menu.js)
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

  const mentionsData = Array.from(new Set(mentions))
  const footer = `${global.namebot} • User Profile System`

  let contextInfo = {
    mentionedJid: mentionsData,
    forwardingScore: 1,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterName: `「 ${global.namebot} 」`,
      newsletterJid: global.ch
    }
  }

  // 10. Siapkan Thumbnail (Foto Profil User dikompres sharp atau fallback menu thumbnail)
  let thumb = null
  if (pp) {
    try {
      const file = await conn.getFile(pp)
      if (file?.data) {
        thumb = await sharp(file.data)
          .resize(250, 250, { fit: 'cover' })
          .jpeg({ quality: 70 })
          .toBuffer()
      }
    } catch {}
  }
  if (!thumb) {
    thumb = await getMenuThumbnail()
  }

  // 11. Pengiriman Pesan via ButtonV2 (Sesuai Standar menu.js)
  let sent = false
  if (typeof conn.ButtonV2 === 'function') {
    try {
      const btn = new conn.ButtonV2(conn)
      btn.setTitle(`✧ ${global.namebot.toUpperCase()} ✧`)
      btn.setSubtitle(`ᴘʀᴏꜰɪʟ ᴘᴇɴɢɢᴜɴᴀ • ${username}`)
      btn.setBody(caption)
      btn.setFooter(footer)
      if (thumb) btn.setRawThumbnail(thumb)

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
      console.error('[ButtonV2 xp-profile.js error]:', errBtnV2?.message || errBtnV2)
      sent = false
    }
  }

  // 12. Fallback Pengiriman Standar jika ButtonV2 tidak tersedia
  if (!sent) {
    if (thumb) {
      await conn.sendMessage(m.chat, {
        image: thumb,
        caption,
        footer,
        mentions: mentionsData,
        contextInfo
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        text: caption,
        footer,
        mentions: mentionsData,
        contextInfo
      }, { quoted: m })
    }
  }
}

handler.help = ['profile', 'me']
handler.tags = ['main', 'info']
handler.command = /^(profile|me|profil)$/i

export default handler