import assert from 'node:assert/strict'
import {
  formatMaintenanceMessage,
  isMaintenanceBlockingCommand,
  isRpgCommand,
  isRpgPlugin,
  shouldSkipRpgPlugin,
  setMaintenanceMode,
  setRpgMaintenanceMode
} from '../lib/maintenance.js'
import {
  normalizeRpgMaintenanceData,
  previewRpgMaintenanceNormalization
} from '../lib/rpgMaintenanceNormalizer.js'

const opts = { maintenance: false, owneronly: false, self: false }
const settings = {}

setMaintenanceMode(true, opts, settings, 1000)
assert.deepEqual(opts, { maintenance: true, owneronly: true, self: true, maintenanceStartedAt: 1000 })
assert.deepEqual(settings, {
  maintenance: true,
  owneronly: true,
  self: true,
  maintenanceStartedAt: 1000
})
const maintenanceStartedAt = opts.maintenanceStartedAt

setMaintenanceMode(true, opts, settings, 2000)
assert.equal(opts.maintenanceStartedAt, maintenanceStartedAt)
setMaintenanceMode(false, opts, settings)
assert.deepEqual(opts, { maintenance: false, owneronly: false, self: false, maintenanceStartedAt: null })
assert.deepEqual(settings, { maintenance: false, owneronly: false, self: false, maintenanceStartedAt: null })

const notice = formatMaintenanceMessage('!', maintenanceStartedAt, maintenanceStartedAt + 90061000)
assert.match(notice, /AVELIA MAINTENANCE/)
assert.match(notice, /\*!news 1\*/)
assert.match(notice, /setelah maintenance selesai/)
assert.match(notice, /Maintenance berlangsung: \*1 hari 1 jam 1 menit 1 detik\*/)

setRpgMaintenanceMode(true, opts, settings, 3000)
assert.equal(opts.rpgMaintenance, true)
assert.equal(opts.rpgMaintenanceStartedAt, 3000)
assert.equal(settings.rpgMaintenanceStartedAt, 3000)
setRpgMaintenanceMode(true, opts, settings, 4000)
assert.equal(opts.rpgMaintenanceStartedAt, 3000)
setRpgMaintenanceMode(false, opts, settings)
assert.equal(opts.rpgMaintenance, false)
assert.equal(settings.rpgMaintenance, false)

assert.equal(isRpgPlugin('rpg/rpg-bank.js', {}), true)
assert.equal(isRpgPlugin('misc/example.js', { tags: ['rpg'] }), true)
assert.equal(isRpgPlugin('misc/example.js', { tags: ['info'] }), false)
assert.equal(shouldSkipRpgPlugin('rpg/rpg-bank.js', {}, true, false), true)
assert.equal(shouldSkipRpgPlugin('rpg/rpg-bank.js', {}, true, true), false)
assert.equal(shouldSkipRpgPlugin('rpg/rpg-bank.js', {}, false, false), false)
assert.equal(isRpgCommand('bank', {
  'rpg/rpg-bank.js': { command: /^bank$/i },
  'info/news.js': { command: /^news$/i }
}), true)
assert.equal(isRpgCommand('news', {
  'rpg/rpg-bank.js': { command: /^bank$/i },
  'info/news.js': { command: /^news$/i }
}), false)
const maintenancePlugins = {
  'rpg/rpg-bank.js': { command: /^bank$/i },
  'info/news.js': { command: /^news$/i }
}
assert.equal(isMaintenanceBlockingCommand({
  command: 'bank',
  plugins: maintenancePlugins,
  maintenanceActive: true,
  isOwner: true
}), false)
assert.equal(isMaintenanceBlockingCommand({
  command: 'bank',
  plugins: maintenancePlugins,
  rpgMaintenanceActive: true,
  isOwner: true
}), false)
assert.equal(isMaintenanceBlockingCommand({
  command: 'bank',
  plugins: maintenancePlugins,
  rpgMaintenanceActive: true,
  isOwner: false
}), true)
assert.equal(isMaintenanceBlockingCommand({
  command: 'news',
  plugins: maintenancePlugins,
  rpgMaintenanceActive: true,
  isOwner: false
}), false)

const rpgNotice = formatMaintenanceMessage('.', 1000, 2000, 'rpg')
assert.match(rpgNotice, /Fitur RPG sementara tidak tersedia/)
assert.match(rpgNotice, /perubahan saldo atau nominal/)

const normalizationStart = Date.parse('2026-10-24T12:00:00+07:00')
const normalizationNow = Date.parse('2026-10-25T12:00:00+07:00')
const normalizationData = {
  users: {
    '111@s.whatsapp.net': {
      money: 500,
      dailyStreak: 7,
      dailyDate: '2026-10-24',
      lastDaily: normalizationStart,
      rpg: {
        pets: [{ tipe: 'kucing', energy: 0, happy: 2, dirty: 99, lastFeed: 10 }],
        sanctuary: [{ tipe: 'anjing', energy: 0, happy: 1, dirty: 100, mati: 20 }],
        kids: [{ nama: 'Anak Rumah', lastCaredAt: 1, facility: { type: 'daycare' } }],
        shelterKids: [{ nama: 'Anak Shelter', shelterStatus: { reason: 'runaway' }, lastCaredAt: 1 }],
        orphanageKids: [],
        dapur: { antrian: [{ nama: 'nasi', selesai: normalizationStart - 3600000 }] },
        ladang: { 1: { jenis: 'padi', waktuTanam: normalizationStart - 3600000 } },
        jobWorkCooldowns: { Petani: normalizationNow + 3600000 },
        lastkerja: normalizationStart,
        dailyStreak: 7,
        dailyDate: '2026-10-24',
        lastDaily: normalizationStart
      }
    }
  },
  status: { '111@s.whatsapp.net': { mood: 1, lapar: 0, afinitas: 8 } },
  lastMoodTick: { '111@s.whatsapp.net': normalizationStart }
}
const originalMoney = normalizationData.users['111@s.whatsapp.net'].money
const preview = previewRpgMaintenanceNormalization(normalizationData, {
  now: normalizationNow,
  maintenanceStartedAt: normalizationStart
})
assert.equal(preview.players, 1)
assert.equal(preview.petsRestored, 2)
assert.equal(preview.childrenReturned, 2)
assert.equal(preview.childrenReset, 2)
assert.equal(preview.mealsCompleted, 1)
assert.equal(preview.cropsReadied, 1)
assert.equal(preview.jobsUnlocked, 1)
assert.equal(preview.dailyStreaksProtected, 1)
assert.equal(preview.relationshipsRestored, 1)
assert.equal(normalizationData.users['111@s.whatsapp.net'].rpg.pets[0].energy, 0)

const normalized = normalizeRpgMaintenanceData(normalizationData, {
  now: normalizationNow,
  maintenanceStartedAt: normalizationStart
})
const normalizedUser = normalizationData.users['111@s.whatsapp.net']
assert.deepEqual(normalized, preview)
assert.equal(normalizedUser.rpg.pets.length, 2)
assert.ok(normalizedUser.rpg.pets.every(pet => pet.energy === 100 && pet.happy === 100 && pet.dirty === 0))
assert.equal(normalizedUser.rpg.sanctuary.length, 0)
assert.deepEqual(normalizedUser.rpg.kids.map(child => child.nama), ['Anak Rumah', 'Anak Shelter'])
assert.equal(normalizedUser.rpg.shelterKids.length, 0)
assert.equal(normalizedUser.rpg.orphanageKids.length, 0)
assert.ok(normalizedUser.rpg.kids.every(child => !child.facility && !child.shelterStatus))
assert.equal(normalizedUser.rpg.dapur.antrian[0].selesai, normalizationNow)
assert.equal(normalizedUser.rpg.ladang[1].waktuTanam, 0)
assert.equal(normalizedUser.rpg.jobWorkCooldowns.Petani, 0)
assert.equal(normalizedUser.rpg.lastkerja, 0)
assert.equal(normalizedUser.dailyDate, '2026-10-24')
assert.equal(normalizedUser.dailyStreak, 7)
assert.equal(normalizedUser.lastDaily, 0)
assert.equal(normalizedUser.rpg.lastDaily, 0)
assert.equal(normalizationData.status['111@s.whatsapp.net'].mood, 100)
assert.equal(normalizationData.status['111@s.whatsapp.net'].lapar, 100)
assert.equal(normalizationData.lastMoodTick['111@s.whatsapp.net'], normalizationNow)
assert.equal(normalizedUser.money, originalMoney)

console.log('maintenance tests passed')
