import assert from 'node:assert/strict'
import { getMonthlyNews } from '../plugins/info/news.js'

const news = [
  { section: 'RPG', content: 'Perbaikan pertama', createdAt: Date.parse('2026-10-01T00:10:00+07:00') },
  { section: 'Group', content: 'Pembaruan grup', createdAt: Date.parse('2026-10-01T00:20:00+07:00') },
  { section: 'RPG', content: 'Perbaikan kedua', createdAt: Date.parse('2026-10-02T00:10:00+07:00') },
  { section: 'RPG', content: 'News bulan lalu', createdAt: Date.parse('2026-09-30T23:50:00+07:00') }
]
const now = new Date('2026-10-15T12:00:00+07:00')

assert.deepEqual(getMonthlyNews(news, now).map(entry => entry.id), ['1.0', '1.1', '2.0'])

const withoutFirstEntry = news.filter((_, index) => index !== 0)
assert.deepEqual(getMonthlyNews(withoutFirstEntry, now).map(entry => entry.id), ['1.0', '2.0'])

console.log('news tests passed')