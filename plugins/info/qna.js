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

const ITEMS_PER_PAGE = 10

export function formatQnaList(entries, page = 1) {
  const pageCount = Math.max(1, Math.ceil(entries.length / ITEMS_PER_PAGE))
  const body = entries
    .slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
    .map(entry => `*?:* ${entry.question}\n> ↳  ${entry.answer}`)
    .join('\n\n')
  return (
    `╭─❏「 ❓ Q&A 」❏\n` +
    `│ ❓ *PERTANYAAN & JAWABAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${body}\n\n` +
    `Halaman ${page}/${pageCount}\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

export function formatQnaDetail(entry, index) {
  return (
    `╭─❏「 ❓ Q&A ${index + 1} 」❏\n` +
    `│ ❓ *PERTANYAAN & JAWABAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `*?:* ${entry.question}\n> ↳  ${entry.answer}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

const handler = async (m, { text = '', usedPrefix = '.' }) => {
  const argument = text.trim()
  const entries = await loadQna()

  if (!argument) {
    return m.reply(
      `╭─❏「 ❓ FITUR Q&A 」❏\n` +
      `│ Kumpulan pertanyaan dan jawaban umum.\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> Lihat daftar: ${usedPrefix}qna list [halaman]\n` +
      `> Buka satu jawaban: ${usedPrefix}qna <nomor>`
    )
  }

  const [action, ...params] = argument.split(/\s+/)
  if (action.toLowerCase() === 'list' || action.toLowerCase() === 'all') {
    const page = params.length ? Number(params[0]) : 1
    if (params.length > 1 || !Number.isSafeInteger(page) || page < 1) {
      return m.reply(`Format: ${usedPrefix}qna list [halaman]`)
    }
    if (!entries.length) return m.reply('Belum ada pertanyaan dan jawaban yang tersedia.')
    const pageCount = Math.ceil(entries.length / ITEMS_PER_PAGE)
    if (page > pageCount) return m.reply(`Halaman tidak tersedia. Maksimal ${pageCount}.`)
    return m.reply(formatQnaList(entries, page))
  }

  if (params.length || !/^\d+$/.test(action)) {
    return m.reply(
      `╭─❏「 ❓ Q&A 」❏\n` +
      `│ ❓ *FORMAT PERINTAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📌 *PENGGUNAAN*\n` +
      `> ↳ Daftar: ${usedPrefix}qna list [halaman]\n` +
      `> ↳ Jawaban: ${usedPrefix}qna <nomor>\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const index = Number(action) - 1
  if (!Number.isSafeInteger(index) || index < 0 || index >= entries.length) {
    return m.reply(
      `╭─❏「 ❓ Q&A 」❏\n` +
      `│ ⚠️ *PERTANYAAN TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Pertanyaan nomor *${action}* tidak ditemukan.\n` +
      `> ↳ Gunakan ${usedPrefix}qna list untuk melihat daftar.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  return m.reply(formatQnaDetail(entries[index], index))
}

handler.help = ['qna', 'qna list [halaman]', 'qna <nomor>']
handler.tags = ['info']
handler.command = /^qna$/i

export default handler