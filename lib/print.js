import { WAMessageStubType } from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import moment from 'moment-timezone'

export default async function (m, conn = { user: {} }) {
  try {
    const prefix = /^[./!#]/
    const isCommand = m.text && prefix.test(m.text)
    const isGroup = m.isGroup
    const isReaction = m.mtype === 'reactionMessage'

    // Keluar jika tidak ada pesan,
    if (!m.text && !m.mtype && !isReaction) return 

    const name = await conn.getName(m.sender)
    const sender = PhoneNumber(
      '+' + m.sender.replace('@s.whatsapp.net', '')
    ).getNumber('international') + (name ? ' ~ ' + name : '')

    const chatName = await conn.getName(m.chat)
    const user = global.db?.data?.users?.[m.sender]
    const me = PhoneNumber(
      '+' + (conn.user.jid || conn.user.id).replace('@s.whatsapp.net', '').split(':')[0]
    ).getNumber('international')

    const time = moment(m.messageTimestamp ? 1000 * (m.messageTimestamp.low || m.messageTimestamp) : Date.now())
      .tz('Asia/Jakarta')
      .format('DD/MM/YYYY HH:mm:ss')

    const filesize = getFileSize(m)
    printLog({
      me,
      botName: conn.user.name || 'Bot',
      time,
      m,
      chatName,
      filesize,
      sender,
      user,
      isCommand,
      isGroup,
      isReaction
    })

    cleanText(m)

  } catch (e) {
    console.error('❌ Logger Error:', e)
  }
}

function getFileSize(m) {
  return Number(m.msg?.fileLength?.low ?? m.msg?.fileLength ?? m.msg?.vcard?.length ?? m.text?.length ?? 0)
}

function formatSize(bytes) {
  if (bytes === 0) return '0B'
  const k = 1000
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i]
}

function printLog({ me, botName, time, m, chatName, filesize, sender, user, isCommand, isGroup, isReaction }) {
  const garis = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  const label = (txt) => chalk.bold.white(txt)
  
  let chatTypeLabel = ''
  if (isGroup) {
    chatTypeLabel = chalk.bold.bgMagenta.white(' 🐾 [ GROUP CHAT ] 🐾 ')
  } else if (m.chat.endsWith('@newsletter')) {
    chatTypeLabel = chalk.bold.bgGreen.white(' 📢 [ NEWSLETTER ] 📢 ')
  } else {
    chatTypeLabel = chalk.bold.bgBlue.white(' 💌 [ PRIVATE CHAT ] 💌 ')
  }

  let content = m.text || `[${m.mtype}]`
  if (isReaction) {
    content = `Memberi Reaksi: ${m.msg?.text || 'Merespon'} `
  }

  console.log(`\n${chalk.white(garis)}`)
  console.log(chatTypeLabel)
  
  console.log(`${label('🕒 Waktu   : ')}${chalk.yellow(time + ' WIB')}`)
  
  if (isCommand) {
    console.log(`${label('☁️ Pesan   : ')}${chalk.bgHex('#FFB6C1').black(` ${content} `)}`)
  } else {
    console.log(`${label('☁️ Pesan   : ')}${chalk.greenBright(content)}`)
  }

  console.log(`${label('🎀 Type    : ')}${chalk.magentaBright(m.mtype)}`)
  console.log(`${label('🍭 Nama    : ')}${chalk.blueBright(sender)}`)
  console.log(`${label('⛅ Size    : ')}${chalk.whiteBright(formatSize(filesize))}`)
  
  if (user) {
    console.log(`${label('🏮 Status  : ')}${chalk.yellow(`EXP: ${user.exp || 0}`)} ${chalk.redBright(`Limit: ${user.limit || 0}`)}`)
  }

  if (isGroup) {
    console.log(`${label('🏡 Grup    : ')}${chalk.greenBright(chatName || 'Unknown Group')}`)
    console.log(`${label('🆔 ID      : ')}${chalk.cyan(m.chat)}`)
  }

  console.log(`${chalk.white(garis)}\n`)
}

function cleanText(m) {
  if (typeof m.text === 'string') {
    m.text = m.text.replace(/\u200e+/g, '')
  }
}
