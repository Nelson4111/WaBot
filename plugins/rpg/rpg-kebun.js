import { loadDB, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(nama) {
  return nama.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

let handler = async (m, { conn, usedPrefix }) => {
  const wdb = loadDB()
  let user = wdb.users[m.sender]?.rpg
  if(!user) return m.reply('❌ Kamu belum punya data RPG')
  if(!user.inventory) user.inventory = {}

  // AMBIL LIST DARI PANEN.JS BIAR SINKRON
  const bibit = {
    'kacang': { emoji: '🥜' },
    'bawang_putih': { emoji: '🧄' },
    'padi': { emoji: '🌾' },
    'bawang_merah': { emoji: '🧅' },
    'wortel': { emoji: '🥕' },
    'timun': { emoji: '🥒' },
    'selada': { emoji: '🥬' },
    'kentang': { emoji: '🥔' },
    'tomat': { emoji: '🍅' },
    'ubi': { emoji: '🍠' },
    'jagung': { emoji: '🌽' },
    'brokoli': { emoji: '🥦' },
    'terong': { emoji: '🍆' },
    'semangka': { emoji: '🍉' },
    'lemon': { emoji: '🍋' },
    'cabai': { emoji: '🌶' },
    'paprika': { emoji: '🫑' },
    'stroberi': { emoji: '🍓' },
    'jeruk': { emoji: '🍊' },
    'bluberi': { emoji: '🫐' },
    'ceri': { emoji: '🍒' },
    'kastanye': { emoji: '🌰' },
    'zaitun': { emoji: '🫒' },
    'pisang': { emoji: '🍌' },
    'nanas': { emoji: '🍍' },
    'kiwi': { emoji: '🥝' },
    'pir': { emoji: '🍐' },
    'persik': { emoji: '🍑' },
    'melon': { emoji: '🍈' },
    'anggur': { emoji: '🍇' },
    'mangga': { emoji: '🥭' },
    'apel_hijau': { emoji: '🍏' },
    'alpukat': { emoji: '🥑' },
    'apel_merah': { emoji: '🍎' },
    'kelapa': { emoji: '🥥' },
    'exp': { emoji: '✨' },
    'durian': { emoji: '🌳' },
    'uang': { emoji: '💵' },
    'koin': { emoji: '🪙' },
    'emas': { emoji: '⚜️' },
    'berlian': { emoji: '💠' } // TAMBAH BERLIAN HASIL PANEN
  }

  let hasilKebun = {}
  let total = 0
  for(let item in user.inventory){
    if(bibit[item] && user.inventory[item] > 0){
      hasilKebun[item] = user.inventory[item]
      total += user.inventory[item]
    }
  }

  if(total === 0) return m.reply(`*🌾 GUDANG KEBUN KOSONG*\n\nTanam dulu pake *${usedPrefix}tanam [bibit]*\nPanen pake *${usedPrefix}panen*`)

  let cap = `┌───❏「 🌾 GUDANG KEBUN 」❏\n`
  cap += `│ Total Item : ${total.toLocaleString()}\n`
  cap += `└───────────────────\n\n`

  Object.entries(hasilKebun)
 .sort((a,b) => b[1] - a[1]) // urut dari yg paling banyak
 .forEach(([nama, jumlah]) => {
      cap += `│ ${bibit[nama].emoji} ${formatNama(nama).padEnd(15)} x${jumlah.toLocaleString()}\n`
    })

  cap += `\n💰 *JUAL:* ${usedPrefix}tokopanen jual all`
  cap += `\n🌱 *TANAM:* ${usedPrefix}tanam [bibit]`
  cap += `\n🏡 *STATUS:* ${usedPrefix}panen`

  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
}

handler.help = ['kebun', 'hasilpanen']
handler.tags = ['rpg']
handler.command = /^(kebun|hasilpanen)$/i
handler.group = true
export default handler