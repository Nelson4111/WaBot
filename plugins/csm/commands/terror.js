/**
 * CSM Terror Command Handler
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import {
  TERROR_SUCCESS_STORIES, TERROR_DEATH_STORIES, CSM_PICTURES
} from '../../../lib/rpg-libmyCSM.js'
import { header, pickPicture, sendCsmReply, checkMakimaTrigger } from '../lib/utils.js'
import { partnerReaction } from '../lib/combat.js'

export async function handleTerror(ctx) {
  const { m, conn, csm, wdb, usedPrefix } = ctx
  if (!csm.contractType && !csm.dollContract) {
    return m.reply(header('TIDAK ADA KONTRAK') + `|Terror membutuhkan kontrak aktif.\n|${usedPrefix}csm contract\n|━━━━━━━━━━━`)
  }

  const frenzyActive = csm.bloodFrenzy?.expiresAt > Date.now() || csm.hungerFeast?.expiresAt > Date.now()
  if (csm.bloodFrenzy && !frenzyActive) csm.bloodFrenzy = null
  const terrorCooldown = frenzyActive ? 0 : 3600000
  const terrorLeft = terrorCooldown - (Date.now() - (csm.lastTerror || 0))
  if (terrorLeft > 0) return m.reply(header('COOLDOWN TERROR') + `|Tunggu ${Math.ceil(terrorLeft / 60000)} menit lagi.\n|━━━━━━━━━━━`)

  const metHunter = Math.random() < 0.25
  const story = metHunter
    ? TERROR_DEATH_STORIES[Math.floor(Math.random() * TERROR_DEATH_STORIES.length)]
    : TERROR_SUCCESS_STORIES[Math.floor(Math.random() * TERROR_SUCCESS_STORIES.length)]
  csm.lastTerror = Date.now()
  if (!Array.isArray(csm.terrorStory)) csm.terrorStory = []
  csm.terrorStory.push({ date: Date.now(), result: metHunter ? 'death' : 'success', story })
  if (csm.terrorStory.length > 10) csm.terrorStory.shift()

  if (metHunter) {
    csm.health = csm.dollContract ? 1 : 0
    saveDB(wdb)
    return sendCsmReply(
      conn, m, wdb,
      header('TERROR GAGAL') +
      `|${story}\n\n|🩸 Darah kamu aman: ${csm.blood.toLocaleString()}\n|❤️ HP tersisa: ${csm.health}/${csm.maxHealth}\n|${csm.dollContract ? '🪆 Boneka tidak benar-benar mati. Kamu masih bisa terror lagi setelah cooldown.' : '💀 Kamu mati. Gunakan .csm revive atau .csm rest'}${partnerReaction(csm, 'lose')}\n|━━━━━━━━━━━`,
      pickPicture(CSM_PICTURES.city)
    )
  }

  const reward = (Math.floor(Math.random() * 40000) + 5000) * (frenzyActive ? 2 : 1)
  csm.blood += reward
  if (frenzyActive && Math.random() < 0.2) csm.health = Math.max(1, csm.health - 5)
  saveDB(wdb)
  await checkMakimaTrigger(m, csm, wdb)
  return sendCsmReply(
    conn, m, wdb,
    header('TERROR BERHASIL') +
    `${story}\n\n` +
    `> 🩸 +${reward.toLocaleString()} Darah\n` +
    `> 📖 Catatan terror tersimpan: ${csm.terrorStory.length}/10\n` +
    `|━━━━━━━━━━━\n` +
    `${partnerReaction(csm, 'win')}\n` +
    `|━━━━━━━━━━━`,
    pickPicture(CSM_PICTURES.city)
  )
}
