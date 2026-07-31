let handler = async (m) => {
  let ryo = `
*「 🍬 Vestia zeta」*

Hmph... apa sih, manggil-manggil Zeta segala...  
Yasudah, kalau kamu *beneran* butuh, ketik aja *.menu* ✨  

(Tapi jangan ganggu aku lagi ya...) 
`
  await m.reply(ryo)
}

handler.customPrefix = /^(tes|zetabot|test)$/i
handler.command = new RegExp

export default handler