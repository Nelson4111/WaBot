import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'

const DEFAULT_YOUTUBE_IMAGE = 'https://c.termai.cc/i189/AS4Mvv.webp'

const genderImage = {
  male: 'https://c.termai.cc/i165/qxnHa.jpg',
  female: 'https://c.termai.cc/i153/Q8sa.jpg'
}

const contentMap = {
  streamer: { label: 'Streamer', reward: 1.0, desc: 'Konten live streaming, gaming, dan interaksi langsung dengan penonton.' },
  gaming: { label: 'Gaming', reward: 1.35, desc: 'Konten game, gameplay, speedrun, turnamen, dan review.' },
  vlog: { label: 'Vlogger', reward: 1.2, desc: 'Konten kehidupan sehari-hari, perjalanan, aktivitas, dan cerita.' },
  entertainment: { label: 'Entertainment', reward: 1.3, desc: 'Konten hiburan, challenge, prank, komedi, dan tren.' },
  music: { label: 'Musik', reward: 1.25, desc: 'Konten cover, musik original, konser, dan video musik.' },
  food: { label: 'Food', reward: 1.25, desc: 'Konten kuliner, mukbang, memasak, dan review makanan.' },
  tech: { label: 'Tech', reward: 1.3, desc: 'Konten gadget, PC, aplikasi, teknologi, dan review perangkat.' },
  education: { label: 'Education', reward: 1.3, desc: 'Konten tutorial, pengetahuan, tips, dan pembelajaran.' },
  beauty: { label: 'Beauty', reward: 1.25, desc: 'Konten skincare, makeup, perawatan, dan makeover.' },
  fitness: { label: 'Fitness', reward: 1.2, desc: 'Konten olahraga, workout, kebugaran, dan latihan.' },
  automotive: { label: 'Otomotif', reward: 1.25, desc: 'Konten mobil, motor, modifikasi, dan review kendaraan.' },
  travel: { label: 'Travel', reward: 1.2, desc: 'Konten wisata, perjalanan, eksplorasi, dan destinasi.' },
  fashion: { label: 'Fashion', reward: 1.25, desc: 'Konten outfit, haul, lookbook, dan gaya berpakaian.' },
  reaction: { label: 'Reaction', reward: 1.15, desc: 'Konten reaksi terhadap video, musik, film, dan berbagai tren.' },
  podcast: { label: 'Podcast', reward: 1.2, desc: 'Konten obrolan, wawancara, diskusi, dan cerita.' },
  art: { label: 'Art', reward: 1.2, desc: 'Konten menggambar, desain, animasi, dan karya seni.' },
  diy: { label: 'DIY', reward: 1.2, desc: 'Konten membuat, merakit, memperbaiki, dan berbagai proyek kreatif.' },
  experiment: { label: 'Eksperimen', reward: 1.25, desc: 'Konten eksperimen, percobaan, sains, dan hal-hal unik.' },
  animal: { label: 'Hewan', reward: 1.15, desc: 'Konten hewan peliharaan, wildlife, dan edukasi hewan.' },
  lifestyle: { label: 'Lifestyle', reward: 1.2, desc: 'Konten rutinitas, produktivitas, rumah, dan kehidupan sehari-hari.' }
}

const upgradeSpecs = [
  { level: 1, cost: 250000, bonus: 1.0, spec: '📱 Smartphone • 🎤 Mic Clip-On • 💡 Ring Light' },
  { level: 2, cost: 500000, bonus: 1.12, spec: '📷 Kamera Entry • 🎙️ Mic Condenser • 💡 Softbox' },
  { level: 3, cost: 900000, bonus: 1.22, spec: '📷 Kamera Mirrorless • 🎤 Mic Shotgun • 🎧 Headset' },
  { level: 4, cost: 1500000, bonus: 1.35, spec: '🔭 Lensa Kit • 🎚️ Audio Interface • 🦿 Tripod Pro' },
  { level: 5, cost: 2500000, bonus: 1.5, spec: '🎥 Kamera Pro • 🎤 Mic Studio • 💡 Lighting Pro' },
  { level: 6, cost: 4000000, bonus: 1.68, spec: '🔭 Lensa Pro • 🎛️ Audio Mixer • 🎞️ Gimbal' },
  { level: 7, cost: 6500000, bonus: 1.88, spec: '🖥️ PC Editing • 🎮 Capture Card • 🖥️ Monitor Dual' },
  { level: 8, cost: 10000000, bonus: 2.1, spec: '🖥️ PC Creator • 🎛️ Stream Deck • 💾 SSD Pro' },
  { level: 9, cost: 16000000, bonus: 2.35, spec: '🎬 Kamera Cinema • 🎙️ Mic Broadcast • 🏢 Studio Pro' },
  { level: 10, cost: 25000000, bonus: 2.65, spec: '🎥 Kamera Flagship • 🎚️ Audio Studio • 🏢 Studio Premium' },
  { level: 11, cost: 40000000, bonus: 3.0, spec: '📷 Kamera Full Frame • 🔭 Lensa Tele • 💡 Lighting Cinema' },
  { level: 12, cost: 65000000, bonus: 3.4, spec: '🎥 Kamera Cinema Pro • 🎤 Mic Broadcast Pro • 🎞️ Gimbal Pro' },
  { level: 13, cost: 100000000, bonus: 3.85, spec: '🖥️ Workstation • 🎮 Capture Card Pro • 💾 NVMe Storage' },
  { level: 14, cost: 150000000, bonus: 4.35, spec: '🎬 Kamera Cinema 4K • 🎙️ Mic Premium • 🎚️ Mixer Digital' },
  { level: 15, cost: 225000000, bonus: 4.9, spec: '📷 Kamera Cinema 8K • 🔭 Lensa Cinema • 💡 Lighting Studio' },
  { level: 16, cost: 325000000, bonus: 5.5, spec: '🖥️ Editing Workstation • 🖥️ Monitor Reference • 🎛️ Stream Deck XL' },
  { level: 17, cost: 475000000, bonus: 6.15, spec: '🎥 Kamera Broadcast • 🎤 Mic Broadcast • 📡 Encoder Live' },
  { level: 18, cost: 700000000, bonus: 6.85, spec: '🏢 Studio Profesional • 🎬 Kamera Multi-Cam • 🎚️ Audio Console' },
  { level: 19, cost: 1000000000, bonus: 7.6, spec: '🎥 Kamera Flagship • 💡 Lighting Cinema • 🖥️ Render Workstation' },
  { level: 20, cost: 1500000000, bonus: 8.5, spec: '🏆 Studio Megaproduksi • 🎬 Kamera Cinema Ultimate • 🎙️ Audio Master' },
  { level: 21, cost: 2000000000, bonus: 9.5, spec: '🎥 Kamera Broadcast 8K • 🎤 Mic Broadcast Ultimate • 📡 Encoder Pro' },
  { level: 22, cost: 2750000000, bonus: 10.6, spec: '📷 Kamera Cinema Elite • 🔭 Lensa Prime Set • 💡 Lighting Virtual' },
  { level: 23, cost: 3750000000, bonus: 11.8, spec: '🖥️ Render Server • 🎬 Multi-Cam Cinema • 🎚️ Audio Console Pro' },
  { level: 24, cost: 5000000000, bonus: 13.1, spec: '🏢 Studio Broadcast • 📡 Streaming Server • 💾 Storage Enterprise' },
  { level: 25, cost: 7500000000, bonus: 14.5, spec: '👑 Studio Creator Ultimate • 🎬 Kamera Cinema Master • 🎙️ Audio Master Pro' }
]

function normalizeName(n) {
  return String(n || '').trim().replace(/\s+/g, ' ')
}

function formatNama(text) {
  if (!text || typeof text !== 'string') return ''
  return text.replace(/_/g, ' ').split(/\s+/).filter(Boolean).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

function pickGenderImage(gender) {
  if (gender === 'male') return genderImage.male
  if (gender === 'female') return genderImage.female
  return Math.random() > 0.5 ? genderImage.male : genderImage.female
}

function choicePic(choice) {
  if (choice === 'male') return genderImage.male
  if (choice === 'female') return genderImage.female
  return pickGenderImage('none')
}

function contentListText(usedPrefix) {
  const lines = []
  for (const key of Object.keys(contentMap)) {
    const c = contentMap[key]
    lines.push(`> ${key.padEnd(8)} - ${c.label} (${c.desc})`)
  }
  return lines.join('\n')
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  if (!wdb.users) wdb.users = {}
  if (!wdb.users[m.sender]) wdb.users[m.sender] = {}
  if (!wdb.users[m.sender].youtube) wdb.users[m.sender].youtube = {
    name: '',
    level: 1,
    roomLevel: 0,
    content: 'streamer',
    gender: 'none',
    views: 0,
    likes: 0,
    subs: 0,
    income: 0,
    lastLive: 0,
    lastCollab: 0,
    createdAt: Date.now()
  }

  const y = wdb.users[m.sender].youtube
  if (!y.lastCollab && y.lastKolab) y.lastCollab = y.lastKolab
  if (!y.lastKolab && y.lastCollab) y.lastKolab = y.lastCollab
  const raw = typeof text === 'string' ? text.trim() : ''
  const args = raw ? raw.toLowerCase().split(/\s+/).filter(Boolean) : []
  const sub = (args[0] || '').trim()

  // no text: explain what this room/youtuber alternative is
  if (!text) {
    let cap = `╭─❏「 📺 YTROOM / YOUTUBER ROOM 」❏\n`
    cap += `│ Alias: ${usedPrefix || '.'}ytr / ${usedPrefix || '.'}youtuber / ${usedPrefix || '.'}room\n`
    cap += `│ Fitur utama: room create, room gender, room content, room upgrade, room live, room collab.\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`
    cap += `📌 *Tujuan Room Youtuber*\n`
    cap += `> Membuat kanal, mengatur gender channel, memilih konten, naikkan room level, lalu mengolah live/collab.\n`
    cap += `> Room bisa diketahui dari room content list, room setup, room upgrade, room live, room collab.\n`
    cap += `> Fitur lama .liveyt / .akunyt / .buatyt tetap kompatibel dan tidak dihapus.\n\n`
    cap += `⚙️ *Cara mulai*\n`
    cap += `> ${usedPrefix || '.'}room create <nama channel>\n`
    cap += `> ${usedPrefix || '.'}room set gender male|female|none\n`
    cap += `> ${usedPrefix || '.'}room content list\n`
    cap += `> ${usedPrefix || '.'}room upgrade\n`
    cap += `> ${usedPrefix || '.'}room live\n`
    cap += `> ${usedPrefix || '.'}room collab\n`
    cap += `─━━━━━━━━━━━━━━─`
    return sendRpgMsg(conn, m, cap, DEFAULT_YOUTUBE_IMAGE)
  }

  // room setup routes
  if (sub === 'create' || sub === 'buat' || sub === 'buatyt' || sub === 'create') {
    const name = normalizeName(args.slice(1).join(' '))
    if (!name) return m.reply(`❌ Gunakan: *${usedPrefix}room create <nama channel>*`)
    if (y.name) return m.reply(`❌ Channel kamu sudah ada: *${y.name}*`)

    y.name = name
    y.role = 'creator'
    y.level = 1
    y.roomLevel = 0
    y.content = 'streamer'
    y.gender = 'none'
    y.views = 0
    y.likes = 0
    y.subs = 0
    y.income = 0
    y.lastLive = 0
    y.lastCollab = 0
    y.createdAt = Date.now()
    saveDB(wdb)

let cap = `╭─❏「 🧑‍🎤 CHANNEL CREATED 」❏\n`
cap += `│ 🧑‍🎤 *${y.name}*\n`
cap += `│ 📋 Channel berhasil dibuat.\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

cap += `📌 *LANGKAH BERIKUTNYA*\n`
cap += `> ↳ pilih gender dulu.\n\n`

cap += `⚙️ *PILIH GENDER*\n`
cap += `> ↳ Ketik: *${usedPrefix}room set gender male|female|none*\n`

cap += `─━━━━━━━━━━━━━━─`

return sendRpgMsg(conn, m, cap, DEFAULT_YOUTUBE_IMAGE)
  }

  // edit/set gender flows
  if (sub === 'set' && args[1] === 'gender') {
    const choice = args[2]
    if (!choice || !['male', 'female', 'none'].includes(choice)) {
      return m.reply(`❌ Pilihan gender salah. Gunakan: *${usedPrefix}room set gender <male|female|none>*`)
    }

    y.gender = choice
    saveDB(wdb)

    const img = choice === 'none' ? pickGenderImage('none') : genderImage[choice]
    let cap = `╭─❏「 👥 GENDER TERPILIH 」❏\n`
    cap += `│ Gender: *${choice}*\n`
    cap += `│ Channel: *${y.name || 'Room'}*\n`
    cap += `╰─━━━━━━━━━━━━━━─`
    return sendRpgMsg(conn, m, cap, img)
  }

  if (sub === 'edit' || sub === 'set') {
    const target = args[1]
    const value = args[2]
    if (!target) {
      return m.reply(`❌ Gunakan: *${usedPrefix}room edit <namayt/gender> <nilai>*`)
    }

    if (target === 'gender') {
      if (!value || !['male', 'female', 'none'].includes(value)) {
        return m.reply(`❌ Untuk data lama, silakan set gender terlebih dahulu. Gunakan: *${usedPrefix}room edit gender <male|female|none>*`)
      }
      y.gender = value
      saveDB(wdb)
      return sendRpgMsg(conn, m, `✅ Gender room diubah ke *${value}*`, choicePic(value))
    }

    if (target === 'namayt' || target === 'name' || target === 'nama') {
      if (!value) return m.reply(`❌ Gunakan: *${usedPrefix}room edit namayt <nama baru>*`)
      y.name = normalizeName(value)
      saveDB(wdb)
      return m.reply(`✅ Nama channel room diubah jadi *${y.name}*`)
    }

    return m.reply(`❌ Target edit tidak dikenal. Pilih: *namayt/gender*`)
  }

  // room set gender convenience route: if old user has no gender, ask them to set
  if (!y.gender || y.gender === 'none') {
    if (sub !== 'set' && sub !== 'edit' && sub !== 'content' && sub !== 'create') {
      return m.reply(`❌ Silakan set gender terlebih dahulu untuk melanjutkan. Gunakan: *${usedPrefix}room edit gender <male|female|none>* atau *${usedPrefix}room set gender <male|female|none>*`)
    }
  }

  if (sub === 'content' || sub === 'kategori' || sub === 'type') {
    const what = args[1]
    if (!what || what === 'list') {
      let cap = `╭─❏「 🎬 CONTENT LIST 」❏\n`
      cap += `${contentListText(usedPrefix)}\n`
      cap += `╰─━━━━━━━━━━━━━━─`
      return sendRpgMsg(conn, m, cap, DEFAULT_YOUTUBE_IMAGE)
    }

    if (!contentMap[what]) {
      return m.reply(`❌ Jenis konten tidak dikenal. Gunakan: *${usedPrefix}room content list*`)
    }

    y.content = what
    saveDB(wdb)
    return m.reply(`✅ Konten room kamu diubah ke *${contentMap[what].label}*.`)
  }

  if (sub === 'upgrade') {
    if (!y.name) return m.reply(`❌ Kamu belum punya channel room. Buat dulu dengan *${usedPrefix}room create <nama>*`)

    const current = Math.max(0, Number(y.roomLevel || 0))
    const next = Math.min(5, current + 1)
    const cfg = upgradeSpecs[next - 1]
    if (!cfg) return m.reply('❌ Room sudah maksimal level 5.')

    const cost = cfg.cost
    if ((wdb.money?.[m.sender] || 0) < cost) {
      return m.reply(`❌ Uang tidak cukup. Buth: Rp ${cost.toLocaleString()}.`)
    }

    wdb.money[m.sender] -= cost
    y.roomLevel = next
    y.level = Math.max(y.level, next + 1)
    y.income = (y.income || 0) + Math.floor(cost * 0.08)
    saveDB(wdb)

let cap = `╭─❏「 ⬆️ ROOM UPGRADE 」❏\n`
cap += `│ ⬆️ *${y.name}*\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

cap += `📌 *DETAIL UPGRADE*\n`
cap += `> ↳ Upgrade ke : *Lv.${next}*\n`
cap += `> ↳ Biaya : -Rp ${cost.toLocaleString()}\n`
cap += `> ↳ Spec : ${cfg.spec}\n`
cap += `> ↳ Efek : income +${Math.round(cfg.bonus * 100)}%, view +${Math.round(cfg.bonus * 30)}%, popularity +${Math.round(cfg.bonus * 15)}%\n\n`

cap += `─━━━━━━━━━━━━━━─`

return sendRpgMsg(conn, m, cap, DEFAULT_YOUTUBE_IMAGE)
 }

  if (sub === 'live') {
    if (!y.name) return m.reply(`❌ Kamu belum punya channel room. Buat dulu dengan *${usedPrefix}room create <nama>*`)
    if (!y.gender || y.gender === 'none') return m.reply(`❌ Silakan set gender terlebih dahulu via *${usedPrefix}room set gender male|female|none*`)

    const content = contentMap[y.content] || contentMap.streamer
    const roomBoost = upgradeSpecs[Math.max(0, Math.min(4, Number(y.roomLevel || 0)))]?.bonus || 1
    const cd = 60000
    const now = Date.now()
    if (now - (y.lastLive || 0) < cd) {
      const sisa = Math.ceil((cd - (now - (y.lastLive || 0))) / 1000)
      return m.reply(`⏳ Live cooldown. Tunggu ${sisa} detik.`)
    }

    const viewers = Math.floor(100 + Math.random() * 5000 * roomBoost * content.reward)
    const likes = Math.floor(viewers * (0.08 + Math.random() * 0.22))
    const subs = Math.floor(viewers / 10)
    const payout = Math.floor(25000 + viewers * 120 * roomBoost * content.reward)

    y.views += viewers
    y.likes += likes
    y.subs += subs
    y.income += payout
    y.lastLive = now
    saveDB(wdb)

   let cap = `╭─❏「 📡 LIVE YTROOM 」❏\n`
cap += `│ 📡 *${y.name}*\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

cap += `📌 *DETAIL LIVE*\n`
cap += `> ↳ Konten : *${content.label}*\n`
cap += `> ↳ Viewers : +${viewers.toLocaleString()}\n`
cap += `> ↳ Likes : +${likes.toLocaleString()}\n`
cap += `> ↳ Subs : +${subs.toLocaleString()}\n`
cap += `> ↳ Gaji : +Rp ${payout.toLocaleString()}\n\n`

cap += `─━━━━━━━━━━━━━━─`

return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i198/PELeGje.jpg')
 }

  if (sub === 'collab' || sub === 'collabyt' || sub === 'collaboration') {
    if (!y.name) return m.reply(`❌ Kamu belum punya channel room. Buat dulu dengan *${usedPrefix}room create <nama>*`)
    if (!y.gender || y.gender === 'none') return m.reply(`❌ Silakan set gender terlebih dahulu via *${usedPrefix}room set gender male|female|none*`)

    const cd = 120000
    const now = Date.now()
    if (now - (y.lastCollab || 0) < cd) {
      const sisa = Math.ceil((cd - (now - (y.lastCollab || 0))) / 1000)
      return m.reply(`⏳ Collab cooldown. Tunggu ${sisa} detik.`)
    }

    const roomBoost = upgradeSpecs[Math.max(0, Math.min(4, Number(y.roomLevel || 0)))]?.bonus || 1
    const collabGain = Math.floor(35000 * roomBoost)
    const viewBoost = Math.floor(1500 * roomBoost)
    const subBoost = Math.floor(20 * roomBoost)

    y.lastCollab = now
    y.views += viewBoost
    y.subs += subBoost
    y.income += collabGain
    saveDB(wdb)

let cap = `╭─❏「 🤝 ROOM COLLAB 」❏\n`
cap += `│ 🤝 *${y.name}*\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

cap += `📌 *DETAIL COLLAB*\n`
cap += `> ↳ Partner : *Room Creator*\n`
cap += `> ↳ Views : +${viewBoost.toLocaleString()}\n`
cap += `> ↳ Subs : +${subBoost.toLocaleString()}\n`
cap += `> ↳ Pendapatan : +Rp ${collabGain.toLocaleString()}\n\n`

cap += `─━━━━━━━━━━━━━━─`

return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i106/p1Vn.jpg')
 }

  // owner display route
  if (sub === 'info' || sub === 'status' || sub === 'stats') {
    if (!y.name) return m.reply(`❌ Kamu belum punya channel room. Buat dulu dengan *${usedPrefix}room create <nama>*`)

    const content = contentMap[y.content] || contentMap.streamer
   let cap = `╭─❏「 📺 CHANNEL INFO 」❏\n`
cap += `│ 📺 *${y.name}*\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

cap += `📌 *CHANNEL INFO*\n`
cap += `> ↳ Gender : *${y.gender || 'none'}*\n`
cap += `> ↳ Content : *${content.label}*\n`
cap += `> ↳ Room Level : *Lv.${y.roomLevel || 0}*\n`
cap += `> ↳ Views : ${y.views?.toLocaleString() || 0}\n`
cap += `> ↳ Likes : ${y.likes?.toLocaleString() || 0}\n`
cap += `> ↳ Subs : ${y.subs?.toLocaleString() || 0}\n`
cap += `> ↳ Income : Rp ${(y.income || 0).toLocaleString()}\n\n`

cap += `─━━━━━━━━━━━━━━─`

return sendRpgMsg(conn, m, cap, pickGenderImage(y.gender || 'none'))  }

  // command aliases: ytr live, ytr collab, ytr info etc
  if (sub === 'live' || sub === 'collab' || sub === 'info' || sub === 'status' || sub === 'stats') {
    // already handled earlier; this branch is only for router symmetry
  }

  // route older command support: .ytr/youtuber/room as command only prefix, answer guide if unknown sub route.
  return m.reply(`❌ Subcommand tidak dikenal. Gunakan: *${usedPrefix}room create <nama>* / *${usedPrefix}room content list* / *${usedPrefix}room upgrade* / *${usedPrefix}room live* / *${usedPrefix}room collab*`)
}

handler.help = ['ytr', 'ytroom', 'youtuber', 'room', 'room create <nama>', 'room set gender <male|female|none>', 'room content list', 'room content <gaming|beauty|fashion|vlog|education>', 'room upgrade', 'room live', 'room collab', 'room info']
handler.tags = ['rpg']
handler.command = /^(ytr|ytroom|youtuber|room)$/i
handler.alias = ['ytr', 'ytroom', 'youtuber', 'room']
handler.group = true

export default handler
