import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { EPIC_SAGAS, EPIC_IMAGES, EPIC_SONGS, EPIC_LYRICS, EPIC_QUIZZES, EPIC_GUESSES, EPIC_ALL_QUIZZES, EPIC_QUOTES, EPIC_CHARACTERS, EXTRA_CHARACTERS, ALL_CHARACTERS, GODS, EPIC_QUOTE_COUNT, EPIC_STORY_EVENTS, HADES_REVIVAL_TEXT, stringTheBowStories, oracleStories } from '../../lib/epicData.js'

const random = arr => arr[Math.floor(Math.random() * arr.length)]
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5)
const normalizeList = value => [...new Set(String(value || '').split(',').map(x => x.trim()).filter(Boolean))]
const cleanNumber = value => Number(String(value).replace(/[^\d.-]/g, '')) || 0
const prettyTime = ms => {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return `${hours}h ${minutes}m ${seconds}s`
}
const firstName = jid => {
  if (!jid) return 'kamu'
  if (typeof jid === 'object') jid = jid.jid || jid.id || jid.user || jid.sender || jid.number
  const out = String(jid).split('@')[0]
  return out || 'kamu'
}
const normalizeJid = value => {
  if (!value) return null
  if (typeof value === 'object') value = value.jid || value.id || value.user || value.sender || value.number
  const jid = String(value)
  if (jid.endsWith('@s.whatsapp.net') || jid.endsWith('@g.us')) return jid
  if (jid.endsWith('@lid')) return global.lids?.[jid] || global.db?.data?.lids?.[jid] || jid
  if (/^\d+$/.test(jid)) return `${jid}@s.whatsapp.net`
  return jid
}
const listText = (title, items) => `🎭 *EPIC MUSICAL*\n\n*${title}*\n\n${items.map((x, i) => `${i + 1}. ${x}`).join('\n')}`

const getEpic = db => {
  if (!db.epic) db.epic = {}
  if (!db.epic.profile) db.epic.profile = {}
  if (!db.epic.leaderboard) db.epic.leaderboard = []
  if (!db.epic.quiz) db.epic.quiz = {}
  if (!db.epic.quizLeaderboard) db.epic.quizLeaderboard = []
  if (db.data2 && db.data2.quiz && !db.epic.quiz?.__migrated) {
    db.epic.quiz = { ...db.data2.quiz, ...db.epic.quiz }
    db.epic.quiz.__migrated = true
    delete db.data2.quiz
    if (db.data2 && Object.keys(db.data2).length === 0) delete db.data2
  }
}

const getQuizData = (db, id) => {
  getEpic(db)
  if (!db.epic.quiz[id]) {
    db.epic.quiz[id] = {
      quizPoints: 0,
      correctAnswers: 0,
      totalAnswered: 0
    }
  }

  const data = db.epic.quiz[id]
  data.quizPoints = Math.max(0, Number(data.quizPoints || 0))
  data.correctAnswers = Math.max(0, Number(data.correctAnswers || 0))
  data.totalAnswered = Math.max(0, Number(data.totalAnswered || 0))
  return data
}

const getQuizLeaderboard = db => {
  getEpic(db)
  return Object.entries(db.epic.quiz || {})
    .filter(([user]) => user !== '__migrated')
    .map(([user, stats]) => ({ user, points: Number(stats.quizPoints || 0), correct: Number(stats.correctAnswers || 0), total: Number(stats.totalAnswered || 0) }))
    .sort((a, b) => b.points - a.points || b.correct - a.correct || b.total - a.total)
    .slice(0, 10)
}

const getProfile = (db, id) => {
  getEpic(db)
  if (!db.epic.profile[id]) {
    db.epic.profile[id] = {
      name: 'Belum diatur',
      saga: 'Belum dipilih',
      song: 'Belum dipilih',
      favoriteSagas: [],
      favoriteSongs: [],
      favoriteCharacters: [],
      favoriteGods: [],
      favoriteMonsters: [],
      chapters: [],
      divePoints: 0,
      quizPoints: 0,
      diveCooldownAt: 0,
      quizCurrent: null,
      story: null,
      storyWins: 0,
      storyLosses: 0,
      bestStoryRun: 'Belum ada'
    }
  }
  const profile = db.epic.profile[id]
  const quizData = getQuizData(db, id)
  profile.favoriteCharacters = Array.isArray(profile.favoriteCharacters) ? profile.favoriteCharacters : []
  profile.favoriteSagas = Array.isArray(profile.favoriteSagas) ? profile.favoriteSagas : (profile.saga && profile.saga !== 'Belum dipilih' ? [profile.saga] : [])
  profile.favoriteSongs = Array.isArray(profile.favoriteSongs) ? profile.favoriteSongs : (profile.song && profile.song !== 'Belum dipilih' ? [profile.song] : [])
  profile.favoriteGods = Array.isArray(profile.favoriteGods) ? profile.favoriteGods : []
  profile.favoriteMonsters = Array.isArray(profile.favoriteMonsters) ? profile.favoriteMonsters : []
  profile.chapters = Array.isArray(profile.chapters) ? profile.chapters : []
  profile.divePoints = Math.max(0, Number(profile.divePoints || 0))
  profile.quizPoints = Math.max(0, Number(profile.quizPoints || quizData.quizPoints || 0))
  quizData.quizPoints = profile.quizPoints
  profile.diveCooldownAt = Number(profile.diveCooldownAt || 0)
  profile.quizCurrent = profile.quizCurrent ?? null
  return profile
}

const isEpicAdmin = ctx => Boolean(ctx.isOwner)

const findSaga = input => {
  const n = Number(input)
  if (!Number.isNaN(n) && n > 0 && n <= EPIC_SAGAS.length) return EPIC_SAGAS[n - 1]
  const s = String(input || '').trim().toLowerCase()
  return EPIC_SAGAS.find(x => x.name.toLowerCase() === s || x.id.toLowerCase() === s) || null
}

const findSong = input => {
  const n = Number(input)
  if (!Number.isNaN(n) && n > 0 && n <= EPIC_SONGS.length) return EPIC_SONGS[n - 1]
  const s = String(input || '').trim().toLowerCase()
  return EPIC_SONGS.find(x => x.name.toLowerCase() === s || x.id.toLowerCase() === s) || null
}

const normalizeLyricsKey = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '')
const findLyrics = input => {
  const query = String(input || '').trim()
  const number = Number(query)
  const numberedSong = Number.isInteger(number) && number > 0 ? EPIC_SONGS[number - 1] : null
  if (numberedSong && EPIC_LYRICS[numberedSong.id]) return { song: numberedSong, lyric: EPIC_LYRICS[numberedSong.id] }

  const normalizedQuery = normalizeLyricsKey(query)
  if (!normalizedQuery) return null
  const entry = Object.entries(EPIC_LYRICS).find(([id, lyric]) => {
    const normalizedName = normalizeLyricsKey(lyric.name)
    return id === query.toLowerCase() || normalizedName === normalizedQuery || normalizedName.includes(normalizedQuery)
  })
  if (!entry) return null
  const song = EPIC_SONGS.find(item => item.id === entry[0])
  return song ? { song, lyric: entry[1] } : null
}

const findCharacter = input => {
  const n = Number(input)
  if (!Number.isNaN(n) && n > 0 && n <= ALL_CHARACTERS.length) return ALL_CHARACTERS[n - 1]
  const s = String(input || '').trim().toLowerCase()
  return ALL_CHARACTERS.find(x => x.name.toLowerCase() === s || x.id.toLowerCase() === s) || null
}
const findCharactersByType = (value, type) => normalizeList(value).map(input => findCharacter(input)).filter(character => {
  if (!character) return false
  if (type === 'monster') return character.isMonster
  if (type === 'god') return GODS.includes(character.name)
  return ['Humans & Ithaca', 'Trojan War', 'Underworld Souls', 'Extra Suitors', 'Suitors'].includes(character.category)
})
const appendFavorite = (list, value) => list.includes(value) ? false : (list.push(value), true)
const removeFavorite = (list, value) => {
  const index = list.indexOf(value)
  if (index < 0) return false
  list.splice(index, 1)
  return true
}

const framedList = (title, rows) => `╭❖─ *${title}* ─❖╮\n\n${rows.join('\n')}\n\n╰❖─ *EPIC MUSICAL* ─❖╯`
const framedDetail = (title, body) => `╭❖─ *${title}* ─❖╮\n\n${body}\n\n╰❖─ *EPIC MUSICAL* ─❖╯`
const epicImageFor = (sagaName, isSong = false) => {
  const imageName = sagaName.replace(/^The\s+/i, '').trim() + (isSong ? ' Song' : '')
  return EPIC_IMAGES.find(image => image.name.toLowerCase() === imageName.toLowerCase())?.url || null
}
const sendEpicImage = async (m, ctx, imageUrl, caption) => {
  if (imageUrl && ctx.conn?.sendMessage) {
    return ctx.conn.sendMessage(m.chat, { image: { url: imageUrl }, caption }, { quoted: m })
  }
  return m.reply(caption)
}
const sagaListText = () => framedList('EPIC SAGAS', EPIC_SAGAS.map((saga, i) => `${i + 1}. ${saga.name}`))
const songListText = () => framedList('EPIC SONGS', EPIC_SONGS.map((song, i) => `${i + 1}. ${song.name}`))
const characterListText = (type = 'all') => {
  if (type === 'only') {
    return framedList('EPIC MAIN CHARACTERS', [
      '📚 Daftar utama dari EPIC: The Musical.',
      ...EPIC_CHARACTERS.map((ch, i) => `${i + 1}. ${ch.name}`)
    ])
  }
  if (type === 'extra') {
    return framedList('EPIC EXTRA CHARACTERS', [
      '🌌 Karakter tambahan dari mitologi Yunani dan dunia yang lebih luas.',
      ...EXTRA_CHARACTERS.map((ch, i) => `${i + 1}. ${ch.name}`)
    ])
  }
  return framedList('EPIC ALL CHARACTERS', [
    '🌌 EPIC diperluas dengan karakter mitologi Yunani di luar album utama.',
    '*MAIN CHARACTERS*',
    ...EPIC_CHARACTERS.map((ch, i) => `${i + 1}. ${ch.name}`),
    '*EXTRA CHARACTERS*',
    ...EXTRA_CHARACTERS.map((ch, i) => `${EPIC_CHARACTERS.length + i + 1}. ${ch.name}`)
  ])
}
const charDetailText = ch => framedDetail('CHARACTER DETAIL', `⚔️ *${ch.name}*\n\n🧭 Kategori: ${ch.category}\n📌 Role: ${ch.role}\n${ch.isMonster ? '☠️ Status: Monster' : '✨ Status: Character'}`)

const epicCreateQueue = members => {
  const songs = shuffle(EPIC_SONGS.map(x => x.name))
  return shuffle(members).map((user, i) => ({ user, song: songs[i % songs.length] }))
}

const epicVoiceStatus = room => {
  const memberText = room.members.map(u => `${room.finished.includes(u) ? '✅' : room.skipped && room.skipped.includes(u) ? '⏭️' : '⏳'} @${u.split('@')[0]}`).join('\n')
  let text = `🎤 *EPIC VOICE ROOM*\n\n👑 Host: @${room.host.split('@')[0]}\n👥 Member: ${room.members.length}\n\n${memberText}`
  if (room.started) {
    text += `\n\n🎶 Progress: ${room.finished.length}/${room.members.length}`
    if (room.current) text += `\n\n🎤 Sekarang: @${room.current.user.split('@')[0]}\n🎵 Lagu: ${room.current.song}`
  } else {
    text += '\n\n⚪ Status: Menunggu start'
  }
  return text
}

const getWhatIfTarget = (m, args = [], ctx = {}) => {
  const contextInfo = m.message?.extendedTextMessage?.contextInfo || m.msg?.contextInfo || m.contextInfo || {}
  const mentionedSources = [m.mentionedJid, m.mentionedJids, ctx.mentionedJid, ctx.mentionedJids, contextInfo.mentionedJid]
  const mentioned = mentionedSources.find(source => Array.isArray(source) && source.length)
    || mentionedSources.find(source => source && !Array.isArray(source))
    || []
  if (mentioned.length) return normalizeJid(Array.isArray(mentioned) ? mentioned[0] : mentioned)
  if (m.quoted?.sender) return normalizeJid(m.quoted.sender)
  if (contextInfo.participant) return normalizeJid(contextInfo.participant)
  const rawTarget = args.find(value => !/^\d+$/.test(String(value)) && String(value).toLowerCase() !== 'set')
  if (rawTarget) {
    const digits = String(rawTarget).replace(/\D/g, '')
    if (digits.length >= 8) return normalizeJid(digits)
  }
  return m.sender
}

const getEpicFamily = (db, chat) => {
  getEpic(db)
  if (!db.epic.family) db.epic.family = {}
  if (!db.epic.family[chat]) db.epic.family[chat] = { king: null, queen: null, kids: [] }
  const family = db.epic.family[chat]
  family.kids = Array.isArray(family.kids) ? family.kids : []
  family.kids = family.kids.map(kid => typeof kid === 'string'
    ? { jid: kid, desc: '' }
    : { jid: kid?.jid || kid?.id, desc: String(kid?.desc || '') })
    .filter(kid => kid.jid)
  return family
}

const familyRoleName = role => ({ king: 'King', queen: 'Queen', kid: 'Anak', child: 'Anak', anak: 'Anak' }[role] || null)
const familyMembers = family => [family.king, family.queen, ...family.kids.map(kid => kid.jid)].filter(Boolean)
const familyTarget = m => getWhatIfTarget(m, [])
const familyWordCount = text => String(text || '').trim().split(/\s+/).filter(Boolean).length
const familyChild = (family, target) => family.kids.find(kid => kid.jid === target)
const familyViewText = (kid, number) => framedDetail(`ANAK ${number}`, `🧒 @${firstName(kid.jid)}\n\n📝 Deskripsi: ${kid.desc || 'Kosong'}`)
const familyText = (family, prefix) => framedDetail('EPIC FAMILY', [
  `👑 King: ${family.king ? `@${firstName(family.king)}` : 'Kosong'}`,
  `👸 Queen: ${family.queen ? `@${firstName(family.queen)}` : 'Kosong'}`,
  `🧒 Anak: ${family.kids.length ? family.kids.map((kid, i) => `${i + 1}. @${firstName(kid.jid)}`).join('\n') : 'Belum ada'}`,
  '',
  `Gunakan ${prefix}epic family add king|queen|anak`,
  `Hapus posisi dengan ${prefix}epic family remove`
].join('\n'))

const whatIfText = (target, ch) => {
  const normalizedTarget = normalizeJid(target) || target
  const person = `@${firstName(normalizedTarget)}`
  const lines = [
  `What if ${person} became a character in *EPIC MUSICAL*?\n\nThey'd fit as *${ch.name}* because their vibe matches *${ch.category}* and their destiny is: *${ch.role}*.`,
  `If ${person} entered the EPIC world, they'd be *${ch.name}* — *${ch.role.toLowerCase()}* feels like a role made specifically for them.`,
  `A wild thought: ${person} in the EPIC timeline.\n\nThe perfect match is *${ch.name}* — carrying *${ch.category}* energy with a *${ch.role}* aura.`,
  `If ${person} joined the story, they'd absolutely become *${ch.name}*.\n\nTheir personality fits the path of *${ch.category}* and the destiny of *${ch.role}*.`,
  `What if ${person} became part of the myth?\n\nThey'd be *${ch.name}* — a perfect representation of *${ch.category}* with the fate of *${ch.role}*.`,
  `${person} just entered the world of *EPIC MUSICAL*.\n\nThe gods would see them as *${ch.name}*, someone born with *${ch.category}* and destined for *${ch.role}*.`,
  `Imagine ${person} sailing through the EPIC universe.\n\nTheir role? Definitely *${ch.name}* — carrying the spirit of *${ch.category}* and becoming *${ch.role}*.`,
  `The prophecy has changed...\n\n${person} would take the place of *${ch.name}*, bringing *${ch.category}* energy into the story as *${ch.role}*.`,
  `If the Muses wrote a new chapter about ${person}, the character would be *${ch.name}*.\n\nA perfect blend of *${ch.category}* and *${ch.role}*.`,
  `A new legend appears in the EPIC universe.\n\n${person} becomes *${ch.name}* — a character defined by *${ch.category}* and the destiny of *${ch.role}*.`,
  `The halls of Olympus whisper a new name: ${person}.\n\nTheir closest match is *${ch.name}*, carrying the power of *${ch.category}* and the fate of *${ch.role}*.`,
  `If ${person} had a song in *EPIC MUSICAL*, it would tell the story of *${ch.name}*.\n\nA journey shaped by *${ch.category}* and the role of *${ch.role}*.`,
  `Breaking news from the ancient world:\n\n${person} has been chosen as *${ch.name}* — a perfect match for *${ch.category}* with a destiny called *${ch.role}*.`,
  `The oracle reveals a strange possibility...\n\n${person} was meant to become *${ch.name}*, following the path of *${ch.category}* and embracing *${ch.role}*.`,
  `A forgotten tale from the EPIC universe:\n\n${person} appears as *${ch.name}*, a figure representing *${ch.category}* and carrying the role of *${ch.role}*.`,
  `The story needs a new hero, and it chooses ${person}.\n\nTheir identity becomes *${ch.name}* — matching the essence of *${ch.category}* and the destiny of *${ch.role}*.`,
  `From mortal to legend...\n\n${person}'s EPIC transformation would be *${ch.name}*, a character powered by *${ch.category}* and known as *${ch.role}*.`,
  `The songs of the ancient world change their lyrics when ${person} arrives.\n\nThey become *${ch.name}*, representing *${ch.category}* and the fate of *${ch.role}*.`,
  `What role would fate give ${person} in *EPIC MUSICAL*?\n\nThe answer is *${ch.name}* — someone who embodies *${ch.category}* and lives as *${ch.role}*.`,
  `A new myth is written today.\n\n${person} takes the identity of *${ch.name}*, walking a path filled with *${ch.category}* and becoming *${ch.role}*.`
]
  return random(lines)
}

const monsterRevealText = (ch, target) => { 
  const normalizedTarget = normalizeJid(target) || target
  const person = `@${firstName(normalizedTarget)}`
  const lines = [
  `🩸 *WUJUD ASLI ${person.toUpperCase()}*\n\n${person} bukan sekadar manusia biasa. Mereka sebenarnya adalah *${ch.name}* — *${ch.category}* yang menyamar sempurna.\n\n✨ Sifat asli: ${ch.role}`,
  `🌑 *MONSTER REVEALED: ${person.toUpperCase()}*\n\nSelama ini mereka menyembunyikan identitas sebenarnya. Di balik wajah manusia, mereka adalah *${ch.name}*, sang *${ch.category}*.\n\n⚔️ Tujuan tersembunyi: *${ch.role}*`,
  `🕯️ *RAHASIA TERBUKA*\n\nTidak ada yang menyangka bahwa ${person} adalah bagian dari dunia monster.\n\nMereka adalah *${ch.name}* — *${ch.category}* dengan takdir: *${ch.role}*.`,
  `💀 *IDENTITAS SEBENARNYA*\n\nTopeng manusia akhirnya runtuh.\n\n${person} ternyata adalah *${ch.name}*, makhluk *${ch.category}* yang memiliki sifat: *${ch.role}*.`,
  `⚠️ *MONSTER REVEAL*\n\nJangan tertipu oleh penampilannya.\n\n${person} bukan manusia biasa, melainkan *${ch.name}* — *${ch.category}* yang bergerak dalam bayangan.`,
  `🩶 *FILE RAHASIA DITEMUKAN*\n\nNama: ${person}\nStatus: *${ch.name}*\nJenis: *${ch.category}*\n\nKemampuan utama: *${ch.role}*`,
  `🔮 *RAMALAN TERUNGKAP*\n\nPara peramal telah melihat kebenarannya.\n\n${person} akan dikenal sebagai *${ch.name}*, sosok *${ch.category}* dengan peran: *${ch.role}*.`,
  `🌘 *JANGAN PERCAYA WAJAHNYA*\n\n${person} terlihat seperti manusia biasa, tetapi kenyataannya mereka adalah *${ch.name}*.\n\nSebuah *${ch.category}* yang membawa sifat: *${ch.role}*.`,
  `🔥 *TRANSFORMASI DIMULAI*\n\nSaat wujud aslinya muncul, semua orang menyadari bahwa ${person} adalah *${ch.name}*.\n\nMakhluk *${ch.category}* dengan kekuatan: *${ch.role}*.`,
  `👁️ *MATA DUNIA MONSTER TERBUKA*\n\nIdentitas ${person} akhirnya diketahui.\n\nMereka adalah *${ch.name}* — *${ch.category}* yang memiliki misi besar: *${ch.role}*.`,
  `🩸 *SUBJEK TERIDENTIFIKASI*\n\nPenyelidikan selesai.\n\n${person} dikonfirmasi sebagai *${ch.name}*, sebuah entitas *${ch.category}* dengan karakteristik *${ch.role}*.`,
  `🌙 *DARI BAYANGAN MUNCUL KEBENARAN*\n\nSelama ini ${person} bersembunyi sebagai manusia.\n\nNamun wujud aslinya adalah *${ch.name}* — *${ch.category}* yang dikenal karena *${ch.role}*.`,
  `☠️ *ALARM MONSTER AKTIF*\n\nAda sesuatu yang berbeda dari ${person}.\n\nMereka bukan manusia biasa, tetapi *${ch.name}*, sang *${ch.category}* dengan tujuan *${ch.role}*.`,
  `🖤 *CATATAN TERLARANG*\n\nJangan pernah membuka rahasia ini.\n\n${person} sebenarnya adalah *${ch.name}* — makhluk *${ch.category}* yang menyimpan sifat: *${ch.role}*.`,
  `⚔️ *LEGEND OF ${person.toUpperCase()}*\n\nSebuah legenda baru muncul.\n\n${person} dikenal sebagai *${ch.name}*, sosok *${ch.category}* yang membawa takdir *${ch.role}*.`,
  `🕸️ *PERINGATAN: IDENTITAS TERUNGKAP*\n\nSistem mendeteksi bahwa ${person} memiliki wujud asli sebagai *${ch.name}*.\n\nKategori: *${ch.category}*\nSifat: *${ch.role}*`,
  `🌌 *DUNIA LAIN MEMANGGIL*\n\n${person} akhirnya kembali ke bentuk sebenarnya.\n\nMereka adalah *${ch.name}*, entitas *${ch.category}* dengan tujuan *${ch.role}*.`,
  `🩸 *THE TRUTH BEHIND ${person.toUpperCase()}*\n\nManusia hanyalah penyamaran.\n\nDi baliknya terdapat *${ch.name}*, makhluk *${ch.category}* yang ditakdirkan untuk *${ch.role}*.`,
  `💠 *HASIL INVESTIGASI MONSTER*\n\nNama target: ${person}\nWujud asli: *${ch.name}*\nKategori: *${ch.category}*\nKarakteristik: *${ch.role}*`,
  `🚨 *RAHASIA TERBESAR TERUNGKAP*\n\nSemua orang salah menilai ${person}.\n\nKarena sebenarnya mereka adalah *${ch.name}* — *${ch.category}* yang memiliki tujuan: *${ch.role}*.`
]
  return random(lines)
}

const createStoryState = () => ({ active: true, step: 0, dead: false, finished: false, result: null, history: [] })
const updateLeaderboard = (db, user, profile) => {
  getEpic(db)
  const entry = (db.epic.leaderboard || []).find(x => x.user === user)
  const payload = { user, wins: Number(profile.storyWins || 0), losses: Number(profile.storyLosses || 0), best: profile.bestStoryRun || 'Belum ada' }
  if (entry) {
    Object.assign(entry, payload)
  } else {
    db.epic.leaderboard.push(payload)
  }
  db.epic.leaderboard.sort((a, b) => b.wins - a.wins || a.losses - b.losses)
}

const getDiveBonus = profile => {
  const dives = Number(profile.divePoints || 0)
  if (dives >= 1000) return 0.4
  if (dives >= 100) return 0.2
  return dives > 0 ? 0.05 : 0
}
const getStoryChance = profile => Math.min(0.95, 0.5 + getDiveBonus(profile))
const diveNarration = profile => {
  const god = random(ALL_CHARACTERS.filter(character => !character.isMonster && GODS.includes(character.name)))
  return random([
  `Kamu menengadah ke langit dan memohon kepada *${god.name}*: bukakan jalan untuk perjalanan ini.`,
  `Doamu mencapai Olympus dan dunia bawah. *${god.name}*, berikan satu kesempatan lagi sebelum semuanya berakhir.`,
  `Dengan penuh harapan, kamu meminta pertolongan kepada *${god.name}*. Semoga takdir memilih jalan yang menguntungkanmu.`,
  `Di tengah perjalanan yang penuh bahaya, kamu menyebut nama *${god.name}* dan memohon perlindungan ilahi.`,
  `Kekuatan *${god.name}* menjadi harapan terakhir sebelum nasib berikutnya ditentukan.`,
  `Kamu mengangkat tangan ke arah langit dan meminta *${god.name}* mendengar permohonanmu.`,
  `Sebuah doa kecil dikirimkan kepada *${god.name}*. Mungkin kali ini para dewa akan berpihak padamu.`,
  `Dalam keadaan penuh ketidakpastian, kamu memanggil nama *${god.name}* dan berharap keajaiban terjadi.`,
  `Takdir berada di ujung keputusan. Kamu meminta *${god.name}* memberikan sedikit keberuntungan untuk langkah berikutnya.`,
  `Sebelum nasib menentukan hasil akhir, kamu memberikan persembahan doa kepada *${god.name}* dan menunggu jawaban dari para dewa.`
])
}

EPIC_STORY_EVENTS.forEach(event => {
  const successChoice = event.choices.find(choice => choice.success)
  const failureChoice = event.choices.find(choice => !choice.success)
  event.success = successChoice ? successChoice.label.replace(/^✅\s*/, '') : 'Kamu berhasil melewati ujian ini.'
  event.failure = failureChoice ? failureChoice.label.replace(/^❌\s*/, '') : 'Nasib buruk menghentikan perjalananmu.'
  delete event.choices
})
const storyNarration = () => random([
  'Suara laut membisikkan pilihan yang tak bisa dihindari.',
  'Setiap langkah di EPIC MUSICAL terasa seperti ujian yang menunggu keputusanmu.',
  'Kamu bukan lagi penonton. Kamu adalah Odysseus yang harus memilih jalan.',
  'Satu keputusan bisa membawa pulang; satu keputusan bisa mengubah segalanya.',
  'Di tengah badai dan ilusi, tak ada jalan yang benar-benar aman.',
  'Para dewa sedang menonton. Setiap tindakanmu penting.',
  'Rumah menunggu di ujung perjalanan. Tetapi harganya... mahal.',
  'Ingat Polites. Ingat keputusan yang tidak bisa diambil kembali.',
  'Kemenangan dan kehancuran hanya terpilah oleh satu pilihan.',
  'Ithaca menunggu. Penelope menunggu. Tetapi pertama, kamu harus bertahan.',
  'Laut itu tidak peduli siapa dirimu. Hanya pilihan yang peduli.',
  'Athena membisikkan kebijaksanaan. Poseidon menggemuruh kemarahan. Pilih dengan bijak.',
  'Tidak ada cerita tentang perjalanan pulang jika kamu tidak bertahan untuk pulang.',
  'Setiap karakter yang Anda temui adalah cerminan dari pilihan Anda sendiri.'
])
const hadesRevivalText = (count = 0) => {
  const index = Math.min(count, HADES_REVIVAL_TEXT.length - 1)
  return HADES_REVIVAL_TEXT[index]
}

const epicHomeText = () => `╭❖─ EPIC: THE MUSICAL ─❖╮

🌊 *A FAN-EPIC MUSICAL COMPANION*

*EPIC: The Musical* adalah  
concept album musikal oleh  
*Jorge Rivera-Herrans* yang  
menceritakan ulang kisah  
*Odyssey* karya Homer.

Ikuti perjalanan *Odysseus*,  
Raja Ithaca dalam perjalanan panjang.  
Melewati perang, lautan berbahaya,  
campur tangan para dewa,  
dan ujian untuk bisa pulang.

╰❖─ *EXPLORE THE MYTH* ─❖╯

⚔️ *THE WORLD AWAITS*
🏛️ Saga: ${EPIC_SAGAS.length}
🎵 Songs: ${EPIC_SONGS.length}
👥 Total Characters: ${ALL_CHARACTERS.length}
🧠 Total Quiz: ${EPIC_ALL_QUIZZES.length}
💬 Total Quotes: ${EPIC_QUOTE_COUNT}

✨ *WHAT LIES WITHIN*
🎶 *The Songs* - Gunakan .spotify
📝 *The Lyrics* - Gunakan .lirik
🎭 *Gods & Monsters* - Kawan & Lawan
🎲 *Your Fate* - Pilihanmu sendiri

🌐 *Official Site*
https://epicthemusical.com

🎧 *Hear the Music*
.spotify Would You Fall in Love with Me Again

📜 *Read the Words*  
.lirik Not Sorry For Loving You

═━━❖━ *CREDITS* ━❖━━═
⚔️ *Created by:* Eza
📞 *Dev:* wa.me/6282228638623  
🌟 *Supported by:* Nelson

❝ *Begins your journey* ❞

Ketik *.epic command* untuk memulai.`

const storyStatusText = (profile, event) => {
  const step = Math.min(Number(profile.story?.step || 0) + 1, EPIC_STORY_EVENTS.length)
  return `⚔️ *${event.title}*

${event.prompt}

─── *STATUS* ───
🧭 Progress: ${step}/${EPIC_STORY_EVENTS.length}
📌 ${profile.story?.dead ? '❌ Run Berakhir' : '🎲 Sistem memilih otomatis'}

❝ *Set sail.* ❞
Sistem akan menentukan hasil perjalanan secara otomatis.`
}

const storyResultText = (event, success) => {
  if (success) return `Kamu bertahan ketika laut, sihir,  
dan rasa takut menutup semua jalan.  
Dengan napas tersisa, kamu melewati  
ujian ini. Kru melihatmu bukan  
sebagai raja yang tak terkalahkan,  
tetapi manusia yang tetap berjalan.

${event.success}

Keberhasilan tidak menghapus luka.  
Ia hanya memberi satu halaman baru.

Laut masih terbuka di hadapanmu.`

  return `Kali ini keberuntungan meninggalkanmu.  
Kabut menutup pandangan, suara para  
dewa menjauh. Ujian ini mengambil  
lebih banyak dari yang bisa kau tahan.

${event.failure}

Perjalananmu berhenti di sini.  
Bukan karena kisahmu tak berarti,  
tetapi karena laut tak pernah  
menjanjikan semua pahlawan pulang.

Perjalanan ini berakhir, tetapi kisah baru masih bisa dimulai.`
}

const epicCommandText = () => `╭❖─ EPIC COMMAND GUIDE ─❖╮

🎭 *EPIC: THE MUSICAL*

Concept album oleh *Jorge Rivera-Herrans*  
yang menceritakan ulang *Odyssey*.  
Proyek fan-made dari komunitas.

─── *📚 INFO* ───
.epic saga [nomor/nama]
.epic song [nomor/nama]
.epic lirik/lyrics [nama/alias lagu]
.epic char [only/extra] [nama]

─── *🧭 JOURNEY* ───
.epic journey
.epic journey next
.epic journey leaderboard

─── *🧠 QUIZ* ───
.epic quiz
.epic quiz lb
.epic quote <12 gods>

─── *👤 PROFILE* ───
.epic profile
.epic set nama <nama>
.epic set saga <nomor/nama>
.epic set song <nomor/nama>
.epic set char <nomor/nama>
.epic set god <nomor/nama>
.epic set monster <nomor/nama>
.epic add saga <nomor/nama>
.epic add song <nomor/nama>
.epic add char <nomor/nama>
.epic add god <nomor/nama>
.epic add monster <nomor/nama>
.epic remove saga <nomor/nama>
.epic remove song <nomor/nama>
.epic remove char <nomor/nama>
.epic remove god <nomor/nama>
.epic remove monster <nomor/nama>
.epic dive - Divine Intervention

─── *👨‍👩‍👧 FAMILY* ───
.epic family
.epic family command

─── *✨ FUN & VOICE* ───
.epic random
.epic whatif [tag/reply]
.epic reveal [tag/reply]
.epic oracle
.epic stringthebow
.epic voice create
.epic voice join
.epic voice room
.epic voice start
.epic voice next
.epic voice skip
.epic voice repeat
.epic voice leave
.epic voice finish

🌐 *Official Site*
https://epicthemusical.com

🎧 *Try This*
.spotify Would You Fall in Love with Me Again
📜 .lirik Not Sorry For Loving You

❝ *Full Spead Ahead!!.* ❞`
const findQuote = input => {
  const key = String(input || '').trim().toLowerCase().replace(/\s+/g, '-')
  return Object.values(EPIC_QUOTES).find(quote => quote.name.toLowerCase() === String(input || '').trim().toLowerCase() || quote.name.toLowerCase().replace(/\s+/g, '-') === key) || null
}

const quoteText = quote => random(quote.quotes || [])

const handler = async (m, ctx = {}) => {
  let db = global.db.data || {}
  ctx.db = db
  const user = normalizeJid(ctx.user) || normalizeJid(m.sender)
  getEpic(db)
  const reply = (text, options) => ctx.conn?.reply
    ? ctx.conn.reply(m.chat, text, m, options)
    : m.reply(text, options)
  let args = Array.isArray(ctx.args) ? ctx.args.slice() : []
  let cmd = (ctx.cmd || '').toLowerCase()
  if (cmd === 'epic') cmd = ''

  if (!cmd) {
    const text = (m.body || m.text || '').trim()
    if (text.toLowerCase().startsWith('.epic')) {
      const parts = text.slice(5).trim().split(/\s+/).filter(Boolean)
      cmd = (parts.shift() || 'home').toLowerCase()
      args = parts
    }
  }

  if (!cmd) cmd = (args.shift() || 'home').toLowerCase()

if (!cmd) cmd = 'home'

if (cmd === 'home') {
  return m.reply(epicHomeText().trim())
}

if (cmd === 'saga') {
  if (!args.length) return m.reply(sagaListText())
  const saga = findSaga(args.join(' '))
  if (!saga) return m.reply(`❌ Saga tidak ditemukan. Gunakan nomor 1-${EPIC_SAGAS.length} atau nama saga.`)
  const songs = EPIC_SONGS.filter(song => song.saga === saga.name)
  const songList = songs.length
    ? `\n\n🎵 *Lagu dalam saga ini:*\n${songs.map((song, index) => `${index + 1}. ${song.name}`).join('\n')}`
    : ''
  const caption = framedDetail('SAGA DETAIL', `🎭 *${saga.name}*\n\n${saga.detail}${songList}`)
  return sendEpicImage(m, ctx, epicImageFor(saga.name), caption)
}

if (cmd === 'lirik' || cmd === 'lyrics') {
  if (!args.length) return m.reply('❌ Tulis nama atau alias lagu. Contoh: `.epic lirik thehorse`, `.epic lirik horse`, atau `.epic lirik The Horse and the Infant`.')
  const result = findLyrics(args.join(' '))
  if (!result) return m.reply('❌ Lagu tidak ditemukan di daftar EPIC.')
  const lyrics = String(result.lyric.lyrics || '').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  if (!lyrics) return m.reply(`📝 Lirik EPIC *${result.song.name}* belum tersedia di katalog.

🔎 Coba fitur pencarian lirik bot:
*${ctx.usedPrefix || '.'}lirik ${result.song.name}*`)
  const caption = framedDetail('EPIC LYRICS', `🎵 *${result.song.name}*\n\n📚 Saga: ${result.song.saga}\n\n${lyrics}`)
  return sendEpicImage(m, ctx, epicImageFor(result.song.saga, true), caption)
}

if (cmd === 'song') {
  if (!args.length) return m.reply(songListText())
  const song = findSong(args.join(' '))
  if (!song) return m.reply('❌ Lagu tidak ditemukan. Gunakan nomor atau nama lagu yang sesuai.')
  const caption = framedDetail('SONG DETAIL', `🎵 *${song.name}*\n\n📚 Saga: ${song.saga}\n\n${song.detail}`)
  return sendEpicImage(m, ctx, epicImageFor(song.saga, true), caption)
}

if (cmd === 'char' || cmd === 'character') {
  const filter = String(args[0] || '').toLowerCase()
  if (!args.length || ['only', 'extra'].includes(filter)) {
    if (args[1]) {
      const source = filter === 'only' ? EPIC_CHARACTERS : EXTRA_CHARACTERS
      const number = Number(args[1])
      const character = Number.isInteger(number) && number > 0
        ? source[number - 1]
        : source.find(item => item.name.toLowerCase() === args.slice(1).join(' ').toLowerCase() || item.id.toLowerCase() === args.slice(1).join(' ').toLowerCase())
      if (!character) return m.reply('❌ Karakter tidak ditemukan di daftar tersebut.')
      return m.reply(charDetailText(character))
    }
    return m.reply(characterListText(filter || 'all'))
  }
  const character = findCharacter(args.join(' '))
  if (!character) return m.reply('❌ Karakter tidak ditemukan. Gunakan nomor atau nama karakter yang sesuai.')
  return m.reply(charDetailText(character))
}

if (cmd === 'family') {
  const family = getEpicFamily(db, m.chat)
  const sub = String(args[0] || '').toLowerCase()
  const role = familyRoleName(args[1]?.toLowerCase())
  const mentions = familyMembers(family)

  if (!sub || sub === 'list') {
    return reply(familyText(family, ctx.usedPrefix || '.'), { mentions })
  }

  if (sub === 'command' || sub === 'commands' || sub === 'help') {
    return m.reply(`╭❖─ *EPIC FAMILY COMMAND* ─❖╮

.epic family
.epic family add king
.epic family add queen
.epic family add anak
.epic family add desc <tag/reply> <deskripsi>
.epic family remove
.epic family view <nomor anak>

Tag atau reply target. Tanpa target berarti diri sendiri.

╰❖─ *EPIC FAMILY* ─❖╯`)
  }

  if (sub === 'view') {
    const number = Number(args[1])
    if (!Number.isInteger(number) || number < 1 || number > family.kids.length) return m.reply(`❌ Nomor anak tidak valid. Gunakan angka 1-${family.kids.length || 1}.`)
    const kid = family.kids[number - 1]
    return reply(familyViewText(kid, number), { mentions: [kid.jid] })
  }

  if (sub === 'add' && String(args[1] || '').toLowerCase() === 'desc') {
    const target = familyTarget(m)
    const kid = familyChild(family, target)
    if (!kid) return reply(`❌ @${firstName(target)} belum terdaftar sebagai anak.`, { mentions: [target] })
    const hasTargetContext = Boolean(m.mentionedJid?.length || m.mentionedJids?.length || m.quoted?.sender)
    const description = args.slice(hasTargetContext && (m.mentionedJid?.length || m.mentionedJids?.length) ? 3 : 2).join(' ').trim()
    if (!description) return m.reply('❌ Tulis deskripsi anak setelah target.')
    if (familyWordCount(description) > 50) return m.reply('❌ Deskripsi maksimal 50 kata.')
    kid.desc = description
    saveDB(db)
    return reply(`✅ Deskripsi anak @${firstName(target)} berhasil disimpan.`, { mentions: [target] })
  }

  if (sub === 'add' || sub === 'set') {
    if (!role) return m.reply('❌ Pilih posisi: king, queen, atau anak.')
    if (sub === 'set' && !isEpicAdmin(ctx)) return m.reply('❌ Fitur set family hanya untuk owner.')
    const target = familyTarget(m)
    if (familyMembers(family).includes(target)) return reply(`❌ @${firstName(target)} sudah memiliki posisi di family. Gunakan remove dulu.`, { mentions: [target] })
    if (role === 'King' && family.king) return reply(`❌ King sudah diisi oleh @${firstName(family.king)}.`, { mentions: [family.king] })
    if (role === 'Queen' && family.queen) return reply(`❌ Queen sudah diisi oleh @${firstName(family.queen)}.`, { mentions: [family.queen] })
    if (role === 'Anak') family.kids.push({ jid: target, desc: '' })
    else family[role.toLowerCase()] = target
    saveDB(db)
    return reply(`✅ @${firstName(target)} sekarang menjadi *${role}* di EPIC Family.\n\n${familyText(family, ctx.usedPrefix || '.')}`, { mentions: familyMembers(family) })
  }

  if (sub === 'remove') {
    const target = familyTarget(m, args.slice(1))
    const child = familyChild(family, target)
    const oldRole = family.king === target ? 'King' : family.queen === target ? 'Queen' : child ? 'Anak' : null
    if (!oldRole) return reply(`❌ @${firstName(target)} belum terdaftar di family.`, { mentions: [target] })
    if (oldRole === 'King') family.king = null
    else if (oldRole === 'Queen') family.queen = null
    else family.kids = family.kids.filter(kid => kid.jid !== target)
    saveDB(db)
    return reply(`✅ Posisi *${oldRole}* @${firstName(target)} sudah dihapus.`, { mentions: [target] })
  }

  return m.reply(`❌ Subcommand family tidak dikenal. Gunakan *.epic family command*.`)
}

if (cmd === 'quiz') {
  const sub = String(args[0] || '').toLowerCase()
  if (sub === 'lb' || sub === 'leaderboard') {
    const board = getQuizLeaderboard(db)
    if (!board.length) return m.reply(`╭❖─ *QUIZ LEADERBOARD* ─❖╮\n\nBelum ada pemain yang mengumpulkan Quiz Point.\n\n╰❖─ *OLYMPUS* ─❖╯`)

    const lines = board.map((entry, index) => `${index + 1}. @${firstName(entry.user)} — ${entry.points} pts (${entry.correct} benar)`).join('\n')
    return m.reply(`╭❖─ *QUIZ LEADERBOARD* ─❖╮\n\n${lines}\n\n╰❖─ *OLYMPUS* ─❖╯`, { mentions: board.map(x => x.user) })
  }

  const p = getProfile(db, user)
  const answer = Number(args[0])

  if (args[0] && (!Number.isInteger(answer) || answer < 1 || answer > 4))
    return m.reply(`╭❖─ *ERROR* ─❖╮\n\n⚠️ Jawab dengan angka 1-4\n╰❖─ *COBA LAGI* ─❖╯`)

  if (args[0]) {
    if (p.quizCurrent === null || p.quizCurrent === undefined)
      return m.reply(`╭❖─ *QUIZ* ─❖╮\n\n❌ Belum ada quiz aktif.\nKetik *.epic quiz* dulu.\n\n╰❖─ *MULAI* ─❖╯`)

    const currentQuiz = typeof p.quizCurrent === 'object' ? p.quizCurrent : { index: p.quizCurrent, options: EPIC_ALL_QUIZZES[p.quizCurrent]?.options || [], answer: EPIC_ALL_QUIZZES[p.quizCurrent]?.answer || 1 }
    const quiz = EPIC_ALL_QUIZZES[currentQuiz.index ?? 0] || EPIC_ALL_QUIZZES[0]
    const options = Array.isArray(currentQuiz.options) && currentQuiz.options.length ? currentQuiz.options : quiz.options
    const correctAnswer = Number(currentQuiz.answer ?? quiz.answer)
    const isCorrect = answer === correctAnswer
    const quizData = getQuizData(db, user)
    quizData.totalAnswered = Math.max(0, Number(quizData.totalAnswered || 0)) + 1

    if (isCorrect) {
      p.quizPoints = Math.max(0, Number(p.quizPoints || 0)) + 1
      quizData.quizPoints = p.quizPoints
      quizData.correctAnswers = Math.max(0, Number(quizData.correctAnswers || 0)) + 1
    }

    p.quizCurrent = null
    saveDB(db)

    return isCorrect
     ? m.reply(`╭❖─ *BENAR!* ─❖╮

✅ Jawabanmu tepat!
💠 *Quiz Point*: +1

${quiz.detail}

❝ *The gods are pleased.* ❞
╰❖─ *EPIC QUIZ* ─❖╯`)

      : m.reply(`╭❖─ *SALAH* ─❖╮

❌ Jawaban benar: *${correctAnswer}. ${options[correctAnswer - 1]}*

${quiz.detail}

❝ *Learn from this.* ❞
╰❖─ *EPIC QUIZ* ─❖╯`)
  }

  const index = Math.floor(Math.random() * EPIC_ALL_QUIZZES.length)
  const quiz = EPIC_ALL_QUIZZES[index]
  const shuffled = shuffle(quiz.options.map((option, optionIndex) => ({ option, optionIndex })))
  const correctAnswer = shuffled.findIndex(item => item.optionIndex === (quiz.answer - 1)) + 1
  p.quizCurrent = {
    index,
    options: shuffled.map(item => item.option),
    answer: correctAnswer
  }
  saveDB(db)

  return m.reply(`╭❖─ *EPIC QUIZ* ─❖╮

🧠 *${quiz.question}*

${shuffled.map((item, i) => `${i + 1}. ${item.option}`).join('\n')}

─── *CARA JAWAB* ───
Ketik *.epic quiz 1* / *2* / *3* / *4*

❝ *Choose wisely.* ❞
╰❖─ *GOOD LUCK* ─❖╯`)
}

const stringTheBowText = user => {
  const story = random(stringTheBowStories)
  const target = user ? `@${firstName(user)}` : 'kamu'
  return `╭❖─ *STRING THE BOW* ─❖╮

🏹 *The Challenge of Ithaca*

${story.text.replace(/kamu/gi, target).replace(/kau/gi, target)}

─── *PENONTON* ───
👩 Penelope menatap ${target} dengan ekspresi dingin.
🧒 Telemachus berdiri di samping ibunya, menunggu apa yang terjadi selanjutnya.

❝ *The bow does not choose the loudest man.* ❞
╰❖─ *Ithaca Watches* ─❖╯`
}

const oracleText = user => {
  const entry = random(oracleStories)
  const target = user ? `@${firstName(user)}` : 'kamu'
  return `╭❖─ *ORACLE OF TIRESIAS* ─❖╮

🔮 *The Seer speaks beneath the earth*

${entry.text.replace(/kamu/gi, target).replace(/kau/gi, target)}

─── *THE UNDERWORLD* ───
Tiresias menutup mata, lalu membiarkan kabut terbelah di hadapan ${target}.
Bukan ramalan yang menghakimi.
Ini lebih seperti jejak yang menunggu untuk dipikul.

❝ *What waits below is not a verdict, only a memory of the road you are yet to choose.* ❞
╰❖─ *THE FUTURE WHISPERS* ─❖╯`
}

if (cmd === 'oracle') {
  return m.reply(oracleText(user).trim())
}

if (cmd === 'stringthebow' || cmd === 'string-the-bow' || cmd === 'bow') {
  return m.reply(stringTheBowText(user).trim())
}

if (cmd === 'quote') {
  const quote = findQuote(args.join(' '))
  if (!quote) return m.reply(`╭❖─ *DEWA TIDAK DITEMUKAN* ─❖╮

❌ Dewa itu tidak ada dalam catatan Olympus.
Pilih salah satu dari ini:

${Object.values(EPIC_QUOTES).map(item => `• ${item.name}`).join('\n')}

─── *CARA PAKAI* ───
.epic quote athena

╰❖─ *DENGARKAN MEREKA* ─❖╯`)

  return m.reply(`╭─  *GULUNGAN KUNO*  ─╮

 👑 *${quote.name.toUpperCase()}*

 “${quoteText(quote)}”

╰─ *Para dewa berbicara...* ─╯`)
}

if (cmd === 'help' || cmd === 'command' || cmd === 'menu') {
  return m.reply(epicCommandText().trim())
}

  if (cmd === 'profile') {
  if (String(args[0] || '').toLowerCase() === 'reset') {
    delete db.epic.profile[user]
    if (db.epic && db.epic.quiz) delete db.epic.quiz[user]
    getProfile(db, user)
    saveDB(db)
    return reply(`╭❖─ *PROFILE RESET* ─❖╮

♻️ Profile @${firstName(user)} sudah dikembalikan ke awal.
Semua progress dimulai lagi dari nol.

❝ *Lahir kembali.* ❞
╰❖─ *MULAI PETUALANGAN* ─❖╯`, { mentions: [user] })
  }

  const p = getProfile(db, user)
  const quizData = getQuizData(db, user)
  const sagas = (p.favoriteSagas || []).length ? p.favoriteSagas.join(', ') : 'Belum dipilih'
  const songs = (p.favoriteSongs || []).length ? p.favoriteSongs.join(', ') : 'Belum dipilih'
  const chars = (p.favoriteCharacters || []).length? p.favoriteCharacters.join(', ') : 'Belum dipilih'
  const gods = (p.favoriteGods || []).length? p.favoriteGods.join(', ') : 'Belum dipilih'
  const monsters = (p.favoriteMonsters || []).length? p.favoriteMonsters.join(', ') : 'Belum dipilih'
  const divePoints = Number(p.divePoints || 0)
  const quizPoints = Number(p.quizPoints || quizData.quizPoints || 0)
  const profileName = p.name === 'Belum diatur' || !p.name || p.name === '[object Object]' ? `@${firstName(user)}` : p.name

  return reply(`╭❖─ *EPIC PROFILE* ─❖╮

👤 *Name*: ${profileName}
✨ *Dive Point*: ${divePoints}
💠 *Quiz Point*: ${quizPoints}
📚 *Saga Progress*: ${p.chapters.length? p.chapters.join(', ') : 'Belum ada'}

─── *FAVORIT* ───
📚 *Sagas*: ${sagas}
🎵 *Songs*: ${songs}
💙 *Characters*: ${chars}
👑 *Gods*: ${gods}
👹 *Monsters*: ${monsters}

─── *CATATAN PERJALAN* ───
🏆 *Story Wins*: ${p.storyWins || 0}
💀 *Story Losses*: ${p.storyLosses || 0}
📖 *Best Run*: ${p.bestStoryRun || 0} tahap

╭❖─ *CREDITS* ─❖╮

⚔️ *Developer*: Eza
📞 *Contact*: wa.me/6282228638623
🤝 *Supported by*: Nelson

╰❖─ *FAN-MADE* ─❖╯`, { mentions: [user] })
}

if (cmd === 'add' || cmd === 'remove') {
  const p = getProfile(db, user)
  const typeInput = String(args[0] || '').toLowerCase()
  const type = typeInput.replace(/s$/, '')
  const value = args.slice(1).join(' ').trim()
  const listByType = {
    saga: { list: 'favoriteSagas', find: findSaga, label: 'Saga' },
    song: { list: 'favoriteSongs', find: findSong, label: 'Song' },
    char: { list: 'favoriteCharacters', find: findCharacter, label: 'Character' },
    character: { list: 'favoriteCharacters', find: findCharacter, label: 'Character' },
    god: { list: 'favoriteGods', find: input => findCharactersByType(input, 'god')[0], label: 'God' },
    monster: { list: 'favoriteMonsters', find: input => findCharactersByType(input, 'monster')[0], label: 'Monster' }
  }
  const config = listByType[type]
  if (!config || !value) return m.reply('❌ Gunakan satu command: .epic add char <nomor/nama> atau .epic remove char <nomor/nama>.')
  const item = config.find(value)
  const name = item?.name
  if (!name) return m.reply(`❌ ${config.label} tidak ditemukan.`)
  const list = p[config.list]
  if (cmd === 'add') {
    if (!appendFavorite(list, name)) return m.reply(`❌ ${name} sudah ada di Fav. ${config.label}.`)
    if (type === 'saga') p.saga = name
    if (type === 'song') p.song = name
    saveDB(db)
    return m.reply(`✅ ${name} ditambahkan ke Fav. ${config.label}.`)
  }
  if (!removeFavorite(list, name)) return m.reply(`❌ ${name} tidak ada di Fav. ${config.label}.`)
  if (type === 'saga') p.saga = list[0] || 'Belum dipilih'
  if (type === 'song') p.song = list[0] || 'Belum dipilih'
  saveDB(db)
  return m.reply(`✅ ${name} dihapus dari Fav. ${config.label}.`)
}

if (cmd === 'set') {
  const p = getProfile(db, user)
  const field = String(args[0] || '').toLowerCase().replace(/s$/, '')
  const value = args.slice(1).join(' ').trim()

  if (!field || !value) {
    return m.reply(`╭❖─ *CARA SET PROFIL* ─❖╮

⚠️ Format:
.epic set nama Odysseus
.epic set saga Ithaca
.epic set song Just a Man
.epic set char Odysseus
.epic set god Athena
.epic set monster Scylla

╰❖─ *UKIR NAMAMU* ─❖╯`)
  }

  if (field === 'nama' || field === 'name') p.name = value
  else if (field === 'saga') {
    const saga = findSaga(value)
    if (!saga) return m.reply(`❌ Saga tidak ditemukan.`)
    appendFavorite(p.favoriteSagas, saga.name); p.saga = saga.name
  } else if (field === 'song') {
    const song = findSong(value)
    if (!song) return m.reply(`❌ Song tidak ditemukan.`)
    appendFavorite(p.favoriteSongs, song.name); p.song = song.name
  } else if (field === 'char' || field === 'character') {
    const character = findCharactersByType(value, 'character')[0]
    if (!character) return m.reply(`❌ Character tidak ditemukan.`)
    appendFavorite(p.favoriteCharacters, character.name)
  } else if (field === 'god') {
    const god = findCharactersByType(value, 'god')[0]
    if (!god) return m.reply(`❌ God tidak ditemukan.`)
    appendFavorite(p.favoriteGods, god.name)
  } else if (field === 'monster') {
    const monster = findCharactersByType(value, 'monster')[0]
    if (!monster) return m.reply(`❌ Monster tidak ditemukan.`)
    appendFavorite(p.favoriteMonsters, monster.name)
  } else return m.reply('❌ Field hanya: nama, saga, song, char, god, atau monster.')

  saveDB(db)
  return reply(`✅ ${field} berhasil ditambahkan ke profile.`, { mentions: [user] })
}

if (cmd === 'random') {
  const p = getProfile(db, user)
  const saga = random(EPIC_SAGAS)
  const song = random(EPIC_SONGS)
  const god = random(GODS)
  const character = random(EPIC_CHARACTERS.filter(item => !item.isMonster))
  const monster = random(ALL_CHARACTERS.filter(item => item.isMonster))
  p.saga = saga.name
  p.song = song.name
  p.favoriteSagas = [saga.name]
  p.favoriteSongs = [song.name]
  p.favoriteCharacters = [character.name]
  p.favoriteGods = [god]
  p.favoriteMonsters = [monster.name]
  saveDB(db)
  return m.reply(`╭❖─ *YOUR EPIC DESTINY* ─❖╮

🌊 *Saga*: ${saga.name}
🎵 *Song*: ${song.name}
👑 *Divine Favor*: ${god}
👤 *Character*: ${character.name}
👹 *Monster Form*: ${monster.name}

Kamu sedang siap melangkah ke bab
yang paling berani dalam kisah ini.

❝ *Fate is calling.* ❞
╰❖─ *THE GODS CHOOSE* ─❖╯`)
}

if (cmd === 'whatif') {
  const target = normalizeJid(getWhatIfTarget(m, args, ctx)) || user
  const ch = random([...EPIC_CHARACTERS,...EXTRA_CHARACTERS])
  return reply(`╭❖─ *WHAT IF...* ─❖╮

${whatIfText(target, ch).replace(/^\n/, '')}

❝ *Bagaimana jika...* ❞
╰❖─ *ALTERNATE TALE* ─❖╯`, { mentions: [target] })
}

if (cmd === 'greet') {
  const target = getWhatIfTarget(m, args, ctx)
  const name = firstName(target)
  const greeting = random([
    `🌊 Selamat datang, *${name}*. Kapal EPIC sudah menunggumu di pelabuhan Ithaca.`,
    `🎭 *${name}*, para dewa sudah mendengar langkahmu. Semoga perjalananmu menjadi legenda.`,
    `⚔️ Salam untuk *${name}*, pejuang baru di lautan EPIC. Jangan biarkan takdir menulis semuanya untukmu.`,
    `✨ Bangkitlah, *${name}*. Bahkan ombak paling gelap tetap punya jalan pulang.`,
    `🏛️ *${name}*, Olympus dan Underworld sedang memperhatikanmu. Selamat datang di kisahmu sendiri.`
  ])
  return reply(`╭❖─ *SALAM DARI OLYMPUS* ─❖╮

${greeting}

╰❖─ *WELCOME ABOARD* ─❖╯`, { mentions: [target] })
}

if (cmd === 'card') {
  const p = getProfile(db, user)
  const profileName = p.name === 'Belum diatur'? `@${firstName(user)}` : p.name
  const favorites = values => values?.length ? values.map((value, index) => `> ${index + 1}. ${value}`).join('\n') : '> Belum dipilih'
  return reply(`╭❖─ *EPIC FAN-CARD* ─❖╮

🎭 Perkenalkan, ini adalah identitasku untuk komunitas EPIC.

NAME : ${profileName}

${favorites(p.favoriteSagas).replace(/^> /, 'FAV. SAGA 🌊\n> ')}

${favorites(p.favoriteSongs).replace(/^> /, 'FAV. SONG 🎵\n> ')}

${favorites(p.favoriteCharacters).replace(/^> /, 'FAV. CHAR 💙\n> ')}

${favorites(p.favoriteGods).replace(/^> /, 'FAV. GOD 👑\n> ')}

${favorites(p.favoriteMonsters).replace(/^> /, 'FAV. MONSTER 👹\n> ')}

─── *STAT* ───
✨ *Dive Point*: ${Number(p.divePoints || 0)}
🏆 *Journey Wins*: ${Number(p.storyWins || 0)}

Fan-made EPIC companion card
❝ *Write your own myth.* ❞
╰❖─ *IDENTITY* ─❖╯`, { mentions: [user] })
}

if (cmd === 'reveal') {
  const target = normalizeJid(getWhatIfTarget(m, args, ctx)) || user
  const monster = random(ALL_CHARACTERS.filter(x => x.isMonster))
  return reply(`╭❖─ *WUJUD ASLI TERUNGKAP* ─❖╮

${monsterRevealText(monster, target).replace(/^\n/, '')}

❝ *Kau bukan yang terlihat.* ❞
╰❖─ *MONSTER REVEAL* ─❖╯`, { mentions: [target] })
}

if (cmd === 'dive') {
  const p = getProfile(db, user)

  if (String(args[0] || '').toLowerCase() === 'set') {
    if (!isEpicAdmin(ctx)) return m.reply(`╭❖─ *AKSES DITOLAK* ─❖╮\n\n❌ Hanya owner yang bisa mengatur Dive Point.\n╰❖─ *OLYMPUS* ─❖╯`)

    const target = getWhatIfTarget(m, args, ctx)
    const targetArgs = args.slice(1)
    const targetArg = targetArgs.find(value => !/^\d+$/.test(String(value)))
    const valueArg = targetArg ? targetArgs[targetArgs.indexOf(targetArg) + 1] : args[1]
    const value = Number(valueArg)
    if (!Number.isFinite(value) || value < 0) return m.reply(`╭❖─ *FORMAT SALAH* ─❖╮\n\n⚠️ Format:.epic dive set <jumlah>\n╰❖─ *COBA LAGI* ─❖╯`)

    const targetProfile = getProfile(db, target)
    targetProfile.divePoints = Math.floor(value)
    saveDB(db)
    return reply(`╭❖─ *DIVE POINT DIATUR* ─❖╮

👤 *Target*: @${firstName(target)}
✨ *Dive Point*: ${targetProfile.divePoints}
📈 *Bonus Story*: +${(getDiveBonus(targetProfile) * 100).toFixed(0)}%

❝ *The gods grant you favor.* ❞
╰❖─ *OLYMPUS* ─❖╯`, { mentions: [target] })
  }

  const now = Date.now()
  if (p.diveCooldownAt && now < p.diveCooldownAt) {
    return m.reply(`╭❖─ *COOLDOWN* ─❖╮

⏳ *DIVINE INTERVENTION COOLDOWN*
${prettyTime(p.diveCooldownAt - now)} lagi sebelum kamu bisa meminta bantuan dewa.

╰❖─ *SABAR* ─❖╯`)
  }

  p.divePoints = Math.max(0, Number(p.divePoints || 0)) + 1
  p.diveCooldownAt = now + 3600000
  saveDB(db)
  return m.reply(`╭❖─ *DIVINE INTERVENTION* ─❖╮

${diveNarration(p)}

✨ *Dive Point*: ${p.divePoints}
🎲 *Bonus Journey*: +${(getDiveBonus(p) * 100).toFixed(0)}%

Ketik.epic journey next untuk mencoba keberuntunganmu.

❝ *A god watches over you.* ❞
╰❖─ *OLYMPUS* ─❖╯`)
}

if (cmd === 'delete') {
  if (!isEpicAdmin(ctx)) return m.reply(`╭❖─ *AKSES DITOLAK* ─❖╮\n\n❌ Hanya owner yang bisa menghapus data Epic.\n╰❖─ *OLYMPUS* ─❖╯`)

  const target = getWhatIfTarget(m, args, ctx)
  delete db.epic.profile[target]
  if (Array.isArray(db.epic.leaderboard)) db.epic.leaderboard = db.epic.leaderboard.filter(entry => entry.user!== target)
  saveDB(db)
  return reply(`╭❖─ *DATA DIHAPUS* ─❖╮

🗑️ Semua data Epic @${firstName(target)} telah dihapus.
Dia bisa memulai kisah baru dari nol.

❝ *Wiped from history.* ❞
╰❖─ *OLYMPUS* ─❖╯`, { mentions: [target] })
}

if (cmd === 'journey' || cmd === 'story' || cmd === 'stories') {
  const p = getProfile(db, user)
  const sub = String(args[0] || '').toLowerCase()

  if (sub === 'restart') {
    p.story = createStoryState()
    const event = EPIC_STORY_EVENTS[0]
    saveDB(db)
    return reply(`╭❖─ *JOURNEY RESTART* ─❖╮

🔁 Kisahmu berputar kembali ke halaman pertama.
Semua langkah sebelumnya tenggelam bersama ombak.

${storyStatusText(p, event)}

${storyNarration()}

❝ *From the beginning.* ❞
╰❖─ *ODYSSEY* ─❖╯`)
  }

  if (sub === 'continue') {
    if (!p.story ||!p.story.dead) return m.reply(`╭❖─ *GAGAL* ─❖╮\n\n❌ Tidak ada run yang mati untuk dilanjutkan.\n╰❖─ *CEK STATUS* ─❖╯`)
    p.story = {...p.story, dead: false, active: true, finished: false, result: null }
    const event = EPIC_STORY_EVENTS[p.story.step] || EPIC_STORY_EVENTS[0]
    saveDB(db)
    return m.reply(`╭❖─ *JOURNEY CONTINUE* ─❖╮

🩹 Di batas dunia bawah, Hades mendengar namamu.
Ia membuka kembali jalan dari kematian.

${storyStatusText(p, event)}

${storyNarration()}

❝ *Second chance.* ❞
╰❖─ *UNDERWORLD* ─❖╯`)
  }

  if (sub === 'leaderboard' || sub === 'lb') {
    const board = (db.epic.leaderboard || []).slice(0, 5)
    if (!board.length) return m.reply(`╭❖─ *LEADERBOARD KOSONG* ─❖╮\n\n📊 Belum ada pemain yang menamatkan run.\n╰❖─ *JADI YANG PERTAMA* ─❖╯`)
    return reply(`╭❖─ *EPIC LEADERBOARD* ─❖╮

${board.map((x, i) => `${i + 1}. @${firstName(x.user)} — Win ${x.wins} | Lose ${x.losses}`).join('\n')}

❝ *Legends are made here.* ❞
╰❖─ *TOP 5* ─❖╯`, { mentions: board.map(x => x.user) })
  }

  if (!p.story && !sub) {
    return m.reply(`╭❖─ *EPIC JOURNEY* ─❖╮

Perjalanan ini berjalan otomatis. Setiap keputusan ditentukan oleh takdir dan bantuan para dewa.

Ketik *.epic journey next* untuk memulai.
╰❖─ *ODYSSEY* ─❖╯`)
  }

  if (!p.story ||!p.story.active) {
    p.story = createStoryState()
    saveDB(db)
  }

  if (p.story.dead) return m.reply(`╭❖─ *KAMU TELAH GUGUR* ─❖╮\n\n💀 Gunakan.epic journey continue atau.epic journey restart.\n╰❖─ *PILIH JALANMU* ─❖╯`)

  const idx = Number(p.story.step || 0)
  const event = EPIC_STORY_EVENTS[idx]
  if (!event) {
    p.story.finished = true
    p.story.active = false
    p.story.result = 'success'
    p.storyWins = Number(p.storyWins || 0) + 1
    p.bestStoryRun = 'Sukses'
    updateLeaderboard(db, user, p)
    saveDB(db)
    return m.reply(`╭❖─ *JOURNEY SELESAI* ─❖╮

🏆 Kamu bertahan sampai akhir.
Kamu menuntaskan perjalanan Odysseus.

📊 *Statistik*: ${p.storyWins} menang, ${p.storyLosses} gagal

Gunakan.epic journey restart untuk main lagi.

❝ *You made it home.* ❞
╰❖─ *VICTORY* ─❖╯`)
  }

  const chance = getStoryChance(p)
  const alive = Math.random() < chance

  if (!alive) {
    p.story.dead = true
    p.story.active = false
    p.story.result = 'dead'
    p.storyLosses = Number(p.storyLosses || 0) + 1
    p.bestStoryRun = p.bestStoryRun === 'Belum ada'? 'Gagal' : p.bestStoryRun
    updateLeaderboard(db, user, p)
    saveDB(db)
    return m.reply(`╭❖─ *JOURNEY GAGAL* ─❖╮

💀 *${event.title}*

${storyResultText(event, false)}

Gunakan.epic journey continue atau.epic journey restart.

❝ *Not yet.* ❞
╰❖─ *DEFEAT* ─❖╯`)
  }

  p.story.history.push({ event: event.title, result: 'success' })
  p.story.step += 1

  if (p.story.step >= EPIC_STORY_EVENTS.length) {
    p.story.finished = true
    p.story.active = false
    p.story.result = 'success'
    p.storyWins = Number(p.storyWins || 0) + 1
    p.bestStoryRun = 'Sukses'
    updateLeaderboard(db, user, p)
    saveDB(db)
    return m.reply(`╭❖─ *JOURNEY SELESAI* ─❖╮

🏆 Kamu bertahan sampai akhir.
Kamu menuntaskan perjalanan Odysseus.

📊 *Statistik*: ${p.storyWins} menang, ${p.storyLosses} gagal

Gunakan.epic journey restart untuk main lagi.

❝ *You made it home.* ❞
╰❖─ *VICTORY* ─❖╯`)
  }

  const nextEvent = EPIC_STORY_EVENTS[p.story.step]
  saveDB(db)
  return m.reply(`╭❖─ *JOURNEY BERHASIL* ─❖╮

✅ *${event.title}*

${storyResultText(event, true)}

🧭 *Next*: ${nextEvent.title}

${nextEvent.prompt}

${storyNarration()}

Ketik.epic journey next saat siap melanjutkan.

❝ *Onward.* ❞
╰❖─ *ODYSSEY* ─❖╯`)
}

if (cmd === 'voice') {
  const sub = (args[0] || '').toLowerCase()

  if (!sub || sub === 'room' || sub === 'lobby') {
    const room = global.epicVoice[m.chat]
    if (!room) return m.reply(`╭❖─ *TIDAK ADA ROOM* ─❖╮\n\n❌ Belum ada EPIC Voice Room di grup ini.\n\nBuat dengan:.epic voice create\n╰❖─ *BUAT SEKARANG* ─❖╯`)
    return reply(`╭❖─ *EPIC VOICE ROOM* ─❖╮\n\n${epicVoiceStatus(room)}\n\n❝ *The stage awaits.* ❞\n╰❖─ *SIAP BERAKSI* ─❖╯`, { mentions: room.members })
  }

  if (sub === 'create') {
    if (global.epicVoice[m.chat]) return m.reply(`╭❖─ *GAGAL* ─❖╮\n\n❌ Sudah ada EPIC Voice Room di grup ini.\n╰❖─ *PAKE YG ADA* ─❖╯`)
    global.epicVoice[m.chat] = { host: m.sender, members: [m.sender], started: false, finished: [], skipped: [], queue: [], current: null }
    return reply(`╭❖─ *ROOM DIBUAT* ─❖╮

👑 *Host*: @${firstName(m.sender)}

Member bisa join:.epic voice join
Mulai:.epic voice start

❝ *Siapa yang akan bernyanyi?* ❞
╰❖─ *EPIC VOICE ROOM* ─❖╯`, { mentions: [m.sender] })
  }

  if (sub === 'join') {
    const room = global.epicVoice[m.chat]
    if (!room) return m.reply(`╭❖─ *TIDAK ADA ROOM* ─❖╮\n\n❌ Belum ada EPIC Voice Room.\n╰❖─ *BUAT DULU* ─❖╯`)
    if (room.started) return m.reply(`╭❖─ *GAGAL* ─❖╮\n\n❌ Voice sudah dimulai.\n╰❖─ *TUNGGU ROUND BARU* ─❖╯`)
    if (room.members.includes(m.sender)) return m.reply(`╭❖─ *GAGAL* ─❖╮\n\n❌ Kamu sudah masuk room.\n╰❖─ *SANTAI* ─❖╯`)
    if (room.members.length >= EPIC_SONGS.length) return m.reply(`╭❖─ *ROOM PENUH* ─❖╮\n\n❌ Maksimal: ${EPIC_SONGS.length} orang\nKarena setiap orang harus dapat lagu berbeda.\n╰❖─ *PENUH* ─❖╯`)
    room.members.push(m.sender)
    return reply(`╭❖─ *BERHASIL JOIN* ─❖╮\n\n✅ Kamu masuk EPIC Voice!\n\n${epicVoiceStatus(room)}\n\n╰❖─ *WELCOME* ─❖╯`, { mentions: room.members })
  }

  if (sub === 'leave') {
    const room = global.epicVoice[m.chat]
    if (!room) return m.reply(`╭❖─ *TIDAK ADA ROOM* ─❖╮\n\n❌ Tidak ada room.\n╰❖─ *CEK LAGI* ─❖╯`)
    if (room.host === m.sender) {
      room.host = room.members.find(member => member !== m.sender) || null
    }
    room.members = room.members.filter(x => x!== m.sender)
    room.finished = room.finished.filter(x => x!== m.sender)
    room.skipped = (room.skipped || []).filter(x => x!== m.sender)
    return reply(`╭❖─ *BERHASIL KELUAR* ─❖╮\n\n🚪 Kamu keluar dari EPIC Voice.\n\n${epicVoiceStatus(room)}\n\n╰❖─ *SEE YOU* ─❖╯`, { mentions: room.members })
  }

  if (sub === 'start') {
    const room = global.epicVoice[m.chat]
    if (!room) return m.reply(`╭❖─ *TIDAK ADA ROOM* ─❖╮\n\n❌ Belum ada room.\n╰❖─ *BUAT DULU* ─❖╯`)
    if (room.host!== m.sender) return m.reply(`╭❖─ *AKSES DITOLAK* ─❖╮\n\n❌ Hanya host yang bisa start.\n╰❖─ *OLYMPUS* ─❖╯`)
    if (room.members.length < 2) return m.reply(`╭❖─ *GAGAL* ─❖╮\n\n❌ Minimal 2 orang untuk mulai voice.\n╰❖─ *AJAK TEMAN* ─❖╯`)
    room.started = true
    room.finished = []
    room.skipped = []
    room.queue = epicCreateQueue(room.members)
    room.current = room.queue[0]
    return reply(`╭❖─ *VOICE DIMULAI* ─❖╮

🎤 *Penyanyi Pertama*: @${firstName(room.current.user)}
🎵 *Lagu*: ${room.current.song}

${epicVoiceStatus(room)}

❝ *Let the music begin.* ❞
╰❖─ *EPIC VOICE ROOM* ─❖╯`, { mentions: room.members })
  }

  if (sub === 'next' || sub === 'skip') {
    const room = global.epicVoice[m.chat]
    if (!room) return m.reply(`╭❖─ *TIDAK ADA ROOM* ─❖╮\n\n❌ Tidak ada room.\n╰❖─ *CEK LAGI* ─❖╯`)
    if (room.host!== m.sender) return m.reply(`╭❖─ *AKSES DITOLAK* ─❖╮\n\n❌ Hanya host yang bisa lanjutkan / skip.\n╰❖─ *OLYMPUS* ─❖╯`)
    if (!room.started) return m.reply(`╭❖─ *GAGAL* ─❖╮\n\n❌ Voice belum dimulai.\n╰❖─ *START DULU* ─❖╯`)
    if (!room.current) return m.reply(`╭❖─ *GAGAL* ─❖╮\n\n❌ Belum ada giliran aktif.\n╰❖─ *CEK LAGI* ─❖╯`)

    if (sub === 'skip') {
      room.skipped = room.skipped || []
      room.skipped.push(room.current.user)
    } else {
      room.finished.push(room.current.user)
    }

    const next = room.queue.find(x =>!room.finished.includes(x.user) &&!(room.skipped || []).includes(x.user))
    if (!next) {
      room.skipped = []
      const retry = room.queue.find(x =>!room.finished.includes(x.user))
      if (!retry) {
        room.finished = []
        room.current = null
        return reply(`╭❖─ *SELESAI 1 ROUND* ─❖╮

🎉 Semua member sudah bernyanyi!

Pilihan:
.epic voice repeat
.epic voice finish

❝ *Encore?* ❞
╰❖─ *EPIC VOICE ROOM* ─❖╯`, { mentions: room.members })
      }
      room.current = retry
      return reply(`╭❖─ *GILIRAN BERIKUTNYA* ─❖╮

🎤 *@${firstName(retry.user)}*
🎵 *Lagu*: ${retry.song}

${epicVoiceStatus(room)}

╰❖─ *BERNYANYI* ─❖╯`, { mentions: room.members })
    }

    room.current = next
    return reply(`╭❖─ *GILIRAN BERIKUTNYA* ─❖╮

🎤 *@${firstName(next.user)}*
🎵 *Lagu*: ${next.song}

${epicVoiceStatus(room)}

╰❖─ *BERNYANYI* ─❖╯`, { mentions: room.members })
  }

  if (sub === 'repeat') {
    const room = global.epicVoice[m.chat]
    if (!room) return m.reply(`╭❖─ *TIDAK ADA ROOM* ─❖╮\n\n❌ Tidak ada room.\n╰❖─ *CEK LAGI* ─❖╯`)
    if (room.host!== m.sender) return m.reply(`╭❖─ *AKSES DITOLAK* ─❖╮\n\n❌ Hanya host.\n╰❖─ *OLYMPUS* ─❖╯`)
    room.finished = []
    room.skipped = []
    room.queue = epicCreateQueue(room.members)
    room.current = room.queue[0]
    return reply(`╭❖─ *VOICE DIULANG* ─❖╮

🔄 Urutan sudah diacak ulang

🎤 *Penyanyi Pertama*: @${firstName(room.current.user)}
🎵 *Lagu*: ${room.current.song}

❝ *From the top.* ❞
╰❖─ *ENCORE* ─❖╯`, { mentions: room.members })
  }

  if (sub === 'delete') {
    const room = global.epicVoice[m.chat]
    if (!room) return m.reply(`╭❖─ *TIDAK ADA ROOM* ─❖╮\n\n❌ Tidak ada room.\n╰❖─ *CEK LAGI* ─❖╯`)
    if (room.host!== m.sender) return m.reply(`╭❖─ *AKSES DITOLAK* ─❖╮\n\n❌ Hanya host.\n╰❖─ *OLYMPUS* ─❖╯`)
    delete global.epicVoice[m.chat]
    return reply(`╭❖─ *VOICE ROOM DIHAPUS* ─❖╮

🗑️ EPIC VOICE telah ditutup.
Terima kasih sudah bernyanyi bersama 🎶

❝ *The curtain falls.* ❞
╰❖─ *THE END* ─❖╯`)
  }

  return m.reply(`╭❖─ *EPIC VOICE COMMANDS* ─❖╮

.epic voice create
.epic voice join
.epic voice room
.epic voice start
.epic voice next
.epic voice skip
.epic voice repeat
.epic voice leave
.epic voice finish

❝ *Take the stage.* ❞
╰❖─ *COMMAND LIST* ─❖╯`)
}

function legacyEpicCommandText() {
  return `╭❖─ *EPIC MUSICAL - COMMANDS* ─❖╮

─── *📖 INFO* ───
.saga [nomor/nama] - Info saga
.song [nomor/nama] - Info lagu
.char [only/extra] [nomor/nama] - Info karakter
.random - Random saga, lagu, dewa

─── *👤 PROFILE* ───
.profile - Lihat profil
.set nama <nama> - Atur nama
.set saga <nomor/nama> - Tambah saga favorit
.set song <nomor/nama> - Tambah song favorit
.set char <nomor/nama> - Tambah character favorit
.set god <nomor/nama> - Tambah god favorit
.set monster <nomor/nama> - Tambah monster favorit

─── *🎲 GAMES* ───
.story [restart/continue/lb] - Main story auto-gacha
.dive - Divine Intervention +1 Dive Point
.whatif [@user] - Jadi karakter random
.reveal [@user] - Reveal monster ke orang
.quote [nama dewa] - Dengarkan sabda dewa

─── *🎤 VOICE* ───
.voice create - Buat room
.voice join - Join room
.voice room - Lihat status
.voice start - Mulai bernyanyi
.voice next - Lanjut giliran
.voice skip - Skip giliran
.voice repeat - Ulang round
.voice leave - Keluar
.voice delete - Hapus room

─── *⚙️ CARA MAIN* ───
1. Set profil:.epic set nama Odysseus
2. Main story:.epic story 
3. Tambah Dive:.epic dive
4. Cek top player:.epic story lb
5. Voice bareng:.epic voice create

─── *✨ TIPS* ───
▫️ Story ditentukan gacha + Dive Point
▫️ Bonus: 5% | 20% | 40%
▫️ Voice: tiap member dapat lagu beda
▫️ Char filter:.epic char only / extra

❝ *Write your own journey.* ❞
╰❖─ *EPIC BOT* ─❖╯`
}

if (cmd === 'command' || cmd === 'commands' || cmd === 'cmd' || cmd === 'help' || cmd === 'menu') {
  return m.reply(epicCommandText())
}

return m.reply(`╭❖─ *EPIC MUSICAL* ─❖╮

📖 *INFO*
.epic command - Daftar lengkap command
.epic saga - Lihat 9 saga
.epic song - Lihat 40 lagu  
.epic char - Daftar karakter

👤 *PROFILE*
.epic profile - Lihat profil
.epic set - Edit profil
.epic add/remove - Kelola favorit

👨‍👩‍👧 *FAMILY*
.epic family - Lihat family

🎲 *GAMES*
.epic story - Main story auto-gacha
.epic dive - Divine Intervention
.epic random - Random destiny
.epic whatif - What if jadi karakter
.epic reveal - Reveal monster

🎤 *VOICE*
.epic voice - Voice room

❝ *Dengarkan para dewa.* ❞
╰❖─ *KETIK .EPIC COMMAND* ─❖╯`)
}

handler.help = ['epic']
handler.tags = ['misc']
handler.command = /^epic$/i

export default handler