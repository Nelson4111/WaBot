import assert from 'node:assert/strict'
import { formatMaintenanceMessage, setMaintenanceMode } from '../lib/maintenance.js'

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

console.log('maintenance tests passed')
