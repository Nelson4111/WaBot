/**
 * CSM Rescue Command Handler
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import {
  RESCUE_STORIES, RESCUE_RESULTS, CITIZEN_RESPONSES, calcBonus
} from '../../../lib/rpg-libmyCSM.js'
import { header } from '../lib/utils.js'
import { rememberSeen, addExp, damageWeapon, partnerReaction } from '../lib/combat.js'

export async function handleRescue(ctx) {
  const { m, csm, wdb } = ctx
  let b = calcBonus(csm)

  let baseCooldown = 1200000
  let cooldown = baseCooldown - (b.stamina * 3000)
  if (cooldown < 60000) cooldown = 60000

  if (csm.lastRescue && Date.now() - csm.lastRescue < cooldown) {
    let sisa = Math.ceil((cooldown - (Date.now() - csm.lastRescue)) / 1000)
    let menit = Math.floor(sisa / 60)
    let detik = sisa % 60
    return m.reply(header('COOLDOWN') + `|Tunggu ${menit}m ${detik}d lagi.\n|Belum ada laporan penyelamatan baru.\n|━━━━━━━━━━━`)
  }

  if (csm.health < 8) return m.reply(header('HP KURANG') + `|Butuh minimal 8 HP.\n|━━━━━━━━━━━`)

  if (!Array.isArray(csm.inventory) || !csm.inventory.length) csm.inventory = [{ nama: 'Fist', dur: 999 }]
  const rusak = damageWeapon(csm, 1, 1)
  if (b.weaponDur > 0) csm.inventory[0].dur += b.weaponDur

  const RESCUE_STORY = RESCUE_STORIES
  const RESCUE_RESULT_WITH_EMOJI = RESCUE_RESULTS
  let story = RESCUE_STORY[Math.floor(Math.random() * RESCUE_STORY.length)]
  let result = RESCUE_RESULT_WITH_EMOJI[Math.floor(Math.random() * RESCUE_RESULT_WITH_EMOJI.length)]
  rememberSeen(csm, 'seenRescueStories', story)
  rememberSeen(csm, 'seenRescueResults', result)

  let jumlahRespon = Math.floor(Math.random() * 2) + 2
  let responDipilih = []
  let tempRespon = [...CITIZEN_RESPONSES]
  for (let i = 0; i < jumlahRespon; i++) {
    let idx = Math.floor(Math.random() * tempRespon.length)
    responDipilih.push(tempRespon[idx])
    tempRespon.splice(idx, 1)
  }

  let total = Math.floor(Math.random() * 20) + 5
  let injured = Math.floor(Math.random() * (total * 0.3))
  let missing = Math.floor(Math.random() * (total * 0.2))
  let saved = total - injured - missing
  if (saved < 2) saved = 2

  csm.devilsKilled++
  let bloodGain = Math.floor(((300 + saved * 25) * 1.5) * b.bloodMult) + b.stealBlood
  let expGain = Math.floor((400 + saved * 30) * b.expMult)

  csm.blood += bloodGain
  const leveled = addExp(csm, expGain, m)
  csm.lastRescue = Date.now()
  saveDB(wdb)

  let msg = header('OPERASI RESCUE SELESAI') +
    `${story}\n\n` +
    `${result}\n\n` +
    `${responDipilih.join('\n')}\n` +
    `|━━━━━━━━━━━\n\n` +
    `📊 LAPORAN EVAKUASI\n\n` +
    `👥 Total Warga: ${total} orang\n` +
    `✅ Selamat: ${saved} orang\n` +
    `🩹 Cidera: ${injured} orang\n` +
    `❓ Hilang: ${missing} orang\n` +
    `|━━━━━━━━━━━\n\n` +
    `🩸 +${bloodGain.toLocaleString()} Darah\n` +
    `📈 +${expGain} EXP [Bonus Besar]\n`

  if (b.findItem > 0 && Math.random() < b.findItem) {
    msg += `🎁 Ditemukan barang milik warga\n`
  }

  if (leveled) {
    msg += `🎉 LEVEL UP! Lv.${csm.level}\n`
  }

  if (rusak) {
    msg += `💀 *${rusak}* RUSAK!\n`
  }

  msg += `|━━━━━━━━━━━\n\n`
  msg += partnerReaction(csm, 'neutral')
  msg += `\n|━━━━━━━━━━━`

  return m.reply(msg)
}
