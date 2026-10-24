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
  class ButtonV2 {
    constructor(conn) {
      this.conn = conn
      this.buttons = []
    }

    setBody(body) {
      this.body = body
    }

    setFooter(footer) {
      this.footer = footer
    }

    addRawButton(button) {
      this.buttons.push(button)
    }

    async send(chat) {
      const sent = { chat, body: this.body, footer: this.footer, buttons: this.buttons }
      this.conn.messages.push(sent)
      return sent
    }
  }

  return {
    messages: [],
    ButtonV2,
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
    assert.deepEqual(getListRows(conn).map(row => row.id), ['.totem yes', '.totem no'])
    assert.match(conn.messages.at(-1).body, /Tide Totem/)

    await invoke('yes')
    assert.ok(account.rpg.totems.includes('tide'))
    assert.equal(account.money, 7_500_000)

    await invoke('', 'mytotem')
    assert.equal(getListRows(conn)[0].id, '.totem use 1')

    await invoke('use 1')
    assert.deepEqual(getListRows(conn).map(row => row.id), ['.totem yes', '.totem no'])

    await invoke('yes')
    assert.deepEqual(account.rpg.totems, [])
    assert.equal(global.db.data.groupTotems[makeMessage().chat][0].id, 'tide')
  } finally {
    if (previousDb === undefined) delete global.db
    else global.db = previousDb
  }
})
