/**
 * Cek Isi Hati Plugin
 * Mengintip perasaan / isi hati seseorang terhadap pengguna
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

const isiHatiResponses = [
  "90% Menyimpan rasa suka padamu, namun masih gengsi untuk berbicara langsung.",
  "85% Selalu merasa berdebar dan senang saat kamu membalas pesannya dengan cepat.",
  "70% Berharap diajak menghabiskan waktu bersama, menanti kepekaan darimu.",
  "95% Sering memperhatikan foto profil dan kabarmu secara diam-diam.",
  "50% Masih menimbang rasa antara ketertarikan sejati atau sekadar rasa sepi.",
  "10% Menganggapmu sebagai teman baik yang dapat diandalkan (Zona Pertemanan).",
  "100% Benar-benar menaruh hati padamu sejak pandangan pertama.",
  "60% Menyukaimu, namun ragu apakah hatimu telah dimiliki orang lain.",
  "30% Menganggapmu sebagai sosok yang menyenangkan dan selalu menghibur hari-harinya."
]

let handler = async (m, { conn, usedPrefix, command }) => {
  let target = m.mentionedJid?.[0]
  if (!target) {
    return m.reply(`*╭  〔 ᰔ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Tandai orang yang ingin kamu periksa isi hatinya!\n> Contoh: *${usedPrefix + command} @tag*\n*╰───────────────*`)
  }

  const targetNum = target.split('@')[0].replace(/\D/g, '')
  const res = isiHatiResponses[Math.floor(Math.random() * isiHatiResponses.length)]

  const txt = `*──  ୨୧ ✧ RAHASIA PERASAAN HATI ✧ ୨୧  ──*

*╭  〔 ᰔ ᴄ ᴇ ᴋ  ɪ ꜱ ɪ  ʜ ᴀ ᴛ ɪ 〕*
*┆* ⟡ ᴛᴀʀɢᴇᴛ   : @${targetNum}
*┆* ✧ ᴘᴇʀᴀꜱᴀᴀɴ : ${res}
*╰───────────────*

> ｡˚ ⊹ _Perasaan hati adalah misteri, ungkapkan kejujuranmu_ ⊹ ˚ ｡`.trim()

  return conn.sendMessage(m.chat, { text: txt, mentions: [target] }, { quoted: m })
}

handler.help = ['cekisihati @user']
handler.tags = ['pasangan']
handler.command = /^(cekisihati)$/i

export default handler
