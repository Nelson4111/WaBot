import assert from 'node:assert/strict'
import { formatQnaDetail, formatQnaList } from '../plugins/info/qna.js'

const entries = [
  { question: 'Bagaimana cara mengetahui update terbaru dari Avelia?', answer: 'Cek perintah .news.' },
  { question: 'Apakah auto-reply voice note bisa dimatikan?', answer: 'Bisa dengan .voice disable.' }
]

const list = formatQnaList(entries)
assert.match(list, /\*\?:\* Bagaimana cara mengetahui update terbaru dari Avelia\?\n> ↳  Cek perintah \.news\./)
assert.match(list, /\*\?:\* Apakah auto-reply voice note bisa dimatikan\?\n> ↳  Bisa dengan \.voice disable\./)
assert.match(list, /Halaman 1\/1/)

const detail = formatQnaDetail(entries[1], 1)
assert.match(detail, /Q&A 2/)
assert.match(detail, /\*\?:\* Apakah auto-reply voice note bisa dimatikan\?\n> ↳  Bisa dengan \.voice disable\./)
assert.doesNotMatch(detail, /DETAIL PERTANYAAN|PERTANYAAN\*|JAWABAN\*/)

const manyEntries = Array.from({ length: 21 }, (_, index) => ({
  question: `Pertanyaan ${index + 1}`,
  answer: `Jawaban ${index + 1}`
}))
const pageTwo = formatQnaList(manyEntries, 2)
assert.match(pageTwo, /Pertanyaan 11/)
assert.match(pageTwo, /Pertanyaan 20/)
assert.doesNotMatch(pageTwo, /Pertanyaan 10|Pertanyaan 21/)
assert.match(pageTwo, /Halaman 2\/3/)

console.log('qna tests passed')
