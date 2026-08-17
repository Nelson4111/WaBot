import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if (!user) return m.reply('Ketik.adventure dulu buat daftar RPG.')
  if (!user.pets) user.pets = []
// init data baru
if (!user.sanctuary) user.sanctuary = []
if (!user.stats) user.stats = { totalFeed: 0, totalBattle: 0, totalHunt: 0 }
if (!user.buzzUsed) user.buzzUsed = 0 // [TAMBAH INI] buat nyimpen tanggal terakhir pake buzz

const formatNamaAsli = (name) => name.replace(/_/g, ' ')
const formatNama = (p) => p.nickname? `${p.nickname} (${formatNamaAsli(p.tipe)})` : formatNamaAsli(p.tipe)
const bar = (val, len = 10) => '`' + '█'.repeat(Math.floor(val / (100/len))) + '░'.repeat(len - Math.floor(val / (100/len))) + '`'

// cek pet mati tiap 24 jam energy 0
user.pets = user.pets.filter(p => {
  if((p.energy || 100) <= 0 && (Date.now() - (p.lastActivity || 0) > 86400000)) {
    // auto revive jika ada malaikat
    if(user.pets.some(x => x.tipe === 'malaikat')){
      p.energy = 50;
      m.reply(`✨ ${formatNama(p)} dihidupkan oleh Malaikat!`)
      return true
    }
    user.sanctuary.push({...p, mati: Date.now()})
    m.reply(`💀 ${formatNama(p)} mati karena kelaparan. Ketik.pet sanctuary`)
    return false
  }
  return true
})
  if (!user.achievements) user.achievements = []
  if (!user.cooldown) user.cooldown = {}
  if (!user.pity) user.pity = 0

  // migrasi data lama
  if (user.pet && user.pet.tipe && user.pet.tipe!== 'none') {
    let oldPet = user.pet
    if (!user.pets.find(p => p.tipe === oldPet.tipe)) {
      user.pets.push({ tipe: oldPet.tipe, level: oldPet.level || 1, exp: oldPet.exp || 0, energy: 100, happy: 50, dirty: 0, nickname: null, lastFeed: oldPet.lastFeed || 0, lastActivity: 0, lastRest: 0, lastTrain: 0, revive: true })
    }
    delete user.pet
    saveDB(wdb)
  }

  let args = text.split(' ')
  let action = args[0]?.toLowerCase()
  let jam = new Date().getHours()
  let menit = new Date().getMinutes().toString().padStart(2, '0')
  let isMalam = jam >= 18 || jam < 6
  let waktu = isMalam? '🌙 Malam' : '☀️ Siang'

    const rarities = {
    COMMON: {stars: '★☆☆☆☆☆☆', emoji: '🤍', rate: 40},
    UNCOMMON: {stars: '★★☆☆☆☆☆', emoji: '💙', rate: 25},
    RARE: {stars: '★★★☆☆☆☆', emoji: '✨', rate: 15},
    EPIC: {stars: '★★★★☆☆☆', emoji: '💎', rate: 10},
    LEGENDARY: {stars: '★★★★★☆☆', emoji: '👑', rate: 7},
    MYTHIC: {stars: '★★★★★★☆', emoji: '🌌', rate: 2.5},
    SECRET: {stars: '★★★★★★★', emoji: '🔮', rate: 0.5}
  }

  const pets = {
    // === COMMON 5K - 50K ===
    'lalat': { emoji: '🪰', harga: 5000, rarity: 'COMMON' },
    'nyamuk': { emoji: '🦟', harga: 7000, rarity: 'COMMON' },
    'semut': { emoji: '🐜', harga: 10000, rarity: 'COMMON' },
    'cacing': { emoji: '🪱', harga: 12000, rarity: 'COMMON' },
    'kecoa': { emoji: '🪳', harga: 15000, rarity: 'COMMON' },
    'tikus_got': { emoji: '🐀', harga: 20000, rarity: 'COMMON' },
    'tikus_rumah': { emoji: '🐁', harga: 20000, rarity: 'COMMON' },
    'tikus': { emoji: '🐭', harga: 25000, rarity: 'COMMON' },
    'ulat': { emoji: '🐛', harga: 30000, rarity: 'COMMON' },
    'siput': { emoji: '🐌', harga: 30000, rarity: 'COMMON' },
    'belalang': { emoji: '🦗', harga: 40000, rarity: 'COMMON' },
    'anak_ayam': { emoji: '🐥', harga: 50000, rarity: 'COMMON' },
    'kumbang': { emoji: '🪲', harga: 50000, rarity: 'COMMON' },

    // === UNCOMMON 75K - 200K ===
    'hamster': { emoji: '🐹', harga: 75000, rarity: 'UNCOMMON' },
    'ayam': { emoji: '🐔', harga: 80000, rarity: 'UNCOMMON' },
    'burung': { emoji: '🐦', harga: 80000, rarity: 'UNCOMMON' },
    'katak': { emoji: '🐸', harga: 90000, rarity: 'UNCOMMON' },
    'kumbang_tanduk': { emoji: '🪲', harga: 100000, rarity: 'UNCOMMON' },
    'ayam_jago': { emoji: '🐓', harga: 100000, rarity: 'UNCOMMON' },
    'merpati': { emoji: '🕊️', harga: 120000, rarity: 'UNCOMMON' },
    'lebah': { emoji: '🐝', harga: 120000, rarity: 'UNCOMMON' },
    'kelinci': { emoji: '🐰', harga: 150000, rarity: 'UNCOMMON' },
    'bebek': { emoji: '🦆', harga: 150000, rarity: 'UNCOMMON' },
    'kupu': { emoji: '🦋', harga: 180000, rarity: 'UNCOMMON' },
    'kelinci_liar': { emoji: '🐰', harga: 180000, rarity: 'UNCOMMON' },
    'tupai': { emoji: '🐿️', harga: 200000, rarity: 'UNCOMMON' },
    'burung_hitam': { emoji: '🐦‍⬛', harga: 200000, rarity: 'UNCOMMON' },
    'angsa': { emoji: '🦢', harga: 200000, rarity: 'UNCOMMON' },
    'ikan': { emoji: '🐟', harga: 200000, rarity: 'UNCOMMON' },
    'laba': { emoji: '🕷️', harga: 200000, rarity: 'UNCOMMON' },
    'monyet': { emoji: '🐒', harga: 200000, rarity: 'UNCOMMON' },
    'kalkun': { emoji: '🦃', harga: 200000, rarity: 'UNCOMMON' },
    'kelelawar': { emoji: '🦇', harga: 200000, rarity: 'UNCOMMON' },
    'udang': { emoji: '🦐', harga: 200000, rarity: 'UNCOMMON' },
    'kucing': { emoji: '🐱', harga: 200000, rarity: 'UNCOMMON' },
    'anjing': { emoji: '🐶', harga: 200000, rarity: 'UNCOMMON' },
    'kucing_hitam': { emoji: '🐈‍⬛', harga: 200000, rarity: 'UNCOMMON' },
    'kepiting': { emoji: '🦀', harga: 200000, rarity: 'UNCOMMON' },
    'babi_hutan': { emoji: '🐗', harga: 200000, rarity: 'UNCOMMON' },
    'babi': { emoji: '🐷', harga: 200000, rarity: 'UNCOMMON' },
    'penguin': { emoji: '🐧', harga: 200000, rarity: 'UNCOMMON' },
    'kura': { emoji: '🐢', harga: 200000, rarity: 'UNCOMMON' },
    'rakun': { emoji: '🦝', harga: 200000, rarity: 'UNCOMMON' },
    'sigung': { emoji: '🦨', harga: 200000, rarity: 'UNCOMMON' },
    'sapi': { emoji: '🐄', harga: 200000, rarity: 'UNCOMMON' },
    'domba': { emoji: '🐑', harga: 200000, rarity: 'UNCOMMON' },
    'ular': { emoji: '🐍', harga: 200000, rarity: 'UNCOMMON' },
    'kadal': { emoji: '🦎', harga: 200000, rarity: 'UNCOMMON' },
    'domba_jantan': { emoji: '🐏', harga: 200000, rarity: 'UNCOMMON' },
    'buntal': { emoji: '🐡', harga: 200000, rarity: 'UNCOMMON' },
    'rubah': { emoji: '🦊', harga: 200000, rarity: 'UNCOMMON' },
    'angsa_putih': { emoji: '🦢', harga: 200000, rarity: 'UNCOMMON' },
    'luwak': { emoji: '🦦', harga: 200000, rarity: 'UNCOMMON' },
    'kalajengking': { emoji: '🦂', harga: 200000, rarity: 'UNCOMMON' },
    'gajah': { emoji: '🐘', harga: 200000, rarity: 'UNCOMMON' },
    'badak': { emoji: '🦏', harga: 200000, rarity: 'UNCOMMON' },
    'paus': { emoji: '🐋', harga: 200000, rarity: 'UNCOMMON' },
    'paus_biru': { emoji: '🐳', harga: 200000, rarity: 'UNCOMMON' },
    'hiu': { emoji: '🦈', harga: 200000, rarity: 'UNCOMMON' },
    'kuda_nil': { emoji: '🦛', harga: 200000, rarity: 'UNCOMMON' },
    'gurita': { emoji: '🐙', harga: 200000, rarity: 'UNCOMMON' },
    'merak': { emoji: '🦚', harga: 200000, rarity: 'UNCOMMON' },
    'gorila': { emoji: '🦍', harga: 200000, rarity: 'UNCOMMON' },
    'cumi': { emoji: '🦑', harga: 200000, rarity: 'UNCOMMON' },
    'bison': { emoji: '🦬', harga: 200000, rarity: 'UNCOMMON' },
    'jerapah': { emoji: '🦒', harga: 200000, rarity: 'UNCOMMON' },
    'zebra': { emoji: '🦓', harga: 200000, rarity: 'UNCOMMON' },
    'singa': { emoji: '🦁', harga: 200000, rarity: 'UNCOMMON' },
    'harimau': { emoji: '🐅', harga: 200000, rarity: 'UNCOMMON' },
    'macan': { emoji: '🐆', harga: 200000, rarity: 'UNCOMMON' },
    'beruang': { emoji: '🐻', harga: 200000, rarity: 'UNCOMMON' },
    'serigala': { emoji: '🐺', harga: 200000, rarity: 'UNCOMMON' },
    'rusa': { emoji: '🦌', harga: 200000, rarity: 'UNCOMMON' },
    'kanguru': { emoji: '🦘', harga: 200000, rarity: 'UNCOMMON' },
    'koala': { emoji: '🐨', harga: 200000, rarity: 'UNCOMMON' },
    'panda': { emoji: '🐼', harga: 200000, rarity: 'UNCOMMON' },
    'orangutan': { emoji: '🦧', harga: 200000, rarity: 'UNCOMMON' },
    'elang': { emoji: '🦅', harga: 200000, rarity: 'UNCOMMON' },
    'flamingo': { emoji: '🦩', harga: 200000, rarity: 'UNCOMMON' },
    'lumba': { emoji: '🐬', harga: 200000, rarity: 'UNCOMMON' },

    // === RARE 14JT - 16JT ===
    'skibidi': { emoji: '🚽', harga: 14000000, rarity: 'RARE', skill: 'toilet: buang semua debuff tim + musuh' },
    'creeper': { emoji: '💚', harga: 15000000, rarity: 'RARE', skill: 'meledak: mati = damage area x3 ke semua' },
    'drone': { emoji: '🚁', harga: 16000000, rarity: 'RARE', skill: 'pengintai: lihat stat musuh sebelum battle' },
    'warden': { emoji: '🕳️', harga: 16000000, rarity: 'RARE', skill: 'getar: deteksi musuh invisible + damage x3' },

    // === EPIC 17JT - 19JT ===
    'komodo': { emoji: '🦎', harga: 17000000, rarity: 'EPIC', skill: 'racun: damage musuh -10 tiap detik selama 5 detik' },
    'among_us': { emoji: '👨‍🚀', harga: 17000000, rarity: 'EPIC', skill: 'impostor: 30% chance kill 1 pet musuh pas menang' },
    'jiangshi': { emoji: '🧟', harga: 17000000, rarity: 'EPIC', skill: 'loncat: heal 20% tiap kill' },
    'woody': { emoji: '🤠', harga: 17000000, rarity: 'EPIC', skill: 'teman: tim +20 power pas bareng 2+' },
    'jessie': { emoji: '👢', harga: 17000000, rarity: 'EPIC', skill: 'yeehaw: cooldown tim x0.5' },
    'barongsai': { emoji: '🦁', harga: 18000000, rarity: 'EPIC', skill: 'tari: happy tim tidak pernah turun' },
    'buzz_lightyear': { emoji: '🚀', harga: 18000000, rarity: 'EPIC', skill: 'to_infinity: skip cooldown 1x/hari' },
    'cyclops': { emoji: '👁️', harga: 18000000, rarity: 'EPIC', skill: 'hantam: damage x2 tapi akurasi 70%' },
    'wayang': { emoji: '🎭', harga: 19000000, rarity: 'EPIC', skill: 'dalang: bisa copy skill 1 pet tim' },
    'centaur': { emoji: '🏹', harga: 19000000, rarity: 'EPIC', skill: 'pemanah: serang dari jauh, -30 energy musuh' },
    'chucky': { emoji: '🔪', harga: 19000000, rarity: 'EPIC', skill: 'pisau: 40% chance kill pet lv < 5' },

    // === LEGENDARY 20JT - 22JT ===
    'nymph': { emoji: '🧚', harga: 20000000, rarity: 'LEGENDARY', skill: 'berkah_hutan: tiap jam energy tim +10 + happy +5' },
    'mumi': { emoji: '🧻', harga: 20000000, rarity: 'LEGENDARY', skill: 'perban: revive 1x tiap 2 hari' },
    'annabelle': { emoji: '👰', harga: 20000000, rarity: 'LEGENDARY', skill: 'kutukan: musuh -30% stat permanen' },
    'slenderman': { emoji: '👤', harga: 21000000, rarity: 'LEGENDARY', skill: 'teleport: serangan pertama crit x2' },
    'frankenstein': { emoji: '⚡', harga: 21000000, rarity: 'LEGENDARY', skill: 'listrik: stun 4 detik' },
    'pegasus': { emoji: '🦄', harga: 22000000, rarity: 'LEGENDARY', skill: 'terbang: skip 1 misi/hari' },
    'siren_head': { emoji: '📢', harga: 22000000, rarity: 'LEGENDARY', skill: 'teriakan: semua musuh -40 power + stun 2 detik' },
    'titan': { emoji: '🗿', harga: 22000000, rarity: 'LEGENDARY', skill: 'power battle +50' },

    // === SECRET 6.5JT - 25JT ===
    'poop': { emoji: '💩', harga: 6500000, rarity: 'SECRET', skill: 'hasilkan uang pas feed' },
    'batu': { emoji: '🪨', harga: 6500000, rarity: 'SECRET', skill: 'energy tak terbatas' },
    'burung_hantu': { emoji: '🦉', harga: 6500000, rarity: 'SECRET', skill: 'hemat energy saat malam' },
    'snowman': { emoji: '⛄', harga: 7000000, rarity: 'SECRET', skill: 'lemah saat siang' },
    'jack_o_lantern': { emoji: '🎃', harga: 7500000, rarity: 'SECRET', skill: 'cooldown -10 detik' },
    'ghost': { emoji: '👻', harga: 7500000, rarity: 'SECRET', skill: 'happy x2' },
    'anjing_alpha': { emoji: '🐶', harga: 7500000, rarity: 'SECRET', skill: 'semua pet +10 exp' },
    'meowy': { emoji: '🐱', harga: 7500000, rarity: 'SECRET', skill: 'kesayangan iblis: happy +15 tiap jam' },
    'remy_ratatouille': { emoji: '🐀', harga: 7500000, rarity: 'SECRET', skill: 'koki: feed cost -50%' },
    'robot': { emoji: '🤖', harga: 8000000, rarity: 'SECRET', skill: 'tidak makan' },
    'orc': { emoji: '👹', harga: 8000000, rarity: 'SECRET', skill: 'exp +5 pas walk' },
    'kucing_dewa': { emoji: '🐱', harga: 8000000, rarity: 'SECRET', skill: 'menghasilkan 1000/hari' },
    'hello_kitty': { emoji: '🎀', harga: 8000000, rarity: 'SECRET', skill: 'imut: happy +5 tiap jam' },
    'pompom_hsr': { emoji: '🧸', harga: 8500000, rarity: 'SECRET', skill: 'luck: gacha rate +5%' },
    'unicorn': { emoji: '🦄', harga: 8500000, rarity: 'SECRET' },
    'skeleton': { emoji: '💀', harga: 8500000, rarity: 'SECRET', skill: 'exp x1.5' },
    'fairy': { emoji: '🧚', harga: 8800000, rarity: 'SECRET', skill: 'happy +5 pas rest' },
    'trotter_numby': { emoji: '🐷', harga: 9000000, rarity: 'SECRET', skill: 'banker: passive 2000/hari' },
    'mermaid': { emoji: '🧜', harga: 9500000, rarity: 'SECRET', skill: 'energy +10 pas feed' },
    'alien': { emoji: '👽', harga: 10000000, rarity: 'SECRET', skill: 'hasilkan uang' },
    'trex': { emoji: '🦖', harga: 10000000, rarity: 'SECRET', skill: 'gigitan: damage +60 saat battle' },
    'tom_jerry': { emoji: '🐱', harga: 10000000, rarity: 'SECRET', skill: 'duo chaos: drop item +2' },
    'paimon': { emoji: '🧭', harga: 10000000, rarity: 'SECRET', skill: 'guide: exp hunt +50%' },
    'vampir': { emoji: '🧛', harga: 11000000, rarity: 'SECRET', skill: 'kuat di malam hari' },
    'jin': { emoji: '🧞', harga: 12000000, rarity: 'SECRET', skill: 'cooldown x0.5' },
    'naga': { emoji: '🐉', harga: 12000000, rarity: 'SECRET' },
    'happy_ghast': { emoji: '👻', harga: 12000000, rarity: 'SECRET', skill: 'terbang: bisa skip 1 misi' },
    'cerberus': { emoji: '🐺', harga: 12000000, rarity: 'SECRET', skill: 'tidak bisa dibunuh' },
    'abby_wuwa': { emoji: '❄️', harga: 12000000, rarity: 'SECRET', skill: 'frost: musuh cooldown +2x' },
    'sphinx': { emoji: '🦁', harga: 13000000, rarity: 'SECRET', skill: 'jual pet +20% harga' },
    'totoro': { emoji: '🌳', harga: 13000000, rarity: 'SECRET', skill: 'hujan: energy tidak turun' },
    'bond_forger': { emoji: '🕵️', harga: 13000000, rarity: 'SECRET', skill: 'spy: lihat pet musuh sebelum battle' },
    'fenrir': { emoji: '🐺', harga: 14000000, rarity: 'SECRET', skill: 'howl: semua musuh -20 power' },
    'shukaku': { emoji: '🦝', harga: 14000000, rarity: 'SECRET', skill: 'pasir: defense +30 saat malam' },
    'matatabi': { emoji: '🐱', harga: 14000000, rarity: 'SECRET', skill: 'api biru: exp x1.5 saat hunt' },
    'isobu': { emoji: '🐢', harga: 14000000, rarity: 'SECRET', skill: 'karang: energy tidak turun di air' },
    'son_goku': { emoji: '🐒', harga: 14000000, rarity: 'SECRET', skill: 'lava: damage +40 saat battle' },
    'kokuo': { emoji: '🐴', harga: 14000000, rarity: 'SECRET', skill: 'uap: cooldown x0.8' },
    'saiken': { emoji: '🪼', harga: 14000000, rarity: 'SECRET', skill: 'asam: kurangi happy musuh 20' },
    'chomei': { emoji: '🪲', harga: 14000000, rarity: 'SECRET', skill: 'terbang: walk tanpa energy' },
    'toothless': { emoji: '🐉', harga: 15000000, rarity: 'SECRET', skill: 'terbang: cooldown x0.5' },
    'naga_emas': { emoji: '🐉', harga: 15000000, rarity: 'SECRET', skill: 'drop uang +2x pas hunt' },
    'gryphon': { emoji: '🦅', harga: 16000000, rarity: 'SECRET', skill: 'hunt dapat 2x hasil' },
    'mickey_mouse': { emoji: '🐭', harga: 16000000, rarity: 'SECRET', skill: 'pesona: harga jual +15%' },
    'malaikat': { emoji: '👼', harga: 17000000, rarity: 'SECRET', skill: 'happy tidak pernah turun' },
    'doraemon': { emoji: '🤖', harga: 17000000, rarity: 'SECRET', skill: 'kantong ajaib: bawa item +10' },
    'phoenix': { emoji: '🔥', harga: 18000000, rarity: 'SECRET', skill: 'revive 2x/hari' },
    'garfield': { emoji: '🐱', harga: 18000000, rarity: 'SECRET', skill: 'makan: happy +20' },
    'bumblebee': { emoji: '🚗', harga: 18000000, rarity: 'SECRET', skill: 'transform: speed +100%' },
    'gyuki': { emoji: '🐙', harga: 18000000, rarity: 'SECRET', skill: '8 ekor: power battle +40' },
    'iblis': { emoji: '😈', harga: 19000000, rarity: 'SECRET', skill: 'battle menang otomatis vs COMMON' },
    'sonic': { emoji: '🦔', harga: 19000000, rarity: 'SECRET', skill: 'super speed: cooldown x0.2' },
    'tigress': { emoji: '🐅', harga: 20000000, rarity: 'SECRET', skill: 'cakar: exp x2 saat hunt' },
    'leviathan': { emoji: '🌊', harga: 20000000, rarity: 'SECRET', skill: 'energy tidak berkurang di laut' },
    'kurama': { emoji: '🦊', harga: 20000000, rarity: 'SECRET', skill: 'bijuudama: exp x3 saat battle' },
    'medusa': { emoji: '🐍', harga: 21000000, rarity: 'SECRET', skill: 'tatapan: musuh stun 1 turn penuh' },
    'hydra': { emoji: '🐍', harga: 21000000, rarity: 'SECRET', skill: '1 pet = 3 kepala, exp x3' },
    'master_shifu_po': { emoji: '🐼', harga: 21000000, rarity: 'SECRET', skill: 'kungfu panda: menang vs 2 pet' },
    'pikachu': { emoji: '⚡', harga: 22000000, rarity: 'SECRET', skill: 'thunderbolt: stun musuh 3 detik' },
    'garuda': { emoji: '🦅', harga: 22000000, rarity: 'SECRET', skill: 'pancasila: team battle +40% power' },
    'kraken': { emoji: '🐙', harga: 23000000, rarity: 'SECRET', skill: 'curi 10% uang target saat battle' },
    'SCP_173': { emoji: '🗿', harga: 23000000, rarity: 'SECRET', skill: 'kedip: gerak pas tidak dilihat, kill langsung' },
    'mjolnir': { emoji: '🔨', harga: 23000000, rarity: 'SECRET', skill: 'petir: stun area 5 detik' },
    'valkyrie': { emoji: '🛡️', harga: 24000000, rarity: 'SECRET', skill: 'team battle +30% power' },
    'gundam': { emoji: '🤖', harga: 24000000, rarity: 'SECRET', skill: 'beam: ignore 100 defense' },
    'king_kong': { emoji: '🦍', harga: 25000000, rarity: 'SECRET', skill: 'pukul: power battle +50' },
    'godzilla': { emoji: '🦖', harga: 25000000, rarity: 'SECRET', skill: 'atomic breath: damage x3' },
    'pochita': { emoji: '⛓️', harga: 25000000, rarity: 'SECRET', skill: 'chainsaw: damage x3 saat HP < 30%' },
    'juubi': { emoji: '👁️', harga: 25000000, rarity: 'SECRET', skill: 'mugen tsukuyomi: menang otomatis vs SECRET' }
}

  const aliases = {
    // === COMMON ===
    'lalat': ['lalat', 'fly'],
    'nyamuk': ['nyamuk', 'mosquito'],
    'semut': ['semut', 'ant'],
    'cacing': ['cacing', 'worm'],
    'kecoa': ['kecoa', 'cockroach'],
    'tikus_got': ['tikus got', 'tikusgot', 'rat got'],
    'tikus_rumah': ['tikus rumah', 'tikusrumah', 'house rat'],
    'tikus': ['tikus', 'mouse'],
    'ulat': ['ulat', 'caterpillar'],
    'siput': ['siput', 'snail'],
    'belalang': ['belalang', 'grasshopper'],
    'anak_ayam': ['anak ayam', 'anakayam', 'chick'],
    'kumbang': ['kumbang', 'beetle'],

    // === UNCOMMON ===
    'hamster': ['hamster'],
    'ayam': ['ayam', 'chicken'],
    'burung': ['burung', 'bird'],
    'katak': ['katak', 'frog'],
    'kumbang_tanduk': ['kumbang tanduk', 'kumbangtanduk', 'horn beetle'],
    'ayam_jago': ['ayam jago', 'ayamjago', 'rooster'],
    'merpati': ['merpati', 'pigeon'],
    'lebah': ['lebah', 'bee'],
    'kelinci': ['kelinci', 'rabbit'],
    'bebek': ['bebek', 'duck'],
    'kupu': ['kupu', 'kupu kupu', 'butterfly'],
    'kelinci_liar': ['kelinci liar', 'kelinciliarn', 'wild rabbit'],
    'tupai': ['tupai', 'squirrel'],
    'burung_hitam': ['burung hitam', 'burunghitam', 'black bird'],
    'angsa': ['angsa', 'swan'],
    'ikan': ['ikan', 'fish'],
    'laba': ['laba', 'laba laba', 'spider'],
    'monyet': ['monyet', 'monkey'],
    'kalkun': ['kalkun', 'turkey'],
    'kelelawar': ['kelelawar', 'bat'],
    'udang': ['udang', 'shrimp'],
    'kucing': ['kucing', 'cat'],
    'anjing': ['anjing', 'dog'],
    'kucing_hitam': ['kucing hitam', 'kucinghitam', 'black cat'],
    'kepiting': ['kepiting', 'crab'],
    'babi_hutan': ['babi hutan', 'babihutan', 'boar'],
    'babi': ['babi', 'pig'],
    'penguin': ['penguin'],
    'kura': ['kura', 'kura kura', 'turtle'],
    'rakun': ['rakun', 'raccoon'],
    'sigung': ['sigung', 'skunk'],
    'sapi': ['sapi', 'cow'],
    'domba': ['domba', 'sheep'],
    'ular': ['ular', 'snake'],
    'kadal': ['kadal', 'lizard'],
    'domba_jantan': ['domba jantan', 'dombajantan', 'ram'],
    'buntal': ['buntal', 'pufferfish'],
    'rubah': ['rubah', 'fox'],
    'angsa_putih': ['angsa putih', 'angsaputih', 'white swan'],
    'luwak': ['luwak', 'otter'],
    'kalajengking': ['kalajengking', 'scorpion'],
    'gajah': ['gajah', 'elephant'],
    'badak': ['badak', 'rhino'],
    'paus': ['paus', 'whale'],
    'paus_biru': ['paus biru', 'pausbiru', 'blue whale'],
    'hiu': ['hiu', 'shark'],
    'kuda_nil': ['kuda nil', 'kudanil', 'hippo'],
    'gurita': ['gurita', 'octopus'],
    'merak': ['merak', 'peacock'],
    'gorila': ['gorila', 'gorilla'],
    'cumi': ['cumi', 'cumi cumi', 'squid'],
    'bison': ['bison'],
    'jerapah': ['jerapah', 'giraffe'],
    'zebra': ['zebra'],
    'singa': ['singa', 'lion'],
    'harimau': ['harimau', 'tiger'],
    'macan': ['macan', 'leopard'],
    'beruang': ['beruang', 'bear'],
    'serigala': ['serigala', 'wolf'],
    'rusa': ['rusa', 'deer'],
    'kanguru': ['kanguru', 'kangaroo'],
    'koala': ['koala'],
    'panda': ['panda'],
    'orangutan': ['orangutan'],
    'elang': ['elang', 'eagle'],
    'flamingo': ['flamingo'],
    'lumba': ['lumba', 'lumba lumba', 'dolphin'],

    // === RARE ===
    'skibidi': ['skibidi', 'skibidi toilet'],
    'creeper': ['creeper', 'mc creeper'],
    'drone': ['drone'],
    'warden': ['warden', 'mc warden'],

    // === EPIC ===
    'komodo': ['komodo'],
    'among_us': ['among us', 'amongus', 'impostor'],
    'jiangshi': ['jiangshi', 'vampire china'],
    'woody': ['woody', 'toy story woody'],
    'jessie': ['jessie', 'toy story jessie'],
    'barongsai': ['barongsai', 'lion dance'],
    'buzz_lightyear': ['buzz lightyear', 'buzz'],
    'cyclops': ['cyclops', 'mata satu'],
    'wayang': ['wayang', 'shadow puppet'],
    'centaur': ['centaur'],
    'chucky': ['chucky', 'boneka chucky'],

    // === LEGENDARY ===
    'nymph': ['nymph', 'peri hutan'],
    'mumi': ['mumi', 'mummy'],
    'annabelle': ['annabelle', 'boneka annabelle'],
    'slenderman': ['slenderman', 'slender'],
    'frankenstein': ['frankenstein', 'frank'],
    'pegasus': ['pegasus', 'kuda terbang'],
    'siren_head': ['siren head', 'sirenhead'],
    'titan': ['titan'],

    // === SECRET ===
    'poop': ['poop', 'tai', '💩'],
    'batu': ['batu', 'rock', 'stone'],
    'burung_hantu': ['burung hantu', 'burunghantu', 'owl'],
    'snowman': ['snowman', 'manusia salju'],
    'jack_o_lantern': ['jack o lantern', 'jackolantern', 'labu'],
    'ghost': ['ghost', 'hantu'],
    'anjing_alpha': ['anjing alpha', 'anjingalpha', 'alpha dog'],
    'meowy': ['meowy', 'meong'],
    'remy_ratatouille': ['remy', 'remy ratatouille', 'tikus koki'],
    'robot': ['robot'],
    'orc': ['orc'],
    'kucing_dewa': ['kucing dewa', 'kucingdewa', 'god cat'],
    'hello_kitty': ['hello kitty', 'hellokitty'],
    'pompom_hsr': ['pompom', 'pompom hsr'],
    'unicorn': ['unicorn'],
    'skeleton': ['skeleton', 'tengkorak'],
    'fairy': ['fairy', 'peri'],
    'trotter_numby': ['trotter numby', 'babi banker'],
    'mermaid': ['mermaid', 'putri duyung'],
    'alien': ['alien'],
    'trex': ['trex', 't rex', 'tyrannosaurus', 'dino', 'dinosaurus'],
    'tom_jerry': ['tom jerry', 'tomandjerry'],
    'paimon': ['paimon', 'genshin paimon'],
    'vampir': ['vampir', 'vampire'],
    'jin': ['jin', 'genie'],
    'naga': ['naga', 'dragon'],
    'happy_ghast': ['happy ghast', 'ghast'],
    'cerberus': ['cerberus', 'anjing 3 kepala'],
    'abby_wuwa': ['abby', 'abby wuwa'],
    'sphinx': ['sphinx'],
    'totoro': ['totoro'],
    'bond_forger': ['bond', 'bond forger', 'spy x family'],
    'fenrir': ['fenrir', 'serigala fenrir'],
    'shukaku': ['shukaku', 'ekor 1', '1ekor', 'ichibi'],
    'matatabi': ['matatabi', 'ekor 2', '2ekor', 'nibi'],
    'isobu': ['isobu', 'ekor 3', '3ekor', 'sanbi'],
    'son_goku': ['son goku', 'goku', 'kera ekor 4', '4ekor', 'yonbi'],
    'kokuo': ['kokuo', 'ekor 5', '5ekor', 'gobi'],
    'saiken': ['saiken', 'ekor 6', '6ekor', 'rokubi'],
    'chomei': ['chomei', 'ekor 7', '7ekor', 'nanabi'],
    'toothless': ['toothless', 'night fury'],
    'naga_emas': ['naga emas', 'nagaemas', 'golden dragon'],
    'gryphon': ['gryphon', 'griffin'],
    'mickey_mouse': ['mickey mouse', 'mickey'],
    'malaikat': ['malaikat', 'angel'],
    'doraemon': ['doraemon'],
    'phoenix': ['phoenix', 'burung api'],
    'garfield': ['garfield'],
    'bumblebee': ['bumblebee', 'transformer'],
    'gyuki': ['gyuki', 'ekor 8', '8ekor', 'hachibi'],
    'iblis': ['iblis', 'devil', 'setan'],
    'sonic': ['sonic'],
    'tigress': ['tigress', 'kungfu panda tigress'],
    'leviathan': ['leviathan'],
    'kurama': ['kurama', 'ekor 9', '9ekor', 'kyubi'],
    'medusa': ['medusa'],
    'hydra': ['hydra'],
    'master_shifu_po': ['shifu', 'po', 'kungfu panda'],
    'pikachu': ['pikachu'],
    'garuda': ['garuda'],
    'kraken': ['kraken'],
    'SCP_173': ['scp 173', 'scp173', 'patung'],
    'mjolnir': ['mjolnir', 'palu thor'],
    'valkyrie': ['valkyrie'],
    'gundam': ['gundam'],
    'king_kong': ['king kong', 'kong'],
    'godzilla': ['godzilla'],
    'pochita': ['pochita', 'pochi', 'chainsaw dog', 'woof'],
    'juubi': ['juubi', 'ekor 10', '10ekor', 'jubi', 'shinju']
}

const applySkill = (p, type) => {
  let multi = 1
  let data = pets[p.tipe]
  if(!data.skill) return {multi}

  // BUAT HUNT: exp x1.5, exp x2, exp x3
  if(type === 'hunt' && data.skill?.includes('exp x')) {
    let x = parseFloat(data.skill.match(/exp x([\d.]+)/)?.[1] || 1)
    multi *= x
  }

  // BUAT BATTLE: damage +60, power battle +50
  if(type === 'battle' && data.skill?.includes('damage +')) {
    let dmg = parseInt(data.skill.match(/damage \+(\d+)/)?.[1] || 0)
    multi += dmg/100
  }
  if(type === 'battle' && data.skill?.includes('power battle +')) {
    let pow = parseInt(data.skill.match(/power battle \+(\d+)/)?.[1] || 0)
    multi += pow/100
  }
  return {multi}
}

const getCooldown = (base, user) => {
  let multi = 1
  if(user.pets.some(p => p.tipe === 'jin')) multi *= 0.5
  if(user.pets.some(p => p.tipe === 'sonic')) multi *= 0.2
  if(user.pets.some(p => p.tipe === 'toothless')) multi *= 0.5
  if(user.pets.some(p => p.tipe === 'jessie')) multi *= 0.5
  
  let hasil = base * multi
  if(user.pets.some(p => p.tipe === 'jack_o_lantern')) hasil -= 10000
  return Math.max(10000, hasil)
}

// [TAMBAH FUNCTION BARU DI BAWAHNYA]
const cekBuzz = () => {
  let today = new Date().toDateString()
  let lastUsed = user.buzzUsed? new Date(user.buzzUsed).toDateString() : null
  if(user.pets.some(p => p.tipe === 'buzz_lightyear') && lastUsed !== today){
    user.buzzUsed = Date.now()
    saveDB(wdb)
    m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n🚀 *SKILL AKTIF*\n${pets['buzz_lightyear'].emoji} *BUZZ LIGHTYEAR*\n✨ To Infinity And Beyond!\nCooldown kamu di-skip 1x hari ini\n━━━━━━━━━━━`)
    return true
  }
  return false
}
  const getPet = (name) => user.pets.find(p => p.tipe === name)
  const getMood = (p) => {
    let avg = ((p.happy || 50) + (p.energy || 100) + (100 - (p.dirty || 0))) / 3
    if(avg >= 80) return '😄 Sangat Bahagia'
    if(avg >= 60) return '🙂 Senang'
    if(avg >= 40) return '😐 Biasa'
    if(avg >= 20) return '😞 Sedih'
    return '💀 Butuh Perhatian!'
  }
  const getRarityPet = () => {
    let roll = Math.random() * 100
    let cum = 0
    for(let r of Object.keys(rarities)){
      cum += rarities[r].rate
      if(roll <= cum) return r
    }
    return 'COMMON'
  }

  // === MENU UTAMA ===
  if (!action) {
    let cap = `╭──「 🐾 ZETA PET CENTER 」──╮\n\n`
    cap += `⏰ ${waktu} | ${jam}:${menit} WIB\n`
    cap += `💰 Saldo : Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n`
    cap += `📦 Total Pet : ${user.pets.length}/10\n`

    if(user.achievements.includes('master_breeder')) cap += `🏆 Achievement: Master Breeder\n\n`
    else cap += `\n`

    if (user.pets.length > 0) {
      cap += `🐾 DAFTAR PET KAMU 🐾\n`
      user.pets.slice(0,10).forEach((p, i) => {
        let mood = getMood(p)
        cap += `${i+1}. ${pets[p.tipe]?.emoji || '❓'} *${formatNama(p)}* | Lv.${p.level}\n`
        cap += ` └ Mood: ${mood}\n`
      })
      if(user.pets.length > 10) cap += `...dan ${user.pets.length - 10} pet lainnya\n`
      cap += `\n📌 Lihat detail:.pet status [no/nama]\n`
    } else cap += `_📝 Kamu belum punya pet. Ketik ${usedPrefix}pet shop buat beli_\n\n`

    cap += `━━━━━━━━━━━\n`
    cap += `📌.pet shop | adopt | gacha | sell | release | rename\n`
    cap += `📌.pet feed | walk | play | train | rest | clean\n`
    cap += `📌.pet battle | hunt | dispatch | heal | gift | kill | transfer\n`
    cap += `📌.pet breed | playwith @tag/reply\n`
    cap += `📌.pet claim | sanctuary | revive | lb\n`
    return sendRpgMsg(conn, m, cap, 'https://files.cloudkuimages.guru/images/54b79a9952b0.jpeg')
  }
  
    // === STATUS DETAIL ===
  if (action === 'status') {
    if(user.pets.length === 0) return m.reply('❌ Kamu tidak punya pet')
    let target = args[1]
    if(!target) return m.reply(`❌ Contoh:.pet status 1 atau.pet status kucing`)

    let p =!isNaN(target)? user.pets[parseInt(target)-1] : user.pets.find(x => x.tipe === target.replace(/ /g,'_'))
    if(!p) return m.reply('❌ Pet tidak ditemukan')

    let bersih = 100 - (p.dirty || 0)
    let cap = `╭──「 📋 DETAIL PET 」──╮\n\n`
    cap += `${pets[p.tipe].emoji} *${formatNama(p).toUpperCase()}*\n`
    cap += `🏷️ Jenis : ${formatNamaAsli(p.tipe)}\n`
    cap += `📈 Level : ${p.level} | 📊 Exp : ${p.exp}/100\n`
    cap += `✨ Skill : ${pets[p.tipe].skill || 'Tidak ada'}\n`
    cap += `🌟 Rarity : ${rarities[pets[p.tipe].rarity].emoji} ${pets[p.tipe].rarity}\n\n`
    cap += `🔋 Energy\n${bar(p.energy || 100)} ${(p.energy || 100)}%\n\n`
    cap += `😊 Happy\n${bar(p.happy || 50)} ${(p.happy || 50)}%\n\n`
    cap += `🧼 Kebersihan\n${bar(bersih)} ${bersih}%\n\n`
    cap += `Mood : ${getMood(p)}\n`
    cap += `━━━━━━━━━━━`
    return m.reply(cap)
  }

// === SHOP ===
  if (action === 'shop') {
    let sortedPets = Object.entries(pets).sort((a,b) => a[1].harga - b[1].harga)
    let totalAll = Object.values(pets).reduce((a,b) => a + b.harga, 0)

    // MAP NOMOR -> NAMA PET URUT 1-....
    const nomorKePet = {}
    sortedPets.forEach(([k], i) => nomorKePet[i+1] = k)
    user.nomorKePet = nomorKePet // simpan biar adopt bisa baca

    let cap = `╭───「 🛍️ ZETA PET SHOP 」───╮\n\n💰 Saldo : Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n`
    cap += `🛒 Beli: *.pet adopt <no/nama>*\n\n`

    let nomor = 1
    cap += `🟢 MURAH < 500RB 🟢\n`
    sortedPets.filter(([k,v]) => v.harga < 500000).forEach(([k, v]) => {
      cap += `├ [${nomor++}] ${v.emoji} ${formatNamaAsli(k).padEnd(15)} Rp ${v.harga.toLocaleString()}\n`
    })
    cap += `\n🔵 STANDAR 500RB-2JT 🔵\n`
    sortedPets.filter(([k,v]) => v.harga >= 500000 && v.harga < 2000000).forEach(([k, v]) => {
      cap += `├ [${nomor++}] ${v.emoji} ${formatNamaAsli(k).padEnd(15)} Rp ${v.harga.toLocaleString()}\n`
    })
    cap += `\n🟣 RARE 2JT-10JT 🟣\n`
    sortedPets.filter(([k,v]) => v.harga >= 2000000 && v.harga < 10000000).forEach(([k, v]) => {
      cap += `├ [${nomor++}] ${v.emoji} ${formatNamaAsli(k).padEnd(15)} Rp ${v.harga.toLocaleString()}\n`
    })
    cap += `\n🔴 LEGEND > 10JT 🔴\n`
    sortedPets.filter(([k,v]) => v.harga >= 10000000).forEach(([k, v]) => {
      cap += `├ [${nomor++}] ${v.emoji} ${formatNamaAsli(k).padEnd(15)} Rp ${v.harga.toLocaleString()}\n`
    })
    cap += `━━━━━━━━━━━\n💡 Tips: Beli pakai nomor lebih cepat`
    return m.reply(cap)
  }

  // === ADOPT ===
  if (action === 'adopt') {
      
    if(user.pets.length >= 10) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *PET PENUH*\nMax 10 pet. Release/Sell/Kill/Transfer dulu\n━━━━━━━━━━━`)
    let petName = args.slice(1).join(' ').toLowerCase()
    if (!petName) return m.reply(`❌ Contoh: ${usedPrefix}pet adopt 1`)

    // CEK APAKAH INPUTNYA NOMOR DARI SHOP
    if(!isNaN(petName) && user.nomorKePet){
      petName = user.nomorKePet[parseInt(petName)]
      if(!petName) return m.reply('❌ Nomor tidak valid. Cek.pet shop dulu')
    }

    petName = petName.replace(/ /g, '_').replace(/-/g, '_')
    petName = petName.replace(/ /g, '_').replace(/-/g, '_')

// CEK ALIAS DULU
for(let key in aliases){
  if(aliases[key].includes(petName)){
    petName = key
    break
  }
}

    if (!pets[petName]) return m.reply(`❌ Pilih pet yang benar. Ketik ${usedPrefix}pet shop`)
    if (getPet(petName)) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *KAMU SUDAH PUNYA*\n${pets[petName].emoji} *${formatNamaAsli(petName).toUpperCase()}*\n━━━━━━━━━━━`)
    let harga = pets[petName].harga
    if ((wdb.money[m.sender] || 0) < harga) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *UANG TIDAK CUKUP*\nButuh Rp ${harga.toLocaleString()}\n━━━━━━━━━━━`)
    wdb.money[m.sender] -= harga
    user.pets.push({ tipe: petName, level: 1, exp: 0, energy: 100, happy: 50, dirty: 0, nickname: null, lastFeed: 0, lastActivity: 0, lastRest: 0, lastTrain: 0, revive: true })
    saveDB(wdb)
    return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n✅ *ADOPSI BERHASIL*\n${pets[petName].emoji} *${formatNamaAsli(petName).toUpperCase()}*\n🌟 ${rarities[pets[petName].rarity].emoji} ${pets[petName].rarity}\n✨ Skill : ${pets[petName].skill || 'Tidak ada'}\n💰 Harga : -Rp ${harga.toLocaleString()}\n━━━━━━━━━━━`)
  }

// === GACHA ===
  if (action === 'gacha') {
    if(user.pets.length >= 10) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *PET PENUH*\nMax 10 pet. Release/Sell/Kill/Transfer dulu\n━━━━━━━━━━━`)
    let biaya = 10000000 // 10jt
    if ((wdb.money[m.sender] || 0) < biaya) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *UANG TIDAK CUKUP*\nButuh Rp ${biaya.toLocaleString()}\n━━━━━━━━━━━`)

    user.pity++
    // [NERF SADIS] RATE DIJATUHIN LAGI
    const raritiesNerf = {
      COMMON:    {stars: '★☆☆☆☆☆☆', emoji: '🤍', rate: 95},
      UNCOMMON:  {stars: '★★☆☆☆☆☆', emoji: '💙', rate: 52},
      RARE:      {stars: '★★★☆☆☆☆', emoji: '✨', rate: 2.4},
      EPIC:      {stars: '★★★★☆☆☆', emoji: '💎', rate: 0.49},
      LEGENDARY: {stars: '★★★★★☆☆', emoji: '👑', rate: 0.01},
      MYTHIC:    {stars: '★★★★★★☆', emoji: '🌌', rate: 0.01},
      SECRET: {stars: '★★★★★★★', emoji: '🔮', rate: 0.01} // 1/10.000
    }

    let roll = Math.random() * 100
    let cum = 0
    let rarity = 'COMMON'
    for(let r of Object.keys(raritiesNerf)){
      cum += raritiesNerf[r].rate
      if(roll <= cum){ rarity = r; break }
    }
    
    // [NERF PITY] 90 -> 500
    if(user.pity >= 500){ 
      rarity = 'LEGENDARY' // mentok cuma LEGEND, ga bisa MYTH/SECRET
      user.pity = 0 
    }
    if(rarity === 'LEGENDARY' || rarity === 'MYTHIC' || rarity === 'SECRET') user.pity = 0

    let pool = Object.entries(pets).filter(([k,v]) => v.rarity === rarity)
    let randomPet = pool[Math.floor(Math.random() * pool.length)][0]

    wdb.money[m.sender] -= biaya
    user.pets.push({ tipe: randomPet, level: 1, exp: 0, energy: 100, happy: 50, dirty: 0, nickname: null, lastFeed: 0, lastActivity: 0, lastRest: 0, lastTrain: 0, revive: true })
    saveDB(wdb)

    let pitySisa = 500 - user.pity
    return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n🎰 PET GACHA - 10JT/ROLL\n${raritiesNerf[rarity].emoji} *${rarity}*\n${raritiesNerf[rarity].stars}\n\n${pets[randomPet].emoji} *${formatNamaAsli(randomPet).toUpperCase()}*\n💰 Biaya : -Rp ${biaya.toLocaleString()}\n📊 Pity: ${pitySisa} lagi ke LEGEND\n━━━━━━━━━━━`)
  }
  
    // === CEK VAMPIR ===
  if(['walk','play','feed','rest','train'].includes(action)){
    if (user.pets.some(p => p.tipe === 'vampir') &&!isMalam) {
      return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n🧛 *VAMPIR TIDUR*\nVampir kamu bersembunyi di peti mati karena matahari!\nAktif lagi jam 18:00 - 05:59 WIB\n━━━━━━━━━━━`)
    }
  }

  const getDebuff = (p) => (p.dirty || 0) >= 80? 0.8 : (p.dirty || 0) >= 50? 0.9 : 1
  const cekCD = (key, durasi) => {
    let last = user.cooldown[key] || 0
    let sisa = durasi - (Date.now() - last)
    return sisa > 0? Math.ceil(sisa / 1000) : 0
  }

// === FEED ===
  if (action === 'feed') {
    if (user.pets.length === 0) return m.reply('❌ Kamu tidak punya pet.')
    let cd = getCooldown(120000, user)
    if(cekBuzz()) cd = 0 
    if (user.pets.some(p => Date.now() - (p.lastFeed || 0) < cd)) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n🍖 *MASIH KENYANG*\nPerut pet buncit. Nanti muntah\n⏰ Tunggu ${Math.ceil(cd/1000)} detik lagi\n━━━━━━━━━━━`)

    // HARGA FEED BERDASAR RARITY
    const feedCost = {
      COMMON: 5000,
      UNCOMMON: 15000,
      RARE: 50000,
      EPIC: 150000,
      LEGENDARY: 500000,
      MYTHIC: 1000000,
      SECRET: 2000000
    }
    const feedExp = {
      COMMON: 20,
      UNCOMMON: 25,
      RARE: 35,
      EPIC: 50,
      LEGENDARY: 70,
      MYTHIC: 90,
      SECRET: 120
    }

    let biayaMakan = 0
    let detailBiaya = []
    user.pets.filter(p => p.tipe !== 'robot').forEach(p => {
      let rarity = pets[p.tipe]?.rarity || 'COMMON'
      let cost = feedCost[rarity]
      biayaMakan += cost
      detailBiaya.push(`${pets[p.tipe].emoji} ${formatNama(p)}: Rp ${cost.toLocaleString()}`)
    })

    if ((wdb.money[m.sender] || 0) < biayaMakan) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *UANG TIDAK CUKUP*\nButuh Rp ${biayaMakan.toLocaleString()}.\n━━━━━━━━━━━`)
    
    wdb.money[m.sender] -= biayaMakan
    let naik = []
    user.pets.forEach(p => {
      if(p.tipe === 'robot') return
      let rarity = pets[p.tipe]?.rarity || 'COMMON'
      let expGain = feedExp[rarity] + (p.tipe === 'anjing_alpha' ? 10 : 0)
      let energyGain = 20 + (p.tipe === 'mermaid' ? 10 : 0)
      
      p.exp += expGain
      p.energy = Math.min(100, (p.energy || 100) + energyGain)
      p.happy = Math.min(100, (p.happy || 50) + 5)
      
      if(p.tipe === 'alien') wdb.money[m.sender] += 1000 * p.level
      if(p.tipe === 'poop') wdb.money[m.sender] += 2000
      if(p.tipe === 'remy_ratatouille') wdb.money[m.sender] += Math.floor(biayaMakan * 0.5 / user.pets.filter(x => x.tipe !== 'robot').length) // refund 50%
      
      p.lastFeed = Date.now()
      if (p.exp >= 100) { p.level += 1; p.exp = 0; naik.push(p) }
    })
    saveDB(wdb)
    
    let teks = `╭──「 🐾 ZETA PET CENTER 」──╮\n\n🍖 WAKTU MAKAN TIBA\n🍽️ MEMBERI MAKAN 🍽️\n`
    teks += `💰 Biaya Total : -Rp ${biayaMakan.toLocaleString()}\n`
    teks += `📊 Detail:\n${detailBiaya.map(x => `├ ${x}`).join('\n')}\n`
    teks += `│\n├ Status : Exp beda2 | +20 Energy | +5 Happy`
    if(naik.length) teks += `\n\n🎉 LEVEL UP!\n${naik.map(n => `${pets[n.tipe].emoji} ${formatNama(n)}`).join('\n')}`
    teks += `\n━━━━━━━━━━━`
    return m.reply(teks)
  }

  // === TRAIN ===
  if (action === 'train') {
    if (user.pets.length === 0) return m.reply('❌ Kamu tidak punya pet.')
    let cd = getCooldown(300000, user)
   if(cekBuzz()) cd = 0
   let naik = [] // [TAMBAH INI]
   if (user.pets.some(p => Date.now() - (p.lastTrain || 0) < cd)) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n💪 *PET MASIH LATIHAN*\nOtot mereka masih sakit. Istirahat dulu\n⏰ Tunggu ${Math.ceil(cd/1000)} detik lagi\n━━━━━━━━━━━`)
    if (user.pets.some(p => (p.energy || 100) < 30 &&!['batu','zombie'].includes(p.tipe))) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n😵 *ENERGY RENDAH*\nMinimal 30% untuk latihan\n━━━━━━━━━━━`)
    user.pets.forEach(p => {
      let expGain = 60 * getDebuff(p) * (p.tipe === 'skeleton'? 1.5 : 1) + (p.tipe === 'orc'? 10 : 0)
      if(p.tipe === 'vampir' && isMalam) expGain += 20
      if(p.tipe === 'serigala' && isMalam) expGain += 15
      let energyLoss = 30 * (p.tipe === 'zombie'? 0.5 : 1)
      if(p.tipe === 'burung_hantu' && isMalam) energyLoss = 15
      if(!['batu','zombie'].includes(p.tipe)) p.energy -= energyLoss
      p.exp += expGain; p.happy -= 5; p.dirty = Math.min(100, (p.dirty || 0) + 20); p.lastTrain = Date.now()
      if (p.exp >= 100) { p.level += 1; p.exp = 0; naik.push(p) }
    })
    saveDB(wdb)
    let teks = `╭──「 🐾 ZETA PET CENTER 」──╮\n\n💪 SESI LATIHAN\n🏋️ MELATIH PET 🏋️`
    if(user.pets.some(p => p.tipe === 'jin')) teks += `\n🧞 Bonus : Jin mempercepat latihan!`
    if(getDebuff(user.pets[0]) < 1) teks += `\n💩 Debuff : Pet kotor! Exp -${Math.round((1-getDebuff(user.pets[0]))*100)}%`
    teks += `\n📊 Status : +60 Exp | -30 Energy | -5 Happy | +20 Dirty`
    if(naik.length) teks += `\n\n🎉 LEVEL UP!\n${naik.map(n => `${pets[n.tipe].emoji} ${formatNama(n)}`).join('\n')}`
    teks += `\n━━━━━━━━━━━`
    return m.reply(teks)
  }
  
    // === WALK ===
  if (action === 'walk') {
    if (user.pets.length === 0) return m.reply('❌ Kamu tidak punya pet.')
    let cd = getCooldown(60000, user)
    if(cekBuzz()) cd = 0 
    if (user.pets.some(p => (p.energy || 100) < 20 &&!['batu','zombie'].includes(p.tipe))) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n😵 *KECAPEKAN JALAN*\n${pets['anjing']?.emoji || '🐾'} Pet kamu duduk & ngos-ngosan\n🔋 Isi energy dulu minimal 20%\n━━━━━━━━━━━`)
    if (Date.now() - (user.pets[0].lastActivity || 0) < cd) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n🚶 *KAKI MASIH PEGEL*\nPet baru aja jalan-jalan. Kasih napas dulu\n⏰ Tunggu ${Math.ceil(cd/1000)} detik lagi\n━━━━━━━━━━━`)
    let naik = []
    user.pets.forEach(p => {
      let expGain = 30 * getDebuff(p) * (p.tipe === 'skeleton'? 1.5 : 1) + (p.tipe === 'orc'? 5 : 0)
      if(p.tipe === 'vampir' && isMalam) expGain += 15
      if(p.tipe === 'serigala' && isMalam) expGain += 10
      let energyLoss = 20 * (p.tipe === 'zombie'? 0.5 : 1)
      if(p.tipe === 'burung_hantu' && isMalam) energyLoss = 10
      if(!['batu','zombie'].includes(p.tipe)) p.energy -= energyLoss
      p.exp += expGain; p.happy = Math.min(100, (p.happy || 50) + 5); p.dirty = Math.min(100, (p.dirty || 0) + 15); p.lastActivity = Date.now()
      if (p.exp >= 100) { p.level += 1; p.exp = 0; naik.push(p) }
    })
    saveDB(wdb)
    let teks = `╭──「 🐾 ZETA PET CENTER 」──╮\n\n🚶 JALAN-JALAN BERSAMA\n🌳 WALKING 🌳`
    if(user.pets.some(p => p.tipe === 'jin')) teks += `\n🧞 Bonus : Jin membawamu terbang!`
    if(user.pets.some(p => p.tipe === 'jack_o_lantern')) teks += `\n🎃 Bonus : Jack o lantern menerangi jalan!`
    if(getDebuff(user.pets[0]) < 1) teks += `\n💩 Debuff : Pet kotor! Exp -${Math.round((1-getDebuff(user.pets[0]))*100)}%`
    teks += `\n📊 Status : +30 Exp | -20 Energy | +5 Happy | +15 Dirty`
    if(naik.length) teks += `\n\n🎉 LEVEL UP!\n${naik.map(n => `${pets[n.tipe].emoji} ${formatNama(n)}`).join('\n')}`
    teks += `\n━━━━━━━━━━━`
    return m.reply(teks)
  }

  // === PLAY ===
  if (action === 'play') {
    if (user.pets.length === 0) return m.reply('❌ Kamu tidak punya pet.')
    let cd = getCooldown(60000, user)
    if(cekBuzz()) cd = 0 
    if (user.pets.some(p => (p.energy || 100) < 20 &&!['batu','zombie'].includes(p.tipe))) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n🥵 *KEHABISAN TENAGA*\n${pets['kucing']?.emoji || '🐾'} Pet rebahan minta digendong\n🔋 Kasih rest atau vitamin dulu\n━━━━━━━━━━━`)
    if (Date.now() - (user.pets[0].lastActivity || 0) < cd) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n🎮 *KECAPEKAN MAIN*\nPet lagi ngos-ngosan. Ajak main lagi nanti\n⏰ Tunggu ${Math.ceil(cd/1000)} detik lagi\n━━━━━━━━━━━`)
    let naik = []
    user.pets.forEach(p => {
      let expGain = 30 * getDebuff(p) * (p.tipe === 'skeleton'? 1.5 : 1)
      if(p.tipe === 'vampir' && isMalam) expGain += 15
      let happyGain = 10 * (p.tipe === 'ghost'? 2 : 1)
      let energyLoss = 20 * (p.tipe === 'zombie'? 0.5 : 1)
      if(p.tipe === 'burung_hantu' && isMalam) energyLoss = 10
      if(p.tipe === 'snowman' &&!isMalam) energyLoss = 30
      if(!['batu','zombie'].includes(p.tipe)) p.energy -= energyLoss
      p.exp += expGain; p.happy = Math.min(100, (p.happy || 50) + happyGain); p.dirty = Math.min(100, (p.dirty || 0) + 10); p.lastActivity = Date.now()
      if (p.exp >= 100) { p.level += 1; p.exp = 0; naik.push(p) }
    })
    saveDB(wdb)
    let teks = `╭──「 🐾 ZETA PET CENTER 」──╮\n\n🎮 WAKTU BERMAIN\n⚽ PLAYING ⚽`
    if(user.pets.some(p => p.tipe === 'ghost')) teks += `\n👻 Bonus : Ghost membuat suasana lebih seru!`
    if(!isMalam && user.pets.some(p => p.tipe === 'snowman')) teks += `\n⛄ Debuff : Snowman kepanasan! Energy -30`
    if(getDebuff(user.pets[0]) < 1) teks += `\n💩 Debuff : Pet kotor! Exp -${Math.round((1-getDebuff(user.pets[0]))*100)}%`
    teks += `\n📊 Status : +30 Exp | -20 Energy | +10 Happy | +10 Dirty`
    if(naik.length) teks += `\n\n🎉 LEVEL UP!\n${naik.map(n => `${pets[n.tipe].emoji} ${formatNama(n)}`).join('\n')}`
    teks += `\n━━━━━━━━━━━`
    return m.reply(teks)
  }

  // === REST ===
  if (action === 'rest') {
    if (user.pets.length === 0) return m.reply('❌ Kamu tidak punya pet.')
    if (user.pets.every(p => p.tipe === 'vampir')) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n🧛 *VAMPIR TIDUR*\nVampir tidak perlu istirahat. Mereka begadang selamanya\n━━━━━━━━━━━`)
    let cd = getCooldown(600000, user)
    if(cekBuzz()) cd = 0 
    if (Date.now() - (user.pets[0].lastRest || 0) < cd) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n😴 *MASIH NGANTUK*\nPet belum bangun tidur. Jangan diganggu\n⏰ Tunggu ${Math.ceil(cd/1000)} detik lagi\n━━━━━━━━━━━`)
    user.pets.forEach(p => {
      if(p.energy <= 0 && p.tipe === 'phoenix' && p.revive){ p.energy = 100; p.revive = false }
      let happyGain = 0 + (p.tipe === 'fairy'? 5 : 0)
      p.energy = Math.min(100, (p.energy || 100) + 30)
      p.happy = Math.min(100, (p.happy || 50) + happyGain)
      p.dirty = Math.min(100, (p.dirty || 0) + 5)
      p.lastRest = Date.now()
    })
    saveDB(wdb)
    return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n😴 WAKTU ISTIRAHAT\n🛏️ RESTING 🛏️\n📊 Status : +30 Energy | +5 Dirty\n━━━━━━━━━━━`)
  }

  // === CLEAN ===
  if (action === 'clean') {
    if (user.pets.length === 0) return m.reply('❌ Kamu tidak punya pet.')
    let biaya = 2000 * user.pets.length
    if ((wdb.money[m.sender] || 0) < biaya) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *UANG TIDAK CUKUP*\nButuh Rp ${biaya.toLocaleString()} untuk sabun + sampo\n━━━━━━━━━━━`)
    if(user.pets.every(p => (p.dirty || 0) === 0)) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n✨ *SUDAH BERSIH*\nSemua pet kamu sudah bersih!\n━━━━━━━━━━━`)
    wdb.money[m.sender] -= biaya
    user.pets.forEach(p => { p.dirty = 0; p.happy = Math.min(100, (p.happy || 50) + 10) })
    saveDB(wdb)
    return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n🧼 WAKTU MANDI\n🛁 MEMBERSIHKAN PET 🛁\n💰 Biaya : -Rp ${biaya.toLocaleString()}\n📊 Status : Semua pet bersih! +10 Happy\n━━━━━━━━━━━`)
  }

  // === HEAL ===
  if (action === 'heal') {
    if (user.pets.length === 0) return m.reply('❌ Kamu tidak punya pet.')
    let target = args[1]
    if(!target) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *FORMAT SALAH*\nContoh:.pet heal 1 atau.pet heal kucing\n━━━━━━━━━━━`)
    let p =!isNaN(target)? user.pets[parseInt(target)-1] : user.pets.find(x => x.tipe === target.replace(/ /g,'_'))
    if(!p) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *PET TIDAK DITEMUKAN*\n━━━━━━━━━━━`)
    let biaya = 5000 * p.level
    if ((wdb.money[m.sender] || 0) < biaya) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *UANG TIDAK CUKUP*\nButuh Rp ${biaya.toLocaleString()}\n━━━━━━━━━━━`)
    wdb.money[m.sender] -= biaya
    p.energy = 100; p.happy = 100; p.dirty = 0
    saveDB(wdb)
    return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n💊 WAKTU PENGOBATAN\n🏥 MENYEMBUHKAN PET 🏥\n${pets[p.tipe].emoji} *${formatNama(p).toUpperCase()}*\n📊 Status : Energy 100% | Happy 100% | Bersih\n💰 Biaya : -Rp ${biaya.toLocaleString()}\n━━━━━━━━━━━`)
  }
  
    // === GIFT ===
  if (action === 'gift') {
    if (user.pets.length === 0) return m.reply('❌ Kamu tidak punya pet.')
    let target = args[1]
    let item = args[2]?.toLowerCase()
    if(!target ||!item) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *FORMAT SALAH*\nContoh:.pet gift 1 snack\nItem: snack, mainan, vitamin\n━━━━━━━━━━━`)
    let p =!isNaN(target)? user.pets[parseInt(target)-1] : user.pets.find(x => x.tipe === target.replace(/ /g,'_'))
    if(!p) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *PET TIDAK DITEMUKAN*\n━━━━━━━━━━━`)

    if(item === 'snack'){
      if((wdb.money[m.sender] || 0) < 3000) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *UANG TIDAK CUKUP*\nButuh Rp 3,000\n━━━━━━━━━━━`)
      wdb.money[m.sender] -= 3000
      p.happy = Math.min(100, (p.happy || 50) + 15)
      saveDB(wdb)
      return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n🍖 MEMBERI HADIAH\n${pets[p.tipe].emoji} *${formatNama(p).toUpperCase()}*\n📊 Status : +15 Happy\n💰 Biaya : -Rp 3,000\n━━━━━━━━━━━`)
    }
    if(item === 'mainan'){
      if((wdb.money[m.sender] || 0) < 10000) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *UANG TIDAK CUKUP*\nButuh Rp 10,000\n━━━━━━━━━━━`)
      wdb.money[m.sender] -= 10000
      p.happy = Math.min(100, (p.happy || 50) + 30); p.exp += 10
      saveDB(wdb)
      return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n🧸 MEMBERI HADIAH\n${pets[p.tipe].emoji} *${formatNama(p).toUpperCase()}*\n📊 Status : +30 Happy | +10 Exp\n💰 Biaya : -Rp 10,000\n━━━━━━━━━━━`)
    }
    if(item === 'vitamin'){
      if((wdb.money[m.sender] || 0) < 15000) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *UANG TIDAK CUKUP*\nButuh Rp 15,000\n━━━━━━━━━━━`)
      wdb.money[m.sender] -= 15000
      p.energy = Math.min(100, (p.energy || 100) + 40)
      saveDB(wdb)
      return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n💊 MEMBERI HADIAH\n${pets[p.tipe].emoji} *${formatNama(p).toUpperCase()}*\n📊 Status : +40 Energy\n💰 Biaya : -Rp 15,000\n━━━━━━━━━━━`)
    }
    return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *ITEM TIDAK ADA*\nPilih: snack, mainan, vitamin\n━━━━━━━━━━━`)
  }

  // === RENAME ===
  if (action === 'rename') {
    if (user.pets.length === 0) return m.reply('❌ Kamu tidak punya pet.')
    let target = args[1]
    let namaBaru = args.slice(2).join(' ')
    if(!target ||!namaBaru) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *FORMAT SALAH*\nContoh:.pet rename 1 SiBulat\n━━━━━━━━━━━`)
    let p =!isNaN(target)? user.pets[parseInt(target)-1] : user.pets.find(x => x.tipe === target.replace(/ /g,'_'))
    if(!p) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *PET TIDAK DITEMUKAN*\n━━━━━━━━━━━`)
    if(namaBaru.length > 15) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *NAMA KEPANJANGAN*\nMax 15 karakter\n━━━━━━━━━━━`)
    p.nickname = namaBaru
    saveDB(wdb)
    return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n🏷️ GANTI NAMA PET\n${pets[p.tipe].emoji} *${formatNama(p).toUpperCase()}*\n➡️ Nama baru : *${namaBaru}*\n━━━━━━━━━━━`)
  }

  // === RELEASE ===
  if (action === 'release') {
    let petName = args.slice(1).join(' ').toLowerCase()
    if (!petName) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *FORMAT SALAH*\nContoh:.pet release kucing\n━━━━━━━━━━━`)
    petName = petName.replace(/ /g, '_').replace(/-/g, '_')
    petName = petName.replace(/ /g, '_').replace(/-/g, '_')

// CEK ALIAS DULU
for(let key in aliases){
  if(aliases[key].includes(petName)){
    petName = key
    break
  }
}
    let index = user.pets.findIndex(p => p.tipe === petName)
    if (index === -1) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *PET TIDAK DITEMUKAN*\n━━━━━━━━━━━`)
    let refund = Math.floor(pets[petName].harga * 0.5)
    wdb.money[m.sender] += refund
    user.pets.splice(index, 1)
    saveDB(wdb)
    return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n💔 MELEPASKAN PET\n${pets[petName].emoji} *${formatNamaAsli(petName).toUpperCase()}*\n💰 Refund : +Rp ${refund.toLocaleString()}\n━━━━━━━━━━━`)
  }

  // === SELL ===
  if (action === 'sell') {
    let target = args[1]
    if(!target) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *FORMAT SALAH*\nContoh:.pet sell 1\n━━━━━━━━━━━`)
    let idx =!isNaN(target)? parseInt(target)-1 : user.pets.findIndex(p => p.tipe === target.replace(/ /g,'_'))
    if(idx === -1) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *PET TIDAK DITEMUKAN*\n━━━━━━━━━━━`)
    let p = user.pets[idx]
    let hargaDasar = pets[p.tipe].harga
    let multiplier = Math.floor(p.level / 50) + 1
    let hargaJual = Math.floor(hargaDasar * 0.7 * multiplier)
    wdb.money[m.sender] += hargaJual
    user.pets.splice(idx, 1)
    saveDB(wdb)
    return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n💸 MENJUAL PET\n${pets[p.tipe].emoji} *${formatNama(p).toUpperCase()}*\n📈 Level : ${p.level}\n💰 Harga Jual : +Rp ${hargaJual.toLocaleString()}\n━━━━━━━━━━━`)
  }

  // === BREED ===
  if (action === 'breed') {
    if(user.pets.length >= 10) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *PET PENUH*\nMax 10 pet. Release/Sell/Kill/Transfer dulu\n━━━━━━━━━━━`)
    let cd = cekCD('petbreed', 86400000)
    if(cd > 0) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n⏰ *MASIH COOLDOWN*\nTunggu ${Math.floor(cd/3600)} jam lagi\n━━━━━━━━━━━`)

    let pet1 = args[1]
    let pet2 = args[2]
    if(!pet1 ||!pet2) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *FORMAT SALAH*\nContoh:.pet breed 1 2\nHarus 2 pet spesies sama\n━━━━━━━━━━━`)

    let p1 =!isNaN(pet1)? user.pets[parseInt(pet1)-1] : user.pets.find(x => x.tipe === pet1.replace(/ /g,'_'))
    let p2 =!isNaN(pet2)? user.pets[parseInt(pet2)-1] : user.pets.find(x => x.tipe === pet2.replace(/ /g,'_'))
    if(!p1 ||!p2) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *PET TIDAK DITEMUKAN*\n━━━━━━━━━━━`)
    if(p1.tipe!== p2.tipe) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *SPESIES BERBEDA*\nBreed hanya bisa sesama jenis\n━━━━━━━━━━━`)
    if((p1.energy || 100) < 50 || (p2.energy || 100) < 50) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *ENERGY KURANG*\nMinimal 50% untuk breed\n━━━━━━━━━━━`)

    let biaya = 100000
    if ((wdb.money[m.sender] || 0) < biaya) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *UANG TIDAK CUKUP*\nButuh Rp ${biaya.toLocaleString()}\n━━━━━━━━━━━`)

    wdb.money[m.sender] -= biaya
    p1.energy -= 50; p2.energy -= 50
    let berhasil = Math.random() < 0.5

    user.cooldown.petbreed = Date.now()
    saveDB(wdb)

    if(berhasil){
      user.pets.push({ tipe: p1.tipe, level: 1, exp: 0, energy: 100, happy: 50, dirty: 0, nickname: null, lastFeed: 0, lastActivity: 0, lastRest: 0, lastTrain: 0, revive: true })
      saveDB(wdb)
      return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n💕 BREED BERHASIL\n${pets[p1.tipe].emoji} *${formatNamaAsli(p1.tipe).toUpperCase()}* + ${pets[p2.tipe].emoji} *${formatNamaAsli(p2.tipe).toUpperCase()}*\n🎉 Dapat bayi baru!\n💰 Biaya : -Rp ${biaya.toLocaleString()}\n━━━━━━━━━━━`)
    } else {
      return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n💔 BREED GAGAL\n${pets[p1.tipe].emoji} *${formatNamaAsli(p1.tipe).toUpperCase()}* + ${pets[p2.tipe].emoji} *${formatNamaAsli(p2.tipe).toUpperCase()}*\n😢 Tidak dapat keturunan\n💰 Biaya : -Rp ${biaya.toLocaleString()}\n━━━━━━━━━━━`)
    }
  }
  
    // === BATTLE ===
  if (action === 'battle') {
    let cd = cekCD('petbattle', 300000)
    if(cd > 0) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n⏰ *MASIH CAFEK BATTLE*\nTunggu ${Math.floor(cd/60)} menit ${cd%60} detik lagi\n━━━━━━━━━━━`)

    let target = m.mentionedJid[0] || m.quoted?.sender
    if(!target) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *TAG TARGET*\nContoh:.pet battle @tag 50000\n━━━━━━━━━━━`)
    if(target === m.sender) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *TIDAK BISA*\nGa bisa battle sama diri sendiri\n━━━━━━━━━━━`)

    let dataTarget = getUserRPG(wdb, target)
    let userTarget = dataTarget.rpg
    if(!userTarget.pets) userTarget.pets = []
    if(userTarget.pets.length === 0) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *TARGET TIDAK PUNYA PET*\n━━━━━━━━━━━`)
    if(user.pets.length === 0) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *KAMU TIDAK PUNYA PET*\n━━━━━━━━━━━`)

    let myPet = [...user.pets].sort((a,b) => b.level - a.level || b.exp - a.exp)[0]
    let enemyPet = [...userTarget.pets].sort((a,b) => b.level - a.level || b.exp - a.exp)[0]
    let idxA = user.pets.findIndex(p => p.tipe === myPet.tipe)
    let idxB = userTarget.pets.findIndex(p => p.tipe === enemyPet.tipe)

    if((myPet.energy || 100) < 20) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *ENERGY RENDAH*\nPet ${formatNama(myPet)} energy < 20%\n━━━━━━━━━━━`)
    if((enemyPet.energy || 100) < 20) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *ENERGY TARGET RENDAH*\n━━━━━━━━━━━`)

    let taruhan = parseInt(args[1]) || 0
    let uangUser = wdb.money[m.sender] || 0
    let uangTarget = wdb.money[target] || 0
    if(taruhan > 0){
      if(taruhan < 1000) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *MINIMAL TARUHAN*\nRp 1,000\n━━━━━━━━━━━`)
      if(uangUser < taruhan) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *UANG KAMU KURANG*\n━━━━━━━━━━━`)
      if(uangTarget < taruhan) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *UANG TARGET KURANG*\n━━━━━━━━━━━`)
    }

    let powerA = myPet.level * 10 + myPet.exp + Math.floor(Math.random() * 50)
let skillA = applySkill(myPet, 'battle')
powerA = Math.floor(powerA * skillA.multi)

let powerB = enemyPet.level * 10 + enemyPet.exp + Math.floor(Math.random() * 50)
let skillB = applySkill(enemyPet, 'battle')
powerB = Math.floor(powerB * skillB.multi)
    if(myPet.tipe === 'vampir' && isMalam) powerA += 30
    if(enemyPet.tipe === 'vampir' && isMalam) powerB += 30
    if(myPet.tipe === 'SCP_173') powerA = 999
if(enemyPet.tipe === 'SCP_173') powerB = 999

    user.pets[idxA].energy = Math.max(0, (myPet.energy || 100) - 20)
    userTarget.pets[idxB].energy = Math.max(0, (enemyPet.energy || 100) - 20)

    let cap = `╭──「 🐾 ZETA PET CENTER 」──╮\n\n┌───❏「 ⚔️ PET BATTLE 」❏\n│\n`
    cap += `│ @${m.sender.split('@')[0]}\n│ ${pets[myPet.tipe].emoji} ${formatNama(myPet)} Lv.${myPet.level}\n│ Power: ${powerA}\n`
    cap += `│\n│ VS\n│\n`
    cap += `│ @${target.split('@')[0]}\n│ ${pets[enemyPet.tipe].emoji} ${formatNama(enemyPet)} Lv.${enemyPet.level}\n│ Power: ${powerB}\n│\n`
    if(taruhan > 0) cap += `│ 💰 Taruhan: Rp ${taruhan.toLocaleString()}\n│\n`

    if(powerA > powerB){
      if(taruhan > 0){ wdb.money[m.sender] += taruhan; wdb.money[target] -= taruhan }
      user.pets[idxA].exp += 40; userTarget.pets[idxB].exp += 10
      if(user.pets[idxA].exp >= 100){ user.pets[idxA].level++; user.pets[idxA].exp = 0; cap += `│ 🎉 ${formatNama(myPet)} LEVEL UP!\n` }
      cap += `│ 🏆 *PEMENANG*\n│ @${m.sender.split('@')[0]}\n│ +40 Exp`
      if(taruhan > 0) cap += `\n│ +Rp ${taruhan.toLocaleString()}`
    } else if(powerB > powerA){
      if(taruhan > 0){ wdb.money[target] += taruhan; wdb.money[m.sender] -= taruhan }
      userTarget.pets[idxB].exp += 40; user.pets[idxA].exp += 10
      if(userTarget.pets[idxB].exp >= 100){ userTarget.pets[idxB].level++; userTarget.pets[idxB].exp = 0; cap += `│ 🎉 ${formatNama(enemyPet)} LEVEL UP!\n` }
      cap += `│ 🏆 *PEMENANG*\n│ @${target.split('@')[0]}\n│ +40 Exp`
      if(taruhan > 0) cap += `\n│ +Rp ${taruhan.toLocaleString()}`
    } else {
      user.pets[idxA].exp += 20; userTarget.pets[idxB].exp += 20
      cap += `│ 🤝 *HASIL: SERI*\n│ +20 Exp untuk keduanya`
    }
    cap += `\n└───────────────────\n━━━━━━━━━━━`

    user.cooldown.petbattle = Date.now()
    saveDB(wdb)
    return sendRpgMsg(conn, m, cap, 'https://files.cloudkuimages.guru/images/54b79a9952b0.jpeg', [m.sender, target])
  }

  // === HUNT ===
  if (action === 'hunt') {
    let cd = cekCD('pethunt', 600000)
    if(cd > 0) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n⏰ *MASIH CAFEK BERBURU*\nTunggu ${Math.floor(cd/60)} menit lagi\n━━━━━━━━━━━`)
    if(user.pets.length === 0) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *TIDAK PUNYA PET*\n━━━━━━━━━━━`)
    if(user.pets.some(p => (p.energy || 100) < 40)) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *ENERGY KURANG*\nMinimal 40%\n━━━━━━━━━━━`)

    let hasil = Math.floor(Math.random() * 50000) + 10000
    let exp = Math.floor(Math.random() * 30) + 10
    wdb.money[m.sender] += hasil
    user.pets.forEach(p => {
  let skill = applySkill(p, 'hunt')
  let expGain = exp * skill.multi * getDebuff(p)
  p.exp += expGain; p.energy -= 40;
  if(p.exp >= 100){p.level++; p.exp=0}
})
    user.cooldown.pethunt = Date.now()
    saveDB(wdb)
    return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n🎯 PET HUNT\n🏹 BERBURU BERSAMA 🏹\n💰 Hasil : +Rp ${hasil.toLocaleString()}\n📊 Exp : +${exp} untuk semua pet\n🔋 Energy : -40\n━━━━━━━━━━━`)
  }

  // === DISPATCH ===
  if (action === 'dispatch') {
    let cd = cekCD('petdispatch', 1800000)
    if(cd > 0) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n⏰ *PET MASIH MISI*\nTunggu ${Math.floor(cd/60000)} menit lagi\n━━━━━━━━━━━`)
    if(user.pets.length === 0) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *TIDAK PUNYA PET*\n━━━━━━━━━━━`)
    user.cooldown.petdispatch = Date.now()
    saveDB(wdb)
    setTimeout(() => {
      let hasil = Math.floor(Math.random() * 100000) + 50000
      wdb.money[m.sender] += hasil
      saveDB(wdb)
      conn.reply(m.sender, `╭──「 🐾 ZETA PET CENTER 」──╮\n\n📦 MISI SELESAI\n📬 PET KEMBALI\n💰 Hasil : +Rp ${hasil.toLocaleString()}\n━━━━━━━━━━━`, m)
    }, 1800000)
    return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n📤 KIRIM MISI\n🚚 PET BERANGKAT\n⏱️ Durasi : 30 menit\n📝 Nanti hasil dikirim ke chat pribadi\n━━━━━━━━━━━`)
  }

    // === KILL ===
  if (action === 'kill') {
    let target = args[1]
    if(!target) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *FORMAT SALAH*\nContoh:.pet kill 1\n━━━━━━━━━━━`)
    let idx =!isNaN(target)? parseInt(target)-1 : user.pets.findIndex(p => p.tipe === target.replace(/ /g,'_'))
    if(idx === -1) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *PET TIDAK DITEMUKAN*\n━━━━━━━━━━━`)
    let p = user.pets[idx]
    let nama = formatNama(p)
    let tipe = p.tipe
    user.pets.splice(idx, 1)
    saveDB(wdb)
    return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n☠️ MEMBUNUH PET\n${pets[tipe].emoji} *${nama.toUpperCase()}*\nStatus : Telah mati...\n━━━━━━━━━━━`)
  }

  // === TRANSFER ===
  if (action === 'transfer') {
    let target = m.mentionedJid[0]
    let petName = args[2]
    if(!target ||!petName) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *FORMAT SALAH*\nContoh:.pet transfer @tag kucing\n━━━━━━━━━━━`)
    let idx = user.pets.findIndex(p => p.tipe === petName.replace(/ /g,'_'))
    if(idx === -1) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *KAMU TIDAK PUNYA PET ITU*\n━━━━━━━━━━━`)
    let dataTarget = getUserRPG(wdb, target)
    if(!dataTarget.rpg.pets) dataTarget.rpg.pets = []
    wdb.users[target].rpg.pets.push(user.pets[idx])
    user.pets.splice(idx, 1)
    saveDB(wdb)
    return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n📨 TRANSFER PET\n${pets[petName.replace(/ /g,'_')].emoji} *${formatNamaAsli(petName)}*\n➡️ Dikirim ke : @${target.split('@')[0]}\n━━━━━━━━━━━`, null, { mentions: [target] })
  }

  // === PLAYWITH ===
  if (action === 'playwith') {
    let target = m.mentionedJid[0] || m.quoted?.sender
    if(!target) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *TAG/REPLY TARGET*\nContoh:.pet playwith @tag\n━━━━━━━━━━━`)
    let dataTarget = getUserRPG(wdb, target)
    if(!dataTarget.rpg.pets || dataTarget.rpg.pets.length === 0) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *TARGET TIDAK PUNYA PET*\n━━━━━━━━━━━`)
    if(user.pets.length === 0) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *KAMU TIDAK PUNYA PET*\n━━━━━━━━━━━`)
    let myPet = user.pets[0]
    let targetPet = dataTarget.rpg.pets[0]
    myPet.happy = Math.min(100, (myPet.happy || 50) + 20)
    targetPet.happy = Math.min(100, (targetPet.happy || 50) + 20)
    saveDB(wdb)
    return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n🎾 PLAY TOGETHER\n${pets[myPet.tipe].emoji} *${formatNama(myPet)}* + ${pets[targetPet.tipe].emoji} *${formatNama(targetPet)}*\n📊 Status : +20 Happy untuk keduanya\n━━━━━━━━━━━`)
  }
  
  // === SANCTUARY ===
  if (action === 'sanctuary'){
  if(!user.sanctuary || user.sanctuary.length === 0) return m.reply(`╭──「 ⚰️ SANCTUARY 」──╮\n\n🌸 *SANCTUARY KOSONG*\nBelum ada pet yg gugur di medan perang\nSelalu jaga energy mereka ya\n━━━━━━━━━━━`)
  let cap = '╭──「 ⚰️ SANCTUARY 」──╮\n\n'
  user.sanctuary.forEach((p,i) => cap += `${i+1}. ${pets[p.tipe].emoji} ${formatNamaAsli(p.tipe)}\n`)
  cap += `\n.pet revive <no> - Gratis jika punya malaikat`
  return m.reply(cap)
}

// === REVIVE ===
if (action === 'revive'){
  let idx = parseInt(args[1])-1
  let p = user.sanctuary[idx]
  if(!p) return m.reply(`╭──「 ⚰️ SANCTUARY 」──╮\n\n👻 *GAK ADA ARWAH DI SINI*\nNomor yg kamu pilih kosong\n━━━━━━━━━━━`)
  if(user.pets.some(x => x.tipe === 'malaikat')){
    user.pets.push(p); user.sanctuary.splice(idx,1)
    saveDB(wdb)
    return m.reply(`✨ ${pets[p.tipe].emoji} ${formatNamaAsli(p.tipe)} dihidupkan oleh Malaikat!`)
  }
  return m.reply('❌ Butuh pet Malaikat untuk revive gratis')
}

// === LEADERBOARD ===
if (action === 'lb'){
  let all = Object.entries(wdb.users).filter(([_,u]) => u.rpg?.pets?.length)
  if(all.length === 0) return m.reply('╭──「 🏆 TOP 10 PET TRAINER 」──╮\n\n📝 Belum ada yg punya pet\n━━━━━━━━━━━')

  all.sort((a,b) => {
    let pa = a[1].rpg.pets.reduce((x,y) => x + y.level, 0)
    let pb = b[1].rpg.pets.reduce((x,y) => x + y.level, 0)
    return pb - pa
  })

  let cap = '╭──「 🏆 TOP 10 PET TRAINER 」──╮\n\n'
  let mention = []
  all.slice(0,10).forEach(([jid,u],i) => {
    let totalLv = u.rpg.pets.reduce((x,y) => x + y.level, 0)
    let totalPet = u.rpg.pets.length
    cap += `│ ${i+1}. @${jid.split('@')[0]}\n│ 𖥔 Lv Total : ${totalLv}\n│ 𖥔 Total Pet : ${totalPet}\n`
    if(i < 9) cap += `│\n`
    mention.push(jid)
  })
  cap += `╰───────────────────\n━━━━━━━━━━━`
  return conn.reply(m.chat, cap, m, { mentions: mention })
}

// === CLAIM PASIF HARIAN ===
  if (action === 'claim') {
    if (user.pets.length === 0) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n💸 *DOMPET KOSONG*\nKamu belum punya pet yg bisa hasilin uang\nBeli dulu di.pet shop\n━━━━━━━━━━━`)
    
    let uang = 0
    let daftar = []
    user.pets.forEach(p => {
      if(p.tipe === 'kucing_dewa'){ uang += 1000; daftar.push(`${pets[p.tipe].emoji} ${formatNama(p)}`) }
      if(p.tipe === 'trotter_numby'){ uang += 2000; daftar.push(`${pets[p.tipe].emoji} ${formatNama(p)}`) }
      if(p.tipe === 'alien'){ uang += 1000 * p.level; daftar.push(`${pets[p.tipe].emoji} ${formatNama(p)}`) }
      if(p.tipe === 'poop'){ uang += 2000; daftar.push(`${pets[p.tipe].emoji} ${formatNama(p)}`) }
    })
    
    if(uang === 0) return m.reply(`╭──「 🐾 ZETA PET CENTER 」──╮\n\n❌ *TIDAK ADA PASSIVE*\nPet kamu tidak ada yg punya skill menghasilkan uang\n━━━━━━━━━━━`)
    
    wdb.money[m.sender] += uang
    saveDB(wdb)
    
    let cap = `╭──「 🐾 ZETA PET CENTER 」──╮\n\n💰 KLAIM PASSIVE\n📦 PET YANG MENGHASILKAN\n`
    cap += daftar.map(x => `├ ${x}`).join('\n')
    cap += `\n│\n├ 💵 Total : +Rp ${uang.toLocaleString()}\n`
    cap += `└───────────────────\n━━━━━━━━━━━`
    return m.reply(cap)
  }

  return m.reply(`❌ Command tidak dikenal. Ketik *.pet* buat lihat menu`)
}

handler.help = ['pet', 'pet shop', 'pet adopt', 'pet gacha', 'pet feed', 'pet walk', 'pet play', 'pet train', 'pet rest', 'pet clean', 'pet heal', 'pet gift', 'pet rename', 'pet battle', 'pet hunt', 'pet dispatch', 'pet status', 'pet sell', 'pet release', 'pet breed', 'pet playwith', 'pet transfer', 'pet kill', 'pet claim', 'pet sanctuary', 'pet revive', 'pet lb']
handler.tags = ['rpg']
handler.command = ['pet']
handler.group = true
export default handler