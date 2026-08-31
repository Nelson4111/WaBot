/**
 * CSM Setup Commands: start, nickname, gender
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import { CSM_PICTURES } from '../../../lib/rpg-libmyCSM.js'
import { header, sendCsmReply } from '../lib/utils.js'
import { ensureDailyQuests } from '../lib/quest.js'

export async function handleStart(ctx) {
  const { m, conn, csm, wdb, userRPG, senderJid, today } = ctx
  csm.started = true
  if (!csm.gender) csm.gender = 'None'
  saveDB(wdb)

  ensureDailyQuests(csm, wdb, today)

  let cap = header('SELAMAT DATANG DEVIL HUNTER')
  cap += `👤 @${senderJid.split('@')[0]}\n`
  cap += `🏷️ ${csm.title}\n`
  cap += `📛 ${csm.nickname || 'Belum Ada Nickname'} | ${csm.gender}\n`
  cap += `📍 ${csm.location}\n`
  cap += `💰 Rp ${userRPG.bank.toLocaleString()} Bank\n`
  cap += `💼 ${csm.job || 'Belum Kerja'}\n`
  cap += `🩸 ${csm.blood.toLocaleString()} Darah\n`
  cap += `━━━━━━━━━━━\n`
  cap += `💡 *INFO MATA UANG*\n`
  cap += `Di dunia Devil Hunter, mata uang utama adalah *Darah*\n`
  cap += `Kamu bisa tukar dari Bank ke Darah dengan:\n`
  cap += `*.csm blood*\n\n`
  cap += `📋 Ketik *.csm* untuk buka Menu Utama\n`
  cap += `📖 Ketik *.csm tutorial* untuk panduan\n━━━━━━━━━━━`
  return sendCsmReply(conn, m, wdb, cap, CSM_PICTURES.about)
}

export async function handleNickname(ctx) {
  const { m, csm, wdb, args } = ctx
  if (!csm) return m.reply(header('ERROR') + `Data tidak ditemukan\n━━━━━━━━━━━`)
  const nama = args.slice(1).join(' ').trim()
  if (!nama) return m.reply(header('PENGGUNAAN') + `.csm nickname <nama>\n\nContoh:.csm nickname Aze Hunter\n━━━━━━━━━━━`)
  if (nama.length > 20) return m.reply(header('KEPANJANGAN') + `Max 20 karakter\n━━━━━━━━━━━`)
  csm.nickname = nama
  const msgs = [
    `🏷️ Mulai sekarang kami akan memanggilmu *${nama}*.`,
    `📝 Nama Hunter tercatat: *${nama}*.`,
    `⛓️ Baik, *${nama}*. Aku akan mengingatnya.`,
    `🚪 Selamat datang, *${nama}*. Jangan mati di minggu pertama.`,
    `🔪 *${nama}*... nama yang cocok untuk seorang Hunter.`,
    `👁️ HQ sudah mencatat keberadaanmu, *${nama}*.`,
    `🩸 Nama *${nama}* sekarang terikat pada catatan Blood-mu.`,
    `📎 *${nama}*, semoga namamu tidak masuk daftar korban.`,
    `⚠️ *${nama}*... mulai sekarang semua keputusan punya harga.`,
    `🗂️ Identitas Hunter disimpan. Bertahanlah, *${nama}*.`
  ]
  const msg = msgs[Math.floor(Math.random() * msgs.length)]
  saveDB(wdb)
  return m.reply(header('NICKNAME DISET') + `Nama Hunter : *${nama}*\nNickname : *${nama.split(' ')[0]}*\n\n${msg}\n━━━━━━━━━━━`)
}

export async function handleGender(ctx) {
  const { m, csm, wdb, args } = ctx
  if (!csm) return m.reply(header('ERROR') + `Data tidak ditemukan\n━━━━━━━━━━━`)
  let genderInput = (args[1] || '').toLowerCase()
  if (!['pria', 'wanita', 'cowok', 'cewek', 'laki-laki', 'perempuan', 'male', 'female', 'none'].includes(genderInput)) {
    return m.reply(
      header('PILIH GENDER HUNTER') +
      `Pilih gender:\n\n` +
      `> 👨 *.csm gender pria*\n` +
      `> 👩 *.csm gender wanita*\n` +
      `> ⚪ *.csm gender none*\n\n` +
      `|━━━━━━━━━━━\n` +
      `Saat ini: *${csm.gender}*\n` +
      `|━━━━━━━━━━━`
    )
  }
  if (['pria', 'cowok', 'laki-laki', 'male'].includes(genderInput)) csm.gender = 'Laki-Laki ♂️'
  else if (['wanita', 'cewek', 'perempuan', 'female'].includes(genderInput)) csm.gender = 'Perempuan ♀️'
  else csm.gender = 'None'
  saveDB(wdb)
  return m.reply(header('GENDER DISET') + `Gender kamu sekarang: *${csm.gender}*\n\nLanjut set nickname dengan:\n.csm nickname <nama>\n━━━━━━━━━━━`)
}
