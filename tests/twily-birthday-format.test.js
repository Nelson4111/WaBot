import test from 'node:test'
import assert from 'node:assert/strict'

import { buildBirthdayMonthBlocks, buildBirthdayMonthSummary } from '../plugins/info/twily.js'

test('buildBirthdayMonthSummary marks passed birthdays in the current month as strikethrough', () => {
  const now = new Date('2026-09-10T00:00:00')
  const entries = [
    ['1', { name: 'Aca', date: '21-09' }],
    ['2', { name: 'Budi', date: '03-09' }],
    ['3', { name: 'Citra', date: '22-10' }]
  ]

  const summary = buildBirthdayMonthSummary(entries, now)
  assert.match(summary, /~.*Budi.*~/) 
  assert.doesNotMatch(summary, /~.*Aca.*~/)
})

test('buildBirthdayMonthBlocks keeps months grouped and dates ordered', () => {
  const now = new Date('2026-09-10T00:00:00')
  const entries = [
    ['1', { name: 'Aca', date: '21-09' }],
    ['2', { name: 'Budi', date: '03-09' }],
    ['3', { name: 'Zara', date: '05-01' }],
    ['4', { name: 'Dinda', date: '18-01' }]
  ]

  const blocks = buildBirthdayMonthBlocks(entries, now)
  assert.match(blocks, /Januari/)
  assert.match(blocks, /September/)
  assert.match(blocks, /03\. Budi/)
})
