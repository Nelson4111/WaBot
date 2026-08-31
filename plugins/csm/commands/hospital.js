/**
 * CSM Hospital & Revive Command Handlers
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import { header } from '../lib/utils.js'

export async function handleHospital(ctx) {
  const { m, csm } = ctx
  let cap = header('RUMAH SAKIT')

  if (!csm.hospital) csm.hospital = []
  cap += `Daftar partner yang sedang sekarat.\n\n`

  if (csm.hospital.length === 0) {
    cap += `Tidak ada partner yg sekarat.\n`
  }

  csm.hospital.forEach((p, i) => {
    cap += `*${i + 1}.* ${p.name}\n`
    cap += `> ❤️ HP: 0/100\n`
    cap += `> 📌 Status: Sekarat\n\n`
  })

  cap += `|━━━━━━━━━━━\n`
  cap += `📌 .csm revive <nomor>\n`
  cap += `📌 .csm revive all\n`
  cap += `> Biaya: 50.000 Blood per partner\n`
  cap += `|━━━━━━━━━━━`

  return m.reply(cap)
}

export async function handleRevive(ctx) {
  const { m, csm, wdb, args } = ctx

  if (!csm.hospital) csm.hospital = []

  const reviveAll = (args[1] || '').toLowerCase() === 'all'
  const targetCount = reviveAll ? csm.hospital.length : 1
  const totalCost = targetCount * 50000

  if (reviveAll && csm.hospital.length === 0) {
    return m.reply(header('TIDAK ADA PARTNER') + `Tidak ada partner yang perlu pulih.\n━━━━━━━━━━━`)
  }

  if (!reviveAll) {
    let nomor = parseInt(args[1]) - 1
    if (!csm.hospital[nomor]) {
      return m.reply(header('NOMOR SALAH') + `Partner tidak ditemukan.\n|━━━━━━━━━━━`)
    }
    if (csm.blood < 50000) {
      return m.reply(header('DARAH KURANG') + `Butuh: 50.000 Blood\nPunya: ${csm.blood.toLocaleString()} Blood\n|━━━━━━━━━━━`)
    }
    csm.blood -= 50000
    let partner = csm.hospital.splice(nomor, 1)[0]
    partner.hp = 100
    partner.status = 'reserve'
    csm.partners.push(partner)
    saveDB(wdb)
    return m.reply(header('REVIVE BERHASIL') + `${partner.name} sudah pulih kembali.\n\n❤️ HP: 100/100\n👥 Status: CADANGAN\n🩸 -50.000 Blood\n|━━━━━━━━━━━`)
  }

  if (csm.blood < totalCost) {
    return m.reply(header('DARAH KURANG') + `Butuh: ${totalCost.toLocaleString()} Blood untuk revive semua\nPunya: ${csm.blood.toLocaleString()} Blood\n|━━━━━━━━━━━`)
  }

  csm.blood -= totalCost
  const revived = csm.hospital.splice(0, csm.hospital.length).map(partner => {
    partner.hp = 100
    partner.status = 'reserve'
    csm.partners.push(partner)
    return partner.name
  })
  saveDB(wdb)

  return m.reply(header('REVIVE MASSAL BERHASIL') + `Semua partner berhasil pulih.\n\n${revived.map((name, idx) => `${idx + 1}. ${name}`).join('\n')}\n\n🩸 -${totalCost.toLocaleString()} Blood\n|━━━━━━━━━━━`)
}
