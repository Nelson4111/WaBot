/**
 * CSM Contract Command Handler
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import {
  DEVIL_LIST, CONTRACT_PRICE, getContractMeta, CONTRACT_SCENES,
  CSM_PICTURES
} from '../../../lib/rpg-libmyCSM.js'
import { header, sendCsmReply } from '../lib/utils.js'
import { rememberSeen, partnerReaction } from '../lib/combat.js'

export async function handleContract(ctx) {
  const { m, conn, csm, wdb, args } = ctx

  if (!Array.isArray(csm.contractHistory)) csm.contractHistory = []
  if (!csm.contractPending) csm.contractPending = null
  if (typeof csm.contractExpire !== 'number') csm.contractExpire = 0
  if (typeof csm.lastGacha !== 'number') csm.lastGacha = 0

  let sub = args[1]?.toLowerCase()

  // CEK KONTRAK TRIAL EXPIRED
  if (csm.contractExpire > 0 && Date.now() > csm.contractExpire) {
    csm.devilContract = null
    csm.contractType = null
    csm.isTransform = false
    csm.contractExpire = 0
    csm.contractPending = null
    saveDB(wdb)
    return m.reply(
      header('KONTRAK HABIS') +
      `Kontrak trial 2 hari telah berakhir.\n` +
      `Kekuatan Devil telah meninggalkan tubuhmu.\n` +
      `━━━━━━━━━━━`
    )
  }

  // PROTEKSI FOUR HORSEMEN
  if (
    csm.erasureProtection?.startsWith('horsemen:') &&
    ['trial', 'deal', 'host', 'fiend', 'hybrid', 'devil'].includes(sub)
  ) {
    return m.reply(
      header('KONTRAK TERKUNCI') +
      `Kamu adalah bagian dari Four Horsemen dan tidak bisa membuat kontrak lain.\n` +
      `━━━━━━━━━━━`
    )
  }

  // INFO KONTRAK
  if (!sub) {
    let cap = header('INFORMASI KONTRAK')
    cap += `🩸 Darah: ${csm.blood.toLocaleString()}\n`
    cap += `━━━━━━━━━━━\n`

    if (!csm.devilContract) {
      cap += `Mode: 🧑 Manusia\n`
      cap += `Status: Belum Berkontrak\n`
    } else {
      const dv = DEVIL_LIST.find(d => d.nama === csm.devilContract)
      cap += `Tipe Kontrak: ${csm.contractType || 'devil'}\n`
      cap += `Mode: ${csm.isTransform ? '🧬 Transform Aktif' : '🧑 Tidak Transform'}\n`
      cap += `Status: ⛓️ ${dv?.emoji || '👹'} ${csm.devilContract} [${dv?.rank || '?'}]\n`

      if (csm.contractExpire > 0) {
        const sisa = Math.max(0, csm.contractExpire - Date.now())
        const hari = Math.floor(sisa / 86400000)
        const jam = Math.floor((sisa % 86400000) / 3600000)
        const menit = Math.floor((sisa % 3600000) / 60000)
        cap += `⏰ Sisa: ${hari} Hari ${jam} Jam ${menit} Menit\n`
      } else {
        cap += `⏰ Sisa: Permanen\n`
      }
    }

    cap += `━━━━━━━━━━━\n`
    cap += `*DAFTAR COMMAND*\n`
    cap += `> 1. .csm contract host - 5.000 Darah\n`
    cap += `> 2. .csm contract fiend - 10.000 Darah\n`
    cap += `> 3. .csm contract hybrid - 50.000 Darah\n`
    cap += `> 4. .csm contract devil - 100.000 Darah\n`
    cap += `> 5. .csm contract trial <angka> - Sewa Devil 2 Hari\n`
    cap += `> 6. .csm contract deal <angka> - Beli Devil Permanen\n`
    cap += `> 7. .csm contract list [info <angka/nama>]\n`
    cap += `> 8. .csm contract database\n`
    cap += `> 9. .csm contract history\n`
    cap += `━━━━━━━━━━━`

    return sendCsmReply(conn, m, wdb, cap, CSM_PICTURES.contract)
  }

  // CONTRACT HISTORY
  if (sub === 'history') {
    if (!Array.isArray(csm.contractHistory)) csm.contractHistory = []
    if (csm.contractHistory.length === 0) {
      return m.reply(header('RIWAYAT KONTRAK') + `Belum ada riwayat kontrak.\n━━━━━━━━━━━`)
    }

    const perPage = 10
    let page = parseInt(args[2], 10)
    if (isNaN(page) || page < 1) page = 1

    const totalHistory = csm.contractHistory.length
    const totalPage = Math.ceil(totalHistory / perPage)

    if (page > totalPage) {
      return m.reply(
        header('HALAMAN TIDAK ADA') +
        `Halaman ${page} tidak tersedia.\n` +
        `Total halaman: ${totalPage}\n` +
        `Gunakan: .csm contract history 1-${totalPage}\n` +
        `━━━━━━━━━━━`
      )
    }

    const historyReverse = [...csm.contractHistory].reverse()
    const start = (page - 1) * perPage
    const end = start + perPage
    const pageHistory = historyReverse.slice(start, end)

    let cap = header('RIWAYAT KONTRAK')
    pageHistory.forEach((c, i) => {
      const nomor = start + i + 1
      cap += `${nomor}. ${c}\n`
    })

    cap += `━━━━━━━━━━━\n`
    cap += `📖 Halaman: ${page}/${totalPage}\n`
    cap += `📜 Total History: ${totalHistory}\n`

    if (page < totalPage) cap += `\n➡️ .csm contract history ${page + 1}`
    if (page > 1) cap += `\n⬅️ .csm contract history ${page - 1}`
    cap += `\n━━━━━━━━━━━`

    return m.reply(cap)
  }

  // DATABASE
  if (sub === 'database') {
    let cap = header('DATABASE GLOBAL MONSTER')
    cap += `Daftar semua Devil yang tersedia untuk kontrak.\n\n`

    const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']
    ranks.forEach(rank => {
      const list = DEVIL_LIST.filter(d => d.rank === rank)
      if (!list.length) return
      cap += `*👹 ${rank} RANK*\n`
      cap += `|━━━━━━━━━━━\n`
      list.forEach(d => {
        const meta = getContractMeta(d) || {}
        const types = Array.isArray(meta.types) ? meta.types.join('/') : '-'
        cap += `${d.emoji} *${d.nama}*\n`
        cap += `> Tipe: ${d.tipe}\n`
        cap += `> Kontrak: ${types}\n`
        cap += `> Host: ${meta.canHost ? '✅' : '❌'} | Doll: ${meta.canDoll ? '✅' : '❌'}\n\n`
      })
    })

    cap += `|━━━━━━━━━━━\n`
    cap += `📌 .csm contract list\n`
    cap += `📌 .csm contract trial <angka> - 2 Hari\n`
    cap += `📌 .csm contract deal <angka> - Permanen\n`
    cap += `|━━━━━━━━━━━`

    return m.reply(cap)
  }

  // LIST MONSTER
  if (sub === 'list') {
    const nextArg = args[2]?.toLowerCase()

    if (nextArg === 'info') {
      const searchParam = args.slice(3).join(' ').trim()
      if (!searchParam) {
        return m.reply(header('ARGUMEN KURANG') + `Gunakan: .csm contract list info <angka/nama>\n━━━━━━━━━━━`)
      }

      const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']
      const sortedDb = [...DEVIL_LIST].sort((a, b) => ranks.indexOf(a.rank) - ranks.indexOf(b.rank))
      const idx = parseInt(searchParam, 10)
      let targetMonster = null

      if (!isNaN(idx) && idx >= 1 && idx <= sortedDb.length) {
        targetMonster = sortedDb[idx - 1]
      } else {
        targetMonster = DEVIL_LIST.find(d => d.nama.toLowerCase() === searchParam.toLowerCase())
      }

      if (!targetMonster) {
        return m.reply(header('TIDAK DITEMUKAN') + `Monster atau nomor tidak terdaftar dalam database.\n━━━━━━━━━━━`)
      }

      const meta = getContractMeta(targetMonster) || {}
      const rankPrice = {
        E: 200000, D: 225000, C: 300000, B: 450000,
        A: 700000, S: 1000000, SS: 1500000, SSS: 2500000
      }
      const dPrice = rankPrice[targetMonster.rank] || 200000
      const tPrice = Math.floor(dPrice * 0.5)
      const contractTypes = Array.isArray(meta.types) ? meta.types.join('/') : '-'

      let cap = header(`DETAIL: ${targetMonster.nama.toUpperCase()}`)
      cap += `${targetMonster.emoji} *${targetMonster.nama}*\n`
      cap += `> 👹 Tipe: ${targetMonster.tipe}\n`
      cap += `> ⭐ Rank: ${targetMonster.rank}\n`
      cap += `> ❤️ HP: ${targetMonster.hp} | ⚔️ DMG: ${targetMonster.dmg}\n`
      cap += `> 📈 Loot: +${targetMonster.exp} EXP | +${targetMonster.blood} Blood\n`
      cap += `> ⛓️ Kontrak: ${contractTypes}\n`
      cap += `> 🧍 Host: ${meta.canHost ? '✅ Bisa' : '❌ Tidak'}\n`
      cap += `> 🪆 Doll: ${meta.canDoll ? '✅ Bisa' : '❌ Tidak'}\n`
      cap += `|━━━━━━━━━━━\n`
      cap += `💰 Trial 2 Hari: ${tPrice.toLocaleString()} Darah\n`
      cap += `💳 Permanen: ${dPrice.toLocaleString()} Darah\n`
      cap += `|━━━━━━━━━━━\n`
      cap += `*📖 DESKRIPSI*\n`
      cap += `${targetMonster.desc || '-'}\n`
      cap += `|━━━━━━━━━━━`

      return m.reply(cap)
    }

    let cap = header('DAFTAR ALL MONSTER')
    cap += `Daftar semua Devil yang tersedia dalam sistem kontrak.\n\n`
    const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']
    let counter = 1

    ranks.forEach(rank => {
      const list = DEVIL_LIST.filter(d => d.rank === rank)
      if (!list.length) return
      cap += `*👹 ${rank} RANK*\n`
      cap += `|━━━━━━━━━━━\n`
      list.forEach(d => {
        cap += `${counter}. ${d.emoji} *${d.nama}*\n`
        counter++
      })
      cap += `\n`
    })

    cap += `|━━━━━━━━━━━\n`
    cap += `📌 INFO:\n`
    cap += `.csm contract list info <nomor/nama>\n`
    cap += `|━━━━━━━━━━━`

    return sendCsmReply(conn, m, wdb, cap, CSM_PICTURES.contract)
  }

  // TRIAL / DEAL confirmation choice
  if ((sub === 'trial' || sub === 'deal') && ['yes', 'terima', 'accept', 'no', 'tolak', 'reject'].includes((args[2] || '').toLowerCase())) {
    const choice = (args[2] || '').toLowerCase()
    if (['yes', 'terima', 'accept'].includes(choice)) {
      args[1] = 'yes'
      args.splice(2, 1)
      sub = 'yes'
    } else {
      args[1] = 'no'
      args.splice(2, 1)
      sub = 'no'
    }
  }

  if (sub === 'trial' || sub === 'deal') {
    if (['fiend', 'hybrid'].includes(csm.erasureProtection)) {
      return m.reply(
        header('KONTRAK TERBATAS') +
        `Perlindunganmu hanya mengizinkan kontrak ${csm.erasureProtection}. ` +
        `Trial/deal Devil tidak tersedia.\n` +
        `━━━━━━━━━━━`
      )
    }

    const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']
    const sortedDb = [...DEVIL_LIST].sort((a, b) => ranks.indexOf(a.rank) - ranks.indexOf(b.rank))
    const num = parseInt(args[2], 10)

    if (isNaN(num) || num < 1 || num > sortedDb.length) {
      return m.reply(
        header('ANGKA SALAH') +
        `.csm contract list\n` +
        `Pilih nomor index 1-${sortedDb.length}\n` +
        `━━━━━━━━━━━`
      )
    }

    const devil = sortedDb[num - 1]
    if (!devil) return m.reply(header('DEVIL ERROR') + `Data Devil tidak ditemukan.\n━━━━━━━━━━━`)

    const rankPrice = {
      E: 200000, D: 225000, C: 300000, B: 450000,
      A: 700000, S: 1000000, SS: 1500000, SSS: 2500000
    }
    let price = rankPrice[devil.rank] || 200000
    if (sub === 'trial') price = Math.floor(price * 0.5)

    if (csm.blood < price) {
      return m.reply(
        header('DARAH KURANG') +
        `Butuh ${price.toLocaleString()} Darah\n` +
        `Kamu punya: ${csm.blood.toLocaleString()} Darah\n` +
        `━━━━━━━━━━━`
      )
    }

    if (csm.contractPending) {
      const pendingAge = Date.now() - csm.contractPending.time
      if (pendingAge <= 60000) {
        return m.reply(
          header('MASIH MENUNGGU') +
          `Masih ada kontrak yang menunggu konfirmasi.\n` +
          `Ketik *.csm contract ${sub} yes/terima* atau *.csm contract ${sub} no/tolak*\n` +
          `━━━━━━━━━━━`
        )
      }
      csm.contractPending = null
    }

    csm.contractPending = {
      type: sub,
      devil: devil.nama,
      price: price,
      time: Date.now()
    }
    saveDB(wdb)

    const durasi = sub === 'trial' ? '2 Hari' : 'Permanen'
    let trialCap = header(`KONFIRMASI ${sub.toUpperCase()}`)
    trialCap += `${devil.emoji} *${devil.nama}* [${devil.rank}]\n`
    trialCap += `Harga: ${price.toLocaleString()} Darah\n`
    trialCap += `Durasi: ${durasi}\n\n`
    const contractScene = CONTRACT_SCENES[Math.floor(Math.random() * CONTRACT_SCENES.length)]
    rememberSeen(csm, 'seenContractScenes', contractScene)
    trialCap += `${contractScene}\n\n`
    trialCap += `Yakin ingin melakukan kontrak darah langsung dengan ${devil.nama}?\n\n`
    trialCap += `Ketik: *.csm contract ${sub} yes/terima* untuk menyetujui\n`
    trialCap += `Ketik: *.csm contract ${sub} no/tolak* untuk membatalkan\n`
    trialCap += `━━━━━━━━━━━`

    return sendCsmReply(conn, m, wdb, trialCap, CSM_PICTURES.contractScene)
  }

  // CONFIRM YES
  if (sub === 'yes') {
    if (!csm.contractPending) {
      return m.reply(header('TIDAK ADA KONTRAK') + `Tidak ada kontrak yang menunggu konfirmasi.\n━━━━━━━━━━━`)
    }

    if (Date.now() - csm.contractPending.time > 60000) {
      csm.contractPending = null
      saveDB(wdb)
      return m.reply(header('KEDALUWARSA') + `Konfirmasi kontrak sudah kedaluwarsa 1 menit.\n━━━━━━━━━━━`)
    }

    const data = csm.contractPending
    if (csm.blood < data.price) {
      csm.contractPending = null
      saveDB(wdb)
      return m.reply(
        header('DARAH KURANG') +
        `Darahmu tidak cukup untuk menyelesaikan kontrak.\n` +
        `Butuh: ${data.price.toLocaleString()} Darah\n` +
        `Punya: ${csm.blood.toLocaleString()} Darah\n` +
        `━━━━━━━━━━━`
      )
    }

    let devil = null
    if (data.type === 'gacha') {
      const contractType = data.contractType || data.rank || 'devil'
      let pool = DEVIL_LIST.filter(entity => {
        const meta = getContractMeta(entity) || {}
        const types = Array.isArray(meta.types) ? meta.types : []
        return types.includes(contractType)
      })

      if (contractType === 'host') {
        pool = pool.filter(entity => {
          const meta = getContractMeta(entity) || {}
          return meta.canHost === true
        })
      }

      if (!pool.length) {
        pool = DEVIL_LIST.filter(entity => entity.tipe === 'Fiend')
      }

      if (!pool.length) {
        csm.contractPending = null
        saveDB(wdb)
        return m.reply(header('GACHA ERROR') + `Tidak ada Devil yang tersedia untuk kontrak ini.\n━━━━━━━━━━━`)
      }

      devil = pool[Math.floor(Math.random() * pool.length)]
      csm.lastGacha = Date.now()
      csm.contractExpire = 0
    } else {
      devil = DEVIL_LIST.find(d => d.nama === data.devil)
      if (!devil) {
        csm.contractPending = null
        saveDB(wdb)
        return m.reply(header('DEVIL ERROR') + `Data Devil tidak ditemukan dalam database.\n━━━━━━━━━━━`)
      }
      if (data.type === 'trial') {
        csm.contractExpire = Date.now() + 172800000
      } else {
        csm.contractExpire = 0
      }
    }

    if (csm.devilContract) {
      csm.contractHistory.push(csm.devilContract)
    }

    csm.blood -= data.price
    csm.devilContract = devil.nama
    csm.contractType = data.type === 'gacha' ? (data.contractType || data.rank || 'devil') : 'devil'
    csm.dollContract = false
    csm.isTransform = true
    csm.contractPending = null
    saveDB(wdb)

    const sisa = csm.contractExpire > 0 ? `⏰ Durasi: 2 Hari\n` : `⏰ Durasi: Permanen\n`
    const titleMsg = data.type === 'gacha'
      ? `GACHA ${String(data.contractType || data.rank || 'DEVIL').toUpperCase()} BERHASIL`
      : `KONTRAK ${data.type.toUpperCase()} BERHASIL`

    const contractResponse = devil.tipe === 'Fiend'
      ? `${devil.emoji} ${devil.nama}: "Tubuh ini sekarang berbagi napas denganku. Jangan sia-siakan kekuatan ini."`
      : `${devil.emoji} ${devil.nama}: "Kontrak diterima. Setiap kekuatan punya harga, Hunter."`

    return sendCsmReply(
      conn, m, wdb,
      header(titleMsg) +
      `${devil.emoji} *${devil.nama}* [${devil.rank}]\n` +
      `-${data.price.toLocaleString()} Darah\n` +
      `${sisa}` +
      `✅ Auto Transform Aktif\n` +
      `Kalian kini resmi terikat perjanjian darah.\n\n` +
      `${contractResponse}\n` +
      partnerReaction(csm, 'neutral') +
      `━━━━━━━━━━━`, CSM_PICTURES.contractScene
    )
  }

  // CONFIRM NO
  if (sub === 'no') {
    if (!csm.contractPending) {
      return m.reply(header('TIDAK ADA KONTRAK') + `Tidak ada kontrak yang perlu dibatalkan.\n━━━━━━━━━━━`)
    }
    csm.contractPending = null
    saveDB(wdb)
    return m.reply(header('KONTRAK DIBATALKAN') + `Kamu mundur dari perjanjian darah.\n━━━━━━━━━━━`)
  }

  // DOLL CONTRACT RELEASE
  if (csm.dollContract && ['putus', 'release', 'lepas', 'break'].includes(sub)) {
    csm.dollContract = false
    csm.devilContract = null
    csm.contractType = null
    csm.isTransform = false
    saveDB(wdb)
    return m.reply(header('DOLL CONTRACT DIPUTUS') + `Benang yang mengikat tubuhmu akhirnya putus. Untuk beberapa detik, kamu masih bisa merasakan kehendak Doll Devil menarik tubuhmu kembali, tetapi suara itu perlahan menghilang.\n\nKamu kembali bebas memilih kontrak dan aktivitasmu. Gunakan *.csm contract* untuk membuat perjanjian baru.\n━━━━━━━━━━━`)
  }

  const type = sub
  if (!type || !['host', 'fiend', 'hybrid', 'devil'].includes(type)) {
    return m.reply(
      header('PENGGUNAAN KONTRAK') +
      `Pilih tipe kontrak untuk mendapatkan kekuatan Devil.\n\n` +
      `⛓️ *KONTRAK HOST*\n` +
      `> .csm contract host\n` +
      `> Harga: 5.000 Darah\n\n` +
      `🩸 *KONTRAK FIEND*\n` +
      `> .csm contract fiend\n` +
      `> Harga: 10.000 Darah\n\n` +
      `🔪 *KONTRAK HYBRID*\n` +
      `> .csm contract hybrid\n` +
      `> Harga: 50.000 Darah\n\n` +
      `👹 *KONTRAK DEVIL*\n` +
      `> .csm contract devil\n` +
      `> Harga: 100.000 Darah\n\n` +
      `|━━━━━━━━━━━\n` +
      `💰 *TRIAL CONTRACT*\n` +
      `> .csm contract trial <angka>\n` +
      `> Menyewa Devil selama 2 hari.\n\n` +
      `💳 *PERMANENT DEAL*\n` +
      `> .csm contract deal <angka>\n` +
      `> Membeli Devil secara permanen.\n\n` +
      `|━━━━━━━━━━━\n` +
      `📜 *DATABASE*\n` +
      `> .csm contract list\n` +
      `> .csm contract list info <angka/nama>\n` +
      `> .csm contract database\n` +
      `> .csm contract history\n\n` +
      `|━━━━━━━━━━━`
    )
  }

  if (csm.erasureProtection?.startsWith('horsemen:')) {
    return m.reply(header('KONTRAK TERKUNCI') + `Kamu adalah bagian dari Four Horsemen dan tidak bisa membuat kontrak lain.\n━━━━━━━━━━━`)
  }

  if (['fiend', 'hybrid'].includes(csm.erasureProtection) && type !== csm.erasureProtection) {
    return m.reply(header('KONTRAK TERBATAS') + `Perlindunganmu hanya mengizinkan kontrak ${csm.erasureProtection}.\n━━━━━━━━━━━`)
  }

  const cost = CONTRACT_PRICE[type]
  if (typeof cost !== 'number') {
    return m.reply(header('DATA KONTRAK ERROR') + `Harga kontrak ${type} tidak ditemukan.\n━━━━━━━━━━━`)
  }

  if (csm.blood < cost) {
    return m.reply(
      header('DARAH KURANG') +
      `Butuh ${cost.toLocaleString()} Darah untuk gacha ${type}.\n` +
      `Kamu punya: ${csm.blood.toLocaleString()} Darah\n` +
      `━━━━━━━━━━━`
    )
  }

  const lastGachaTime = csm.lastGacha || 0
  const cdLeft = 300000 - (Date.now() - lastGachaTime)
  if (cdLeft > 0) {
    const menit = Math.floor(cdLeft / 60000)
    const detik = Math.ceil((cdLeft % 60000) / 1000)
    return m.reply(header('COOLDOWN GACHA') + `Tunggu ${menit} menit ${detik} detik lagi sebelum melakukan gacha kembali.\n━━━━━━━━━━━`)
  }

  if (csm.contractPending) {
    const pendingAge = Date.now() - csm.contractPending.time
    if (pendingAge <= 60000) {
      return m.reply(header('MASIH MENUNGGU') + `Masih ada kontrak yang menunggu konfirmasi.\nKetik *.csm contract yes* atau *.csm contract no*\n━━━━━━━━━━━`)
    }
    csm.contractPending = null
  }

  csm.contractPending = {
    type: 'gacha',
    contractType: type,
    rank: type,
    price: cost,
    time: Date.now()
  }
  saveDB(wdb)

  const contractLabel = {
    host: 'Host Devil',
    fiend: 'Fiend',
    hybrid: 'Hybrid',
    devil: 'Devil Murni'
  }

  let gachaCap = header(`KONFIRMASI KONTRAK ${type.toUpperCase()}`)
  gachaCap += `Kamu akan membuat kontrak acak tipe ${contractLabel[type]}.\n`
  gachaCap += `Biaya Gacha: ${cost.toLocaleString()} Darah\n`
  gachaCap += `Durasi: Permanen\n\n`
  const contractScene = CONTRACT_SCENES[Math.floor(Math.random() * CONTRACT_SCENES.length)]
  rememberSeen(csm, 'seenContractScenes', contractScene)
  gachaCap += `${contractScene}\n\n`
  gachaCap += `Apakah kamu yakin ingin melanjutkan gacha acak ini?\n\n`
  gachaCap += `Ketik: *.csm contract yes* untuk lanjut\n`
  gachaCap += `Ketik: *.csm contract no* untuk batal\n`
  gachaCap += `━━━━━━━━━━━`

  return sendCsmReply(conn, m, wdb, gachaCap, CSM_PICTURES.contractScene)
}
