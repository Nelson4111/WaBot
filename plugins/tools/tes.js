let handler = async (m) => {
  let text = `
*「 🤖 ${global.namebot || 'Avelia'} 」*

Halo! Aku *${global.namebot || 'Avelia'}*, bot asisten aktif milik *${global.author || 'Nenel'}*.  
Ketik *.menu* untuk melihat semua daftar fitur yang tersedia ✨
`.trim()
  await m.reply(text)
}

handler.customPrefix = /^(tes|avelia|nelbot|test|bot)$/i
handler.command = new RegExp

export default handler