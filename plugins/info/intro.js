let handler = async (m, { conn }) => {
  let groupName = 'grup ini'

  if (m.isGroup && conn && typeof conn.groupMetadata === 'function') {
    try {
      const metadata = await conn.groupMetadata(m.chat)
      groupName = metadata?.subject || groupName
    } catch {
      // fallback ke nama grup default
    }
  }


let anu = `
╭─❏「 ✨ INTRO CARD 」❏
│👋 *HALO SEMUANYA!*
│
│Aku member baru di
│↳ *${groupName}*
├─━━━━━━━━━━━━━━─
│👤 *PROFIL*
│• Nama   : 
│• Gender : (Cowo/Cewe)
│• Status : (Single/Taken)
│• Umur   : -
│• Asal   : -
│• Hobi   : -
├─━━━━━━━━━━━━━━─
│💬 Salam kenal semuanya!
│
│ Gunakan - jika privasi 😊
╰─━━━━━━━━━━━━━━─
`


  await m.reply(anu.trim())
}

handler.customPrefix = /^(intro)$/i
handler.command = /^(intro)$/i

export default handler