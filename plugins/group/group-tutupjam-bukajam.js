import { toSmallNum } from '../../lib/style.js'

let handler = async (m, { text, command, conn, usedPrefix }) => {
  try {
    let [jm, mnt] = (text || '').split(':')

    if (!jm || !mnt) {
      return m.reply(`*╭  〔 ◈ ꜰ ᴏ ʀ ᴍ ᴀ ᴛ  ᴡ ᴀ ᴋ ᴛ ᴜ 〕*\n> Format waktu yang kamu masukkan belum tepat!\n> Contoh: *${usedPrefix + command} 18:00*\n*╰───────────────*`)
    }

    jm = parseInt(jm)
    mnt = parseInt(mnt)

    if (isNaN(jm) || jm < 0 || jm > 23) {
      return m.reply(`*╭  〔 ◈ ᴊ ᴀ ᴍ  ᴛ ɪ ᴅ ᴀ ᴋ  ᴠ ᴀ ʟ ɪ ᴅ 〕*\n> Rentang jam harus antara 𝟶𝟶 hingga 𝟸𝟹.\n> Contoh: *${usedPrefix + command} 18:00*\n*╰───────────────*`)
    }

    if (isNaN(mnt) || mnt < 0 || mnt > 59) {
      return m.reply(`*╭  〔 ◈ ᴍ ᴇ ɴ ɪ ᴛ  ᴛ ɪ ᴅ ᴀ ᴋ  ᴠ ᴀ ʟ ɪ ᴅ 〕*\n> Rentang menit harus antara 𝟶𝟶 hingga 𝟻𝟿.\n> Contoh: *${usedPrefix + command} 18:00*\n*╰───────────────*`)
    }

    // Dapatkan waktu sekarang dan target berdasarkan zona Asia/Jakarta
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }))
    const target = new Date(now)
    target.setHours(jm)
    target.setMinutes(mnt)
    target.setSeconds(0)

    // Jika waktu target sudah lewat hari ini, jadwalkan untuk besok
    if (target < now) target.setDate(now.getDate() + 1)

    const delay = target - now
    const actionStr = command === 'tutupjam' ? 'Ditutup' : 'Dibuka'
    const jamStr = jm.toString().padStart(2, '0')
    const mntStr = mnt.toString().padStart(2, '0')

    const scheduleMsg = `*──  ୨୧ ✧ JADWAL GERBANG GRUP ✧ ୨୧  ──*

*╭  〔 ⧗ ᴘ ᴇ ɴ ᴊ ᴀ ᴅ ᴡ ᴀ ʟ ᴀ ɴ 〕*
*┆* ⟡ ᴛɪɴᴅᴀᴋᴀɴ : *Gerbang ${actionStr}*
*┆* ✧ ᴡᴀᴋᴛᴜ    : *${toSmallNum(jamStr)}:${toSmallNum(mntStr)} WIB*
*┆* ✦ ꜱᴛᴀᴛᴜꜱ   : *Menunggu Waktu Tiba*
*╰───────────────*

> ｡˚ ⊹ _Sistem akan otomatis menyesuaikan izin pengiriman pesan._ ⊹ ˚ ｡`.trim()

    m.reply(scheduleMsg)

    setTimeout(async () => {
      try {
        if (command === 'tutupjam') {
          await conn.groupSettingUpdate(m.chat, 'announcement')
          const closeMsg = `*──  ୨୧ ✧ GERBANG GRUP DITUTUP ✧ ୨୧  ──*

> Gerbang percakapan grup resmi ditutup sesuai jadwal ✦
> Saat ini hanya Administrator yang dapat mengirimkan pesan.`
          await conn.sendMessage(m.chat, { text: closeMsg })
        } else if (command === 'bukajam') {
          await conn.groupSettingUpdate(m.chat, 'not_announcement')
          const openMsg = `*──  ୨୧ ✧ GERBANG GRUP DIBUKA ✧ ୨୧  ──*

> Gerbang percakapan grup resmi dibuka kembali sesuai jadwal ✦
> Seluruh anggota dipersilakan untuk saling berdiskusi secara tertib.`
          await conn.sendMessage(m.chat, { text: openMsg })
        }
      } catch (err) {
        console.error('Error update grup:', err)
      }
    }, delay)

  } catch (err) {
    console.error('Handler error:', err)
    m.reply(`*╭  〔 ◈ ᴇ ʀ ʀ ᴏ ʀ 〕*\n> Terjadi kendala saat menjadwalkan grup: ${err.message}\n*╰───────────────*`)
  }
}

handler.help = ['tutupjam <jam:menit>', 'bukajam <jam:menit>']
handler.tags = ['group']
handler.command = /^(tutupjam|bukajam)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler