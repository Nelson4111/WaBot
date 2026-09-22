import { spawn } from 'child_process'
let handler = async (m, { conn, isROwner, text }) => {
    if (!process.send) throw 'Dont: node main.js\nDo: node index.js'
    if (global.conn.user.jid == conn.user.jid) {
      await m.reply('```R E S T A R T . . .```')
      try {
        if (global.opts['autobio'] && global.conn) {
          await global.conn.updateProfileStatus('Bot sedang merestart 🔄. Tunggu sebentar.').catch(() => {})
        }
        if (global.db && global.db.data) {
          console.log('[RESTART CMD] Menyimpan database ke Supabase sebelum restart...')
          await global.db.write()
          console.log('[RESTART CMD] Database berhasil disimpan.')
        }
      } catch (e) {
        console.error('[RESTART CMD DB WRITE ERROR]', e)
      }
      process.exit(1) // Exit with code 1 to trigger auto-restart in index.js
  } else throw '_eeeeeiiittsssss..._'
}
handler.help = ['restart']
handler.tags = ['owner']
handler.command = /^(res(tart)?)$/i

handler.rowner = true

export default handler