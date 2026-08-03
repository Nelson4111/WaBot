import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
  let userMap = {}

  function getCanonicalId(jid = '') {
    return jid.split('@')[0].split(':')[0]
  }

  function addMoney(jid, name, cash, bank) {
    if (!jid) return
    let cleanId = getCanonicalId(jid)
    userMap[cleanId] = userMap[cleanId] || { jid, name: name || cleanId, cash: 0, bank: 0 }
    if (name && (userMap[cleanId].name === cleanId || !userMap[cleanId].name)) {
      userMap[cleanId].name = name
    }
    userMap[cleanId].cash += (cash || 0)
    userMap[cleanId].bank += (bank || 0)
  }

  // 1. Ambil dari global.db.data.users (database utama)
  if (global.db && global.db.data && global.db.data.users) {
    for (let [jid, u] of Object.entries(global.db.data.users)) {
      addMoney(jid, u.name, (u.money || 0) + (u.balance || 0), u.bank || 0)
    }
  }

  // 2. Ambil dari waifu_db.json (database RPG / waifuHelper)
  try {
    let wdbFile = path.join(process.cwd(), 'waifu_db.json')
    if (fs.existsSync(wdbFile)) {
      let wdb = JSON.parse(fs.readFileSync(wdbFile))
      if (wdb.money) {
        for (let [jid, val] of Object.entries(wdb.money)) {
          addMoney(jid, null, val || 0, 0)
        }
      }
      if (wdb.users) {
        for (let [jid, u] of Object.entries(wdb.users)) {
          addMoney(jid, u.name, 0, u.rpg?.bank || 0)
        }
      }
    }
  } catch (e) {}

  // 3. Ambil dari file 6281242432747_database.json (jika ada)
  try {
    let altDbFile = path.join(process.cwd(), '6281242432747_database.json')
    if (fs.existsSync(altDbFile)) {
      let altDb = JSON.parse(fs.readFileSync(altDbFile))
      if (altDb.users) {
        for (let [jid, u] of Object.entries(altDb.users)) {
          addMoney(jid, u.name, (u.money || 0) + (u.balance || 0), u.bank || 0)
        }
      }
    }
  } catch (e) {}

  let sortedUsers = Object.values(userMap)
    .map(u => ({ ...u, total: u.cash + u.bank }))
    .filter(u => u.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  if (sortedUsers.length === 0) return m.reply('❌ Belum ada data pengguna yang memiliki saldo uang/bank.')

  let teks = `📊 *PAPAN PERINGKAT PENGGUNA TERKAYA (TOP MONEY)*\n`
  teks += `_Perhitungan Kekayaan = Cash (Dompet) + Saldo Bank (RPG & Main DB)_\n\n`
  let mentions = []

  sortedUsers.forEach((user, i) => {
    let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
    let num = user.jid.split('@')[0]
    mentions.push(user.jid)
    teks += `${medal} @${num}\n`
    teks += `   💰 *Total:* Rp ${user.total.toLocaleString('id-ID')}\n`
    teks += `   💵 Cash: Rp ${user.cash.toLocaleString('id-ID')} | 🏦 Bank: Rp ${user.bank.toLocaleString('id-ID')}\n\n`
  })

  conn.sendMessage(m.chat, { text: teks.trim(), mentions }, { quoted: m })
}

handler.help = ['topmoney', 'topuang']
handler.tags = ['info', 'rpg']
handler.command = /^(topmoney|topuang)$/i
handler.limit = false

export default handler
