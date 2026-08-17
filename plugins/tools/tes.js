let handler = async (m) => {
  let text = `
*「 🤖 ${global.namebot || 'NelBot-MD'} 」*

Halo! Aku *${global.namebot || 'NelBot-MD'}*, bot asisten aktif milik *${global.author || 'Nenel'}*.  
Ketik *.menu* untuk melihat semua daftar fitur yang tersedia ✨
`.trim()
  await m.reply(text)
}

handler.customPrefix = /^(tes|nelbot|test|bot)$/i
handler.command = new RegExp

export default handler