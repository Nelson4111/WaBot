import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { resolveRpgMedia } from '../lib/rpgMedia.js'

test('Termai RPG image URLs resolve to matching local assets', () => {
    const image = resolveRpgMedia('https://c.termai.cc/i142/XU7iEW')
    const localImage = fs.readFileSync(new URL('../media/rpg/XU7iEW.jpg', import.meta.url))

    assert.ok(Buffer.isBuffer(image))
    assert.deepEqual(image, localImage)
})

test('extensionless Termai RPG suffix resolves to the local extensionless asset', () => {
    const image = resolveRpgMedia('https://c.termai.cc/i108/l3q')
    const localImage = fs.readFileSync(new URL('../media/rpg/l3q', import.meta.url))

    assert.deepEqual(image, localImage)
})

test('Termai WebP URLs resolve to matching local JPG assets', () => {
    const image = resolveRpgMedia('https://c.termai.cc/i189/AS4Mvv.webp')
    const localImage = fs.readFileSync(new URL('../media/rpg/AS4Mvv.jpg', import.meta.url))

    assert.ok(Buffer.isBuffer(image))
    assert.deepEqual(image, localImage)
})

test('non-Termai and unavailable image URLs remain available as fallbacks', () => {
    const cloudImage = 'https://files.example.test/rpg.jpg'
    const missingTermaiImage = 'https://c.termai.cc/i108/not-in-media'

    assert.equal(resolveRpgMedia(cloudImage), cloudImage)
    assert.equal(resolveRpgMedia(missingTermaiImage), missingTermaiImage)
})
