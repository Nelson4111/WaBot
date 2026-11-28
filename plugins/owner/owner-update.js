import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const execPromise = promisify(exec)

async function getHeadCommit() {
  const { stdout } = await execPromise('git rev-parse HEAD')
  const commit = stdout.trim()
  if (!/^[a-f0-9]{40,64}$/i.test(commit)) {
    throw new Error('Tidak dapat membaca commit Git saat ini.')
  }
  return commit
}

async function getUpdateSummary(before, after) {
  if (before === after) return null

  const { stdout } = await execPromise(`git diff --numstat ${before} ${after}`)
  const files = []
  let insertions = 0
  let deletions = 0

  for (const line of stdout.trim().split('\n').filter(Boolean)) {
    const [added, removed, ...pathParts] = line.split('\t')
    const file = pathParts.join('\t')
    if (!file) continue

    const isBinary = added === '-' || removed === '-'
    if (!isBinary) {
      insertions += Number(added) || 0
      deletions += Number(removed) || 0
    }
    files.push({ file, added, removed, isBinary })
  }

  return { files, insertions, deletions }
}

function formatUpdateSummary(summary) {
  if (!summary?.files.length) {
    return '> Tidak ada perubahan file yang terdeteksi.'
  }

  const maxFilesToShow = 35
  const fileLines = summary.files.slice(0, maxFilesToShow).flatMap(({ file, added, removed, isBinary }) => [
    `> \`${file.replace(/[`]/g, '\\`')}\``,
    isBinary
      ? '> ↳ File biner berubah'
      : `> ↳ +${added} insertions\n> ↳ -${removed} deletions`
  ])
  if (summary.files.length > maxFilesToShow) {
    fileLines.push(`> ↳ ${summary.files.length - maxFilesToShow} file lainnya tidak ditampilkan`)
  }

  return [
    '🗂️ *File yang berubah:*',
    ...fileLines,
    '',
    '📊 *Ringkasan:*',
    `> Files changed: ${summary.files.length}`,
    `> ↳ +${summary.insertions} insertions`,
    `> ↳ -${summary.deletions} deletions`
  ].join('\n')
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const p = usedPrefix || '.'
  const rawArgs = Array.isArray(args) ? args : []
  const isForce = rawArgs.some(a => a === '--force' || a === 'force' || a === '-f')
  const isAutoRestart = rawArgs.some(a => a === '--restart' || a === 'restart' || a === '-r')

  await m.react('⏳')
  await m.reply(isForce ? '⚡ *Melakukan force update dari GitHub...*' : '🔄 *Menarik update terbaru dari GitHub...*')

  try {
    const before = await getHeadCommit()
    let stdout = ''
    if (isForce) {
      await execPromise('git fetch origin')
      await execPromise('git reset --hard origin/main')
      await execPromise('git clean -fd -e database/ -e database.json -e *_database.json -e sessions/ -e tmp/ -e backup_db/ -e database_backup/')
    } else {
      const result = await execPromise('git pull --rebase origin main')
      stdout = result.stdout
    }

    if (!isForce && (stdout.includes('Already up to date.') || stdout.includes('Already up-to-date.'))) {
      await m.react('✅')
      const msg = [
        '✅ *Bot sudah berada di versi terbaru!*',
        '',
        '> Tidak ada file baru untuk diambil dari GitHub.'
      ].join('\n')
      const buttons = [
        ['🔄 Cek Lagi', `${p + command}`],
        ['⚡ Force Update', `${p + command} --force`]
      ]
      if (typeof conn.sendButton === 'function') {
        await conn.sendButton(m.chat, msg, `${global.namebot || 'Avelia'} • System Update`, null, buttons, m)
      } else {
        await m.reply(msg)
      }
    } else {
      const after = await getHeadCommit()
      const summary = await getUpdateSummary(before, after)
      await m.react('🚀')
      const msg = [
        `🚀 *${isForce ? 'Force Update Berhasil' : 'Berhasil Diupdate'}!*`,
        '',
        formatUpdateSummary(summary),
        '',
        isAutoRestart ? '_Memulai ulang sistem bot sekarang..._' : '_Jika fitur baru belum muncul, silakan restart bot._'
      ].join('\n')
      const buttons = [
        ['⚡ Restart Bot', `${p}restart update`],
        ['📜 Menu Utama', `${p}menu`]
      ]
      if (typeof conn.sendButton === 'function') {
        await conn.sendButton(m.chat, msg, `${global.namebot || 'Avelia'} • System Update`, null, buttons, m)
      } else {
        await m.reply(msg)
      }

      if (isAutoRestart) {
        try {
          const stateDir = path.resolve('./tmp')
          if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true })
          fs.writeFileSync(
            path.join(stateDir, 'restart-state.json'),
            JSON.stringify({
              chat: m.chat,
              sender: m.sender,
              timestamp: Date.now(),
              type: 'update',
              key: m.key,
              reason: 'Update Git Auto-Restart'
            })
          )
        } catch (errState) {
          console.error('[UPDATE RESTART STATE ERROR]', errState)
        }

        try {
          if (global.opts['autobio'] && global.conn) {
            await global.conn.updateProfileStatus('Bot sedang merestart 🔄. Tunggu sebentar.').catch(() => {})
          }
          if (global.db && global.db.data) {
            console.log('[UPDATE AUTO-RESTART] Menyimpan database ke Supabase sebelum restart...')
            await global.db.write()
            console.log('[UPDATE AUTO-RESTART] Database berhasil disimpan.')
          }
        } catch (e) {
          console.error('[UPDATE AUTO-RESTART DB ERROR]', e)
        }
        process.exit(1)
      }
    }
  } catch (e) {
    await m.react('❌')
    const errText = [
      '❌ *Gagal Update!*',
      '',
      '⚠️ *Error:*',
      `> ${String(e.message).replace(/\n/g, '\n> ')}`,
      '',
      '*Pilihan Aksi:*',
      '> ↳ Force Update akan menimpa perubahan lokal.',
      '> ↳ Coba Lagi akan mengulang proses update.',
      '',
      '*Perintah Manual:*',
      '```',
      'git fetch origin',
      'git reset --hard origin/main',
      'git clean -fd',
      '```'
    ].join('\n')
    const buttons = [
      ['⚡ Force Update', `${p + command} --force`],
      ['🔄 Coba Lagi', `${p + command}`]
    ]
    if (typeof conn.sendButton === 'function') {
      await conn.sendButton(m.chat, errText, `${global.namebot || 'Avelia'} • System Update`, null, buttons, m)
    } else {
      await m.reply(errText)
    }
  }
}

handler.help = ['update', 'update --restart', 'update --force', 'gitpull']
handler.tags = ['owner']
handler.command = /^(update|gitpull)$/i
handler.owner = true

handler.desc = 'Perintah khusus Owner bot untuk mengelola dan mengatur update.'
handler.tutorial = [
  '.update',
  'Hanya dapat dijalankan oleh Owner bot'
]

export default handler
