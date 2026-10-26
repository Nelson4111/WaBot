import { createHash } from 'crypto'
import { loadDB } from '../../lib/waifuHelper.js'
import { xpRange, getLevelRole } from '../../lib/levelling.js'
import { getGreeting } from '../../lib/style.js'
import { getIntimacyRank, normalizeRingName, getUserRelationship } from '../../lib/pasanganHelper.js'
import { isPremiumAccount } from '../../lib/rpgPremium.js'
import { addRpgMoney, formatRpgMoney } from '../../lib/rpgMoney.js'
import { sendRpgButtons } from '../../lib/rpgActionButtons.js'

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

const formatPremiumDuration = ms => {
  const totalMinutes = Math.floor(ms / 60000)
  const totalHours = Math.floor(totalMinutes / 60)
  const totalDays = Math.floor(totalHours / 24)
  const totalMonths = Math.floor(totalDays / 30)
  const totalYears = Math.floor(totalMonths / 12)

  if (totalYears > 0) return `${toSmallNum(totalYears)} Tahun`
  if (totalMonths > 0) return `${toSmallNum(totalMonths)} Bulan`
  if (totalDays > 0) return `${toSmallNum(totalDays)} Hari`
  if (totalHours > 0) return `${toSmallNum(totalHours)} Jam`
  return `${toSmallNum(totalMinutes)} Menit`
}

const createProgressBar = (percent, length = 10) => {
  const filled = Math.min(length, Math.max(0, Math.round((percent / 100) * length)))
  const empty = length - filled
  return '■'.repeat(filled) + '□'.repeat(empty)
}

let handler = async (m, { conn, text, usedPrefix: _p }) => {
  let rawNumber = text ? text.replace(/[^0-9]/g, '') : ''
  const botJid = conn.decodeJid(conn.user?.id || conn.user?.jid || '')
  let who
  if (m.mentionedJid && m.mentionedJid[0]) {
    who = m.mentionedJid[0]
  } else if (rawNumber && rawNumber.length >= 10) {
    who = rawNumber + '@s.whatsapp.net'
  } else if (m.quoted && m.quoted.sender && !m.quoted.fromMe && conn.decodeJid(m.quoted.sender) !== botJid) {
    who = m.quoted.sender
  } else {
    who = m.sender
  }
  who = conn.decodeJid(who)

  // Data pengguna dari database
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

  // Periksa Role Khusus (Owner / Co-Owner / Level Rank)
  const owners = (global.owner || []).map(v => (Array.isArray(v) ? v[0] : v).replace(/\D/g, '') + '@s.whatsapp.net')
  const senderNumber = who.split('@')[0]
  if (owners.some(o => o.includes(senderNumber))) {
    role = 'Owner ❖'
  } else if (user.isCoOwner) {
    role = 'Co-Owner ✦'
  } else {
    role = getLevelRole(level)
  }

  let isPremium = isPremiumAccount(user)
  let prems = isPremium ? 'ᴘʀᴇᴍɪᴜᴍ Ⓟ' : 'ꜰʀᴇᴇ Ⓛ'
  const premiumExpiry = Number(premiumTime) > 0 && Number.isFinite(Number(premiumTime))
    ? `${formatPremiumDuration(Number(premiumTime) - Date.now())} lagi`
    : 'Permanen'
  const premiumStatus = isPremium ? `${prems} • ${premiumExpiry}` : prems

  // 3. Data Finansial & Ekonomi
  const wdb = loadDB()
  const uang = wdb.money?.[who] || 0
  const bank = user.rpg?.bank || 0
  const totalAset = addRpgMoney(uang, bank)

  // 4. Data Leveling & Progres EXP
  let { min, max, xp: reqXp } = xpRange(level, global.multiplier || 36)
  let currentExpInLevel = Math.max(0, exp - min)
  let percent = Math.min(100, Math.max(0, Math.floor((currentExpInLevel / (reqXp || 1)) * 100)))
  let remainingExp = Math.max(0, max - exp)
  let progressBar = createProgressBar(percent, 10)

  // 4b. Data RPG Petualangan (Option A: Dual Level System)
  const rpg = user.rpg || {}
  const rpgLevel = rpg.level || 1
  const rpgExp = rpg.exp || 0
  const rpgMaxExp = rpgLevel * 500
  const rpgDarah = rpg.darah ?? 100
  const rpgArmor = rpg.armor || 0
  const rpgSword = rpg.sword || 0
  const rpgMaxDarah = 100 + (rpgArmor * 20) + (rpg.maxDarahBonus || 0)
  const rpgPercent = Math.min(100, Math.max(0, Math.floor((rpgExp / (rpgMaxExp || 1)) * 100)))
  const rpgBar = createProgressBar(rpgPercent, 10)

  // 5. Data Hubungan & Asmara (Mendukung Multi-Pasangan Real & Waifu Virtual 2D)
  const rel = getUserRelationship(who)
  let mentions = rel.pasanganHidden ? [] : [who]
  let hubunganCard = ''

  if (rel.pasanganHidden) {
    hubunganCard = `*╭  〔 ᰔ ʜ ᴜ ʙ ᴜ ɴ ɢ ᴀ ɴ 〕*
*┆* ⟡ ꜱᴛᴀᴛᴜꜱ    : *🔒 DIKUNCI*
*┆* ✧ ᴘᴀꜱᴀɴɢᴀɴ  : *Rahasia*
*╰──────────────────────*`
  } else if (rel.hasRealPartner && rel.hasWaifu) {
    mentions.push(...rel.mentions)
    let partnerInfo = ''
    if (rel.realPartners.length === 1) {
      let p = rel.realPartners[0]
      if (p.isHidden) {
        partnerInfo = '*┆* ✧ ɪꜱᴛʀɪ/ꜱᴜᴀᴍɪ: *Rahasia*'
      } else {
        let partnerNum = (p.jid || '').split('@')[0].replace(/\D/g, '')
        let dur = formatDuration(Date.now() - (p.nikahTime || Date.now()))
        let ring = normalizeRingName(p.cincin || user.pasanganCincin || 'Silver Ring')
        let rank = getIntimacyRank(p.poinBucin || 0)
        partnerInfo = `*┆* ✧ ɪꜱᴛʀɪ/ꜱᴜᴀᴍɪ: *@${partnerNum}* (${dur})\n*┆*    ◈ ᴄɪɴᴄɪɴ: *${ring}* | ᰔ: *${toSmallNum(p.poinBucin || 0)} Poin* (${rank.title})`
      }
    } else {
      partnerInfo = `*┆* ✧ ɪꜱᴛʀɪ/ꜱᴜᴀᴍɪ: *${toSmallNum(rel.realPartners.length)} Pasangan*\n` + rel.realPartners.map((p, i) => {
        if (p.isHidden) return `*┆*    ⟡ [${toSmallNum(i + 1)}] *Rahasia*`
        let partnerNum = (p.jid || '').split('@')[0].replace(/\D/g, '')
        return `*┆*    ⟡ [${toSmallNum(i + 1)}] *@${partnerNum}*`
      }).join('\n')
    }

    const w = rel.waifu
    const wst = rel.waifuStatus || {}
    const afinitas = wst.afinitas || 0
    const mood = wst.mood !== undefined ? wst.mood : 50

    hubunganCard = `*╭  〔 ᰔ ʜ ᴜ ʙ ᴜ ɴ ɢ ᴀ ɴ 〕*
*┆* ⟡ ꜱᴛᴀᴛᴜꜱ    : *${rel.statusText}*
${partnerInfo}
*┆* 𝜚 ᴡᴀɪꜰᴜ 𝟸ᴅ  : *${w.charName || 'Waifu'}* (Virtual)
*┆*    ✦ ᴀꜰɪɴɪᴛᴀꜱ: *${toSmallNum(afinitas)} Poin* | ⟡ ᴍᴏᴏᴅ: *${toSmallNum(mood)}%*
*╰──────────────────────*`
  } else if (rel.hasRealPartner) {
    mentions.push(...rel.mentions)
    if (rel.realPartners.length === 1) {
      let p = rel.realPartners[0]
      if (p.isHidden) {
        hubunganCard = `*╭  〔 ᰔ ʜ ᴜ ʙ ᴜ ɴ ɢ ᴀ ɴ 〕*
*┆* ⟡ ꜱᴛᴀᴛᴜꜱ    : *${rel.statusText}*
*┆* ✧ ᴘᴀꜱᴀɴɢᴀɴ  : *Rahasia*
*╰──────────────────────*`
      } else {
        let partnerNum = (p.jid || '').split('@')[0].replace(/\D/g, '')
        let dur = formatDuration(Date.now() - (p.nikahTime || Date.now()))
        let ring = normalizeRingName(p.cincin || user.pasanganCincin || 'Silver Ring')
        let rank = getIntimacyRank(p.poinBucin || 0)
        hubunganCard = `*╭  〔 ᰔ ʜ ᴜ ʙ ᴜ ɴ ɢ ᴀ ɴ 〕*
*┆* ⟡ ꜱᴛᴀᴛᴜꜱ    : *${rel.statusText}*
*┆* ✧ ᴘᴀꜱᴀɴɢᴀɴ  : *@${partnerNum}*
*┆* ✦ ᴅᴜʀᴀꜱɪ    : *${dur}*
*┆* ◈ ᴄɪɴᴄɪɴ    : *${ring}*
*┆* ᰔ ᴋᴇɪɴᴛɪᴍᴀɴ : *${toSmallNum(p.poinBucin || 0)} Poin* (${rank.title})
*╰──────────────────────*`
      }
    } else {
      let spouseList = rel.realPartners.map((p, i) => {
        if (p.isHidden) return `*┆*   ⟡ [${toSmallNum(i + 1)}] *Rahasia*`
        let partnerNum = (p.jid || '').split('@')[0].replace(/\D/g, '')
        let dur = formatDuration(Date.now() - (p.nikahTime || Date.now()))
        let ring = normalizeRingName(p.cincin || 'Silver Ring')
        let rank = getIntimacyRank(p.poinBucin || 0)

        return `*┆*   ⟡ [${toSmallNum(i + 1)}] *@${partnerNum}*
*┆*       ◈ ᴅᴜʀᴀꜱɪ : *${dur}* • *${ring}*
*┆*       ᰔ ʙᴜᴄɪɴ  : *${toSmallNum(p.poinBucin || 0)} Poin* (${rank.title})`
      }).join('\n')

      hubunganCard = `*╭  〔 ᰔ ʜ ᴜ ʙ ᴜ ɴ ɢ ᴀ ɴ 〕*
*┆* ⟡ ꜱᴛᴀᴛᴜꜱ    : *${rel.statusText}*
*┆* ✧ ᴅᴀꜰᴛᴀʀ ᴘᴀꜱᴀɴɢᴀɴ :
${spouseList}
*╰──────────────────────*`
    }
  } else if (rel.hasWaifu) {
    const w = rel.waifu
    const wst = rel.waifuStatus || {}
    const afinitas = wst.afinitas || 0
    const mood = wst.mood !== undefined ? wst.mood : 50

    hubunganCard = `*╭  〔 ᰔ ʜ ᴜ ʙ ᴜ ɴ ɢ ᴀ ɴ 〕*
*┆* ⟡ ꜱᴛᴀᴛᴜꜱ    : *${rel.statusText}*
*┆* 𝜚 ᴡᴀɪꜰᴜ 𝟸ᴅ  : *${w.charName || 'Waifu'}*
*┆* ◈ ᴜɪᴅ ᴍᴀʟ   : *#${toSmallNum(w.charId || 0)}*
*┆* ✦ ᴀꜰɪɴɪᴛᴀꜱ  : *${toSmallNum(afinitas)} Poin*
*┆* ⟡ ᴍᴏᴏᴅ      : *${toSmallNum(mood)}%*
*╰──────────────────────*`
  } else {
    hubunganCard = `*╭  〔 ᰔ ʜ ᴜ ʙ ᴜ ɴ ɢ ᴀ ɴ 〕*
*┆* ⟡ ꜱᴛᴀᴛᴜꜱ    : *Single (Bebas)*
*┆* ✧ ᴘᴀꜱᴀɴɢᴀɴ  : *― (Belum ada)*
*┆* ◈ ᴄɪɴᴄɪɴ    : *―*
*┆* ᰔ ꜱᴀʀᴀɴ     : _.lamar @user_ atau _.waifulamar <nama>_
*╰──────────────────────*`
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
*┆* ❖ ꜱᴛᴀᴛᴜꜱ    : *${premiumStatus}*
*┆* ◈ ʀᴇɢɪꜱᴛᴇʀ  : *${registered ? 'ᴛᴇʀᴅᴀꜰᴛᴀʀ ㋡' : 'ʙᴇʟᴜᴍ ᴛᴇʀᴅᴀꜰᴛᴀʀ'}*
*╰──────────────────────*

*╭  〔 ✮ ʟ ᴇ ᴠ ᴇ ʟ  ᴜ ᴛ ᴀ ᴍ ᴀ  (ᴀ ᴋ ᴜ ɴ) 〕*
*┆* ⟡ ʟᴇᴠᴇʟ ʙᴏᴛ : *${toSmallNum(level)} (${role})*
*┆* ✧ ᴛᴏᴛᴀʟ ᴇxᴘ : *${toSmallNum(exp.toLocaleString('id-ID'))} XP*
*┆* ✦ xᴘ ᴋᴇ ʟᴠʟ : *${toSmallNum(remainingExp.toLocaleString('id-ID'))} EXP lagi*
*┆* ◈ ᴘʀᴏɢʀᴇꜱ   : *[${progressBar}]*
*┆*    ⟡ ᴘᴇʀꜱᴇɴ : *${toSmallNum(percent)}%*
*╰──────────────────────*

*╭  〔 ⚔️ ʀ ᴘ ɢ  ᴘ ᴇ ᴛ ᴜ ᴀ ʟ ᴀ ɴ ɢ 〕*
*┆* ⟡ ʟᴇᴠᴇʟ ʀᴘɢ : *${toSmallNum(rpgLevel)}*
*┆* ✧ ᴇxᴘ ʀᴘɢ   : *${toSmallNum(rpgExp.toLocaleString('id-ID'))} / ${toSmallNum(rpgMaxExp.toLocaleString('id-ID'))} XP*
*┆* ✦ ᴅᴀʀᴀʜ     : *${toSmallNum(rpgDarah)} / ${toSmallNum(rpgMaxDarah)} HP*
*┆* ◈ ᴇǫᴜɪᴘ     : *🗡️ Lv.${toSmallNum(rpgSword)}* • *🛡️ Lv.${toSmallNum(rpgArmor)}*
*┆* ⟡ ᴘʀᴏɢʀᴇꜱ   : *[${rpgBar}]*
*┆*    ◈ ᴘᴇʀꜱᴇɴ : *${toSmallNum(rpgPercent)}%*
*╰──────────────────────*

*╭  〔 ❖ ᴋ ᴇ ᴜ ᴀ ɴ ɢ ᴀ ɴ 〕*
*┆* ⟡ ꜱᴀʟᴅᴏ     : *${toSmallNum(formatRpgMoney(uang))}*
*┆* ✧ ᴛᴀʙᴜɴɢᴀɴ  : *${toSmallNum(formatRpgMoney(bank))}*
*┆* ✦ ʟɪᴍɪᴛ     : *${toSmallNum(limit)} Ⓛ*
*┆* ◈ ᴛᴏᴛᴀʟ ᴀꜱᴇᴛ : *${toSmallNum(formatRpgMoney(totalAset))}*
*╰──────────────────────*

${hubunganCard}

*┆* ⌬ ꜱɴ ᴋᴇʏ : \`${sn}\`

> Ⓟ = ᴘʀᴇᴍɪᴜᴍ   •   Ⓛ = ʟɪᴍɪᴛ
> ✨ *Jelajahi fitur bot lewat tombol kategori di bawah.*\n> Pilih menu yang kamu butuhkan, atau gunakan tombol pintasan untuk info owner dan donasi.`.trim()

  const categories = [
    { header: '🏠 Utama', title: 'Semua Perintah', description: 'Lihat seluruh fitur dan perintah bot', id: `${_p}allmenu` },
    { header: '🤖 AI', title: 'AI & Chatbot', description: 'Ngobrol, bertanya, dan berkreasi dengan AI', id: `${_p}menuai` },
    { header: '🎌 Anime', title: 'Anime & Waifu', description: 'Cari anime, karakter, dan gambar favorit', id: `${_p}menuanime` },
    { header: '🎧 Audio', title: 'Audio & Musik', description: 'Putar musik, efek suara, dan olah audio', id: `${_p}menuaudio` },
    { header: '🪚 CSM RPG', title: 'Chainsaw Man RPG', description: 'Petualangan dan fitur RPG Chainsaw Man', id: `${_p}menucsm` },
    { header: '📥 Downloader', title: 'Unduh Media', description: 'Unduh video dan media dari berbagai platform', id: `${_p}menudownload` },
    { header: '🎉 Hiburan', title: 'Hiburan & Fun', description: 'Jokes, konten seru, dan hiburan lainnya', id: `${_p}menufun` },
    { header: '🎮 Games', title: 'Mini Games', description: 'Main kuis, tebak-tebakan, catur, dan lainnya', id: `${_p}menugame` },
    { header: '🕹️ Arcade', title: 'Arcade', description: 'Main game arcade langsung di chat', id: `${_p}menuarcade` },
    { header: '👥 Grup', title: 'Kelola Grup', description: 'Atur grup dan gunakan fitur admin', id: `${_p}menugroup` },
    { header: 'ℹ️ Info', title: 'Informasi Bot', description: 'Lihat informasi, status, dan panduan bot', id: `${_p}menuinfo` },
    { header: '🌐 Internet', title: 'Pencarian Internet', description: 'Cari informasi, cuaca, dan referensi web', id: `${_p}menuinternet` },
    { header: '🎨 Maker', title: 'Kreasi Gambar', description: 'Buat gambar, logo, dan konten kreatif', id: `${_p}menumaker` },
    { header: '💳 Keuangan', title: 'Catatan Keuangan', description: 'Kelola transaksi dan catatan keuangan', id: `${_p}menumoneytrack` },
    { header: '🔑 Owner', title: 'Menu Owner', description: 'Perintah khusus pemilik bot', id: `${_p}menuowner` },
    { header: '💞 Hubungan', title: 'Pasangan & Hubungan', description: 'Fitur pasangan, pernikahan, dan lainnya', id: `${_p}menupasangan` },
    { header: '⚔️ RPG', title: 'RPG Petualangan', description: 'Jelajahi dunia RPG dan kembangkan karakter', id: `${_p}menurpg` },
    { header: '🔎 Pencarian', title: 'Cari Data', description: 'Temukan informasi dari berbagai sumber', id: `${_p}menusearch` },
    { header: '📱 Stalker', title: 'Cek Sosial Media', description: 'Lihat informasi akun media sosial', id: `${_p}menustalker` },
    { header: '🏷️ Stiker', title: 'Pembuat Stiker', description: 'Ubah foto, teks, atau video menjadi stiker', id: `${_p}menusticker` },
    { header: '🧰 Tools', title: 'Alat & Utilitas', description: 'Gunakan alat bantu praktis sehari-hari', id: `${_p}menutools` },
    { header: '💝 Apresiasi', title: 'Terima Kasih', description: 'Lihat kontributor dan dukungan untuk bot', id: `${_p}thanksto` }
  ]

  const mentionsData = Array.from(new Set(mentions))
  const footer = `${global.namebot} • User Profile System`
  const contextInfo = {
    mentionedJid: mentionsData,
    forwardingScore: 1,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterName: `「 ${global.namebot} 」`,
      newsletterJid: global.ch
    }
  }

  await sendRpgButtons(conn, {
    chat: m.chat,
    message: m,
    text: caption,
    title: '✦ PILIH KATEGORI ✦',
    footer,
    sections: [{ title: '✨ Menu yang tersedia', rows: categories }],
    buttons: [
      ['❖ Info Owner', `${_p}owner`],
      ['💝 Donasi', `${_p}donasi`]
    ],
    keepButtonsWithSections: true,
    mentions: mentionsData,
    contextInfo,
    quoted: m
  })
}

handler.help = ['profile', 'me']
handler.tags = ['main', 'info']
handler.command = /^(profile|me|profil)$/i

export default handler