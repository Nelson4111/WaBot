import assert from 'node:assert/strict'
import { formatQnaDetail, formatQnaList } from '../plugins/info/qna.js'

const entries = [
  { question: 'Bagaimana cara mengetahui update terbaru dari Avelia?', answer: 'Cek perintah .news.' },
  { question: 'Apakah auto-reply voice note bisa dimatikan?', answer: 'Bisa dengan .voice disable.' }
]

const list = formatQnaList(entries)
assert.match(list, /\*1\.\* Bagaimana cara mengetahui update terbaru dari Avelia\?/)
assert.match(list, /\*2\.\* Apakah auto-reply voice note bisa dimatikan\?/)
assert.match(list, /\.qna <nomor>/)

const detail = formatQnaDetail(entries[1], 1)
assert.match(detail, /Q&A 2/)
assert.match(detail, /Pertanyaan:.*auto-reply voice note/s)
assert.match(detail, /Jawaban:.*\.voice disable/s)

console.log('qna tests passed')
