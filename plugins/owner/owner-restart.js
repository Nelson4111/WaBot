import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, isROwner, text }) => {
    if (!process.send) throw 'Dont: node main.js\nDo: node index.js'
    if (global.conn.user.jid == conn.user.jid) {
      await m.reply('```R E S T A R T . . .```')
      try {
        const stateDir = path.resolve('./tmp')
        if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true })
        fs.writeFileSync(
          path.join(stateDir, 'restart-state.json'),
          JSON.stringify({
            chat: m.chat,
            sender: m.sender,
            timestamp: Date.now(),
            type: (text && text.toLowerCase().includes('update')) ? 'update' : 'restart',
            key: m.key,
            reason: text || ''
          })
        )
      } catch (errState) {
        console.error('[RESTART STATE ERROR]', errState)
      }
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
handler.help = ['restart', 'restart <alasan>']
handler.tags = ['owner']
handler.command = /^(res(tart)?)$/i

handler.rowner = true

handler.desc = 'Merestart proses aplikasi bot secara aman.'
handler.tutorial = [
  '.restart',
  'Khusus Owner: memuat ulang sistem bot'
]

export default handler