import test from 'node:test'
import assert from 'node:assert/strict'

import { checkLevelUp } from './levelling.js'

test('checkLevelUp skips notification when group autolevelup is disabled', async () => {
  const previousDb = global.db
  global.db = {
    data: {
      users: {
        '123@s.whatsapp.net': {
          exp: 2000,
          level: 0,
          autolevelup: true
        }
      },
      chats: {
        '999@g.us': {
          autolevelup: false
        }
      }
    }
  }

  const conn = {
    decodeJid: (jid) => jid,
    chats: {},
    groupMetadata: async () => ({ participants: [] }),
    sendButtonV2: async () => {
      throw new Error('sendButtonV2 should not be called')
    },
    sendMessage: async () => {
      throw new Error('sendMessage should not be called')
    }
  }

  const result = await checkLevelUp({
    sender: '123@s.whatsapp.net',
    chat: '999@g.us',
    isGroup: true
  }, conn)

  assert.equal(result, false)
  assert.equal(global.db.data.users['123@s.whatsapp.net'].level, 0)

  global.db = previousDb
})

test('checkLevelUp skips notification below configured minimum level', async () => {
  const previousDb = global.db
  global.db = {
    data: {
      users: {
        '456@s.whatsapp.net': {
          exp: 2000,
          level: 0,
          autolevelup: true
        }
      },
      chats: {
        '777@g.us': {
          autolevelup: true,
          autolevelupLevel: 25
        }
      }
    }
  }

  const conn = {
    decodeJid: (jid) => jid,
    chats: {},
    groupMetadata: async () => ({ participants: [] }),
    sendButtonV2: async () => {
      throw new Error('sendButtonV2 should not be called')
    },
    sendMessage: async () => {
      throw new Error('sendMessage should not be called')
    }
  }

  const result = await checkLevelUp({
    sender: '456@s.whatsapp.net',
    chat: '777@g.us',
    isGroup: true
  }, conn)

  assert.equal(result, false)
  assert.equal(global.db.data.users['456@s.whatsapp.net'].level, 0)

  global.db = previousDb
})
