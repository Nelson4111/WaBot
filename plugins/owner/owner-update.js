import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const p = usedPrefix || '.'
  const isForce = args && (args[0] === '--force' || args[0] === 'force' || args[0] === '-f')

  await m.react('⏳')
  await m.reply(isForce ? '⚡ *Melakukan force update dari GitHub...*' : '🔄 *Menarik update terbaru dari GitHub...*')

  try {
    const cmd = isForce
      ? 'git fetch origin && git reset --hard origin/main && git clean -fd'
      : 'git pull --rebase origin main'

    const { stdout, stderr } = await execPromise(cmd)
    const out = stdout.trim() || stderr.trim() || 'Selesai tanpa output tambahan.'

    if (!isForce && (stdout.includes('Already up to date.') || stdout.includes('Already up-to-date.'))) {
      await m.react('✅')
      const msg = '✅ *Bot sudah berada di versi terbaru!*'
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
      await m.react('🚀')
      const msg = `🚀 *${isForce ? 'Force Update Berhasil' : 'Berhasil Diupdate'}!*\n\n📝 *Detail:*\n\`\`\`\n${out}\n\`\`\`\n\n_Catatan: Jika fitur baru belum muncul, silakan restart bot._`
      const buttons = [
        ['⚡ Restart Bot', `${p}restart`],
        ['📜 Menu Utama', `${p}menu`]
      ]
      if (typeof conn.sendButton === 'function') {
        await conn.sendButton(m.chat, msg, `${global.namebot || 'Avelia'} • System Update`, null, buttons, m)
      } else {
        await m.reply(msg)
      }
    }
  } catch (e) {
    await m.react('❌')
    const errText = `❌ *Gagal Update!*\n\n⚠️ *Error:*\n\`\`\`\n${e.message}\n\`\`\`\n\n*Pilihan Aksi:*\n• Tekan tombol *Force Update* di bawah untuk menimpa perubahan lokal.\n• Tekan tombol *Coba Lagi* untuk mencoba kembali.\n\n*Perintah Manual:*\n\`git fetch origin && git reset --hard origin/main && git clean -fd\``
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

handler.help = ['update', 'update --force', 'gitpull']
handler.tags = ['owner']
handler.command = /^(update|gitpull)$/i
handler.owner = true

export default handler
