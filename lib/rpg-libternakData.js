import { loadDB, saveDB } from './waifuHelper.js'

export const hewanList = {
  // TIER 0 - DASAR
  'kelinci': { emoji: '🐇', nama: 'Kelinci', hargaBibit: 5000, hargaJual: 15000, hasil: 'Daging Kelinci', exp: 20, tipe: 'daging', evolusi: 0 },
  'ayam': { emoji: '🐓', nama: 'Ayam', hargaBibit: 8000, hargaJual: 25000, hasil: 'Telur Ayam', exp: 25, tipe: 'produk', evolusi: 0 },
  'bebek': { emoji: '🦆', nama: 'Bebek', hargaBibit: 12000, hargaJual: 30000, hasil: 'Telur Bebek', exp: 28, tipe: 'produk', evolusi: 0 },
  'burung': { emoji: '🐦', nama: 'Burung', hargaBibit: 15000, hargaJual: 40000, hasil: 'Telur Burung', exp: 30, tipe: 'produk', evolusi: 0 },
  'kambing': { emoji: '🐐', nama: 'Kambing', hargaBibit: 25000, hargaJual: 70000, hasil: 'Susu Kambing', exp: 35, tipe: 'produk', evolusi: 0 },

  // TIER 1 - TERNAK
  'domba': { emoji: '🐑', nama: 'Domba', hargaBibit: 40000, hargaJual: 100000, hasil: 'Bulu Domba', exp: 40, tipe: 'produk', evolusi: 0 },
  'babi': { emoji: '🐖', nama: 'Babi', hargaBibit: 60000, hargaJual: 150000, hasil: 'Daging Babi', exp: 45, tipe: 'daging', evolusi: 0 },
  'kuda': { emoji: '🐴', nama: 'Kuda', hargaBibit: 80000, hargaJual: 200000, hasil: 'Susu Kuda', exp: 50, tipe: 'produk', evolusi: 0 },
  'sapi': { emoji: '🐄', nama: 'Sapi', hargaBibit: 90000, hargaJual: 220000, hasil: 'Susu Sapi', exp: 55, tipe: 'produk', evolusi: 0 },
  'unta': { emoji: '🐪', nama: 'Unta', hargaBibit: 110000, hargaJual: 280000, hasil: 'Susu Unta', exp: 60, tipe: 'produk', evolusi: 0 },

  // TIER 2 - LANGKA
  'singa': { emoji: '🦁', nama: 'Singa', hargaBibit: 150000, hargaJual: 400000, hasilDaging: 'Daging Singa', hasil: 'Cakar Singa', exp: 70, tipe: 'all', evolusi: 0 },
  'harimau': { emoji: '🐅', nama: 'Harimau', hargaBibit: 160000, hargaJual: 420000, hasilDaging: 'Daging Harimau', hasil: 'Cakar Harimau', exp: 72, tipe: 'all', evolusi: 0 },
  'gajah': { emoji: '🐘', nama: 'Gajah', hargaBibit: 200000, hargaJual: 500000, hasil: 'Gading Gajah', exp: 75, tipe: 'produk', evolusi: 0 },
  'badak': { emoji: '🦏', nama: 'Badak', hargaBibit: 220000, hargaJual: 550000, hasil: 'Cula Badak', exp: 78, tipe: 'produk', evolusi: 0 },

  // TIER 3 - MITOS
  'trex': { emoji: '🦖', nama: 'T-Rex', hargaBibit: 100000, hargaJual: 300000, hasilTelur: 'Telur T-Rex', hasilDaging: 'Daging T-Rex', exp: 80, tipe: 'all', evolusi: 1 },
  'bronto': { emoji: '🦕', nama: 'Brontosaurus', hargaBibit: 200000, hargaJual: 600000, hasilTelur: 'Telur Bronto', hasilDaging: 'Daging Bronto', exp: 100, tipe: 'all', evolusi: 1 },
  'phoenix': { emoji: '🔥', nama: 'Phoenix', hargaBibit: 350000, hargaJual: 900000, hasilTelur: 'Telur Phoenix', hasilDaging: 'Bulu Phoenix', exp: 120, tipe: 'all', evolusi: 1 },
  'griffin': { emoji: '🦅', nama: 'Griffin', hargaBibit: 400000, hargaJual: 1000000, hasilTelur: 'Telur Griffin', hasilDaging: 'Bulu Griffin', exp: 130, tipe: 'all', evolusi: 1 },

  // TIER 4 - LEGENDARY
  'naga': { emoji: '🐉', nama: 'Naga', hargaBibit: 500000, hargaJual: 1500000, hasilTelur: 'Telur Naga', hasilDaging: 'Daging Naga', exp: 200, tipe: 'all', evolusi: 2 },
  'leviathan': { emoji: '🐉🌊', nama: 'Leviathan', hargaBibit: 600000, hargaJual: 1800000, hasilTelur: 'Telur Leviathan', hasilDaging: 'Daging Leviathan', exp: 220, tipe: 'all', evolusi: 2 },
  'kraken': { emoji: '🦑', nama: 'Kraken', hargaBibit: 650000, hargaJual: 2000000, hasilTelur: 'Telur Kraken', hasilDaging: 'Tentakel Kraken', exp: 230, tipe: 'all', evolusi: 2 },
  'unicorn': { emoji: '🦄', nama: 'Unicorn', hargaBibit: 700000, hargaJual: 2200000, hasilTelur: 'Telur Unicorn', hasil: 'Tanduk Unicorn', exp: 250, tipe: 'all', evolusi: 2 },
}

let hybridDatabaseCache = null
function getHybridDB() {
  if(hybridDatabaseCache) return hybridDatabaseCache
  const wdb = loadDB()
  if(!wdb.hybridDatabase) wdb.hybridDatabase = {}
  hybridDatabaseCache = wdb.hybridDatabase
  return hybridDatabaseCache
}

function saveHybridDB() {
  const wdb = loadDB()
  wdb.hybridDatabase = hybridDatabaseCache
  saveDB(wdb)
}

function mixNama(n1, n2) {
  let p1 = n1.slice(0, Math.ceil(n1.length/2))
  let p2 = n2.slice(Math.floor(n2.length/2))
  return (p1 + p2).charAt(0).toUpperCase() + (p1 + p2).slice(1).toLowerCase()
}

function generateHybrid(h1, h2, evo) {
  let id = (h1.nama + '_' + h2.nama + '_' + evo).toLowerCase().replace(/\s/g,'_')
  let nama = mixNama(h1.nama, h2.nama)
  let baseJual = (h1.hargaJual + h2.hargaJual)
  let baseExp = (h1.exp + h2.exp)
  return {
    id,
    emoji: h1.emoji + h2.emoji,
    nama,
    hargaBibit: 0,
    hargaJual: Math.floor(baseJual * 1.5 * (evo + 1)),
    hasilTelur: `Telur ${nama}`,
    hasilDaging: `Daging ${nama}`,
    hasil: `Hasil ${nama}`,
    exp: Math.floor(baseExp * (evo + 1) * 1.2),
    tipe: 'all',
    evolusi: evo
  }
}

export function prosesKawin(id1, id2) {
  let hybridDatabase = getHybridDB()
  let h1 = getHewan(id1)
  let h2 = getHewan(id2)
  if(!h1 ||!h2) return null
  if(h1.nama.toLowerCase() === h2.nama.toLowerCase()) return { hasil: h1.nama.toLowerCase(), baru: false, data: h1 }

  let evoBaru = Math.min(Math.max(h1.evolusi, h2.evolusi) + 1, 7)
  let idHybrid = [h1.nama.toLowerCase(), h2.nama.toLowerCase(), evoBaru].sort().join('_')

  let baru = false
  if(!hybridDatabase[idHybrid]) {
    hybridDatabase[idHybrid] = generateHybrid(h1, h2, evoBaru)
    baru = true
    saveHybridDB()
  }
  return { hasil: idHybrid, baru, data: hybridDatabase[idHybrid] }
}

export function dapatkanHasil(h) {
  if(h.tipe === 'all') return { ambil: h.hasilTelur || h.hasil, sembelih: h.hasilDaging || h.hasil }
  return { ambil: h.hasil, sembelih: h.hasil }
}

export function hitungBiayaKawin(h1, h2) {
  let e = Math.max(h1.evolusi, h2.evolusi)
  if(e === 0) return 10000
  if(e === 1) return 100000
  if(e === 2) return 500000
  return 2000000
}

export function hitungBiayaObat(h1, h2) {
  return hitungBiayaKawin(h1, h2) * 8
}

export function peluangGagal(h1, h2) {
  if(h1.evolusi === h2.evolusi) return 0.1
  if(h1.evolusi >= 3 || h2.evolusi >= 3) return 0.6
  return 0.4
}

export function listHybrid() {
  let hybridDatabase = getHybridDB()
  if(Object.keys(hybridDatabase).length === 0)
    return '┌───❏「 🧬 KOSONG 」❏\n│\n│ Belum ada hybrid yang ditemukan\n└───────────────────'
  let txt = '┌───❏「 🧬 DAFTAR HYBRID TERBUKA 」❏\n│\n'
  for(let k in hybridDatabase) {
    let h = hybridDatabase[k]
    txt += `│ ${h.emoji} ${h.nama} [E${h.evolusi}]\n`
  }
  return txt + '│\n│ Total: ' + Object.keys(hybridDatabase).length + '\n└───────────────────'
}

export function getHewan(id) {
  if (!id) return null
  let hybridDatabase = getHybridDB()
  id = id.toLowerCase().trim()
  if (hewanList[id]) return hewanList[id]
  if (hybridDatabase[id]) return hybridDatabase[id]
  for (let key in hybridDatabase) {
    let h = hybridDatabase[key]
    if (h && (h.nama.toLowerCase() === id || h.id?.toLowerCase() === id)) {
      return h
    }
  }
  return null
}