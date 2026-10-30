import assert from 'node:assert/strict'
import test from 'node:test'
import { getHasilDisplay, isHasilTernakKey } from '../lib/rpg-libternakData.js'

test('known livestock products keep their configured name and emoji', () => {
  assert.deepEqual(getHasilDisplay('telur_ayam'), {
    key: 'telur_ayam',
    nama: 'Telur Ayam',
    emoji: '🥚',
    harga: 25000
  })
})

test('hybrid livestock products use readable names and product emojis', () => {
  assert.deepEqual(getHasilDisplay('telur_unicken'), {
    key: 'telur_unicken',
    nama: 'Telur Unicken',
    emoji: '🥚',
    harga: 1000
  })
  assert.deepEqual(getHasilDisplay('daging_kelinci'), {
    key: 'daging_kelinci',
    nama: 'Daging Kelinci',
    emoji: '🥩',
    harga: 15000
  })
  assert.equal(isHasilTernakKey('telur_unicken'), true)
  assert.equal(isHasilTernakKey('daging_unicken'), true)
})
