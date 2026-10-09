import assert from 'node:assert/strict'
import {
  filterLeaderboardUsers,
  getLeaderboardUserIdentity,
  isLeaderboardBot
} from '../lib/leaderboardPrivacy.js'

const mainBot = { user: { id: '6281111111111@s.whatsapp.net' } }
global.conn = mainBot
global.jadibots = new Map([
  ['6282222222222', { sock: { user: { id: '6282222222222@s.whatsapp.net' } } }]
])

assert.equal(isLeaderboardBot('6281111111111@s.whatsapp.net', mainBot), true)
assert.equal(isLeaderboardBot('6282222222222@s.whatsapp.net', mainBot), true)
assert.deepEqual(
  filterLeaderboardUsers(
    ['6281111111111@s.whatsapp.net', '6282222222222@s.whatsapp.net', '6283333333333@s.whatsapp.net'],
    mainBot
  ),
  ['6283333333333@s.whatsapp.net']
)

const inGroupJid = '6281234567827@s.whatsapp.net'
const groupMetadata = {
  participants: [{ id: inGroupJid }]
}
assert.deepEqual(
  getLeaderboardUserIdentity(inGroupJid, { conn: mainBot, groupMetadata }),
  { isGroupMember: true, display: '@6281234567827', mention: inGroupJid }
)
assert.deepEqual(
  getLeaderboardUserIdentity('6282287654327@s.whatsapp.net', { conn: mainBot, groupMetadata }),
  { isGroupMember: false, display: '@+62 822xxx27', mention: null }
)
assert.deepEqual(
  getLeaderboardUserIdentity('123456789@lid', { conn: mainBot, groupMetadata }),
  { isGroupMember: false, display: '@pengguna', mention: null }
)

console.log('leaderboard privacy tests passed')
