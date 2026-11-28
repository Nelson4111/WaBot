let handler = async (m, { args }) => {
  if (!args[0]) return m.reply(`
Ketik:
.autotyping on
.autotyping off
  `)

  let input = args[0].toLowerCase()
  if (!['on', 'off'].includes(input)) return m.reply('Gunakan `on` atau `off`')

  global.autotyping = input === 'on'
  m.reply(`Auto Typing ${global.autotyping ? '✅ AKTIF' : '❌ NONAKTIF'}`)
}

handler.help = ['autotyping [on/off]']
handler.tags = ['owner']
handler.command = /^autotyping$/i
handler.owner = true
handler.desc = 'Perintah khusus Owner bot untuk mengelola dan mengatur autotyping.'
handler.tutorial = [
  '.autotyping',
  'Hanya dapat dijalankan oleh Owner bot'
]

export default handler