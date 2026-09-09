import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const VOICE_NOTE_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'media',
  'voice-notes',
)

const VOICE_NOTE_GROUPS = [
  { files: ['onichan.mp3'], commands: ['onichan'] },
  { files: ['araara.m4a'], commands: ['ara', 'ara ara'] },
  { files: ['araa.mp3'], commands: ['araa'] },
  { files: ['vn.mp3'], commands: ['araaa'] },
  { files: ['kiyomasa.opus'], commands: ['oyy', 'oy', 'kiyomasa', 'nande', 'baka', 'oi', 'oii'] },
  { files: ['moshi.opus'], commands: ['moshi', 'araaaa'] },
  { files: ['night.opus'], commands: ['night', 'good', 'goodnight', 'good night', 'malam', 'malem', 'mlm'] },
  { files: ['k1.mp3'], commands: ['konser1'] },
  { files: ['k2.mp3'], commands: ['konser2'] },
  { files: ['definisihalal.m4a'], commands: ['halal'] },
  { files: ['yntkts.m4a'], commands: ['yntkts'] },
  { files: ['sound13.mp3'], commands: ['maaf', 'maap', 'sorry'] },
  { files: ['woahh.mp3'], commands: ['woah'] },
  { files: ['wibu.m4a'], commands: ['wibu','wibupride'] },
  { files: ['sholawat.m4a'], commands: ['sholawat'] },
  { files: ['tobat.opus'], commands: ['astagfirullah', 'astaghfirullah', 'tobat'] },
  { files: ['jelek.mp3'], commands: ['jelek'] },
  { files: ['saveOwnerku.mp3'], commands: ['save', 'sv', 'sve', 'svb'] },
  { files: ['pembohong.mp3'], commands: ['pembohong', 'boong', 'bohong', 'ngapusi'] },
  { files: ['penampilan.mp3'], commands: ['penampilan', 'outfit'] },
  { files: ['sad1.mp3', 'segala.mp3', 'hanyasatu.mp3'], commands: ['sad'] },
  { files: ['Turu.mp3'], commands: ['turu', 'sleep', 'tidur'] },
  {
    files: ['apasih.mp3'],
    commands: [
      'kontol', 'koncol', 'woi ajg', 'memek', 'asu', 'ajim', 'jancok', 'cok',
      'goblog', 'goblok', 'tolol', 'gblg', 'kontl', 'gblog', 'gblok', 'kntl',
      'mmk', 'ajg', 'anj', 'anjj', 'titit', 'tytyd', 'titid', 'puki', 'babi',
      'anjg', 'tai', 'taek', 'bangsat', 'bangst', 'wtf', 'shit', 'fuck', 'bgst',
      'ajing', 'bacot', 'anjing', 'bot ajg', 'bot babi',
    ],
  },
  {
    files: ['adaapa.m4a'],
    commands: ['tes', 'test', 'woi', 'p', 'pp', 'woy', 'weh', 'min', 'admin', 'eh', 'pe'],
  },
  { files: ['SayaRobot.opus'], commands: ['bot', 'bott', 'robot'] },
  { files: ['gaboleh.m4a'], commands: ['sc', 'script', 'code'] },
  { files: ['gmao.m4a'], commands: ['mau'] },
  { files: [').m4a'], commands: ['shalawat','ngaji'] },
  { files: ['baka.m4a'], commands: ['baka'] },
  { files: ['Buat apa.mp3'], commands: ['buat','buatapa','buat apa'] },
  { files: ['dakwah1.m4a'], commands: ['dakwah'] },
  { files: ['Gaboleh gitu.mp3'], commands: ['gaboleh gitu','gaboleh'] },
  { files: ['gamau.mp3'], commands: ['gamau'] },
  { files: ['Gay.mp3'], commands: ['gay'] },
  { files: ['Hihi.mp3'], commands: ['hihi'] },
  { files: ['hirobot.m4a'], commands: ['hi robot'] },
  { files: ['I like you.mp3'], commands: ['ilikeyou','i like you','i like u'] },
  { files: ['Imut.mp3'], commands: ['sok imut'] },
  { files: ['ingat.m4a'], commands: ['ingat','salah'] },
  { files: ['janganToxic.mp3'], commands: ['toxic'] },
  { files: ['Karna lo wibu.mp3'], commands: ['karnalowibu','karena lo wibu','pertanyaan'] },
  { files: ['KarnaKamu.mp3'], commands: ['karnakamu','karena kamu','karena','karna'] },
  { files: ['Loli Toxic.mp3'], commands: ['loli','loli toxic'] },
  { files: ['mimpi.mp3'], commands: ['mimpi','menyeramkan'] },
  { files: ['Ngelag.mp3'], commands: ['ngelag','lag','lemot'] },
  { files: ['Ownerku.mp3'], commands: ['ownerku'] },
  { files: ['Pap.mp3'], commands: ['pap'] },
  { files: ['sad4.mp3'], commands: ['anak desa'] },
  { files: ['Sayang.mp3'], commands: ['sayang','say','syg','syng','sayng'] },
  { files: ['sound1.mp3'], commands: ['sound1'] },
  { files: ['sound12.mp3'], commands: ['sound12'] },
  { files: ['sound14.mp3'], commands: ['sound14'] },
  { files: ['sound15.mp3'], commands: ['gugur','sound15','nenek'] },
  { files: ['sound17.mp3'], commands: ['sound17'] },
  { files: ['sound25.mp3'], commands: ['sound25'] },
  { files: ['sound33.mp3'], commands: ['sound33'] },
  { files: ['sound4.mp3'], commands: ['sound4'] },
  { files: ['sound55.mp3'], commands: ['sound55'] },
  { files: ['sound58.mp3'], commands: ['sound58'] },
  { files: ['sound9.mp3'], commands: ['sound9'] },
  { files: ['tarhim.m4a'], commands: ['tarhim'] },
  { files: ['tersangka.m4a'], commands: ['tersangka'] },
  { files: ['Uwu.mp3'], commands: ['kimochi','yamete'] },
  { files: ['Uwuii.mp3'], commands: ['uwu','uwuii'] },
  { files: ['Uwuuu.mp3'], commands: ['uwuuu','uwuu'] },
  { files: ['avelia.ogg'], commands: ['avelia','fungsi bot','ada bot','manfaat bot','fitur','janneta','jannet'] }
]

const VOICE_NOTES = Object.fromEntries(
  VOICE_NOTE_GROUPS.flatMap(({ files, commands }) =>
    commands.map(command => [command, files.length === 1 ? files[0] : files]),
  ),
)

const MIME_TYPES = {
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg; codecs=opus',
  '.opus': 'audio/ogg; codecs=opus',
  '.wav': 'audio/wav',
}

const findVoiceCommand = text => {
  const normalizedText = (text || '').trim().toLowerCase()
  return Object.keys(VOICE_NOTES)
    .sort((first, second) => second.length - first.length)
    .find(keyword => {
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const keywordPattern = new RegExp(`(?:^|[^\\p{L}\\p{N}])${escapedKeyword}(?:$|[^\\p{L}\\p{N}])`, 'u')
      return keywordPattern.test(normalizedText)
    })
}

const handler = async (m, { conn, command, usedPrefix }) => {
  const messageText = (m.text || '').trim()
  const commandText = messageText
    .replace(new RegExp(`^${usedPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'), '')
    .trim()
    .toLowerCase()
  const matchedCommand = findVoiceCommand(commandText)
  const activeCommand = matchedCommand || command.toLowerCase()

if (activeCommand === 'autovnkeyword') {
  let message = `╭─❏「 🎙️ AUTO VN KEYWORD 」❏\n`
  message += `│ 🎧 *Total VN* : ${VOICE_NOTE_GROUPS.length}\n`
  message += `│ 🔑 *Total Keyword* : ${Object.keys(VOICE_NOTES).length}\n`
  message += `╰─━━━━━━━━━━━━━━─\n\n`

  for (const [index, { files, commands }] of VOICE_NOTE_GROUPS.entries()) {
    message += `🎧 *VN ${index + 1}*\n`
    message += `> ↳ File : ${files.join(', ')}\n`
    message += `> ↳ Keyword : ${commands.map(keyword => `\`${keyword}\``).join(', ')}\n\n`
  }

  message += `─━━━━━━━━━━━━━━─`

  return m.reply(message)
}

  const configuredFiles = VOICE_NOTES[activeCommand]
  const filename = Array.isArray(configuredFiles)
    ? configuredFiles[Math.floor(Math.random() * configuredFiles.length)]
    : configuredFiles

  if (!filename) return

  const filePath = path.join(VOICE_NOTE_DIR, filename)

  if (!fs.existsSync(filePath)) {
    console.error(`Voice note tidak ditemukan: ${filePath}`)
    return m.reply(`⚠️ Voice note untuk *${usedPrefix + command}* belum tersedia.`)
  }

  const extension = path.extname(filename).toLowerCase()

  try {
    await conn.sendMessage(
      m.chat,
      {
        audio: fs.readFileSync(filePath),
        mimetype: MIME_TYPES[extension] || 'audio/mpeg',
        ptt: false,
        fileName: filename,
      },
      { quoted: m },
    )
  } catch (error) {
    console.error(`Gagal mengirim voice note ${filename}:`, error)
    await m.reply('❌ Voice note gagal dikirim.')
  }
}

handler.help = ['voice-note', 'autovnkeyword']
handler.tags = ['audio']
handler.command = ['autovnkeyword', ...Object.keys(VOICE_NOTES)]
handler.before = async function (m, { match, ...context }) {
  if (match?.[0]) return false

  const matchedCommand = findVoiceCommand(m.text)
  if (!matchedCommand) return false

  await handler.call(this, m, {
    ...context,
    conn: this,
    command: matchedCommand,
    usedPrefix: '',
  })
  return true
}

export default handler