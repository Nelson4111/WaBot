import { randomUUID } from 'node:crypto'
import { getUserRPG, loadDB, saveDB } from './waifuHelper.js'
import { sendRpgButtons } from './rpgActionButtons.js'
import { isPremiumUser } from '../plugins/rpg/rpg-bank.js'
import { filterLeaderboardUsers, getLeaderboardUserIdentity } from './leaderboardPrivacy.js'
import { filterRpgPanelUsers, isValidRpgUserId } from './rpgLeaderboard.js'

const AUTO_SPAWN_EVERY = 50
const ENCOUNTER_DURATION = 5 * 60 * 1000
const CATCH_COOLDOWN = 30 * 60 * 1000
const TRAIN_COOLDOWN = 30 * 60 * 1000
const TRAINING_XP_PER_LEVEL = 3
const MAX_CREATURE_LEVEL = 100
const TEAM_LIMIT = 4
const TITLE_MILESTONES = [
  { count: 0, title: '🌱 Penjelajah Baru' },
  { count: 5, title: '✨ Kolektor Pemula' },
  { count: 20, title: '🧭 Penjelajah Andal' },
  { count: 50, title: '🏅 Kolektor Berpengalaman' },
  { count: 100, title: '👑 Legenda Koleksi' }
]

function jakartaDate(timestamp = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date(timestamp))
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${values.year}-${values.month}-${values.day}`
}

function ensureEncounterStore(db) {
  db.rpgCreatureHunts = db.rpgCreatureHunts || { groups: {}, encounters: {} }
  db.rpgCreatureHunts.groups = db.rpgCreatureHunts.groups || {}
  db.rpgCreatureHunts.encounters = db.rpgCreatureHunts.encounters || {}
  return db.rpgCreatureHunts
}

function ensureGroupState(store, chat) {
  store.groups[chat] = store.groups[chat] || { messageCount: 0, nextType: 'pokemon', autoEnabled: true, activeId: null }
  const group = store.groups[chat]
  group.messageCount = Math.max(0, Number(group.messageCount) || 0)
  group.nextType = group.nextType === 'ghost' ? 'ghost' : 'pokemon'
  group.autoEnabled = group.autoEnabled !== false
  return group
}

function getEncounterLines(type, creature, ownerName, combatData = {}, stories = {}) {
  const battleStats = combatData[creature.id]
  const story = getStory(stories, 'spawn')
  if (type === 'pokemon') {
    return `╭─❏「 ✨ POKÉMON LIAR 」❏\n` +
      `│ 🌿 SEBUAH POKÉMON MUNCUL!\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `${creature.emoji} *${creature.name}* · ${creature.rarity}\n` +
      `> ${creature.description}\n` +
      `> ✨ Jurus khas: ${creature.power}\n` +
      `${battleStats ? `> ⚔️ Damage: ${battleStats.damage}\n` : ''}\n` +
      `📖 ${story}\n\n` +
      `🏃 Pokémon ini belum tertangkap!\n` +
      `─━━━━━━━━━━━━━━─\n\n` +
      `${ownerName ? '> 🔒 Encounter pribadi hanya dapat ditangkap oleh pemanggilnya.\n' : ''}` +
      `> ⏳ Kesempatan berakhir dalam 5 menit; siapa cepat dia dapat!\n` +
      `> 👑 Admin grup dapat menonaktifkan spawn otomatis: *.pokemon disable*.\n` +
      `> 🌱 Aktifkan kembali kapan saja dengan *.pokemon enable*.\n\n` +
      `Tekan tombol di bawah untuk mencoba menangkapnya!\n` +
      `─━━━━━━━━━━━━━━─`
  }

  return `╭─❏「 👻 GHOST HUNTER 」❏\n` +
    `│ 📡 SINYAL PARANORMAL TERDETEKSI\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${creature.emoji} *${creature.name}* · ${creature.rarity}\n` +
    `> ${creature.description}\n` +
    `> 🧿 Kategori: ${creature.type}\n` +
    `> 📍 Asal: ${creature.from}\n` +
    `${battleStats ? `> ⚔️ ${battleStats.power} · Damage: ${battleStats.damage}\n` : ''}\n` +
    `📖 ${story}\n\n` +
    `👻 Entitas ini masih berkeliaran!\n` +
    `─━━━━━━━━━━━━━━─\n\n` +
    `${ownerName ? '> 🔒 Encounter pribadi hanya dapat ditangkap oleh pemanggilnya.\n' : ''}` +
    `> ⏳ Kesempatan berakhir dalam 5 menit; siapa cepat dia dapat!\n` +
    `> 👑 Admin grup dapat menonaktifkan spawn otomatis: *.ghost disable*.\n` +
    `> 📡 Aktifkan kembali kapan saja dengan *.ghost enable*.\n\n` +
    `Tekan tombol di bawah untuk memulai investigasi!\n` +
    `─━━━━━━━━━━━━━━─`
}

function creatureFor(type, creatureKey, data) {
  return data.find(creature => creature.id === creatureKey)
}

function getStory(stories, event) {
  const options = stories?.[event]
  if (!Array.isArray(options) || !options.length) return ''
  return options[Math.floor(Math.random() * options.length)]
}

function createEncounter(store, chat, type, data, source, owner = null) {
  const creature = data[Math.floor(Math.random() * data.length)]
  const encounter = {
    id: randomUUID().replace(/-/g, '').slice(0, 12),
    type,
    creatureId: creature.id,
    chat,
    source,
    owner,
    createdAt: Date.now(),
    expiresAt: Date.now() + ENCOUNTER_DURATION
  }
  store.encounters[encounter.id] = encounter
  return encounter
}

async function sendEncounter(conn, encounter, data, prefix, ownerName, combatData = {}, stories = {}) {
  const creature = creatureFor(encounter.type, encounter.creatureId, data)
  if (!creature) throw new Error(`Unknown ${encounter.type} encounter creature: ${encounter.creatureId}`)
  const command = encounter.type === 'pokemon' ? 'pokemon' : 'ghost'
  return sendRpgButtons(conn, {
    chat: encounter.chat,
    text: getEncounterLines(encounter.type, creature, ownerName, combatData, stories),
    title: `${creature.emoji} ${creature.name.toUpperCase()}`,
    buttonText: encounter.type === 'pokemon' ? '🎯 TANGKAP POKÉMON' : '🧿 MULAI INVESTIGASI',
    buffer: null,
    buttons: [[
      encounter.type === 'pokemon' ? '🎯 Tangkap Sekarang' : '🧿 Tangkap Entitas',
      `${prefix}${command} catch ${encounter.id}`
    ]],
    footer: 'AVELIA • RPG ENCOUNTER',
    noThumbnail: true,
    classicOnly: true,
    reply: fallbackText => conn.sendMessage(encounter.chat, { text: fallbackText })
  })
}

function cleanupEncounter(store, encounter) {
  delete store.encounters[encounter.id]
  if (encounter.source === 'auto' || encounter.source === 'forced') {
    const group = store.groups[encounter.chat]
    if (group?.activeId === encounter.id) group.activeId = null
  }
}

function pruneExpiredEncounters(store, now = Date.now()) {
  let removed = false
  for (const encounter of Object.values(store.encounters)) {
    if (encounter.expiresAt <= now) {
      cleanupEncounter(store, encounter)
      removed = true
    }
  }
  return removed
}

function getAutoSpawnPrefix(conn) {
  const configuredPrefix = conn.prefix ?? global.opts?.prefix
  if (typeof configuredPrefix === 'string' && configuredPrefix) return configuredPrefix[0]
  if (Array.isArray(configuredPrefix)) {
    const prefix = configuredPrefix.find(item => typeof item === 'string' && item)
    if (prefix) return prefix[0]
  }
  return '.'
}

function getDailyField(type, field) {
  return `${type}${field}`
}

function collectionFields(type) {
  return {
    inventory: type === 'pokemon' ? 'pokemonInventory' : 'ghostInventory',
    creatures: type === 'pokemon' ? 'pokemonCreatures' : 'ghostCreatures',
    team: type === 'pokemon' ? 'pokemonTeam' : 'ghostTeam',
    stats: type === 'pokemon' ? 'pokemonBattleStats' : 'ghostBattleStats'
  }
}

function ensureCollection(user, type) {
  const fields = collectionFields(type)
  user[fields.inventory] = user[fields.inventory] || {}
  if (!Array.isArray(user[fields.creatures])) {
    user[fields.creatures] = Object.entries(user[fields.inventory]).flatMap(([id, count]) =>
      Array.from({ length: Math.max(0, Number(count) || 0) }, () => ({
        uid: randomUUID().replace(/-/g, '').slice(0, 12),
        id,
        level: 1,
        xp: 0
      }))
    )
  }
  user[fields.team] = Array.isArray(user[fields.team]) ? user[fields.team] : []
  user[fields.stats] = user[fields.stats] || { wins: 0, losses: 0, draws: 0 }
  return { fields, collection: user[fields.creatures] }
}

function addCreature(user, type, creatureId) {
  const { fields, collection } = ensureCollection(user, type)
  const existing = collection.find(creature => creature.id === creatureId)
  if (existing) {
    existing.level = Math.min(MAX_CREATURE_LEVEL, Math.max(1, Number(existing.level) || 1) + 1)
    existing.xp = 0
    return { creature: existing, count: user[fields.inventory][creatureId], duplicate: true }
  }

  const creature = { uid: randomUUID().replace(/-/g, '').slice(0, 12), id: creatureId, level: 1, xp: 0 }
  collection.push(creature)
  user[fields.inventory][creatureId] = Number(user[fields.inventory][creatureId] || 0) + 1
  return { creature, count: user[fields.inventory][creatureId], duplicate: false }
}

function removeCreature(user, type, index) {
  const { fields, collection } = ensureCollection(user, type)
  const [creature] = collection.splice(index, 1)
  if (!creature) return null
  user[fields.inventory][creature.id] = Math.max(0, Number(user[fields.inventory][creature.id] || 1) - 1)
  if (!user[fields.inventory][creature.id]) delete user[fields.inventory][creature.id]
  user[fields.team] = user[fields.team].filter(uid => uid !== creature.uid)
  return creature
}

function currentTitle(total) {
  return TITLE_MILESTONES.reduce(
    (current, milestone) => total >= milestone.count ? milestone : current,
    TITLE_MILESTONES[0]
  )
}

function getCombatStats(creature, entry, combatData) {
  const stats = combatData?.[creature.id] || {}
  const level = Math.max(1, Number(entry.level) || 1)
  return {
    level,
    power: creature.power || stats.power || 'Serangan Khusus',
    damage: Math.max(1, (Number(stats.damage) || 10) + (level - 1) * 3),
    hp: Math.max(1, (Number(stats.hp) || 80) + (level - 1) * 8)
  }
}

function formatCooldown(user, type, prefix, command) {
  const rpg = user?.rpg || user
  const now = Date.now()
  const catchRemaining = Math.max(0, (Number(rpg?.[`${type}CatchCooldownUntil`]) || 0) - now)
  const trainRemaining = Math.max(0, (Number(rpg?.[`${type}TrainCooldownUntil`]) || 0) - now)
  const formatDuration = remaining => remaining
    ? `${Math.floor(remaining / 60000)} menit ${Math.ceil((remaining % 60000) / 1000)} detik`
    : 'Siap digunakan'
  return `╭─❏「 ⏳ COOLDOWN ${type === 'pokemon' ? 'POKÉMON' : 'GHOST HUNTER'} 」❏\n` +
    `│ JEDA TANGKAPAN & LATIHAN\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tangkapan: *${formatDuration(catchRemaining)}*\n` +
    `> ↳ Latihan: *${formatDuration(trainRemaining)}*\n` +
    `> ↳ Cooldown tangkapan dan latihan masing-masing 30 menit.\n\n` +
    `Gunakan *${prefix}${command} inv* untuk melihat koleksi.\n` +
    `─━━━━━━━━━━━━━━─`
}

function displayCreatureName(creature, entry) {
  return entry.nickname ? `${entry.nickname} (${creature.name})` : creature.name
}

function formatInventory(user, data, type, combatData) {
  const { collection } = ensureCollection(user.rpg, type)
  const owned = collection
    .map((entry, index) => ({ entry, index, creature: creatureFor(type, entry.id, data) }))
    .filter(item => item.creature)
  const unique = new Set(owned.map(item => item.entry.id)).size
  const list = owned.map(({ entry, index, creature }) =>
    `> *${index + 1}.* ${creature.emoji} ${entry.favorite ? '⭐ ' : ''}*${displayCreatureName(creature, entry)}* · Lv.${entry.level || 1} (${entry.xp || 0}/${TRAINING_XP_PER_LEVEL} XP) · ${creature.rarity}` +
    `${combatData?.[creature.id]?.power ? `\n> ↳ ⚔️ ${combatData[creature.id].power} · DMG ${getCombatStats(creature, entry, combatData).damage}` : ''}`
  )
  return `╭─❏「 ${type === 'pokemon' ? '🎒 POKÉDEX' : '🧿 CATATAN INVESTIGASI'} 」❏\n` +
    `│ ${type === 'pokemon' ? 'KOLEKSI POKÉMON' : 'KOLEKSI ENTITAS'}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📦 *RINGKASAN*\n` +
    `> ↳ Jenis terkumpul: ${unique}/${data.length}\n` +
    `> ↳ Total tangkapan: ${owned.length}\n\n` +
    `─━━━━━━━━━━━━━━─\n` +
    `${list.join('\n') || '> ↳ Belum ada koleksi. Coba ikut encounter berikutnya!'}\n\n` +
    `─━━━━━━━━━━━━━━─`
}

function getTarget(m, conn) {
  const target = m.mentionedJid?.[0] || m.quoted?.sender
  return target ? conn.decodeJid(target) : null
}

function getTeam(user, type, data) {
  const { fields, collection } = ensureCollection(user, type)
  const ownedIds = new Set(collection.map(entry => entry.uid))
  user[fields.team] = [...new Set(user[fields.team].filter(uid => ownedIds.has(uid)))].slice(0, TEAM_LIMIT)
  return user[fields.team]
    .map(uid => collection.find(entry => entry.uid === uid))
    .filter(Boolean)
    .map(entry => ({ entry, creature: creatureFor(type, entry.id, data) }))
    .filter(item => item.creature)
}

function formatTeam(user, data, type, combatData) {
  const team = getTeam(user, type, data)
  const lineItems = team.map(({ entry, creature }, index) => {
    const stats = getCombatStats(creature, entry, combatData)
    return `> *${index + 1}.* ${creature.emoji} *${displayCreatureName(creature, entry)}* · Lv.${stats.level} · ⚔️ ${stats.power} (${stats.damage} DMG)`
  })
  return `╭─❏「 ${type === 'pokemon' ? '🛡️ TIM POKÉMON' : '🧿 TIM HUNTER'} 」❏\n` +
    `│ ${team.length}/${TEAM_LIMIT} ANGGOTA SIAP BERTARUNG\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${lineItems.join('\n') || '> ↳ Tim masih kosong. Tambahkan anggota dari inventory!'}\n\n` +
    `> ↳ Maksimal ${TEAM_LIMIT} makhluk. Kelola dengan *team add <nomor inventory>* atau *team remove <nomor tim>*.\n\n` +
    `─━━━━━━━━━━━━━━─`
}

function creatureCount(user, type) {
  return ensureCollection(user, type).collection.length
}

function guideText(type, prefix) {
  const pokemon = type === 'pokemon'
  const label = pokemon ? 'Pokémon' : 'Ghost Hunter'
  const command = pokemon ? 'pokemon' : 'ghost'
  return `╭─❏「 ${pokemon ? '📖 PANDUAN POKÉMON' : '📖 PANDUAN GHOST HUNTER'} 」❏\n` +
    `│ ${pokemon ? 'JELAJAHI DUNIA POKÉMON' : 'SELIDIKI DUNIA PARANORMAL'}\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `✨ *CARA BERMAIN*\n` +
    `> ↳ Encounter ${label} dapat muncul secara spontan di grup.\n` +
    `> ↳ Tekan tombol encounter untuk mencoba menangkapnya.\n` +
    `> ↳ Siapa yang berhasil lebih dulu akan membawa pulang koleksinya!\n` +
    `> ↳ Encounter otomatis Pokémon dan Ghost Hunter muncul bergantian.\n\n` +
    `🌙 *PETUALANGAN HARIAN*\n` +
    `> ↳ Gunakan *${prefix}${command} daily* untuk encounter pribadimu.\n` +
    `> ↳ Hanya kamu yang dapat berinteraksi dengan encounter pribadi tersebut.\n` +
    `> ↳ Setiap pemain memiliki satu kesempatan pribadi per hari.\n\n` +
    `📚 *KOLEKSI*\n` +
    `> ↳ Lihat seluruh makhluk: *${prefix}${command} list*.\n` +
    `> ↳ Kelola koleksimu: *${prefix}${command} inv* (detail, rename, favorit, release).\n` +
    `> ↳ Latih makhluk: *${prefix}${command} train <nomor>*; Premium dapat memakai *train all* (cooldown 30 menit).\n` +
    `> ↳ Susun maksimal 4 anggota: *${prefix}${command} team add <nomor inventory>*.\n` +
    `> ↳ Tantang pemain dengan reply/tag: *${prefix}${command} battle @tag*.\n` +
    `> ↳ Cek profil/title dan peringkat: *${prefix}${command} profile*, *title*, atau *top*.\n\n` +
    `> ↳ Cek jeda tangkapan: *${prefix}${command} cd* atau *${prefix}${command} cooldown*.\n\n` +
    `─━━━━━━━━━━━━━━─`
}

export function createRpgCreatureHunt({ type, command, data, combatData = {}, stories = {} }) {
  const pokemon = type === 'pokemon'
  const label = pokemon ? 'Pokémon' : 'Ghost Hunter'
  const inventoryField = pokemon ? 'pokemonInventory' : 'ghostInventory'

  const handler = async (m, { conn, args = [], usedPrefix = '.', isAdmin = false, isOwner = false, groupMetadata }) => {
    const prefix = usedPrefix || '.'
    const action = String(args[0] || '').toLowerCase()
    if (!m.isGroup && !['cd', 'cooldown'].includes(action)) {
      return m.reply(`Fitur ${label} hanya dapat digunakan di grup.`)
    }
    const db = loadDB()
    const store = ensureEncounterStore(db.data)
    pruneExpiredEncounters(store)
    const group = ensureGroupState(store, m.chat)

    if (['cd', 'cooldown'].includes(action)) {
      return m.reply(formatCooldown(getUserRPG(db, m.sender), type, prefix, command))
    }

    if (['top', 'lb', 'leaderboard'].includes(action)) {
      const users = filterLeaderboardUsers(
        filterRpgPanelUsers(Object.keys(db.data.users || {})),
        conn
      ).filter(isValidRpgUserId)
        .map(id => ({ id, user: getUserRPG(db, id)?.rpg }))
        .filter(entry => entry.user)
        .map(entry => ({ ...entry, captures: creatureCount(entry.user, type) }))
        .sort((a, b) => b.captures - a.captures)
        .slice(0, 10)
      const rows = users.map((entry, index) => {
        const identity = getLeaderboardUserIdentity(entry.id, {
          conn,
          groupMetadata,
          name: conn.getName(entry.id)
        })
        return `> *${index + 1}. ${identity.display}*\n> ↳ Tangkapan: ${entry.captures} · ${currentTitle(entry.captures).title}`
      })
      return m.reply(
        `╭─❏「 🏆 ${pokemon ? 'POKÉMON' : 'GHOST HUNTER'} LEADERBOARD 」❏\n` +
        `│ 10 PETUALANG TERATAS\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `${rows.join('\n\n') || '> ↳ Belum ada petualang dalam peringkat.'}\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (['profile', 'title', 'train', 'team', 'battle'].includes(action)) {
      const playerData = getUserRPG(db, m.sender)
      if (!playerData?.rpg || playerData.isDummy) {
        return m.reply(`Daftarkan karakter RPG-mu terlebih dahulu dengan *${prefix}adventure* untuk membuka fitur ${label}.`)
      }
      const user = playerData.rpg
      const { fields, collection } = ensureCollection(user, type)
      getTeam(user, type, data)
      const total = collection.length
      const title = currentTitle(total)

      if (action === 'profile') {
        const stats = user[fields.stats]
        const trained = collection.reduce((sum, creature) => sum + Math.max(0, (Number(creature.level) || 1) - 1), 0)
        return m.reply(
          `╭─❏「 ${pokemon ? '🌿 PROFIL PELATIH' : '🧿 PROFIL HUNTER'} 」❏\n` +
          `│ ${m.pushName || conn.getName(m.sender) || 'Petualang'}\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `🏅 *TITLE*\n> ↳ ${title.title} · ${total} tangkapan\n\n` +
          `📚 *PERKEMBANGAN*\n> ↳ Koleksi: ${total} makhluk · ${new Set(collection.map(entry => entry.id)).size} spesies\n` +
          `> ↳ Total level latihan: +${trained}\n> ↳ Tim: ${getTeam(user, type, data).length}/${TEAM_LIMIT}\n\n` +
          `⚔️ *REKOR BATTLE*\n> ↳ Menang: ${stats.wins || 0} · Kalah: ${stats.losses || 0} · Seri: ${stats.draws || 0}\n\n` +
          `─━━━━━━━━━━━━━━─`
        )
      }

      if (action === 'title') {
        const nextTitle = TITLE_MILESTONES.find(milestone => milestone.count > total)
        return m.reply(
          `╭─❏「 🏅 TITLE PETUALANG 」❏\n` +
          `│ SETIAP TANGKAPAN MEMBAWA PRESTASI\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `✨ Title saat ini: *${title.title}*\n> ↳ Total tangkapan: ${total}\n` +
          `${nextTitle ? `> ↳ Berikutnya: *${nextTitle.title}* pada ${nextTitle.count} tangkapan.\n\n` : '> ↳ Semua tingkatan title sudah diraih!\n\n'}` +
          `📜 *TINGKATAN*\n${TITLE_MILESTONES.map(item => `> ${total >= item.count ? '✅' : '🔒'} ${item.title} · ${item.count} tangkapan`).join('\n')}\n\n` +
          `─━━━━━━━━━━━━━━─`
        )
      }

      if (action === 'train') {
        const input = String(args[1] || '').toLowerCase()
        const trainable = input === 'all'
          ? (isPremiumUser(m.sender, db) ? collection : null)
          : (/^\d+$/.test(input) ? [collection[Number(input) - 1]].filter(Boolean) : null)
        if (input === 'all' && !trainable) return m.reply(`❌ Latihan massal khusus pengguna Premium. Gunakan *${prefix}${command} train <nomor inventory>* untuk latihan satu makhluk.`)
        if (!trainable) return m.reply(`Pilih makhluk dari inventory: *${prefix}${command} train <nomor>*${isPremiumUser(m.sender, db) ? ` atau *${prefix}${command} train all*` : ''}.`)
        if (!trainable.length) return m.reply('🎒 Koleksimu belum memiliki makhluk untuk dilatih.')
        const trainableCreatures = trainable.filter(creature => (Number(creature.level) || 1) < MAX_CREATURE_LEVEL)
        if (!trainableCreatures.length) return m.reply(`🏅 Semua makhluk yang dipilih sudah mencapai level maksimum (${MAX_CREATURE_LEVEL}).`)
        const cooldownField = `${type}TrainCooldownUntil`
        if ((Number(user[cooldownField]) || 0) > Date.now()) {
          return m.reply(formatCooldown(playerData, type, prefix, command))
        }
        let levelsGained = 0
        for (const creature of trainableCreatures) {
          creature.level = Math.max(1, Number(creature.level) || 1)
          creature.xp = Math.max(0, Number(creature.xp) || 0)
          if (creature.level >= MAX_CREATURE_LEVEL) continue
          creature.xp++
          if (creature.xp >= TRAINING_XP_PER_LEVEL) {
            creature.xp = 0
            creature.level++
            levelsGained++
          }
        }
        user[fields.stats].trainings = (Number(user[fields.stats].trainings) || 0) + trainableCreatures.length
        user[cooldownField] = Date.now() + TRAIN_COOLDOWN
        await saveDB(db)
        return m.reply(
          `╭─❏「 ${pokemon ? '📈 LATIHAN POKÉMON' : '📈 LATIHAN HUNTER'} 」❏\n` +
          `│ ${trainableCreatures.length} MAKHLUK SELESAI BERLATIH\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `> ↳ Level bertambah: ${levelsGained}\n` +
          `> ↳ Setiap ${TRAINING_XP_PER_LEVEL} latihan menaikkan 1 level.\n` +
          `> ↳ Level maksimum: ${MAX_CREATURE_LEVEL}.\n` +
          `> ↳ Cooldown latihan berikutnya: 30 menit. Cek dengan *${prefix}${command} cd*.\n\n` +
          `─━━━━━━━━━━━━━━─`
        )
      }

      if (action === 'team') {
        const subAction = String(args[1] || 'list').toLowerCase()
        if (subAction === 'list' || subAction === 'menu') return m.reply(formatTeam(user, data, type, combatData))
        if (['clear', 'reset'].includes(subAction)) {
          user[fields.team] = []
          await saveDB(db)
          return m.reply(`✅ Tim ${label} berhasil dikosongkan. Susun kembali tim impianmu kapan saja!`)
        }
        if (['add', 'set'].includes(subAction)) {
          const selected = Number(args[2])
          if (!Number.isInteger(selected) || selected < 1 || selected > collection.length) {
            return m.reply(`Pilih nomor makhluk yang terlihat di inventory: *${prefix}${command} team add <nomor>*.`)
          }
          if (user[fields.team].length >= TEAM_LIMIT) return m.reply(`🛡️ Tim sudah penuh (${TEAM_LIMIT} makhluk). Hapus anggota sebelum menambahkan yang baru.`)
          const member = collection[selected - 1]
          if (user[fields.team].includes(member.uid)) return m.reply('Makhluk itu sudah menjadi anggota timmu.')
          user[fields.team].push(member.uid)
          await saveDB(db)
          const creature = creatureFor(type, member.id, data)
          return m.reply(`✅ ${creature?.emoji || ''} *${creature?.name || member.id}* bergabung ke tim!\n> ↳ Gunakan *.${command} team* untuk melihat susunan tim.`)
        }
        if (['remove', 'delete', 'kick'].includes(subAction)) {
          const position = Number(args[2])
          if (!Number.isInteger(position) || position < 1 || position > user[fields.team].length) {
            return m.reply(`Pilih posisi anggota tim: *${prefix}${command} team remove <nomor tim>*.`)
          }
          user[fields.team].splice(position - 1, 1)
          await saveDB(db)
          return m.reply(`✅ Anggota nomor ${position} telah dikeluarkan dari tim.`)
        }
        return m.reply(`Kelola tim: *${prefix}${command} team* · *team add <nomor inventory>* · *team remove <nomor tim>* · *team clear*.`)
      }

      if (action === 'battle') {
        const targetId = getTarget(m, conn)
        if (!targetId) return m.reply(`Tandai atau reply pemain yang ingin ditantang: *${prefix}${command} battle @tag*.`)
        if (targetId === m.sender) return m.reply('Kamu tidak bisa menantang dirimu sendiri.')
        const targetData = getUserRPG(db, targetId)
        if (!targetData?.rpg || targetData.isDummy) return m.reply('Pemain tersebut belum memiliki karakter RPG terdaftar.')
        const myTeam = getTeam(user, type, data)
        const rival = targetData.rpg
        const enemyTeam = getTeam(rival, type, data)
        if (!myTeam.length || !enemyTeam.length) return m.reply(`Kedua pemain harus memiliki minimal satu anggota tim. Kelola dengan *${prefix}${command} team add <nomor inventory>*.`)
        const fighters = team => team.map(({ entry, creature }) => {
          const stats = getCombatStats(creature, entry, combatData)
          return {
            entry,
            creature,
            level: stats.level,
            hp: Math.round(stats.hp * (0.75 + Math.random() * 0.5)),
            damage: stats.damage,
            power: stats.power
          }
        })
        const sides = [fighters(myTeam), fighters(enemyTeam)]
        const cursors = [0, 0]
        let turn = 0
        const battleLog = []
        while (cursors[0] < sides[0].length && cursors[1] < sides[1].length && turn < 200) {
          const attackerSide = Math.random() < 0.5 ? 0 : 1
          const defenderSide = 1 - attackerSide
          const attacker = sides[attackerSide][cursors[attackerSide]]
          const defender = sides[defenderSide][cursors[defenderSide]]
          const critical = Math.random() < 0.12
          const damage = Math.max(1, Math.round(
            (attacker.damage + Math.floor(attacker.level / 2)) *
            (0.65 + Math.random() * 0.85) *
            (critical ? 1.75 : 1)
          ))
          defender.hp -= damage
          if (battleLog.length < 12) battleLog.push(`> ${attacker.creature.emoji} *${displayCreatureName(attacker.creature, attacker.entry)}* memakai ${attacker.power}${critical ? ' · ✨ CRITICAL' : ''} · −${damage} HP`)
          if (defender.hp <= 0) {
            battleLog.push(`> 💥 ${defender.creature.emoji} *${displayCreatureName(defender.creature, defender.entry)}* tumbang!`)
            cursors[defenderSide]++
          }
          turn++
        }
        const winnerSide = cursors[0] >= sides[0].length ? 1 : cursors[1] >= sides[1].length ? 0 : -1
        const rivalName = conn.getName(targetId) || targetData.name || 'Lawan'
        if (winnerSide === 0) {
          user[fields.stats].wins = (Number(user[fields.stats].wins) || 0) + 1
          const rivalFields = collectionFields(type)
          rival[rivalFields.stats] = rival[rivalFields.stats] || { wins: 0, losses: 0, draws: 0 }
          rival[rivalFields.stats].losses = (Number(rival[rivalFields.stats].losses) || 0) + 1
        } else if (winnerSide === 1) {
          user[fields.stats].losses = (Number(user[fields.stats].losses) || 0) + 1
          const rivalFields = collectionFields(type)
          rival[rivalFields.stats] = rival[rivalFields.stats] || { wins: 0, losses: 0, draws: 0 }
          rival[rivalFields.stats].wins = (Number(rival[rivalFields.stats].wins) || 0) + 1
        } else {
          user[fields.stats].draws = (Number(user[fields.stats].draws) || 0) + 1
          const rivalFields = collectionFields(type)
          rival[rivalFields.stats] = rival[rivalFields.stats] || { wins: 0, losses: 0, draws: 0 }
          rival[rivalFields.stats].draws = (Number(rival[rivalFields.stats].draws) || 0) + 1
        }
        await saveDB(db)
        return m.reply(
          `╭─❏「 ${pokemon ? '⚔️ POKÉMON BATTLE' : '🔮 GHOST BATTLE'} 」❏\n` +
          `│ ${m.pushName || conn.getName(m.sender) || 'Petualang'} VS ${rivalName}\n` +
          `╰─━━━━━━━━━━━━━━─\n\n` +
          `📖 ${getStory(stories, 'battle')}\n\n` +
          `${battleLog.join('\n')}\n\n` +
          `🏆 Hasil: ${winnerSide < 0 ? 'Seri!' : winnerSide === 0 ? `Kamu menang atas ${rivalName}!` : `${rivalName} memenangkan battle!`}\n\n` +
          `─━━━━━━━━━━━━━━─`
        )
      }
    }

    if (['disable', 'enable'].includes(action)) {
      if (!isAdmin && !m.isAdmin && !isOwner && !m.isOwner) {
        return m.reply('❌ Mengatur spawn otomatis hanya dapat dilakukan admin grup.')
      }
      group.autoEnabled = action === 'enable'
      group.messageCount = 0
      await saveDB(db)
      return m.reply(
        `╭─❏「 ${group.autoEnabled ? '✅ SPAWN DIAKTIFKAN' : '⏸️ SPAWN DINONAKTIFKAN'} 」❏\n` +
        `│ ${label.toUpperCase()} ENCOUNTER\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Spawn encounter otomatis ${group.autoEnabled ? 'aktif kembali' : 'dinonaktifkan'} di grup ini.\n` +
        `> ↳ Encounter personal melalui *${prefix}${command} daily* tetap tersedia.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (action === 'catch') {
      const encounterId = String(args[1] || '')
      const encounter = store.encounters[encounterId]
      if (!encounter || encounter.chat !== m.chat || encounter.type !== type) {
        return m.reply('🌫️ Encounter ini sudah berakhir atau tidak ditemukan.')
      }
      if (encounter.expiresAt <= Date.now()) {
        cleanupEncounter(store, encounter)
        await saveDB(db)
        return m.reply('⏳ Waktu encounter habis. Nantikan kesempatan berikutnya!')
      }
      if (encounter.owner && encounter.owner !== m.sender) {
        return m.reply('🔒 Encounter personal ini hanya dapat diikuti oleh pemain yang memanggilnya.')
      }
      const userData = getUserRPG(db, m.sender)
      if (!userData?.rpg || userData.isDummy) {
        return m.reply(`Daftarkan karakter RPG-mu terlebih dahulu dengan *${prefix}adventure* untuk mengoleksi ${label}.`)
      }
      const user = userData.rpg
      user[inventoryField] = user[inventoryField] || {}
      const cooldownField = `${type}CatchCooldownUntil`
      const cooldownRemaining = Math.max(0, Number(user[cooldownField]) - Date.now())
      if (cooldownRemaining > 0) {
        return m.reply(formatCooldown(userData, type, prefix, command))
      }
      if (encounter.source === 'daily') {
        const dateField = getDailyField(type, 'DailyClaimDate')
        if (user[dateField] === jakartaDate()) {
          return m.reply(`🌙 Kamu sudah mengklaim encounter harian ${label} hari ini. Coba lagi setelah reset harian!`)
        }
      }

      const creature = creatureFor(type, encounter.creatureId, data)
      if (!creature) throw new Error(`Unknown ${type} encounter creature: ${encounter.creatureId}`)
      const caught = addCreature(user, type, creature.id)
      user[cooldownField] = Date.now() + CATCH_COOLDOWN
      if (encounter.source === 'daily') user[getDailyField(type, 'DailyClaimDate')] = jakartaDate()
      cleanupEncounter(store, encounter)
      await saveDB(db)
      return m.reply(
        `╭─❏「 ${pokemon ? '🎉 POKÉMON TERTANGKAP' : '✅ INVESTIGASI BERHASIL'} 」❏\n` +
        `│ ${pokemon ? 'KOLEKSI BARU BERHASIL DIAMANKAN' : 'ENTITAS BERHASIL DITANGKAP'}\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `${creature.emoji} *${creature.name}* · ${creature.rarity}\n` +
        `> ${creature.description}\n` +
        `${pokemon ? `> ✨ Jurus khas: ${creature.power}\n` : `> 🧿 Kategori: ${creature.type} · Asal: ${creature.from}\n`}` +
        `${combatData[creature.id] ? `> ⚔️ ${combatData[creature.id].power} · DMG ${combatData[creature.id].damage}\n` : ''}` +
        `${caught.duplicate
          ? `> ✨ Duplikat menyatu! Level makhluk naik menjadi ${caught.creature.level}${caught.creature.level >= MAX_CREATURE_LEVEL ? ' (maksimum)' : ''}.\n> 🎒 Tidak menambah jumlah makhluk di inventory.\n\n`
          : `> 📈 Level awal: 1\n> 🎒 Koleksi sekarang: ×${caught.count}\n\n`}` +
        `📖 ${getStory(stories, 'catch')}\n\n` +
        `> ⏳ Cooldown tangkapan berikutnya: 30 menit. Cek dengan *${prefix}${command} cd*.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (action === 'spawn') {
      if (!isOwner && !m.isOwner) return m.reply('❌ Spawn paksa hanya tersedia untuk owner dan co-owner.')
      const input = String(args.slice(1).join(' ') || '').trim().toLowerCase()
      const creature = input
        ? (/^\d+$/.test(input)
          ? data[Number(input) - 1]
          : data.find(entry => entry.id === input.replace(/\s+/g, '_') || entry.name.toLowerCase() === input))
        : data[Math.floor(Math.random() * data.length)]
      if (!creature) return m.reply(`Makhluk tidak ditemukan. Lihat daftar dengan *${prefix}${command} list*.`)
      const active = group.activeId && store.encounters[group.activeId]
      if (active && active.expiresAt > Date.now()) {
        return m.reply('⚠️ Masih ada encounter aktif di grup ini. Selesaikan atau tunggu sampai encounter berakhir sebelum spawn paksa.')
      }
      if (active) cleanupEncounter(store, active)
      const encounter = createEncounter(store, m.chat, type, [creature], 'forced')
      group.activeId = encounter.id
      await saveDB(db)
      return sendEncounter(conn, encounter, data, prefix, null, combatData, stories)
    }

    if (action === 'daily') {
      const userData = getUserRPG(db, m.sender)
      if (!userData?.rpg || userData.isDummy) {
        return m.reply(`Daftarkan karakter RPG-mu terlebih dahulu dengan *${prefix}adventure* untuk memulai petualangan ${label}.`)
      }
      const user = userData.rpg
      const spawnDateField = getDailyField(type, 'DailySpawnDate')
      if (user[spawnDateField] === jakartaDate()) {
        return m.reply(`🌙 Encounter harian ${label} milikmu sudah digunakan hari ini. Kembali lagi setelah reset harian!`)
      }
      user[spawnDateField] = jakartaDate()
      const encounter = createEncounter(store, m.chat, type, data, 'daily', m.sender)
      await saveDB(db)
      return sendEncounter(conn, encounter, data, prefix, m.pushName || 'Petualang', combatData, stories)
    }

    if (action === 'list' || action === 'dex') {
      return m.reply(
        `╭─❏「 ${pokemon ? '📖 POKÉDEX AVELIA' : '📓 DAFTAR ENTITAS'} 」❏\n` +
        `│ ${pokemon ? `${data.length} POKÉMON MENANTI DITEMUKAN` : `${data.length} ENTITAS TERCATAT`}\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `${data.map((creature, index) => `*${String(index + 1).padStart(2, '0')}. ${creature.emoji} ${creature.name}* · ${creature.rarity}\n` +
          `> ${creature.description}\n` +
          `${pokemon ? `> ✨ Jurus: ${creature.power}` : `> 🧿 ${creature.type} · Asal: ${creature.from}`}\n` +
          `> ⚔️ ${combatData[creature.id]?.power || creature.power || 'Serangan Khusus'} · DMG ${combatData[creature.id]?.damage || 10}`).join('\n\n')}\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }

    if (['inv', 'inventory', 'koleksi'].includes(action)) {
      const userData = getUserRPG(db, m.sender)
      if (!userData?.rpg || userData.isDummy) {
        return m.reply(`Daftarkan karakter RPG-mu terlebih dahulu dengan *${prefix}adventure* untuk melihat koleksi ${label}.`)
      }
      const user = userData.rpg
      const { fields, collection } = ensureCollection(user, type)
      const subAction = String(args[1] || '').toLowerCase()
      const selectedIndex = Number(args[2]) - 1
      const selectedCreature = Number.isInteger(selectedIndex) && selectedIndex >= 0
        ? collection[selectedIndex]
        : null

      if (subAction === 'give' || subAction === 'transfer') {
        const transfers = db.data.rpgCreatureTransfers || (db.data.rpgCreatureTransfers = {})
        const transferKey = `${type}:${conn.decodeJid(m.sender)}`
        const decision = String(args[2] || '').toLowerCase()
        const pending = transfers[transferKey]
        if (['accept', 'terima', 'reject', 'tolak'].includes(decision)) {
          if (!pending || pending.expiresAt <= Date.now()) {
            delete transfers[transferKey]
            await saveDB(db)
            return m.reply('📭 Tidak ada hadiah makhluk yang menunggu keputusanmu.')
          }
          if (pending.chat !== m.chat) return m.reply('🔒 Hadiah ini hanya dapat diproses di grup tempat permintaan dikirim.')
          if (decision === 'reject' || decision === 'tolak') {
            delete transfers[transferKey]
            await saveDB(db)
            return m.reply('↩️ Hadiah ditolak. Makhluk tetap berada di koleksi pengirim.')
          }

          const senderData = getUserRPG(db, pending.from)
          if (!senderData?.rpg || senderData.isDummy) {
            delete transfers[transferKey]
            await saveDB(db)
            return m.reply('❌ Hadiah tidak dapat diproses karena data pengirim tidak tersedia.')
          }
          const senderCollection = ensureCollection(senderData.rpg, type).collection
          const senderIndex = senderCollection.findIndex(entry => entry.uid === pending.creatureUid)
          if (senderIndex < 0) {
            delete transfers[transferKey]
            await saveDB(db)
            return m.reply('❌ Hadiah batal karena makhluk tersebut sudah tidak ada di koleksi pengirim.')
          }
          const giftedCreature = removeCreature(senderData.rpg, type, senderIndex)
          delete giftedCreature.pendingRelease
          const receiver = ensureCollection(user, type)
          receiver.collection.push(giftedCreature)
          const inventory = user[receiver.fields.inventory]
          inventory[giftedCreature.id] = Number(inventory[giftedCreature.id] || 0) + 1
          delete transfers[transferKey]
          await saveDB(db)
          const creature = creatureFor(type, giftedCreature.id, data)
          return m.reply(
            `╭─❏「 🎁 HADIAH DITERIMA 」❏\n` +
            `│ ${pokemon ? 'POKÉMON BARU BERGABUNG' : 'ENTITAS BARU DIARSIPKAN'}\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `${creature?.emoji || '✨'} *${displayCreatureName(creature, giftedCreature)}*\n` +
            `> ↳ Level, XP, dan nama panggilan ikut berpindah.\n` +
            `> ↳ Hadiah berhasil masuk ke inventory-mu!\n\n` +
            `─━━━━━━━━━━━━━━─`
          )
        }

        if (!selectedCreature) {
          return m.reply(
            `╭─❏「 🎁 KIRIM HADIAH 」❏\n│ Bagikan koleksi petualanganmu\n╰─━━━━━━━━━━━━━━─\n\n` +
            `> ↳ Format: *${prefix}${command} inv give <nomor inventory> @tag*\n` +
            `> ↳ Bisa juga reply pesan penerima.\n` +
            `> ↳ Penerima harus menerima hadiah sebelum makhluk berpindah.\n` +
            `> ↳ Terima/tolak: *${prefix}${command} inv give accept* atau *reject*.\n\n` +
            `─━━━━━━━━━━━━━━─`
          )
        }
        const targetId = getTarget(m, conn)
        if (!targetId) return m.reply(`Tandai penerima atau reply pesannya: *${prefix}${command} inv give ${selectedIndex + 1} @tag*.`)
        if (targetId === conn.decodeJid(m.sender)) return m.reply('🎁 Kamu tidak bisa mengirim hadiah ke dirimu sendiri.')
        const targetData = getUserRPG(db, targetId)
        if (!targetData?.rpg || targetData.isDummy) return m.reply('Penerima belum memiliki karakter RPG terdaftar.')
        if (transfers[`${type}:${targetId}`]?.expiresAt > Date.now()) {
          return m.reply('📭 Penerima masih memiliki hadiah serupa yang menunggu keputusan. Minta ia menerimanya atau menolaknya terlebih dahulu.')
        }
        const creature = creatureFor(type, selectedCreature.id, data)
        transfers[`${type}:${targetId}`] = {
          type,
          from: conn.decodeJid(m.sender),
          to: targetId,
          chat: m.chat,
          creatureUid: selectedCreature.uid,
          expiresAt: Date.now() + 5 * 60 * 1000
        }
        await saveDB(db)
        const giftText = `╭─❏「 🎁 HADIAH MENUNGGU 」❏\n│ ${m.pushName || conn.getName(m.sender) || 'Petualang'} ingin berbagi koleksi\n╰─━━━━━━━━━━━━━━─\n\n` +
            `${creature?.emoji || '✨'} *${displayCreatureName(creature, selectedCreature)}* · Lv.${selectedCreature.level || 1}\n` +
            `> ↳ Penerima: @${targetId.split('@')[0]}\n` +
            `> ↳ Hadiah berlaku selama 5 menit.\n` +
            `> ↳ Makhluk berpindah setelah penerima memilih.\n\n` +
            `─━━━━━━━━━━━━━━─`
        return sendRpgButtons(conn, {
          chat: m.chat,
          title: '🎁 HADIAH PETUALANGAN',
          subtitle: 'Pilih terima atau tolak',
          text: giftText,
          buttonText: '📩 KEPUTUSAN HADIAH',
          buttons: [
            [`✅ Terima ${pokemon ? 'Pokémon' : 'entitas'}`, `${prefix}${command} inv give accept`],
            ['↩️ Tolak hadiah', `${prefix}${command} inv give reject`]
          ],
          mentions: [targetId],
          fallbackText: `${giftText}\n> ↳ Terima: *${prefix}${command} inv give accept*\n> ↳ Tolak: *${prefix}${command} inv give reject*`,
          noThumbnail: true
        })
      }

      if (subAction === 'rename') {
        const index = Number(args[2]) - 1
        const target = Number.isInteger(index) && index >= 0 ? collection[index] : null
        const nickname = args.slice(3).join(' ').trim().replace(/[\u0000-\u001f\u007f]/g, '')
        if (!target || !nickname) {
          return m.reply(`╭─❏「 🏷️ GANTI NAMA 」❏\n│ Personalisasikan makhluk koleksimu\n╰─━━━━━━━━━━━━━━─\n\n> ↳ Format: *${prefix}${command} inv rename <nomor inventory> <nama baru>*\n> ↳ Contoh: *${prefix}${command} inv rename ${target ? index + 1 : '1'} SiBulat*\n> ↳ Nama maksimal 24 karakter.\n\n─━━━━━━━━━━━━━━─`)
        }
        if (nickname.length > 24) return m.reply('Nama terlalu panjang. Gunakan maksimal 24 karakter.')
        target.nickname = nickname
        await saveDB(db)
        const creature = creatureFor(type, target.id, data)
        return m.reply(`✨ ${creature?.emoji || ''} Nama baru berhasil disimpan: *${nickname}*${creature ? `\n> ↳ Spesies: ${creature.name}` : ''}`)
      }

      if (subAction === 'favorite' || subAction === 'fav') {
        if (!selectedCreature) return m.reply(`Pilih makhluk dari inventory: *${prefix}${command} inv favorite <nomor>*.`)
        selectedCreature.favorite = !selectedCreature.favorite
        await saveDB(db)
        const creature = creatureFor(type, selectedCreature.id, data)
        return m.reply(`${selectedCreature.favorite ? '⭐ Ditambahkan ke favorit' : '☆ Dihapus dari favorit'}: *${displayCreatureName(creature, selectedCreature)}*.`)
      }

      if (subAction === 'detail' || subAction === 'info') {
        if (!selectedCreature) return m.reply(`Pilih makhluk dari inventory: *${prefix}${command} inv detail <nomor>*.`)
        const creature = creatureFor(type, selectedCreature.id, data)
        if (!creature) return m.reply('Makhluk tersebut tidak ditemukan di data koleksi.')
        const stats = getCombatStats(creature, selectedCreature, combatData)
        return sendRpgButtons(conn, {
          chat: m.chat,
          title: `${creature.emoji} ${displayCreatureName(creature, selectedCreature)}`,
          subtitle: `Lv.${stats.level} · ${creature.rarity}`,
          text: `╭─❏「 📜 DETAIL KOLEKSI 」❏\n│ ${pokemon ? 'DATA POKÉMON' : 'ARSIP ENTITAS'}\n╰─━━━━━━━━━━━━━━─\n\n` +
            `> ${creature.description}\n` +
            `${pokemon ? `> ✨ Jurus: ${creature.power}\n` : `> 🧿 Kategori: ${creature.type}\n> 📍 Asal: ${creature.from}\n`}` +
            `> 📈 Level: ${stats.level} · XP: ${selectedCreature.xp || 0}/${TRAINING_XP_PER_LEVEL}\n` +
            `> ⚔️ ${stats.power} · DMG ${stats.damage}\n` +
            `> ${selectedCreature.favorite ? '⭐ Favorit' : '☆ Belum difavoritkan'}\n\n─━━━━━━━━━━━━━━─`,
          buttonText: '✨ KELOLA MAKHLUK',
          sections: [{
            title: 'Aksi koleksi',
            rows: [
              { title: '📈 Latih', description: 'Tambah XP untuk naik level', id: `${prefix}${command} train ${selectedIndex + 1}` },
              { title: '⭐ Favorit', description: 'Tandai atau hapus tanda favorit', id: `${prefix}${command} inv favorite ${selectedIndex + 1}` },
              { title: '🛡️ Masukkan tim', description: 'Tambahkan makhluk ke tim battle', id: `${prefix}${command} team add ${selectedIndex + 1}` },
              { title: '🏷️ Ganti nama', description: 'Beri nama panggilan khusus', id: `${prefix}${command} inv rename ${selectedIndex + 1}` },
              { title: '🎁 Berikan ke pemain', description: 'Kirim hadiah melalui tag atau reply', id: `${prefix}${command} inv give ${selectedIndex + 1}` },
              { title: '🕊️ Lepaskan', description: 'Lepaskan makhluk dari koleksi', id: `${prefix}${command} inv release ${selectedIndex + 1}` },
              { title: '🎒 Kembali ke inventory', description: 'Lihat seluruh koleksi', id: `${prefix}${command} inv` }
            ]
          }],
          fallbackText: `Detail ${creature.name}: Lv.${stats.level} · ${stats.power} · DMG ${stats.damage}\n> ↳ ${prefix}${command} train ${selectedIndex + 1}\n> ↳ ${prefix}${command} inv favorite ${selectedIndex + 1}\n> ↳ ${prefix}${command} team add ${selectedIndex + 1}`,
          noThumbnail: true
        })
      }

      if (subAction === 'release' || subAction === 'lepas') {
        if (args[2] === 'cancel' || args[2] === 'no') {
          const pending = collection.find(entry => entry.pendingRelease)
          if (pending) delete pending.pendingRelease
          await saveDB(db)
          return m.reply('✅ Pelepasan dibatalkan. Seluruh makhlukmu tetap aman di koleksi.')
        }
        if (args[2] === 'confirm') {
          const uid = String(args[3] || '')
          const index = collection.findIndex(entry => entry.uid === uid)
          const target = index >= 0 ? collection[index] : null
          if (!target || !target.pendingRelease || target.pendingRelease < Date.now()) {
            return m.reply('⌛ Konfirmasi pelepasan tidak ditemukan atau sudah kedaluwarsa. Jalankan perintah release kembali dari inventory.')
          }
          const creature = creatureFor(type, target.id, data)
          collection.splice(index, 1)
          user[fields.inventory][target.id] = Math.max(0, Number(user[fields.inventory][target.id] || 1) - 1)
          if (!user[fields.inventory][target.id]) delete user[fields.inventory][target.id]
          user[fields.team] = user[fields.team].filter(teamUid => teamUid !== uid)
          await saveDB(db)
          return m.reply(
            `╭─❏「 🕊️ PELEPASAN BERHASIL 」❏\n` +
            `│ ${displayCreatureName(creature, target)} kembali ke alamnya\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `📖 ${getStory(stories, 'release')}\n` +
            `> ↳ Koleksimu kini memiliki ${collection.length} makhluk.\n\n` +
            `─━━━━━━━━━━━━━━─`
          )
        }
        if (!selectedCreature) return m.reply(`Pilih makhluk yang ingin dilepas: *${prefix}${command} inv release <nomor inventory>*.`)
        const creature = creatureFor(type, selectedCreature.id, data)
        selectedCreature.pendingRelease = Date.now() + 2 * 60 * 1000
        await saveDB(db)
        return sendRpgButtons(conn, {
          chat: m.chat,
          title: '🕊️ KONFIRMASI PELEPASAN',
          subtitle: 'Pastikan pilihanmu sebelum melanjutkan',
          text: `╭─❏「 🕊️ LEPAS DARI KOLEKSI 」❏\n│ ${creature?.emoji || ''} ${displayCreatureName(creature, selectedCreature)}\n╰─━━━━━━━━━━━━━━─\n\n` +
            `Makhluk ini akan dihapus dari inventory${user[fields.team].includes(selectedCreature.uid) ? ' dan dikeluarkan dari tim battle' : ''}.\n` +
            `> ↳ Konfirmasi berlaku selama 2 menit.\n\n` +
            `─━━━━━━━━━━━━━━─`,
          buttonText: 'PILIH TINDAKAN',
          buttons: [
            ['🕊️ Ya, lepaskan', `${prefix}${command} inv release confirm ${selectedCreature.uid}`],
            ['↩️ Batalkan', `${prefix}${command} inv release cancel`]
          ],
          fallbackText: `Konfirmasi: *${prefix}${command} inv release confirm ${selectedCreature.uid}*\nBatalkan: *${prefix}${command} inv release cancel*`,
          noThumbnail: true
        })
      }

      if (subAction) {
        return m.reply(`╭─❏「 🎒 KELOLA INVENTORY 」❏\n│ Aksi koleksi ${label}\n╰─━━━━━━━━━━━━━━─\n\n` +
          `> ↳ Detail: *${prefix}${command} inv detail <nomor>*\n` +
          `> ↳ Ganti nama: *${prefix}${command} inv rename <nomor> <nama>*\n` +
          `> ↳ Favorit: *${prefix}${command} inv favorite <nomor>*\n` +
          `> ↳ Berikan: *${prefix}${command} inv give <nomor> @tag* atau reply pesan penerima\n` +
          `> ↳ Lepaskan: *${prefix}${command} inv release <nomor>*\n` +
          `> ↳ Latih: *${prefix}${command} train <nomor>*\n` +
          `> ↳ Susun tim: *${prefix}${command} team add <nomor>*\n\n─━━━━━━━━━━━━━━─`)
      }

      return sendRpgButtons(conn, {
        chat: m.chat,
        title: pokemon ? '🎒 POKÉDEX PRIBADI' : '🧿 ARSIP HUNTER',
        subtitle: 'Kelola koleksi dan pilih aksi favoritmu',
        text: formatInventory(userData, data, type, combatData) +
          `\n\n✨ *AKSI INVENTORY*\n> ↳ Detail, rename, favorit, release, latihan, dan pengaturan tim tersedia.\n> ↳ Pilih makhluk dengan nomor yang tertera di atas.`,
        buttonText: '📋 KELOLA KOLEKSI',
        sections: [{
          title: 'Pilih aksi inventory',
          rows: [
            { title: '📜 Detail makhluk', description: 'Lihat statistik dan aksi per makhluk', id: `${prefix}${command} inv detail` },
            { title: '🏷️ Ganti nama', description: 'Beri nama panggilan pada koleksi', id: `${prefix}${command} inv rename` },
            { title: '⭐ Favorit', description: 'Tandai makhluk andalanmu', id: `${prefix}${command} inv favorite` },
            { title: '🎁 Berikan makhluk', description: 'Kirim koleksi ke pemain lain', id: `${prefix}${command} inv give` },
            { title: '🕊️ Lepaskan makhluk', description: 'Lepas dengan konfirmasi aman', id: `${prefix}${command} inv release` },
            { title: '📈 Latihan', description: 'Naikkan level makhluk pilihan', id: `${prefix}${command} train` },
            { title: '🛡️ Kelola tim', description: 'Atur hingga empat anggota tim', id: `${prefix}${command} team` }
          ]
        }],
        fallbackText: `${formatInventory(userData, data, type, combatData)}\n\n` +
          `Aksi: *${prefix}${command} inv detail <nomor>* · *inv rename <nomor> <nama>* · *inv favorite <nomor>* · *inv give <nomor> @tag* · *inv release <nomor>*`,
        noThumbnail: true
      })
    }

    if (['guide', 'panduan'].includes(action)) return m.reply(guideText(type, prefix))

    if (['command', 'commands', 'cmd'].includes(action)) {
      const helpRows = [
        { title: '📖 Panduan', description: 'Pelajari cara menemukan dan menangkap', id: `${prefix}${command} guide` },
        { title: '📋 Daftar makhluk', description: `Jelajahi semua ${data.length} makhluk`, id: `${prefix}${command} list` },
        { title: '🎒 Koleksiku', description: 'Lihat dan kelola seluruh koleksi', id: `${prefix}${command} inv` },
        { title: '🌙 Encounter harian', description: 'Panggil encounter pribadi hari ini', id: `${prefix}${command} daily` },
        { title: '🌟 Profil petualang', description: 'Lihat koleksi, title, dan rekor battle', id: `${prefix}${command} profile` },
        { title: '🏅 Title', description: 'Periksa tingkatan title koleksimu', id: `${prefix}${command} title` },
        { title: '🛡️ Susun tim', description: 'Atur hingga empat anggota untuk bertarung', id: `${prefix}${command} team` },
        { title: '🏆 Leaderboard', description: 'Lihat petualang dengan tangkapan terbanyak', id: `${prefix}${command} top` },
        { title: '⚔️ Battle', description: 'Tantang pemain lewat tag atau reply', id: `${prefix}${command} battle` },
        { title: '📈 Latihan', description: 'Latihan memakai cooldown 30 menit', id: `${prefix}${command} train 1` },
        { title: '⏳ Cooldown', description: 'Cek cooldown tangkapan dan latihan', id: `${prefix}${command} cd` }
      ]
      if (isAdmin || m.isAdmin || isOwner || m.isOwner) {
        helpRows.push(
          { title: '⏸️ Matikan spawn grup', description: 'Nonaktifkan encounter otomatis di grup ini', id: `${prefix}${command} disable` },
          { title: '▶️ Aktifkan spawn grup', description: 'Aktifkan kembali encounter otomatis', id: `${prefix}${command} enable` }
        )
      }
      if (isOwner || m.isOwner) {
        helpRows.push({ title: '✨ Spawn paksa', description: `Spawn ${label} khusus di grup ini`, id: `${prefix}${command} spawn` })
      }
      return sendRpgButtons(conn, {
        chat: m.chat,
        title: pokemon ? '✨ POKÉMON ADVENTURE' : '👻 GHOST HUNTER',
        subtitle: 'Pilih petualanganmu',
        text: pokemon
          ? 'Jelajahi dunia, temukan Pokémon, dan lengkapi Pokédex-mu!'
          : 'Ikuti sinyal misterius, pecahkan petunjuk, dan kumpulkan entitas!',
        buttonText: pokemon ? '🌿 JELAJAHI POKÉMON' : '🧿 BUKA PERLENGKAPAN HUNTER',
        sections: [{ title: pokemon ? 'Petualangan Pokémon' : 'Perlengkapan Ghost Hunter', rows: helpRows }],
        fallbackText: `${guideText(type, prefix)}\n> ↳ ${prefix}${command} list\n> ↳ ${prefix}${command} inv\n> ↳ ${prefix}${command} daily`,
        noThumbnail: true
      })
    }

    if (!action || action === 'menu') {
      return sendRpgButtons(conn, {
        chat: m.chat,
        title: pokemon ? '🌿 POKÉMON ADVENTURE' : '🌙 GHOST HUNTER',
        subtitle: pokemon ? 'Setiap pertemuan menyimpan cerita baru' : 'Dengarkan sinyal di balik kabut',
        text: pokemon
          ? 'Temukan Pokémon langka, tangkap mereka lebih dulu, dan bangun koleksi impianmu.'
          : 'Selidiki penampakan misterius dan abadikan setiap entitas ke dalam catatanmu.',
        buttonText: pokemon ? '✨ MULAI PETUALANGAN' : '📡 MULAI INVESTIGASI',
        sections: [{
          title: pokemon ? 'Jelajahi dunia Pokémon' : 'Pusat investigasi paranormal',
          rows: [
            { title: '📖 Panduan', description: 'Kenali aturan petualangan', id: `${prefix}${command} guide` },
            { title: '📚 Daftar makhluk', description: `Temukan seluruh ${data.length} makhluk`, id: `${prefix}${command} list` },
            { title: '🎒 Koleksiku', description: 'Periksa dan kelola hasil tangkapan', id: `${prefix}${command} inv` },
            { title: '🌙 Encounter harian', description: 'Panggil encounter pribadimu', id: `${prefix}${command} daily` },
            { title: '🌟 Profil petualang', description: 'Lihat progress dan rekor battle', id: `${prefix}${command} profile` },
            { title: '🏅 Title', description: 'Lihat prestasi koleksimu', id: `${prefix}${command} title` },
            { title: '🛡️ Tim', description: 'Atur hingga empat anggota battle', id: `${prefix}${command} team` },
            { title: '🏆 Leaderboard', description: 'Cek peringkat tangkapan', id: `${prefix}${command} top` },
            { title: '📈 Latihan', description: 'Naikkan level · cooldown 30 menit', id: `${prefix}${command} train 1` },
            { title: '⚔️ Battle', description: 'Tantang pemain lewat reply/tag', id: `${prefix}${command} battle` },
            { title: '⏳ Cooldown', description: 'Cek cooldown tangkapan dan latihan', id: `${prefix}${command} cooldown` },
            { title: '📋 Daftar command', description: 'Lihat semua perintah yang tersedia', id: `${prefix}${command} command` }
          ]
        }],
        fallbackText: `${guideText(type, prefix)}\n> ↳ ${prefix}${command} list\n> ↳ ${prefix}${command} inv\n> ↳ ${prefix}${command} daily`,
        noThumbnail: true
      })
    }

    return m.reply(
      `╭─❏「 ❔ PERINTAH TIDAK DIKENAL 」❏\n` +
      `│ ${label.toUpperCase()}\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Buka menu: *${prefix}${command} menu*.\n` +
      `> ↳ Baca panduan: *${prefix}${command} guide*.\n` +
      `> ↳ Daftar command: *${prefix}${command} command*.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  if (type === 'pokemon') {
    handler.before = async function (m, { conn }) {
      if (!m?.isGroup || !m.sender || m.fromMe || m.isBaileys) return false
      const db = loadDB()
      const store = ensureEncounterStore(db.data)
      let pruned = pruneExpiredEncounters(store)
      const group = ensureGroupState(store, m.chat)
      const active = group.activeId && store.encounters[group.activeId]
      if (active && active.expiresAt <= Date.now()) {
        cleanupEncounter(store, active)
        pruned = true
      } else if (group.activeId && !active) {
        group.activeId = null
        pruned = true
      }

      if (group.autoEnabled) {
        const previousMessageCount = group.messageCount
        group.messageCount = Math.min(AUTO_SPAWN_EVERY, group.messageCount + 1)
        if (group.messageCount >= AUTO_SPAWN_EVERY && !group.activeId) {
          group.messageCount = 0
          const nextType = group.nextType
          const nextData = nextType === 'pokemon'
            ? data
            : (await import('./ghostHunterData.js')).GHOST_HUNTER_DATA
          const nextCombatData = nextType === 'pokemon'
            ? combatData
            : (await import('./ghostHunterData.js')).GHOST_COMBAT_DATA
          const nextStories = nextType === 'pokemon'
            ? stories
            : (await import('./ghostHunterData.js')).GHOST_HUNTER_STORIES
          const encounter = createEncounter(store, m.chat, nextType, nextData, 'auto')
          group.activeId = encounter.id
          group.nextType = nextType === 'pokemon' ? 'ghost' : 'pokemon'
          await saveDB(db)
          await sendEncounter(conn, encounter, nextData, getAutoSpawnPrefix(conn), null, nextCombatData, nextStories)
        } else if (pruned || (group.messageCount !== previousMessageCount && group.messageCount % 10 === 0)) {
          await saveDB(db)
        }
      } else if (pruned) {
        await saveDB(db)
      }
      return false
    }
  }

  handler.help = [
    command, `${command} menu`, `${command} guide`, `${command} command`, `${command} list`,
    `${command} inv`, `${command} inv detail`, `${command} inv rename`, `${command} inv favorite`,
    `${command} inv release`, `${command} inv give`, `${command} inventory`, `${command} daily`, `${command} profile`,
    `${command} title`, `${command} top`, `${command} lb`, `${command} leaderboard`,
    `${command} train`, `${command} team`, `${command} battle`, `${command} cd`, `${command} cooldown`, `${command} disable`,
    `${command} enable`, `${command} spawn`
  ]
  handler.tags = ['rpg']
  handler.command = [command]
  handler.group = true
  return handler
}
