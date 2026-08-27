import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'
import {
  DEVIL_LIST, CHARACTER_LIST, WEAPON_LIST, ITEM_LIST, STORY_LIST,
  MAIN_LOCATION_LIST, SIDE_LOCATION_LIST, MAIN_JOB_LIST, SIDE_JOB_LIST,
  BOSS_LIST, ACHIEVEMENT_LIST, calcBonus, getTitle, getTitleBackstory, bar,
  calcSetBonus, checkAchievements, CONTRACT_PRICE, getContractMeta,
  EVENT_LIST, COMMAND_SECTIONS, TITLE_LIST, BUFF_LIST,
  CSM_PICTURES, EXCLUSIVE_PICTURES, PARTNER_PICTURES, GALLERY_PICTURES
} from '../../lib/rpg-libmyCSM.js'

const pickNamedPicture = pictures => {
  const [name, picture] = pictures[Math.floor(Math.random() * pictures.length)]
  return { name, picture }
}

const pickPicture = pictures => Array.isArray(pictures)
  ? pictures[Math.floor(Math.random() * pictures.length)]
  : pictures

const getCommandCount = () => new Set([
  ...COMMAND_SECTIONS.flatMap(section => section.commands.map(([command]) => command)),
  ...EVENT_LIST.map(event => event.command.replace(/^\.csm\s*/, ''))
]).size

const CSM_CONTENT_TOTALS = {
  contractScenes: 20,
  exploreStories: 50,
  missionStories: 50,
  rescueStories: 50,
  rescueResults: 20
}

const RAID_RANK_WEIGHTS = { E: 1, D: 2, C: 4, B: 7, A: 12, S: 22, SS: 35, SSS: 50 }
const pickRaidDevil = () => {
  const pool = DEVIL_LIST.filter(devil => devil.tipe === 'Devil')
  const totalWeight = pool.reduce((total, devil) => total + (RAID_RANK_WEIGHTS[devil.rank] || 1), 0)
  let roll = Math.random() * totalWeight
  return pool.find(devil => (roll -= RAID_RANK_WEIGHTS[devil.rank] || 1) <= 0) || pool[pool.length - 1]
}

const JOB_WORK_STORIES = {
  'Public Safety Devil Hunter': ['Briefing darurat masuk dari HQ.', 'Kamu menyisir TKP sebelum warga dievakuasi.', 'Laporan serangan Devil harus selesai sebelum malam.', 'Regu kamu menjaga perimeter markas.', 'Kamu mengawal barang bukti ke laboratorium.', 'Sirene memanggilmu ke distrik berikutnya.', 'Kamu memeriksa kontrak lama yang disita.', 'Satu regu baru meminta bantuanmu.', 'Kamu membersihkan sisa-sisa pertempuran.', 'HQ mencatat operasi hari ini berhasil.'],
  'Private Devil Hunter': ['Klien anonim mengirim alamat sebuah gudang.', 'Kamu menawar bayaran sebelum menerima pekerjaan.', 'Jejak darah membawa kamu ke gang sempit.', 'Kamu menjaga toko dari Devil kecil.', 'Seorang keluarga meminta pencarian orang hilang.', 'Kamu menjual laporan ke pemburu lain.', 'Peralatanmu diperiksa sebelum berangkat.', 'Kamu mengikuti suara aneh dari atap.', 'Kontrak singkat selesai tanpa korban.', 'Nama kamu mulai dikenal di pasar swasta.'],
  'Devil Hunter High School Student': ['Klub sekolah mengadakan patroli sore.', 'Guru meminta laporan tentang suara dari gudang.', 'Kamu mengamankan ruang klub sebelum pulang.', 'Teman sekelas menemukan jejak aneh di lorong.', 'Latihan klub berubah menjadi misi sungguhan.', 'Kamu menyembunyikan senjata sebelum pelajaran dimulai.', 'Rapat klub membahas Devil di sekitar sekolah.', 'Kamu menolong siswa yang tersesat di gedung lama.', 'Papan pengumuman memuat peringatan baru.', 'Bel pulang berbunyi setelah tugas selesai.'],
  'Yakuza / Mafia Member': ['Bos mengirim kamu menagih utang di distrik bawah.', 'Kamu menjaga transaksi organ Devil.', 'Gudang sindikat perlu dibersihkan malam ini.', 'Seseorang membocorkan rute pengiriman.', 'Kamu mengawal barang berbahaya melewati kota.', 'Anak buah baru meminta arahan.', 'Kamu menyelesaikan perselisihan antar kelompok.', 'Peti kontrak ilegal tiba di pelabuhan.', 'Bos menilai hasil kerja kamu malam ini.', 'Nama sindikat tetap aman berkat tindakanmu.'],
  'International Assassin': ['Kontak asing memberimu foto target.', 'Kamu mengganti identitas sebelum memasuki Tokyo.', 'Hotel menjadi titik temu yang terlalu sunyi.', 'Target berpindah lewat jalur bawah tanah.', 'Kamu memeriksa senjata dan rute pelarian.', 'Seseorang membuntuti kamu sejak stasiun.', 'Bayaran dikirim melalui rekening rahasia.', 'Kamu menyamar sebagai pekerja lokal.', 'Kontrak selesai sebelum polisi tiba.', 'Kamu menghilang dari peta kota.'],
  'Government Agent': ['Rapat rahasia membahas ancaman tingkat tinggi.', 'Kamu menandatangani izin evakuasi satu distrik.', 'Berkas kontrak Devil masuk ke meja kamu.', 'Kamu menghubungi pasukan cadangan.', 'Saksi penting dipindahkan ke lokasi aman.', 'Kamu menyaring laporan yang dirahasiakan.', 'Keputusan politik menentukan nasib para Hunter.', 'Kamu mengamankan dokumen dari markas lama.', 'Perintah baru datang dari kementerian.', 'Krisis hari ini masuk ke arsip negara.'],
  'Chainsaw Man Church Leader': ['Jemaat berkumpul mendengar pidato malam.', 'Kamu membagikan selebaran di pusat kota.', 'Rapat rahasia membahas kemunculan Chainsaw Man.', 'Sumbangan darah masuk ke gudang gereja.', 'Pengikut baru meminta tanda kepercayaan.', 'Kamu mengatur penjagaan di sekitar gereja.', 'Pesan propaganda disebarkan ke sekolah.', 'Seorang saksi membawa kabar dari markas Public Safety.', 'Kamu menenangkan massa setelah serangan Devil.', 'Rencana gereja bergerak ke tahap berikutnya.'],
  'Fiend / Hybrid Combatant': ['Naluri Devil membawamu ke bau darah.', 'Kamu menguji batas tubuh inangmu.', 'Senjata tubuhmu harus dikendalikan di tengah kota.', 'Regu lain meminta bantuan tempur.', 'Kamu memulihkan diri sebelum patroli berikutnya.', 'Kontrak lama berbisik dari dalam tubuhmu.', 'Kamu mengejar Devil yang kabur dari laboratorium.', 'Warga panik saat melihat wujudmu.', 'Pertarungan singkat meninggalkan bekas di jalan.', 'Kamu kembali sebelum naluri mengambil alih.']
}

const ERASURE_BACKSTORIES = {
  makima: '👁️ Rantai kendali Makima mengikat pilihanmu. Setiap perintahnya terdengar seperti suara dari dalam kepalamu.',
  yoru: '⚔️ Yoru menandai namamu sebagai miliknya. Perang menjadikan setiap luka dan senjata bagian dari kekuatanmu.',
  fami: '🍽️ Fami mencatatmu sebagai persediaan hidup. Kelaparan menjadi alasanmu untuk tetap berjalan melewati bencana.',
  nayuta: '🐕 Nayuta mengikatmu dengan janji rumah dan perlindungan. Kamu dipanggil pulang, tetapi tidak pernah benar-benar bebas.',
  death: '💀 Death Devil menuliskan namamu di antara jiwa yang tersesat. Kematian akan selalu mengenalmu.'
}

const normalizeCsmAction = (value) => {
  const aliasMap = {
    kontrak: 'contract',
    contrack: 'contract',
    'kontrak-trial': 'contract',
    'kontrak-deal': 'contract',
    'kontrak trial': 'contract',
    'kontrak deal': 'contract',
    'contract trial': 'contract',
    'contract deal': 'contract',
    'makima-call': 'makimacall',
    'makimacall': 'makimacall',
    'makima call': 'makimacall',
    'blood-convert': 'blood',
    'bloodconvert': 'blood',
    'team': 'partner',
    'cd' : 'cooldown',
    'berhenti': 'cancel',
    accept: 'terima',
    reject: 'tolak',
    gacha: 'contract',
    yes: 'yes',
    no: 'no',
    terima: 'terima',
    tolak: 'tolak'
  }
  return aliasMap[String(value || '').toLowerCase()] || String(value || '').toLowerCase()
}

function getJobData(csm, jobName) {
  if (!csm.jobs) csm.jobs = {}
  if (!csm.jobs[jobName]) csm.jobs[jobName] = { level: 1, exp: 0 }
  return csm.jobs[jobName]
}

function addJobExp(csm, jobName, exp) {
  let jobData = getJobData(csm, jobName)
  jobData.exp += exp
  let leveled = false

  while (true) {
    let expButuh = Math.floor(100 * Math.pow(jobData.level, 1.5)) // 100, 282, 519, 800...
    if (jobData.exp >= expButuh) {
      jobData.exp -= expButuh
      jobData.level++
      leveled = true
    } else break
  }
  return { leveled, level: jobData.level }
}

function getJobDesc(jobName) {
  let all = [...MAIN_JOB_LIST,...SIDE_JOB_LIST]
  let f = all.find(j => j.job === jobName)
  return f ? f.desc : 'Deskripsi tidak ditemukan.'
}
let handler = async (message, { conn, text, usedPrefix, command }) => {
  const m = Object.create(message)
  const wdb = loadDB()
  const normalizeMessage = message => typeof message === 'string'
    ? message.replace(/^[|>]\s?/gm, '') + `\n\n`
    : message
  const originalReply = message.reply.bind(message)
  Object.defineProperty(m, 'reply', {
    value: replyMessage => originalReply(normalizeMessage(replyMessage)),
    writable: true,
    configurable: true
  })
  const headerUnavailable = commandName => `╭──「 PERINTAH TERKUNCI 」──╮\n│ ${commandName}\n━━━━━━━━━━━\n\nPerintah ini tidak tersedia untuk akunmu.\nGunakan *.csm command* untuk melihat daftar perintah yang bisa digunakan.\n━━━━━━━━━━━`

  const resolveJid = (jid) => {
    if (!jid) return jid
    if (jid.endsWith('@lid')) {
      return global.lids?.[jid] ||
             global.db?.data?.lids?.[jid] ||
             (wdb?.lids && wdb.lids[jid]) ||
             jid
    }
    return jid
  }

  const senderJid = resolveJid(m.sender)
  const ownerList = Array.isArray(global.owner) ? global.owner : []
  const ownerNumbers = ownerList.flatMap(owner => Array.isArray(owner) ? owner[0] : owner)
    .map(owner => String(owner).replace(/\D/g, ''))
    .filter(Boolean)
  const senderNumber = String(m.sender || '').replace(/\D/g, '')
  const isPrivileged = Boolean(m.isOwner || m.isROwner || m.fromMe || ownerNumbers.includes(senderNumber) || ownerNumbers.includes(String(senderJid || '').replace(/\D/g, '')))

  const rawArgs = text ? text.trim().split(/\s+/) : []
  const rawAction = (rawArgs[0] || '').toLowerCase()
  if (rawAction === 'panel') {
    if (!isPrivileged) return m.reply(headerUnavailable('PANEL'))

    const panelHeader = title => `╭──「 CSM ADMIN PANEL 」──╮\n│ ${title}\n━━━━━━━━━━━\n\n`
    const panelArgs = rawArgs.slice(1)
    const panelTargetInput = panelArgs.find(arg => arg.startsWith('@')) || (m.quoted && m.quoted.sender) || (panelArgs.find(arg => /^\d{7,}$/.test(arg)) ? `${panelArgs.find(arg => /^\d{7,}$/.test(arg))}@s.whatsapp.net` : m.sender)
    const findUserKey = input => {
      if (!input) return null
      const resolved = resolveJid(input)
      if (wdb.users[resolved]) return resolved
      if (wdb.users[input]) return input
      return Object.keys(wdb.users).find(key => resolveJid(key) === resolved) || null
    }
    const targetKey = findUserKey(panelTargetInput)
    const targetRecord = targetKey ? wdb.users[targetKey] : null
    const targetRPG = targetRecord?.rpg
    const targetCSM = targetRPG?.csm
    const targetName = targetKey ? (conn.getName(targetKey) || targetKey.split('@')[0]) : 'tidak ditemukan'
    const help = panelHeader('COMMAND ADMIN') +
      `Panel ini hanya dapat digunakan owner/admin.\n\n` +
      `> .csm panel list\n` +
      `> .csm panel view @user\n` +
      `> .csm panel fix @user\n` +
      `> .csm panel add <blood|health|maxhealth|exp|level|resetcount|story> <jumlah> @user\n` +
      `> .csm panel del <blood|health|maxhealth|exp|level|resetcount|story> <jumlah> @user\n` +
      `> .csm panel set <field> <nilai> @user\n` +
      `> .csm panel reset @user confirm\n` +
      `> .csm panel reset <field> @user confirm\n` +
      `> .csm panel contract set <nama> @user\n` +
      `> .csm panel contract clear @user\n` +
      `> .csm panel buff list @user\n` +
      `> .csm panel buff clear <id> @user\n` +
      `> .csm panel event list\n` +
      `> .csm panel event clear <erasure|makimacall> @user\n` +
      `> .csm panel raid force @user\n` +
      `> .csm panel raid unforce @user\n` +
      `> .csm panel partner add <nama> @user\n` +
      `> .csm panel partner del <nama> @user\n` +
      `> .csm panel partner set <nama> <level|love|needlove|hp|status> <nilai> @user\n` +
      `> .csm panel about setdev <nomor>\n` +
      `> .csm panel about setsup <nama/nomor>\n` +
      `> .csm panel picture enable/disable\n` +
      `━━━━━━━━━━━`

    if (!panelArgs.length || ['list', 'help', 'commands'].includes(panelArgs[0].toLowerCase())) return m.reply(help)
    if (panelArgs[0].toLowerCase() === 'event' && panelArgs[1]?.toLowerCase() === 'list') {
      return m.reply(panelHeader('EVENT CSM') + EVENT_LIST.map((event, index) => `${index + 1}. ${event.name} - ${event.command}`).join('\n') + `\n━━━━━━━━━━━\nGunakan perintah di atas untuk melihat detail event.`)
    }
    if (panelArgs[0].toLowerCase() === 'about') {
      if (!wdb.csmAbout || typeof wdb.csmAbout !== 'object') wdb.csmAbout = {}
      const aboutAction = panelArgs[1]?.toLowerCase()
      const aboutValue = panelArgs.slice(2).join(' ').trim()
      if (aboutAction === 'setdev') {
        const developerNumber = aboutValue.replace(/\D/g, '')
        if (!developerNumber) return m.reply(panelHeader('FORMAT SALAH') + `Gunakan *.csm panel about setdev <nomor>*\n━━━━━━━━━━━`)
        wdb.csmAbout.developer = developerNumber
        saveDB(wdb)
        return m.reply(panelHeader('DEVELOPER ABOUT DIUBAH') + `👤 @${developerNumber}\n━━━━━━━━━━━`)
      }
      if (aboutAction === 'setsup') {
        if (!aboutValue) return m.reply(panelHeader('FORMAT SALAH') + `Gunakan *.csm panel about setsup <nama/nomor>*\n━━━━━━━━━━━`)
        wdb.csmAbout.supported = aboutValue
        saveDB(wdb)
        return m.reply(panelHeader('SUPPORT ABOUT DIUBAH') + `🤝 ${aboutValue}\n━━━━━━━━━━━`)
      }
      return m.reply(panelHeader('ABOUT PANEL') + `Gunakan:\n> .csm panel about setdev <nomor>\n> .csm panel about setsup <nama/nomor>\n━━━━━━━━━━━`)
    }
    if (panelArgs[0].toLowerCase() === 'picture') {
      const pictureAction = panelArgs[1]?.toLowerCase()
      if (!['enable', 'disable'].includes(pictureAction)) return m.reply(panelHeader('PICTURE PANEL') + `Gunakan:\n> .csm panel picture enable\n> .csm panel picture disable\n━━━━━━━━━━━`)
      wdb.csmPicturesEnabled = pictureAction === 'enable'
      saveDB(wdb)
      return m.reply(panelHeader('CSM PICTURE DIUBAH') + `${pictureAction === 'enable' ? '✅ Pengiriman gambar diaktifkan.' : '🚫 Pengiriman gambar dinonaktifkan.'}\n━━━━━━━━━━━`)
    }
    if (!targetRecord || !targetRPG) return m.reply(panelHeader('TARGET TIDAK DITEMUKAN') + `Data RPG target tidak ditemukan.\n━━━━━━━━━━━`)

    const panelCommand = panelArgs[0].toLowerCase()
    const numericFields = new Set(['blood', 'health', 'maxhealth', 'level', 'exp', 'resetcount', 'story'])
    const getNumericValue = field => Number(targetCSM?.[field] || 0)
    const setNumericValue = (field, value) => {
      targetCSM[field] = value
    }

    if (['add', 'del'].includes(panelCommand)) {
      const field = panelArgs[1]?.toLowerCase()
      const amount = Number(panelArgs[2])
      if (!numericFields.has(field) || !Number.isFinite(amount) || amount < 0 || !targetCSM) return m.reply(panelHeader('FORMAT SALAH') + `Resource atau jumlah tidak valid.\n${help}`)
      const nextValue = getNumericValue(field) + (panelCommand === 'add' ? amount : -amount)
      setNumericValue(field, Math.max(0, Math.floor(nextValue)))
      if (field === 'level') {
        targetCSM.title = getTitle(targetCSM.level)
        targetCSM.maxHealth = Math.max(100, 100 + (targetCSM.level - 1) * 25)
        targetCSM.health = Math.min(targetCSM.health, targetCSM.maxHealth)
      }
      if (field === 'maxhealth') targetCSM.health = Math.min(targetCSM.health, targetCSM.maxHealth)
      saveDB(wdb)
      return m.reply(panelHeader('DATA DIUBAH') + `👤 ${targetName}\n📌 ${field}: ${getNumericValue(field).toLocaleString()}\n━━━━━━━━━━━`)
    }

    if (panelCommand === 'set') {
      const field = panelArgs[1]?.toLowerCase()
      const value = Number(panelArgs[2])
      if (!numericFields.has(field) || !Number.isFinite(value) || value < 0 || !targetCSM) return m.reply(panelHeader('FORMAT SALAH') + `Field atau nilai tidak valid.\n${help}`)
      setNumericValue(field, Math.floor(value))
      if (field === 'level') {
        targetCSM.title = getTitle(targetCSM.level)
        targetCSM.maxHealth = Math.max(100, 100 + (targetCSM.level - 1) * 25)
        targetCSM.health = Math.min(targetCSM.health, targetCSM.maxHealth)
      }
      if (field === 'maxhealth') targetCSM.health = Math.min(targetCSM.health, targetCSM.maxHealth)
      saveDB(wdb)
      return m.reply(panelHeader('DATA DISET') + `👤 ${targetName}\n📌 ${field}: ${getNumericValue(field).toLocaleString()}\n━━━━━━━━━━━`)
    }

    if (panelCommand === 'view') {
      if (!targetCSM) return m.reply(panelHeader('CSM TIDAK DITEMUKAN') + `Target belum memiliki data CSM.\n━━━━━━━━━━━`)
      return m.reply(panelHeader('DATA CSM') + `👤 ${targetName}\n📊 Level: ${targetCSM.level}\n📈 EXP: ${targetCSM.exp}\n❤️ HP: ${targetCSM.health}/${targetCSM.maxHealth}\n🩸 Blood: ${targetCSM.blood}\n📖 Story: ${targetCSM.story}/${STORY_LIST.length}\n👥 Partner: ${targetCSM.partners?.length || 0}\n🔄 Reset: ${targetCSM.resetCount || 0}\n🏆 Ending: ${(targetCSM.endingReward || []).length}\n━━━━━━━━━━━`)
    }

    if (panelCommand === 'fix') {
      if (!targetCSM) return m.reply(panelHeader('CSM TIDAK DITEMUKAN') + `Target belum memiliki data CSM.\n━━━━━━━━━━━`)
      targetCSM.partners = Array.isArray(targetCSM.partners) ? targetCSM.partners : []
      targetCSM.relations = targetCSM.relations && typeof targetCSM.relations === 'object' ? targetCSM.relations : {}
      targetCSM.achievements = Array.isArray(targetCSM.achievements) ? targetCSM.achievements : []
      targetCSM.endingReward = Array.isArray(targetCSM.endingReward) ? targetCSM.endingReward : []
      targetCSM.endingHistory = Array.isArray(targetCSM.endingHistory) ? targetCSM.endingHistory : []
      targetCSM.endingBuffs = targetCSM.endingBuffs && typeof targetCSM.endingBuffs === 'object' ? targetCSM.endingBuffs : {}
      targetCSM.level = Math.max(1, Math.floor(Number(targetCSM.level) || 1))
      targetCSM.exp = Math.max(0, Math.floor(Number(targetCSM.exp) || 0))
      targetCSM.maxHealth = Math.max(100, Math.floor(Number(targetCSM.maxHealth) || 100))
      targetCSM.health = Math.max(1, Math.min(targetCSM.maxHealth, Math.floor(Number(targetCSM.health) || targetCSM.maxHealth)))
      targetCSM.blood = Math.max(0, Math.floor(Number(targetCSM.blood) || 0))
      targetCSM.story = Math.max(1, Math.min(14, Math.floor(Number(targetCSM.story) || 1)))
      targetCSM.title = getTitle(targetCSM.level)
      if (!Array.isArray(targetCSM.inventory) || !targetCSM.inventory.length) targetCSM.inventory = [{ nama: 'Fist', dur: 999 }]
      if (!targetCSM.weapon || !targetCSM.weapon.nama) targetCSM.weapon = { nama: 'Fist', dur: 999 }
      saveDB(wdb)
      return m.reply(panelHeader('DATA DIPERBAIKI') + `👤 ${targetName}\nField CSM utama sudah dinormalisasi.\n━━━━━━━━━━━`)
    }

    if (panelCommand === 'contract') {
      if (!targetCSM) return m.reply(panelHeader('CSM TIDAK DITEMUKAN') + `Target belum memiliki data CSM.\n━━━━━━━━━━━`)
      const contractAction = panelArgs[1]?.toLowerCase()
      if (contractAction === 'clear') {
        targetCSM.devilContract = null
        targetCSM.contractType = null
        targetCSM.contractExpire = 0
        targetCSM.isTransform = false
        targetCSM.contractPending = null
      } else if (contractAction === 'set') {
        const contractName = panelArgs.slice(2).filter(arg => arg !== panelTargetInput).join(' ')
        const devil = DEVIL_LIST.find(item => item.nama.toLowerCase() === contractName.toLowerCase())
        if (!devil) return m.reply(panelHeader('DEVIL TIDAK DITEMUKAN') + `Gunakan nama yang ada di database Devil.\n━━━━━━━━━━━`)
        targetCSM.devilContract = devil.nama
        targetCSM.contractType = devil.tipe === 'Devil' ? 'devil' : 'fiend'
        targetCSM.contractExpire = 0
        targetCSM.isTransform = true
      } else return m.reply(help)
      saveDB(wdb)
      return m.reply(panelHeader('KONTRAK DIUBAH') + `👤 ${targetName}\n⛓️ ${targetCSM.devilContract || 'Tidak ada'}\n━━━━━━━━━━━`)
    }

    if (panelCommand === 'buff') {
      if (!targetCSM) return m.reply(panelHeader('CSM TIDAK DITEMUKAN') + `Target belum memiliki data CSM.\n━━━━━━━━━━━`)
      targetCSM.endingBuffs = targetCSM.endingBuffs && typeof targetCSM.endingBuffs === 'object' ? targetCSM.endingBuffs : {}
      targetCSM.endingReward = Array.isArray(targetCSM.endingReward) ? targetCSM.endingReward : []
      const buffAction = panelArgs[1]?.toLowerCase()
      if (buffAction === 'list') {
        const buffs = Object.values(targetCSM.endingBuffs)
        return m.reply(panelHeader('BUFF ENDING') + (buffs.length ? buffs.map(buff => `🏆 ${buff.id}: ${buff.bonus}`).join('\n') : 'Belum ada buff ending.') + `\n━━━━━━━━━━━`)
      }
      if (buffAction === 'clear') {
        const buffId = panelArgs[2]?.toLowerCase()
        const buffEntry = Object.entries(targetCSM.endingBuffs).find(([name, buff]) => name.toLowerCase() === buffId || buff.id?.toLowerCase() === buffId)
        if (!buffEntry) return m.reply(panelHeader('BUFF TIDAK DITEMUKAN') + `Gunakan *.csm panel buff list @user*.\n━━━━━━━━━━━`)
        delete targetCSM.endingBuffs[buffEntry[0]]
        targetCSM.endingReward = targetCSM.endingReward.filter(reward => reward.id !== buffEntry[1].id)
        saveDB(wdb)
        return m.reply(panelHeader('BUFF DIHAPUS') + `👤 ${targetName}\n🏆 ${buffEntry[1].name}\n━━━━━━━━━━━`)
      }
      return m.reply(help)
    }

    if (panelCommand === 'event' && ['clear', 'force'].includes(panelArgs[1]?.toLowerCase())) {
      if (!targetCSM) return m.reply(panelHeader('CSM TIDAK DITEMUKAN') + `Target belum memiliki data CSM.\n━━━━━━━━━━━`)
      const eventName = panelArgs[2]?.toLowerCase()
      if (panelArgs[1].toLowerCase() === 'clear') {
        if (eventName === 'erasure') targetCSM.erasurePending = null
        else if (eventName === 'makimacall') { targetCSM.pendingDuel = null; targetCSM.pendingDuelTime = null }
        else return m.reply(help)
        saveDB(wdb)
        return m.reply(panelHeader('EVENT DIBERSIHKAN') + `👤 ${targetName}\n🎲 ${eventName}\n━━━━━━━━━━━`)
      }
      if (['erasure', 'makimacall', 'bloodfrenzy', 'devilsbargain', 'eyesofcontrol'].includes(eventName)) {
        if (eventName === 'erasure') targetCSM.erasurePending = { type: 'manual_admin', time: Date.now(), forcedBy: senderNumber }
        else if (eventName === 'makimacall') { targetCSM.pendingDuel = 'makima_order'; targetCSM.pendingDuelTime = Date.now() }
        else if (eventName === 'bloodfrenzy') { targetCSM.bloodFrenzy = { expiresAt: Date.now() + 30 * 60 * 1000 } }
        else if (eventName === 'devilsbargain') { targetCSM.devilBargain = { expiresAt: Date.now() + 30 * 60 * 1000, damageMultiplier: 1.25 } }
        else if (eventName === 'eyesofcontrol') { targetCSM.makimaAttention = Math.min(100, (targetCSM.makimaAttention || 0) + 15) }
        saveDB(wdb)
        return m.reply(panelHeader('EVENT DIPAKSA') + `👤 ${targetName}\n🎲 ${eventName}\n━━━━━━━━━━━`)
      }
      return m.reply(help)
    }

    if (panelCommand === 'raid' && ['force', 'unforce'].includes(panelArgs[1]?.toLowerCase())) {
      const raid = wdb.raid && typeof wdb.raid === 'object' ? wdb.raid : (wdb.raid = { boss: null, players: [], date: '', history: [], currentHP: 0, lastAttack: 0 })
      raid.players = Array.isArray(raid.players) ? raid.players : []
      if (!raid.boss || raid.date !== new Date().toISOString().split('T')[0]) {
        raid.boss = pickRaidDevil()
        raid.currentHP = raid.boss.hp
        raid.date = new Date().toISOString().split('T')[0]
        raid.lastAttack = Date.now()
        raid.players = []
      }
      if (panelArgs[1].toLowerCase() === 'force') {
        if (raid.players.includes(targetKey)) return m.reply(panelHeader('SUDAH DI RAID') + `${targetName} sudah ada di lobby raid.\n━━━━━━━━━━━`)
        if (raid.players.length >= 10) return m.reply(panelHeader('RAID PENUH') + `Lobby raid sudah berisi 10 Hunter.\n━━━━━━━━━━━`)
        raid.players.push(targetKey)
      } else {
        raid.players = raid.players.filter(playerId => playerId !== targetKey)
      }
      saveDB(wdb)
      return m.reply(panelHeader(panelArgs[1].toLowerCase() === 'force' ? 'HUNTER DIPAKSA JOIN' : 'HUNTER DIKELUARKAN') + `👤 ${targetName}\n👥 Lobby: ${raid.players.length}/10\n━━━━━━━━━━━`)
    }

    if (panelCommand === 'reset') {
      const resetField = panelArgs[1]?.toLowerCase()
      if (numericFields.has(resetField)) {
        if (!targetCSM) return m.reply(panelHeader('CSM TIDAK DITEMUKAN') + `Target belum memiliki data CSM.\n━━━━━━━━━━━`)
        if (panelArgs[panelArgs.length - 1]?.toLowerCase() !== 'confirm') return m.reply(panelHeader('KONFIRMASI RESET FIELD') + `Ketik *.csm panel reset ${resetField} @user confirm*.\n━━━━━━━━━━━`)
        const resetValues = { blood: 0, health: targetCSM.maxHealth, maxhealth: 100, exp: 0, level: 1, resetcount: 0, story: 1 }
        setNumericValue(resetField, resetValues[resetField])
        if (resetField === 'level') {
          targetCSM.title = getTitle(1)
          targetCSM.maxHealth = 100
          targetCSM.health = 100
        }
        if (resetField === 'maxhealth') targetCSM.health = Math.min(targetCSM.health, targetCSM.maxHealth)
        saveDB(wdb)
        return m.reply(panelHeader('FIELD DI-RESET') + `👤 ${targetName}\n📌 ${resetField}: ${getNumericValue(resetField).toLocaleString()}\n━━━━━━━━━━━`)
      }
      if (panelArgs[panelArgs.length - 1]?.toLowerCase() !== 'confirm' || !targetCSM) return m.reply(panelHeader('KONFIRMASI RESET ADMIN') + `Reset panel menghapus seluruh data CSM: level, EXP, partner, achievement, reward, inventory, kontrak, dan semua riwayat.\nReset otomatis dari ending berbeda: hanya mengulang perjalanan dan memberikan reward ending.\nKetik *.csm panel reset @user confirm*\n━━━━━━━━━━━`)
      const resetCount = (Number(targetCSM.resetCount) || 0) + 1
      targetRecord.rpg.csm = { started: false, nickname: '', gender: 'None', health: 100, maxHealth: 100, level: 1, exp: 0, title: getTitle(1), blood: 0, story: 1, location: 'Markas Public Safety', devilContract: null, contractType: null, contractHistory: [], isTransform: false, inventory: [{ nama: 'Fist', dur: 999 }], weapon: { nama: 'Fist', dur: 999 }, erasureProtection: null, erasurePending: null, dollContract: false, contractExpire: 0, contractSide: null, contractPending: null, pendingEnding: null, ending: null, endingReward: [], endingHistory: [], endingBuffs: {}, resetCount, partners: [], relations: {}, achievements: [], terrorStory: [], hospital: [], jobs: {}, job: null, encounter: null, tempMission: null, pendingDuel: null, pendingBlood: 0, partnerGachaPending: null, storyCooldown: {}, seenContractScenes: [], seenExploreStories: [], seenMissionStories: [], seenRescueStories: [], seenRescueResults: [], buffHistory: [], lastTerror: 0, lastStory: 0, lastRest: 0, lastExplore: 0, lastMission: 0, lastVisit: 0, lastWork: 0, lastJob: 0, lastJobLeave: 0, lastPartnerGacha: 0, lastRevengeHeal: 0, lastRaid: '', lastSeenChars: {}, endings: [] }
      saveDB(wdb)
      return m.reply(panelHeader('RESET ADMIN BERHASIL') + `👤 ${targetName}\nSeluruh data CSM telah dihapus. Player harus memulai kembali dari awal.\n━━━━━━━━━━━`)
    }

    if (panelCommand === 'partner' && ['add', 'del'].includes(panelArgs[1]?.toLowerCase())) {
      const partnerName = panelArgs.slice(2).filter(arg => arg !== panelTargetInput).join(' ')
      const character = CHARACTER_LIST.find(item => item.nama.toLowerCase() === partnerName.toLowerCase())
      if (!character || !targetCSM) return m.reply(panelHeader('PARTNER TIDAK DITEMUKAN') + `Nama partner tidak valid.\n━━━━━━━━━━━`)
      targetCSM.partners = Array.isArray(targetCSM.partners) ? targetCSM.partners : []
      const index = targetCSM.partners.findIndex(partner => partner.name === character.nama)
      if (panelArgs[1].toLowerCase() === 'add') {
        if (index >= 0) return m.reply(panelHeader('SUDAH ADA') + `${character.nama} sudah menjadi partner.\n━━━━━━━━━━━`)
        targetCSM.partners.push({ name: character.nama, hp: 100, status: 'reserve', level: 1 })
        targetCSM.relations = targetCSM.relations || {}
        targetCSM.relations[character.nama] = character.needLove
      } else {
        if (index < 0) return m.reply(panelHeader('TIDAK ADA') + `${character.nama} bukan partner target.\n━━━━━━━━━━━`)
        targetCSM.partners.splice(index, 1)
      }
      saveDB(wdb)
      return m.reply(panelHeader('PARTNER DIUBAH') + `👤 ${targetName}\n👥 ${character.nama}\n━━━━━━━━━━━`)
    }
    if (panelCommand === 'partner' && panelArgs[1]?.toLowerCase() === 'set') {
      if (!targetCSM) return m.reply(panelHeader('CSM TIDAK DITEMUKAN') + `Target belum memiliki data CSM.\n━━━━━━━━━━━`)
      const targetIndex = panelArgs.indexOf(panelTargetInput)
      const endIndex = targetIndex >= 0 ? targetIndex : panelArgs.length
      const field = panelArgs[endIndex - 2]?.toLowerCase()
      const value = panelArgs[endIndex - 1]
      const partnerName = panelArgs.slice(2, endIndex - 2).join(' ')
      const partner = targetCSM.partners?.find(item => item.name.toLowerCase() === partnerName.toLowerCase())
      if (!partner || !['level', 'love', 'needlove', 'hp', 'status'].includes(field)) return m.reply(panelHeader('FORMAT PARTNER SALAH') + `Gunakan *.csm panel partner set <nama> <level|love|needlove|hp|status> <nilai> @user*.\n━━━━━━━━━━━`)
      if (field === 'status') {
        if (!['active', 'reserve'].includes(value.toLowerCase())) return m.reply(panelHeader('STATUS SALAH') + `Status hanya active atau reserve.\n━━━━━━━━━━━`)
        partner.status = value.toLowerCase()
      } else {
        const numericValue = Number(value)
        if (!Number.isFinite(numericValue) || numericValue < 0) return m.reply(panelHeader('NILAI SALAH') + `Nilai partner harus angka positif.\n━━━━━━━━━━━`)
        if (field === 'needlove') partner.needLove = Math.floor(numericValue)
        else if (field === 'love') targetCSM.relations[partner.name] = Math.floor(numericValue)
        else if (field === 'level') targetCSM.relations[partner.name] = Math.floor(numericValue) * Math.max(1, partner.needLove || CHARACTER_LIST.find(item => item.nama === partner.name)?.needLove || 1)
        else partner[field] = Math.floor(numericValue)
      }
      saveDB(wdb)
      return m.reply(panelHeader('PARTNER DISET') + `👤 ${targetName}\n👥 ${partner.name}\n📌 ${field}: ${field === 'love' || field === 'level' ? targetCSM.relations[partner.name] : partner[field]}\n━━━━━━━━━━━`)
    }
    return m.reply(help)
  }

  const dbJid = resolveJid(m.sender)
let user = wdb.users[dbJid]?.rpg || wdb.users[m.sender]?.rpg
  if (!user) return m.reply(`╭──「 ❌ ERROR 」──╮\n│ Ketik *.adventure* dulu buat daftar RPG.\n━━━━━━━━━━━`)

let userRPG = getUserRPG(wdb, dbJid)?.rpg || getUserRPG(wdb, m.sender)?.rpg
  if (!userRPG) return m.reply(`╭──「 ❌ ERROR 」──╮\n│ Data RPG bank tidak ditemukan.\n━━━━━━━━━━━`)
  const bankBalance = Number(userRPG.bank)
  userRPG.bank = Number.isFinite(bankBalance) && bankBalance >= 0 ? bankBalance : 0

if (!user.csm) user.csm = {
  started: false,
    nickname: '', health: 100, maxHealth: 100, level: 1, exp: 0, title: 'Applicant',
    devilContract: null, contractType: null, contractHistory: [], isTransform: false,
    erasureProtection: null, erasurePending: null, dollContract: false,
    lastTerror: 0, terrorStory: [], lastStory: 0,
  devilsKilled: 0, blood: 0, partners: [], story: 1, location: 'Markas Public Safety', gender: 'None',
    weapon: {nama: 'Fist', dur: 999},
    inventory: [{nama: 'Fist', dur: 999}], 
    lastRest: 0, lastGacha: 0, lastVisit: 0, lastExplore: 0, lastMission: 0,
    encounter: null, tempMission: null,
    relations: {}, pendingBlood: 0,
    lastWork: 0, pendingDuel: null,
    contractExpire: 0, contractSide: null, ending: null,
    partnerGachaPending: null, lastPartnerGacha: 0, lastRevengeHeal: 0,
    hospital: [], job: null, lastJob: 0, lastRaid: '', endings: [],
    achievements: [], lastSeenChars: {},
    storyCooldown: {},
    contractPending: null
  }

  let csm = user.csm
  csm.title = getTitle(csm.level)
  if (csm.contractType === undefined) csm.contractType = csm.devilContract ? 'devil' : null
  if (csm.erasureProtection === undefined) csm.erasureProtection = null
  if (csm.erasurePending === undefined) csm.erasurePending = null
  if (csm.dollContract === undefined) csm.dollContract = false
  if (csm.lastTerror === undefined) csm.lastTerror = 0
  if (!Array.isArray(csm.terrorStory)) csm.terrorStory = []
  if (csm.lastStory === undefined) csm.lastStory = 0
  if (typeof csm.started !== 'boolean') {
    csm.started = false
    csm.gender = 'None'
    saveDB(wdb)
  }
  if (!Array.isArray(csm.inventory) || csm.inventory.length === 0) csm.inventory = [{ nama: 'Fist', dur: 999 }]
  if (!Array.isArray(csm.foundItems)) csm.foundItems = []
  for (const item of csm.inventory) {
    if (ITEM_LIST.some(entry => entry.nama === item.nama) && !csm.foundItems.includes(item.nama)) csm.foundItems.push(item.nama)
  }
  if (!csm.weapon || !csm.weapon.nama) csm.weapon = { nama: 'Fist', dur: 999 }
  if (!Array.isArray(csm.partners)) csm.partners = []
  if (typeof csm.lastRandomEvent !== 'number') csm.lastRandomEvent = 0
  if (typeof csm.lastRaidTime !== 'number') csm.lastRaidTime = 0
  if (typeof csm.pendingRandomEvent !== 'string') csm.pendingRandomEvent = null
  if (!csm.relations || typeof csm.relations !== 'object') csm.relations = {}
  if (!csm.lastSeenChars || typeof csm.lastSeenChars !== 'object') csm.lastSeenChars = {}
  if (!Array.isArray(csm.contractHistory)) csm.contractHistory = []
  if (!Array.isArray(csm.hospital)) csm.hospital = []
  if (!Array.isArray(csm.endings)) csm.endings = []
  if (!Array.isArray(csm.achievements)) csm.achievements = []
  if (!csm.storyCooldown || typeof csm.storyCooldown !== 'object') csm.storyCooldown = {}
  if (!Array.isArray(csm.seenContractScenes)) csm.seenContractScenes = []
  if (!Array.isArray(csm.seenExploreStories)) csm.seenExploreStories = []
  if (!Array.isArray(csm.seenMissionStories)) csm.seenMissionStories = []
  if (!Array.isArray(csm.seenRescueStories)) csm.seenRescueStories = []
  if (!Array.isArray(csm.seenRescueResults)) csm.seenRescueResults = []
  if (!Array.isArray(csm.buffHistory)) csm.buffHistory = []
  const rememberSeen = (key, value) => {
    if (!value || csm[key].includes(value)) return
    csm[key].push(value)
  }
  if (!csm.partnerGachaPending || typeof csm.partnerGachaPending !== 'object') csm.partnerGachaPending = null
  if (typeof csm.lastPartnerGacha !== 'number') csm.lastPartnerGacha = 0
  if (typeof csm.lastRevengeHeal !== 'number') csm.lastRevengeHeal = 0
  if (typeof csm.lastRescue !== 'number') csm.lastRescue = Number(csm.lastRescue) || 0
  const getPartnerLevel = (partner) => {
    const character = CHARACTER_LIST.find(item => item.nama === partner.name)
    const love = Number(csm.relations?.[partner.name] || 0)
    const level = Math.max(1, Math.floor(love / Math.max(1, partner.needLove || character?.needLove || 1)))
    partner.level = level
    return level
  }
  const getPartnerDamage = (partner) => {
    const level = getPartnerLevel(partner)
    return Math.max(10, level * 10) * (calcBonus(csm).partnerDmgMultiplier || 1)
  }
  let today = new Date().toISOString().split('T')[0]
  let args = text ? text.trim().split(/ +/) : []
let action = normalizeCsmAction((args[0] || '').toLowerCase())

  const ALL_LOCATION_LIST = [...MAIN_LOCATION_LIST,...SIDE_LOCATION_LIST]
  const SAFE_BLOOD_LOCATIONS = new Set([
    'Kafe Crossroads (Trois Bagues Vertes)',
    'Markas Public Safety',
    'Apartemen Himeno',
    'Apartemen Hayakawa',
    'Rumah Sakit Tokyo (Hospital)',
    'Toko Roti Murah Tokyo',
    'Kedai Ramen Pinggir Jalan',
    'Supermarket Tokyo',
    'Kamar Hotel Kyoto',
    'Kafe Retro Tokyo',
    'Rumah Perlindungan Public Safety (Safehouse)',
    'Pusat Penyelamatan Publik',
    'Kedai Es Krim Tokyo',
    'Kedai Teh Tradisional (Tea House)'
  ])
  
  const getRateColor = (rate) => {
  if(rate >= 0.70) return '🔴' // Bahaya 70%+
  if(rate >= 0.40) return '🟡' // Sedang 40-69%
  return '🟢' // Aman <40%
}

  const cekCD = (key, durasi) => {
    let last = csm[key] || 0
    let sisa = durasi - (Date.now() - last)
    return sisa > 0? Math.ceil(sisa / 1000) : 0
  }
  
  // === TRIGGER MAKIMA CALL 5% ===
async function checkMakimaTrigger(m, csm, wdb) {
  if (csm.lastRandomEvent && Date.now() - csm.lastRandomEvent < 6 * 60 * 60 * 1000) return
  if (csm.pendingDuel || csm.erasurePending || csm.pendingRandomEvent) return
  if (csm.blood < 10000) return // darah <10k aman

  const eventPool = [
    { id: 'makimacall', chance: 0.01 },
    { id: 'devilsbargain', chance: 0.01 },
    { id: 'eyesofcontrol', chance: 0.01 },
    { id: 'bloodfrenzy', chance: 0.01 },
    { id: 'erasure', chance: 0.0002 }
  ]
  const selected = eventPool[Math.floor(Math.random() * eventPool.length)]
  if (Math.random() > selected.chance) return

  const now = Date.now()
  csm.lastRandomEvent = now
  csm.pendingRandomEvent = selected.id
  if (selected.id === 'makimacall') {
    csm.pendingDuel = 'makima_order'
    csm.pendingDuelTime = now
  }
  if (selected.id === 'erasure') csm.erasurePending = true
  if (!Array.isArray(wdb.csmEventHistory)) wdb.csmEventHistory = []
  wdb.csmEventHistory.push({
    event: selected.id,
    nickname: csm.nickname || 'Hunter tanpa nickname',
    jid: m.sender,
    date: now
  })
  if (wdb.csmEventHistory.length > 100) wdb.csmEventHistory = wdb.csmEventHistory.slice(-100)
  csm.lastRandomEvent = Date.now()
  saveDB(wdb)

  const quotes = [
    `⛓️ "Bunuh seekor anjing untukku."`, `⛓️ "Ada hama. Basmi."`, `⛓️ "Buktikan kesetiaanmu."`,
    `⛓️ "Aku butuh darah. Bawakan."`, `⛓️ "Jangan buat aku menunggu."`, `⛓️ "Pergilah ke sana dan jangan bertanya."`,
    `⛓️ "Selesaikan sebelum matahari terbit."`, `⛓️ "Aku sudah memilih targetmu."`, `⛓️ "Jangan mengecewakanku."`,
    `⛓️ "Kau tahu apa yang harus dilakukan."`
  ]
  const quote = quotes[Math.floor(Math.random() * quotes.length)]
  const prompts = {
    makimacall: header('PANGGILAN DARI MAKIMA') + `${quote}\n\nTarget: Bebas. Pilih sendiri\nWaktu: 1 Jam\n\nReward: +15.000 Blood dan +100 EXP\nGagal/Tolak: -10.000 Blood\n\n.csm event makimacall terima\n.csm event makimacall tolak\n━━━━━━━━━━━`,
    devilsbargain: header("THE DEVIL'S BARGAIN") + `Tawaran Devil aktif. Terima untuk Blood +10.000 dan damage +25% selama 30 menit, atau tolak.\n\n.csm event devilsbargain terima\n.csm event devilsbargain tolak\n━━━━━━━━━━━`,
    eyesofcontrol: header('EYES OF CONTROL') + `Makima sedang mengawasimu. Pilih loyalitas atau kebebasan.\n\n.csm event eyesofcontrol loyal\n.csm event eyesofcontrol tolak\n━━━━━━━━━━━`,
    bloodfrenzy: header('BLOOD FRENZY') + `Haus darah meningkat. Aktifkan Blood Gain x2 dan Terror tanpa cooldown selama 30 menit, atau tahan nalurimu.\n\n.csm event bloodfrenzy ikut\n.csm event bloodfrenzy tahan\n━━━━━━━━━━━`,
    erasure: header('ERASURE EFFECT') + `Pochita mulai menghapus jejak perjalananmu. Terima penghapusan atau pilih perlindungan.\n\n.csm event erasure yes\n.csm event erasure no\n━━━━━━━━━━━`
  }
  return m.reply(prompts[selected.id])
}

  // === INIT RAID 👹
  global.raid_csm = global.raid_csm || {}
  let raid = global.raid_csm[m.chat]
  if (!raid || raid.date!== today) {
    const selected = pickRaidDevil()
    global.raid_csm[m.chat] = {
      date: today, boss: selected, hp: selected.hp,
      players: raid?.players || [], history: raid?.history || []
    }
    raid = global.raid_csm[m.chat]
  }

  const header = (title) => `╭──「 ⛓️ DEVIL HUNTER RPG 」──╮\n│ ${title}\n━━━━━━━━━━━\n\n`
  const picturesEnabled = () => wdb.csmPicturesEnabled !== false
  const sendCsmReply = async (caption, picture, preservePicture = false) => {
    caption = normalizeMessage(caption)
    if (!picturesEnabled() || !picture) return m.reply(caption)
    try {
      if (preservePicture) {
        return await conn.sendMessage(m.chat, {
          image: { url: picture },
          caption
        }, { quoted: m })
      }
      return await sendRpgMsg(conn, m, caption, picture)
    } catch (error) {
      console.error('[CSMPicture] Error:', error.message)
      return m.reply(caption)
    }
  }

  const getLocationPicture = (location, characters = []) => {
    const names = new Set(characters.map(character => character.nama))
    if (location.nama === 'Family Burger') return CSM_PICTURES.familyBurger
    if (location.nama === 'Kuburan Massal Pemburu Iblis (Graveyard)') return CSM_PICTURES.graveyard
    if (location.nama === 'Hotel Morin') return CSM_PICTURES.hotelMorin
    if (location.nama === 'Markas Public Safety') return CSM_PICTURES.publicSafety
    if (location.nama === 'Stan Telepon Umum Nishi-Kanda (Phonebooth)') {
      if (names.has('Reze')) return CSM_PICTURES.rezePhonebooth
      if (names.has('Denji')) return CSM_PICTURES.denjiPhonebooth
    }
    if (location.nama === 'Kafe Crossroads (Trois Bagues Vertes)') {
      if (names.has('Reze') && names.has('Denji')) return CSM_PICTURES.rezeDenjiCafe
      if (names.has('Reze')) return pickPicture(CSM_PICTURES.rezeCafe)
      return CSM_PICTURES.cafe
    }
    return pickPicture(CSM_PICTURES.city)
  }

  const ITEM_COMMENTS = [
    '🧰 Kamu simpan dulu. Barang kecil tetap bisa menyelamatkan nyawa.',
    '🧲 Benda ini masih berguna kalau keadaan berubah buruk.',
    '🫧 Kamu membersihkannya lalu memasukkannya ke inventory.',
    '🧤 Tidak mewah, tapi cukup untuk membuat perjalanan lebih ringan.',
    '🛡️ Kamu menemukan tempat aman untuk menyimpan barang ini.',
    '👃 Baunya aneh. Tetap saja, kamu tidak mau meninggalkannya.',
    '🔎 Kamu memeriksa isinya dua kali sebelum mengambilnya.',
    '🧵 Sisa perlengkapan yang layak pakai. Lumayan untuk seorang Hunter.',
    '📦 Kamu membungkusnya rapat-rapat agar tidak rusak di jalan.',
    '🧭 Barang ini mungkin tidak penting sekarang, tetapi siapa tahu nanti.'
  ]
  const getDropByName = name => ITEM_LIST.find(item => item.nama === name) || WEAPON_LIST.find(weapon => weapon.nama === name)
  const addInventoryDrop = drop => {
    if (!drop) return false
    const isItem = ITEM_LIST.includes(drop)
    csm.inventory.push({ nama: drop.nama, ...(isItem ? { jml: 1 } : {}), dur: drop.dur ?? 1 })
    if (isItem && !csm.foundItems.includes(drop.nama)) csm.foundItems.push(drop.nama)
    return true
  }

  const buffGuide = [
    'DMG, Accuracy, Speed, Snake, Control, Army, Summon: tambah damage; dapat dari partner/achievement set.',
    'DEF, Taunt, CC Resist, Doll Buff: mengurangi damage; dapat dari partner/achievement set.',
    'Critical, Crit Damage, Evasion, Instant Kill, Pierce, Bleed, AoE, Burn, Fire, Water: efek battle; dapat dari partner/achievement set.',
    'Self Destruct: peluang mengorbankan HP untuk ledakan damage besar; dapat dari Yuko.',
    'Summon: memanggil Devil tambahan dan memberi damage bonus; dapat dari Santa Claus atau ending Apocalypse.',
    'Regen, Heal, Revive, Team HP, Weapon Dur: efek bertahan hidup; dapat dari partner/achievement set.',
    'EXP, Blood, Steal Blood, Money, Blood Flat: bonus reward; dapat dari partner/achievement set/ending.',
    'Find Item, Info, Luck, Discount, Stamina: eksplorasi, encounter, cooldown, dan toko; dapat dari partner/achievement set.',
    'Political, Law, Diplomacy, Crime, INT, Justice: bonus taktik yang menambah damage atau defense; dapat dari partner/achievement set.',
    'Teleport: peluang menghindari serangan dan pindah ke lokasi aman; dapat dari achievement Divisi 4.',
    'Concept Erasure: bonus damage konsep; dapat dari Chainsaw Devil dan sekarang aktif di battle.',
    'Auto Transform, Gacha Bonus, No Heal, No Fight: efek ending atau set achievement.'
  ]

  const getStoryPicture = devilName => {
    if (devilName === 'Bomb Devil') return CSM_PICTURES.bombDevil
    if (devilName === 'Katana Man') return CSM_PICTURES.katanaMan
    if (devilName === 'Chainsaw Devil') return CSM_PICTURES.chainsawDevil
    return null
  }

  const currentBonus = calcBonus(csm)
  if (csm.devilBargain && csm.devilBargain.expiresAt <= Date.now()) {
    csm.health = Math.max(1, csm.health - 10)
    csm.devilBargain = null
    saveDB(wdb)
  }
  if (rawAction === 'erasure' || rawAction === 'makimacall') {
    return m.reply(header('EVENT TERKUNCI') + `Gunakan *.csm event ${rawAction}* untuk mengakses event ini.\n━━━━━━━━━━━`)
  }
  if (action === 'event' && ['erasure', 'makimacall', 'devilsbargain', 'eyesofcontrol', 'bloodfrenzy'].includes(args[1]?.toLowerCase())) {
    action = args[1].toLowerCase()
    args = [action, ...args.slice(2)]
  }
  if (['erasure', 'makimacall', 'devilsbargain', 'eyesofcontrol', 'bloodfrenzy'].includes(action) && args[1] && csm.pendingRandomEvent === action) {
    csm.pendingRandomEvent = null
    saveDB(wdb)
  }
  if (action === 'event' && args[1]?.toLowerCase() === 'history') {
    const history = Array.isArray(wdb.csmEventHistory) ? wdb.csmEventHistory.slice(-30).reverse() : []
    const labels = { makimacall: 'Makima Call', devilsbargain: "The Devil's Bargain", eyesofcontrol: 'Eyes of Control', bloodfrenzy: 'Blood Frenzy', erasure: 'Erasure Effect' }
    const lines = history.map((entry, index) => {
      const date = new Date(entry.date).toLocaleString('id-ID')
      return `${index + 1}. ${entry.nickname || 'Hunter'} - ${labels[entry.event] || entry.event} (${date})`
    })
    return m.reply(header('RIWAYAT EVENT') + `Event terpicu: ${history.length}/30\n\n${lines.length ? lines.join('\n') : 'Belum ada event yang terpicu.'}\n━━━━━━━━━━━`)
  }
  if (currentBonus.noFight && ((action === 'mission' && args[1] === 'fight') || (action === 'visit' && args[1] === 'fight'))) {
    return m.reply(header('PEACE ENDING') + `Bonus Peace mencegah pertarungan.\n━━━━━━━━━━━`)
  }

  if (action === 'picture' || action === 'gallery') {
    const pictureAction = args[1]?.toLowerCase()
    if (action === 'picture' && ['enable', 'disable'].includes(pictureAction)) {
      if (!isPrivileged) return m.reply(headerUnavailable('PICTURE'))
      wdb.csmPicturesEnabled = pictureAction === 'enable'
      saveDB(wdb)
      return m.reply(`${pictureAction === 'enable' ? 'Pengiriman gambar diaktifkan.' : 'Pengiriman gambar dinonaktifkan.'}`)
    }

    const exclusivePictures = GALLERY_PICTURES
    const pictureNumber = Number(pictureAction)
    if (Number.isInteger(pictureNumber) && pictureNumber >= 1 && pictureNumber <= exclusivePictures.length) {
      const [name, picture] = exclusivePictures[pictureNumber - 1]
      return sendCsmReply(header(`PICTURE ${pictureNumber}`) + `🖼️ ${name}\n━━━━━━━━━━━`, picture)
    }
    let galleryText = header('CSM PICTURE GALLERY') +
      `Koleksi ini memuat gambar referensi dari artis lain yang ditemukan di Pinterest, Google, Alpha Coders, DeviantArt, dan sumber publik lainnya.\n` +
      `Gunakan *.csm gallery <nomor>* atau *.csm picture <nomor>* untuk melihat satu gambar.\n\n`
    exclusivePictures.forEach(([name], index) => { galleryText += `${index + 1}. ${name}\n` })
    galleryText += `\n━━━━━━━━━━━`
    return m.reply(galleryText)
  }

  if (action === 'heal') {
    if (!currentBonus.noHeal) return m.reply(header('HEAL') + `Gunakan *.csm rest* untuk memulihkan HP.\n━━━━━━━━━━━`)
    const healCooldown = 30 * 60 * 1000
    const cooldownLeft = healCooldown - (Date.now() - csm.lastRevengeHeal)
    if (cooldownLeft > 0) return m.reply(header('COOLDOWN HEAL') + `Tunggu ${Math.ceil(cooldownLeft / 60000)} menit lagi.\n━━━━━━━━━━━`)
    const healCost = 5000
    if (csm.blood < healCost) return m.reply(header('DARAH KURANG') + `Butuh ${healCost.toLocaleString()} Blood untuk memaksa regenerasi.\n━━━━━━━━━━━`)
    const hpBefore = csm.health
    csm.blood -= healCost
    csm.health = Math.min(csm.maxHealth, csm.health + Math.floor(csm.maxHealth * 0.25))
    csm.lastRevengeHeal = Date.now()
    saveDB(wdb)
    return m.reply(header('REGENERASI REVENGE') + `Rasa sakit diubah menjadi tenaga.\n❤️ HP: +${csm.health - hpBefore}\n🩸 Blood: -${healCost.toLocaleString()}\n❤️ Total HP: ${csm.health}/${csm.maxHealth}\n━━━━━━━━━━━`)
  }

  if (action === 'cooldown') {
    const checks = [
      ['Terror', csm.lastTerror, 60 * 60 * 1000],
      ['Explore', csm.lastExplore, 10 * 60 * 1000],
      ['Mission', csm.lastMission, 20 * 60 * 1000],
      ['Rescue', csm.lastRescue, 20 * 60 * 1000],
      ['Visit', csm.lastVisit, 5 * 60 * 1000],
      ['Gacha', csm.lastGacha, 5 * 60 * 1000],
      ['Partner Gacha', csm.lastPartnerGacha, 60 * 60 * 1000, calcBonus(csm).gachaBonus > 0],
      ['Rest', csm.lastRest, 5 * 60 * 1000],
      ['Heal', csm.lastRevengeHeal, 30 * 60 * 1000, calcBonus(csm).noHeal],
      ['Story', csm.lastStory, 60 * 60 * 1000],
      ['Raid', csm.lastRaidTime, 24 * 60 * 60 * 1000],
      ['Work', csm.lastWork, 10 * 60 * 1000],
      ['Job', csm.lastJob, 60 * 60 * 1000]
    ]

    const formatCooldown = (leftMs) => {
      const totalSeconds = Math.max(0, Math.ceil(leftMs / 1000))
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      if (minutes > 0) return `${minutes}m ${seconds}s`
      return `${seconds}s`
    }

    let cap = header('COOLDOWN STATUS')
    cap += `📊 Status semua cooldown personalmu:\n\n`

    let hasAnyCooldown = false

    checks.forEach(([name, timestamp, duration, available = true]) => {
      if (!available) {
        cap += `⚪ ${name}: Tidak Aktif\n`
        return
      }
      if (!Number.isFinite(timestamp) || timestamp <= 0) {
        cap += `⚪ ${name}: Belum Digunakan\n`
        return
      }
      if (!Number.isFinite(timestamp)) {
        cap += `⚪ ${name}: Tidak Aktif\n`
        return
      }

      const left = duration - (Date.now() - timestamp)
      if (left <= 0) {
        cap += `✅ ${name}: Ready\n`
        return
      }

      hasAnyCooldown = true
      cap += `⏳ ${name}: ${formatCooldown(left)} tersisa\n`
    })

    if (!hasAnyCooldown) {
      cap += `\n✅ Semua aktivitas saat ini sudah siap dipakai.\n`
    }

    cap += '━━━━━━━━━━━'
    return m.reply(cap)
  }

  const setupActions = ['start', 'gender', 'kelamin', 'nickname']
  if (!csm.started && action !== 'start') {
    return m.reply(header('BELUM START') + `Gunakan ${usedPrefix}csm start terlebih dahulu.\n━━━━━━━━━━━`)
  }
  if (csm.started && (!csm.nickname || !csm.nickname.trim()) && !setupActions.includes(action)) {
    return m.reply(header('SET NICKNAME') + `Atur nickname terlebih dahulu.\n${usedPrefix}csm nickname <nama>\n━━━━━━━━━━━`)
  }

  if (csm.erasurePending && action !== 'erasure') {
    return m.reply(header('KONFIRMASI TERTUNDA') + `Selesaikan konfirmasi Erasure Effect terlebih dahulu dengan ${usedPrefix}csm event erasure yes/no atau confirm/cancel.\n━━━━━━━━━━━`)
  }

  const dollBlockedActions = ['rest', 'partner', 'explore', 'mission', 'misi', 'story', 'storylist', 'visit', 'location', 'shop', 'store', 'toko', 'raid']
  if (csm.dollContract && dollBlockedActions.includes(action) && action !== 'contract') {
    return m.reply(header('DOLL CONTRACT') + `Kamu sudah menjadi boneka kontrak.\nGunakan ${usedPrefix}csm terror untuk berburu manusia.\nGunakan ${usedPrefix}csm contract untuk mencari jalan keluar.\n━━━━━━━━━━━`)
  }

  if (!csm.devilContract && !csm.dollContract && !csm.erasureProtection && !setupActions.includes(action) && !['contract', 'erasure'].includes(action) && Math.random() < 0.4) {
    csm.dollContract = true
    csm.contractType = 'doll'
    csm.devilContract = 'Doll Devil'
    csm.isTransform = false
    saveDB(wdb)
    return m.reply(header('DOLL CONTRACT') + `Benang asing menembus tubuhmu. Kamu dipaksa menjadi boneka Doll Devil.\nKamu masih sadar, tetapi kehendakmu bukan lagi milikmu.\nGunakan ${usedPrefix}csm terror untuk bertahan.\n━━━━━━━━━━━`)
  }

  if (csm.contractType === 'host' && !['start', 'gender', 'kelamin', 'nickname', 'contract'].includes(action) && Math.random() < 0.01) {
    csm.devilContract = null
    csm.contractType = null
    csm.health = 1
    saveDB(wdb)
    return m.reply(header('HOST DIPANGGIL') + `Devil yang meminjamkan kekuatannya menagih tubuhmu. Kontrak host terputus dan kamu nyaris mati.\n━━━━━━━━━━━`)
  }

  if (!csm.erasureProtection && !csm.erasurePending && !['start', 'gender', 'kelamin', 'nickname', 'erasure'].includes(action)) {
    const inHell = csm.location?.includes('Neraka')
    const makimaEncounter = csm.encounter?.type === 'makima_neraka'
    const erasureChance = makimaEncounter ? 0.1 : inHell ? 0.02 : 0.0001
    if (Math.random() < erasureChance) {
      csm.erasurePending = { time: Date.now(), location: csm.location }
      saveDB(wdb)
      return m.reply(header('ERASURE EFFECT') + `Pochita memakan bagian dirinya sendiri. Konsep dan ingatan mulai terhapus dari dunia.\n\nKamu terkena Erasure Effect. Jika diterima, Story, kontrak, darah, dan inventory akan hilang. Level, EXP, partner, dan ending history tetap ada.\n\nKetik ${usedPrefix}csm event erasure yes untuk menerima.\nKetik ${usedPrefix}csm event erasure no untuk membatalkan dan memilih perlindungan.\n━━━━━━━━━━━`)
    }
  }

// === TERROR 😈
if (action === 'terror') {
  if (!csm.contractType && !csm.dollContract) return m.reply(header('TIDAK ADA KONTRAK') + `|Terror membutuhkan kontrak aktif.\n|${usedPrefix}csm contract\n|━━━━━━━━━━━`)
  
  const frenzyActive = csm.bloodFrenzy?.expiresAt > Date.now()
  if (csm.bloodFrenzy && !frenzyActive) csm.bloodFrenzy = null
  const terrorCooldown = frenzyActive ? 0 : 3600000
  const terrorLeft = terrorCooldown - (Date.now() - (csm.lastTerror || 0))
  if (terrorLeft > 0) return m.reply(header('COOLDOWN TERROR') + `|Tunggu ${Math.ceil(terrorLeft / 60000)} menit lagi.\n|━━━━━━━━━━━`)

  const terrorSuccess = [
    '🌑 Kota menutup tirai. Kontrakmu menelan ketakutan manusia dan meninggalkan darah di jalan.',
    '🩸 Tidak ada yang berani menyebut namamu. Kamu pulang membawa darah sebelum fajar.',
    '⛓️ Kontrakmu mengambil alih tubuh untuk sesaat. Saat sadar, hanya jejak kaki yang tersisa.',
    '👁️ Kamu memburu kerumunan dari bayangan. Ketakutan mereka berubah menjadi kekuatan.',
    '🏙️ Satu distrik menjadi sunyi. Kontrakmu tertawa, dan darah mengalir ke tanganmu.',
    '🔪 Kamu menyalakan kekuatan kontrak di tengah gang dan membuat semua orang berlari.',
    '🚨 Sirene menjauh. Kamu meninggalkan TKP sebelum ada yang sempat melihat wajahmu.',
    '🩸 Rasa takut memenuhi udara, lalu berubah menjadi tenaga yang mengalir ke tubuhmu.',
    '🌃 Malam itu kota kehilangan satu blok ketenangannya. Kamu kembali dengan tangan berlumur darah.',
    '😈 Kontrakmu meminta lebih banyak. Kamu memberinya cukup untuk pulang dengan selamat.'
  ]
  const terrorDeath = [
    '💀 Seorang Devil Hunter mengenal kontrakmu. Pertarungan singkat berakhir dengan tubuhmu roboh.',
    '🥃 Kishibe mengirim pemburu lain. Kamu kalah sebelum sempat memanggil kekuatan penuh.',
    '🚔 Public Safety menemukan jejakmu dan memutus seranganmu sebelum selesai.',
    '⚔️ Hunter yang kamu temui lebih siap. Kontrakmu dipaksa mundur dan tubuhmu hancur.',
    '🚨 Sirene memenuhi kota. Para pemburu mengepungmu sampai kesadaranmu padam.',
    '🩸 Kamu salah memilih target. Balasan datang lebih cepat daripada kekuatan kontrakmu.',
    '🔫 Tembakan pertama meleset, tetapi yang kedua membuat kakimu tidak lagi bisa berlari.',
    '🌧️ Hujan menghapus jejakmu, bukan luka yang ditinggalkan para Hunter di tubuhmu.',
    '⛓️ Kontrakmu menolak membayar harga malam ini. Tubuhmu yang akhirnya menanggungnya.',
    '💥 Kamu terjebak di antara sirene dan cakar Devil. Tidak ada jalan keluar yang tersisa.'
  ]
  const metHunter = Math.random() < 0.25
  const story = metHunter ? terrorDeath[Math.floor(Math.random() * terrorDeath.length)] : terrorSuccess[Math.floor(Math.random() * terrorSuccess.length)]
  csm.lastTerror = Date.now()
  if (!Array.isArray(csm.terrorStory)) csm.terrorStory = []
  csm.terrorStory.push({ date: Date.now(), result: metHunter ? 'death' : 'success', story })
  if (csm.terrorStory.length > 10) csm.terrorStory.shift()

  if (metHunter) {
    // YANG BENAR: HEALTH KE RESET, BUKAN BLOOD
    csm.health = csm.dollContract ? 1 : 0 // dollContract = nyawa 1, biasa = mati
    saveDB(wdb)
    return sendCsmReply(header('TERROR GAGAL') + `|${story}\n\n|🩸 Darah kamu aman: ${csm.blood.toLocaleString()}\n|❤️ HP tersisa: ${csm.health}/${csm.maxHealth}\n|${csm.dollContract ? '🪆 Boneka tidak benar-benar mati. Kamu masih bisa terror lagi setelah cooldown.' : '💀 Kamu mati. Gunakan .csm revive atau .csm rest'}\n|━━━━━━━━━━━`, pickPicture(CSM_PICTURES.city))
  }

  const reward = (Math.floor(Math.random() * 40000) + 5000) * (frenzyActive ? 2 : 1)
  csm.blood += reward
  if (frenzyActive && Math.random() < 0.2) csm.health = Math.max(1, csm.health - 5)
  saveDB(wdb)
  await checkMakimaTrigger(m, csm, wdb)
return sendCsmReply(header('TERROR BERHASIL') + `|${story}\n\n|🩸 +${reward.toLocaleString()} Darah\n|📖 Catatan terror tersimpan: ${csm.terrorStory.length}/10\n|━━━━━━━━━━━`, pickPicture(CSM_PICTURES.city))
}

  // === CONTRACT EXPIRED ⏳
  if (csm.contractExpire > 0 && csm.contractExpire < Date.now()) {
    csm.devilContract = null
    csm.contractType = null
    csm.contractExpire = 0
    m.reply(header('KONTRAK HABIS') + `Kontrak trial mu sudah selesai\n━━━━━━━━━━━`)
  }

  const addExp = (exp) => {
    csm.exp += exp
    let need = csm.level * 300
    let leveled = false
    const previousTitle = csm.title || getTitle(csm.level)
    while(csm.exp >= need){
      csm.exp -= need
      csm.level++
      csm.maxHealth += 25
      csm.health = csm.maxHealth
      const newTitle = getTitle(csm.level)
      const oldTitle = csm.title || previousTitle
      csm.title = newTitle
      if (newTitle !== oldTitle) {
        m.reply(header('TITLE BERUBAH') + `🏷️ ${oldTitle} → ${newTitle}\n📖 ${getTitleBackstory(csm.level)}\n━━━━━━━━━━━`)
      }
      need = csm.level * 300
      leveled = true
    }
    csm.title = getTitle(csm.level)
    return leveled
  }

  const damageWeapon = () => {
    if (!Array.isArray(csm.inventory) || csm.inventory.length === 0) {
      csm.inventory = [{nama: 'Fist', dur: 999}]
      csm.weapon = {nama: 'Fist', dur: 999}
      return null
    }
    if(csm.inventory[0].nama === 'Fist') return null
    csm.inventory[0].dur--
    csm.weapon.dur = csm.inventory[0].dur
    if(csm.inventory[0].dur <= 0){
      let rusak = csm.inventory.shift()
      csm.weapon = {nama: 'Fist', dur: 999}
      return rusak.nama
    }
    return null
  }

  const resetStoryAfterEnding = () => {
    csm.resetCount = (csm.resetCount || 0) + 1
    csm.weapon = { nama: 'Fist', dur: 999 }
    csm.inventory = [{ nama: 'Fist', dur: 999 }]
    csm.devilContract = null
    csm.contractType = null
    csm.contractExpire = 0
    csm.contractSide = null
    csm.contractPending = null
    csm.erasureProtection = null
    csm.erasurePending = null
    csm.dollContract = false
    csm.isTransform = false
    csm.blood = 0
    csm.hospital = []
    csm.story = 1
    csm.ending = null
    csm.pendingEnding = null
    csm.location = 'Markas Public Safety'
    csm.encounter = null
    csm.tempMission = null
    csm.pendingDuel = null
    csm.pendingBlood = 0
    csm.partnerGachaPending = null
    csm.lastRevengeHeal = 0
    csm.lastTerror = 0
    csm.terrorStory = []
    csm.lastStory = 0
    csm.lastRest = 0
    csm.lastExplore = 0
    csm.lastMission = 0
    csm.lastVisit = 0
    csm.lastJob = 0
    csm.lastRaid = ''
    csm.health = csm.maxHealth
  }

// === START 🏠
if (action === 'start') {
  csm.started = true
  if (!csm.gender) csm.gender = 'None'
  saveDB(wdb)

  if (!user.csm) user.csm = {
    started: true,
    nickname: '', health: 100, maxHealth: 100, level: 1, exp: 0, title: 'Applicant',
    devilContract: null, contractType: null, contractHistory: [], isTransform: false,
    erasureProtection: null, erasurePending: null, dollContract: false,
    devilsKilled: 0, blood: 0, partners: [], story: 1, location: 'Markas Public Safety', gender: 'None',
    weapon: {nama: 'Fist', dur: 999},
    inventory: [{nama: 'Fist', dur: 999}], lastRest: 0, lastGacha: 0, lastVisit: 0, encounter: null,
    relations: {}, pendingBlood: 0,
    lastWork: 0, pendingDuel: null,
    contractExpire: 0, contractSide: null, ending: null,
    hospital: [], job: null, lastJob: 0, lastRaid: '', endings: [],
    achievements: [], lastSeenChars: {}
  }
  csm = user.csm

  let cap = header('SELAMAT DATANG DEVIL HUNTER')
  cap += `👤 @${senderJid.split('@')[0]}\n`
  cap += `🏷️ ${csm.title}\n`
  cap += `📛 ${csm.nickname || 'Belum Ada Nickname'} | ${csm.gender}\n`
  cap += `📍 ${csm.location}\n`
  cap += `💰 Rp ${userRPG.bank.toLocaleString()} Bank\n`
  cap += `💼 ${csm.job || 'Belum Kerja'}\n`
  cap += `🩸 ${csm.blood.toLocaleString()} Darah\n`
  cap += `━━━━━━━━━━━\n`
  cap += `💡 *INFO MATA UANG*\n`
  cap += `Di dunia Devil Hunter, mata uang utama adalah *Darah*\n`
  cap += `Kamu bisa tukar dari Bank ke Darah dengan:\n`
  cap += `*.csm blood*\n\n`
  cap += `📋 Ketik *.csm* untuk buka Menu Utama\n`
  cap += `📖 Ketik *.csm tutorial* untuk panduan\n━━━━━━━━━━━`
  return sendCsmReply(cap, CSM_PICTURES.about)
}

// === NICKNAME 🏷️
if (action === 'nickname') {
  csm = user.csm
  if (!csm) return m.reply(header('ERROR') + `Data tidak ditemukan\n━━━━━━━━━━━`)
  const nama = args.slice(1).join(' ').trim()
  if (!nama) return m.reply(header('PENGGUNAAN') + `.csm nickname <nama>\nContoh:.csm nickname Azelve Morningstar\n━━━━━━━━━━━`)
  if (nama.length > 20) return m.reply(header('KEPANJANGAN') + `Max 20 karakter\n━━━━━━━━━━━`)
  csm.nickname = nama
  const msgs = [
    `🏷️ Mulai sekarang kami akan memanggilmu *${nama}*.`,
    `📝 Nama Hunter tercatat: *${nama}*.`,
    `⛓️ Baik, *${nama}*. Aku akan mengingatnya.`,
    `🚪 Selamat datang, *${nama}*. Jangan mati di minggu pertama.`,
    `🔪 *${nama}*... nama yang cocok untuk seorang Hunter.`,
    `👁️ HQ sudah mencatat keberadaanmu, *${nama}*.`,
    `🩸 Nama *${nama}* sekarang terikat pada catatan Blood-mu.`,
    `📎 *${nama}*, semoga namamu tidak masuk daftar korban.`,
    `⚠️ *${nama}*... mulai sekarang semua keputusan punya harga.`,
    `🗂️ Identitas Hunter disimpan. Bertahanlah, *${nama}*.`
  ]
  const msg = msgs[Math.floor(Math.random() * msgs.length)]
  saveDB(wdb)
  return m.reply(header('NICKNAME DISET') + `Nama Hunter : *${nama}*\nNickname : *${nama.split(' ')[0]}*\n\n${msg}\n━━━━━━━━━━━`)
}

// === GENDER ⚧️
if (action === 'gender' || action === 'kelamin') {
  csm = user.csm
  if (!csm) return m.reply(header('ERROR') + `Data tidak ditemukan\n━━━━━━━━━━━`)
  let genderInput = (args[1] || '').toLowerCase()
  if (!['pria', 'wanita', 'cowok', 'cewek', 'laki-laki', 'perempuan', 'male', 'female', 'none'].includes(genderInput)) {
    return m.reply(
      header('PILIH GENDER HUNTER') +
      `Pilih gender karakter Devil Hunter kamu:\n` +
      `• *.csm gender pria* / *.csm gender cowok* / *.csm gender male*\n` +
      `• *.csm gender wanita* / *.csm gender cewek* / *.csm gender female*\n\n` +
      `• *.csm gender none* - Tidak ingin menyebutkan\n\n` +
      `Gender saat ini: *${csm.gender}*\n` +
      `━━━━━━━━━━━`
    )
  }
  if (['pria', 'cowok', 'laki-laki', 'male'].includes(genderInput)) csm.gender = 'Laki-Laki ♂️'
  else if (['wanita', 'cewek', 'perempuan', 'female'].includes(genderInput)) csm.gender = 'Perempuan ♀️'
  else csm.gender = 'None'
  saveDB(wdb)
  return m.reply(header('GENDER DISET') + `Gender kamu sekarang: *${csm.gender}*\n\nLanjut set nickname dengan:\n.csm nickname <nama>\n━━━━━━━━━━━`)
}

// === VIEW 👤
if (action === 'view') {
  csm = user.csm
  if (!csm) return m.reply(header('ERROR') + `Data tidak ditemukan\n━━━━━━━━━━━`)
  const sub = (args[1] || '').toLowerCase()

  if (sub === 'backstory' || sub === 'story' || sub === 'profile') {
    if (!csm.nickname) return m.reply(header('WAJIB SET NICKNAME') + `Kamu belum punya nama Hunter.\nGunakan:.csm nickname <nama>\n━━━━━━━━━━━`)

    const levelTitle = getTitle(csm.level)
    csm.title = levelTitle
    const relevantStory = getTitleBackstory(csm.level)

    if (csm.erasureProtection?.startsWith('horsemen:')) {
      const protection = csm.erasureProtection.split(':')[1]
      return m.reply(header('BACKSTORY TERKENDALI') + `🏷️ ${levelTitle}\n👤 ${csm.nickname}\n⚧️ ${csm.gender}\n📍 ${csm.location}\n\n${relevantStory}\n\n${ERASURE_BACKSTORIES[protection] || '🕳️ Erasure Effect mengubah ingatanmu menjadi potongan-potongan yang tidak lengkap.'}\n\nStory: ???/${STORY_LIST.length}\n━━━━━━━━━━━`)
    }

    let cap = header('BACKSTORY KAMU')
    cap += `🏷️ ${levelTitle}\n`
    cap += `👤 ${csm.nickname}\n`
    cap += `⚧️ ${csm.gender}\n`
    cap += `📍 ${csm.location}\n\n`
    cap += `${relevantStory}\n\n`
    cap += `Story Progress: ${csm.story}/${STORY_LIST.length}\n`
    if (csm.ending) cap += `🏁 Ending aktif: ${csm.ending}\n`
    cap += `━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'item' || sub === 'items' || sub === 'inventory') {
    const foundItems = ITEM_LIST.filter(item => csm.foundItems.includes(item.nama))
    let cap = header('RIWAYAT ITEM')
    cap += `Item ditemukan: ${foundItems.length}/${ITEM_LIST.length}\n\n`
    cap += foundItems.length ? foundItems.map(item => `${item.emoji} ${item.nama} [${item.tier}]`).join('\n') : 'Belum ada item yang ditemukan.'
    return m.reply(`${cap}\n━━━━━━━━━━━`)
  }

  if (sub === 'title' || sub === 'titles') {
    const currentLevel = Number(csm.level) || 1
    const currentTitle = getTitle(currentLevel)
    let cap = header('TITLE HUNTER')
    cap += `🏷️ Title saat ini: *${currentTitle}*\n`
    cap += `📊 Level: ${currentLevel}\n\n`
    cap += `Title terbuka: ${TITLE_LIST.filter(([minimumLevel]) => currentLevel >= minimumLevel).length}/${TITLE_LIST.length}\n`
    cap += `Title saat ini: ${currentTitle}\n`
    cap += `━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'buff' || sub === 'buffs') {
    const bonus = calcBonus(csm)
    const baseBonus = calcBonus({ partners: [] })
    const obtained = new Set(csm.buffHistory)
    const endingRewards = Array.isArray(csm.endingReward) ? csm.endingReward : []
    endingRewards.forEach(reward => obtained.add(reward.name))
    csm.partners.filter(partner => partner.status === 'active').forEach(partner => obtained.add(partner.name))
    let cap = header('RIWAYAT BUFF')
    const activeBuffs = BUFF_LIST.filter(key => bonus[key] !== baseBonus[key] || obtained.has(key))
    cap += `Buff aktif/terbuka: ${activeBuffs.length}/${BUFF_LIST.length}\n🏆 Reward ending tersimpan: ${endingRewards.length}\n━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'contract' || sub === 'contracts' || sub === 'contract-scenes' || sub === 'scenes') {
    let cap = header('CONTRACT SCENES')
    cap += `📜 Scene terbuka: ${csm.seenContractScenes.length}/${CSM_CONTENT_TOTALS.contractScenes}\n\n`
    cap += `\n━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'explore' || sub === 'explorestories') {
    let cap = header('EXPLORE STORIES')
    cap += `🗺️ Story ditemukan: ${csm.seenExploreStories.length}/${CSM_CONTENT_TOTALS.exploreStories}`
    cap += `\n━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'mission' || sub === 'missionstories') {
    let cap = header('MISSION STORIES')
    cap += `🎯 Story misi ditemukan: ${csm.seenMissionStories.length}/${CSM_CONTENT_TOTALS.missionStories}`
    cap += `\n━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'rescue' || sub === 'rescues') {
    let cap = header('RESCUE STORIES')
    cap += `🚑 Story rescue: ${csm.seenRescueStories.length}/${CSM_CONTENT_TOTALS.rescueStories}\n`
    cap += `📋 Hasil rescue: ${csm.seenRescueResults.length}/${CSM_CONTENT_TOTALS.rescueResults}`
    cap += `\n━━━━━━━━━━━`
    return m.reply(cap)
  }
  if (sub === 'work') {
    const current = csm.job ? getJobData(csm, csm.job) : null
    return m.reply(header('PROGRESS KERJA') + `Job aktif: ${csm.job || 'Tidak ada'}\n${current ? `Level: ${current.level}\nEXP: ${current.exp}/${Math.floor(100 * Math.pow(current.level, 1.5))}\n` : ''}Story kerja: ${csm.workStories?.length || 0}/10\n━━━━━━━━━━━`)
  }
  if (sub === 'location' || sub === 'locations' || sub === 'visit') {
    const history = Array.isArray(csm.locationHistory) ? csm.locationHistory : [csm.location || 'Markas Public Safety']
    let cap = header('LOKASI & RIWAYAT')
    cap += `📍Location :\n ${csm.location || 'Markas Public Safety'}\n\n`
    cap += `🗺️ Riwayat lokasi:\n`
    history.slice(-10).forEach((loc, index) => {
      cap += `${index + 1}. ${loc}\n`
    })
    cap += `━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'character' || sub === 'characters' || sub === 'char') {
    const owned = csm.partners.length
    return m.reply(header('PROGRESS CHARACTER') + `Partner dimiliki: ${owned}/${CHARACTER_LIST.length}\nPartner aktif: ${csm.partners.filter(partner => partner.status === 'active').length}/5\n━━━━━━━━━━━`)
  }

  if (sub === 'database' || sub === 'devil') {
    const contracted = csm.contractHistory.length
    return m.reply(header('PROGRESS DATABASE DEVIL') + `Devil terdata: ${new Set(csm.contractHistory).size}/${DEVIL_LIST.length}\nKontrak tercatat: ${contracted}\n━━━━━━━━━━━`)
  }

  if (sub === 'terror') {
    const success = csm.terrorStory.filter(entry => entry.result === 'success').length
    return m.reply(header('PROGRESS TERROR') + `Percobaan: ${csm.terrorStory.length}/10\nBerhasil: ${success}\n━━━━━━━━━━━`)
  }

  let cap = header('MENU VIEW')
  cap += `📖 .csm view backstory - Lihat backstory kamu\n`
  cap += `📦 .csm view item - Progress item ditemukan\n`
  cap += `📍 .csm view location - Lihat lokasi saat ini dan riwayat\n`
  cap += `👥 .csm view character - Lihat database karakter\n`
  cap += `👹 .csm view database - Lihat database devil\n`
  cap += `😈 .csm view terror - Lihat catatan terror\n`
  cap += `🏷️ .csm view title - Lihat progress title Hunter\n`
  cap += `✨ .csm view buff - Lihat buff didapat dan belum aktif\n`
  cap += `⛓️ .csm view contract - Lihat contract scenes\n`
  cap += `🔎 .csm view explore - Lihat explore stories\n`
  cap += `🎯 .csm view mission - Lihat mission stories\n`
  cap += `🚑 .csm view rescue - Lihat rescue stories dan hasilnya\n━━━━━━━━━━━`
  return m.reply(cap)
}

// === EVENT 🎲
if (action === 'event') {
  let cap = header('EVENT CSM RPG')
  cap += `|Daftar event yang tersedia:\n\n`
  EVENT_LIST.forEach((event, index) => {
    cap += `>  *${index + 1}.* 🎲 *${event.name}*\n`
    cap += `>  Command: ${event.command}\n`
    cap += `>  ${event.description}\n\n`
  })
  cap += `>  Gunakan command pada masing-masing event untuk membaca pilihan dan menjalankan mekaniknya.\n`
  cap += `>  Event aktif: ${EVENT_LIST.length}\n`
  cap += `| ━━━━━━━━━━━`
  return m.reply(cap)
}

if (action === 'devilsbargain') {
  const sub = args[1]?.toLowerCase()
  if (!sub) return m.reply(header("THE DEVIL'S BARGAIN") +
    `Devil misterius menawarkan kekuatan besar selama 30 menit. Terima untuk mendapat Blood dan Damage lebih tinggi, tetapi kontrak akan menagih 10 HP saat berakhir.\n\n` +
    `Gunakan *.csm event devilsbargain terima* atau *.csm event devilsbargain tolak*.\n━━━━━━━━━━━`)
  if (sub === 'tolak') {
    const leveled = addExp(50)
    return m.reply(header('KONTRAK DITOLAK') + `Kamu menolak tawaran Devil dan tetap memegang kendali.\n📈 +50 EXP${leveled ? `\n🎉 LEVEL UP! Lv.${csm.level}` : ''}\n━━━━━━━━━━━`)
  }
  if (sub === 'terima') {
    if (csm.devilBargain?.expiresAt > Date.now()) return m.reply(header('KONTRAK AKTIF') + `Devil masih memberimu kekuatan.\n━━━━━━━━━━━`)
    csm.blood += 10000
    csm.devilBargain = { expiresAt: Date.now() + 1800000, damageMultiplier: 1.25 }
    saveDB(wdb)
    return m.reply(header('KONTRAK DITERIMA') + `🩸 +10.000 Blood\n⚔️ Damage +25% selama 30 menit. Setelah itu, HP akan ditagih oleh kontrak.\n━━━━━━━━━━━`)
  }
  return m.reply(header('FORMAT SALAH') + `Gunakan *.csm event devilsbargain terima* atau *.csm event devilsbargain tolak*.\n━━━━━━━━━━━`)
}

if (action === 'eyesofcontrol') {
  const sub = args[1]?.toLowerCase()
  if (!sub) return m.reply(header('EYES OF CONTROL') + `Makima sedang mengawasi perkembanganmu. Loyalitas memberi perlindungan dan hadiah, penolakan membuatnya lebih curiga.\n\nGunakan *.csm event eyesofcontrol loyal* atau *.csm event eyesofcontrol tolak*.\n━━━━━━━━━━━`)
  if (sub === 'loyal') {
    csm.makimaAttention = Math.min(100, (csm.makimaAttention || 0) + 15)
    csm.blood += 5000
    const leveled = addExp(75)
    saveDB(wdb)
    return m.reply(header('LOYALITAS DITERIMA') + `Makima memberimu perlindungan sementara.\n🩸 +5.000 Blood\n📈 +75 EXP\n👁️ Perhatian Makima: ${csm.makimaAttention}%${leveled ? `\n🎉 LEVEL UP! Lv.${csm.level}` : ''}\n━━━━━━━━━━━`)
  }
  if (sub === 'tolak') {
    csm.makimaAttention = Math.min(100, (csm.makimaAttention || 0) + 25)
    const leveled = addExp(100)
    saveDB(wdb)
    return m.reply(header('PENGAWASAN DITOLAK') + `Kamu menolak kendali Makima dan memilih bergerak bebas.\n📈 +100 EXP\n👁️ Kecurigaan Makima: ${csm.makimaAttention}%${leveled ? `\n🎉 LEVEL UP! Lv.${csm.level}` : ''}\n━━━━━━━━━━━`)
  }
  return m.reply(header('FORMAT SALAH') + `Gunakan *.csm event eyesofcontrol loyal* atau *.csm event eyesofcontrol tolak*.\n━━━━━━━━━━━`)
}

if (action === 'bloodfrenzy') {
  const sub = args[1]?.toLowerCase()
  if (!sub) return m.reply(header('BLOOD FRENZY') + `Naluri Devil memberimu Blood Gain x2 dan Terror tanpa cooldown selama 30 menit, dengan risiko HP terkuras.\n\nGunakan *.csm event bloodfrenzy ikut* atau *.csm event bloodfrenzy tahan*.\n━━━━━━━━━━━`)
  if (sub === 'tahan') {
    const leveled = addExp(50)
    return m.reply(header('NALURI DITAHAN') + `Kamu menahan haus darah sebelum kehilangan kendali.\n📈 +50 EXP${leveled ? `\n🎉 LEVEL UP! Lv.${csm.level}` : ''}\n━━━━━━━━━━━`)
  }
  if (sub === 'ikut') {
    csm.bloodFrenzy = { expiresAt: Date.now() + 1800000 }
    saveDB(wdb)
    return m.reply(header('BLOOD FRENZY AKTIF') + `🩸 Blood dari Terror menjadi x2.\n⏱️ Terror tidak memiliki cooldown selama 30 menit.\n⚠️ Setiap Terror memiliki peluang mengurangi 5 HP.\n━━━━━━━━━━━`)
  }
  return m.reply(header('FORMAT SALAH') + `Gunakan *.csm event bloodfrenzy ikut* atau *.csm event bloodfrenzy tahan*.\n━━━━━━━━━━━`)
}

// === ABOUT ℹ️
if (action === 'about') {
  const totalLocations = MAIN_LOCATION_LIST.length + SIDE_LOCATION_LIST.length
  const totalJobs = MAIN_JOB_LIST.length + SIDE_JOB_LIST.length
  const totalTitles = TITLE_LIST.length + 1
  const totalBuffs = BUFF_LIST.length
  const totalFeatures = COMMAND_SECTIONS.length

  const aboutSettings = wdb.csmAbout && typeof wdb.csmAbout === 'object' ? wdb.csmAbout : {}
  const developerNumber = String(aboutSettings.developer || '@6282228638623').replace(/\D/g, '')
  const supportedBy = aboutSettings.supported || 'Nelson'
  let cap = header('📜 TENTANG CSM RPG') + '\n\n'
  cap += `Chainsaw Man RPG adalah game teks RPG berbasis WhatsApp dengan tema Chainsaw Man karya Tatsuki Fujimoto.\n\n`
  cap += `Kamu berperan sebagai Devil Hunter di dunia Chainsaw Man. Tugasmu berburu iblis, menyelesaikan kontrak, dan bertahan hidup di tengah kekacauan.\n\n`

  cap += `*⚡ FITUR UTAMA:*\n`
  cap += `> 🗺️ Eksplorasi lokasi untuk cari darah, item, dan encounter random\n`
  cap += `> 📋 Sistem Mission & Rescue buat farming EXP dan Darah\n`
  cap += `> 👥 Rekrut partner dari karakter canon: Denji, Aki, Power, Makima, Reze, dll\n`
  cap += `> 🛡️ Tim max 5 partner aktif dengan buff DMG, DEF, EXP, dll\n`
  cap += `> 🎁 Gift darah/uang ke partner buat naikin love dan rekrut\n\n`

  cap += `*⛓️ SISTEM KONTRAK:*\n`
  cap += `> 🎰 Gacha kontrak Host, Fiend, Hybrid, Devil\n`
  cap += `> ⏰ Trial 2 hari atau Deal permanen\n`
  cap += `> 🔒 Erasure Protection: Horsemen, Fiend, Hybrid biar aman dari reset\n`
  cap += `> 🩸 Darah sebagai mata uang utama game\n\n`

  cap += `*📖 STORY & PROGRESS:*\n`
  cap += `> 📚 ${STORY_LIST.length} Arc story ngikutin alur manga\n`
  cap += `> 🏁 7 Ending berbeda: Freedom, Apocalypse, Control, Sacrifice, Love, Revenge, Peace\n`
  cap += `> ✨ Setiap ending kasih buff permanen\n`
  cap += `> 💼 Sistem kerja 10 menit buat gaji + level job\n\n`

  cap += `*🎮 KONTEN LAIN:*\n`
  cap += `> ⚔️ Toko senjata dengan durability & repair\n`
  cap += `> 👹 Raid boss bareng 10 player tiap hari\n`
  cap += `> ⚔️ Duel 1v1 antar player dengan taruhan darah\n`
  cap += `> 📞 Event MakimaCall acak saat work/mission\n`
  cap += `> 🏥 Hospital buat revive partner sekarat\n\n`

  cap += `Target game ini: grinding, koleksi partner, kuat-kuatan, dan nikmatin cerita Chainsaw Man dengan gaya brutal tapi santai.\n\n`

  cap += `*📊 STATISTIK GAME:*\n`
  cap += `> 💻 Jumlah Command: ${getCommandCount()}\n`
  cap += `> 🎉 Jumlah Event: ${EVENT_LIST.length}\n`
  cap += `> 👤 Jumlah Karakter: ${CHARACTER_LIST.length}\n`
  cap += `> 😈 Jumlah Devil: ${DEVIL_LIST.length}\n`
  cap += `> 🗺️ Jumlah Lokasi: ${totalLocations}\n`
  cap += `> 🪚 Jumlah Weapon: ${WEAPON_LIST.length}\n`
  cap += `> 💼 Jumlah Job: ${totalJobs}\n`
  cap += `> 🎒 Jumlah Item: ${ITEM_LIST.length}\n`
  cap += `> 👑 Jumlah Boss Raid: ${DEVIL_LIST.filter(devil => devil.tipe === 'Devil').length}\n`
  cap += `> 🏆 Jumlah Achievement: ${ACHIEVEMENT_LIST.length}\n`
  cap += `> 🌠 Jumlah Title: ${totalTitles}\n`
  cap += `> ✨ Jumlah Buff: ${totalBuffs}\n`
  cap += `> ⚙️ Jumlah Fitur: ${totalFeatures}\n`
  cap += `> 📖 Jumlah Arc: ${STORY_LIST.length}\n\n`

  cap += `*⚠️ CATATAN:*\n`
  cap += `> Statistik di atas bisa terus bertambah seiring berjalannya waktu dan update versi game kedepannya.\n`
  cap += `> Jadi pantengin terus ya Devil Hunter! 👊😈\n\n`
  cap += `━━━━━━━━━━━\n`
  cap += `Versi: 9.0 Beta Test\n`
  cap += `Developer: @${developerNumber}\n`
  cap += `Supported by : ${supportedBy}\n`
  cap += `CSM Creator : Tatsuki Fujimoto\n`
  cap += `━━━━━━━━━━━`
  return sendCsmReply(cap, CSM_PICTURES.about)
}

// === COMMAND LIST 📋
if (action === 'command'){
  let cap = header('DAFTAR COMMAND CSM RPG')
  cap += `| Total command aktif: ${getCommandCount()}\n`
  cap += `| Gunakan *.csm start* untuk memulai permainan.\n`
  cap += `|━━━━━━━━━━━\n\n`
  COMMAND_SECTIONS.forEach((section, sectionIndex) => {
    cap += `|*${sectionIndex + 1}. ${section.title}*\n`
    section.commands.forEach(([command, description]) => {
      cap += `> .csm ${command}${description ? ` - ${description}` : ''}\n`
    })
    cap += `|━━━━━━━━━━━\n\n`
  })
  return m.reply(cap)

  /*
  cap += `|*1. 🏠 DASAR*\n`
  cap += `> .csm start - Mulai permainan\n`
  cap += `> .csm profile - Menu utama\n`
  cap += `> .csm stats - Detail status & buff\n`
  cap += `> .csm about - Tentang game & statistik\n`
  cap += `> .csm nickname <nama> - Set nama hunter\n`
  cap += `> .csm gender <pria/wanita> - Set gender\n`
  cap += `> .csm rest - Istirahat +40% HP [CD 5 menit]\n`
  cap += `> .csm blood <jumlah> - Tukar Rp ke Darah\n`
  cap += `> .csm blood deal/cancel - Konfirmasi tukar\n`
  cap += `> .csm tutorial - Panduan pemula\n`
  cap += `|━━━━━━━━━━━\n\n`

  cap += `|*2. 🗺️ EKSPLORASI*\n`
  cap += `> .csm location - Lihat daftar lokasi\n`
  cap += `> .csm visit <nama/nomor> - Kunjungi lokasi\n`
  cap += `> .csm explore - Explore random [CD 10 menit]\n`
  cap += `> .csm mission - Terima misi berburu\n`
  cap += `> .csm mission fight/run - Lawan/Kabur\n`
  cap += `> .csm rescue - Operasi penyelamatan [CD 20m]\n`
  cap += `> .csm terror - Lihat catatan terror\n`
  cap += `|━━━━━━━━━━━\n\n`

  cap += `|*3. 👥 PARTNER & SOSIAL*\n`
  cap += `> .csm partner database - Lihat semua karakter\n`
  cap += `> .csm partner list - Lihat partner kamu\n`
  cap += `> .csm partner recruit <nomor/nama> - Rekrut\n`
  cap += `> .csm partner team - Lihat tim aktif\n`
  cap += `> .csm partner team add <nomor> - Masukkan tim\n`
  cap += `> .csm partner team remove <nomor> - Cadangkan\n`
  cap += `> .csm partner achievement - Lihat achievement\n`
  cap += `> .csm char <nama> - Detail karakter\n`
  cap += `> .csm gift - Lihat cara gift\n`
  cap += `> .csm gift bank/darah @tag <jumlah> - Gift ke player\n`
  cap += `> .csm gift partner blood/money <nomor> <love> - Gift ke char\n`
  cap += `> .csm hospital - Lihat partner sekarat\n`
  cap += `> .csm revive <nomor> - Hidupkan partner 5000 Darah\n`
  cap += `|━━━━━━━━━━━\n\n`

  cap += `|*4. ⛓️ KONTRAK*\n`
  cap += `> .csm contract - Info kontrak\n`
  cap += `> .csm contract host/fiend/hybrid/devil - Gacha kontrak\n`
  cap += `> .csm contract trial <angka> - Sewa 2 hari\n`
  cap += `> .csm contract deal <angka> - Beli permanen\n`
  cap += `> .csm contract list/info <angka> - Lihat database\n`
  cap += `> .csm contract database/history - Database global\n`
  cap += `> .csm contract trial yes/no - Konfirmasi trial\n`
  cap += `> .csm contract deal yes/no - Konfirmasi deal\n`
  cap += `> .csm event erasure - Info perlindungan\n`
  cap += `> .csm event erasure horsemen <1-5> / <makima/yoru/fami/nayuta/death>\n`
  cap += `> .csm event erasure fiend/hybrid - Pilih perlindungan\n`
  cap += `> .csm event erasure confirm/cancel - Kunci/Pilih ulang\n`
  cap += `> .csm event erasure yes/no - Terima/Hapus data\n`
  cap += `> *⚠️ Erasure mengunci kontrak*\n`
  cap += `|━━━━━━━━━━━\n\n`

  cap += `|*5. 🛒 TOKO*\n`
  cap += `> .csm shop - Buka toko\n`
  cap += `> .csm shop weapon - Lihat daftar senjata\n`
  cap += `> .csm shop weapon buy <nomor/nama> - Beli\n`
  cap += `> .csm shop weapon info <nomor/nama> - Info\n`
  cap += `> .csm shop item - Lihat item [Coming Soon]\n`
  cap += `> .csm inv - Lihat inventory\n`
  cap += `> .csm equip <nomor/nama> - Pasang senjata\n`
  cap += `> .csm repair <nomor/nama> - Perbaiki senjata\n`
  cap += `> .csm sell <nomor> - Jual masuk Bank 50%\n`
  cap += `|━━━━━━━━━━━\n\n`

  cap += `|*6. 📖 STORY*\n`
  cap += `> .csm story - Jalankan arc berikutnya\n`
  cap += `> .csm story replay <angka> - Ulang arc [CD 1 jam]\n`
  cap += `> .csm storylist - Lihat daftar 14 arc\n`
  cap += `> .csm ending <1-7> - Pilih ending [Arc 14]\n`
  cap += `|━━━━━━━━━━━\n\n`

  cap += `|*7. 💼 KERJA*\n`
  cap += `> .csm job list - Lihat daftar pekerjaan\n`
  cap += `> .csm job - Lihat riwayat kerja\n`
  cap += `> .csm job info - Info job yg sedang jalan\n`
  cap += `> .csm job join <nomor/nama> - Lamar kerja\n`
  cap += `> .csm job leave - Resign [CD 1 jam]\n`
  cap += `> .csm work - Kerja dapat gaji [CD 10 menit]\n`
  cap += `|━━━━━━━━━━━\n\n`

  cap += `|*8. 👹 RAID*\n`
  cap += `> .csm raid - Info boss hari ini\n`
  cap += `> .csm raid create - Buat lobby\n`
  cap += `> .csm raid join - Gabung lobby\n`
  cap += `> .csm raid leave - Keluar lobby\n`
  cap += `> .csm raid team - Lihat anggota lobby\n`
  cap += `> .csm raid start - Mulai raid [Leader]\n`
  cap += `> .csm raid list - Lihat 50 boss raid\n`
  cap += `> .csm raid delete - Bubarkan lobby [Leader]\n`
  cap += `> .csm raid history - Riwayat 30 hari\n`
  cap += `|━━━━━━━━━━━\n\n`

  cap += `|*9. ⚔️ PVP & EVENT*\n`
  cap += `> .csm duel @tag <taruhan> - Duel antar player\n`
  cap += `> .csm event makimacall - Info perintah makima\n`
  cap += `> .csm event makimacall terima - Terima & lanjut ke duel\n`
  cap += `> .csm event makimacall tolak - Tolak -10.000 Darah\n`
  cap += `> .csm event - Lihat daftar event aktif\n`
  cap += `> .csm view - Menu view database\n`
  cap += `> .csm view backstory - Backstory kamu\n`
  cap += `> .csm view character - Database karakter\n`
  cap += `> .csm view database - Database devil\n`
  cap += `|━━━━━━━━━━━`
  return m.reply(cap)
  */
}

// === TUTORIAL PEMULA 📚
if (action === 'tutorial'){
  const sub = args[1]?.toLowerCase()

  // === MENU PILIHAN ===
  if (!sub) {
    let cap = header('PANDUAN CSM RPG')
    cap += `|Ketik *.csm tutorial <kategori>* untuk detail\n`
    cap += `|━━━━━━━━━━━\n\n`
    cap += `> *KATEGORI TERSEDIA:*\n`
    cap += `> 1. *.csm tutorial pemula* - Buat pemula\n`
    cap += `> 2. *.csm tutorial dasar* - Profil & status\n`
    cap += `> 3. *.csm tutorial eksplorasi* - Explore & misi\n`
    cap += `> 4. *.csm tutorial partner* - Partner & sosial\n`
    cap += `> 5. *.csm tutorial kontrak* - Kontrak & erasure\n`
    cap += `> 6. *.csm tutorial toko* - Toko & inventory\n`
    cap += `> 7. *.csm tutorial story* - Story & ending\n`
    cap += `> 8. *.csm tutorial kerja* - Job & work\n`
    cap += `> 9. *.csm tutorial raid* - Raid boss\n`
    cap += `> 10. *.csm tutorial pvp* - Duel & MakimaCall\n`
    cap += `> 11. *.csm tutorial full* - Lihat semua\n\n`
    cap += `> 💡 *Tips*: *.csm command* untuk lihat semua command\n`
    cap += `|━━━━━━━━━━━`
    return m.reply(cap)
  }

  // === TUTORIAL PEMULA ===
  if (sub === 'pemula') {
    let cap = header('PANDUAN PEMULA CSM')
    cap += `Selamat datang di Chainsaw Man RPG!\n`
    cap += `Gunakan *.csm command* untuk lihat semua list command.\n`
    cap += `|━━━━━━━━━━━\n\n`

    cap += ` *A. MULAI PERMAINAN*\n`
    cap += `> 1. *.csm start* - Buat karakter\n`
    cap += `> 2. *.csm profile* - Cek status\n`
    cap += `> 3. *.csm explore* - Cari darah\n`
    cap += `> 4. *.csm rest* - Heal kalo darah habis\n`

    cap += ` *B. PROGRESS DASAR*\n`
    cap += `> 1. *.csm mission* lalu *.csm mission fight*\n`
    cap += `> 2. *.csm mission run* - Kalo mau kabur\n`
    cap += `> 3. *.csm partner recruit <nama>* - Cari partner\n`
    cap += `> 4. *.csm partner team add <nomor>* - Masuk tim\n\n`

    cap += ` *C. KONTRAK IBLIS*\n`
    cap += `> 1. *.csm contract* - Lihat kontrak\n`
    cap += `> 2. *.csm contract deal <angka>* - Beli permanen\n`
    cap += `> 3. *.csm contract yes* - Konfirmasi\n\n`

    cap += ` *D. EQUIPMENT*\n`
    cap += `> 1. *.csm shop weapon* - Buka toko\n`
    cap += `> 2. *.csm shop weapon buy 1* - Beli\n`
    cap += `> 3. *.csm equip 1* - Pakai\n`
    cap += `> 4. *.csm inv* - Cek tas\n\n`

    cap += ` *E. STORY & KERJA*\n`
    cap += `> 1. *.csm story* - Main story\n`
    cap += `> 2. *.csm job list* - Cari kerja\n`
    cap += `> 3. *.csm work* - Dapat uang\n`

    cap += ` *F. RAID*\n`
    cap += `> 1. *.csm raid create* - Buat lobby\n`
    cap += `> 2. *.csm raid join* - Ajak temen\n`
    cap += `> 3. *.csm raid start* - Mulai\n\n`
    cap += `> 💡 *Tips*: Kalo bingung command, *.csm command*\n`
    cap += `|━━━━━━━━━━━`
    return m.reply(cap)
  }

  // === TUTORIAL DASAR ===
  if (sub === 'dasar') {
    let cap = header('TUTORIAL: DASAR')
    cap += ` *COMMAND DASAR:*\n`
    cap += `> 1. *.csm start* - Buat karakter baru\n`
    cap += `> 2. *.csm profile* - Lihat status, HP, level, darah\n`
    cap += `> 3. *.csm stats* - Lihat detail buff & bonus\n`
    cap += `> 4. *.csm nickname <nama>* - Ganti nama hunter\n`
    cap += `> 5. *.csm gender <pria/wanita>* - Set gender\n`
    cap += `> 6. *.csm rest - Heal 40% HP [CD 5 menit]\n`
    cap += `> 7. *.csm blood <jumlah> - Tukar Rp ke Darah rate 1500=1\n`
    cap += `> 8. *.csm blood deal - Konfirmasi tukar\n`
    cap += `> 9. *.csm blood cancel - Batalkan\n`
    cap += `|━━━━━━━━━━━\n|Gunakan darah untuk kontrak, weapon, dll.`
    return m.reply(cap)
  }

  // === TUTORIAL EKSPLORASI ===
  if (sub === 'eksplorasi') {
    let cap = header('TUTORIAL: EKSPLORASI')
    cap += ` *COMMAND EKSPLORASI:*\n`
    cap += `> 1. *.csm location - Lihat daftar lokasi\n`
    cap += `> 2. *.csm visit <nama> - Pindah lokasi [CD 1 jam]\n`
    cap += `> 3. *.csm explore - Cari item, darah, char [CD 10m]\n`
    cap += `> 4. *.csm mission - Terima misi random\n`
    cap += `> 5. *.csm mission fight - Lawan devil di misi\n`
    cap += `> 6. *.csm mission run - Kabur & curi darah\n`
    cap += `> 7. *.csm rescue - Selametin warga [CD 20m]\n`
    cap += `> 8. *.csm terror - Lihat catatan terror\n`
    cap += `|━━━━━━━━━━━\n|*Tips*: Explore buat farming darah & item.`
    return m.reply(cap)
  }

  // === TUTORIAL PARTNER ===
  if (sub === 'partner') {
    let cap = header('TUTORIAL: PARTNER & SOSIAL')
    cap += ` *COMMAND PARTNER:*\n`
    cap += `> 1. *.csm partner database - Lihat semua karakter\n`
    cap += `> 2. *.csm partner list - Lihat partner yg kamu punya\n`
    cap += `> 3. *.csm partner recruit <nama> - Rekrut kalo love cukup\n`
    cap += `> 4. *.csm partner team - Lihat tim aktif [max 5]\n`
    cap += `> 5. *.csm partner team add <nomor> - Masukkan ke tim\n`
    cap += `> 6. *.csm partner team remove <nomor> - Cadangkan\n`
    cap += `> 7. *.csm char <nama> - Lihat detail karakter\n`
    cap += `> 8. *.csm gift partner blood/money <nama> <love> - Naikin love\n`
    cap += `> 10. *.csm gift bank/darah @tag <jumlah> - Gift ke player\n`
    cap += `> 11. *.csm hospital - Lihat partner sekarat\n`
    cap += `> 12. *.csm revive <nomor> - Hidupkan 5000 Darah\n`
    cap += `|━━━━━━━━━━━\n|*Rate*: 1500 Darah = 1 Love`
    return m.reply(cap)
  }

  // === TUTORIAL KONTRAK ===
  if (sub === 'kontrak') {
    let cap = header('TUTORIAL: KONTRAK & ERASURE')
    cap += ` *COMMAND KONTRAK:*\n`
    cap += `> 1. *.csm contract - Info kontrak aktif\n`
    cap += `> 2. *.csm contract host/fiend/hybrid/devil - Gacha\n`
    cap += `> 3. *.csm contract trial <angka> - Sewa 2 hari\n`
    cap += `> 4. *.csm contract deal <angka> - Beli permanen\n`
    cap += `> 5. *.csm contract list - Lihat semua devil\n`
    cap += `> 6. *.csm contract list info <angka> - Info detail\n`
    cap += `> 7. *.csm contract trial yes/no - Konfirmasi trial\n`
    cap += `> 8. *.csm contract deal yes/no - Konfirmasi deal\n`
    cap += `|━━━━━━━━━━━\n|`
    return m.reply(cap)
  }

  // === TUTORIAL TOKO ===
if (sub === 'toko') {
  let cap = header('TUTORIAL: TOKO & INVENTORY')

  cap += `*COMMAND TOKO:*\n`
  cap += `> 1. *.csm shop* - Buka toko\n`
  cap += `> 2. *.csm shop weapon* - Lihat daftar senjata\n`
  cap += `> 3. *.csm shop weapon info <nomor/nama>* - Lihat info senjata\n`
  cap += `> 4. *.csm shop weapon buy <nomor/nama>* - Beli senjata\n`
  cap += `> 5. *.csm shop item* - Lihat daftar item\n\n`

  cap += `*COMMAND INVENTORY:*\n`
  cap += `> 6. *.csm inv* - Lihat inventory\n`
  cap += `> 7. *.csm equip <nomor/nama>* - Pasang senjata\n`
  cap += `> 8. *.csm repair <nomor/nama>* - Perbaiki durability senjata\n`
  cap += `> 9. *.csm sell <nomor>* - Jual item dari inventory\n\n`

  cap += `*COMMAND BLOOD:*\n`
  cap += `> 10. *.csm blood* - Lihat Blood & saldo Bank\n`
  cap += `> 11. *.csm blood convert <jumlah>* - Buat konversi Bank → Blood\n`
  cap += `> 12. *.csm blood deal* - Konfirmasi konversi\n`
  cap += `> 13. *.csm blood cancel* - Batalkan konversi\n\n`

  cap += `|━━━━━━━━━━━\n`
  cap += `|*Tips*: Nomor sell/equip/repair mengikuti nomor inventory gabungan Weapon + Item.\n`
  cap += `|Weapon dapat kehilangan durability saat fight & raid.\n`
  cap += `|Weapon dijual 50% harga beli, sedangkan Item memakai harga jual tetap.`

  return m.reply(cap)
}

  // === TUTORIAL STORY ===
  if (sub === 'story') {
    let cap = header('TUTORIAL: STORY & ENDING')
    cap += ` *COMMAND STORY:*\n`
    cap += `> 1. *.csm story - Jalanin arc berikutnya [Butuh Darah]\n`
    cap += `> 2. *.csm story replay <angka> - Ulang arc lama [CD 1 jam]\n`
    cap += `> 3. *.csm storylist - Lihat 14 arc + cost\n\n`
    cap += ` *COMMAND ENDING:*\n`
    cap += `> 4. *.csm ending <1-7> - Pilih ending di Arc 15\n`
    cap += `> 5. *.csm ending terima/tolak - Konfirmasi pilihan ending\n\n`
    cap += ` *COMMAND EVENT:*\n`
    cap += `> 7. *.csm event makimacall - Info perintah Makima\n`
    cap += `> 8. *.csm event makimacall terima - Terima & lanjut duel\n`
    cap += `> 9. *.csm event makimacall tolak - Tolak -10.000 Darah\n`
    cap += `> 10. *.csm event erasure - Lihat pilihan perlindungan\n`
    cap += `> 11. *.csm event erasure horsemen <1-5> / <makima/yoru/fami/nayuta/death>\n`
    cap += `> 12. *.csm event erasure fiend/hybrid - Pilih tipe\n`
    cap += `> 13. *.csm event erasure confirm - Kunci pilihan\n`
    cap += `> 14. *.csm event erasure yes - Hapus data story & kontrak\n`
    cap += `|━━━━━━━━━━━\n|*⚠️ Erasure mengunci tipe kontrak kamu*`
    return m.reply(cap)
  }

  // === TUTORIAL KERJA ===
  if (sub === 'kerja') {
    let cap = header('TUTORIAL: KERJA')
    cap += ` *COMMAND KERJA:*\n`
    cap += `> 1. *.csm job list - Lihat daftar job main & side\n`
    cap += `> 2. *.csm job - Lihat riwayat & level job\n`
    cap += `> 3. *.csm job info - Info job yg sedang dijalani\n`
    cap += `> 4. *.csm job join <nomor> - Lamar pekerjaan\n`
    cap += `> 5. *.csm job leave - Resign [CD 1 jam]\n`
    cap += `> 6. *.csm work - Kerja dapat gaji [CD 10 menit]\n`
    cap += `|━━━━━━━━━━━\n|*Tips*: Level job naikin gaji. x1.25 per level`
    return m.reply(cap)
  }

  // === TUTORIAL RAID ===
  if (sub === 'raid') {
    let cap = header('TUTORIAL: RAID')
    cap += ` *COMMAND RAID:*\n`
    cap += `> 1. *.csm raid - Lihat boss hari ini & HP\n`
    cap += `> 2. *.csm raid create - Buat lobby [Max 10 orang]\n`
    cap += `> 3. *.csm raid join - Gabung lobby\n`
    cap += `> 4. *.csm raid leave - Keluar lobby\n`
    cap += `> 5. *.csm raid team - Lihat anggota\n`
    cap += `> 6. *.csm raid start - Mulai raid [Hanya Leader]\n`
    cap += `> 7. *.csm raid list - Lihat 50 boss\n`
    cap += `> 8. *.csm raid history - Riwayat 30 hari\n`
    cap += `> 9. *.csm raid delete - Bubarkan lobby [Leader]\n`
    cap += `|━━━━━━━━━━━\n|*Reward*: Darah & EXP gede per hunter`
    return m.reply(cap)
  }

  // === TUTORIAL PVP ===
  if (sub === 'pvp') {
    let cap = header('TUTORIAL: PVP & EVENT')
    cap += ` *COMMAND PVP:*\n`
    cap += `> 1. *.csm duel @tag <taruhan> - Duel 1v1\n`
    cap += `> 2. Pemenang dapat taruhan darah lawan\n`
    cap += ` *COMMAND VIEW:*\n`
    cap += `> 3. *.csm view backstory - Lihat backstory\n`
    cap += `> 4. *.csm view character - Database karakter\n`
    cap += `> 5. *.csm view database - Database devil\n`
    cap += `|━━━━━━━━━━━\n|`
    return m.reply(cap)
  }

  // === TUTORIAL FULL ===
  if (sub === 'full') {
    let cap = header('TUTORIAL LENGKAP V9')
    cap += ` Ini semua command CHAINSAW MAN RPG.\n`
    cap += `|━━━━━━━━━━━\n\n`
    cap += ` *A. DASAR*\n`
    cap += `> .csm start, profile, stats, nickname, gender, rest\n`
    cap += `> .csm blood, blood deal, blood cancel, tutorial\n\n`
    cap += ` *B. EKSPLORASI*\n`
    cap += `> .csm location, visit, explore, mission, fight, run\n`
    cap += `> .csm rescue, terror\n\n`
    cap += ` *C. PARTNER*\n`
    cap += `> .csm partner database, list, recruit, team, add, remove\n`
    cap += `> .csm char, gift, hospital, revive\n\n`
    cap += ` *D. KONTRAK*\n`
    cap += `> .csm contract, host, fiend, hybrid, devil, trial, deal\n`
    cap += `> .csm contract list, info, database, history, yes, no\n`
    cap += `> .csm event erasure, horsemen, fiend, hybrid, confirm, cancel, yes, no\n\n`
    cap += ` *E. TOKO*\n`
    cap += `> .csm shop, weapon, buy, info, item, inv, equip, repair, sell\n\n`
    cap += ` *F. STORY*\n`
    cap += `> .csm story, story replay, storylist, ending, reset\n\n`
    cap += ` *G. KERJA*\n`
    cap += `> .csm job list, job, job info, job join, job leave, work\n\n`
    cap += ` *H. RAID*\n`
    cap += `> .csm raid, create, join, leave, team, start, list, delete, history\n\n`
    cap += ` *I. PVP*\n`
    cap += `> .csm duel, makimacall, terima, tolak, view\n`
    cap += `|━━━━━━━━━━━`
    return m.reply(cap)
  }

  return m.reply(header('KATEGORI TIDAK ADA') + `Ketik *.csm tutorial* untuk lihat daftar kategori.\n━━━━━━━━━━━`)
}

// === MENU UTAMA / PROFILE 📋
if(!action || action === 'profile'){
  csm = user.csm
  if (!csm) return m.reply(header('BELUM START') + `|Gunakan .csm start untuk memulai\n|━━━━━━━━━━━`)
  let bonus = calcBonus(csm)
  let cap = header('MENU UTAMA')
  cap += ` 🏷️ ${csm.title}\n`
  cap += ` 👤 @${senderJid.split('@')[0]} | ${csm.gender}\n`
  cap += ` 📍 Location : ${csm.location}\n`
  cap += ` 📊 Lv.${csm.level} | 🩸 ${csm.blood.toLocaleString()} Darah\n`
  cap += ` ❤️ ${bar(Math.floor(csm.health/csm.maxHealth*100))} ${csm.health}/${csm.maxHealth}\n`
  cap += ` 💰 Rp ${userRPG.bank.toLocaleString()} Bank\n`
  cap += ` ⚔️ ${csm.weapon.nama} [Dur: ${csm.weapon.dur}]\n\n`
  cap += ` 👥 PARTNER: ${csm.partners.length}/5\n`
  cap += ` 📖 STORY: ${csm.story}/${STORY_LIST.length}\n`
  cap += ` ⛓️ KONTRAK: ${csm.devilContract || 'Tidak Ada'}\n`
  cap += ` 💼 PEKERJAAN: ${csm.job || 'Belum Kerja'}\n\n`
  cap += ` 📋 BANTUAN: ${usedPrefix}csm command \n`
  cap += ` 📚 TUTORIAL: ${usedPrefix}csm tutorial \n`
  cap += `|━━━━━━━━━━━`
  saveDB(wdb)
  return m.reply(cap)
}

// === STATS / BUFF DETAIL 📊
if (action === 'stats'){
  csm = user.csm
  if (!csm) return m.reply(header('BELUM START') + `|Gunakan.csm start untuk memulai\n|━━━━━━━━━━━`)

  let b = calcBonus(csm)
  let setBonus = calcSetBonus(csm)
  let active = csm.partners.filter(p => p.status === 'active')

  let cap = header('STAT DETAIL & BUFF')
  cap += ` 🏷️ ${csm.title} | Lv.${csm.level}\n`
  cap += ` ❤️ HP: ${csm.health}/${csm.maxHealth} | 🩸 ${csm.blood.toLocaleString()}\n`
  cap += ` 👥 Partner Aktif: ${active.length}/5\n`
  cap += `|━━━━━━━━━━━\n\n`

  cap += ` *⚔️ COMBAT*\n`
  cap += `> DMG: +${b.dmg}\n`
  cap += `> DEF: +${b.def}\n`
  cap += `> Crit: ${b.critChance}% | Crit Dmg: +${(b.critDmg*100).toFixed(0)}%\n`
  cap += `> Evasion: ${b.evasion}% | Accuracy: ${b.accuracy}%\n`
  cap += `> Speed: ${b.speed} | AoE: ${b.aoe}\n`
  cap += `> Pierce: ${b.pierce} | CC: ${b.cc} | CC Res: ${b.ccResist}\n`
  cap += `> Instant Kill: +${b.instantKill}% | Steal: +${b.stealBlood}\n`
  cap += `|━━━━━━━━━━━\n\n`

  cap += ` *🩹 SURVIVE*\n`
  cap += `> Regen: +${b.regen} HP\n`
  cap += `> Heal: +${b.heal}%\n`
  cap += `> Team HP: +${b.teamHp}\n`
  cap += `> Stamina: ${b.stamina} | Weapon Dur: ${b.weaponDur}\n`
  cap += `> Revive: ${b.revive? '✅' : '❌'}\n`
  cap += `|━━━━━━━━━━━\n\n`

  cap += ` *📈 GAIN*\n`
  cap += `> EXP: x${b.expMult.toFixed(2)}\n`
  cap += `> Blood: x${b.bloodMult.toFixed(2)}\n`
  cap += `> Blood Flat: +${b.bloodFlat}\n`
  cap += `> Find Item: +${(b.findItem*100).toFixed(0)}%\n`
  cap += `> Info: +${(b.info*100).toFixed(0)}%\n`
  cap += `> Discount: -${(b.discount*100).toFixed(0)}%\n`
  cap += `> Luck: +${(b.luck*100).toFixed(0)}%\n`
  cap += `|━━━━━━━━━━━\n\n`

  cap += ` *🔮 SPESIAL*\n`
  cap += `> Burn: ${b.burn} | Fire: ${b.fire} | Water: ${b.water} | Bleed: ${b.bleed}\n`
  cap += `> Auto Transform: ${b.autoTransform? '✅' : '❌'}\n`
  cap += `> Concept Erasure: ${b.conceptErasure? '✅' : '❌'}\n`
  cap += `> Teleport: ${b.teleportChance}%\n`
  cap += `|━━━━━━━━━━━\n\n`

  if(Object.keys(setBonus).length > 0){
    cap += `> *🔥 SET BONUS AKTIF*\n`
    for(let key in setBonus) cap += `|${key}: +${setBonus[key]}\n`
    cap += `|━━━━━━━━━━━\n\n`
  }

  cap += ` *👥 SUMMON*\n`
  cap += `> Summon: ${b.summon} | Doll Buff: ${b.dollBuff}\n`
  cap += `> Self Destruct: ${b.selfDestruct} | Craft: ${b.craftWeapon}\n`
  cap += `> Control: ${b.control} | Snake: ${b.snake}\n`
  cap += `\n *📚 CARA MENDAPATKAN BUFF*\n`
  buffGuide.forEach(entry => { cap += `> ${entry}\n` })
  cap += `|━━━━━━━━━━━`
  return m.reply(cap)
}

// === LOCATION 🗺️
if(action === 'location'){
  let sub = args[1] // info / nomor / nama

  //.csm location info <nama/nomor>
  if(sub === 'info'){
    let target = args.slice(2).join(' ').toLowerCase()
    if(!target) return m.reply(header('INFO LOKASI') + `|Gunakan:.csm location info <nama/nomor>\n|━━━━━━━━━━━`)

    let num = parseInt(target) - 1
    let allLoc = [...MAIN_LOCATION_LIST,...SIDE_LOCATION_LIST]
    let loc =!isNaN(num)? allLoc[num] : allLoc.find(l => l.nama.toLowerCase() === target)

    if(!loc) return m.reply(header('TIDAK DITEMUKAN') + `|Lokasi "${args.slice(2).join(' ')}" tidak ada.\n|━━━━━━━━━━━`)

    let rate = Math.floor((loc.rateDevil || 0) * 100)
    let color = getRateColor(loc.rateDevil || 0)

    let cap = header(`INFO: ${loc.nama.toUpperCase()}`)
    cap += ` Nama Lokasi : ${loc.nama}\n`
    cap += ` ${loc.desc || 'Tidak ada deskripsi'}\n`
    cap += `|━━━━━━━━━━━\n`
    cap += `> Devil Rate: ${color} ${rate}%\n`
    cap += `> Level Minimal: ${loc.level || 1}\n`
    cap += `> Drop: ${(loc.drop || []).join(', ') || '-'}\n`
    cap += `> Karakter: ${(loc.characters || []).join(', ') || '-'}\n`
    cap += `|━━━━━━━━━━━\n`
    cap += `|Kunjungi:.csm visit ${loc.nama}`
    return m.reply(cap)
  }

  //.csm location = tampilkan list
  let cap = header('DAFTAR LOKASI')

  cap += `|*MAIN LOCATIONS*\n`
  cap += `|━━━━━━━━━━━\n`
  MAIN_LOCATION_LIST.forEach((l,i) => {
    let rate = Math.floor((l.rateDevil || 0) * 100)
    let color = getRateColor(l.rateDevil || 0)
    cap += ` *${i+1}.* *${l.nama}*\n`
    cap += `> ${l.desc}\n`
    cap += `> Devil Rate: ${color} ${rate}%\n\n`
  })

  cap += `|━━━━━━━━━━━\n`
  cap += `|*SIDE LOCATIONS*\n`
  cap += `|━━━━━━━━━━━\n`
  SIDE_LOCATION_LIST.forEach((l,i) => {
    let nomor = i+1+MAIN_LOCATION_LIST.length
    let rate = Math.floor((l.rateDevil || 0) * 100)
    let color = getRateColor(l.rateDevil || 0)
    cap += ` *${nomor}.* *${l.nama}*\n`
    cap += `> ${l.desc}\n`
    cap += `> Devil Rate: ${color} ${rate}%\n\n`
  })

  cap += `|━━━━━━━━━━━\n\n`
  cap += `📌.csm visit <nama/nomor> [Cooldown 5 Menit]\n`
  cap += `📌.csm location info <nama/nomor>\n`
  cap += `|━━━━━━━━━━━`

  saveDB(wdb)
  return m.reply(cap)
}

// === VISIT 🚶
if (action === 'visit') {
  let sub = args[1]
  const knownLocation = ALL_LOCATION_LIST.find(location => location.nama === csm.location)
  if (!knownLocation || (csm.encounter && !['char', 'devil', 'makima_neraka'].includes(csm.encounter.type))) {
    csm.location = knownLocation?.nama || 'Markas Public Safety'
    csm.encounter = null
    saveDB(wdb)
  }
  const hasCharacterEncounter = csm.encounter?.type === 'char' &&
    Array.isArray(csm.encounter.all) && csm.encounter.all.length > 0

  if (csm.encounter && sub === 'stay') {
    return m.reply(header('TETAP DI LOKASI') + `Kamu tetap berada di ${csm.location}. Selesaikan interaksi yang tersedia terlebih dahulu.
━━━━━━━━━━━`)
  }

  if (csm.encounter && sub === 'leave') {
    csm.encounter = null
    saveDB(wdb)
    return m.reply(header('MENINGGALKAN LOKASI') + `Kamu meninggalkan ${csm.location}. Sekarang kamu bisa mengunjungi lokasi lain.
━━━━━━━━━━━`)
  }

  if (sub === 'info') {
    const characters = Array.isArray(csm.encounter?.all) ? csm.encounter.all : []
    return m.reply(header('KONDISI LOKASI') +
      `Location :\n📍 ${csm.location}\n\n` +
      `${characters.length ? `Karakter belum diinteraksi: ${characters.map(character => character.nama).join(', ')}` : 'Tidak ada interaksi yang tertunda.'}\n` +
      `Gunakan *.csm visit interact <nomor/nama>* atau *.csm visit leave*.\n━━━━━━━━━━━`)
  }

  //.csm visit interact <nama/nomor>
  if(sub === 'interact' && csm.encounter){
    if(csm.encounter.type!== 'char') return m.reply(header('GAGAL') + `|Ga ada karakter buat diajak ngobrol.\n|━━━━━━━━━━━`)

    let targetInput = args.slice(2).join(' ')
    if(!targetInput) return m.reply(header('GAGAL') + `|Gunakan:.csm visit interact <nomor/nama>\n|━━━━━━━━━━━`)

    let charList = csm.encounter.all || [csm.encounter.data]
    let num = parseInt(targetInput) - 1
    let char =!isNaN(num)? charList[num] : charList.find(c => c.nama.toLowerCase() === targetInput.toLowerCase())

    if(!char) return m.reply(header('GAGAL') + `|Karakter "${targetInput}" tidak ada di sini.\n|━━━━━━━━━━━`)

    if(!csm.relations[char.nama]) csm.relations[char.nama] = 0
    csm.relations[char.nama] += Math.floor(Math.random()*8) + 5

 let msg = header(`INTERAKSI DENGAN ${char.nama}`) +
  ` ${char.emoji} "${char.dialog[Math.floor(Math.random()*char.dialog.length)]}"\n` +
  `|━━━━━━━━━━━\n\n` +
  ` 💌 Hubungan: ${csm.relations[char.nama]}/${char.needLove}\n` +
  `|━━━━━━━━━━━`

    const remainingCharacters = charList.filter(character => character.nama !== char.nama)
    csm.encounter = remainingCharacters.length > 0
      ? { type: 'char', data: remainingCharacters[0], all: remainingCharacters }
      : null
    saveDB(wdb)
    await checkMakimaTrigger(m, csm, wdb)
    if (remainingCharacters.length > 0) {
      msg += `\nMasih ada karakter lain yang bisa diajak interaksi.\n` +
        `Gunakan *.csm visit interact <nomor/nama>* atau *.csm visit stay*.\n` +
        `Untuk pergi: *.csm visit leave ${csm.location}*\n`
    }
  return sendCsmReply(msg, getLocationPicture({ nama: csm.location }, [char, ...remainingCharacters]))
  }

  //.csm visit ignore
  if(sub === 'ignore' && csm.encounter){
    let expGain = Math.floor(Math.random() * 15) + 10
    addExp(expGain)
    let msg = header('MENGABAIKAN') +
      ` Kamu memilih mengabaikan mereka dan pergi.\n`
      `|━━━━━━━━━━━\n\n`
      ` 📈 +${expGain} EXP\n`
      `|━━━━━━━━━━━`

    csm.encounter = null
    saveDB(wdb)
    await checkMakimaTrigger(m, csm, wdb)
    return m.reply(msg)
  }

  //.csm visit makima fight
  if(sub === 'makima' && args[2] === 'fight' && csm.encounter?.type === 'makima_neraka'){
    csm.encounter = null
    let b = calcBonus(csm)
    let menang = Math.random() < 0.5 + (b.luck/2)

    let dialogMenang = [
      '⛓️ Ck... Kau beruntung kali ini.', '👁️ Tidak buruk. Jangan besar kepala.',
      '🩸 Hmph. Aku akui kau kuat.', '⚠️ Tch. Lain kali aku tidak akan mengalah.',
      '😒 Kau menang karena aku sedang membiarkanmu.', '🔪 Jangan kira ini mengubah apa pun.',
      '🌑 Menarik. Kau masih berdiri.', '🚪 Pergi sebelum aku berubah pikiran.',
      '⛓️ Keberanianmu merepotkan.', '👁️ Nikmati kemenangan kecil ini.'
    ]
    let dialogKalah = [
      '⛓️ Patuhlah. Kau hanya anjingku.', '👁️ Lihat? Kau lemah.',
      '🚪 Kembali ke tempatmu seharusnya.', '⚠️ Jangan pernah melawanku lagi.',
      '🩸 Darahmu bahkan tidak cukup untuk membuatku tertarik.', '😐 Kau membuat keputusan yang buruk.',
      '🔪 Aku sudah memberimu kesempatan.', '🌑 Berlutut. Jangan memaksaku mengulanginya.',
      '🚨 Public Safety akan menemukanmu setelah ini.', '⛓️ Kau kalah sebelum pertarungan dimulai.'
    ]

    if(menang){
      let bonus = Math.floor(csm.blood * 0.5 * b.bloodMult) + 100000 + b.stealBlood
      csm.blood += bonus
 let msg = header('KEMENANGAN MELAWAN MAKIMA') +
  ` ⛓️ *Makima*: "${dialogMenang[Math.floor(Math.random()*dialogMenang.length)]}"\n` +
  `|━━━━━━━━━━━\n\n` +
  ` 🩸 +${bonus.toLocaleString()} Darah [50% + 100.000 JACKPOT]\n` +
  `|━━━━━━━━━━━`
      saveDB(wdb)
  return sendCsmReply(msg, CSM_PICTURES.makimaHell)
    } else {
      let potongan = Math.floor(csm.blood * 0.5)
      csm.blood = Math.max(0, csm.blood - potongan)
      let msg = header('KEKALAHAN MELAWAN MAKIMA') +
        ` ⛓️ *Makima*: "${dialogKalah[Math.floor(Math.random()*dialogKalah.length)]}"\n` +
        `|━━━━━━━━━━━\n\n` +
        ` 🩸 -${potongan.toLocaleString()} Darah [50% HILANG]\n` +
        `|━━━━━━━━━━━`
      saveDB(wdb)
      return m.reply(msg)
    }
  }

  //.csm visit fight - KHUSUS VISIT
  if(sub === 'fight' && csm.encounter?.type === 'devil'){
    let devil = csm.encounter.data
    let helpers = csm.encounter.helpers || []

    if (!Array.isArray(csm.inventory) || csm.inventory.length === 0) csm.inventory = [{nama: 'Fist', dur: 999}]
    let weapon = csm.inventory[0]
    let weaponData = WEAPON_LIST.find(w => w.nama === weapon.nama) || WEAPON_LIST[0]
    let b = calcBonus(csm)
    let activePartners = csm.partners.filter(p => p.status === 'active')
    let battleEffects = []
    if (b.summon > 0) battleEffects.push(`👹 Devil tambahan berhasil disummon (+${b.summon * 10} DMG).`)
    if (b.army > 0) battleEffects.push(`🎖️ Bantuan Army Buff memperkuat serangan (+${b.army} DMG).`)

    let baseDmg = Math.floor(Math.random() * 15) + csm.level * 4 + weaponData.dmg + b.dmg // visit lebih lemah
    let dmg = baseDmg
    if(csm.devilContract === 'Chainsaw Devil' || b.autoTransform) dmg *= 2.5
    dmg += activePartners.reduce((total, partner) => total + getPartnerDamage(partner), 0)
    dmg = Math.floor(dmg * b.dmgMultiplier)
    dmg += helpers.length * 15
    if(Math.random() * 100 < b.critChance) dmg = Math.floor(dmg * (1.5 + b.critDmg))
    if(Math.random() * 100 < b.instantKill) dmg = devil.hp + 999
    if (b.cc > 0 && Math.random() * 100 < Math.min(75, b.cc)) {
      dmg += Math.floor(devil.hp * 0.2)
      battleEffects.push('⛓️ CC berhasil: lawan tidak bisa bergerak sesaat.')
    }
    if (b.selfDestruct > 0 && Math.random() < Math.min(0.5, b.selfDestruct / 1000)) {
      dmg += devil.hp * 2
      csm.health = 1
      battleEffects.push('💥 Self Destruct aktif: tubuhmu dikorbankan untuk ledakan damage besar.')
    }

    let dmgTaken = Math.floor(devil.hp / 12) // visit lebih aman
    dmgTaken = Math.max(1, dmgTaken - b.def - b.teamHp)
    if(Math.random() * 100 < b.evasion) dmgTaken = 0
    if (b.ccResist > 0) dmgTaken = Math.max(0, dmgTaken - Math.floor(b.ccResist / 10))
    if (b.teleportChance > 0 && Math.random() * 100 < b.teleportChance) {
      dmgTaken = 0
      const safeLocation = [...MAIN_LOCATION_LIST, ...SIDE_LOCATION_LIST].find(location => location.rateDevil < 0.2)
      if (safeLocation) csm.location = safeLocation.nama
      battleEffects.push(`🌀 Teleport aktif: kamu berpindah ke ${csm.location} dan menghindari serangan.`)
    }
    csm.health = Math.max(1, csm.health - dmgTaken)
    if(!b.noHeal && (b.regen > 0 || b.heal > 0)) csm.health = Math.min(csm.maxHealth, csm.health + b.regen + b.heal)

    if(devil.hp <= dmg){
      let rusak = damageWeapon()
      if(b.weaponDur > 0) weapon.dur += b.weaponDur
      csm.devilsKilled++
      let bloodGain = Math.floor((devil.blood * 0.7 + 50) * b.bloodMult) + b.stealBlood 
      let expGain = Math.floor(devil.exp * 0.7 * b.expMult)
      csm.blood += bloodGain
      let leveled = addExp(expGain)
      csm.encounter = null
      saveDB(wdb)
      let msg = header('KEMENANGAN VISIT') +
        ` ${devil.emoji} *${devil.nama}* dikalahkan!\n`
        `|━━━━━━━━━━━\n`
        ` 🩸 +${bloodGain.toLocaleString()} Darah\n`
        ` 📈 +${expGain} EXP`
      if(leveled) msg += `\n|🎉 LEVEL UP! Lv.${csm.level}`
      if(rusak) msg += `\n|⚠️ *${rusak}* PATAH!`
      if (battleEffects.length) msg += `\n${battleEffects.join('\n')}`
      await checkMakimaTrigger(m, csm, wdb)
return m.reply(msg + `\n|━━━━━━━━━━━`)
    }
    csm.encounter = null
    saveDB(wdb)
    return m.reply(header('KEKALAHAN VISIT') + `|Kamu kalah...\n|❤️ -${dmgTaken} HP\n|━━━━━━━━━━━`)
  }

  //.csm visit run 
  if(sub === 'run' && csm.encounter){
    let b = calcBonus(csm)
    let msg = header('MELARIKAN DIRI VISIT') + `|❤️ -5 HP\n` 
    if(csm.encounter.type === 'devil'){
      let devil = csm.encounter.data
      if(devil?.runBlood > 0){
        let runBlood = Math.floor(devil.runBlood * 0.5 * b.bloodMult) + b.stealBlood 
        csm.blood += runBlood
        msg += `|Kamu berhasil mencuri ${runBlood.toLocaleString()} Darah dari ${devil.nama}!\n`
      }
    }
    if(b.findItem > 0 && Math.random() < b.findItem) msg += `|🎁 Kamu nemu item pas kabur!\n`
    csm.health = Math.max(1, csm.health - 5)
    csm.encounter = null
    saveDB(wdb)
    await checkMakimaTrigger(m, csm, wdb)
return m.reply(msg + `|━━━━━━━━━━━`)
  }

  //CEK SELESAI ENCOUNTER
  if(hasCharacterEncounter && !['interact','ignore','fight','run','makima','leave','stay'].includes(sub)) return m.reply(header('MASIH ADA KARAKTER') + `|Masih ada karakter yang bisa kamu ajak interaksi di ${csm.location}.\n|Gunakan: *.csm visit interact <nomor/nama>*\n|Tetap di sini: *.csm visit stay*\n|Tinggalkan lokasi: *.csm visit leave ${csm.location}*\n|━━━━━━━━━━━`)
  if(cekCD('lastVisit', 300000) > 0) return m.reply(header('COOLDOWN') + `Tunggu ${Math.ceil(cekCD('lastVisit', 300000)/60)} menit\n━━━━━━━━━━━`)

  let input = args.slice(1).join(' ')
  let locIndex = isNaN(input)? -1 : parseInt(input) - 1
  let loc = isNaN(input)
? ALL_LOCATION_LIST.find(l => l.nama.toLowerCase() === input.toLowerCase())
      : ALL_LOCATION_LIST[locIndex]

  if (!loc) return m.reply(header('LOKASI SALAH') + `|Lihat: ${usedPrefix}csm location\n|━━━━━━━━━━━`)
  const requiredLevel = Number(loc.level || 1)
  if (csm.level < requiredLevel) {
    return m.reply(header('LEVEL BELUM CUKUP') + `|Lokasi ini membutuhkan minimal Lv.${requiredLevel}.\n|Level kamu: Lv.${csm.level}\n|━━━━━━━━━━━`)
  }

  csm.location = loc.nama
  csm.lastVisit = Date.now()

  let msg = header(`PERGI KE: ${loc.nama}`) +
  ` ${loc.desc}\n` +
  `|━━━━━━━━━━━\n`
  let expGain = Math.floor(Math.random() * 20) + 10
  let levelUp = addExp(expGain)
  if(levelUp) msg += `|🎉 LEVEL UP! Sekarang Lv.${csm.level}\n`

  let rand = Math.random()
  let isSide = SIDE_LOCATION_LIST.some(s => s.nama === loc.nama)

  if(rand < 0.10 && loc.drop?.length){
    const dropName = loc.drop[Math.floor(Math.random() * loc.drop.length)]
    const drop = getDropByName(dropName)
    if (addInventoryDrop(drop)) {
      msg += `|🎁 Kamu menemukan *${drop.emoji} ${drop.nama}*!\n`
    }
  } else if(rand < 0.15){
    const weaponPool = WEAPON_LIST.filter(weapon => ['E', 'D', 'C'].includes(weapon.tier) && weapon.nama !== 'Fist')
    let weap = weaponPool[Math.floor(Math.random() * weaponPool.length)]
    addInventoryDrop(weap)
    msg += `|📦 Kamu nemu *${weap.emoji} ${weap.nama}* di tanah!\n`
  } else if(rand < 0.35 &&!SAFE_BLOOD_LOCATIONS.has(loc.nama)){
    let darah, extraMsg = ''
    if(isSide){
      let tier = Math.random()
      if(tier < 0.2) darah = (Math.floor(Math.random()*20) + 5) * 100
      else if(tier < 0.8) darah = (Math.floor(Math.random()*150) + 50) * 100
      else darah = (Math.floor(Math.random()*800) + 200) * 100
      if(darah >= 20000){
        let pembantaian = ['🩸 Bau darah masih menyengat.', '🩸 Noda darah ada di mana-mana.', '🩸 Lantai terasa lengket.', '🩸 Sisa-sisa pertempuran tercerai-berai.', '🩸 Aura kematian masih terasa.', '🩸 Dindingnya penuh bekas seretan.', '🩸 Tidak ada yang mau membersihkan tempat ini.', '🩸 Bau besi menempel di udara.', '🩸 Jejak kaki berhenti di tengah ruangan.', '🩸 Bahkan Devil lain tidak berani mendekat.']
        extraMsg = `\n|${pembantaian[Math.floor(Math.random()*pembantaian.length)]}`
      }
    } else {
      darah = (Math.floor(Math.random()*150) + 50) * 100
    }
    csm.blood += darah
    msg += `|🩸 Kamu nemu ${darah.toLocaleString()} Darah tercecer!${extraMsg}\n`
  } else if(rand < 0.75){
    const horsemenDanger = csm.erasureProtection?.startsWith('horsemen:')? 0.25 : 0
    let devilSpawn = Math.random() < Math.min(0.98, loc.rateDevil + horsemenDanger)
    let lastSeen = csm.lastSeenChars || {}
    let charList = CHARACTER_LIST.filter(c => c.lokasi?.includes(loc.nama))
    const CORE_CHARS = ['Denji','Aki Hayakawa','Power','Asa Mitaka','Nayuta','Fami','Makima','Yoru','Kishibe','Himeno','Kobeni Higashiyama','Hirofumi Yoshida','Beam','Galgali','Reze','Quanxi','Angel Devil','Pochita','Meowy']

    charList = charList.map(c => {
      let weight = 1
      if(CORE_CHARS.includes(c.nama)){
        if(loc.nama.includes('Markas') && ['Makima','Himeno','Kishibe','Aki Hayakawa','Galgali','Kobeni Higashiyama','Beam'].includes(c.nama)) weight = 5
        if(loc.nama.includes('Kafe') && c.nama === 'Reze') weight = 6
        if(loc.nama.includes('Kafe') && c.nama === 'Denji') weight = 4
        if(loc.nama.includes('Apartemen Hayakawa') && ['Aki Hayakawa','Power','Denji','Meowy'].includes(c.nama)) weight = 6
        if(loc.nama.includes('SMA') && ['Asa Mitaka','Yoshida','Denji','Yoru'].includes(c.nama)) weight = 5
        if(loc.nama.includes('Gudang') && c.nama === 'Reze') weight = 5
        if((loc.nama.includes('Neraka') || loc.nama.includes('Mindscape')) && c.nama === 'Pochita') weight = 10
        if((loc.nama.includes('Neraka') || loc.nama.includes('Mindscape')) && c.nama === 'Makima') weight = 7
        if(loc.nama.includes('Kamar Kos Baru Denji') && ['Denji','Nayuta'].includes(c.nama)) weight = 7
        if(loc.nama.includes('Gereja Chainsaw Man') && c.nama === 'Fami') weight = 6
        if((loc.nama.includes('Hotel Quanxi') || loc.nama.includes('Park')) && c.nama === 'Quanxi') weight = 5
        if(loc.nama.includes('Park') && c.nama === 'Angel Devil') weight = 4
        if(loc.nama.includes('Apartemen') && c.nama === 'Meowy') weight = 5
      }
      if(lastSeen[c.nama] && Date.now() - lastSeen[c.nama] < 3600000) weight = 0.1
      return {...c, weight}
    }).filter(c => c.weight > 0)

    // FORCE SPAWN 1 KALO TEMPAT ADA WEIGHT TAPI KOSONG
    let hasWeight = CORE_CHARS.some(n => charList.some(c => c.nama === n))
    if(hasWeight && charList.length === 0){
      charList = CHARACTER_LIST.filter(c => c.lokasi?.includes(loc.nama))
      if(charList.length === 0) charList = [CHARACTER_LIST[Math.floor(Math.random()*CHARACTER_LIST.length)]]
    }

    let spawned = []
    if(charList.length > 0){
      let spawnCount = devilSpawn? Math.min(Math.floor(Math.random()*5)+1, 5) : Math.min(Math.floor(Math.random()*10)+1, 10)
      if(hasWeight && spawnCount < 1) spawnCount = 1
      for(let i=0; i<spawnCount; i++){
        let totalWeight = charList.reduce((a,b)=>a+b.weight,0)
        if(totalWeight <= 0) break
        let r = Math.random() * totalWeight
        let pick = charList.find(c => (r -= c.weight) <= 0)
        if(pick){
          spawned.push(pick)
          charList = charList.filter(c => c.nama!== pick.nama)
        }
      }
      spawned.forEach(c => csm.lastSeenChars[c.nama] = Date.now())
    }

    if(spawned.length > 0){
      msg += `|⚠️ ${devilSpawn? 'Iblis' : 'Karakter'} muncul:\n`
      spawned.forEach(s => msg += `|- ${s.nama}\n`)
      const makimaEvent = (loc.nama.includes('Neraka') || loc.nama.includes('Mindscape')) && spawned.some(c => c.nama === 'Makima')
      if (makimaEvent) {
        const dialogMakima = [
          '⛓️ Kau seharusnya tidak di sini, anjingku.', '👁️ Tempat ini bukan untukmu.',
          '🌑 Beraninya kau menginjak Neraka tanpa seizinku?', '😐 Hmph. Lagi-lagi kau.',
          '⚠️ Sudah kubilang jangan ikut campur.', '🩸 Kau membawa bau manusia terlalu jauh.',
          '🚪 Pulanglah sebelum tempat ini mengingat namamu.', '⛓️ Aku bisa mendengar ketakutanmu.',
          '👁️ Menarik. Kau masih berani menatapku.', '💀 Jangan membuatku memanggilmu dua kali.'
        ]
        csm.encounter = { type: 'makima_neraka' }
        msg += `|━━━━━━━━━━━\n`
        msg += ` ⛓️ *Makima* muncul di hadapanmu...\n`
        msg += ` ⛓️ *Makima*: "${dialogMakima[Math.floor(Math.random() * dialogMakima.length)]}"\n\n`
        msg += `|━━━━━━━━━━━\n`
        msg += ` .csm visit makima fight - Lawan\n`
        saveDB(wdb)
        return sendCsmReply(msg + `|━━━━━━━━━━━`, CSM_PICTURES.makimaHell)
      }
      if (devilSpawn) {
        const devil = DEVIL_LIST[Math.floor(Math.random() * DEVIL_LIST.length)]
        csm.encounter = { type: 'devil', data: devil, helpers: spawned }
        msg += `|━━━━━━━━━━━\n`
        msg += `| 👹 *${devil.emoji} ${devil.nama}* [${devil.rank}] muncul!\n`
        if (spawned.length > 0) {
          const dialogBantu = ['⚔️ Aku bantu dari sisi kiri!', '⚠️ Jangan mati di sini!', '🔪 Aku tahan dia, serang sekarang!', '🩸 Keroyok sebelum dia pulih!', '🚨 Mundur kalau mulai terlalu dekat!', '👁️ Aku lihat celah di pertahanannya!', '💥 Jangan biarkan dia kabur!', '⛓️ Tetap di belakangku!', '🔫 Aku alihkan perhatiannya!', '🏃 Jangan malu untuk lari kalau perlu!']
          const helper = spawned[Math.floor(Math.random() * spawned.length)]
          msg += `| ${helper.emoji} *${helper.nama}*: "${dialogBantu[Math.floor(Math.random() * dialogBantu.length)]}"\n`
          msg += `| 👥 ${spawned.length} karakter ikut membantu:\n`
          spawned.forEach((character, index) => {
            msg += `| *${index + 1}.* ${character.emoji} *${character.nama}*\n`
          })
        }
        msg += `|━━━━━━━━━━━\n`
        msg += ` .csm visit fight - Lawan\n`
        msg += ` .csm visit run - Kabur\n`
      } else {
        csm.encounter = { type: 'char', data: spawned[0], all: spawned }
        msg += `|━━━━━━━━━━━\n`
        msg += ` 👥 Ada ${spawned.length} orang di sini:\n`
        spawned.forEach((character, index) => {
          const love = csm.relations[character.nama] || 0
          msg += ` *${index + 1}.* ${character.emoji} *${character.nama}* - ${character.role}\n`
          msg += `  "${character.dialog[Math.floor(Math.random() * character.dialog.length)]}"\n`
          msg += `  💌 ${love}/${character.needLove}\n\n`
        })
        msg += `|━━━━━━━━━━━\n`
        msg += ` .csm visit interact <nomor/nama> - Ngobrol\n`
        msg += ` .csm visit ignore - Abaikan dan pergi\n`
      }
    } else {
      msg += `|Sepertinya tidak ada apa-apa disini...\n`
    }
  } else {
    msg += `|Tempat ini tenang. Tidak ada yg terjadi.\n`
  }

 msg += `|━━━━━━━━━━━\n` +
  `|📈 +${expGain} EXP\n` +
  `|━━━━━━━━━━━`

  saveDB(wdb)
  await checkMakimaTrigger(m, csm, wdb)
return sendCsmReply(msg, getLocationPicture(loc, spawned))
}

// === LOCATION DETAIL 🗺️
if (action === 'location') {
  let cap = header('LOKASI UTAMA')
  MAIN_LOCATION_LIST.forEach((l,i) => {
    let rateColor = l.rateDevil >= 0.7? '🔴' : l.rateDevil >= 0.4? '🟡' : '🟢'
    cap += `*${i+1}.* *${l.nama}*\n`
    cap += ` ${l.desc}\n`
    cap += ` Devil Rate: ${rateColor} ${(l.rateDevil*100).toFixed(0)}%\n\n`
  })

  cap += `━━━━━━━━━━━\n`
  cap += header('LOKASI LAINNYA')
  SIDE_LOCATION_LIST.forEach((l,i) => {
    let rateColor = l.rateDevil >= 0.7? '🔴' : l.rateDevil >= 0.4? '🟡' : '🟢'
    cap += `*${i+MAIN_LOCATION_LIST.length+1}.* *${l.nama}*\n`
    cap += ` ${l.desc}\n`
    cap += ` Devil Rate: ${rateColor} ${(l.rateDevil*100).toFixed(0)}%\n\n`
  })

  cap += `📌.csm visit <nama/nomor> [Cooldown 5 Menit]\n━━━━━━━━━━━`
  return m.reply(cap)
}

// === SHOP 🛒
if (action === 'shop' || action === 'store' || action === 'toko') {
  const sub = args[1]?.toLowerCase()
  const b = calcBonus(csm)

  // === SHOP WEAPON ===
  if (sub === 'weapon') {
    const act = args[2]?.toLowerCase()

    // === BELI WEAPON ===
    if (act === 'beli' || act === 'buy') {
      const input = args.slice(3).join(' ').trim()

      if (!input) {
        return m.reply(
          header('PENGGUNAAN') +
          `.csm shop weapon buy <nomor/nama>\n━━━━━━━━━━━`
        )
      }

      let item = !isNaN(input)
        ? WEAPON_LIST[parseInt(input, 10) - 1]
        : WEAPON_LIST.find(
            w => w.nama.toLowerCase() === input.toLowerCase()
          )

      if (!item) {
        return m.reply(
          header('SENJATA TIDAK ADA') +
          `━━━━━━━━━━━`
        )
      }

      if (item.harga <= 0 && item.nama !== 'Fist') {
        return m.reply(
          header('GRATIS') +
          `━━━━━━━━━━━`
        )
      }

      const weaponPrice = Math.max(0, Math.floor(item.harga * (1 - b.discount)))

      if (csm.inventory.some(w => w.nama === item.nama)) {
        return m.reply(
          header('SUDAH PUNYA') +
          `Kamu sudah punya ${item.nama}\n` +
          `━━━━━━━━━━━`
        )
      }

      if (userRPG.bank < weaponPrice) {
        return m.reply(
          header('SALDO KURANG') +
          `Butuh Rp ${weaponPrice.toLocaleString()}\n` +
          `Saldo: Rp ${userRPG.bank.toLocaleString()}\n` +
          `━━━━━━━━━━━`
        )
      }

      userRPG.bank -= weaponPrice

      csm.inventory.push({
        nama: item.nama,
        dur: item.dur
      })

      saveDB(wdb)

      return m.reply(
        header('PEMBELIAN BERHASIL') +
        `${item.emoji} *${item.nama}* [T${item.tier}]\n` +
        `DMG: +${item.dmg}\n` +
        `DUR: ${item.dur}\n` +
        `-Rp ${weaponPrice.toLocaleString()}${b.discount > 0 ? ` [Diskon ${(b.discount * 100).toFixed(0)}%]` : ''}\n` +
        `━━━━━━━━━━━`
      )
    }

    // === INFO WEAPON ===
    if (act === 'info') {
      const input = args.slice(3).join(' ').trim()

      if (!input) {
        return m.reply(
          header('PENGGUNAAN') +
          `.csm shop weapon info <nomor/nama>\n━━━━━━━━━━━`
        )
      }

      let item = !isNaN(input)
        ? WEAPON_LIST[parseInt(input, 10) - 1]
        : WEAPON_LIST.find(
            w => w.nama.toLowerCase() === input.toLowerCase()
          )

      if (!item) {
        return m.reply(
          header('SENJATA TIDAK ADA') +
          `━━━━━━━━━━━`
        )
      }

      return m.reply(
        header(item.nama) +
        `${item.emoji} [TIER ${item.tier}]\n` +
        `Jenis: ${item.jenis}\n` +
        `DMG: +${item.dmg}\n` +
        `DUR: ${item.dur}\n` +
        `Harga: Rp ${item.harga.toLocaleString()}\n` +
        `User: ${item.user}\n` +
        `Material: ${item.material}\n\n` +
        `${item.desc}\n` +
        `━━━━━━━━━━━`
      )
    }

    // === LIST SHOP WEAPON ===
    let cap = header('TOKO WEAPON')

    cap += `💰 Bank: Rp ${userRPG.bank.toLocaleString()}\n`
    cap += `🩸 Darah: ${csm.blood.toLocaleString()}\n\n`

    cap += `📌 .csm shop weapon buy <nomor/nama>\n`
    cap += `📌 .csm shop weapon info <nomor/nama>\n`
    cap += `━━━━━━━━━━━\n`

    WEAPON_LIST.forEach((w, i) => {
      cap += `*${i + 1}.* ${w.emoji} *${w.nama}* [T${w.tier}] - Rp ${w.harga.toLocaleString()}\n`
    })

    cap += `━━━━━━━━━━━`

    return m.reply(cap)
  }


  // === SHOP ITEM ===
  // ITEM TIDAK BISA DIBELI
  if (sub === 'item') {
    const act = args[2]?.toLowerCase()

    // === INFO ITEM ===
    if (act === 'info') {
      const input = args.slice(3).join(' ').trim()

      if (!input) {
        return m.reply(
          header('PENGGUNAAN') +
          `.csm shop item info <nomor/nama>\n━━━━━━━━━━━`
        )
      }

      let item = !isNaN(input)
        ? ITEM_LIST[parseInt(input, 10) - 1]
        : ITEM_LIST.find(
            i => i.nama.toLowerCase() === input.toLowerCase()
          )

      // Support nama sebagian
      if (!item) {
        item = ITEM_LIST.find(
          i => i.nama.toLowerCase().includes(input.toLowerCase())
        )
      }

      if (!item) {
        return m.reply(
          header('ITEM TIDAK ADA') +
          `━━━━━━━━━━━`
        )
      }

      return m.reply(
        header(item.nama) +
        `${item.emoji} [TIER ${item.tier}]\n` +
        `Jenis: ${item.jenis}\n` +
        `Nilai Jual: Rp ${item.jual.toLocaleString()}\n` +
        `User: ${item.user}\n` +
        `Material: ${item.material}\n\n` +
        `${item.desc}\n` +
        `━━━━━━━━━━━`
      )
    }

    // === LIST SHOP ITEM ===
    let cap = header('TOKO ITEM')

    cap += `💰 Bank: Rp ${userRPG.bank.toLocaleString()}\n`
    cap += `🩸 Darah: ${csm.blood.toLocaleString()}\n\n`

    cap += `📦 Item di toko ini TIDAK dapat dibeli.\n`
    cap += `💵 Nilai di bawah adalah harga jual item.\n\n`

    cap += `📌 .csm shop item info <nomor/nama>\n`
    cap += `📌 .csm sell <nomor>\n`
    cap += `━━━━━━━━━━━\n`

    ITEM_LIST.forEach((item, i) => {
      cap += `*${i + 1}.* ${item.emoji} *${item.nama}* [T${item.tier}] - Rp ${item.jual.toLocaleString()}\n`
    })

    cap += `━━━━━━━━━━━`

    return m.reply(cap)
  }


  // === MENU SHOP UTAMA ===
  let cap = header('TOKO')

  cap += `💰 Bank: Rp ${userRPG.bank.toLocaleString()}\n`
  cap += `🩸 Darah: ${csm.blood.toLocaleString()}\n\n`

  cap += `📌 .csm shop weapon - Beli senjata\n`
  cap += `📌 .csm shop item - Lihat item\n`
  cap += `📌 .csm jual/sell <nomor> - Jual dari inventory\n`
  cap += `━━━━━━━━━━━`

  return m.reply(cap)
}


// === SELL 💰
if (action === 'jual' || action === 'sell') {
  if (!Array.isArray(csm.inventory)) {
    csm.inventory = [{ nama: 'Fist', dur: 999 }]
  }

  // Buat nomor inventory yang sama dengan tampilan INV
  const weaponEntries = []
  const itemEntries = []

  csm.inventory.forEach((inv, inventoryIndex) => {
    const weapon = WEAPON_LIST.find(w => w.nama === inv.nama)
    const item = !weapon
      ? ITEM_LIST?.find(i => i.nama === inv.nama)
      : null

    if (weapon) {
      weaponEntries.push({ inv, inventoryIndex, data: weapon })
    } else if (item) {
      itemEntries.push({ inv, inventoryIndex, data: item })
    }
  })

  // Weapon dulu, Item kemudian
  const entries = [...weaponEntries, ...itemEntries]

  const input = args[1]

  if (!input) {
    return m.reply(
      header('PENGGUNAAN') +
      `.csm sell <nomor>\nLihat nomor di .csm inv\n━━━━━━━━━━━`
    )
  }

  const nomor = parseInt(input, 10)

  if (
    isNaN(nomor) ||
    nomor < 1 ||
    nomor > entries.length
  ) {
    return m.reply(
      header('NOMOR SALAH') +
      `Nomor inventory tidak ditemukan.\n━━━━━━━━━━━`
    )
  }

  // Ambil berdasarkan nomor yang tampil di inventory
  const entry = entries[nomor - 1]
  const itemInv = entry.inv
  const dataItem = entry.data
  const inventoryIndex = entry.inventoryIndex

  // Fist tidak bisa dijual
  if (dataItem.nama === 'Fist') {
    return m.reply(
      header('TIDAK BISA DIJUAL') +
      `Fist tidak bisa dijual.\n━━━━━━━━━━━`
    )
  }

  // Weapon yang sedang dipakai harus dilepas dulu
  if (
    entry.data === WEAPON_LIST.find(w => w.nama === dataItem.nama) &&
    csm.weapon &&
    csm.weapon.nama === dataItem.nama
  ) {
    return m.reply(
      header('LEPAS DULU') +
      `Lepas dulu senjata ini.\n━━━━━━━━━━━`
    )
  }

  // =========================
  // HARGA JUAL
  // =========================
  let hargaJual
  const isWeapon = WEAPON_LIST.some(w => w.nama === dataItem.nama)

  if (isWeapon) {
    // WEAPON = 50% dari harga beli
    hargaJual = Math.floor((dataItem.harga || 0) / 2)
  } else {
    // ITEM = harga jual tetap
    hargaJual = dataItem.jual || 0
  }

  if (hargaJual <= 0) {
    return m.reply(
      header('TIDAK BISA DIJUAL') +
      `Item ini tidak memiliki harga jual.\n━━━━━━━━━━━`
    )
  }

  // Hapus item dari inventory asli
  csm.inventory.splice(inventoryIndex, 1)

  // Hasil penjualan masuk ke Bank
  userRPG.bank += hargaJual

  saveDB(wdb)

  return m.reply(
    header('PENJUALAN BERHASIL') +
    `${dataItem.emoji} *${dataItem.nama}* [T${dataItem.tier || '-'}]\n` +
    `Dapat: +Rp ${hargaJual.toLocaleString()} ke Bank` +
    `${isWeapon ? ' [50%]' : ''}\n` +
    `━━━━━━━━━━━`
  )
}


// === EQUIP ⚔️
if (action === 'equip') {
  if (!Array.isArray(csm.inventory)) {
    csm.inventory = [{ nama: 'Fist', dur: 999 }]
  }

  const input = args.slice(1).join(' ').trim()

  if (!input) {
    return m.reply(
      header('PENGGUNAAN') +
      `.csm equip <nomor/nama senjata>\n━━━━━━━━━━━`
    )
  }

  // Buat nomor inventory yang sama dengan .csm inv
  const weaponEntries = []
  const itemEntries = []

  csm.inventory.forEach((inv, inventoryIndex) => {
    const weapon = WEAPON_LIST.find(w => w.nama === inv.nama)
    const item = !weapon
      ? ITEM_LIST?.find(i => i.nama === inv.nama)
      : null

    if (weapon) {
      weaponEntries.push({ inv, inventoryIndex, data: weapon })
    } else if (item) {
      itemEntries.push({ inv, inventoryIndex, data: item })
    }
  })

  const entries = [...weaponEntries, ...itemEntries]

  let entry = null

  // Equip berdasarkan nomor
  if (!isNaN(input)) {
    const nomor = parseInt(input, 10)

    if (
      nomor < 1 ||
      nomor > entries.length
    ) {
      return m.reply(
        header('NOMOR SALAH') +
        `Nomor inventory tidak ditemukan.\n━━━━━━━━━━━`
      )
    }

    entry = entries[nomor - 1]

    // Nomor tersebut adalah item
    if (!entry || !WEAPON_LIST.some(w => w.nama === entry.data.nama)) {
      return m.reply(
        header('BUKAN SENJATA') +
        `Nomor tersebut bukan weapon.\n━━━━━━━━━━━`
      )
    }
  } else {
    // Equip berdasarkan nama
    const dataWeapon = WEAPON_LIST.find(
      w => w.nama.toLowerCase() === input.toLowerCase()
    )

    if (!dataWeapon) {
      return m.reply(
        header('SENJATA TIDAK ADA') +
        `━━━━━━━━━━━`
      )
    }

    const inventoryIndex = csm.inventory.findIndex(
      w => w.nama === dataWeapon.nama
    )

    if (inventoryIndex < 0) {
      return m.reply(
        header('KAMU TIDAK PUNYA') +
        `━━━━━━━━━━━`
      )
    }

    entry = {
      inv: csm.inventory[inventoryIndex],
      inventoryIndex,
      data: dataWeapon
    }
  }

  const dataItem = entry.data
  const invIndex = entry.inventoryIndex

  if (dataItem.nama === 'Fist') {
    return m.reply(
      header('TIDAK BISA') +
      `Fist tidak perlu di-equip.\n━━━━━━━━━━━`
    )
  }

  // Ambil item dari inventory
  const item = csm.inventory.splice(invIndex, 1)[0]

  if (
    typeof item.dur !== 'number' ||
    item.dur < 0
  ) {
    item.dur = dataItem.dur
  }

  // Weapon aktif selalu berada di posisi pertama
  csm.inventory.unshift(item)

  csm.weapon = {
    nama: item.nama,
    dur: item.dur
  }

  saveDB(wdb)

  return m.reply(
    header('SENJATA DIPASANG') +
    `${dataItem.emoji} *${dataItem.nama}* [T${dataItem.tier}]\n` +
    `DMG: ${dataItem.dmg}\n` +
    `DUR: ${item.dur}/${dataItem.dur}\n` +
    `━━━━━━━━━━━`
  )
}


// === REPAIR 🔧
if (action === 'repair') {
  if (!Array.isArray(csm.inventory)) {
    csm.inventory = [{ nama: 'Fist', dur: 999 }]
  }

  if (!csm.weapon || !csm.weapon.nama) {
    csm.weapon = {
      nama: 'Fist',
      dur: 999
    }
  }

  const input = args.slice(1).join(' ').trim()

  if (!input) {
    return m.reply(
      header('PENGGUNAAN') +
      `.csm repair <nomor/nama senjata>\n━━━━━━━━━━━`
    )
  }

  // Buat nomor inventory yang sama dengan .csm inv
  const weaponEntries = []
  const itemEntries = []

  csm.inventory.forEach((inv, inventoryIndex) => {
    const weapon = WEAPON_LIST.find(w => w.nama === inv.nama)
    const item = !weapon
      ? ITEM_LIST?.find(i => i.nama === inv.nama)
      : null

    if (weapon) {
      weaponEntries.push({ inv, inventoryIndex, data: weapon })
    } else if (item) {
      itemEntries.push({ inv, inventoryIndex, data: item })
    }
  })

  const entries = [...weaponEntries, ...itemEntries]

  let entry = null

  // Repair berdasarkan nomor
  if (!isNaN(input)) {
    const nomor = parseInt(input, 10)

    if (
      nomor < 1 ||
      nomor > entries.length
    ) {
      return m.reply(
        header('NOMOR SALAH') +
        `Nomor inventory tidak ditemukan.\n━━━━━━━━━━━`
      )
    }

    entry = entries[nomor - 1]

    // Nomor tersebut adalah item
    if (!entry || !WEAPON_LIST.some(w => w.nama === entry.data.nama)) {
      return m.reply(
        header('BUKAN SENJATA') +
        `Nomor tersebut bukan weapon.\n━━━━━━━━━━━`
      )
    }
  } else {
    // Repair berdasarkan nama
    const dataWeapon = WEAPON_LIST.find(
      w => w.nama.toLowerCase() === input.toLowerCase()
    )

    if (!dataWeapon) {
      return m.reply(
        header('SENJATA TIDAK ADA') +
        `━━━━━━━━━━━`
      )
    }

    const inventoryIndex = csm.inventory.findIndex(
      x => x.nama === dataWeapon.nama
    )

    if (inventoryIndex < 0) {
      return m.reply(
        header('WEAPON TIDAK ADA') +
        `━━━━━━━━━━━`
      )
    }

    entry = {
      inv: csm.inventory[inventoryIndex],
      inventoryIndex,
      data: dataWeapon
    }
  }

  const itemInv = entry.inv
  const dataItem = entry.data

  if (dataItem.nama === 'Fist') {
    return m.reply(
      header('TIDAK BISA') +
      `Fist tidak perlu di-repair.\n━━━━━━━━━━━`
    )
  }

  if (dataItem.dur === 1 || dataItem.dur === 999) {
    return m.reply(
      header('TIDAK BISA') +
      `${dataItem.emoji} *${dataItem.nama}* tidak bisa di-repair.\n━━━━━━━━━━━`
    )
  }

  if (!itemInv) {
    return m.reply(
      header('WEAPON TIDAK ADA') +
      `━━━━━━━━━━━`
    )
  }

  if (
    typeof itemInv.dur !== 'number' ||
    itemInv.dur < 0
  ) {
    itemInv.dur = dataItem.dur
  }

  if (itemInv.dur >= dataItem.dur) {
    return m.reply(
      header('SUDAH FULL') +
      `Durability sudah penuh.\n━━━━━━━━━━━`
    )
  }

  // =========================
  // BIAYA REPAIR BERDASARKAN TIER
  // =========================
  let persen = 0.3

  if (dataItem.tier === 'D') persen = 0.4
  if (dataItem.tier === 'C') persen = 0.45
  if (dataItem.tier === 'B') persen = 0.5
  if (dataItem.tier === 'A') persen = 0.6
  if (dataItem.tier === 'S') persen = 0.7
  if (dataItem.tier === 'SS') persen = 0.8
  if (dataItem.tier === 'SSS') persen = 0.9

  const biaya = Math.floor(
    (dataItem.harga || 0) * persen
  )

  if (userRPG.bank < biaya) {
    return m.reply(
      header('DUIT KURANG') +
      `Butuh Rp ${biaya.toLocaleString()}\n` +
      `Saldo: Rp ${userRPG.bank.toLocaleString()}\n` +
      `━━━━━━━━━━━`
    )
  }

  // Bayar repair
  userRPG.bank -= biaya

  // Full durability
  itemInv.dur = dataItem.dur

  // Kalau weapon sedang dipakai, update durability weapon juga
  if (
    csm.weapon &&
    csm.weapon.nama === dataItem.nama
  ) {
    csm.weapon.dur = dataItem.dur
  }

  saveDB(wdb)

  return m.reply(
    header('BERHASIL DI-REPAIR') +
    `${dataItem.emoji} *${dataItem.nama}* [T${dataItem.tier}]\n` +
    `Durability: FULL\n` +
    `Biaya: ${persen * 100}% = Rp ${biaya.toLocaleString()}\n` +
    `━━━━━━━━━━━`
  )
}


// === INVENTORY 🎒
if (action === 'inv' || action === 'inventory') {
  if (!Array.isArray(csm.inventory)) {
    csm.inventory = [{ nama: 'Fist', dur: 999 }]
  }

  // Pisahkan weapon dan item,
  // tapi nomor tetap satu urutan
  const weaponEntries = []
  const itemEntries = []

  csm.inventory.forEach((inv, inventoryIndex) => {
    const weapon = WEAPON_LIST.find(w => w.nama === inv.nama)
    const item = !weapon
      ? ITEM_LIST?.find(i => i.nama === inv.nama)
      : null

    if (weapon) {
      weaponEntries.push({
        inv,
        inventoryIndex,
        data: weapon
      })
    } else if (item) {
      itemEntries.push({
        inv,
        inventoryIndex,
        data: item
      })
    }
  })

  const entries = [...weaponEntries, ...itemEntries]

  let cap = header('INVENTORY KAMU')

  if (entries.length === 0) {
    cap += `Kosong\n`
  }

  // =========================
  // WEAPON
  // =========================
  if (weaponEntries.length > 0) {
    cap += `⚔️ *WEAPON*\n`

    weaponEntries.forEach((entry, i) => {
      const w = entry.data
      const inv = entry.inv

      const aktif =
        csm.weapon &&
        csm.weapon.nama === w.nama
          ? ' [DIPAKAI]'
          : ''

      cap +=
        `*${i + 1}.* ${w.emoji} *${w.nama}* [T${w.tier}]${aktif}\n`

      cap +=
        ` └ DMG: ${w.dmg || 0} | DUR: ${inv.dur}/${w.dur}\n`
    })

    cap += `\n`
  }

  // =========================
  // ITEM
  // =========================
  if (itemEntries.length > 0) {
    cap += `🎒 *ITEM*\n`

    itemEntries.forEach((entry, i) => {
      const item = entry.data

      // Nomor item dimulai setelah semua weapon
      const nomor = weaponEntries.length + i + 1

      cap +=
        `*${nomor}.* ${item.emoji} *${item.nama}* [T${item.tier || '-'}]\n`

      cap +=
        ` └ ${item.desc || ''}\n`
    })

    cap += `\n`
  }

  cap += `━━━━━━━━━━━\n`
  cap += `📌.csm equip <nomor/nama>\n`
  cap += `📌.csm sell <nomor>\n`
  cap += `📌.csm repair <nomor/nama>\n`
  cap += `━━━━━━━━━━━`

  return m.reply(cap)
}

// === CONTRACT ⛓️
if (action === 'contract') {
  const contractScenes = [
    'Di depan pintu kontrak, seorang petugas menyerahkan dokumen berdarah. Harga kekuatan ini adalah Blood yang kamu kumpulkan sendiri.',
    'Lorong menuju ruang kontrak terasa dingin. Setiap langkah mendekatkanmu pada Devil yang akan meminjamkan kekuatannya.',
    'Sebuah altar tua menyala. Darahmu menjadi tanda tangan, dan sesuatu dari balik pintu mulai memperhatikanmu.',
    'Penjaga kontrak membuka segel pertama. Ia mengingatkan: kekuatan besar selalu meminta bayaran yang setara.',
    'Bau besi memenuhi ruangan. Kamu menaruh Blood di meja ritual dan menunggu jawaban dari kegelapan.',
    'Di balik kaca tebal, bayangan Devil bergerak. Kamu datang bukan untuk meminta belas kasihan, tetapi untuk menawar kekuatan.',
    'Kontrak lama bergantung di dinding. Satu nama baru akan ditulis, dan hidupmu tidak akan kembali sama.',
    'Rantai pengaman dilepas satu per satu. Kamu diberi kesempatan memilih kekuatan sebelum pintu ditutup kembali.',
    'Petugas mencatat namamu. Sebagai gantinya, kamu menyerahkan Blood untuk mengikat perjanjian dengan entitas pilihanmu.',
    'Pintu ruang kontrak terbuka. Suara dari dalam bertanya apa yang bersedia kamu korbankan demi terus bertarung.',
    'Lampu ruang bawah tanah berkedip. Darah yang kamu bawa menjadi tiket untuk memanggil nama dari balik segel.',
    'Kamu menandatangani halaman kosong. Tinta merah muncul sendiri, menuliskan harga yang harus dibayar.',
    'Para penjaga mundur ketika pintu besi terbuka. Devil di dalam menunggu keputusanmu tanpa berkedip.',
    'Ritual dimulai dengan satu tetes darah. Udara berubah berat saat kekuatan baru mendekat.',
    'Di ruang arsip kontrak, namamu disejajarkan dengan para Hunter yang tidak pernah kembali.',
    'Kamu membawa Blood ke meja tawar. Entitas di seberang meja hanya memberi kekuatan kepada orang yang berani membayar.',
    'Segel tua retak sedikit. Dari baliknya terdengar bisikan yang menawarkan jalan singkat menuju kekuatan.',
    'Petugas mengunci pintu keluar. Sekarang hanya ada kamu, kontrak, dan harga yang sudah disepakati.',
    'Bau ozon dan besi memenuhi ruangan. Sebuah bayangan mengulurkan tangan untuk mengikat perjanjian.',
    'Nama Devil dipanggil tiga kali. Saat jawaban datang, Blood di telapak tanganmu mulai mendidih.'
  ].map(scene => `⛓️ ${scene}`)
  // =========================
  // DEFAULT DATA
  // =========================
  if (!Array.isArray(csm.contractHistory)) csm.contractHistory = []
  if (!csm.contractPending) csm.contractPending = null
  if (typeof csm.contractExpire !== 'number') csm.contractExpire = 0
  if (typeof csm.lastGacha !== 'number') csm.lastGacha = 0

  const sub = args[1]?.toLowerCase()

  // =========================
  // CEK KONTRAK TRIAL EXPIRED
  // =========================
  if (csm.contractExpire > 0 && Date.now() > csm.contractExpire) {
    csm.devilContract = null
    csm.contractType = null
    csm.isTransform = false
    csm.contractExpire = 0
    csm.contractPending = null

    saveDB(wdb)

    return m.reply(
      header('KONTRAK HABIS') +
      `Kontrak trial 2 hari telah berakhir.\n` +
      `Kekuatan Devil telah meninggalkan tubuhmu.\n` +
      `━━━━━━━━━━━`
    )
  }

  // =========================
  // PROTEKSI FOUR HORSEMEN
  // =========================
  if (
    csm.erasureProtection?.startsWith('horsemen:') &&
    ['trial', 'deal', 'host', 'fiend', 'hybrid', 'devil'].includes(sub)
  ) {
    return m.reply(
      header('KONTRAK TERKUNCI') +
      `Kamu adalah bagian dari Four Horsemen dan tidak bisa membuat kontrak lain.\n` +
      `━━━━━━━━━━━`
    )
  }

  // =========================
  // INFO KONTRAK
  // .csm contract
  // =========================
  if (!sub) {
    let cap = header('INFORMASI KONTRAK')

    cap += `🩸 Darah: ${csm.blood.toLocaleString()}\n`
    cap += `━━━━━━━━━━━\n`

    if (!csm.devilContract) {
      cap += `Mode: 🧑 Manusia\n`
      cap += `Status: Belum Berkontrak\n`
    } else {
      const dv = DEVIL_LIST.find(d => d.nama === csm.devilContract)

      cap += `Tipe Kontrak: ${csm.contractType || 'devil'}\n`
      cap += `Mode: ${csm.isTransform ? '🧬 Transform Aktif' : '🧑 Tidak Transform'}\n`
      cap += `Status: ⛓️ ${dv?.emoji || '👹'} ${csm.devilContract} [${dv?.rank || '?'}]\n`

      if (csm.contractExpire > 0) {
        const sisa = Math.max(0, csm.contractExpire - Date.now())

        const hari = Math.floor(sisa / 86400000)
        const jam = Math.floor((sisa % 86400000) / 3600000)
        const menit = Math.floor((sisa % 3600000) / 60000)

        cap += `⏰ Sisa: ${hari} Hari ${jam} Jam ${menit} Menit\n`
      } else {
        cap += `⏰ Sisa: Permanen\n`
      }
    }

    cap += `━━━━━━━━━━━\n`
    cap += `*DAFTAR COMMAND*\n`
    cap += `> 1. .csm contract host - 5.000 Darah\n`
    cap += `> 2. .csm contract fiend - 10.000 Darah\n`
    cap += `> 3. .csm contract hybrid - 50.000 Darah\n`
    cap += `> 4. .csm contract devil - 100.000 Darah\n`
    cap += `> 5. .csm contract trial <angka> - Sewa Devil 2 Hari\n`
    cap += `> 6. .csm contract deal <angka> - Beli Devil Permanen\n`
    cap += `> 7. .csm contract list [info <angka/nama>]\n`
    cap += `> 8. .csm contract database\n`
    cap += `> 9. .csm contract history\n`
    cap += `━━━━━━━━━━━`

    return sendCsmReply(cap, CSM_PICTURES.contract)
  }

  // === CONTRACT HISTORY 📜 ===
if (sub === 'history') {
  if (!Array.isArray(csm.contractHistory)) {
    csm.contractHistory = []
  }

  if (csm.contractHistory.length === 0) {
    return m.reply(
      header('RIWAYAT KONTRAK') +
      `Belum ada riwayat kontrak.\n` +
      `━━━━━━━━━━━`
    )
  }

  // =========================
  // PAGE
  // .csm contract history
  // .csm contract history 1
  // .csm contract history 2
  // =========================
  const perPage = 10
  let page = parseInt(args[2], 10)

  if (isNaN(page) || page < 1) page = 1

  const totalHistory = csm.contractHistory.length
  const totalPage = Math.ceil(totalHistory / perPage)

  if (page > totalPage) {
    return m.reply(
      header('HALAMAN TIDAK ADA') +
      `Halaman ${page} tidak tersedia.\n` +
      `Total halaman: ${totalPage}\n` +
      `Gunakan: .csm contract history 1-${totalPage}\n` +
      `━━━━━━━━━━━`
    )
  }

  // History terbaru ditampilkan paling atas
  const historyReverse = [...csm.contractHistory].reverse()

  const start = (page - 1) * perPage
  const end = start + perPage
  const pageHistory = historyReverse.slice(start, end)

  let cap = header('RIWAYAT KONTRAK')

  pageHistory.forEach((c, i) => {
    const nomor = start + i + 1
    cap += `${nomor}. ${c}\n`
  })

  cap += `━━━━━━━━━━━\n`
  cap += `📖 Halaman: ${page}/${totalPage}\n`
  cap += `📜 Total History: ${totalHistory}\n`

  if (page < totalPage) {
    cap += `\n➡️ .csm contract history ${page + 1}`
  }

  if (page > 1) {
    cap += `\n⬅️ .csm contract history ${page - 1}`
  }

  cap += `\n━━━━━━━━━━━`

  return m.reply(cap)
}

  // =========================
  // DATABASE
  // =========================
  if (sub === 'database') {
    let cap = header('DATABASE GLOBAL MONSTER')
    const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']

    ranks.forEach(rank => {
      const list = DEVIL_LIST.filter(d => d.rank === rank)

      if (!list.length) return

      cap += `\n*${rank} RANK*\n`

      list.forEach(d => {
        const meta = getContractMeta(d) || {}

        const types = Array.isArray(meta.types)
          ? meta.types.join('/')
          : '-'

        cap += `${d.emoji} ${d.nama} (${d.tipe}) | `
        cap += `${types} | `
        cap += `Host:${meta.canHost ? 'Yes' : 'No'} `
        cap += `Doll:${meta.canDoll ? 'Yes' : 'No'}\n`
      })
    })

    cap += `\n━━━━━━━━━━━\n`
    cap += `.csm contract list\n`
    cap += `.csm contract trial <angka> - 2 Hari\n`
    cap += `.csm contract deal <angka> - Permanen\n`
    cap += `━━━━━━━━━━━`

    return m.reply(cap)
  }

  // =========================
  // LIST MONSTER
  // =========================
  if (sub === 'list') {
    const nextArg = args[2]?.toLowerCase()

    // =========================
    // LIST INFO
    // =========================
    if (nextArg === 'info') {
      const searchParam = args.slice(3).join(' ').trim()

      if (!searchParam) {
        return m.reply(
          header('ARGUMEN KURANG') +
          `Gunakan: .csm contract list info <angka/nama>\n` +
          `━━━━━━━━━━━`
        )
      }

      const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']

      const sortedDb = [...DEVIL_LIST].sort((a, b) => {
        return ranks.indexOf(a.rank) - ranks.indexOf(b.rank)
      })

      const idx = parseInt(searchParam, 10)

      let targetMonster = null

      if (
        !isNaN(idx) &&
        idx >= 1 &&
        idx <= sortedDb.length
      ) {
        targetMonster = sortedDb[idx - 1]
      } else {
        targetMonster = DEVIL_LIST.find(
          d => d.nama.toLowerCase() === searchParam.toLowerCase()
        )
      }

      if (!targetMonster) {
        return m.reply(
          header('TIDAK DITEMUKAN') +
          `Monster atau nomor tidak terdaftar dalam database.\n` +
          `━━━━━━━━━━━`
        )
      }

      const meta = getContractMeta(targetMonster) || {}

      const rankPrice = {
        E: 200000,
        D: 225000,
        C: 300000,
        B: 450000,
        A: 700000,
        S: 1000000,
        SS: 1500000,
        SSS: 2500000
      }

      const dPrice = rankPrice[targetMonster.rank] || 200000
      const tPrice = Math.floor(dPrice * 0.5)

      const contractTypes = Array.isArray(meta.types)
        ? meta.types.join('/')
        : '-'

      let cap = header(
        `DETAIL: ${targetMonster.nama.toUpperCase()}`
      )

      cap += `${targetMonster.emoji} ${targetMonster.nama}\n`
      cap += `Tipe: ${targetMonster.tipe}\n`
      cap += `Rank: [${targetMonster.rank}]\n`
      cap += `HP: ${targetMonster.hp} | DMG: ${targetMonster.dmg}\n`
      cap += `Loot: +${targetMonster.exp} EXP | +${targetMonster.blood} Blood\n`
      cap += `Kontrak: ${contractTypes}\n`
      cap += `Host: ${meta.canHost ? 'Bisa' : 'Tidak'}\n`
      cap += `Doll: ${meta.canDoll ? 'Bisa' : 'Tidak'}\n`
      cap += `━━━━━━━━━━━\n`
      cap += `💰 Sewa Trial 2 Hari: ${tPrice.toLocaleString()} Darah\n`
      cap += `💳 Beli Permanen: ${dPrice.toLocaleString()} Darah\n`
      cap += `━━━━━━━━━━━\n`
      cap += `*DESKRIPSI:*\n`
      cap += `${targetMonster.desc || '-'}\n`
      cap += `━━━━━━━━━━━`

      return m.reply(cap)
    }

    // =========================
    // LIST ALL MONSTER
    // =========================
    let cap = header('DAFTAR ALL MONSTER')

    const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']

    let counter = 1

    ranks.forEach(rank => {
      const list = DEVIL_LIST.filter(d => d.rank === rank)

      if (!list.length) return

      cap += `\n*${rank} RANK*\n`

      list.forEach(d => {
        cap += `${counter}. ${d.emoji} ${d.nama} [${d.rank}]\n`
        counter++
      })
    })

    cap += `━━━━━━━━━━━\n`
    cap += `*INFO:* Ketik:\n`
    cap += `.csm contract list info <nomor/nama>\n`
    cap += `━━━━━━━━━━━`

    return sendCsmReply(cap, CSM_PICTURES.contract)
  }

  // =========================
  // TRIAL / DEAL
  // =========================
  if ((sub === 'trial' || sub === 'deal') && ['yes', 'terima', 'accept', 'no', 'tolak', 'reject'].includes((args[2] || '').toLowerCase())) {
    const choice = (args[2] || '').toLowerCase()
    if (['yes', 'terima', 'accept'].includes(choice)) {
      args[1] = 'yes'
      args.splice(2, 1)
      sub = 'yes'
    } else {
      args[1] = 'no'
      args.splice(2, 1)
      sub = 'no'
    }
  }

  if (sub === 'trial' || sub === 'deal') {
    // Protection fiend / hybrid
    if (['fiend', 'hybrid'].includes(csm.erasureProtection)) {
      return m.reply(
        header('KONTRAK TERBATAS') +
        `Perlindunganmu hanya mengizinkan kontrak ${csm.erasureProtection}. ` +
        `Trial/deal Devil tidak tersedia.\n` +
        `━━━━━━━━━━━`
      )
    }

    const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']

    const sortedDb = [...DEVIL_LIST].sort((a, b) => {
      return ranks.indexOf(a.rank) - ranks.indexOf(b.rank)
    })

    const num = parseInt(args[2], 10)

    if (
      isNaN(num) ||
      num < 1 ||
      num > sortedDb.length
    ) {
      return m.reply(
        header('ANGKA SALAH') +
        `.csm contract list\n` +
        `Pilih nomor index 1-${sortedDb.length}\n` +
        `━━━━━━━━━━━`
      )
    }

    const devil = sortedDb[num - 1]

    if (!devil) {
      return m.reply(
        header('DEVIL ERROR') +
        `Data Devil tidak ditemukan.\n` +
        `━━━━━━━━━━━`
      )
    }

    const rankPrice = {
      E: 200000,
      D: 225000,
      C: 300000,
      B: 450000,
      A: 700000,
      S: 1000000,
      SS: 1500000,
      SSS: 2500000
    }

    let price = rankPrice[devil.rank] || 200000

    // Trial = 50% harga permanen
    if (sub === 'trial') {
      price = Math.floor(price * 0.5)
    }

    if (csm.blood < price) {
      return m.reply(
        header('DARAH KURANG') +
        `Butuh ${price.toLocaleString()} Darah\n` +
        `Kamu punya: ${csm.blood.toLocaleString()} Darah\n` +
        `━━━━━━━━━━━`
      )
    }

    // Jangan menimpa pending yang masih aktif
    if (csm.contractPending) {
      const pendingAge = Date.now() - csm.contractPending.time

      if (pendingAge <= 60000) {
        return m.reply(
          header('MASIH MENUNGGU') +
          `Masih ada kontrak yang menunggu konfirmasi.\n` +
          `Ketik *.csm contract ${sub} yes/terima* atau *.csm contract ${sub} no/tolak*\n` +
          `━━━━━━━━━━━`
        )
      }

      csm.contractPending = null
    }

    csm.contractPending = {
      type: sub,
      devil: devil.nama,
      price: price,
      time: Date.now()
    }

    saveDB(wdb)

    const durasi = sub === 'trial'
      ? '2 Hari'
      : 'Permanen'

    let cap = header(
      `KONFIRMASI ${sub.toUpperCase()}`
    )

    cap += `${devil.emoji} *${devil.nama}* [${devil.rank}]\n`
    cap += `Harga: ${price.toLocaleString()} Darah\n`
    cap += `Durasi: ${durasi}\n\n`
    const contractScene = contractScenes[Math.floor(Math.random() * contractScenes.length)]
    rememberSeen('seenContractScenes', contractScene)
    cap += `${contractScene}\n\n`
    cap += `Yakin ingin melakukan kontrak darah langsung dengan ${devil.nama}?\n\n`
    cap += `Ketik: *.csm contract ${sub} yes/terima* untuk menyetujui\n`
    cap += `Ketik: *.csm contract ${sub} no/tolak* untuk membatalkan\n`
    cap += `━━━━━━━━━━━`

    return sendCsmReply(cap, CSM_PICTURES.contractScene)
  }

  // =========================
  // CONFIRM YES
  // =========================
  if (sub === 'yes') {
    if (!csm.contractPending) {
      return m.reply(
        header('TIDAK ADA KONTRAK') +
        `Tidak ada kontrak yang menunggu konfirmasi.\n` +
        `━━━━━━━━━━━`
      )
    }

    // Pending hanya berlaku 1 menit
    if (
      Date.now() - csm.contractPending.time > 60000
    ) {
      csm.contractPending = null
      saveDB(wdb)

      return m.reply(
        header('KEDALUWARSA') +
        `Konfirmasi kontrak sudah kedaluwarsa 1 menit.\n` +
        `━━━━━━━━━━━`
      )
    }

    const data = csm.contractPending

    // Cek ulang darah
    if (csm.blood < data.price) {
      csm.contractPending = null
      saveDB(wdb)

      return m.reply(
        header('DARAH KURANG') +
        `Darahmu tidak cukup untuk menyelesaikan kontrak.\n` +
        `Butuh: ${data.price.toLocaleString()} Darah\n` +
        `Punya: ${csm.blood.toLocaleString()} Darah\n` +
        `━━━━━━━━━━━`
      )
    }

    let devil = null

    // =========================
    // GACHA
    // =========================
    if (data.type === 'gacha') {
      const contractType =
        data.contractType ||
        data.rank ||
        'devil'

      let pool = DEVIL_LIST.filter(entity => {
        const meta = getContractMeta(entity) || {}
        const types = Array.isArray(meta.types)
          ? meta.types
          : []

        return types.includes(contractType)
      })

      // Host harus benar-benar bisa Host
      if (contractType === 'host') {
        pool = pool.filter(entity => {
          const meta = getContractMeta(entity) || {}
          return meta.canHost === true
        })
      }

      // Kalau pool kosong, fallback Fiend
      if (!pool.length) {
        pool = DEVIL_LIST.filter(
          entity => entity.tipe === 'Fiend'
        )
      }

      if (!pool.length) {
        csm.contractPending = null
        saveDB(wdb)

        return m.reply(
          header('GACHA ERROR') +
          `Tidak ada Devil yang tersedia untuk kontrak ini.\n` +
          `━━━━━━━━━━━`
        )
      }

      devil = pool[
        Math.floor(Math.random() * pool.length)
      ]

      csm.lastGacha = Date.now()

      // Gacha selalu permanen
      csm.contractExpire = 0
    }

    // =========================
    // TRIAL / DEAL
    // =========================
    else {
      devil = DEVIL_LIST.find(
        d => d.nama === data.devil
      )

      if (!devil) {
        csm.contractPending = null
        saveDB(wdb)

        return m.reply(
          header('DEVIL ERROR') +
          `Data Devil tidak ditemukan dalam database.\n` +
          `━━━━━━━━━━━`
        )
      }

      if (data.type === 'trial') {
        // 2 hari
        csm.contractExpire =
          Date.now() + 172800000
      } else {
        // Permanen
        csm.contractExpire = 0
      }
    }

 // =========================
 // SIMPAN KONTRAK LAMA
 // =========================
 if (csm.devilContract) {
  csm.contractHistory.push(
    csm.devilContract
  )
}

    // =========================
    // BAYAR DARAH
    // =========================
    csm.blood -= data.price

    // =========================
    // SET KONTRAK BARU
    // =========================
    csm.devilContract = devil.nama

    csm.contractType =
      data.type === 'gacha'
        ? (data.contractType || data.rank || 'devil')
        : 'devil'

    csm.dollContract = false

    // Auto transform
    csm.isTransform = true

    // Hapus pending
    csm.contractPending = null

    saveDB(wdb)

    // =========================
    // HASIL
    // =========================
    const sisa =
      csm.contractExpire > 0
        ? `⏰ Durasi: 2 Hari\n`
        : `⏰ Durasi: Permanen\n`

    const titleMsg =
      data.type === 'gacha'
        ? `GACHA ${String(data.contractType || data.rank || 'DEVIL').toUpperCase()} BERHASIL`
        : `KONTRAK ${data.type.toUpperCase()} BERHASIL`

    const contractResponse = devil.tipe === 'Fiend'
      ? `${devil.emoji} ${devil.nama}: "Tubuh ini sekarang berbagi napas denganku. Jangan sia-siakan kekuatan ini."`
      : `${devil.emoji} ${devil.nama}: "Kontrak diterima. Setiap kekuatan punya harga, Hunter."`

    return sendCsmReply(
      header(titleMsg) +
      `${devil.emoji} *${devil.nama}* [${devil.rank}]\n` +
      `-${data.price.toLocaleString()} Darah\n` +
      `${sisa}` +
      `✅ Auto Transform Aktif\n` +
      `Kalian kini resmi terikat perjanjian darah.\n\n` +
      `${contractResponse}\n` +
      `━━━━━━━━━━━`, CSM_PICTURES.contractScene
    )
  }

  // =========================
  // CONFIRM NO
  // =========================
  if (sub === 'no') {
    if (!csm.contractPending) {
      return m.reply(
        header('TIDAK ADA KONTRAK') +
        `Tidak ada kontrak yang perlu dibatalkan.\n` +
        `━━━━━━━━━━━`
      )
    }

    csm.contractPending = null

    saveDB(wdb)

    return m.reply(
      header('KONTRAK DIBATALKAN') +
      `Kamu mundur dari perjanjian darah.\n` +
      `━━━━━━━━━━━`
    )
  }

  // =========================
  // GACHA TYPE
  // =========================
  const type = sub

  if (
    !type ||
    !['host', 'fiend', 'hybrid', 'devil'].includes(type)
  ) {
    return m.reply(
      header('PENGGUNAAN') +
      `.csm contract host - 5.000 Darah\n` +
      `.csm contract fiend - 10.000 Darah\n` +
      `.csm contract hybrid - 50.000 Darah\n` +
      `.csm contract devil - 100.000 Darah\n` +
      `.csm contract trial <angka> - Sewa Devil 2 Hari\n` +
      `.csm contract deal <angka> - Beli Devil Permanen\n` +
      `.csm contract list [info <angka/nama>]\n` +
      `.csm contract database\n` +
      `.csm contract history\n` +
      `━━━━━━━━━━━`
    )
  }

  // =========================
  // HORSEMEN PROTECTION
  // =========================
  if (csm.erasureProtection?.startsWith('horsemen:')) {
    return m.reply(
      header('KONTRAK TERKUNCI') +
      `Kamu adalah bagian dari Four Horsemen dan tidak bisa membuat kontrak lain.\n` +
      `━━━━━━━━━━━`
    )
  }

  // =========================
  // FIEND / HYBRID PROTECTION
  // =========================
  if (
    ['fiend', 'hybrid'].includes(csm.erasureProtection) &&
    type !== csm.erasureProtection
  ) {
    return m.reply(
      header('KONTRAK TERBATAS') +
      `Perlindunganmu hanya mengizinkan kontrak ${csm.erasureProtection}.\n` +
      `━━━━━━━━━━━`
    )
  }

  // =========================
  // HARGA GACHA
  // =========================
  const cost = CONTRACT_PRICE[type]

  if (typeof cost !== 'number') {
    return m.reply(
      header('DATA KONTRAK ERROR') +
      `Harga kontrak ${type} tidak ditemukan.\n` +
      `━━━━━━━━━━━`
    )
  }

  if (csm.blood < cost) {
    return m.reply(
      header('DARAH KURANG') +
      `Butuh ${cost.toLocaleString()} Darah untuk gacha ${type}.\n` +
      `Kamu punya: ${csm.blood.toLocaleString()} Darah\n` +
      `━━━━━━━━━━━`
    )
  }

  // =========================
  // COOLDOWN GACHA
  // =========================
  const lastGachaTime = csm.lastGacha || 0
  const cdLeft =
    300000 - (Date.now() - lastGachaTime)

  if (cdLeft > 0) {
    const menit = Math.floor(cdLeft / 60000)
    const detik = Math.ceil(
      (cdLeft % 60000) / 1000
    )

    return m.reply(
      header('COOLDOWN GACHA') +
      `Tunggu ${menit} menit ${detik} detik lagi sebelum melakukan gacha kembali.\n` +
      `━━━━━━━━━━━`
    )
  }

  // =========================
  // CEK PENDING LAMA
  // =========================
  if (csm.contractPending) {
    const pendingAge =
      Date.now() - csm.contractPending.time

    if (pendingAge <= 60000) {
      return m.reply(
        header('MASIH MENUNGGU') +
        `Masih ada kontrak yang menunggu konfirmasi.\n` +
        `Ketik *.csm contract yes* atau *.csm contract no*\n` +
        `━━━━━━━━━━━`
      )
    }

    csm.contractPending = null
  }

  // =========================
  // BUAT PENDING GACHA
  // =========================
  csm.contractPending = {
    type: 'gacha',
    contractType: type,
    rank: type,
    price: cost,
    time: Date.now()
  }

  saveDB(wdb)

  // =========================
  // KONFIRMASI GACHA
  // =========================
  const contractLabel = {
    host: 'Host Devil',
    fiend: 'Fiend',
    hybrid: 'Hybrid',
    devil: 'Devil Murni'
  }

  let cap = header(
    `KONFIRMASI KONTRAK ${type.toUpperCase()}`
  )

  cap += `Kamu akan membuat kontrak acak tipe ${contractLabel[type]}.\n`
  cap += `Biaya Gacha: ${cost.toLocaleString()} Darah\n`
  cap += `Durasi: Permanen\n\n`
  const contractScene = contractScenes[Math.floor(Math.random() * contractScenes.length)]
  rememberSeen('seenContractScenes', contractScene)
  cap += `${contractScene}\n\n`
  cap += `Apakah kamu yakin ingin melanjutkan gacha acak ini?\n\n`
  cap += `Ketik: *.csm contract yes* untuk lanjut\n`
  cap += `Ketik: *.csm contract no* untuk batal\n`
  cap += `━━━━━━━━━━━`

  return sendCsmReply(cap, CSM_PICTURES.contractScene)
}

  // === BLOOD / CONVERT BLOOD 💱

if (action === 'blood') {

  // Pastikan data pending tersedia
  if (typeof csm.pendingBlood !== 'number') {
    csm.pendingBlood = 0
  }

  const sub = args[1]?.toLowerCase()

  // =========================
  // LIHAT BLOOD + BANK
  // .csm blood
  // =========================
  if (!sub) {
    return m.reply(
      header('BLOOD') +
      `🩸 Blood: ${csm.blood.toLocaleString()}\n` +
      `💰 Bank: Rp ${userRPG.bank.toLocaleString()}\n` +
      `\n` +
      `Rate Konversi:\n` +
      `Rp 1.500 = 1 Blood\n` +
      `\n` +
      `📌.csm blood convert <jumlah>\n` +
      `📌.csm blood deal - Konfirmasi\n` +
      `📌.csm blood cancel - Batalkan\n` +
      `━━━━━━━━━━━`
    )
  }

  // =========================
  // CANCEL
  // .csm blood cancel
  // =========================
  if (sub === 'cancel') {

    if (!csm.pendingBlood || csm.pendingBlood <= 0) {
      return m.reply(
        header('TIDAK ADA KONVERSI') +
        `Tidak ada konversi Blood yang menunggu konfirmasi.\n` +
        `━━━━━━━━━━━`
      )
    }

    csm.pendingBlood = 0
    saveDB(wdb)

    return m.reply(
      header('KONVERSI DIBATALKAN') +
      `Permintaan konversi Blood telah dibatalkan.\n` +
      `Bank kamu tidak berubah.\n` +
      `━━━━━━━━━━━`
    )
  }

  // =========================
  // DEAL / KONFIRMASI
  // .csm blood deal
  // =========================
  if (sub === 'deal') {

    if (!csm.pendingBlood || csm.pendingBlood <= 0) {
      return m.reply(
        header('TIDAK ADA KONVERSI') +
        `Gunakan:\n` +
        `.csm blood convert <jumlah>\n` +
        `terlebih dahulu.\n` +
        `━━━━━━━━━━━`
      )
    }

    const dapat = csm.pendingBlood
    const harga = dapat * 1500

    // Cek ulang saldo saat konfirmasi
    if (userRPG.bank < harga) {
      return m.reply(
        header('SALDO KURANG') +
        `Butuh: Rp ${harga.toLocaleString()}\n` +
        `Bank: Rp ${userRPG.bank.toLocaleString()}\n` +
        `Kurang: Rp ${(harga - userRPG.bank).toLocaleString()}\n` +
        `━━━━━━━━━━━`
      )
    }

    // Potong Bank
    userRPG.bank -= harga

    // Tambahkan Blood
    csm.blood += dapat

    // Hapus pending
    csm.pendingBlood = 0

    saveDB(wdb)

    return m.reply(
      header('KONVERSI BERHASIL') +
      `💰 Bank: -Rp ${harga.toLocaleString()}\n` +
      `🩸 Blood: +${dapat.toLocaleString()}\n` +
      `\n` +
      `🩸 Total Blood: ${csm.blood.toLocaleString()}\n` +
      `💰 Sisa Bank: Rp ${userRPG.bank.toLocaleString()}\n` +
      `━━━━━━━━━━━`
    )
  }

  // =========================
  // CONVERT
  // .csm blood convert <jumlah>
  // =========================
  if (sub === 'convert') {

    const input = args[2]

    if (!input) {
      return m.reply(
        header('PENGGUNAAN') +
        `.csm blood convert <jumlah>\n` +
        `Contoh: .csm blood convert 15000\n` +
        `━━━━━━━━━━━`
      )
    }

    const money = parseInt(input, 10)

    if (!Number.isFinite(money) || money <= 0) {
      return m.reply(
        header('JUMLAH SALAH') +
        `Masukkan jumlah Rupiah yang valid.\n` +
        `Contoh: .csm blood convert 15000\n` +
        `━━━━━━━━━━━`
      )
    }

    if (money < 1500) {
      return m.reply(
        header('JUMLAH TERLALU KECIL') +
        `Minimal konversi Rp 1.500 = 1 Blood.\n` +
        `━━━━━━━━━━━`
      )
    }

    // Hanya bisa mengubah kelipatan Rp 1.500
    const dapat = Math.floor(money / 1500)
    const harga = dapat * 1500

    if (dapat <= 0) {
      return m.reply(
        header('JUMLAH SALAH') +
        `Minimal Rp 1.500 = 1 Blood.\n` +
        `━━━━━━━━━━━`
      )
    }

    // Jangan izinkan melebihi Bank
    if (userRPG.bank < harga) {
      return m.reply(
        header('SALDO KURANG') +
        `Butuh: Rp ${harga.toLocaleString()}\n` +
        `Bank: Rp ${userRPG.bank.toLocaleString()}\n` +
        `━━━━━━━━━━━`
      )
    }

    // Simpan jumlah Blood yang akan didapat
    csm.pendingBlood = dapat
    saveDB(wdb)

    return m.reply(
      header('KONFIRMASI BLOOD') +
      `💰 Tukar: Rp ${harga.toLocaleString()}\n` +
      `🩸 Dapat: +${dapat.toLocaleString()} Blood\n` +
      `Rate: Rp 1.500 = 1 Blood\n\n` +
      `Bank kamu: Rp ${userRPG.bank.toLocaleString()}\n` +
      `Setelah deal: Rp ${(userRPG.bank - harga).toLocaleString()}\n\n` +
      `Ketik:\n` +
      `.csm blood deal - Konfirmasi\n` +
      `.csm blood cancel - Batalkan\n` +
      `━━━━━━━━━━━`
    )
  }

  // =========================
  // COMMAND SALAH
  // =========================
  return m.reply(
    header('PENGGUNAAN') +
    `.csm blood - Lihat Blood & Bank\n` +
    `.csm blood convert <jumlah> - Tukar Bank → Blood\n` +
    `.csm blood deal - Konfirmasi\n` +
    `.csm blood cancel - Batalkan\n` +
    `━━━━━━━━━━━`
  )
}
  
// ============================================================
// STORY SYSTEM 📖
// ============================================================

if (action === 'story') {
  if (!csm.storyCooldown) csm.storyCooldown = {}

  const now = Date.now()
  const storyCooldown = 60 * 60 * 1000

  // ==========================================================
  // STORY REPLAY
  // ==========================================================

  if (args[2]?.toLowerCase() === 'replay') {
    const targetNo = parseInt(args[3], 10)

    if (!targetNo || isNaN(targetNo)) {
      return m.reply(
        header('FORMAT SALAH') +
        ` Contoh: *${usedPrefix}csm story replay 3*\n` +
        `|━━━━━━━━━━━`
      )
    }

    if (targetNo < 1 || targetNo >= csm.story) {
      return m.reply(
        header('GAGAL') +
        ` Arc ${targetNo} belum terbuka.\n` +
        ` Arc terjauh kamu: Arc ${csm.story}\n` +
        `|━━━━━━━━━━━`
      )
    }

    const story = STORY_LIST.find(s => s.no === targetNo)

    if (!story) {
      return m.reply(
        header('ARC TIDAK DITEMUKAN') +
        ` Arc ${targetNo} tidak tersedia.\n` +
        `|━━━━━━━━━━━`
      )
    }

    const lastUsed = csm.storyCooldown[targetNo] || 0

    if (now - lastUsed < storyCooldown) {
      const sisa = Math.ceil(
        (storyCooldown - (now - lastUsed)) / 60000
      )

      return m.reply(
        header('COOLDOWN') +
        ` Arc ${targetNo} masih cooldown.\n` +
        ` Tunggu *${sisa} menit* lagi.\n` +
        `|━━━━━━━━━━━`
      )
    }

    if (csm.health < 50) {
      return m.reply(
        header('HP KURANG') +
        ` Butuh minimal *50 HP* untuk Story.\n` +
        ` HP kamu: *${csm.health}/${csm.maxHealth}*\n` +
        `|━━━━━━━━━━━`
      )
    }

    // ----------------------------------------------------------
    // BASE WIN RATE
    // ----------------------------------------------------------

    let winRate =
      0.20 +
      (csm.level * 0.015) +
      (csm.partners || [])
        .filter(p => p.status === 'active')
        .reduce((total, partner) => total + getPartnerLevel(partner) * 0.02, 0)

    // ----------------------------------------------------------
    // RESET PENALTY
    // Makin sering reset -> story makin sulit
    // Tidak pernah dibuat 0%
    // ----------------------------------------------------------

    const resetPenalty =
      Math.min(0.30, (csm.resetCount || 0) * 0.025)

    winRate -= resetPenalty

    // ----------------------------------------------------------
    // ENDING BUFF PENALTY
    // Reward ending yang sudah dikumpulkan membuat dunia
    // semakin sulit.
    // ----------------------------------------------------------

    const endingCount =
      Array.isArray(csm.endingReward)
        ? csm.endingReward.length
        : 0

    const endingPenalty =
      Math.min(0.25, endingCount * 0.015)

    winRate -= endingPenalty

    // ----------------------------------------------------------
    // LEVEL ADVANTAGE TETAP ADA
    // ----------------------------------------------------------

    winRate = Math.max(
      0.05,
      Math.min(0.90, winRate)
    )

    const win = Math.random() < winRate

    // ----------------------------------------------------------
    // HP BERKURANG SAAT STORY
    // ----------------------------------------------------------

    const hpCost = Math.max(
      10,
      Math.floor(
        20 *
        (1 + Math.min(0.75, (csm.resetCount || 0) * 0.05))
      )
    )

    csm.health = Math.max(
      1,
      csm.health - hpCost
    )

    // ----------------------------------------------------------
    // DEVIL
    // ----------------------------------------------------------

    const devil = DEVIL_LIST.find(
      d => d.nama === story.devil
    )

    const devilName =
      devil?.nama || story.devil

    const devilEmoji =
      devil?.emoji || '👹'

    // ----------------------------------------------------------
    // DIALOG
    // ----------------------------------------------------------

    const devilDialog = {
      'Zombie Devil': {
        win: [
          'Graaah... otak...',
          'Aku... lapar... mati...'
        ],
        lose: [
          'Gigit... makan kamu...',
          'Join kami... jadi zombie...'
        ]
      },

      'Bat Devil': {
        win: [
          'Meowy... aku gagal...',
          'Darahmu... enak...'
        ],
        lose: [
          'Serahkan jantungmu!',
          'Kau bukan tandingan kami!'
        ]
      },

      'Eternity Devil': {
        win: [
          'Tolong... hentikan...',
          'Aku menyerah... keluarin aku...'
        ],
        lose: [
          'Terjebak selamanya disini...',
          'Waktumu akan habis...'
        ]
      },

      'Katana Man': {
        win: [
          'Sial... Yakuza payah...',
          'Ular... gagal...'
        ],
        lose: [
          'Potong dia!',
          'Kontrak Ular! Habisi!'
        ]
      },

      'Bomb Devil': {
        win: [
          'Denji... maaf... aku bohong...',
          'Meledak... bersamaku...'
        ],
        lose: [
          'BOOM! Rasakan ini!',
          'Kau tak akan menang!'
        ]
      },

      'Quanxi': {
        win: [
          'Monster... semua monster...',
          'Boneka... hancur...'
        ],
        lose: [
          'Tembak dia!',
          'Untuk jantung Chainsaw Man!'
        ]
      },

      'Gun Devil': {
        win: [
          '*Bunyi tembakan jauh*... sial...',
          'Satu tahun sia-sia...'
        ],
        lose: [
          'DOR! DOR! DOR!',
          'Jutaan nyawa untuk 1 tembakan!'
        ]
      },

      'Control Devil': {
        win: [
          'Anjing... beraninya...',
          'Pochita... kenapa...',
          'Kau... memakanku...'
        ],
        lose: [
          'Tunduk. Sekarang.',
          'Kau milikku. Anjing yang baik.',
          'Diam.'
        ]
      },

      'Justice Devil': {
        win: [
          'Keadilan... gagal...',
          'Ini tidak adil!'
        ],
        lose: [
          'Hukum akan menghukummu!',
          'Bersalah!'
        ]
      },

      'Falling Devil': {
        win: [
          'Trauma... tidak cukup...',
          'Jatuh... jatuh...'
        ],
        lose: [
          'Rasakan keputusasaan!',
          'Terbanglah ke langit!'
        ]
      },

      'Fire Devil': {
        win: [
          'Gereja... gagal...',
          'Terbakar... semua...'
        ],
        lose: [
          'Bakar dia!',
          'Untuk Chainsaw Man!'
        ]
      },

      'Aging Devil': {
        win: [
          'Waktu... habis...',
          'Tua... rapuh...'
        ],
        lose: [
          'Menua... membusuk...',
          'Kau tak bisa lari dari waktu.'
        ]
      },

      'Barem Bridge': {
        win: ['Api unggun ini padam terlalu cepat...', 'Gereja kehilangan satu bidaknya.'],
        lose: ['Bakar semuanya!', 'Chainsaw Man akan datang!']
      },

      'Prison Devil': {
        win: ['Sel ini... tidak bisa menahanku...', 'Kunci-kunci itu patah.'],
        lose: ['Tidak ada jalan keluar.', 'Kau akan tetap di sini selamanya.']
      },

      'Chainsaw Devil': {
        win: ['Pochita... akhirnya...', 'Suara gergaji itu berhenti.'],
        lose: ['BRRRAAAK!', 'Jangan halangi Chainsaw Man!']
      },

      default: {
        win: [
          'Aku kalah...',
          'Sialan...'
        ],
        lose: [
          'Mati kau!',
          'Lemah!'
        ]
      }
    }

    const quotes =
      devilDialog[devilName] ||
      devilDialog.default

    const quotePool =
      win ? quotes.win : quotes.lose

    const devilQuote =
      quotePool[
        Math.floor(Math.random() * quotePool.length)
      ]

    // ----------------------------------------------------------
    // SPECIAL EFFECT
    // ----------------------------------------------------------

    let efek = ''

    if (devilName === 'Control Devil') {
      efek = win
        ? '⛓️⛓️⛓️ *TRENGG!!!* ⛓️⛓️⛓️\nTanah Neraka bergetar... Rantai menembus tubuhnya...\n\n'
        : '⛓️⛓️⛓️ *DUARR!!!* ⛓️⛓️⛓️\nTekanan mengerikan! Lututmu melemah di hadapan Control Devil...\n\n'
    }

    // ----------------------------------------------------------
    // MENANG REPLAY
    // ----------------------------------------------------------

    if (win) {
      const expBase =
        500 + (story.no * 100)

      const expReward =
        Math.floor(expBase * 0.5)

      csm.storyCooldown[targetNo] = now

      const leveled =
        addExp(expReward)

      saveDB(wdb)

      let msg =
        header(`📖 ${story.nama}`) +
        ` ✅ KEMENANGAN\n` +
        ` 🔁 MODE REPLAY | CD: 1 jam\n` +
        ` ${efek}` +
        ` ${story.desc}\n\n` +
        ` ${devilEmoji} *${devilName}*: "${devilQuote}"\n\n` +
        `|━━━━━━━━━━━\n` +
        ` ❤️ HP: -${hpCost}\n` +
        ` 📈 +${expReward} EXP\n` +
        ` 🩸 Blood: Tidak berubah`

      if (leveled) {
        msg +=
          `\n|🎉 LEVEL UP! Lv.${csm.level}`
      }

      msg += `\n|━━━━━━━━━━━`

      await checkMakimaTrigger(
        m,
        csm,
        wdb
      )

      return sendCsmReply(msg, getStoryPicture(devilName))
    }

    // ----------------------------------------------------------
    // GAGAL REPLAY
    // ----------------------------------------------------------

    csm.storyCooldown[targetNo] = now

    saveDB(wdb)

    return sendCsmReply(
      header('GAGAL') +
      `${efek}` +
      ` ✅ KEMENANGAN\n` +
      ` 🔁 MODE REPLAY | CD: 1 jam\n` +
      ` ${efek}` +
      ` ${story.desc}\n\n` +
      ` ${devilEmoji} *${devilName}*: "${devilQuote}"\n\n` +
      ` ❤️ HP: -${hpCost}\n` +
      ` 🩸 Blood: Tidak berubah\n` +
      `|━━━━━━━━━━━`,
      getStoryPicture(devilName)
    )
  }

  // ==========================================================
  // STORY NORMAL
  // ==========================================================

  if (now - csm.lastStory < storyCooldown) {
    const sisa = Math.ceil(
      (storyCooldown - (now - csm.lastStory)) /
      60000
    )

    return m.reply(
      header('COOLDOWN STORY') +
      ` Tunggu *${sisa} menit* lagi sebelum menjalankan story berikutnya.\n` +
      `|━━━━━━━━━━━`
    )
  }

  const story =
    STORY_LIST.find(s => s.no === csm.story)

  if (!story) {
    return sendCsmReply(
      header('TAMAT') +
      ` Selamat! Kamu sudah menyelesaikan semua Arc Chainsaw Man.\n` +
      ` Kamu telah menamatkan perjalanan sampai Chainsaw Devil.\n\n` +
      ` Terima kasih sudah bertahan sebagai Devil Hunter. Setelah ini kamu bisa memilih ending; setelah dikonfirmasi, perjalanan akan otomatis dimulai lagi dari Arc 1.\n` +
      `|━━━━━━━━━━━`,
      CSM_PICTURES.congratulations
    )
  }

  const bloodCost =
    500 + (story.no * 200)

  if (csm.blood < bloodCost) {
    return m.reply(
      header('BLOOD KURANG') +
      ` Butuh *${bloodCost.toLocaleString()} Blood* untuk memulai Arc ini.\n` +
      ` 🩸 Blood kamu: *${csm.blood.toLocaleString()}*\n` +
      `|━━━━━━━━━━━`
    )
  }

  if (csm.health < 50) {
    return m.reply(
      header('HP KURANG') +
      ` Butuh minimal *50 HP* untuk Story.\n` +
      ` ❤️ HP kamu: *${csm.health}/${csm.maxHealth}*\n` +
      `|━━━━━━━━━━━`
    )
  }

  // ----------------------------------------------------------
  // WIN RATE
  // ----------------------------------------------------------

  let winRate =
    0.20 +
    (csm.level * 0.015) +
    (csm.partners || [])
      .filter(p => p.status === 'active')
      .reduce((total, partner) => total + getPartnerLevel(partner) * 0.02, 0)

  // Reset penalty
  const resetPenalty =
    Math.min(
      0.50,
      (csm.resetCount || 0) * 0.05
    )

  // Ending reward penalty
  const endingCount =
    Array.isArray(csm.endingReward)
      ? csm.endingReward.length
      : 0

  const endingPenalty =
    Math.min(
      0.30,
      endingCount * 0.03
    )

  winRate -= resetPenalty
  winRate -= endingPenalty

  // Selalu masih mungkin menang
  winRate = Math.max(
    0.05,
    Math.min(0.90, winRate)
  )

  const win =
    Math.random() < winRate

  // ----------------------------------------------------------
  // HP COST
  // ----------------------------------------------------------

  const hpCost =
    Math.max(
      10,
      Math.floor(
        20 *
        (
          1 +
          Math.min(
            0.75,
            (csm.resetCount || 0) * 0.05
          )
        )
      )
    )

  csm.health = Math.max(
    1,
    csm.health - hpCost
  )

  // Blood hanya dibayar sekali saat memulai Story
  csm.blood -= bloodCost
  csm.lastStory = now

  // ----------------------------------------------------------
  // DEVIL
  // ----------------------------------------------------------

  const devil =
    DEVIL_LIST.find(
      d => d.nama === story.devil
    )

  const devilName =
    devil?.nama || story.devil

  const devilEmoji =
    devil?.emoji || '👹'

  const devilDialog = {
    'Zombie Devil': {
      win: ['Graaah... otak...', 'Aku... lapar... mati...'],
      lose: ['Gigit... makan kamu...', 'Join kami... jadi zombie...']
    },

    'Bat Devil': {
      win: ['Meowy... aku gagal...', 'Darahmu... enak...'],
      lose: ['Serahkan jantungmu!', 'Kau bukan tandingan kami!']
    },

    'Eternity Devil': {
      win: ['Tolong... hentikan...', 'Aku menyerah... keluarin aku...'],
      lose: ['Terjebak selamanya disini...', 'Waktumu akan habis...']
    },

    'Katana Man': {
      win: ['Sial... Yakuza payah...', 'Ular... gagal...'],
      lose: ['Potong dia!', 'Kontrak Ular! Habisi!']
    },

    'Bomb Devil': {
      win: ['Denji... maaf... aku bohong...', 'Meledak... bersamaku...'],
      lose: ['BOOM! Rasakan ini!', 'Kau tak akan menang!']
    },

    'Quanxi': {
      win: ['Monster... semua monster...', 'Boneka... hancur...'],
      lose: ['Tembak dia!', 'Untuk jantung Chainsaw Man!']
    },

    'Gun Devil': {
      win: ['*Bunyi tembakan jauh*... sial...', 'Satu tahun sia-sia...'],
      lose: ['DOR! DOR! DOR!', 'Jutaan nyawa untuk 1 tembakan!']
    },

    'Control Devil': {
      win: ['Anjing... beraninya...', 'Pochita... kenapa...', 'Kau... memakanku...'],
      lose: ['Tunduk. Sekarang.', 'Kau milikku. Anjing yang baik.', 'Diam.']
    },

    'Justice Devil': {
      win: ['Keadilan... gagal...', 'Ini tidak adil!'],
      lose: ['Hukum akan menghukummu!', 'Bersalah!']
    },

    'Falling Devil': {
      win: ['Trauma... tidak cukup...', 'Jatuh... jatuh...'],
      lose: ['Rasakan keputusasaan!', 'Terbanglah ke langit!']
    },

    'Fire Devil': {
      win: ['Gereja... gagal...', 'Terbakar... semua...'],
      lose: ['Bakar dia!', 'Untuk Chainsaw Man!']
    },

    'Aging Devil': {
      win: ['Waktu... habis...', 'Tua... rapuh...'],
      lose: ['Menua... membusuk...', 'Kau tak bisa lari dari waktu.']
    },

    'Barem Bridge': {
      win: ['Api itu padam terlalu cepat...', 'Gereja kehilangan satu bidaknya.'],
      lose: ['Bakar semuanya!', 'Chainsaw Man akan datang!']
    },

    'Prison Devil': {
      win: ['Sel ini... tidak bisa menahanku...', 'Kunci-kunci itu patah.'],
      lose: ['Tidak ada jalan keluar.', 'Kau akan tetap di sini selamanya.']
    },

    'Chainsaw Devil': {
      win: ['Pochita... akhirnya...', 'Suara gergaji itu berhenti.'],
      lose: ['BRRRAAAK!', 'Jangan halangi Chainsaw Man!']
    },

    default: {
      win: ['Aku kalah...', 'Sialan...'],
      lose: ['Mati kau!', 'Lemah!']
    }
  }

  const quotes =
    devilDialog[devilName] ||
    devilDialog.default

  const quotePool =
    win ? quotes.win : quotes.lose

  const devilQuote =
    quotePool[
      Math.floor(
        Math.random() * quotePool.length
      )
    ]

  let efek = ''

  if (devilName === 'Control Devil') {
    efek = win
      ? '⛓️⛓️⛓️ *TRENGG!!!* ⛓️⛓️⛓️\nTanah Neraka bergetar... Rantai menembus tubuhnya...\n\n'
      : '⛓️⛓️⛓️ *DUARR!!!* ⛓️⛓️⛓️\nTekanan mengerikan! Lututmu melemah di hadapan Control Devil...\n\n'
  }

  // ----------------------------------------------------------
  // MENANG
  // ----------------------------------------------------------

  if (win) {
    csm.story++

    const expReward =
      500 + (story.no * 100)

    const leveled =
      addExp(expReward)

    saveDB(wdb)

    let msg =
      header(`📖 ${story.nama}`) +
      ` ✅ KEMENANGAN\n` +
      ` ${efek}` +
      ` ${story.desc}\n\n` +
      ` ${devilEmoji} *${devilName}*: "${devilQuote}"\n\n` +
      `|━━━━━━━━━━━\n` +
      ` ❤️ HP: -${hpCost}\n` +
      ` 🩸 Blood: -${bloodCost.toLocaleString()}\n` +
      ` 📈 +${expReward} EXP\n` +
      ` ➡️ Arc Berikutnya Terbuka`

    if (leveled) {
      msg +=
        `\n|🎉 LEVEL UP! Lv.${csm.level}`
    }

    msg += `\n|━━━━━━━━━━━`

    await checkMakimaTrigger(
      m,
      csm,
      wdb
    )

    const storyPicture = getStoryPicture(devilName)
    if (csm.story > STORY_LIST.length) {
      await sendCsmReply(msg, storyPicture)
      return sendCsmReply(
        header('PERJALANAN SELESAI') +
        `Terima kasih sudah menyelesaikan seluruh ${STORY_LIST.length} Arc Chainsaw Man.\n\n` +
        `Kamu sudah menamatkan perjalanan sebagai Devil Hunter. Setelah ini kamu bisa melanjutkan eksplorasi, mengumpulkan partner, menaklukkan raid, atau memilih ending untuk mengulang perjalanan dari Arc 1.\n` +
        `Gunakan *.csm ending <1-7>* untuk memilih ending.\n` +
        `━━━━━━━━━━━`,
        CSM_PICTURES.congratulations
      )
    }
    return sendCsmReply(msg, storyPicture)
  }

  // ----------------------------------------------------------
  // GAGAL
  // ----------------------------------------------------------

  // Refund 50%
  const bloodRefund =
    Math.floor(bloodCost * 0.5)

  csm.blood += bloodRefund

  saveDB(wdb)

  return sendCsmReply(
    header('GAGAL') +
    `${efek}` +
    ` Kamu kalah melawan ${devilName}.\n` +
    ` ${devilEmoji} *${devilName}*: "${devilQuote}"\n\n` +
    ` ❤️ HP: -${hpCost}\n` +
    ` 🩸 Blood: -${bloodCost.toLocaleString()}\n` +
    ` 🩸 Refund: +${bloodRefund.toLocaleString()} Blood\n` +
    `|━━━━━━━━━━━`,
    getStoryPicture(devilName)
  )
}


// ============================================================
// STORY LIST 📚
// ============================================================

if (
  action === 'storylist' ||
  (action === 'story' &&
   args[2]?.toLowerCase() === 'list')
) {
  const now = Date.now()

  let list =
    header('DAFTAR ARC') +
    `|Arc kamu: *Arc ${csm.story}*\n` +
    `|Replay: *.csm story replay [angka]*\n` +
    `|━━━━━━━━━━━\n\n`

  STORY_LIST.forEach(s => {
    const status =
      s.no < csm.story
        ? '✅'
        : s.no === csm.story
          ? '▶️'
          : '🔒'

    const bloodCost =
      500 + (s.no * 200)

    const expReward =
      500 + (s.no * 100)

    const expReplay = Math.floor(expReward * 0.5)

    const lastUsed =
      csm.storyCooldown?.[s.no] || 0

    const cdSisa =
      Math.ceil(
        (60 * 60 * 1000 - (now - lastUsed)) /
        60000
      )

    const cdText =
      (
        s.no < csm.story &&
        cdSisa > 0
      )
        ? ` | ⏳${cdSisa}m`
        : ''

    list +=
      ` ${status} *${s.no}. ${s.nama}*${cdText}\n` +
      ` ${s.devil}\n` +
      ` 🩸 Blood: ${bloodCost.toLocaleString()}\n` +
      ` 📈 Reward: ${expReward} EXP\n` +
      ` 🔁 Replay: ${expReplay} EXP | 🩸0 | Gratis\n\n`
  })

  return m.reply(
    list +
    `|━━━━━━━━━━━\n` +
    `|*Note: Replay = 50% EXP & Gratis*`
  )
}


// ============================================================
// ENDING SYSTEM 🏁
// ============================================================

if (action === 'ending') {

  // ----------------------------------------------------------
  // DEFAULT FIELD
  // ----------------------------------------------------------

  if (!Array.isArray(csm.endingReward)) {
    csm.endingReward = []
  }

  if (!Array.isArray(csm.endingHistory)) {
    csm.endingHistory = []
  }

  if (!csm.endingBuffs) {
    csm.endingBuffs = {}
  }

  // ----------------------------------------------------------
  // HARUS SUDAH MENYELESAIKAN ARC TERAKHIR
  // ----------------------------------------------------------

  if (csm.story <= STORY_LIST.length) {
    return m.reply(
      header('BELUM BISA') +
      ` Selesaikan semua story dulu.\n` +
      ` Progress: ${Math.min(csm.story, STORY_LIST.length)}/${STORY_LIST.length}\n` +
      `|━━━━━━━━━━━`
    )
  }

  // ----------------------------------------------------------
  // SUDAH PUNYA ENDING AKTIF
  // ----------------------------------------------------------

  if (csm.ending) {
    return m.reply(
      header('ENDING SUDAH DIPILIH') +
      `|Ending saat ini: *${csm.ending}*\n` +
      `|Pilih ending lain untuk memperoleh reward berbeda. Setelah ending dipilih, perjalanan akan di-reset ke Arc 1 secara otomatis.\n` +
      `|━━━━━━━━━━━`
    )
  }

  const pilih =
    args[1]?.toLowerCase()

  // ----------------------------------------------------------
  // KONFIRMASI
  // ----------------------------------------------------------

  if (
    pilih === 'terima' ||
    pilih === 'tolak'
  ) {

    if (!csm.pendingEnding) {
      return m.reply(
        header('TIDAK ADA PILIHAN') +
        ` Pilih ending terlebih dahulu.\n` +
        ` Contoh: *.csm ending 1*\n` +
        `|━━━━━━━━━━━`
      )
    }

    // --------------------------------------------------------
    // TOLAK
    // --------------------------------------------------------

    if (pilih === 'tolak') {
      csm.pendingEnding = null

      saveDB(wdb)

      return m.reply(
        header('ENDING DIBATALKAN') +
        ` Kamu tidak memilih ending apa pun.\n` +
        ` Ketik *.csm ending <1-7>* untuk memilih lagi.\n` +
        `|━━━━━━━━━━━`
      )
    }

    // --------------------------------------------------------
    // TERIMA
    // --------------------------------------------------------

    const nomor =
      csm.pendingEnding.choice

    const endingData =
      csm.pendingEnding.data

    // Pastikan tidak menerima ending dua kali
    if (csm.ending) {
      csm.pendingEnding = null
      saveDB(wdb)

      return m.reply(
        header('ENDING SUDAH AKTIF') +
        ` Kamu sudah memiliki ending.\n` +
        `|━━━━━━━━━━━`
      )
    }

    // Ending aktif
    csm.ending =
      endingData.name

    // Jangan pernah mengubah csm.title
    // Title player tetap berasal dari sistem level.

    // --------------------------------------------------------
    // REWARD
    // --------------------------------------------------------

    if (
      !csm.endingReward.some(
        r => r.id === endingData.reward.id
      )
    ) {
      csm.endingReward.push({
        id: endingData.reward.id,
        name: endingData.reward.name,
        blood: endingData.reward.blood,
        bonus: endingData.reward.bonus,
        effect: endingData.reward.effect,
        obtainedAt: Date.now()
      })
    }

    // History ending
    csm.endingHistory.push({
      ending: endingData.name,
      choice: nomor,
      reward: endingData.reward.name,
      obtainedAt: Date.now()
    })

    // --------------------------------------------------------
    // BUFF ENDING
    // --------------------------------------------------------

    csm.endingBuffs[endingData.name] = {
      id: endingData.reward.id,
      name: endingData.reward.name,
      bonus: endingData.reward.bonus,
      effect: endingData.reward.effect,
      active: true
    }

    csm.lastEnding = endingData.name
    resetStoryAfterEnding()
    csm.blood += endingData.reward.blood

    saveDB(wdb)

    return m.reply(
      header(`ENDING: ${endingData.name.toUpperCase()}`) +
      ` ${endingData.story}\n\n` +
      `|━━━━━━━━━━━\n` +
      ` 🏆 Reward: *${endingData.reward.name}*\n` +
      ` 🩸 Blood: +${endingData.reward.blood.toLocaleString()}\n` +
      ` ✨ Bonus: ${endingData.reward.bonus}\n\n` +
      ` Title player tidak berubah.\n` +
      ` Reward ending tersimpan sebagai achievement/reward story.\n` +
      ` Story otomatis di-reset ke Arc 1; partner dan level tetap.\n` +
      `|━━━━━━━━━━━`
    )
  }

  // ----------------------------------------------------------
  // TIDAK ADA INPUT
  // ----------------------------------------------------------

  if (!pilih) {

    let cap =
      header('GERBANG TAKDIR')

    cap +=
      ` Kamu telah mencapai akhir perjalanan.\n` +
      ` Pilih satu takdir.\n\n`

    cap +=
      ` *1.* 🔥 FREEDOM\n` +
      `> Reward: Chainsaw Freedom\n` +
      `> Bonus: DMG +30% saat HP <30%\n\n`

    cap +=
      ` *2.* ⛓️ APOCALYPSE\n` +
      `> Reward: Fear Sovereign\n` +
      `> Bonus: Summon 1 Devil saat fight\n\n`

    cap +=
      ` *3.* 🏛️ CONTROL\n` +
      `> Reward: Control Authority\n` +
      `> Bonus: Gaji +Rp 50k/hari\n\n`

    cap +=
      ` *4.* 🩸 SACRIFICE\n` +
      `> Reward: Guardian Core\n` +
      `> Bonus: Revive 1x + Partner DMG +50%\n\n`

    cap +=
      ` *5.* 💕 LOVE\n` +
      `> Reward: Beloved Heart\n` +
      `> Bonus: Heal harian +100% + peluang Gacha Partner +100%\n\n`

    cap +=
      ` *6.* 🗡️ REVENGE\n` +
      `> Reward: Vengeance Core\n` +
      `> Bonus: DMG +50% permanen, heal hanya lewat Blood\n\n`

    cap +=
      ` *7.* 🕊️ PEACE\n` +
      `> Reward: Peace Core\n` +
      `> Bonus: Regen 10 HP/menit, tidak bisa fight\n\n`

    cap +=
      `|━━━━━━━━━━━\n` +
      ` 📌 Pilih: *.csm ending <1-7>*\n` +
      ` 📌 Setelah itu konfirmasi: *.csm ending terima*\n` +
      ` 📌 Batalkan: *.csm ending tolak*\n` +
      `|━━━━━━━━━━━`

    return m.reply(cap)
  }

  // ----------------------------------------------------------
  // VALIDASI PILIHAN
  // ----------------------------------------------------------

  const nomor =
    parseInt(pilih, 10)

  if (
    isNaN(nomor) ||
    nomor < 1 ||
    nomor > 7
  ) {
    return m.reply(
      header('PILIHAN SALAH') +
      ` 📌 Pilih ending 1 sampai 7.\n` +
      ` 📌 Contoh: *.csm ending 1*\n` +
      `|━━━━━━━━━━━`
    )
  }

  // ----------------------------------------------------------
  // DATA ENDING
  // ----------------------------------------------------------

  const ENDINGS = {

    1: {
      name: 'Freedom',

      story:
        `*POCHITA*: "Hehe... Denji pinter."\n\n` +
        `Rantai di dadamu patah. Tidak ada lagi perintah.\n` +
        `Tidak ada kontrak. Tidak ada yang mengendalikanmu.\n` +
        `Untuk pertama kalinya... kau bebas.`,

      reward: {
        id: 'freedom',
        name: '🏆 Chainsaw Freedom',
        blood: 50000,
        bonus: 'DMG +30% saat HP <30%',
        effect: { lowHealthDmg: 1.3 }
      }
    },

    2: {
      name: 'Apocalypse',

      story:
        `*MAKIMA*: "Anjing yang baik..."\n\n` +
        `Kota terbakar. Para Devil berlutut.\n` +
        `Kau tidak lagi menjadi pemburu.\n` +
        `Kau menjadi sesuatu yang ditakuti.`,

      reward: {
        id: 'apocalypse',
        name: '🏆 Fear Sovereign',
        blood: 75000,
        bonus: 'Summon 1 Devil saat fight',
        effect: { summon: 1 }
      }
    },

    3: {
      name: 'Control',

      story:
        `*FAMI*: "Keputusan yang bijak..."\n\n` +
        `Dunia menjadi rapi.\n` +
        `Chaos menghilang.\n` +
        `Tetapi kebebasan juga ikut menghilang.`,

      reward: {
        id: 'control',
        name: '🏆 Control Authority',
        blood: 60000,
        bonus: 'Blood +50.000 per hari kerja',
        effect: { bloodFlat: 50000 }
      }
    },

    4: {
      name: 'Sacrifice',

      story:
        `*AKI*: "Denji jangan..."\n` +
        `*POWER*: "BODOH! KABUR LAH!"\n\n` +
        `Kau maju sendirian.\n` +
        `Tubuhmu hancur, tetapi mereka tetap hidup.\n` +
        `Pengorbananmu menjadi tameng terakhir.`,

      reward: {
        id: 'sacrifice',
        name: '🏆 Guardian Core',
        blood: 80000,
        bonus: 'Revive 1x + Partner DMG +50%',
        effect: { revive: true, partnerDmgMultiplier: 1.5 }
      }
    },

    5: {
      name: 'Love',

      story:
        `*???*: "Denji... pulang yuk."\n\n` +
        `Kau meletakkan chainsaw.\n` +
        `Tidak ada lagi pertarungan.\n` +
        `Tidak ada lagi darah.\n` +
        `Hanya rumah kecil dan seseorang yang menunggu.`,

      reward: {
        id: 'love',
        name: '🏆 Beloved Heart',
        blood: 40000,
        bonus: 'Heal harian +100% + peluang Gacha Partner +100%',
        effect: { heal: 100, gachaBonus: 1 }
      }
    },

    6: {
      name: 'Revenge',

      story:
        `*POCHITA*: "Denji... matamu merah."\n\n` +
        `Rasa sakit menjadi bahan bakar.\n` +
        `Semua nama yang menyakitimu kau ukir di rantai.\n` +
        `Dan satu per satu akan membayar.`,

      reward: {
        id: 'revenge',
        name: '🏆 Vengeance Core',
        blood: 100000,
        bonus: 'DMG +50% permanen, heal hanya lewat Blood',
        effect: { dmgMultiplier: 1.5, noHeal: true }
      }
    },

    7: {
      name: 'Peace',

      story:
        `*POCHITA*: "..."\n\n` +
        `Kau mengubur chainsaw di tanah.\n` +
        `Tidak ada lagi pertarungan.\n` +
        `Hanya ladang kecil, matahari, dan angin.\n` +
        `Akhirnya... kau menemukan kedamaian.`,

      reward: {
        id: 'peace',
        name: '🏆 Peace Core',
        blood: 30000,
        bonus: 'Regen 10 HP/menit, tidak bisa fight',
        effect: { regen: 10, noFight: true }
      }
    }
  }

  const endingData =
    ENDINGS[nomor]

  // ----------------------------------------------------------
  // SUDAH PERNAH MENDAPAT REWARD INI?
  // ----------------------------------------------------------

  const already =
    csm.endingReward.some(
      r => r.id === endingData.reward.id
    )

  if (already) {
    return m.reply(
      header('ENDING SUDAH DIDAPAT') +
      `|Kamu sudah pernah mendapatkan reward:\n` +
      `|🏆 ${endingData.reward.name}\n\n` +
      `|Pilih ending lain.\n` +
      `|━━━━━━━━━━━`
    )
  }

  // ----------------------------------------------------------
  // SIMPAN PILIHAN → BELUM DIAPLIKASIKAN
  // ----------------------------------------------------------

  csm.pendingEnding = {
    choice: nomor,
    data: endingData,
    createdAt: Date.now()
  }

  saveDB(wdb)

  return m.reply(
    header(`KONFIRMASI ENDING ${nomor}`) +
    ` Kamu memilih: *${endingData.name}*\n\n` +
    ` ${endingData.story}\n\n` +
    `|━━━━━━━━━━━\n` +
    ` 🏆 Reward: ${endingData.reward.name}\n` +
    ` 🩸 Blood: +${endingData.reward.blood.toLocaleString()}\n` +
    ` ✨ Bonus: ${endingData.reward.bonus}\n\n` +
    ` ⚠️ Pilihan ini akan menjadi ending perjalananmu.\n` +
    ` ⚠️ Reward akan diberikan setelah konfirmasi.\n\n` +
    ` ✅ *.csm ending terima* - Ambil ending ini\n` +
    ` ❌ *.csm ending tolak* - Batalkan pilihan\n` +
    `|━━━━━━━━━━━`
  )
}


// ============================================================
// RESET 🔄
// ============================================================

if (action === 'reset') {
  if (!isPrivileged) return m.reply(headerUnavailable('RESET'))
  const sub = args[1]?.toLowerCase()
  if (sub === 'ending') {
    return m.reply(
      header('RESET ENDING OTOMATIS') +
      `Ending langsung mereset story setelah dikonfirmasi.\n` +
      `Partner, level, EXP, achievement, reward, dan buff tetap tersimpan.\n` +
      `━━━━━━━━━━━`
    )
  }
  const confirmation = sub

  // ----------------------------------------------------------
  // INFO
  // ----------------------------------------------------------

  if (!sub) {

    let cap =
      header('PERINGATAN RESET')

    cap +=
      `Kamu akan mengulang perjalanan biasa dari Arc 1.\n\n` +

      `Data yang DI-RESET:\n` +
      `• Weapon\n` +
      `• Inventory\n` +
      `• Darah\n` +
      `• Story\n` +
      `• Kontrak aktif\n` +
      `• Transform\n` +
      `• Progress sementara\n\n` +

      `Data yang TETAP:\n` +
      `• Level RPG\n` +
      `• EXP RPG\n` +
      `• Level Job\n` +
      `• EXP Job\n` +
      `• Partner\n` +
      `• Riwayat Partner\n` +
      `• Title Player\n` +
      `• Riwayat Ending\n` +
      `• Reward Ending\n` +
      `• Buff Ending\n` +
      `• Riwayat Kontrak\n` +
      `• Achievement\n\n` +

      `📊 Reset sebelumnya: ${csm.resetCount || 0}x\n\n` +

      `⚠️ Setiap reset akan membuat Story berikutnya sedikit lebih sulit.\n` +
      `⚠️ Reward ending yang sudah dikumpulkan juga membuat dunia semakin sulit.\n\n` +

      `📌 Selesaikan semua arc lalu pilih ending untuk reset otomatis perjalanan.\n` +
      `━━━━━━━━━━━`

    return m.reply(cap)
  }

  // ----------------------------------------------------------
  // CANCEL
  // ----------------------------------------------------------

  if (confirmation === 'cancel') {

    return m.reply(
      header('RESET DIBATALKAN') +
      `Data kamu aman.\n` +
      `━━━━━━━━━━━`
    )
  }

  // ----------------------------------------------------------
  // INVALID
  // ----------------------------------------------------------

  if (confirmation !== 'confirm') {

    return m.reply(
      header('PERINTAH SALAH') +
      `Pilih ending terlebih dahulu untuk mengulang perjalanan.\n` +
      `━━━━━━━━━━━`
    )
  }

  // ----------------------------------------------------------
  // ENDING HISTORY
  // ----------------------------------------------------------

  if (!Array.isArray(csm.endingHistory)) {
    csm.endingHistory = []
  }

  if (
    csm.ending &&
    !csm.endingHistory.some(
      e =>
        e.ending === csm.ending &&
        e.reset === (csm.resetCount || 0)
    )
  ) {
    csm.endingHistory.push({
      ending: csm.ending,
      reset: csm.resetCount || 0,
      obtainedAt: Date.now()
    })
  }

  // ----------------------------------------------------------
  // RESET COUNT
  // ----------------------------------------------------------

  csm.resetCount =
    (csm.resetCount || 0) + 1

  // ----------------------------------------------------------
  // WEAPON
  // ----------------------------------------------------------

  csm.weapon = {
    nama: 'Fist',
    dur: 999
  }

  csm.inventory = [
    {
      nama: 'Fist',
      dur: 999
    }
  ]

  // ----------------------------------------------------------
  // KONTRAK AKTIF
  // ----------------------------------------------------------

  csm.devilContract = null
  csm.contractType = null
  csm.contractExpire = 0
  csm.contractSide = null
  csm.contractPending = null

  csm.erasureProtection = null
  csm.erasurePending = null
  csm.dollContract = false
  csm.isTransform = false

  // ----------------------------------------------------------
  // RESOURCE
  // ----------------------------------------------------------

  csm.blood = 0

  // Partner TIDAK DI-RESET
  // csm.partners tetap

  // Hospital boleh dibersihkan
  csm.hospital = []

  // ----------------------------------------------------------
  // STORY
  // ----------------------------------------------------------

  csm.story = 1
  csm.ending = null
  csm.pendingEnding = null
  csm.location = 'Markas Public Safety'

  // ----------------------------------------------------------
  // PROGRESS SEMENTARA
  // ----------------------------------------------------------

  csm.encounter = null
  csm.pendingDuel = null
  csm.pendingBlood = 0
  csm.lastRevengeHeal = 0
  csm.partnerGachaPending = null

  csm.lastTerror = 0
  csm.terrorStory = []
  csm.lastStory = 0

  csm.lastRest = 0
  csm.lastExplore = 0
  csm.lastMission = 0
  csm.lastVisit = 0

  csm.lastJob = 0
  csm.lastRaid = ''

  // ----------------------------------------------------------
  // JANGAN RESET:
  //
  // csm.level
  // csm.exp
  // csm.jobs
  // csm.partners
  // csm.title
  // csm.achievements
  // csm.contractHistory
  // csm.endingReward
  // csm.endingHistory
  // csm.endingBuffs
  // csm.resetCount
  // ----------------------------------------------------------

  saveDB(wdb)

  return m.reply(
    header('RESET BERHASIL') +
    ` Story kembali ke Arc 1.\n\n` +
    ` 🔄 Reset ke-${csm.resetCount}\n` +
    ` ❤️ Partner tetap dipertahankan.\n` +
    ` 📈 Level & EXP tetap.\n` +
    ` 💼 Level & EXP Job tetap.\n` +
    ` 🏆 Reward Ending tetap.\n` +
    ` ⛓️ Riwayat Kontrak tetap.\n` +
    ` 🏅 Achievement tetap.\n\n` +
    ` ⚠️ Story berikutnya akan sedikit lebih sulit.\n` +
    `|━━━━━━━━━━━`
  )
}
  
// === EXPLORE ===
if (action === 'explore') {
  const cooldown = cekCD('lastExplore', 10 * 60 * 1000)
  if (cooldown > 0) return m.reply(header('COOLDOWN EXPLORE') + `Tunggu ${Math.ceil(cooldown / 60)} menit lagi.\n━━━━━━━━━━━`)

  const exploreStories = [
    'Lampu kota berkedip di ujung jalan. Kamu mengikuti bau besi sebelum jejak itu menghilang.',
    'Sebuah toko sudah kosong, tetapi suara langkah masih terdengar dari lantai dua.',
    'Di bawah jembatan, kamu menemukan bekas cakaran dan tetesan darah yang belum mengering.',
    'Radio rusak memanggil namamu sekali, lalu hanya menyisakan suara statis.',
    'Hujan turun di atas aspal. Di antara genangan, sesuatu meninggalkan bekas telapak tangan.',
    'Seorang warga menunjuk gang sempit sebelum berlari. Ada bayangan besar di balik kabut.',
    'Kamu menemukan lencana Hunter lama di dekat tempat sampah dan menyimpannya sebagai petunjuk.',
    'Bau makanan dari kejauhan menutupi aroma Devil. Kamu bergerak perlahan agar tidak menarik perhatian.',
    'Pintu besi terbuka sendiri. Di dalamnya hanya ada kursi patah dan suara napas dari kegelapan.',
    'Jalanan terlihat aman, tetapi nalurimu mengatakan ada sesuatu yang sedang mengawasimu dari atap.',
    'Jalanan sepi. Hanya ada poster Orang Hilang yang tertiup angin.',
    'Lembur selesai. Saat keluar kantor, setengah lampu jalan mendadak mati.',
    'Kereta terakhir sudah lewat. Kamu terpaksa berjalan melewati gang yang terlalu sunyi.',
    'Di konbini, televisi menayangkan berita korban Devil. Kasirnya hanya menatap lantai.',
    'Anjing liar mengikutimu, lalu kabur setelah melihat sesuatu di atas gedung.',
    'Sirene ambulans lewat. Petugas Public Safety berlari membawa senjata terhunus.',
    'Kopi kaleng dari vending machine terasa aneh, seolah ada rasa besi di dalamnya.',
    'Lift kantor macet lima menit. Saat terbuka, koridornya sudah kosong.',
    'Kamu menemukan dompet di bangku taman. Isinya hanya foto yang disobek.',
    'Sekolah di seberang gelap, tetapi suara kursi masih terdengar dari dalam.',
    'Papan iklan berkedip. Wajah pada iklannya tersenyum dengan cara yang salah.',
    'Kamu melewati TKP lama. Pita polisi sudah pudar, tetapi baunya masih tertinggal.',
    'Penjual takoyaki menyuruhmu pulang cepat karena ada keributan di blok sebelah.',
    'Langkah kaki terdengar dari belakang. Saat menoleh, hanya kucing hitam yang pergi.',
    'Kemacetan berhenti total. Mobil di depan terus melihat spion meski jalan di belakang kosong.',
    'Tagihan menumpuk. Di amplop terakhir ada bekas telapak tangan kecil.',
    'Papan jadwal stasiun menampilkan nama kota yang tidak ada di peta mana pun.',
    'Satpam berkata jam pulang sudah lewat dua jam, padahal matahari baru tenggelam.',
    'Gagak-gagak di kabel listrik semuanya menghadap ke arah yang sama.',
    'Di bawah jembatan, bekas darah membentuk panah menuju lorong yang ditutup.',
    'Kamu mendengar radio darurat menyebut koordinat yang persis berada di kakimu.',
    'Sebuah payung tertinggal di halte. Bagian dalamnya penuh goresan kuku.',
    'Dari atap apartemen terdengar suara benda berat diseret perlahan.',
    'Seorang Hunter tua memberimu perban tanpa menjelaskan dari mana asalnya.',
    'Lampu penyeberangan berubah merah meski tidak ada kendaraan yang lewat.',
    'Pintu gudang bergetar dari dalam, tetapi kuncinya masih tergantung di luar.',
    'Bau bunga pemakaman mengikuti langkahmu sampai ke ujung jalan.',
    'Kamu melihat bayanganmu terlambat bergerak setengah detik.',
    'Mesin ATM menyala sendiri dan menampilkan pesan: JANGAN PULANG.',
    'Hujan berhenti tepat di satu titik jalan, seolah ada atap tak terlihat di atasnya.',
    'Seseorang meninggalkan bekal di bangku taman. Makanannya masih hangat.',
    'Papan nama toko berputar sendiri mengarah ke gang sempit.',
    'Kabel listrik putus dan percikannya membentuk suara seperti bisikan.',
    'Kamu menemukan jejak sepatu basah menuju gedung yang sudah lama disegel.',
    'Seorang anak menunjuk ke belakangmu lalu langsung ditarik pergi oleh ibunya.',
    'Ponselmu menerima panggilan dari nomor yang tidak memiliki angka.',
    'Di kaca toko, ada pantulan seseorang yang tidak berjalan bersamamu.',
    'Kamu mendengar pintu rumah dikunci dari dalam, padahal rumah itu sudah kosong.',
    'Bau tanah basah muncul dari saluran drainase yang tidak terkena hujan.',
    'Sebuah sepatu tunggal tergeletak di tengah zebra cross.',
    'Kamu menemukan tanda cakaran baru di tiang beton dekat markas.',
    'Jalan pulang terasa lebih panjang dari biasanya, tetapi jam tanganmu tidak bergerak.',
    'Di kejauhan, suara chainsaw meraung singkat lalu lenyap ditelan kota.'
  ].map(story => `🔎 ${story}`)
  const bonus = calcBonus(csm)
  const exploreStory = exploreStories[Math.floor(Math.random() * exploreStories.length)]
  rememberSeen('seenExploreStories', exploreStory)
  const bloodGain = Math.floor((Math.random() * 2500 + 1000) * bonus.bloodMult) + bonus.stealBlood
  const expGain = Math.floor((Math.random() * 80 + 40) * bonus.expMult)
  csm.blood += bloodGain
  csm.lastExplore = Date.now()
  const leveled = addExp(expGain)

  let msg = header('HASIL EXPLORE') +
    `${exploreStory}\n` +
    `Kamu menyusuri ${csm.location} dan menemukan jejak darah yang masih hangat.\n` +
    `🩸 +${bloodGain.toLocaleString()} Blood\n`

  const roll = Math.random()
  const itemRate = Math.min(0.95, 0.25 + bonus.findItem + bonus.luck)
  const weaponRate = 0.025 + Math.min(0.04, bonus.luck / 10)
  const itemComments = ITEM_COMMENTS
  const exploreItems = ITEM_LIST.filter(item => ['E', 'D', 'C', 'B'].includes(item.tier))
  const guaranteedItem = exploreItems[Math.floor(Math.random() * exploreItems.length)]
  addInventoryDrop(guaranteedItem)
  msg += `📦 Item yang ditemukan:\n${guaranteedItem.emoji} *${guaranteedItem.nama}* [TIER ${guaranteedItem.tier}]\n`

  if (roll < weaponRate) {
    const weaponPool = WEAPON_LIST.filter(weapon => ['E', 'D', 'C'].includes(weapon.tier) && weapon.nama !== 'Fist')
    const weapon = weaponPool[Math.floor(Math.random() * weaponPool.length)]
    csm.inventory.push({ nama: weapon.nama, dur: weapon.dur })
    msg += `⚔️ Kamu menemukan *${weapon.emoji} ${weapon.nama}* [TIER ${weapon.tier}]!\n`
  } else if (roll < weaponRate + itemRate) {
    const tierRoll = Math.random() - bonus.luck * 2
    let tier = 'E'
    if (tierRoll < 0.0001) tier = 'SSS'
    else if (tierRoll < 0.0005) tier = 'SS'
    else if (tierRoll < 0.002) tier = 'S'
    else if (tierRoll < 0.01) tier = 'A'
    else if (tierRoll < 0.05) tier = 'B'
    else if (tierRoll < 0.25) tier = 'C'
    else if (tierRoll < 0.65) tier = 'D'
    const pool = ITEM_LIST
    const item = pool[Math.floor(Math.random() * pool.length)]
    addInventoryDrop(item)
    msg += `📦 Kamu menemukan *${item.emoji} ${item.nama}* [TIER ${item.tier}]!\n`
    msg += `💬 ${itemComments[Math.floor(Math.random() * itemComments.length)]}\n`
  } else if (roll < 0.33) {
    msg += `Kamu menemukan sumber Blood tambahan di sekitar lokasi.\n`
  } else if (roll < 0.63) {
    const devilChance = 0.25 + (csm.erasureProtection?.startsWith('horsemen:') ? 0.25 : 0)
    const devilSpawn = Math.random() < Math.max(0.05, devilChance - bonus.info / 100)
    let lastSeen = csm.lastSeenChars || {}
    const coreCharacters = ['Denji', 'Aki Hayakawa', 'Power', 'Asa Mitaka', 'Nayuta', 'Fami', 'Makima', 'Yoru', 'Kishibe', 'Himeno', 'Kobeni Higashiyama', 'Hirofumi Yoshida', 'Beam', 'Galgali', 'Reze', 'Quanxi', 'Angel Devil', 'Pochita', 'Meowy']
    let characterPool = CHARACTER_LIST.map(character => {
      let weight = 2 + bonus.luck
      if (coreCharacters.includes(character.nama)) weight += 3 + bonus.political / 10
      if (lastSeen[character.nama] && Date.now() - lastSeen[character.nama] < 3600000) weight = 0.1
      return { ...character, weight }
    }).filter(character => character.weight > 0)
    const spawned = []
    const spawnCount = devilSpawn ? Math.min(Math.floor(Math.random() * 3) + 1, 3) : Math.min(Math.floor(Math.random() * 5) + 2, 7)
    for (let index = 0; index < spawnCount && characterPool.length; index++) {
      const totalWeight = characterPool.reduce((total, character) => total + character.weight, 0)
      let randomWeight = Math.random() * totalWeight
      const selected = characterPool.find(character => (randomWeight -= character.weight) <= 0)
      if (!selected) break
      spawned.push(selected)
      characterPool = characterPool.filter(character => character.nama !== selected.nama)
    }
    spawned.forEach(character => { csm.lastSeenChars[character.nama] = Date.now() })
    if (devilSpawn) {
      const devil = DEVIL_LIST[Math.floor(Math.random() * DEVIL_LIST.length)]
      csm.encounter = { type: 'devil', data: devil, helpers: spawned }
      msg += `👹 *${devil.emoji} ${devil.nama}* [${devil.rank}] muncul!\n`
      if (spawned.length) msg += `👥 ${spawned.map(character => character.nama).join(', ')} ikut membantu.\n`
      msg += `Gunakan *.csm visit fight* untuk melawan atau *.csm visit run* untuk kabur.\n`
    } else if (spawned.length) {
      csm.encounter = { type: 'char', data: spawned[0], all: spawned }
      msg += `👥 Ada ${spawned.length} karakter di sini:\n`
      spawned.forEach((character, index) => {
        msg += `*${index + 1}.* ${character.emoji} *${character.nama}*\n`
        msg += `   Role: ${character.role}\n`
      })
      msg += `Gunakan *.csm visit interact <nomor/nama>* untuk berbicara.\n`
    }
  } else {
    msg += `Sepertinya aman...\n`
  }

  msg += `📈 +${expGain} EXP`
  if (leveled) msg += `\n🎉 LEVEL UP! Lv.${csm.level}`
  msg += `\n━━━━━━━━━━━`
  await checkMakimaTrigger(m, csm, wdb)
  return sendCsmReply(msg, pickPicture(CSM_PICTURES.city))
}

// === MISSION 🎯
if (action === 'mission' || action === 'misi') {
  let sub = args[1] // fight / run

  //.csm mission fight
  if(sub === 'fight' && csm.tempMission){
    let b = calcBonus(csm)
    let { devil, devilHp, dmg } = csm.tempMission
    let battleEffects = []
    if (b.summon > 0) battleEffects.push(`👹 Devil tambahan berhasil disummon (+${b.summon * 10} DMG).`)
    if (b.army > 0) battleEffects.push(`🎖️ Bantuan Army Buff memperkuat serangan (+${b.army} DMG).`)
    if (b.cc > 0 && Math.random() * 100 < Math.min(75, b.cc)) {
      dmg += Math.floor(devil.hp * 0.2)
      battleEffects.push('⛓️ CC berhasil: lawan tidak bisa bergerak sesaat.')
    }
    if (b.selfDestruct > 0 && Math.random() < Math.min(0.5, b.selfDestruct / 1000)) {
      dmg += devil.hp * 2
      csm.health = 1
      battleEffects.push('💥 Self Destruct aktif: tubuhmu dikorbankan untuk ledakan damage besar.')
    }
    csm.health = Math.max(1, csm.health - 10)
    if (b.ccResist > 0) csm.health = Math.min(csm.maxHealth, csm.health + Math.floor(b.ccResist / 10))
    if (b.teleportChance > 0 && Math.random() * 100 < b.teleportChance) {
      const safeLocation = [...MAIN_LOCATION_LIST, ...SIDE_LOCATION_LIST].find(location => location.rateDevil < 0.2)
      if (safeLocation) csm.location = safeLocation.nama
      battleEffects.push(`🌀 Teleport aktif: kamu berpindah ke ${csm.location} dan menghindari serangan.`)
    }

    if(!b.noHeal && (b.regen > 0 || b.heal > 0)){
      csm.health = Math.min(csm.maxHealth, csm.health + b.regen + b.heal)
    }

    if (devilHp <= dmg) {
      const rusak = damageWeapon()
      if(b.weaponDur > 0) csm.inventory[0].dur += b.weaponDur

      csm.devilsKilled++
      let bloodGain = Math.floor(((devil.blood * 2) + 400) * b.bloodMult) + b.stealBlood + b.bloodFlat
      let expGain = Math.floor(((devil.exp * 2) + 100) * b.expMult)

      csm.blood += bloodGain
      const leveled = addExp(expGain)
      delete csm.tempMission
      saveDB(wdb)

      const WIN_TEXT = [
        `💥 Dentuman, darah, daging.\n\n${devil.emoji} *${devil.nama}* pecah jadi kabut merah. Yang tersisa cuma bau besi.`,
        `🔪 Suara gerigi berhenti mendadak.\n\n${devil.emoji} *${devil.nama}* ambruk sebelum sempat memanggil bantuan.`,
        `🩸 Tidak ada kemenangan yang bersih.\n\n${devil.emoji} *${devil.nama}* jatuh, dan lantai menerima semuanya.`,
        `⚔️ Satu celah cukup.\n\nSerangan terakhir menembus pertahanan ${devil.emoji} *${devil.nama}*.`,
        `🚨 Sirene terdengar setelah semuanya selesai.\n\n${devil.emoji} *${devil.nama}* tidak lagi bergerak.`,
        `⛓️ Kontrakmu menagih tenaga terakhir.\n\n${devil.emoji} *${devil.nama}* terseret jatuh di ujung rantai.`,
        `💀 Kamu hampir ikut roboh, tetapi ${devil.emoji} *${devil.nama}* jatuh lebih dulu.`,
        `🔥 Panas, asap, lalu hening.\n\n${devil.emoji} *${devil.nama}* dikalahkan sebelum api menjalar lebih jauh.`,
        `👁️ Kamu membaca gerakannya tepat waktu.\n\nSatu serangan terarah mengakhiri perlawanan ${devil.emoji} *${devil.nama}*.`,
        `🏙️ Gang itu kembali sunyi.\n\n${devil.emoji} *${devil.nama}* tumbang, sementara kamu masih bisa berdiri.`
      ]
      let winMsg = WIN_TEXT[Math.floor(Math.random() * WIN_TEXT.length)]

      let msg = header('TARGET DILENYAPKAN') + winMsg +
        `\n━━━━━━━━━━━\n` +
        `⚔️ DMG: ${dmg.toLocaleString()}\n` +
        `🩸 +${bloodGain.toLocaleString()} Darah\n` +
        `📈 +${expGain} EXP`
      if (battleEffects.length) msg += `\n${battleEffects.join('\n')}`
      if(b.findItem > 0 && Math.random() < b.findItem) msg += `\n🎁 Dapet Item Tambahan!`
      if(b.regen > 0 || b.heal > 0) msg += `\n❤️ +${b.regen + b.heal} HP [Regen/Heal]`
      if (leveled) msg += `\n🎉 LEVEL UP! Lv.${csm.level}`
      if (rusak) msg += `\n💀 *${rusak}* HANCUR KENA DARAH IBLIS!`
      await checkMakimaTrigger(m, csm, wdb)
return m.reply(msg + `\n━━━━━━━━━━━`)
    }

    const LOSE_TEXT = [
      `💥 Salah gerak satu detik.\n\n${devil.emoji} *${devil.nama}* menghantam tubuhmu ke dinding. Kabur sebelum terlambat.`,
      `🩸 Tanganmu nyaris tidak bisa digerakkan.\n\n${devil.emoji} *${devil.nama}* terlalu dekat. Kamu mundur sambil menahan sakit.`,
      `⚠️ Ini bukan lawanmu hari ini.\n\n${devil.emoji} *${devil.nama}* terlalu besar dan terlalu cepat untuk ditahan.`,
      `🔪 Serangannya memotong jalan keluar.\n\nKamu dipaksa mundur sebelum ${devil.emoji} *${devil.nama}* mengambil kepalamu.`,
      `🚨 Sirene semakin dekat.\n\n${devil.emoji} *${devil.nama}* masih berdiri, dan kamu tidak punya waktu untuk mencoba lagi.`,
      `🌧️ Hujan membuat lantai licin.\n\nKamu jatuh, kehilangan posisi, lalu berlari sebelum ${devil.emoji} *${devil.nama}* menerkam.`,
      `⛓️ Kontrakmu terlambat merespons.\n\n${devil.emoji} *${devil.nama}* memanfaatkan celah itu untuk memaksamu kabur.`,
      `💀 Tubuhmu menolak serangan berikutnya.\n\nKamu gagal menjatuhkan ${devil.emoji} *${devil.nama}* dan hanya bisa menyelamatkan diri.`,
      `👁️ Kamu salah membaca gerakannya.\n\n${devil.emoji} *${devil.nama}* menyambutmu dengan serangan yang tidak sempat kamu hindari.`,
      `🏃 Tidak ada yang memalukan dari tetap hidup.\n\n${devil.emoji} *${devil.nama}* menang kali ini, jadi kamu memilih untuk mundur.`
    ]
    let loseMsg = LOSE_TEXT[Math.floor(Math.random() * LOSE_TEXT.length)]

    delete csm.tempMission
    saveDB(wdb)
    return m.reply(header('HAMPIR MATI') + loseMsg + `\n━━━━━━━━━━━\n❤️ -10 HP\n━━━━━━━━━━━`)
  }

  //.csm mission run
  if(sub === 'run' && csm.tempMission){
    let b = calcBonus(csm)
    let { devil } = csm.tempMission
    csm.health = Math.max(1, csm.health - 10)
    let stolen = Math.floor(devil.blood * 0.6 * b.bloodMult) + b.stealBlood
    csm.blood += stolen + b.bloodFlat

    let findItemMsg = ''
    if(b.findItem > 0 && Math.random() < b.findItem) findItemMsg = `\n🎁 Kamu nemu item pas kabur!`

    delete csm.tempMission
    saveDB(wdb)

    const RUN_TEXT = [
      `Kakiku bergerak lebih cepat daripada otakku. ${devil.nama} menghantam dinding tepat saat aku menyelip ke gang sebelah.\n\nAku berhasil membawa kabur ${stolen.toLocaleString()} Blood. Tidak heroik, tapi aku masih hidup.`,
      `Satu serangan nyaris membelah pintu besi di belakangku. Aku melempar sisa umpan, lalu lari tanpa menoleh.\n\nDari ${devil.nama}, aku sempat menguras ${stolen.toLocaleString()} Blood sebelum menghilang.`,
      `Aku tidak menang. Aku hanya cukup pintar untuk tahu kapan harus berhenti.\n\n${devil.nama} masih mengamuk di belakang, sementara ${stolen.toLocaleString()} Blood sudah aman di tanganku.`,
      `Sirene mulai terdengar dari ujung jalan. Kalau Public Safety datang, semua orang akan mengira ini salahku.\n\nAku kabur dari ${devil.nama} dengan ${stolen.toLocaleString()} Blood dan satu tulang rusuk yang masih utuh.`,
      `Pintu keluar ternyata terkunci. Aku menendangnya, gagal, lalu menendangnya lagi sambil berdoa pada Devil apa pun yang mau mendengar.\n\nAkhirnya aku lolos dari ${devil.nama} membawa ${stolen.toLocaleString()} Blood.`,
      `Aku menjatuhkan senjata, mematikan lampu, dan menahan napas di balik tumpukan kardus. ${devil.nama} lewat hanya beberapa langkah dari wajahku.\n\nBegitu aman, aku pergi membawa ${stolen.toLocaleString()} Blood.`,
      `Darah menetes dari lenganku, tapi bukan semuanya milikku. Aku memanfaatkan saat ${devil.nama} lengah lalu mundur sebelum keberuntungan habis.\n\nHasilnya: ${stolen.toLocaleString()} Blood dan kesempatan untuk kabur hidup-hidup.`,
      `Aku mencoba terlihat tenang. Gagal total. Bahkan langkahku terdengar seperti orang yang sedang dikejar utang.\n\nTetap saja, aku berhasil mencuri ${stolen.toLocaleString()} Blood dari ${devil.nama}.`,
      `Seseorang berteriak dari jalan utama dan mengalihkan perhatian ${devil.nama}. Aku tidak bertanya siapa dia. Aku hanya mengambil kesempatan itu.\n\n${stolen.toLocaleString()} Blood masuk inventory sebelum aku lenyap dari lokasi.`,
      `Jarak antara hidup dan mati ternyata cuma satu pintu yang bisa ditutup. Aku menutupnya tepat waktu, meski ${devil.nama} sempat merobek separuh kusennya.\n\nAku pulang dengan ${stolen.toLocaleString()} Blood.`
    ]
    let runMsg = RUN_TEXT[Math.floor(Math.random() * RUN_TEXT.length)]

    let msg = header('RETRIBUSI DITUNDA') + runMsg +
      `\n━━━━━━━━━━━\n❤️ -10 HP`
    msg += findItemMsg
    await checkMakimaTrigger(m, csm, wdb)
return m.reply(msg + `\n━━━━━━━━━━━`)
  }

  //.csm mission = generate misi baru
  let b = calcBonus(csm)
  let baseCooldown = 1200000 // 20 menit base
let cooldown = baseCooldown - (b.stamina * 3000) // -3 detik per 1 stamina
if(cooldown < 60000) cooldown = 60000 // minimal 1 menit

if (csm.lastMission && Date.now() - csm.lastMission < cooldown) {
  let sisa = Math.ceil((cooldown - (Date.now() - csm.lastMission)) / 1000)
  let menit = Math.floor(sisa / 60)
  let detik = sisa % 60
  return m.reply(header('COOLDOWN') + `|Tunggu ${menit}m ${detik}d lagi.\n|HQ belum kasih misi baru.\n|━━━━━━━━━━━`)
}

  if (csm.health < 10) return m.reply(header('HP KURANG') + `|Butuh minimal 10 HP.\n|━━━━━━━━━━━`)
  if (!Array.isArray(csm.inventory) ||!csm.inventory.length) csm.inventory = [{ nama: 'Fist', dur: 999 }]

  const MISSION_STORY = [
    'Panggilan dari HQ. Gudang terbengkalai dipenuhi noda darah. Warga hilang 4 orang.',
    'Sekolah malam. CCTV menangkap bayangan dengan mata merah. 1 guru tewas.',
    'Gorong-gorong kota. Terdengar rantai diseret dan jeritan tertahan.',
    'Hutan pinggiran. Kabut tebal. 2 pemburu belum kembali selama 3 hari.',
    'Rumah sakit. Pasien lantai 3 mati semua. Hanya tersisa cakaran di tembok.',
    'Stasiun. Kereta terakhir kosong. Ada bercak hitam di kursi.',
    'Apartemen. Bau busuk dari kamar 303. Tetangga dengar suara mengunyah.',
    'Pelabuhan. Kontainer berdarah. Rantai putus seperti digigit.',
    'Rumah mewah. Keluarga 5 orang hilang. Cuma ada jejak cakar di langit-langit.',
    'TPA. Anjing liar mati semua. Di tengahnya ada lingkaran darah.',
    'Gereja tua. Salib terbalik. Di lantai ada tulisan "AKU LAPAR" pake darah.',
    'Bank. Brankas kosong. CCTV rusak. Sisa potongan jasad di laci.',
    'Taman kota jam 3 pagi. Mainan anak berserakan. Ga ada anaknya.',
    'Pabrik. Mesin nyala sendiri. 3 karyawan jadi cincangan halus.',
    'Kantor polisi. Sel tahanan kebuka semua. Darah nyampe langit2.',
    'Hotel lantai 8. Pintu dikunci dari dalam. Tamu ga keluar2 2 hari.',
    'Kolam renang umum. Airnya merah. Pelampung muter sendiri.',
    'Perpustakaan. Buku2 robek. Ada bekas gigi di rak paling atas.',
    'Dermaga. Kapal nelayan balik tanpa awak. Jala penuh daging manusia.',
    'Gedung kosong. Lampu kedip2. Kedengeran suara tawa anak kecil.',
    'Pasar malam. 1 pedagang hilang tiap jam. Dagangannya ditinggal.',
    'Stadion. Lampu mati pas pertandingan. 20 orang lenyap tanpa suara.',
    'Museum. Patungnya pindah tempat. Penjaga terakhir ga balik.',
    'Kuburan. Tanah kebongkar dari bawah. Nisan patah semua.',
    'Jembatan. Mobil kosong. Kaca dalem penuh bekas tangan berdarah.',
    'Kafe 24 jam. Barista hilang. Kopi di mesin masih mendidih.',
    'Laundry. Mesin cuci muter sendiri. Isinya potongan pakaian.',
    'Bioskop. Film muter tapi kursinya kosong. Lantai lengket.',
    'Gym. Alat besi bengkok. Ada bekas gigitan di barbelnya.',
    'Toko hewan. Semua kandang kebuka. Isinya tinggal bulu.',
    'Pom bensin. Kasir tewas duduk. CCTV ngerekam bayangan tinggi banget.',
    'Ruang kelas. Papan tulis penuh coretan: "MAKAN AKU".',
    'Rumah sakit jiwa. Pasien lepas. Dokternya yg hilang.',
    'Bandara. Pesawat mendarat. Pintu kebuka. Bagasinya isinya darah.',
    'Mall tengah malam. Eskalator jalan sendiri. Toa nyanyi pelan.',
    'Proyek bangunan. Helm pekerja jatuh semua. Orangnya ga ada.',
    'Studio TV. Siaran mati. Yg keliatan cuma sepasang mata merah.',
    'Gudang beras. Karung sobek. Jejak kaki kecil muter2.',
    'Panti asuhan. Anak2 pingsan semua. Bonekanya pada hilang.',
    'Klinik. Jarum suntik berserakan. Pasiennya lenyap.',
    'Parkiran bawah tanah. Alarm mobil bunyi semua jam 2 pagi.',
    'Toilet umum. Pintu terakhir dikunci. Digedor dari dalem.',
    'Rumah tua. Foto keluarga matanya dicoret pake kuku.',
    'Kebun. Tanaman layu melingkar. Di tengah ada simbol aneh.',
    'Tol. Kecelakaan beruntun. Sopirnya hilang, mobilnya masih nyala.',
    'Pelabuhan ikan. Kapal balik penuh ikan... sama jari manusia.',
    'Ruko 3 lantai. Lantai 1-2 gelap. Lantai 3 ada suara nyeret.',
    'Warnet. Semua PC nyala. Chatting ke diri sendiri.',
    'Hotel kapsul. 1 kapsul ga bisa dibuka. Baunya anyir banget.'
  ].map(story => `🎯 ${story}`)
  const randomStory = MISSION_STORY[Math.floor(Math.random() * MISSION_STORY.length)]
  rememberSeen('seenMissionStories', randomStory)

  const devil = DEVIL_LIST[Math.floor(Math.random() * DEVIL_LIST.length)]
  const weapon = csm.inventory[0] || { nama: 'Fist', dur: 999 }
  const weaponData = WEAPON_LIST.find(w => w.nama === weapon.nama) || WEAPON_LIST[0]
  const activePartners = csm.partners.filter(p => p.status === 'active')

  let dmg = Math.floor(Math.random() * 50) + csm.level * 10 + weaponData.dmg + b.dmg
  if (csm.devilContract === 'Chainsaw Devil' || b.autoTransform) dmg *= 2.5
  dmg += activePartners.reduce((total, partner) => total + getPartnerDamage(partner), 0)
  dmg = Math.floor(dmg * b.dmgMultiplier)
  if(b.aoe > 0) dmg += Math.floor(dmg * (b.aoe/100))
  if(b.fire > 0) dmg += b.fire
  if(b.water > 0) dmg += b.water
  if(b.burn > 0) dmg += b.burn
  if(b.pierce > 0) dmg += b.pierce
  if(b.bleed > 0) dmg += b.bleed

  if (Math.random() * 100 < b.critChance) dmg = Math.floor(dmg * (1.5 + b.critDmg))
  if (Math.random() * 100 < b.instantKill) dmg = devil.hp + 999
  if(b.craftWeapon > 0) dmg += b.craftWeapon * 10

  const devilHp = Math.floor(devil.hp * 0.7)

  let partnerHelp = ''
  if(activePartners.length > 0){
    let p = activePartners[Math.floor(Math.random() * activePartners.length)]
    let ch = CHARACTER_LIST.find(c => c.nama === p.name)
    let dialogPartner = [
      'Jangan berdiri di depanku. Aku tidak mau ikut kena cipratannya.',
      'Tarik napas. Tunggu celahnya, lalu habisi.',
      'Kalau kau mati, aku yang harus menjelaskan ke HQ.',
      'Aku alihkan perhatiannya. Kau serang dari samping.',
      'Jangan sok berani. Devil itu belum selesai bermain.',
      'Senjatamu masih bisa dipakai? Bagus. Berarti kita belum kalah.',
      'Aku lihat gerakannya. Tiga detik lagi dia membuka pertahanan.',
      'Mundur sebentar. Luka kecil lebih baik daripada pemakaman.',
      'Kau urus kepalanya. Aku tahan bagian yang lain.',
      'Setelah ini kita makan. Kalau masih ada uang dari gaji Hunter.'
    ]
    partnerHelp = `\n${ch.emoji} *${p.name}*: "${dialogPartner[Math.floor(Math.random()*dialogPartner.length)]}"`
  }

  let msg = header('MISI DITERIMA') +
    ` ${randomStory}\n` +
    `|━━━━━━━━━━━\n` +
    ` Target: ${devil.emoji} *${devil.nama}*\n` +
    ` HP: ${devilHp.toLocaleString()}\n` +
    ` DMG Estimasi: ${dmg.toLocaleString()}${partnerHelp}\n` +
    `|━━━━━━━━━━━\n`

  if(b.findItem > 0) msg += `|🎁 Chance Item: ${(b.findItem*100).toFixed(0)}%\n`
  if(b.bloodFlat > 0) msg += `|🩸 Bonus Blood: +${b.bloodFlat}\n`

  msg += `|━━━━━━━━━━━\n` +
    ` Pilih:\n` +
    ` .csm mission fight\n` +
    ` .csm mission run\n` +
    `|━━━━━━━━━━━`

  csm.tempMission = { devil, devilHp, dmg }
  csm.lastMission = Date.now()
  saveDB(wdb)
  await checkMakimaTrigger(m, csm, wdb)
  return sendCsmReply(msg, pickPicture(CSM_PICTURES.city))
}

// === RESCUE 🚑
if (action === 'rescue') {
  let b = calcBonus(csm)

  // COOLDOWN SAMA KAYA MISSION
  let baseCooldown = 1200000 // 20 menit base
  let cooldown = baseCooldown - (b.stamina * 3000) // -3 detik per 1 stamina
  if(cooldown < 60000) cooldown = 60000 // minimal 1 menit

  if (csm.lastRescue && Date.now() - csm.lastRescue < cooldown) {
    let sisa = Math.ceil((cooldown - (Date.now() - csm.lastRescue)) / 1000)
    let menit = Math.floor(sisa / 60)
    let detik = sisa % 60
    return m.reply(header('COOLDOWN') + `|Tunggu ${menit}m ${detik}d lagi.\n|Belum ada laporan penyelamatan baru.\n|━━━━━━━━━━━`)
  }

  if (csm.health < 8) return m.reply(header('HP KURANG') + `|Butuh minimal 8 HP.\n|━━━━━━━━━━━`)

  // CEK SENJATA
  if (!Array.isArray(csm.inventory) ||!csm.inventory.length) csm.inventory = [{ nama: 'Fist', dur: 999 }]
  const rusak = damageWeapon()
  if(b.weaponDur > 0) csm.inventory[0].dur += b.weaponDur

  // 50 STORY
  const RESCUE_STORY = [
    'Panggilan dari HQ. Gudang terbengkalai dipenuhi noda darah. 8 warga masih hidup bersembunyi di dalam.',
    'Sekolah malam. CCTV menangkap bayangan dengan mata merah. 1 guru + 5 murid terjebak di ruang guru.',
    'Gorong-gorong kota. Terdengar rantai diseret dan jeritan tertahan. 7 petugas kebersihan hilang kontak.',
    'Hutan pinggiran. Kabut tebal. 4 pemburu belum kembali selama 3 hari. Keluarga mereka menunggu.',
    'Rumah sakit. Pasien lantai 3 mati semua. Hanya tersisa 9 perawat yang mengunci diri di ruang operasi.',
    'Stasiun. Kereta terakhir kosong. Ada 12 orang terjebak di gerbong dengan bercak hitam di kursi.',
    'Apartemen. Bau busuk dari kamar 303. 6 penghuni lain masih ada di dalam dan tidak bisa keluar.',
    'Pelabuhan. Kontainer berdarah. Rantai putus. 11 buruh pelabuhan bersembunyi di balik peti.',
    'Rumah mewah. Keluarga 7 orang. Sisa 3 anak kecil menangis di bawah meja.',
    'TPA. Anjing liar mati semua. Di tengahnya ada 5 pemulung yang dikepung.',
    'Gereja tua. Salib terbalik. Di lantai ada tulisan "AKU LAPAR" pake darah. 9 jemaat terkunci.',
    'Bank. Brankas kosong. 5 satpam dan 4 nasabah masih hidup di ruang bawah tanah.',
    'Taman kota jam 3 pagi. 7 anak remaja yang begadang terjebak di gazebo.',
    'Pabrik. Mesin nyala sendiri. 5 karyawan selamat di atas crane.',
    'Kantor polisi. Sel tahanan kebuka semua. 3 petugas bersembunyi di ruang arsip.',
    'Hotel lantai 8. Pintu dikunci dari dalam. 5 tamu dan 2 OB terjebak.',
    'Kolam renang umum. Airnya merah. 6 penjaga dan 3 anak kecil di ruang pompa.',
    'Perpustakaan. Buku2 robek. 5 mahasiswa terjebak di rak paling atas.',
    'Dermaga. Kapal nelayan balik tanpa awak. 8 nelayan masih hidup di dalam palka.',
    'Gedung kosong. Lampu kedip2. 6 office boy terjebak di lift.',
    'Pasar malam. 1 pedagang hilang tiap jam. Sisa 9 pedagang bersembunyi di kios.',
    'Stadion. Lampu mati pas pertandingan. 10 orang lenyap. Sisa 7 petugas kebersihan.',
    'Museum. Patungnya pindah tempat. 5 penjaga terakhir bersembunyi di ruang bawah.',
    'Kuburan. Tanah kebongkar dari bawah. 4 penggali kubur terjebak di lubang.',
    'Jembatan. Mobil kosong. 6 pengendara terjebak di dalam mobil.',
    'Kafe 24 jam. Barista hilang. 5 pengunjung dan 2 kasir di dalam toilet.',
    'Laundry. Mesin cuci muter sendiri. 4 karyawan terjebak di ruang belakang.',
    'Bioskop. Film muter tapi kursinya kosong. 8 penonton di studio 3.',
    'Gym. Alat besi bengkok. 6 member terjebak di ruang ganti.',
    'Toko hewan. Semua kandang kebuka. 3 karyawan dan 2 pelanggan di dalam.',
    'Pom bensin. Kasir tewas duduk. 5 pengendara terjebak di minimarket.',
    'Ruang kelas. Papan tulis penuh coretan. 9 siswa les malam terjebak.',
    'Rumah sakit jiwa. Pasien lepas. 4 dokter dan 3 perawat di ruang kepala.',
    'Bandara. Pesawat mendarat. 10 petugas bagasi terjebak di konveyor.',
    'Mall tengah malam. Eskalator jalan sendiri. 8 sekuriti di pos.',
    'Proyek bangunan. Helm pekerja jatuh semua. 6 pekerja di lantai 10.',
    'Studio TV. Siaran mati. 5 kru dan 2 presenter di ruang kontrol.',
    'Gudang beras. Karung sobek. 5 kuli panggul bersembunyi di karung.',
    'Panti asuhan. Anak2 pingsan semua. 3 suster masih sadar di dapur.',
    'Klinik. Jarum suntik berserakan. 3 dokter dan 5 pasien di ruang operasi.',
    'Parkiran bawah tanah. Alarm mobil bunyi semua. 5 satpam di pos.',
    'Toilet umum. Pintu terakhir dikunci. 3 orang di dalamnya.',
    'Rumah tua. Foto keluarga matanya dicoret. 2 nenek terjebak di kamar.',
    'Kebun. Tanaman layu melingkar. 4 petani di gubuk tengah.',
    'Tol. Kecelakaan beruntun. 5 sopir truk masih hidup di kabin.',
    'Pelabuhan ikan. Kapal balik penuh ikan. 6 ABK di ruang mesin.',
    'Ruko 3 lantai. Lantai 1-2 gelap. 4 karyawan toko di lantai 3.',
    'Warnet. Semua PC nyala. 8 gamer terjebak.',
    'Hotel kapsul. 2 kapsul ga bisa dibuka. 3 tamu di resepsionis.',
    'Sekolah. Upacara bendera. 25 siswa + guru terjebak di lapangan.'
  ]

  // 20 HASIL RESCUE
  const RESCUE_RESULT = [
    'Pintu didobrak. Semua warga diarahkan keluar melalui jalur darurat. Ancaman berhasil dilumpuhkan.',
    'Dengan pengalihan, perhatian target berhasil dialihkan. Evakuasi berjalan lancar tanpa korban.',
    'Alarm kebakaran diaktifkan. Dalam kekacauan, seluruh warga berhasil dievakuasi dengan selamat.',
    'Jalur alternatif melalui saluran air digunakan. Semua korban berhasil ditarik ke tempat aman.',
    'Tim bertindak sebagai umpan. Sementara itu warga dievakuasi diam-diam dari sisi lain.',
    'Sistem ventilasi dimanfaatkan. Gas air mata dilontarkan untuk melumpuhkan ancaman.',
    'Akses melalui atap digunakan. Satu per satu warga diturunkan menggunakan tali.',
    'Pintu dikunci dari luar dan area disterilkan. Prosedur darurat dijalankan sesuai SOP.',
    'Pendekatan psikologis digunakan untuk menenangkan anak-anak. Evakuasi berjalan tertib.',
    'Tindakan cepat dilakukan. Korban ditarik satu per satu ke kendaraan evakuasi.',
    'Operasi senyap berhasil. Tidak ada suara yang memicu agresi lebih lanjut.',
    'Kerjasama tim berjalan baik. Titik lemah ancaman berhasil ditemukan dan dilumpuhkan.',
    'Medis darurat diberikan di lokasi. Semua korban selamat dan segera dirujuk.',
    'Jalur evakuasi dibersihkan dari reruntuhan. Warga keluar berurutan.',
    'Komunikasi dengan HQ berjalan lancar. Bantuan tambahan tiba tepat waktu.',
    'Taktik pecah konsentrasi berhasil. Target teralihkan cukup lama untuk evakuasi.',
    'Penerangan dipadamkan. Evakuasi dilakukan dalam gelap agar tidak terdeteksi.',
    'Barikade darurat dibangun. Warga dilindungi sampai bantuan datang.',
    'Penyelamatan dilakukan bertahap. Prioritas diberikan pada anak-anak dan lansia.',
    'Peralatan seadanya digunakan. Kreativitas tim menyelamatkan banyak nyawa.'
  ]

  // 50 RESPON WARGA + EMOJI RANDOM MINIMAL 2 ORANG
  const CITIZEN_RESPONSE = [
    '😭 "Terima kasih... kami kira sudah mati..."',
    '🙏 "Tolong anak saya dulu! Dia di belakang!"',
    '😇 "Kalian pahlawan. Sungguh terima kasih."',
    '🤕 "Saya tidak bisa berjalan... kaki saya..."',
    '😱 "Cepat! Masih ada 2 orang di dalam!"',
    '😮‍💨 "Ya Tuhan... akhirnya bantuan datang."',
    '🥺 "Jangan tinggalkan kami. Mohon."',
    '👮 "Saya akan laporkan ini ke polisi!"',
    '🚑 "Ambulans! Ada yang luka berat di sini!"',
    '😖 "Maaf merepotkan. Kami sangat ketakutan."',
    '😊 "Kalian datang tepat waktu. Terima kasih banyak."',
    '😅 "Saya kehilangan dompet... tapi tidak apa-apa."',
    '📞 "Tolong hubungi keluarga saya. Nomor saya..."',
    '🙌 "Kami akan doakan kalian setiap hari."',
    '😔 "Ini semua salah saya. Maafkan saya."',
    '🥹 "Saya tidak akan pernah lupa ini."',
    '❓ "Ada yang masih hilang. Tolong cari!"',
    '😰 "Kami bersembunyi 3 jam di sana..."',
    '🏥 "Tolong bawa saya ke rumah sakit."',
    '❤️ "Kalian menyelamatkan hidup kami."',
    '😵 "Aku kira ini hari terakhirku..."',
    '🫠 "Tangan ku gemetar. Makasih udah nolong."',
    '👩‍👧 "Ibu... anakku mana?"',
    '💡 "Jangan matikan lampunya. Aku takut."',
    '👂 "Kami dengar teriakan dari atas."',
    '🚫 "Pintu itu jangan dibuka!"',
    '⬇️ "Ada yang masih di basement!"',
    '😮 "Syukurlah kalian datang..."',
    '😭 "Aku tidak bisa berhenti menangis."',
    '👏 "Kalian yang terbaik."',
    '🥤 "Tolong air... aku haus..."',
    '😞 "Kami kira tidak ada yang peduli."',
    '😨 "Ini semua mimpi buruk..."',
    '😌 "Makasih udah selamatin kami."',
    '🚷 "Aku tidak mau kembali ke sana."',
    '📱 "Tolong kabarin keluargaku."',
    '🙏 "Kami berdoa untuk kalian."',
    '😢 "Aku tidak akan pernah melupakan ini."',
    '😤 "Kalian berani sekali..."',
    '🏃 "Cepat keluar dari sini!"',
    '💪 "Aku masih bisa jalan. Selametin yang lain."',
    '😷 "Tolong... dia tidak bergerak..."',
    '💝 "Kami hutang nyawa sama kalian."',
    '🪪 "Ini kartu identitas saya. Tolong simpan."',
    '😵‍💫 "Aku kira aku akan mati di sini."',
    '🤝 "Terima kasih sudah tidak menyerah."',
    '📝 "Kami akan jadi saksi untuk kalian."',
    '🥺 "Tolong jangan tinggalkan kami lagi."',
    '🫡 "Hidup kami ada di tangan kalian."'
  ].map(story => `🚑 ${story}`)

  const RESCUE_RESULT_WITH_EMOJI = RESCUE_RESULT.map(result => `✅ ${result}`)
  let story = RESCUE_STORY[Math.floor(Math.random() * RESCUE_STORY.length)]
  let result = RESCUE_RESULT_WITH_EMOJI[Math.floor(Math.random() * RESCUE_RESULT_WITH_EMOJI.length)]
  rememberSeen('seenRescueStories', story)
  rememberSeen('seenRescueResults', result)

  // ambil 2-3 respon warga random
  let jumlahRespon = Math.floor(Math.random() * 2) + 2 // 2 atau 3
  let responDipilih = []
  let tempRespon = [...CITIZEN_RESPONSE]
  for(let i = 0; i < jumlahRespon; i++){
    let idx = Math.floor(Math.random() * tempRespon.length)
    responDipilih.push(tempRespon[idx])
    tempRespon.splice(idx, 1)
  }

  let total = Math.floor(Math.random() * 20) + 5 // 5-24 warga, minimal 5
  let injured = Math.floor(Math.random() * (total * 0.3)) // 0-30% cidera
  let missing = Math.floor(Math.random() * (total * 0.2)) // 0-20% hilang
  let saved = total - injured - missing
  if(saved < 2) saved = 2 // minimal 2 selamat

  // REWARD: EXP GEDE + BLOOD SAMA KAYAK MISSION
  csm.devilsKilled++
  let bloodGain = Math.floor(((300 + saved * 25) * 1.5) * b.bloodMult) + b.stealBlood // x1.5 kayak mission
  let expGain = Math.floor((400 + saved * 30) * b.expMult) // exp gede

  csm.blood += bloodGain
  const leveled = addExp(expGain)
  csm.lastRescue = Date.now()
  saveDB(wdb)

  let msg = header('OPERASI RESCUE SELESAI') +
    `${story}\n\n` +
    `${result}\n\n` +
    `${responDipilih.join('\n')}\n` +
    `|━━━━━━━━━━━\n` +
    ` 📊 LAPORAN EVAKUASI\n` +
    ` 👥 Total Warga: ${total} orang\n` +
    ` ✅ Selamat: ${saved} orang\n` +
    ` 🩹 Cidera: ${injured} orang\n` +
    ` ❓ Hilang: ${missing} orang\n` +
    `|━━━━━━━━━━━\n` +
    ` 🩸 +${bloodGain.toLocaleString()} Darah\n` +
    ` 📈 +${expGain} EXP [Bonus Besar]`
  if(b.findItem > 0 && Math.random() < b.findItem) msg += `\n|🎁 Ditemukan barang milik warga`
  if (leveled) msg += `\n|🎉 LEVEL UP! Lv.${csm.level}`
  if (rusak) msg += `\n|💀 *${rusak}* RUSAK!`

  await checkMakimaTrigger(m, csm, wdb)
  return sendCsmReply(msg + `\n|━━━━━━━━━━━`, pickPicture(CSM_PICTURES.city))
}

// === JOB LIST 💼
if (action === 'job' && args[1]?.toLowerCase() === 'list') {
  let cap = header('PILIH PEKERJAAN')
  if (!csm.jobs) csm.jobs = {}

  cap += `MAIN JOB\n━━━━━━━━━━━\n`
  MAIN_JOB_LIST.forEach((j, i) => {
    let jd = getJobData(csm, j.job)
    cap += `*${i + 1}.*\nJob: ${j.job}\nLevel: ${jd.level}\n\n`
  })

  cap += `SIDE JOB\n━━━━━━━━━━━\n`
  SIDE_JOB_LIST.forEach((j, i) => {
    let jd = getJobData(csm, j.job)
    cap += `*${i + 1 + MAIN_JOB_LIST.length}.*\nJob: ${j.job}\nLevel: ${jd.level}\n\n`
  })

  cap += `━━━━━━━━━━━\n` +
    `📌 .csm job\n` +
    `📌 .csm job join <nomor/nama>\n` +
    `📌 .csm job leave\n` +
    `📌 .csm job info\n` +
    `|━━━━━━━━━━━`

  return m.reply(cap)
}

// === JOB RIWAYAT / INFO DIRI 👔
if (action === 'job' &&!args[1]) {
  if (!csm.jobs || Object.keys(csm.jobs).length === 0) {
    return m.reply(header('RIWAYAT KERJA') +
      ` Kamu belum pernah bekerja.\n` +
      ` Gunakan *.csm job list* untuk mulai.\n` +
      `|━━━━━━━━━━━`)
  }

  let cap = header('RIWAYAT KERJA KAMU')
  if (csm.job) {
    cap += `Sedang Bekerja:\n`
    cap += `Job: *${csm.job}*\n`
    cap += `Level: ${getJobData(csm, csm.job).level}\n\n`
  }

  cap += `|── SEMUA JOB ──|\n`
  let sorted = Object.entries(csm.jobs).sort((a,b) => b[1].level - a[1].level)

  sorted.forEach(([jobName, data], i) => {
    let expButuh = Math.floor(100 * Math.pow(data.level, 1.5))
    let status = csm.job === jobName? '▶️' : '✅'
        cap += ` ${status} *${jobName}*\n` +
          `  Level: ${data.level}\n` +
          `  EXP: ${data.exp}/${expButuh}\n` +
          `  Gaji: x${(1 + (data.level - 1) * 0.25).toFixed(2)}\n\n`
  })

  cap += `|━━━━━━━━━━━`
  return m.reply(cap)
}

// === JOB INFO 📊
if (action === 'job' && args[1]?.toLowerCase() === 'info') {
  if (!csm.job) return m.reply(header('BELUM PUNYA JOB') + `|━━━━━━━━━━━`)
  let jd = getJobData(csm, csm.job)
  let expButuh = Math.floor(100 * Math.pow(jd.level, 1.5))
  let desc = getJobDesc(csm.job)
  return m.reply(header(`INFO JOB: ${csm.job}`) +
    ` ${desc}\n\n` +
    ` Level: ${jd.level}\n` +
    ` EXP: ${jd.exp}/${expButuh}\n` +
    ` Bonus Gaji: x${(1 + (jd.level - 1) * 0.25).toFixed(2)}\n` +
    `|━━━━━━━━━━━`)
}

// === JOB JOIN 📝
if (action === 'job' && args[1]?.toLowerCase() === 'join') {
  if (csm.job) {
    return m.reply(header('SUDAH PUNYA JOB') +
      ` Kamu sedang bekerja sebagai:\n` +
      ` 💼 *${csm.job}*\n\n` +
      ` Gunakan.csm job leave jika ingin resign.\n` +
      `|━━━━━━━━━━━`)
  }

  // Cooldown setelah leave 1 jam
  const cd = cekCD('lastJobLeave', 60 * 60 * 1000)
  if (cd > 0) {
    const menit = Math.floor(cd / 60000)
    const detik = Math.floor((cd % 60000) / 1000)
    return m.reply(header('COOLDOWN') +
      ` Tunggu ${menit}m ${detik}d lagi untuk cari job baru.\n` +
      `|━━━━━━━━━━━`)
  }

  const input = args.slice(2).join(' ').trim()
  if (!input) {
    return m.reply(header('PENGGUNAAN') +
      ` .csm job list\n` +
      ` .csm job join <nomor>\n` +
      ` .csm job join <nama job>\n` +
      `|━━━━━━━━━━━`)
  }

  let job = null
  if (/^\d+$/.test(input)) {
    const index = parseInt(input, 10) - 1
    job = JOB_LIST[index]
  } else {
    job = JOB_LIST.find(j => j.toLowerCase() === input.toLowerCase())
  }

  if (!job) {
    return m.reply(header('JOB TIDAK ADA') +
      ` Gunakan.csm job list untuk melihat semua job.\n` +
      `|━━━━━━━━━━━`)
  }

  csm.job = job
  getJobData(csm, job) // init kalau belum ada, tapi ga kereset kalau udah ada
  saveDB(wdb)

  let jd = getJobData(csm, job)
  return m.reply(header('KERJA DIMULAI') +
    ` 💼 Kamu sekarang: *${job}*\n` +
    ` ${getJobDesc(job)}\n\n` +
    ` Level Job: ${jd.level}\n\n` +
    ` Gaji bisa didapat melalui:\n` +
    ` .csm work\n` +
    `|━━━━━━━━━━━`)
}

// === JOB LEAVE 🚪
if (action === 'job' && args[1]?.toLowerCase() === 'leave') {
  if (!csm.job) {
    return m.reply(header('BELUM PUNYA JOB') +
      ` Kamu sedang tidak bekerja.\n` +
      `|━━━━━━━━━━━`)
  }

  const jobLama = csm.job
  let jd = getJobData(csm, jobLama)
  csm.job = null
  csm.lastJobLeave = Date.now() // trigger cooldown 1 jam buat join lagi

  saveDB(wdb)

  return m.reply(header('BERHENTI KERJA') +
    ` Kamu resign dari:\n` +
    ` 💼 *${jobLama}* [Lv.${jd.level}]\n` +
    ` Level job tersimpan. Bisa lanjut lagi nanti.\n` +
    ` Cooldown 1 jam untuk cari job baru.\n` +
    `|━━━━━━━━━━━`)
}

// === WORK 💼
if (action === 'work') {
  if (!csm.job) {
    return m.reply(header('BELUM PUNYA JOB') +
      ` .csm job join <nomor/nama>\n` +
      `|━━━━━━━━━━━`)
  }

  let b = calcBonus(csm)
  const cooldown = 10 * 60 * 1000 // 10 MENIT
  const cd = cekCD('lastWork', cooldown)

  if (cd > 0) {
    const menit = Math.floor(cd / 60000)
    const detik = Math.floor((cd % 60000) / 1000)
    return m.reply(header('COOLDOWN') +
      ` Tunggu ${menit}m ${detik}d lagi.\n` +
      `|━━━━━━━━━━━`)
  }

  let jobData = getJobData(csm, csm.job)
  if (!Array.isArray(csm.workStories)) csm.workStories = []
  const jobStories = JOB_WORK_STORIES[csm.job] || []
  const workStory = jobStories[(jobData.workCount || 0) % Math.max(1, jobStories.length)]
  jobData.workCount = (jobData.workCount || 0) + 1
  if (workStory && !csm.workStories.includes(`${csm.job}: ${workStory}`)) csm.workStories.push(`${csm.job}: ${workStory}`)

  // GAJI NAIK BERDASARKAN LEVEL JOB
  const gajiDasar = Math.floor(Math.random() * 10000) + 5000 + csm.level * 2000
  const jobMultiplier = 1 + (jobData.level - 1) * 0.25 // Lv1 = x1, Lv2 = x1.25, Lv5 = x2
  const gaji = Math.floor((gajiDasar + b.bloodFlat) * b.bloodMult * jobMultiplier)

  // EXP PLAYER + EXP JOB
  const expPlayer = Math.floor((50 + csm.level * 5) * b.expMult)
  const expJob = Math.floor((20 + jobData.level * 5) * b.expMult) // exp buat naikin level job

  csm.blood += gaji
  const leveledPlayer = addExp(expPlayer)
  const jobLevelUp = addJobExp(csm, csm.job, expJob)

  csm.lastWork = Date.now()

  if(!b.noHeal && b.heal > 0) {
    csm.health = Math.min(csm.maxHealth, csm.health + b.heal)
  }

  saveDB(wdb)

  let msg = header(`KERJA: ${csm.job} [Lv.${jobData.level}]`) +
    `|${workStory || 'Kamu bekerja hari ini.'}\n\n` +
    `|🩸 +${gaji.toLocaleString()} Blood [x${jobMultiplier.toFixed(2)}]`

  if(b.bloodFlat > 0) msg += ` [+${b.bloodFlat} Blood Bonus]`
  if(b.bloodMult > 1) msg += ` [x${b.bloodMult.toFixed(2)}]`

  msg += `\n|📈 +${expPlayer} EXP Player`
  if(b.expMult > 1) msg += ` [x${b.expMult.toFixed(2)}]`
  msg += `\n|📊 +${expJob} EXP Job`

  if(b.findItem > 0 && Math.random() < b.findItem) msg += `\n|🎁 Dapet Item Sampingan!`
  if(b.heal > 0) msg += `\n|❤️ +${b.heal} HP [Istirahat Kerja]`

  if (jobLevelUp.leveled) msg += `\n|🎉 LEVEL UP JOB!\n|💼 Job: ${csm.job}\n|📊 Level: ${jobData.level}`
  if (leveledPlayer) msg += `\n|🎉 LEVEL UP PLAYER! Lv.${csm.level}`

  msg += `\n|━━━━━━━━━━━`

  await checkMakimaTrigger(m, csm, wdb)
return sendCsmReply(msg, pickPicture(CSM_PICTURES.city))
}

// === ERASURE EFFECT 🕳️
if (action === 'erasure') {
  const sub = args[1]?.toLowerCase()

  // Jika tidak ada Erasure Effect yang sedang aktif/menunggu
  // cukup tampilkan penjelasan, tidak melakukan reset apa pun.
  if (!csm.erasurePending && !['no', 'yes', 'horsemen', 'fiend', 'hybrid', 'confirm', 'cancel'].includes(sub)) {
    return m.reply(
      header('TENTANG ERASURE EFFECT') +
      `🕳️ *Erasure Effect*\n` +
      `> Pochita dapat menghapus bagian tertentu dari eksistensi dan kontrakmu. Event ini muncul secara random saat perjalananmu memasuki kondisi berbahaya.\n\n` +
      `> *Status:*\n` +
      `> Saat ini kamu tidak sedang terkena Erasure Effect.\n` +
      `> Tidak ada data yang akan dihapus.\n\n` +
      `> *Jika terkena Erasure Effect:*\n` +
      `> Jika diterima, Story kembali ke awal, kontrak dan Blood hilang, lalu inventory direset ke Fist. Level, EXP, partner, dan riwayat ending tetap aman.\n\n` +
      `> *Pilihan:*\n` +
      `> ${usedPrefix}csm event erasure yes - Terima Erasure Effect\n` +
      `> ${usedPrefix}csm event erasure no - Pilih perlindungan\n\n` +
      `> *Perlindungan yang tersedia:*\n` +
      `> ${usedPrefix}csm event erasure horsemen 1 - Makima\n` +
      `> ${usedPrefix}csm event erasure horsemen 2 - Yoru\n` +
      `> ${usedPrefix}csm event erasure horsemen 3 - Fami\n` +
      `> ${usedPrefix}csm event erasure horsemen 4 - Nayuta\n` +
      `> ${usedPrefix}csm event erasure horsemen 5 - Death Devil\n` +
      `> ${usedPrefix}csm event erasure fiend\n` +
      `> ${usedPrefix}csm event erasure hybrid\n` +
      `━━━━━━━━━━━`
    )
  }

  if (sub === 'no') {
    csm.erasurePending = null
    return m.reply(
      header('PILIH PERLINDUNGAN') +
      ` Pilih salah satu cara menghindari Erasure Effect:\n\n` +
      `> ${usedPrefix}csm event erasure horsemen 1 - Makima\n` +
      `> ${usedPrefix}csm event erasure horsemen 2 - Yoru\n` +
      `> ${usedPrefix}csm event erasure horsemen 3 - Fami\n` +
      `> ${usedPrefix}csm event erasure horsemen 4 - Nayuta\n` +
      `> ${usedPrefix}csm event erasure horsemen 5 - Death Devil\n` +
      `> ${usedPrefix}csm event erasure fiend\n` +
      `> ${usedPrefix}csm event erasure hybrid\n` +
      `━━━━━━━━━━━`
    )
  }

  if (sub === 'yes') {
    if (!csm.erasurePending) {
      return m.reply(
        header('TIDAK ADA ERASURE') +
        ` Tidak ada Erasure Effect yang sedang menunggu.\n` +
        ` Tidak ada data yang dihapus.\n` +
        `━━━━━━━━━━━`
      )
    }

    csm.erasurePending = null
    csm.story = 1
    csm.devilContract = null
    csm.contractType = null
    csm.contractExpire = 0
    csm.isTransform = false
    csm.dollContract = false
    csm.lastStory = 0
    csm.blood = 0
    csm.inventory = [{ nama: 'Fist', dur: 999 }]
    csm.weapon = { nama: 'Fist', dur: 999 }

    saveDB(wdb)

    return m.reply(
      header('ERASURE EFFECT') +
      ` Pochita selesai memakan bagian dirinya sendiri. Story, kontrak, darah, dan inventory kamu terhapus.\n` +
      ` Level, EXP, partner, dan riwayat ending tetap tersimpan.\n` +
      `━━━━━━━━━━━`
    )
  }

  if (sub === 'horsemen' || sub === 'fiend' || sub === 'hybrid') {
    const horsemenList = ['makima', 'yoru', 'fami', 'nayuta', 'death']
    const horsemenNames = {
      makima: 'Makima',
      yoru: 'Yoru',
      fami: 'Fami',
      nayuta: 'Nayuta',
      death: 'Death Devil'
    }

    const rawChoice = ['fiend', 'hybrid'].includes(sub) ? sub : (args[2] || '').toLowerCase()
    const normalizedChoice = Number.isInteger(Number(rawChoice)) && Number(rawChoice) >= 1 && Number(rawChoice) <= horsemenList.length
      ? horsemenList[Number(rawChoice) - 1]
      : rawChoice
    const choice = normalizedChoice

    if (sub === 'horsemen' && !horsemenList.includes(choice)) {
      return m.reply(
        header('PILIH HORSEMEN') +
        ` Pilih salah satu opsi berikut:\n` +
        ` 1. Makima\n` +
        ` 2. Yoru\n` +
        ` 3. Fami\n` +
        ` 4. Nayuta\n` +
        ` 5. Death Devil\n\n` +
        `Contoh: ${usedPrefix}csm event erasure horsemen 3\n` +
        `━━━━━━━━━━━`
      )
    }

    csm.erasurePending = {
      type: 'protection',
      protection: sub,
      choice,
      time: Date.now()
    }

    return m.reply(
      header('KONFIRMASI PERLINDUNGAN') +
      `Pilihan ini membebaskanmu dari Erasure Effect, tetapi hanya admin yang dapat melepasnya melalui panel.\n\n` +
      `Pilihan aktif: ${horsemenNames[choice] || choice}\n` +
      `📖 ${ERASURE_BACKSTORIES[choice] || '🕳️ Kekuatan ini mengubah caramu bertahan dari Erasure Effect.'}\n\n` +
      `Ketik ${usedPrefix}csm event erasure confirm untuk mengunci pilihan.\n` +
      `Ketik ${usedPrefix}csm event erasure cancel untuk memilih ulang.\n` +
      `━━━━━━━━━━━`
    )
  }

  if (sub === 'confirm') {
    const pending = csm.erasurePending

    if (!pending || pending.type !== 'protection') {
      return m.reply(
        header('TIDAK ADA PILIHAN') +
        `Pilih perlindungan dulu.\n` +
        `━━━━━━━━━━━`
      )
    }

    csm.erasureProtection =
      ['fiend', 'hybrid'].includes(pending.protection)
        ? pending.protection
        : `horsemen:${pending.choice}`

    csm.erasurePending = null

    const horsemenTitle = {
      makima: 'Makima\'s Pawns',
      yoru: 'Property of Yoru',
      fami: 'Fami\'s Livestock',
      nayuta: 'Playmates of Nayuta',
      death: 'Death Devil: Lost Souls'
    }

    if (['fiend', 'hybrid'].includes(csm.erasureProtection)) {
      const pool = DEVIL_LIST.filter(entity =>
        getContractMeta(entity).types.includes(csm.erasureProtection)
      )

      const replacement = pool[Math.floor(Math.random() * pool.length)]

      csm.devilContract = replacement?.nama || null
      csm.contractType = csm.erasureProtection
    } else {
      csm.devilContract = horsemenTitle[pending.choice] || horsemenTitle.makima
      csm.contractType = 'horsemen'
      csm.horsemenName = pending.choice
    }

    csm.dollContract = false

    saveDB(wdb)

    return m.reply(
      header('PERLINDUNGAN TERKUNCI') +
      `Kamu sekarang terlindungi dari Erasure Effect.\n` +
      `⛓️ Mulai sekarang kamu dipanggil: *${csm.devilContract}*.\n` +
      `📖 ${ERASURE_BACKSTORIES[pending.choice] || '🕳️ Kekuatan perlindunganmu telah terikat.'}\n` +
      `Gunakan ${usedPrefix}csm contract untuk kontrak yang sesuai dengan pilihanmu.\n` +
      `━━━━━━━━━━━`
    )
  }

  if (sub === 'cancel') {
    csm.erasurePending = null

    return m.reply(
      header('PILIH ULANG') +
      `Gunakan ${usedPrefix}csm event erasure horsemen <1-5> atau ${usedPrefix}csm event erasure horsemen <makima/yoru/fami/nayuta/death>, ` +
      `${usedPrefix}csm event erasure fiend, atau ${usedPrefix}csm event erasure hybrid.\n` +
      `━━━━━━━━━━━`
    )
  }

  return m.reply(
    header('ERASURE EFFECT') +
    `Gunakan ${usedPrefix}csm event erasure yes/no atau pilih perlindungan yang tersedia.\n` +
    `━━━━━━━━━━━`
  )
}

// === COMMAND MAKIMACALL ===
if (action === 'makimacall') {
  const sub = args[1] // terima / tolak

  // === INFO JIKA CUMA .csm makimacall ===
  if (!sub) {
    return m.reply(header('TENTANG MAKIMA CALL') +
      `⛓️ *Sistem perintah acak dari Makima*\n` +
      `> *Cara Kerja:*\n` +
      `> 1. Bisa terpicu sangat jarang ketika kamu melakukan Work, Mission, Explore, Terror, atau Rescue.\n` +
      `> 2. Syarat: Blood kamu minimal 10.000 dan kamu punya waktu 1 jam.\n` +
      `> 3. Makima memanggilmu untuk mengeksekusi target; menerima memberi hadiah jika berhasil, gagal atau menolak mengurangi Blood.\n\n` +
      `> *Command:*\n` +
      `> .csm event makimacall terima - Terima & lanjut ke duel\n` +
      `> .csm event makimacall tolak - Tolak perintah\n\n` +
      `> *Reward jika Berhasil:*\n` +
      `> 🩸 +15.000 Blood\n` +
      `> 📈 +100 EXP\n` +
      `> *Hukuman jika Gagal/Tolak:*\n` +
      `>🩸 -10.000 Blood\n` +
      `|━━━━━━━━━━━`)
  }

  // === TERIMA ===
  if (sub === 'terima') {
    if (csm.pendingDuel !== 'makima_order') {
      return m.reply(header('TIDAK ADA PERINTAH') + `|Tidak ada perintah Makima.\n|━━━━━━━━━━━`)
    }

    const cd = 60 * 60 * 1000 - (Date.now() - csm.pendingDuelTime)
    if (cd <= 0) {
      csm.pendingDuel = null
      csm.pendingDuelTime = null
      csm.blood = Math.max(0, csm.blood - 10000)
      saveDB(wdb)
      return m.reply(header('WAKTU HABIS') +
        ` Perintah Makima kadaluarsa.\n` +
        ` 🩸 -10.000 Blood sebagai hukuman.\n` +
        `|━━━━━━━━━━━`)
    }

    const target = m.mentionedJid?.[0]
    if (!target) {
      csm.makimaCallActive = true
      saveDB(wdb)
      return m.reply(header('PERINTAH DITERIMA') +
        ` ⛓️ "Baik. Lanjutkan sendiri sesuai perintahku."\n\n` +
        ` Sekarang kamu harus menuntaskan tugas dengan duel ke target lain.\n` +
        ` Gunakan: ${usedPrefix}csm duel @tag\n` +
        `|━━━━━━━━━━━`)
    }
    if (target === m.sender) return m.reply(header('TIDAK BISA') + `|Tidak bisa bunuh diri sendiri.\n|━━━━━━━━━━━`)

    const targetRPG = wdb.users[target]?.rpg
    const tUser = targetRPG?.csm
    if (!tUser) return m.reply(header('TARGET BELUM MAIN') + `|━━━━━━━━━━━`)

    // Sistem duel simpel
    const chance = csm.level >= tUser.level ? 0.7 : 0.3
    const win = Math.random() < chance

    csm.pendingDuel = null
    csm.pendingDuelTime = null

    if (win) {
      csm.blood += 15000
      const leveled = addExp(100) // EXP PLAYER
      saveDB(wdb)
      return m.reply(header('MISI BERHASIL') +
        ` ⛓️ "Bagus... anjing yang patuh."\n\n` +
        ` Target telah dieliminasi.\n\n` +
        ` 🩸 +15.000 Blood\n` +
        ` 📈 +100 EXP` +
        (leveled ? `\n|🎉 LEVEL UP! Lv.${csm.level}` : ``) +
        `\n|━━━━━━━━━━━`)
    } else {
      csm.blood = Math.max(0, csm.blood - 10000)
      saveDB(wdb)
      return m.reply(header('MISI GAGAL') +
        ` ⛓️ "Mengecewakan..."\n\n` +
        ` Kamu gagal membunuh target.\n\n` +
        ` 🩸 -10.000 Blood\n` +
        `|━━━━━━━━━━━`)
    }
  }

  // === TOLAK ===
  if (sub === 'tolak') {
    if (csm.pendingDuel !== 'makima_order') {
      return m.reply(header('TIDAK ADA PERINTAH') +
        ` Tidak ada perintah Makima yang sedang aktif.\n` +
        `|━━━━━━━━━━━`)
    }
    if (csm.blood < 10000) {
      return m.reply(header('DARAH KURANG') +
        ` Butuh 10.000 Blood untuk menolak perintah.\n` +
        `|━━━━━━━━━━━`)
    }

    csm.blood -= 10000
    csm.pendingDuel = null
    csm.pendingDuelTime = null
    saveDB(wdb)

    return m.reply(header('PERINTAH DITOLAK') +
      ` ⛓️ "Kecewa aku..."\n\n` +
      ` 🩸 -10.000 Blood\n` +
      `|━━━━━━━━━━━`)
  }

  return m.reply(header('SALAH') +
    ` Penggunaan:\n` +
    ` .csm event makimacall\n` +
    ` .csm event makimacall terima\n` +
    ` .csm event makimacall tolak\n` +
    `|━━━━━━━━━━━`)
}

// === DUEL ⚔️
if (action === 'duel') {
  const target = m.mentionedJid?.[0]
  if (!target) return m.reply(header('TAG ORANGNYA') + ` Contoh:\n .csm duel @tag 5000\n|━━━━━━━━━━━`)
  if (target === m.sender) return m.reply(header('TIDAK BISA') + ` Kamu tidak bisa duel melawan diri sendiri.\n|━━━━━━━━━━━`)

  const targetRPG = wdb.users[target]?.rpg
  const tUser = targetRPG?.csm
  if (!tUser) return m.reply(header('TARGET BELUM MAIN') + `|━━━━━━━━━━━`)

  if (!Array.isArray(tUser.inventory) ||!tUser.inventory.length) tUser.inventory = [{ nama: 'Fist', dur: 999 }]
  if (!tUser.weapon ||!tUser.weapon.nama) tUser.weapon = { nama: 'Fist', dur: 999 }

  const taruhan = Math.max(0, parseInt(args[2], 10) || 0)
  if (taruhan > 0) {
    if (csm.blood < taruhan || tUser.blood < taruhan) {
      return m.reply(header('DARAH KURANG') +
        ` Kedua pemain harus punya blood yang cukup.\n|━━━━━━━━━━━`)
    }
  }

  const myWeapon = WEAPON_LIST.find(w => w.nama === csm.weapon.nama) || { dmg: 0, nama: csm.weapon.nama || 'Fist' }
  const enemyWeapon = WEAPON_LIST.find(w => w.nama === tUser.weapon.nama) || { dmg: 0, nama: tUser.weapon.nama || 'Fist' }

  const dmg1 = csm.level * 10 + myWeapon.dmg
  const dmg2 = tUser.level * 10 + enemyWeapon.dmg
  const win = dmg1 === dmg2? Math.random() < 0.5 : dmg1 > dmg2

  if (taruhan > 0) {
    if (win) {
      csm.blood += taruhan
      tUser.blood -= taruhan
    } else {
      csm.blood -= taruhan
      tUser.blood += taruhan
    }
  }

  let makimaReward = ''
  if (csm.makimaCallActive) {
    csm.makimaCallActive = false
    csm.pendingDuel = null
    csm.pendingDuelTime = null
    if (win) {
      csm.blood += 15000
      const makimaLevelUp = addExp(100)
      makimaReward = `\n⛓️ Reward MakimaCall: +15.000 Blood, +100 EXP`
      if (makimaLevelUp) makimaReward += `\n🎉 LEVEL UP! Lv.${csm.level}`
    } else {
      csm.blood = Math.max(0, csm.blood - 10000)
      makimaReward = `\n⛓️ Penalti MakimaCall: -10.000 Blood`
    }
  }

  saveDB(wdb)

  return m.reply(header('HASIL DUEL') +
    ` ${win? '🏆 KAMU MENANG' : '💀 KAMU KALAH'}\n\n` +
    ` ⚔️ DMG Kamu: ${dmg1}\n` +
    ` ⚔️ DMG Lawan: ${dmg2}\n` +
    (taruhan > 0? `|🩸 Taruhan: ${taruhan.toLocaleString()} Blood\n` : ``) +
    `${makimaReward}\n|━━━━━━━━━━━`)
}

// === GIFT 🎁
if (action === 'gift') {
  const type = args[1]?.toLowerCase() // bank / darah / partner / hunter
  const subType = args[2]?.toLowerCase() // blood / money kalau partner
  const targetInput = args[3] // @tag atau nama/nomor karakter
  const jumlahLove = parseInt(args[4], 10) // jumlah needLove yg mau dikasih

  // === INFO JIKA CUMA.csm gift ===
  if (!type) {
    return m.reply(header('PENGGUNAAN GIFT') +
      ` Kirim hadiah ke Hunter atau Partner\n\n` +

      ` 🕵️ *KE HUNTER*\n` +
      ` Transfer Money atau Blood ke player lain\n\n` +
      
      ` .csm gift bank @tag 10000\n` +
      ` .csm gift darah @tag 100\n` +
      ` .csm gift hunter @tag 100\n\n` +

      ` 💌 *KE PARTNER*\n` +
      ` Naikin poin kenalan biar bisa direkrut\n\n` +
      
      ` .csm gift partner blood <nomor/nama> <jumlahLove>\n` +
      ` .csm gift partner money <nomor/nama> <jumlahLove>\n\n` +
      
      ` Contoh:.csm gift partner blood 1 10\n` +
      ` Contoh:.csm gift partner money Reze 10\n\n` +

      ` 💌 Rate: 1500 Blood = 1 Love\n` +
      ` 💰 Rate: 1500 Money = 1 Blood\n` +
      ` 💸 Rate: 2.250.000 Money = 1 Love\n` +
      `|━━━━━━━━━━━`)
  }

  if (['yes', 'terima', 'no', 'tolak'].includes(type)) {
    if (!csm.pendingGift) return m.reply(header('TIDAK ADA GIFT') + `Tidak ada gift yang menunggu konfirmasi.\n━━━━━━━━━━━`)
    if (['no', 'tolak'].includes(type)) {
      csm.pendingGift = null
      saveDB(wdb)
      return m.reply(header('GIFT DIBATALKAN') + `Tidak ada saldo atau hubungan yang berubah.\n━━━━━━━━━━━`)
    }
    const pending = csm.pendingGift
    csm.pendingGift = null
    if (pending.kind === 'hunter') {
      const targetRPG = wdb.users[resolveJid(pending.target)]?.rpg || wdb.users[pending.target]?.rpg
      if (!targetRPG) return m.reply(header('TARGET BELUM MAIN') + `Data target sudah tidak tersedia.\n━━━━━━━━━━━`)
      targetRPG.bank = Number(targetRPG.bank) || 0
      targetRPG.csm = targetRPG.csm || { blood: 0 }
      if (pending.type === 'bank') {
        if (userRPG.bank < pending.amount) return m.reply(header('SALDO KURANG') + `Saldo tidak cukup.\n━━━━━━━━━━━`)
        userRPG.bank -= pending.amount
        targetRPG.bank += pending.amount
      } else {
        if (csm.blood < pending.amount) return m.reply(header('DARAH KURANG') + `Blood tidak cukup.\n━━━━━━━━━━━`)
        csm.blood -= pending.amount
        targetRPG.csm.blood = (targetRPG.csm.blood || 0) + pending.amount
      }
      saveDB(wdb)
      return m.reply(header('GIFT TERKIRIM') + `Kamu mengirim ${pending.amount.toLocaleString()} ${pending.type === 'bank' ? 'Money' : 'Blood'} ke ${conn.getName(pending.target)}.\n━━━━━━━━━━━`)
    }
    if (pending.kind === 'partner') {
      const cost = pending.love * 1500 * (pending.type === 'money' ? 1500 : 1)
      if (pending.type === 'blood') {
        if (csm.blood < cost) return m.reply(header('DARAH KURANG') + `Butuh ${cost.toLocaleString()} Blood.\n━━━━━━━━━━━`)
        csm.blood -= cost
      } else {
        if (userRPG.bank < cost) return m.reply(header('SALDO KURANG') + `Butuh Rp ${cost.toLocaleString()}.\n━━━━━━━━━━━`)
        userRPG.bank -= cost
      }
      csm.relations[pending.name] = (csm.relations[pending.name] || 0) + pending.love
      return await sendPartnerGiftResponse(m, pending.character, pending.love, csm.relations[pending.name], pending.type, cost, csm, wdb)
    }
  }

  // === 1. GIFT KE HUNTER / BANK / DARAH ===
  if (['bank', 'darah', 'hunter'].includes(type)) {
    const target = m.mentionedJid?.[0]
    if (!target ||!jumlahLove || jumlahLove <= 0) {
      return m.reply(header('PENGGUNAAN') +
        ` 👤 *GIFT KE HUNTER*\n\n` +
        ` .csm gift bank @tag 10000\n` +
        ` .csm gift darah @tag 100\n` +
        `|━━━━━━━━━━━`)
    }
    if (target === m.sender) return m.reply(header('TIDAK BISA') + `|Kamu tidak bisa mengirim gift ke diri sendiri.\n|━━━━━━━━━━━`)

    const targetRPG = wdb.users[resolveJid(target)]?.rpg || wdb.users[target]?.rpg
    if (!targetRPG) return m.reply(header('TARGET BELUM MAIN') + `|━━━━━━━━━━━`)
    if (!targetRPG.csm) targetRPG.csm = JSON.parse(JSON.stringify(csm))
    targetRPG.bank = Number.isFinite(Number(targetRPG.bank)) ? Number(targetRPG.bank) : 0

    csm.pendingGift = { kind: 'hunter', type, target, amount: jumlahLove }
    saveDB(wdb)
    return m.reply(header('KONFIRMASI GIFT') + `Kirim ${jumlahLove.toLocaleString()} ${type === 'bank' ? 'Money' : 'Blood'} ke ${conn.getName(target)}?\nKetik *.csm gift yes* untuk konfirmasi atau *.csm gift no* untuk batal.\n━━━━━━━━━━━`)

    if (type === 'bank') {
      if (userRPG.bank < jumlahLove) return m.reply(header('SALDO KURANG') + `|━━━━━━━━━━━`)
      userRPG.bank -= jumlahLove
      targetRPG.bank += jumlahLove
    } else { // darah / hunter
      if (csm.blood < jumlahLove) return m.reply(header('DARAH KURANG') + `|━━━━━━━━━━━`)
      csm.blood -= jumlahLove
      targetRPG.csm.blood += jumlahLove
    }

    saveDB(wdb)
    return m.reply(header('GIFT TERKIRIM 👤') +
      ` Kamu mengirim ${jumlahLove.toLocaleString()} ${type === 'bank'? 'Money' : 'Blood'} ke ${conn.getName(target)}\n` +
      `|━━━━━━━━━━━`)
  }

// === 2. GIFT KE PARTNER ===
if (type === 'partner') {
  if (!['blood', 'money'].includes(subType)) {
    return m.reply(header('PILIH TIPE') +
      ` 💌 *GIFT KE PARTNER*\n\n` +
      ` .csm gift partner blood <nomor/nama> <jumlahLove>\n` +
      ` .csm gift partner money <nomor/nama> <jumlahLove>\n` +
      `|━━━━━━━━━━━`)
  }

  // FUNCTION CARI KARAKTER PAKE NOMOR/NAMA
  function cariChar(input) {
    if (!input) return null
    if (isNaN(input)) return CHARACTER_LIST.find(c => c.nama.toLowerCase() === input.toLowerCase())
    const idx = parseInt(input) - 1
    return CHARACTER_LIST[idx] || null
  }

  if (!targetInput) return m.reply(header('PENGGUNAAN') + `|💌.csm gift partner ${subType} <nomor/nama> <jumlahLove>\n|━━━━━━━━━━━`)
  if (!jumlahLove || jumlahLove <= 0) return m.reply(header('PENGGUNAAN') + `|💌.csm gift partner ${subType} <nomor/nama> <jumlahLove>\n|━━━━━━━━━━━`)

  let char = cariChar(targetInput)
  if (!char) return m.reply(header('KARAKTER TIDAK ADA') + `|Cek ${usedPrefix}partner database\n|━━━━━━━━━━━`)

  if (!csm.relations) csm.relations = {}

  csm.pendingGift = {
    kind: 'partner', type: subType, name: char.nama, character: char, love: jumlahLove
  }
  saveDB(wdb)
  const bloodCost = jumlahLove * 1500
  const moneyCost = bloodCost * 1500
  return m.reply(header('KONFIRMASI GIFT PARTNER') +
    `${char.emoji} ${char.nama}\n` +
    `Tambah hubungan: +${jumlahLove}\n` +
    `Kurs: 1 Love = 1.500 Blood = Rp 2.250.000\n` +
    `Biaya: ${subType === 'blood' ? `${bloodCost.toLocaleString()} Blood` : `Rp ${moneyCost.toLocaleString()}`}\n\n` +
    `Ketik *.csm gift yes* untuk konfirmasi atau *.csm gift no* untuk batal.\n━━━━━━━━━━━`)

  // === GIFT PAKE BLOOD - MANUAL ===
  if (subType === 'blood') {
    const butuhBlood = jumlahLove * 1500
    if (csm.blood < butuhBlood) return m.reply(header('DARAH KURANG') + `|Butuh ${butuhBlood.toLocaleString()} Blood\n|Punya: ${csm.blood.toLocaleString()} Blood\n|━━━━━━━━━━━`)

    csm.blood -= butuhBlood
    csm.relations[char.nama] = (csm.relations[char.nama] || 0) + jumlahLove
    return await sendPartnerGiftResponse(m, char, jumlahLove, csm.relations[char.nama], 'blood', butuhBlood, csm, wdb)
  }

  // === GIFT PAKE MONEY - OTOMATIS ===
  if (subType === 'money') {
    const butuhBlood = jumlahLove * 1500
    const butuhMoney = butuhBlood * 1500 // 2.250.000 per 1 love
    if (userRPG.bank < butuhMoney) return m.reply(header('SALDO KURANG') + `|Butuh Rp ${butuhMoney.toLocaleString()}\n|Saldo: Rp ${userRPG.bank.toLocaleString()}\n|━━━━━━━━━━━`)

    userRPG.bank -= butuhMoney
    csm.relations[char.nama] = (csm.relations[char.nama] || 0) + jumlahLove
    return await sendPartnerGiftResponse(m, char, jumlahLove, csm.relations[char.nama], 'money', butuhMoney, csm, wdb)
  }
}

return m.reply(header('TIPE SALAH') + `|Tipe: bank, darah, hunter, partner\n|━━━━━━━━━━━`)
}

// === FUNCTION REAKSI GIFT BEDA BLOOD VS MONEY ===
async function sendPartnerGiftResponse(m, char, jumlahLove, loveNow, tipe, biaya, csm, wdb) { // <- tambah async + csm + wdb
  const reactionsBlood = [
    `${char.emoji} *"${char.nama}"*: "1500 Blood untuk satu poin? Murah. Lanjutkan."`,
    `${char.emoji} *"${char.nama}"*: "Kau menguras darahmu sendiri untukku? Menarik."`,
    `${char.emoji} *"${char.nama}"*: "*meminum* ${biaya.toLocaleString()} Blood... rasanya cukup."`,
    `${char.emoji} *"${char.nama}"*: "Pengorbanan yang bagus. Aku mulai menyukaimu."`,
    `${char.emoji} *"${char.nama}"*: "Jangan mati dulu. Aku belum puas."`,
    `${char.emoji} *"${char.nama}"*: "Blood-mu lebih jujur daripada kata-katamu."`,
    `${char.emoji} *"${char.nama}"*: "Aku akan mengingat siapa yang membayar ini."`,
    `${char.emoji} *"${char.nama}"*: "Sedikit lagi. Jangan berhenti sekarang."`,
    `${char.emoji} *"${char.nama}"*: "Kau rela kehilangan Blood demi hubungan ini?"`,
    `${char.emoji} *"${char.nama}"*: "Baik. Aku beri kau satu alasan untuk kembali."`
  ]

  const reactionsMoney = [
    `${char.emoji} *"${char.nama}"*: "Rp ${biaya.toLocaleString()}? Jalan pintas. Aku suka."`,
    `${char.emoji} *"${char.nama}"*: "Fufu~ Membeli kesetiaanku dengan uang. Efisien."`,
    `${char.emoji} *"${char.nama}"*: "Uang bisa membeli darah. Dan darah bisa membeli aku."`,
    `${char.emoji} *"${char.nama}"*: "Tch. Setidaknya kau tidak pelit soal uang."`,
    `${char.emoji} *"${char.nama}"*: "Hm. Lumayan. Tambah lagi kalau bisa."`,
    `${char.emoji} *"${char.nama}"*: "Kau memilih cara yang lebih aman. Membosankan, tapi masuk akal."`,
    `${char.emoji} *"${char.nama}"*: "Jangan kira uang membuatmu kebal dari bahaya."`,
    `${char.emoji} *"${char.nama}"*: "Aku bisa menghitung berapa banyak yang baru saja kau habiskan."`,
    `${char.emoji} *"${char.nama}"*: "Setidaknya kali ini tidak ada noda di bajuku."`,
    `${char.emoji} *"${char.nama}"*: "Baiklah. Aku terima, tapi jangan berharap gratis selamanya."`
  ]

  const reactionList = tipe === 'blood'? reactionsBlood : reactionsMoney
  const randomReaction = reactionList[Math.floor(Math.random() * reactionList.length)]
  let sudahPartner = csm.partners.find(p => p.name === char.nama)

  saveDB(wdb)

  let bayarTxt = tipe === 'blood'? `${biaya.toLocaleString()} Blood` : `Rp ${biaya.toLocaleString()}`
  let msg = header('GIFT TERKIRIM 💌') +
    ` Kamu memberikan ${bayarTxt} ke ${char.emoji} *${char.nama}*\n` +
    ` Untuk: +${jumlahLove} Poin Kenalan\n\n` +
    ` ${randomReaction}\n\n` +
    ` 💌 Poin Kenalan: ${loveNow}/${char.needLove}`

  if (!sudahPartner && loveNow >= char.needLove) {
    msg += `\n\n|🎉 *${char.nama} sekarang mau direkrut!*\n|${usedPrefix}partner recruit ${char.nama}`
  } else if (sudahPartner) {
    msg += `\n\n|*${char.nama} sudah jadi partnermu*`
  }

  await checkMakimaTrigger(m, csm, wdb) 
  return m.reply(msg + `\n|━━━━━━━━━━━`)
}

// === CHARACTER DETAIL 👥

if (action === 'char') {
  if (!csm.relations || typeof csm.relations!== 'object') csm.relations = {}

  const namaChar = args.slice(1).join(' ').trim()
  if (!namaChar) return m.reply(header('PENGGUNAAN') + `.csm char <nama karakter>\nContoh:.csm char Reze\n━━━━━━━━━━━`)

  const char = CHARACTER_LIST.find(c => c.nama.toLowerCase() === namaChar.toLowerCase())
  if (!char) return m.reply(header('KARAKTER TIDAK ADA') + `Contoh:.csm char Reze\n━━━━━━━━━━━`)

  const love = Number(csm.relations[char.nama] || 0)

  return m.reply(header(char.nama) +
    ` ${char.emoji} *${char.role}*\n\n` +
    ` 🏴 Faksi: ${char.faction}\n` +
    ` 🧬 Status: ${char.status}\n` +
    ` 📍 Lokasi: ${char.lokasi.join(', ')}\n` +
    ` 💌 Hubungan: ${love}/${char.needLove}\n` +
    ` 🎁 Bonus: ${char.bonus}\n\n` +
    `━━━━━━━━━━━`) // GA USAH SAVE
}

// === REST 🛌

if (action === 'rest') {
  const restBonus = calcBonus(csm)
  if (restBonus.noHeal) return m.reply(header('BONUS REVENGE') + `Bonus Revenge mencegah pemulihan HP.\n━━━━━━━━━━━`)
  const cd = cekCD('lastRest', 5 * 60 * 1000)
  if (cd > 0) {
    const menit = Math.ceil(cd / 60000)
    return m.reply(header('COOLDOWN') + `Tunggu ${menit} menit lagi.\n━━━━━━━━━━━`)
  }

  const heal = Math.floor(csm.maxHealth * 0.4)
  const hpSebelum = csm.health
  csm.health = Math.min(csm.maxHealth, csm.health + heal)
  const actualHeal = csm.health - hpSebelum
  csm.lastRest = Date.now()

  saveDB(wdb)

  return m.reply(header('ISTIRAHAT') +
    ` Kamu beristirahat sejenak.\n` +
    ` ❤️ +${actualHeal} HP\n` +
    ` ❤️ HP: ${csm.health}/${csm.maxHealth}\n` +
    `━━━━━━━━━━━`)
}

  // === PARTNER DATABASE 👥
  const partnerSub = (args[1] || '').toLowerCase()

  if (action === 'partner' && !partnerSub) {
    const cap = header('CSM PARTNER') +
      ` Partner adalah karakter yang dapat kamu temui, dekati, rekrut, dan bawa ke dalam tim.\n` +
      ` Mereka memberi bonus combat dan membantu saat Story, Explore, Mission, Rescue, serta encounter tertentu.\n\n` +
      ` Tutorial singkat:\n` +
      `> 1. Kunjungi lokasi lalu interaksi dengan karakter yang muncul.\n` +
      `> 2. Naikkan hubungan sampai nilai kebutuhan karakter terpenuhi.\n` +
      `> 3. Gunakan *.csm partner recruit <nomor/nama>* untuk merekrut.\n` +
      `> 4. Gunakan *.csm partner team add <nomor>* untuk mengaktifkan partner.\n` +
      `> 5. Maksimal 5 partner aktif; sisanya tetap menjadi cadangan.\n\n` +
      ` *.csm partner database* = lihat semua karakter\n` +
      ` *.csm partner list* = lihat koleksi kamu\n` +
      ` *.csm partner team* = lihat tim dan bonus aktif\n` +
      `━━━━━━━━━━━`
    const partnerPicture = pickNamedPicture(PARTNER_PICTURES)
    return sendCsmReply(`${cap}\n🖼️ ${partnerPicture.name}`, partnerPicture.picture)
  }

  if (action === 'partner' && csm.erasureProtection?.startsWith('horsemen:') && ['recruit', 'team'].includes(partnerSub)) {
    return m.reply(header('PARTNER TERKUNCI') + `Kamu tidak bisa memiliki partner saat menjadi bagian dari Four Horsemen. Kamu masih bisa memakai ${usedPrefix}csm char <nama> untuk berinteraksi.\n━━━━━━━━━━━`)
  }

  // === GACHA PARTNER, TERSEDIA DARI ENDING LOVE ===
  if (action === 'partner' && partnerSub === 'gacha') {
    const bonus = calcBonus(csm)
    if (bonus.gachaBonus <= 0) {
      return m.reply(header('GACHA PARTNER TERKUNCI') + `Fitur ini hanya terbuka dari reward ending Love.\n━━━━━━━━━━━`)
    }

    const gachaAction = args[2]?.toLowerCase()
    const gachaCost = 15000
    const gachaCooldown = 60 * 60 * 1000

    if (gachaAction === 'no' || gachaAction === 'cancel') {
      csm.partnerGachaPending = null
      saveDB(wdb)
      return m.reply(header('GACHA PARTNER DIBATALKAN') + `Tidak ada Blood yang dipotong.\n━━━━━━━━━━━`)
    }

    if (gachaAction === 'yes' || gachaAction === 'terima') {
      const pending = csm.partnerGachaPending
      if (!pending) return m.reply(header('TIDAK ADA GACHA') + `Gunakan *.csm partner gacha* terlebih dahulu.\n━━━━━━━━━━━`)
      if (Date.now() - pending.createdAt > 60000) {
        csm.partnerGachaPending = null
        saveDB(wdb)
        return m.reply(header('GACHA KEDALUWARSA') + `Permintaan gacha sudah kedaluwarsa.\n━━━━━━━━━━━`)
      }
      if (csm.blood < pending.cost) return m.reply(header('DARAH KURANG') + `Butuh ${pending.cost.toLocaleString()} Blood.\n━━━━━━━━━━━`)
      const character = CHARACTER_LIST.find(item => item.nama === pending.name)
      if (!character || csm.partners.some(partner => partner.name === character.nama)) {
        csm.partnerGachaPending = null
        saveDB(wdb)
        return m.reply(header('GACHA GAGAL') + `Karakter target sudah tidak tersedia.\n━━━━━━━━━━━`)
      }

      csm.blood -= pending.cost
      csm.partners.push({ name: character.nama, hp: 100, status: 'reserve', level: 1 })
      csm.relations[character.nama] = Math.max(Number(csm.relations[character.nama] || 0), character.needLove)
      csm.lastPartnerGacha = Date.now()
      csm.partnerGachaPending = null
      const newAchievements = checkAchievements(csm)
      newAchievements.forEach(achievement => {
        csm.blood += achievement.reward.blood || 0
        addExp(achievement.reward.exp || 0)
      })
      saveDB(wdb)
      return m.reply(header('GACHA PARTNER BERHASIL') + `${character.emoji} *${character.nama}* bergabung sebagai partner!\n🩸 -${pending.cost.toLocaleString()} Blood\n💌 Hubungan: ${character.needLove}/${character.needLove}\n👥 Status: CADANGAN\n━━━━━━━━━━━`)
    }

    if (csm.partnerGachaPending) return m.reply(header('MASIH MENUNGGU KONFIRMASI') + `Ketik *.csm partner gacha yes* atau *.csm partner gacha no*.\n━━━━━━━━━━━`)
    if (Date.now() - csm.lastPartnerGacha < gachaCooldown) {
      return m.reply(header('COOLDOWN GACHA PARTNER') + `Tunggu ${Math.ceil((gachaCooldown - (Date.now() - csm.lastPartnerGacha)) / 60000)} menit lagi.\n━━━━━━━━━━━`)
    }
    if (csm.blood < gachaCost) return m.reply(header('DARAH KURANG') + `Butuh ${gachaCost.toLocaleString()} Blood.\n━━━━━━━━━━━`)

    const available = CHARACTER_LIST.filter(character => !csm.partners.some(partner => partner.name === character.nama))
    if (!available.length) return m.reply(header('SEMUA PARTNER SUDAH DIMILIKI') + `Tidak ada karakter yang bisa digacha lagi.\n━━━━━━━━━━━`)
    const character = available[Math.floor(Math.random() * available.length)]
    csm.partnerGachaPending = { name: character.nama, cost: gachaCost, createdAt: Date.now() }
    saveDB(wdb)
    return m.reply(header('KONFIRMASI GACHA PARTNER') + `${character.emoji} Kandidat: *${character.nama}*\n🩸 Biaya: ${gachaCost.toLocaleString()} Blood\n💌 Hubungan awal: ${character.needLove}/${character.needLove}\n
Ketik *.csm partner gacha yes* untuk merekrut.\nKetik *.csm partner gacha no* untuk membatalkan.\n━━━━━━━━━━━`)
  }

  if (action === 'partner' && partnerSub === 'database'){
    let cap = header('DATABASE KARAKTER')
    CHARACTER_LIST.forEach((c,i) => {
      let owned = csm.partners.find(p => p.name === c.nama)? '✅' : '❌'
      const love = Number(csm.relations?.[c.nama] || 0)
      const level = Math.max(1, Math.floor(love / Math.max(1, c.needLove)))
      cap += `*${i+1}.* ${c.emoji} *${c.nama}* ${owned}\n Faksi: ${c.faction} | 💌 ${love}/${c.needLove} | Lv.${level}\n`
    })
    cap += `\n📌.csm partner recruit <nomor/nama>\n📌.csm partner achievement\n━━━━━━━━━━━`
    const partnerPicture = pickNamedPicture(PARTNER_PICTURES)
    return sendCsmReply(`${cap}\n🖼️ ${partnerPicture.name}`, partnerPicture.picture)
  }

  // === PARTNER RECRUIT 🤝
  if (action === 'partner' && partnerSub === 'recruit'){
    let input = args.slice(2).join(' ')
    let char = isNaN(input)? CHARACTER_LIST.find(c => c.nama.toLowerCase() === input.toLowerCase()) : CHARACTER_LIST[parseInt(input) - 1]
    if (!char) return m.reply(header('KARAKTER TIDAK ADA') + `━━━━━━━━━━━`)
    if (csm.partners.find(p => p.name === char.nama)) return m.reply(header('SUDAH REKRUT') + `${char.nama} sudah ada di list.\n━━━━━━━━━━━`)
    let love = csm.relations[char.nama] || 0
    if(love < char.needLove) return m.reply(header('DITOLAK') + `${char.emoji} "${char.nama} belum kenal kamu"\n💌 ${love}/${char.needLove}\n━━━━━━━━━━━`)

    csm.partners.push({ name: char.nama, hp: 100, status: 'reserve' })
    let newAch = checkAchievements(csm)
    if(newAch.length > 0){ // KASIH REWARD ACHIEVEMENT DULU
      newAch.forEach(a => {
        csm.blood += a.reward.blood || 0
        addExp(a.reward.exp || 0)
      })
    }
    saveDB(wdb)
    let msg = header('PARTNER BARU') + `${char.emoji} *${char.nama}* bergabung!\nHP: 100/100\nStatus: CADANGAN\nBonus: ${char.bonus}`
    if(newAch.length > 0){
      msg += `\n\n━━━━━━━━━━━\n🏆 *ACHIEVEMENT UNLOCKED!*\n`
      newAch.forEach(a => { msg += `${a.emoji} *${a.nama}*\n${a.desc}\n🩸 +${a.reward.blood?.toLocaleString() || 0} | 📈 +${a.reward.exp || 0} EXP\n` })
    }
    await checkMakimaTrigger(m, csm, wdb)
return m.reply(msg + `\n━━━━━━━━━━━`)
  }

  // === PARTNER BY NAME 👤
  if (action === 'partner' &&!['database', 'recruit', 'list', 'team', 'achievement'].includes(partnerSub)) {
    let nama = args.slice(1).join(' ')
    let char = CHARACTER_LIST.find(c => c.nama.toLowerCase() === nama.toLowerCase())
    if (!char) return m.reply(header('NAMA SALAH') + `Contoh:.csm partner Reze\n━━━━━━━━━━━`)
    if (csm.partners.find(p => p.name === char.nama)) return m.reply(header('SUDAH PARTNER') + `${char.nama} sudah di tim\n━━━━━━━━━━━`)
    let love = csm.relations[char.nama] || 0
    if(love < char.needLove) return m.reply(header('DITOLAK') + `${char.emoji} "${char.nama} belum kenal kamu"\n💌 ${love}/${char.needLove}\n━━━━━━━━━━━`)
    csm.partners.push({ name: char.nama, hp: 100, status: 'reserve' })
    let newAch = checkAchievements(csm)
    if(newAch.length > 0){
      newAch.forEach(a => {
        csm.blood += a.reward.blood || 0
        addExp(a.reward.exp || 0)
      })
    }
    saveDB(wdb)
    let msg = header('PARTNER BARU') + `${char.emoji} *${char.nama}*\n${char.role}\nBonus: ${char.bonus}\nStatus: CADANGAN`
    if(newAch.length > 0){
      msg += `\n\n━━━━━━━━━━━\n🏆 *ACHIEVEMENT UNLOCKED!*\n`
      newAch.forEach(a => { msg += `${a.emoji} *${a.nama}*\n${a.desc}\n🩸 +${a.reward.blood?.toLocaleString() || 0} | 📈 +${a.reward.exp || 0} EXP\n` })
    }
    return m.reply(msg + `\n━━━━━━━━━━━`)
  }

  // === PARTNER LIST 📋
  if (action === 'partner' && partnerSub === 'list'){
    let cap = header('PARTNER KAMU')
    if(csm.partners.length === 0) cap += `Belum ada partner\n`
    csm.partners.forEach((p, i) => {
      let ch = CHARACTER_LIST.find(c => c.nama === p.name)
      if (!ch) return
      cap += `*${i+1}.* ${ch.emoji} *${p.name}*\n`
      cap += `   Level: ${getPartnerLevel(p)}\n`
      cap += `   HP: ${p.hp}/100\n`
      cap += `   Status: ${p.status === 'active' ? 'IKUT WAR' : 'CADANGAN'}\n\n`
    })
    cap += `Slot Koleksi: ${csm.partners.length} Karakter\n━━━━━━━━━━━\n📌.csm partner team add <nomor>\n📌.csm partner team remove <nomor>\n━━━━━━━━━━━`
    const partnerPicture = pickNamedPicture(PARTNER_PICTURES)
    return sendCsmReply(`${cap}\n🖼️ ${partnerPicture.name}`, partnerPicture.picture)
  }

// === PARTNER TEAM 🛡️
if (action === 'partner' && partnerSub === 'team'){
  let sub2 = args[2]
  let nomor = parseInt(args[3]) - 1
  if(!sub2){
    let b = calcBonus(csm)
    let setBonus = calcSetBonus(csm)
    let active = csm.partners.filter(p => p.status === 'active')
    let reserve = csm.partners.filter(p => p.status === 'reserve')
    let msg = header('TIM PARTNER')

    if(active.length === 0) msg += `|Partner Aktif: -\n\n`
    else {
      msg += `|Partner Aktif [${active.length}/5]:\n`
      active.forEach((p, i) => {
        let ch = CHARACTER_LIST.find(c => c.nama === p.name)
        msg += `|${i+1}. ${ch.emoji} *${p.name}*\n`
        msg += `| Buff: ${ch.bonus}\n`
      })
      msg += `|\n`
    }

    if(reserve.length > 0){
      msg += `|Cadangan [${reserve.length}]:\n`
      reserve.forEach((p, i) => {
        let ch = CHARACTER_LIST.find(c => c.nama === p.name)
        msg += `|${active.length + i + 1}. ${ch.emoji} ${p.name}\n`
      })
      msg += `|\n`
    }

    msg += `|━━━━━━━━━━━\n|*TOTAL BUFF AKTIF:*\n`
    msg += ` ⚔️ DMG: +${b.dmg}\n`
    msg += ` 🛡️ DEF: +${b.def}\n`
    msg += ` 💥 Crit: ${b.critChance}% / +${(b.critDmg*100).toFixed(0)}%\n`
    msg += ` 💨 Evasion: ${b.evasion}%\n`
    msg += ` 🩹 Regen: +${b.regen} HP\n`
    msg += ` 📈 EXP: x${b.expMult.toFixed(2)}\n`
    msg += ` 🩸 Blood: x${b.bloodMult.toFixed(2)} +${b.stealBlood}\n`

    if(Object.keys(setBonus).length > 0){
      msg += `|\n|🔥 *SET BONUS PERMANEN:*\n`
      for(let key in setBonus) msg += `|${key}: +${setBonus[key]}\n`
    }

    msg += `|━━━━━━━━━━━\n|Gunakan:\n|.csm partner team add <nomor>\n|.csm partner team remove <nomor>\n|━━━━━━━━━━━`
    const partnerPicture = pickNamedPicture(PARTNER_PICTURES)
    return sendCsmReply(`${msg}\n🖼️ ${partnerPicture.name}`, partnerPicture.picture)
  }

  if(!csm.partners[nomor]) return m.reply(header('NOMOR SALAH') + `|Nomor ${args[3]} tidak ada di list.\n|━━━━━━━━━━━`)
  let activeCount = csm.partners.filter(p => p.status === 'active').length

  if(sub2 === 'add') {
    if(csm.partners[nomor].status === 'active') return m.reply(header('UDAH AKTIF') + `|${csm.partners[nomor].name} udah di tim.\n|━━━━━━━━━━━`)
    if(activeCount >= 5) return m.reply(header('TIM PENUH') + `|Maksimal 5 partner aktif.\n|━━━━━━━━━━━`)
    csm.partners[nomor].status = 'active'
  } else if(sub2 === 'remove') {
    if(csm.partners[nomor].status === 'reserve') return m.reply(header('UDAH CADANGAN') + `|${csm.partners[nomor].name} udah di cadangan.\n|━━━━━━━━━━━`)
    csm.partners[nomor].status = 'reserve'
  } else return m.reply(header('PERINTAH SALAH') + `|.csm partner team add <nomor>\n|.csm partner team remove <nomor>\n|━━━━━━━━━━━`)

  let newAch = checkAchievements(csm)
  if(newAch.length > 0){
    newAch.forEach(a => {
      csm.blood += a.reward.blood || 0
      addExp(a.reward.exp || 0)
    })
  }
  saveDB(wdb)

  let ch = CHARACTER_LIST.find(c => c.nama === csm.partners[nomor].name)
  let msg = header('TIM DIUPDATE') + `|${ch.emoji} *${csm.partners[nomor].name}*\n|Status: ${csm.partners[nomor].status === 'active'? 'IKUT WAR' : 'CADANGAN'}\n|Bonus: ${ch.bonus}`

  if(newAch.length > 0){
    msg += `|\n|━━━━━━━━━━━\n|🏆 *ACHIEVEMENT UNLOCKED!*\n`
    newAch.forEach(a => {
      msg += `|${a.emoji} *${a.nama}*\n|${a.desc}\n|🩸 +${a.reward.blood?.toLocaleString() || 0} | 📈 +${a.reward.exp || 0} EXP\n`
    })
  }
  return m.reply(msg + `|\n|━━━━━━━━━━━`)
}

  // === PARTNER ACHIEVEMENTS 🏆
  if (action === 'partner' && partnerSub === 'achievement'){
    if(!csm.achievements) csm.achievements = []
    let msg = header('ACHIEVEMENT PARTNER')
    let unlocked = ACHIEVEMENT_LIST.filter(a => csm.achievements.includes(a.id))
    let locked = ACHIEVEMENT_LIST.filter(a =>!csm.achievements.includes(a.id))
    if(unlocked.length > 0){ msg += `🏆 *TERBUKA [${unlocked.length}/${ACHIEVEMENT_LIST.length}]*\n`; unlocked.forEach(a => { msg += `${a.emoji} *${a.nama}*\n ${a.desc}\n` }); msg += `\n` }
    if(locked.length > 0){ msg += `🔒 *TERKUNCI*\n`; locked.forEach(a => { msg += `❌ *${a.nama}*\n ${a.desc}\n` }) }
    return m.reply(msg + `━━━━━━━━━━━`)
  }

  // === HOSPITAL 🏥
  if (action === 'hospital'){
    let cap = header('RUMAH SAKIT')
    if(!csm.hospital) csm.hospital = [] // ANTI ERROR
    if(csm.hospital.length === 0) cap += `Tidak ada partner yg sekarat\n`
    csm.hospital.forEach((p,i) => { cap += `*${i+1}.* ${p.name} | Status: Sekarat\n` })
    cap += `\n📌.csm revive <nomor> - Bayar 5000 Darah\n━━━━━━━━━━━`
    return m.reply(cap)
  }

  // === REVIVE ❤️
  if (action === 'revive'){
    if(!csm.hospital) csm.hospital = []
    let nomor = parseInt(args[1]) - 1
    if(!csm.hospital[nomor]) return m.reply(header('NOMOR SALAH') + `━━━━━━━━━━━`)
    if(csm.blood < 5000) return m.reply(header('DARAH KURANG') + `Butuh 5000 Darah\n━━━━━━━━━━━`)
    csm.blood -= 5000
    let partner = csm.hospital.splice(nomor, 1)[0]
    partner.hp = 100
    partner.status = 'reserve'
    csm.partners.push(partner)
    saveDB(wdb)
    return m.reply(header('REVIVE BERHASIL') + `Partner sudah pulih\n-5000 Darah\n━━━━━━━━━━━`)
  }

// === RAID 👹
  if (action === 'raid') {
    const sub = (args[1] || '').toLowerCase()

    if (!wdb.raid || typeof wdb.raid!== 'object') {
      wdb.raid = { boss: null, players: [], date: '', history: [], currentHP: 0, lastAttack: 0 }
    }
    const raid = wdb.raid
    if (!Array.isArray(raid.players)) raid.players = []
    if (!Array.isArray(raid.history)) raid.history = []
    if (typeof raid.currentHP!== 'number') raid.currentHP = 0

    const now = Date.now()

    if (raid.date!== today ||!raid.boss || typeof raid.boss!== 'object' || now - raid.lastAttack > 7200000) {
      const selected = pickRaidDevil()
      raid.boss = {...selected, story: [`${selected.nama} muncul dari balik kabut kota.`, `Tekanan dari Devil rank ${selected.rank} membuat tanah bergetar.`, `Para Hunter bersiap menghadapi ancaman ini.`] }
      raid.currentHP = raid.boss.hp
      raid.date = today
      raid.players = []
      raid.lastAttack = now
      saveDB(wdb)
    }

    // UDAH GANTI JADI csm
    if (!csm) return m.reply(header('BELUM DAFTAR') + `Daftar dulu dengan ${usedPrefix}csm start \n━━━━━━━━━━━`)
    if (!csm.nickname) return m.reply(header('WAJIB SET NICKNAME') + `Gunakan:\n${usedPrefix}csm nickname  <nama>\nContoh: ${usedPrefix}csm nickname  Azelve Morningstar\n━━━━━━━━━━━`)
    if (csm.raidCooldown && now < csm.raidCooldown) {
      let sisa = Math.ceil((csm.raidCooldown - now) / 60000)
      return m.reply(header('COOLDOWN') + `Kamu masih terluka parah.\nTunggu ${sisa} menit lagi.\n━━━━━━━━━━━`)
    }
    if (csm.lastRaid === today &&!['list','history'].includes(sub)) {
      return m.reply(header('SUDAH RAID') + `Kamu sudah ikut raid hari ini.\nTunggu besok jam 00.00.\n\nBoss hari ini:\n${raid.boss.emoji} *${raid.boss.nama}*\nHP: ${Number(raid.currentHP).toLocaleString()}/${Number(raid.boss.hp).toLocaleString()}\n━━━━━━━━━━━`)
    }

    if (!sub) {
      let cap = header(`RAID HARI INI: ${raid.boss.nama}`)
      cap += `${raid.boss.emoji} *${raid.boss.nama}*\nHP: ${Number(raid.currentHP).toLocaleString()}/${Number(raid.boss.hp).toLocaleString()}\n👥 ${raid.players.length}/10 Hunter bergabung\n`
      cap += `📋 *COMMAND RAID*\n${usedPrefix}csm raid  create\n${usedPrefix}csm raid  join\n${usedPrefix}csm raid  leave\n${usedPrefix}csm raid  team\n${usedPrefix}csm raid  start\n${usedPrefix}csm raid  list\n${usedPrefix}csm raid  delete\n${usedPrefix}csm raid  history\n━━━━━━━━━━━`
      return m.reply(cap)
    }

    if (sub === 'list') {
      const raidDevils = DEVIL_LIST.filter(devil => devil.tipe === 'Devil')
      let cap = header(`${raidDevils.length} DEVIL RAID`)
      raidDevils.forEach((d, i) => { cap += `${i + 1}. ${d.emoji} *${d.nama}* [${d.rank}] HP: ${Number(d.hp).toLocaleString()}\n` })
      cap += `\nBoss dipilih acak setiap hari.\n━━━━━━━━━━━`
      return m.reply(cap)
    }

    if (sub === 'history') {
      let cap = header('RAID HISTORY 30 HARI')
      if (raid.history.length === 0) cap += `Belum ada riwayat raid.\n`
      raid.history.slice(-10).reverse().forEach((h, i) => {
        cap += `\n*${i+1}. ${h.date}* | ${h.boss} | ${h.result === 'WIN'? '✅ MENANG' : '❌ KALAH'}\n`
        if (h.players && h.players.length > 0) {
          let names = h.players.map(pid => wdb.users[pid]?.rpg?.csm?.nickname || conn.getName(pid)).join(', ')
          cap += `👥 ${names}\n`
        }
      })
      return m.reply(cap + `━━━━━━━━━━━`)
    }

    if (sub === 'team') {
      let cap = header(`LOBBY RAID: ${raid.boss.nama}`)
      if (raid.players.length === 0) cap += `Belum ada Hunter di lobby.\n\n`
      else raid.players.forEach((pid, i) => {
        let nick = wdb.users[pid]?.rpg?.csm?.nickname || conn.getName(pid)
        cap += `*${i + 1}.* ${nick} ${i === 0? '[Leader]' : ''}\n`
      })
      cap += `\n👥 ${raid.players.length}/10 Hunter\n${usedPrefix}csm raid  start\n━━━━━━━━━━━`
      return m.reply(cap)
    }

    if (sub === 'create') {
      if (raid.players.length > 0 && raid.players[0]!== m.sender) {
        let nick = wdb.users[raid.players[0]]?.rpg?.csm?.nickname || conn.getName(raid.players[0])
        return m.reply(header('ADA LOBBY') + `Leader saat ini:\n${nick}\n━━━━━━━━━━━`)
      }
      raid.players = [m.sender]
      saveDB(wdb)
      return m.reply(header('LOBBY DIBUAT') + `${raid.boss.emoji} *${raid.boss.nama}*\nHP: ${Number(raid.currentHP).toLocaleString()}/${Number(raid.boss.hp).toLocaleString()}\n👥 1 Hunter siap\n${usedPrefix}csm raid  join\n${usedPrefix}csm raid  team\n${usedPrefix}csm raid  start\n━━━━━━━━━━━`)
    }

    if (sub === 'join') {
      if (raid.players.length === 0) return m.reply(header('BELUM ADA LOBBY') + `${usedPrefix}csm raid  create\n━━━━━━━━━━━`)
      if (raid.players.includes(m.sender)) return m.reply(header('SUDAH JOIN') + `Kamu sudah berada di lobby.\n━━━━━━━━━━━`)
      if (raid.players.length >= 10) return m.reply(header('FULL') + `Maksimal 10 Hunter.\n━━━━━━━━━━━`)
      let msg = header('BERGABUNG')
      if (csm.raidLoseText) { // UDAH GANTI
        const texts = [
          '⚔️ Aku tidak akan menyerah!', '🩸 Bangkit lagi!', '🔥 Kali ini pasti menang!',
          '⛓️ Darahku masih mendidih!', '🗡️ Untuk pembalasan!', '🚨 Aku masih bisa bertarung!',
          '💀 Kematian belum memanggilku.', '👁️ Aku sudah melihat pola serangannya.',
          '💥 Satu serangan lagi dan dia tumbang.', '🏥 Pulih sebentar, lalu kembali ke medan.'
        ]
        msg += `${texts[Math.floor(Math.random() * texts.length)]}\n\n`
        csm.raidLoseText = false // UDAH GANTI
      }
      msg += `Kamu ikut berburu ${raid.boss.nama}.\n👥 ${raid.players.length}/10 Hunter\n━━━━━━━━━━━`
      raid.players.push(m.sender)
      saveDB(wdb)
      return m.reply(msg)
    }

    if (sub === 'leave') {
      const idx = raid.players.indexOf(m.sender)
      if (idx === -1) return m.reply(header('KAMU BELUM JOIN') + `━━━━━━━━━━━`)
      raid.players.splice(idx, 1)
      saveDB(wdb)
      if (raid.players.length === 0) return m.reply(header('KELUAR') + `Kamu keluar dari raid.\nLobby sekarang kosong.\n━━━━━━━━━━━`)
      let nick = wdb.users[raid.players[0]]?.rpg?.csm?.nickname || conn.getName(raid.players[0])
      return m.reply(header('KELUAR') + `Kamu mundur dari perburuan.\nLeader baru: ${nick}\n━━━━━━━━━━━`)
    }

    if (sub === 'delete') {
      if (raid.players.length === 0) return m.reply(header('LOBBY KOSONG') + `Tidak ada lobby yang perlu dihapus.\n━━━━━━━━━━━`)
      if (raid.players[0]!== m.sender) return m.reply(header('BUKAN LEADER') + `Hanya leader yang bisa membubarkan lobby.\n━━━━━━━━━━━`)
      raid.players = []
      saveDB(wdb)
      return m.reply(header('LOBBY DIBUBARKAN') + `Perburuan dibatalkan.\n━━━━━━━━━━━`)
    }

    if (sub === 'start') {
      if (raid.players.length === 0) return m.reply(header('BELUM ADA LOBBY') + `${usedPrefix}csm raid  create\n━━━━━━━━━━━`)
      if (raid.players[0]!== m.sender) return m.reply(header('BUKAN LEADER') + `Hanya leader yang bisa memulai raid.\n━━━━━━━━━━━`)

      raid.players = raid.players.filter(pid => wdb.users[pid]?.rpg?.csm)
      if (raid.players.length === 0) { saveDB(wdb); return m.reply(header('PLAYER TIDAK VALID') + `Tidak ada Hunter aktif di lobby.\n━━━━━━━━━━━`) }

      const boss = raid.boss
      const playerCount = raid.players.length
      let baseWinRate = playerCount === 1? 0.40 : playerCount <= 3? 0.70 : 0.90

      let msg = header(`PERTEMPURAN BERDARAH: ${boss.nama}`)
      msg += `${boss.emoji} *${boss.nama}*\nHP: ${Number(raid.currentHP).toLocaleString()}/${Number(boss.hp).toLocaleString()}\n👥 ${playerCount} Devil Hunter\n*─── KISAH PERTEMPURAN ───*\n`
      if (Array.isArray(boss.story)) boss.story.forEach(line => { msg += `${line}\n` })
      msg += `Darah berceceran di mana-mana.\nRantai chainsaw meraung.\nJeritan bercampur ledakan.\n\n`

      const leaderData = csm // UDAH GANTI
      if (leaderData && Array.isArray(leaderData.partners) && leaderData.partners.length > 0) {
        msg += `*PARTNER TURUN TANGAN*\n`
        leaderData.partners.forEach(p => {
          if (!p ||!p.name) return
          const ch = CHARACTER_LIST.find(c => c.nama === p.name)
          const dialog = ch?.dialog?.length > 0? ch.dialog[Math.floor(Math.random() * ch.dialog.length)] : 'Aku ikut bertarung.'
          msg += `${ch?.emoji || '👤'} ${p.name}: "${dialog}"\n`
        })
        msg += `\n`
      }

      let totalDmg = 0, totalDef = 0, totalLuck = 0, totalExp = 0, totalBlood = 0
      let totalCrit = 0, totalCritDmg = 0, totalRegen = 0, totalEva = 0
      let teamRevive = false

      raid.players.forEach(pid => {
        const p = wdb.users[pid]?.rpg?.csm
        if (!p) return
        let b = calcBonus(p)
        totalDmg += b.dmg; totalDef += b.def; totalLuck += b.luck
        totalExp += b.expMult - 1; totalBlood += b.bloodMult - 1
        totalCrit += b.critChance; totalCritDmg += b.critDmg
        totalRegen += b.regen; totalEva += b.evasion
        if(b.revive) teamRevive = true
      })

      let winRate = Math.min(0.99, baseWinRate + totalLuck)
      let damage = Math.floor(boss.hp * 0.1 * playerCount) + Math.floor(totalDmg * 200) + Math.floor(Math.random() * 5000)
      if(totalCrit > 30) damage = Math.floor(damage * (1 + totalCritDmg))
      let damageReduction = Math.floor(totalDef * 2)
      const win = Math.random() < winRate

      if (win) {
        raid.currentHP = 0
        msg += `*─── DARAH MUNCRAT DI MANA-MANA ───*\nGIGITAN. IRISAN. LEDAKAN.\n${boss.nama} ROBEK MENJADI POTONGAN.\n\n`
        raid.players.forEach(pid => {
          const pData = wdb.users[pid]?.rpg?.csm
          if (!pData) return
          if (typeof pData.health!== 'number') pData.health = pData.maxHealth || 100
          if (typeof pData.maxHealth!== 'number') pData.maxHealth = 100
          if (!Array.isArray(pData.inventory)) pData.inventory = [{ nama: 'Fist', dur: 999 }]
          if (typeof pData.level!== 'number') pData.level = 1
          if (typeof pData.exp!== 'number') pData.exp = 0
          if (typeof pData.blood!== 'number') pData.blood = 0
          if (typeof pData.devilsKilled!== 'number') pData.devilsKilled = 0

          let hpLoss = Math.max(1, 40 - damageReduction - Math.floor(totalRegen))
          pData.health = Math.max(1, pData.health - hpLoss)
          if(pData.health <= 1 && teamRevive) pData.health = Math.floor(pData.maxHealth * 0.3)

          const activeWeapon = pData.inventory[0]
          if (activeWeapon && activeWeapon.nama!== 'Fist') {
            if (typeof activeWeapon.dur!== 'number') { const weaponData = WEAPON_LIST.find(w => w.nama === activeWeapon.nama); activeWeapon.dur = weaponData?.dur || 0 }
            activeWeapon.dur -= Math.max(1, 10 - Math.floor(totalEva/10))
            if (activeWeapon.dur <= 0) pData.inventory.shift()
          }
          if (pData.inventory.length === 0) pData.inventory.push({ nama: 'Fist', dur: 999 })

          const rewardBlood = (Number(boss.blood || 0) + Math.floor(Number(boss.blood || 0) / 5)) * (1 + totalBlood)
          pData.blood += Math.floor(rewardBlood)
          const expGain = Number(boss.exp || 0) * (1 + totalExp)
          pData.exp += Math.floor(expGain)

          while (pData.exp >= pData.level * 300) { pData.exp -= pData.level * 300; pData.level++; pData.maxHealth += 10; pData.health = Math.min(pData.maxHealth, pData.health + 10) }
          pData.lastRaid = today
          pData.lastRaidTime = now
          pData.devilsKilled++
          pData.raidCooldown = 0
        })
        msg += `🩸 +${Number(boss.blood).toLocaleString()} Darah /Hunter\n📈 +${Number(boss.exp).toLocaleString()} EXP /Hunter\n⚠️ -${Math.max(1, 40 - damageReduction)} HP /Hunter`
        if(totalDmg > 0 || totalDef > 0) msg += `\n✨ Bonus Team: DMG +${totalDmg} | DEF +${totalDef}`
        raid.history.push({ date: today, boss: boss.nama, result: 'WIN', players: [...raid.players] })
        raid.players = []
      } else {
        raid.currentHP = Math.max(0, raid.currentHP - damage)
        raid.lastAttack = now
        msg += `*─── KAMI DIHANCURKAN ───*\n${boss.nama} TERLALU KUAT.\nTUBUH HUNTER BERTERABARAN.\n\n`
        raid.players.forEach(pid => {
          const pData = wdb.users[pid]?.rpg?.csm
          if (!pData) return
          if (typeof pData.health!== 'number') pData.health = pData.maxHealth || 100
          if (!Array.isArray(pData.inventory)) pData.inventory = [{ nama: 'Fist', dur: 999 }]
          let hpLoss = Math.max(1, 60 - damageReduction - Math.floor(totalRegen))
          pData.health = Math.max(1, pData.health - hpLoss)
          if(pData.health <= 1 && teamRevive) pData.health = Math.floor(pData.maxHealth * 0.3)
          let destroyed = 0
          while (destroyed < 2 && pData.inventory.length > 0) {
            const item = pData.inventory[0]
            if (!item || item.nama === 'Fist') break
            pData.inventory.shift()
            destroyed++
          }
          if (pData.inventory.length === 0) pData.inventory.push({ nama: 'Fist', dur: 999 })
          pData.lastRaid = today
          pData.lastRaidTime = now
          pData.raidCooldown = now + 1200000
          pData.raidLoseText = true
        })
        msg += `❤️ -${Math.max(1, 60 - damageReduction)} HP /Hunter\n⚠️ Maksimal 2 Weapon Non-Fist Hancur /Hunter\n🩸 Kita berhasil mengurangi ${damage.toLocaleString()} HP!\n🩸 Boss sisa: ${Number(raid.currentHP).toLocaleString()} HP`
        if(totalDmg > 0 || totalDef > 0) msg += `\n✨ Bonus Team: DMG +${totalDmg} | DEF +${totalDef}`
        raid.history.push({ date: today, boss: boss.nama, result: 'LOSE', players: [...raid.players] })
        raid.players = []
      }

      if (raid.currentHP <= 0) raid.currentHP = boss.hp
      if (raid.history.length > 30) raid.history = raid.history.slice(-30)
      saveDB(wdb)
      await checkMakimaTrigger(m, csm, wdb)
      return m.reply(msg + `\n━━━━━━━━━━━`)
    }

    return m.reply(header('COMMAND RAID TIDAK DIKENAL') +
      `${usedPrefix}csm raid \n` +
      `${usedPrefix}csm raid  create\n` +
      `${usedPrefix}csm raid  join\n` +
      `${usedPrefix}csm raid  team\n` +
      `${usedPrefix}csm raid  leave\n` +
      `${usedPrefix}csm raid  start\n` +
      `${usedPrefix}csm raid  list\n` +
      `${usedPrefix}csm raid  delete\n` +
      `${usedPrefix}csm raid  history\n` +
      `━━━━━━━━━━━`)
  } // tutup if raid

  saveDB(wdb)
} // tutup handler

handler.command = ['csm', 'chainsaw']
handler.help = ['csm']
handler.tags = ['rpg']
handler.limit = true
export default handler