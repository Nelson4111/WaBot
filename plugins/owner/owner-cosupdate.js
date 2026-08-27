import { spawn } from 'child_process'
import {
  shintoHeader,
  shintoSection,
  shintoDivider,
  status
} from '../../lib/style.js'

let handler = async (m, { conn }) => {
  if (global.cosrentUpdate) {
    return m.reply(
      status.warning('COSRENT UPDATE sedang berjalan di background. Mohon tunggu hingga selesai.')
    )
  }

  await m.reply(
    [
      shintoHeader('COSRENT UPDATE', 'Memulai Sinkronisasi Katalog'),
      `⏳ *Status:* Memulai proses scanning ke RuangCosplay...`,
      `📦 *Target File:* _lib/cosrentList.js_`,
      shintoDivider(),
      `💡 Update progress akan dikirimkan secara berkala.`
    ].join('\n')
  )

  const process = spawn('node', ['tools/updateCosrent.js'])
  global.cosrentUpdate = process

  let buffer = []
  let timer = null

  async function sendBuffer() {
    if (!buffer.length) return

    const text = [
      shintoHeader('COSRENT PROGRESS', 'Katalog Update Log'),
      buffer.join('\n'),
      shintoDivider()
    ].join('\n')

    buffer = []
    await conn.sendMessage(m.chat, { text })
  }

  function addProgress(text) {
    buffer.push(`⟡ ${text}`)

    if (!timer) {
      timer = setTimeout(async () => {
        timer = null
        await sendBuffer()
      }, 45000)
    }
  }

  process.stdout.on('data', async (data) => {
    const logs = data.toString().split('\n').filter(Boolean)

    for (const log of logs) {
      if (log.startsWith('PAGE_PROGRESS')) {
        addProgress(log.replace('PAGE_PROGRESS', '').trim())
      }

      if (log.startsWith('GENERATE_PROGRESS')) {
        addProgress(log.replace('GENERATE_PROGRESS', '').trim())
      }

      if (log.startsWith('TOTAL_PROGRESS')) {
        if (timer) {
          clearTimeout(timer)
          timer = null
        }

        await sendBuffer()

        const msg = [
          shintoHeader('COSRENT SELESAI', 'Sinkronisasi Berhasil'),
          log.replace('TOTAL_PROGRESS', '').trim(),
          shintoDivider(),
          `✨ *Katalog siap digunakan via .cosrent*`
        ].join('\n')

        await conn.sendMessage(m.chat, { text: msg })
      }
    }
  })

  process.stderr.on('data', async (data) => {
    const error = data.toString().trim()
    if (error) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }

      await sendBuffer()

      await conn.sendMessage(m.chat, {
        text: status.error(`Update Error:\n${error}`)
      })
    }
  })

  process.on('close', async (code) => {
    global.cosrentUpdate = null

    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    await sendBuffer()

    if (code !== 0) {
      await conn.sendMessage(m.chat, {
        text: status.warning(`Proses update terhenti dengan kode keluar: ${code}`)
      })
    }
  })
}

handler.help = ['cosupdate']
handler.tags = ['owner']
handler.command = /^(cosupdate)$/i
handler.owner = true

export default handler