/**
 * CSM Rest & Heal Command Handlers
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import { calcBonus } from '../../../lib/rpg-libmyCSM.js'
import { header, cekCD } from '../lib/utils.js'
import { partnerReaction } from '../lib/combat.js'

export async function handleRest(ctx) {
  const { m, csm, wdb } = ctx
  const restBonus = calcBonus(csm)

  if (restBonus.noHeal) {
    return m.reply(
      header('BONUS REVENGE') +
      `Bonus Revenge mencegah pemulihan HP secara normal. Gunakan *.csm heal*.\n` +
      `|━━━━━━━━━━━`
    )
  }

  const cd = cekCD(csm, 'lastRest', 5 * 60 * 1000)

  if (cd > 0) {
    const menit = Math.ceil(cd / 60000)
    return m.reply(
      header('COOLDOWN') +
      `Tunggu ${menit} menit lagi.\n` +
      `|━━━━━━━━━━━`
    )
  }

  const heal = Math.floor(csm.maxHealth * 0.4)
  const hpSebelum = csm.health

  csm.health = Math.min(csm.maxHealth, csm.health + heal)
  const actualHeal = csm.health - hpSebelum
  csm.lastRest = Date.now()

  saveDB(wdb)

  return m.reply(
    header('ISTIRAHAT') +
    `Kamu beristirahat sejenak.\n\n` +
    `|━━━━━━━━━━━\n` +
    `❤️ *PEMULIHAN*\n` +
    `> +${actualHeal} HP\n` +
    `> HP: ${csm.health}/${csm.maxHealth}\n` +
    `|━━━━━━━━━━━\n` +
    partnerReaction(csm, 'neutral') +
    `\n|━━━━━━━━━━━`
  )
}

export async function handleHeal(ctx) {
  const { m, csm, wdb } = ctx
  const currentBonus = calcBonus(csm)

  if (!currentBonus.noHeal) {
    return m.reply(header('HEAL') + `Gunakan *.csm rest* untuk memulihkan HP.\n━━━━━━━━━━━`)
  }

  const healCooldown = 30 * 60 * 1000
  const cooldownLeft = healCooldown - (Date.now() - (csm.lastRevengeHeal || 0))
  if (cooldownLeft > 0) {
    return m.reply(header('COOLDOWN HEAL') + `Tunggu ${Math.ceil(cooldownLeft / 60000)} menit lagi.\n━━━━━━━━━━━`)
  }

  const healCost = 5000
  if (csm.blood < healCost) {
    return m.reply(header('DARAH KURANG') + `Butuh ${healCost.toLocaleString()} Blood untuk memaksa regenerasi.\n━━━━━━━━━━━`)
  }

  const hpBefore = csm.health
  csm.blood -= healCost
  csm.health = Math.min(csm.maxHealth, csm.health + Math.floor(csm.maxHealth * 0.25))
  csm.lastRevengeHeal = Date.now()
  saveDB(wdb)

  return m.reply(
    header('REGENERASI REVENGE') +
    `Rasa sakit diubah menjadi tenaga.\n` +
    `❤️ HP: +${csm.health - hpBefore}\n` +
    `🩸 Blood: -${healCost.toLocaleString()}\n` +
    `❤️ Total HP: ${csm.health}/${csm.maxHealth}\n` +
    `━━━━━━━━━━━`
  )
}
