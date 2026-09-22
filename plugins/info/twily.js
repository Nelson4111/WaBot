import {
  TWILY_GENERATIONS,
  TWILY_GEN_DESCRIPTIONS,
  TWILY_ADMINS,
  TWILY_EX_ADMINS,
  TWILY_PARTNERS,
  TWILY_ML,
  TWILY_WW,
  TWILY_MC,
  TWILY_ROBLOX,
  TWILY_MUSIC,
  TWILY_PHOTO,
  TWILY_BIRTHDAYS,
  TWILY_PROFILES,
  TWILY_NEW_GEN,
  TWILY_CONCEPT,
  TWILY_COMEBACK,
  findTwilyMembers,
  findTwilySuggestions,
  formatTwilyGeneration,
  normalizeTwilyGeneration,
  parseTwilyBatchInput,
  saveTwilyGenerations,
  setTwilyNewGen,
  setTwilyConcept,
  setTwilyComeback
} from '../../lib/twilyGenData.js'

const introText = `
★───「 *𝗪𝗲𝗹𝗰𝗼𝗺𝗲* 」 ───★

𝐒𝐢𝐥𝐚𝐡𝐤𝐚𝐧 𝐢𝐧𝐭𝐫𝐨 𝐦𝐞𝐧𝐠𝐠𝐮𝐧𝐚𝐤𝐚𝐧 𝐟𝐨𝐫𝐦𝐚𝐭 𝐢𝐧𝐢 𝐝𝐚𝐧 𝐦𝐞𝐧𝐠𝐢𝐫𝐢𝐦𝐤𝐚𝐧 𝐟𝐨𝐭𝐨 𝐝𝐢𝐫𝐢 𝐬𝐞𝐧𝐝𝐢𝐫𝐢 (𝐨𝐩𝐬𝐢𝐨𝐧𝐚𝐥)

╭─❏「 👤 *𝐈𝐍𝐓𝐑𝐎 𝐂𝐀𝐑𝐃* 」❏
│
│👋 *𝐏𝐞𝐫𝐤𝐞𝐧𝐚𝐥𝐚𝐧 𝐃𝐢𝐫𝐢* ⎯´ˎ˗
├─━━━━━━━━━━━━━━─
│• 𝐍𝐚𝐦𝐚 : 𝐖𝐚𝐣𝐢𝐛
│• 𝐆𝐞𝐧𝐝𝐞𝐫 : -
│• 𝐅𝐫𝐨𝐦 : -
│• 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 : -
│• 𝐓𝐢𝐤𝐭𝐨𝐤 : -
│• 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲 : -
│• 𝐒𝐭𝐚𝐭𝐮𝐬 : 𝐒𝐢𝐧𝐠𝐥𝐞 / 𝐓𝐚𝐤𝐞𝐧
│• 𝐇𝐨𝐛𝐢 : -
│• 𝐆𝐚𝐦𝐞 𝐟𝐚𝐯𝐨𝐫𝐢𝐭 : -
│
│📩 𝐊𝐢𝐫𝐢𝐦 𝐢𝐧𝐭𝐫𝐨 𝐤𝐞
│ ↳ https://wa.me/6282228638623
├─━━━━━━━━━━━━━━─
│💬 𝐒𝐚𝐥𝐚𝐦 𝐤𝐞𝐧𝐚𝐥 𝐬𝐞𝐦𝐮𝐚𝐧𝐲𝐚!
│
│𝐆𝐮𝐧𝐚𝐤𝐚𝐧 - 𝐣𝐢𝐤𝐚 𝐩𝐫𝐢𝐯𝐚𝐬𝐢 😊
╰─━━「 *𝐓 𝐖 𝐈 𝐋 𝐘* 」━━─
`.trim()

const plainTwilyText = 'Udah cobain fitur TWILY belum? Ketik *.twily* untuk lihat fitur yang tersedia.'
const generationIntro = 'Gen adalah generasi anggota yang bergabung pada satu masa atau periode perjalanan Twily. Setiap gen punya cerita dan anggotanya masing-masing.'
const defaultComebackText = `yes, setelah sekian lama hiatus akhirnya kita mutusin buat comeback. karena banyak bet dari kalian yg kaga berhenti nyuruh gw (owner) buat balikin twily. jadi yaudah daripada kalian nunggu kelamaan lagi karena kesibukan gw, so here we are. twily is officially back.

tapi kali ini kita bikin sesimpel mungkin, cuma ada satu rules yang harus kalian turuti, yaitu no baperan. kita semua di sini udah gede, udah bukan bocah lagi yang dikit-dikit ngambek, dikit-dikit bawa perasaan, dikit-dikit keluar grup. kalau kaga bisa bedain mana bercanda mana serius, mending kaga usah masuk dari awal. paham kan maksud gw? woilah, udah gede masa hal simple kek gini aja kaga paham. harusnya paham sendiri mana yang sopan mana yang kaga tanpa harus gw jelasin. jadi kalau masih gak paham hal basic kek gini, berarti emang lu nya aja yang bermasalah. balik TK atau SD aja, biar sekolah dari awal lagi.

if u know mafia lu pasti paham, twily sekarang kayak gitu. it's not just a group concept, it's a family. di sini kaga ada yang paling atas dan gak ada yang paling bawah, semua sama rata. yang ada cuma loyalitas. lu respect ke twily, twily bakal terima lu dengan baik. kalau lu join cuma karena ikut-ikutan hype, mending jauh-jauh dah. tapi kalau lu join karena emang mau jadi bagian dari keluarga virtual kita, welcome home twiliess.

dan kita juga kaga lupa sama tujuan awal grup twily ini dibuat karena apa. kita ada bukan cuma buat seru-seruan doang, kita ada karena pengen jadi rumah or keluarga kedua buat kalian. tempat curhat, tempat paling nyaman buat cerita apa aja, and yang paling penting tempat yang kaga bakal bisa lu cari di mana-mana. kita bukan sebatas marga, clan, squad, ataupun grup random. sekali lu join, lu selamanya bakal jadi bagian dari keluarga twily.

twily is back and this time we don't play nice.`

const genLabel = generation => `Gen ${formatTwilyGeneration(generation)}`

function genList(generation) {
  const members = [...(TWILY_GENERATIONS[generation] || [])].sort((a, b) => a.localeCompare(b, 'id'))
  const description = TWILY_GEN_DESCRIPTIONS[generation]
  const descriptionText = description ? `\n> ${wrapText(description, 58).join('\n> ')}` : ''
  return `*${genLabel(generation)}*${descriptionText}\n\n${members.length ? members.map((name, index) => `${index + 1}. ${name}`).join('\n') : 'Belum ada nama.'}`
}

function wrapText(value, width = 42) {
  const words = String(value || '').split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  for (const word of words) {
    if (line && `${line} ${word}`.length > width) {
      lines.push(line)
      line = word
    } else {
      line = line ? `${line} ${word}` : word
    }
  }
  if (line) lines.push(line)
  return lines
}

function profileKey(jid) {
  return String(jid || '').replace(/:[^@]+(?=@)/, '')
}

const MONTH_NAMES = {
  1: 'Januari',
  2: 'Februari',
  3: 'Maret',
  4: 'April',
  5: 'Mei',
  6: 'Juni',
  7: 'Juli',
  8: 'Agustus',
  9: 'September',
  10: 'Oktober',
  11: 'November',
  12: 'Desember'
}

const PROFILE_MONTH_NAMES = {
  1: 'January',
  2: 'February',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December'
}

const PROFILE_ROLES = {
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
  'ex-admin': 'Ex-Admin',
  'verified member': 'Verified Member',
  'trusted member': 'Trusted Member',
  minor: 'Minor',
  member: 'Member'
}

const PROFILE_GENDERS = [
  ['male', 'Male'],
  ['female', 'Female'],
  ['non-binary', 'Non-binary'],
  ['intersex', 'Intersex'],
  ['transgender', 'Transgender'],
  ['agender', 'Agender'],
  ['bigender', 'Bigender'],
  ['genderfluid', 'Genderfluid'],
  ['genderqueer', 'Genderqueer'],
  ['pangender', 'Pangender'],
  ['two-spirit', 'Two-Spirit'],
  ['prefer not to say', 'Prefer not to say']
]

const PROFILE_GENDER_MAP = Object.fromEntries(PROFILE_GENDERS.map(([key, label]) => [key, label]))

function normalizeProfileGender(value) {
  return String(value || '').trim().toLowerCase().replace(/[_\s]+/g, '-')
}

function profileBirthdayText(value) {
  const [day, month] = String(value || '').split('-').map(Number)
  return Number.isInteger(day) && PROFILE_MONTH_NAMES[month]
    ? `${day} ${PROFILE_MONTH_NAMES[month]}`
    : null
}

function profileRoleText(value) {
  return PROFILE_ROLES[String(value || '').toLowerCase()] || null
}

function profileGenderText(value) {
  return PROFILE_GENDER_MAP[normalizeProfileGender(value)] || null
}

function profileGenText(value) {
  const labels = ['Zero', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
  const generation = Number(value)
  return Number.isInteger(generation) && generation >= 0 && generation <= 10 ? labels[generation] : null
}

function migrateProfile(profile) {
  let changed = false
  const romanToNumber = { zero: '0', i: '1', ii: '2', iii: '3', iv: '4', v: '5', vi: '6', vii: '7', viii: '8', ix: '9', x: '10' }

  if (profile.jabatan && !PROFILE_ROLES[String(profile.jabatan).toLowerCase()]) {
    delete profile.jabatan
    changed = true
  }
  if (profile.gender && !PROFILE_GENDER_MAP[normalizeProfileGender(profile.gender)]) {
    delete profile.gender
    changed = true
  }
  if (profile.status && !/^(single|\?\?|taken by .+)$/i.test(String(profile.status))) {
    delete profile.status
    changed = true
  }
  if (profile.gen !== undefined && profile.gen !== null && profile.gen !== '') {
    const normalizedGen = romanToNumber[String(profile.gen).trim().toLowerCase()] || String(profile.gen).trim()
    if (!/^(10|[0-9])$/.test(normalizedGen)) {
      delete profile.gen
      changed = true
    } else if (profile.gen !== normalizedGen) {
      profile.gen = normalizedGen
      changed = true
    }
  }
  return changed
}

const MONTH_ALIASES = {
  januari: 1,
  jan: 1,
  january: 1,
  february: 2,
  februari: 2,
  feb: 2,
  maret: 3,
  mar: 3,
  march: 3,
  april: 4,
  apr: 4,
  april: 4,
  mei: 5,
  may: 5,
  jun: 6,
  juni: 6,
  june: 6,
  juli: 7,
  jul: 7,
  july: 7,
  agustus: 8,
  agu: 8,
  ags: 8,
  august: 8,
  september: 9,
  sep: 9,
  sept: 9,
  october: 10,
  oktober: 10,
  okt: 10,
  november: 11,
  nov: 11,
  desember: 12,
  des: 12,
  dec: 12,
  december: 12,
  dic: 12
}

function normalizeBirthdayMonth(month) {
  if (month === null || month === undefined || month === '') return null
  if (/^\d+$/.test(String(month))) {
    const monthNumber = Number(month)
    if (monthNumber >= 1 && monthNumber <= 12) return monthNumber
    return null
  }

  const normalized = String(month).trim().toLowerCase().replace(/\./g, '')
  const mapped = MONTH_ALIASES[normalized]
  if (mapped) return mapped

  const monthText = normalized.replace(/\s+/g, '')
  return MONTH_ALIASES[monthText] ?? null
}

function normalizeBirthday(day, month) {
  const date = Number(day)
  const monthNumber = normalizeBirthdayMonth(month)
  if (!Number.isInteger(date) || !Number.isInteger(monthNumber) || date < 1 || date > 31 || monthNumber < 1 || monthNumber > 12) return null
  return `${String(date).padStart(2, '0')}-${String(monthNumber).padStart(2, '0')}`
}

function formatBirthdayDate(value) {
  const raw = String(value?.date || value || '')
  const [day, month] = raw.split('-').map(item => Number(item))
  if (!Number.isInteger(day) || !Number.isInteger(month) || day < 1 || day > 31 || month < 1 || month > 12) return raw
  return `${String(day).padStart(2, '0')} ${MONTH_NAMES[month] || month}`
}

function birthdayDate(value) {
  const [day, month] = String(value.date || value).split('-').map(Number)
  return { day, month }
}

function birthdayDistance(value, now = new Date()) {
  const { day, month } = birthdayDate(value)
  const currentYear = now.getFullYear()
  let date = new Date(currentYear, month - 1, day)
  const today = new Date(currentYear, now.getMonth(), now.getDate())
  if (date < today) date = new Date(currentYear + 1, month - 1, day)
  return date.getTime() - today.getTime()
}

function isPastBirthday(value, now = new Date()) {
  const { day, month } = birthdayDate(value)
  return month === now.getMonth() + 1 && day < now.getDate()
}

function formatBirthdayLine(value, now = new Date()) {
  const text = `${value.name} - ${formatBirthdayDate(value.date)}`
  return isPastBirthday(value, now) ? `~${text}~` : text
}

export function buildBirthdayMonthSummary(entries, now = new Date()) {
  const currentMonth = now.getMonth() + 1
  const monthEntries = entries.filter(([, value]) => birthdayDate(value).month === currentMonth)
  if (!monthEntries.length) return '• Tidak ada birthday bulan ini.'
  return monthEntries.map(([, value]) => `• ${formatBirthdayLine(value, now)}`).join('\n')
}

export function buildBirthdayMonthBlocks(entries, now = new Date()) {
  const monthGroups = new Map()
  for (const [, value] of entries) {
    const month = birthdayDate(value).month || now.getMonth() + 1
    if (!monthGroups.has(month)) monthGroups.set(month, [])
    monthGroups.get(month).push(value)
  }

  return [...monthGroups.entries()]
    .sort(([left], [right]) => left - right)
    .map(([month, items]) => {
      const sortedItems = [...items].sort((left, right) => {
        const leftDate = birthdayDate(left)
        const rightDate = birthdayDate(right)
        return leftDate.day - rightDate.day || String(left.name).localeCompare(String(right.name), 'id')
      })
      const title = `• ${MONTH_NAMES[month] || 'Bulan'} (${sortedItems.length} orang)`
      const lines = sortedItems.map(value => {
        const rawLine = `${String(birthdayDate(value).day).padStart(2, '0')}. ${value.name}`
        return isPastBirthday(value, now) ? `~${rawLine}~` : rawLine
      }).join('\n')
      return `${title}\n─━━━━━━━━━━━━━━─\n${lines}`
    })
    .join('\n\n')
}

function genOverview() {
  const generationOrder = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
  return Object.keys(TWILY_GENERATIONS).sort((a, b) => {
    return generationOrder.indexOf(a) - generationOrder.indexOf(b)
  })
    .map(generation => `${genLabel(generation)}: ${TWILY_GENERATIONS[generation].length} orang`)
    .join('\n')
}

function twilyTotal() {
  return Object.values(TWILY_GENERATIONS).reduce((total, members) => total + members.length, 0)
}

function listText(title, members) {
  const sorted = [...members].sort((a, b) => {
    const left = typeof a === 'string' ? a : a.name
    const right = typeof b === 'string' ? b : b.name
    return left.localeCompare(right, 'id')
  })
  return `│• ${title}\n${sorted.length ? sorted.map((item, index) => `│  ${index + 1}. ${typeof item === 'string' ? item : item.name}`).join('\n') : '│  Belum ada data.'}`
}

function twilyReminderMessage(date) {
  if (date.getMonth() === 10 && date.getDate() === 5) {
    return '🎉 Selamat Anniversary TWILY! Terima kasih sudah menjadi bagian dari perjalanan, cerita, dan keluarga TWILY. Semoga kebersamaan kita terus bertambah hangat, kuat, dan penuh kenangan indah. 🤍'
  }
  if (date.getDate() === 5) {
    return '💐 Happy Mensiversary TWILY! Terima kasih sudah terus menjaga kebersamaan dan menjadi bagian dari keluarga TWILY. Semoga bulan ini membawa lebih banyak cerita baik dan momen indah untuk kita semua. 🤍'
  }
  return null
}

function reminderKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function manageList(list, action, rawValue) {
  const value = rawValue.trim()
  if (!value) return 'EMPTY'
  if (action === 'add') {
    if (list.some(item => item.toLowerCase() === value.toLowerCase())) return 'DUPLICATE'
    list.push(value)
    return 'ADDED'
  }
  if (action === 'edit') {
    const [oldName, newName] = value.split('|').map(item => item.trim())
    if (!oldName || !newName) return 'INVALID_EDIT'
    const index = list.findIndex(item => item.toLowerCase() === oldName.toLowerCase())
    if (index < 0) return 'NOT_FOUND'
    list[index] = newName
    return 'EDITED'
  }
  const index = list.findIndex(item => item.toLowerCase() === value.toLowerCase())
  if (index < 0) return 'NOT_FOUND'
  if (['remove', 'del', 'delete', 'hapus'].includes(action)) {
    list.splice(index, 1)
    return 'REMOVED'
  }
  return 'UNKNOWN'
}

const helpText = `
╭─❏「 ✦ *𝗧𝗪𝗜𝗟𝗬 𝗙𝗜𝗧𝗨𝗥* 」❏
│
│• *twily* / *.twily*
│  Lihat fitur TWILY
│• *.twily intro*
│  Kirim intro khusus TWILY
│• *.twily info*
│  Informasi tentang TWILY
│• *.twily new* / *.twily comeback*
│  Kirim pesan comeback TWILY
│• *.twily new edit <teks>*
│  Edit pesan comeback, khusus admin
│• *.twily concept*
│  Lihat group concept TWILY
│• *.twily concept edit <teks>*
│  Edit group concept, khusus admin
│• *.twily tiktok*
│  Kirim akun TikTok TWILY
│• *.twily total*
│  Lihat total member di database
│• *.twily gen*
│  Lihat daftar generasi
│• *.twily gen I* sampai *.twily gen X*
│  Lihat anggota tiap generasi
│• *.twily gen <nama>*
│  Cek nama tersebut generasi berapa
│• *.twily gen add <nama1|nama2|dst> <gen>*
│  Tambah banyak anggota sekaligus, khusus admin
│• *.twily gen remove <nama1|nama2|dst> [gen]*
│  Hapus banyak anggota sekaligus, khusus admin
│• *.twily gen edit <n> <g> <n> <g>*
│  Edit nama atau generasi, khusus admin
│• *.twily admin add/remove/edit ...*
│  Atur pengurus Twily, khusus admin
│• *.twily adminex add/remove/edit ...*
│  Atur ex-pengurus Twily, khusus admin
│• *.twily partner add/remove/edit ...*
│  Atur partner Twily, khusus admin
│• *.twily newgen <berapa>*
│  Atur angka New-Gen, khusus admin
│• *.twily ml <teks ajakan>*
│  Tag semua anggota Twily yg main ML
│• *.twily ml list*
│  Lihat nama anggota ML
│• *.twily ml add/remove <nama> <tag/reply>*
│  Atur daftar ML, khusus admin
│• *.twily ww list*
│  Lihat daftar WW
│• *.twily ww add/remove <nama> <tag/reply>*
│  Atur daftar WW, khusus admin
│• *.twily konser/lyrics/lyric/lirik/bbc/bubblechat list*
│  Lihat daftar MUSIC
│• *.twily konser add/remove <nama> <tag/reply>*
│  Atur daftar MUSIC, khusus admin
│• *.twily jj/foto/kirfot list*
│  Lihat daftar PHOTO
│• *.twily jj add/remove <nama> <tag/reply>*
│  Atur daftar PHOTO, khusus admin
│• *.twily ww/konser/jj <teks custom>*
│  Tag anggota yang sudah masuk daftar
│• *.twily mc/roblox <teks custom>*
│  Tag anggota yang masuk daftar MC / Roblox
│• *.twily mc add/remove ...*
│  Atur daftar MC, khusus admin
│• *.twily roblox add/remove ...*
│  Atur daftar Roblox, khusus admin
│• *.twily birthday* / *.tw bday*
│  Lihat birthday bulan ini
│• *.twily birthday list* / *.tw bday list*
│  Lihat daftar birthday lengkap
│• *.twily birthday add/remove ...*
│  Atur daftar ulang tahun, khusus admin
│• *.twily me*
│  Lihat atau atur profil TWILY kamu
╰─━━━━━━━━━━━━━━─
`.trim()

let handler = async (m, { conn, text = '', isAdmin = false, isOwner = false }) => {
  const args = text.trim().split(/\s+/).filter(Boolean)
  let sub = (args.shift() || '').toLowerCase()
  if (sub === 'mobile' && args[0]?.toLowerCase() === 'legends') {
    args.shift()
    sub = 'mobile legends'
  }

  if (!sub) return m.reply(helpText)

  if (text.trim().toLowerCase() === 'info') {
    return m.reply(`
★───「 *𝗧𝗪𝗜𝗟𝗬 𝗜𝗡𝗙𝗢* 」───★

╭─❏「 👥 *𝗔𝗥𝗧𝗜 𝗧𝗪𝗜𝗟𝗬* 」❏
│
│ *TWILY* adalah singkatan dari
│ *Two And Family* atau
│ *Keluarga Kedua*
│
│ Kami berusaha menjadi keluarga
│ untuk kalian, tempat untuk saling
│ mengenal, berbagi, dan bertumbuh
│ bersama. 
╰─━━━━━━━━━━━━━━─

> Terima kasih sudah menjadi bagian
> dari keluarga kecil TWILY ♡

╭─❏「 ✦ *𝗧𝗘𝗡𝗧𝗔𝗡𝗚 𝗧𝗪𝗜𝗟𝗬* 」❏
│• Since 5 November 2021
│• Owner : *Eza*
│
${listText('Admin Twily', TWILY_ADMINS)}
│
${listText('Partner Twily', TWILY_PARTNERS)}
│
│• New-Gen : ${TWILY_NEW_GEN === 0 ? 'Zero' : TWILY_NEW_GEN}
│• Group concept : *${TWILY_CONCEPT}*
│• Tiktok 
│↳  https://www.tiktok.com/@twily.ofc 
│• Rules : *Baca deskripsi grup*
╰─━━━━━━━━━━━━━━─
❏ Ex Admin Twily
${TWILY_EX_ADMINS.length ? TWILY_EX_ADMINS.slice().sort((a, b) => a.localeCompare(b, 'id')).map((name, index) => `> ↳ ${index + 1}. ${name}`).join('\n') : '> ↳ Belum ada data.'}
`.trim())
  }

  if (sub === 'tiktok') return m.reply('🎵 TikTok TWILY:\nhttps://www.tiktok.com/@twily.ofc')

  if (sub === 'total') return m.reply(`Sejauh ini ada *${twilyTotal()} member* yang telah masuk ke database TWILY.`)

  if (sub === 'trust' || sub === 'trusted' || sub === 'verified') {
    const role = sub === 'verified' ? 'verified member' : 'trusted member'
    const members = Object.entries(TWILY_PROFILES)
      .filter(([, profile]) => String(profile.jabatan || '').toLowerCase() === role)
      .map(([jid, profile]) => ({ jid, name: profile.nama || conn.getName?.(jid) || jid.split('@')[0] }))
    if (!members.length) return m.reply(`❌ Belum ada anggota dengan jabatan *${profileRoleText(role)}*.`)

    const message = args.join(' ').trim()
    const label = profileRoleText(role)
    const text = `╭─❏「 ✦ ${label.toUpperCase()} 」❏
│ ${message || `Daftar ${label}`}
╰─━━━━━━━━━━━━━━─

${members.map(member => `• @${member.jid.split('@')[0]} - ${member.name}`).join('\n')}`
    return conn.sendMessage(m.chat, { text, mentions: members.map(member => member.jid) }, { quoted: m })
  }

  if (['birthday', 'bday'].includes(sub)) {
    let action = (args.shift() || '').toLowerCase()
    if (action === 'role') action = 'jabatan'
    const birthdayEntries = Object.entries(TWILY_BIRTHDAYS).sort(([, left], [, right]) => String(left.name).localeCompare(String(right.name), 'id'))
    const now = new Date()
    const currentMonth = now.getMonth() + 1

    if (!action) {
      if (!birthdayEntries.length) return m.reply('🎂 Belum ada data birthday TWILY.')
      if (sub === 'bday') {
        const monthLines = buildBirthdayMonthSummary(birthdayEntries, now)
        return m.reply(`╭─❏「 🎂 *𝗕𝗜𝗥𝗧𝗛𝗗𝗔𝗬 𝗧𝗪𝗜𝗟𝗬* 」❏
│• Total birthday: *${birthdayEntries.length}*
│• Bulan ini: *${MONTH_NAMES[currentMonth]}*
╰─━━━━━━━━━━━━━━─

╭─━━━━━━━━━━━━━━─
│• Birthday bulan ini:
╰─━━━━━━━━━━━━━━─
${monthLines}`)
      }

      const monthBlocks = buildBirthdayMonthBlocks(birthdayEntries, now)
      const monthEntries = birthdayEntries.filter(([, value]) => birthdayDate(value).month === currentMonth)
      const monthLines = monthEntries.length
        ? monthEntries.map(([, value]) => `• ${formatBirthdayLine(value, now)}`).join('\n')
        : '• Tidak ada birthday bulan ini.'
      return m.reply(`╭─❏「 🎂 *𝗕𝗜𝗥𝗧𝗛𝗗𝗔𝗬 𝗧𝗪𝗜𝗟𝗬* 」❏
│• Total birthday: *${birthdayEntries.length}*
╰─━━━━━━━━━━━━━━─

> Birthday dibagi per bulan, lalu diurutkan dari tanggal paling awal.

╭─━━━━━━━━━━━━━━─
│• Birthday bulan ini:
╰─━━━━━━━━━━━━━━─
${monthLines}

${monthBlocks}`)
    }

    if (['list', 'full', 'semua', 'all'].includes(action)) {
      if (!birthdayEntries.length) return m.reply('🎂 Belum ada data birthday TWILY.')
      return m.reply(`╭─❏「 🎂 *𝗕𝗜𝗥𝗧𝗛𝗗𝗔𝗬 𝗧𝗪𝗜𝗟𝗬* 」❏
│• Total birthday: *${birthdayEntries.length}*
╰─━━━━━━━━━━━━━━─

> Birthday dibagi per bulan, lalu diurutkan dari tanggal paling awal.

${buildBirthdayMonthBlocks(birthdayEntries, now)}`)
    }

    const birthdayQuery = [action, ...args].join(' ').trim()
    const birthdayMatch = birthdayEntries.filter(([, value]) => value.name.toLowerCase() === birthdayQuery.toLowerCase())
    if (!['add', 'remove', 'del', 'delete', 'hapus'].includes(action)) {
      if (birthdayMatch.length) {
        return m.reply(`╭─❏「 🎂 *𝗕𝗜𝗥𝗧𝗛𝗗𝗔𝗬 𝗧𝗪𝗜𝗟𝗬* 」❏
│ Nama: *${birthdayMatch[0][1].name}*
│ Tanggal: *${formatBirthdayDate(birthdayMatch[0][1].date)}*
╰─━━━━━━━━━━━━━━─`)
      }

      const suggestions = findTwilySuggestions(birthdayQuery).filter(name => birthdayEntries.some(([, value]) => value.name.toLowerCase() === name.toLowerCase()))
      const suggestionText = suggestions.length ? `\n\nMungkin maksud kamu:\n${suggestions.map(name => `• ${name}`).join('\n')}` : ''
      return m.reply(`❌ Nama *${birthdayQuery}* tidak ditemukan.${suggestionText}\n\nJika nama kamu masih tidak ditemukan, silakan tag admin untuk menambahkannya. Database birthday dimasukkan secara manual.`)
    }

    if (!m.isGroup || (!isAdmin && !isOwner)) return m.reply('❌ Pengaturan birthday hanya bisa digunakan admin grup.')
    if (action === 'add') {
      const month = args.pop()
      const day = args.pop()
      const name = args.join(' ').trim()
      const date = normalizeBirthday(day, month)
      if (!name || !date) return m.reply('❌ Format: `.twily birthday add <nama> <tanggal> <bulan>`\nContoh: `.twily birthday add Avelia 12 8` atau `.twily birthday add Avelia 12 Desember`')
      if (Object.values(TWILY_BIRTHDAYS).some(value => value.name.toLowerCase() === name.toLowerCase())) return m.reply(`❌ Birthday *${name}* sudah terdaftar.`)
      const birthdayKey = `${date}|${name.toLowerCase()}`
      TWILY_BIRTHDAYS[birthdayKey] = { name, date }
      saveTwilyGenerations()
      return m.reply(`✅ Birthday *${name}* ditambahkan pada *${formatBirthdayDate(date)}*.`)
    }

    if (['remove', 'del', 'delete', 'hapus'].includes(action)) {
      const name = args.join(' ').trim()
      const entry = Object.entries(TWILY_BIRTHDAYS).find(([, value]) => value.name.toLowerCase() === name.toLowerCase())
      if (!entry) return m.reply(`❌ Birthday *${name}* tidak ditemukan.`)
      delete TWILY_BIRTHDAYS[entry[0]]
      saveTwilyGenerations()
      return m.reply(`✅ Birthday *${entry[1].name}* berhasil dihapus.`)
    }
    return m.reply('❌ Gunakan `.twily birthday`, `.twily birthday add <nama> <tanggal> <bulan>`, atau `.twily birthday remove <nama>`.')
  }

  if (sub === 'me') {
    const key = profileKey(m.sender)
    const profile = TWILY_PROFILES[key] || (TWILY_PROFILES[key] = {})
    const profileMigrated = migrateProfile(profile)
    if (profileMigrated) saveTwilyGenerations()
    let action = (args.shift() || '').toLowerCase()
    if (action === 'role') action = 'jabatan'
    const automaticRole = isAdmin || isOwner ? 'Admin' : 'Member'
    const role = profileRoleText(profile.jabatan || automaticRole) || profileRoleText('member')
    if (!action) {
      const shownName = profile.nama || m.name || 'Belum diisi'
      const status = profile.status ? profile.status.replace(/^taken by /i, 'Taken by ') : 'Not set'
      const fromValue = profile.from || profile.askot || 'Not set'
      return m.reply(`╭─━━━━━━━━━━━━━━─╮
    │ *TWILY ME*
  │
  │ Name: ${shownName}
  │ Role: ${role}
  │ Birthday: ${profileBirthdayText(profile.birthday) || 'Not set'}
  │ Status: ${status}
  │ Gender: ${profileGenderText(profile.gender) || 'Not set'}
  │ Gen: ${profileGenText(profile.gen) || 'Not set'}
  │ From: ${fromValue}
  │ Hobby: ${profile.hobi || 'Not set'}
  │
  ╰─━━━━━━━━━━━━━━─`)
    }

    if (action === 'jabatan') {
      if (!isAdmin && !isOwner) return m.reply('❌ Pengaturan jabatan hanya bisa digunakan admin grup.')
      const target = m.mentionedJid?.[0] || m.quoted?.sender
      const choice = args.filter(value => !value.startsWith('@')).join(' ').trim()
      if (!target) return m.reply('❌ Tag atau reply orang yang ingin diubah jabatannya.')
      const targetKey = profileKey(target)
      const targetProfile = TWILY_PROFILES[targetKey] || (TWILY_PROFILES[targetKey] = {})
      const normalizedChoice = choice.toLowerCase()
      if (normalizedChoice === 'reset') delete targetProfile.jabatan
      else if (PROFILE_ROLES[normalizedChoice]) targetProfile.jabatan = PROFILE_ROLES[normalizedChoice]
      else return m.reply('❌ Role options: reset, Owner, Admin, Editor, Ex-Admin, Verified Member, Trusted Member, or Minor.')
      saveTwilyGenerations()
      return m.reply(`✅ Jabatan @${targetKey.split('@')[0]} berhasil ${targetProfile.jabatan ? `diubah menjadi *${targetProfile.jabatan}*` : 'di-reset ke jabatan otomatis'}.`)
    }

    if (action === 'birthday') {
      const date = normalizeBirthday(args[0], args[1])
      if (!date) return m.reply('❌ Format: `.twily me birthday <tanggal> <bulan>`\nContoh: `.twily me birthday 12 8`')
      profile.birthday = date
    } else if (action === 'gen') {
      const generation = args.join(' ').trim()
      if (!/^(10|[0-9])$/.test(generation)) return m.reply('❌ Gen must be a number from 0 to 10.')
      profile.gen = generation
    } else if (action === 'gender') {
      const value = args.join(' ').trim()
      const genderKey = normalizeProfileGender(value)
      if (!PROFILE_GENDER_MAP[genderKey]) return m.reply(`❌ Gender options: ${PROFILE_GENDERS.map(([, label]) => label).join(', ')}.`)
      profile.gender = PROFILE_GENDER_MAP[genderKey]
    } else if (action === 'status') {
      const value = args.join(' ').trim()
      const statusKey = value.toLowerCase()
      if (statusKey === 'single' || statusKey === '??') profile.status = statusKey === 'single' ? 'Single' : '??'
      else if (statusKey === 'taken' || statusKey.startsWith('taken ')) {
        const partner = value.replace(/^taken\s*/i, '').trim()
        if (!partner) return m.reply('❌ Format: `.twily me status Taken <name>`')
        profile.status = `Taken by ${partner}`
      } else return m.reply('❌ Status options: Single, Taken <name>, or ??.')
    } else if (['nama', 'name', 'askot', 'city', 'from', 'hobi', 'hobby', 'hobbies'].includes(action)) {
      const value = args.join(' ').trim()
      if (!value) return m.reply(`❌ Isi ${action} tidak boleh kosong.`)
      const field = { name: 'nama', city: 'from', from: 'from', askot: 'from', hobby: 'hobi', hobbies: 'hobi' }[action] || action
      profile[field] = value
    } else {
      return m.reply('❌ Fields: name, role, birthday, status, gender, gen, from, hobby.')
    }
    saveTwilyGenerations()
    return m.reply(`✅ Profil *${action}* berhasil diperbarui. Ketik *.twily me* untuk melihatnya.`)
  }

  const listConfig = {
    ml: { list: TWILY_ML, label: 'ML TWILY' },
    mole: { list: TWILY_ML, label: 'ML TWILY' },
    'mobile legends': { list: TWILY_ML, label: 'ML TWILY' },
    ww: { list: TWILY_WW, label: 'WW TWILY' },
    mc: { list: TWILY_MC, label: 'MC TWILY' },
    minecraft: { list: TWILY_MC, label: 'MC TWILY' },
    roblox: { list: TWILY_ROBLOX, label: 'ROBLOX TWILY' },
    konser: { list: TWILY_MUSIC, label: 'MUSIC TWILY' },
    lyrics: { list: TWILY_MUSIC, label: 'MUSIC TWILY' },
    lyric: { list: TWILY_MUSIC, label: 'MUSIC TWILY' },
    lirik: { list: TWILY_MUSIC, label: 'MUSIC TWILY' },
    bbc: { list: TWILY_MUSIC, label: 'MUSIC TWILY' },
    bubblechat: { list: TWILY_MUSIC, label: 'MUSIC TWILY' },
    jj: { list: TWILY_PHOTO, label: 'PHOTO TWILY' },
    foto: { list: TWILY_PHOTO, label: 'PHOTO TWILY' },
    kirfot: { list: TWILY_PHOTO, label: 'PHOTO TWILY' }
  }[sub]

  if (listConfig) {
    const targetList = listConfig.list
    const action = (args[0] || '').toLowerCase()
    const sortedMl = targetList
      .filter(item => typeof item !== 'string' && item.jid)
      .sort((a, b) => {
      const left = typeof a === 'string' ? a : a.name
      const right = typeof b === 'string' ? b : b.name
      return left.localeCompare(right, 'id')
      })

    if (action === 'list') {
      if (!sortedMl.length) return m.reply(`╭─❏「 📋 ${listConfig.label} 」❏\n╰─━━━━━━━━━━━━━━─\n\nDaftar masih kosong.`)
      const lines = sortedMl.map((item, index) => `${index + 1}. ${typeof item === 'string' ? item : item.name}`)
      return m.reply(`╭─❏「 📋 ${listConfig.label} 」❏\n╰─━━━━━━━━━━━━━━─\n\n${lines.join('\n')}`)
    }

    if (['add', 'remove', 'del', 'delete', 'hapus'].includes(action)) {
      if (!m.isGroup || (!isAdmin && !isOwner)) return m.reply('❌ Pengaturan daftar ML hanya bisa digunakan admin grup.')
      const target = m.mentionedJid?.[0] || m.quoted?.sender
      if (!target) return m.reply(`❌ Untuk add/remove ${listConfig.label}, tag orangnya atau reply pesannya.`)
      const nameArgs = args.slice(1).filter(value => !value.startsWith('@') && !value.includes('@s.whatsapp.net') && !value.includes('@lid'))
      const name = nameArgs.join(' ').trim()
      if (!name) return m.reply(`❌ Nama wajib diisi. Contoh: .twily ${sub} add Nama @tag`)
      const normalizedTarget = typeof conn?.decodeJid === 'function' ? conn.decodeJid(target) : target
      const index = targetList.findIndex(item => (typeof item === 'string' ? item : item.jid) === normalizedTarget)
      if (action === 'add') {
        if (index >= 0) return m.reply(`❌ *${name}* sudah ada di ${listConfig.label}.`)
        targetList.push({ name, jid: normalizedTarget })
        saveTwilyGenerations()
        return m.reply(`✅ *${name}* berhasil ditambahkan ke ${listConfig.label}.`)
      }
      if (index < 0) return m.reply(`❌ *${name}* tidak ditemukan di ${listConfig.label}.`)
      targetList.splice(index, 1)
      saveTwilyGenerations()
      return m.reply(`✅ *${name}* berhasil dihapus dari daftar ML.`)
    }

    const invitation = args.join(' ').trim()
    if (!invitation) return m.reply(`╭─❏「 📋 ${listConfig.label} 」❏\n╰─━━━━━━━━━━━━━━─\n\nGunakan:\n.twily ${sub} <teks custom>\n\nContoh:\n.twily ${sub} Yuk merapat sekarang!`)
    const mentionEntries = sortedMl
      .map(item => ({ name: typeof item === 'string' ? item : item.name, jid: typeof item === 'string' ? item : item.jid }))
      .filter(item => item.jid)
    const mentions = mentionEntries.map(item => item.jid)
    if (!mentions.length) return m.reply(`❌ Daftar ${listConfig.label} masih kosong.`)
    const memberLines = mentionEntries.map((item, index) => `${index + 1}. ${item.name} - @${item.jid.split('@')[0]}`)
    const body = [invitation, memberLines.join('\n')].filter(Boolean).join('\n\n')
    return conn.sendMessage(m.chat, { text: body, mentions }, { quoted: m })
  }

  if (sub === 'reminder') {
    if (!m.isGroup || (!isAdmin && !isOwner)) return m.reply('❌ Pengaturan reminder hanya bisa digunakan admin grup.')
    const action = (args[0] || '').toLowerCase()
    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
    if (!['enable', 'disable'].includes(action)) return m.reply('❌ Format: `.twily reminder enable` atau `.twily reminder disable`')
    global.db.data.chats[m.chat].twilyReminder = action === 'enable'
    await global.db.write?.().catch?.(() => {})
    return m.reply(action === 'enable' ? '✅ Reminder Mensiversary dan Anniversary TWILY diaktifkan.' : '✅ Reminder TWILY dinonaktifkan.')
  }

  if (sub === 'newgen') {
    if (!m.isGroup || (!isAdmin && !isOwner)) return m.reply('❌ Fitur newgen hanya bisa digunakan admin grup.')
    const value = Number(args[0])
    if (!Number.isInteger(value) || value < 0) return m.reply('❌ Format: `.twily newgen <angka>`\nContoh: `.twily newgen 10`')
    setTwilyNewGen(value)
    saveTwilyGenerations()
    return m.reply(`✅ New-Gen berhasil diubah menjadi *${value === 0 ? 'Zero' : value}*.`)
  }

  if (sub === 'new' || sub === 'comeback') {
    const action = (args.shift() || '').toLowerCase()
    if (action === 'edit') {
      if (!m.isGroup || (!isAdmin && !isOwner)) return m.reply('❌ Fitur edit comeback hanya bisa digunakan admin grup.')
      const value = args.join(' ').trim()
      if (!value) return m.reply('❌ Format: `.twily new edit <teks comeback>`')
      setTwilyComeback(value)
      saveTwilyGenerations()
      return m.reply('✅ Teks comeback berhasil diubah.')
    }
    return m.reply(TWILY_COMEBACK || defaultComebackText)
  }

  if (sub === 'concept') {
    const action = (args.shift() || '').toLowerCase()
    if (action !== 'edit') return m.reply(`Group concept TWILY: *${TWILY_CONCEPT}*\n\nGunakan: .twily concept edit <concept baru>`)
    if (!m.isGroup || (!isAdmin && !isOwner)) return m.reply('❌ Fitur edit concept hanya bisa digunakan admin grup.')
    const value = args.join(' ').trim()
    if (!value) return m.reply('❌ Format: `.twily concept edit <concept baru>`')
    setTwilyConcept(value)
    saveTwilyGenerations()
    return m.reply(`✅ Group concept berhasil diubah menjadi *${TWILY_CONCEPT}*.`)
  }

  if (['admin', 'adminex', 'partner'].includes(sub)) {
    if (!m.isGroup || (!isAdmin && !isOwner)) return m.reply('❌ Fitur ini hanya bisa digunakan admin grup.')

    let list = sub === 'admin' ? TWILY_ADMINS : sub === 'adminex' ? TWILY_EX_ADMINS : TWILY_PARTNERS
    let label = sub === 'admin' ? 'Admin Twily' : sub === 'adminex' ? 'Ex Admin Twily' : 'Partner Twily'
    let action = (args.shift() || '').toLowerCase()

    if (sub === 'admin' && ['ex', 'exadmin', 'ex-admin'].includes(action)) {
      list = TWILY_EX_ADMINS
      label = 'Ex Admin Twily'
      action = (args.shift() || '').toLowerCase()
    }

    if (!['add', 'remove', 'del', 'delete', 'hapus', 'edit'].includes(action)) {
      return m.reply(`❌ Format:\n.twily ${sub} add <nama>\n.twily ${sub} remove <nama>\n.twily ${sub} edit <nama lama> | <nama baru>`)
    }

    const value = args.join(' ')
    const result = manageList(list, action, value)
    if (result === 'EMPTY') return m.reply('❌ Nama wajib diisi.')
    if (result === 'DUPLICATE') return m.reply(`❌ Nama tersebut sudah ada di ${label}.`)
    if (result === 'NOT_FOUND') return m.reply(`❌ Data tidak ditemukan di ${label}.`)
    if (result === 'INVALID_EDIT') return m.reply('❌ Untuk edit gunakan pemisah `|`. Contoh: `.twily admin edit Nama Lama | Nama Baru`')
    if (result === 'UNKNOWN') return m.reply('❌ Aksi tidak dikenal.')

    saveTwilyGenerations()
    const resultText = result === 'ADDED' ? 'ditambahkan' : result === 'REMOVED' ? 'dihapus' : 'diedit'
    return m.reply(`✅ Data ${label} berhasil ${resultText}.`)
  }

  if (sub === 'gen') {
    const action = (args.shift() || '').trim()

    if (!action) {
      const introLines = wrapText(generationIntro, 58).map(line => `> ${line}`).join('\n')
      return m.reply(`╭─❏「 ✦ *𝗗𝗔𝗙𝗧𝗔𝗥 𝗚𝗘𝗡 𝗧𝗪𝗜𝗟𝗬* 」❏
│• Total semua anggota: *${twilyTotal()}*
╰─━━━━━━━━━━━━━━─

    ${introLines}

╭─━━━━━━━━━━━━━━─
${genOverview().split('\n').map(line => `│• ${line}`).join('\n')}
│
│ Tutorial cari nama:
│• *.twily gen <nama>*
╰─━━━━━━━━━━━━━━─╯`)
    }

    if (action.toLowerCase() === 'all') {
      return m.reply(`╭─❏「 ✦ *𝗦𝗘𝗠𝗨𝗔 𝗚𝗘𝗡 𝗧𝗪𝗜𝗟𝗬* 」❏\n╰─━━━━━━━━━━━━━━─\n\n${Object.keys(TWILY_GENERATIONS).map(generation => genList(generation)).join('\n\n────────────────────\n\n')}`)
    }

    if (action.toLowerCase() === 'add') {
      if (!m.isGroup || (!isAdmin && !isOwner)) return m.reply('❌ Fitur tambah gen hanya bisa digunakan admin grup.')

      const { names, generation } = parseTwilyBatchInput(args)
      if (!names.length || !generation || !Object.prototype.hasOwnProperty.call(TWILY_GENERATIONS, generation)) {
        return m.reply('❌ Format: `.twily gen add <nama1|nama2|dst> <gen>`\nContoh: `.twily gen add Budi|Ayu|Raka XI`')
      }

      const normalizedNames = [...new Set(names.map(name => name.replace(/\s+/g, ' ').trim()).filter(Boolean))]
      const duplicates = normalizedNames.filter(name => TWILY_GENERATIONS[generation].some(member => member.toLowerCase() === name.toLowerCase()))
      if (duplicates.length) {
        const firstDuplicate = duplicates[0]
        return m.reply(`❌ Nama *${firstDuplicate}* sudah ada di ${genLabel(generation)}. Beri pembeda pada namanya, misalnya *${firstDuplicate}1* atau gunakan nama lain.`)
      }

      TWILY_GENERATIONS[generation].push(...normalizedNames)
      saveTwilyGenerations()
      return m.reply(`✅ ${normalizedNames.map(name => `*${name}*`).join(', ')} berhasil ditambahkan ke ${genLabel(generation)}.`)
    }

    if (action.toLowerCase() === 'edit') {
      if (!m.isGroup || (!isAdmin && !isOwner)) return m.reply('❌ Fitur edit gen hanya bisa digunakan admin grup.')

      const generationIndexes = args
        .map((value, index) => ({ value, index, generation: normalizeTwilyGeneration(value) }))
        .filter(item => Object.prototype.hasOwnProperty.call(TWILY_GENERATIONS, item.generation))

      if (generationIndexes.length !== 2) {
        return m.reply('❌ Format: `.twily gen edit <nama lama> <gen lama> <nama baru> <gen baru>`\nContoh: `.twily gen edit Putri III Putri Baru 4`')
      }

      const oldGeneration = generationIndexes[0].generation
      const newGeneration = generationIndexes[1].generation
      const oldName = args.slice(0, generationIndexes[0].index).join(' ').trim()
      const newName = args.slice(generationIndexes[0].index + 1, generationIndexes[1].index).join(' ').trim()
      if (!oldName || !newName) return m.reply('❌ Nama lama dan nama baru wajib diisi.')

      const memberIndex = TWILY_GENERATIONS[oldGeneration].findIndex(member => member.toLowerCase() === oldName.toLowerCase())
      if (memberIndex < 0) return m.reply(`❌ Nama *${oldName}* tidak ditemukan di ${genLabel(oldGeneration)}.`)

      const duplicateTarget = TWILY_GENERATIONS[newGeneration].some((member, index) => {
        return !(oldGeneration === newGeneration && index === memberIndex) && member.toLowerCase() === newName.toLowerCase()
      })
      if (duplicateTarget) {
        return m.reply(`❌ Nama *${newName}* sudah ada di ${genLabel(newGeneration)}. Beri nama pembeda terlebih dahulu.`)
      }

      TWILY_GENERATIONS[oldGeneration].splice(memberIndex, 1)
      TWILY_GENERATIONS[newGeneration].push(newName)
      saveTwilyGenerations()
      return m.reply(`✅ Data berhasil diedit:\n*${oldName}* (${genLabel(oldGeneration)}) → *${newName}* (${genLabel(newGeneration)})`)
    }

    if (['remove', 'del', 'delete', 'hapus'].includes(action.toLowerCase())) {
      if (!m.isGroup || (!isAdmin && !isOwner)) return m.reply('❌ Fitur hapus gen hanya bisa digunakan admin grup.')

      const { names, generation: requestedGeneration } = parseTwilyBatchInput(args)
      if (!names.length) return m.reply('❌ Format: `.twily gen remove <nama1|nama2|dst> [gen]`\nContoh: `.twily gen remove Putri|Ayu III`')

      const missingNames = []
      const ambiguousNames = []
      const namesToRemove = []

      for (const name of names) {
        const found = findTwilyMembers(name)
        const candidates = requestedGeneration
          ? found.filter(item => item.generation === requestedGeneration)
          : found

        if (!candidates.length) {
          missingNames.push(name)
          continue
        }

        if (candidates.length > 1 && !requestedGeneration) {
          ambiguousNames.push({ name, generations: candidates.map(item => genLabel(item.generation)) })
          continue
        }

        const target = candidates[0]
        namesToRemove.push(target)
      }

      if (missingNames.length) {
        const detail = missingNames.map(name => `*${name}*`).join(', ')
        return m.reply(`❌ Nama ${detail} tidak ditemukan${requestedGeneration ? ` di ${genLabel(requestedGeneration)}` : ''}.`)
      }

      if (ambiguousNames.length) {
        const detail = ambiguousNames.map(item => `${item.name} (${item.generations.join(', ')})`).join('\n')
        return m.reply(`⚠️ Nama berikut ada di beberapa generasi:\n${detail}\n\nGunakan format: .twily gen remove ${ambiguousNames[0].name} <gen>`)
      }

      for (const target of namesToRemove) {
        const memberIndex = TWILY_GENERATIONS[target.generation].findIndex(member => member.toLowerCase() === target.name.toLowerCase())
        if (memberIndex >= 0) TWILY_GENERATIONS[target.generation].splice(memberIndex, 1)
      }

      saveTwilyGenerations()
      return m.reply(`✅ ${namesToRemove.map(item => `*${item.name}*`).join(', ')} berhasil dihapus${requestedGeneration ? ` dari ${genLabel(requestedGeneration)}` : ''}.`)
    }

    const generation = normalizeTwilyGeneration(action)
    if (Object.prototype.hasOwnProperty.call(TWILY_GENERATIONS, generation)) return m.reply(genList(generation))

    const found = findTwilyMembers([action, ...args].join(' '))
    if (!found.length) {
      const query = [action, ...args].join(' ')
      const suggestions = findTwilySuggestions(query)
      const suggestionText = suggestions.length ? `\n\nMungkin maksud kamu:\n${suggestions.map(name => `• ${name}`).join('\n')}` : ''
      return m.reply(`❌ Nama *${query}* tidak ditemukan.${suggestionText}\n\nJika nama kamu masih tidak ditemukan, silakan tag admin untuk menambahkannya. Database gen ini dimasukkan secara manual, jadi belum semuanya masuk.`)
    }
    return m.reply(`╭─❏「 ✦ *𝗛𝗔𝗦𝗜𝗟 𝗣𝗘𝗡𝗖𝗔𝗥𝗜𝗔𝗡* 」❏\n│ Nama: *${found[0].name}*\n│ Generasi: ${found.map(item => `*${genLabel(item.generation)}*`).join(', ')}\n╰─━━━━━━━━━━━━━━─`)
  }

  if (sub === 'intro') return m.reply(introText)
  if (sub === 'help' || sub === 'menu') return m.reply(helpText)
  return m.reply(helpText)
}

handler.command = /^(twily|tw)$/i

handler.before = async function (m, { match }) {
  if (match?.[0]) return false
  const text = m.text?.trim().toLowerCase()
  if (text !== 'twily' && text !== 'tw') return false
  await m.reply(plainTwilyText)
  return true
}

export default handler
