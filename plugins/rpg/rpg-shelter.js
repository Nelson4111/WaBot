import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import {
  addRpgMoney,
  compareRpgMoney,
  formatRpgMoney,
  parseRpgMoneyAmount,
  subtractRpgMoney
} from '../../lib/rpgMoney.js'
import { processPetNeglect } from '../../lib/rpgPetNeglect.js'
import { scaleDifficultyCooldown } from '../../lib/rpgDifficulty.js'
import { isPremiumUser } from './rpg-bank.js'
import { hargaBeli, jenisMasakan, masakanResep, normalizeMasakanKey, formatMasakanNama } from '../../lib/rpg-masakanData.js'
import { getHewan } from '../../lib/rpg-libternakData.js'
import { getShelterRetrieveFee, processLivestockNeglect, processShelterCrime, recordLivestockCare } from '../../lib/rpgShelter.js'
import {
  CHILD_RETRIEVE_ACCEPT_STORIES,
  CHILD_RETRIEVE_CHANCE,
  CHILD_RETRIEVE_REJECT_STORIES,
  RSHIP_COOLDOWN_NAMES
} from '../../lib/rpgRshipData.js'

const RETRIEVE_COOLDOWN = RSHIP_COOLDOWN_NAMES.shelterRetrieve[1]
const formatItemName = item => item.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
const formatResidentName = (resident, isPet = false, isLivestock = false) => {
  if (isLivestock) return getHewan(resident.type)?.nama || formatItemName(resident.type)
  return resident.nickname || resident.nama || formatItemName(resident.tipe || (isPet ? 'pet' : 'anak'))
}
const createRetrieveStory = (isPet, success, isLivestock = false) => {
  const stories = isLivestock
    ? success
      ? ['Hewan ternak kembali ke kandang setelah mengenali pemiliknya.', 'Petugas shelter memastikan ternakmu aman untuk dibawa pulang.']
      : ['Ternakmu belum siap kembali ke kandang dan tetap berada di shelter.', 'Hewan ternak masih perlu waktu sebelum bersedia pulang.']
    : isPet
    ? success
      ? ['Pet mengenalimu dan dengan senang hati pulang bersamamu.', 'Pet kembali percaya setelah melihatmu datang menjemputnya.']
      : ['Pet masih takut dan memilih tinggal lebih lama di shelter.', 'Pet belum siap pulang dan meminta waktu untuk memulihkan diri.']
    : success
      ? CHILD_RETRIEVE_ACCEPT_STORIES
      : CHILD_RETRIEVE_REJECT_STORIES
  return stories[Math.floor(Math.random() * stories.length)]
}

let handler = async (m, { text, usedPrefix }) => {
  const wdb = loadDB()
  const userData = getUserRPG(wdb, m.sender)
  const user = wdb.users?.[m.sender]?.rpg || userData?.rpg
  if (!user || userData?.isDummy) return m.reply('Ketik .adventure dulu buat daftar RPG.')

  if (!wdb.money) wdb.money = {}
  if (!Array.isArray(user.kids)) user.kids = []
  if (!Array.isArray(user.shelterKids)) user.shelterKids = []
  if (!Array.isArray(user.pets)) user.pets = []
  if (!Array.isArray(user.shelterPets)) user.shelterPets = []
  if (!Array.isArray(user.shelterLivestock)) user.shelterLivestock = []
  if (!user.ternak || typeof user.ternak !== 'object') user.ternak = {}
  if (!user.lastLivestockCareAt || typeof user.lastLivestockCareAt !== 'object') user.lastLivestockCareAt = {}
  if (!user.cooldown || typeof user.cooldown !== 'object') user.cooldown = {}
  if (!user.masakan || typeof user.masakan !== 'object') user.masakan = {}
  if (!wdb.shelter || typeof wdb.shelter !== 'object') {
    wdb.shelter = { totalValue: 0, money: 0, items: {}, donations: [] }
  }
  const shelter = wdb.shelter
  if (shelter.totalValue == null) shelter.totalValue = 0
  if (shelter.money == null) shelter.money = 0
  if (!shelter.items || typeof shelter.items !== 'object') shelter.items = {}
  if (!Array.isArray(shelter.donations)) shelter.donations = []

  const petNeglect = processPetNeglect(user)
  const livestockNeglect = processLivestockNeglect(user)
  if (!wdb.crime) wdb.crime = {}
  const shelterCrime = processShelterCrime(user, wdb.crime, m.sender)
  if (petNeglect.changed || livestockNeglect.changed || shelterCrime.changed) await saveDB(wdb)
  const args = String(text || '').trim().split(/\s+/).filter(Boolean)
  const action = (args[0] || 'list').toLowerCase()
  const allResidents = [
    ...user.shelterKids.map((resident, index) => ({ resident, isPet: false, index })),
    ...user.shelterPets.map((resident, index) => ({ resident, isPet: true, index })),
    ...user.shelterLivestock.map((resident, index) => ({ resident, isPet: false, isLivestock: true, index }))
  ]
  const getRetrieveCooldown = () => {
    const legacyCooldownKeys = Object.keys(user.cooldown)
      .filter(key => key.startsWith('shelterRetrieve') && /^\d+$/.test(key.slice('shelterRetrieve'.length)))
    const lastRetrieve = Math.max(0, ...['shelterRetrieve', ...legacyCooldownKeys]
      .map(key => Number(user.cooldown[key]) || 0))
    return scaleDifficultyCooldown(user, RETRIEVE_COOLDOWN) - (Date.now() - lastRetrieve)
  }
  const bringResidentHome = ({ resident, isPet, isLivestock, index }) => {
    const collection = isLivestock
      ? user.shelterLivestock
      : isPet ? user.shelterPets : user.shelterKids
    const residentIndex = collection.indexOf(resident)
    collection.splice(residentIndex >= 0 ? residentIndex : index, 1)
    delete resident.shelterStatus
    if (isLivestock) {
      user.ternak[resident.type] = (Number(user.ternak[resident.type]) || 0) + (Number(resident.count) || 1)
      recordLivestockCare(user, resident.type)
    } else if (isPet) {
      resident.energy = Math.max(50, Number(resident.energy) || 0)
      resident.happy = Math.max(50, Number(resident.happy) || 0)
      resident.dirty = Math.min(30, Number(resident.dirty) || 0)
      resident.lastNeedsUpdateAt = Date.now()
      delete resident.neglectStartedAt
      user.pets.push(resident)
    } else {
      resident.lastKidActivityAt = Date.now()
      resident.lastCaredAt = Date.now()
      resident.lastNeglectCheckAt = Date.now()
      user.kids.push(resident)
    }
  }

  if (action === 'list' || action === 'daftar') {
    const kids = user.shelterKids.map((child, index) =>
      `> *${index + 1}. ${child.nama || 'Anak'}* · ${child.shelterStatus?.reason === 'runaway' ? 'Kabur' : 'Hilang'}\n` +
      `> ↳ Biaya retrieve: Rp ${getShelterRetrieveFee(child).toLocaleString('id-ID')}\n` +
      `> ↳ Retrieve: ${usedPrefix}shelter retrieve anak ${index + 1}`
    )
    const pets = user.shelterPets.map((pet, index) => {
      const name = pet.nickname || formatItemName(pet.tipe || 'pet')
      const fee = getShelterRetrieveFee(pet)
      return `> *${index + 1}. ${name}* · Kabur (Lv.${Number(pet.level) || 1})\n` +
        `> ↳ Biaya retrieve: Rp ${fee.toLocaleString('id-ID')}\n` +
        `> ↳ Retrieve: ${usedPrefix}shelter retrieve pet ${index + 1}`
    })
    const livestock = user.shelterLivestock.map((animal, index) => {
      const data = getHewan(animal.type)
      const fee = getShelterRetrieveFee(animal, Date.now(), true)
      return `> *${index + 1}. ${data?.emoji || '🐾'} ${data?.nama || formatItemName(animal.type)}* ×${Number(animal.count) || 1} · Kabur\n` +
        `> ↳ Biaya retrieve: Rp ${fee.toLocaleString('id-ID')}\n` +
        `> ↳ Retrieve: ${usedPrefix}shelter retrieve ternak ${index + 1}`
    })
    const list = [
      `👶 *ANAK (${kids.length})*\n${kids.length ? kids.join('\n\n') : '> Tidak ada anak di shelter.'}`,
      `🐾 *PET (${pets.length})*\n${pets.length ? pets.join('\n\n') : '> Tidak ada pet di shelter.'}`,
      `🐄 *TERNAK (${user.shelterLivestock.reduce((total, animal) => total + (Number(animal.count) || 0), 0)})*\n${livestock.length ? livestock.join('\n\n') : '> Tidak ada hewan ternak di shelter.'}`
    ].join('\n\n')
    const recent = shelter.donations.slice(-5).reverse()
      .map(entry => `> ${entry.kind === 'money' ? '💵' : '🍽️'} ${entry.label} · nilai ${formatRpgMoney(entry.value)}`)
    return m.reply(
      `╭─❏「 🛟 AVELIA SHELTER 」❏\n` +
      `│ PUSAT PERLINDUNGAN & DONASI\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📋 *PENGHUNI SHELTER*\n` +
      `${list}\n\n` +
      `─━━━━━━━━━━━━━━─\n\n` +
      `💝 *TOTAL DONASI: ${formatRpgMoney(shelter.totalValue)}*\n` +
      `> Uang dan nilai makanan/minuman digabung.\n\n` +
      `${recent.length ? `🧾 *DONASI TERBARU*\n${recent.join('\n')}\n\n` : ''}` +
      `📌 *PERINTAH*\n` +
      `> ${usedPrefix}shelter retrieve <anak|pet|ternak> <no>\n` +
      `> ${usedPrefix}shelter retrieve ternak <no>\n` +
      `> ${usedPrefix}shelter all (Premium) — coba jemput semuanya\n` +
      `> ${usedPrefix}shelter donate <jumlah> / donate item <nama> <jumlah>\n` +
      `> ${usedPrefix}shelter stats\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (['retrieve', 'ambil', 'jemput', 'all'].includes(action)) {
    const selector = action === 'all' ? 'all' : (args[1] || '').toLowerCase()
    if (selector === 'all') {
      if (!isPremiumUser(m.sender, wdb)) {
        return m.reply(
          `╭─❏「 🛟 SHELTER ALL 」❏\n` +
          `│ 🔒 FITUR KHUSUS PREMIUM\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> ↳ Retrieve semua penghuni sekaligus hanya tersedia untuk pengguna premium.\n` +
          `> ↳ Gunakan ${usedPrefix}shelter retrieve <anak|pet> <no> untuk mencoba satu penghuni.\n\n` +
          `─━━━━━━━━━━━━━━─`
        )
      }
      if (!allResidents.length) return m.reply(`╭─❏「 🛟 SHELTER ALL 」❏\n│ TIDAK ADA PENGHUNI\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Tidak ada anak, pet, atau ternak yang perlu di-retrieve.\n\n─━━━━━━━━━━━━━━─`)

      const remaining = getRetrieveCooldown()
      if (remaining > 0) {
        return m.reply(`╭─❏「 ⏰ SHELTER ALL 」❏\n│ MASIH COOLDOWN\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Tunggu *${Math.ceil(remaining / 60000)} menit* sebelum mencoba retrieve lagi.\n\n─━━━━━━━━━━━━━━─`)
      }

      const totalFee = allResidents.reduce((total, entry) =>
        total + getShelterRetrieveFee(entry.resident, Date.now(), entry.isLivestock), 0)
      if (!Number.isSafeInteger(totalFee) || compareRpgMoney(wdb.money[m.sender] || 0, totalFee) < 0) {
        return m.reply(
          `╭─❏「 💸 SHELTER ALL 」❏\n` +
          `│ 💸 *BIAYA BELUM MENCUKUPI*\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> ↳ Total biaya mencoba retrieve semua penghuni: *Rp ${totalFee.toLocaleString('id-ID')}*.\n` +
          `> ↳ Saldo kamu: *${formatRpgMoney(wdb.money[m.sender] || 0)}*.\n` +
          `> ↳ Biaya dihitung per penghuni; hewan ternak dihitung per ekor.\n\n` +
          `─━━━━━━━━━━━━━━─`
        )
      }

      const now = Date.now()
      wdb.money[m.sender] = subtractRpgMoney(wdb.money[m.sender] || 0, totalFee)
      user.cooldown.shelterRetrieve = now
      const rescued = []
      const stayed = []
      for (const entry of allResidents) {
        const success = Math.random() < CHILD_RETRIEVE_CHANCE
        if (success) {
          bringResidentHome(entry)
          rescued.push(`${entry.isLivestock ? '🐄' : entry.isPet ? '🐾' : '👶'} ${formatResidentName(entry.resident, entry.isPet, entry.isLivestock)}`)
        } else {
          stayed.push(`${entry.isLivestock ? '🐄' : entry.isPet ? '🐾' : '👶'} ${formatResidentName(entry.resident, entry.isPet, entry.isLivestock)}`)
        }
      }
      await saveDB(wdb)
      return m.reply(
        `╭─❏「 🛟 SHELTER ALL 」❏\n` +
        `│ HASIL RETRIEVE PREMIUM\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `✅ *BERHASIL (${rescued.length})*\n${rescued.length ? rescued.map(name => `> ${name}`).join('\n') : '> Belum ada penghuni yang bersedia pulang.'}\n\n` +
        `💔 *MENOLAK (${stayed.length})*\n${stayed.length ? stayed.map(name => `> ${name}`).join('\n') : '> Semua penghuni bersedia pulang.'}\n\n` +
        `💸 *BIAYA RETRIEVE:* Rp ${totalFee.toLocaleString('id-ID')}\n` +
        `> ↳ Setiap penghuni memiliki peluang retrieve ${Math.round(CHILD_RETRIEVE_CHANCE * 100)}%; yang menolak tetap berada di shelter.\n` +
        `> ↳ Biaya tetap dikenakan untuk percobaan yang menolak.\n` +
        `> ↳ Cooldown retrieve berlaku 30 menit.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    const type = (args[1] || '').toLowerCase()
    const index = Number(args[2]) - 1
    const isPet = ['pet', 'pets'].includes(type)
    const isLivestock = ['ternak', 'livestock', 'hewan'].includes(type)
    const isChild = ['anak', 'child', 'children', 'kid'].includes(type)
    if ((!isPet && !isChild && !isLivestock) || !Number.isInteger(index) || index < 0) {
      return m.reply(`Format: *${usedPrefix}shelter retrieve <anak|pet|ternak> <no>*\nCek daftar dengan *${usedPrefix}shelter list*.`)
    }

    const collection = isLivestock ? user.shelterLivestock : isPet ? user.shelterPets : user.shelterKids
    const resident = collection[index]
    if (!resident) return m.reply(`Nomor ${isLivestock ? 'ternak' : isPet ? 'pet' : 'anak'} tidak valid. Cek *${usedPrefix}shelter list*.`)

    const remaining = getRetrieveCooldown()
    if (remaining > 0) {
      const minutes = Math.ceil(remaining / 60000)
      return m.reply(`⏰ Tunggu *${minutes} menit* sebelum mencoba retrieve lagi.`)
    }

    const retrieveFee = getShelterRetrieveFee(resident, Date.now(), isLivestock)
    if (!Number.isSafeInteger(retrieveFee) || compareRpgMoney(wdb.money[m.sender] || 0, retrieveFee) < 0) {
      return m.reply(
        `╭─❏「 💸 BIAYA RETRIEVE 」❏\n` +
        `│ 💸 *UANG TIDAK CUKUP*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Biaya retrieve: *Rp ${retrieveFee.toLocaleString('id-ID')}*.\n` +
        `> ↳ Saldo kamu: *${formatRpgMoney(wdb.money[m.sender] || 0)}*.\n` +
        `> ↳ Biaya meningkat Rp 100.000 per hari di shelter${isLivestock ? ' dan dihitung per ekor' : ''}.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    wdb.money[m.sender] = subtractRpgMoney(wdb.money[m.sender] || 0, retrieveFee)
    user.cooldown.shelterRetrieve = Date.now()
    const success = Math.random() < CHILD_RETRIEVE_CHANCE
    const story = createRetrieveStory(isPet, success, isLivestock)
    if (!success) {
      await saveDB(wdb)
      return m.reply(
        `╭─❏「 💔 RETRIEVE GAGAL 」❏\n` +
        `│ PENGHUNI BELUM MAU PULANG\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ${story}\n` +
        `> ↳ ${isLivestock ? 'Ternak' : isPet ? 'Pet' : 'Anak'} tetap berada di shelter.\n` +
        `> ↳ Biaya percobaan: Rp ${retrieveFee.toLocaleString('id-ID')}.\n` +
        `> ↳ Cooldown retrieve berlaku 30 menit.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    bringResidentHome({ resident, isPet, isLivestock, index })
    await saveDB(wdb)
    const displayName = formatResidentName(resident, isPet, isLivestock)
    return m.reply(
      `╭─❏「 💚 RETRIEVE BERHASIL 」❏\n` +
      `│ PENGHUNI BERSEDIA PULANG\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ${story}\n` +
      `> ↳ ${isLivestock ? '🐄' : isPet ? '🐾' : '👶'} *${displayName}${isLivestock ? ` ×${Number(resident.count) || 1}` : ''}* kembali ke rumah.\n` +
      `> ↳ Biaya retrieve: Rp ${retrieveFee.toLocaleString('id-ID')}.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (action === 'donate' || action === 'donasi') {
    const kind = (args[1] || '').toLowerCase()
    const isMoneyDonation = ['money', 'uang'].includes(kind) || (args.length === 2 && parseRpgMoneyAmount(args[1]) !== null)
    if (isMoneyDonation) {
      const amount = parseRpgMoneyAmount(['money', 'uang'].includes(kind) ? args[2] : args[1])
      if (amount === null || compareRpgMoney(amount, 0) <= 0) {
        return m.reply(`Format: *${usedPrefix}shelter donate <jumlah>* atau *${usedPrefix}shelter donate money <jumlah>*\nContoh: *${usedPrefix}shelter donate 1M*`)
      }
      if (compareRpgMoney(wdb.money[m.sender] || 0, amount) < 0) return m.reply(`Uang tidak cukup. Saldo kamu ${formatRpgMoney(wdb.money[m.sender] || 0)}.`)
      wdb.money[m.sender] = subtractRpgMoney(wdb.money[m.sender], amount)
      shelter.money = addRpgMoney(shelter.money, amount)
      shelter.totalValue = addRpgMoney(shelter.totalValue, amount)
      shelter.donations.push({
        donor: m.sender,
        kind: 'money',
        label: `Uang ${formatRpgMoney(amount)}`,
        value: amount,
        createdAt: Date.now()
      })
      await saveDB(wdb)
      return m.reply(`✅ Donasi uang berhasil dicatat.\n> ↳ Donasi: ${formatRpgMoney(amount)}\n> ↳ Total donasi Shelter: ${formatRpgMoney(shelter.totalValue)}`)
    }

    const quantity = Number(args[args.length - 1])
    const itemIntro = ['item', 'barang', 'makanan', 'minuman', 'food', 'drink'].includes(kind)
    const rawItem = args.slice(itemIntro ? 2 : 1, -1).join(' ')
    const item = normalizeMasakanKey(rawItem)
    const isFoodOrDrink = masakanResep[item] &&
      (jenisMasakan.makanan.includes(item) || jenisMasakan.minuman.includes(item))
    if (!isFoodOrDrink || !Number.isSafeInteger(quantity) || quantity <= 0) {
      return m.reply(
        `Format donasi makanan/minuman: *${usedPrefix}shelter donate item <nama> <jumlah>*\n` +
        `Contoh: *${usedPrefix}shelter donate item air_mineral 2*\n` +
        `Item diambil dari kulkas RPG dan nilainya mengikuti harga katalog restoran.`
      )
    }
    const available = Number(user.masakan[item]) || 0
    if (available < quantity) return m.reply(`Stok ${formatMasakanNama(item)} di kulkas tidak cukup (tersedia ${available}).`)

    const unitValue = Number(hargaBeli[item]?.harga) || 0
    const totalValue = unitValue * quantity
    if (!Number.isSafeInteger(totalValue) || totalValue <= 0) return m.reply('Nilai donasi item tidak valid.')
    user.masakan[item] = available - quantity
    shelter.items[item] = (Number(shelter.items[item]) || 0) + quantity
    shelter.totalValue = addRpgMoney(shelter.totalValue, totalValue)
    shelter.donations.push({
      donor: m.sender,
      kind: 'item',
      item,
      quantity,
      label: `${formatMasakanNama(item)} ×${quantity}`,
      value: totalValue,
      createdAt: Date.now()
    })
    await saveDB(wdb)
    return m.reply(
      `✅ Donasi makanan/minuman berhasil dicatat.\n` +
      `> ↳ ${formatMasakanNama(item)} ×${quantity} · nilai ${formatRpgMoney(totalValue)}\n` +
      `> ↳ Total donasi Shelter: ${formatRpgMoney(shelter.totalValue)}`
    )
  }

  if (action === 'stats' || action === 'donations' || action === 'riwayat') {
    const history = shelter.donations.slice(-20).reverse()
      .map((entry, index) => `${index + 1}. ${entry.label} · ${formatRpgMoney(entry.value)} · ${new Date(entry.createdAt).toLocaleString('id-ID')}`)
    return m.reply(
      `╭─❏「 🧾 DONASI AVELIA SHELTER 」❏\n` +
      `│ TOTAL NILAI: ${formatRpgMoney(shelter.totalValue)}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `💵 Dana: ${formatRpgMoney(shelter.money)}\n` +
      `🍽️ Stok makanan/minuman: ${Object.values(shelter.items).reduce((sum, amount) => sum + (Number(amount) || 0), 0)} item\n\n` +
      `${history.length ? history.join('\n') : 'Belum ada donasi.'}\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  return m.reply(
    `╭─❏「 🛟 AVELIA SHELTER 」❏\n` +
    `│ PERINTAH SHELTER\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ${usedPrefix}shelter list — daftar anak dan pet di shelter\n` +
    `> ${usedPrefix}shelter retrieve <anak|pet> <no> — jemput penghuni\n` +
    `> ${usedPrefix}shelter retrieve ternak <no> — jemput hewan ternak\n` +
    `> ${usedPrefix}shelter all — mencoba jemput semua penghuni (Premium)\n` +
    `> Biaya retrieve naik Rp 100.000 per hari; ternak dihitung per ekor.\n` +
    `> ${usedPrefix}shelter donate <jumlah> — donasi uang (mendukung suffix, mis. 1M)\n` +
    `> ${usedPrefix}shelter donate item <nama> <jumlah> — donasi makanan/minuman dari kulkas\n` +
    `> ${usedPrefix}shelter stats — total dan riwayat donasi\n\n` +
    `Nilai uang dan barang digabung dalam total donasi.\n\n─━━━━━━━━━━━━━━─`
  )
}

handler.help = ['shelter', 'shelter list', 'shelter retrieve <anak|pet|ternak> <no>', 'shelter all', 'shelter donate <jumlah>', 'shelter donate item <nama> <jumlah>', 'shelter stats']
handler.tags = ['rpg']
handler.command = ['shelter']
handler.group = true
export default handler
