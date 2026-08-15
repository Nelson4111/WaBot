import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

let handler = async (m, { conn }) => {
  await m.react('⏳')
  await m.reply('🔄 *Menarik update terbaru dari GitHub...*')

  try {
    const { stdout, stderr } = await execPromise('git pull --rebase origin main')
    
    if (stdout.includes('Already up to date.') || stdout.includes('Already up-to-date.')) {
      await m.react('✅')
      m.reply('✅ *Bot sudah berada di versi terbaru!*')
    } else {
      await m.react('🚀')
      m.reply(`🚀 *Berhasil Diupdate!*\n\n📝 *Detail:*\n${stdout.trim()}\n\n_Catatan: Jika fitur baru belum muncul, restart bot di panel._`)
    }
  } catch (e) {
    await m.react('❌')
    let errText = `❌ *Gagal Update!*\n\n⚠️ *Error:*\n${e.message}\n\nKlik tombol di bawah untuk memaksa update (Force Pull) jika terjadi konflik.`
    let buttons = [
        ["Force Update 🚀", "$ git fetch origin && git reset --hard origin/main && git clean -fd"],
        ["Update 🚀", ".update"]
    ]
    await conn.sendButton(m.chat, errText, "Gunakan dengan hati-hati!", buttons, m)
  }
}

handler.help = ['update', 'gitpull']
handler.tags = ['owner']
handler.command = /^(update|gitpull)$/i
handler.owner = true

export default handler
