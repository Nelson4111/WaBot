import { loadDB, saveDB } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, args, command, isOwner }) => {
  if (!isOwner) return m.reply('❌ *Perintah ini khusus untuk Owner.*')

  const db = loadDB()
  if (!db.redeem) db.redeem = {}

  if (command === 'setredeem') {
    let [code, uang, xp, limit, quota, duration] = args
    if (!code || !quota) {
      return m.reply(`Format Salah!\n\n.setredeem <kode> <uang> <xp> <limit> <kuota> <durasi>\nContoh: .setredeem GIFT1 5000 100 5 50 24h`)
    }

    if (db.redeem[code]) return m.reply(`❌ Kode ${code} sudah ada!`)

    let expiredTime = null
    if (duration) {
      const parseMs = (str) => {
        let match = str.match(/^(\d+)(d|h|m|s)$/i)
        if (!match) return null
        let val = parseInt(match[1])
        let type = match[2].toLowerCase()
        const msMap = { d: 86400000, h: 3600000, m: 60000, s: 1000 }
        return val * msMap[type]
      }
      let ms = parseMs(duration)
      if (ms) expiredTime = Date.now() + ms
    }

    db.redeem[code] = {
      uang: parseInt(uang) || 0,
      xp: parseInt(xp) || 0,
      limit: parseInt(limit) || 0,
      quota: parseInt(quota) || 1,
      used: 0,
      usedBy: [],
      expired: expiredTime
    }

    saveDB(db)

    const formatWIB = (ms) => {
      return new Date(ms).toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        dateStyle: 'medium',
        timeStyle: 'short'
      }).replace(/\./g, ':') + ' WIB'
    }

    let teks = `*R E D E E M  -  C R E A T E D*\n\n`
    teks += `┌───〔 *DETAILS* 〕───\n`
    teks += `│ ◦ *Kode:* \`${code}\`\n`
    teks += `│ ◦ *Uang:* Rp ${Number(uang || 0).toLocaleString('id-ID')}\n`
    teks += `│ ◦ *XP:* ${(Number(xp) || 0).toLocaleString()} XP\n`
    teks += `│ ◦ *Limit:* +${limit || 0}\n`
    teks += `│ ◦ *Kuota:* ${quota} User\n`
    teks += `│ ◦ *Waktu:* ${expiredTime ? formatWIB(expiredTime) : 'PERMANEN'}\n`
    teks += `└──────────────`
    
    return m.reply(teks)
  }

  if (command === 'delredeem') {
    let code = args[0]
    if (!code) return m.reply('Masukkan kode yang ingin dihapus!')

    if (!db.redeem[code]) return m.reply(`❌ Kode \`${code}\` tidak ditemukan.`)

    delete db.redeem[code]
    saveDB(db)

    return m.reply(`✅ Berhasil menghapus kode redeem: \`${code}\``)
  }
}

handler.help = ['setredeem', 'delredeem']
handler.tags = ['owner']
handler.command = /^(setredeem|delredeem)$/i
handler.owner = true

export default handler