let handler = async (m, { conn, command }) => {
  if (command === 'debugduit') return debugduit(m, { conn })
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

  // Ambil dari global.db.data.users (Database Utama Tunggal)
  if (global.db && global.db.data && global.db.data.users) {
    for (let [jid, u] of Object.entries(global.db.data.users)) {
      if (jid.endsWith('@lid')) continue // Abaikan akun LID (akun bayangan/hantu)
      
      const cashMoney = (u.money || 0) + (u.balance || 0)
      const bankMoney = u.rpg?.bank || 0
      if (cashMoney > 0 || bankMoney > 0) {
        addMoney(jid, u.name, cashMoney, bankMoney)
      }
    }
  }

  let sortedUsers = Object.values(userMap)
    .map(u => ({ ...u, total: u.cash + u.bank }))
    .filter(u => u.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  if (sortedUsers.length === 0) return m.reply('❌ Belum ada data pengguna yang memiliki saldo uang/bank.')

  let teks = `📊 *PAPAN PERINGKAT PENGGUNA TERKAYA (TOP MONEY)*\n`
  teks += `_Perhitungan Kekayaan = Cash (Dompet) + Saldo Bank_\n\n`
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

let debugduit = async (m, { conn }) => {
  let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;
  let clean = target.split('@')[0].split(':')[0];
  
  let result = `*DEBUG DUIT: ${clean}*\n\n`;
  let matches = [];
  
  if (global.db && global.db.data && global.db.data.users) {
    for (let [jid, u] of Object.entries(global.db.data.users)) {
      if (jid.includes(clean)) {
        matches.push({
          jid: jid,
          name: u.name,
          money: u.money,
          bank: u.bank,
          balance: u.balance,
          rpg_bank: u.rpg?.bank
        });
      }
    }
  }
  
  result += JSON.stringify(matches, null, 2);
  conn.sendMessage(m.chat, { text: result }, { quoted: m });
}

handler.help = ['topmoney', 'topuang']
handler.tags = ['info', 'rpg']
handler.command = /^(topmoney|topuang|debugduit)$/i
handler.limit = false

export default handler
