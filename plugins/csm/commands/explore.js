/**
 * CSM Explore Command Handler
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import {
  EXPLORE_STORIES, ITEM_COMMENTS, ITEM_LIST, WEAPON_LIST, CHARACTER_LIST, DEVIL_LIST,
  CSM_PICTURES, calcBonus
} from '../../../lib/rpg-libmyCSM.js'
import {
  header, cekCD, ALL_LOCATION_LIST, pickPicture, getDropByName, addInventoryDrop,
  sendCsmReply, checkMakimaTrigger
} from '../lib/utils.js'
import { rememberSeen, addExp, partnerReaction } from '../lib/combat.js'

export async function handleExplore(ctx) {
  const { m, conn, csm, wdb } = ctx

  const cooldown = cekCD(csm, 'lastExplore', 10 * 60 * 1000)
  if (cooldown > 0) return m.reply(header('COOLDOWN EXPLORE') + `Tunggu ${Math.ceil(cooldown / 60000)} menit lagi.\n━━━━━━━━━━━`)

  const bonus = calcBonus(csm)
  const exploreStory = EXPLORE_STORIES[Math.floor(Math.random() * EXPLORE_STORIES.length)]
  rememberSeen(csm, 'seenExploreStories', exploreStory)
  const bloodGain = Math.floor((Math.random() * 2500 + 1000) * bonus.bloodMult) + bonus.stealBlood
  const expGain = Math.floor((Math.random() * 80 + 40) * bonus.expMult)
  csm.blood += bloodGain
  csm.lastExplore = Date.now()
  const leveled = addExp(csm, expGain, m)

  let msg = header('HASIL EXPLORE') +
    `${exploreStory}\n` +
    `|━━━━━━━━━━━\n\n` +
    `Kamu menyusuri sekitar dan menemukan jejak darah yang masih hangat.\n\n` +
    `🩸 +${bloodGain.toLocaleString()} Blood\n`

  const roll = Math.random()
  const itemRate = Math.min(0.95, 0.25 + bonus.findItem + bonus.luck)
  const weaponRate = 0.025 + Math.min(0.04, bonus.luck / 10)
  const itemComments = ITEM_COMMENTS
  const exploreItems = ITEM_LIST.filter(item => ['E', 'D', 'C', 'B'].includes(item.tier))
  const currentLocation = ALL_LOCATION_LIST.find(location => location.nama === csm.location)
  const guaranteedName = currentLocation?.drop?.find(name => ITEM_LIST.some(item => item.nama === name))
  const guaranteedItem = getDropByName(guaranteedName) || exploreItems[Math.floor(Math.random() * exploreItems.length)]
  const foundItems = []
  addInventoryDrop(csm, guaranteedItem)
  foundItems.push(`✅ ${guaranteedItem.emoji} *${guaranteedItem.nama}* [TIER ${guaranteedItem.tier}]`)
  if (roll < weaponRate) {
    const weaponPool = WEAPON_LIST.filter(weapon => ['E', 'D', 'C'].includes(weapon.tier) && weapon.nama !== 'Fist')
    const weapon = weaponPool[Math.floor(Math.random() * weaponPool.length)]
    csm.inventory.push({ nama: weapon.nama, dur: weapon.dur })
    msg += `📦 LOOT EXPLORE:\n${foundItems.join('\n')}\n⚔️ *${weapon.emoji} ${weapon.nama}* [TIER ${weapon.tier}]\n`
  } else if (roll < weaponRate + itemRate) {
    const tierRoll = Math.random() - bonus.luck * 2
    let tier = 'E'
    if (tierRoll < 0.0001) tier = 'SSS'
    else if (tierRoll < 0.0005) tier = 'SS'
    else if (tierRoll < 0.002) tier = 'S'
    else if (tierRoll < 0.01) tier = 'A'
    else if (tierRoll < 0.05) tier = 'B'
    else if (tierRoll < 0.25) tier = 'C'
    else if (tierRoll < 0.65) tier = 'D'
    const pool = exploreItems.filter(item => item.tier === tier)
    const safePool = pool.length ? pool : exploreItems
    const item = safePool[Math.floor(Math.random() * safePool.length)]
    addInventoryDrop(csm, item)
    foundItems.push(`🎁 ${item.emoji} *${item.nama}* [TIER ${item.tier}]`)
    msg += `📦 LOOT EXPLORE:\n${foundItems.join('\n')}\n`
    msg += `💬 ${itemComments[Math.floor(Math.random() * itemComments.length)]}\n`
  } else if (roll < 0.33) {
    msg += `Kamu menemukan sumber Blood tambahan di sekitar lokasi.\n`
  } else if (roll < 0.63) {
    const devilChance = 0.25 + (csm.erasureProtection?.startsWith('horsemen:') ? 0.25 : 0)
    const devilSpawn = Math.random() < Math.max(0.05, devilChance - bonus.info / 100)
    let lastSeen = csm.lastSeenChars || {}
    const coreCharacters = ['Denji', 'Aki Hayakawa', 'Power', 'Asa Mitaka', 'Nayuta', 'Fami', 'Makima', 'Yoru', 'Kishibe', 'Himeno', 'Kobeni Higashiyama', 'Hirofumi Yoshida', 'Beam', 'Galgali', 'Reze', 'Quanxi', 'Angel Devil', 'Pochita', 'Meowy']
    let characterPool = CHARACTER_LIST.map(character => {
      let weight = 2 + bonus.luck
      if (coreCharacters.includes(character.nama)) weight += 3 + bonus.political / 10
      if (lastSeen[character.nama] && Date.now() - lastSeen[character.nama] < 3600000) weight = 0.1
      return { ...character, weight }
    }).filter(character => character.weight > 0)
    const spawned = []
    const spawnCount = devilSpawn ? Math.min(Math.floor(Math.random() * 3) + 1, 3) : Math.min(Math.floor(Math.random() * 5) + 2, 7)
    for (let index = 0; index < spawnCount && characterPool.length; index++) {
      const totalWeight = characterPool.reduce((total, character) => total + character.weight, 0)
      let randomWeight = Math.random() * totalWeight
      const selected = characterPool.find(character => (randomWeight -= character.weight) <= 0)
      if (!selected) break
      spawned.push(selected)
      characterPool = characterPool.filter(character => character.nama !== selected.nama)
    }
    spawned.forEach(character => { csm.lastSeenChars[character.nama] = Date.now() })
    if (devilSpawn) {
      const isHellExplore = csm.location?.includes('Neraka') || csm.location?.includes('Hell')
      const devilPool = isHellExplore
        ? DEVIL_LIST.filter(devil => ['S', 'SS', 'SSS'].includes(devil.rank))
        : DEVIL_LIST
      const devil = devilPool[Math.floor(Math.random() * devilPool.length)] || DEVIL_LIST[0]
      csm.lastSeenDevils[devil.nama] = Date.now()
      csm.encounter = { type: 'devil', data: devil, helpers: spawned, source: 'explore' }
      msg += `|━━━━━━━━━━━\n\n`
      msg += `👹 *${devil.emoji} ${devil.nama}* [${devil.rank}] muncul!\n`
      if (spawned.length) msg += `👥 ${spawned.map(character => character.nama).join(', ')} ikut membantu.\n`
      msg += `⚔️ *.csm explore fight*\n`
      msg += `🏃 *.csm explore run*\n`
    } else if (spawned.length) {
      csm.encounter = { type: 'char', data: spawned[0], all: spawned, source: 'explore' }
      msg += `|━━━━━━━━━━━\n\n`
      msg += `👥 Ada ${spawned.length} karakter di sini:\n`
      spawned.forEach((character, index) => {
        msg += `*${index + 1}.* ${character.emoji} *${character.nama}*\n`
        msg += `   Role: ${character.role}\n`
      })
      csm.encounter.source = 'explore'
      msg += `Gunakan *.csm explore interact <nomor/nama>* untuk berbicara.\n`
    }
  } else {
    msg += `Sepertinya aman...\n`
  }

  if (foundItems.length && !msg.includes('LOOT EXPLORE:')) {
    msg += `📦 LOOT EXPLORE:\n${foundItems.join('\n')}\n`
  }

  msg += `|━━━━━━━━━━━\n\n`
  msg += `📈 +${expGain} EXP`
  if (leveled) msg += `\n🎉 LEVEL UP! Lv.${csm.level}`
  msg += partnerReaction(csm, 'neutral')
  msg += `\n━━━━━━━━━━━`
  await checkMakimaTrigger(m, csm, wdb)
  return sendCsmReply(conn, m, wdb, msg, pickPicture(CSM_PICTURES.city))
}
