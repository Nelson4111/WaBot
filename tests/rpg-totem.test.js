import test from 'node:test'
import assert from 'node:assert/strict'
import totemHandler from '../plugins/rpg/rpg-totem.js'

const senderJid = '628123456789@s.whatsapp.net'

function makeDb() {
  return {
    data: {
      users: {
        [senderJid]: {
          money: 10_000_000,
          rpg: { totems: [] }
        }
      }
    },
    write: async () => {}
  }
}

function makeConn() {
  return {
    messages: [],
    async sendInteractive(chat, content) {
      const flowButtons = content.interactiveMessage.nativeFlowMessage.buttons
      const sent = {
        chat,
        body: content.interactiveMessage.body.text,
        buttons: flowButtons.map(button => {
          const params = JSON.parse(button.buttonParamsJson)
          return button.name === 'single_select'
            ? { nativeFlowInfo: { name: button.name, paramsJson: button.buttonParamsJson } }
            : { label: params.display_text, command: params.id }
        })
      }
      this.messages.push(sent)
      return sent
    },
    async sendMessage(chat, content) {
      const sent = { chat, ...content }
      this.messages.push(sent)
      return sent
    }
  }
}

function getListRows(conn) {
  const listButton = conn.messages.at(-1).buttons.find(button => button.nativeFlowInfo?.name === 'single_select')
  assert.ok(listButton, 'totem choice should be shown as a scrollable list')
  return JSON.parse(listButton.nativeFlowInfo.paramsJson).sections.flatMap(section => section.rows)
}

function getStandardButtons(conn) {
  return conn.messages.at(-1).buttons.filter(button => button.command)
}

function makeMessage() {
  return {
    sender: senderJid,
    chat: '120363000000000000@g.us',
    isGroup: true,
    reply: async text => text
  }
}

test('totem shop, purchase and activation stay selectable through list menus', async () => {
  const previousDb = global.db
  global.db = makeDb()
  const conn = makeConn()
  const account = global.db.data.users[senderJid]
  const invoke = (text, command = 'totem') => totemHandler(makeMessage(), {
    conn,
    text,
    command,
    usedPrefix: '.'
  })

  try {
    await invoke('shop fishing')
    assert.ok(getListRows(conn).some(row => row.id === '.totem buy tide'))

    await invoke('buy tide')
    assert.deepEqual(getStandardButtons(conn).map(button => button.command), ['.totem yes', '.totem no'])
    assert.match(conn.messages.at(-1).body, /Tide Totem/)

    await invoke('yes')
    assert.ok(account.rpg.totems.includes('tide'))
    assert.equal(account.money, 7_500_000)

    await invoke('', 'mytotem')
    assert.ok(conn.messages.at(-1).buttons.some(button => button.command === '.totem use 1'))

    await invoke('use 1')
    assert.deepEqual(getStandardButtons(conn).map(button => button.command), ['.totem yes', '.totem no'])

    await invoke('yes')
    assert.deepEqual(account.rpg.totems, [])
    assert.equal(global.db.data.groupTotems[makeMessage().chat][0].id, 'tide')
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
  }
})
