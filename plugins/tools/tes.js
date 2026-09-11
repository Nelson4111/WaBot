let handler = async (m, { usedPrefix } = {}) => {
  const prefix = usedPrefix || '.'

  let text = `
╭─❏「 *A V E L I A* 」❏\n`
text += `│ 🤖 *Avelia WA Companion*\n`
text += `╰─━━━━━━━━━━━━━━─\n\n`

text += `👋 *Halo Semuanya!!*\n`
text += `> ↳ Aku ${global.namebot || 'Avelia'}, bot asisten aktif milik *'Owner Nenel dan Co-Owner Eza*.\n\n`
text += `> ↳ Ketik *.menu* untuk melihat semua daftar fitur yang tersedia ✨\n\n`
text += `> ↳ Chat *.owner* jika ingin Avelia ada di grup kamu juga ✨\n\n`

text += `─━━━━━━━━━━━━━━─`

await m.reply(text)
}

handler.customPrefix = /^(tes|avelia|nelbot|test|bot)$/i
handler.command = new RegExp

export default handler