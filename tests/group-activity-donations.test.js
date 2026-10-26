import test from 'node:test'
import assert from 'node:assert/strict'
import {
  sendGroupActivityDonationNotice,
  trackGroupOutgoingMessage
} from '../lib/groupActivityDonations.js'

function withDatabase(data, callback) {
  const originalDb = global.db
  const originalMessageIds = global.groupActivityDonationMessageIds
  global.db = { data }
  global.groupActivityDonationMessageIds = new Set()
  return Promise.resolve(callback()).finally(() => {
    global.db = originalDb
    global.groupActivityDonationMessageIds = originalMessageIds
  })
}

test('activity count is isolated per group and only counts group messages', async () => {
  await withDatabase({ settings: {} }, async () => {
    const conn = { user: { jid: '12345@s.whatsapp.net' } }

    await trackGroupOutgoingMessage(conn, 'one@g.us')
    await trackGroupOutgoingMessage(conn, 'one@g.us')
    await trackGroupOutgoingMessage(conn, 'two@g.us')
    await trackGroupOutgoingMessage(conn, 'private@s.whatsapp.net')

    assert.equal(global.db.data.settings['12345@s.whatsapp.net'].groupOutgoingMessageCounts['one@g.us'], 2)
    assert.equal(global.db.data.settings['12345@s.whatsapp.net'].groupOutgoingMessageCounts['two@g.us'], 1)
    assert.equal('private@s.whatsapp.net' in global.db.data.settings['12345@s.whatsapp.net'].groupOutgoingMessageCounts, false)
  })
})

test('activity notice is sent on every hundredth outgoing group message', async () => {
  await withDatabase({
    settings: {
      '12345@s.whatsapp.net': { totalDonasi: 25000 }
    }
  }, async () => {
    const sent = []
    const conn = {
      user: { jid: '12345@s.whatsapp.net' },
      async sendInteractive(chat, content, options) {
        sent.push({ chat, content, options })
      }
    }

    for (let index = 0; index < 200; index++) {
      await trackGroupOutgoingMessage(conn, 'active@g.us')
    }

    assert.equal(sent.length, 2)
    assert.match(sent[0].content.interactiveMessage.body.text, /Rp 25\.000/)
    assert.match(sent[0].content.interactiveMessage.body.text, /dukungan/)
    assert.deepEqual(
      JSON.parse(sent[0].content.interactiveMessage.nativeFlowMessage.buttons[0].buttonParamsJson),
      { display_text: '💝 Dukung Avelia', id: '.donasi' }
    )
  })
})

test('the same outgoing message is counted only once across send and relay paths', async () => {
  await withDatabase({ settings: {} }, async () => {
    const conn = { user: { jid: '12345@s.whatsapp.net' } }

    await trackGroupOutgoingMessage(conn, 'active@g.us', {}, 'message-id')
    await trackGroupOutgoingMessage(conn, 'active@g.us', {}, 'message-id')

    assert.equal(global.db.data.settings['12345@s.whatsapp.net'].groupOutgoingMessageCounts['active@g.us'], 1)
  })
})

test('manual donation notice uses the same text and supports a custom prefix', async () => {
  await withDatabase({
    settings: {
      '12345@s.whatsapp.net': { totalDonasi: 1000 }
    }
  }, async () => {
    const sent = []
    const conn = {
      user: { jid: '12345@s.whatsapp.net' },
      async sendInteractive(chat, content, options) {
        sent.push({ chat, content, options })
      }
    }

    await sendGroupActivityDonationNotice(conn, 'active@g.us', '!donasi')

    assert.equal(sent[0].chat, 'active@g.us')
    assert.match(sent[0].content.interactiveMessage.body.text, /Rp 1\.000/)
    assert.equal(
      JSON.parse(sent[0].content.interactiveMessage.nativeFlowMessage.buttons[0].buttonParamsJson).id,
      '!donasi'
    )
    assert.equal(sent[0].options._skipGroupActivityDonationCount, true)
  })
})
