import { loadDB, saveDB, getUserRPG, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(nama) {
  return nama.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG. Ketik *.adventure* dulu.')
  if (!user.ores) user.ores = {}
  if (!user.inventory) user.inventory = {}

  const forgeRecipes = {
    // 1. Peleburan Dasar ke Material Storage
    'iron_bar': {
      nama: 'Iron Ingot',
      emoji: '⛓️',
      req: { copper: 3, tin: 2, stone: 5 },
      money: 5000,
      reward: { iron: 5 },
      desc: 'Melebur Copper & Tin menjadi 5 Iron Batangan.'
    },
    'gold_bar': {
      nama: 'Gold Ingot',
      emoji: '✨',
      req: { silver: 4, sand_stone: 5, gold: 1 },
      money: 25000,
      reward: { gold: 3 },
      desc: 'Memurnikan Silver & Sandstone menjadi 3 Emas Murni.'
    },
    'diamond_crystal': {
      nama: 'Refined Diamond',
      emoji: '💎',
      req: { blue_crystal: 2, obsidian: 3, stone: 20 },
      money: 100000,
      reward: { diamond: 2 },
      desc: 'Mengompres Blue Crystal & Obsidian menjadi 2 Diamond Murni.'
    },
    'titanium_alloy': {
      nama: 'Titanium Alloy',
      emoji: '⚙️',
      req: { titanium: 3, cobalt: 2, iron: 5 },
      money: 50000,
      reward: { iron: 15, gold: 2 },
      desc: 'Paduan logam keras untuk memperkuat pertahanan armor.'
    },
    'celestial_core': {
      nama: 'Celestial Core',
      emoji: '🌠',
      req: { voidar: 1, aetherite: 1, massacerit: 2 },
      money: 500000,
      reward: { diamond: 5, gold: 10 },
      desc: 'Inti energi kosmik murni bernilai sangat tinggi.'
    }
  }

  let args = (text || '').toLowerCase().trim().split(' ')
  let pilihan = args[0]
  let qty = parseInt(args[1]) || 1
  if (qty < 1) qty = 1

  if (!pilihan || !forgeRecipes[pilihan]) {
    let cap = `*╭───「 ⚒️ BLACKSMITH FORGE 」───╮*\n`
    cap += `│ Tempat melebur bijih tambang (*Ore*)\n`
    cap += `│ menjadi logam & material berharga!\n`
    cap += `*╰─────────────────────────────╯*\n\n`
    cap += `📜 *DAFTAR RESEP PELEBURAN (FORGE):*\n\n`

    for (let key in forgeRecipes) {
      let r = forgeRecipes[key]
      cap += `🔥 *${r.emoji} ${r.nama.toUpperCase()}* (\`${key}\`)\n`
      cap += `├ 📦 *Bahan:* `
      let reqArr = []
      for (let mat in r.req) {
        reqArr.push(`${r.req[mat]}x ${formatNama(mat)}`)
      }
      cap += reqArr.join(', ') + `\n`
      cap += `├ 💰 *Biaya:* Rp ${r.money.toLocaleString()}\n`
      cap += `├ 🎁 *Hasil:* `
      let rewArr = []
      for (let rw in r.reward) {
        rewArr.push(`+${r.reward[rw]} ${formatNama(rw)}`)
      }
      cap += rewArr.join(', ') + `\n`
      cap += `└ 📝 _${r.desc}_\n\n`
    }

    cap += `💡 *Cara Menempa:* \n`
    cap += `• *${usedPrefix}${command} <nama_resep> [jumlah]*\n`
    cap += `• Contoh: *${usedPrefix}${command} iron_bar 5*`

    return sendRpgMsg(conn, m, cap, 'https://files.cloudkuimages.guru/images/ea0f5aef77da.jpeg')
  }

  let recipe = forgeRecipes[pilihan]
  let totalCost = recipe.money * qty

  // Cek biaya
  if ((wdb.money[m.sender] || 0) < totalCost) {
    return m.reply(`❌ Uang tidak cukup untuk menempa x${qty} ${recipe.nama}!\nButuh: Rp ${totalCost.toLocaleString()}\nPunya: Rp ${(wdb.money[m.sender] || 0).toLocaleString()}`)
  }

  // Cek bahan (baik di user.ores maupun user[material])
  for (let mat in recipe.req) {
    let needed = recipe.req[mat] * qty
    let available = (user.ores[mat] || 0) + (user[mat] || 0) + (user.inventory[mat] || 0)
    if (available < needed) {
      return m.reply(`❌ Bahan tidak cukup: *${formatNama(mat)}*!\nButuh: ${needed}\nPunya: ${available}`)
    }
  }

  // Potong bahan & biaya
  wdb.money[m.sender] -= totalCost
  for (let mat in recipe.req) {
    let needed = recipe.req[mat] * qty
    if (user.ores[mat] && user.ores[mat] >= needed) {
      user.ores[mat] -= needed
    } else if (user[mat] && user[mat] >= needed) {
      user[mat] -= needed
    } else if (user.inventory[mat] && user.inventory[mat] >= needed) {
      user.inventory[mat] -= needed
    } else {
      // Potong kombinasi
      let sisa = needed
      if (user.ores[mat]) {
        let potong = Math.min(user.ores[mat], sisa)
        user.ores[mat] -= potong
        sisa -= potong
      }
      if (sisa > 0 && user[mat]) {
        let potong = Math.min(user[mat], sisa)
        user[mat] -= potong
        sisa -= potong
      }
      if (sisa > 0 && user.inventory[mat]) {
        user.inventory[mat] -= sisa
      }
    }
  }

  // Berikan reward
  let hasilTxt = []
  for (let rw in recipe.reward) {
    let get = recipe.reward[rw] * qty
    user[rw] = (user[rw] || 0) + get
    hasilTxt.push(`+${get} ${formatNama(rw)}`)
  }

  saveDB(wdb)

  let capWin = `*╭───「 ⚒️ FORGE SUCCESS 」───╮*\n`
  capWin += `│ Berhasil menempa *${recipe.emoji} ${recipe.nama}* x${qty}!\n`
  capWin += `*╰───────────────────────────╯*\n\n`
  capWin += `🎁 *HASIL DITEMPA:*\n`
  capWin += hasilTxt.map(h => `• ${h}`).join('\n') + `\n\n`
  capWin += `💸 *Biaya Tempa:* -Rp ${totalCost.toLocaleString()}\n`
  capWin += `✨ Material telah masuk ke gudang penyimpanan.`

  return sendRpgMsg(conn, m, capWin, 'https://files.cloudkuimages.guru/images/ea0f5aef77da.jpeg')
}

handler.help = ['forge <item> [jumlah]', 'lebur <item> [jumlah]']
handler.tags = ['rpg']
handler.command = /^(forge|lebur|peleburan|smelt)$/i
export default handler
