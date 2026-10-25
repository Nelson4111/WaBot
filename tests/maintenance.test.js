import assert from 'node:assert/strict'
import {
  formatMaintenanceMessage,
  isRpgCommand,
  isRpgPlugin,
  setMaintenanceMode,
  setRpgMaintenanceMode
} from '../lib/maintenance.js'

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
assert.equal(isRpgCommand('bank', {
  'rpg/rpg-bank.js': { command: /^bank$/i },
  'info/news.js': { command: /^news$/i }
}), true)
assert.equal(isRpgCommand('news', {
  'rpg/rpg-bank.js': { command: /^bank$/i },
  'info/news.js': { command: /^news$/i }
}), false)

const rpgNotice = formatMaintenanceMessage('.', 1000, 2000, 'rpg')
assert.match(rpgNotice, /Fitur RPG sementara tidak tersedia/)
assert.match(rpgNotice, /perubahan saldo atau nominal/)

console.log('maintenance tests passed')
