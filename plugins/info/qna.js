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
  const body = entries.map((entry, index) => `> ${index + 1}. ${entry.question}`).join('\n')
  return (
    `╭─❏「 ❓ Q&A 」❏\n` +
    `│ ❓ *PERTANYAAN & JAWABAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📝 *DAFTAR PERTANYAAN*\n` +
    `${body}\n\n` +
    `📌 *PANDUAN*\n` +
    `> ↳ Buka jawaban: ${usedPrefix}qna <nomor>\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

export function formatQnaDetail(entry, index) {
  return (
    `╭─❏「 ❓ Q&A ${index + 1} 」❏\n` +
    `│ ❓ *DETAIL PERTANYAAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📝 *PERTANYAAN*\n` +
    `> ${entry.question}\n\n` +
    `💬 *JAWABAN*\n` +
    `> ${entry.answer}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

const handler = async (m, { text = '', usedPrefix = '.' }) => {
  const argument = text.trim()
  const entries = await loadQna()

  if (!argument || argument.toLowerCase() === 'all') {
    if (!entries.length) {
      return m.reply(
        `╭─❏「 ❓ Q&A 」❏\n` +
        `│ ❓ *PERTANYAAN & JAWABAN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> Belum ada pertanyaan dan jawaban yang tersedia.\n\n` +
        `─━━━━━━━━━━━━━━─`
      )
    }
    return m.reply(formatQnaList(entries, usedPrefix))
  }

  if (!/^\d+$/.test(argument)) {
    return m.reply(
      `╭─❏「 ❓ Q&A 」❏\n` +
      `│ ❓ *FORMAT PERINTAH*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `📌 *PENGGUNAAN*\n` +
      `> ↳ Format: ${usedPrefix}qna <nomor>\n` +
      `> ↳ Contoh: ${usedPrefix}qna 1\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const index = Number(argument) - 1
  if (!Number.isSafeInteger(index) || index < 0 || index >= entries.length) {
    return m.reply(
      `╭─❏「 ❓ Q&A 」❏\n` +
      `│ ⚠️ *PERTANYAAN TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Pertanyaan nomor *${argument}* tidak ditemukan.\n` +
      `> ↳ Gunakan ${usedPrefix}qna untuk melihat daftar.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  return m.reply(formatQnaDetail(entries[index], index))
}

handler.help = ['qna', 'qna <nomor>']
handler.tags = ['info']
handler.command = /^qna$/i

export default handler