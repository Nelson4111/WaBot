import { loadDB, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(nama) {
  return nama.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const unsafeEmojiPattern = /🪨|🪵|🪙|🪢|🪡|🛞|🪼|🪸|🌊|🌙|✨|🫐|🫒|🧄|🧅/u
function safeEmoji(value, fallback = '❓') {
  if (typeof value !== 'string') return fallback
  return unsafeEmojiPattern.test(value) ? fallback : (value || fallback)
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
    'berlian': { emoji: '💠' },
    'sawit': { emoji: '🌴' }
  }

  Object.keys(bibit).forEach((key) => {
    bibit[key].emoji = safeEmoji(bibit[key].emoji)
  })

  let hasilKebun = {}
  let total = 0
  for(let item in user.inventory){
    if(bibit[item] && user.inventory[item] > 0){
      hasilKebun[item] = user.inventory[item]
      total += user.inventory[item]
    }
  }

  if (total === 0) { 
  return m.reply( 
    `╭─❏「 🌾 GUDANG KEBUN KOSONG 」❏\n` + 
    `│ Belum ada hasil panen yang tersimpan.\n` + 
    `│ ↳ Tanam: *${usedPrefix}tanam [bibit]*\n` + 
    `│ ↳ Panen: *${usedPrefix}panen*\n` + 
    `╰─━━━━━━━━━━━━━━─` 
  ) 
} 
 
let cap = `╭─❏「 🌾 GUDANG KEBUN 」❏\n` 
cap += `│ 📦 Total Item: ${total.toLocaleString()}\n` 
cap += `╰─━━━━━━━━━━━━━━─\n\n` 
 
cap += `🌾 *HASIL PANEN*\n` 
cap += `> ↳ Daftar hasil panen yang tersimpan di kebun.\n` 
 
Object.entries(hasilKebun) 
  .sort((a, b) => b[1] - a[1]) 
  .forEach(([nama, jumlah]) => { 
    cap += `> ${formatNama(nama)} ${bibit[nama].emoji} x${jumlah.toLocaleString()}\n` 
  }) 
 
cap += `\n─━━━━━━━━━━━━━━─\n` 
cap += `📌 *AKTIVITAS*\n` 
cap += `> 💰 Jual: *${usedPrefix}koperasi jual all*\n` 
cap += `> 🌱 Tanam: *${usedPrefix}tanam [bibit]*\n` 
cap += `> 🏡 Status: *${usedPrefix}panen*` 
 
cap += `\n─━━━━━━━━━━━━━━─` 
 
return sendRpgMsg( 
  conn, 
  m, 
  cap, 
  'https://c.termai.cc/i108/l3q'
)
}

handler.help = ['kebun', 'hasilpanen']
handler.tags = ['rpg']
handler.command = /^(kebun|hasilpanen)$/i
handler.group = true

export default handler