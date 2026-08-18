import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply(`╭──「 ❌ ERROR 」──╮\n\nKetik *.adventure* dulu buat daftar RPG.\n━━━━━━━━━━━`)

  let userRPG = getUserRPG(wdb, m.sender).rpg        
  if (!userRPG) return m.reply(`╭──「 ❌ ERROR 」──╮\n\nData RPG bank tidak ditemukan.\n━━━━━━━━━━━`)

  if (!user.csm) user.csm = {
    nickname: '', health: 100, maxHealth: 100, level: 1, exp: 0, title: 'Rookie Hunter',
    devilContract: null, contractHistory: [], isTransform: false,
    devilsKilled: 0, blood: 0, partners: [], story: 1, location: 'Headquarters',
    weapon: {nama: 'Fist', dur: 999},
    inventory: [{nama: 'Fist', dur: 999}], lastRest: 0, lastGacha: 0, lastVisit: 0, encounter: null,
    relations: {}, pendingBlood: 0,
    lastWork: 0, pendingDuel: null,
    contractExpire: 0, contractSide: null, ending: null,
    hospital: [], job: null, lastJob: 0, lastRaid: '', endings: []
  }
  
  let csm = user.csm

  let args = text.split(' ')
  let action = args[0]?.toLowerCase()

  const bar = (val, len = 10) => '█'.repeat(Math.floor(val / (100/len))) + '░'.repeat(len - Math.floor(val / (100/len)))
  const cekCD = (key, durasi) => {
    let last = csm[key] || 0
    let sisa = durasi - (Date.now() - last)
    return sisa > 0 ? Math.ceil(sisa / 1000) : 0
  }

  const header = (title) => `╭──「 ⛓️ DEVIL HUNTER RPG 」──╮\n│ ${title}\n━━━━━━━━━━━\n\n`

  // CEK KONTRAK TRIAL HABIS
  if (csm.contractExpire > 0 && csm.contractExpire < Date.now()) {
    csm.devilContract = null
    csm.contractExpire = 0
    saveDB(wdb)
    m.reply(header('KONTRAK HABIS') + `Kontrak trial mu sudah selesai\n━━━━━━━━━━━`)
  }

  const getTitle = (lvl) => {
    if(lvl >= 40) return '👑 Devil King'
    if(lvl >= 35) return '💀 Horsemen Slayer'
    if(lvl >= 30) return '⛓️ Chainsaw Legend'
    if(lvl >= 25) return '🔥 S-Class Hunter'
    if(lvl >= 20) return '⚔️ A-Class Hunter'
    if(lvl >= 15) return '🛡️ B-Class Hunter'
    if(lvl >= 10) return '🔫 C-Class Hunter'
    if(lvl >= 5) return '🩸 D-Class Hunter'
    return '👶 Rookie Hunter'
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

    if(csm.inventory[0].nama === 'Fist') return null // Fist ga rusak

    csm.inventory[0].dur-- // Kurangin dur senjata yg lagi dipake
    csm.weapon.dur = csm.inventory[0].dur // Sinkronin

    if(csm.inventory[0].dur <= 0){
      let rusak = csm.inventory.shift() // Hapus dari inventory
      csm.weapon = {nama: 'Fist', dur: 999} // Auto ganti ke Fist
      return rusak.nama // Return nama senjata yg rusak
    }

    return null
  }

  // === 100 DEVIL ===
  const DEVIL_LIST = [
    // E RANK - LEMAH
    {nama: 'Bat Devil', rank: 'E', hp: 50, exp: 30, blood: 100, emoji: '🦇', runBlood: 20},
    {nama: 'Leech Devil', rank: 'E', hp: 60, exp: 40, blood: 120, emoji: '🪱', runBlood: 25},
    {nama: 'Coffee Devil', rank: 'E', hp: 70, exp: 50, blood: 150, emoji: '☕', runBlood: 50},
    {nama: 'Mosquito Devil', rank: 'E', hp: 55, exp: 35, blood: 110, emoji: '🦟', runBlood: 15},
    {nama: 'Rat Devil', rank: 'E', hp: 65, exp: 45, blood: 130, emoji: '🐀', runBlood: 20},
    {nama: 'Cockroach Devil', rank: 'E', hp: 60, exp: 40, blood: 120, emoji: '🪳', runBlood: 10},
    {nama: 'Pigeon Devil', rank: 'E', hp: 75, exp: 55, blood: 160, emoji: '🕊️', runBlood: 30},
    {nama: 'Slime Devil', rank: 'E', hp: 80, exp: 60, blood: 180, emoji: '🟢', runBlood: 0},
    
    // D RANK
    {nama: 'Fish Devil', rank: 'D', hp: 80, exp: 60, blood: 200, emoji: '🐟', runBlood: 0},
    {nama: 'Sea Cucumber Devil', rank: 'D', hp: 90, exp: 70, blood: 250, emoji: '🥒', runBlood: 0},
    {nama: 'Zombie Devil', rank: 'D', hp: 100, exp: 80, blood: 300, emoji: '🧟', runBlood: 30},
    {nama: 'Internet Devil', rank: 'D', hp: 85, exp: 65, blood: 220, emoji: '📶', runBlood: 40},
    {nama: 'Dog Devil', rank: 'D', hp: 110, exp: 90, blood: 320, emoji: '🐕', runBlood: 40},
    {nama: 'Cat Devil', rank: 'D', hp: 105, exp: 85, blood: 310, emoji: '🐈', runBlood: 35},
    {nama: 'Crow Devil', rank: 'D', hp: 95, exp: 75, blood: 270, emoji: '🐦', runBlood: 25},
    {nama: 'Truck Devil', rank: 'D', hp: 120, exp: 100, blood: 350, emoji: '🚚', runBlood: 0},
    {nama: 'Door Devil', rank: 'D', hp: 88, exp: 68, blood: 230, emoji: '🚪', runBlood: 0},
    {nama: 'Light Devil', rank: 'D', hp: 92, exp: 72, blood: 240, emoji: '💡', runBlood: 0},
    
    // C RANK
    {nama: 'Ghost Devil', rank: 'C', hp: 150, exp: 120, blood: 500, emoji: '👻', runBlood: 0},
    {nama: 'Fox Devil', rank: 'C', hp: 200, exp: 150, blood: 600, emoji: '🦊', runBlood: 100},
    {nama: 'Eternity Devil', rank: 'C', hp: 300, exp: 200, blood: 800, emoji: '♾️', runBlood: 0},
    {nama: 'Shark Devil', rank: 'C', hp: 250, exp: 170, blood: 700, emoji: '🦈', runBlood: 80},
    {nama: 'Octopus Devil', rank: 'C', hp: 220, exp: 160, blood: 650, emoji: '🐙', runBlood: 60},
    {nama: 'Doll Devil', rank: 'C', hp: 180, exp: 140, blood: 550, emoji: '🎎', runBlood: 0},
    {nama: 'Gravity Devil', rank: 'C', hp: 280, exp: 190, blood: 750, emoji: '🌌', runBlood: 0},
    {nama: 'Silence Devil', rank: 'C', hp: 240, exp: 165, blood: 680, emoji: '🤫', runBlood: 0},
    
    // B RANK
    {nama: 'Snake Devil', rank: 'B', hp: 400, exp: 250, blood: 1000, emoji: '🐍', runBlood: 0},
    {nama: 'Future Devil', rank: 'B', hp: 600, exp: 400, blood: 1500, emoji: '🔮', runBlood: 0},
    {nama: 'Curse Devil', rank: 'B', hp: 650, exp: 450, blood: 1700, emoji: '📍', runBlood: 200},
    {nama: 'Money Devil', rank: 'B', hp: 700, exp: 500, blood: 1900, emoji: '💰', runBlood: 500},
    {nama: 'Lightning Devil', rank: 'B', hp: 550, exp: 380, blood: 1400, emoji: '⚡', runBlood: 150},
    {nama: 'Ice Devil', rank: 'B', hp: 580, exp: 390, blood: 1450, emoji: '🧊', runBlood: 100},
    {nama: 'Fire Devil', rank: 'B', hp: 620, exp: 410, blood: 1550, emoji: '🔥', runBlood: 0},
    {nama: 'Mirror Devil', rank: 'B', hp: 680, exp: 440, blood: 1650, emoji: '🪞', runBlood: 0},
    {nama: 'Void Devil', rank: 'B', hp: 690, exp: 445, blood: 1680, emoji: '🕳️', runBlood: 0},
    {nama: 'Poison Devil', rank: 'B', hp: 630, exp: 420, blood: 1600, emoji: '☠️', runBlood: 250},
    
    // A RANK
    {nama: 'Violence Devil', rank: 'A', hp: 1000, exp: 600, blood: 2500, emoji: '👊', runBlood: 0},
    {nama: 'Katana Man', rank: 'A', hp: 1200, exp: 700, blood: 3000, emoji: '🗡️', runBlood: 0},
    {nama: 'Crossbow Devil', rank: 'A', hp: 900, exp: 550, blood: 2200, emoji: '🏹', runBlood: 300},
    {nama: 'Justice Devil', rank: 'A', hp: 1100, exp: 650, blood: 2700, emoji: '⚖️', runBlood: 0},
    {nama: 'Blood Devil', rank: 'A', hp: 950, exp: 580, blood: 2400, emoji: '🩸', runBlood: 400},
    {nama: 'Angel Devil', rank: 'A', hp: 1050, exp: 620, blood: 2600, emoji: '😇', runBlood: 0},
    {nama: 'Plague Devil', rank: 'A', hp: 1150, exp: 680, blood: 2900, emoji: '☣️', runBlood: 0},
    
    // S RANK
    {nama: 'Cosmos Devil', rank: 'S', hp: 2000, exp: 1000, blood: 5000, emoji: '🌌', runBlood: 0},
    {nama: 'Hell Devil', rank: 'S', hp: 3000, exp: 1500, blood: 8000, emoji: '🔥', runBlood: 0},
    {nama: 'Prison Devil', rank: 'S', hp: 3500, exp: 1800, blood: 10000, emoji: '🔗', runBlood: 0},
    {nama: 'Falling Devil', rank: 'S', hp: 2800, exp: 1400, blood: 7500, emoji: '🪽', runBlood: 0},
    {nama: 'Nightmare Devil', rank: 'S', hp: 3200, exp: 1600, blood: 8500, emoji: '😱', runBlood: 0},
    {nama: 'Regret Devil', rank: 'S', hp: 2900, exp: 1450, blood: 7800, emoji: '😭', runBlood: 0},
    {nama: 'Witch Devil', rank: 'S', hp: 3100, exp: 1550, blood: 8200, emoji: '🧙', runBlood: 0},
    {nama: 'Tyranny Devil', rank: 'S', hp: 3400, exp: 1700, blood: 9000, emoji: '👑', runBlood: 0},
    
    // SS RANK
    {nama: 'Darkness Devil', rank: 'SS', hp: 5000, exp: 3000, blood: 15000, emoji: '🌑', runBlood: 0},
    {nama: 'Oblivion Devil', rank: 'SS', hp: 5200, exp: 3200, blood: 16000, emoji: '👁️', runBlood: 0},
    {nama: 'Sword Devil', rank: 'SS', hp: 4800, exp: 2900, blood: 14500, emoji: '⚔️', runBlood: 500},
    {nama: 'Thunder Devil', rank: 'SS', hp: 5100, exp: 3100, blood: 15500, emoji: '🌩️', runBlood: 0},
    {nama: 'Abyss Devil', rank: 'SS', hp: 5300, exp: 3300, blood: 16500, emoji: '🌊', runBlood: 0},
    {nama: 'Love Devil', rank: 'SS', hp: 4900, exp: 2950, blood: 14800, emoji: '💘', runBlood: 0},
    
    // SSS RANK - HORSEMEN + FINAL
    {nama: 'Bomb Devil', rank: 'SSS', hp: 9500, exp: 4800, blood: 29000, emoji: '💣', runBlood: 0},
    {nama: 'Gun Devil', rank: 'SSS', hp: 10000, exp: 5000, blood: 30000, emoji: '🔫', runBlood: 0},
    {nama: 'Control Devil', rank: 'SSS', hp: 8000, exp: 4000, blood: 25000, emoji: '⛓️', runBlood: 1000},
    {nama: 'War Devil', rank: 'SSS', hp: 7000, exp: 3500, blood: 20000, emoji: '⚔️', runBlood: 800},
    {nama: 'Famine Devil', rank: 'SSS', hp: 9000, exp: 4500, blood: 28000, emoji: '🍖', runBlood: 0},
    {nama: 'Death Devil', rank: 'SSS', hp: 15000, exp: 6000, blood: 50000, emoji: '💀', runBlood: 0},
    {nama: 'Chainsaw Devil', rank: 'SSS', hp: 12000, exp: 5500, blood: 35000, emoji: '⛓️', runBlood: 1500},
    {nama: 'Conquest Devil', rank: 'SSS', hp: 8500, exp: 4200, blood: 26000, emoji: '🏇', runBlood: 600},
    {nama: 'Pestilence Devil', rank: 'SSS', hp: 8800, exp: 4300, blood: 27000, emoji: '🦠', runBlood: 0},
    {nama: 'Time Devil', rank: 'SSS', hp: 11000, exp: 5200, blood: 32000, emoji: '⏰', runBlood: 0},
    {nama: 'Infinity Devil', rank: 'SSS', hp: 13000, exp: 5800, blood: 38000, emoji: '♾️', runBlood: 0},
    {nama: 'God Devil', rank: 'SSS', hp: 20000, exp: 8000, blood: 60000, emoji: '👑', runBlood: 2000},
    {nama: 'Chaos Devil', rank: 'SSS', hp: 18000, exp: 7500, blood: 55000, emoji: '🌀', runBlood: 0},
    {nama: 'Void King', rank: 'SSS', hp: 16000, exp: 7000, blood: 52000, emoji: '🕳️', runBlood: 1000},
    {nama: 'Apocalypse Devil', rank: 'SSS', hp: 25000, exp: 9000, blood: 70000, emoji: '☢️', runBlood: 0},
    {nama: 'End Devil', rank: 'SSS', hp: 30000, exp: 10000, blood: 80000, emoji: '🔚', runBlood: 0}
  ]

  // === 62 KARAKTER DENGAN FAKSI & STATUS ===
  const CHARACTER_LIST = [
          // === KARAKTER UTAMA ===
    {nama: 'Denji', role: 'Main Character', faction: 'Public Safety / Chainsaw Man', status: 'Hybrid', lokasi: ['Cafe', 'Aki Apartment', 'Town'], needLove: 40, emoji: '⛓️', bonus: 'Auto Transform', dialog: ['Mau makan bareng ga?', 'Pochita kangen lu', 'Ayo lawan devil bareng!']},
    {nama: 'Aki Hayakawa', role: 'Main Character', faction: 'Public Safety (Div 2 -> Div 4)', status: 'Human / Gun Fiend', lokasi: ['Aki Apartment', 'Headquarters'], needLove: 60, emoji: '🦊', bonus: 'Critical +20%', dialog: ['Jangan gegabah', 'Rokok dulu...', 'Kita harus profesional']},
    {nama: 'Power', role: 'Main Character', faction: 'Public Safety (Div 4)', status: 'Blood Fiend', lokasi: ['Aki Apartment', 'Train'], needLove: 50, emoji: '🩸', bonus: 'Regen 10HP/mission', dialog: ['Bodo! Gua lebih kuat!', 'Kasih gua darah!', 'Meong~']},
    {nama: 'Asa Mitaka', role: 'Main Character (Part 2)', faction: 'Fourth East High', status: 'Human (War Devil Host)', lokasi: ['School'], needLove: 35, emoji: '⚔️', bonus: 'Craft Weapon +1', dialog: ['H-halo...', 'Yoru nyuruh aku...', 'Jangan deket2']},
    {nama: 'Nayuta', role: 'Denji\'s Ward', faction: 'Four Horsemen', status: 'Control Devil (Reincarnation)', lokasi: ['Aki Apartment'], needLove: 80, emoji: '⛓️', bonus: 'Control Enemy 1 turn', dialog: ['Denji...', 'Nurut', 'Jangan nakal']},
    {nama: 'Fami', role: 'Antagonist / Mastermind', faction: 'Four Horsemen / Chainsaw Man Church', status: 'Famine Devil', lokasi: ['Mall'], needLove: 75, emoji: '🍖', bonus: 'Steal 100 Blood', dialog: ['Makan sana', 'Lapar ya?', 'Kurang gizi']},
    {nama: 'Makima', role: 'Main Antagonist (Part 1)', faction: 'Public Safety (Div 4)', status: 'Control Devil', lokasi: ['Mall', 'Headquarters', 'Town'], needLove: 80, emoji: '⛓️', bonus: 'Chance instant kill 5%', dialog: ['Anjing yang baik nurut ya', 'Kerja bagus', 'Ikut aku']},
    {nama: 'Yoru', role: 'Main Character (Part 2)', faction: 'Four Horsemen', status: 'War Devil', lokasi: ['School'], needLove: 60, emoji: '⚔️', bonus: 'Weapon Damage +35', dialog: ['Buat senjata', 'Lemah', 'Ikut perintahku']},

    // === PUBLIC SAFETY TOKYO ===
    {nama: 'Kishibe', role: 'Captain / Mentor', faction: 'Public Safety', status: 'Human', lokasi: ['Headquarters'], needLove: 70, emoji: '🚬', bonus: 'All Stat +10', dialog: ['Kerja yang bener', 'Masih cupu lu', 'Latihan sana']},
    {nama: 'Himeno', role: 'Senior Hunter', faction: 'Public Safety (Div 4)', status: 'Human', lokasi: ['Headquarters'], needLove: 55, emoji: '👻', bonus: 'Dodge +15%', dialog: ['Minum dulu', 'Aki...', 'Hati-hati']},
    {nama: 'Kobeni Higashiyama', role: 'Rookie Hunter', faction: 'Public Safety (Div 4)', status: 'Human', lokasi: ['Headquarters', 'Street'], needLove: 40, emoji: '🔪', bonus: 'Evasion +25%', dialog: ['Tolong jangan!', 'Aku nyerah', 'Kabur aja']},
    {nama: 'Hirokazu Arai', role: 'Rookie Hunter', faction: 'Public Safety (Div 4)', status: 'Human', lokasi: ['Headquarters'], needLove: 35, emoji: '🔫', bonus: 'Accuracy +15%', dialog: ['Aku takut', 'Semangat!', 'Tembak!']},
    {nama: 'Hirofumi Yoshida', role: 'Private Hunter / Student', faction: 'Public Safety / Unknown Org', status: 'Human', lokasi: ['School', 'Town'], needLove: 40, emoji: '🐙', bonus: 'CC Resist +20%', dialog: ['Lagi apa?', 'Mau liat gurita?', 'Rahasia ya']},
    {nama: 'Fumiko Mifune', role: 'Bodyguard', faction: 'Public Safety (Div 7)', status: 'Human', lokasi: ['Headquarters'], needLove: 65, emoji: '🥷', bonus: 'Defense +15', dialog: ['Lindungi target', 'Jangan lengah', 'Siap']},
    {nama: 'Beam', role: 'Agent', faction: 'Public Safety (Div 4)', status: 'Shark Fiend', lokasi: ['Park'], needLove: 45, emoji: '🦈', bonus: 'Water Damage +25', dialog: ['Guk guk', 'Aku Beam', 'Lapar']},
    {nama: 'Galgali', role: 'Agent', faction: 'Public Safety (Div 4)', status: 'Violence Fiend', lokasi: ['Headquarters'], needLove: 60, emoji: '👊', bonus: 'Defense +20', dialog: ['...', 'HANCURKAN', 'KUAT']},
    {nama: 'Madoka', role: 'Experienced Hunter', faction: 'Public Safety (Div 4)', status: 'Human (Resigned)', lokasi: ['Headquarters'], needLove: 50, emoji: '📋', bonus: 'Mission Reward +10%', dialog: ['Laporan!', 'Kerja bagus', 'Pensiun']},
    {nama: 'Fushi', role: 'Agent', faction: 'Public Safety (Div 4)', status: 'Human', lokasi: ['Headquarters'], needLove: 40, emoji: '🗡️', bonus: 'Bleed +10', dialog: ['Tusuk!', 'Maju!', 'Hati2']},
    {nama: 'Nail Fiend', role: 'Agent', faction: 'Public Safety (Div 7)', status: 'Nail Fiend', lokasi: ['Headquarters'], needLove: 45, emoji: '📍', bonus: 'Pierce +20', dialog: ['Paku!', 'Diam', 'Tusuk']},
    {nama: 'Nomo', role: 'Aki\'s Senior', faction: 'Public Safety (Div 2)', status: 'Human', lokasi: ['Headquarters'], needLove: 50, emoji: '🚬', bonus: 'EXP +15%', dialog: ['Kerja keras', 'Hati-hati', 'Senior']},
    {nama: 'Kato', role: 'Agent', faction: 'Public Safety (Div 2)', status: 'Human', lokasi: ['Headquarters'], needLove: 35, emoji: '👮', bonus: 'Team HP +5', dialog: ['Siap!', 'Lapor!', 'Maju!']},
    {nama: 'Tanabe', role: 'Agent', faction: 'Public Safety (Div 2)', status: 'Human', lokasi: ['Headquarters'], needLove: 35, emoji: '👮', bonus: 'Team HP +5', dialog: ['Siap!', 'Lapor!', 'Maju!']},
    {nama: 'Furuno', role: 'Agent', faction: 'Public Safety (Div 2)', status: 'Human', lokasi: ['Headquarters'], needLove: 35, emoji: '👮', bonus: 'Team HP +5', dialog: ['Siap!', 'Lapor!', 'Maju!']},
    {nama: 'Takagi', role: 'Agent', faction: 'Public Safety (Div 7)', status: 'Human', lokasi: ['Headquarters'], needLove: 40, emoji: '👮', bonus: 'Accuracy +10', dialog: ['Target!', 'Tembak!', 'Clear!']},
    {nama: 'Masaki Ando', role: 'Agent', faction: 'Public Safety (Div 2)', status: 'Human', lokasi: ['Headquarters'], needLove: 35, emoji: '👮', bonus: 'Team HP +5', dialog: ['Siap!', 'Lapor!', 'Maju!']},
    {nama: 'Nakamura', role: 'Agent', faction: 'Public Safety (Div 2)', status: 'Human', lokasi: ['Headquarters'], needLove: 35, emoji: '👮', bonus: 'Team HP +5', dialog: ['Siap!', 'Lapor!', 'Maju!']},

    // === PUBLIC SAFETY REGIONAL ===
    {nama: 'Yutaro Kurose', role: 'Kyoto Hunter', faction: 'Public Safety', status: 'Human', lokasi: ['Town'], needLove: 50, emoji: '🗡️', bonus: 'Speed +10', dialog: ['Kyoto!', 'Maju!', 'Hati2']},
    {nama: 'Michiko Tendo', role: 'Kyoto Hunter', faction: 'Public Safety', status: 'Human', lokasi: ['Town'], needLove: 50, emoji: '🗡️', bonus: 'Speed +10', dialog: ['Kyoto!', 'Maju!', 'Hati2']},
    {nama: 'Subaru', role: 'Kyoto Instructor', faction: 'Public Safety', status: 'Human', lokasi: ['Town'], needLove: 60, emoji: '📚', bonus: 'EXP +20%', dialog: ['Latihan!', 'Fokus!', 'Bagus!']},
    {nama: 'Kusakabe', role: 'Miyagi Bodyguard', faction: 'Public Safety', status: 'Human', lokasi: ['Town'], needLove: 55, emoji: '🛡️', bonus: 'Defense +15', dialog: ['Lindungi!', 'Jangan!', 'Siap!']},
    {nama: 'Tamaoki', role: 'Miyagi Bodyguard', faction: 'Public Safety', status: 'Human', lokasi: ['Town'], needLove: 55, emoji: '🛡️', bonus: 'Defense +15', dialog: ['Lindungi!', 'Jangan!', 'Siap!']},

    // === WEAPON HYBRIDS ===
    {nama: 'Reze', role: 'Antagonist (Part 1)', faction: 'Soviet Union', status: 'Bomb Hybrid', lokasi: ['Cafe', 'Town'], needLove: 45, emoji: '💣', bonus: 'AoE Damage +40', dialog: ['Pesananmu udah jadi', 'Mau nongkrong?', 'Hati-hati ya']},
    {nama: 'Katana Man / Samurai Sword', role: 'Antagonist', faction: 'Yakuza / Public Safety (Later)', status: 'Katana Hybrid', lokasi: ['Street'], needLove: 60, emoji: '🗡️', bonus: 'Crit Damage +40%', dialog: ['Untuk Yakuza', 'Mati!', 'Balas dendam']},
    {nama: 'Quanxi', role: 'International Assassin', faction: 'China / Public Safety (Later)', status: 'Crossbow Hybrid', lokasi: ['Park', 'Train'], needLove: 70, emoji: '🏹', bonus: 'Attack Speed +30%', dialog: ['Lemah', 'Lanjut', 'Masih hidup?']},
    {nama: 'Barem Bridge', role: 'Antagonist (Part 2)', faction: 'Chainsaw Man Church', status: 'Flamethrower Hybrid', lokasi: ['Mall'], needLove: 65, emoji: '🔥', bonus: 'Burn Damage +50', dialog: ['Keadilan!', 'Salah!', 'Hukum!']},
    {nama: 'Miri Sugo', role: 'Student / Member', faction: 'Chainsaw Man Church', status: 'Longsword Hybrid', lokasi: ['Street', 'Train'], needLove: 30, emoji: '⚔️', bonus: 'Blood Gain +15%', dialog: ['Suntik!', 'Sehat!', 'Obat!']},
    {nama: 'Whip Hybrid', role: 'Member', faction: 'Chainsaw Man Church', status: 'Whip Hybrid', lokasi: ['Mall'], needLove: 40, emoji: '⛓️', bonus: 'CC +20%', dialog: ['Cemeti!', 'Sakit!', 'Nurut!']},
    {nama: 'Spear Hybrid', role: 'Member', faction: 'Chainsaw Man Church', status: 'Spear Hybrid', lokasi: ['Mall'], needLove: 40, emoji: '🔱', bonus: 'Pierce +25', dialog: ['Tusuk!', 'Maju!', 'Hancur!']},

    // === ASSASSINS INTERNATIONAL ===
    {nama: 'Akane Sawatari', role: 'Former Civilian Hunter', faction: 'Gun Devil Ally / Yakuza', status: 'Human', lokasi: ['Street'], needLove: 65, emoji: '🐍', bonus: 'Snake Summon', dialog: ['Gun Devil...', 'Kontrak!', 'Bunuh!']},
    {nama: 'Santa Claus', role: 'International Assassin', faction: 'Germany', status: 'Human (Doll Devil Contract)', lokasi: ['Hell'], needLove: 90, emoji: '🎅', bonus: 'Summon Doll +1', dialog: ['Hoho', 'Boneka!', 'Mati']},
    {nama: 'Tolka', role: 'Santa Claus\' Pupil', faction: 'Soviet Union', status: 'Human / Doll', lokasi: ['Hell'], needLove: 60, emoji: '🎎', bonus: 'Doll Buff +10', dialog: ['Guru!', 'Boneka!', 'Serang!']},
    {nama: 'Aldo', role: 'Assassin Brother', faction: 'USA', status: 'Human', lokasi: ['Street'], needLove: 45, emoji: '🔫', bonus: 'Gun Damage +20', dialog: ['Target!', 'Shoot!', 'Die!']},
    {nama: 'Joey', role: 'Assassin Brother', faction: 'USA', status: 'Human', lokasi: ['Street'], needLove: 45, emoji: '🔫', bonus: 'Gun Damage +20', dialog: ['Target!', 'Shoot!', 'Die!']},
    {nama: 'Kuro', role: 'Assassin Brother', faction: 'USA', status: 'Human', lokasi: ['Street'], needLove: 45, emoji: '🔫', bonus: 'Gun Damage +20', dialog: ['Target!', 'Shoot!', 'Die!']},

    // === FIEND REKAN QUANXI ===
    {nama: 'Pingtsi', role: 'Quanxi\'s Fiend', faction: 'China', status: 'Fiend', lokasi: ['Park'], needLove: 40, emoji: '👹', bonus: 'Taunt Enemy', dialog: ['Grrr', 'Lindungi', 'Quanxi']},
    {nama: 'Cosmo', role: 'Quanxi\'s Fiend', faction: 'China', status: 'Cosmos Fiend', lokasi: ['Park'], needLove: 50, emoji: '🌌', bonus: 'Stun 1 turn', dialog: ['Halo...', 'Cosmos...', '...']},
    {nama: 'Long', role: 'Quanxi\'s Fiend', faction: 'China', status: 'Dragon Fiend', lokasi: ['Park'], needLove: 55, emoji: '🐉', bonus: 'Fire Breath +60', dialog: ['Raung!', 'Naga!', 'Bakar!']},
    {nama: 'Tsugihagi', role: 'Quanxi\'s Fiend', faction: 'China', status: 'Fiend', lokasi: ['Park'], needLove: 45, emoji: '🧵', bonus: 'Heal Ally +20', dialog: ['Jahit!', 'Sembuh!', 'Teman']},

    // === SEKOLAH FOURTH EAST HIGH ===
    {nama: 'Yuko', role: 'Asa\'s Best Friend', faction: 'Fourth East High', status: 'Human / Mutated Fiend', lokasi: ['School'], needLove: 40, emoji: '💀', bonus: 'Self Destruct +100', dialog: ['Asa...', 'Maaf', 'Boom!']},
    {nama: 'Haruka Iseumi', role: 'Devil Hunter Club President', faction: 'Fourth East High', status: 'Human', lokasi: ['School'], needLove: 30, emoji: '📚', bonus: 'EXP +20%', dialog: ['Belajar yuk', 'PR banyak', 'Ujian!']},
    {nama: 'Nobana Higashiyama', role: 'Club Member', faction: 'Fourth East High', status: 'Human', lokasi: ['School'], needLove: 30, emoji: '📖', bonus: 'INT +10', dialog: ['Baca!', 'Catat!', 'Paham!']},
    {nama: 'Seigi Akoku', role: 'Club Member', faction: 'Fourth East High', status: 'Human', lokasi: ['School'], needLove: 30, emoji: '✊', bonus: 'Justice +15%', dialog: ['Benar!', 'Salah!', 'Hukum!']},

    // === PEMERINTAHAN & SIPIL ===
    {nama: 'Kentaro Ishita', role: 'Prime Minister of Japan', faction: 'Japanese Government', status: 'Human', lokasi: ['Town'], needLove: 85, emoji: '👔', bonus: 'Political Power', dialog: ['Negara!', 'Perintah!', 'Dana!']},
    {nama: 'Shin Toma', role: 'Minister of Defense', faction: 'Japanese Government', status: 'Human', lokasi: ['Town'], needLove: 80, emoji: '🎖️', bonus: 'Army Buff +20', dialog: ['Pasukan!', 'Serang!', 'Lindungi!']},
    {nama: 'Tadashi Hasegawa', role: 'Former Minister of Finance', faction: 'Japanese Government', status: 'Human', lokasi: ['Town'], needLove: 70, emoji: '💰', bonus: 'Money +1000', dialog: ['Anggaran!', 'Pajak!', 'Hemat!']},
    {nama: 'Hadaji Sakagami', role: 'Minister of Internal Affairs', faction: 'Japanese Government', status: 'Human', lokasi: ['Town'], needLove: 75, emoji: '🏛️', bonus: 'Law +20%', dialog: ['Hukum!', 'Peraturan!', 'Tertib!']},
    {nama: 'Yuki Tomoda', role: 'Chief Cabinet Secretary', faction: 'Japanese Government', status: 'Human', lokasi: ['Town'], needLove: 75, emoji: '📜', bonus: 'Diplomacy +20', dialog: ['Rapat!', 'Keputusan!', 'Laporan!']},
    {nama: 'Miki Takanashi', role: 'Minister of Economy', faction: 'Japanese Government', status: 'Human', lokasi: ['Mall'], needLove: 70, emoji: '📈', bonus: 'Shop Discount 10%', dialog: ['Ekonomi!', 'Jual!', 'Beli!']},
    {nama: 'Minami Nakano', role: 'Civilian', faction: 'None', status: 'Human', lokasi: ['Town'], needLove: 20, emoji: '👩', bonus: 'None', dialog: ['Tolong!', 'Takut!', 'Lari!']},
    {nama: 'Kenzo', role: 'Yakuza Associate', faction: 'Yakuza', status: 'Human', lokasi: ['Street'], needLove: 50, emoji: '🔪', bonus: 'Crime +20%', dialog: ['Bos!', 'Uang!', 'Bunuh!']},

    // === TAMBAHAN DARI LIST LAMA ===
    {nama: 'Angel Devil', role: 'Angel Devil', faction: 'Public Safety (Div 4)', status: 'Angel Devil', lokasi: ['Park'], needLove: 50, emoji: '😇', bonus: 'Heal 20HP/mission', dialog: ['Aku capek...', 'Jangan berisik', 'Tidur aja']},
    {nama: 'Pochita', role: 'Chainsaw Devil', faction: 'None', status: 'Chainsaw Devil', lokasi: ['Cafe'], needLove: 100, emoji: '🐕', bonus: 'Revive 1x', dialog: ['Wong wong', 'Guk', 'Denji']}
  ]

  // === 25 WEAPON URUT DARI MURAH KE MAHAL ===
  const WEAPON_LIST = [
    // TIER 1: PEMULA 50K - 500K
    {nama: 'Fist', dmg: 0, harga: 0, emoji: '👊', dur: 999, user: 'Semua Orang', material: 'Tangan Kosong', desc: 'Senjata dasar. Ga ada damage tapi ga akan pernah rusak.'},
    {nama: 'Knife', dmg: 8, harga: 50000, emoji: '🔪', dur: 15, user: 'Kobeni / Arai', material: 'Baja Murah', desc: 'Pisau dapur standar. Tajam tapi gampang tumpul.'},
    {nama: 'Baseball Bat', dmg: 12, harga: 80000, emoji: '🏏', dur: 20, user: 'Sipil', material: 'Kayu + Aluminium', desc: 'Pemukul baseball. Bagus buat mukul kepala.'},
    {nama: 'Pipe', dmg: 15, harga: 120000, emoji: '🔧', dur: 18, user: 'Sipil', material: 'Besi Pipa', desc: 'Pipa besi bekas. Berat dan lumayan sakit.'},
    {nama: 'Katana', dmg: 25, harga: 200000, emoji: '🗡️', dur: 25, user: 'Samurai', material: 'Baja Tradisional', desc: 'Katana standar. Tajam dan cepat.'},
    {nama: 'Combat Knife', dmg: 18, harga: 250000, emoji: '🔪', dur: 30, user: 'Kishibe', material: 'Baja Militer', desc: 'Pisau fisik taktis yang selalu dibawa Kishibe. Sangat efektif untuk menusuk dan menebas iblis dalam pertarungan jarak dekat tanpa perlu kontrak aktif.'},
    {nama: 'Spear', dmg: 28, harga: 300000, emoji: '🏹', dur: 22, user: 'Prajurit', material: 'Besi + Kayu', desc: 'Tombak standar. Jangkauan serangan jauh.'},
    {nama: 'Axe', dmg: 35, harga: 350000, emoji: '🪓', dur: 18, user: 'Pemburu', material: 'Baja + Kayu', desc: 'Kapak pembelah. Damage gede tapi berat.'},
    {nama: 'Gun', dmg: 30, harga: 400000, emoji: '🔫', dur: 30, user: 'Public Safety', material: 'Logam + Mesiu', desc: 'Pistol standar Keamanan Publik. Peluru terbatas.'},
    {nama: 'Hammer', dmg: 40, harga: 450000, emoji: '🔨', dur: 25, user: 'Pekerja', material: 'Besi + Kayu', desc: 'Palu godam. Bisa nghancurin tengkorak.'},

    // TIER 2: MENENGAH 550K - 1.2JT
    {nama: 'Standard Handgun / Rifle', dmg: 32, harga: 550000, emoji: '🔫', dur: 40, user: 'Public Safety Agents / Polisi', material: 'Logam dan mesiu standar', desc: 'Pistol dan senapan serbu konvensional yang digunakan oleh anggota Keamanan Publik tingkat rendah atau kepolisian untuk menghadapi ancaman manusia atau iblis lemah.'},
    {nama: 'Kusarigama', dmg: 33, harga: 650000, emoji: '⛓️', dur: 20, user: 'Kusakabe', material: 'Besi dan rantai baja', desc: 'Senjata fisik tradisional berupa sabit yang terikat rantai, digunakan oleh Kusakabe saat bertugas mengawal Denji dari pembunuh internasional.'},
    {nama: 'Rifle', dmg: 45, harga: 700000, emoji: '🎯', dur: 35, user: 'Sniper', material: 'Logam + Optik', desc: 'Senapan laras panjang. Akurasi tinggi dari jarak jauh.'},
    {nama: 'Katana Akane', dmg: 35, harga: 800000, emoji: '🗡️', dur: 20, user: 'Akane Sawatari', material: 'Baja standar', desc: 'Pedang fisik yang digunakan Akane sebelum memanggil Snake Devil. Digunakan juga untuk memotong tangan musuh dalam pertarungan jarak dekat.'},
    {nama: 'Grenade', dmg: 60, harga: 1000000, emoji: '💣', dur: 5, user: 'Tentara', material: 'Peledak + Besi', desc: 'Granat tangan. Sekali pake langsung meledak. AoE damage.'},
    {nama: 'Multiple Katanas', dmg: 28, harga: 1200000, emoji: '🗡️', dur: 10, user: 'Quanxi (Wujud Manusia)', material: 'Baja tradisional Jepang', desc: 'Pedang-pedang fisik yang dibawa Quanxi dalam jumlah banyak. Karena kecepatan tebasannya yang luar biasa, pedang ini sering patah dan harus diganti di tengah pertarungan.'},

    // TIER 3: SIGNATURE 1.5JT - 5JT
    {nama: 'Chainsaw', dmg: 50, harga: 1500000, emoji: '⛓️', dur: 20, user: 'Denji / Chainsaw Man', material: 'Mesin + Besi', desc: 'Gergaji mesin. Senjata utama Denji. Berisik dan brutal.'},
    {nama: 'Blood Hammer & Spears', dmg: 55, harga: 2000000, emoji: '🩸', dur: 999, user: 'Power', material: 'Darah yang dipadatkan + Kontrak', desc: 'Senjata fisik berwujud palu raksasa atau tombak yang dibuat dengan mengeraskan dan memadatkan darah cair menjadi objek padat yang sangat keras. Butuh kontrak dengan Blood Devil.'},
    {nama: 'Uniform Sword', dmg: 65, harga: 2500000, emoji: '⚔️', dur: 15, user: 'Asa Mitaka / Yoru', material: 'Kain seragam sekolah (diubah jadi logam tajam)', desc: 'Pedang fisik padat yang diciptakan Yoru dengan mengubah baju seragam pemberian ibu Asa menjadi senjata tajam berdaya rusak tinggi. Punya nilai sentimental.'},
    {nama: 'Nail-Shaped Sword', dmg: 80, harga: 3500000, emoji: '📍', dur: 999, user: 'Aki Hayakawa', material: 'Besi berbentuk paku besar + Kontrak Curse', desc: 'Pedang fisik berbentuk paku yang terhubung dengan Curse Devil. Menusuk target sebanyak tiga kali akan memicu kematian instan, namun memotong sisa umur penggunanya.'},
    {nama: 'Room 606 Sword', dmg: 85, harga: 4000000, emoji: '🏠', dur: 1, user: 'Asa Mitaka / Yoru', material: 'Material interior kamar kost', desc: 'Pedang masif berwujud fisik padat yang dibuat dari hasil konversi seluruh isi ruang kamar tempat tinggal Asa. Termasuk kasur, meja, dan lemari.'},
    {nama: 'Aquarium Spear', dmg: 90, harga: 5000000, emoji: '🏛️', dur: 1, user: 'Asa Mitaka / Yoru', material: 'Struktur beton dan kaca bangunan akuarium', desc: 'Tombak fisik raksasa yang dibuat dengan memadatkan seluruh material bangunan Akuarium Tokyo menjadi satu senjata genggam. Sekali pake hancur.'},

    // TIER 4: DEWA 10JT
    {nama: 'Gun Devil\'s Flesh Bullets', dmg: 200, harga: 10000000, emoji: '🔫', dur: 1, user: 'Makima / Public Safety', material: 'Serpihan daging Gun Devil berbentuk peluru', desc: 'Proyektil fisik dari sisa tubuh Gun Devil yang bereaksi dan bergerak menuju potongan tubuh utama jika diletakkan berdekatan. Damage paling sakit di game. Sekali pake.'}
  ]

  // === STORY LIST QUEST 14 ARC - FULL LORE ===
  const STORY_LIST = [
    {no: 1, saga: 'Public Safety Saga', nama: 'Arc 1: Introduction', devil: 'Bat Devil', chapters: '1 - 4', reward: 500, desc: 'Denji, seorang pemburu iblis miskin, hidup bersama Pochita si Chainsaw Devil. Setelah dikhianati Yakuza dan mati, Pochita berkorban dan menyatu dengannya. Denji bangkit sebagai Chainsaw Man. Makima dari Keamanan Publik menemukannya dan menawarinya kehidupan layak asalkan mau bekerja untuknya. Inilah awal dari kontrak berdarah Denji.'},
    {no: 2, saga: 'Public Safety Saga', nama: 'Arc 2: Bat Devil', devil: 'Bat Devil', chapters: '5 - 12', reward: 1000, desc: 'Hari pertama Denji di Divisi 4. Dia dipasangkan dengan Power si Blood Fiend yang berisik. Tugas pertama mereka adalah menyelamatkan Meowy, kucing Power yang diculik Bat Devil. Pertarungan pertama Denji sebagai Chainsaw Man melawan iblis pemakan darah ini sangat brutal. Dari sini persahabatan aneh antara Denji, Power, dan Aki mulai terbentuk.'},
    {no: 3, saga: 'Public Safety Saga', nama: 'Arc 3: Eternity Devil', devil: 'Eternity Devil', chapters: '13 - 21', reward: 2000, desc: 'Seluruh anggota Divisi 4 terjebak di dalam Hotel tanpa jalan keluar. Pelaku nya adalah Eternity Devil yang ingin jantung Denji sebagai persembahan. Hari terus berulang selama berhari-hari. Makanan habis, orang mulai gila. Di tengah keputusasaan, Denji menemukan cara gila untuk menang: memakan dan memotong hotel itu sendiri. Kemenangan ini membuat Denji jadi incaran dunia.'},
    {no: 4, saga: 'Public Safety Saga', nama: 'Arc 4: Katana Man', devil: 'Katana Man', chapters: '22 - 38', reward: 3000, desc: 'Balas dendam Yakuza datang. Katana Man dan Akane Sawatari melancarkan serangan teror ke seluruh Divisi 4. Aki, Himeno, dan lainnya terluka parah. Untuk menghadapi ini, Denji dan Power dikirim ke neraka untuk latihan khusus di bawah Kishibe. Mereka kembali lebih kuat, tapi kehilangan banyak orang terdekat. Darah membasahi jalanan Tokyo dalam perang habis-habisan ini.'},
    {no: 5, saga: 'Public Safety Saga', nama: 'Arc 5: Bomb Devil', devil: 'Bomb Devil', chapters: '39 - 52', reward: 4000, desc: 'Denji bertemu Reze, gadis cantik pekerja kafe yang baik padanya. Untuk pertama kalinya Denji merasakan cinta dan kencan normal. Tapi kebahagiaan itu palsu. Reze adalah mata-mata Soviet dan hibrida Bomb Devil yang dikirim untuk membunuh Denji dan membawa jantungnya. Pertarungan di jembatan itu menghancurkan hati Denji. Cinta pertama = luka pertama.'},
    {no: 6, saga: 'Public Safety Saga', nama: 'Arc 6: International Assassins', devil: 'Quanxi', chapters: '53 - 70', reward: 5000, desc: 'Identitas Chainsaw Man bocor ke seluruh dunia. Negara-negara mengirim pembunuh bayaran terkuat mereka ke Jepang. Quanxi dari China, Santa Claus dari Jerman, dan 3 bersaudara dari AS datang untuk merebut Denji. Tokyo jadi medan perang internasional. Makima mulai menunjukkan sisi aslinya yang mengerikan saat melindungi "anjing" kesayangannya.'},
    {no: 7, saga: 'Public Safety Saga', nama: 'Arc 7: Gun Devil', devil: 'Gun Devil', chapters: '71 - 79', reward: 10000, desc: 'Mimpi buruk semua manusia menjadi nyata. Gun Devil, iblis yang membunuh 1.2 juta orang dalam 5 menit, akhirnya muncul di Jepang. Pecahan tubuhnya dikendalikan banyak orang. Aki membuat kontrak dengan Gun Devil untuk membalas dendam, tapi itu adalah awal dari akhirnya. Arc ini adalah titik balik paling kelam di Part 1.'},
    {no: 8, saga: 'Public Safety Saga', nama: 'Arc 8: Control Devil', devil: 'Control Devil', chapters: '80 - 97', reward: 20000, desc: 'Topeng Makima akhirnya lepas. Dia adalah Control Devil, salah satu Four Horsemen. Semua penderitaan Denji adalah rencananya. Dia ingin menciptakan dunia ideal dengan mengendalikan Chainsaw Man. Denji yang hancur harus bangkit dan bertarung demi kebebasannya. Pertarungan terakhir melawan "ibu" ini menentukan nasib dunia dan diakhiri dengan cara paling Denji: memakannya.'},
    {no: 9, saga: 'Academy Saga', nama: 'Arc 9: Justice Devil', devil: 'Justice Devil', chapters: '98 - 111', reward: 2500, desc: '4 tahun kemudian. Cerita pindah ke Asa Mitaka, siswi canggung yang tubuhnya dirasuki Yoru si War Devil. Mereka dipaksa membentuk klub pemburu iblis di sekolah. Misi pertama mereka adalah melawan Justice Devil yang menghukum "orang jahat". Konflik antara Asa yang ingin hidup normal dan Yoru yang ingin perang dimulai di sini.'},
    {no: 10, saga: 'Academy Saga', nama: 'Arc 10: Aquarium', devil: 'Eternity Devil', chapters: '112 - 120', reward: 3500, desc: 'Yoru memaksa Asa untuk berkencan dengan Denji di akuarium agar bisa mengubahnya jadi senjata. Kencan canggung itu kacau karena kemunculan Eternity Devil versi mini. Denji yang sekarang jadi selebriti sekolah membuat Asa makin frustasi. Hubungan aneh segitiga Denji-Asa-Yoru resmi dimulai di arc komedi tragis ini.'},
    {no: 11, saga: 'Academy Saga', nama: 'Arc 11: Falling Devil', devil: 'Falling Devil', chapters: '121 - 131', reward: 15000, desc: 'Primal Fear pertama muncul di Part 2. Falling Devil, utusan neraka, datang ke bumi. Dia membuat semua orang yang melihatnya jatuh ke dalam keputusasaan tanpa akhir. Targetnya adalah Asa dan Yoru untuk dijadikan hidangan di neraka. Arc ini memperkenalkan konsep ketakutan baru yang lebih abstrak dan mengerikan dari Gun Devil.'},
    {no: 12, saga: 'Academy Saga', nama: 'Arc 12: Chainsaw Church', devil: 'Barem Bridge', chapters: '132 - 155', reward: 18000, desc: 'Sebuah sekte besar bernama Chainsaw Man Church berdiri. Dipimpin Fami si Famine Devil dan Barem Bridge si Flamethrower Hybrid. Tujuan mereka gila: memicu kepunahan massal agar Chainsaw Man muncul dan menghapus ketakutan dari dunia. Mereka menculik Denji dan menyebarkan propaganda. Perang ideologi antara pemuja dan pembenci Chainsaw Man pecah.'},
    {no: 13, saga: 'Academy Saga', nama: 'Arc 13: Prison Break', devil: 'Prison Devil', chapters: '156 - 179', reward: 25000, desc: 'Denji ditangkap Keamanan Publik dan dimutilasi di pusat karantina. Tubuhnya dipotong-potong dan dipenjara. Asa, Nayuta, dan teman-teman melancarkan misi penyelamatan gila. Di titik terendah, Pochita kembali mengambil alih dan mengamuk sebagai Chainsaw Man penuh. Ini adalah kebangkitan Denji yang paling brutal.'},
    {no: 14, saga: 'Academy Saga', nama: 'Arc 14: Aging Devil', devil: 'Aging Devil', chapters: '180+', reward: 50000, desc: 'Ramalan Nostradamus tentang kiamat mendekat. Aging Devil, salah satu ketakutan paling purba manusia, muncul. Dia bisa membuat targetnya menua dan mati seketika. Fami dan Chainsaw Church menjalankan rencana akhir mereka. Semua karakter berkumpul untuk pertarungan terakhir. Ini adalah akhir dari Chainsaw Man, tentang apa artinya hidup dan mati.'}
  ]

  const LOCATION_LIST = [
    {nama: 'Headquarters', desc: 'Markas Devil Hunter', rateDevil: 0.1},
    {nama: 'School', desc: 'Sekolah Asa & Yoru', rateDevil: 0.2},
    {nama: 'Cafe', desc: 'Tempat nongkrong Reze', rateDevil: 0.3},
    {nama: 'Aki Apartment', desc: 'Apartemen Aki', rateDevil: 0.15},
    {nama: 'Park', desc: 'Taman kota', rateDevil: 0.4},
    {nama: 'Mall', desc: 'Pusat perbelanjaan', rateDevil: 0.25},
    {nama: 'Hell', desc: 'Neraka', rateDevil: 0.8},
    {nama: 'Street', desc: 'Jalan raya', rateDevil: 0.5},
    {nama: 'Train', desc: 'Stasiun kereta', rateDevil: 0.35},
    {nama: 'Town', desc: 'Kota', rateDevil: 0.3}
  ]

  // === MENU UTAMA ===
  if(!action){
    let cap = header('MENU UTAMA')
    cap += `👤 ${user.name} | ${csm.title} (${csm.gender || 'Laki-Laki ♂️'})\n`
    cap += `📍 ${csm.location} | 📖 Story ${csm.story}/14\n`
    cap += `📊 Lv.${csm.level} | 🩸 ${csm.blood.toLocaleString()} Darah\n`
    cap += `❤️ ${'█'.repeat(Math.floor(csm.health/csm.maxHealth*10))}${'░'.repeat(10-Math.floor(csm.health/csm.maxHealth*10))} ${csm.health}/${csm.maxHealth}\n`
    cap += `💰 Rp ${userRPG.bank.toLocaleString()} Bank\n`
    cap += `⚔️ ${csm.weapon.nama} [Dur: ${csm.weapon.dur}]\n\n`
    cap += `👥 PARTNER: ${csm.partners.length}/5\n`
    cap += `⛓️ KONTRAK: ${csm.devilContract || 'Tidak Ada'}\n`
    cap += `💼 PEKERJAAN: ${csm.job || 'Belum Kerja'}\n\n`
    cap += `📋 BANTUAN: .csm tutorial | .csm gender\n━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (action === 'tutorial'){
    let cap = header('PANDUAN PEMULA')
    cap += `*1. DASAR*\n`
    cap += `.csm visit <tempat> - Pindah. CD 1 Jam\n`
    cap += `.csm mission - Farm darah & exp\n`
    cap += `.csm rest - Heal 40% HP. CD 1 Jam\n`
    cap += `*2. PARTNER*\n`
    cap += `.csm partner database - Liat 62 karakter\n`
    cap += `.csm partner recruit <nomor> - Rekrut\n`
    cap += `.csm partner list - Liat tim aktif\n`
    cap += `.csm partner team add/remove - Atur tim war\n`
    cap += `.csm hospital - RS partner sekarat\n`
    cap += `.csm revive <nomor> - Hidupin 5000 Darah\n`
    cap += `*3. KONTRAK*\n`
    cap += `.csm contract - Beli kontrak senjata\n`
    cap += `.csm contract <nomor> trial - 1 Jam\n`
    cap += `.csm contract <nomor> deal - Permanen\n\n`
    cap += `*4. KERJA*\n`
    cap += `.csm job list - Pilih 10 pekerjaan\n`
    cap += `.csm job join <nomor> - Ambil kerja\n`
    cap += `.csm work - Kerja. CD 2 Jam. Bayar Darah\n`
    cap += `*5. LAINNYA*\n`
    cap += `.csm story - Jalanin 14 Arc\n`
    cap += `.csm raid - Boss harian 10 orang\n`
    cap += `.csm ending - Pilih takdir\n`
    cap += `.csm reset confirm - Reset data\n`
    cap += `*💡 CARA CEPAT TAMAT*\n`
    cap += `1. Kerja tiap 2 jam\n2. Farm mission sampe 50k Darah\n`
    cap += `3. Contract Deal Chainsaw\n4. Rekrut 5 partner\n`
    cap += `5. Raid tiap hari\n6. Story sampe Arc 14\n7. Reset > Ulang\n━━━━━━━━━━━`
    return m.reply(cap)
  }

  // === VISIT CD 1 JAM ===
  if (action === 'visit') {
    if(csm.encounter) return m.reply(header('BELUM SELESAI') + `Selesaikan encounter dulu\n━━━━━━━━━━━`)
    if(cekCD('lastVisit', 3600000) > 0) return m.reply(header('COOLDOWN') + `Tunggu ${Math.ceil(cekCD('lastVisit', 3600000)/60)} menit\n━━━━━━━━━━━`)
    let loc = LOCATION_LIST.find(l => l.nama.toLowerCase() === args.slice(1).join(' ').toLowerCase())
    if (!loc) return m.reply(header('LOKASI SALAH') + `Lihat: .csm location\n━━━━━━━━━━━`)

    csm.location = loc.nama
    csm.lastVisit = Date.now()

    let msg = header(`PERGI KE: ${loc.nama}`) + `${loc.desc}\n\n`

    let rand = Math.random()

    if(rand < 0.15){
      let weap = WEAPON_LIST[Math.floor(Math.random()*5)+1]
      csm.inventory.push({nama: weap.nama, dur: weap.dur})
      msg += `📦 Kamu nemu *${weap.emoji} ${weap.nama}* di tanah!\n`
    } else if(rand < 0.25){
      let darah = (Math.floor(Math.random()*200) + 50) * 100
      csm.blood += darah
      msg += `🩸 Kamu nemu ${darah} Darah tercecer!\n`
    } else if(rand < 0.65){
      if(Math.random() < loc.rateDevil){
        let devil = DEVIL_LIST[Math.floor(Math.random()*DEVIL_LIST.length)]
        csm.encounter = {type: 'devil', data: devil}
        msg += `👹 *${devil.emoji} ${devil.nama}* [${devil.rank}] muncul!\n\n.csm fight - Lawan\n.csm run - Kabur`
      } else {
        let charList = CHARACTER_LIST.filter(c => c.lokasi.includes(loc.nama))

        if(charList.length > 0){
          let char = charList[Math.floor(Math.random()*charList.length)]
          csm.encounter = {type: 'char', data: char}
          let love = csm.relations[char.nama] || 0
          msg += `👥 *${char.emoji} ${char.nama}*\n"${char.dialog[Math.floor(Math.random()*3)]}"\n💌 Hubungan: ${love}/${char.needLove}\n\n.csm interact - Ngobrol\n.csm run - Pergi`
        } else {
          msg += `Sepertinya aman...`
        }
      }
    } else {
      msg += `Sepertinya aman...`
    }

    saveDB(wdb)
    return m.reply(msg + `\n━━━━━━━━━━━`)
  }

  if (action === 'location') {
    let cap = header('10 LOKASI TERSEDIA')
    LOCATION_LIST.forEach(l => cap += `*${l.nama}* - ${l.desc}\n`)
    return m.reply(cap + `📌 .csm visit <nama> [Cooldown 1 Jam]\n━━━━━━━━━━━`)
  }

  // === INTERACT ===
  if (action === 'interact') {
    if(!csm.encounter || csm.encounter.type !== 'char') {
      return m.reply(header('TIDAK ADA') + `Tidak ada karakter di sini\n━━━━━━━━━━━`)
    }

    let char = csm.encounter.data

    if(!csm.relations[char.nama]) csm.relations[char.nama] = 0
    csm.relations[char.nama] += Math.floor(Math.random()*8) + 5

    saveDB(wdb)

    return m.reply(
      header(`INTERAKSI DENGAN ${char.nama}`) +
      `${char.emoji} "${char.dialog[Math.floor(Math.random()*3)]}"\n\n` +
      `💌 Hubungan: ${csm.relations[char.nama]}/${char.needLove}\n` +
      `━━━━━━━━━━━`
    )
  }

  // === PARTNER DATABASE ===
  if (action === 'partner' && args[1] === 'database'){
    let cap = header('DATABASE KARAKTER')

    CHARACTER_LIST.forEach((c,i) => {
      cap += `*${i+1}.* ${c.emoji} *${c.nama}* - ${c.role}\n`
    })

    cap += `\n📌 .csm partner recruit <nomor/nama>\n━━━━━━━━━━━`
    return m.reply(cap)
  }

  // === PARTNER RECRUIT ===
  if (action === 'partner' && args[1] === 'recruit'){
    let input = args.slice(2).join(' ')

    let char = isNaN(input)
      ? CHARACTER_LIST.find(c => c.nama.toLowerCase() === input.toLowerCase())
      : CHARACTER_LIST[parseInt(input) - 1]

    if (!char) return m.reply(header('KARAKTER TIDAK ADA') + `━━━━━━━━━━━`)
    if (csm.partners.length >= 5) return m.reply(header('SLOT PENUH') + `Max 5 partner\n━━━━━━━━━━━`)
    if (csm.partners.find(p => p.name === char.nama)) return m.reply(header('SUDAH REKRUT') + `━━━━━━━━━━━`)

    let love = csm.relations[char.nama] || 0

    if(love < char.needLove) {
      return m.reply(
        header('DITOLAK') +
        `${char.emoji} "${char.nama} belum kenal kamu"\n` +
        `💌 ${love}/${char.needLove}\n` +
        `━━━━━━━━━━━`
      )
    }

    csm.partners.push({
      name: char.nama,
      hp: 100,
      status: 'active'
    })

    saveDB(wdb)

    return m.reply(
      header('PARTNER BARU') +
      `${char.emoji} *${char.nama}* bergabung!\n` +
      `HP: 100/100\n` +
      `━━━━━━━━━━━`
    )
  }

  // === PARTNER BY NAME ===
  if (action === 'partner' && !['database', 'recruit', 'list', 'team'].includes(args[1]?.toLowerCase())) {
    let nama = args.slice(1).join(' ')
    let char = CHARACTER_LIST.find(c => c.nama.toLowerCase() === nama.toLowerCase())

    if (!char) {
      return m.reply(
        header('NAMA SALAH') +
        `Contoh: .csm partner Reze\n` +
        `Lihat: .csm partner database\n` +
        `━━━━━━━━━━━`
      )
    }

    if (csm.partners.find(p => p.name === char.nama)) {
      return m.reply(header('SUDAH PARTNER') + `${char.nama} sudah di tim\n━━━━━━━━━━━`)
    }

    if (csm.partners.length >= 5) {
      return m.reply(header('SLOT PENUH') + `Max 5 partner\n━━━━━━━━━━━`)
    }

    let love = csm.relations[char.nama] || 0

    if(love < char.needLove) {
      return m.reply(
        header('DITOLAK') +
        `${char.emoji} "${char.nama} belum kenal kamu"\n` +
        `💌 ${love}/${char.needLove}\n` +
        `━━━━━━━━━━━`
      )
    }

    csm.partners.push({
      name: char.nama,
      hp: 100,
      status: 'active'
    })

    saveDB(wdb)

    return m.reply(
      header('PARTNER BARU') +
      `${char.emoji} *${char.nama}*\n` +
      `${char.role}\n` +
      `Bonus: ${char.bonus}\n` +
      `Bergabung ke tim!\n` +
      `━━━━━━━━━━━`
    )
  }

  // === PARTNER LIST ===
  if (action === 'partner' && args[1] === 'list'){
    let cap = header('PARTNER KAMU')

    if(csm.partners.length === 0) {
      cap += `Belum ada partner\n`
    }

    csm.partners.forEach((p, i) => {
      let ch = CHARACTER_LIST.find(c => c.nama === p.name)

      if (!ch) return

      cap += `*${i+1}.* ${ch.emoji} *${p.name}* | HP: ${p.hp}/100\n`
      cap += ` Status: ${p.status === 'active' ? 'IKUT WAR' : 'CADANGAN'}\n\n`
    })

    cap += `Slot: ${csm.partners.length}/5 Terisi\n`
    cap += `📌 .csm partner team add <nomor>\n`
    cap += `📌 .csm partner team remove <nomor>\n`
    cap += `━━━━━━━━━━━`

    return m.reply(cap)
  }

  // === PARTNER TEAM ===
  if (action === 'partner' && args[1] === 'team'){
    let sub = args[2]
    let nomor = parseInt(args[3]) - 1

    if(!csm.partners[nomor]) {
      return m.reply(header('NOMOR SALAH') + `━━━━━━━━━━━`)
    }

    if(sub === 'add') {
      csm.partners[nomor].status = 'active'
    } else if(sub === 'remove') {
      csm.partners[nomor].status = 'reserve'
    } else {
      return m.reply(
        header('PERINTAH SALAH') +
        `.csm partner team add <nomor>\n` +
        `.csm partner team remove <nomor>\n` +
        `━━━━━━━━━━━`
      )
    }

    saveDB(wdb)

    return m.reply(
      header('TIM DIUPDATE') +
      `${csm.partners[nomor].name} status: ${csm.partners[nomor].status}\n` +
      `━━━━━━━━━━━`
    )
  }

  // === HOSPITAL ===
  if (action === 'hospital'){
    let cap = header('RUMAH SAKIT')

    if(csm.hospital.length === 0) {
      cap += `Tidak ada partner yg sekarat\n`
    }

    csm.hospital.forEach((p,i) => {
      cap += `*${i+1}.* ${p.name} | Status: Sekarat\n`
    })

    cap += `\n📌 .csm revive <nomor> - Bayar 5000 Darah\n━━━━━━━━━━━`

    return m.reply(cap)
  }

  // === REVIVE ===
  if (action === 'revive'){
    let nomor = parseInt(args[1]) - 1

    if(!csm.hospital[nomor]) {
      return m.reply(header('NOMOR SALAH') + `━━━━━━━━━━━`)
    }

    if(csm.blood < 5000) {
      return m.reply(header('DARAH KURANG') + `Butuh 5000 Darah\n━━━━━━━━━━━`)
    }

    csm.blood -= 5000

    let partner = csm.hospital.splice(nomor, 1)[0]
    partner.hp = 100
    partner.status = 'reserve'

    csm.partners.push(partner)

    saveDB(wdb)

    return m.reply(
      header('REVIVE BERHASIL') +
      `Partner sudah pulih\n` +
      `-5000 Darah\n` +
      `━━━━━━━━━━━`
    )
  }

  // === FIGHT AUTO TRANSFORM ===
  if (action === 'fight') {
    if(!csm.encounter || csm.encounter.type !== 'devil') {
      return m.reply(header('TIDAK ADA DEVIL') + `Tidak ada devil di sini\n━━━━━━━━━━━`)
    }

    let devil = csm.encounter.data

    if (!devil) {
      csm.encounter = null
      saveDB(wdb)
      return m.reply(header('ENCOUNTER ERROR') + `Data devil tidak ditemukan.\n━━━━━━━━━━━`)
    }

    if (!Array.isArray(csm.inventory) || csm.inventory.length === 0) {
      csm.inventory = [{nama: 'Fist', dur: 999}]
    }

    let weapon = csm.inventory[0]
    let weaponData = WEAPON_LIST.find(w => w.nama === weapon.nama)

    if (!weaponData) {
      weapon = {nama: 'Fist', dur: 999}
      csm.inventory[0] = weapon
      weaponData = WEAPON_LIST[0]
    }

    let dmg =
      Math.floor(Math.random() * 20) +
      csm.level * 5 +
      weaponData.dmg

    if(csm.devilContract === 'Chainsaw Devil') {
      dmg *= 2
    }

    dmg += csm.partners.length * 15

    csm.health = Math.max(
      1,
      csm.health - Math.floor(devil.hp / 10)
    )

    if(devil.hp <= dmg){
      let rusak = damageWeapon()

      csm.devilsKilled++
      csm.blood += devil.blood + 100

      let leveled = addExp(devil.exp)

      csm.encounter = null

      saveDB(wdb)

      let msg =
        header('KEMENANGAN') +
        `${devil.emoji} *${devil.nama}* dikalahkan!\n\n` +
        `🩸 +${devil.blood + 100} Darah\n` +
        `📈 +${devil.exp} EXP`

      if(leveled) {
        msg += `\n🎉 LEVEL UP! Lv.${csm.level}`
      }

      if(rusak) {
        msg += `\n\n⚠️ *${rusak}* PATAH!`
      }

      return m.reply(msg + `\n━━━━━━━━━━━`)
    }

    if(csm.inventory.length > 1) {
      csm.inventory.splice(
        Math.floor(Math.random() * csm.inventory.length),
        1
      )
    }

    csm.encounter = null

    saveDB(wdb)

    return m.reply(
      header('KEKALAHAN') +
      `Kamu kalah...\n` +
      `❤️ -${Math.floor(devil.hp / 10)} HP\n` +
      `━━━━━━━━━━━`
    )
  }

  // === RUN BISA DAPET DARAH ===
  if (action === 'run') {
    if(!csm.encounter) {
      return m.reply(header('TIDAK ADA') + `Tidak ada yg dikejar\n━━━━━━━━━━━`)
    }

    let msg = header('MELARIKAN DIRI') + `❤️ -10 HP\n`

    if(csm.encounter.type === 'devil'){
      let devil = csm.encounter.data

      if(devil?.runBlood > 0){
        csm.blood += devil.runBlood
        msg += `Kamu berhasil mencuri ${devil.runBlood} Darah dari ${devil.nama}!\n`
      }
    }

    csm.health = Math.max(1, csm.health - 10)
    csm.encounter = null

    saveDB(wdb)

    return m.reply(msg + `━━━━━━━━━━━`)
  }

  // ============================================================
  // === SHOP / WEAPON SYSTEM ===================================
  // ============================================================

  if (action === 'shop') {
    if (args[1]?.toLowerCase() === 'buy') {
      const namaItem = args.slice(2).join(' ').trim()

      if (!namaItem) {
        return m.reply(
          header('PENGGUNAAN') +
          `.csm shop buy <nama senjata>\n` +
          `Contoh: .csm shop buy Knife\n` +
          `━━━━━━━━━━━`
        )
      }

      const item = WEAPON_LIST.find(
        w => w.nama.toLowerCase() === namaItem.toLowerCase()
      )

      if (!item) {
        return m.reply(
          header('ITEM TIDAK ADA') +
          `Senjata "${namaItem}" tidak ditemukan.\n` +
          `Gunakan .csm shop untuk melihat daftar.\n` +
          `━━━━━━━━━━━`
        )
      }

      // Fist tidak perlu dibeli.
      if (item.harga <= 0) {
        return m.reply(
          header('ITEM GRATIS') +
          `${item.emoji} ${item.nama} adalah senjata default.\n` +
          `━━━━━━━━━━━`
        )
      }

      // CEK SUDAH PUNYA SEBELUM UANG DIPOTONG
      const sudahPunya = csm.inventory.some(
        w => w.nama === item.nama
      )

      if (sudahPunya) {
        return m.reply(
          header('SUDAH PUNYA') +
          `Kamu sudah memiliki ${item.emoji} *${item.nama}*.\n` +
          `━━━━━━━━━━━`
        )
      }

      if (userRPG.bank < item.harga) {
        return m.reply(
          header('SALDO KURANG') +
          `Butuh Rp ${item.harga.toLocaleString()}\n` +
          `Saldo kamu: Rp ${userRPG.bank.toLocaleString()}\n` +
          `━━━━━━━━━━━`
        )
      }

      userRPG.bank -= item.harga

      csm.inventory.push({
        nama: item.nama,
        dur: item.dur
      })

      saveDB(wdb)

      return m.reply(
        header('PEMBELIAN BERHASIL') +
        `${item.emoji} *${item.nama}*\n` +
        `DMG: +${item.dmg}\n` +
        `DUR: ${item.dur}\n` +
        `-Rp ${item.harga.toLocaleString()}\n\n` +
        `.csm equip ${item.nama}\n` +
        `━━━━━━━━━━━`
      )
    }

    if (args[1]?.toLowerCase() === 'info') {
      const namaItem = args.slice(2).join(' ').trim()

      if (!namaItem) {
        return m.reply(
          header('PENGGUNAAN') +
          `.csm shop info <nama senjata>\n` +
          `━━━━━━━━━━━`
        )
      }

      const item = WEAPON_LIST.find(
        w => w.nama.toLowerCase() === namaItem.toLowerCase()
      )

      if (!item) {
        return m.reply(
          header('ITEM TIDAK ADA') +
          `━━━━━━━━━━━`
        )
      }

      return m.reply(
        header(item.nama) +
        `${item.emoji}\n` +
        `DMG: ${item.dmg}\n` +
        `DUR: ${item.dur}\n` +
        `HARGA: Rp ${item.harga.toLocaleString()}\n` +
        `USER CANON: ${item.user}\n` +
        `MATERIAL: ${item.material}\n\n` +
        `${item.desc}\n` +
        `━━━━━━━━━━━`
      )
    }

    let cap = header('TOKO WEAPON')
    cap += `💰 Saldo Bank: Rp ${userRPG.bank.toLocaleString()}\n\n`

    cap += `*TIER 1: PEMULA 0 - 450K*\n`
    WEAPON_LIST
      .filter(w => w.harga <= 450000)
      .forEach(w => {
        cap += `${w.emoji} *${w.nama}* - Rp ${w.harga.toLocaleString()}\n`
      })

    cap += `\n*TIER 2: MENENGAH 550K - 1.2JT*\n`
    WEAPON_LIST
      .filter(w => w.harga > 450000 && w.harga <= 1200000)
      .forEach(w => {
        cap += `${w.emoji} *${w.nama}* - Rp ${w.harga.toLocaleString()}\n`
      })

    cap += `\n*TIER 3: SIGNATURE 1.5JT - 5JT*\n`
    WEAPON_LIST
      .filter(w => w.harga > 1200000 && w.harga <= 5000000)
      .forEach(w => {
        cap += `${w.emoji} *${w.nama}* - Rp ${w.harga.toLocaleString()}\n`
      })

    cap += `\n*TIER 4: DEWA 10JT*\n`
    WEAPON_LIST
      .filter(w => w.harga > 5000000)
      .forEach(w => {
        cap += `${w.emoji} *${w.nama}* - Rp ${w.harga.toLocaleString()}\n`
      })

    cap +=
      `\n📌 .csm shop buy <nama senjata>\n` +
      `📌 .csm shop info <nama senjata>\n` +
      `━━━━━━━━━━━`

    return m.reply(cap)
  }

  // ============================================================
  // === EQUIP ==================================================
  // ============================================================

  if (action === 'equip') {
    if (!Array.isArray(csm.inventory)) {
      csm.inventory = [{nama: 'Fist', dur: 999}]
    }

    const input = args.slice(1).join(' ').trim()

    if (!input) {
      return m.reply(
        header('PENGGUNAAN') +
        `.csm equip <nomor>\n` +
        `.csm equip <nama senjata>\n` +
        `━━━━━━━━━━━`
      )
    }

    let dataItem = null
    let invIndex = -1

    if (!isNaN(input)) {
      invIndex = parseInt(input, 10) - 1

      if (
        invIndex < 0 ||
        !csm.inventory[invIndex]
      ) {
        return m.reply(
          header('NOMOR SALAH') +
          `━━━━━━━━━━━`
        )
      }

      dataItem = WEAPON_LIST.find(
        w => w.nama === csm.inventory[invIndex].nama
      )
    } else {
      dataItem = WEAPON_LIST.find(
        w => w.nama.toLowerCase() === input.toLowerCase()
      )

      if (!dataItem) {
        return m.reply(
          header('ITEM TIDAK ADA') +
          `━━━━━━━━━━━`
        )
      }

      invIndex = csm.inventory.findIndex(
        w => w.nama === dataItem.nama
      )
    }

    if (!dataItem) {
      return m.reply(
        header('DATA SENJATA RUSAK') +
        `Weapon di inventory tidak dikenali.\n` +
        `━━━━━━━━━━━`
      )
    }

    if (invIndex < 0) {
      return m.reply(
        header('KAMU TIDAK PUNYA') +
        `Beli dulu di .csm shop\n` +
        `━━━━━━━━━━━`
      )
    }

    const item = csm.inventory.splice(invIndex, 1)[0]

    // Pastikan durability tidak corrupt.
    if (
      typeof item.dur !== 'number' ||
      item.dur < 0
    ) {
      item.dur = dataItem.dur
    }

    csm.inventory.unshift(item)

    csm.weapon = {
      nama: item.nama,
      dur: item.dur
    }

    saveDB(wdb)

    return m.reply(
      header('SENJATA DIPASANG') +
      `${dataItem.emoji} *${dataItem.nama}*\n` +
      `DMG: ${dataItem.dmg}\n` +
      `DUR: ${item.dur}/${dataItem.dur}\n` +
      `━━━━━━━━━━━`
    )
  }

  // ============================================================
  // === INVENTORY ===============================================
  // ============================================================

  if (action === 'inv') {
    if (!Array.isArray(csm.inventory)) {
      csm.inventory = [{nama: 'Fist', dur: 999}]
    }

    let cap = header('INVENTORY KAMU')

    if (csm.inventory.length === 0) {
      cap += `Kosong\n`
    }

    csm.inventory.forEach((w, i) => {
      const data = WEAPON_LIST.find(
        x => x.nama === w.nama
      )

      // Kalau data weapon lama sudah tidak ada di list,
      // jangan sampai command inventory crash.
      if (!data) {
        cap +=
          `*${i + 1}.* ⚠️ *${w.nama}* [DATA TIDAK DIKENAL]\n\n`
        return
      }

      const aktif = i === 0 ? ' [DIPAKAI]' : ''

      cap +=
        `*${i + 1}.* ${data.emoji} *${w.nama}*${aktif}\n` +
        ` [+${data.dmg}] Dur: ${w.dur}/${data.dur}\n\n`
    })

    cap +=
      `📌 .csm equip <nomor> - Pasang senjata\n` +
      `📌 .csm equip <nama> - Pasang senjata\n` +
      `━━━━━━━━━━━`

    return m.reply(cap)
  }

  // ============================================================
  // === REPAIR =================================================
  // ============================================================

  if (action === 'repair') {
    if (!csm.weapon || !csm.weapon.nama) {
      csm.weapon = {
        nama: 'Fist',
        dur: 999
      }
    }

    if (csm.weapon.nama === 'Fist') {
      return m.reply(
        header('TIDAK BISA') +
        `Fist tidak perlu di-repair.\n` +
        `━━━━━━━━━━━`
      )
    }

    const dataItem = WEAPON_LIST.find(
      w => w.nama === csm.weapon.nama
    )

    if (!dataItem) {
      return m.reply(
        header('WEAPON ERROR') +
        `Data ${csm.weapon.nama} tidak ditemukan.\n` +
        `Equip weapon lain terlebih dahulu.\n` +
        `━━━━━━━━━━━`
      )
    }

    const biaya = Math.floor(dataItem.harga * 0.3)

    if (userRPG.bank < biaya) {
      return m.reply(
        header('DUIT KURANG') +
        `Butuh Rp ${biaya.toLocaleString()}\n` +
        `Saldo: Rp ${userRPG.bank.toLocaleString()}\n` +
        `━━━━━━━━━━━`
      )
    }

    const inv = csm.inventory.find(
      x => x.nama === csm.weapon.nama
    )

    if (!inv) {
      return m.reply(
        header('WEAPON TIDAK ADA') +
        `Senjata aktif tidak ditemukan di inventory.\n` +
        `Gunakan .csm equip untuk memilih weapon lain.\n` +
        `━━━━━━━━━━━`
      )
    }

    userRPG.bank -= biaya

    inv.dur = dataItem.dur
    csm.weapon.dur = dataItem.dur

    saveDB(wdb)

    return m.reply(
      header('BERHASIL DI-REPAIR') +
      `${dataItem.emoji} *${dataItem.nama}*\n` +
      `Durability: FULL\n` +
      `-Rp ${biaya.toLocaleString()}\n` +
      `━━━━━━━━━━━`
    )
  }

  // ============================================================
  // === CONTRACT ================================================
  // ============================================================

  if (action === 'contract') {
    if (!Array.isArray(csm.contractHistory)) {
      csm.contractHistory = []
    }

    if (args[1]?.toLowerCase() === 'history') {
      let cap = header('RIWAYAT KONTRAK')

      if (csm.contractHistory.length === 0) {
        cap += `Belum ada riwayat kontrak.\n`
      } else {
        csm.contractHistory
          .slice(-10)
          .reverse()
          .forEach((c, i) => {
            cap += `${i + 1}. ${c}\n`
          })
      }

      return m.reply(
        cap +
        `━━━━━━━━━━━`
      )
    }

    const type = args[1]?.toLowerCase()

    if (!type || !['fiend', 'devil'].includes(type)) {
      return m.reply(
        header('PENGGUNAAN') +
        `.csm contract fiend - 10.000 Darah\n` +
        `.csm contract devil - 50.000 Darah\n` +
        `.csm contract history\n` +
        `━━━━━━━━━━━`
      )
    }

    const cost = type === 'devil'
      ? 50000
      : 10000

    if (csm.blood < cost) {
      return m.reply(
        header('DARAH KURANG') +
        `Butuh ${cost.toLocaleString()} Darah\n` +
        `━━━━━━━━━━━`
      )
    }

    if (cekCD('lastGacha', 300000) > 0) {
      return m.reply(
        header('COOLDOWN') +
        `Tunggu ${Math.ceil(
          cekCD('lastGacha', 300000) / 60000
        )} menit\n` +
        `━━━━━━━━━━━`
      )
    }

    csm.blood -= cost

    const rate = Math.random()

    let pool

    if (rate < 0.50) {
      pool = DEVIL_LIST.filter(
        d => ['E', 'D'].includes(d.rank)
      )
    } else if (rate < 0.80) {
      pool = DEVIL_LIST.filter(
        d => ['C', 'B'].includes(d.rank)
      )
    } else if (rate < 0.95) {
      pool = DEVIL_LIST.filter(
        d => ['A', 'S'].includes(d.rank)
      )
    } else {
      pool = DEVIL_LIST.filter(
        d => ['SS', 'SSS'].includes(d.rank)
      )
    }

    // Fallback kalau rank tertentu tidak tersedia.
    if (!pool.length) {
      pool = DEVIL_LIST
    }

    const devil =
      pool[Math.floor(Math.random() * pool.length)]

    if (csm.devilContract) {
      csm.contractHistory.push(
        csm.devilContract
      )
    }

    if (csm.contractHistory.length > 10) {
      csm.contractHistory.shift()
    }

    csm.devilContract = devil.nama
    csm.isTransform = true
    csm.lastGacha = Date.now()

    saveDB(wdb)

    return m.reply(
      header(`KONTRAK ${type.toUpperCase()} BARU`) +
      `${devil.emoji} *${devil.nama}* [${devil.rank}]\n` +
      `-${cost.toLocaleString()} Darah\n` +
      `✅ Auto Transform Aktif\n` +
      `━━━━━━━━━━━`
    )
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
        `• Kontrak\n\n` +
        `Data yang TETAP:\n` +
        `• Level\n` +
        `• EXP\n` +
        `• Buff Ending\n\n` +
        `📌 .csm reset confirm - Setuju reset\n` +
        `📌 .csm reset cancel - Batal\n` +
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

    if (sub !== 'confirm') {
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
    csm.location = 'Headquarters'

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
        `Gunakan .csm reset untuk memulai ulang.\n` +
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
        `> Bonus: Summon 1 Devil/fight, Title: Horseman of Fear\n\n`

      cap +=
        `*3.* 🏛️ CONTROL\n` +
        `"Kalau kacau terus, ga akan ada yg selamat. Aku akan atur semuanya."\n` +
        `> Bonus: Gaji +Rp 50k/hari, Title: Public Safety Dog\n\n`

      cap +=
        `*4.* 🩸 SACRIFICE\n` +
        `"Aki... Power... lari. Aku yg nahan di sini."\n` +
        `> Bonus: Revive 1x gratis, Semua partner DMG +50%, -50 MaxHP\n\n`

      cap +=
        `*5.* 💕 LOVE\n` +
        `"Aku capek berantem... aku cuma mau pulang. ` +
        `Mau makan, mau tidur, mau dipeluk."\n` +
        `> Bonus: Full Heal tiap hari, Rate gacha partner +100%, DMG -20%\n\n`

      cap +=
        `*6.* 🗡️ REVENGE\n` +
        `"Aku akan bunuh semua yg nyakitin aku."\n` +
        `> Bonus: DMG +50% permanen, Gabisa heal, Title: Vengeance Devil\n\n`

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

      csm.maxHealth = Math.max(
        1,
        csm.maxHealth - 50
      )

      csm.health = Math.min(
        csm.health,
        csm.maxHealth
      )

      csm.partners.forEach(p => {
        p.bond = 100
      })

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

    return m.reply(
      cap +
      `\n━━━━━━━━━━━`
    )
  }

  // ============================================================
  // === CONVERT DARAH ==========================================
  // ============================================================

  if (action === 'blood') {
    const bloodUser = global.db.data.users[m.sender]

    if (!bloodUser?.rpg) {
      return m.reply(
        header('DATA RPG ERROR') +
        `Data RPG tidak ditemukan.\n` +
        `━━━━━━━━━━━`
      )
    }

    if (args[1]?.toLowerCase() === 'deal') {
      if (!csm.pendingBlood || csm.pendingBlood <= 0) {
        return m.reply(
          header('TIDAK ADA') +
          `Gunakan .csm blood <jumlah> dulu.\n` +
          `━━━━━━━━━━━`
        )
      }

      const harga = csm.pendingBlood * 1500

      if (bloodUser.bank < harga) {
        return m.reply(
          header('SALDO KURANG') +
          `Butuh Rp ${harga.toLocaleString()}\n` +
          `Saldo: Rp ${bloodUser.bank.toLocaleString()}\n` +
          `━━━━━━━━━━━`
        )
      }

      bloodUser.bank -= harga

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

      return m.reply(
        header('DIBATALKAN') +
        `━━━━━━━━━━━`
      )
    }

    const money = parseInt(args[1], 10)

    if (!money || money < 1500) {
      return m.reply(
        header('JUMLAH SALAH') +
        `Contoh: .csm blood 15000\n` +
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
      `Ketik .csm blood deal untuk konfirmasi.\n` +
      `Ketik .csm blood cancel untuk batal.\n` +
      `━━━━━━━━━━━`
    )
  }

  // === GENDER HUNTER ==========================================
  if (action === 'gender' || action === 'kelamin') {
    let genderInput = (args[1] || '').toLowerCase()
    if (!['pria', 'wanita', 'cowok', 'cewek', 'laki-laki', 'perempuan', 'male', 'female'].includes(genderInput)) {
      return m.reply(
        header('PILIH GENDER HUNTER') +
        `Pilih gender karakter Chainsaw Man kamu:\n` +
        `• *.csm gender pria* / *.csm gender cowok*\n` +
        `• *.csm gender wanita* / *.csm gender cewek*\n\n` +
        `Gender saat ini: *${csm.gender || 'Laki-Laki ♂️'}*\n` +
        `━━━━━━━━━━━`
      )
    }

    let g = ['pria', 'cowok', 'laki-laki', 'male'].includes(genderInput) ? 'Laki-Laki ♂️' : 'Perempuan ♀️'
    csm.gender = g
    saveDB(wdb)

    return m.reply(
      header('GENDER DIUBAH') +
      `Identitas Hunter kamu kini terdaftar sebagai *${g}*!\n` +
      `━━━━━━━━━━━`
    )
  }

  // ============================================================
  // === STORY ==================================================
  // ============================================================

  if (action === 'story') {
    const story = STORY_LIST.find(
      s => s.no === csm.story
    )

    if (!story) {
      return m.reply(
        header('TAMAT') +
        `Selamat! Kamu sudah menyelesaikan semua Arc Chainsaw Man.\n` +
        `━━━━━━━━━━━`
      )
    }

    if (csm.health < 20) {
      return m.reply(
        header('HP KURANG') +
        `Butuh minimal 20 HP untuk story.\n` +
        `━━━━━━━━━━━`
      )
    }

    csm.health -= 20

    const winRate = Math.min(
      0.95,
      0.3 +
      csm.level * 0.02 +
      csm.partners.length * 0.05
    )

    const win = Math.random() < winRate

    const devil = DEVIL_LIST.find(
      d => d.nama === story.devil
    )

    const devilName = devil?.nama || story.devil
    const devilEmoji = devil?.emoji || '👹'

    if (win) {
      csm.story++

      csm.blood += story.reward

      const leveled = addExp(500)

      saveDB(wdb)

      let msg =
        header(`📖 ${story.nama}`) +
        `✅ KEMENANGAN\n\n` +
        `${story.desc}\n` +
        `${devilEmoji} *${devilName}* dikalahkan!\n\n` +
        `🩸 +${story.reward} Darah\n` +
        `📈 +500 EXP\n`

      if (leveled) {
        msg += `🎉 LEVEL UP! Lv.${csm.level}\n`
      }

      msg +=
        `➡️ Arc Berikutnya Terbuka\n` +
        `━━━━━━━━━━━`

      return m.reply(msg)
    }

    csm.health = Math.max(
      1,
      csm.health - 10
    )

    saveDB(wdb)

    return m.reply(
      header('GAGAL') +
      `Kamu kalah melawan ${devilName}.\n` +
      `❤️ -30 HP total\n` +
      `Naikkan level dan rekrut partner dulu!\n` +
      `━━━━━━━━━━━`
    )
  }

  // ============================================================
  // === MISSION FARM ===========================================
  // ============================================================

  if (action === 'mission') {
    if (csm.health < 10) {
      return m.reply(
        header('HP KURANG') +
        `Butuh minimal 10 HP.\n` +
        `━━━━━━━━━━━`
      )
    }

    if (!Array.isArray(csm.inventory) || !csm.inventory.length) {
      csm.inventory = [
        {
          nama: 'Fist',
          dur: 999
        }
      ]
    }

    const devil =
      DEVIL_LIST[
        Math.floor(Math.random() * DEVIL_LIST.length)
      ]

    const weapon =
      csm.inventory[0] || {
        nama: 'Fist',
        dur: 999
      }

    const weaponData =
      WEAPON_LIST.find(
        w => w.nama === weapon.nama
      ) || WEAPON_LIST[0]

    let dmg =
      Math.floor(Math.random() * 20) +
      csm.level * 5 +
      weaponData.dmg

    if (
      csm.devilContract === 'Chainsaw Devil'
    ) {
      dmg *= 2
    }

    dmg += csm.partners.length * 15

    csm.health = Math.max(
      1,
      csm.health - 10
    )

    if (devil.hp <= dmg) {
      const rusak = damageWeapon()

      csm.devilsKilled++

      csm.blood += devil.blood + 100

      const leveled = addExp(devil.exp)

      saveDB(wdb)

      let msg =
        header('MISSION BERHASIL') +
        `${devil.emoji} *${devil.nama}* dikalahkan!\n\n` +
        `🩸 +${devil.blood + 100} Darah\n` +
        `📈 +${devil.exp} EXP`

      if (leveled) {
        msg +=
          `\n🎉 LEVEL UP! Lv.${csm.level}`
      }

      if (rusak) {
        msg +=
          `\n⚠️ *${rusak}* PATAH!`
      }

      return m.reply(
        msg +
        `\n━━━━━━━━━━━`
      )
    }
    
    

    saveDB(wdb)

    return m.reply(
      header('MISSION GAGAL') +
      `Kamu kalah melawan ${devil.nama}.\n` +
      `❤️ -10 HP\n` +
      `━━━━━━━━━━━`
    )
  }
  
    // ============================================================
  // === PROFILE =================================================
  // ============================================================

  if (action === 'profile') {
    // Repair data lama kalau inventory pernah kosong/corrupt.
    if (!Array.isArray(csm.inventory) || csm.inventory.length === 0) {
      csm.inventory = [
        {
          nama: 'Fist',
          dur: 999
        }
      ]
    }

    if (!Array.isArray(csm.partners)) {
      csm.partners = []
    }

    if (!Array.isArray(csm.contractHistory)) {
      csm.contractHistory = []
    }

    if (!csm.weapon || !csm.weapon.nama) {
      csm.weapon = {
        nama: 'Fist',
        dur: 999
      }
    }

    const weapon = csm.inventory[0] || {
      nama: 'Fist',
      dur: 999
    }

    const weaponData =
      WEAPON_LIST.find(
        w => w.nama === weapon.nama
      ) || {
        nama: weapon.nama || 'Fist',
        dmg: 0,
        emoji: '👊',
        dur: weapon.dur || 999
      }

    const winrate =
      csm.devilsKilled > 0
        ? Math.min(
            100,
            Math.floor(
              Math.max(0, csm.story - 1) / 14 * 100
            )
          )
        : 0

    let cap = header('PROFILE HUNTER')

    cap +=
      `👤 *${csm.nickname || conn.getName(m.sender)}* | ` +
      `${csm.title || getTitle(csm.level)}\n`

    cap +=
      `📊 Lv.${csm.level} | ` +
      `📈 EXP: ${csm.exp}/${csm.level * 300}\n`

    cap +=
      `❤️ ${csm.health}/${csm.maxHealth} | ` +
      `📍 ${csm.location || 'Headquarters'}\n`

    cap +=
      `🩸 ${Number(csm.blood || 0).toLocaleString()} Darah\n`

    cap +=
      `💰 Rp ${Number(userRPG.bank || 0).toLocaleString()} Bank\n`

    cap +=
      `⚔️ ${weaponData.emoji} ${weapon.nama} ` +
      `[Dur: ${weapon.dur}] ` +
      `| 👥 ${csm.partners.length}/3 Partner\n`

    cap +=
      `⛓️ Kontrak: ` +
      `${csm.devilContract || 'Tidak Ada'}\n`

    cap +=
      `📖 Story: ${Math.min(csm.story, 14)}/14 ` +
      `| 👹 Devils Killed: ${csm.devilsKilled || 0}\n`

    cap +=
      `📊 Progress Story: ${winrate}%\n`

    if (csm.job) {
      cap += `💼 Job: ${csm.job}\n`
    }

    if (csm.ending) {
      cap += `🏆 Ending: ${csm.ending}\n`
    }

    cap += `━━━━━━━━━━━`

    saveDB(wdb)

    return m.reply(cap)
  }


  // ============================================================
  // === JOB SYSTEM ==============================================
  // ============================================================
  // JOB_LIST HARUS DIDEKLARASIKAN SEBELUM DIPAKAI.
  // Source lama mendeklarasikannya setelah handler job,
  // sehingga const masih berada dalam Temporal Dead Zone.

  const JOB_LIST = [
    'Public Safety Devil Hunter',
    'Private Devil Hunter',
    'Civilian Devil Hunter',
    'Devil Hunter High School Student',
    'Yakuza / Mafia Member',
    'International Assassin',
    'Government Agent',
    'Chainsaw Man Church Leader',
    'Police Officer',
    'Fiend / Hybrid Combatant'
  ]


  // ============================================================
  // === JOB LIST =================================================
  // ============================================================

  if (
    action === 'job' &&
    args[1]?.toLowerCase() === 'list'
  ) {
    let cap = header('PILIH PEKERJAAN')

    JOB_LIST.forEach((job, i) => {
      cap += `*${i + 1}.* ${job}\n`
    })

    cap +=
      `\n📌 .csm job join <nomor/nama>\n` +
      `📌 .csm job leave\n` +
      `━━━━━━━━━━━`

    return m.reply(cap)
  }


  // ============================================================
  // === JOB JOIN ================================================
  // ============================================================

  if (
    action === 'job' &&
    args[1]?.toLowerCase() === 'join'
  ) {
    if (csm.job) {
      return m.reply(
        header('SUDAH PUNYA JOB') +
        `Kamu sedang bekerja sebagai:\n` +
        `💼 *${csm.job}*\n\n` +
        `Gunakan .csm job leave jika ingin resign.\n` +
        `━━━━━━━━━━━`
      )
    }

    const cd = cekCD(
      'lastJob',
      5 * 60 * 60 * 1000
    )

    if (cd > 0) {
      const jam = Math.floor(cd / 3600)
      const menit = Math.floor((cd % 3600) / 60)

      return m.reply(
        header('COOLDOWN') +
        `Tunggu ${jam}j ${menit}m lagi.\n` +
        `━━━━━━━━━━━`
      )
    }

    const input = args.slice(2).join(' ').trim()

    if (!input) {
      return m.reply(
        header('PENGGUNAAN') +
        `.csm job list\n` +
        `.csm job join <nomor>\n` +
        `.csm job join <nama job>\n` +
        `━━━━━━━━━━━`
      )
    }

    let job = null

    if (/^\d+$/.test(input)) {
      const index = parseInt(input, 10) - 1
      job = JOB_LIST[index]
    } else {
      job = JOB_LIST.find(
        j => j.toLowerCase() === input.toLowerCase()
      )
    }

    if (!job) {
      return m.reply(
        header('JOB TIDAK ADA') +
        `Gunakan .csm job list untuk melihat semua job.\n` +
        `━━━━━━━━━━━`
      )
    }

    csm.job = job
    csm.lastJob = Date.now()

    saveDB(wdb)

    return m.reply(
      header('KERJA DIMULAI') +
      `💼 Kamu sekarang: *${job}*\n\n` +
      `Gaji bisa didapat melalui:\n` +
      `.csm work\n` +
      `━━━━━━━━━━━`
    )
  }


  // ============================================================
  // === JOB LEAVE ===============================================
  // ============================================================

  if (
    action === 'job' &&
    args[1]?.toLowerCase() === 'leave'
  ) {
    if (!csm.job) {
      return m.reply(
        header('BELUM PUNYA JOB') +
        `Kamu sedang tidak bekerja.\n` +
        `━━━━━━━━━━━`
      )
    }

    const jobLama = csm.job

    csm.job = null
    csm.lastJob = Date.now()

    saveDB(wdb)

    return m.reply(
      header('BERHENTI KERJA') +
      `Kamu resign dari:\n` +
      `💼 *${jobLama}*\n` +
      `━━━━━━━━━━━`
    )
  }


  // ============================================================
  // === WORK ====================================================
  // ============================================================

  if (action === 'work') {
    if (!csm.job) {
      return m.reply(
        header('BELUM PUNYA JOB') +
        `.csm job join <nomor/nama>\n` +
        `━━━━━━━━━━━`
      )
    }

    // 2 jam cooldown.
    const cd = cekCD(
      'lastWork',
      2 * 60 * 60 * 1000
    )

    if (cd > 0) {
      const jam = Math.floor(cd / 3600)
      const menit = Math.floor((cd % 3600) / 60)

      return m.reply(
        header('COOLDOWN') +
        `Tunggu ${jam}j ${menit}m lagi.\n` +
        `━━━━━━━━━━━`
      )
    }

    const gaji =
      Math.floor(Math.random() * 10000) +
      5000 +
      csm.level * 2000

    const exp = 50 + csm.level * 5

    csm.blood += gaji

    const leveled = addExp(exp)

    csm.lastWork = Date.now()

    saveDB(wdb)

    let msg =
      header(`KERJA: ${csm.job}`) +
      `Kamu bekerja hari ini.\n\n` +
      `🩸 +${gaji.toLocaleString()} Darah\n` +
      `📈 +${exp} EXP\n`

    if (leveled) {
      msg +=
        `🎉 LEVEL UP!\n` +
        `📊 Sekarang Lv.${csm.level}\n`
    }

    msg += `━━━━━━━━━━━`

    return m.reply(msg)
  }


  // ============================================================
  // === MAKIMA CALL EVENT =======================================
  // ============================================================

  if (action === 'makimacall') {
    // 15% chance mendapat panggilan.
    if (Math.random() > 0.15) {
      return m.reply(
        header('TIDAK ADA PANGGILAN') +
        `Makima sedang sibuk.\n` +
        `Coba lagi nanti.\n` +
        `━━━━━━━━━━━`
      )
    }

    // Ambil hanya user lain yang benar-benar punya CSM.
    const targets = Object.keys(wdb.users).filter(
      uid =>
        uid !== m.sender &&
        wdb.users[uid]?.rpg?.csm
    )

    if (!targets.length) {
      return m.reply(
        header('TIDAK ADA TARGET') +
        `Tidak ada Hunter lain yang bisa menjadi target.\n` +
        `━━━━━━━━━━━`
      )
    }

    // BUG SOURCE LAMA:
    // index random memakai Object.keys(wdb.users).length,
    // padahal array yang dipilih adalah targets.
    const target =
      targets[
        Math.floor(Math.random() * targets.length)
      ]

    csm.pendingDuel = target

    saveDB(wdb)

    return m.reply(
      header('PANGGILAN DARI MAKIMA') +
      `⛓️ "Anjing yang baik itu nurut."\n\n` +
      `Bunuh *${conn.getName(target)}* dalam 1 jam.\n\n` +
      `🎁 Hadiah:\n` +
      `💰 Rp 500.000\n` +
      `🩸 +5.000 Darah\n\n` +
      `❌ Gagal:\n` +
      `🩸 -10.000 Darah\n\n` +
      `.csm duel @${target.split('@')[0]} - Terima\n` +
      `.csm refuse - Tolak\n` +
      `━━━━━━━━━━━`
    )
  }


  // ============================================================
  // === REFUSE MAKIMA ==========================================
  // ============================================================

  if (action === 'refuse') {
    if (!csm.pendingDuel) {
      return m.reply(
        header('TIDAK ADA PERINTAH') +
        `Tidak ada perintah Makima yang sedang aktif.\n` +
        `━━━━━━━━━━━`
      )
    }

    if (csm.blood < 10000) {
      return m.reply(
        header('DARAH KURANG') +
        `Butuh 10.000 Darah untuk menolak perintah.\n` +
        `━━━━━━━━━━━`
      )
    }

    csm.blood -= 10000
    csm.pendingDuel = null

    saveDB(wdb)

    return m.reply(
      header('PENOLAKAN') +
      `⛓️ "Kecewa aku..."\n\n` +
      `🩸 -10.000 Darah\n` +
      `━━━━━━━━━━━`
    )
  }


  // ============================================================
  // === DUEL PVP ================================================
  // ============================================================

  if (action === 'duel') {
    const target = m.mentionedJid?.[0]

    if (!target) {
      return m.reply(
        header('TAG ORANGNYA') +
        `Contoh:\n` +
        `.csm duel @tag\n` +
        `━━━━━━━━━━━`
      )
    }

    if (target === m.sender) {
      return m.reply(
        header('TIDAK BISA') +
        `Kamu tidak bisa duel melawan diri sendiri.\n` +
        `━━━━━━━━━━━`
      )
    }

    const targetRPG =
      wdb.users[target]?.rpg

    const tUser =
      targetRPG?.csm

    if (!tUser) {
      return m.reply(
        header('TARGET BELUM MAIN') +
        `━━━━━━━━━━━`
      )
    }

    if (!Array.isArray(tUser.inventory) || !tUser.inventory.length) {
      tUser.inventory = [
        {
          nama: 'Fist',
          dur: 999
        }
      ]
    }

    if (!tUser.weapon || !tUser.weapon.nama) {
      tUser.weapon = {
        nama: 'Fist',
        dur: 999
      }
    }

    // ==========================================================
    // MAKIMA DUEL
    // ==========================================================

    if (csm.pendingDuel === target) {
      const chance =
        csm.level >= tUser.level
          ? 0.7
          : 0.3

      const win = Math.random() < chance

      if (win) {
        userRPG.bank += 500000
        csm.blood += 5000
        csm.pendingDuel = null

        saveDB(wdb)

        return m.reply(
          header('DUEL MENANG') +
          `Kamu berhasil menyelesaikan perintah Makima.\n\n` +
          `💰 +Rp 500.000\n` +
          `🩸 +5.000 Darah\n` +
          `━━━━━━━━━━━`
        )
      }

      csm.blood = Math.max(
        0,
        csm.blood - 10000
      )

      csm.pendingDuel = null

      saveDB(wdb)

      return m.reply(
        header('DUEL KALAH') +
        `Kamu gagal menjalankan perintah Makima.\n\n` +
        `🩸 -10.000 Darah\n` +
        `━━━━━━━━━━━`
      )
    }


    // ==========================================================
    // DUEL BIASA
    // ==========================================================

    const taruhan =
      Math.max(
        0,
        parseInt(args[2], 10) || 0
      )

    if (taruhan > 0) {
      if (
        userRPG.bank < taruhan ||
        targetRPG.bank < taruhan
      ) {
        return m.reply(
          header('SALDO KURANG') +
          `Kedua pemain harus punya saldo yang cukup.\n` +
          `━━━━━━━━━━━`
        )
      }
    }

    const myWeapon =
      WEAPON_LIST.find(
        w => w.nama === csm.weapon.nama
      ) || {
        dmg: 0,
        nama: csm.weapon.nama || 'Fist'
      }

    const enemyWeapon =
      WEAPON_LIST.find(
        w => w.nama === tUser.weapon.nama
      ) || {
        dmg: 0,
        nama: tUser.weapon.nama || 'Fist'
      }

    const dmg1 =
      csm.level * 10 +
      myWeapon.dmg

    const dmg2 =
      tUser.level * 10 +
      enemyWeapon.dmg

    // Kalau damage sama, gunakan random supaya tidak selalu
    // pemain pertama menang.
    const win =
      dmg1 === dmg2
        ? Math.random() < 0.5
        : dmg1 > dmg2

    if (taruhan > 0) {
      if (win) {
        userRPG.bank += taruhan
        targetRPG.bank -= taruhan
      } else {
        userRPG.bank -= taruhan
        targetRPG.bank += taruhan
      }
    }

    saveDB(wdb)

    return m.reply(
      header('HASIL DUEL') +
      `${win ? '🏆 KAMU MENANG' : '💀 KAMU KALAH'}\n\n` +
      `⚔️ DMG Kamu: ${dmg1}\n` +
      `⚔️ DMG Lawan: ${dmg2}\n` +
      (
        taruhan > 0
          ? `💰 Taruhan: Rp ${taruhan.toLocaleString()}\n`
          : ``
      ) +
      `━━━━━━━━━━━`
    )
  }


  // ============================================================
  // === GIFT ====================================================
  // ============================================================

  if (action === 'gift') {
    const type =
      args[1]?.toLowerCase()

    const target =
      m.mentionedJid?.[0]

    const jumlah =
      parseInt(
        args[2],
        10
      )

    if (
      !target ||
      !jumlah ||
      jumlah <= 0 ||
      !['bank', 'darah'].includes(type)
    ) {
      return m.reply(
        header('PENGGUNAAN') +
        `.csm gift bank @tag 10000\n` +
        `.csm gift darah @tag 100\n` +
        `━━━━━━━━━━━`
      )
    }

    if (target === m.sender) {
      return m.reply(
        header('TIDAK BISA') +
        `Kamu tidak bisa mengirim gift ke diri sendiri.\n` +
        `━━━━━━━━━━━`
      )
    }

    const targetRPG =
      wdb.users[target]?.rpg

    if (!targetRPG) {
      return m.reply(
        header('TARGET BELUM MAIN') +
        `━━━━━━━━━━━`
      )
    }

    if (!targetRPG.csm) {
      targetRPG.csm = {
        nickname: '',
        health: 100,
        maxHealth: 100,
        level: 1,
        exp: 0,
        title: 'Rookie Hunter',
        devilContract: null,
        contractHistory: [],
        isTransform: false,
        devilsKilled: 0,
        blood: 0,
        partners: [],
        story: 1,
        location: 'Headquarters',
        weapon: {
          nama: 'Fist',
          dur: 999
        },
        inventory: [
          {
            nama: 'Fist',
            dur: 999
          }
        ],
        lastRest: 0,
        lastGacha: 0,
        lastVisit: 0,
        encounter: null,
        relations: {},
        pendingBlood: 0,
        lastWork: 0,
        pendingDuel: null,
        contractExpire: 0,
        contractSide: null,
        ending: null,
        hospital: [],
        job: null,
        lastJob: 0,
        endings: []
      }
    }

    if (type === 'bank') {
      if (userRPG.bank < jumlah) {
        return m.reply(
          header('SALDO KURANG') +
          `━━━━━━━━━━━`
        )
      }

      userRPG.bank -= jumlah
      targetRPG.bank += jumlah
    } else {
      if (csm.blood < jumlah) {
        return m.reply(
          header('DARAH KURANG') +
          `━━━━━━━━━━━`
        )
      }

      csm.blood -= jumlah
      targetRPG.csm.blood += jumlah
    }

    saveDB(wdb)

    return m.reply(
      header('GIFT TERKIRIM') +
      `Kamu mengirim ` +
      `${jumlah.toLocaleString()} ${type} ` +
      `ke ${conn.getName(target)}\n` +
      `━━━━━━━━━━━`
    )
  }


  // ============================================================
  // === CHARACTER DETAIL =======================================
  // ============================================================

  if (action === 'char') {
    if (!Array.isArray(csm.relations)) {
      if (!csm.relations || typeof csm.relations !== 'object') {
        csm.relations = {}
      }
    }

    const namaChar =
      args.slice(1).join(' ').trim()

    if (!namaChar) {
      return m.reply(
        header('PENGGUNAAN') +
        `.csm char <nama karakter>\n` +
        `Contoh: .csm char Reze\n` +
        `━━━━━━━━━━━`
      )
    }

    const char =
      CHARACTER_LIST.find(
        c =>
          c.nama.toLowerCase() ===
          namaChar.toLowerCase()
      )

    if (!char) {
      return m.reply(
        header('KARAKTER TIDAK ADA') +
        `Contoh: .csm char Reze\n` +
        `━━━━━━━━━━━`
      )
    }

    const love =
      Number(csm.relations[char.nama] || 0)

    return m.reply(
      header(char.nama) +
      `${char.emoji} *${char.role}*\n\n` +
      `🏴 Faksi: ${char.faction}\n` +
      `🧬 Status: ${char.status}\n` +
      `📍 Lokasi: ${char.lokasi.join(', ')}\n` +
      `💌 Hubungan: ${love}/${char.needLove}\n` +
      `🎁 Bonus: ${char.bonus}\n\n` +
      `━━━━━━━━━━━`
    )
  }


  // ============================================================
  // === REST ====================================================
  // ============================================================

  if (action === 'rest') {
    const cd = cekCD(
      'lastRest',
      60 * 60 * 1000
    )

    if (cd > 0) {
      const menit =
        Math.ceil(cd / 60)

      return m.reply(
        header('COOLDOWN') +
        `Tunggu ${menit} menit lagi.\n` +
        `━━━━━━━━━━━`
      )
    }

    const heal =
      Math.floor(
        csm.maxHealth * 0.4
      )

    const hpSebelum =
      csm.health

    csm.health =
      Math.min(
        csm.maxHealth,
        csm.health + heal
      )

    const actualHeal =
      csm.health - hpSebelum

    csm.lastRest = Date.now()

    saveDB(wdb)

    return m.reply(
      header('ISTIRAHAT') +
      `Kamu beristirahat sejenak.\n` +
      `❤️ +${actualHeal} HP\n` +
      `❤️ HP: ${csm.health}/${csm.maxHealth}\n` +
      `━━━━━━━━━━━`
    )
  }
  
    // ============================================================
  // === RAID GLOBAL 1x SEHARI =================================
  // ============================================================

  if (action === 'raid') {
    const sub = (args[1] || '').toLowerCase()

    // ----------------------------------------------------------
    // INIT RAID DATABASE
    // ----------------------------------------------------------

    if (!wdb.raid || typeof wdb.raid !== 'object') {
      wdb.raid = {
        boss: null,
        players: [],
        date: '',
        history: []
      }
    }

    const raid = wdb.raid

    if (!Array.isArray(raid.players)) {
      raid.players = []
    }

    if (!Array.isArray(raid.history)) {
      raid.history = []
    }

    const today = new Date()
      .toISOString()
      .split('T')[0]


    // ----------------------------------------------------------
    // BOSS LIST
    // ----------------------------------------------------------

    const BOSS_LIST = [
      // =========================
      // 12 DEVIL CANON
      // =========================

      {
        nama: 'Bat Devil',
        hp: 2000,
        exp: 500,
        blood: 2000,
        emoji: '🦇',
        story: [
          'Gedung ini berbau darah.',
          'Bat Devil menggantung di langit-langit.',
          'Dia membuka mulutnya... lebar sekali.',
          'Denji maju tanpa rasa takut. "Pochita, giliran kita."'
        ]
      },

      {
        nama: 'Eternity Devil',
        hp: 10000,
        exp: 2000,
        blood: 10000,
        emoji: '♾️',
        story: [
          'Pintu hotel tidak bisa dibuka.',
          'Hari ke 10. Makanan habis.',
          'Ada yang mulai makan temannya.',
          'Denji tersenyum. "Kalau gitu... kita potong hotelnya saja."'
        ]
      },

      {
        nama: 'Katana Man',
        hp: 15000,
        exp: 3000,
        blood: 15000,
        emoji: '🗡️',
        story: [
          'Peti mati terbuka.',
          'Darah menyembur dari dalam.',
          'Katana Man berdiri dengan katana di tangannya.',
          'Dia berbisik: "Ini untuk Yakuza."'
        ]
      },

      {
        nama: 'Bomb Girl Reze',
        hp: 18000,
        exp: 4000,
        blood: 20000,
        emoji: '💣',
        story: [
          'Reze tersenyum padamu.',
          'Jantungmu berdetak kencang.',
          'Tiba-tiba dia meledak.',
          'Cinta dan kehancuran adalah hal yang sama.'
        ]
      },

      {
        nama: 'Hell Devil',
        hp: 25000,
        exp: 5000,
        blood: 30000,
        emoji: '🔥',
        story: [
          'Tanah terbelah.',
          'Tangan raksasa dari neraka meraih.',
          'Suhu naik 100 derajat.',
          'Makima berbisik: "Kirim dia pulang."'
        ]
      },

      {
        nama: 'Darkness Devil',
        hp: 50000,
        exp: 10000,
        blood: 50000,
        emoji: '🌑',
        story: [
          'Semua lampu mati.',
          'Kau tidak bisa melihat tanganmu sendiri.',
          'Suara bisikan dari segala arah.',
          'Rasa takut merayap ke tulang.'
        ]
      },

      {
        nama: 'Gun Devil',
        hp: 100000,
        exp: 20000,
        blood: 100000,
        emoji: '🔫',
        story: [
          '1.2 Juta jiwa hilang dalam 5 menit.',
          'Langit dipenuhi peluru.',
          'Bangunan runtuh seperti kertas.',
          'Ini bukan devil. Ini bencana.'
        ]
      },

      {
        nama: 'Control Devil',
        hp: 80000,
        exp: 15000,
        blood: 80000,
        emoji: '⛓️',
        story: [
          'Makima melepas kacamatanya.',
          'Semua orang di sekitarmu berlutut.',
          'Kau merasa ingin nurut.',
          'Kebebasan... apa itu?'
        ]
      },

      {
        nama: 'War Devil',
        hp: 70000,
        exp: 12000,
        blood: 70000,
        emoji: '⚔️',
        story: [
          'Yoru mengangkat tangannya ke langit.',
          'Tank jadi palu. Pesawat jadi pedang.',
          'Asa berteriak: "Berhenti!"',
          'Tapi perang sudah dimulai.'
        ]
      },

      {
        nama: 'Famine Devil',
        hp: 90000,
        exp: 18000,
        blood: 90000,
        emoji: '🍖',
        story: [
          'Perutmu keroncongan.',
          'Semua makanan di kota menghilang.',
          'Orang-orang mulai memakan diri sendiri.',
          'Kelaparan adalah siksaan terlama.'
        ]
      },

      {
        nama: 'Falling Devil',
        hp: 60000,
        exp: 11000,
        blood: 60000,
        emoji: '🪽',
        story: [
          'Lantai menghilang.',
          'Kau jatuh. Terus jatuh.',
          'Tidak ada bawah.',
          'Hanya keputusasaan tanpa akhir.'
        ]
      },

      {
        nama: 'Death Devil',
        hp: 150000,
        exp: 30000,
        blood: 150000,
        emoji: '💀',
        story: [
          'Waktu berhenti.',
          'Burung berhenti terbang.',
          'Jantungmu berhenti.',
          'Ini adalah akhir dari semua hal.'
        ]
      },

      // =========================
      // 8 DEVIL ORIGINAL
      // =========================

      {
        nama: 'Silence Devil',
        hp: 85000,
        exp: 16000,
        blood: 85000,
        emoji: '🤫',
        story: [
          'Semua suara menghilang.',
          'Kau tidak bisa mendengar teriakan temanmu.',
          'Hanya detak jantungmu sendiri.',
          'Dalam keheningan, kau mati perlahan.'
        ]
      },

      {
        nama: 'Mirror Devil',
        hp: 75000,
        exp: 14000,
        blood: 75000,
        emoji: '🪞',
        story: [
          'Semua cermin pecah.',
          'Bayanganmu keluar dari kaca.',
          'Dia tersenyum dengan gigimu.',
          'Lalu dia menusukmu dengan tanganmu sendiri.'
        ]
      },

      {
        nama: 'Void Devil',
        hp: 95000,
        exp: 19000,
        blood: 95000,
        emoji: '🕳️',
        story: [
          'Ruang di sekitarmu terdistorsi.',
          'Lenganmu masuk ke dalam kekosongan.',
          'Dan tidak pernah keluar lagi.',
          'Void melahap segalanya. Termasuk ingatan.'
        ]
      },

      {
        nama: 'Plague Devil',
        hp: 88000,
        exp: 17000,
        blood: 88000,
        emoji: '☣️',
        story: [
          'Kulitmu melepuh.',
          'Darah hitam keluar dari matamu.',
          'Satu sentuhan dan semua orang terinfeksi.',
          'Ini bukan perang. Ini pemusnahan.'
        ]
      },

      {
        nama: 'Nightmare Devil',
        hp: 82000,
        exp: 15500,
        blood: 82000,
        emoji: '😱',
        story: [
          'Kau tertidur.',
          'Tapi kau tidak bisa bangun.',
          'Monster di mimpimu jadi nyata.',
          'Dan dia lapar.'
        ]
      },

      {
        nama: 'Gravity Devil',
        hp: 92000,
        exp: 18500,
        blood: 92000,
        emoji: '🌌',
        story: [
          'Tubuhmu remuk.',
          'Tulang patah karena beratnya sendiri.',
          'Langit runtuh ke tanah.',
          'Semua tertarik ke satu titik.'
        ]
      },

      {
        nama: 'Regret Devil',
        hp: 78000,
        exp: 14500,
        blood: 78000,
        emoji: '😭',
        story: [
          'Semua kesalahanmu muncul.',
          'Wajah orang yang kau sakiti.',
          'Kau berlutut dan menangis.',
          'Regret menusuk dari belakang.'
        ]
      },

      {
        nama: 'Oblivion Devil',
        hp: 120000,
        exp: 25000,
        blood: 120000,
        emoji: '👁️',
        story: [
          'Namamu dilupakan.',
          'Foto-fotomu memudar.',
          'Temanmu tidak ingat siapa kamu.',
          'Oblivion menghapusmu dari dunia.'
        ]
      }
    ]


    // ----------------------------------------------------------
    // RESET / ROTASI BOSS HARIAN
    // ----------------------------------------------------------

    if (
      raid.date !== today ||
      !raid.boss ||
      typeof raid.boss !== 'object'
    ) {
      const selected =
        BOSS_LIST[
          Math.floor(
            Math.random() * BOSS_LIST.length
          )
        ]

      // Simpan salinan object, bukan reference yang nanti
      // bisa ikut berubah.
      raid.boss = {
        ...selected,
        story: Array.isArray(selected.story)
          ? [...selected.story]
          : []
      }

      raid.date = today
      raid.players = []

      saveDB(wdb)
    }


    // ----------------------------------------------------------
    // CEK RAID HARI INI
    // ----------------------------------------------------------

    const myCSM =
      wdb.users[m.sender]?.rpg?.csm

    if (
      myCSM &&
      myCSM.lastRaid === today
    ) {
      return m.reply(
        header('SUDAH RAID') +
        `Kamu sudah ikut raid hari ini.\n` +
        `Tunggu besok jam 00.00.\n\n` +
        `Boss hari ini:\n` +
        `${raid.boss.emoji} *${raid.boss.nama}*\n` +
        `━━━━━━━━━━━`
      )
    }


    // ----------------------------------------------------------
    // MENU UTAMA
    // ----------------------------------------------------------

    if (!sub) {
      let cap =
        header(`RAID HARI INI: ${raid.boss.nama}`)

      cap +=
        `${raid.boss.emoji} *${raid.boss.nama}*\n` +
        `HP: ${Number(raid.boss.hp).toLocaleString()}\n` +
        `👥 ${raid.players.length}/10 Hunter bergabung\n\n`

      cap +=
        `📋 *COMMAND RAID*\n` +
        `.csm raid create - Buat lobby\n` +
        `.csm raid join - Ikut lobby\n` +
        `.csm raid leave - Keluar lobby\n` +
        `.csm raid team - Lihat lobby\n` +
        `.csm raid start - Mulai serang\n` +
        `.csm raid list - Lihat semua Devil\n` +
        `.csm raid delete - Hapus lobby [Leader]\n` +
        `━━━━━━━━━━━`

      return m.reply(cap)
    }


    // ----------------------------------------------------------
    // LIST BOSS
    // ----------------------------------------------------------

    if (sub === 'list') {
      let cap = header('20 DEVIL RAID')

      BOSS_LIST.forEach((d, i) => {
        cap +=
          `${i + 1}. ${d.emoji} *${d.nama}* ` +
          `HP: ${Number(d.hp).toLocaleString()}\n`
      })

      cap +=
        `\nBoss tidak bisa dipilih.\n` +
        `Boss dipilih secara acak setiap hari.\n` +
        `━━━━━━━━━━━`

      return m.reply(cap)
    }


    // ----------------------------------------------------------
    // TEAM / LOBBY
    // ----------------------------------------------------------

    if (sub === 'team') {
      let cap =
        header(`LOBBY RAID: ${raid.boss.nama}`)

      if (raid.players.length === 0) {
        cap +=
          `Belum ada Hunter di lobby.\n\n`
      } else {
        raid.players.forEach((pid, i) => {
          cap +=
            `*${i + 1}.* ` +
            `${conn.getName(pid)} ` +
            `${i === 0 ? '[Leader]' : ''}\n`
        })
      }

      cap +=
        `\n👥 ${raid.players.length}/10 Hunter\n` +
        `.csm raid start\n` +
        `━━━━━━━━━━━`

      return m.reply(cap)
    }


    // ----------------------------------------------------------
    // CREATE
    // ----------------------------------------------------------

    if (sub === 'create') {
      if (
        raid.players.length > 0 &&
        raid.players[0] !== m.sender
      ) {
        return m.reply(
          header('ADA LOBBY') +
          `Leader saat ini:\n` +
          `${conn.getName(raid.players[0])}\n` +
          `━━━━━━━━━━━`
        )
      }

      raid.players = [m.sender]

      saveDB(wdb)

      return m.reply(
        header('LOBBY DIBUAT') +
        `${raid.boss.emoji} *${raid.boss.nama}*\n` +
        `👥 1 Hunter siap\n\n` +
        `.csm raid join - Ajak teman\n` +
        `.csm raid team - Lihat anggota\n` +
        `.csm raid start - Mulai\n` +
        `━━━━━━━━━━━`
      )
    }


    // ----------------------------------------------------------
    // JOIN
    // ----------------------------------------------------------

    if (sub === 'join') {
      if (raid.players.length === 0) {
        return m.reply(
          header('BELUM ADA LOBBY') +
          `Buat dulu dengan:\n` +
          `.csm raid create\n` +
          `━━━━━━━━━━━`
        )
      }

      if (raid.players.includes(m.sender)) {
        return m.reply(
          header('SUDAH JOIN') +
          `Kamu sudah berada di lobby.\n` +
          `━━━━━━━━━━━`
        )
      }

      if (raid.players.length >= 10) {
        return m.reply(
          header('FULL') +
          `Maksimal 10 Hunter.\n` +
          `━━━━━━━━━━━`
        )
      }

      raid.players.push(m.sender)

      saveDB(wdb)

      return m.reply(
        header('BERGABUNG') +
        `Kamu ikut berburu ${raid.boss.nama}.\n` +
        `👥 ${raid.players.length}/10 Hunter\n` +
        `━━━━━━━━━━━`
      )
    }


    // ----------------------------------------------------------
    // LEAVE
    // ----------------------------------------------------------

    if (sub === 'leave') {
      const idx =
        raid.players.indexOf(m.sender)

      if (idx === -1) {
        return m.reply(
          header('KAMU BELUM JOIN') +
          `━━━━━━━━━━━`
        )
      }

      raid.players.splice(idx, 1)

      // Kalau leader keluar, pemain pertama yang tersisa
      // otomatis menjadi leader.
      saveDB(wdb)

      if (raid.players.length === 0) {
        return m.reply(
          header('KELUAR') +
          `Kamu keluar dari raid.\n` +
          `Lobby sekarang kosong.\n` +
          `━━━━━━━━━━━`
        )
      }

      return m.reply(
        header('KELUAR') +
        `Kamu mundur dari perburuan.\n` +
        `Leader baru: ${conn.getName(raid.players[0])}\n` +
        `━━━━━━━━━━━`
      )
    }


    // ----------------------------------------------------------
    // DELETE
    // ----------------------------------------------------------

    if (sub === 'delete') {
      if (raid.players.length === 0) {
        return m.reply(
          header('LOBBY KOSONG') +
          `Tidak ada lobby yang perlu dihapus.\n` +
          `━━━━━━━━━━━`
        )
      }

      if (raid.players[0] !== m.sender) {
        return m.reply(
          header('BUKAN LEADER') +
          `Hanya leader yang bisa membubarkan lobby.\n` +
          `━━━━━━━━━━━`
        )
      }

      raid.players = []

      saveDB(wdb)

      return m.reply(
        header('LOBBY DIBUBARKAN') +
        `Perburuan dibatalkan.\n` +
        `━━━━━━━━━━━`
      )
    }


    // ----------------------------------------------------------
    // START RAID
    // ----------------------------------------------------------

    if (sub === 'start') {
      if (raid.players.length === 0) {
        return m.reply(
          header('BELUM ADA LOBBY') +
          `.csm raid create\n` +
          `━━━━━━━━━━━`
        )
      }

      if (raid.players[0] !== m.sender) {
        return m.reply(
          header('BUKAN LEADER') +
          `Hanya leader yang bisa memulai raid.\n` +
          `━━━━━━━━━━━`
        )
      }

      if (raid.players.length < 1) {
        return m.reply(
          header('SENDIRIAN') +
          `━━━━━━━━━━━`
        )
      }


      // --------------------------------------------------------
      // VALIDASI PLAYER
      // --------------------------------------------------------

      // Buang player yang sudah tidak memiliki data CSM.
      raid.players =
        raid.players.filter(
          pid =>
            wdb.users[pid]?.rpg?.csm
        )

      if (raid.players.length === 0) {
        saveDB(wdb)

        return m.reply(
          header('PLAYER TIDAK VALID') +
          `Tidak ada Hunter aktif di lobby.\n` +
          `━━━━━━━━━━━`
        )
      }

      // Pastikan leader masih ada setelah filtering.
      if (raid.players[0] !== m.sender) {
        saveDB(wdb)

        return m.reply(
          header('LEADER TIDAK VALID') +
          `Leader sebelumnya sudah tidak tersedia.\n` +
          `━━━━━━━━━━━`
        )
      }


      // --------------------------------------------------------
      // BOSS
      // --------------------------------------------------------

      const boss = raid.boss

      const playerCount =
        raid.players.length

      let winRate

      if (playerCount === 1) {
        winRate = 0.40
      } else if (playerCount <= 3) {
        winRate = 0.70
      } else {
        winRate = 0.90
      }


      // --------------------------------------------------------
      // BATTLE MESSAGE
      // --------------------------------------------------------

      let msg =
        header(
          `PERTEMPURAN BERDARAH: ${boss.nama}`
        )

      msg +=
        `${boss.emoji} *${boss.nama}*\n` +
        `HP: ${Number(boss.hp).toLocaleString()}\n` +
        `👥 ${playerCount} Devil Hunter\n\n`

      msg +=
        `*─── KISAH PERTEMPURAN ───*\n`

      if (Array.isArray(boss.story)) {
        boss.story.forEach(line => {
          msg += `${line}\n`
        })
      }

      msg +=
        `Darah berceceran di mana-mana.\n` +
        `Rantai chainsaw meraung.\n` +
        `Jeritan bercampur ledakan.\n\n`


      // --------------------------------------------------------
      // PARTNER LEADER
      // --------------------------------------------------------

      const leaderData =
        wdb.users[m.sender]?.rpg?.csm

      if (
        leaderData &&
        Array.isArray(leaderData.partners) &&
        leaderData.partners.length > 0
      ) {
        msg += `*PARTNER TURUN TANGAN*\n`

        leaderData.partners.forEach(p => {
          if (!p || !p.name) return

          const ch =
            CHARACTER_LIST.find(
              c => c.nama === p.name
            )

          // Jangan crash kalau character lama sudah
          // tidak ada lagi di CHARACTER_LIST.
          if (!ch) {
            msg +=
              `👤 ${p.name}: "Aku ikut bertarung."\n`
            return
          }

          const dialog =
            Array.isArray(ch.dialog) &&
            ch.dialog.length > 0
              ? ch.dialog[
                  Math.floor(
                    Math.random() *
                    ch.dialog.length
                  )
                ]
              : 'Aku ikut bertarung.'

          msg +=
            `${ch.emoji || '👤'} ${p.name}: ` +
            `"${dialog}"\n`
        })

        msg += `\n`
      }


      // --------------------------------------------------------
      // RANDOM RESULT
      // --------------------------------------------------------

      const win =
        Math.random() < winRate


      // ========================================================
      // RAID MENANG
      // ========================================================

      if (win) {
        msg +=
          `*─── DARAH MUNCRA DI MANA-MANA ───*\n` +
          `GIGITAN. IRISAN. LEDAKAN.\n` +
          `${boss.nama} ROBEK MENJADI POTONGAN.\n\n`


        raid.players.forEach(pid => {
          const pData =
            wdb.users[pid]?.rpg?.csm

          if (!pData) return


          // ----------------------------------------------------
          // SAFE DEFAULT
          // ----------------------------------------------------

          if (
            typeof pData.health !== 'number'
          ) {
            pData.health =
              pData.maxHealth || 100
          }

          if (
            typeof pData.maxHealth !== 'number'
          ) {
            pData.maxHealth = 100
          }

          if (
            !Array.isArray(pData.inventory)
          ) {
            pData.inventory = [
              {
                nama: 'Fist',
                dur: 999
              }
            ]
          }

          if (
            typeof pData.level !== 'number'
          ) {
            pData.level = 1
          }

          if (
            typeof pData.exp !== 'number'
          ) {
            pData.exp = 0
          }

          if (
            typeof pData.blood !== 'number'
          ) {
            pData.blood = 0
          }

          if (
            typeof pData.devilsKilled !== 'number'
          ) {
            pData.devilsKilled = 0
          }


          // ----------------------------------------------------
          // DAMAGE
          // ----------------------------------------------------

          pData.health =
            Math.max(
              1,
              pData.health - 40
            )


          // ----------------------------------------------------
          // WEAPON DAMAGE
          // ----------------------------------------------------

          const activeWeapon =
            pData.inventory[0]

          if (
            activeWeapon &&
            activeWeapon.nama !== 'Fist'
          ) {
            if (
              typeof activeWeapon.dur !== 'number'
            ) {
              const weaponData =
                WEAPON_LIST.find(
                  w =>
                    w.nama ===
                    activeWeapon.nama
                )

              activeWeapon.dur =
                weaponData?.dur || 0
            }

            activeWeapon.dur -= 10

            if (activeWeapon.dur <= 0) {
              pData.inventory.shift()
            }
          }


          // ----------------------------------------------------
          // PASTIKAN FIST TETAP ADA
          // ----------------------------------------------------

          if (
            pData.inventory.length === 0
          ) {
            pData.inventory.push({
              nama: 'Fist',
              dur: 999
            })
          }


          // ----------------------------------------------------
          // REWARD
          // ----------------------------------------------------

          const rewardBlood =
            Number(boss.blood || 0) +
            Math.floor(
              Number(boss.blood || 0) / 5
            )

          pData.blood += rewardBlood


          // ----------------------------------------------------
          // EXP
          // ----------------------------------------------------

          // BUG SOURCE:
          // addExp.call({csm:pData}, boss.exp)
          //
          // Kalau addExp memakai closure / userRPG lokal,
          // cara tersebut tidak menjamin EXP masuk ke pData.
          //
          // Di sini EXP dihitung langsung agar raid benar-benar
          // memberikan reward ke player.

          const expGain =
            Number(boss.exp || 0)

          pData.exp += expGain


          // ----------------------------------------------------
          // LEVEL UP
          // ----------------------------------------------------

          let levelUpCount = 0

          while (
            pData.exp >=
            pData.level * 300
          ) {
            pData.exp -=
              pData.level * 300

            pData.level++

            levelUpCount++

            pData.maxHealth += 10

            pData.health =
              Math.min(
                pData.maxHealth,
                pData.health + 10
              )
          }


          // ----------------------------------------------------
          // RAID STATUS
          // ----------------------------------------------------

          pData.lastRaid = today
          pData.devilsKilled++

        })


        msg +=
          `🩸 +${Number(boss.blood).toLocaleString()} ` +
          `Darah /Hunter\n` +

          `📈 +${Number(boss.exp).toLocaleString()} ` +
          `EXP /Hunter\n` +

          `⚠️ -40 HP & -10 Dur Weapon /Hunter`


        // ------------------------------------------------------
        // HISTORY
        // ------------------------------------------------------

        raid.history.push({
          date: today,
          boss: boss.nama,
          result: 'WIN',
          players: [...raid.players]
        })

      }


      // ========================================================
      // RAID KALAH
      // ========================================================

      else {
        msg +=
          `*─── KAMI DIHANCURKAN ───*\n` +
          `${boss.nama} TERLALU KUAT.\n` +
          `TUBUH HUNTER BERTERABARAN.\n\n`


        raid.players.forEach(pid => {
          const pData =
            wdb.users[pid]?.rpg?.csm

          if (!pData) return


          if (
            typeof pData.health !== 'number'
          ) {
            pData.health =
              pData.maxHealth || 100
          }


          if (
            !Array.isArray(pData.inventory)
          ) {
            pData.inventory = [
              {
                nama: 'Fist',
                dur: 999
              }
            ]
          }


          // ----------------------------------------------------
          // DAMAGE
          // ----------------------------------------------------

          pData.health =
            Math.max(
              1,
              pData.health - 60
            )


          // ----------------------------------------------------
          // WEAPON LOSS
          // ----------------------------------------------------

          // Source lama langsung splice(0,2), sehingga Fist
          // juga bisa hilang dan inventory menjadi kosong.
          //
          // Sekarang hanya weapon non-Fist yang dihancurkan.

          let destroyed = 0

          while (
            destroyed < 2 &&
            pData.inventory.length > 0
          ) {
            const item =
              pData.inventory[0]

            if (
              !item ||
              item.nama === 'Fist'
            ) {
              break
            }

            pData.inventory.shift()

            destroyed++
          }


          // Fist selalu tersedia sebagai fallback.
          if (
            pData.inventory.length === 0
          ) {
            pData.inventory.push({
              nama: 'Fist',
              dur: 999
            })
          }


          // ----------------------------------------------------
          // RAID STATUS
          // ----------------------------------------------------

          pData.lastRaid = today
        })


        msg +=
          `❤️ -60 HP /Hunter\n` +
          `⚠️ Maksimal 2 Weapon Non-Fist ` +
          `Hancur /Hunter`


        raid.history.push({
          date: today,
          boss: boss.nama,
          result: 'LOSE',
          players: [...raid.players]
        })
      }


      // --------------------------------------------------------
      // BATASI HISTORY
      // --------------------------------------------------------

      if (raid.history.length > 30) {
        raid.history =
          raid.history.slice(-30)
      }


      // --------------------------------------------------------
      // LOBBY SELESAI
      // --------------------------------------------------------

      // Setelah raid selesai, lobby dikosongkan.
      // lastRaid tiap player sudah menyimpan status bahwa
      // mereka sudah ikut hari ini.
      raid.players = []


      saveDB(wdb)

      return m.reply(
        msg +
        `\n━━━━━━━━━━━`
      )
    }


    // ----------------------------------------------------------
    // UNKNOWN SUBCOMMAND
    // ----------------------------------------------------------

    return m.reply(
      header('COMMAND RAID TIDAK DIKENAL') +
      `.csm raid\n` +
      `.csm raid create\n` +
      `.csm raid join\n` +
      `.csm raid team\n` +
      `.csm raid leave\n` +
      `.csm raid start\n` +
      `.csm raid list\n` +
      `.csm raid delete\n` +
      `━━━━━━━━━━━`
    )
  }


  // ============================================================
  // === RAID END ================================================
  // ============================================================

  if (action === 'raid') {
    // Semua subcommand RAID sudah ditangani di blok RAID
    // sebelumnya.
    //
    // Fallback ini sengaja diletakkan di paling bawah agar
    // command RAID yang tidak dikenal tidak membuat handler
    // jatuh ke command lain.

    return m.reply(
      header('COMMAND RAID TIDAK DIKENAL') +
      `Gunakan salah satu:\n\n` +

      `• .csm raid\n` +
      `• .csm raid create\n` +
      `• .csm raid join\n` +
      `• .csm raid team\n` +
      `• .csm raid leave\n` +
      `• .csm raid start\n` +
      `• .csm raid list\n` +
      `• .csm raid delete\n\n` +

      `━━━━━━━━━━━`
    )
  }


  // ============================================================
  // === UNKNOWN COMMAND ========================================
  // ============================================================

  // Kalau action tidak cocok dengan command apa pun,
  // jangan melakukan perubahan database.
  //
  // Tidak perlu mengirim error otomatis karena beberapa
  // framework/plugin memanggil handler dengan action kosong
  // untuk command yang tidak dikenali.

  if (!action) {
    return
  }


  // ============================================================
  // === DATABASE FINAL SAVE ====================================
  // ============================================================

  // Semua command yang mengubah data seharusnya sudah
  // memanggil saveDB(wdb) sebelum return.
  //
  // Tidak dilakukan save global di sini agar command yang
  // hanya membaca data tidak menulis database tanpa alasan.
}

// ============================================================
// === HANDLER METADATA =======================================
// ============================================================

handler.help = [
  'csm'
]

handler.tags = [
  'rpg'
]

handler.command =
  /^csm$/i

handler.group = true


// ============================================================
// === EXPORT ==================================================
// ============================================================

export default handler