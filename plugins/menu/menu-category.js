import fs from 'fs'
import { loadDB } from '../../lib/waifuHelper.js'
import { getGreeting, getMenuThumbnail } from '../../lib/style.js'

const toSmallNum = (str) => {
  const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
  return String(str).replace(/[0-9]/g, d => map[d] || d)
}

export const CATEGORY_MAP = {
  ai: {
    title: 'AI & CHATBOT MENU',
    tags: ['ai'],
    aliases: ['menuai', 'aimenu']
  },
  anime: {
    title: 'ANIME & MANGA MENU',
    tags: ['anime'],
    aliases: ['anime', 'menuanime', 'animemenu']
  },
  audio: {
    title: 'MANIPULASI AUDIO MENU',
    tags: ['audio'],
    aliases: ['audio', 'menuaudio', 'audiomenu']
  },
  csm: {
    title: 'CHAINSAW MAN RPG MENU',
    tags: ['csm'],
    aliases: ['csm', 'menucsm', 'csmmenu'],
    type: 'csm'
  },
  download: {
    title: 'DOWNLOADER MENU',
    tags: ['downloader'],
    aliases: ['download', 'downloader', 'menudownload', 'downloadmenu', 'menudownloader']
  },
  fun: {
    title: 'FITUR HIBURAN MENU',
    tags: ['fun'],
    aliases: ['fun', 'menufun', 'funmenu']
  },
  game: {
    title: 'MINI GAMES MENU',
    tags: ['game'],
    aliases: ['game', 'menugame', 'gamemenu']
  },
  arcade: {
    title: 'IN-BUBBLE ARCADE MENU',
    tags: ['arcade'],
    aliases: ['arcade', 'menuarcade', 'arcademenu', 'minigame', 'minigames']
  },
  group: {
    title: 'GROUP MANAGEMENT MENU',
    tags: ['group'],
    aliases: ['group', 'menugroup', 'groupmenu']
  },
  info: {
    title: 'INFORMASI BOT MENU',
    tags: ['info'],
    aliases: ['menuinfo', 'infomenu']
  },
  internet: {
    title: 'INTERNET & SEARCH MENU',
    tags: ['internet'],
    aliases: ['internet', 'menuinternet', 'internetmenu']
  },
  maker: {
    title: 'IMAGE MAKER MENU',
    tags: ['maker'],
    aliases: ['maker', 'menumaker', 'makermenu']
  },
  moneytrack: {
    title: 'CATATAN KEUANGAN MENU',
    tags: ['moneytrack'],
    aliases: ['moneytrack', 'menumoneytrack', 'moneytrackmenu']
  },
  owner: {
    title: 'OWNER ONLY MENU',
    tags: ['owner'],
    aliases: ['menuowner', 'ownermenu']
  },
  pasangan: {
    title: 'PASANGAN & ROMANSA MENU',
    tags: ['pasangan', 'romansa'],
    aliases: ['pasangan', 'menupasangan', 'pasanganmenu', 'romansa', 'menuromansa'],
    type: 'pasangan'
  },
  rpg: {
    title: 'RPG ADVENTURE MENU',
    tags: ['rpg'],
    aliases: ['rpg', 'menurpg', 'rpgmenu'],
    type: 'rpg'
  },
  search: {
    title: 'DATABASE SEARCH MENU',
    tags: ['search'],
    aliases: ['search', 'menusearch', 'searchmenu']
  },
  stalk: {
    title: 'STALKER SOSMED MENU',
    tags: ['stalk'],
    aliases: ['stalk', 'stalker', 'menustalk', 'stalkmenu', 'menustalker', 'stalkermenu']
  },
  sticker: {
    title: 'STICKER MAKER MENU',
    tags: ['sticker'],
    aliases: ['sticker', 'menusticker', 'stickermenu']
  },
  tools: {
    title: 'UTILITY TOOLS MENU',
    tags: ['tools'],
    aliases: ['tools', 'menutools', 'toolsmenu']
  },
  thanksto: {
    title: 'THANKS TO & DONATUR',
    tags: ['thanksto'],
    aliases: ['thanksto', 'tqto', 'credits', 'menutqto', 'menuthanksto']
  }
}

function resolveCategory(command, text) {
  const cleanCmd = (command || '').toLowerCase().trim()
  const cleanArg = (text || '').toLowerCase().trim().split(' ')[0]

  // Cek command langsung ke aliases
  for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
    if (cat.aliases.includes(cleanCmd)) return { key, ...cat }
  }

  // Jika command adalah generic category trigger
  if (['menucat', 'menukategori', 'catmenu', 'categorymenu'].includes(cleanCmd) && cleanArg) {
    for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
      if (key === cleanArg || cat.aliases.includes(cleanArg) || cat.aliases.includes('menu' + cleanArg)) {
        return { key, ...cat }
      }
    }
  }

  // Cek jika command berawalan "menu" atau berakhiran "menu"
  let stripped = cleanCmd.replace(/^menu/, '').replace(/menu$/, '')
  if (stripped) {
    for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
      if (key === stripped || cat.aliases.includes(stripped) || cat.tags.includes(stripped)) {
        return { key, ...cat }
      }
    }
  }

  return null
}

let handler = async (m, { conn, usedPrefix: _p, command, text }) => {
  let targetCategory = resolveCategory(command, text)
  if (!targetCategory) {
    // Jika kategori tidak dikenali, arahkan ke menu utama
    return conn.reply(m.chat, `*╭  〔 ⚠ ᴋ ᴀ ᴛ ᴇ ɢ ᴏ ʀ ɪ  ᴛ ɪ ᴅ ᴀ ᴋ  ᴅ ɪ ᴛ ᴇ ᴍ ᴜ ᴋ ᴀ ɴ 〕*\n> Ketik *${_p}menu* untuk memilih kategori yang tersedia.\n*╰───────────────*`, m)
  }

  let name = m.pushName || await conn.getName(m.sender) || 'User'
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

  let user = global.db.data.users[m.sender] || {}
  const wdb = loadDB()
  const uang = wdb.money?.[m.sender] || 0
  let { limit = 0, role = 'User', premiumTime = 0 } = user
  let prems = premiumTime > 0 ? 'ᴘʀᴇᴍɪᴜᴍ Ⓟ' : 'ꜰʀᴇᴇ Ⓛ'
  let greeting = getGreeting(name, d.getHours())

  let header = `*──  ୨୧ ✧ ${targetCategory.title} ✧ ୨୧  ──*

> *こんにちわ!* (ʜᴇʟʟᴏ!)
> ${greetingWaktu} *${name}* ♡
> ${greeting}`

  let userCard = `*╭  〔 𝜚 ᴜ ꜱ ᴇ ʀ 〕*
*┆* ⟡ ɴᴀᴍᴀ     : *${name}*
*┆* ✧ ʀᴏʟᴇ     : *${role} ㋡*
*┆* ✦ ꜱᴛᴀᴛᴜꜱ   : *${prems}*
*┆* ⌬ ʟɪᴍɪᴛ    : *${toSmallNum(limit)}*
*┆* ❖ ꜱᴀʟᴅᴏ    : *Rp ${toSmallNum(uang.toLocaleString('id-ID'))}*
*╰───────────────*`

  let aboutCard = `*╭  〔 ⏱ ᴡ ᴀ ᴋ ᴛ ᴜ 〕*
*┆* ⟡ ʜᴀʀɪ    : *${hari}*
*┆* ◈ ᴛᴀɴɢɢᴀʟ : *${toSmallNum(tanggal)}*
*┆* ✧ ᴊᴀᴍ     : *${toSmallNum(jam)} ᴡɪʙ*
*╰───────────────*`

  let extraCard = ''
  let commandCards = []
  let notesBlock = ''

  // Penanganan tipe khusus
  if (targetCategory.type === 'csm') {
    let userCSM = wdb.users?.[m.sender]?.rpg?.csm
    if (userCSM?.started) {
      extraCard = `*╭  〔 ✦ ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ  ᴄ ꜱ ᴍ  ʜ ᴜ ɴ ᴛ ᴇ ʀ 〕*
*┆* ⟡ ɴɪᴄᴋɴᴀᴍᴇ      : *${userCSM.nickname || '-'}*
*┆* ✧ ʟᴇᴠᴇʟ         : *${toSmallNum(userCSM.level || 1)} [${userCSM.title || 'Applicant'}]*
*┆* ✦ ʜᴘ            : *${toSmallNum(userCSM.health || 100)}/${toSmallNum(userCSM.maxHealth || 100)}*
*┆* ⌬ ʙʟᴏᴏᴅ         : *${toSmallNum((userCSM.blood || 0).toLocaleString('id-ID'))}*
*┆* ❖ ᴋᴏɴᴛʀᴀᴋ       : *${userCSM.devilContract || 'None'}*
*┆* 𝜚 ᴘᴀʀᴛɴᴇʀ ᴀᴋᴛɪꜰ : *${toSmallNum(userCSM.partners?.filter(p => p.status === 'active')?.length || 0)}/𝟻*
*╰───────────────*`
    }
  } else if (targetCategory.type === 'rpg') {
    let userRPG = wdb.users?.[m.sender]?.rpg
    if (userRPG?.penjara && Date.now() - userRPG.penjara < userRPG.lamaPenjara) {
      let sisa = userRPG.lamaPenjara - (Date.now() - userRPG.penjara)
      let jamSisa = Math.floor(sisa / 3600000)
      let menitSisa = Math.floor((sisa % 3600000) / 60000)
      extraCard = `*╭  〔 ⚠ ᴋ ᴀ ᴍ ᴜ  ᴅ ɪ  ᴘ ᴇ ɴ ᴊ ᴀ ʀ ᴀ 〕*
*┆* ⟡ ꜱᴇʟ         : *${toSmallNum(userRPG.sel || 1)}*
*┆* ⧗ ꜱɪꜱᴀ ᴡᴀᴋᴛᴜ  : *${toSmallNum(jamSisa)}j ${toSmallNum(menitSisa)}m*
*┆* ❖ ᴛᴇʙᴜꜱᴀɴ     : *Rp ${toSmallNum((userRPG.tebusan || 1000000).toLocaleString('id-ID'))}*
*╰───────────────*
> _Semua command RPG diblokir. Minta teman *.tebus @kamu* atau tunggu bebas._`
    }
  }

  let mentionsData = [m.sender]

  if (targetCategory.key === 'thanksto') {
    let customThanks = global.db.data.thanks || []
    let contribLines = `*┆* ❖ *Nenel* : _Developer / Owner_\n*┆* ✦ *Eza* : _Asisten / Co-Owner_`
    if (customThanks.length > 0) {
      let extraLines = customThanks.map(t => `*┆* ⟡ *${t.name}* : _${t.role}_`).join('\n')
      contribLines += `\n${extraLines}`
    }
    let contribCard = `*╭  〔 ❖ ᴋ ᴏ ɴ ᴛ ʀ ɪ ʙ ᴜ ᴛ ᴏ ʀ 〕*\n${contribLines}\n*╰───────────────*`

    let allUsers = global.db.data.users || {}
    let settings = (global.db.data.settings && global.db.data.settings[conn.user.jid]) || {}
    let sortedDonors = Object.entries(allUsers)
      .filter(([_, data]) => data.totalDonasi && data.totalDonasi > 0)
      .sort((a, b) => b[1].totalDonasi - a[1].totalDonasi)
      .slice(0, 15)

    let totalGlobal = settings.totalDonasi || sortedDonors.reduce((acc, curr) => acc + (curr[1].totalDonasi || 0), 0)

    let donorLines = ''
    if (sortedDonors.length === 0) {
      donorLines = `*┆* _Belum ada donatur terdaftar saat ini._\n*┆* _Ketik *${_p}donasi* untuk mendukung server!_`
    } else {
      donorLines = sortedDonors.map(([jid, data], i) => {
        const badge = i === 0 ? '❖' : i === 1 ? '✮' : i === 2 ? '✦' : '◈'
        const numStr = toSmallNum(i + 1)
        let nameDisplay = ''
        if (data.namaDonasi) {
          nameDisplay = `*${data.namaDonasi}*`
        } else {
          nameDisplay = `@${jid.split('@')[0]}`
          mentionsData.push(jid)
        }
        const nominalStr = toSmallNum(data.totalDonasi.toLocaleString('id-ID'))
        return `*┆* ${badge} [${numStr}] ${nameDisplay} : *Rp ${nominalStr}*`
      }).join('\n')
    }

    let donorCard = `*╭  〔 ᰔ ᴘ ᴀ ᴘ ᴀ ɴ  ᴅ ᴏ ɴ ᴀ ᴛ ᴜ ʀ 〕*\n*┆* ⌬ ᴛᴏᴛᴀʟ ᴅᴏɴᴀꜱɪ : *Rp ${toSmallNum(totalGlobal.toLocaleString('id-ID'))}*\n*┆* ──────────────────\n${donorLines}\n*╰───────────────*`

    let guideCard = `*╭  〔 ⌬ ᴘ ᴀ ɴ ᴅ ᴜ ᴀ ɴ  ᴅ ᴏ ɴ ᴀ ꜱ ɪ 〕*\n*┆* ⟡ *1.* *${_p}donasi* untuk scan QRIS / transfer\n*┆* ✧ *2.* Kirim bukti transfer dengan: \n*┆* ${_p}konfirmasidonasi <nominal> | <nama>\n*┆* ✦ *3.* Namamu akan otomatis tercatat\n*┆* di Papan Donatur ini\n*╰───────────────*`

    let cmdCard = `*╭  〔 ✦ ᴘ ᴇ ʀ ɪ ɴ ᴛ ᴀ ʜ  ᴛ ᴇ ʀ ᴋ ᴀ ɪ ᴛ 〕*\n*┆* ⟡ ${_p}donasi\n*┆* ✧ ${_p}topdonasi\n*┆* ✦ ${_p}konfirmasidonasi <nominal> | <nama>\n*┆* ◈ ${_p}setnamadonasi <nama_samaran>\n*┆* ❖ ${_p}thanksto\n*╰───────────────*`

    commandCards.push(contribCard, donorCard, guideCard, cmdCard)

    header = `*──  ୨୧ ✧ ᴛʜᴀɴᴋꜱ ᴛᴏ & ᴅᴏɴᴀᴛᴜʀ ✧ ୨୧  ──*

> *おしらせ!* (ꜱᴘᴇᴄɪᴀʟ ᴛʜᴀɴᴋꜱ!)
> ${greetingWaktu} *${name}* ♡
> _Apresiasi setulus hati kepada para developer, asisten, kontributor, dan para donatur terhormat yang mendukung keberlangsungan server ${global.namebot}._`

    userCard = ''
    aboutCard = ''
    notesBlock = `> ｡˚ ⊹ *ꜱᴀʟᴜʀᴋᴀɴ ᴅᴜᴋᴜɴɢᴀɴ ᴀɴᴅᴀ ᴍᴇʟᴀʟᴜɪ ᴛᴏᴍʙᴏʟ ᴅᴏɴᴀꜱɪ ᴅɪ ʙᴀᴡᴀʜ* ⊹ ˚ ｡\n> _Terima kasih atas segala bentuk kontribusi dan kebaikanmu_ ♡`
  } else if (targetCategory.key === 'arcade') {
    let arcadeKatalog = `*╭  〔 ❖ ᴋ ᴀ ᴛ ᴀ ʟ ᴏ ɢ  ɪ ɴ - ʙ ᴜ ʙ ʙ ʟ ᴇ  ᴀ ʀ ᴄ ᴀ ᴅ ᴇ 〕*
*┆* ⟡ *Geometry Dash Mini* : \`${_p}gd\`
*┆*   _Arkade ritme cepat & lompat rintangan_
*┆* ✧ *Block Blast Mini* : \`${_p}blockblast\`
*┆*   _Teka-teki susun blok 8x8 santai & taktis_
*┆* ✦ *Tetris Retro Mini* : \`${_p}tetris\`
*┆*   _Klasik susun balok dengan tombol sentuh_
*┆* ◈ *Star Arena Mabar* : \`${_p}mabar\`
*┆*   _Pertarungan real-time multipemain PieSocket_
*┆* ❖ *Catur Interaktif* : \`${_p}chess html\`
*┆*   _Papan catur digital in-bubble & web_
*╰───────────────*`

    let arcadeTools = `*╭  〔 ⚙ ᴀ ʟ ᴀ ᴛ  ᴅ ɪ ᴀ ɢ ɴ ᴏ ꜱ ᴛ ɪ ᴋ 〕*
*┆* ⟡ *WebSocket Inspector* : \`${_p}debugws\`
*┆* ✧ *AI Rich Proto Tester* : \`${_p}tesproto\`
*╰───────────────*`

    commandCards.push(arcadeKatalog, arcadeTools)
    notesBlock = `> ｡˚ ⊹ *ᴋᴇᴛᴜᴋ ᴘᴇʀɪɴᴛᴀʜ ᴅɪ ᴀᴛᴀꜱ ᴜɴᴛᴜᴋ ᴍᴀɪɴ ʟᴀɴɢꜱᴜɴɢ ᴅɪ ᴡʜᴀᴛꜱᴀᴘᴘ* ⊹ ˚ ｡\n> _Semua game berjalan di dalam gelembung obrolan tanpa instal aplikasi._`
  } else if (targetCategory.type === 'pasangan') {
    let pasanganFeatures = Object.values(global.plugins)
      .filter(p => !p.disabled && p.tags && p.tags.includes('pasangan'))
      .flatMap(p => (Array.isArray(p.help) ? p.help : [p.help]).map(cmd => ({
        cmd: p.prefix ? cmd : _p + cmd,
        limit: p.limit,
        premium: p.premium
      })))
      .sort((a, b) => a.cmd.localeCompare(b.cmd))
      .map(v => `*┆* ⟡ ${v.cmd} ${v.premium ? 'Ⓟ' : ''}${v.limit ? 'Ⓛ' : ''}`)
      .join('\n') || `*┆* ⟡ _Tidak ada perintah tersedia_`

    let romansaFeatures = Object.values(global.plugins)
      .filter(p => !p.disabled && p.tags && p.tags.includes('romansa'))
      .flatMap(p => (Array.isArray(p.help) ? p.help : [p.help]).map(cmd => ({
        cmd: p.prefix ? cmd : _p + cmd,
        limit: p.limit,
        premium: p.premium
      })))
      .sort((a, b) => a.cmd.localeCompare(b.cmd))
      .map(v => `*┆* ⟡ ${v.cmd} ${v.premium ? 'Ⓟ' : ''}${v.limit ? 'Ⓛ' : ''}`)
      .join('\n') || `*┆* ⟡ _Tidak ada perintah tersedia_`

    commandCards.push(`*╭  〔 ᰔ ꜰ ɪ ᴛ ᴜ ʀ  ᴘ ᴀ ꜱ ᴀ ɴ ɢ ᴀ ɴ 〕*\n${pasanganFeatures}\n*╰───────────────*`)
    commandCards.push(`*╭  〔 𝜚 ꜰ ɪ ᴛ ᴜ ʀ  ʀ ᴏ ᴍ ᴀ ɴ ꜱ ᴀ 〕*\n${romansaFeatures}\n*╰───────────────*`)
  } else {
    let features = Object.values(global.plugins)
      .filter(p => !p.disabled && p.tags && targetCategory.tags.some(t => p.tags.includes(t)))
      .flatMap(p => (Array.isArray(p.help) ? p.help : [p.help]).map(cmd => ({
        cmd: p.prefix ? cmd : _p + cmd,
        limit: p.limit,
        premium: p.premium
      })))
      .sort((a, b) => a.cmd.localeCompare(b.cmd))
      .map(v => `*┆* ⟡ ${v.cmd} ${v.premium ? 'Ⓟ' : ''}${v.limit ? 'Ⓛ' : ''}`)
      .join('\n')

    if (!features) features = `*┆* ⟡ _Tidak ada perintah tersedia_`
    commandCards.push(`*╭  〔 ✦ ᴅ ᴀ ꜰ ᴛ ᴀ ʀ  ᴘ ᴇ ʀ ɪ ɴ ᴛ ᴀ ʜ 〕*\n${features}\n*╰───────────────*`)
  }

  if (!notesBlock) {
    notesBlock = `> Ⓟ = ᴘʀᴇᴍɪᴜᴍ   •   Ⓛ = ʟɪᴍɪᴛ
> ｡˚ ⊹ *ᴛᴀᴘ ᴛᴏᴍʙᴏʟ ᴅɪ ʙᴀᴡᴀʜ ᴜɴᴛᴜᴋ ᴘɪʟɪʜ ᴋᴀᴛᴇɢᴏʀɪ* ⊹ ˚ ｡
> _Terima kasih sudah menggunakan ${global.namebot}_`
  }

  let caption = [header, extraCard, userCard, aboutCard, ...commandCards, notesBlock].filter(Boolean).join('\n\n')
  let footer = `${global.namebot} • Versi ${toSmallNum(global.versi || '4.0.0')}`

  let videoMenu = null
  try {
    const listMenu = JSON.parse(fs.readFileSync('./media/menu.json'))
    videoMenu = listMenu[Math.floor(Math.random() * listMenu.length)]
  } catch { videoMenu = null }

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

  let contextInfo = {
    forwardingScore: 999,
    isForwarded: true,
    mentionedJid: Array.from(new Set(mentionsData)),
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
      btn.setTitle(`✦ ${targetCategory.title}`)
      btn.setSubtitle(`${global.namebot} • ᴋᴀᴛᴇɢᴏʀɪ ᴍᴇɴᴜ`)
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
      console.error('[ButtonV2 menu-category.js error]:', errBtnV2?.message || errBtnV2)
      sent = false
    }
  }

  if (!sent) {
    if (menuThumb) {
      await conn.sendMessage(m.chat, {
        image: menuThumb,
        caption,
        footer,
        mentions: [m.sender],
        contextInfo
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        text: caption,
        footer,
        mentions: [m.sender],
        contextInfo
      }, { quoted: m })
    }
  }
}

const allAliases = Object.values(CATEGORY_MAP).flatMap(c => c.aliases)
const uniqueAliases = [...new Set(allAliases), 'menucat', 'menukategori', 'catmenu', 'categorymenu']

handler.command = new RegExp(`^(${uniqueAliases.join('|')})$`, 'i')
handler.help = uniqueAliases.filter(cmd => cmd.startsWith('menu'))
handler.tags = ['main']

export default handler
