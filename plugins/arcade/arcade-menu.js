import { getGreeting } from '../../lib/style.js'

let handler = async (m, { conn, usedPrefix }) => {
  const userGreeting = getGreeting(m.name || m.pushName || 'Player')

  const caption = `*──  ୨୧ ✧ ɪɴ-ʙᴜʙʙʟᴇ ᴀʀᴄᴀᴅᴇ ✧ ୨୧  ──*

> *おしらせ!* (ᴀʀᴄᴀᴅᴇ ᴢᴏɴᴇ!)
> ${userGreeting}
> _Mainkan game mini interaktif langsung di dalam gelembung obrolan WhatsApp tanpa instal aplikasi tambahan._

*╭  〔 ❖ ᴅᴀꜰᴛᴀʀ ɢᴀᴍᴇ ᴀʀᴄᴀᴅᴇ 〕*
*┆* ⟡ *Geometry Dash Mini* : \`${usedPrefix}gd\`
*┆*   _Arkade ritme cepat & lompat rintangan_
*┆* ✧ *Block Blast Mini* : \`${usedPrefix}blockblast\`
*┆*   _Teka-teki susun blok 8x8 santai & taktis_
*┆* ✦ *Tetris Retro Mini* : \`${usedPrefix}tetris\`
*┆*   _Klasik susun balok dengan tombol sentuh_
*┆* ◈ *Star Arena Mabar* : \`${usedPrefix}mabar\`
*┆*   _Pertarungan real-time multipemain berebut bintang_
*┆* ❖ *Catur Interaktif* : \`${usedPrefix}chess html\`
*┆*   _Papan catur digital in-bubble & web_
*╰──────────────────────*

> ｡˚ ⊹ *ᴛᴀᴘ ᴛᴏᴍʙᴏʟ ᴅɪ ʙᴀᴡᴀʜ ᴜɴᴛᴜᴋ ᴍᴜʟᴀɪ ʙᴇʀᴍᴀɪɴ* ⊹ ˚ ｡`.trim()

  const buttons = [
    ['◈ Star Arena (Mabar)', `${usedPrefix}mabar`],
    ['⟡ Geometry Dash', `${usedPrefix}gd`],
    ['✧ Block Blast', `${usedPrefix}blockblast`],
    ['✦ Tetris Retro', `${usedPrefix}tetris`],
    ['❖ Catur Interaktif', `${usedPrefix}chess html`]
  ]

  try {
    return await conn.sendButton(m.chat, caption, 'Avelia Interactive Arcade • In-Bubble Mini Apps', null, buttons, m)
  } catch (e) {
    return await m.reply(`${caption}\n\n*Perintah Cepat:*\n• *${usedPrefix}mabar*\n• *${usedPrefix}gd*\n• *${usedPrefix}blockblast*\n• *${usedPrefix}tetris*\n• *${usedPrefix}chess html*`)
  }
}

handler.help = ['arcade', 'minigame', 'minigames']
handler.tags = ['arcade']
handler.command = /^(minigames|minigame|arcade|gamehtml)$/i

export default handler
