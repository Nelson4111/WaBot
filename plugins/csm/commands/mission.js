/**
 * CSM Mission Command Handler
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import {
  DEVIL_LIST, WEAPON_LIST, CHARACTER_LIST, MISSION_STORIES,
  PARTNER_MISSION_DIALOGS, MAIN_LOCATION_LIST, SIDE_LOCATION_LIST, calcBonus
} from '../../../lib/rpg-libmyCSM.js'
import { header, checkMakimaTrigger } from '../lib/utils.js'
import {
  getPartnerDamage, addExp, damageWeapon, partnerReaction,
  recordPartnerDialog, rememberSeen
} from '../lib/combat.js'

export async function handleMission(ctx) {
  const { m, csm, wdb, args } = ctx
  let sub = args[1]

  // .csm mission fight
  if (sub === 'fight' && csm.tempMission) {
    let b = calcBonus(csm)
    let { devil, devilHp, dmg } = csm.tempMission
    let battleEffects = []
    if (b.summon > 0) battleEffects.push(`👹 Devil tambahan berhasil disummon (+${b.summon * 10} DMG).`)
    if (b.army > 0) battleEffects.push(`🎖️ Bantuan Army Buff memperkuat serangan (+${b.army} DMG).`)
    if (b.cc > 0 && Math.random() * 100 < Math.min(75, b.cc)) {
      dmg += Math.floor(devil.hp * 0.2)
      battleEffects.push('⛓️ CC berhasil: lawan tidak bisa bergerak sesaat.')
    }
    if (b.selfDestruct > 0 && Math.random() < Math.min(0.5, b.selfDestruct / 1000)) {
      dmg += devil.hp * 2
      csm.health = 1
      battleEffects.push('💥 Self Destruct aktif: tubuhmu dikorbankan untuk ledakan damage besar.')
    }
    csm.health = Math.max(1, csm.health - 10)
    if (b.ccResist > 0) csm.health = Math.min(csm.maxHealth, csm.health + Math.floor(b.ccResist / 10))
    if (b.teleportChance > 0 && Math.random() * 100 < b.teleportChance) {
      const safeLocation = [...MAIN_LOCATION_LIST, ...SIDE_LOCATION_LIST].find(location => location.rateDevil < 0.2)
      if (safeLocation) csm.location = safeLocation.nama
      battleEffects.push(`🌀 Teleport aktif: kamu berpindah ke ${csm.location} dan menghindari serangan.`)
    }

    if (!b.noHeal && (b.regen > 0 || b.heal > 0)) {
      csm.health = Math.min(csm.maxHealth, csm.health + b.regen + b.heal)
    }

    if (devilHp <= dmg) {
      const rusak = damageWeapon(csm, 1, 0.5)
      if (b.weaponDur > 0) csm.inventory[0].dur += b.weaponDur

      csm.devilsKilled++
      let bloodGain = Math.floor(((devil.blood * 2) + 400) * b.bloodMult) + b.stealBlood + b.bloodFlat
      let expGain = Math.floor(((devil.exp * 2) + 100) * b.expMult)

      csm.blood += bloodGain
      const leveled = addExp(csm, expGain, m)
      delete csm.tempMission
      saveDB(wdb)

      const WIN_TEXT = [
        `💥 Dentuman, darah, daging.\n\n${devil.emoji} *${devil.nama}* pecah jadi kabut merah. Yang tersisa cuma bau besi.`,
        `🔪 Suara gerigi berhenti mendadak.\n\n${devil.emoji} *${devil.nama}* ambruk sebelum sempat memanggil bantuan.`,
        `🩸 Tidak ada kemenangan yang bersih.\n\n${devil.emoji} *${devil.nama}* jatuh, dan lantai menerima semuanya.`,
        `⚔️ Satu celah cukup.\n\nSerangan terakhir menembus pertahanan ${devil.emoji} *${devil.nama}*.`,
        `🚨 Sirene terdengar setelah semuanya selesai.\n\n${devil.emoji} *${devil.nama}* tidak lagi bergerak.`,
        `⛓️ Kontrakmu menagih tenaga terakhir.\n\n${devil.emoji} *${devil.nama}* terseret jatuh di ujung rantai.`,
        `💀 Kamu hampir ikut roboh, tetapi ${devil.emoji} *${devil.nama}* jatuh lebih dulu.`,
        `🔥 Panas, asap, lalu hening.\n\n${devil.emoji} *${devil.nama}* dikalahkan sebelum api menjalar lebih jauh.`,
        `👁️ Kamu membaca gerakannya tepat waktu.\n\nSatu serangan terarah mengakhiri perlawanan ${devil.emoji} *${devil.nama}*.`,
        `🏙️ Gang itu kembali sunyi.\n\n${devil.emoji} *${devil.nama}* tumbang, sementara kamu masih bisa berdiri.`
      ]
      let winMsg = WIN_TEXT[Math.floor(Math.random() * WIN_TEXT.length)]

      let msg = header('TARGET DILENYAPKAN') + winMsg +
        `\n━━━━━━━━━━━\n` +
        `⚔️ DMG: ${dmg.toLocaleString()}\n` +
        `🩸 +${bloodGain.toLocaleString()} Darah\n` +
        `📈 +${expGain} EXP`
      if (battleEffects.length) msg += `\n${battleEffects.join('\n')}`
      if (b.findItem > 0 && Math.random() < b.findItem) msg += `\n🎁 Dapet Item Tambahan!`
      if (b.regen > 0 || b.heal > 0) msg += `\n❤️ +${b.regen + b.heal} HP [Regen/Heal]`
      if (leveled) msg += `\n🎉 LEVEL UP! Lv.${csm.level}`
      if (rusak) msg += `\n💀 *${rusak}* HANCUR KENA DARAH IBLIS!`
      msg += partnerReaction(csm, 'win')
      await checkMakimaTrigger(m, csm, wdb)
      return m.reply(msg + `\n━━━━━━━━━━━`)
    }

    const LOSE_TEXT = [
      `💥 Salah gerak satu detik.\n\n${devil.emoji} *${devil.nama}* menghantam tubuhmu ke dinding. Kabur sebelum terlambat.`,
      `🩸 Tanganmu nyaris tidak bisa digerakkan.\n\n${devil.emoji} *${devil.nama}* terlalu dekat. Kamu mundur sambil menahan sakit.`,
      `⚠️ Ini bukan lawanmu hari ini.\n\n${devil.emoji} *${devil.nama}* terlalu besar dan terlalu cepat untuk ditahan.`,
      `🔪 Serangannya memotong jalan keluar.\n\nKamu dipaksa mundur sebelum ${devil.emoji} *${devil.nama}* mengambil kepalamu.`,
      `🚨 Sirene semakin dekat.\n\n${devil.emoji} *${devil.nama}* masih berdiri, dan kamu tidak punya waktu untuk mencoba lagi.`,
      `🌧️ Hujan membuat lantai licin.\n\nKamu jatuh, kehilangan posisi, lalu berlari sebelum ${devil.emoji} *${devil.nama}* menerkam.`,
      `⛓️ Kontrakmu terlambat merespons.\n\n${devil.emoji} *${devil.nama}* memanfaatkan celah itu untuk memaksamu kabur.`,
      `💀 Tubuhmu menolak serangan berikutnya.\n\nKamu gagal menjatuhkan ${devil.emoji} *${devil.nama}* dan hanya bisa menyelamatkan diri.`,
      `👁️ Kamu salah membaca gerakannya.\n\n${devil.emoji} *${devil.nama}* menyambutmu dengan serangan yang tidak sempat kamu hindari.`,
      `🏃 Tidak ada yang memalukan dari tetap hidup.\n\n${devil.emoji} *${devil.nama}* menang kali ini, jadi kamu memilih untuk mundur.`
    ]
    let loseMsg = LOSE_TEXT[Math.floor(Math.random() * LOSE_TEXT.length)]

    delete csm.tempMission
    saveDB(wdb)
    return m.reply(header('HAMPIR MATI') + loseMsg + `\n━━━━━━━━━━━\n❤️ -10 HP${partnerReaction(csm, 'lose')}\n━━━━━━━━━━━`)
  }

  // .csm mission run
  if (sub === 'run' && csm.tempMission) {
    let b = calcBonus(csm)
    let { devil } = csm.tempMission
    csm.health = Math.max(1, csm.health - 10)
    let stolen = Math.floor(devil.blood * 0.6 * b.bloodMult) + b.stealBlood
    csm.blood += stolen + b.bloodFlat

    let findItemMsg = ''
    if (b.findItem > 0 && Math.random() < b.findItem) findItemMsg = `\n🎁 Kamu nemu item pas kabur!`

    delete csm.tempMission
    saveDB(wdb)

    const RUN_TEXT = [
      `Kakiku bergerak lebih cepat daripada otakku. ${devil.nama} menghantam dinding tepat saat aku menyelip ke gang sebelah.\n\nAku berhasil membawa kabur ${stolen.toLocaleString()} Blood. Tidak heroik, tapi aku masih hidup.`,
      `Satu serangan nyaris membelah pintu besi di belakangku. Aku melempar sisa umpan, lalu lari tanpa menoleh.\n\nDari ${devil.nama}, aku sempat menguras ${stolen.toLocaleString()} Blood sebelum menghilang.`,
      `Aku tidak menang. Aku hanya cukup pintar untuk tahu kapan harus berhenti.\n\n${devil.nama} masih mengamuk di belakang, sementara ${stolen.toLocaleString()} Blood sudah aman di tanganku.`,
      `Sirene mulai terdengar dari ujung jalan. Kalau Public Safety datang, semua orang akan mengira ini salahku.\n\nAku kabur dari ${devil.nama} dengan ${stolen.toLocaleString()} Blood dan satu tulang rusuk yang masih utuh.`,
      `Pintu keluar ternyata terkunci. Aku menendangnya, gagal, lalu menendangnya lagi sambil berdoa pada Devil apa pun yang mau mendengar.\n\nAkhirnya aku lolos dari ${devil.nama} membawa ${stolen.toLocaleString()} Blood.`,
      `Aku menjatuhkan senjata, mematikan lampu, dan menahan napas di balik tumpukan kardus. ${devil.nama} lewat hanya beberapa langkah dari wajahku.\n\nBegitu aman, aku pergi membawa ${stolen.toLocaleString()} Blood.`,
      `Darah menetes dari lenganku, tapi bukan semuanya milikku. Aku memanfaatkan saat ${devil.nama} lengah lalu mundur sebelum keberuntungan habis.\n\nHasilnya: ${stolen.toLocaleString()} Blood dan kesempatan untuk kabur hidup-hidup.`,
      `Aku mencoba terlihat tenang. Gagal total. Bahkan langkahku terdengar seperti orang yang sedang dikejar utang.\n\nTetap saja, aku berhasil mencuri ${stolen.toLocaleString()} Blood dari ${devil.nama}.`,
      `Seseorang berteriak dari jalan utama dan mengalihkan perhatian ${devil.nama}. Aku tidak bertanya siapa dia. Aku hanya mengambil kesempatan itu.\n\n${stolen.toLocaleString()} Blood masuk inventory sebelum aku lenyap dari lokasi.`,
      `Jarak antara hidup dan mati ternyata cuma satu pintu yang bisa ditutup. Aku menutupnya tepat waktu, meski ${devil.nama} sempat merobek separuh kusennya.\n\nAku pulang dengan ${stolen.toLocaleString()} Blood.`
    ]
    let runMsg = RUN_TEXT[Math.floor(Math.random() * RUN_TEXT.length)]

    let msg = header('RETRIBUSI DITUNDA') + runMsg +
      `\n━━━━━━━━━━━\n❤️ -10 HP`
    msg += findItemMsg
    msg += partnerReaction(csm, 'run')
    await checkMakimaTrigger(m, csm, wdb)
    return m.reply(msg + `\n━━━━━━━━━━━`)
  }

  // .csm mission (generate new mission)
  let b = calcBonus(csm)
  let baseCooldown = 1200000
  let cooldown = baseCooldown - (b.stamina * 3000)
  if (cooldown < 60000) cooldown = 60000

  if (csm.lastMission && Date.now() - csm.lastMission < cooldown) {
    let sisa = Math.ceil((cooldown - (Date.now() - csm.lastMission)) / 1000)
    let menit = Math.floor(sisa / 60)
    let detik = sisa % 60
    return m.reply(header('COOLDOWN') + `|Tunggu ${menit}m ${detik}d lagi.\n|HQ belum kasih misi baru.\n|━━━━━━━━━━━`)
  }

  if (csm.health < 10) return m.reply(header('HP KURANG') + `|Butuh minimal 10 HP.\n|━━━━━━━━━━━`)
  if (!Array.isArray(csm.inventory) || !csm.inventory.length) csm.inventory = [{ nama: 'Fist', dur: 999 }]

  const MISSION_STORY = MISSION_STORIES.map(story => `🎯 ${story}`)
  const randomStory = MISSION_STORY[Math.floor(Math.random() * MISSION_STORY.length)]
  rememberSeen(csm, 'seenMissionStories', randomStory)

  const devil = DEVIL_LIST[Math.floor(Math.random() * DEVIL_LIST.length)]
  csm.lastSeenDevils[devil.nama] = Date.now()
  const weapon = csm.inventory[0] || { nama: 'Fist', dur: 999 }
  const weaponData = WEAPON_LIST.find(w => w.nama === weapon.nama) || WEAPON_LIST[0]
  const activePartners = csm.partners.filter(p => p.status === 'active')

  let dmg = Math.floor(Math.random() * 50) + csm.level * 10 + weaponData.dmg + b.dmg
  if (csm.devilContract === 'Chainsaw Devil' || b.autoTransform) dmg *= 2.5
  dmg += activePartners.reduce((total, partner) => total + getPartnerDamage(csm, partner), 0)
  dmg = Math.floor(dmg * b.dmgMultiplier)
  if (b.aoe > 0) dmg += Math.floor(dmg * (b.aoe / 100))
  if (b.fire > 0) dmg += b.fire
  if (b.water > 0) dmg += b.water
  if (b.burn > 0) dmg += b.burn
  if (b.pierce > 0) dmg += b.pierce
  if (b.bleed > 0) dmg += b.bleed

  if (Math.random() * 100 < b.critChance) dmg = Math.floor(dmg * (1.5 + b.critDmg))
  if (Math.random() * 100 < b.instantKill) dmg = devil.hp + 999
  if (b.craftWeapon > 0) dmg += b.craftWeapon * 10

  const devilHp = Math.floor(devil.hp * 0.7)

  let partnerHelp = ''
  if (activePartners.length > 0) {
    let p = activePartners[Math.floor(Math.random() * activePartners.length)]
    let ch = CHARACTER_LIST.find(c => c.nama === p.name)
    const dialogPartner = PARTNER_MISSION_DIALOGS
    partnerHelp = `\n${ch.emoji} *${p.name}*: "${dialogPartner[Math.floor(Math.random() * dialogPartner.length)]}"`
  }

  let msg = header('MISI DITERIMA') +
    `${randomStory}\n` +
    `|━━━━━━━━━━━\n\n` +
    `🎯 Target:\n` +
    `${devil.emoji} *${devil.nama}*\n\n` +
    `❤️ HP: ${devilHp.toLocaleString()}\n` +
    `⚔️ DMG Estimasi: ${dmg.toLocaleString()}\n`

  if (partnerHelp) {
    const partnerText = String(partnerHelp || '').replace(/^\s*\n?/, '').replace(/\n$/, '')
    const match = partnerText.match(/\*?(.*?)\*?:\s*"(.*)"$/)
    if (match) {
      const [, partnerName, reactionText] = match
      recordPartnerDialog(csm, partnerName, reactionText, 'mission', { source: 'mission' })
    }
    msg += `\n|━━━━━━━━━━━\n\n`
    msg += `${partnerHelp}\n`
  }

  if (b.findItem > 0) msg += `🎁 Chance Item: ${(b.findItem * 100).toFixed(0)}%\n`
  if (b.bloodFlat > 0) msg += `🩸 Bonus Blood: +${b.bloodFlat}\n`

  msg += `|━━━━━━━━━━━\n\n` +
    `⚔️ *.csm mission fight*\n` +
    `🏃 *.csm mission run*\n` +
    `|━━━━━━━━━━━`

  csm.tempMission = { devil, devilHp, dmg }
  csm.lastMission = Date.now()
  saveDB(wdb)

  return m.reply(msg)
}
