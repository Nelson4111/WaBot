/**
 * CSM Story & Storylist Command Handler
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import {
  STORY_LIST, DEVIL_LIST, CSM_PICTURES
} from '../../../lib/rpg-libmyCSM.js'
import { header, getStoryPicture, sendCsmReply, checkMakimaTrigger } from '../lib/utils.js'
import {
  getPartnerLevel, addExp, damageWeapon, partnerReaction
} from '../lib/combat.js'

export async function handleStory(ctx) {
  const { m, conn, csm, wdb, args, usedPrefix } = ctx

  if (!csm.storyCooldown) csm.storyCooldown = {}
  const now = Date.now()
  const storyCooldown = 60 * 60 * 1000

  // ==========================================================
  // STORY REPLAY
  // ==========================================================
  if (args[1]?.toLowerCase() === 'replay' || args[2]?.toLowerCase() === 'replay') {
    const replayArgIndex = args[1]?.toLowerCase() === 'replay' ? 2 : 3
    const targetNo = parseInt(args[replayArgIndex], 10)

    if (!targetNo || isNaN(targetNo)) {
      return m.reply(
        header('FORMAT SALAH') +
        ` Contoh: *${usedPrefix}csm story replay 3*\n` +
        `|━━━━━━━━━━━`
      )
    }

    if (targetNo < 1 || targetNo >= csm.story) {
      return m.reply(
        header('GAGAL') +
        ` Arc ${targetNo} belum terbuka.\n` +
        ` Arc terjauh kamu: Arc ${csm.story}\n` +
        `|━━━━━━━━━━━`
      )
    }

    const story = STORY_LIST.find(s => s.no === targetNo)
    if (!story) {
      return m.reply(
        header('ARC TIDAK DITEMUKAN') +
        ` Arc ${targetNo} tidak tersedia.\n` +
        `|━━━━━━━━━━━`
      )
    }

    const lastUsed = csm.storyCooldown[targetNo] || 0
    if (now - lastUsed < storyCooldown) {
      const sisa = Math.ceil((storyCooldown - (now - lastUsed)) / 60000)
      return m.reply(
        header('COOLDOWN') +
        ` Arc ${targetNo} masih cooldown.\n` +
        ` Tunggu *${sisa} menit* lagi.\n` +
        `|━━━━━━━━━━━`
      )
    }

    if (csm.health < 50) {
      return m.reply(
        header('HP KURANG') +
        ` Butuh minimal *50 HP* untuk Story.\n` +
        ` HP kamu: *${csm.health}/${csm.maxHealth}*\n` +
        `|━━━━━━━━━━━`
      )
    }

    let winRate =
      0.20 +
      (csm.level * 0.015) +
      (csm.partners || [])
        .filter(p => p.status === 'active')
        .reduce((total, partner) => total + getPartnerLevel(csm, partner) * 0.02, 0)

    const resetPenalty = Math.min(0.30, (csm.resetCount || 0) * 0.025)
    winRate -= resetPenalty

    const endingCount = Array.isArray(csm.endingReward) ? csm.endingReward.length : 0
    const endingPenalty = Math.min(0.25, endingCount * 0.015)
    winRate -= endingPenalty

    winRate = Math.max(0.05, Math.min(0.90, winRate))
    const win = Math.random() < winRate

    const hpCost = Math.max(10, Math.floor(20 * (1 + Math.min(0.75, (csm.resetCount || 0) * 0.05))))
    csm.health = Math.max(1, csm.health - hpCost)

    const devil = DEVIL_LIST.find(d => d.nama === story.devil)
    const devilName = devil?.nama || story.devil
    const devilEmoji = devil?.emoji || '👹'

    const devilDialog = {
      'Zombie Devil': { win: ['Graaah... otak...', 'Aku... lapar... mati...'], lose: ['Gigit... makan kamu...', 'Join kami... jadi zombie...'] },
      'Bat Devil': { win: ['Meowy... aku gagal...', 'Darahmu... enak...'], lose: ['Serahkan jantungmu!', 'Kau bukan tandingan kami!'] },
      'Eternity Devil': { win: ['Tolong... hentikan...', 'Aku menyerah... keluarin aku...'], lose: ['Terjebak selamanya disini...', 'Waktumu akan habis...'] },
      'Katana Man': { win: ['Sial... Yakuza payah...', 'Ular... gagal...'], lose: ['Potong dia!', 'Kontrak Ular! Habisi!'] },
      'Bomb Devil': { win: ['Denji... maaf... aku bohong...', 'Meledak... bersamaku...'], lose: ['BOOM! Rasakan ini!', 'Kau tak akan menang!'] },
      'Quanxi': { win: ['Monster... semua monster...', 'Boneka... hancur...'], lose: ['Tembak dia!', 'Untuk jantung Chainsaw Man!'] },
      'Gun Devil': { win: ['*Bunyi tembakan jauh*... sial...', 'Satu tahun sia-sia...'], lose: ['DOR! DOR! DOR!', 'Jutaan nyawa untuk 1 tembakan!'] },
      'Control Devil': { win: ['Anjing... beraninya...', 'Pochita... kenapa...', 'Kau... memakanku...'], lose: ['Tunduk. Sekarang.', 'Kau milikku. Anjing yang baik.', 'Diam.'] },
      'Justice Devil': { win: ['Keadilan... gagal...', 'Ini tidak adil!'], lose: ['Hukum akan menghukummu!', 'Bersalah!'] },
      'Falling Devil': { win: ['Trauma... tidak cukup...', 'Jatuh... jatuh...'], lose: ['Rasakan keputusasaan!', 'Terbanglah ke langit!'] },
      'Fire Devil': { win: ['Gereja... gagal...', 'Terbakar... semua...'], lose: ['Bakar dia!', 'Untuk Chainsaw Man!'] },
      'Aging Devil': { win: ['Waktu... habis...', 'Tua... rapuh...'], lose: ['Menua... membusuk...', 'Kau tak bisa lari dari waktu.'] },
      'Barem Bridge': { win: ['Api unggun ini padam terlalu cepat...', 'Gereja kehilangan satu bidaknya.'], lose: ['Bakar semuanya!', 'Chainsaw Man akan datang!'] },
      'Prison Devil': { win: ['Sel ini... tidak bisa menahanku...', 'Kunci-kunci itu patah.'], lose: ['Tidak ada jalan keluar.', 'Kau akan tetap di sini selamanya.'] },
      'Chainsaw Devil': { win: ['Pochita... akhirnya...', 'Suara gergaji itu berhenti.'], lose: ['BRRRAAAK!', 'Jangan halangi Chainsaw Man!'] },
      default: { win: ['Aku kalah...', 'Sialan...'], lose: ['Mati kau!', 'Lemah!'] }
    }

    const quotes = devilDialog[devilName] || devilDialog.default
    const quotePool = win ? quotes.win : quotes.lose
    const devilQuote = quotePool[Math.floor(Math.random() * quotePool.length)]

    let efek = ''
    if (devilName === 'Control Devil') {
      efek = win
        ? '⛓️⛓️⛓️ *TRENGG!!!* ⛓️⛓️⛓️\nTanah Neraka bergetar... Rantai menembus tubuhnya...\n\n'
        : '⛓️⛓️⛓️ *DUARR!!!* ⛓️⛓️⛓️\nTekanan mengerikan! Lututmu melemah di hadapan Control Devil...\n\n'
    }

    if (win) {
      const expBase = 500 + (story.no * 100)
      const expReward = Math.floor(expBase * 0.5)
      csm.storyCooldown[targetNo] = now
      const rusak = damageWeapon(csm, 5, 1)
      const leveled = addExp(csm, expReward, m)
      saveDB(wdb)

      let msg = header(`📖 ${story.nama}`) +
        `✅ KEMENANGAN\n` +
        `🔁 MODE REPLAY | CD: 1 jam\n` +
        `|━━━━━━━━━━━\n\n` +
        `${efek}` +
        `${story.desc}\n\n` +
        `${devilEmoji} *${devilName}*: "${devilQuote}"\n\n` +
        `|━━━━━━━━━━━\n\n` +
        `❤️ HP: -${hpCost}\n` +
        `⚔️ Durability: -5\n` +
        `📈 +${expReward} EXP\n` +
        `🩸 Blood: Tidak berubah`

      if (leveled) msg += `\n🎉 LEVEL UP! Lv.${csm.level}`
      if (rusak) msg += `\n\n🔨 *${rusak}* RUSAK!`
      msg += `\n\n|━━━━━━━━━━━\n`
      msg += partnerReaction(csm, 'win')
      msg += `\n|━━━━━━━━━━━`

      await checkMakimaTrigger(m, csm, wdb)
      return sendCsmReply(conn, m, wdb, msg, getStoryPicture(devilName))
    }

    csm.storyCooldown[targetNo] = now
    saveDB(wdb)
    return sendCsmReply(
      conn, m, wdb,
      header('GAGAL') +
      `❌ KALAH\n` +
      `🔁 MODE REPLAY | CD: 1 jam\n` +
      `|━━━━━━━━━━━\n\n` +
      `${efek}` +
      `${story.desc}\n\n` +
      `${devilEmoji} *${devilName}*: "${devilQuote}"\n\n` +
      `|━━━━━━━━━━━\n\n` +
      `❤️ HP: -${hpCost}\n` +
      `🩸 Blood: Tidak berubah\n` +
      `|━━━━━━━━━━━\n\n` +
      partnerReaction(csm, 'lose') +
      `\n|━━━━━━━━━━━`,
      getStoryPicture(devilName)
    )
  }

  // ==========================================================
  // STORY NORMAL
  // ==========================================================
  if (now - csm.lastStory < storyCooldown) {
    const sisa = Math.ceil((storyCooldown - (now - csm.lastStory)) / 60000)
    return m.reply(
      header('COOLDOWN STORY') +
      ` Tunggu *${sisa} menit* lagi sebelum menjalankan story berikutnya.\n` +
      `|━━━━━━━━━━━`
    )
  }

  const story = STORY_LIST.find(s => s.no === csm.story)

  if (!story) {
    return sendCsmReply(
      conn, m, wdb,
      header('TAMAT') +
      ` Bab terakhir telah ditutup. Setelah pertarungan panjang melawan Chainsaw Devil, suara gergaji akhirnya menghilang dan kota menyisakan debu, luka, serta namamu di antara para penyintas.\n\n` +
      ` Kamu berdiri di ambang pagi yang baru. Tidak ada lagi arc yang menunggumu, hanya pilihan tentang kisah seperti apa yang akan dikenang dunia setelah semua ini.\n\n` +
      ` Pilih ending dengan *.csm ending* untuk menentukan takdirmu. Setelah dikonfirmasi, perjalanan akan dimulai lagi dari Arc 1, sementara pencapaian ending tetap menjadi bagian dari sejarahmu.\n` +
      `|━━━━━━━━━━━`,
      CSM_PICTURES.congratulations,
      true
    )
  }

  const bloodCost = 500 + (story.no * 200)

  if (csm.blood < bloodCost) {
    return m.reply(
      header('BLOOD KURANG') +
      ` Butuh *${bloodCost.toLocaleString()} Blood* untuk memulai Arc ini.\n` +
      ` 🩸 Blood kamu: *${csm.blood.toLocaleString()}*\n` +
      `|━━━━━━━━━━━`
    )
  }

  if (csm.health < 50) {
    return m.reply(
      header('HP KURANG') +
      ` Butuh minimal *50 HP* untuk Story.\n` +
      ` ❤️ HP kamu: *${csm.health}/${csm.maxHealth}*\n` +
      `|━━━━━━━━━━━`
    )
  }

  let winRate =
    0.20 +
    (csm.level * 0.015) +
    (csm.partners || [])
      .filter(p => p.status === 'active')
      .reduce((total, partner) => total + getPartnerLevel(csm, partner) * 0.02, 0)

  const resetPenalty = Math.min(0.50, (csm.resetCount || 0) * 0.05)
  const endingCount = Array.isArray(csm.endingReward) ? csm.endingReward.length : 0
  const endingPenalty = Math.min(0.30, endingCount * 0.03)

  winRate -= resetPenalty
  winRate -= endingPenalty
  winRate = Math.max(0.05, Math.min(0.90, winRate))
  const win = Math.random() < winRate

  const hpCost = Math.max(10, Math.floor(20 * (1 + Math.min(0.75, (csm.resetCount || 0) * 0.05))))
  csm.health = Math.max(1, csm.health - hpCost)
  csm.blood -= bloodCost
  csm.lastStory = now

  const devil = DEVIL_LIST.find(d => d.nama === story.devil)
  const devilName = devil?.nama || story.devil
  const devilEmoji = devil?.emoji || '👹'

  const devilDialog = {
    'Zombie Devil': { win: ['Graaah... otak...', 'Aku... lapar... mati...'], lose: ['Gigit... makan kamu...', 'Join kami... jadi zombie...'] },
    'Bat Devil': { win: ['Meowy... aku gagal...', 'Darahmu... enak...'], lose: ['Serahkan jantungmu!', 'Kau bukan tandingan kami!'] },
    'Eternity Devil': { win: ['Tolong... hentikan...', 'Aku menyerah... keluarin aku...'], lose: ['Terjebak selamanya disini...', 'Waktumu akan habis...'] },
    'Katana Man': { win: ['Sial... Yakuza payah...', 'Ular... gagal...'], lose: ['Potong dia!', 'Kontrak Ular! Habisi!'] },
    'Bomb Devil': { win: ['Denji... maaf... aku bohong...', 'Meledak... bersamaku...'], lose: ['BOOM! Rasakan ini!', 'Kau tak akan menang!'] },
    'Quanxi': { win: ['Monster... semua monster...', 'Boneka... hancur...'], lose: ['Tembak dia!', 'Untuk jantung Chainsaw Man!'] },
    'Gun Devil': { win: ['*Bunyi tembakan jauh*... sial...', 'Satu tahun sia-sia...'], lose: ['DOR! DOR! DOR!', 'Jutaan nyawa untuk 1 tembakan!'] },
    'Control Devil': { win: ['Anjing... beraninya...', 'Pochita... kenapa...', 'Kau... memakanku...'], lose: ['Tunduk. Sekarang.', 'Kau milikku. Anjing yang baik.', 'Diam.'] },
    'Justice Devil': { win: ['Keadilan... gagal...', 'Ini tidak adil!'], lose: ['Hukum akan menghukummu!', 'Bersalah!'] },
    'Falling Devil': { win: ['Trauma... tidak cukup...', 'Jatuh... jatuh...'], lose: ['Rasakan keputusasaan!', 'Terbanglah ke langit!'] },
    'Fire Devil': { win: ['Gereja... gagal...', 'Terbakar... semua...'], lose: ['Bakar dia!', 'Untuk Chainsaw Man!'] },
    'Aging Devil': { win: ['Waktu... habis...', 'Tua... rapuh...'], lose: ['Menua... membusuk...', 'Kau tak bisa lari dari waktu.'] },
    'Barem Bridge': { win: ['Api itu padam terlalu cepat...', 'Gereja kehilangan satu bidaknya.'], lose: ['Bakar semuanya!', 'Chainsaw Man akan datang!'] },
    'Prison Devil': { win: ['Sel ini... tidak bisa menahanku...', 'Kunci-kunci itu patah.'], lose: ['Tidak ada jalan keluar.', 'Kau akan tetap di sini selamanya.'] },
    'Chainsaw Devil': { win: ['Pochita... akhirnya...', 'Suara gergaji itu berhenti.'], lose: ['BRRRAAAK!', 'Jangan halangi Chainsaw Man!'] },
    default: { win: ['Aku kalah...', 'Sialan...'], lose: ['Mati kau!', 'Lemah!'] }
  }

  const quotes = devilDialog[devilName] || devilDialog.default
  const quotePool = win ? quotes.win : quotes.lose
  const devilQuote = quotePool[Math.floor(Math.random() * quotePool.length)]

  let efek = ''
  if (devilName === 'Control Devil') {
    efek = win
      ? '⛓️⛓️⛓️ *TRENGG!!!* ⛓️⛓️⛓️\nTanah Neraka bergetar... Rantai menembus tubuhnya...\n\n'
      : '⛓️⛓️⛓️ *DUARR!!!* ⛓️⛓️⛓️\nTekanan mengerikan! Lututmu melemah di hadapan Control Devil...\n\n'
  }

  if (win) {
    csm.story++
    const rusak = damageWeapon(csm, 5, 1)
    const expReward = 500 + (story.no * 100)
    const leveled = addExp(csm, expReward, m)
    saveDB(wdb)

    let msg = header(`📖 ${story.nama}`) +
      `✅ KEMENANGAN\n` +
      `|━━━━━━━━━━━\n\n` +
      `${efek}` +
      `${story.desc}\n\n` +
      `${devilEmoji} *${devilName}*: "${devilQuote}"\n\n` +
      `|━━━━━━━━━━━\n\n` +
      `❤️ HP: -${hpCost}\n` +
      `🩸 Blood: -${bloodCost.toLocaleString()}\n` +
      `⚔️ Durability: -5\n` +
      `📈 +${expReward} EXP`

    if (leveled) msg += `\n🎉 LEVEL UP! Lv.${csm.level}`
    if (rusak) msg += `\n\n🔨 *${rusak}* RUSAK!`
    msg += `\n\n|━━━━━━━━━━━\n`
    msg += partnerReaction(csm, 'win')
    msg += `\n\n|━━━━━━━━━━━\n`

    const nextStory = STORY_LIST.find(next => next.no === csm.story)
    msg += nextStory
      ? `➡️ Arc Berikutnya Terbuka\n👹 Devil berikutnya: *${nextStory.devil}*`
      : `🏁 Tidak ada Devil di arc berikutnya.`
    msg += `\n|━━━━━━━━━━━`

    await checkMakimaTrigger(m, csm, wdb)
    const storyPicture = getStoryPicture(devilName)

    if (csm.story > STORY_LIST.length) {
      await sendCsmReply(conn, m, wdb, msg, storyPicture)
      return sendCsmReply(
        conn, m, wdb,
        header('PERJALANAN SELESAI') +
        `Pertarungan terakhir berakhir, dan untuk beberapa detik kota terasa terlalu sunyi. Seluruh ${STORY_LIST.length} Arc telah kamu lewati; darah, keputusan, dan orang-orang yang berdiri di sisimu kini menjadi satu kisah yang tidak bisa diulang dengan cara yang sama.\n\n` +
        `Di hadapanmu terbuka tujuh pintu. Kamu boleh kembali menjelajah, tetapi bila ingin menutup bab ini dengan makna tertentu, pilih ending yang akan menentukan cerita berikutnya.\n` +
        `Gunakan *.csm ending <1-10>* untuk memilih ending.\n` +
        `━━━━━━━━━━━`,
        CSM_PICTURES.congratulations,
        true
      )
    }

    return sendCsmReply(conn, m, wdb, msg, storyPicture)
  }

  const bloodRefund = Math.floor(bloodCost * 0.5)
  csm.blood += bloodRefund
  saveDB(wdb)

  return sendCsmReply(
    conn, m, wdb,
    header('GAGAL') +
    `❌ KALAH\n` +
    `|━━━━━━━━━━━\n\n` +
    `${efek}` +
    `Kamu kalah melawan ${devilName}.\n\n` +
    `${devilEmoji} *${devilName}*: "${devilQuote}"\n\n` +
    `|━━━━━━━━━━━\n\n` +
    `❤️ HP: -${hpCost}\n` +
    `🩸 Blood: -${bloodCost.toLocaleString()}\n` +
    `🩸 Refund: +${bloodRefund.toLocaleString()} Blood\n` +
    `|━━━━━━━━━━━\n\n` +
    partnerReaction(csm, 'lose') +
    `\n|━━━━━━━━━━━`,
    getStoryPicture(devilName)
  )
}

export async function handleStoryList(ctx) {
  const { m, csm } = ctx
  const now = Date.now()

  let list =
    header('DAFTAR ARC') +
    `|Arc kamu: *Arc ${csm.story}*\n` +
    `|Replay: *.csm story replay [angka]*\n` +
    `|━━━━━━━━━━━\n\n`

  STORY_LIST.forEach(s => {
    const status = s.no < csm.story ? '✅' : s.no === csm.story ? '▶️' : '🔒'
    const bloodCost = 500 + (s.no * 200)
    const expReward = 500 + (s.no * 100)
    const expReplay = Math.floor(expReward * 0.5)
    const lastUsed = csm.storyCooldown?.[s.no] || 0
    const cdSisa = Math.ceil((60 * 60 * 1000 - (now - lastUsed)) / 60000)
    const cdText = (s.no < csm.story && cdSisa > 0) ? ` | ⏳${cdSisa}m` : ''

    list +=
      ` ${status} *${s.no}. ${s.nama}*${cdText}\n` +
      ` ${s.devil}\n` +
      ` 🩸 Blood: ${bloodCost.toLocaleString()}\n` +
      ` 📈 Reward: ${expReward} EXP\n` +
      ` 🔁 Replay: ${expReplay} EXP | 🩸0 | Gratis\n\n`
  })

  return m.reply(
    list +
    `|━━━━━━━━━━━\n` +
    `|*Note: Replay = 50% EXP & Gratis*`
  )
}
