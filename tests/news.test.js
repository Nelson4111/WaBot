import assert from 'node:assert/strict'
import { formatNewsAll, formatNewsDetail, getMonthlyNews } from '../plugins/info/news.js'

const news = [
  { id: '1.0', section: 'RPG', content: 'Perbaikan pertama', createdAt: Date.parse('2026-10-01T00:10:00+07:00') },
  { id: '1.1', section: 'Group', content: 'Pembaruan grup', createdAt: Date.parse('2026-10-01T00:20:00+07:00') },
  { id: '2.0', section: 'RPG', content: 'Perbaikan kedua', createdAt: Date.parse('2026-10-02T00:10:00+07:00') },
  { section: 'RPG', content: 'News bulan lalu', createdAt: Date.parse('2026-09-30T23:50:00+07:00') }
]
const now = new Date('2026-10-15T12:00:00+07:00')

assert.deepEqual(getMonthlyNews(news, now).map(entry => entry.id), ['1.0', '1.1', '2.0'])

const withoutFirstEntry = news.filter((_, index) => index !== 0)
assert.deepEqual(getMonthlyNews(withoutFirstEntry, now).map(entry => entry.id), ['1.1', '2.0'])

const legacyEntry = { section: 'RPG', content: 'News lama', createdAt: Date.parse('2026-10-05T00:10:00+07:00') }
assert.equal(getMonthlyNews([legacyEntry], now)[0].id, '5.0')

const allNewsMessage = formatNewsAll([
  { id: '2.0', title: 'Berita pertama', section: 'INFO', content: 'Isi tersembunyi', author: 'Avelia' },
  { id: '2.1', title: 'Berita kedua', section: 'RPG', content: 'Jangan tampilkan isi ini', author: 'Eza' }
], 'Oktober 2026')
assert.match(allNewsMessage, /Total: \*2 news\*/)
assert.ok(allNewsMessage.indexOf('*2.0*') < allNewsMessage.indexOf('*2.1*'))
assert.match(allNewsMessage, /\*2\.1\* · Berita kedua/)
assert.doesNotMatch(allNewsMessage, /RPG|INFO|Jangan tampilkan isi ini|Eza/)

const detailMessage = formatNewsDetail({
  id: '2.1',
  section: 'RPG',
  title: 'Berita kedua',
  content: 'Detail berita',
  author: 'Eza',
  createdAt: Date.parse('2026-10-02T00:10:00+07:00')
})
assert.match(detailMessage, /🎮 NEWS 2\.1/)
assert.match(detailMessage, /Berita kedua/)
assert.match(detailMessage, /Detail berita/)
assert.match(detailMessage, /Oleh: Eza/)

console.log('news tests passed')