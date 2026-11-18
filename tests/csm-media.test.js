import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { resolveCsmMedia } from '../lib/csmMedia.js'
import { sendCsmReply } from '../plugins/csm/lib/utils.js'

test('Termai CSM image URLs resolve to matching local assets', () => {
    const image = resolveCsmMedia('https://c.termai.cc/i115/MmH7Id.jpg')
    const localImage = fs.readFileSync(new URL('../media/csm/MmH7Id.jpg', import.meta.url))

    assert.ok(Buffer.isBuffer(image))
    assert.deepEqual(image, localImage)
})

test('Termai PNG URLs resolve when local gallery files use JPG extensions', () => {
    const image = resolveCsmMedia('https://c.termai.cc/i165/su8.png')
    const localImage = fs.readFileSync(new URL('../media/csm/su8.jpg', import.meta.url))

    assert.ok(Buffer.isBuffer(image))
    assert.deepEqual(image, localImage)
})

test('non-Termai and unavailable image URLs remain available as fallbacks', () => {
    const externalImage = 'https://files.example.test/csm.jpg'
    const missingTermaiImage = 'https://c.termai.cc/i115/not-in-media'

    assert.equal(resolveCsmMedia(externalImage), externalImage)
    assert.equal(resolveCsmMedia(missingTermaiImage), missingTermaiImage)
})

test('CSM feature images use thumbnail cards with contextual buttons', async () => {
    class ButtonV2 {
        constructor(conn) {
            this.conn = conn
            this.payload = { buttons: [] }
        }
        setTitle(value) { this.payload.title = value }
        setSubtitle(value) { this.payload.subtitle = value }
        setBody(value) { this.payload.text = value }
        setFooter(value) { this.payload.footer = value }
        setRawThumbnail(value) { this.payload.thumbnail = value }
        setContextInfo(value) { this.payload.contextInfo = value }
        addButton(label, id) { this.payload.buttons.push([label, id]) }
        addRawButton(button) { this.payload.buttons.push(button) }
        async send(chat) {
            this.conn.cards.push({ chat, payload: this.payload })
            return this.conn.cards.at(-1)
        }
    }
    const conn = { cards: [], ButtonV2 }
    const message = { chat: 'test@g.us', text: '.csm explore' }

    await sendCsmReply(
        conn,
        message,
        {},
        'Eksplorasi CSM.',
        'https://c.termai.cc/i115/MmH7Id.jpg'
    )

    assert.equal(conn.cards.length, 1)
    assert.ok(Buffer.isBuffer(conn.cards[0].payload.thumbnail))
    assert.deepEqual(conn.cards[0].payload.buttons, [
        ['⛓️ Panel CSM', '.csm'],
        ['📋 Command CSM', '.csm command']
    ])
    assert.equal('image' in conn.cards[0].payload, false)
})

test('CSM gallery picture mode remains the only full image send', async () => {
    const picture = Buffer.from('gallery picture')
    const sends = []
    const conn = {
        async sendMessage(chat, content, options) {
            sends.push({ chat, content, options })
            return sends.at(-1)
        }
    }
    const message = { chat: 'test@g.us' }

    await sendCsmReply(conn, message, {}, 'CSM Picture', picture, true)

    assert.deepEqual(sends[0].content.image, picture)
    assert.equal(sends[0].content.caption, 'CSM Picture\n\n')
})
