import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const QNA_FILE = fileURLToPath(new URL('../../lib/qna.json', import.meta.url))

async function loadQna() {
  const entries = JSON.parse(await readFile(QNA_FILE, 'utf8'))
  if (!Array.isArray(entries) || entries.some(entry =>
    !entry || typeof entry.question !== 'string' || typeof entry.answer !== 'string'
  )) {
    throw new TypeError('Q&A data must be an array of questions and answers')
  }
  return entries
}

export function formatQnaList(entries, usedPrefix = '.') {
  const body = entries.map((entry, index) => `*${index + 1}.* ${entry.question}`).join('\n')
  return `╭─「 ❓ Q&A 」\n│ Pertanyaan yang sering ditanyakan\n╰──────────────\n\n${body}\n\nBuka jawaban: ${usedPrefix}qna <nomor>`
}

export function formatQnaDetail(entry, index) {
  return `╭─「 ❓ Q&A ${index + 1} 」\n╰──────────────\n\n*Pertanyaan:*\n${entry.question}\n\n*Jawaban:*\n${entry.answer}`
}

const handler = async (m, { text = '', usedPrefix = '.' }) => {
  const argument = text.trim()
  const entries = await loadQna()

  if (!argument || argument.toLowerCase() === 'all') {
    if (!entries.length) return m.reply('Belum ada pertanyaan dan jawaban yang tersedia.')
    return m.reply(formatQnaList(entries, usedPrefix))
  }

  if (!/^\d+$/.test(argument)) {
    return m.reply(`Format: ${usedPrefix}qna [nomor]\nContoh: ${usedPrefix}qna 1`)
  }

  const index = Number(argument) - 1
  if (!Number.isSafeInteger(index) || index < 0 || index >= entries.length) {
    return m.reply(`Pertanyaan nomor *${argument}* tidak ditemukan. Gunakan ${usedPrefix}qna untuk melihat daftar.`)
  }

  return m.reply(formatQnaDetail(entries[index], index))
}

handler.help = ['qna', 'qna <nomor>']
handler.tags = ['info']
handler.command = /^qna$/i

export default handler
