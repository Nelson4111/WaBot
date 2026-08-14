import { loadDB, saveDB } from '../../lib/waifuHelper.js'

const rupiah = n => 'Rp ' + (n || 0).toLocaleString('id-ID')

let handler = async (m, { args }) => {
  const code = args[0]
  if (!code) return m.reply('Silakan masukkan kode redeem yang ingin diklaim.\nContoh: `.redeem allen`')

  const wdb = loadDB()
  const now = Date.now()

  if (!wdb.redeem || !wdb.redeem[code])
    return m.reply('❌  *Gagal:* Kode redeem tidak ditemukan atau salah ketik.')

  const r = wdb.redeem[code]

  if (r.expired && now > r.expired)
    return m.reply('❌  *Gagal:* Kode redeem ini sudah melewati batas waktu (expired).')

  if (r.used >= r.quota)
    return m.reply('❌  *Gagal:* Kuota klaim untuk kode ini sudah habis.')

  if (r.usedBy.includes(m.sender))
    return m.reply('❌  *Gagal:* Kamu sudah pernah mengambil hadiah dari kode ini.')

  if (!wdb.money) wdb.money = {}
  wdb.money[m.sender] = (wdb.money[m.sender] || 0) + r.uang

  const udb = global.db.data.users[m.sender]
  if (udb) {
    udb.exp = (udb.exp || 0) + r.xp
    udb.limit = (udb.limit || 0) + r.limit
  }

  r.used++
  r.usedBy.push(m.sender)
  saveDB(wdb)

  let teks = `*R E D E E M  -  S U C C E S S*\n\n`
  teks += `Selamat! Kamu berhasil menukarkan kode: \`${code}\`\n\n`
  teks += `┌───〔 *REWARDS* 〕───\n`
  teks += `│ ◦ *Uang:* ${rupiah(r.uang)}\n`
  teks += `│ ◦ *Exp:* +${r.xp.toLocaleString()} XP\n`
  teks += `│ ◦ *Limit:* +${r.limit}\n`
  teks += `│ ◦ *Sisa:* ${r.quota - r.used} kuota\n`
  teks += `└──────────────\n\n`
  teks += `_Hadiah otomatis ditambahkan ke akun kamu._`

  m.reply(teks.trim())
}

handler.command = /^(redeem)$/i
handler.tags = ['info']
handler.help = ['redeem <kode>']
handler.register = true

export default handler