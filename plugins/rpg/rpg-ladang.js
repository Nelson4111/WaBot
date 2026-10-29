import { sendRpgRegistrationPrompt } from '../../lib/rpgActionButtons.js'
import { formatCropWiltedAppreciation, getCropReadyDuration, removeWiltedCrops } from '../../lib/rpgFarming.js'
import { loadDB, saveDB, getUserRPG, initLadang, sendRpgMsg } from '../../lib/waifuHelper.js'
import { bibit } from './rpg-panen.js'

function formatNama(nama) {
  return nama.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

let handler = async (m, { conn, usedPrefix }) => {
  const wdb = loadDB()
  const data = getUserRPG(wdb, m.sender)
  const user = data?.rpg
  if (!user) return sendRpgRegistrationPrompt(conn, m, usedPrefix, '❌ Kamu belum memiliki data RPG.')

  initLadang(user)

  const sekarang = Date.now()
  let terisi = 0
  let siap = 0
  const { crops: tanamanMati, appreciation } = removeWiltedCrops(user, wdb, m.sender, bibit, sekarang)
  const mati = tanamanMati.length
  let listLadang = []

  for (let slot = 1; slot <= user.maxLadang; slot++) {
    const tanaman = user.ladang[slot]
    if (!tanaman) {
      listLadang.push({ slot, kosong: true })
      continue
    }

    const info = bibit[tanaman.jenis]
    if (!info) {
      listLadang.push({ slot, error: true, nama: tanaman.jenis })
      continue
    }

    terisi++
    const sisa = getCropReadyDuration(tanaman, info) - (sekarang - tanaman.waktuTanam)

    if (sisa <= 0) {
      siap++
      listLadang.push({
        slot,
        nama: tanaman.jenis,
        emoji: info.emoji,
        status: '✅ Siap Panen'
      })
    } else {
      const menit = Math.floor(sisa / 60000)
      const detik = Math.floor((sisa % 60000) / 1000)
      listLadang.push({
        slot,
        nama: tanaman.jenis,
        emoji: info.emoji,
        status: `🌱 ${menit}m ${detik}s lagi`
      })
    }
  }

  if (mati > 0) await saveDB(wdb)
  const apresiasi = formatCropWiltedAppreciation(tanamanMati, appreciation, formatNama)

  if (terisi === 0) {
    if (mati === 0) {
      return m.reply(`╭─❏「 🏡 LADANG KOSONG 」❏\n│ _Belum ada tanaman yang ditanam._\n│ 🌱 Tanam: *${usedPrefix}tanam [bibit]*\n╰─━━━━━━━━━━━━━━─`)
    }

    const cap = `╭─❏「 🏡 STATUS LADANG 」❏\n` +
      `│ 🥀 Semua tanaman sudah layu\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `🌱 *LADANG KOSONG*\n` +
      `> ↳ Tanam kembali dengan *${usedPrefix}tanam [bibit]*.\n\n` +
      `${apresiasi}`
    return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i181/UTTbZ.jpg')
  }

  let cap = `╭─❏「 🏡 STATUS LADANG 」❏\n`
  cap += `│ 👤 Owner : ${m.pushName || conn.getName(m.sender) || 'Pemilik'}\n`
  cap += `│ 📦 Terisi : ${terisi}/${user.maxLadang} Slot\n`
  cap += `│ ✅ Siap : ${siap} Slot\n`
  if (mati > 0) cap += `│ 🥀 Layu : ${mati} tanaman\n`
  cap += `╰─━━━━━━━━━━━━━━─\n\n`
  cap += `🌱 *PROGRESS TANAMAN*\n`
  cap += `> ↳ Panen dalam 5 jam setelah tanaman siap agar tidak layu.\n`

  for (const item of listLadang) {
    if (item.kosong) {
      cap += `> *${item.slot}. Kosong* — belum ditanam\n`
      continue
    }

    if (item.error) {
      cap += `> *${item.slot}. ${formatNama(item.nama)}* — data bibit tidak ditemukan\n`
      continue
    }

    cap += `> *${item.slot}. ${formatNama(item.nama)} ${item.emoji}* — ${item.status}\n`
  }

  cap += `\n─━━━━━━━━━━━━━━─\n`
  cap += `📌 *AKTIVITAS*\n`
  cap += `> 🌾 Panen: *${usedPrefix}panen all*\n`
  cap += `> 🌾 Panen: *${usedPrefix}panen [nomor]*\n`
  cap += `> 🌱 Tanam: *${usedPrefix}tanam [bibit]*`

  if (apresiasi) cap += `\n\n${apresiasi}`
  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i181/UTTbZ.jpg')
}

handler.help = ['ladang']
handler.tags = ['rpg']
handler.command = /^(ladang)$/i
handler.alias = ['ladang']
handler.group = true
export default handler
