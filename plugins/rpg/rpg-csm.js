import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import {
  DEVIL_LIST, CHARACTER_LIST, WEAPON_LIST, ITEM_LIST, STORY_LIST,
  MAIN_LOCATION_LIST, SIDE_LOCATION_LIST, MAIN_JOB_LIST, SIDE_JOB_LIST,
  BOSS_LIST, ACHIEVEMENT_LIST, calcBonus, getTitle, bar,
  calcSetBonus, checkAchievements
} from '../../lib/rpg-libmyCSM.js'
let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply(`╭──「 ❌ ERROR 」──╮\n│ Ketik *.adventure* dulu buat daftar RPG.\n━━━━━━━━━━━`)

  let userRPG = getUserRPG(wdb, m.sender).rpg
  if (!userRPG) return m.reply(`╭──「 ❌ ERROR 」──╮\n│ Data RPG bank tidak ditemukan.\n━━━━━━━━━━━`)

if (!user.csm) user.csm = {
    nickname: '', health: 100, maxHealth: 100, level: 1, exp: 0, title: 'Applicant',
    devilContract: null, contractHistory: [], isTransform: false,
    devilsKilled: 0, blood: 0, partners: [], story: 1, location: 'Markas Public Safety', gender: 'Laki-Laki ♂️',
    weapon: {nama: 'Fist', dur: 999},
    inventory: [{nama: 'Fist', dur: 999}], 
    lastRest: 0, lastGacha: 0, lastVisit: 0, lastExplore: 0, lastMission: 0, // TAMBAH 2 INI
    encounter: null, tempMission: null, // TAMBAH tempMission
    relations: {}, pendingBlood: 0,
    lastWork: 0, pendingDuel: null,
    contractExpire: 0, contractSide: null, ending: null,
    hospital: [], job: null, lastJob: 0, lastRaid: '', endings: [],
    achievements: [], lastSeenChars: {},
    storyCooldown: {}, // TAMBAH INI BUAT REPLAY
    contractPending: null // TAMBAH INI BUAT KONTRAK
  }

  let csm = user.csm
  let today = new Date().toISOString().split('T')[0]
  let args = text.split(' ')
  let action = args[0]?.toLowerCase()

    const ALL_LOCATION_LIST = [...MAIN_LOCATION_LIST, ...SIDE_LOCATION_LIST]
  const ALL_JOB_LIST = [...MAIN_JOB_LIST, ...SIDE_JOB_LIST]

  const cekCD = (key, durasi) => {
    let last = csm[key] || 0
    let sisa = durasi - (Date.now() - last)
    return sisa > 0? Math.ceil(sisa / 1000) : 0
  }

  // INIT RAID
  global.raid_csm = global.raid_csm || {}
  let raid = global.raid_csm[m.chat]
  if (!raid || raid.date!== today) {
    const selected = BOSS_LIST[Math.floor(Math.random() * BOSS_LIST.length)]
    global.raid_csm[m.chat] = {
      date: today, boss: selected, hp: selected.hp,
      players: raid?.players || [], history: raid?.history || []
    }
    raid = global.raid_csm[m.chat]
  }

  const header = (title) => `╭──「 ⛓️ DEVIL HUNTER RPG 」──╮\n│ ${title}\n━━━━━━━━━━━\n\n`

  // CEK KONTRAK HABIS
  if (csm.contractExpire > 0 && csm.contractExpire < Date.now()) {
    csm.devilContract = null
    csm.contractExpire = 0
    m.reply(header('KONTRAK HABIS') + `Kontrak trial mu sudah selesai\n━━━━━━━━━━━`)
  }

  const addExp = (exp) => {
    csm.exp += exp
    let need = csm.level * 300
    if(csm.exp >= need){
      csm.exp -= need
      csm.level++
      csm.maxHealth += 25
      csm.health = csm.maxHealth
      csm.title = getTitle(csm.level)
      return true
    }
    return false
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

// ============================================================
// === START ================================================
// ============================================================
if (action === 'start') {
  if (!user.csm) user.csm = {
    nickname: '', health: 100, maxHealth: 100, level: 1, exp: 0, title: 'Applicant',
    devilContract: null, contractHistory: [], isTransform: false,
    devilsKilled: 0, blood: 0, partners: [], story: 1, location: 'Markas Public Safety', gender: 'Laki-Laki ♂️',
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
  cap += `👤 ${user.name}\n`
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
  return m.reply(cap)
}

// ============================================================
// === NICKNAME =============================================
// ============================================================
if (action === 'nickname') {
  csm = user.csm
  if (!csm) return m.reply(header('ERROR') + `Data tidak ditemukan\n━━━━━━━━━━━`)
  const nama = args.slice(1).join(' ').trim()
  if (!nama) return m.reply(header('PENGGUNAAN') + `.csm nickname <nama>\nContoh:.csm nickname Azelve Morningstar\n━━━━━━━━━━━`)
  if (nama.length > 20) return m.reply(header('KEPANJANGAN') + `Max 20 karakter\n━━━━━━━━━━━`)
  csm.nickname = nama
  const msgs = [
    `Mulai sekarang kami akan memanggilmu *${nama}*`,
    `Nama Hunter tercatat: *${nama}*`,
    `Baik, *${nama}*. Aku ingat itu`,
    `Selamat datang, *${nama}*`,
    `*${nama}*... nama yang bagus untuk seorang Hunter`
  ]
  const msg = msgs[Math.floor(Math.random() * msgs.length)]
  saveDB(wdb)
  return m.reply(header('NICKNAME DISET') + `Nama Hunter : *${nama}*\nNickname : *${nama.split(' ')[0]}*\n\n${msg}\n━━━━━━━━━━━`)
}

// ============================================================
// === GENDER HUNTER ========================================
// ============================================================
if (action === 'gender' || action === 'kelamin') {
  csm = user.csm
  if (!csm) return m.reply(header('ERROR') + `Data tidak ditemukan\n━━━━━━━━━━━`)
  let genderInput = (args[1] || '').toLowerCase()
  if (!['pria', 'wanita', 'cowok', 'cewek', 'laki-laki', 'perempuan', 'male', 'female'].includes(genderInput)) {
    return m.reply(
      header('PILIH GENDER HUNTER') +
      `Pilih gender karakter Chainsaw Man kamu:\n` +
      `• *.csm gender pria* / *.csm gender cowok* / *.csm gender male*\n` +
      `• *.csm gender wanita* / *.csm gender cewek* / *.csm gender female*\n\n` +
      `Gender saat ini: *${csm.gender}*\n` +
      `━━━━━━━━━━━`
    )
  }
  if (['pria', 'cowok', 'laki-laki', 'male'].includes(genderInput)) csm.gender = 'Laki-Laki ♂️'
  else csm.gender = 'Perempuan ♀️'
  saveDB(wdb)
  return m.reply(header('GENDER DISET') + `Gender kamu sekarang: *${csm.gender}*\n\nLanjut set nickname dengan:\n.csm nickname <nama>\n━━━━━━━━━━━`)
}

// ============================================================
// === VIEW =================================================
// ============================================================
if (action === 'view') {
  csm = user.csm
  if (!csm) return m.reply(header('ERROR') + `Data tidak ditemukan\n━━━━━━━━━━━`)
  const sub = (args[1] || '').toLowerCase()

  if (sub === 'backstory' || sub === 'story') {
    if (!csm.nickname) return m.reply(header('WAJIB SET NICKNAME') + `Kamu belum punya nama Hunter.\nGunakan:.csm nickname <nama>\n━━━━━━━━━━━`)

    let cap = header('BACKSTORY KAMU')
    cap += `🏷️ ${csm.title}\n`
    cap += `👤 ${csm.nickname}\n`
    cap += `⚧️ ${csm.gender}\n`
    cap += `📍 ${csm.location}\n\n`
    cap += `Kamu adalah seorang Devil Hunter pemula.\n`
    cap += `Dunia ini dipenuhi iblis dan kontrak berdarah.\n`
    cap += `Gunakan chainsaw dan darah untuk bertahan hidup.\n\n`
    cap += `Story Progress: ${csm.story}/14\n━━━━━━━━━━━`
    return m.reply(cap)
  }

  let cap = header('MENU VIEW')
  cap += `📖.csm view backstory - Lihat backstory kamu\n`
  cap += `*Fitur lain coming soon*\n━━━━━━━━━━━`
  return m.reply(cap)
}

// ============================================================
// === 2. TUTORIAL ==========================================
// ============================================================
if (action === 'tutorial'){
  let cap = header('PANDUAN PEMULA')
  cap += `*1. 🏠 DASAR*\n`
  cap += `.csm visit |.csm location\n`
  cap += `.csm mission |.csm rest\n`
  cap += `.csm fight |.csm run\n`
  cap += `.csm blood |.csm explore\n`
  cap += `.csm profile |.csm stats\n`
  cap += `.csm nickname |.csm gender\n`
  cap += `.csm view\n━━━━━━━━━━━\n\n`
  cap += `*2. 👥 PARTNER*\n`
  cap += `.csm partner database\n`
  cap += `.csm partner recruit\n`
  cap += `.csm partner list\n`
  cap += `.csm partner team\n`
  cap += `.csm partner team add |.csm partner team remove\n`
  cap += `.csm hospital\n`
  cap += `.csm revive\n━━━━━━━━━━━\n\n`
  cap += `*3. ⛓️ KONTRAK*\n`
  cap += `.csm contract\n`
  cap += `.csm contract fiend\n`
  cap += `.csm contract devil\n`
  cap += `.csm contract trial <angka>\n`
  cap += `.csm contract deal <angka>\n`
  cap += `*⚠️ Wajib.csm contract yes/no*\n━━━━━━━━━━━\n\n`
  cap += `*4. 🛒 TOKO & WEAPON*\n`
  cap += `.csm shop |.csm store |.csm toko\n`
  cap += `.csm shop weapon\n`
  cap += `.csm shop weapon buy <nomor/nama>\n`
  cap += `.csm shop weapon info <nomor/nama>\n`
  cap += `.csm shop item\n`
  cap += `.csm shop item info <nomor/nama>\n`
  cap += `.csm inv |.csm inventory\n`
  cap += `.csm equip |.csm repair <nomor/nama>\n`
  cap += `.csm sell <nomor> |.csm jual <nomor>\n━━━━━━━━━━━\n\n`
  cap += `*5. 📖 STORY*\n`
  cap += `.csm story\n`
  cap += `.csm reset\n`
  cap += `.csm storylist\n━━━━━━━━━━━\n\n`
  cap += `*6. 💼 KERJA*\n`
  cap += `.csm work\n`
  cap += `.csm job list\n`
  cap += `.csm job join\n━━━━━━━━━━━\n\n`
  cap += `*7. 👹 RAID*\n`
  cap += `.csm raid\n`
  cap += `.csm raid create\n`
  cap += `.csm raid join\n`
  cap += `.csm raid leave\n`
  cap += `.csm raid team\n`
  cap += `.csm raid start\n`
  cap += `.csm raid list\n`
  cap += `.csm raid delete\n`
  cap += `.csm raid history\n━━━━━━━━━━━`
  return m.reply(cap)
}

// ============================================================
// === MENU UTAMA ===========================================
// ============================================================
if(!action){
  csm = user.csm
  if (!csm) return m.reply(header('BELUM START') + `Gunakan.csm start untuk memulai\n━━━━━━━━━━━`)
  let bonus = calcBonus(csm)
  let cap = header('MENU UTAMA')
  cap += `🏷️ ${csm.title}\n`
  cap += `👤 ${user.name} | ${csm.gender}\n`
  cap += `📍 Location : ${csm.location}\n`
  cap += `📊 Lv.${csm.level} | 🩸 ${csm.blood.toLocaleString()} Darah\n`
  cap += `❤️ ${bar(Math.floor(csm.health/csm.maxHealth*100))} ${csm.health}/${csm.maxHealth}\n`
  cap += `💰 Rp ${userRPG.bank.toLocaleString()} Bank\n`
  cap += `⚔️ ${csm.weapon.nama} [Dur: ${csm.weapon.dur}]\n\n`
  cap += `👥 PARTNER: ${csm.partners.length}/5\n`
  cap += `📖 STORY: ${csm.story}/14\n`
  cap += `⛓️ KONTRAK: ${csm.devilContract || 'Tidak Ada'}\n`
  cap += `💼 PEKERJAAN: ${csm.job || 'Belum Kerja'}\n\n`
  cap += `📋 BANTUAN: ${usedPrefix}csm tutorial \n━━━━━━━━━━━`
  saveDB(wdb)
  return m.reply(cap)
}

  // === LOCATION ===
  if (action === 'location') {
    let cap = header('LOKASI UTAMA')
    MAIN_LOCATION_LIST.forEach((l, i) => {
      let rateColor = l.rateDevil >= 0.7 ? '🔴' : l.rateDevil >= 0.4 ? '🟡' : '🟢'
      cap += `*${i + 1}.* *${l.nama}*\n`
      cap += ` ${l.desc}\n`
      cap += ` Devil Rate: ${rateColor} ${(l.rateDevil * 100).toFixed(0)}%\n\n`
    })

    cap += `━━━━━━━━━━━\n`
    cap += header('LOKASI LAINNYA')
    SIDE_LOCATION_LIST.forEach((l, i) => {
      let rateColor = l.rateDevil >= 0.7 ? '🔴' : l.rateDevil >= 0.4 ? '🟡' : '🟢'
      cap += `*${i + MAIN_LOCATION_LIST.length + 1}.* *${l.nama}*\n`
      cap += ` ${l.desc}\n`
      cap += ` Devil Rate: ${rateColor} ${(l.rateDevil * 100).toFixed(0)}%\n\n`
    })

    cap += `📌 ${usedPrefix}csm visit <nama/nomor> [Cooldown 1 Jam]\n━━━━━━━━━━━`
    return m.reply(cap)
  }

  // === VISIT CD 1 JAM ===
  if (action === 'visit') {
    if (csm.encounter) return m.reply(header('BELUM SELESAI') + `Selesaikan encounter dulu\n━━━━━━━━━━━`)
    if (cekCD('lastVisit', 3600000) > 0) return m.reply(header('COOLDOWN') + `Tunggu ${Math.ceil(cekCD('lastVisit', 3600000) / 60)} menit\n━━━━━━━━━━━`)

    let input = args.slice(1).join(' ')
    let locIndex = isNaN(input) ? -1 : parseInt(input) - 1
    let loc = isNaN(input)
      ? ALL_LOCATION_LIST.find(l => l.nama.toLowerCase() === input.toLowerCase())
      : ALL_LOCATION_LIST[locIndex]

    if (!loc) return m.reply(header('LOKASI SALAH') + `Lihat: ${usedPrefix}csm location\n━━━━━━━━━━━`)

    csm.location = loc.nama
    csm.lastVisit = Date.now()

    let msg = header(`PERGI KE: ${loc.nama}`) + `${loc.desc}\n\n`
    let expGain = Math.floor(Math.random() * 20) + 10
    let levelUp = addExp(expGain)
    if (levelUp) msg += `🎉 LEVEL UP! Sekarang Lv.${csm.level}\n\n`

    let rand = Math.random()
    let isSide = SIDE_LOCATION_LIST.some(s => s.nama === loc.nama)

    if (rand < 0.15) {
      let weap = WEAPON_LIST[Math.floor(Math.random() * WEAPON_LIST.length)]
      csm.inventory.push({ nama: weap.nama, dur: weap.dur })
      msg += `📦 Kamu nemu *${weap.emoji} ${weap.nama}* di tanah!\n`
    } else if (rand < 0.35) {
      let darah, extraMsg = ''
      if (isSide) {
        let tier = Math.random()
        if (tier < 0.2) darah = (Math.floor(Math.random() * 20) + 5) * 100
        else if (tier < 0.8) darah = (Math.floor(Math.random() * 150) + 50) * 100
        else darah = (Math.floor(Math.random() * 800) + 200) * 100
        if (darah >= 20000) {
          let pembantaian = ['...Bau darah masih menyengat.', 'Noda darah dimana-mana.', 'Lantai lengket.', 'Tercerai berai.', 'Aura kematian masih terasa.']
          extraMsg = `\n${pembantaian[Math.floor(Math.random() * pembantaian.length)]}`
        }
      } else {
        darah = (Math.floor(Math.random() * 150) + 50) * 100
      }
      csm.blood += darah
      msg += `🩸 Kamu nemu ${darah.toLocaleString()} Darah tercecer!${extraMsg}\n`
    } else if (rand < 0.75) {
      let devilSpawn = Math.random() < loc.rateDevil
      let lastSeen = csm.lastSeenChars || {}
      let charList = CHARACTER_LIST.filter(c => c.lokasi?.includes(loc.nama))
      const CORE_CHARS = ['Denji', 'Aki Hayakawa', 'Power', 'Asa Mitaka', 'Nayuta', 'Fami', 'Makima', 'Yoru', 'Kishibe', 'Himeno', 'Kobeni Higashiyama', 'Hirofumi Yoshida', 'Beam', 'Galgali', 'Reze', 'Quanxi', 'Angel Devil', 'Pochita', 'Meowy']

      charList = charList.map(c => {
        let weight = 1
        if (CORE_CHARS.includes(c.nama)) {
          if (loc.nama.includes('Markas') && ['Makima', 'Himeno', 'Kishibe', 'Aki Hayakawa', 'Galgali', 'Kobeni Higashiyama', 'Beam'].includes(c.nama)) weight = 5
          if (loc.nama.includes('Kafe') && c.nama === 'Reze') weight = 6
          if (loc.nama.includes('Kafe') && c.nama === 'Denji') weight = 4
          if (loc.nama.includes('Apartemen Hayakawa') && ['Aki Hayakawa', 'Power', 'Denji', 'Meowy'].includes(c.nama)) weight = 6
          if (loc.nama.includes('SMA') && ['Asa Mitaka', 'Yoshida', 'Denji', 'Yoru'].includes(c.nama)) weight = 5
          if (loc.nama.includes('Gudang') && c.nama === 'Reze') weight = 5
          if ((loc.nama.includes('Neraka') || loc.nama.includes('Mindscape')) && c.nama === 'Pochita') weight = 10
          if ((loc.nama.includes('Neraka') || loc.nama.includes('Mindscape')) && c.nama === 'Makima') weight = 7
          if (loc.nama.includes('Kamar Kos Baru Denji') && ['Denji', 'Nayuta'].includes(c.nama)) weight = 7
          if (loc.nama.includes('Gereja Chainsaw Man') && c.nama === 'Fami') weight = 6
          if ((loc.nama.includes('Hotel Quanxi') || loc.nama.includes('Park')) && c.nama === 'Quanxi') weight = 5
          if (loc.nama.includes('Park') && c.nama === 'Angel Devil') weight = 4
          if (loc.nama.includes('Apartemen') && c.nama === 'Meowy') weight = 5
        }
        if (lastSeen[c.nama] && Date.now() - lastSeen[c.nama] < 3600000) weight = 0.1
        return { ...c, weight }
      }).filter(c => c.weight > 0)

      let spawned = []
      if (charList.length > 0) {
        let spawnCount = devilSpawn ? Math.min(Math.floor(Math.random() * 5) + 1, 5) : Math.min(Math.floor(Math.random() * 10) + 1, 10)
        for (let i = 0; i < spawnCount; i++) {
          let totalWeight = charList.reduce((a, b) => a + b.weight, 0)
          if (totalWeight <= 0) break
          let r = Math.random() * totalWeight
          let pick = charList.find(c => (r -= c.weight) <= 0)
          if (pick) {
            spawned.push(pick)
            charList = charList.filter(c => c.nama !== pick.nama)
          }
        }
        spawned.forEach(c => csm.lastSeenChars[c.nama] = Date.now())
      }

      let makimaEvent = loc.nama.includes('Neraka') && spawned.some(c => c.nama === 'Makima')

      if (makimaEvent) {
        let dialogMakima = [
          'Kau seharusnya tidak disini, anjingku.',
          'Tempat ini bukan untukmu.',
          'Beraninya kau menginjak Neraka tanpa seizinku?',
          'Hmph. Lagi-lagi kau.',
          'Sudah kubilang jangan ikut campur.'
        ]
        csm.encounter = { type: 'makima_neraka' }
        msg += `⛓️ *Makima* muncul di hadapanmu...\n\n`
        msg += `⛓️ *Makima*: "${dialogMakima[Math.floor(Math.random() * dialogMakima.length)]}"\n\n`
        msg += `.csm fight - Lawan\n`
      } else if (devilSpawn) {
        let devil = DEVIL_LIST[Math.floor(Math.random() * DEVIL_LIST.length)]
        csm.encounter = { type: 'devil', data: devil, helpers: spawned }
        msg += `👹 *${devil.emoji} ${devil.nama}* [${devil.rank}] muncul!\n\n`

        if (spawned.length > 0) {
          let dialogBantu = ['Aku bantu!', 'Jangan mati disini!', 'Sini aku backup!', 'Keroyok bareng!']
          msg += `${spawned[Math.floor(Math.random() * spawned.length)].emoji} *${spawned[0].nama}*: "${dialogBantu[Math.floor(Math.random() * dialogBantu.length)]}"\n\n`
          spawned.forEach((c, i) => {
            msg += `*${i + 1}.* ${c.emoji} *${c.nama}*\n`
          })
          msg += `\n`
        }
        msg += `.csm fight - Lawan\n.csm run - Kabur`
      } else {
        if (spawned.length > 0) {
          csm.encounter = { type: 'chars', data: spawned }
          msg += `👥 Ada ${spawned.length} orang di sini:\n`
          spawned.forEach((c, i) => {
            let love = csm.relations[c.nama] || 0
            msg += `*${i + 1}.* ${c.emoji} *${c.nama}* - ${c.role}\n`
            msg += ` "${c.dialog[Math.floor(Math.random() * c.dialog.length)]}"\n`
            msg += ` 💌 ${love}/${c.needLove}\n\n`
          })
          msg += `.csm interact <nomor/nama> - Ngobrol\n.csm run - Pergi`
        } else {
          msg += `Sepertinya tidak ada apa-apa disini...\n`
        }
      }
    } else {
      msg += `Tempat ini tenang. Tidak ada yg terjadi.\n`
    }

    msg += `\n📈 +${expGain} EXP`
    saveDB(wdb)
    return m.reply(msg + `\n━━━━━━━━━━━`)
  }

  // === INTERACT ===
  if (action === 'interact') {
  if (!csm.encounter || (csm.encounter.type !== 'char' && csm.encounter.type !== 'chars')) {
    return m.reply(header('TIDAK ADA') + `Tidak ada karakter di sini\n━━━━━━━━━━━`)
  }

  let charList = csm.encounter.type === 'char' ? [csm.encounter.data] : (Array.isArray(csm.encounter.data) ? csm.encounter.data : (Array.isArray(csm.encounter.list) ? csm.encounter.list : []))
  let char = null
  const input = args.slice(1).join(' ').trim()
  if (!isNaN(input) && parseInt(input) > 0) {
    char = charList[parseInt(input) - 1]
  } else if (input) {
    char = charList.find(c => c.nama.toLowerCase() === input.toLowerCase())
  } else {
    char = charList[0]
  }

  if (!char) char = charList[0]
  if (!char) return m.reply(header('TIDAK ADA') + `Karakter tidak ditemukan\n━━━━━━━━━━━`)

  if (!csm.relations[char.nama]) csm.relations[char.nama] = 0
  csm.relations[char.nama] += Math.floor(Math.random() * 8) + 5

  csm.encounter = null

  saveDB(wdb)

  return m.reply(
    header(`INTERAKSI DENGAN ${char.nama}`) +
    `${char.emoji} "${char.dialog[Math.floor(Math.random() * char.dialog.length)]}"\n\n` +
    `💌 Hubungan: ${csm.relations[char.nama]}/${char.needLove}\n` +
    `━━━━━━━━━━━`
  )
}

if (action === 'fight') {
  if(csm.encounter?.type === 'makima_neraka'){
    csm.encounter = null
    let b = calcBonus(csm)
    let menang = Math.random() < 0.5 + (b.luck/2)

    let dialogMenang = [
      'Ck... Kau beruntung kali ini.',
      'Tidak buruk. Tapi jangan besar kepala.',
      'Hmph. Aku akui kau kuat.',
      'Tch. Lain kali aku tidak akan mengalah.'
    ]
    let dialogKalah = [
      'Patuhlah. Kau hanya anjingku.',
      'Lihat? Kau lemah.',
      'Kembali ke tempatmu seharusnya.',
      'Jangan pernah melawanku lagi.'
    ]

    if(menang){
      let bonus = Math.floor(csm.blood * 0.5 * b.bloodMult) + 100000 + b.stealBlood
      csm.blood += bonus
      let msg = header('KEMENANGAN MELAWAN MAKIMA')
      msg += `⛓️ *Makima*: "${dialogMenang[Math.floor(Math.random()*dialogMenang.length)]}"\n\n`
      msg += `🩸 +${bonus.toLocaleString()} Darah [50% + 100.000 JACKPOT]`
      saveDB(wdb)
      return m.reply(msg + `\n━━━━━━━━━━━`)
    } else {
      let potongan = Math.floor(csm.blood * 0.5)
      csm.blood = Math.max(0, csm.blood - potongan)
      let msg = header('KEKALAHAN MELAWAN MAKIMA')
      msg += `⛓️ *Makima*: "${dialogKalah[Math.floor(Math.random()*dialogKalah.length)]}"\n\n`
      msg += `🩸 -${potongan.toLocaleString()} Darah [50% HILANG]`
      saveDB(wdb)
      return m.reply(msg + `\n━━━━━━━━━━━`)
    }
  }

  if(!csm.encounter || csm.encounter.type!== 'devil') {
    return m.reply(header('TIDAK ADA DEVIL') + `Tidak ada devil di sini\n━━━━━━━━━━━`)
  }

  let devil = csm.encounter.data
  let helpers = csm.encounter.helpers || []

  if (!devil) {
    csm.encounter = null
    saveDB(wdb)
    return m.reply(header('ENCOUNTER ERROR') + `Data devil tidak ditemukan.\n━━━━━━━━━━━`)
  }

  if (!Array.isArray(csm.inventory) || csm.inventory.length === 0) csm.inventory = [{nama: 'Fist', dur: 999}]
  let weapon = csm.inventory[0]
  let weaponData = WEAPON_LIST.find(w => w.nama === weapon.nama) || WEAPON_LIST[0]

  let b = calcBonus(csm)
  let activePartners = csm.partners.filter(p => p.status === 'active')

  let baseDmg = Math.floor(Math.random() * 20) + csm.level * 5 + weaponData.dmg + b.dmg
  let dmg = baseDmg

  if(Math.random() * 100 < b.speed) dmg += Math.floor(baseDmg * 0.2)

  if(csm.devilContract === 'Chainsaw Devil' || b.autoTransform) {
    dmg *= 2.5
  }

  let missChance = 10 - b.accuracy
  if(missChance < 0) missChance = 0
  if(Math.random() * 100 < missChance) {
    dmg = 0
    return m.reply(header('MELesET') + `Seranganmu meleset! Accuracy terlalu rendah.\n━━━━━━━━━━━`)
  }

  dmg += activePartners.length * 15
  dmg += helpers.length * 20

  if(b.aoe > 0) dmg += Math.floor(baseDmg * (b.aoe/100))
  if(b.burn > 0) dmg += b.burn
  if(b.fire > 0) dmg += b.fire
  if(b.water > 0) dmg += b.water
  if(b.pierce > 0) dmg += Math.floor(b.pierce * 2)
  if(b.bleed > 0) dmg += b.bleed

  let stun = false
  if(Math.random() * 100 < b.cc) stun = true

  if(Math.random() * 100 < b.critChance) dmg = Math.floor(dmg * (1.5 + b.critDmg))

  if(Math.random() * 100 < b.instantKill) dmg = devil.hp + 999

  if(b.craftWeapon > 0) dmg += b.craftWeapon * 10

  let dmgTaken = Math.floor(devil.hp / 10)
  dmgTaken = Math.max(1, dmgTaken - b.def - b.teamHp)

  if(Math.random() * 100 < b.ccResist) dmgTaken = Math.floor(dmgTaken * 0.5)

  if(Math.random() * 100 < b.evasion) dmgTaken = 0

  csm.health = Math.max(1, csm.health - dmgTaken)

  if(b.regen > 0 || b.heal > 0){
    csm.health = Math.min(100, csm.health + b.regen + b.heal)
  }

  if(devil.hp <= dmg){
    let rusak = damageWeapon()
    if(b.weaponDur > 0) weapon.dur += b.weaponDur

    csm.devilsKilled++

    let bloodGain = Math.floor((devil.blood + 100) * b.bloodMult) + b.stealBlood
    let expGain = Math.floor(devil.exp * b.expMult)
    csm.blood += bloodGain
    let leveled = addExp(expGain)
    csm.encounter = null
    saveDB(wdb)

    let msg = header('KEMENANGAN') + `${devil.emoji} *${devil.nama}* dikalahkan!\n\n`

    if(stun) msg += `💫 Devil sempat ter-stun!\n`
    if(helpers.length > 0){
      msg += `${helpers.map(h=>h.emoji+' '+h.nama).join(', ')} ikut membantu!\n\n`
    }
    if(activePartners.length > 0){
      msg += `Partner: ${activePartners.map(p=>CHARACTER_LIST.find(c=>c.nama===p.name)?.emoji+' '+p.name).join(', ')}\n\n`
    }

    msg += `🩸 +${bloodGain.toLocaleString()} Darah\n📈 +${expGain} EXP`
    if(b.findItem > 0 && Math.random() < b.findItem) msg += `\n🎁 Dapet item tambahan!`
    if(leveled) msg += `\n🎉 LEVEL UP! Lv.${csm.level}`
    if(rusak) msg += `\n\n⚠️ *${rusak}* PATAH!`
    return m.reply(msg + `\n━━━━━━━━━━━`)
  }

  if(csm.health <= 1 && b.revive){
    csm.health = 50
    let pochita = csm.partners.find(p=>p.name==='Pochita')
    if(pochita) pochita.usedRevive = true
    saveDB(wdb)
    return m.reply(header('REVIVE') + `🐕 *Pochita*: "Bangun Denji!"\nKamu dihidupkan kembali dengan 50 HP!\n━━━━━━━━━━━`)
  }

  if(csm.inventory.length > 1) {
    let idx = Math.floor(Math.random() * csm.inventory.length)
    csm.inventory.splice(idx, 1)
  }
  csm.encounter = null
  saveDB(wdb)
  return m.reply(header('KEKALAHAN') + `Kamu kalah...\n❤️ -${dmgTaken} HP\n━━━━━━━━━━━`)
}

if (action === 'run') {
  if(!csm.encounter) return m.reply(header('TIDAK ADA') + `Tidak ada yg dikejar\n━━━━━━━━━━━`)
  let b = calcBonus(csm)
  let msg = header('MELARIKAN DIRI') + `❤️ -10 HP\n`
  if(csm.encounter.type === 'devil'){
    let devil = csm.encounter.data
    if(devil?.runBlood > 0){
      let runBlood = Math.floor(devil.runBlood * b.bloodMult) + b.stealBlood
      csm.blood += runBlood
      msg += `Kamu berhasil mencuri ${runBlood.toLocaleString()} Darah dari ${devil.nama}!\n`
    }
  }
  if(b.findItem > 0 && Math.random() < b.findItem) msg += `🎁 Kamu nemu item pas kabur!\n`

  csm.health = Math.max(1, csm.health - 10)
  csm.encounter = null
  saveDB(wdb)
  return m.reply(msg + `━━━━━━━━━━━`)
}

if (action === 'shop' || action === 'store' || action === 'toko') {
  const sub = args[1]?.toLowerCase()

  // === SHOP WEAPON ===
  if (sub === 'weapon') {
    const act = args[2]?.toLowerCase()

    // BELI / BUY / BELI
    if (act === 'beli' || act === 'buy') {
      const input = args.slice(3).join(' ').trim()
      if (!input) return m.reply(header('PENGGUNAAN') + `.csm shop weapon buy <nomor/nama>\n━━━━━━━━━━━`)
      let item =!isNaN(input)? WEAPON_LIST[parseInt(input)-1] : WEAPON_LIST.find(w => w.nama.toLowerCase() === input.toLowerCase())
      if (!item) return m.reply(header('SENJATA TIDAK ADA') + `━━━━━━━━━━━`)
      if (item.harga <= 0 && item.nama!== 'Fist') return m.reply(header('GRATIS') + `━━━━━━━━━━━`)
      if (csm.inventory.some(w => w.nama === item.nama)) return m.reply(header('SUDAH PUNYA') + `Kamu sudah punya ${item.nama}\n━━━━━━━━━━━`)
      if (userRPG.bank < item.harga) return m.reply(header('SALDO KURANG') + `Butuh Rp ${item.harga.toLocaleString()}\nSaldo: Rp ${userRPG.bank.toLocaleString()}\n━━━━━━━━━━━`)
      userRPG.bank -= item.harga
      csm.inventory.push({ nama: item.nama, dur: item.dur })
      saveDB(wdb)
      return m.reply(header('PEMBELIAN BERHASIL') + `${item.emoji} *${item.nama}* [T${item.tier}]\nDMG: +${item.dmg}\nDUR: ${item.dur}\n-Rp ${item.harga.toLocaleString()}\n━━━━━━━━━━━`)
    }

    // INFO
    if (act === 'info') {
      const input = args.slice(3).join(' ').trim()
      if (!input) return m.reply(header('PENGGUNAAN') + `.csm shop weapon info <nomor/nama>\n━━━━━━━━━━━`)
      let item =!isNaN(input)? WEAPON_LIST[parseInt(input)-1] : WEAPON_LIST.find(w => w.nama.toLowerCase() === input.toLowerCase())
      if (!item) return m.reply(header('SENJATA TIDAK ADA') + `━━━━━━━━━━━`)
      return m.reply(header(item.nama) + `${item.emoji} [TIER ${item.tier}]\nJenis: ${item.jenis}\nDMG: +${item.dmg}\nDUR: ${item.dur}\nHarga: Rp ${item.harga.toLocaleString()}\nUser: ${item.user}\nMaterial: ${item.material}\n\n${item.desc}\n━━━━━━━━━━━`)
    }

    // LIST WEAPON FULL
    let cap = header('TOKO WEAPON')
    cap += `💰 Bank: Rp ${userRPG.bank.toLocaleString()}\n🩸 Darah: ${csm.blood.toLocaleString()}\n`
    cap += `📌.csm shop weapon buy <nomor/nama>\n📌.csm shop weapon info <nomor/nama>\n━━━━━━━━━━━\n\n`
    WEAPON_LIST.forEach((w, i) => {
      cap += `*${i+1}.* ${w.emoji} *${w.nama}* [T${w.tier}] - Rp ${w.harga.toLocaleString()}\n`
    })
    cap += `\n━━━━━━━━━━━`
    return m.reply(cap)
  }

  // === SHOP ITEM ===
  if (sub === 'item') {
    if (args[2]?.toLowerCase() === 'info') {
      const input = args.slice(3).join(' ').trim()
      if (!input) return m.reply(header('PENGGUNAAN') + `.csm shop item info <nomor/nama>\n━━━━━━━━━━━`)
      return m.reply(header('TOKO ITEM') + `Fitur beli item belum tersedia.\nGunakan untuk cek info saja.\n━━━━━━━━━━━`)
    }
    return m.reply(header('TOKO ITEM') + `Fitur beli item belum tersedia.\nNanti akan ada consumable, material, dll.\n━━━━━━━━━━━`)
  }

  // === DEFAULT MENU ===
  let cap = header('TOKO')
  cap += `💰 Bank: Rp ${userRPG.bank.toLocaleString()}\n🩸 Darah: ${csm.blood.toLocaleString()}\n\n`
  cap += `📌.csm shop weapon - Beli senjata\n📌.csm shop item - Lihat item\n📌.csm jual/sell <nomor> - Jual dari inventory\n━━━━━━━━━━━`
  return m.reply(cap)
}

// === CEK STATUS DARAH (Jika tanpa argumen) ===
if ((action === 'blood' || action === 'darah') && !args[1]) {
  return m.reply(header('STATUS DARAH') + `🩸 Darah Kamu: ${csm.blood.toLocaleString()}\n💰 Bank: Rp ${userRPG.bank.toLocaleString()}\n\n💡 Ketik *.csm blood <jumlah>* untuk beli Darah.\n━━━━━━━━━━━`)
}

// === JUAL / SELL / JUAL ===
if (action === 'jual' || action === 'sell') {
  if (!Array.isArray(csm.inventory)) csm.inventory = [{nama: 'Fist', dur: 999}]
  const input = args[1]
  if (!input) return m.reply(header('PENGGUNAAN') + `.csm sell <nomor>\nLihat nomor di.csm inv\n━━━━━━━━━━━`)
  const index = parseInt(input) - 1
  if (isNaN(index) || index < 0 || index >= csm.inventory.length) return m.reply(header('NOMOR SALAH') + `━━━━━━━━━━━`)
  const itemInv = csm.inventory[index]
  const dataItem = WEAPON_LIST.find(w => w.nama === itemInv.nama) || ITEM_LIST?.find(w => w.nama === itemInv.nama)
  if (!dataItem) return m.reply(header('ITEM ERROR') + `━━━━━━━━━━━`)
  if (dataItem.nama === 'Fist') return m.reply(header('TIDAK BISA DIJUAL') + `━━━━━━━━━━━`)
  if (csm.weapon && csm.weapon.nama === dataItem.nama) return m.reply(header('LEPAS DULU') + `Lepas dulu senjata ini\n━━━━━━━━━━━`)

  const hargaJual = dataItem.harga? Math.floor(dataItem.harga / 2) : Math.floor(dataItem.jual / 2)
  csm.inventory.splice(index, 1)
  csm.blood += hargaJual
  saveDB(wdb) // <-- save setelah ubah darah + inventory
  return m.reply(header('PENJUALAN BERHASIL') + `${dataItem.emoji} *${dataItem.nama}* [T${dataItem.tier}]\nDapat: +${hargaJual.toLocaleString()} Darah [50%]\n━━━━━━━━━━━`)
}

// === EQUIP ===
if (action === 'equip') {
  if (!Array.isArray(csm.inventory)) csm.inventory = [{nama: 'Fist', dur: 999}]
  const input = args.slice(1).join(' ').trim()
  if (!input) return m.reply(header('PENGGUNAAN') + `.csm equip <nomor/nama senjata>\n━━━━━━━━━━━`)
  let dataItem = null
  let invIndex = -1
  if (!isNaN(input)) {
    invIndex = parseInt(input, 10) - 1
    if (invIndex < 0 ||!csm.inventory[invIndex]) return m.reply(header('NOMOR SALAH') + `━━━━━━━━━━━`)
    dataItem = WEAPON_LIST.find(w => w.nama === csm.inventory[invIndex].nama)
  } else {
    dataItem = WEAPON_LIST.find(w => w.nama.toLowerCase() === input.toLowerCase())
    if (!dataItem) return m.reply(header('ITEM TIDAK ADA') + `━━━━━━━━━━━`)
    invIndex = csm.inventory.findIndex(w => w.nama === dataItem.nama)
  }
  if (!dataItem) return m.reply(header('DATA SENJATA RUSAK') + `━━━━━━━━━━━`)
  if (invIndex < 0) return m.reply(header('KAMU TIDAK PUNYA') + `━━━━━━━━━━━`)
  const item = csm.inventory.splice(invIndex, 1)[0]
  if (typeof item.dur!== 'number' || item.dur < 0) item.dur = dataItem.dur
  csm.inventory.unshift(item)
  csm.weapon = { nama: item.nama, dur: item.dur }
  saveDB(wdb) // <-- save setelah ubah equip
  return m.reply(header('SENJATA DIPASANG') + `${dataItem.emoji} *${dataItem.nama}* [T${dataItem.tier}]\nDMG: ${dataItem.dmg}\nDUR: ${item.dur}/${dataItem.dur}\n━━━━━━━━━━━`)
}

// === INVENTORY ===
if (action === 'inv' || action === 'inventory') {
  if (!Array.isArray(csm.inventory)) csm.inventory = [{nama: 'Fist', dur: 999}]
  let cap = header('INVENTORY KAMU')
  if (csm.inventory.length === 0) cap += `Kosong\n`
  csm.inventory.forEach((w, i) => {
    const data = WEAPON_LIST.find(x => x.nama === w.nama) || ITEM_LIST?.find(x => x.nama === w.nama)
    if (!data) { cap += `*${i + 1}.* ⚠️ *${w.nama}* [DATA TIDAK DIKENAL]\n\n`; return }
    const aktif = i === 0? ' [DIPAKAI]' : ''
    cap += `*${i + 1}.* ${data.emoji} *${w.nama}* [T${data.tier}]${aktif}\n`
    cap += ` [+${data.dmg || 0}] Dur: ${w.dur}/${data.dur}\n\n`
  })
  cap += `📌.csm equip <nomor/nama>\n📌.csm sell <nomor>\n📌.csm repair <nomor/nama>\n━━━━━━━━━━━`
  return m.reply(cap)
}

// === REPAIR ===
if (action === 'repair') {
  if (!Array.isArray(csm.inventory)) csm.inventory = [{nama: 'Fist', dur: 999}]
  if (!csm.weapon ||!csm.weapon.nama) csm.weapon = { nama: 'Fist', dur: 999 }
  const input = args[1]
  if (!input) return m.reply(header('PENGGUNAAN') + `.csm repair <nomor/nama senjata>\n━━━━━━━━━━━`)
  let itemInv = null
  let dataItem = null
  if (!isNaN(input)) {
    const index = parseInt(input) - 1
    if (index < 0 || index >= csm.inventory.length) return m.reply(header('NOMOR SALAH') + `━━━━━━━━━━━`)
    itemInv = csm.inventory[index]
    dataItem = WEAPON_LIST.find(w => w.nama === itemInv.nama)
  } else {
    dataItem = WEAPON_LIST.find(w => w.nama.toLowerCase() === input.toLowerCase())
    if (!dataItem) return m.reply(header('ITEM TIDAK ADA') + `━━━━━━━━━━━`)
    itemInv = csm.inventory.find(x => x.nama === dataItem.nama)
  }
  if (!dataItem) return m.reply(header('WEAPON ERROR') + `━━━━━━━━━━━`)
  if (dataItem.nama === 'Fist') return m.reply(header('TIDAK BISA') + `Fist tidak perlu di-repair.\n━━━━━━━━━━━`)
  if (!itemInv) return m.reply(header('WEAPON TIDAK ADA') + `━━━━━━━━━━━`)
  if (dataItem.dur === 1 || dataItem.dur === 999) return m.reply(header('TIDAK BISA') + `${dataItem.emoji} *${dataItem.nama}* tidak bisa di-repair.\n━━━━━━━━━━━`)
  if (itemInv.dur >= dataItem.dur) return m.reply(header('SUDAH FULL') + `━━━━━━━━━━━`)

  let persen = 0.3
  if (dataItem.tier === 'D') persen = 0.4
  if (dataItem.tier === 'C') persen = 0.45
  if (dataItem.tier === 'B') persen = 0.5
  if (dataItem.tier === 'A') persen = 0.6
  if (dataItem.tier === 'S') persen = 0.7
  if (dataItem.tier === 'SS') persen = 0.8
  if (dataItem.tier === 'SSS') persen = 0.9
  const biaya = Math.floor(dataItem.harga * persen)
  if (userRPG.bank < biaya) return m.reply(header('DUIT KURANG') + `Butuh Rp ${biaya.toLocaleString()}\nSaldo: Rp ${userRPG.bank.toLocaleString()}\n━━━━━━━━━━━`)

  userRPG.bank -= biaya
  itemInv.dur = dataItem.dur
  if (csm.weapon.nama === dataItem.nama) csm.weapon.dur = dataItem.dur
  saveDB(wdb) // <-- save setelah repair
  return m.reply(header('BERHASIL DI-REPAIR') + `${dataItem.emoji} *${dataItem.nama}* [T${dataItem.tier}]\nDurability: FULL\nBiaya: ${persen*100}% = Rp ${biaya.toLocaleString()}\n━━━━━━━━━━━`)
}

// ============================================================
// === CSM CONTRACT SYSTEM  =========================
// ============================================================
if (action === 'contract') {
  if (!Array.isArray(csm.contractHistory)) csm.contractHistory = [];
  if (!csm.contractPending) csm.contractPending = null;

  // 1. CEK KONTRAK HABIS SECARA OTOMATIS
  if (csm.contractExpire > 0 && Date.now() > csm.contractExpire) {
    csm.devilContract = null; csm.isTransform = false; csm.contractExpire = 0;
    saveDB(wdb);
    return m.reply(header('KONTRAK HABIS') + `Kontrak trial 2 hari telah berakhir.\nKekuatan Devil telah meninggalkan tubuhmu.\n━━━━━━━━━━━`);
  }

  const sub = args[1]?.toLowerCase();

  // 2. PANEL INFORMASI UTAMA (.csm contract)
  if (!sub) {
    let cap = header('INFORMASI KONTRAK');
    cap += `🩸 Darah: ${csm.blood.toLocaleString()}\n━━━━━━━━━━━\n`;
    if (!csm.devilContract) {
      cap += `Mode: 🧑 Manusia\nStatus: Belum Berkontrak\n`;
    } else {
      const dv = DEVIL_LIST.find(d => d.nama === csm.devilContract);
      cap += `Mode: ${csm.isTransform ? '🧬 Transform Aktif' : '🧑 Tidak Transform'}\n`;
      cap += `Status: ⛓️ ${dv?.emoji || '👹'} ${csm.devilContract} [${dv?.rank || '?'}]\n`;
      if (csm.contractExpire > 0) {
        let sisa = csm.contractExpire - Date.now(), hari = Math.floor(sisa / 86400000);
        let jam = Math.floor((sisa % 86400000) / 3600000), menit = Math.floor((sisa % 3600000) / 60000);
        cap += `⏰ Sisa: ${hari} Hari ${jam} Jam ${menit} Menit\n`;
      } else { cap += `⏰ Sisa: Permanen\n`; }
    }
    cap += `━━━━━━━━━━━\n*DAFTAR COMMAND*\n`;
    cap += `1..csm contract fiend - 10.000 Darah\n2..csm contract devil - 50.000 Darah\n`;
    cap += `3..csm contract trial <angka> - Sewa 2 Hari\n4..csm contract deal <angka> - Beli Permanen\n`;
    cap += `5..csm contract list [info <angka/nama>]\n6..csm contract database / history\n━━━━━━━━━━━`;
    return m.reply(cap);
  }

  // 3. RIWAYAT KONTRAK (.csm contract history)
  if (sub === 'history') {
    let cap = header('RIWAYAT KONTRAK');
    if (csm.contractHistory.length === 0) cap += `Belum ada riwayat kontrak.\n`;
    else csm.contractHistory.slice(-10).reverse().forEach((c, i) => { cap += `${i + 1}. ${c}\n`; });
    return m.reply(cap + `━━━━━━━━━━━`);
  }

  // 4. DATABASE UTAMA GROUP BY RANK (.csm contract database)
  if (sub === 'database') {
    let cap = header('DATABASE GLOBAL MONSTER');
    let ranks = ['E','D','C','B','A','S','SS','SSS'];
    ranks.forEach(rank => {
      let list = DEVIL_LIST.filter(d => d.rank === rank);
      if (list.length) {
        cap += `\n*${rank} RANK*\n`;
        list.forEach((d, i) => { cap += `${i + 1}. ${d.emoji} ${d.nama} (${d.tipe})\n`; });
      }
    });
    cap += `\n.csm contract trial <angka> - 2 Hari\n.csm contract deal <angka> - Permanen\n━━━━━━━━━━━`;
    return m.reply(cap);
  }

  // 5. LIST SIMPLE SEMUA MONSTER BERURUTAN (.csm contract list)
  if (sub === 'list') {
    const nextArg = args[2]?.toLowerCase();
    
    // LOGIKA SUB-SUB COMMAND: .csm contract list info <angka/nama>
    if (nextArg === 'info') {
      const searchParam = args.slice(3).join(' ');
      if (!searchParam) return m.reply(header('ARGUMEN KURANG') + `Gunakan: .csm contract list info <angka/nama>\n━━━━━━━━━━━`);
      
      let targetMonster;
      const idx = parseInt(searchParam);
      
      // Urutan sorting internal agar penomoran list info sama persis dengan menu list biasa
      const sortedDb = [...DEVIL_LIST].sort((a, b) => {
        const ranks = ['E','D','C','B','A','S','SS','SSS'];
        return ranks.indexOf(a.rank) - ranks.indexOf(b.rank);
      });

      if (!isNaN(idx) && idx >= 1 && idx <= sortedDb.length) {
        targetMonster = sortedDb[idx - 1];
      } else {
        targetMonster = DEVIL_LIST.find(d => d.nama.toLowerCase() === searchParam.toLowerCase());
      }

      if (!targetMonster) return m.reply(header('TIDAK DITEMUKAN') + `Monster atau nomor tidak terdaftar dalam database.\n━━━━━━━━━━━`);

      // Kalkulasi estimasi harga berdasarkan rank untuk panel deskripsi info
      let tPrice = 70000, dPrice = 150000;
      if (targetMonster.rank === 'S') { tPrice = 120000; dPrice = 200000; }
      else if (targetMonster.rank === 'SS') { tPrice = 200000; dPrice = 400000; }
      else if (targetMonster.rank === 'SSS') { tPrice = 500000; dPrice = 700000; }

      let cap = header(`DETAIL: ${targetMonster.nama.toUpperCase()}`);
      cap += `Tipe: ${targetMonster.tipe} (${targetMonster.emoji})\n`;
      cap += `Rank: [${targetMonster.rank}] | HP: ${targetMonster.hp} | DMG: ${targetMonster.dmg}\n`;
      cap += `Loot: +${targetMonster.exp} EXP | +${targetMonster.blood} Blood\n`;
      cap += `💰 Biaya Sewa (Trial 2 Hari): ${tPrice.toLocaleString()} Darah\n`;
      cap += `💳 Biaya Beli (Deal Permanen): ${dPrice.toLocaleString()} Darah\n`;
      cap += `━━━━━━━━━━━\n*DESKRIPSI:*\n${targetMonster.desc || '-'}\n━━━━━━━━━━━`;
      return m.reply(cap);
    }

    // TAMPILAN STANDAR: .csm contract list
    let cap = header('DAFTAR ALL MONSTER');
    let ranks = ['E','D','C','B','A','S','SS','SSS'];
    let counter = 1;
    ranks.forEach(rank => {
      let list = DEVIL_LIST.filter(d => d.rank === rank);
      list.forEach(d => {
        cap += `${counter}. ${d.emoji} ${d.nama} [${d.rank}]\n`;
        counter++;
      });
    });
    cap += `━━━━━━━━━━━\n*INFO:* Ketik _.csm contract list info <nomor/nama>_ untuk melihat statistik detail.\n━━━━━━━━━━━`;
    return m.reply(cap);
  }

  // 6. LOGIKA BELI LANGSUNG (.csm contract trial / .csm contract deal)
  if (sub === 'trial' || sub === 'deal') {
    const sortedDb = [...DEVIL_LIST].sort((a, b) => {
      const ranks = ['E','D','C','B','A','S','SS','SSS'];
      return ranks.indexOf(a.rank) - ranks.indexOf(b.rank);
    });

    const num = parseInt(args[2]);
    if (!num || num < 1 || num > sortedDb.length) {
      return m.reply(header('ANGKA SALAH') + `.csm contract list\nPilih nomor index 1-${sortedDb.length}\n━━━━━━━━━━━`);
    }
    
    const devil = sortedDb[num - 1];
    let price = 0;

    if (sub === 'trial') {
      if (devil.rank === 'S') price = 120000;
      else if (devil.rank === 'SS') price = 200000;
      else if (devil.rank === 'SSS') price = 500000;
      else price = 70000;
    }

    if (sub === 'deal') {
      if (devil.rank === 'S') price = 200000;
      else if (devil.rank === 'SS') price = 400000;
      else if (devil.rank === 'SSS') price = 700000;
      else price = 150000;
    }

    if (csm.blood < price) return m.reply(header('DARAH KURANG') + `Butuh ${price.toLocaleString()} Darah\nKamu punya: ${csm.blood.toLocaleString()}\n━━━━━━━━━━━`);

    csm.contractPending = { type: sub, devil: devil.nama, price: price, time: Date.now() };
    let durasi = sub === 'trial' ? '2 Hari' : 'Permanen';
    let cap = header(`KONFIRMASI ${sub.toUpperCase()}`);
    cap += `${devil.emoji} *${devil.nama}* [${devil.rank}]\n`;
    cap += `Harga: ${price.toLocaleString()} Darah\n`;
    cap += `Durasi: ${durasi}\n\n`;
    cap += `Yakin ingin melakukan kontrak darah langsung dengan ${devil.nama}?\n`;
    cap += `Ketik: *.csm contract yes* untuk menyetujui\n`;
    cap += `Ketik: *.csm contract no* untuk membatalkan\n━━━━━━━━━━━`;
    return m.reply(cap);
  }


  // 7. SISTEM KONFIRMASI SETUJU (.csm contract yes)
  if (sub === 'yes') {
    if (!csm.contractPending) return m.reply(header('TIDAK ADA KONTRAK') + `Tidak ada kontrak yang menunggu konfirmasi.\n━━━━━━━━━━━`);
    if (Date.now() - csm.contractPending.time > 60000) {
      csm.contractPending = null;
      return m.reply(header('KEDALUWARSA') + `Konfirmasi kontrak sudah kedaluwarsa 1 menit.\n━━━━━━━━━━━`);
    }
    
    const data = csm.contractPending;
    if (csm.blood < data.price) return m.reply(header('DARAH KURANG') + `Darahmu habis saat menunggu proses konfirmasi.\n━━━━━━━━━━━`);

    let devil;
    // JIKA TRANSAKSI ADALAH GACHA ACAK
    if (data.type === 'gacha') {
      if (data.rank === 'fiend') {
        // Hanya mengambil monster tipe Fiend ber-rank E atau D
        let pool = DEVIL_LIST.filter(d => d.tipe === 'Fiend' && ['E', 'D'].includes(d.rank));
        devil = pool[Math.floor(Math.random() * pool.length)];
      } else {
        // Gacha Devil murni dengan rate tier sesuai lore
        const rate = Math.random();
        let pool;
        if (rate < 0.50) pool = DEVIL_LIST.filter(d => d.tipe === 'Devil' && ['E', 'D'].includes(d.rank));
        else if (rate < 0.80) pool = DEVIL_LIST.filter(d => d.tipe === 'Devil' && ['C', 'B'].includes(d.rank));
        else if (rate < 0.95) pool = DEVIL_LIST.filter(d => d.tipe === 'Devil' && ['A', 'S'].includes(d.rank));
        else pool = DEVIL_LIST.filter(d => d.tipe === 'Devil' && ['SS', 'SSS'].includes(d.rank));
        
        if (!pool.length) pool = DEVIL_LIST.filter(d => d.tipe === 'Devil');
        devil = pool[Math.floor(Math.random() * pool.length)];
      }
      csm.lastGacha = Date.now();
      csm.contractExpire = 0; // Gacha selalu permanen
    } else {
      // JIKA TRANSAKSI ADALAH BELI LANGSUNG (TRIAL / DEAL)
      devil = DEVIL_LIST.find(d => d.nama === data.devil);
      if (data.type === 'trial') {
        csm.contractExpire = Date.now() + 172800000; // Aktif 2 hari
      } else {
        csm.contractExpire = 0; // Permanen
      }
    }

    csm.blood -= data.price;
    if (csm.devilContract) csm.contractHistory.push(csm.devilContract);
    if (csm.contractHistory.length > 10) csm.contractHistory.shift();
    
    csm.devilContract = devil.nama;
    csm.isTransform = true; // Auto Transform setelah berhasil kontrak
    csm.contractPending = null;
    saveDB(wdb);

    let sisa = csm.contractExpire > 0 ? `⏰ Durasi: 2 Hari\n` : `⏰ Durasi: Permanen\n`;
    let titleMsg = data.type === 'gacha' ? `GACHA ${data.rank.toUpperCase()} BARU` : `KONTRAK ${data.type.toUpperCase()} BERHASIL`;
    
    return m.reply(header(titleMsg) + `${devil.emoji} *${devil.nama}* [${devil.rank}]\n-${data.price.toLocaleString()} Darah\n${sisa}✅ Auto Transform Aktif\nKalian kini resmi terikat perjanjian darah.\n━━━━━━━━━━━`);
  }

  // 8. SISTEM KONFIRMASI BATAL (.csm contract no)
  if (sub === 'no') {
    if (!csm.contractPending) return m.reply(header('TIDAK ADA KONTRAK') + `Tidak ada kontrak yang perlu dibatalkan.\n━━━━━━━━━━━`);
    csm.contractPending = null;
    return m.reply(header('KONTRAK DIBATALKAN') + `Kamu mundur dari perjanjian darah.\n━━━━━━━━━━━`);
  }

  // 9. LOGIKA INISIASI GACHA ACAK (.csm contract fiend / .csm contract devil)
  const type = sub;
  if (!type || !['fiend', 'devil'].includes(type)) {
    return m.reply(header('PENGGUNAAN') + `.csm contract fiend - 10.000 Darah\n.csm contract devil - 50.000 Darah\n.csm contract trial <angka> - Sewa 2 Hari\n.csm contract deal <angka> - Permanen\n.csm contract list [info <angka/nama>]\n.csm contract database / history\n━━━━━━━━━━━`);
  }

  const cost = type === 'devil' ? 50000 : 10000;
  if (csm.blood < cost) return m.reply(header('DARAH KURANG') + `Butuh ${cost.toLocaleString()} Darah untuk gacha ${type}.\nKamu punya: ${csm.blood.toLocaleString()}\n━━━━━━━━━━━`);
  
  // VALIDASI COOLDOWN GACHA 5 MENIT (300.000 ms)
  const lastGachaTime = csm.lastGacha || 0;
  const cdLeft = 300000 - (Date.now() - lastGachaTime);
  if (cdLeft > 0) {
    let menit = Math.floor(cdLeft / 60000), detik = Math.ceil((cdLeft % 60000) / 1000);
    return m.reply(header('COOLDOWN GACHA') + `Tunggu ${menit} menit ${detik} detik lagi sebelum melakukan gacha kembali.\n━━━━━━━━━━━`);
  }

  let cap = header(`KONFIRMASI KONTRAK ${type.toUpperCase()}`);
  cap += `Kamu akan membuat kontrak acak dengan faksi ${type === 'devil' ? 'Devil Murni' : 'Fiend/Hybrid'}.\n`;
  cap += `Biaya Gacha: ${cost.toLocaleString()} Darah\n`;
  cap += `Durasi: Permanen\n\n`;
  cap += `Apakah kamu yakin ingin melanjutkan gacha acak ini?\n`;
  cap += `Ketik: *.csm contract yes* untuk lanjut\n`;
  cap += `Ketik: *.csm contract no* untuk batal\n━━━━━━━━━━━`;
  
  csm.contractPending = { type: 'gacha', rank: type, price: cost, time: Date.now() };
  return m.reply(cap);
}




  // ============================================================
  // === RESET ==================================================
  // ============================================================
  // RESET DIPISAH DARI ENDING.
  // SOURCE LAMA SALAH NESTING DI SINI.

  if (action === 'reset') {
    const sub = args[1]?.toLowerCase()

    if (!sub) {
      let cap = header('PERINGATAN RESET')

      cap +=
        `Kamu akan mengulang dari Arc 1.\n\n` +
        `Data yang HILANG:\n` +
        `• Weapon\n` +
        `• Darah\n` +
        `• Partner\n` +
        `• Story\n` +
        `• Kontrak\n` +
        `Data yang TETAP:\n` +
        `• Level\n` +
        `• EXP\n` +
        `• Buff Ending\n` +
        `📌.csm reset confirm - Setuju reset\n` +
        `📌.csm reset cancel - Batal\n` +
        `━━━━━━━━━━━`

      return m.reply(cap)
    }

    if (sub === 'cancel') {
      return m.reply(
        header('RESET DIBATALKAN') +
        `Data kamu aman.\n` +
        `━━━━━━━━━━━`
      )
    }

    if (sub!== 'confirm') {
      return m.reply(
        header('PERINTAH SALAH') +
        `.csm reset confirm\n` +
        `.csm reset cancel\n` +
        `━━━━━━━━━━━`
      )
    }

    if (csm.ending) {
      if (!Array.isArray(csm.endings)) {
        csm.endings = []
      }

      csm.endings.push(csm.ending)
    }

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

    csm.devilContract = null
    csm.isTransform = false
    csm.blood = 0
    csm.partners = []
    csm.hospital = []
    csm.story = 1
    csm.ending = null
    csm.encounter = null
    csm.pendingDuel = null
    csm.pendingBlood = 0
    csm.job = null
    csm.location = 'Markas Public Safety'

    saveDB(wdb)

    return m.reply(
      header('RESET BERHASIL') +
      `Story kembali ke Arc 1.\n` +
      `Weapon, Darah, Partner, Kontrak, dan progress story di-reset.\n` +
      `Level, EXP, dan buff ending tetap aktif.\n` +
      `━━━━━━━━━━━`
    )
  }

  // ============================================================
  // === ENDING =================================================
  // ============================================================

  if (action === 'ending') {
    if (csm.story < 14) {
      return m.reply(
        header('BELUM BISA') +
        `Selesaikan Story 14 dulu.\n` +
        `Progress: ${Math.min(csm.story, 14)}/14\n` +
        `━━━━━━━━━━━`
      )
    }

    if (csm.ending) {
      return m.reply(
        header('ENDING SUDAH DIPILIH') +
        `Ending kamu: *${csm.ending}*\n` +
        `Gunakan.csm reset untuk memulai ulang.\n` +
        `━━━━━━━━━━━`
      )
    }

    const pilih = args[1]

    if (!pilih) {
      let cap = header('GERBANG TAKDIR')

      cap +=
        `Langit memerah. Rantai berderak. ` +
        `Pochita di bahu kirimu, Makima di kananmu.\n` +
        `"Denji... pilih." bisik mereka.\n\n`

      cap +=
        `*1.* 🔥 FREEDOM\n` +
        `"Pochita... kita hidup bebas. Ga ada yg nyuruh2 kita lagi."\n` +
        `> Bonus: DMG +30% saat HP < 30%, Title: Chainsaw Man\n\n`

      cap +=
        `*2.* ⛓️ APOCALYPSE\n` +
        `"Dunia ini busuk. Biar aku yg bikin semua orang takut."\n` +
        `> Bonus: Summon 1 Devil/fight, Title: Horseman of Fear\n`

      cap +=
        `*3.* 🏛️ CONTROL\n` +
        `"Kalau kacau terus, ga akan ada yg selamat. Aku akan atur semuanya."\n` +
        `> Bonus: Gaji +Rp 50k/hari, Title: Public Safety Dog\n`

      cap +=
        `*4.* 🩸 SACRIFICE\n` +
        `"Aki... Power... lari. Aku yg nahan di sini."\n` +
        `> Bonus: Revive 1x gratis, Semua partner DMG +50%, -50 MaxHP\n`

      cap +=
        `*5.* 💕 LOVE\n` +
        `"Aku capek berantem... aku cuma mau pulang. ` +
        `Mau makan, mau tidur, mau dipeluk."\n` +
        `> Bonus: Full Heal tiap hari, Rate gacha partner +100%, DMG -20%\n\n`

      cap +=
        `*6.* 🗡️ REVENGE\n` +
        `"Aku akan bunuh semua yg nyakitin aku."\n` +
        `> Bonus: DMG +50% permanen, Gabisa heal, Title: Vengeance Devil\n`

      cap +=
        `*7.* 🕊️ PEACE\n` +
        `"Aku capek... aku mau damai aja."\n` +
        `> Bonus: Gabisa fight, Regen 10HP/menit, Title: Peaceful Devil\n\n`

      cap +=
        `📌 Pilih dengan hati-hati. Takdir tidak bisa diulang.\n` +
        `.csm ending <1-7>\n` +
        `━━━━━━━━━━━`

      return m.reply(cap)
    }

    let cap = ''

    if (pilih === '1') {
      csm.ending = 'Freedom'
      csm.title = 'Chainsaw Man'
      csm.blood += 50000

      cap = header('ENDING: FREEDOM')
      cap +=
        `*POCHITA* "Hehe... Denji pinter"\n\n` +
        `Rantai di dadamu patah dengan suara nyaring. ` +
        `Darah mengucur tapi kau tertawa.\n` +
        `Untuk pertama kalinya, kau bebas. ` +
        `Tidak ada kontrak, tidak ada perintah.\n` +
        `Hanya kau, Pochita, dan roti selai di meja.\n\n` +
        `✅ +50.000 Darah\n` +
        `✅ Title: Chainsaw Man\n` +
        `✅ Skill: Pochita Mode - DMG x3 saat HP < 30%\n` +
        `_“Aku mau hidup. Aku mau makan enak.”_`
    }

    else if (pilih === '2') {
      csm.ending = 'Apocalypse'
      csm.title = 'Horseman of Fear'
      csm.devilsKilled += 100

      cap = header('ENDING: APOCALYPSE')
      cap +=
        `*MAKIMA* "Anjing yang baik..."\n\n` +
        `Kau berlutut. Tapi bukan karena takut. ` +
        `Karena kau yg akan ditakuti.\n` +
        `Kota terbakar. Iblis berlutut. ` +
        `Dan di atas semua itu, kau berdiri.\n\n` +
        `✅ +100 Devils Killed\n` +
        `✅ Title: Horseman of Fear\n` +
        `✅ Skill: Summon 1 Devil kontrak saat fight\n` +
        `_“Takutlah. Itu satu-satunya cara agar kalian hidup.”_`
    }

    else if (pilih === '3') {
      csm.ending = 'Control'
      csm.title = 'Public Safety Dog'

      userRPG.bank += 1000000

      cap = header('ENDING: CONTROL')
      cap +=
        `*FAMI* "Keputusan yang bijak..."\n\n` +
        `Kau menandatangani kontrak. Dunia jadi rapi. ` +
        `Tidak ada chaos, tidak ada kebebasan.\n` +
        `Semua berjalan sesuai rencana. Termasuk kau.\n\n` +
        `✅ +Rp 1.000.000\n` +
        `✅ Title: Public Safety Dog\n` +
        `✅ Skill: Passive Income Rp 50k/hari\n` +
        `_“Keteraturan adalah belas kasihan.”_`
    }

    else if (pilih === '4') {
      csm.ending = 'Sacrifice'
      csm.title = 'Guardian Devil'

      csm.maxHealth = Math.max(1, csm.maxHealth - 50)
      csm.health = Math.min(csm.health, csm.maxHealth)
      csm.partners.forEach(p => { p.bond = 100 })

      cap = header('ENDING: SACRIFICE')
      cap +=
        `*AKI* "Denji jangan..."\n` +
        `*POWER* "BODOH! KABUR LAH!"\n\n` +
        `Kau maju. Tubuhmu hancur. Tapi kau tersenyum.\n` +
        `Darahmu melindungi mereka. Nyawamu jadi tameng terakhir.\n\n` +
        `✅ Title: Guardian Devil\n` +
        `✅ -50 MaxHP Permanen\n` +
        `✅ Skill: Revive 1x gratis, Partner DMG +50%\n` +
        `_“Maaf... aku telat traktir steak...”_`
    }

    else if (pilih === '5') {
      csm.ending = 'Love'
      csm.title = 'Beloved Devil'
      csm.blood = 0

      if (csm.partners.length > 0) {
        csm.partners[0].isLover = true
      }

      cap = header('ENDING: LOVE')
      cap +=
        `*???* "Denji... pulang yuk"\n\n` +
        `Kau melempar chainsaw mu. ` +
        `Suaranya memantul lalu hening.\n` +
        `Tidak ada lagi darah. Tidak ada lagi neraka.\n` +
        `Hanya ada dapur kecil, 2 piring, dan seseorang yg menunggu.\n\n` +
        `✅ Title: Beloved Devil\n` +
        `✅ Skill: Full Heal tiap hari\n` +
        `✅ Skill: Rate gacha partner +100%\n` +
        `❌ Kekurangan: DMG -20%\n` +
        `_“Aku cuma mau dicintai. Itu saja.”_`
    }

    else if (pilih === '6') {
      csm.ending = 'Revenge'
      csm.title = 'Vengeance Devil'
      csm.blood += 100000
      csm.maxHealth += 50

      cap = header('ENDING: REVENGE')
      cap +=
        `*POCHITA* "Denji... matamu merah"\n\n` +
        `Nama mereka kau ukir di rantai. ` +
        `Satu persatu akan mati.\n` +
        `Rasa sakit? Itu bahan bakar. Darah? Itu minuman.\n\n` +
        `✅ +100.000 Darah\n` +
        `✅ +50 MaxHP\n` +
        `✅ Title: Vengeance Devil\n` +
        `✅ Skill: DMG +50% Permanen\n` +
        `❌ Kutukan: Gabisa Rest/Heal sama sekali\n` +
        `_“Aku akan membunuh kalian semua.”_`
    }

    else if (pilih === '7') {
      csm.ending = 'Peace'
      csm.title = 'Peaceful Devil'
      csm.blood = 0
      csm.devilContract = null
      csm.contractSide = null
      csm.isTransform = false

      cap = header('ENDING: PEACE')
      cap +=
        `*POCHITA* "..."\n\n` +
        `Kau mengubur chainsaw mu di tanah.\n` +
        `Tidak ada lagi pertarungan. Tidak ada lagi darah.\n` +
        `Hanya ladang kecil, matahari, dan angin.\n` +
        `Akhirnya... kau menemukan tenang.\n\n` +
        `✅ Title: Peaceful Devil\n` +
        `✅ Skill: Regen 10HP tiap menit\n` +
        `❌ Kutukan: Gabisa Fight/Duel selamanya\n` +
        `_“Aku sudah cukup bertarung.”_`
    }

    else {
      return m.reply(
        header('PILIHAN SALAH') +
        `Pilih ending 1 sampai 7.\n` +
        `.csm ending 1\n` +
        `━━━━━━━━━━━`
      )
    }

    saveDB(wdb)
    return m.reply(cap + `\n━━━━━━━━━━━`)
  }

  // ============================================================
  // === CONVERT DARAH ==========================================
  // ============================================================

  if (action === 'blood') {
    if (args[1]?.toLowerCase() === 'deal') {
      if (!csm.pendingBlood || csm.pendingBlood <= 0) {
        return m.reply(
          header('TIDAK ADA') +
          `Gunakan.csm blood <jumlah> dulu.\n` +
          `━━━━━━━━━━━`
        )
      }

      const harga = csm.pendingBlood * 1500

      if (userRPG.bank < harga) {
        return m.reply(
          header('SALDO KURANG') +
          `Butuh Rp ${harga.toLocaleString()}\n` +
          `Saldo: Rp ${userRPG.bank.toLocaleString()}\n` +
          `━━━━━━━━━━━`
        )
      }

      userRPG.bank -= harga
      const dapat = csm.pendingBlood
      csm.blood += dapat
      csm.pendingBlood = 0
      saveDB(wdb)

      return m.reply(
        header('SACRIFICE BERHASIL') +
        `Mengorbankan Rp ${harga.toLocaleString()}\n` +
        `🩸 +${dapat} Darah\n` +
        `━━━━━━━━━━━`
      )
    }

    if (args[1]?.toLowerCase() === 'cancel') {
      csm.pendingBlood = 0
      saveDB(wdb)
      return m.reply(header('DIBATALKAN') + `━━━━━━━━━━━`)
    }

    const money = parseInt(args[1], 10)
    if (!money || money < 1500) {
      return m.reply(
        header('JUMLAH SALAH') +
        `Contoh:.csm blood 15000\n` +
        `Rate: Rp 1.500 = 1 Darah\n` +
        `━━━━━━━━━━━`
      )
    }

    const dapat = Math.floor(money / 1500)
    csm.pendingBlood = dapat
    saveDB(wdb)

    return m.reply(
      header('KONFIRMASI SACRIFICE') +
      `Tukar Rp ${money.toLocaleString()} Bank → ${dapat} Darah\n` +
      `Rate: Rp 1.500 = 1 Darah\n\n` +
      `Ketik.csm blood deal untuk konfirmasi.\n` +
      `Ketik.csm blood cancel untuk batal.\n` +
      `━━━━━━━━━━━`
    )
  }
  
  // ============================================================
// === STORY ==================================================
// ============================================================

if (action === 'story') {
  if (!csm.storyCooldown) csm.storyCooldown = {}
  const now = Date.now()

  // === MODE REPLAY:.csm story replay 3 ===
  if (args[1]?.toLowerCase() === 'replay' || args[2]?.toLowerCase() === 'replay') {
    const targetNo = parseInt(args[1]?.toLowerCase() === 'replay' ? args[2] : args[3])
    // targetNo already parsed
    if (!targetNo || isNaN(targetNo)) return m.reply(header('FORMAT SALAH') + `Contoh: *${usedPrefix}csm story replay 3*\n━━━━━━━━━━━`)
    if (targetNo < 1 || targetNo >= csm.story) return m.reply(header('GAGAL') + `Arc ${targetNo} belum terbuka.\nArc terjauh kamu: Arc ${csm.story}\n━━━━━━━━━━━`)

    const lastUsed = csm.storyCooldown[targetNo] || 0
    const cd = 60 * 1000
    if (now - lastUsed < cd) {
      const sisa = Math.ceil((cd - (now - lastUsed)) / 1000)
      return m.reply(header('COOLDOWN') + `Arc ${targetNo} masih cooldown.\nTunggu *${sisa} detik* lagi.\n━━━━━━━━━━━`)
    }

    const story = STORY_LIST.find(s => s.no === targetNo)
    const reqLevel = story.no * 5
    if (csm.level < reqLevel) return m.reply(header('LEVEL KURANG') + `Arc ini butuh minimal *Lv.${reqLevel}*\nLevel kamu: *Lv.${csm.level}*\n━━━━━━━━━━━`)
    if (csm.health < 50) return m.reply(header('HP KURANG') + `Butuh minimal *50 HP*\nHP kamu: *${csm.health}*\n━━━━━━━━━━━`)

    csm.health -= 20
    const winRate = Math.min(0.95, 0.2 + csm.level * 0.015 + csm.partners.filter(p=>p.status==='active').length * 0.08)
    const win = Math.random() < winRate

    const devil = DEVIL_LIST.find(d => d.nama === story.devil)
    const devilName = devil?.nama || story.devil
    const devilEmoji = devil?.emoji || '👹'

    const devilDialog = {
      'Zombie Devil': { win: ['Graaah... otak...', 'Aku... lapar... mati...'], lose: ['Gigit... makan kamu...', 'Join kami... jadi zombie...'] },
      'Bat Devil & Leech Devil': { win: ['Meowy... aku gagal...', 'Darahmu... enak...'], lose: ['Serahkan jantungmu!', 'Kau bukan tandingan kami!'] },
      'Eternity Devil': { win: ['Tolong... hentikan... 3 hari sudah...', 'Aku menyerah... keluarin aku...'], lose: ['Terjebak selamanya disini...', 'Waktumu akan habis...'] },
      'Katana Man & Akane Sawatari': { win: ['Sial... Yakuza payah...', 'Ular... gagal...'], lose: ['Potong dia!', 'Kontrak Ular! Habisi!'] },
      'Bomb Devil (Reze)': { win: ['Denji... maaf... aku bohong...', 'Meledak... bersamaku...'], lose: ['BOOM! Rasakan ini!', 'Kau tak akan menang!'] },
      'Quanxi & Santa Claus': { win: ['Monster... semua monster...', 'Boneka... hancur...'], lose: ['Tembak dia!', 'Untuk jantung Chainsaw Man!'] },
      'Gun Devil': { win: ['*Bunyi tembakan jauh*... sial...', 'Satu tahun sia-sia...'], lose: ['DOR! DOR! DOR!', 'Jutaan nyawa untuk 1 tembakan!'] },
      'Control Devil (Makima)': { win: ['Anjing... beraninya...', 'Pochita... kenapa...', 'Kau... memakanku...'], lose: ['Tunduk. Sekarang.', 'Kau milikku. Anjing yang baik.', 'Diam.'] },
      'Justice Devil': { win: ['Keadilan... gagal...', 'Ini tidak adil!'], lose: ['Hukum akan menghukummu!', 'Bersalah!'] },
      'Falling Devil': { win: ['Trauma... tidak cukup...', 'Jatuh... jatuh...'], lose: ['Rasakan keputusasaan!', 'Terbanglah ke langit!'] },
      'Fire Devil': { win: ['Gereja... gagal...', 'Terbakar... semua...'], lose: ['Bakar dia!', 'Untuk Chainsaw Man!'] },
      'Aging Devil': { win: ['Waktu... habis...', 'Tua... rapuh...'], lose: ['Menua... membusuk...', 'Kau tak bisa lari dari waktu.'] },
      'default': { win: ['Aku kalah...', 'Sialan...'], lose: ['Mati kau!', 'Lemah!'] }
    }

    const quotes = devilDialog[devilName] || devilDialog['default']
    const devilQuote = win? quotes.win[Math.floor(Math.random()*quotes.win.length)] : quotes.lose[Math.floor(Math.random()*quotes.lose.length)]

    let efek = ''
    if (devilName === 'Control Devil (Makima)') {
      efek = win
      ? '⛓️⛓️⛓️ *TRENGGGG!!!* ⛓️⛓️⛓️\nTanah Neraka bergetar... Rantai menembus tubuhnya...\n\n'
        : '⛓️⛓️⛓️ *DUARR!!!* ⛓️⛓️⛓️\nTekanan mengerikan! Lututmu melemah di hadapan Control Devil...\n\n'
    }

    if (win) {
      const expBase = 500 + (story.no * 100)
      const expReward = Math.floor(expBase / 4)
      csm.storyCooldown[targetNo] = now
      const leveled = addExp(expReward)
      saveDB(wdb)

      let msg = header(`📖 ${story.nama}`) +
        `✅ KEMENANGAN\n` +
        `🔁 MODE REPLAY | CD: 60s\n` +
        `${efek}` +
        `${story.desc}\n\n` +
        `${devilEmoji} *${devilName}*: "${devilQuote}"\n\n` +
        `🩸 +0 Darah\n` +
        `📈 +${expReward} EXP\n`

      if (leveled) msg += `🎉 LEVEL UP! Lv.${csm.level}\n`
      msg += `━━━━━━━━━━━`
      return m.reply(msg)
    }

    csm.storyCooldown[targetNo] = now
    csm.health = Math.max(1, csm.health - 30)
    saveDB(wdb)
    return m.reply(header('GAGAL') + `${efek}Kamu kalah melawan ${devilName}.\n${devilEmoji} *${devilName}*: "${devilQuote}"\n\n❤️ -50 HP total\n━━━━━━━━━━━`)
  }

  // === MODE STORY BARU:.csm story ===
  const story = STORY_LIST.find(s => s.no === csm.story)
  if (!story) return m.reply(header('TAMAT') + `Selamat! Kamu sudah menyelesaikan semua Arc Chainsaw Man.\n━━━━━━━━━━━`)

  const reqLevel = story.no * 5
  if (csm.level < reqLevel) return m.reply(header('LEVEL KURANG') + `Arc ini butuh minimal *Lv.${reqLevel}*\nLevel kamu: *Lv.${csm.level}*\n━━━━━━━━━━━`)
  if (csm.health < 50) return m.reply(header('HP KURANG') + `Butuh minimal *50 HP*\nHP kamu: *${csm.health}*\n━━━━━━━━━━━`)

  csm.health -= 20
  const winRate = Math.min(0.95, 0.2 + csm.level * 0.015 + csm.partners.filter(p=>p.status==='active').length * 0.08)
  const win = Math.random() < winRate

  const devil = DEVIL_LIST.find(d => d.nama === story.devil)
  const devilName = devil?.nama || story.devil
  const devilEmoji = devil?.emoji || '👹'

  const devilDialog = {
    'Zombie Devil': { win: ['Graaah... otak...', 'Aku... lapar... mati...'], lose: ['Gigit... makan kamu...', 'Join kami... jadi zombie...'] },
    'Bat Devil & Leech Devil': { win: ['Meowy... aku gagal...', 'Darahmu... enak...'], lose: ['Serahkan jantungmu!', 'Kau bukan tandingan kami!'] },
    'Eternity Devil': { win: ['Tolong... hentikan... 5 hari sudah...', 'Aku menyerah... keluarin aku...'], lose: ['Terjebak selamanya disini...', 'Waktumu akan habis...'] },
    'Katana Man & Akane Sawatari': { win: ['Sial... Yakuza payah...', 'Ular... gagal...'], lose: ['Potong dia!', 'Kontrak Ular! Habisi!'] },
    'Bomb Devil (Reze)': { win: ['Denji... maaf... aku bohong...', 'Meledak... bersamaku...'], lose: ['BOOM! Rasakan ini!', 'Kau tak akan menang!'] },
    'Quanxi & Santa Claus': { win: ['Monster... semua monster...', 'Boneka... hancur...'], lose: ['Tembak dia!', 'Untuk jantung Chainsaw Man!'] },
    'Gun Devil': { win: ['*Bunyi tembakan jauh*... sial...', 'Satu tahun sia-sia...'], lose: ['DOR! DOR! DOR!', 'Jutaan nyawa untuk 1 tembakan!'] },
    'Control Devil (Makima)': { win: ['Anjing... beraninya...', 'Pochita... kenapa...', 'Kau... memakanku...'], lose: ['Tunduk. Sekarang.', 'Kau milikku. Anjing yang baik.', 'Diam.'] },
    'Justice Devil': { win: ['Keadilan... gagal...', 'Ini tidak adil!'], lose: ['Hukum akan menghukummu!', 'Bersalah!'] },
    'Falling Devil': { win: ['Trauma... tidak cukup...', 'Jatuh... jatuh...'], lose: ['Rasakan keputusasaan!', 'Terbanglah ke langit!'] },
    'Fire Devil': { win: ['Gereja... gagal...', 'Terbakar... semua...'], lose: ['Bakar dia!', 'Untuk Chainsaw Man!'] },
    'Aging Devil': { win: ['Waktu... habis...', 'Tua... rapuh...'], lose: ['Menua... membusuk...', 'Kau tak bisa lari dari waktu.'] },
    'default': { win: ['Aku kalah...', 'Sialan...'], lose: ['Mati kau!', 'Lemah!'] }
  }

  const quotes = devilDialog[devilName] || devilDialog['default']
  const devilQuote = win? quotes.win[Math.floor(Math.random()*quotes.win.length)] : quotes.lose[Math.floor(Math.random()*quotes.lose.length)]

  let efek = ''
  if (devilName === 'Control Devil (Makima)') {
    efek = win
    ? '⛓️⛓️⛓️ *TRENGG!!!* ⛓️⛓️⛓️\nTanah Neraka bergetar... Rantai menembus tubuhnya...\n\n'
      : '⛓️⛓️⛓️ *DUARR!!!* ⛓️⛓️⛓️\nTekanan mengerikan! Lututmu melemah di hadapan Control Devil...\n\n'
  }

  if (win) {
    csm.story++
    const bloodReward = story.reward * 5
    csm.blood += bloodReward
    const expReward = 500 + (story.no * 100)
    const leveled = addExp(expReward)
    saveDB(wdb)

    let msg = header(`📖 ${story.nama}`) +
      `✅ KEMENANGAN\n` +
      `${efek}` +
      `${story.desc}\n\n` +
      `${devilEmoji} *${devilName}*: "${devilQuote}"\n\n` +
      `🩸 +${bloodReward.toLocaleString()} Darah\n` +
      `📈 +${expReward} EXP\n`

    if (leveled) msg += `🎉 LEVEL UP! Lv.${csm.level}\n`
    msg += `➡️ Arc Berikutnya Terbuka\n━━━━━━━━━━━`
    return m.reply(msg)
  }

  csm.health = Math.max(1, csm.health - 30)
  saveDB(wdb)
  return m.reply(
    header('GAGAL') +
    `${efek}` +
    `Kamu kalah melawan ${devilName}.\n` +
    `${devilEmoji} *${devilName}*: "${devilQuote}"\n\n` +
    `❤️ -50 HP total\n` +
    `Naikkan level ke Lv.${reqLevel} dan rekrut partner dulu!\n` +
    `━━━━━━━━━━━`
  )
}

if (action === 'storylist' || (action === 'story' && (args[1]?.toLowerCase() === 'list' || args[2]?.toLowerCase() === 'list'))) {
  const now = Date.now()
  let list = `╭──「 📖 DAFTAR ARC 」──╮\nArc kamu: *Arc ${csm.story}*\nReplay: *.csm story replay [angka]*\n━━━━━━━━━━━\n\n`
  STORY_LIST.forEach(s => {
    const status = s.no < csm.story? '✅' : s.no === csm.story? '▶️' : '🔒'
    const reqLevel = s.no * 5
    const expBase = 500 + (s.no * 100)
    const expReplay = Math.floor(expBase / 4)
    const lastUsed = csm.storyCooldown?.[s.no] || 0
    const cdSisa = Math.ceil((60000 - (now - lastUsed)) / 1000)
    const cdText = (s.no < csm.story && cdSisa > 0)? ` | ⏳${cdSisa}d` : ''
    list += `${status} *${s.no}. ${s.nama}*${cdText}\n ${s.devil} | Lv.${reqLevel}\n Replay: 📈${expReplay} EXP | 🩸0\n`
  })
  return m.reply(list + `━━━━━━━━━━━\n*Note: Replay = 1/4 EXP, CD 60s*`)
}

// === EXPLORE 1 JAM ===
  if (action === 'explore') {
    if(csm.encounter) return m.reply(header('BELUM SELESAI') + `Selesaikan encounter dulu\n━━━━━━━━━━━`)
    if(cekCD('lastExplore', 3600000) > 0) return m.reply(header('COOLDOWN') + `Tunggu ${Math.ceil(cekCD('lastExplore', 3600000)/60)} menit\n━━━━━━━━━━━`)

    csm.lastExplore = Date.now()
    let bonus = calcBonus(csm)
    let msg = header(`EXPLORE`)
    let itemDropped = false

    // 20 CERITA EXPLORE RANDOM
    const explore_story = [
      `Jalanan sepi. Hanya ada poster "Orang Hilang" yang ketiup angin.`,
      `Lembur lagi. Pas keluar kantor, lampu jalan setengahnya mati.`,
      `Kereta terakhir udah lewat. Mau ga mau jalan kaki lewat gang.`,
      `Di konbini, TV muter berita korban iblis. Kasirnya diem aja.`,
      `Hujan. Di bawah jembatan ada bercak merah yang belum kering.`,
      `Anjing liar ngikutin dari belakang, terus kabur pas liat ke atas gedung.`,
      `Sirine ambulans lewat. Petugas Publik lari bawa senjata.`,
      `Kopi kaleng di vending machine rasanya aneh hari ini.`,
      `Lift kantor nyangkut 5 menit. Pas kebuka, koridornya kosong.`,
      `Nemu dompet di bangku taman. Isinya cuma foto yang disobek.`,
      `Sekolah di seberang gelap. Padahal jam 8 malem masih ada suara kursi.`,
      `Papan iklan kedip-kedip. Wajah di iklannya... senyumnya salah.`,
      `Lewat TKP lama. Pita polisinya udah pudar tapi baunya masih ada.`,
      `Abang takoyaki bilang "tutup cepet" karena ada keributan di blok sebelah.`,
      `Langkah kaki di belakang. Noleh, cuma ada kucing hitam.`,
      `Macet. Mobil depan ngeliatin spion terus padahal kosong.`,
      `Tagihan numpuk. Di amplop terakhir ada bekas telapak tangan kecil.`,
      `Stasiun kosong. Papan jadwal nampilin kota yang ga ada di peta.`,
      `Satpam bilang jam pulang udah lewat 2 jam. Padahal baru jam 6.`,
      `Gagak pada nongkrong di kabel. Semuanya ngadep ke arah yang sama.`
    ]
    msg += `${explore_story[Math.floor(Math.random()*explore_story.length)]}\n\n`

    let rand = Math.random()

    const itemComments = [
      `Laporan ke HQ dulu.`,
      `Jual aja lah ke vendor.`,
      `Kupakai buat nanti.`,
      `Masukin inventory dulu.`,
      `Lumayan buat tambah-tambah.`
    ]

    // 1. DROP ITEM 25% + FindItem + Luck. LOW TIER DIBANYAKIN
    let itemRate = 0.25 + bonus.findItem + bonus.luck
    if(rand < itemRate &&!itemDropped){
      itemDropped = true
      let tierRoll = Math.random() - bonus.luck * 2

      let pool
      if(tierRoll < 0.0001) pool = ITEM_LIST.filter(w => w.tier === 'SSS')
      else if(tierRoll < 0.0005) pool = ITEM_LIST.filter(w => w.tier === 'SS')
      else if(tierRoll < 0.002) pool = ITEM_LIST.filter(w => w.tier === 'S')
      else if(tierRoll < 0.01) pool = ITEM_LIST.filter(w => w.tier === 'A')
      else if(tierRoll < 0.05) pool = ITEM_LIST.filter(w => w.tier === 'B')
      else if(tierRoll < 0.25) pool = ITEM_LIST.filter(w => w.tier === 'C')
      else if(tierRoll < 0.65) pool = ITEM_LIST.filter(w => w.tier === 'D')
      else pool = ITEM_LIST.filter(w => w.tier === 'E')

      if(pool.length === 0) pool = ITEM_LIST.filter(w => w.tier === 'E')
      let item = pool[Math.floor(Math.random()*pool.length)]
      csm.inventory.push({nama: item.nama, jml: 1})

      let rarity = item.tier === 'SSS'? '🌈' : item.tier === 'SS'? '✨' : item.tier === 'S'? '👑' : ''
      msg += `📦 ${rarity} Kamu nemu *${item.emoji} ${item.nama}* [TIER ${item.tier}]!\n`
      msg += `💬 ${itemComments[Math.floor(Math.random()*itemComments.length)]}\n`
    }
    // 2. DROP DARAH 8% SAJA
    else if(rand < 0.33 &&!itemDropped){
      itemDropped = true
      let darah = (Math.floor(Math.random()*80) + 20) * 100
      darah = Math.floor(darah * bonus.bloodMult + bonus.money)
      csm.blood += darah
      msg += `🩸 Kamu nemu ${darah.toLocaleString()} Darah tercecer!\n`
    }
    // 3. ENCOUNTER 30%
    else if(rand < 0.63){
      let devilChance = 0.25
      let devilSpawn = Math.random() < devilChance - bonus.info/100
      let lastSeen = csm.lastSeenChars || {}
      let charList = [...CHARACTER_LIST]

      charList = charList.map(c => {
        let weight = 2 + bonus.luck
        const CORE_CHARS = ['Denji', 'Aki Hayakawa', 'Power', 'Asa Mitaka', 'Nayuta', 'Fami', 'Makima', 'Yoru', 'Kishibe', 'Himeno', 'Kobeni Higashiyama', 'Hirofumi Yoshida', 'Beam', 'Galgali', 'Reze', 'Quanxi', 'Angel Devil', 'Pochita', 'Meowy']
        if(CORE_CHARS.includes(c.nama)) weight += 3 + bonus.political/10
        if(lastSeen[c.nama] && Date.now() - lastSeen[c.nama] < 3600000) weight = 0.1
        return {...c, weight}
      }).filter(c => c.weight > 0)

      let spawned = []
      if(charList.length > 0){
        let spawnCount = devilSpawn? Math.min(Math.floor(Math.random()*3)+1 + bonus.speed/20, 3) : Math.min(Math.floor(Math.random()*5)+2 + bonus.speed/20, 7)
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
        spawned.forEach(c => {
          if(!csm.lastSeenChars) csm.lastSeenChars = {}
          csm.lastSeenChars[c.nama] = Date.now()
        })
      }

      let makimaEvent = spawned.some(c => c.nama === 'Makima') && Math.random() < 0.01
      if(makimaEvent){
        csm.encounter = {type: 'makima_neraka'}
        msg += `⛓️ *Makima* muncul...\n\n.csm fight - Lawan\n`
        saveDB(wdb)
        return m.reply(msg + `\n━━━━━━━━━━━`)
      }

      if(devilSpawn){
        let devil = DEVIL_LIST[Math.floor(Math.random()*DEVIL_LIST.length)]
        csm.encounter = {type: 'devil', data: devil, helpers: spawned}
        msg += `👹 *${devil.emoji} ${devil.nama}* [${devil.rank}] muncul!\n\n`
        if(spawned.length > 0){
          msg += `${spawned[0].emoji} *${spawned[0].nama}*: "Aku bantu!"\n\n`
          spawned.forEach((c,i) => { msg += `*${i+1}.* ${c.emoji} *${c.nama}*\n` })
          msg += `\n`
        }
        msg += `.csm fight - Lawan\n.csm run - Kabur`
      } else {
        if(spawned.length > 0){
          csm.encounter = {type: 'chars', data: spawned}
          msg += `👥 Ada ${spawned.length} orang di sini:\n`
          spawned.forEach((c,i) => {
            let love = csm.relations[c.nama] || 0
            msg += `*${i+1}.* ${c.emoji} *${c.nama}* - ${c.role}\n "${c.dialog[Math.floor(Math.random()*c.dialog.length)]}"\n 💌 ${love}/${c.needLove}\n\n`
          })
          msg += `.csm interact <nomor/nama> - Ngobrol\n.csm run - Pergi`
        } else { msg += `Sepertinya aman...` }
      }
    } else { msg += `Sepertinya aman...` }

    let expGain = Math.floor((Math.random() * 15) + 5) * bonus.expMult
    addExp(expGain)
    msg += `\n📈 +${Math.floor(expGain)} EXP`
    if(bonus.findItem > 0) msg += `\n🍀 Find Item: +${(bonus.findItem*100).toFixed(0)}%`
    if(bonus.luck > 0) msg += `\n✨ Luck: +${(bonus.luck*100).toFixed(0)}%`

    saveDB(wdb)
    return m.reply(msg + `\n━━━━━━━━━━━`)
  }
  
  // ============================================================
// === MISSION FARM ===========================================
// ============================================================

if (action === 'mission' || action === 'misi') { // bisa.csm misi
  let b = calcBonus(csm) // AMBIL BONUS DULU

  // STAMINA: bonus misi lebih banyak. Default 1 menit, -3 detik per 10 stamina
  let cooldown = 60000 - (b.stamina * 300)
  if(cooldown < 10000) cooldown = 10000 // minimal 10 detik

  if (csm.lastMission && Date.now() - csm.lastMission < cooldown) {
    let sisa = Math.ceil((cooldown - (Date.now() - csm.lastMission)) / 1000)
    return m.reply(header('COOLDOWN') + `Tunggu ${sisa} detik lagi.\nHQ belum kasih misi baru.\n━━━━━━━━━━━`)
  }

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
  ]
  const randomStory = MISSION_STORY[Math.floor(Math.random() * MISSION_STORY.length)]

  if (csm.health < 10) return m.reply(header('HP KURANG') + `Butuh minimal 10 HP.\n━━━━━━━━━━━`)
  if (!Array.isArray(csm.inventory) ||!csm.inventory.length) csm.inventory = [{ nama: 'Fist', dur: 999 }]

  const devil = DEVIL_LIST[Math.floor(Math.random() * DEVIL_LIST.length)]
  const weapon = csm.inventory[0] || { nama: 'Fist', dur: 999 }
  const weaponData = WEAPON_LIST.find(w => w.nama === weapon.nama) || WEAPON_LIST[0]
  const activePartners = csm.partners.filter(p => p.status === 'active')

  // DMG + BUFF
  let dmg = Math.floor(Math.random() * 50) + csm.level * 10 + weaponData.dmg + b.dmg
  if (csm.devilContract === 'Chainsaw Devil' || b.autoTransform) dmg *= 2.5
  dmg += activePartners.length * 25
  if(b.aoe > 0) dmg += Math.floor(dmg * (b.aoe/100))
  if(b.fire > 0) dmg += b.fire
  if(b.water > 0) dmg += b.water
  if(b.burn > 0) dmg += b.burn
  if(b.pierce > 0) dmg += b.pierce
  if(b.bleed > 0) dmg += b.bleed

  if (Math.random() * 100 < b.critChance) dmg = Math.floor(dmg * (1.5 + b.critDmg)) // CRIT
  if (Math.random() * 100 < b.instantKill) dmg = devil.hp + 999 // INSTANT KILL
  if(b.craftWeapon > 0) dmg += b.craftWeapon * 10 // ASA

  const devilHp = Math.floor(devil.hp * 0.7)

  // PILIHAN
  let partnerHelp = ''
  if(activePartners.length > 0){
    let p = activePartners[Math.floor(Math.random() * activePartners.length)]
    let ch = CHARACTER_LIST.find(c => c.nama === p.name)
    let dialogPartner = ['Aku di belakangmu!', 'Selesaikan cepat!', 'Jangan mati bodoh!', 'Sini aku bantu!']
    partnerHelp = `\n${ch.emoji} *${p.name}*: "${dialogPartner[Math.floor(Math.random()*dialogPartner.length)]}"`
  }

  let msg = header('MISI DITERIMA') +
    `${randomStory}\n\n` +
    `Target: ${devil.emoji} *${devil.nama}*\n` +
    `HP: ${devilHp.toLocaleString()} | DMG Estimasi: ${dmg.toLocaleString()}${partnerHelp}\n`

  if(b.findItem > 0) msg += `🎁 Chance Item: ${(b.findItem*100).toFixed(0)}%\n`
  if(b.money > 0) msg += `💰 Bonus Uang: +${b.money}\n`

  msg += `━━━━━━━━━━━\n\n` +
    `Pilih: \n` +
    `.csm fight - Lawan langsung\n` +
    `.csm run - Kabur dan curi darah`

  // SIMPAN DATA MISI SEMENTARA + SET COOLDOWN
  csm.tempMission = { devil, devilHp, dmg }
  csm.lastMission = Date.now()
  saveDB(wdb) // WAJIB: ada perubahan tempMission & lastMission
  return m.reply(msg)
}

// === MISSION FIGHT ===
if (action === 'fight' && csm.tempMission){
  let b = calcBonus(csm)
  let { devil, devilHp, dmg } = csm.tempMission
  csm.health = Math.max(1, csm.health - 10)

  // REGEN & HEAL PASIF SETELAH FIGHT
  if(b.regen > 0 || b.heal > 0){
    csm.health = Math.min(100, csm.health + b.regen + b.heal)
  }

  if (devilHp <= dmg) {
    const rusak = damageWeapon()
    // WEAPON DUR BONUS
    if(b.weaponDur > 0) csm.inventory[0].dur += b.weaponDur

    csm.devilsKilled++
    // REWARD 2X LIPAT + BUFF
    let bloodGain = Math.floor(((devil.blood * 2) + 400) * b.bloodMult) + b.stealBlood
    let expGain = Math.floor(((devil.exp * 2) + 100) * b.expMult)
    let moneyGain = b.money

    csm.blood += bloodGain
    csm.money = (csm.money || 0) + moneyGain
    const leveled = addExp(expGain)
    delete csm.tempMission
    saveDB(wdb) // WAJIB: ada perubahan health, blood, money, inventory, devilsKilled, tempMission

    // 5 VARIASI MENANG - BRUTAL CSM
    const WIN_TEXT = [
      `DENTUMAN. DARAH. DAGING.\n\n${devil.emoji} *${devil.nama}* MELEDAK JADI KABUT MERAH.\nGue bahkan gak liat apa yg terjadi. Cuma bau besi.`,
      `SUARA GERGAJI. JERITAN. HENING.\n\n${devil.emoji} *${devil.nama}* JADI IRISAN-IRISAN DI LANTAI.\nEnak. Rasanya kayak ngunyah kaca sambil ketawa.`,
      `TIDAK ADA SENI. HANYA KEKERASAN.\n\n${devil.emoji} *${devil.nama}* HANCUR.\nGue muntah darah. Tapi gue senyum. HQ bakal bayar mahal.`,
      `KEPALA. TANGAN. KAKI. TERPISAH.\n\n${devil.emoji} *${devil.nama}* GUE POTONG JADI 4.\nSatu buat makan, satu buat dijual, satu buat mainan, satu buat bukti.`,
      `INI KENAPA GUE HIDUP.\n\n${devil.emoji} *${devil.nama}* MATI TENGKURAP DI GENANGAN DARAHNYA SENDIRI.\nRasanya... nagih. Pengen lagi.`
    ]
    let winMsg = WIN_TEXT[Math.floor(Math.random() * WIN_TEXT.length)]

    let msg = header('TARGET DILENYAPKAN') + winMsg +
      `\n━━━━━━━━━━━\n` +
      `⚔️ DMG: ${dmg.toLocaleString()}\n` +
      `🩸 +${bloodGain.toLocaleString()} Darah\n` +
      `📈 +${expGain} EXP`
    if(moneyGain > 0) msg += `\n💰 +${moneyGain.toLocaleString()} Uang`
    if(b.findItem > 0 && Math.random() < b.findItem) msg += `\n🎁 Dapet Item Tambahan!`
    if(b.regen > 0 || b.heal > 0) msg += `\n❤️ +${b.regen + b.heal} HP [Regen/Heal]`
    if (leveled) msg += `\n🎉 LEVEL UP! Lv.${csm.level}`
    if (rusak) msg += `\n💀 *${rusak}* HANCUR KENA DARAH IBLIS!`
    return m.reply(msg + `\n━━━━━━━━━━━`)
  }

  // 5 VARIASI KALAH - HAMPIR MATI
  const LOSE_TEXT = [
    `SALAH GERAK. SATU DETIK.\n\n${devil.emoji} *${devil.nama}* NABRAK GUE KE TEMBOK.\nTulang rusuk patah 3. Kabur sekarang atau mati di sini.`,
    `GUE KELEMAHAN.\n\n${devil.emoji} *${devil.nama}* KETAWA SAMBIL NGINJEK TANGAN GUE.\n*KRETEK*. Sakit. Lari, Denji. Lari sebelum dimakan.`,
    `INI BUKAN LAWAN GUE.\n\n${devil.emoji} *${devil.nama}* TERLALU BESAR. TERLALU CEPAT.\nGue cuma bisa gigit tanah sambil nyeret badan kabur.`,
    `POWER BAKAL NGETAWAIN GUE.\n\n${devil.emoji} *${devil.nama}* HAMPIR MAKAN KEPALA GUE.\nBesok gue balik bawa gergaji yg nyala. Sumpah.`,
    `HQ GA BAKAL BAYAR KALO GUE MATI.\n\n${devil.emoji} *${devil.nama}* TERLALU KUAT.\nGue muntah darah dan kabur. Hidup dulu, gengsi belakangan.`
  ]
  let loseMsg = LOSE_TEXT[Math.floor(Math.random() * LOSE_TEXT.length)]

  delete csm.tempMission
  saveDB(wdb) // WAJIB: ada perubahan health, tempMission
  return m.reply(header('HAMPIR MATI') + loseMsg + `\n━━━━━━━━━━━\n❤️ -10 HP\n━━━━━━━━━━━`)
}

// === MISSION RUN ===
if (action === 'run' && csm.tempMission){
  let b = calcBonus(csm)
  let { devil } = csm.tempMission
  csm.health = Math.max(1, csm.health - 10)
  // REWARD RUN 2X + BUFF
  let stolen = Math.floor(devil.blood * 0.6 * b.bloodMult) + b.stealBlood
  let moneyGain = b.money
  csm.blood += stolen
  csm.money = (csm.money || 0) + moneyGain

  // FIND ITEM PAS KABUR
  let findItemMsg = ''
  if(b.findItem > 0 && Math.random() < b.findItem) findItemMsg = `\n🎁 Kamu nemu item pas kabur!`

  delete csm.tempMission
  saveDB(wdb) // WAJIB: ada perubahan health, blood, money, tempMission

  // 5 VARIASI KABUR - MALING DARAH
  const RUN_TEXT = [
    `TAKUT ITU WAJAR.\n\nGue nyolong ${stolen.toLocaleString()} Darah dari ${devil.nama} sambil merangkak di got.\nMalu? Iya. Hidup? Iya. Itu yg penting.`,
    `STRATEGI RETREAT.\n\nSabet, tusuk, lari.\nBerhasil nyuri ${stolen.toLocaleString()} Darah dari ${devil.nama}.\nBesok gue balik. Bawa teman.`,
    `GUE BUKAN PAHLAWAN.\n\nGue maling.\n${stolen.toLocaleString()} Darah dari ${devil.nama} masuk kantong.\nDan gue masih nafas. Itu udah menang.`,
    `KALO MATI GA BISA BAYAR KONTRAKAN.\n\nJadi gue kabur dari ${devil.nama}.\nDapet ${stolen.toLocaleString()} Darah. Lumayan buat beli roti sama susu.`,
    `AKI NYA NYALA LAGI NANTI.\n\n${devil.nama} masih hidup. Tapi gue dapet ${stolen.toLocaleString()} Darah.\nKabur dulu. Revenge nanti. Gaya Chainsaw Man.`
  ]
  let runMsg = RUN_TEXT[Math.floor(Math.random() * RUN_TEXT.length)]

  let msg = header('RETRIBUSI DITUNDA') + runMsg +
    `\n━━━━━━━━━━━\n❤️ -10 HP`
  if(moneyGain > 0) msg += `\n💰 +${moneyGain.toLocaleString()} Uang`
  msg += findItemMsg
  return m.reply(msg + `\n━━━━━━━━━━━`)
}

// ============================================================
// === JOB LIST =================================================
// ============================================================

if (action === 'job' && args[1]?.toLowerCase() === 'list') {
  let cap = header('PILIH PEKERJAAN')

  ALL_JOB_LIST.forEach((j, i) => {
    cap += `*${i + 1}.* *${j.job}*\n  _${j.desc}_\n\n`
  })

  cap += `\n📌.csm job join <nomor/nama>\n` +
    `📌.csm job leave\n` +
    `━━━━━━━━━━━`

  return m.reply(cap) // GA USAH SAVE
}

// ============================================================
// === JOB JOIN ================================================
// ============================================================

if (action === 'job' && args[1]?.toLowerCase() === 'join') {
  if (csm.job) {
    return m.reply(header('SUDAH PUNYA JOB') +
      `Kamu sedang bekerja sebagai:\n` +
      `💼 *${csm.job}*\n\n` +
      `Gunakan.csm job leave jika ingin resign.\n` +
      `━━━━━━━━━━━`)
  }

  const cd = cekCD('lastJob', 5 * 60 * 60 * 1000)

  if (cd > 0) {
    const jam = Math.floor(cd / 3600000) // FIX: /3600000 bukan /3600
    const menit = Math.floor((cd % 3600000) / 60000) // FIX

    return m.reply(header('COOLDOWN') +
      `Tunggu ${jam}j ${menit}m lagi.\n` +
      `━━━━━━━━━━━`)
  }

  const input = args.slice(2).join(' ').trim()

  if (!input) {
    return m.reply(header('PENGGUNAAN') +
      `.csm job list\n` +
      `.csm job join <nomor>\n` +
      `.csm job join <nama job>\n` +
      `━━━━━━━━━━━`)
  }

  let job = null

  if (/^\d+$/.test(input)) {
    const index = parseInt(input, 10) - 1
    job = ALL_JOB_LIST[index]?.job
  } else {
    job = ALL_JOB_LIST.find(j => j.job.toLowerCase() === input.toLowerCase())?.job
  }

  if (!job) {
    return m.reply(header('JOB TIDAK ADA') +
      `Gunakan.csm job list untuk melihat semua job.\n` +
      `━━━━━━━━━━━`)
  }

  csm.job = job
  csm.lastJob = Date.now()

  saveDB(wdb) // WAJIB: ada perubahan job & lastJob

  return m.reply(header('KERJA DIMULAI') +
    `💼 Kamu sekarang: *${job}*\n\n` +
    `Gaji bisa didapat melalui:\n` +
    `.csm work\n` +
    `━━━━━━━━━━━`)
}

// ============================================================
// === JOB LEAVE ===============================================
// ============================================================

if (action === 'job' && args[1]?.toLowerCase() === 'leave') {
  if (!csm.job) {
    return m.reply(header('BELUM PUNYA JOB') +
      `Kamu sedang tidak bekerja.\n` +
      `━━━━━━━━━━━`)
  }

  const jobLama = csm.job

  csm.job = null
  csm.lastJob = Date.now()

  saveDB(wdb) // WAJIB: ada perubahan job & lastJob

  return m.reply(header('BERHENTI KERJA') +
    `Kamu resign dari:\n` +
    `💼 *${jobLama}*\n` +
    `━━━━━━━━━━━`)
}

// ============================================================
// === WORK ====================================================
// ============================================================

if (action === 'work') {
  if (!csm.job) {
    return m.reply(header('BELUM PUNYA JOB') +
      `.csm job join <nomor/nama>\n` +
      `━━━━━━━━━━━`)
  }

  let b = calcBonus(csm) // AMBIL BONUS

  // 2 jam cooldown. -5 menit per 10 stamina
  let cooldown = (2 * 60 * 60 * 1000) - (b.stamina * 5 * 60 * 1000)
  if(cooldown < 30 * 60 * 1000) cooldown = 30 * 60 * 1000 // minimal 30 menit

  const cd = cekCD('lastWork', cooldown)

  if (cd > 0) {
    const jam = Math.floor(cd / 3600000) // FIX
    const menit = Math.floor((cd % 3600000) / 60000) // FIX

    return m.reply(header('COOLDOWN') +
      `Tunggu ${jam}j ${menit}m lagi.\n` +
      `━━━━━━━━━━━`)
  }

  // GAJI DASAR + BONUS MONEY DARI BUFF
  const gajiDasar = Math.floor(Math.random() * 10000) + 5000 + csm.level * 2000
  const gaji = Math.floor((gajiDasar + b.money) * b.bloodMult) // bloodMult + money Tadashi
  const exp = Math.floor((50 + csm.level * 5) * b.expMult) // expMult

  csm.blood += gaji
  const leveled = addExp(exp)
  csm.lastWork = Date.now()

  if(b.heal > 0) { // HEAL DULU SEBELUM SAVE
    csm.health = Math.min(100, csm.health + b.heal)
  }

  saveDB(wdb) // WAJIB: ada perubahan blood, exp, lastWork, health

  let msg = header(`KERJA: ${csm.job}`) +
    `Kamu bekerja hari ini.\n\n` +
    `🩸 +${gaji.toLocaleString()} Darah`

  if(b.money > 0) msg += ` [+${b.money} Bonus Kerja]`
  if(b.bloodMult > 1) msg += ` [x${b.bloodMult.toFixed(2)}]`

  msg += `\n📈 +${exp} EXP`
  if(b.expMult > 1) msg += ` [x${b.expMult.toFixed(2)}]`

  if(b.findItem > 0 && Math.random() < b.findItem) msg += `\n🎁 Dapet Item Sampingan!`
  if(b.heal > 0) msg += `\n❤️ +${b.heal} HP [Istirahat Kerja]`

  if (leveled) msg += `\n🎉 LEVEL UP!\n📊 Sekarang Lv.${csm.level}\n`
  msg += `━━━━━━━━━━━`

  return m.reply(msg)
}

// ============================================================
// === MAKIMA CALL EVENT =======================================
// ============================================================

if (action === 'makimacall') {
  if (Math.random() > 0.15) {
    return m.reply(header('TIDAK ADA PANGGILAN') +
      `Makima sedang sibuk.\n` +
      `Coba lagi nanti.\n` +
      `━━━━━━━━━━━`)
  }

  const targets = Object.keys(wdb.users).filter(uid => uid!== m.sender && wdb.users[uid]?.rpg?.csm)

  if (!targets.length) {
    return m.reply(header('TIDAK ADA TARGET') +
      `Tidak ada Hunter lain yang bisa menjadi target.\n` +
      `━━━━━━━━━━━`)
  }

  const target = targets[Math.floor(Math.random() * targets.length)]
  csm.pendingDuel = target

  saveDB(wdb) // WAJIB: ada perubahan pendingDuel

  return m.reply(header('PANGGILAN DARI MAKIMA') +
    `⛓️ "Anjing yang baik itu nurut."\n\n` +
    `Bunuh *${conn.getName(target)}* dalam 1 jam.\n\n` +
    `🎁 Hadiah:\n` +
    `💰 Rp 500.000\n` +
    `🩸 +5.000 Darah\n` +
    `❌ Gagal:\n` +
    `🩸 -10.000 Darah\n\n` +
    `.csm duel @${target.split('@')[0]} - Terima\n` +
    `.csm refuse - Tolak\n` +
    `━━━━━━━━━━━`)
}

// ============================================================
// === REFUSE MAKIMA ==========================================
// ============================================================

if (action === 'refuse') {
  if (!csm.pendingDuel) {
    return m.reply(header('TIDAK ADA PERINTAH') +
      `Tidak ada perintah Makima yang sedang aktif.\n` +
      `━━━━━━━━━━━`)
  }

  if (csm.blood < 10000) {
    return m.reply(header('DARAH KURANG') +
      `Butuh 10.000 Darah untuk menolak perintah.\n` +
      `━━━━━━━━━━━`)
  }

  csm.blood -= 10000
  csm.pendingDuel = null

  saveDB(wdb) // WAJIB: ada perubahan blood & pendingDuel

  return m.reply(header('PENOLAKAN') +
    `⛓️ "Kecewa aku..."\n\n` +
    `🩸 -10.000 Darah\n` +
    `━━━━━━━━━━━`)
}

// ============================================================
// === DUEL PVP ================================================
// ============================================================

if (action === 'duel') {
  const target = m.mentionedJid?.[0]
  if (!target) return m.reply(header('TAG ORANGNYA') + `Contoh:\n.csm duel @tag\n━━━━━━━━━━━`)
  if (target === m.sender) return m.reply(header('TIDAK BISA') + `Kamu tidak bisa duel melawan diri sendiri.\n━━━━━━━━━━━`)

  const targetRPG = wdb.users[target]?.rpg
  const tUser = targetRPG?.csm
  if (!tUser) return m.reply(header('TARGET BELUM MAIN') + `━━━━━━━━━━━`)

  if (!Array.isArray(tUser.inventory) ||!tUser.inventory.length) tUser.inventory = [{ nama: 'Fist', dur: 999 }]
  if (!tUser.weapon ||!tUser.weapon.nama) tUser.weapon = { nama: 'Fist', dur: 999 }

  // MAKIMA DUEL
  if (csm.pendingDuel === target) {
    const chance = csm.level >= tUser.level? 0.7 : 0.3
    const win = Math.random() < chance

    if (win) {
      userRPG.bank += 500000
      csm.blood += 5000
      csm.pendingDuel = null
      saveDB(wdb) // WAJIB
      return m.reply(header('DUEL MENANG') + `Kamu berhasil menyelesaikan perintah Makima.\n\n💰 +Rp 500.000\n🩸 +5.000 Darah\n━━━━━━━━━━━`)
    }

    csm.blood = Math.max(0, csm.blood - 10000)
    csm.pendingDuel = null
    saveDB(wdb) // WAJIB
    return m.reply(header('DUEL KALAH') + `Kamu gagal menjalankan perintah Makima.\n\n🩸 -10.000 Darah\n━━━━━━━━━━━`)
  }

  // DUEL BIASA
  const taruhan = Math.max(0, parseInt(args[2], 10) || 0)
  if (taruhan > 0) {
    if (userRPG.bank < taruhan || targetRPG.bank < taruhan) {
      return m.reply(header('SALDO KURANG') + `Kedua pemain harus punya saldo yang cukup.\n━━━━━━━━━━━`)
    }
  }

  const myWeapon = WEAPON_LIST.find(w => w.nama === csm.weapon.nama) || { dmg: 0, nama: csm.weapon.nama || 'Fist' }
  const enemyWeapon = WEAPON_LIST.find(w => w.nama === tUser.weapon.nama) || { dmg: 0, nama: tUser.weapon.nama || 'Fist' }

  const dmg1 = csm.level * 10 + myWeapon.dmg
  const dmg2 = tUser.level * 10 + enemyWeapon.dmg
  const win = dmg1 === dmg2? Math.random() < 0.5 : dmg1 > dmg2

  if (taruhan > 0) {
    if (win) {
      userRPG.bank += taruhan
      targetRPG.bank -= taruhan
    } else {
      userRPG.bank -= taruhan
      targetRPG.bank += taruhan
    }
  }

  saveDB(wdb) // WAJIB: ada perubahan bank

  return m.reply(header('HASIL DUEL') +
    `${win? '🏆 KAMU MENANG' : '💀 KAMU KALAH'}\n\n` +
    `⚔️ DMG Kamu: ${dmg1}\n` +
    `⚔️ DMG Lawan: ${dmg2}\n` +
    (taruhan > 0? `💰 Taruhan: Rp ${taruhan.toLocaleString()}\n` : ``) +
    `━━━━━━━━━━━`)
}

// ============================================================
// === GIFT ====================================================
// ============================================================

if (action === 'gift') {
  const type = args[1]?.toLowerCase()
  const target = m.mentionedJid?.[0]
  const jumlah = parseInt(args[2], 10)

  if (!target ||!jumlah || jumlah <= 0 ||!['bank', 'darah'].includes(type)) {
    return m.reply(header('PENGGUNAAN') +
      `.csm gift bank @tag 10000\n` +
      `.csm gift darah @tag 100\n` +
      `━━━━━━━━━━━`)
  }

  if (target === m.sender) return m.reply(header('TIDAK BISA') + `Kamu tidak bisa mengirim gift ke diri sendiri.\n━━━━━━━━━━━`)

  const targetRPG = wdb.users[target]?.rpg
  if (!targetRPG) return m.reply(header('TARGET BELUM MAIN') + `━━━━━━━━━━━`)

  // INIT DATA TARGET KALO BELUM ADA
  if (!targetRPG.csm) {
    targetRPG.csm = { nickname: '', health: 100, maxHealth: 100, level: 1, exp: 0, title: 'Applicant', devilContract: null, contractHistory: [], isTransform: false, devilsKilled: 0, blood: 0, partners: [], story: 1, location: 'Markas Public Safety', weapon: { nama: 'Fist', dur: 999 }, inventory: [{ nama: 'Fist', dur: 999 }], lastRest: 0, lastGacha: 0, lastVisit: 0, encounter: null, relations: {}, pendingBlood: 0, lastWork: 0, pendingDuel: null, contractExpire: 0, contractSide: null, ending: null, hospital: [], job: null, lastJob: 0, endings: [] }
  }

  if (type === 'bank') {
    if (userRPG.bank < jumlah) return m.reply(header('SALDO KURANG') + `━━━━━━━━━━━`)
    userRPG.bank -= jumlah
    targetRPG.bank += jumlah
  } else {
    if (csm.blood < jumlah) return m.reply(header('DARAH KURANG') + `━━━━━━━━━━━`)
    csm.blood -= jumlah
    targetRPG.csm.blood += jumlah
  }

  saveDB(wdb) // WAJIB: ada perubahan bank/blood

  return m.reply(header('GIFT TERKIRIM') +
    `Kamu mengirim ${jumlah.toLocaleString()} ${type} ke ${conn.getName(target)}\n` +
    `━━━━━━━━━━━`)
}

// ============================================================
// === CHARACTER DETAIL =======================================
// ============================================================

if (action === 'char') {
  if (!csm.relations || typeof csm.relations!== 'object') csm.relations = {}

  const namaChar = args.slice(1).join(' ').trim()
  if (!namaChar) return m.reply(header('PENGGUNAAN') + `.csm char <nama karakter>\nContoh:.csm char Reze\n━━━━━━━━━━━`)

  const char = CHARACTER_LIST.find(c => c.nama.toLowerCase() === namaChar.toLowerCase())
  if (!char) return m.reply(header('KARAKTER TIDAK ADA') + `Contoh:.csm char Reze\n━━━━━━━━━━━`)

  const love = Number(csm.relations[char.nama] || 0)

  return m.reply(header(char.nama) +
    `${char.emoji} *${char.role}*\n\n` +
    `🏴 Faksi: ${char.faction}\n` +
    `🧬 Status: ${char.status}\n` +
    `📍 Lokasi: ${char.lokasi.join(', ')}\n` +
    `💌 Hubungan: ${love}/${char.needLove}\n` +
    `🎁 Bonus: ${char.bonus}\n\n` +
    `━━━━━━━━━━━`) // GA USAH SAVE
}

// ============================================================
// === REST ====================================================
// ============================================================

if (action === 'rest') {
  const cd = cekCD('lastRest', 60 * 60 * 1000)
  if (cd > 0) {
    const menit = Math.ceil(cd / 60000) // FIX
    return m.reply(header('COOLDOWN') + `Tunggu ${menit} menit lagi.\n━━━━━━━━━━━`)
  }

  const heal = Math.floor(csm.maxHealth * 0.4)
  const hpSebelum = csm.health
  csm.health = Math.min(csm.maxHealth, csm.health + heal)
  const actualHeal = csm.health - hpSebelum
  csm.lastRest = Date.now()

  saveDB(wdb) // WAJIB: ada perubahan health & lastRest

  return m.reply(header('ISTIRAHAT') +
    `Kamu beristirahat sejenak.\n` +
    `❤️ +${actualHeal} HP\n` +
    `❤️ HP: ${csm.health}/${csm.maxHealth}\n` +
    `━━━━━━━━━━━`)
}

  // ============================================================
// === PARTNER SYSTEM ========================================
// ============================================================
if (action === 'partner') {
  let sub = (args[1] || '').toLowerCase()
  if (sub === 'database') {
    let cap = header('DATABASE KARAKTER')
    CHARACTER_LIST.forEach((c,i) => {
      let owned = csm.partners.find(p => p.name === c.nama)? '✅' : '❌'
      cap += `*${i+1}.* ${c.emoji} *${c.nama}* ${owned}\n Faksi: ${c.faction} | 💌 ${c.needLove}\n`
    })
    cap += `\n📌.csm partner recruit <nomor/nama>\n📌.csm partner achievement\n━━━━━━━━━━━`
    // saveDB(wdb) <-- HAPUS, CUMA VIEW
    return m.reply(cap)
  }

  // === PARTNER RECRUIT ===
  if (sub === 'recruit') {
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
    saveDB(wdb) // WAJIB: ada perubahan partners + reward
    let msg = header('PARTNER BARU') + `${char.emoji} *${char.nama}* bergabung!\nHP: 100/100\nStatus: CADANGAN\nBonus: ${char.bonus}`
    if(newAch.length > 0){
      msg += `\n\n━━━━━━━━━━━\n🏆 *ACHIEVEMENT UNLOCKED!*\n`
      newAch.forEach(a => { msg += `${a.emoji} *${a.nama}*\n${a.desc}\n🩸 +${a.reward.blood?.toLocaleString() || 0} | 📈 +${a.reward.exp || 0} EXP\n` })
    }
    return m.reply(msg + `\n━━━━━━━━━━━`)
  }

  // === PARTNER BY NAME ===
  if (!['database', 'recruit', 'list', 'team', 'achievement'].includes(sub)) {
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
    saveDB(wdb) // WAJIB
    let msg = header('PARTNER BARU') + `${char.emoji} *${char.nama}*\n${char.role}\nBonus: ${char.bonus}\nStatus: CADANGAN`
    if(newAch.length > 0){
      msg += `\n\n━━━━━━━━━━━\n🏆 *ACHIEVEMENT UNLOCKED!*\n`
      newAch.forEach(a => { msg += `${a.emoji} *${a.nama}*\n${a.desc}\n🩸 +${a.reward.blood?.toLocaleString() || 0} | 📈 +${a.reward.exp || 0} EXP\n` })
    }
    return m.reply(msg + `\n━━━━━━━━━━━`)
  }

  // === PARTNER LIST ===
  if (sub === 'list') {
    let cap = header('PARTNER KAMU')
    if(csm.partners.length === 0) cap += `Belum ada partner\n`
    csm.partners.forEach((p, i) => {
      let ch = CHARACTER_LIST.find(c => c.nama === p.name)
      if (!ch) return
      cap += `*${i+1}.* ${ch.emoji} *${p.name}* | HP: ${p.hp}/100\n Status: ${p.status === 'active'? 'IKUT WAR' : 'CADANGAN'}\n\n`
    })
    cap += `Slot Koleksi: ${csm.partners.length} Karakter\n━━━━━━━━━━━\n📌.csm partner team add <nomor>\n📌.csm partner team remove <nomor>\n━━━━━━━━━━━`
    // saveDB(wdb) <-- HAPUS
    return m.reply(cap)
  }

  // === PARTNER TEAM ===
  if (sub === 'team') {
    let sub2 = args[2]
    let nomor = parseInt(args[3]) - 1
    if(!sub2){
      let b = calcBonus(csm)
      let setBonus = calcSetBonus(csm)
      let active = csm.partners.filter(p => p.status === 'active')
      let reserve = csm.partners.filter(p => p.status === 'reserve')
      let msg = header('TIM PARTNER')
      if(active.length === 0) msg += `Partner Aktif: -\n`
      else { msg += `Partner Aktif [${active.length}/5]:\n`; active.forEach((p, i) => { let ch = CHARACTER_LIST.find(c => c.nama === p.name); msg += `${i+1}. ${ch.emoji} *${p.name}* - ${ch.bonus}\n` }); msg += `\n` }
      if(reserve.length > 0){ msg += `Cadangan [${reserve.length}]:\n`; reserve.forEach((p, i) => { let ch = CHARACTER_LIST.find(c => c.nama === p.name); msg += `${active.length + i + 1}. ${ch.emoji} ${p.name}\n` }); msg += `\n` }
      msg += `━━━━━━━━━━━\n*TOTAL BONUS AKTIF:*\n⚔️ DMG: +${b.dmg}\n🛡️ DEF: +${b.def}\n💥 Crit: ${b.critChance}% / +${(b.critDmg*100).toFixed(0)}%\n💨 Evasion: ${b.evasion}%\n🩹 Regen: +${b.regen} HP\n📈 EXP: x${b.expMult.toFixed(2)}\n🩸 Blood: x${b.bloodMult.toFixed(2)} +${b.stealBlood}\n`
      if(Object.keys(setBonus).length > 0){ msg += `\n🔥 *SET BONUS PERMANEN:*\n`; for(let key in setBonus) msg += `${key}: +${setBonus[key]}\n` }
      msg += `━━━━━━━━━━━\nGunakan:\n.csm partner team add 1\n.csm partner team remove 1`
      // saveDB(wdb) <-- HAPUS
      return m.reply(msg)
    }
    if(!csm.partners[nomor]) return m.reply(header('NOMOR SALAH') + `Nomor ${args[3]} tidak ada di list.\n━━━━━━━━━━━`)
    let activeCount = csm.partners.filter(p => p.status === 'active').length
    if(sub2 === 'add') {
      if(csm.partners[nomor].status === 'active') return m.reply(header('UDAH AKTIF') + `${csm.partners[nomor].name} udah di tim.\n━━━━━━━━━━━`)
      if(activeCount >= 5) return m.reply(header('TIM PENUH') + `Maksimal 5 partner aktif.\n━━━━━━━━━━━`)
      csm.partners[nomor].status = 'active'
    } else if(sub2 === 'remove') {
      if(csm.partners[nomor].status === 'reserve') return m.reply(header('UDAH CADANGAN') + `${csm.partners[nomor].name} udah di cadangan.\n━━━━━━━━━━━`)
      csm.partners[nomor].status = 'reserve'
    } else return m.reply(header('PERINTAH SALAH') + `.csm partner team add <nomor>\n.csm partner team remove <nomor>\n━━━━━━━━━━━`)

    let newAch = checkAchievements(csm)
    if(newAch.length > 0){
      newAch.forEach(a => {
        csm.blood += a.reward.blood || 0
        addExp(a.reward.exp || 0)
      })
    }
    saveDB(wdb) // WAJIB: ada perubahan status + reward
    let ch = CHARACTER_LIST.find(c => c.nama === csm.partners[nomor].name)
    let msg = header('TIM DIUPDATE') + `${ch.emoji} *${csm.partners[nomor].name}*\nStatus: ${csm.partners[nomor].status === 'active'? 'IKUT WAR' : 'CADANGAN'}\nBonus: ${ch.bonus}`
    if(newAch.length > 0){ msg += `\n\n━━━━━━━━━━━\n🏆 *ACHIEVEMENT UNLOCKED!*\n`; newAch.forEach(a => { msg += `${a.emoji} *${a.nama}*\n${a.desc}\n🩸 +${a.reward.blood?.toLocaleString() || 0} | 📈 +${a.reward.exp || 0} EXP\n` }) }
    return m.reply(msg + `\n━━━━━━━━━━━`)
  }

  // === PARTNER ACHIEVEMENT ===
  if (sub === 'achievement') {
    if(!csm.achievements) csm.achievements = []
    let msg = header('ACHIEVEMENT PARTNER')
    let unlocked = ACHIEVEMENT_LIST.filter(a => csm.achievements.includes(a.id))
    let locked = ACHIEVEMENT_LIST.filter(a =>!csm.achievements.includes(a.id))
    if(unlocked.length > 0){ msg += `🏆 *TERBUKA [${unlocked.length}/${ACHIEVEMENT_LIST.length}]*\n`; unlocked.forEach(a => { msg += `${a.emoji} *${a.nama}*\n ${a.desc}\n` }); msg += `\n` }
    if(locked.length > 0){ msg += `🔒 *TERKUNCI*\n`; locked.forEach(a => { msg += `❌ *${a.nama}*\n ${a.desc}\n` }) }
    // saveDB(wdb) <-- HAPUS
    return m.reply(msg + `━━━━━━━━━━━`)
  }

  }

  // === HOSPITAL ===
  if (action === 'hospital'){
    let cap = header('RUMAH SAKIT')
    if(!csm.hospital) csm.hospital = [] // ANTI ERROR
    if(csm.hospital.length === 0) cap += `Tidak ada partner yg sekarat\n`
    csm.hospital.forEach((p,i) => { cap += `*${i+1}.* ${p.name} | Status: Sekarat\n` })
    cap += `\n📌.csm revive <nomor> - Bayar 5000 Darah\n━━━━━━━━━━━`
    // saveDB(wdb) <-- HAPUS
    return m.reply(cap)
  }

  // === REVIVE ===
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
    saveDB(wdb) // WAJIB: ada perubahan blood, hospital, partners
    return m.reply(header('REVIVE BERHASIL') + `Partner sudah pulih\n-5000 Darah\n━━━━━━━━━━━`)
  }

  // ============================================================
  // === RAID GLOBAL 1x SEHARI - SISTEM NYICIL ================
  // ============================================================

  if (action === 'raid') {
    const sub = (args[1] || '').toLowerCase()

    if (!wdb.raid || typeof wdb.raid!== 'object') {
      wdb.raid = { boss: null, players: [], date: '', history: [], currentHP: 0, lastAttack: 0 }
    }
    const raid = wdb.raid
    if (!Array.isArray(raid.players)) raid.players = []
    if (!Array.isArray(raid.history)) raid.history = []
    if (typeof raid.currentHP!== 'number') raid.currentHP = 0

    const today = new Date().toISOString().split('T')[0]
    const now = Date.now()

    if (raid.date!== today ||!raid.boss || typeof raid.boss!== 'object' || now - raid.lastAttack > 7200000) {
      const selected = BOSS_LIST[Math.floor(Math.random() * BOSS_LIST.length)]
      raid.boss = {...selected, story: Array.isArray(selected.story)? [...selected.story] : [] }
      raid.currentHP = raid.boss.hp
      raid.date = today
      raid.players = []
      raid.lastAttack = now
      saveDB(wdb) // WAJIB: reset boss harian
    }

    const myCSM = wdb.users[m.sender]?.rpg?.csm
    if (!myCSM) return m.reply(header('BELUM DAFTAR') + `Daftar dulu dengan.csm start\n━━━━━━━━━━━`)
    if (!myCSM.nickname) return m.reply(header('WAJIB SET NICKNAME') + `Gunakan:\n.csm nickname <nama>\nContoh:.csm nickname Azelve Morningstar\n━━━━━━━━━━━`)
    if (myCSM.raidCooldown && now < myCSM.raidCooldown) {
      let sisa = Math.ceil((myCSM.raidCooldown - now) / 60000)
      return m.reply(header('COOLDOWN') + `Kamu masih terluka parah.\nTunggu ${sisa} menit lagi.\n━━━━━━━━━━━`)
    }
    if (myCSM.lastRaid === today &&!['list','history'].includes(sub)) {
      return m.reply(header('SUDAH RAID') + `Kamu sudah ikut raid hari ini.\nTunggu besok jam 00.00.\n\nBoss hari ini:\n${raid.boss.emoji} *${raid.boss.nama}*\nHP: ${Number(raid.currentHP).toLocaleString()}/${Number(raid.boss.hp).toLocaleString()}\n━━━━━━━━━━━`)
    }

    if (!sub) {
      let cap = header(`RAID HARI INI: ${raid.boss.nama}`)
      cap += `${raid.boss.emoji} *${raid.boss.nama}*\nHP: ${Number(raid.currentHP).toLocaleString()}/${Number(raid.boss.hp).toLocaleString()}\n👥 ${raid.players.length}/10 Hunter bergabung\n`
      cap += `📋 *COMMAND RAID*\n.csm raid create\n.csm raid join\n.csm raid leave\n.csm raid team\n.csm raid start\n.csm raid list\n.csm raid delete\n.csm raid history\n━━━━━━━━━━━`
      return m.reply(cap) // GA USAH SAVE
    }

    if (sub === 'list') {
      let cap = header('50 DEVIL RAID')
      BOSS_LIST.forEach((d, i) => { cap += `${i + 1}. ${d.emoji} *${d.nama}* HP: ${Number(d.hp).toLocaleString()}\n` })
      cap += `\nBoss dipilih acak setiap hari.\n━━━━━━━━━━━`
      return m.reply(cap) // GA USAH SAVE
    }

    if (sub === 'history') {
      let cap = header('RAID HISTORY 30 HARI')
      if (raid.history.length === 0) cap += `Belum ada riwayat raid.\n`
      raid.history.slice(-10).reverse().forEach((h, i) => {
        cap += `\n*${i+1}. ${h.date}* | ${h.boss} | ${h.result === 'WIN'? '✅ MENANG' : '❌ KALAH'}\n`
        if (h.players && h.players.length > 0) {
          let names = h.players.map(pid => {
            let nick = wdb.users[pid]?.rpg?.csm?.nickname
            return nick? nick.split(' ')[0] : conn.getName(pid)
          }).join(', ')
          cap += `👥 ${names}\n`
        }
      })
      return m.reply(cap + `━━━━━━━━━━━`) // GA USAH SAVE
    }

    if (sub === 'team') {
      let cap = header(`LOBBY RAID: ${raid.boss.nama}`)
      if (raid.players.length === 0) cap += `Belum ada Hunter di lobby.\n\n`
      else raid.players.forEach((pid, i) => {
        let nick = wdb.users[pid]?.rpg?.csm?.nickname
        cap += `*${i + 1}.* ${nick? nick.split(' ')[0] : conn.getName(pid)} ${i === 0? '[Leader]' : ''}\n`
      })
      cap += `\n👥 ${raid.players.length}/10 Hunter\n.csm raid start\n━━━━━━━━━━━`
      return m.reply(cap) // GA USAH SAVE
    }

    if (sub === 'create') {
      if (raid.players.length > 0 && raid.players[0]!== m.sender) {
        let nick = wdb.users[raid.players[0]]?.rpg?.csm?.nickname
        return m.reply(header('ADA LOBBY') + `Leader saat ini:\n${nick? nick.split(' ')[0] : conn.getName(raid.players[0])}\n━━━━━━━━━━━`)
      }
      raid.players = [m.sender]
      saveDB(wdb) // WAJIB
      return m.reply(header('LOBBY DIBUAT') + `${raid.boss.emoji} *${raid.boss.nama}*\nHP: ${Number(raid.currentHP).toLocaleString()}/${Number(raid.boss.hp).toLocaleString()}\n👥 1 Hunter siap\n.csm raid join\n.csm raid team\n.csm raid start\n━━━━━━━━━━━`)
    }

    if (sub === 'join') {
      if (raid.players.length === 0) return m.reply(header('BELUM ADA LOBBY') + `.csm raid create\n━━━━━━━━━━━`)
      if (raid.players.includes(m.sender)) return m.reply(header('SUDAH JOIN') + `Kamu sudah berada di lobby.\n━━━━━━━━━━━`)
      if (raid.players.length >= 10) return m.reply(header('FULL') + `Maksimal 10 Hunter.\n━━━━━━━━━━━`)
      let msg = header('BERGABUNG')
      if (myCSM.raidLoseText) {
        const texts = ['Aku tidak akan menyerah!','Bangkit lagi!','Kali ini pasti menang!','Darahku masih mendidih!','Untuk pembalasan!']
        msg += `${texts[Math.floor(Math.random() * texts.length)]}\n\n`
        myCSM.raidLoseText = false
      }
      msg += `Kamu ikut berburu ${raid.boss.nama}.\n👥 ${raid.players.length}/10 Hunter\n━━━━━━━━━━━`
      raid.players.push(m.sender)
      saveDB(wdb) // WAJIB
      return m.reply(msg)
    }

    if (sub === 'leave') {
      const idx = raid.players.indexOf(m.sender)
      if (idx === -1) return m.reply(header('KAMU BELUM JOIN') + `━━━━━━━━━━━`)
      raid.players.splice(idx, 1)
      saveDB(wdb) // WAJIB
      if (raid.players.length === 0) return m.reply(header('KELUAR') + `Kamu keluar dari raid.\nLobby sekarang kosong.\n━━━━━━━━━━━`)
      let nick = wdb.users[raid.players[0]]?.rpg?.csm?.nickname
      return m.reply(header('KELUAR') + `Kamu mundur dari perburuan.\nLeader baru: ${nick? nick.split(' ')[0] : conn.getName(raid.players[0])}\n━━━━━━━━━━━`)
    }

    if (sub === 'delete') {
      if (raid.players.length === 0) return m.reply(header('LOBBY KOSONG') + `Tidak ada lobby yang perlu dihapus.\n━━━━━━━━━━━`)
      if (raid.players[0]!== m.sender) return m.reply(header('BUKAN LEADER') + `Hanya leader yang bisa membubarkan lobby.\n━━━━━━━━━━━`)
      raid.players = []
      saveDB(wdb) // WAJIB
      return m.reply(header('LOBBY DIBUBARKAN') + `Perburuan dibatalkan.\n━━━━━━━━━━━`)
    }

    if (sub === 'start') {
      if (raid.players.length === 0) return m.reply(header('BELUM ADA LOBBY') + `.csm raid create\n━━━━━━━━━━━`)
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

      const leaderData = wdb.users[m.sender]?.rpg?.csm
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
        totalDmg += b.dmg
        totalDef += b.def
        totalLuck += b.luck
        totalExp += b.expMult - 1
        totalBlood += b.bloodMult - 1
        totalCrit += b.critChance
        totalCritDmg += b.critDmg
        totalRegen += b.regen
        totalEva += b.evasion
        if(b.revive) teamRevive = true
      })

      let winRate = Math.min(0.99, baseWinRate + totalLuck)
      let damage = Math.floor(boss.hp * 0.1 * playerCount) + Math.floor(totalDmg * 200) + Math.floor(Math.random() * 5000)
      if(totalCrit > 30) damage = Math.floor(damage * (1 + totalCritDmg))
      let damageReduction = Math.floor(totalDef * 2)

      const win = Math.random() < winRate

      if (win) {
        raid.currentHP = 0
        msg += `*─── DARAH MUNCRA DI MANA-MANA ───*\nGIGITAN. IRISAN. LEDAKAN.\n${boss.nama} ROBEK MENJADI POTONGAN.\n\n`
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

          let levelUpCount = 0
          while (pData.exp >= pData.level * 300) { pData.exp -= pData.level * 300; pData.level++; levelUpCount++; pData.maxHealth += 10; pData.health = Math.min(pData.maxHealth, pData.health + 10) }
          pData.lastRaid = today
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
      saveDB(wdb) // WAJIB: semua perubahan raid + player
      return m.reply(msg + `\n━━━━━━━━━━━`)
    }

    return m.reply(header('COMMAND RAID TIDAK DIKENAL') + `.csm raid\n.csm raid create\n.csm raid join\n.csm raid team\n.csm raid leave\n.csm raid start\n.csm raid list\n.csm raid delete\n.csm raid history\n━━━━━━━━━━━`)
  }

  saveDB(wdb)
}



handler.command = ['csm', 'chainsaw']
handler.help = ['csm']
handler.tags = ['rpg']
handler.limit = true
export default handler