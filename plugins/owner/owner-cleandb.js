let handler = async (m, { conn }) => {
  let count = 0
  let users = global.db.data.users
  for (let jid in users) {
    let cleanJid = null

    // 1. Tangkap akun dengan tag berlebih
    if (jid.includes('@s.whatsapp.net@') || jid.includes('@lid@')) {
      cleanJid = jid.split('@')[0] + (jid.includes('lid') ? '@lid' : '@s.whatsapp.net')
    }
    // 2. Tangkap akun LID yang berubah wujud jadi @s.whatsapp.net (ID >= 15 digit)
    else if (jid.endsWith('@s.whatsapp.net')) {
      let num = jid.split('@')[0]
      if (num.length >= 15 && !num.includes(':')) {
        cleanJid = num + '@lid'
      }
    }

    if (cleanJid) {
      if (!users[cleanJid]) users[cleanJid] = {}
      
      // Migrate money if > 0
      if (users[jid].money) users[cleanJid].money = (users[cleanJid].money || 0) + users[jid].money
      if (users[jid].bank) {
        if (!users[cleanJid].rpg) users[cleanJid].rpg = {}
        users[cleanJid].rpg.bank = (users[cleanJid].rpg.bank || 0) + users[jid].bank
      }
      if (users[jid].rpg?.bank) {
        if (!users[cleanJid].rpg) users[cleanJid].rpg = {}
        users[cleanJid].rpg.bank = (users[cleanJid].rpg.bank || 0) + users[jid].rpg.bank
      }
      if (users[jid].exp) users[cleanJid].exp = (users[cleanJid].exp || 0) + users[jid].exp
      if (users[jid].balance) users[cleanJid].balance = (users[cleanJid].balance || 0) + users[jid].balance
      
      delete users[jid]
      count++
    } else {
      // Untuk akun normal yang tidak ganda, pastikan bank di root dipindah ke rpg.bank
      if (users[jid].bank) {
        if (!users[jid].rpg) users[jid].rpg = {}
        users[jid].rpg.bank = (users[jid].rpg.bank || 0) + users[jid].bank
        delete users[jid].bank // Hapus dari root setelah digabung
      }
    }
  }
  m.reply(`✅ Berhasil membersihkan ${count} akun duplikat dari database!`)
}

handler.help = ['cleandb']
handler.tags = ['owner']
handler.command = /^(cleandb)$/i
handler.owner = true

export default handler
