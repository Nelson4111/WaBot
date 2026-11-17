import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { resolveCsmMedia } from '../lib/csmMedia.js'

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
