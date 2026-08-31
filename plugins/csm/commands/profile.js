/**
 * CSM Profile, Stats, and View Handlers
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import {
  ITEM_LIST, TITLE_LIST, BUFF_LIST, CHARACTER_LIST, DEVIL_LIST, STORY_LIST,
  CSM_CONTENT_TOTALS, ERASURE_BACKSTORIES,
  getTitle, getTitleBackstory, bar, calcBonus, calcSetBonus
} from '../../../lib/rpg-libmyCSM.js'
import { header, buffGuide, getJobData } from '../lib/utils.js'

export async function handleProfile(ctx) {
  const { m, csm, wdb, userRPG, senderJid, usedPrefix } = ctx
  if (!csm) return m.reply(header('BELUM START') + `|Gunakan .csm start untuk memulai\n|━━━━━━━━━━━`)

  let cap = header('MENU UTAMA')
  cap += `🏷️ ${csm.title}\n`
  cap += `👤 @${senderJid.split('@')[0]} | ${csm.gender}\n`
  cap += `📍 Location: ${csm.location}\n`
  cap += `📊 Lv.${csm.level} | 🩸 ${csm.blood.toLocaleString()} Darah\n`
  cap += `❤️ ${bar(Math.floor(csm.health / csm.maxHealth * 100))} ${csm.health}/${csm.maxHealth}\n`
  cap += `💰 Rp ${userRPG.bank.toLocaleString()} Bank\n\n`
  cap += `⚔️ ${csm.weapon.nama} [Dur: ${csm.weapon.dur}]\n`

  cap += `\n|━━━━━━━━━━━\n\n`

  cap += `👥 PARTNER: ${csm.partners.length}/5\n`
  cap += `📖 STORY: ${csm.story}/${STORY_LIST.length}\n`
  cap += `⛓️ KONTRAK: ${csm.devilContract || 'Tidak Ada'}\n`
  cap += `💼 PEKERJAAN: ${csm.job || 'Belum Kerja'}\n`

  cap += `\n|━━━━━━━━━━━\n\n`

  cap += `📋 BANTUAN: ${usedPrefix}csm command\n`
  cap += `📚 TUTORIAL: ${usedPrefix}csm tutorial\n`

  cap += `|━━━━━━━━━━━`

  saveDB(wdb)
  return m.reply(cap)
}

export async function handleStats(ctx) {
  const { m, csm, args, usedPrefix } = ctx
  if (!csm) return m.reply(header('BELUM START') + `|Gunakan.csm start untuk memulai\n|━━━━━━━━━━━`)

  if (args[1]?.toLowerCase() === 'guide') {
    let guideCap = header('PANDUAN BUFF')
    buffGuide.forEach((entry, index) => { guideCap += `${index + 1}. ${entry}\n━━━━━━━━━━━\n` })
    return m.reply(guideCap)
  }

  let b = calcBonus(csm)
  const baseStats = calcBonus({ partners: [] })
  const statActive = key => b[key] !== baseStats[key]
  let setBonus = calcSetBonus(csm)
  let active = csm.partners.filter(p => p.status === 'active')

  let cap = header('STAT DETAIL & BUFF')

  cap += `🏷️ ${csm.title} | Lv.${csm.level}\n`
  cap += `❤️ HP: ${csm.health}/${csm.maxHealth} | 🩸 ${csm.blood.toLocaleString()}\n`
  cap += `👥 Partner Aktif: ${active.length}/5\n`

  cap += `|━━━━━━━━━━━\n\n`

  cap += `⚔️ BUFF COMBAT\n`
  if (statActive('dmg')) cap += `> DMG: +${b.dmg}\n`
  if (statActive('def')) cap += `> DEF: +${b.def}\n`
  if (statActive('critChance') || statActive('critDmg')) cap += `> Crit: ${b.critChance}% | Crit Dmg: +${(b.critDmg * 100).toFixed(0)}%\n`
  if (statActive('evasion') || statActive('accuracy')) cap += `> Evasion: ${b.evasion}% | Accuracy: ${b.accuracy}%\n`
  if (statActive('speed') || statActive('aoe')) cap += `> Speed: ${b.speed} | AoE: ${b.aoe}\n`
  if (statActive('pierce') || statActive('cc') || statActive('ccResist')) cap += `> Pierce: ${b.pierce} | CC: ${b.cc} | CC Res: ${b.ccResist}\n`
  if (statActive('instantKill') || statActive('stealBlood')) cap += `> Instant Kill: +${b.instantKill}% | Steal: +${b.stealBlood}\n`

  cap += `|━━━━━━━━━━━\n\n`

  cap += `🩹 BUFF SURVIVE\n`
  if (statActive('regen')) cap += `> Regen: +${b.regen} HP\n`
  if (statActive('heal')) cap += `> Heal: +${b.heal}%\n`
  if (statActive('teamHp')) cap += `> Team HP: +${b.teamHp}\n`
  if (statActive('stamina') || statActive('weaponDur')) cap += `> Stamina: ${b.stamina} | Weapon Dur: ${b.weaponDur}\n`
  if (statActive('revive')) cap += `> Revive: ✅\n`

  cap += `|━━━━━━━━━━━\n\n`

  cap += `📈 BUFF GAIN\n`
  if (statActive('expMult')) cap += `> EXP: x${b.expMult.toFixed(2)}\n`
  if (statActive('bloodMult')) cap += `> Blood: x${b.bloodMult.toFixed(2)}\n`
  if (statActive('bloodFlat')) cap += `> Blood Flat: +${b.bloodFlat}\n`
  if (statActive('findItem')) cap += `> Find Item: +${(b.findItem * 100).toFixed(0)}%\n`
  if (statActive('info')) cap += `> Info: +${(b.info * 100).toFixed(0)}%\n`
  if (statActive('discount')) cap += `> Discount: -${(b.discount * 100).toFixed(0)}%\n`
  if (statActive('luck')) cap += `> Luck: +${(b.luck * 100).toFixed(0)}%\n`

  cap += `|━━━━━━━━━━━\n\n`

  cap += `🔮 BUFF SPESIAL\n`
  if (['burn', 'fire', 'water', 'bleed'].some(statActive)) cap += `> Burn: ${b.burn} | Fire: ${b.fire} | Water: ${b.water} | Bleed: ${b.bleed}\n`
  if (statActive('autoTransform')) cap += `> Auto Transform: ✅\n`
  if (statActive('conceptErasure')) cap += `> Concept Erasure: ✅\n`
  if (statActive('teleportChance')) cap += `> Teleport: ${b.teleportChance}%\n`

  cap += `|━━━━━━━━━━━\n\n`

  if (Object.keys(setBonus).length > 0) {
    cap += `🔥 BUFF SET BONUS\n`
    for (let key in setBonus) {
      cap += `> ${key}: +${setBonus[key]}\n`
    }
    cap += `|━━━━━━━━━━━\n\n`
  }

  cap += `👥 BUFF SUMMON\n`
  if (statActive('summon') || statActive('dollBuff')) cap += `> Summon: ${b.summon} | Doll Buff: ${b.dollBuff}\n`
  if (statActive('selfDestruct') || statActive('craftWeapon')) cap += `> Self Destruct: ${b.selfDestruct} | Craft: ${b.craftWeapon}\n`
  if (statActive('control') || statActive('snake')) cap += `> Control: ${b.control} | Snake: ${b.snake}\n`

  cap += `\n|━━━━━━━━━━━\n\n`
  cap += `📌 Hanya menampilkan buff aktif.\n`
  cap += `📚 Guide: ${usedPrefix}csm stats guide\n`
  cap += `|━━━━━━━━━━━`

  return m.reply(cap)
}

export async function handleView(ctx) {
  const { m, csm, args } = ctx
  if (!csm) return m.reply(header('ERROR') + `Data tidak ditemukan\n━━━━━━━━━━━`)
  const sub = (args[1] || '').toLowerCase()

  if (sub === 'backstory' || sub === 'story' || sub === 'profile') {
    if (!csm.nickname) return m.reply(header('WAJIB SET NICKNAME') + `Kamu belum punya nama Hunter.\nGunakan:.csm nickname <nama>\n━━━━━━━━━━━`)

    const levelTitle = getTitle(csm.level)
    csm.title = levelTitle
    const relevantStory = getTitleBackstory(csm.level)

    if (csm.erasureProtection?.startsWith('horsemen:')) {
      const protection = csm.erasureProtection.split(':')[1]
      return m.reply(header('BACKSTORY TERKENDALI') + `🏷️ ${levelTitle}\n👤 ${csm.nickname}\n⚧️ ${csm.gender}\n📍 ${csm.location}\n\n${relevantStory}\n\n${ERASURE_BACKSTORIES[protection] || '🕳️ Erasure Effect mengubah ingatanmu menjadi potongan-potongan yang tidak lengkap.'}\n\nStory Progress: ???/${STORY_LIST.length}\n━━━━━━━━━━━`)
    }

    let cap = header('BACKSTORY KAMU')
    cap += `🏷️ ${levelTitle}\n`
    cap += `👤 ${csm.nickname}\n`
    cap += `⚧️ ${csm.gender}\n`
    cap += `📍 ${csm.location}\n\n`
    cap += `${relevantStory}\n\n`
    const completedStories = Math.max(0, Math.min(STORY_LIST.length, Number(csm.story || 1) - 1))
    cap += `Story Progress: ${completedStories}/${STORY_LIST.length}\n`
    if (csm.ending) cap += `🏁 Ending aktif: ${csm.ending}\n`
    cap += `━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'item' || sub === 'items' || sub === 'inventory') {
    const foundItems = ITEM_LIST.filter(item => (csm.foundItems || []).includes(item.nama))
    let cap = header('RIWAYAT ITEM')
    cap += `Item ditemukan: ${foundItems.length}/${ITEM_LIST.length}\n\n`
    cap += foundItems.length ? foundItems.map(item => `${item.emoji} ${item.nama} [${item.tier}]`).join('\n') : 'Belum ada item yang ditemukan.'
    return m.reply(`${cap}\n━━━━━━━━━━━`)
  }

  if (sub === 'title' || sub === 'titles') {
    const currentLevel = Number(csm.level) || 1
    const currentTitle = getTitle(currentLevel)
    let cap = header('TITLE HUNTER')
    cap += `🏷️ Title saat ini: *${currentTitle}*\n`
    cap += `📊 Level: ${currentLevel}\n\n`
    const previousTitles = TITLE_LIST.filter(([minimumLevel, title]) => currentLevel >= minimumLevel && title !== currentTitle)
    cap += `Title terbuka: ${previousTitles.length + 1}/${TITLE_LIST.length}\n\n`
    cap += `📜 Riwayat title:\n`
    cap += previousTitles.length
      ? previousTitles.map(([minimumLevel, title]) => `✅ Lv.${minimumLevel} - ${title}`).join('\n')
      : 'Belum ada title sebelumnya.'
    cap += `━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'buff' || sub === 'buffs') {
    const bonus = calcBonus(csm)
    const baseBonus = calcBonus({ partners: [] })
    const obtained = new Set(csm.buffHistory)
    const endingRewards = Array.isArray(csm.endingReward) ? csm.endingReward : []
    endingRewards.forEach(reward => obtained.add(reward.name))
    csm.partners.filter(partner => partner.status === 'active').forEach(partner => obtained.add(partner.name))
    let cap = header('RIWAYAT BUFF')
    const activeBuffs = BUFF_LIST.filter(key => bonus[key] !== baseBonus[key] || obtained.has(key))
    cap += `Buff aktif/terbuka: ${activeBuffs.length}/${BUFF_LIST.length}\n🏆 Reward ending tersimpan: ${endingRewards.length}\n\n`
    cap += activeBuffs.length ? activeBuffs.map((key, index) => `${index + 1}. ${key}${bonus[key] !== baseBonus[key] ? ' - Aktif' : ' - Pernah didapat'}`).join('\n') : 'Belum ada buff yang tercatat.'
    cap += `\n━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'contract' || sub === 'contracts' || sub === 'contract-scenes' || sub === 'scenes') {
    let cap = header('CONTRACT SCENES')
    cap += `📜 Scene terbuka: ${(csm.seenContractScenes || []).length}/${CSM_CONTENT_TOTALS.contractScenes}\n\n`
    cap += (csm.seenContractScenes || []).length
      ? csm.seenContractScenes.map((scene, index) => `${index + 1}. ${scene}`).join('\n\n')
      : 'Belum ada scene kontrak yang ditemukan.'
    cap += `\n━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'explore' || sub === 'explorestories') {
    let cap = header('EXPLORE STORIES')
    cap += `🗺️ Story ditemukan: ${(csm.seenExploreStories || []).length}/${CSM_CONTENT_TOTALS.exploreStories}\n\n`
    cap += (csm.seenExploreStories || []).length
      ? csm.seenExploreStories.map((story, index) => `${index + 1}. ${story}`).join('\n\n')
      : 'Belum ada story explore yang ditemukan.'
    cap += `\n━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'mission' || sub === 'missionstories') {
    let cap = header('MISSION STORIES')
    cap += `🎯 Story misi ditemukan: ${(csm.seenMissionStories || []).length}/${CSM_CONTENT_TOTALS.missionStories}\n\n`
    cap += (csm.seenMissionStories || []).length
      ? csm.seenMissionStories.map((story, index) => `${index + 1}. ${story}`).join('\n\n')
      : 'Belum ada story misi yang ditemukan.'
    cap += `\n━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'rescue' || sub === 'rescues') {
    let cap = header('RESCUE STORIES')
    cap += `🚑 Story rescue: ${(csm.seenRescueStories || []).length}/${CSM_CONTENT_TOTALS.rescueStories}\n`
    cap += `📋 Hasil rescue: ${(csm.seenRescueResults || []).length}/${CSM_CONTENT_TOTALS.rescueResults}\n\n`
    cap += `📖 Story:\n${(csm.seenRescueStories || []).length ? csm.seenRescueStories.map((story, index) => `${index + 1}. ${story}`).join('\n\n') : 'Belum ada story rescue.'}\n\n`
    cap += `✅ Hasil:\n${(csm.seenRescueResults || []).length ? csm.seenRescueResults.map((result, index) => `${index + 1}. ${result}`).join('\n\n') : 'Belum ada hasil rescue.'}`
    cap += `\n━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'work') {
    const current = csm.job ? getJobData(csm, csm.job) : null
    return m.reply(header('PROGRESS KERJA') + `Job aktif: ${csm.job || 'Tidak ada'}\n${current ? `Level: ${current.level}\nEXP: ${current.exp}/${Math.floor(100 * Math.pow(current.level, 1.5))}\n` : ''}Story kerja: ${csm.workStories?.length || 0}/10\n━━━━━━━━━━━`)
  }

  if (sub === 'location' || sub === 'locations' || sub === 'visit') {
    const history = Array.isArray(csm.locationHistory) ? csm.locationHistory : [csm.location || 'Markas Public Safety']
    let cap = header('LOKASI & RIWAYAT')
    cap += `📍Location :\n ${csm.location || 'Markas Public Safety'}\n\n`
    cap += `🗺️ Riwayat lokasi (${history.length}):\n`
    history.forEach((loc, index) => {
      cap += `${index + 1}. ${loc}\n`
    })
    cap += `━━━━━━━━━━━`
    return m.reply(cap)
  }

  if (sub === 'character' || sub === 'characters' || sub === 'char') {
    const owned = csm.partners.length
    const encountered = CHARACTER_LIST.filter(character => csm.lastSeenChars?.[character.nama] || csm.partners.some(partner => partner.name === character.nama))
    const characterList = encountered.length
      ? encountered.map((character, index) => {
        const love = Number(csm.relations?.[character.nama] || 0)
        const level = Math.max(1, Math.floor(love / Math.max(1, character.needLove)) + 1)
        const partner = csm.partners.find(item => item.name === character.nama)
        return `${index + 1}. ${character.emoji} ${character.nama} - Lv.${level} | ${partner ? partner.status : 'pernah ditemui'}`
      }).join('\n')
      : 'Belum ada karakter yang pernah ditemui.'
    return m.reply(header('PROGRESS CHARACTER') + `Partner dimiliki: ${owned}/${CHARACTER_LIST.length}\nPartner aktif: ${csm.partners.filter(partner => partner.status === 'active').length}/5\nKarakter pernah ditemui: ${encountered.length}/${CHARACTER_LIST.length}\n\n${characterList}\n━━━━━━━━━━━`)
  }

  if (sub === 'database' || sub === 'devil' || sub === 'devils' || sub === 'devil-database' || sub === 'fiend' || sub === 'hybrid' || sub === 'all-devil' || sub === 'all-devils' || sub === 'progress') {
    const contractedNames = new Set(csm.contractHistory || [])
    const seenMap = new Map()
    for (const devil of DEVIL_LIST) {
      const seen = Boolean(csm.lastSeenDevils?.[devil.nama] || contractedNames.has(devil.nama))
      if (!seen) continue
      seenMap.set(devil.nama, devil)
    }
    const seenList = Array.from(seenMap.values())
    const listText = seenList.length
      ? seenList.map((devil, index) => {
          const status = contractedNames.has(devil.nama) ? 'KONTRAK' : 'DITEMUI'
          return `${index + 1}. ${devil.emoji} *${devil.nama}* - ${devil.tipe} | ${devil.rank} | ${status}`
        }).join('\n')
      : 'Belum ada Devil / Hybrid / Fiend yang pernah ditemui atau dikontrak.'
    return m.reply(header('VIEW DEVIL') + `Total tercatat: ${seenList.length}/${DEVIL_LIST.length}\nSemua tipe digabung: Devil, Hybrid, Fiend\n\n${listText}\n━━━━━━━━━━━`)
  }

  if (sub === 'reaction' || sub === 'reactions' || sub === 'partnerreaction' || sub === 'partner reactions') {
    const reactions = Array.isArray(csm.partnerReactionHistory) ? csm.partnerReactionHistory : []
    const seen = new Map()
    reactions.forEach(entry => {
      const key = `${entry.partner}:${entry.outcome}:${entry.reaction}`
      if (!seen.has(key)) seen.set(key, entry)
    })
    const list = Array.from(seen.values())
    const text = list.length
      ? list.map((entry, index) => `${index + 1}. ${entry.emoji || '🤝'} *${entry.partner}*\n> "${entry.reaction || '...'}"`).join('\n\n')
      : 'Belum ada reaksi partner yang tercatat.'
    return m.reply(header('REACTION PARTNER') + `Total reaksi tercatat: ${list.length}\n\n${text}\n━━━━━━━━━━━`)
  }

  if (sub === 'terror') {
    const success = csm.terrorStory.filter(entry => entry.result === 'success').length
    const failed = csm.terrorStory.filter(entry => entry.result !== 'success').length
    const stories = csm.terrorStory.length
      ? csm.terrorStory.map((entry, index) => `${index + 1}. ${entry.result === 'success' ? '✅ BERHASIL' : '❌ GAGAL'}\n${entry.story || 'Tidak ada catatan story.'}`).join('\n\n')
      : 'Belum ada catatan Terror.'
    return m.reply(header('PROGRESS TERROR') + `Percobaan: ${csm.terrorStory.length}/10\n✅ Berhasil: ${success}\n❌ Gagal: ${failed}\n\n📖 CATATAN STORY\n${stories}\n━━━━━━━━━━━`)
  }

  let cap = header('MENU VIEW')
  cap += `📖 Lihat berbagai progress, riwayat, dan koleksi yang sudah kamu dapatkan selama permainan.\n`
  cap += `|━━━━━━━━━━━\n\n`
  cap += `> *.csm view backstory* - Backstory\n`
  cap += `> *.csm view item* - Item ditemukan\n`
  cap += `> *.csm view location* - Lokasi & perjalanan\n`
  cap += `> *.csm view character* - Database karakter\n`
  cap += `> *.csm view devil* - Devil yang ditemui\n`
  cap += `> *.csm view terror* - Catatan terror\n`
  cap += `> *.csm view reaction* - Reaksi partner\n`
  cap += `> *.csm view title* - Title Hunter\n`
  cap += `> *.csm view buff* - Buff didapat\n`
  cap += `> *.csm view contract* - Contract scenes\n`
  cap += `> *.csm view explore* - Explore stories\n`
  cap += `> *.csm view mission* - Mission stories\n`
  cap += `> *.csm view rescue* - Rescue stories\n\n`
  cap += `|━━━━━━━━━━━`

  return m.reply(cap)
}
