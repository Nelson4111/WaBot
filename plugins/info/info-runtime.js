import fs from 'fs'
import { sendThumbnailButtonCard } from '../../lib/thumbnailButtonCard.js'

const animeQuotes = [
  // Dragon Ball, FMA, Luffy, Levi
  '“Power comes in response to a need, not a desire.” – Goku ⚡',
  '“A lesson without pain is meaningless.” – Edward Elric 🔥',
  '“Fear is freedom! Control is liberty!” – Satsuki Kiryuuin 🌸',
  '“If you don’t take risks, you can’t create a future.” – Monkey D. Luffy ☠️',
  '“The only thing we’re allowed to do is to believe that we won’t regret the choice we made.” – Levi Ackerman 🗡️',
  
  // Bocchi the Rock 
  '“Aku ingin berteman... tapi aku tidak bisa berbicara dengan orang.” – Hitori Gotou (Bocchi) 🎸',
  '“Kalau tidak ada yang percaya padamu, aku akan tetap mendengarkan gitarmu.” – Nijika Ijichi 🌟',
  '“Seseorang harus mulai berjalan meskipun jalannya berat.” – Ryo Yamada 🎶',
  '“Mungkin aku nggak sempurna, tapi aku ingin main musik bersama kalian.” – Kita Ikuyo 💕',
  '“Saat aku di panggung, aku merasa hidup.” – Hitori Gotou ✨'
]

let handler = async (m, { conn, usedPrefix }) => {

  let _muptime = process.uptime() * 1000
  let muptime = clockString(_muptime)
  let quote = animeQuotes[Math.floor(Math.random() * animeQuotes.length)]

  const text = [
    '🌸 *R U N T I M E  S T A T U S* 🌸',
    '',
    '⏳ *Active Time:*',
    muptime,
    '',
    '💬 *Anime Quote:*',
    `_${quote}_`,
    '',
    `🍭 Powered by *${global.namebot || 'Avelia'}*`
  ].join('\n')
  await sendThumbnailButtonCard(conn, {
    chat: m.chat,
    title: '🌸 RUNTIME STATUS',
    subtitle: 'Bot is running smoothly!',
    text,
    footer: `${global.namebot || 'Avelia'} • Runtime`,
    thumbnail: fs.readFileSync('./media/thumbnail.jpg'),
    buttons: [
      ['🏠 Menu Utama', `${usedPrefix}menu`],
      ['⚡ Cek Ping', `${usedPrefix}ping`]
    ],
    quoted: m
  })
}

handler.help = ['runtime']
handler.tags = ['info']
handler.command = ['runtime', 'rt']

handler.desc = 'Menampilkan informasi dan statistik sistem mengenai runtime.'
handler.tutorial = [
  '.runtime'
]

export default handler

function clockString(ms) {
  if (isNaN(ms)) return '--'
  let d = Math.floor(ms / 86400000)
  let h = Math.floor(ms / 3600000) % 24
  let mnt = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return `⏱️ ${d} Days\n🕐 ${h} Hours\n🕑 ${mnt} Minutes\n🕒 ${s} Seconds`
}