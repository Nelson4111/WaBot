let handler = async (m) => {

let anu =`ㅤ [ *CARD INTRO* ]
│● *Name               :* 
│● *Gender             :* 
│● *Umυr                :* 
│● *Asαl                  :*
│● *Anime fav        :* 
│● *Husbu/waifu   :* 
♡══════༻❁༺══════♡`
await m.reply(anu)
}
handler.customPrefix = /^(intro)$/i
handler.command = new RegExp
export default handler